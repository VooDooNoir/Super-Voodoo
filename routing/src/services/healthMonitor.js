// Health monitor: tracks model availability and latency
const NodeCache = require('node-cache');
const config = require('../config');

const healthCache = new NodeCache({ stdTTL: config.healthCheckInterval || 60 });

/**
 * Record a successful request to a model
 */
function recordSuccess(modelId, latency) {
  const existing = healthCache.get(modelId) || { status: 'down', failures: 0, lastSuccess: null };
  healthCache.set(modelId, {
    status: 'healthy',
    failures: 0,
    latency,
    lastSuccess: Date.now(),
    totalRequests: (existing.totalRequests || 0) + 1,
  });
}

/**
 * Record a failure for a model
 */
function recordFailure(modelId) {
  const existing = healthCache.get(modelId) || { status: 'healthy', failures: 0, totalRequests: 0 };
  const failures = existing.failures + 1;

  let status = 'healthy';
  if (failures >= 3) status = 'degraded';
  if (failures >= 5) status = 'down';

  healthCache.set(modelId, {
    ...existing,
    status,
    failures,
  });
}

/**
 * Get health status for a specific model
 */
function getModelStatus(modelId) {
  return healthCache.get(modelId) || { status: 'unknown', failures: 0 };
}

/**
 * Get health status for all known models
 */
function getHealthStatus() {
  const status = {};
  const allModels = Object.values(config.tiers).flatMap(t => t.models);
  for (const m of allModels) {
    status[m.id] = getModelStatus(m.id);
  }
  return status;
}

module.exports = { recordSuccess, recordFailure, getModelStatus, getHealthStatus };