/**
 * Garbage Management - Type Definitions
 * PATCH 660
 */

export interface GarbageManagementData {
  id: string;
  created_at: string;
  updated_at: string;
  // TODO: Add specific type definitions
}

export interface GarbageManagementMetrics {
  total_count: number;
  last_updated: string;
  // TODO: Add specific metrics
}
