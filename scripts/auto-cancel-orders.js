#!/usr/bin/env node

/**
 * Cron Job: Tự động hủy đơn hàng chờ thanh toán quá 10 phút
 *
 * Cách chạy:
 * 1. Development: node scripts/auto-cancel-orders.js
 * 2. Production: Thêm vào package.json scripts hoặc sử dụng PM2
 * 3. Hoặc chạy như một service riêng
 */

const cron = require('node-cron');
const http = require('http');

// Cấu hình
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const AUTO_CANCEL_URL = `${API_BASE_URL}/api/don-hang/auto-cancel`;

// Hàm gọi API auto cancel
async function runAutoCancel() {
  return new Promise((resolve, reject) => {
    console.log(`[${new Date().toISOString()}] 🔍 Đang kiểm tra đơn hàng quá hạn...`);

    const url = new URL(AUTO_CANCEL_URL);

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 0
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);

          if (result.ok) {
            if (result.cancelledCount > 0) {
              console.log(`[${new Date().toISOString()}] ✅ Đã hủy ${result.cancelledCount} đơn hàng quá hạn`);
              result.cancelledOrders.forEach(order => {
                console.log(`   - ${order.maHD}: chờ ${order.thoiGianCho} phút`);
              });
            } else {
              console.log(`[${new Date().toISOString()}] ℹ️  Không có đơn hàng nào cần hủy`);
            }
          } else {
            console.error(`[${new Date().toISOString()}] ❌ Lỗi khi auto cancel:`, result.error);
          }

          resolve(result);
        } catch (error) {
          console.error(`[${new Date().toISOString()}] 💥 Lỗi parse response:`, error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] 💥 Lỗi kết nối:`, error.message);
      reject(error);
    });

    req.end();
  });
}

// Chạy cron job mỗi phút
function startCronJob() {
  console.log('🚀 Khởi động cron job auto-cancel orders...');
  console.log('⏰ Chạy mỗi phút để kiểm tra đơn hàng quá hạn');

  // Cron expression: "*/1 * * * *" = mỗi phút
  cron.schedule('*/1 * * * *', () => {
    runAutoCancel();
  });

  console.log('✅ Cron job đã được khởi động thành công');
}

// Chạy ngay lần đầu khi start
async function main() {
  console.log('🎯 Auto Cancel Orders Service');
  console.log('================================');

  // Test kết nối ngay khi start
  await runAutoCancel();

  // Khởi động cron job
  startCronJob();

  // Giữ process chạy
  console.log('🔄 Service đang chạy... (Ctrl+C để dừng)');
}

// Xử lý tín hiệu dừng
process.on('SIGINT', () => {
  console.log('\n🛑 Đang dừng service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Đang dừng service...');
  process.exit(0);
});

// Chạy main function
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Lỗi khởi động service:', error);
    process.exit(1);
  });
}

module.exports = { runAutoCancel };