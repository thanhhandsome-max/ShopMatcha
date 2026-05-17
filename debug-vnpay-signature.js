/**
 * Local VNPay signature debugger
 * Usage: node debug-vnpay-signature.js
 */

const crypto = require('crypto');
try {
  require('dotenv').config({ path: require('path').resolve(__dirname, '.env.local') });
} catch (e) {
  // ignore
}

// Your sandbox credentials (from .env)
const TMN_CODE = process.env.VNPAY_TMN_CODE || process.env.VNP_TMN_CODE || '8KAWM04P';
const HASH_SECRET = process.env.VNPAY_HASH_SECRET || process.env.VNP_HASH_SECRET || '';

// Example VNPay parameters (replace with actual from payment API response or console)
// These should match what server sends
const vnpParams = {
  vnp_Amount: '39000000',
  vnp_Command: 'pay',
  vnp_CreateDate: '20260517120722',
  vnp_CurrCode: 'VND',
  vnp_ExpireDate: '20260517122222',
  vnp_IpAddr: '127.0.0.1',
  vnp_Locale: 'vn',
  vnp_OrderInfo: 'Thanh toan don hang ORD-20260517-001',
  vnp_OrderType: 'other',
  vnp_ReturnUrl: 'http://localhost:3000/api/payments/callback',
  vnp_TmnCode: TMN_CODE,
  vnp_TxnRef: 'ORD-20260517-001_1778949844947',
  vnp_Version: '2.1.0'
};

console.log('=== VNPay Signature Debug ===\n');
console.log('TMN_CODE:', TMN_CODE);
console.log('HASH_SECRET:', HASH_SECRET);
console.log('\nParameters to sign:');
console.log(vnpParams);

// Build sign data (same logic as buildVNPayQueryString in service)
function buildVNPayQueryString(obj) {
  return Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
    .sort()
    .map((key) => {
      const value = encodeURIComponent(String(obj[key])).replace(/%20/g, '+');
      return `${encodeURIComponent(key).replace(/%20/g, '+')}=${value}`;
    })
    .join('&');
}

const signData = buildVNPayQueryString(vnpParams);
console.log('\nSign Data (query string):\n', signData);

// Calculate HMAC-SHA512
const hmac = crypto.createHmac('sha512', HASH_SECRET);
const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
const signedUpper = signed.toUpperCase();

console.log('\nComputed Secure Hash (SHA512, hex):', signed);
console.log('Computed Secure Hash (uppercase):', signedUpper);

// Full payment URL
const paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${signData}&vnp_SecureHash=${signedUpper}`;
console.log('\n\nFull Payment URL:\n', paymentUrl);

console.log('\n\n=== What to compare ===');
console.log('1. Copy the actual response.data.debug.signData from payment API');
console.log('2. Copy the actual response.data.debug.secureHash from payment API');
console.log('3. If they match above, signature is correct');
console.log('4. If they differ, check encoding/secret/parameters');
