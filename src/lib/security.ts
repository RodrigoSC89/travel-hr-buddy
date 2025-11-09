/**
 * Security Configuration and Middleware
 * Implements comprehensive security measures for Nautilus One
 */

// ============================================
// Security Headers Configuration
// ============================================
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.starfix.maritime.org https://api.terrastar.hexagon.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': [
    'geolocation=(self)',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
  ].join(', '),
  
  // Strict Transport Security (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// ============================================
// Rate Limiting Configuration
// ============================================
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many API requests. Please try again later.',
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again later.',
  },
  
  // AI/LLM endpoints (more expensive)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many AI requests. Please slow down.',
  },
  
  // File upload endpoints
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many file uploads. Please try again later.',
  },
};

// ============================================
// Input Validation Rules
// ============================================
export const VALIDATION_RULES = {
  // String lengths
  maxStringLength: 10000,
  maxEmailLength: 255,
  maxNameLength: 100,
  maxDescriptionLength: 5000,
  
  // File upload
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ],
  
  // Password requirements
  minPasswordLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

// ============================================
// Input Sanitization
// ============================================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize HTML input
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';
  
  // List of allowed tags
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'li', 'ul', 'ol'];
  
  // Remove all tags except allowed ones
  let sanitized = input;
  const tagPattern = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  
  sanitized = sanitized.replace(tagPattern, (match, tag) => {
    return allowedTags.includes(tag.toLowerCase()) ? match : '';
  });
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= VALIDATION_RULES.maxEmailLength;
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < VALIDATION_RULES.minPasswordLength) {
    errors.push(`Password must be at least ${VALIDATION_RULES.minPasswordLength} characters`);
  }
  
  if (VALIDATION_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (VALIDATION_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (VALIDATION_RULES.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (VALIDATION_RULES.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize SQL input (basic protection, use parameterized queries!)
 */
export function sanitizeSQL(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multiline comment start
    .replace(/\*\//g, '') // Remove multiline comment end
    .trim();
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > VALIDATION_RULES.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds ${VALIDATION_RULES.maxFileSize / (1024 * 1024)}MB limit`,
    };
  }
  
  // Check file type
  if (!VALIDATION_RULES.allowedFileTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed',
    };
  }
  
  return { valid: true };
}

// ============================================
// CORS Configuration
// ============================================
export const CORS_CONFIG = {
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://nautilus-one.com',
    'https://*.nautilus-one.com',
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Client-Info',
    'apikey',
    'X-Request-ID',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Validate CORS origin
 */
export function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  
  return CORS_CONFIG.allowedOrigins.some(allowed => {
    if (allowed.includes('*')) {
      const regex = new RegExp(allowed.replace('*', '.*'));
      return regex.test(origin);
    }
    return allowed === origin;
  });
}

// ============================================
// Security Audit Logging
// ============================================
export interface SecurityEvent {
  type: 'AUTH_ATTEMPT' | 'AUTH_SUCCESS' | 'AUTH_FAILURE' | 'RATE_LIMIT' | 'VALIDATION_ERROR' | 'SQL_INJECTION_ATTEMPT' | 'XSS_ATTEMPT';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address?: string;
  details: Record<string, any>;
  timestamp: string;
}

/**
 * Log security event
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    // In production, send to your logging service (Sentry, Datadog, etc.)
    console.log('[SECURITY]', JSON.stringify(event, null, 2));
    
    // Store in database for audit trail
    // await supabase.from('security_audit_logs').insert(event);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// ============================================
// API Key Management
// ============================================

/**
 * Validate API key format
 */
export function isValidAPIKey(key: string): boolean {
  // API keys should be at least 32 characters
  return typeof key === 'string' && key.length >= 32;
}

/**
 * Hash API key for storage (use bcrypt in production)
 */
export async function hashAPIKey(key: string): Promise<string> {
  // In production, use bcrypt or similar
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate secure random API key
 */
export function generateAPIKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ============================================
// Session Security
// ============================================
export const SESSION_CONFIG = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  refreshThreshold: 15 * 60 * 1000, // Refresh if < 15 min remaining
  absoluteTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days absolute max
  requireMFA: false, // Set to true to enforce MFA
};

/**
 * Check if session should be refreshed
 */
export function shouldRefreshSession(expiresAt: number): boolean {
  const timeRemaining = expiresAt - Date.now();
  return timeRemaining < SESSION_CONFIG.refreshThreshold;
}

/**
 * Validate session age
 */
export function isSessionExpired(createdAt: number, expiresAt: number): boolean {
  const now = Date.now();
  const age = now - createdAt;
  
  // Check if expired
  if (now > expiresAt) return true;
  
  // Check absolute timeout
  if (age > SESSION_CONFIG.absoluteTimeout) return true;
  
  return false;
}
