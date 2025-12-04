/**
 * PATCH: Security Headers for Edge Functions
 * Apply consistent security headers across all edge functions
 */

export const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

/**
 * Creates response headers with security defaults
 */
export function createSecureHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    ...SECURITY_HEADERS,
    ...CORS_HEADERS,
    ...additionalHeaders,
  };
}

/**
 * Creates a secure JSON response
 */
export function secureJsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: createSecureHeaders(),
  });
}

/**
 * Creates a secure error response
 */
export function secureErrorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: createSecureHeaders(),
  });
}

/**
 * Handles CORS preflight requests
 */
export function handleCorsPreFlight(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Rate limit check (basic in-memory, for production use Redis/KV)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    rateLimitStore.set(key, entry);
  }
  
  entry.count++;
  
  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);
  
  // Cleanup old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetAt) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  return { allowed, remaining, resetAt: entry.resetAt };
}

/**
 * Validates request origin
 */
export function validateOrigin(req: Request, allowedOrigins: string[]): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // Allow requests without origin (server-to-server)
  
  if (allowedOrigins.includes('*')) return true;
  
  return allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith(`.${allowed.replace(/^https?:\/\//, '')}`)
  );
}

/**
 * Extracts client IP from request
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
