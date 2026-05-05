import { Request, Response } from 'express';
import prisma from '../lib/prisma';

/**
 * Initiate VNPay payment
 * POST /api/payments/checkout
 */
export async function initiatePayment(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, amount, orderInfo, ipAddr } = req.body;
    
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
        where: { MaTaiKhoan: req.user.MaTaiKhoan }
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
    
    const { verifyVNPayReturn } = await import('../services/vnpayService');
    const result = await verifyVNPayReturn(vnpParams);
    
    if (result.success) {
      // Redirect to order confirmation page with success
      const returnUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/order-confirmation?status=success&orderId=${result.data?.orderId}`;
      res.redirect(returnUrl);
    } else {
      // Redirect to order confirmation page with error
      const returnUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/order-confirmation?status=failed&message=${encodeURIComponent(result.message)}`;
      res.redirect(returnUrl);
    }
  } catch (error) {
    console.error('VNPay callback error:', error);
    const returnUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/order-confirmation?status=error&message=Lo%CC%9Bi%20h%E1%BB%87%20th%E1%BB%91ng`;
    res.redirect(returnUrl);
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
      where: { MaTaiKhoan: req.user.MaTaiKhoan }
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
        where: { MaKH: customer.MaKH },
        include: {
          donhang: true
        },
        orderBy: { payment_id: 'desc' },
        skip,
        take: limit
      }),
      prisma.payments.count({
        where: { MaKH: customer.MaKH }
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
