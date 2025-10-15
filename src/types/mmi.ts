/**
 * MMI (Manutenção e Manutenibilidade Industrial) Type Definitions
 * 
 * Types for the MMI Business Intelligence Dashboard
 */

/**
 * Failure by system data point
 */
export interface FailureBySystem {
  system: string;
  count: number;
}

/**
 * Jobs by vessel data point
 */
export interface JobsByVessel {
  vessel: string;
  jobs: number;
}

/**
 * Postponement status data point
 */
export interface Postponement {
  status: string;
  count: number;
}

/**
 * Complete MMI BI Summary response
 */
export interface MMIBISummary {
  failuresBySystem: FailureBySystem[];
  jobsByVessel: JobsByVessel[];
  postponements: Postponement[];
}
