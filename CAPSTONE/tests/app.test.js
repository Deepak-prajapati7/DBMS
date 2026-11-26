const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const mongoose = require('mongoose');
const { app } = require('../server.js');

after(async () => {
  await mongoose.disconnect();
});

async function startTestServer() {
  const server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address();

  return {
    server,
    port,
    close: () => new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    }),
  };
}

test('GET /api/health responds with database status', async () => {
  const { server, port, close } = await startTestServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, 'healthy');
    assert.equal(payload.database.type, 'MongoDB (Mongoose)');
    assert.equal(typeof payload.timestamp, 'string');
  } finally {
    await close();
  }
});

test('POST /api/auth/login authenticates the admin demo account', async () => {
  const { server, port, close } = await startTestServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'demo1234' }),
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.role, 'admin');
    assert.equal(payload.email, 'admin@example.com');
    assert.equal(typeof payload.token, 'string');
  } finally {
    await close();
  }
});

test('GET /api/requests rejects unauthenticated access', async () => {
  const { server, port, close } = await startTestServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/requests`);
    const payload = await response.json();

    assert.equal(response.status, 401);
    assert.equal(payload.error, 'Please sign in to continue.');
  } finally {
    await close();
  }
});

test('Parts marketplace and Razorpay order + verify flow works end-to-end', async () => {
  const { server, port, close } = await startTestServer();

  try {
    const loginRes = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul@example.com', password: 'demo1234', role: 'user' }),
    });
    const loginData = await loginRes.json();
    assert.equal(loginRes.status, 200);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginData.token}`,
    };

    const createRes = await fetch(`http://127.0.0.1:${port}/api/parts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: 'Kingston 16GB DDR4 RAM',
        partCategory: 'RAM & Memory',
        condition: 'Working / Tested',
        qty: 1,
        priceInr: 1999,
        location: 'Jaipur',
        sellerUpi: 'rahul@okaxis',
      }),
    });
    const createdPart = await createRes.json();
    assert.equal(createRes.status, 201);
    assert.equal(createdPart.status, 'Available');
    assert.equal(createdPart.priceInr, 1999);

    const orderRes = await fetch(`http://127.0.0.1:${port}/api/parts/${createdPart.id}/razorpay/order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    const orderData = await orderRes.json();
    assert.equal(orderRes.status, 200);
    assert.equal(orderData.amount, 199900);
    assert.equal(orderData.currency, 'INR');
    assert.ok(orderData.orderId.startsWith('order_'));

    const verifyRes = await fetch(`http://127.0.0.1:${port}/api/parts/${createdPart.id}/razorpay/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        razorpay_order_id: orderData.orderId,
        simulatedPayment: true,
        paymentMethod: 'UPI',
      }),
    });
    const verifiedPart = await verifyRes.json();
    assert.equal(verifyRes.status, 200);
    assert.equal(verifiedPart.status, 'Sold');
    assert.equal(verifiedPart.razorpayOrderId, orderData.orderId);
    assert.ok(verifiedPart.razorpayPaymentId.startsWith('pay_'));
  } finally {
    await close();
  }
});
