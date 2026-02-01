/**
 * Learning Core Types - Sprint 2 Type Safety
 * Strongly typed interfaces for AI learning operations
 */

import type { Json } from '@/integrations/supabase/types';

// Event data structure - compatible with Json
export interface LearningEventData {
  action?: string;
  event_name?: string;
  error_message?: string;
  error_stack?: string;
  decision_type?: string;
  input?: Json;
  output?: Json;
  confidence?: number;
  [key: string]: Json | undefined;
}

// Event context structure - compatible with Json
export interface LearningEventContext {
  timestamp?: string;
  user_agent?: string;
  url?: string;
  [key: string]: Json | undefined;
}

// Database row type (from Supabase)
export interface LearningEventDbRow {
  id: string;
  event_type: string;
  module_name: string | null;
  user_id: string | null;
  context: Json;
  metadata: Json;
  timestamp: string | null;
  created_at: string | null;
}

// Transformed learning event for internal use
export interface TransformedLearningEvent {
  id: string;
  event_type: string;
  module_name: string;
  user_id: string | null;
  event_data: LearningEventData;
  context: Json;
  timestamp: string | null;
  metadata: Json;
  created_at: string | null;
}

// Pattern analysis types
export interface UsagePatternAnalysis {
  pattern_type: 'frequent_action' | 'sequence' | 'error_pattern' | 'time_based';
  frequency: number;
  module: string;
  confidence: number;
  description: string;
  examples: LearningEventData[];
}

// Training dataset structure
export interface TrainingDatasetMetadata {
  version: string;
  generated_at: string;
  total_events: number;
  event_types: Record<string, number>;
}
