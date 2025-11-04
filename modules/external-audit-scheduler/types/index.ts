/**
 * External Audit Scheduler - Type Definitions
 * PATCH 653
 */

export interface ExternalAuditSchedulerData {
  id: string;
  created_at: string;
  updated_at: string;
  // TODO: Add specific type definitions
}

export interface ExternalAuditSchedulerMetrics {
  total_count: number;
  last_updated: string;
  // TODO: Add specific metrics
}
