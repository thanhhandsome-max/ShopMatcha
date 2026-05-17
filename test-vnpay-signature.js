#!/usr/bin/env node
/**
 * Standalone VNPay Signature Test
 * Tính toán signature hệt như backend, để verify có đúng không
 */

const crypto = require('crypto');

// Load env
const TMN_CODE = '8KAWM04P';
const HASH_SECRET = '4HFW31QZMU3TNO7QFVW1CIG3XTW2LJP3';
const BASE_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const RETURN_URL = 'http://localhost:3000/order-confirmation';

// Test data
const testData = {
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_TmnCode: TMN_CODE,
  vnp_Locale: 'vn',
  vnp_CurrCode: 'VND',
  vnp_TxnRef: 'ORDER_' + Date.now(),
  vnp_OrderInfo: 'Test thanh toan',
  vnp_OrderType: 'other',
  vnp_Amount: 1000000, // 10,000 VND (10000 * 100)
  vnp_ReturnUrl: RETURN_URL,
  vnp_IpAddr: '127.0.0.1',
  vnp_CreateDate: formatDate(new Date()),
  vnp_ExpireDate: formatDate(new Date(Date.now() + 15 * 60 * 1000)),
};

function formatDate(date) {
  const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const year = vietnamTime.getUTCFullYear();
  const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(vietnamTime.getUTCDate()).padStart(2, '0');
  const hours = String(vietnamTime.getUTCHours()).padStart(2, '0');
  const minutes = String(vietnamTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(vietnamTime.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function encodeVNPayValue(value) {
  return encodeURIComponent(String(value));
}

function buildVNPayQueryString(obj) {
  return Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined && obj[key] !== '')
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeVNPayValue(obj[key])}`)
    .join('&');
}

// Generate signature
const signData = buildVNPayQueryString(testData);
const hmac = crypto.createHmac('sha256', HASH_SECRET);
const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║            VNPay Signature Test (SHA256)                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📋 TEST DATA:');
console.log(JSON.stringify(testData, null, 2));

console.log('\n🔐 SIGNING DATA (sorted by key):');
console.log(signData);

console.log('\n✅ GENERATED SIGNATURE (SHA256):');
console.log(signature);

console.log('\n🔗 FULL PAYMENT URL:');
const paymentUrl = `${BASE_URL}?${signData}&vnp_SecureHashType=SHA256&vnp_SecureHash=${signature}`;
console.log(paymentUrl);

console.log('\n📍 URL STRUCTURE:');
console.log(`Base: ${BASE_URL}`);
console.log(`TMN Code: ${TMN_CODE}`);
console.log(`Hash Secret: ${HASH_SECRET}`);
console.log(`Hash Type: SHA256`);
console.log(`Signature: ${signature.substring(0, 20)}...`);

console.log('\n✨ Next steps:');
console.log('1. Copy the FULL PAYMENT URL above');
console.log('2. Paste into browser to test VNPAY sandbox');
console.log('3. If still signature error, TMN_CODE/HASH_SECRET may be wrong\n');
