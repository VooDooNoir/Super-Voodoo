// Phase 4: OpenRouter Multi-Model Routing Configuration
// Tier-aware model deployment with fallback, retry, and cost optimization

module.exports = {
  port: process.env.PORT || 3002,

  openrouter: {
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    siteUrl: process.env.OPENROUTER_SITE_URL || '',
    siteName: process.env.OPENROUTER_SITE_NAME || 'Print Store Agent',
  },

  // Tier configuration maps subscription/user tiers to model endpoints
  // Each tier has a primary model and ordered fallbacks
  tiers: {
    free: {
      label: 'Free',
      models: [
        { id: 'nousresearch/hermes-3-llama-3.1-8b:free', priority: 1, maxCostPer1k: 0 },
        { id: 'meta-llama/llama-3-8b-instruct:free', priority: 2, maxCostPer1k: 0 },
        { id: 'mistralai/mistral-7b-instruct:free', priority: 3, maxCostPer1k: 0 },
      ],
      maxTokens: 4096,
      rateLimitPerMinute: 10,
    },
    standard: {
      label: 'Standard',
      models: [
        { id: 'nousresearch/hermes-3-llama-3.1-70b', priority: 1, maxCostPer1k: 0.5 },
        { id: 'anthropic/claude-sonnet-3.5', priority: 2, maxCostPer1k: 3.0 },
        { id: 'nousresearch/hermes-3-llama-3.1-405b', priority: 3, maxCostPer1k: 2.0 },
      ],
      maxTokens: 8192,
      rateLimitPerMinute: 30,
    },
    premium: {
      label: 'Premium',
      models: [
        { id: 'nousresearch/hermes-3-llama-3.1-405b', priority: 1, maxCostPer1k: 2.0 },
        { id: 'openai/o1-preview', priority: 2, maxCostPer1k: 15.0 },
        { id: 'google/gemini-2.0-flash-exp:free', priority: 3, maxCostPer1k: 0 },
      ],
      maxTokens: 32768,
      rateLimitPerMinute: 100,
    },
  },

  // Fallback: if primary model fails, try next in order
  fallbackRetryCount: 3,

  // Cost optimization: track spend per user per hour (soft limits)
  costLimits: {
    free: { maxHourlyCost: 0.01, maxDailyCost: 0.10 },
    standard: { maxHourlyCost: 50, maxDailyCost: 500 },
    premium: { maxHourlyCost: 500, maxDailyCost: 5000 },
  },

  // Health check interval (seconds)
  healthCheckInterval: 60,
};