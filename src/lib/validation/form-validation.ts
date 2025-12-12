/**
 * Form Validation Utilities - PATCH 750
 * Comprehensive validation for all form inputs
 */

import { z } from "zod";

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, "Email é obrigatório")
  .email("Email inválido")
  .max(255, "Email muito longo");

export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .max(128, "Senha muito longa")
  .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter ao menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter ao menos um caractere especial");

export const phoneSchema = z
  .string()
  .min(10, "Telefone inválido")
  .max(20, "Telefone inválido")
  .regex(/^[\d\s\-\(\)\+]+$/, "Telefone contém caracteres inválidos");

export const cpfSchema = z
  .string()
  .length(11, "CPF deve ter 11 dígitos")
  .regex(/^\d{11}$/, "CPF deve conter apenas números")
  .refine(validateCPF, "CPF inválido");

export const cnpjSchema = z
  .string()
  .length(14, "CNPJ deve ter 14 dígitos")
  .regex(/^\d{14}$/, "CNPJ deve conter apenas números")
  .refine(validateCNPJ, "CNPJ inválido");

export const dateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), "Data inválida");

export const futureDateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), "Data inválida")
  .refine((date) => new Date(date) > new Date(), "Data deve ser no futuro");

export const pastDateSchema = z
  .string()
  .refine((date) => !isNaN(Date.parse(date)), "Data inválida")
  .refine((date) => new Date(date) < new Date(), "Data deve ser no passado");

export const urlSchema = z
  .string()
  .url("URL inválida")
  .max(2048, "URL muito longa");

export const uuidSchema = z
  .string()
  .uuid("ID inválido");

// Validation functions
function validateCPF(cpf: string): boolean {
  if (cpf.length !== 11) return false;
  
  // Check for known invalid CPFs
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // First digit validation
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  // Second digit validation
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

function validateCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;
  
  // Check for known invalid CNPJs
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // First digit validation
  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Second digit validation
  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
}

export function sanitizeHtml(html: string): string {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

// Format helpers
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, "");
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

export function formatCurrency(value: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency
  }).format(value);
}

export function formatDate(date: Date | string, format: "short" | "long" | "full" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  const formats: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    long: { day: "2-digit", month: "long", year: "numeric" },
    full: { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
  };
  
  return new Intl.DateTimeFormat("pt-BR", formats[format]).format(d);
}

// Common form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória")
});

export const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo"),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

export const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100, "Nome muito longo"),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  bio: z.string().max(500, "Bio muito longa").optional()
});

export const contactSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: emailSchema,
  subject: z.string().min(5, "Assunto é obrigatório"),
  message: z.string().min(10, "Mensagem deve ter no mínimo 10 caracteres").max(2000, "Mensagem muito longa")
});
