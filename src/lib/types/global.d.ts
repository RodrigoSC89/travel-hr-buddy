// src/lib/types/global.d.ts
// Global type definitions for Supabase schema and application data

export interface Feedback {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  rating?: number;
  attachments?: any;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Vessel {
  id: string;
  name: string;
  imo_number?: string;
  capacity?: number;
  current_location?: string;
  current_fuel_level?: number;
  vessel_type: string;
}

export interface ResultOne {
  id?: string;
  title?: string;
  component_id?: string;
  ai_suggestion?: string;
  created_at?: string;
  severity?: string;
  [key: string]: any;
}

export interface TrendData {
  month: string;
  count: number;
  total_jobs?: number;
}

export interface WorkflowStep {
  id: string;
  step_title: string;
  order_index: number;
  category: string;
  is_completed: boolean;
}
