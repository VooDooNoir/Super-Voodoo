// Rate limiter for tier-based request limiting
const userRequests = new Map();

/**
 * Check if user has exceeded their rate limit
 * @param {string} userId
 * @param {string} tier
 * @param {number} maxPerMinute
 * @returns {{ allowed: boolean, retryAfter?: number, remaining: number }}
 */
function checkRateLimit(userId, tier, maxPerMinute) {
  const windowMs = 60000; // 1 minute
  const now = Date.now();
  const key = `${userId}:${tier}`;

  if (!userRequests.has(key)) {
    userRequests.set(key, []);
  }

  const timestamps = userRequests.get(key);
  // Remove timestamps older than the window
  const valid = timestamps.filter(t => now - t < windowMs);
  userRequests.set(key, valid);

  const remaining = Math.max(0, maxPerMinute - valid.length);

  if (valid.length >= maxPerMinute) {
    const oldestInWindow = valid[0];
    const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);
    return { allowed: false, retryAfter, remaining: 0 };
  }

  userRequests.get(key).push(now);
  return { allowed: true, remaining };
}

/**
 * Reset rate limit for a user (for testing)
 */
function resetRateLimit(userId) {
  // Remove all entries for this user
  for (const key of userRequests.keys()) {
    if (key.startsWith(`${userId}:`)) {
      userRequests.delete(key);
    }
  }
}

module.exports = { checkRateLimit, resetRateLimit };