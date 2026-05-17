import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { cancelVNPayPayment, expirePendingVNPayPayments, verifyVNPayReturn } from '../services/vnpayService';

function getFrontendBaseUrl(req: Request): string {
  const configuredUrl = String(process.env.NEXT_PUBLIC_FRONTEND_URL || '').trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  const forwardedProtoHeader = req.headers['x-forwarded-proto'];
  const forwardedHostHeader = req.headers['x-forwarded-host'];

  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : String(forwardedProtoHeader || '').split(',')[0].trim();
  const forwardedHost = Array.isArray(forwardedHostHeader)
    ? forwardedHostHeader[0]
    : String(forwardedHostHeader || '').split(',')[0].trim();

  const protocol = forwardedProto || (req.secure ? 'https' : 'http');
  const host = forwardedHost || req.get('host');

  if (host) {
    return `${protocol}://${host}`;
  }

  return 'http://localhost:3000';
}

function buildOrderConfirmationUrl(
  req: Request,
  status: 'success' | 'failed' | 'error',
  options?: { orderId?: string; message?: string }
): string {
  const url = new URL('/order-confirmation', getFrontendBaseUrl(req));
  url.searchParams.set('status', status);

  if (options?.orderId) {
    url.searchParams.set('orderId', options.orderId);
  }

  if (options?.message) {
    url.searchParams.set('message', options.message);
  }

  return url.toString();
}

/**
 * Initiate VNPay payment
 * POST /api/payments/checkout
 */
export async function initiatePayment(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, amount, orderInfo, ipAddr } = req.body;
    console.debug('InitiatePayment request body:', { orderId, amount, orderInfo, ipAddr });
    
    // Validation
    if (!orderId || !amount) {
      res.status(400).json({
        success: false,
        message: 'Thiếu mã đơn hàng hoặc số tiền'
      });
      return;
    }
    
    // Get user info if logged in
    let customerId: string | undefined;
    if (req.user) {
      const customer = await prisma.khachhang.findFirst({
        where: { Email: req.user.TenDangNhap }
      });
      if (customer) {
        customerId = customer.MaKH;
      }
    }
    
    const { generateVNPayUrl } = await import('../services/vnpayService');
    const result = await generateVNPayUrl({
      orderId,
      amount,
      orderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
      ipAddr: ipAddr || req.ip || '127.0.0.1'
    });
    console.debug('InitiatePayment generateVNPayUrl result:', result);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}

/**
 * VNPay callback handler
 * GET /api/payments/callback
 */
export async function vnPayCallback(req: Request, res: Response): Promise<void> {
  try {
    const vnpParams = req.query as any;
    const result = await verifyVNPayReturn(vnpParams);
    
    if (result.success) {
      res.redirect(
        buildOrderConfirmationUrl(req, 'success', {
          orderId: result.data?.orderId,
        })
      );
    } else {
      res.redirect(
        buildOrderConfirmationUrl(req, 'failed', {
          message: result.message,
        })
      );
    }
  } catch (error) {
    console.error('VNPay callback error:', error);
    res.redirect(
      buildOrderConfirmationUrl(req, 'error', {
        message: 'Lỗi hệ thống',
      })
    );
  }
}

/**
 * VNPay IPN handler
 * GET /api/payments/ipn
 */
export async function vnPayIpn(req: Request, res: Response): Promise<void> {
  try {
    const vnpParams = req.query as any;
    const result = await verifyVNPayReturn(vnpParams);

    if (result.success) {
      res.status(200).json({
        RspCode: '00',
        Message: 'Confirm Success'
      });
      return;
    }

    const message = String(result.message || '').toLowerCase();
    let rspCode = '99';

    if (message.includes('chữ ký') || message.includes('signature')) {
      rspCode = '97';
    } else if (message.includes('không tìm thấy')) {
      rspCode = '01';
    } else if (message.includes('số tiền') || message.includes('amount')) {
      rspCode = '04';
    } else if (message.includes('đã hoàn tất') || message.includes('already')) {
      rspCode = '02';
    }

    res.status(200).json({
      RspCode: rspCode,
      Message: result.message || 'Unknow error'
    });
  } catch (error) {
    console.error('VNPay IPN error:', error);
    res.status(200).json({
      RspCode: '99',
      Message: 'Unknow error'
    });
  }
}

/**
 * Get payment details
 * GET /api/payments/:id
 */
export async function getPaymentDetails(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    const payment = await prisma.payments.findUnique({
      where: { payment_id: id },
      include: {
        donhang: true,
        payment_logs: true
      }
    });
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin thanh toán'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}

/**
 * Get payment history for customer (requires authentication)
 * GET /api/payments?page=1&limit=10
 */
export async function getPaymentHistory(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Chưa xác thực'
      });
      return;
    }
    
    const customer = await prisma.khachhang.findFirst({
      where: { Email: req.user.TenDangNhap }
    });
    
    if (!customer) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng'
      });
      return;
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page -1) * limit;
    
    const [payments, total] = await Promise.all([
      prisma.payments.findMany({
        where: {
          donhang: { MaKH: customer.MaKH },
          status: { not: 0 }
        },
        include: {
          donhang: true
        },
        orderBy: { payment_id: 'desc' },
        skip,
        take: limit
      }),
      prisma.payments.count({
        where: {
          donhang: { MaKH: customer.MaKH },
          status: { not: 0 }
        }
      })
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}

/**
 * Cancel pending payment
 * POST /api/payments/:id/cancel
 */
export async function cancelPayment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await cancelVNPayPayment(id);

    if (result.success) {
      res.status(200).json(result);
      return;
    }

    res.status(400).json(result);
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}

/**
 * Expire pending payments (cron/job endpoint)
 * POST /api/payments/expire
 */
export async function expirePayments(req: Request, res: Response): Promise<void> {
  try {
    const result = await expirePendingVNPayPayments();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Expire payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống'
    });
  }
}
