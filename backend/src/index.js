const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./controllers/logger');

const checkoutRoutes = require('./routes/checkout');
const webhookRoutes = require('./routes/webhooks');
const orderRoutes = require('./routes/orders');
const galleryRoutes = require('./routes/gallery');

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl || true,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// JSON parsing (except webhooks which need raw body)
app.use(express.json());

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/checkout', checkoutRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/gallery', galleryRoutes);

// Products endpoint (proxies Printful)
app.get('/api/products', async (_req, res) => {
  try {
    const printfulService = require('./services/printfulService');
    const products = await printfulService.getSyncProducts();
    res.json(products);
  } catch (error) {
    logger.error('Failed to fetch products', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: config.env === 'production' ? 'Internal server error' : err.message,
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Backend listening on port ${PORT}`, { env: config.env });
});

module.exports = app;
