/**
 * Audit Readiness Checker - Type Definitions
 * PATCH 658
 */

export interface AuditReadinessCheckerData {
  id: string;
  created_at: string;
  updated_at: string;
  // TODO: Add specific type definitions
}

export interface AuditReadinessCheckerMetrics {
  total_count: number;
  last_updated: string;
  // TODO: Add specific metrics
}
