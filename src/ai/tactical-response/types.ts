/**
 * PATCH 577 - Tactical Response Engine Types
 * Type definitions for automated tactical response system
 */

/**
 * Event types that trigger responses
 */
export type EventType =
  | 'alert'
  | 'failure'
  | 'warning'
  | 'optimization'
  | 'crew_change'
  | 'weather_change'
  | 'navigation_issue'
  | 'sensor_anomaly'
  | 'system_degradation'
  | 'mission_critical'
  | 'compliance_violation'
  | 'resource_shortage'
  | 'performance_degradation'
  | 'security_threat';

/**
 * Response action types
 */
export type ResponseActionType =
  | 'alert'
  | 'notification'
  | 'automated_correction'
  | 'escalation'
  | 'data_collection'
  | 'system_adjustment'
  | 'crew_notification'
  | 'report_generation'
  | 'failover'
  | 'diagnostic_run';

/**
 * Rule types
 */
export type RuleType = 'reactive' | 'predictive';

/**
 * Event data structure
 */
export interface TacticalEvent {
  id: string;
  type: EventType;
  timestamp: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  data: Record<string, any>;
  metadata?: {
    confidence?: number;
    priority?: number;
  };
}

/**
 * Response action
 */
export interface ResponseAction {
  id: string;
  type: ResponseActionType;
  description: string;
  parameters: Record<string, any>;
  timeout?: number; // Max execution time in ms
  retries?: number;
  priority: number; // 1-10
}

/**
 * Tactical rule definition
 */
export interface TacticalRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  enabled: boolean;
  priority: number;
  eventTypes: EventType[];
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex';
    value: any;
  }[];
  actions: ResponseAction[];
  cooldown?: number; // Min time between executions in ms
  maxExecutions?: number; // Max executions per hour
}

/**
 * Response execution result
 */
export interface ResponseExecution {
  id: string;
  ruleId: string;
  eventId: string;
  timestamp: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'timeout';
  actions: {
    actionId: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    result?: any;
    error?: string;
    duration?: number;
  }[];
  justification: string;
  confidence: number;
}

/**
 * Response engine statistics
 */
export interface EngineStatistics {
  totalEvents: number;
  processedEvents: number;
  activeRules: number;
  executedResponses: number;
  successRate: number;
  averageResponseTime: number;
  eventsByType: Record<EventType, number>;
  performanceMetrics: {
    minResponseTime: number;
    maxResponseTime: number;
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
}

/**
 * Rule configuration format (for JSON/YAML loading)
 */
export interface RuleConfig {
  version: string;
  rules: TacticalRule[];
  settings?: {
    maxConcurrentExecutions?: number;
    defaultTimeout?: number;
    enableMetrics?: boolean;
  };
}
