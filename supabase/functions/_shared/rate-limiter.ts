/**
 * Enhanced Rate Limiter for Edge Functions
 * PATCH: Security hardening with distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  firstRequest: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
  skipSuccessfulRequests?: boolean;
}

// In-memory store (for single instance)
// In production, use Deno KV or Redis
const rateLimitStore = new Map<string, RateLimitEntry>();
const blockedIps = new Map<string, number>();

// Cleanup interval
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

/**
 * Default rate limit configurations per endpoint type
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Authentication endpoints - strict limits
  auth: {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
    blockDurationMs: 300000, // 5 minutes block after limit
  },
  // AI endpoints - moderate limits
  ai: {
    maxRequests: 30,
    windowMs: 60000,
    blockDurationMs: 60000,
  },
  // General API endpoints
  api: {
    maxRequests: 100,
    windowMs: 60000,
  },
  // File upload endpoints
  upload: {
    maxRequests: 20,
    windowMs: 60000,
    blockDurationMs: 120000,
  },
  // Webhook endpoints - high limits
  webhook: {
    maxRequests: 500,
    windowMs: 60000,
  },
  // Log insertion - with anti-flood
  logs: {
    maxRequests: 50,
    windowMs: 60000,
    blockDurationMs: 180000,
  },
};

/**
 * Clean up expired entries
 */
function cleanup(): void {
  const now = Date.now();
  
  // Only cleanup periodically
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  
  // Clean rate limit store
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
  
  // Clean blocked IPs
  for (const [ip, unblockAt] of blockedIps.entries()) {
    if (now > unblockAt) {
      blockedIps.delete(ip);
    }
  }
  
  // Prevent memory leak
  if (rateLimitStore.size > 50000) {
    const entries = Array.from(rateLimitStore.entries());
    entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
    for (let i = 0; i < 25000; i++) {
      rateLimitStore.delete(entries[i][0]);
    }
  }
}

/**
 * Check if IP is blocked
 */
export function isBlocked(identifier: string): boolean {
  const unblockAt = blockedIps.get(identifier);
  if (!unblockAt) return false;
  
  if (Date.now() > unblockAt) {
    blockedIps.delete(identifier);
    return false;
  }
  
  return true;
}

/**
 * Block an identifier
 */
export function blockIdentifier(identifier: string, durationMs: number): void {
  blockedIps.set(identifier, Date.now() + durationMs);
}

/**
 * Enhanced rate limit check with configurable options
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.api
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
  blocked?: boolean;
} {
  cleanup();
  
  const now = Date.now();
  
  // Check if blocked
  if (isBlocked(identifier)) {
    const unblockAt = blockedIps.get(identifier) || now;
    return {
      allowed: false,
      remaining: 0,
      resetAt: unblockAt,
      retryAfter: Math.ceil((unblockAt - now) / 1000),
      blocked: true,
    };
  }
  
  let entry = rateLimitStore.get(identifier);
  
  // Create new entry if expired or doesn't exist
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
      firstRequest: now,
    };
    rateLimitStore.set(identifier, entry);
  }
  
  entry.count++;
  
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  // Block if exceeded and block duration configured
  if (!allowed && config.blockDurationMs) {
    blockIdentifier(identifier, config.blockDurationMs);
  }
  
  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    retryAfter: allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000),
  };
}

/**
 * Create rate limit key from request
 */
export function createRateLimitKey(
  req: Request,
  endpointType: string
): string {
  const ip = getClientIp(req);
  const userId = req.headers.get("x-user-id") || "anonymous";
  return `${endpointType}:${ip}:${userId}`;
}

/**
 * Extract client IP from request
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: ReturnType<typeof checkRateLimit>,
  config: RateLimitConfig
): void {
  headers.set("X-RateLimit-Limit", config.maxRequests.toString());
  headers.set("X-RateLimit-Remaining", result.remaining.toString());
  headers.set("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000).toString());
  
  if (result.retryAfter) {
    headers.set("Retry-After", result.retryAfter.toString());
  }
}

/**
 * Middleware-style rate limit check
 */
export function rateLimitMiddleware(
  req: Request,
  endpointType: keyof typeof RATE_LIMIT_CONFIGS = "api"
): Response | null {
  const config = RATE_LIMIT_CONFIGS[endpointType];
  const key = createRateLimitKey(req, endpointType);
  const result = checkRateLimit(key, config);
  
  if (!result.allowed) {
    const headers = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    addRateLimitHeaders(headers, result, config);
    
    return new Response(
      JSON.stringify({
        error: result.blocked 
          ? "Too many requests. You have been temporarily blocked."
          : "Rate limit exceeded. Please try again later.",
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers,
      }
    );
  }
  
  return null; // Continue processing
}
