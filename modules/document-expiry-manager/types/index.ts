/**
 * Document Expiry Manager - Type Definitions
 * PATCH 655
 */

export interface DocumentExpiryManagerData {
  id: string;
  created_at: string;
  updated_at: string;
  // TODO: Add specific type definitions
}

export interface DocumentExpiryManagerMetrics {
  total_count: number;
  last_updated: string;
  // TODO: Add specific metrics
}
