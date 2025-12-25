/**
 * Auto-Healing System Types
 * Self-correcting, adaptive, and evolving system architecture
 */

export type HealthStatus = "healthy" | "degraded" | "critical" | "offline";
export type ModuleType = "route" | "component" | "hook" | "service" | "integration" | "database";
export type FixStrategy = "restart" | "rollback" | "patch" | "isolate" | "escalate";

export interface ModuleHealth {
  id: string;
  name: string;
  type: ModuleType;
  status: HealthStatus;
  lastCheck: number;
  errorCount: number;
  responseTime: number;
  dependencies: string[];
  metadata?: Record<string, unknown>;
}

export interface SystemDiagnostic {
  timestamp: number;
  overallHealth: HealthStatus;
  modules: ModuleHealth[];
  activeIssues: SystemIssue[];
  recentFixes: AppliedFix[];
  metrics: SystemMetrics;
}

export interface SystemIssue {
  id: string;
  timestamp: number;
  type: IssueType;
  severity: "low" | "medium" | "high" | "critical";
  module: string;
  description: string;
  stackTrace?: string;
  suggestedFix?: FixSuggestion;
  autoFixable: boolean;
}

export type IssueType = 
  | "route_error"
  | "component_crash"
  | "api_failure"
  | "database_error"
  | "memory_leak"
  | "performance_degradation"
  | "dependency_missing"
  | "type_error"
  | "network_timeout"
  | "auth_failure";

export interface FixSuggestion {
  strategy: FixStrategy;
  confidence: number;
  description: string;
  steps: string[];
  estimatedTime: number; // in seconds
  riskLevel: "low" | "medium" | "high";
}

export interface AppliedFix {
  id: string;
  issueId: string;
  timestamp: number;
  strategy: FixStrategy;
  success: boolean;
  description: string;
  rollbackAvailable: boolean;
  duration: number;
}

export interface SystemMetrics {
  uptime: number;
  totalErrors: number;
  errorsResolved: number;
  autoFixRate: number;
  avgResponseTime: number;
  memoryUsage: number;
  activeConnections: number;
}

export interface HealingConfig {
  enabled: boolean;
  autoFixEnabled: boolean;
  checkInterval: number; // ms
  maxRetries: number;
  escalationThreshold: number;
  notifyOnFix: boolean;
  strategies: {
    [key in IssueType]?: FixStrategy;
  };
}

export interface HealingEvent {
  type: "issue_detected" | "fix_applied" | "fix_failed" | "escalated" | "recovered";
  timestamp: number;
  data: SystemIssue | AppliedFix;
}
