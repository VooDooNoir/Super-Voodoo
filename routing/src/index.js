// Phase 4: Express server for OpenRouter routing service
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const router = require('./config/router');
const rateLimiter = require('./services/rateLimiter');
const logger = require('./controllers/logger');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    models: router.healthMonitor.getHealthStatus(),
    timestamp: new Date().toISOString(),
  });
});

// GET /routing/models - List available models per tier
app.get('/routing/models', (req, res) => {
  const { tier } = req.query;
  if (tier) {
    res.json(router.getModelsForTier(tier));
  } else {
    const allTiers = {};
    for (const tierKey of Object.keys(config.tiers)) {
      allTiers[tierKey] = router.getModelsForTier(tierKey);
    }
    res.json(allTiers);
  }
});

// POST /routing/chat - Tier-aware chat completion
app.post('/routing/chat', async (req, res) => {
  try {
    const { userId, tier, messages, system, maxTokens } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const userTier = tier || 'free';
    const tierConfig = config.tiers[userTier];
    if (!tierConfig) return res.status(400).json({ error: `Invalid tier: ${userTier}` });

    // Check rate limit
    const rateCheck = rateLimiter.checkRateLimit(userId, userTier, tierConfig.rateLimitPerMinute);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: rateCheck.retryAfter,
      });
    }

    // Route the chat
    const result = await router.routeChat({
      tier: userTier,
      userId,
      messages,
      system,
      maxTokens,
    });

    res.json({
      success: true,
      model: result.model,
      attempts: result.attempts,
      remaining: rateCheck.remaining,
      choices: result.choices,
      usage: result.usage,
    });
  } catch (err) {
    logger.error('Chat routing failed', { error: err.message });
    res.status(err.message.includes('rate limit') || err.message.includes('cost limit') ? 429 : 502).json({
      error: err.message,
    });
  }
});

// GET /routing/usage/:userId/:tier - Usage stats
app.get('/routing/usage/:userId/:tier', (req, res) => {
  const { userId, tier } = req.params;
  const costs = router.costTracker.getUserCost(userId, tier);
  const usage = router.costTracker.getUsageStats(userId, tier);
  res.json({ userId, tier, ...costs, ...usage });
});

// Error handler
app.use((err, _req, res, _next) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Routing service listening on port ${PORT}`);
});

module.exports = app;