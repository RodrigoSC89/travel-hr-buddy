/**
 * NAUTI ONE — Zod Data Contracts v1.0
 * Centralized schemas for all critical entities
 * Validates data from Supabase before rendering
 */

import { z } from 'zod';

// ============================================
// CORE ENTITIES
// ============================================

export const VesselSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome do navio é obrigatório'),
  imo_number: z.string().nullable().optional(),
  vessel_type: z.string().nullable().optional(),
  flag: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'drydock', 'decommissioned']).default('active'),
  organization_id: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const CrewMemberSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1, 'Nome completo é obrigatório'),
  rank: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  status: z.enum(['active', 'on_leave', 'off_duty', 'terminated', 'pending']).default('active'),
  vessel_id: z.string().uuid().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  hire_date: z.string().nullable().optional(),
  contract_end_date: z.string().nullable().optional(),
  organization_id: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  file_name: z.string().min(1),
  file_type: z.string().min(1),
  storage_path: z.string().min(1),
  category: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  file_url: z.string().url().nullable().optional(),
  file_size_bytes: z.number().nullable().optional(),
  organization_id: z.string().uuid().nullable().optional(),
  uploaded_by: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const IncidentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().nullable().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']).default('open'),
  type: z.enum(['safety', 'environmental', 'operational', 'security', 'other']).default('other'),
  reported_by: z.string().nullable().optional(),
  vessel_id: z.string().uuid().nullable().optional(),
  location: z.string().nullable().optional(),
  reported_at: z.string().datetime().optional(),
  closed_at: z.string().datetime().nullable().optional(),
  organization_id: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

export const AuditSchema = z.object({
  id: z.string().uuid(),
  audit_type: z.string().min(1),
  vessel_id: z.string().uuid().nullable().optional(),
  vessel_name: z.string().nullable().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'cancelled']).default('planned'),
  score: z.number().min(0).max(100).nullable().optional(),
  findings: z.any().nullable().optional(),
  auditor_name: z.string().nullable().optional(),
  scheduled_date: z.string().nullable().optional(),
  completed_date: z.string().nullable().optional(),
  organization_id: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

export const ActionItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().nullable().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assigned_to: z.string().uuid().nullable().optional(),
  assigned_to_name: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  completion_date: z.string().nullable().optional(),
  source_module: z.string().nullable().optional(),
  vessel_id: z.string().uuid().nullable().optional(),
  organization_id: z.string().uuid().nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// ============================================
// FORM INPUT SCHEMAS (for mutations)
// ============================================

export const CreateVesselInput = VesselSchema.omit({ id: true, created_at: true, updated_at: true });
export const UpdateVesselInput = VesselSchema.partial().required({ id: true });

export const CreateCrewMemberInput = CrewMemberSchema.omit({ id: true, created_at: true, updated_at: true });
export const UpdateCrewMemberInput = CrewMemberSchema.partial().required({ id: true });

export const CreateDocumentInput = DocumentSchema.omit({ id: true, created_at: true, updated_at: true });

export const CreateIncidentInput = IncidentSchema.omit({ id: true, created_at: true });
export const UpdateIncidentInput = IncidentSchema.partial().required({ id: true });

export const CreateActionItemInput = ActionItemSchema.omit({ id: true, created_at: true, updated_at: true });
export const UpdateActionItemInput = ActionItemSchema.partial().required({ id: true });

// ============================================
// TYPE EXPORTS
// ============================================

export type Vessel = z.infer<typeof VesselSchema>;
export type CrewMember = z.infer<typeof CrewMemberSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type Incident = z.infer<typeof IncidentSchema>;
export type Audit = z.infer<typeof AuditSchema>;
export type ActionItem = z.infer<typeof ActionItemSchema>;

// ============================================
// SAFE PARSE HELPERS
// ============================================

/**
 * Safely parse data from Supabase, returning defaults for invalid data
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  if (import.meta.env.DEV) console.warn('[DataContract] Validation failed:', result.error.issues);
  return null;
}

/**
 * Parse an array of records, filtering out invalid ones
 */
export function safeParseArray<T>(schema: z.ZodSchema<T>, data: unknown[]): T[] {
  return data
    .map(item => safeParse(schema, item))
    .filter((item): item is T => item !== null);
}
