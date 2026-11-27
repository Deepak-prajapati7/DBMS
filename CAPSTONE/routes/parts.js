const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const router = express.Router();
const PartListing = require('../models/PartListing');
const { authenticate, requireAdmin } = require('../middleware/auth');

const { PART_CATEGORIES, PART_CONDITIONS } = PartListing;

const SEED_PARTS = [
  {
    numericId: 2730000001,
    title: 'Crucial 8GB DDR4-3200 Laptop RAM Stick',
    partCategory: 'RAM & Memory',
    condition: 'Working / Tested',
    qty: 2,
    priceInr: 1350,
    location: 'Malviya Nagar, Jaipur, Rajasthan',
    description: 'Pulled from upgraded corporate ThinkPad laptops. MemTest86 verified.',
    sellerName: 'Rahul Sharma',
    sellerEmail: 'rahul@example.com',
    sellerUpi: 'rahul.sharma@okaxis',
    status: 'Available',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    numericId: 2730000002,
    title: 'Samsung 512GB NVMe M.2 PCIe Gen3 SSD',
    partCategory: 'Storage (SSD/HDD)',
    condition: 'Working / Tested',
    qty: 1,
    priceInr: 2450,
    location: 'Dwarka Sector 12, New Delhi',
    description: '94% SMART health remaining, securely wiped and formatted.',
    sellerName: 'Priya Verma',
    sellerEmail: 'priya@example.com',
    sellerUpi: 'priya.verma@okicici',
    status: 'Available',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    numericId: 2730000003,
    title: 'Dell 65W USB-C Original Power Adapters',
    partCategory: 'Power Supplies & Adapters',
    condition: 'Refurbishable',
    qty: 3,
    priceInr: 1100,
    location: 'Vaishali Nagar, Jaipur, Rajasthan',
    description: 'OEM Dell chargers with intact Type-C cables and surge protection.',
    sellerName: 'Rahul Sharma',
    sellerEmail: 'rahul@example.com',
    sellerUpi: 'rahul.sharma@okaxis',
    status: 'Sold',
    buyerName: 'Priya Verma',
    buyerEmail: 'priya@example.com',
    razorpayOrderId: 'order_EcoRzp91a4f21c',
    razorpayPaymentId: 'pay_EcoRzp88c7b104',
    razorpaySignature: 'verified_hmac_sha256_demo',
    paymentMethod: 'UPI',
    paidAmountInr: 1100,
    paidAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    numericId: 2730000004,
    title: 'iPhone 13 OLED Display & Digitizer Assembly',
    partCategory: 'Displays & Screens',
    condition: 'Refurbishable',
    qty: 1,
    priceInr: 3800,
    location: 'Okhla Phase II, New Delhi',
    description: 'Genuine OLED panel salvaged from water-damaged logic board unit.',
    sellerName: 'Priya Verma',
    sellerEmail: 'priya@example.com',
    sellerUpi: 'priya.verma@okicici',
    status: 'Payout Settled',
    buyerName: 'EcoCycle Buyback Hub',
    buyerEmail: 'admin@example.com',
    razorpayOrderId: 'order_EcoRzp72d910ab',
    razorpayPaymentId: 'pay_EcoRzp72d999fe',
    razorpaySignature: 'verified_hmac_sha256_demo',
    paymentMethod: 'Razorpay Hub Buyback',
    paidAmountInr: 3800,
    paidAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    payoutId: 'pout_EcoRzp441098bc',
    payoutAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    numericId: 2730000005,
    title: 'High-Grade Gold-Plated Telecom & Server PCBs (2 kg)',
    partCategory: 'Motherboards & PCBs',
    condition: 'For Parts / Scrap',
    qty: 4,
    priceInr: 1850,
    location: 'C-Scheme, Jaipur, Rajasthan',
    description: 'Clean router and server boards ready for precious metal recovery.',
    sellerName: 'Rahul Sharma',
    sellerEmail: 'rahul@example.com',
    sellerUpi: 'rahul.sharma@okaxis',
    status: 'Available',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

let memoryParts = SEED_PARTS.map((p) => ({ ...p, id: p.numericId }));
const pendingOrders = new Map();

const isDbConnected = () => mongoose.connection.readyState === 1;

function getRazorpayCredentials() {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const hasLiveKeys = Boolean(keyId && keySecret);
  return {
    keyId: hasLiveKeys ? keyId : 'rzp_test_EcoCycleDemo',
    keySecret: hasLiveKeys ? keySecret : (process.env.JWT_SECRET || 'ecocycle_rzp_test_secret'),
    mode: hasLiveKeys ? 'razorpay_api' : 'razorpay_test_sim',
    hasLiveKeys,
  };
}

async function ensureSeededPartsInDb() {
  if (!isDbConnected()) return;
  const count = await PartListing.countDocuments();
  if (count === 0) {
    await PartListing.insertMany(SEED_PARTS);
  }
}

async function findPartById(id) {
  if (isDbConnected()) {
    const numId = Number(id);
    if (!Number.isNaN(numId) && numId > 0) {
      const doc = await PartListing.findOne({ numericId: numId });
      if (doc) return doc;
    }
    try {
      return await PartListing.findById(id);
    } catch (_) {}
  }
  return memoryParts.find((p) => String(p.id || p.numericId) === String(id));
}

// GET /api/parts/razorpay-config - Safe public Razorpay config
router.get('/razorpay-config', (req, res) => {
  const { keyId, mode, hasLiveKeys } = getRazorpayCredentials();
  res.json({
    keyId,
    mode,
    hasLiveKeys,
    currency: 'INR',
    merchantName: 'EcoCycle Circular Parts',
  });
});

// GET /api/parts - List parts marketplace
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { category, status, mine, search } = req.query;

    if (isDbConnected()) {
      await ensureSeededPartsInDb();
      const filter = {};
      if (mine === 'true') {
        filter.$or = [
          { sellerEmail: req.user.email.toLowerCase() },
          { buyerEmail: req.user.email.toLowerCase() },
        ];
      }
      if (category && category !== 'all') filter.partCategory = category;
      if (status && status !== 'all') filter.status = status;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        const searchOr = [
          { title: regex },
          { partCategory: regex },
          { location: regex },
          { sellerName: regex },
          { description: regex },
        ];
        filter.$and = filter.$or ? [{ $or: filter.$or }, { $or: searchOr }] : [{ $or: searchOr }];
        if (filter.$or) delete filter.$or;
      }
      const docs = await PartListing.find(filter).sort({ createdAt: -1 });
      return res.json(docs);
    }

    let list = [...memoryParts];
    if (mine === 'true') {
      const me = req.user.email.toLowerCase();
      list = list.filter((p) => p.sellerEmail.toLowerCase() === me || (p.buyerEmail || '').toLowerCase() === me);
    }
    if (category && category !== 'all') {
      list = list.filter((p) => p.partCategory === category);
    }
    if (status && status !== 'all') {
      list = list.filter((p) => p.status === status);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) =>
        [p.title, p.partCategory, p.location, p.sellerName, p.description, p.id, p.numericId]
          .some((f) => String(f || '').toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/parts - List a part for sale
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { title, partCategory, condition, qty, priceInr, location, sellerUpi, description } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Please enter the part name or model.' });
    }
    if (!partCategory || !PART_CATEGORIES.includes(partCategory)) {
      return res.status(400).json({ error: 'Please choose a valid part category.' });
    }
    const cleanPrice = Number(priceInr);
    if (!Number.isFinite(cleanPrice) || cleanPrice < 10 || cleanPrice > 500000) {
      return res.status(400).json({ error: 'Asking price must be between ₹10 and ₹5,00,000.' });
    }
    if (!location || !String(location).trim()) {
      return res.status(400).json({ error: 'Please provide your city or pickup location.' });
    }

    const cleanQty = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
    const cleanCondition = PART_CONDITIONS.includes(condition) ? condition : 'Working / Tested';
    const numId = Date.now();
    const partData = {
      numericId: numId,
      id: numId,
      title: String(title).trim(),
      partCategory,
      condition: cleanCondition,
      qty: cleanQty,
      priceInr: Math.round(cleanPrice),
      location: String(location).trim(),
      description: description ? String(description).trim() : '',
      sellerName: req.user.name,
      sellerEmail: req.user.email.toLowerCase(),
      sellerUpi: sellerUpi ? String(sellerUpi).trim() : '',
      status: 'Available',
      createdAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      const created = new PartListing(partData);
      await created.save();
      memoryParts.unshift(created.toJSON());
      return res.status(201).json(created);
    }

    memoryParts.unshift(partData);
    return res.status(201).json(partData);
  } catch (err) {
    next(err);
  }
});

// POST /api/parts/:id/razorpay/order - Create Razorpay order for buying a listed part
router.post('/:id/razorpay/order', authenticate, async (req, res, next) => {
  try {
    const part = await findPartById(req.params.id);
    if (!part) {
      return res.status(404).json({ error: 'Part listing not found.' });
    }
    if (part.status !== 'Available') {
      return res.status(400).json({ error: `This part is already ${part.status.toLowerCase()}.` });
    }

    const amountPaise = Math.round(Number(part.priceInr) * 100);
    const { keyId, keySecret, mode, hasLiveKeys } = getRazorpayCredentials();
    const receipt = `ecopart_${part.numericId || part.id}`;

    if (hasLiveKeys) {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt,
          notes: {
            partId: String(part.numericId || part.id),
            title: part.title,
            buyerEmail: req.user.email,
          },
        }),
      });
      const rzpOrder = await rzpRes.json();
      if (!rzpRes.ok) {
        return res.status(502).json({
          error: (rzpOrder.error && rzpOrder.error.description) || 'Unable to create Razorpay order.',
        });
      }
      pendingOrders.set(rzpOrder.id, {
        partId: String(part.numericId || part.id),
        amountPaise: rzpOrder.amount,
        mode: 'razorpay_api',
      });
      return res.json({
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId,
        mode,
        part,
      });
    }

    // Built-in Razorpay Test Checkout order
    const orderId = `order_${crypto.randomBytes(7).toString('hex')}`;
    pendingOrders.set(orderId, {
      partId: String(part.numericId || part.id),
      amountPaise,
      mode: 'razorpay_test_sim',
    });

    return res.json({
      orderId,
      amount: amountPaise,
      currency: 'INR',
      keyId,
      mode,
      part,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/parts/:id/razorpay/verify - Verify Razorpay payment signature and mark Sold
router.post('/:id/razorpay/verify', authenticate, async (req, res, next) => {
  try {
    const part = await findPartById(req.params.id);
    if (!part) {
      return res.status(404).json({ error: 'Part listing not found.' });
    }
    if (part.status !== 'Available') {
      return res.status(400).json({ error: `This part is already ${part.status.toLowerCase()}.` });
    }

    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: incomingPaymentId,
      razorpay_signature: incomingSignature,
      paymentMethod,
      simulatedPayment,
    } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ error: 'Missing Razorpay order ID.' });
    }

    const { keySecret, hasLiveKeys } = getRazorpayCredentials();
    const orderMeta = pendingOrders.get(orderId);
    if (orderMeta && String(orderMeta.partId) !== String(part.numericId || part.id)) {
      return res.status(400).json({ error: 'Order does not match this part listing.' });
    }

    let paymentId = incomingPaymentId || `pay_${crypto.randomBytes(7).toString('hex')}`;
    let signature = incomingSignature || '';

    if (hasLiveKeys && !simulatedPayment) {
      if (!incomingPaymentId || !incomingSignature) {
        return res.status(400).json({ error: 'Missing Razorpay payment verification signature.' });
      }
      const expected = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${incomingPaymentId}`)
        .digest('hex');
      const expectedBuf = Buffer.from(expected, 'utf8');
      const actualBuf = Buffer.from(String(incomingSignature), 'utf8');
      if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
        return res.status(400).json({ error: 'Razorpay payment signature verification failed.' });
      }
    } else {
      // Test Checkout Simulator: sign deterministically with HMAC-SHA256 for audit receipt
      signature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
    }

    pendingOrders.delete(orderId);

    const updates = {
      status: 'Sold',
      buyerName: req.user.name,
      buyerEmail: req.user.email.toLowerCase(),
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      paymentMethod: paymentMethod ? String(paymentMethod).trim() : 'UPI',
      paidAmountInr: part.priceInr,
      paidAt: new Date(),
    };

    if (typeof part.save === 'function') {
      Object.assign(part, updates);
      await part.save();
      return res.json(part);
    }

    Object.assign(part, updates);
    return res.json(part);
  } catch (err) {
    next(err);
  }
});

// POST /api/parts/:id/payout - Admin settles Razorpay payout to seller UPI (or buys back directly)
router.post('/:id/payout', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const part = await findPartById(req.params.id);
    if (!part) {
      return res.status(404).json({ error: 'Part listing not found.' });
    }
    if (!['Available', 'Sold'].includes(part.status)) {
      return res.status(400).json({ error: `Cannot settle payout for a ${part.status.toLowerCase()} listing.` });
    }

    const now = new Date();
    const payoutId = `pout_${crypto.randomBytes(6).toString('hex')}`;
    const updates = {
      status: 'Payout Settled',
      payoutId,
      payoutAt: now,
    };

    if (!part.razorpayPaymentId) {
      const orderId = `order_${crypto.randomBytes(6).toString('hex')}`;
      const paymentId = `pay_${crypto.randomBytes(6).toString('hex')}`;
      const { keySecret } = getRazorpayCredentials();
      updates.buyerName = 'EcoCycle Buyback Hub';
      updates.buyerEmail = req.user.email.toLowerCase();
      updates.razorpayOrderId = orderId;
      updates.razorpayPaymentId = paymentId;
      updates.razorpaySignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      updates.paymentMethod = 'Razorpay Hub Buyback';
      updates.paidAmountInr = part.priceInr;
      updates.paidAt = now;
    }

    if (typeof part.save === 'function') {
      Object.assign(part, updates);
      await part.save();
      return res.json(part);
    }

    Object.assign(part, updates);
    return res.json(part);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/parts/:id - Seller, buyer, or Admin removes part/payment record
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const part = await findPartById(req.params.id);
    if (!part) {
      return res.status(404).json({ error: 'Part listing not found.' });
    }

    const userEmail = req.user.email.toLowerCase();
    const isSeller = String(part.sellerEmail || '').toLowerCase() === userEmail;
    const isBuyer = String(part.buyerEmail || '').toLowerCase() === userEmail;
    if (req.user.role !== 'admin' && !isSeller && !isBuyer) {
      return res.status(403).json({ error: 'You can only remove your own part listings or payments.' });
    }

    if (isDbConnected() && part._id) {
      await PartListing.findByIdAndDelete(part._id);
    }
    memoryParts = memoryParts.filter((p) => String(p.id || p.numericId) !== String(req.params.id));

    return res.json({ ok: true, message: 'Part listing removed.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
module.exports.SEED_PARTS = SEED_PARTS;
