// Cost tracker: manages per-user, per-tier cost tracking
const NodeCache = require('node-cache');

// Hourly cache (TTL: 1 hour)
const hourlyCache = new NodeCache({ stdTTL: 3600 });
// Daily cache (TTL: 24 hours)
const dailyCache = new NodeCache({ stdTTL: 86400 });

/**
 * Generate cache key for user-tier-hourly
 */
function hourlyKey(userId, tier) {
  return `hourly:${userId}:${tier}`;
}

function dailyKey(userId, tier) {
  return `daily:${userId}:${tier}`;
}

/**
 * Record usage cost for a user in a tier
 */
function recordUsage(userId, tier, modelId, cost) {
  // Hourly tracking
  const hourlyEntry = hourlyCache.get(hourlyKey(userId, tier)) || { cost: 0, requests: 0, models: {} };
  hourlyEntry.cost += cost;
  hourlyEntry.requests += 1;
  hourlyEntry.models[modelId] = (hourlyEntry.models[modelId] || 0) + cost;
  hourlyCache.set(hourlyKey(userId, tier), hourlyEntry);

  // Daily tracking
  const dailyEntry = dailyCache.get(dailyKey(userId, tier)) || { cost: 0, requests: 0, models: {} };
  dailyEntry.cost += cost;
  dailyEntry.requests += 1;
  dailyEntry.models[modelId] = (dailyEntry.models[modelId] || 0) + cost;
  dailyCache.set(dailyKey(userId, tier), dailyEntry);
}

/**
 * Get cumulative cost for a user in a tier
 * @returns {{ hourly: number, daily: number, hourlyRequests: number, dailyRequests: number }}
 */
function getUserCost(userId, tier) {
  const hourly = hourlyCache.get(hourlyKey(userId, tier)) || { cost: 0, requests: 0 };
  const daily = dailyCache.get(dailyKey(userId, tier)) || { cost: 0, requests: 0 };
  return {
    hourly: hourly.cost,
    daily: daily.cost,
    hourlyRequests: hourly.requests,
    dailyRequests: daily.requests,
  };
}

/**
 * Get cost usage stats
 */
function getUsageStats(userId, tier) {
  return {
    hourly: hourlyCache.get(hourlyKey(userId, tier)) || { cost: 0, requests: 0, models: {} },
    daily: dailyCache.get(dailyKey(userId, tier)) || { cost: 0, requests: 0, models: {} },
  };
}

/**
 * Reset cost tracking for a user (for testing/admin)
 */
function resetUserCost(userId, tier) {
  hourlyCache.del(hourlyKey(userId, tier));
  dailyCache.del(dailyKey(userId, tier));
}

module.exports = { recordUsage, getUserCost, getUsageStats, resetUserCost };