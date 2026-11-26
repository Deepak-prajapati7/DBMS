require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const categoryRoutes = require('./routes/categories');
const centerRoutes = require('./routes/centers');
const statsRoutes = require('./routes/stats');
const partRoutes = require('./routes/parts');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecocycle';

// ---------------------------------------------------------------------
// 1. Database Connection (MongoDB via Mongoose)
// ---------------------------------------------------------------------
let isMongoConnected = false;
let isConnecting = false;

async function connectMongoDB() {
  if (mongoose.connection.readyState === 1) {
    isMongoConnected = true;
    return;
  }
  if (isConnecting) return;

  const isLocalDefault = !process.env.MONGODB_URI || MONGODB_URI.includes('127.0.0.1') || MONGODB_URI.includes('localhost');
  if (process.env.VERCEL && isLocalDefault) {
    isMongoConnected = false;
    console.log('ℹ️ [MongoDB] Vercel serverless environment detected without a remote MONGODB_URI. Operating with high-performance in-memory fallback.');
    console.log('💡 [MongoDB Tip] To connect MongoDB Atlas on Vercel: set MONGODB_URI in your Vercel Project Settings > Environment Variables.');
    return;
  }

  isConnecting = true;
  console.log(`[MongoDB] Attempting connection to: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('✅ [MongoDB] Successfully connected to database.');

    // Auto-seed initial demo accounts and categories if empty
    await autoSeedIfEmpty();
  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️ [MongoDB] Connection note: ${err.message}`);
    console.warn('💡 [MongoDB Tip] If MongoDB is running on Docker, Homebrew, or Atlas:');
    console.warn('   Update MONGODB_URI in .env (e.g., mongodb+srv://... or mongodb://localhost:27017/ecocycle).');
  } finally {
    isConnecting = false;
  }
}

mongoose.connection.on('connected', () => {
  isMongoConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.warn('⚠️ [MongoDB] Disconnected from database.');
});

// Auto seed helper
async function autoSeedIfEmpty() {
  try {
    const User = require('./models/User');
    const CollectionRequest = require('./models/CollectionRequest');
    const [userCount, reqCount] = await Promise.all([
      User.countDocuments(),
      CollectionRequest.countDocuments(),
    ]);
    if (userCount === 0 || reqCount === 0) {
      console.log('🌱 [MongoDB] Empty collections detected. Auto-seeding initial demo data...');
      const { runSeed } = require('./scripts/seed');
      await runSeed(false);
      console.log('✅ [MongoDB] Auto-seeded demo users, categories, centers & 8 sample requests.');
    }
  } catch (seedErr) {
    console.warn('[MongoDB] Auto-seed check finished:', seedErr.message);
  }
}

// Connect on startup (if not Vercel without Atlas)
if (!process.env.VERCEL || (process.env.MONGODB_URI && !MONGODB_URI.includes('127.0.0.1'))) {
  connectMongoDB();
}

// ---------------------------------------------------------------------
// 2. Middleware & CORS Configuration
// ---------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy connection trigger for serverless invocations if remote URI provided
app.use(async (req, res, next) => {
  if (process.env.MONGODB_URI && mongoose.connection.readyState === 0 && !isConnecting) {
    connectMongoDB().catch(() => {});
  }
  next();
});

// Enable CORS for API consumers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging in development
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
  }
  next();
});

// ---------------------------------------------------------------------
// 3. Health & Diagnostic Endpoint
// ---------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.json({
    status: 'healthy',
    platform: process.env.VERCEL ? 'Vercel Serverless' : 'Node.js standalone',
    database: {
      type: 'MongoDB (Mongoose)',
      status: states[mongoState] || 'Unknown',
      connected: mongoState === 1,
      mode: mongoState === 1 ? 'Live MongoDB' : 'In-Memory Resilient Fallback',
      uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'),
    },
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------
// 4. API Endpoints
// ---------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/parts', partRoutes);

// ---------------------------------------------------------------------
// 5. Static Frontend Serving & Favicon
// ---------------------------------------------------------------------
// Favicon handling: serves favicon.ico or logo.jpeg with 200, or 204 if missing (never 500)
app.get('/favicon.ico', (req, res) => {
  const icoPath = path.join(__dirname, 'favicon.ico');
  const fallbackPath = path.join(__dirname, 'Assest', 'logo.jpeg');
  res.sendFile(icoPath, (err) => {
    if (err) {
      res.sendFile(fallbackPath, (err2) => {
        if (err2) res.status(204).end();
      });
    }
  });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Error handling middleware
app.use(errorHandler);

// SPA routing fallback (return index.html for unknown non-API routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const publicIndexPath = path.join(__dirname, 'public', 'index.html');
  const rootIndexPath = path.join(__dirname, 'index.html');
  res.sendFile(publicIndexPath, (err) => {
    if (err) {
      res.sendFile(rootIndexPath, (err2) => {
        if (err2) {
          res.status(404).json({ error: 'Page not found' });
        }
      });
    }
  });
});

// ---------------------------------------------------------------------
// 6. Start Server (with automatic port conflict fallback)
// ---------------------------------------------------------------------
let server;
function startServer(port) {
  server = app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`  🚀 EcoCycle E-Waste Platform Server Started`);
    console.log(`  🌐 Frontend & API: http://localhost:${port}`);
    console.log(`  📊 Health check:   http://localhost:${port}/api/health`);
    console.log(`  🗄️ Database:       MongoDB (Mongoose v${mongoose.version})`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = Number(port) + 1;
      console.warn(`⚠️ Port ${port} is occupied (common on macOS AirPlay / ControlCenter). Automatically switching to port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server error:', err);
    }
  });

  return server;
}

if (require.main === module) {
  startServer(Number(PORT));
}

// Export app directly for Vercel Serverless Function, while preserving properties for tests
app.app = app;
app.server = server;
app.startServer = startServer;
app.connectMongoDB = connectMongoDB;

module.exports = app;
