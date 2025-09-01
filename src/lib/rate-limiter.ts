// Rate limiting utility for client-side protection
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests = new Map<string, RequestRecord>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (record.count >= this.config.maxRequests) {
      return false; // Rate limit exceeded
    }

    record.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record || Date.now() > record.resetTime) {
      return this.config.maxRequests;
    }
    return Math.max(0, this.config.maxRequests - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    return record?.resetTime || Date.now();
  }
}

// Create rate limiters for different endpoints
export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 requests
  windowMs: 5 * 60 * 1000, // per 5 minutes
});

export const generalRateLimiter = new RateLimiter({
  maxRequests: 60, // 60 requests
  windowMs: 60 * 1000, // per minute
});

export function checkRateLimit(
  endpoint: string,
  userIdentifier?: string
): boolean {
  const identifier = userIdentifier || "anonymous";

  if (endpoint.includes("/auth/")) {
    return authRateLimiter.checkLimit(identifier);
  }

  return generalRateLimiter.checkLimit(identifier);
}
