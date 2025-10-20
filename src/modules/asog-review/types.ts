/**
 * ASOG Review Module - Type Definitions
 * 
 * TypeScript types for Activity Specific Operating Guidelines (ASOG)
 * review and validation system for Dynamic Positioning operations.
 */

/**
 * DP System Alert Levels
 * Green: Normal operations
 * Yellow: Caution - some degradation
 * Red: Critical - immediate action required
 */
export type DPAlertLevel = "Green" | "Yellow" | "Red";

/**
 * Operational Data Collected During ASOG Review
 */
export interface OperationalData {
  wind_speed: number;           // Wind speed in knots
  thrusters_operacionais: number; // Number of operational thrusters
  dp_status: DPAlertLevel;       // Current DP system alert level
  timestamp: string;             // ISO 8601 timestamp
}

/**
 * ASOG Limits Configuration
 * Defines the maximum allowed thresholds for safe DP operations
 */
export interface ASOGLimits {
  max_wind_speed: number;        // Maximum wind speed in knots
  max_thruster_loss: number;     // Maximum number of thrusters allowed to be inoperative
  required_dp_status: DPAlertLevel; // Required DP alert level
}

/**
 * Validation Result
 * Contains conformance status and list of non-compliance alerts
 */
export interface ValidationResult {
  conformidade: boolean;         // true if all parameters within ASOG limits
  alertas: string[];             // Array of alert messages for non-conformance
}

/**
 * Complete ASOG Review Report
 * Generated after each review execution
 */
export interface ASOGReport {
  timestamp: string;             // ISO 8601 timestamp of report generation
  dados_operacionais: OperationalData;
  resultado: ValidationResult;
}
