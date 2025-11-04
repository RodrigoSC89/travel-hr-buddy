/**
 * Crew Fatigue Monitor - Type Definitions
 * PATCH 656
 */

export interface CrewFatigueMonitorData {
  id: string;
  created_at: string;
  updated_at: string;
  // TODO: Add specific type definitions
}

export interface CrewFatigueMonitorMetrics {
  total_count: number;
  last_updated: string;
  // TODO: Add specific metrics
}
