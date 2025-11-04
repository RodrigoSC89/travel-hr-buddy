/**
 * Pre-Port Audit - Type Definitions
 * PATCH 648
 */

export interface PrePortAuditData {
  id: string;
  created_at: string;
  updated_at: string;
  // TODO: Add specific type definitions
}

export interface PrePortAuditMetrics {
  total_count: number;
  last_updated: string;
  // TODO: Add specific metrics
}
