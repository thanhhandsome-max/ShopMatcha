#!/usr/bin/env node
/**
 * Test VNPay with SHA256 instead of SHA512
 */

const crypto = require('crypto');

const TMN_CODE = '8KAWM04P';
const HASH_SECRET = '4HFW31QZMU3TNO7QFVW1CIG3XTW2LJP3';

const signData = 'vnp_Amount=1000000&vnp_Command=pay&vnp_CreateDate=20260514150923&vnp_CurrCode=VND&vnp_ExpireDate=20260514152423&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Test%20thanh%20toan&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Forder-confirmation&vnp_TmnCode=8KAWM04P&vnp_TxnRef=ORDER_1778746163673&vnp_Version=2.1.0';

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║  VNPay Hash Algorithm Comparison                     ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

console.log('📝 Sign Data:');
console.log(signData);
console.log('\n');

// Test SHA512
const hmac512 = crypto.createHmac('sha512', HASH_SECRET);
const sig512 = hmac512.update(Buffer.from(signData, 'utf-8')).digest('hex');
console.log('SHA512 Signature:');
console.log(sig512);

// Test SHA256
const hmac256 = crypto.createHmac('sha256', HASH_SECRET);
const sig256 = hmac256.update(Buffer.from(signData, 'utf-8')).digest('hex');
console.log('\nSHA256 Signature:');
console.log(sig256);

console.log('\n🔗 SHA256 Payment URL:');
const url256 = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${signData}&vnp_SecureHash=${sig256}`;
console.log(url256);
