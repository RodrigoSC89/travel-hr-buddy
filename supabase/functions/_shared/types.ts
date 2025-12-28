/**
 * Shared Types for Supabase Edge Functions
 * Provides type definitions for Deno runtime
 */

// Deno global types for VS Code compatibility
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

/**
 * Base request structure for edge functions
 */
export interface BaseRequest {
  method: string;
  headers: Record<string, string>;
  body?: unknown;
}

/**
 * Base response structure for all edge functions
 * Provides consistent error handling and metadata
 */
export interface BaseResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

/**
 * Custom error class for edge functions
 * Provides structured error handling with status codes
 */
export class EdgeFunctionError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(
    code: string,
    message: string,
    statusCode: number = 400,
    details?: unknown
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Helper function to create standardized responses
 * @param data - Response data (optional)
 * @param error - EdgeFunctionError (optional)
 * @param requestId - Request tracking ID (optional)
 * @returns Response object with proper headers
 */
export function createResponse<T>(
  data?: T,
  error?: EdgeFunctionError,
  requestId?: string
): Response {
  const body: BaseResponse<T> = {
    success: !error,
    data,
    error: error ? {
      code: error.code,
      message: error.message,
      details: error.details
    } : undefined,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '3.2',
      requestId
    }
  };
  
  return new Response(JSON.stringify(body), {
    status: error?.statusCode || 200,
    headers: { 
      'Content-Type': 'application/json',
      'X-Request-ID': requestId || crypto.randomUUID()
    }
  });
}

/**
 * CORS headers for edge functions
 */
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

/**
 * Handle OPTIONS preflight requests
 */
export function handleCORS(): Response {
  return new Response('ok', { headers: corsHeaders });
}

/**
 * Validate environment variable exists
 * @param key - Environment variable key
 * @param defaultValue - Optional default value
 * @throws EdgeFunctionError if variable is missing and no default provided
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = Deno.env.get(key);
  if (!value && !defaultValue) {
    throw new EdgeFunctionError(
      'ENV_VAR_MISSING',
      `Environment variable ${key} is not configured`,
      500
    );
  }
  return value || defaultValue!;
}

/**
 * Safe JSON parsing with error handling
 * @param text - JSON string to parse
 * @returns Parsed object or throws EdgeFunctionError
 */
export function safeJSONParse<T = unknown>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new EdgeFunctionError(
      'INVALID_JSON',
      'Failed to parse JSON response',
      400,
      { originalError: errorMessage }
    );
  }
}

/**
 * Validate request body against schema
 * @param body - Request body to validate
 * @param requiredFields - Array of required field names
 * @throws EdgeFunctionError if validation fails
 */
export function validateRequestBody(
  body: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => !(field in body));
  
  if (missingFields.length > 0) {
    throw new EdgeFunctionError(
      'VALIDATION_ERROR',
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      { missingFields }
    );
  }
}

/**
 * Rate limiting helper
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * Log function for edge functions
 */
export function log(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: unknown
): void {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data
  };
  
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

/**
 * Supabase client creation helper types
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

/**
 * Common API response types
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}
