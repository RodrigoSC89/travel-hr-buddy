/**
 * Content Security Policy Configuration
 * PATCH: QUALITY-10/10 - Security headers
 */

/**
 * CSP directives for the application
 * Should be implemented at the server/edge level
 */
export const CSP_DIRECTIVES = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Required for React
    "'unsafe-eval'", // Required for development
    "https://ai.gateway.lovable.dev",
    "https://*.supabase.co",
  ],
  "style-src": [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind
    "https://fonts.googleapis.com",
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://*.supabase.co",
    "https://*.unsplash.com",
  ],
  "font-src": ["'self'", "https://fonts.gstatic.com"],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://ai.gateway.lovable.dev",
    "https://api.openai.com",
  ],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}

/**
 * Security headers for the application
 */
export const SECURITY_HEADERS = {
  "Content-Security-Policy": generateCSPHeader(),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=(self)",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

/**
 * Validate current page security
 */
export function validatePageSecurity(): {
  isSecure: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check HTTPS
  if (
    typeof window !== "undefined" &&
    window.location.protocol !== "https:" &&
    window.location.hostname !== "localhost"
  ) {
    issues.push("Conexão não segura (HTTP)");
  }

  // Check for mixed content
  if (typeof document !== "undefined") {
    const scripts = document.querySelectorAll('script[src^="http:"]');
    const styles = document.querySelectorAll('link[href^="http:"]');
    const images = document.querySelectorAll('img[src^="http:"]');

    if (scripts.length > 0) {
      issues.push(`${scripts.length} scripts carregados via HTTP`);
    }
    if (styles.length > 0) {
      issues.push(`${styles.length} estilos carregados via HTTP`);
    }
    if (images.length > 0) {
      issues.push(`${images.length} imagens carregadas via HTTP`);
    }
  }

  return {
    isSecure: issues.length === 0,
    issues,
  };
}

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Sanitize HTML to prevent XSS
   */
  html(input: string): string {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  },

  /**
   * Sanitize SQL-like input
   */
  sql(input: string): string {
    return input.replace(/['";\-\-]/g, "");
  },

  /**
   * Validate and sanitize email
   */
  email(input: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmed = input.trim().toLowerCase();
    return emailRegex.test(trimmed) ? trimmed : null;
  },

  /**
   * Sanitize file name
   */
  fileName(input: string): string {
    return input.replace(/[^a-zA-Z0-9._-]/g, "_");
  },

  /**
   * Validate URL
   */
  url(input: string): string | null {
    try {
      const url = new URL(input);
      if (["http:", "https:"].includes(url.protocol)) {
        return url.toString();
      }
      return null;
    } catch {
      return null;
    }
  },
};

/**
 * Rate limiting for client-side operations
 */
export class ClientRateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  getRemainingRequests(): number {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    return Math.max(0, this.maxRequests - this.timestamps.length);
  }

  getResetTime(): number {
    if (this.timestamps.length === 0) return 0;
    const oldest = Math.min(...this.timestamps);
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }
}
