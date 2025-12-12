/**
 * PATCH: Security Validation Schemas
 * Zod schemas for input validation across the application
 */

import { z } from "zod";

// ============= Auth Schemas =============
export const loginSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email muito longo" }),
  password: z.string()
    .min(8, { message: "Senha deve ter no mínimo 8 caracteres" })
    .max(128, { message: "Senha muito longa" }),
});

export const signupSchema = loginSchema.extend({
  name: z.string()
    .trim()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Nome muito longo" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Nome contém caracteres inválidos" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

// ============= Document Schemas =============
export const documentUploadSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, {
    message: "Arquivo inválido",
  }),
  fileName: z.string()
    .trim()
    .min(1, { message: "Nome do arquivo é obrigatório" })
    .max(255, { message: "Nome muito longo" })
    .regex(/^[a-zA-Z0-9À-ÿ\s._-]+$/, { message: "Nome contém caracteres inválidos" }),
  category: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const documentSearchSchema = z.object({
  query: z.string()
    .trim()
    .max(500, { message: "Busca muito longa" })
    .optional(),
  category: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// ============= Compliance Schemas =============
export const complianceFormSchema = z.object({
  title: z.string()
    .trim()
    .min(3, { message: "Título deve ter no mínimo 3 caracteres" })
    .max(200, { message: "Título muito longo" }),
  description: z.string()
    .trim()
    .max(2000, { message: "Descrição muito longa" })
    .optional(),
  category: z.enum(["ism", "solas", "marpol", "mlc", "stcw", "other"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional(),
});

// ============= HR Schemas =============
export const crewMemberSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Nome muito longo" }),
  email: z.string()
    .trim()
    .email({ message: "Email inválido" })
    .optional(),
  position: z.string()
    .trim()
    .max(100, { message: "Cargo muito longo" }),
  department: z.string().optional(),
  startDate: z.string().datetime().optional(),
  certifications: z.array(z.object({
    name: z.string().max(100),
    expiryDate: z.string().datetime().optional(),
  })).optional(),
});

// ============= Contact/Feedback Schemas =============
export const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Nome muito longo" }),
  email: z.string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email muito longo" }),
  subject: z.string()
    .trim()
    .min(5, { message: "Assunto deve ter no mínimo 5 caracteres" })
    .max(200, { message: "Assunto muito longo" }),
  message: z.string()
    .trim()
    .min(10, { message: "Mensagem deve ter no mínimo 10 caracteres" })
    .max(5000, { message: "Mensagem muito longa" }),
});

// ============= API Request Schemas =============
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const idParamSchema = z.object({
  id: z.string().uuid({ message: "ID inválido" }),
});

// ============= Type Exports =============
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type DocumentSearchInput = z.infer<typeof documentSearchSchema>;
export type ComplianceFormInput = z.infer<typeof complianceFormSchema>;
export type CrewMemberInput = z.infer<typeof crewMemberSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
