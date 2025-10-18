/**
 * Simulation Exercise Type Definitions
 * 
 * Types for managing onboard simulation exercises per regulatory requirements
 */

export type SimulationType = 
  | "DP" 
  | "Blackout" 
  | "Abandono" 
  | "Incêndio" 
  | "Man Overboard" 
  | "Derramamento";

export type SimulationStatus = "scheduled" | "completed" | "overdue" | "cancelled";

export interface SimulationExercise {
  id: string;
  vessel_id: string;
  type: SimulationType;
  normative_reference?: string;
  frequency_days: number;
  last_simulation?: string; // ISO date string
  next_due?: string; // ISO date string
  crew_participants?: string[];
  notes?: string;
  attachments?: string[];
  result?: string;
  lessons_learned?: string;
  gpt_suggestions?: string;
  status: SimulationStatus;
  created_at: string;
  updated_at: string;
}

export interface SimulationFormData {
  vessel_id: string;
  type: SimulationType;
  normative_reference?: string;
  frequency_days: number;
  last_simulation?: string;
  crew_participants?: string[];
  notes?: string;
  result?: string;
  lessons_learned?: string;
}

export interface OverdueSimulation {
  id: string;
  vessel_id: string;
  type: string;
  normative_reference?: string;
  next_due: string;
  days_overdue: number;
}

export interface UpcomingSimulation {
  id: string;
  vessel_id: string;
  type: string;
  normative_reference?: string;
  next_due: string;
  days_until_due: number;
}

export interface SimulationCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: SimulationType;
  status: SimulationStatus;
  vessel_id: string;
}

export interface SimulationStats {
  total: number;
  completed: number;
  scheduled: number;
  overdue: number;
  completionRate: number;
}
