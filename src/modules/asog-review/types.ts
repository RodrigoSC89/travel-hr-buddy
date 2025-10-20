/**
 * ASOG Review Module Types
 * Activity Specific Operating Guidelines for DP Operations
 */

export interface ASOGLimits {
  wind_speed_max: number; // in knots
  thruster_loss_tolerance: number; // number of thrusters
  dp_alert_level: "Green" | "Yellow" | "Red";
}

export interface OperationalStatus {
  wind_speed: number; // in knots
  thrusters_operacionais: number; // operational thrusters count
  dp_status: "Green" | "Yellow" | "Red";
  timestamp: string; // ISO timestamp
}

export interface ValidationResult {
  conformidade: boolean;
  alertas: string[];
}

export interface ASOGReport {
  timestamp: string;
  dados_operacionais: OperationalStatus;
  resultado: ValidationResult;
}
