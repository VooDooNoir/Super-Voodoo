// Phase 4 Router Service Tests
const router = require('./src/config/router');
const healthMonitor = require('./src/services/healthMonitor');
const costTracker = require('./src/services/costTracker');

// Mock the modules for testing
jest.mock('./src/services/healthMonitor', () => ({
  getHealthStatus: jest.fn(() => ({
    'nousresearch/hermes-3-llama-3.1-8b:free': { status: 'healthy', failures: 0 },
  })),
  getModelStatus: jest.fn((id) => id.includes('hermes') ? 'healthy' : 'down'),
  recordSuccess: jest.fn(),
  recordFailure: jest.fn(),
}));

jest.mock('./src/services/costTracker', () => ({
  getUserCost: jest.fn(() => ({ hourly: 0, daily: 0 })),
  recordUsage: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Router: getModelsForTier', () => {
  test('returns models for valid tier', () => {
    const result = router.getModelsForTier('free');
    expect(result.tier).toBe('free');
    expect(result.label).toBe('Free');
    expect(result.models).toBeDefined();
    expect(result.models.length).toBeGreaterThan(0);
  });

  test('returns error for invalid tier', () => {
    const result = router.getModelsForTier('nonexistent');
    expect(result.error).toBeDefined();
  });

  test('includes health status in model info', () => {
    const result = router.getModelsForTier('free');
    result.models.forEach(m => {
      expect(m).toHaveProperty('status');
      expect(m).toHaveProperty('priority');
    });
  });
});

describe('Health Monitor', () => {
  test('marks model healthy after success', () => {
    healthMonitor.recordSuccess('test-model', 150);
    expect(healthMonitor.getModelStatus('test-model').status).toBe('healthy');
  });

  test('marks model degraded after 3 failures', () => {
    healthMonitor.recordFailure('test-model-fail');
    healthMonitor.recordFailure('test-model-fail');
    healthMonitor.recordFailure('test-model-fail');
    expect(healthMonitor.getModelStatus('test-model-fail').status).toBe('degraded');
  });

  test('marks model down after 5 failures', () => {
    healthMonitor.recordFailure('test-model-down');
    healthMonitor.recordFailure('test-model-down');
    healthMonitor.recordFailure('test-model-down');
    healthMonitor.recordFailure('test-model-down');
    healthMonitor.recordFailure('test-model-down');
    expect(healthMonitor.getModelStatus('test-model-down').status).toBe('down');
  });
});

describe('Cost Tracker', () => {
  test('tracks per-user cost', () => {
    const userId = 'test-user-1';
    costTracker.recordUsage(userId, 'free', 'model-a', 0.05);
    const cost = costTracker.getUserCost(userId, 'free');
    expect(cost.hourly).toBe(0.05);
    expect(cost.hourlyRequests).toBe(1);
  });

  test('aggregates multiple requests', () => {
    const userId = 'test-user-2';
    costTracker.recordUsage(userId, 'standard', 'model-a', 0.10);
    costTracker.recordUsage(userId, 'standard', 'model-a', 0.15);
    costTracker.recordUsage(userId, 'standard', 'model-b', 0.20);
    const cost = costTracker.getUserCost(userId, 'standard');
    expect(cost.hourly).toBe(0.45);
    expect(cost.hourlyRequests).toBe(3);
  });

  test('tracks costs per model', () => {
    const userId = 'test-user-3';
    costTracker.recordUsage(userId, 'free', 'model-a', 0.05);
    costTracker.recordUsage(userId, 'free', 'model-b', 0.10);
    const usage = costTracker.getUsageStats(userId, 'free');
    expect(usage.hourly.models['model-a']).toBe(0.05);
    expect(usage.hourly.models['model-b']).toBe(0.10);
  });
});
