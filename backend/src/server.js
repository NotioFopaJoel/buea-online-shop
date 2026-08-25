const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const env = require('./config/environment');
const connectDatabase = require('./config/database');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const reviewRoutes = require('./routes/review.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const adminRoutes = require('./routes/admin.routes');
const publicRoutes = require('./routes/public.routes');
const sellerRoutes = require('./routes/seller.routes');
const uploadRoutes = require('./routes/upload.routes');
const advertisementRoutes = require('./routes/advertisement.routes');

const app = express();

// Render (and most PaaS hosts) place the app behind a reverse proxy that adds
// an X-Forwarded-For header. Without telling Express to trust that first hop,
// req.ip resolves to the proxy's internal address (seen as "::1" in logs)
// instead of the real visitor IP, which breaks IP-based rate limiting and
// makes express-rate-limit throw ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
// "1" = trust exactly one hop in front of the app, which matches Render's setup.
app.set('trust proxy', 1);

// --- Security & core middleware ---
// crossOriginResourcePolicy is relaxed to 'cross-origin' because the frontend
// (a different origin in dev - :5173 vs :5000 - and potentially a different
// domain in production) needs to load product images from /uploads via <img>.
// Helmet's default 'same-origin' policy would otherwise silently block them.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CLIENT_URL can be a single URL or a comma-separated list (e.g.
// "http://localhost:5173,https://buea-online-shop.netlify.app"), so the same
// backend accepts requests from local dev AND the deployed frontend without
// having to keep swapping the env var back and forth between them.
// Trailing slashes are stripped automatically since a browser's Origin header
// never includes one (a common source of "looks identical but doesn't match" bugs).
const allowedOrigins = env.CLIENT_URL
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// Logged on every boot so a mismatch is easy to spot in the Render/host logs:
// compare this list against the exact "origin" shown in the browser's CORS error.
console.log('[cors] Allowed origins:', allowedOrigins);

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no Origin header (server-to-server, curl, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Also trust any Vercel/Netlify subdomain automatically (preview deployments,
    // renamed projects, etc.) so hosting-platform URL changes don't require
    // touching the CLIENT_URL env var every time.
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) || /^https:\/\/[a-z0-9-]+\.netlify\.app$/.test(origin)) {
      return callback(null, true);
    }
    console.warn(`[cors] Blocked request from unlisted origin: "${origin}"`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
app.use('/api', apiLimiter);
// Product/advertisement uploads now go straight to Cloudinary (see upload.middleware.js
// and upload.controller.js) instead of local disk, so this route is kept only
// as a harmless fallback for any legacy local file URLs from before that switch.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BUEA ONLINE SHOP API is running', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/advertisements', advertisementRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.log(`[server] BUEA ONLINE SHOP API running on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

start();

module.exports = app;
