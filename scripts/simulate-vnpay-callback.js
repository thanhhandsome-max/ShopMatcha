const fetch = global.fetch || require('node-fetch');
const crypto = require('crypto');
// Load env vars from project .env.local if present
try {
  require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env.local') });
} catch (e) {
  // ignore
}

function sortObject(obj) {
  const sorted = {};
  Object.keys(obj).sort().forEach((k) => {
    const v = obj[k];
    if (v !== null && v !== undefined && v !== '') sorted[k] = v;
  });
  return sorted;
}

function buildQueryString(obj) {
  return Object.keys(obj)
    .map((k) => `${encodeURIComponent(k).replace(/%20/g, '+')}=${encodeURIComponent(String(obj[k] || '')).replace(/%20/g, '+')}`)
    .join('&');
}

async function run(paymentId) {
  if (!paymentId) {
    console.error('Usage: node simulate-vnpay-callback.js <paymentId>');
    process.exit(1);
  }

  // Fetch payment details
  const detailRes = await fetch(`http://localhost:3000/api/payments/${encodeURIComponent(paymentId)}`);
  const detail = await detailRes.json().catch(() => ({}));
  if (!detail.success) {
    console.error('Cannot get payment details:', JSON.stringify(detail, null, 2));
    process.exit(1);
  }

  const payment = detail.data;
  const txnRef = payment.transaction_id || payment.transactionId || (payment.donhang && payment.donhang.order_code);
  const amount = Number(payment.amount || payment.donhang?.TongTien || 0);

  if (!txnRef || !amount) {
    console.error('Missing txnRef or amount in payment record');
    process.exit(1);
  }

  // Build VNPay params similar to what VNPay would send
  const vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: process.env.VNPAY_TMN_CODE || process.env.VNP_TMN_CODE || '',
    vnp_TxnRef: txnRef,
    vnp_Amount: String(Math.round(amount * 100)),
    vnp_ResponseCode: '00',
    vnp_OrderInfo: `Thanh toan don ${payment.MaHD || payment.donhang?.MaDH || txnRef}`,
    vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, '').slice(0,14),
  };

  const secret = process.env.VNPAY_HASH_SECRET || process.env.VNP_HASH_SECRET || '';
  if (!secret) {
    console.error('VNPAY_HASH_SECRET or VNP_HASH_SECRET not set in env');
    process.exit(1);
  }

  const sorted = sortObject(vnpParams);
  const signData = buildQueryString(sorted);
  // Use SHA512 VNPay canonical signing
  const hmac = crypto.createHmac('sha512', secret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex').toUpperCase();

  sorted['vnp_SecureHash'] = signed;

  const qs = buildQueryString(sorted);
  const callbackUrl = `http://localhost:3000/api/payments/callback?${qs}`;

  console.log('Calling simulated VNPay callback URL:');
  console.log(callbackUrl);

  const res = await fetch(callbackUrl, { method: 'GET', redirect: 'manual' });
  console.log('Callback response status:', res.status);
  const text = await res.text();
  console.log('Callback response body (truncated):', text.slice(0, 1000));
}

const paymentId = process.argv[2];
run(paymentId).catch((e) => {
  console.error('Simulate callback failed:', e);
  process.exit(1);
});
