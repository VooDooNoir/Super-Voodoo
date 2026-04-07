// Phase 4: OpenRouter Multi-Model Routing Service
// Routes chat requests to appropriate model based on user tier
// Implements fallback chain, retry logic, and cost tracking
const config = require('./config');
const healthMonitor = require('./services/healthMonitor');
const costTracker = require('./services/costTracker');
const logger = require('./controllers/logger');

/**
 * Select the best available model for a given tier
 * Considers health status, cost limits, and priority
 */
async function selectModel(tier, userId, tierConfig) {
  const models = tierConfig.models;
  const health = healthMonitor.getHealthStatus();
  const cost = costTracker.getUserCost(userId, tier);

  // Check cost limit
  const limit = config.costLimits[tier];
  if (cost.hourly >= limit.maxHourlyCost) {
    throw new Error('Hourly cost limit exceeded. Please try again later.');
  }

  // Iterate through models by priority
  for (const model of models) {
    const modelHealth = health[model.id];
    if (!modelHealth || modelHealth.status === 'down') {
      logger.warn('Model down, skipping', { modelId: model.id });
      continue;
    }

    // Check per-request cost against model limit
    const estimatedCost = estimateMaxCost(model, config.tiers[tier].maxTokens);
    if (estimatedCost > model.maxCostPer1k && model.maxCostPer1k > 0) {
      logger.warn('Model exceeds cost constraints', { modelId: model.id });
      continue;
    }

    return model;
  }

  throw new Error(`No available models for tier "${tier}". All models down or over budget.`);
}

function estimateMaxCost(model, maxTokens) {
  // Estimate worst-case cost: 1K input + maxTokens output
  // We don't have exact pricing here, but this is a rough guard
  return (maxTokens / 1000) * 0.1; // placeholder
}

/**
 * Send a chat completion to OpenRouter with fallback
 * @param {Object} params
 * @param {string} params.tier - User tier (free, standard, premium)
 * @param {string} params.userId - Unique user identifier
 * @param {Array} params.messages - Chat messages array
 * @param {string} [params.system] - System prompt override
 * @param {number} [params.maxTokens] - Override max tokens
 * @returns {Object} OpenRouter response
 */
async function routeChat({ tier, userId, messages, system, maxTokens }) {
  const tierKey = tier || 'free';
  const tierConfig = config.tiers[tierKey];
  if (!tierConfig) {
    throw new Error(`Unknown tier: ${tierKey}. Valid tiers: ${Object.keys(config.tiers).join(', ')}`);
  }

  const selectedModel = await selectModel(tierKey, userId, tierConfig);
  logger.info('Routing chat', { tier: tierKey, model: selectedModel.id, userId });

  const systemPrompt = system || `You are a helpful assistant operating at the ${tierConfig.label} tier. Provide accurate, concise responses.`;

  const requestBody = {
    model: selectedModel.id,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: maxTokens || tierConfig.maxTokens,
    headers: {
      'X-HTTP-Referer': config.openrouter.siteUrl,
      'X-Title': config.openrouter.siteName,
    },
  };

  // Attempt the request with fallback chain
  let lastError;
  let attempts = 0;

  for (const model of tierConfig.models) {
    if (attempts >= config.fallbackRetryCount) break;
    if (healthMonitor.getModelStatus(model.id) === 'down') continue;

    attempts++;
    requestBody.model = model.id;

    try {
      const response = await openrouterRequest('/chat/completions', requestBody);

      // Track cost
      if (response.usage) {
        const { prompt_tokens, completion_tokens } = response.usage;
        const cost = calculateCost(selectedModel, prompt_tokens, completion_tokens);
        costTracker.recordUsage(userId, tierKey, model.id, cost);
      }

      logger.info('Chat completed', {
        attempts,
        model: selectedModel.id,
        usage: response.usage,
        userId,
      });

      return {
        model: selectedModel.id,
        attempts,
        ...response,
      };
    } catch (err) {
      lastError = err;
      logger.warn('Model request failed, trying fallback', {
        modelId: model.id,
        error: err.message,
        attempt: attempts,
      });
      healthMonitor.recordFailure(model.id);
    }
  }

  throw new Error(`All model attempts failed. Last error: ${lastError?.message}`);
}

/**
 * Make a request to the OpenRouter API
 */
async function openrouterRequest(endpoint, body) {
  const url = `${config.openrouter.baseUrl}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openrouter.apiKey}`,
      'Content-Type': 'application/json',
      ...body.headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Calculate cost based on token usage
 */
function calculateCost(model, promptTokens, completionTokens) {
  // Simplified: assumes $0.0001/input token and $0.0003/output token as placeholder
  // In production, use actual model pricing from OpenRouter
  return ((promptTokens || 0) * 0.0001 + (completionTokens || 0) * 0.0003);
}

/**
 * Get available models for a tier
 */
function getModelsForTier(tier) {
  const tierConfig = config.tiers[tier];
  if (!tierConfig) return { error: `Unknown tier: ${tier}` };

  const health = healthMonitor.getHealthStatus();
  return {
    tier,
    label: tierConfig.label,
    maxTokens: tierConfig.maxTokens,
    rateLimitPerMinute: tierConfig.rateLimitPerMinute,
    models: tierConfig.models.map(m => ({
      ...m,
      status: health[m.id]?.status || 'unknown',
      latency: health[m.id]?.latency || null,
    })),
  };
}

module.exports = {
  routeChat,
  getModelsForTier,
  selectModel,
  healthMonitor,
  costTracker,
};