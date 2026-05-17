const fetch = global.fetch || require('node-fetch');
const fs = require('fs');

async function run() {
  try {
    const orderBody = {
      items: [
        { productId: 'SP_TEST_01', quantity: 1, price: 350000 }
      ],
      MaCH: 'KHO_TEST',
      payment_method: 'vnpay',
      address_id: '',
      customer_note: 'Automated test order',
      shipping_fee: 0
    };

    console.log('Creating order...');
    const oRes = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderBody)
    });
    const oJson = await oRes.json().catch(() => ({}));
    console.log('ORDER RESPONSE:', JSON.stringify(oJson, null, 2));

    if (!oJson?.success) {
      console.error('Order creation failed');
      process.exit(1);
    }

    const orderId = oJson.data?.MaDH;
    const amount = oJson.data?.TongTien;
    console.log('Initiating VNPay payment for', orderId, amount);

    const pRes = await fetch('http://localhost:3000/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount, orderInfo: `Thanh toan don ${orderId}` })
    });
    const pJson = await pRes.json().catch(() => ({}));
    console.log('PAYMENT RESPONSE:', JSON.stringify(pJson, null, 2));

    if (pJson?.success) {
      console.log('\nPayment URL:');
      console.log(pJson.data?.paymentUrl || pJson.data);
      // Fetch payment details
      try {
        const pid = pJson.data?.paymentId;
        if (pid) {
          const dRes = await fetch(`http://localhost:3000/api/payments/${encodeURIComponent(pid)}`);
          const dJson = await dRes.json().catch(() => ({}));
          console.log('\nPAYMENT DETAILS:', JSON.stringify(dJson, null, 2));
        }
      } catch (err) {
        console.error('Failed to fetch payment details:', err);
      }
    }
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

run();
