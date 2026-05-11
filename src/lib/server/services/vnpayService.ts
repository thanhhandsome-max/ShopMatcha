import crypto from 'crypto';
import prisma from '../db/prisma';

export interface VNPayPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddr?: string;
}

export interface VNPayReturnParams {
  vnp_TxnRef: string;
  vnp_Amount: string;
  vnp_ResponseCode: string;
  vnp_SecureHash?: string;
  vnp_SecureHashType?: string;
  [key: string]: string | undefined;
}

/**
 * VNPay Configuration
 */
const VNP_CONFIG = {
  TMN_CODE: process.env.VNP_TMN_CODE || 'TEST_TMN_CODE',
  HASH_SECRET: process.env.VNP_HASH_SECRET || 'TEST_HASH_SECRET',
  BASE_URL: process.env.VNP_API_URL || 'https://sandbox.vnpayment.vn',
  COMMAND: 'pay',
  VERSION: '2.1.0',
  LOCALE: 'vn',
  RETURN_URL: process.env.VNP_RETURN_URL || 'http://localhost:3000/order-confirmation',
};

/**
 * Generate VNPay payment URL
 */
export async function generateVNPayUrl(
  data: VNPayPaymentRequest
): Promise<{ success: boolean; message: string; data?: { paymentUrl: string; paymentId: string } }> {
  try {
    // Get order info
    const order = await prisma.donhang.findUnique({
      where: { MaDH: data.orderId }
    });
    
    if (!order) {
      return { success: false, message: 'Không tìm thấy đơn hàng' };
    }
    
    // Generate unique payment ID
    const paymentId = `PAY${Date.now().toString(36).toUpperCase()}`;
    
    // Create payment record
    await prisma.payments.create({
      data: {
        payment_id: paymentId,
        MaHD: data.orderId,
        MaKH: order.MaKH,
        amount: data.amount,
        payment_method: 'VNPay',
        status: 0 // Pending
      }
    });
    
    // Prepare VNPay params
    const date = new Date();
    const createDate = formatDate(date);
    const orderId = `${order.order_code || order.MaDH}_${Date.now()}`;
    
    const vnpParams: any = {
      vnp_Version: VNP_CONFIG.VERSION,
      vnp_Command: VNP_CONFIG.COMMAND,
      vnp_TmnCode: VNP_CONFIG.TMN_CODE,
      vnp_Locale: VNP_CONFIG.LOCALE,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: data.orderInfo || `Thanh toan don hang ${order.order_code || order.MaDH}`,
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(data.amount * 100), // VNPay expects amount in VND * 100
      vnp_ReturnUrl: VNP_CONFIG.RETURN_URL,
      vnp_IpAddr: data.ipAddr || '127.0.0.1',
      vnp_CreateDate: createDate,
    };
    
    // Sort params alphabetically
    const sortedParams = sortObject(vnpParams);
    
    // Create sign data string
    const signData = new URLSearchParams(sortedParams).toString();
    
    // Generate secure hash
    const hmac = crypto.createHmac('sha512', VNP_CONFIG.HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    // Add secure hash to params
    sortedParams['vnp_SecureHash'] = signed;
    
    // Create final URL
    const paymentUrl = `${VNP_CONFIG.BASE_URL}/paymentv2/vpcpay.html?${new URLSearchParams(sortedParams).toString()}`;
    
    // Update payment record with transaction ID
    await prisma.payments.update({
      where: { payment_id: paymentId },
      data: { transaction_id: orderId }
    });
    
    return {
      success: true,
      message: 'Tạo URL thanh toán thành công',
      data: {
        paymentUrl,
        paymentId
      }
    };
    
  } catch (error) {
    console.error('VNPay generate URL error:', error);
    return { success: false, message: 'Lỗi hệ thống khi tạo URL thanh toán' };
  }
}

/**
 * Verify VNPay return callback
 */
export async function verifyVNPayReturn(
  vnpParams: VNPayReturnParams
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];
    
    // Sort params
    const sortedParams = sortObject(vnpParams);
    
    // Create sign data string
    const signData = new URLSearchParams(sortedParams).toString();
    
    // Verify signature
    const hmac = crypto.createHmac('sha512', VNP_CONFIG.HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    if (secureHash !== signed) {
      return { success: false, message: 'Chữ ký không hợp lệ' };
    }
    
    // Check response code
    const responseCode = vnpParams['vnp_ResponseCode'];
    const txnRef = vnpParams['vnp_TxnRef'];
    const amount = parseInt(vnpParams['vnp_Amount']) / 100;
    
    // Find payment by transaction ID
    const payment = await prisma.payments.findFirst({
      where: { transaction_id: txnRef },
      include: { donhang: true }
    });
    
    if (!payment) {
      return { success: false, message: 'Không tìm thấy thông tin thanh toán' };
    }
    
    // Log the callback
    await prisma.payment_logs.create({
      data: {
        payment_id: payment.payment_id,
        log_type: 'VNPay_Return',
        vnp_TxnRef: txnRef,
        response_code: responseCode,
        message: responseCode === '00' ? 'Thanh toán thành công' : 'Thanh toán thất bại',
        new_data: JSON.stringify(vnpParams)
      }
    });
    
    if (responseCode === '00') {
      // Payment successful
      await prisma.$transaction(async (tx) => {
        // Update payment status
        await tx.payments.update({
          where: { payment_id: payment.payment_id },
          data: {
            status: 1,
            paid_at: new Date()
          }
        });
        
        // Update order payment status
        await tx.donhang.update({
          where: { MaDH: payment.MaHD },
          data: {
            payment_status: 1,
            TrangThai: 2 // Confirmed/Paid
          }
        });
      });
      
      return {
        success: true,
        message: 'Thanh toán thành công',
        data: {
          orderId: payment.MaHD,
          amount: payment.amount,
          transactionId: txnRef
        }
      };
    } else {
      // Payment failed
      await prisma.payments.update({
        where: { payment_id: payment.payment_id },
        data: { status: 2 } // Failed
      });
      
      return {
        success: false,
        message: `Thanh toán thất bại. Mã lỗi: ${responseCode}`
      };
    }
    
  } catch (error) {
    console.error('VNPay verify return error:', error);
    return { success: false, message: 'Lỗi hệ thống khi xử lý callback' };
  }
}

/**
 * Sort object by key alphabetically
 */
function sortObject(obj: any): any {
  const sorted: any = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      sorted[key] = obj[key];
    }
  }
  
  return sorted;
}

/**
 * Format date for VNPay
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
