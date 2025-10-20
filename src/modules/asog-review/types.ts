/**
 * ASOG Review Module - Type Definitions
 * Activity Specific Operating Guidelines validation for DP operations
 */

/**
 * ASOG operational limits configuration
 */
export interface ASOGLimits {
  /** Maximum allowed wind speed in knots */
  wind_speed_max: number;
  /** Maximum number of thrusters allowed to be inoperative */
  thruster_loss_tolerance: number;
  /** Required DP alert level for safe operations */
  dp_alert_level: "Green" | "Yellow" | "Red";
}

/**
 * Operational data collected during ASOG review
 */
export interface OperationalData {
  /** Current wind speed in knots */
  wind_speed: number;
  /** Number of thrusters currently operational */
  thrusters_operacionais: number;
  /** Current DP system status */
  dp_status: "Green" | "Yellow" | "Red";
  /** Timestamp of data collection */
  timestamp: string;
}

/**
 * ASOG validation result
 */
export interface ValidationResult {
  /** Whether the operation conforms to ASOG guidelines */
  conformidade: boolean;
  /** Array of alert messages for non-conformance issues */
  alertas: string[];
}

/**
 * Complete ASOG review report
 */
export interface ASOGReport {
  /** Timestamp when the report was generated */
  timestamp: string;
  /** Operational data that was validated */
  dados_operacionais: OperationalData;
  /** Validation result */
  resultado: ValidationResult;
}
