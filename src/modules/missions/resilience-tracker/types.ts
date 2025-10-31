/**
 * PATCH 579 - Mission Resilience Tracker Types
 * Type definitions for mission resilience tracking system
 */

/**
 * Failure severity levels
 */
export type FailureSeverity = "critical" | "high" | "medium" | "low";

/**
 * Response effectiveness rating
 */
export type ResponseEffectiveness = "excellent" | "good" | "adequate" | "poor" | "failed";

/**
 * Recovery status
 */
export type RecoveryStatus = "recovered" | "recovering" | "degraded" | "failed";

/**
 * Failure event
 */
export interface FailureEvent {
  id: string;
  missionId: string;
  timestamp: number;
  severity: FailureSeverity;
  category: string; // e.g., 'navigation', 'power', 'communication', etc.
  description: string;
  affectedSystems: string[];
  detected_by: "crew" | "system" | "ai";
  context: Record<string, any>;
}

/**
 * Response action taken
 */
export interface ResponseAction {
  id: string;
  failureEventId: string;
  timestamp: number;
  initiatedBy: "crew" | "system" | "ai";
  actionType: string;
  description: string;
  success: boolean;
  duration: number; // in milliseconds
  effectiveness: ResponseEffectiveness;
  notes?: string;
}

/**
 * Recovery metrics
 */
export interface RecoveryMetrics {
  failureEventId: string;
  recoveryStartTime: number;
  recoveryEndTime?: number;
  recoveryDuration?: number;
  status: RecoveryStatus;
  steps: {
    step: string;
    timestamp: number;
    duration: number;
    success: boolean;
  }[];
  finalState: {
    systemHealth: number; // 0-1
    operationalCapacity: number; // 0-1
    notes: string;
  };
}

/**
 * Mission resilience index components
 */
export interface ResilienceComponents {
  failurePreventionScore: number; // 0-100
  responseEffectivenessScore: number; // 0-100
  recoverySpeedScore: number; // 0-100
  systemRedundancyScore: number; // 0-100
  crewReadinessScore: number; // 0-100
}

/**
 * Mission resilience index
 */
export interface MissionResilienceIndex {
  missionId: string;
  timestamp: number;
  overallScore: number; // 0-100
  components: ResilienceComponents;
  trend: "improving" | "stable" | "declining";
  trendPercentage: number;
  totalFailures: number;
  criticalFailures: number;
  averageRecoveryTime: number;
  successfulRecoveries: number;
  failedRecoveries: number;
}

/**
 * Event-based report
 */
export interface EventReport {
  id: string;
  missionId: string;
  generatedAt: number;
  period: {
    start: number;
    end: number;
  };
  summary: {
    totalEvents: number;
    eventsByCategory: Record<string, number>;
    eventsBySeverity: Record<FailureSeverity, number>;
    averageResponseTime: number;
    averageRecoveryTime: number;
  };
  events: {
    failure: FailureEvent;
    responses: ResponseAction[];
    recovery?: RecoveryMetrics;
    resilienceImpact: number; // Impact on resilience score (-100 to +100)
  }[];
  recommendations: string[];
  exportFormats?: {
    json?: string;
    csv?: string;
    pdf?: string;
  };
}

/**
 * Resilience trend data point
 */
export interface ResilienceTrendPoint {
  timestamp: number;
  score: number;
  eventCount: number;
  recoveryRate: number;
}

/**
 * Resilience tracker configuration
 */
export interface ResilienceTrackerConfig {
  missionId: string;
  enableRealTimeTracking: boolean;
  reportGenerationInterval: number; // in milliseconds
  alertThresholds: {
    criticalScoreDrop: number; // Alert if score drops by this amount
    minAcceptableScore: number; // Alert if score falls below this
    maxRecoveryTime: number; // Alert if recovery takes longer (ms)
  };
  integrations: {
    situationalAwareness: boolean;
    tacticalResponse: boolean;
  };
}
