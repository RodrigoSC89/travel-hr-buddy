/**
 * PATCH 800: Input Validation & Sanitization
 * Security utilities for input validation
 */

import { z } from "zod";

/**
 * Common validation schemas
 */
export const validationSchemas = {
  email: z.string().email("Email inválido").max(255),
  
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(128)
    .regex(/[a-z]/, "Deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter pelo menos um número"),
  
  name: z.string()
    .min(2, "Nome muito curto")
    .max(100)
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contém caracteres inválidos"),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Telefone inválido"),
  
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF inválido"),
  
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ inválido"),
  
  uuid: z.string().uuid("ID inválido"),
  
  url: z.string().url("URL inválida"),
  
  text: z.string().max(10000),
  
  positiveNumber: z.number().positive("Deve ser um número positivo"),
  
  dateString: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)"),
};

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>"'`]/g, "") // Remove special characters
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === "string" ? sanitizeString(item) : 
        typeof item === "object" ? sanitizeObject(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

/**
 * Validate and sanitize input
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => e.message) 
      };
    }
    return { success: false, errors: ["Erro de validação desconhecido"] };
  }
}

/**
 * Check for SQL injection patterns
 */
export function hasSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/i,
    /(\b(UNION|JOIN|WHERE|FROM|INTO)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)/i,
    /(--|\/\*|\*\/|;|'|\"|\\)/,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for XSS patterns
 */
export function hasXSSPatterns(input: string): boolean {
  const xssPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Rate limiting check (client-side - for UX, not security)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(key);
  
  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (limit.count >= maxRequests) {
    return false;
  }
  
  limit.count++;
  return true;
}
