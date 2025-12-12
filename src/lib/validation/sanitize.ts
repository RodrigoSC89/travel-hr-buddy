/**
 * PATCH: Input Sanitization Utilities
 * Sanitize user inputs to prevent XSS and injection attacks
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Removes HTML tags from a string
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitizes a string for safe URL usage
 */
export function sanitizeForUrl(str: string): string {
  return encodeURIComponent(str.trim());
}

/**
 * Sanitizes a filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9À-ÿ._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 255);
}

/**
 * Sanitizes SQL-like inputs (basic protection, always use parameterized queries)
 */
export function sanitizeSqlInput(str: string): string {
  return str
    .replace(/['";\\]/g, "")
    .replace(/--/g, "")
    .replace(/\/\*/g, "")
    .replace(/\*\//g, "");
}

/**
 * Sanitizes an object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    escapeHtml?: boolean;
    stripHtml?: boolean;
    maxStringLength?: number;
  } = {}
): T {
  const { escapeHtml: shouldEscape = true, stripHtml: shouldStrip = false, maxStringLength = 10000 } = options;

  const sanitize = (value: unknown): unknown => {
    if (typeof value === "string") {
      let result = value.substring(0, maxStringLength);
      if (shouldStrip) {
        result = stripHtml(result);
      }
      if (shouldEscape) {
        result = escapeHtml(result);
      }
      return result.trim();
    }

    if (Array.isArray(value)) {
      return value.map(sanitize);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, sanitize(v)])
      );
    }

    return value;
  };

  return sanitize(obj) as T;
}

/**
 * Validates and sanitizes email
 */
export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed) || trimmed.length > 255) {
    return null;
  }
  return trimmed;
}

/**
 * Validates UUID format
 */
export function isValidUuid(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Rate limiting helper for client-side
 */
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests: number[] = [];

  return {
    canMakeRequest(): boolean {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Remove old requests
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }

      if (requests.length >= maxRequests) {
        return false;
      }

      requests.push(now);
      return true;
    },
    
    getRemainingRequests(): number {
      const now = Date.now();
      const windowStart = now - windowMs;
      const validRequests = requests.filter(r => r >= windowStart);
      return Math.max(0, maxRequests - validRequests.length);
    },
    
    getResetTime(): number {
      if (requests.length === 0) return 0;
      return Math.max(0, requests[0] + windowMs - Date.now());
    }
  };
}
