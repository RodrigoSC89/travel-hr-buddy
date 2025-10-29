/**
 * PATCH 499: Telemetry Event Definitions
 * Centralized event definitions for consistent tracking
 */

export type TelemetryEventName =
  // Authentication events
  | 'user_login'
  | 'user_logout'
  | 'user_signup'
  | 'session_start'
  | 'session_end'
  // Module usage events
  | 'module_viewed'
  | 'module_action'
  | 'module_export'
  | 'module_share'
  // AI interaction events
  | 'ai_query_submitted'
  | 'ai_response_received'
  | 'ai_suggestion_accepted'
  | 'ai_suggestion_rejected'
  // Feature usage events
  | 'feature_used'
  | 'search_performed'
  | 'filter_applied'
  | 'report_generated';

export interface TelemetryEvent {
  name: TelemetryEventName;
  properties?: Record<string, any>;
  timestamp?: string;
}

export interface ModuleViewedEvent {
  module: string;
  route: string;
  timestamp: string;
}

export interface AIInteractionEvent {
  query_type: string;
  module: string;
  response_time?: number;
  success: boolean;
  error?: string;
}

export interface FeatureUsedEvent {
  feature: string;
  module: string;
  action: string;
  metadata?: Record<string, any>;
}

// Event validators
export function isValidEventName(name: string): name is TelemetryEventName {
  const validEvents: TelemetryEventName[] = [
    'user_login',
    'user_logout',
    'user_signup',
    'session_start',
    'session_end',
    'module_viewed',
    'module_action',
    'module_export',
    'module_share',
    'ai_query_submitted',
    'ai_response_received',
    'ai_suggestion_accepted',
    'ai_suggestion_rejected',
    'feature_used',
    'search_performed',
    'filter_applied',
    'report_generated',
  ];
  
  return validEvents.includes(name as TelemetryEventName);
}
