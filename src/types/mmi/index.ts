/**
 * MMI (Módulo de Manutenção Inteligente) - Type Definitions
 * Intelligent Maintenance Module - TypeScript Types
 */

// Asset status types
export type AssetStatus = 'operational' | 'maintenance' | 'critical' | 'inactive';

// Job status types
export type JobStatus = 'pendente' | 'em_andamento' | 'concluido' | 'postergado';

// Job priority types
export type JobPriority = 'baixa' | 'normal' | 'alta' | 'crítica';

// Service Order status types
export type ServiceOrderStatus = 'aberta' | 'aprovada' | 'em_execucao' | 'finalizada';

// Event types for technical history
export type EventType = 'falha' | 'troca' | 'inspeção' | 'manutenção' | 'teste';

// Hour meter source types
export type HourMeterSource = 'manual' | 'ocr' | 'iot';

// Component types
export type ComponentType = 'motor' | 'bomba' | 'sensor' | 'válvula' | 'gerador' | 'outro';

/**
 * Asset (Ativo) - Fleet asset or equipment
 */
export interface MMIAsset {
  id: string;
  name: string;
  code: string; // Ex: 603.0004.02
  vessel?: string | null; // Vessel name
  location?: string | null; // Compartment or subsystem
  critical: boolean; // Is critical for DP
  created_at: string;
  updated_at: string;
}

/**
 * Component - Technical component of an asset
 */
export interface MMIComponent {
  id: string;
  asset_id?: string | null;
  name: string;
  code?: string | null;
  type?: ComponentType | string | null;
  manufacturer?: string | null;
  serial_number?: string | null;
  created_at: string;
  updated_at: string;
  // Relationships
  asset?: MMIAsset;
}

/**
 * Job - Maintenance job
 */
export interface MMIJob {
  id: string;
  component_id?: string | null;
  title: string;
  status: JobStatus;
  priority: JobPriority;
  due_date?: string | null;
  created_by?: string | null;
  justification?: string | null;
  suggestion_ia?: string | null;
  created_at: string;
  updated_at: string;
  // Relationships
  component?: MMIComponent;
  service_orders?: MMIServiceOrder[];
}

/**
 * Service Order (Ordem de Serviço)
 */
export interface MMIServiceOrder {
  id: string;
  job_id?: string | null;
  status: ServiceOrderStatus;
  opened_by?: string | null;
  approved_by?: string | null;
  opened_at: string;
  closed_at?: string | null;
  updated_at: string;
  // Relationships
  job?: MMIJob;
}

/**
 * Technical History Event
 */
export interface MMIHistory {
  id: string;
  component_id?: string | null;
  event_type?: EventType | string | null;
  description?: string | null;
  created_at: string;
  // Relationships
  component?: MMIComponent;
}

/**
 * Hour Meter Reading (Horímetro)
 */
export interface MMIHourMeter {
  id: string;
  component_id: string;
  value: number;
  source: HourMeterSource;
  read_at: string;
  // Relationships
  component?: MMIComponent;
}

/**
 * Extended Job with relationships for UI display
 */
export interface MMIJobExtended extends MMIJob {
  component?: MMIComponent & {
    asset?: MMIAsset;
  };
  service_orders?: MMIServiceOrder[];
  latest_hour_reading?: number;
}

/**
 * Dashboard statistics
 */
export interface MMIDashboardStats {
  total_assets: number;
  critical_assets: number;
  total_jobs: number;
  pending_jobs: number;
  in_progress_jobs: number;
  completed_jobs: number;
  overdue_jobs: number;
  open_service_orders: number;
  critical_jobs: number;
}

/**
 * Filter options for jobs list
 */
export interface MMIJobFilters {
  status?: JobStatus[];
  priority?: JobPriority[];
  vessel?: string;
  component_type?: ComponentType | string;
  overdue?: boolean;
  search?: string;
}

/**
 * AI Suggestion for maintenance
 */
export interface MMIAISuggestion {
  component_id: string;
  component_name: string;
  suggested_action: string;
  priority: JobPriority;
  reasoning: string;
  estimated_hours?: number;
  confidence_score?: number;
}

/**
 * Asset health score
 */
export interface MMIAssetHealth {
  asset_id: string;
  asset_name: string;
  vessel?: string;
  health_score: number; // 0-100
  status: AssetStatus;
  last_maintenance?: string;
  next_maintenance?: string;
  pending_jobs: number;
  critical_jobs: number;
}
