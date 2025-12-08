/**
 * UNIFIED Validation Schemas
 * 
 * Unifica:
 * - src/lib/validation/schemas.ts (loginSchema)
 * - src/lib/validation/form-validation.ts (loginSchema, signupSchema, profileSchema)
 * - src/lib/security/input-validation.ts
 * - src/lib/security/input-validator.ts
 * 
 * Centraliza todos os schemas de validação e funções de validação.
 */

import { z } from "zod";

// ==================== BASE SCHEMAS ====================

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, "Email é obrigatório")
  .email("Email inválido")
  .max(255, "Email muito longo");

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .max(128, "Senha muito longa")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número");

/**
 * Simple password (less restrictive)
 */
export const simplePasswordSchema = z
  .string()
  .min(6, "Senha deve ter no mínimo 6 caracteres")
  .max(128, "Senha muito longa");

/**
 * CPF validation schema
 */
export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF inválido")
  .refine(validateCPF, "CPF inválido");

/**
 * CNPJ validation schema
 */
export const cnpjSchema = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ inválido")
  .refine(validateCNPJ, "CNPJ inválido");

/**
 * Phone validation schema (Brazilian format)
 */
export const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$|^\d{10,11}$/, "Telefone inválido");

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(2, "Nome deve ter no mínimo 2 caracteres")
  .max(100, "Nome muito longo")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nome contém caracteres inválidos");

/**
 * URL validation schema
 */
export const urlSchema = z
  .string()
  .url("URL inválida")
  .or(z.literal(""));

// ==================== FORM SCHEMAS ====================

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

/**
 * Signup form schema
 */
export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

/**
 * Profile form schema
 */
export const profileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional().or(z.literal("")),
  bio: z.string().max(500, "Bio muito longa").optional(),
  avatar_url: urlSchema.optional(),
  company: z.string().max(100, "Nome da empresa muito longo").optional(),
  position: z.string().max(100, "Cargo muito longo").optional(),
});

/**
 * Password change schema
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// ==================== MARITIME/NAUTICAL SCHEMAS ====================

/**
 * Vessel registration schema
 */
export const vesselSchema = z.object({
  name: z.string().min(2, "Nome do navio é obrigatório").max(100),
  imo_number: z.string().regex(/^IMO\d{7}$/, "Número IMO inválido").optional(),
  mmsi: z.string().regex(/^\d{9}$/, "MMSI deve ter 9 dígitos").optional(),
  flag: z.string().min(2, "Bandeira é obrigatória"),
  type: z.string().min(1, "Tipo de embarcação é obrigatório"),
  gross_tonnage: z.number().positive("Arqueação bruta deve ser positiva").optional(),
  length: z.number().positive("Comprimento deve ser positivo").optional(),
  beam: z.number().positive("Boca deve ser positiva").optional(),
});

/**
 * Crew member schema
 */
export const crewMemberSchema = z.object({
  name: nameSchema,
  rank: z.string().min(1, "Cargo é obrigatório"),
  nationality: z.string().min(2, "Nacionalidade é obrigatória"),
  document_number: z.string().min(1, "Número do documento é obrigatório"),
  document_type: z.string().min(1, "Tipo do documento é obrigatório"),
  date_of_birth: z.string().min(1, "Data de nascimento é obrigatória"),
  seaman_book_number: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: phoneSchema.optional(),
});

/**
 * Certificate schema
 */
export const certificateSchema = z.object({
  name: z.string().min(2, "Nome do certificado é obrigatório"),
  number: z.string().min(1, "Número do certificado é obrigatório"),
  issuing_authority: z.string().min(2, "Autoridade emissora é obrigatória"),
  issue_date: z.string().min(1, "Data de emissão é obrigatória"),
  expiry_date: z.string().min(1, "Data de validade é obrigatória"),
  type: z.string().min(1, "Tipo de certificado é obrigatório"),
});

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate CPF (Brazilian individual taxpayer ID)
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

/**
 * Validate CNPJ (Brazilian company taxpayer ID)
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, "");
  
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned.charAt(12))) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleaned.charAt(13))) return false;

  return true;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const result = emailSchema.safeParse(email);
  return result.success;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const result = passwordSchema.safeParse(password);
  
  if (result.success) {
    return { valid: true, errors: [] };
  }

  return {
    valid: false,
    errors: result.error.errors.map(e => e.message),
  };
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): boolean {
  const result = phoneSchema.safeParse(phone);
  return result.success;
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize string for SQL (basic)
 */
export function sanitizeString(str: string): string {
  return str.replace(/['";]/g, "");
}

/**
 * Validate input against a schema
 */
export function validateInput<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`),
  };
}

// ==================== VALIDATION PATTERNS (for direct use) ====================

export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\(\d{2}\)\s?\d{4,5}-?\d{4}$|^\d{10,11}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/,
  imo: /^IMO\d{7}$/,
  mmsi: /^\d{9}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  url: /^https?:\/\/.+/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^\d{2}:\d{2}(:\d{2})?$/,
};

// ==================== TYPE EXPORTS ====================

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type VesselFormData = z.infer<typeof vesselSchema>;
export type CrewMemberFormData = z.infer<typeof crewMemberSchema>;
export type CertificateFormData = z.infer<typeof certificateSchema>;
