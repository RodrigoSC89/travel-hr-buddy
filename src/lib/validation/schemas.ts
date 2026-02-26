/**
 * PATCH: Security Validation Schemas
 * Zod schemas for input validation across the application
 */

import { z } from 'zod';

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
  category: z.enum(['ism', 'solas', 'marpol', 'mlc', 'stcw', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
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

// ============= Add Crew Form Schema =============
export const addCrewFormSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(100, { message: "Nome muito longo" })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { message: "Nome contém caracteres inválidos" }),
  rank: z.string().min(1, "Cargo é obrigatório"),
  nationality: z.string().min(1, "Nacionalidade é obrigatória").max(3, "Use código ISO (ex: BR)"),
  status: z.string().refine(
    (v) => ["available", "active", "training", "on_leave", "onboard", "off_duty"].includes(v),
    { message: "Status inválido" }
  ),
  employee_id: z.string().max(50).optional().or(z.literal("")),
  position: z.string().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
});

export type AddCrewFormInput = z.infer<typeof addCrewFormSchema>;

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
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().uuid({ message: "ID inválido" }),
});

// ============= Vessel Schemas =============
export const vesselSchema = z.object({
  name: z.string().trim().min(2, "Nome da embarcação é obrigatório").max(150),
  imo_number: z.string().regex(/^IMO\s?\d{7}$/, "Formato IMO inválido (ex: IMO 1234567)").optional().or(z.literal("")),
  vessel_type: z.string().min(1, "Tipo de embarcação é obrigatório"),
  flag_state: z.string().min(1, "Estado de bandeira é obrigatório"),
  gross_tonnage: z.coerce.number().min(0, "Deve ser positivo").optional(),
  year_built: z.coerce.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  status: z.enum(["active", "inactive", "maintenance", "drydock", "scrapped"]).default("active"),
});

// ============= Maintenance Schemas =============
export const maintenanceOrderSchema = z.object({
  title: z.string().trim().min(3, "Título mínimo 3 caracteres").max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  category: z.string().min(1, "Categoria é obrigatória"),
  due_date: z.string().refine((v) => !v || !isNaN(Date.parse(v)), "Data inválida").optional(),
  assigned_to: z.string().uuid().optional(),
  vessel_id: z.string().uuid("Embarcação inválida"),
});

// ============= Certificate Schemas =============
export const certificateSchema = z.object({
  certificate_type: z.string().min(1, "Tipo é obrigatório"),
  certificate_number: z.string().min(1, "Número é obrigatório"),
  issue_date: z.string().refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
  expiry_date: z.string().refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
  issuing_authority: z.string().min(1, "Autoridade emissora é obrigatória"),
});

// ============= Procurement Schemas =============
export const purchaseOrderSchema = z.object({
  supplier_name: z.string().trim().min(2, "Fornecedor é obrigatório"),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.coerce.number().min(1, "Quantidade mínima: 1"),
    unit_price: z.coerce.number().min(0, "Preço deve ser positivo"),
  })).min(1, "Adicione ao menos 1 item"),
  delivery_port: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

// ============= Reset Password Schema =============
export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

// ============= Voyage Schemas =============
export const voyagePlanSchema = z.object({
  vessel_id: z.string().uuid("Embarcação inválida"),
  voyage_number: z.string().trim().min(1, "Número da viagem é obrigatório").max(50),
  departure_port: z.string().trim().min(2, "Porto de partida é obrigatório"),
  arrival_port: z.string().trim().min(2, "Porto de destino é obrigatório"),
  departure_date: z.string().refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
  arrival_date: z.string().refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
  cargo_type: z.string().optional(),
  cargo_quantity: z.coerce.number().min(0).optional(),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]).default("planned"),
  notes: z.string().max(2000).optional(),
});

// ============= Noon Report Schemas =============
export const noonReportSchema = z.object({
  vessel_id: z.string().uuid("Embarcação inválida"),
  voyage_id: z.string().uuid().optional(),
  report_date: z.string().refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
  latitude: z.coerce.number().min(-90).max(90, "Latitude inválida"),
  longitude: z.coerce.number().min(-180).max(180, "Longitude inválida"),
  speed: z.coerce.number().min(0).max(40, "Velocidade inválida").optional(),
  course: z.coerce.number().min(0).max(360, "Curso inválido").optional(),
  wind_force: z.coerce.number().min(0).max(12, "Beaufort 0-12").optional(),
  sea_state: z.coerce.number().min(0).max(9, "Douglas 0-9").optional(),
  fuel_consumed_mt: z.coerce.number().min(0, "Deve ser positivo").optional(),
  distance_nm: z.coerce.number().min(0, "Deve ser positivo").optional(),
  remarks: z.string().max(2000).optional(),
});

// ============= Incident Report Schemas =============
export const incidentReportSchema = z.object({
  title: z.string().trim().min(5, "Título mínimo 5 caracteres").max(200),
  description: z.string().trim().min(10, "Descreva o incidente com pelo menos 10 caracteres").max(5000),
  incident_type: z.enum(["near_miss", "injury", "environmental", "property_damage", "security", "other"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  vessel_id: z.string().uuid("Embarcação inválida"),
  location: z.string().max(200).optional(),
  incident_date: z.string().refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
  witnesses: z.string().max(500).optional(),
  immediate_actions: z.string().max(2000).optional(),
  root_cause: z.string().max(2000).optional(),
});

// ============= Work/Rest Record Schemas (MLC Reg. 2.3) =============
export const workRestRecordSchema = z.object({
  crew_member_id: z.string().uuid("Tripulante inválido"),
  record_date: z.string().refine((v) => !isNaN(Date.parse(v)), "Data inválida"),
  work_hours: z.coerce.number().min(0).max(24, "Máximo 24h"),
  rest_hours: z.coerce.number().min(0).max(24, "Máximo 24h"),
  overtime_hours: z.coerce.number().min(0).max(12).optional(),
  notes: z.string().max(500).optional(),
}).refine((data) => data.work_hours + data.rest_hours <= 24, {
  message: "Trabalho + Descanso não pode exceder 24h",
  path: ["work_hours"],
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
export type VesselInput = z.infer<typeof vesselSchema>;
export type MaintenanceOrderInput = z.infer<typeof maintenanceOrderSchema>;
export type CertificateInput = z.infer<typeof certificateSchema>;
export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VoyagePlanInput = z.infer<typeof voyagePlanSchema>;
export type NoonReportInput = z.infer<typeof noonReportSchema>;
export type IncidentReportInput = z.infer<typeof incidentReportSchema>;
export type WorkRestRecordInput = z.infer<typeof workRestRecordSchema>;
