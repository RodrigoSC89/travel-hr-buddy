/**
 * PATCH 580 - AI Incident Replayer v2 Types
 * Type definitions for enhanced incident replay system
 */

/**
 * Data source types for replay context
 */
export type ReplayDataSource = "sensors" | "crew" | "ai" | "system" | "logs";

/**
 * Timeline event types
 */
export type TimelineEventType = 
  | "incident_start"
  | "detection"
  | "ai_decision"
  | "crew_action"
  | "system_response"
  | "escalation"
  | "resolution"
  | "incident_end";

/**
 * Export format types
 */
export type ExportFormat = "video" | "text" | "json" | "pdf";

/**
 * Contextual data snapshot
 */
export interface ContextSnapshot {
  timestamp: number;
  source: ReplayDataSource;
  data: {
    sensors?: Record<string, any>;
    crew?: {
      onDuty: string[];
      actions: string[];
      communications: string[];
    };
    ai?: {
      analysis: string;
      confidence: number;
      recommendations: string[];
      decisions: string[];
    };
    system?: {
      status: Record<string, any>;
      alerts: string[];
      errors: string[];
    };
  };
  metadata?: {
    quality?: number;
    completeness?: number;
  };
}

/**
 * AI Decision record
 */
export interface AIDecisionRecord {
  id: string;
  timestamp: number;
  context: ContextSnapshot;
  decision: {
    type: string;
    description: string;
    reasoning: string;
    alternatives: {
      option: string;
      rationale: string;
      score: number;
    }[];
    selectedOption: string;
    confidence: number;
  };
  outcome: {
    success: boolean;
    impact: string;
    actualResult: string;
    expectedResult: string;
  };
  explanation: {
    summary: string;
    detailedReasoning: string;
    contextualFactors: string[];
    lessonsLearned: string[];
  };
}

/**
 * Timeline event
 */
export interface TimelineEvent {
  id: string;
  timestamp: number;
  type: TimelineEventType;
  title: string;
  description: string;
  actor: string; // Who/what performed the action
  context: ContextSnapshot;
  aiDecision?: AIDecisionRecord;
  duration?: number;
  impact: "critical" | "high" | "medium" | "low";
  relatedEvents: string[]; // IDs of related events
}

/**
 * Incident replay configuration
 */
export interface ReplayConfig {
  incidentId: string;
  startTime: number;
  endTime: number;
  dataSources: ReplayDataSource[];
  includeAIDecisions: boolean;
  includeContextReconstruction: boolean;
  playbackSpeed: number; // 1x, 2x, etc.
  highlightCriticalEvents: boolean;
}

/**
 * Incident replay
 */
export interface IncidentReplay {
  id: string;
  incidentId: string;
  createdAt: number;
  config: ReplayConfig;
  timeline: TimelineEvent[];
  aiDecisions: AIDecisionRecord[];
  reconstruction: {
    sensorData: Record<number, any>; // timestamp -> data
    crewActivity: Record<number, any>; // timestamp -> activity
    systemState: Record<number, any>; // timestamp -> state
    aiAnalysis: Record<number, any>; // timestamp -> analysis
  };
  statistics: {
    totalEvents: number;
    aiDecisionsCount: number;
    crewActionsCount: number;
    systemResponsesCount: number;
    averageResponseTime: number;
    incidentDuration: number;
  };
  insights: {
    keyFindings: string[];
    improvementAreas: string[];
    successfulActions: string[];
    failedActions: string[];
  };
}

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  includeContext: boolean;
  includeAIExplanations: boolean;
  includeVisualizations: boolean;
  includeRecommendations: boolean;
  metadata?: {
    author?: string;
    purpose?: string;
    audience?: string;
  };
}

/**
 * Video export settings (for future implementation)
 */
export interface VideoExportSettings {
  resolution: "720p" | "1080p" | "4k";
  framerate: 24 | 30 | 60;
  duration: number;
  includeAudio: boolean;
  includeSubtitles: boolean;
  watermark?: string;
}

/**
 * Replay filter options
 */
export interface ReplayFilterOptions {
  eventTypes?: TimelineEventType[];
  actors?: string[];
  impactLevels?: ("critical" | "high" | "medium" | "low")[];
  timeRange?: {
    start: number;
    end: number;
  };
  includeAIOnly?: boolean;
  includeCrewOnly?: boolean;
}
