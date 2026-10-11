// Simple in-memory rate limiter for API routes
// For production, use Redis-based rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateStore.entries()) {
    if (now > entry.resetTime) {
      rateStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(
  identifier: string,
  {
    maxRequests = 20,
    windowMs = 60 * 1000,
  }: { maxRequests?: number; windowMs?: number } = {}
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}
