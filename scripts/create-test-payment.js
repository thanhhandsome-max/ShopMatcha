const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const now = Date.now();
  const MaDH = `TESTDH_${now}`;
  const order_code = `ORDER_${now}`;
  try {
    // create donhang
    await prisma.donhang.create({
      data: {
        MaDH,
        order_code,
        TongTien: 100000,
        subtotal: 100000,
        shipping_fee: 0,
        TrangThai: 1
      }
    });

    const paymentId = `PAY${now.toString(36).toUpperCase()}`;
    await prisma.payments.create({
      data: {
        payment_id: paymentId,
        MaHD: MaDH,
        transaction_id: `${order_code}_TXN_${now}`,
        amount: 100000,
        payment_method: 'VNPay',
        status: 0
      }
    });

    console.log('Created test payment:', paymentId);
    process.exit(0);
  } catch (e) {
    console.error('Failed create test payment:', e);
    process.exit(1);
  }
}

run();
