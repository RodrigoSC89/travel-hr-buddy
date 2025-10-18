/**
 * Simulation Exercise Types
 * Types for managing mandatory onboard simulations per regulatory requirements
 */

export type SimulationType = 
  | "DP" 
  | "Blackout" 
  | "Abandono" 
  | "Incêndio" 
  | "Man Overboard" 
  | "Spill";

export type SimulationStatus = "scheduled" | "completed" | "overdue" | "cancelled";

export interface SimulationExercise {
  id: string;
  vessel_id?: string;
  type: SimulationType;
  normative_reference: string; // IMCA M220, IBAMA SGSO, MTS Guidelines, etc
  frequency_days: number; // 30, 90, 180
  last_simulation?: string; // ISO date
  next_due?: string; // ISO date
  crew_participants: string[]; // Array of crew member IDs or names
  notes?: string;
  attachments: string[]; // URLs to Supabase Storage
  status: SimulationStatus;
  created_at: string;
  updated_at?: string;
}

export interface SimulationStats {
  total: number;
  completed: number;
  overdue: number;
  upcoming: number;
  completion_rate: number;
}

export interface CreateSimulationRequest {
  vessel_id?: string;
  type: SimulationType;
  normative_reference: string;
  frequency_days: number;
  last_simulation?: string;
  crew_participants?: string[];
  notes?: string;
}

export interface UpdateSimulationRequest {
  last_simulation?: string;
  crew_participants?: string[];
  notes?: string;
  attachments?: string[];
  status?: SimulationStatus;
}
