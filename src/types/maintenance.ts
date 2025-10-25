// PATCH 107.0: Predictive Maintenance Types

export type MaintenanceStatus = 'ok' | 'scheduled' | 'overdue' | 'forecasted';
export type MaintenancePriority = 'low' | 'normal' | 'high' | 'critical';
export type MaintenanceType = 'preventive' | 'corrective' | 'predictive' | 'condition_based';

export interface MaintenanceRecord {
  id: string;
  vessel_id: string;
  component: string;
  last_maintenance?: string;
  next_due?: string;
  status: MaintenanceStatus;
  notes?: string;
  forecasted_issue?: string;
  priority: MaintenancePriority;
  maintenance_type?: MaintenanceType;
  estimated_cost?: number;
  actual_cost?: number;
  performed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceDashboardView {
  id: string;
  component: string;
  last_maintenance?: string;
  next_due?: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  forecasted_issue?: string;
  vessel_name: string;
  imo_code: string;
  urgency_status: 'overdue' | 'urgent' | 'upcoming' | 'ok';
  days_until_due: number;
}

export interface MaintenancePrediction {
  vessel_id: string;
  vessel_name: string;
  component: string;
  prediction_score: number;
  recommended_action: string;
  estimated_cost: number;
}

export interface MaintenanceFilters {
  vessel_id?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  component?: string;
  urgency_status?: string;
}

export interface MaintenanceStats {
  total: number;
  overdue: number;
  scheduled: number;
  forecasted: number;
  ok: number;
  total_estimated_cost: number;
}
