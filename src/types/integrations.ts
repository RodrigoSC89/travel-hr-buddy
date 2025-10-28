/**
 * PATCH 346: Integrations Hub v2 - Type Definitions
 * Comprehensive types for webhooks, OAuth, and integration plugins
 */

export type IntegrationProvider = "google" | "microsoft" | "zapier" | "slack" | "custom";
export type IntegrationStatus = "active" | "inactive" | "error" | "pending";
export type AuthType = "oauth" | "api_key" | "none";
export type WebhookEventStatus = "pending" | "success" | "failed" | "retrying";
export type OAuthStatus = "connected" | "disconnected" | "expired" | "error";
export type IntegrationLogLevel = "debug" | "info" | "warning" | "error" | "critical";

export interface WebhookIntegration {
  id: string;
  name: string;
  description?: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  webhook_url: string;
  secret_key?: string;
  auth_type: AuthType;
  oauth_config?: Record<string, unknown>;
  headers?: Record<string, string>;
  events?: string[];
  metadata?: Record<string, unknown>;
  last_triggered_at?: string;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  organization_id?: string;
}

export interface WebhookEvent {
  id: string;
  integration_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: WebhookEventStatus;
  http_status?: number;
  response_body?: Record<string, unknown>;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  triggered_at: string;
  completed_at?: string;
  next_retry_at?: string;
  metadata?: Record<string, unknown>;
}

export interface OAuthConnection {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  provider_user_id?: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at?: string;
  scope?: string;
  status: OAuthStatus;
  last_sync_at?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationPlugin {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  provider: IntegrationProvider;
  category?: string;
  icon_url?: string;
  config_schema?: Record<string, unknown>;
  is_enabled: boolean;
  is_system: boolean;
  capabilities?: string[];
  version: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface IntegrationLog {
  id: string;
  integration_id?: string;
  plugin_id?: string;
  level: IntegrationLogLevel;
  message: string;
  context?: Record<string, unknown>;
  user_id?: string;
  created_at: string;
}

export interface IntegrationDashboardStats {
  total_integrations: number;
  active_integrations: number;
  total_events: number;
  success_rate: number;
  recent_events: WebhookEvent[];
  recent_logs: IntegrationLog[];
}

export interface OAuthFlowConfig {
  provider: IntegrationProvider;
  client_id: string;
  redirect_uri: string;
  scope: string[];
  state?: string;
}

export interface WebhookPayload {
  event_type: string;
  data: Record<string, unknown>;
  timestamp: string;
  source: string;
}
