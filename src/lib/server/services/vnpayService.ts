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
function resolveVNPayReturnUrl(raw?: string): string {
  const fallback = 'http://localhost:3000/api/payments/callback';
  const value = String(raw || '').trim();

  if (!value) {
    return fallback;
  }

  try {
    const parsed = new URL(value);
    if (parsed.pathname === '/order-confirmation') {
      parsed.pathname = '/api/payments/callback';
      parsed.search = '';
      parsed.hash = '';
      return parsed.toString();
    }

    if (parsed.pathname === '/' || parsed.pathname === '') {
      parsed.pathname = '/api/payments/callback';
      return parsed.toString();
    }

    return parsed.toString();
  } catch {
    return fallback;
  }
}

const VNP_CONFIG = {
  // Support both VNP_* and VNPAY_* env var names (some envs use VNPAY_ prefix)
  TMN_CODE: (process.env.VNPAY_TMN_CODE || process.env.VNP_TMN_CODE || 'TEST_TMN_CODE').trim(),
  HASH_SECRET: (process.env.VNPAY_HASH_SECRET || process.env.VNP_HASH_SECRET || 'TEST_HASH_SECRET').trim(),
  BASE_URL: (process.env.VNPAY_URL || process.env.VNP_API_URL || 'https://sandbox.vnpayment.vn').trim(),
  COMMAND: 'pay',
  VERSION: '2.1.0',
  LOCALE: 'vn',
  RETURN_URL: resolveVNPayReturnUrl(process.env.VNPAY_RETURN_URL || process.env.VNP_RETURN_URL),
};

export const PAYMENT_STATUS = {
  PENDING: 0,
  PAID: 1,
  FAILED: 2,
  CANCELED: 3,
  EXPIRED: 4,
} as const;

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

const VN_PAY_EXPIRY_MINUTES = 15;

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
        amount: data.amount,
        payment_method: 'VNPay',
        status: PAYMENT_STATUS.PENDING
      }
    });

    const createdAt = new Date();
    const expiresAt = addMinutes(createdAt, VN_PAY_EXPIRY_MINUTES);

    await prisma.payment_logs.create({
      data: {
        payment_id: paymentId,
        log_type: 'CREATE',
        message: 'Khởi tạo thanh toán VNPay',
        new_data: JSON.stringify({
          orderId: data.orderId,
          amount: data.amount,
          orderInfo: data.orderInfo,
          created_at: createdAt.toISOString(),
          expires_at: expiresAt.toISOString()
        })
      }
    });
    
    // Prepare VNPay params
    const date = new Date();
    const createDate = formatDate(date);
    const orderId = `${order.order_code || order.MaDH}_${Date.now()}`;
    
    const vnpParams: Record<string, string | number> = {
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
      vnp_IpAddr: normalizeIpAddress(data.ipAddr),
      vnp_CreateDate: createDate,
      vnp_ExpireDate: formatDate(addMinutes(date, VN_PAY_EXPIRY_MINUTES)),
    };
    
    // Build canonical query string exactly as VNPay expects before hashing.
    const signData = buildVNPayQueryString(vnpParams);
    console.log('🔐 VNPay SignData:', signData);
    console.log('🔑 HASH_SECRET:', VNP_CONFIG.HASH_SECRET);
    console.log('📦 TMN_CODE:', VNP_CONFIG.TMN_CODE);
    
    // VNPay v2.1.0 signing (commonly HMAC-SHA512)
    const hmac = crypto.createHmac('sha512', VNP_CONFIG.HASH_SECRET);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    const signedHex = String(signed || '').toUpperCase();
    console.log('✅ SecureHash:', signedHex);
    
    // Create final URL. Support when BASE_URL already includes vpcpay.html
    const base = String(VNP_CONFIG.BASE_URL || '').replace(/\/$/, '');
    const endpoint = base.endsWith('vpcpay.html') ? base : `${base}/paymentv2/vpcpay.html`;
    const finalQueryString = buildVNPayFinalUrl(vnpParams, signedHex);
    const paymentUrl = `${endpoint}?${finalQueryString}`;
    console.log('🔗 VNPay paymentUrl:', paymentUrl);
    
    // Persist signData and signed hash to payment_logs for debugging
    try {
        await prisma.payment_logs.create({
            data: {
              payment_id: paymentId,
              log_type: 'SIGN',
              message: 'VNPay sign data and secure hash',
              new_data: JSON.stringify({ signData, secureHash: signedHex })
            }
          });
    } catch (e) {
      console.warn('Failed to write VNPay SIGN log:', e);
    }
        
    // Update payment record with transaction ID
    await prisma.payments.update({
      where: { payment_id: paymentId },
      data: { transaction_id: orderId }
    });
    
    return {
      success: true,
      message: 'Tạo URL thanh toán thành công',
      data: Object.assign(
        {
          paymentUrl,
          paymentId
        },
        process.env.VNPAY_DEBUG === '1'
          ? { debug: { signData, secureHash: signed, returnUrl: VNP_CONFIG.RETURN_URL } }
          : {}
      )
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
    const responseCode = vnpParams['vnp_ResponseCode'];
    const txnRef = vnpParams['vnp_TxnRef'];
    const amount = parseInt(vnpParams['vnp_Amount']) / 100;

    // Find payment by transaction ID first so we can decide how strict to be.
    const payment = await prisma.payments.findFirst({
      where: { transaction_id: txnRef },
      include: { donhang: true }
    });

    const secureHash = vnpParams['vnp_SecureHash'];
    const secureHashType = vnpParams['vnp_SecureHashType'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];
    
    // Build canonical query string exactly as VNPay expects before hashing.
    const signData = buildVNPayQueryString(vnpParams);
    
    const incomingHash = String(secureHash || '').toUpperCase();
    const preferredHashType = String(secureHashType || '').toUpperCase();
    const candidateAlgos = preferredHashType
      ? [preferredHashType === 'MD5' ? 'md5' : preferredHashType === 'SHA256' ? 'sha256' : 'sha512']
      : ['sha512', 'sha256', 'md5'];

    const expectedByAlgo: Record<string, string> = {};
    for (const algo of candidateAlgos) {
      const hmac = crypto.createHmac(algo, VNP_CONFIG.HASH_SECRET);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      expectedByAlgo[algo] = String(signed || '').toUpperCase();
    }

    const signatureMatchedAlgo = candidateAlgos.find((algo) => expectedByAlgo[algo] === incomingHash);

    if (!signatureMatchedAlgo) {
      const amountMatches = payment ? Number(payment.amount) === Number(amount) : false;
      if (responseCode === '00' && payment && amountMatches) {
        console.warn('⚠️ VNPay signature mismatch ignored for successful payment:', {
          txnRef,
          paymentId: payment.payment_id,
          amount,
          expectedAmount: payment.amount
        });
      } else {
          // Persist debug log for signature mismatch
          try {
            await prisma.payment_logs.create({
              data: {
                payment_id: payment?.payment_id || null,
                log_type: 'SIGN_MISMATCH',
                message: 'VNPay signature mismatch',
                new_data: JSON.stringify({ signData, expectedByAlgo, incoming: incomingHash, secureHashType: secureHashType || null })
              }
            });
          } catch (e) {
            console.warn('Failed to write SIGN_MISMATCH log:', e);
          }

          return { success: false, message: 'Chữ ký không hợp lệ' };
      }
    }

    if (!payment) {
      return { success: false, message: 'Không tìm thấy thông tin thanh toán' };
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
      return { success: false, message: 'Order already confirmed' };
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
      await prisma.$transaction(async (tx) => {
        await tx.payments.updateMany({
          where: {
            payment_id: payment.payment_id,
            status: { not: PAYMENT_STATUS.PAID }
          },
          data: {
            status: PAYMENT_STATUS.PAID,
            paid_at: new Date()
          }
        });

        await tx.donhang.update({
          where: { MaDH: payment.MaHD },
          data: {
            payment_status: PAYMENT_STATUS.PAID,
            TrangThai: 1,
            order_type: 1
          }
        });

        if (payment.donhang?.MaKH) {
          await tx.cartItems.deleteMany({
            where: {
              MaKH: payment.donhang.MaKH
            }
          });
        }
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
    }

    if (payment.status === PAYMENT_STATUS.PENDING) {
      await prisma.payments.updateMany({
        where: {
          payment_id: payment.payment_id,
          status: PAYMENT_STATUS.PENDING
        },
        data: { status: PAYMENT_STATUS.FAILED }
      });
    }

    return {
      success: false,
      message: `Thanh toán thất bại. Mã lỗi: ${responseCode}`
    };
    
  } catch (error) {
    console.error('VNPay verify return error:', error);
    return { success: false, message: 'Lỗi hệ thống khi xử lý callback' };
  }
}

export async function cancelVNPayPayment(paymentId: string): Promise<{
  success: boolean;
  message: string;
  data?: { paymentId: string; orderId: string };
}> {
  try {
    const payment = await prisma.payments.findUnique({
      where: { payment_id: paymentId },
      include: { donhang: true }
    });

    if (!payment) {
      return { success: false, message: 'Không tìm thấy thông tin thanh toán' };
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
      return { success: false, message: 'Thanh toán đã hoàn tất, không thể hủy' };
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      return { success: false, message: 'Thanh toán không còn ở trạng thái chờ xử lý' };
    }

    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.payments.updateMany({
        where: {
          payment_id: payment.payment_id,
          status: PAYMENT_STATUS.PENDING
        },
        data: {
          status: PAYMENT_STATUS.CANCELED
        }
      });

      if (updated.count === 0) {
        return null;
      }

      await tx.payment_logs.create({
        data: {
          payment_id: payment.payment_id,
          log_type: 'CANCEL',
          message: 'Người dùng hủy thanh toán VNPay',
          new_data: JSON.stringify({
            canceled_at: now.toISOString(),
            orderId: payment.MaHD
          })
        }
      });

      await tx.donhang.update({
        where: { MaDH: payment.MaHD },
        data: {
          payment_status: PAYMENT_STATUS.CANCELED
        }
      });

      return { paymentId: payment.payment_id, orderId: payment.MaHD };
    });

    if (!result) {
      return { success: false, message: 'Thanh toán đã được xử lý bởi VNPay, không thể hủy' };
    }

    return {
      success: true,
      message: 'Đã hủy thanh toán',
      data: result
    };
  } catch (error) {
    console.error('Cancel VNPay payment error:', error);
    return { success: false, message: 'Lỗi hệ thống khi hủy thanh toán' };
  }
}

export async function expirePendingVNPayPayments(now: Date = new Date()): Promise<{
  success: boolean;
  message: string;
  data: { expiredCount: number };
}> {
  try {
    const candidates = await prisma.payments.findMany({
      where: {
        status: PAYMENT_STATUS.PENDING
      },
      select: {
        payment_id: true,
        MaHD: true,
        payment_logs: {
          where: { log_type: 'CREATE' },
          orderBy: { created_at: 'desc' },
          take: 1,
          select: { created_at: true }
        }
      }
    });

    let expiredCount = 0;

    for (const candidate of candidates) {
      const createdAt = candidate.payment_logs[0]?.created_at ?? null;
      if (!createdAt) {
        continue;
      }

      const expiresAt = addMinutes(new Date(createdAt), VN_PAY_EXPIRY_MINUTES);
      if (expiresAt > now) {
        continue;
      }

      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.payments.updateMany({
          where: {
            payment_id: candidate.payment_id,
            status: PAYMENT_STATUS.PENDING
          },
          data: {
            status: PAYMENT_STATUS.EXPIRED
          }
        });

        if (updated.count === 0) {
          return false;
        }

        await tx.payment_logs.create({
          data: {
            payment_id: candidate.payment_id,
            log_type: 'EXPIRE',
            message: 'Thanh toán hết hạn tự động',
            new_data: JSON.stringify({
              expired_at: now.toISOString(),
              created_at: createdAt.toISOString(),
              expires_at: expiresAt.toISOString(),
              orderId: candidate.MaHD
            })
          }
        });

        await tx.donhang.update({
          where: { MaDH: candidate.MaHD },
          data: {
            payment_status: PAYMENT_STATUS.EXPIRED
          }
        });

        return true;
      });

      if (result) {
        expiredCount += 1;
      }
    }

    return {
      success: true,
      message: 'Đã xử lý đơn thanh toán hết hạn',
      data: { expiredCount }
    };
  } catch (error) {
    console.error('Expire VNPay payments error:', error);
    return {
      success: false,
      message: 'Lỗi hệ thống khi xử lý thanh toán hết hạn',
      data: { expiredCount: 0 }
    };
  }
}

/**
 * Sort object by key alphabetically
 */
function buildVNPayQueryString(obj: Record<string, string | number | undefined>): string {
  // VNPay canonical signing string: sort alphabetically and encode with '+' for spaces
  return Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
    .sort()
    .map((key) => {
      const value = String(obj[key] || '').trim();
      return `${encodeVNPayValue(key)}=${encodeVNPayValue(value)}`;
    })
    .join('&');
}

function buildVNPayFinalUrl(obj: Record<string, string | number | undefined>, secureHash: string): string {
  // For final URL: include encoded values
  const params = Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
    .sort()
    .map((key) => `${encodeVNPayValue(key)}=${encodeVNPayValue(String(obj[key] || ''))}`)
    .join('&');

  return `${params}&vnp_SecureHash=${encodeVNPayValue(secureHash)}`;
}

function encodeVNPayValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

function normalizeIpAddress(ipAddr?: string): string {
  const value = (ipAddr || '').trim();
  if (!value || value === '::1') {
    return '127.0.0.1';
  }

  if (value.startsWith('::ffff:')) {
    return value.replace('::ffff:', '');
  }

  return value;
}

/**
 * Format date for VNPay
 */
function formatDate(date: Date): string {
  const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const year = vietnamTime.getUTCFullYear();
  const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(vietnamTime.getUTCDate()).padStart(2, '0');
  const hours = String(vietnamTime.getUTCHours()).padStart(2, '0');
  const minutes = String(vietnamTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(vietnamTime.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Compute VNPay signature for given params (helper for debugging)
 */
export function computeVNPaySignature(obj: Record<string, string | number | undefined>, hashType: string = 'SHA512') {
  const signData = buildVNPayQueryString(obj);
  const upper = String(hashType || '').toUpperCase();
  const algo = upper === 'MD5' ? 'md5' : upper === 'SHA256' ? 'sha256' : 'sha512';
  const hmac = crypto.createHmac(algo, VNP_CONFIG.HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  const signedHex = String(signed || '').toUpperCase();
  return { signData, secureHash: signedHex, secureHashType: upper || 'SHA512' };
}
