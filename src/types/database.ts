/**
 * PATCH 860: Tipos derivados do Supabase
 * Arquivo central de tipos para tabelas do banco de dados
 * 
 * Uso: import type { Mirror, MirrorInsert, TrainingModule } from '@/types/database';
 */

import type { Database, Json } from '@/integrations/supabase/types';

// ============================================
// TIPOS BASE DO SUPABASE
// ============================================

export type Tables = Database['public']['Tables'];
export type { Json } from '@/integrations/supabase/types';

// ============================================
// MIRROR & CLONE SYSTEM
// ============================================

export type MirrorInstance = {
  id: string;
  instance_name: string;
  instance_type: string;
  status: string;
  region?: string | null;
  health_score?: number | null;
  sync_status?: string | null;
  last_sync_at?: string | null;
  config?: Json | null;
  metadata?: Json | null;
  organization_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MirrorInstanceInsert = Partial<MirrorInstance> & {
  instance_name: string;
  instance_type: string;
};

export type CloneSyncLog = {
  id: string;
  clone_id?: string | null;
  sync_type?: string | null;
  status?: string | null;
  records_synced?: number | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  metadata?: Json | null;
  created_at?: string | null;
};

export type CloneRegistry = {
  id: string;
  clone_name: string;
  source_instance_id?: string | null;
  status?: string | null;
  sync_frequency?: string | null;
  last_sync_at?: string | null;
  config?: Json | null;
  organization_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// ============================================
// TRAINING SYSTEM
// ============================================

export type TrainingModuleRow = {
  id: string;
  title: string;
  description?: string | null;
  gap_detected?: string | null;
  norm_reference?: string | null;
  training_content?: string | null;
  content?: Json | null;
  quiz?: Json | null;
  status?: string | null;
  vessel_id?: string | null;
  audit_id?: string | null;
  category?: string | null;
  duration_hours?: number | null;
  expiration_months?: number | null;
  organization_id?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TrainingModuleInsert = Partial<TrainingModuleRow> & {
  title: string;
};

export type TrainingCompletionRow = {
  id: string;
  training_module_id?: string | null;
  user_id: string;
  vessel_id?: string | null;
  quiz_answers?: Json | null;
  quiz_score?: number | null;
  passed?: boolean | null;
  notes?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
};

export type TrainingCompletionInsert = Partial<TrainingCompletionRow> & {
  user_id: string;
};

// ============================================
// MISSION CONTROL
// ============================================

export type MissionRow = {
  id: string;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  mission_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  vessel_id?: string | null;
  assigned_agents?: Json | null;
  assigned_systems?: Json | null;
  objectives?: Json | null;
  constraints?: Json | null;
  metadata?: Json | null;
  organization_id?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MissionInsert = Partial<MissionRow>;

export type MissionTask = {
  id: string;
  mission_id?: string | null;
  task_name?: string | null;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  assigned_to?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  result?: Json | null;
  metadata?: Json | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// ============================================
// WORKFLOW SYSTEM
// ============================================

export type WorkflowStep = {
  id: string;
  workflow_id?: string | null;
  name: string;
  step_number: number;
  step_type: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  position?: number | null;
  priority?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  tags?: string[] | null;
  conditions?: Json | null;
  config?: Json | null;
  metadata?: Json | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type WorkflowStepInsert = Partial<WorkflowStep> & {
  name: string;
  step_number: number;
  step_type: string;
};

export type SmartWorkflowStep = {
  id: string;
  workflow_id?: string | null;
  name: string;
  step_number: number;
  step_type: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  position?: number | null;
  priority?: string | null;
  assigned_to?: string | null;
  created_by?: string | null;
  tags?: string[] | null;
  conditions?: Json | null;
  config?: Json | null;
  metadata?: Json | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// ============================================
// INCIDENT REPORTS
// ============================================

export type IncidentReport = {
  id: string;
  code: string;
  incident_number?: string | null;
  title?: string | null;
  description: string;
  severity?: string | null;
  category?: string | null;
  incident_type?: string | null;
  incident_location?: string | null;
  gps_coordinates?: string | null;
  status?: string | null;
  reported_by?: string | null;
  assigned_to?: string | null;
  vessel_id?: string | null;
  photos?: string[] | null;
  ai_analysis?: Json | null;
  resolution?: string | null;
  closed_at?: string | null;
  organization_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type IncidentReportInsert = Partial<IncidentReport> & {
  code: string;
  description: string;
};

// ============================================
// COMMUNICATION CHANNELS
// ============================================

export type CommunicationChannel = {
  id: string;
  name: string;
  description?: string | null;
  channel_type?: string | null;
  is_active?: boolean | null;
  is_public?: boolean | null;
  max_members?: number | null;
  member_count?: number | null;
  last_message_at?: string | null;
  created_by: string;
  organization_id?: string | null;
  metadata?: Json | null;
  created_at: string;
  updated_at: string;
};

export type ChannelMessage = {
  id: string;
  channel_id: string;
  sender_id: string;
  message_content: string;
  message_type?: string | null;
  is_urgent?: boolean | null;
  read_by?: string[] | null;
  metadata?: Json | null;
  created_at: string;
};

export type ChannelPermission = {
  id: string;
  channel_id: string;
  user_id: string;
  role?: string | null;
  can_read?: boolean | null;
  can_write?: boolean | null;
  can_moderate?: boolean | null;
  granted_at?: string | null;
  granted_by?: string | null;
};

// ============================================
// AI SELF-HEALING
// ============================================

export type AISelfHealingLog = {
  id: string;
  event_type: string;
  module_affected: string;
  issue_description: string;
  severity?: string | null;
  action_taken?: string | null;
  action_result?: string | null;
  correction_type?: string | null;
  confidence_score?: number | null;
  ai_model?: string | null;
  execution_time_ms?: number | null;
  root_cause?: string | null;
  error_stack?: string | null;
  triggered_by?: string | null;
  resolved_at?: string | null;
  organization_id?: string | null;
  metadata?: Json | null;
  created_at: string;
  updated_at: string;
};

// Aliases for backward compatibility
export type AISelfHealingLogRow = AISelfHealingLog;
export type AISelfHealingLogInsert = Partial<AISelfHealingLog> & {
  event_type: string;
  module_affected: string;
  issue_description: string;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Converte row do Supabase para tipo local com valores padrão
 */
export function mapMirrorInstance(row: Record<string, unknown>): MirrorInstance {
  return {
    id: String(row.id || ''),
    instance_name: String(row.instance_name || ''),
    instance_type: String(row.instance_type || 'primary'),
    status: String(row.status || 'inactive'),
    region: row.region as string | null,
    health_score: row.health_score as number | null,
    sync_status: row.sync_status as string | null,
    last_sync_at: row.last_sync_at as string | null,
    config: row.config as Json | null,
    metadata: row.metadata as Json | null,
    organization_id: row.organization_id as string | null,
    created_at: row.created_at as string | null,
    updated_at: row.updated_at as string | null,
  };
}

export function mapTrainingModule(row: Record<string, unknown>): TrainingModuleRow {
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    description: row.description as string | null,
    gap_detected: row.gap_detected as string | null,
    norm_reference: row.norm_reference as string | null,
    training_content: row.training_content as string | null,
    content: row.content as Json | null,
    quiz: row.quiz as Json | null,
    status: row.status as string | null,
    vessel_id: row.vessel_id as string | null,
    audit_id: row.audit_id as string | null,
    category: row.category as string | null,
    duration_hours: row.duration_hours as number | null,
    expiration_months: row.expiration_months as number | null,
    organization_id: row.organization_id as string | null,
    created_by: row.created_by as string | null,
    created_at: row.created_at as string | null,
    updated_at: row.updated_at as string | null,
  };
}

export function mapMission(row: Record<string, unknown>): MissionRow {
  return {
    id: String(row.id || ''),
    name: row.name as string | null,
    code: row.code as string | null,
    description: row.description as string | null,
    status: row.status as string | null,
    priority: row.priority as string | null,
    mission_type: row.mission_type as string | null,
    start_date: row.start_date as string | null,
    end_date: row.end_date as string | null,
    vessel_id: row.vessel_id as string | null,
    assigned_agents: row.assigned_agents as Json | null,
    assigned_systems: row.assigned_systems as Json | null,
    objectives: row.objectives as Json | null,
    constraints: row.constraints as Json | null,
    metadata: row.metadata as Json | null,
    organization_id: row.organization_id as string | null,
    created_by: row.created_by as string | null,
    created_at: row.created_at as string | null,
    updated_at: row.updated_at as string | null,
  };
}
