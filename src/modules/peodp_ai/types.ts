/**
 * PEO-DP AI Module - Type Definitions
 * TypeScript interfaces and types for Phase 2 implementation
 */

/**
 * Event types monitored by the real-time system
 */
export type PEODPEventType =
  | "Loss of DP Reference"
  | "Thruster Fault"
  | "UPS Alarm"
  | "Manual Override"
  | "Position Drift"
  | "Power Failure"
  | "System Normal";

/**
 * Event severity levels
 */
export type PEODPEventSeverity = "Critical" | "High" | "Medium" | "Low" | "Info";

/**
 * Real-time monitoring event
 */
export interface PEODPEvent {
  evento: PEODPEventType;
  data: string;
  timestamp?: number;
  severity?: PEODPEventSeverity;
  vesselName?: string;
  source?: string;
}

/**
 * Real-time monitoring session
 */
export interface PEODPMonitoringSession {
  sessionId: string;
  vesselName: string;
  startTime: string;
  endTime?: string;
  eventos: PEODPEvent[];
  violations: number;
  isActive: boolean;
}

/**
 * Real-time monitoring statistics
 */
export interface PEODPMonitoringStats {
  totalEvents: number;
  criticalEvents: number;
  normalEvents: number;
  violationRate: number;
  eventsByType: Record<PEODPEventType, number>;
  duration: number;
}

/**
 * Corrective action definition
 */
export interface PEODPCorrectiveAction {
  eventType: PEODPEventType;
  action: string;
  priority: "High" | "Medium" | "Low";
  assignedTo?: string;
  status?: "Pending" | "In Progress" | "Completed";
}

/**
 * Workflow integration result
 */
export interface PEODPWorkflowResult {
  success: boolean;
  actionId?: string;
  message: string;
  timestamp: string;
}

/**
 * Session report
 */
export interface PEODPSessionReport {
  session: PEODPMonitoringSession;
  statistics: PEODPMonitoringStats;
  violations: PEODPEvent[];
  recommendations: string[];
  generatedAt: string;
}

/**
 * Comparison report between sessions
 */
export interface PEODPComparisonReport {
  sessions: PEODPMonitoringSession[];
  trends: {
    violationTrend: "Improving" | "Stable" | "Worsening";
    eventTrend: "Decreasing" | "Stable" | "Increasing";
  };
  insights: string[];
  generatedAt: string;
}

/**
 * Executive summary
 */
export interface PEODPExecutiveSummary {
  vesselName: string;
  period: {
    start: string;
    end: string;
  };
  overallScore: number;
  totalEvents: number;
  criticalIncidents: number;
  complianceStatus: "Excellent" | "Good" | "Acceptable" | "Critical";
  keyFindings: string[];
  recommendations: string[];
  generatedAt: string;
}
