/**
 * RPC Function Type Definitions
 * Provides type safety for Supabase RPC calls
 * 
 * This file defines types for all database functions (RPCs) that are not
 * automatically generated in the Supabase types.
 */

// ============================================================================
// RPC PARAMETER TYPES
// ============================================================================

/** Parameters for get_restore_count_by_day_with_email RPC */
export interface GetRestoreCountParams {
  email_input: string;
}

/** Parameters for calculate_wellbeing_score RPC */
export interface CalculateWellbeingScoreParams {
  p_user_id: string;
  p_days: number;
}

/** Parameters for log_satcom_failover RPC */
export interface LogSatcomFailoverParams {
  p_vessel_id: string;
  p_event_type: string;
  p_from_provider: string | null;
  p_to_provider: string | null;
  p_reason: string;
  p_metadata?: Record<string, unknown>;
}

/** Parameters for update_satcom_connection_status RPC */
export interface UpdateSatcomConnectionStatusParams {
  p_vessel_id: string;
  p_connection_id: string;
  p_provider: string;
  p_status: string;
  p_signal_strength: number;
  p_latency_ms?: number;
  p_error?: string | null;
}

/** Parameters for log_satcom_communication RPC */
export interface LogSatcomCommunicationParams {
  p_vessel_id: string;
  p_provider: string | null;
  p_message_type: string;
  p_direction: "inbound" | "outbound";
  p_message_content: string;
  p_metadata?: Record<string, unknown>;
}

/** Parameters for get_satcom_failover_stats RPC */
export interface GetSatcomFailoverStatsParams {
  p_vessel_id: string;
  p_hours: number;
}

/** Parameters for create_template_version RPC */
export interface CreateTemplateVersionParams {
  p_template_id: string;
  p_content: string;
  p_variables: Record<string, unknown>;
  p_change_summary: string;
}

/** Parameters for generate_document_from_template RPC */
export interface GenerateDocumentFromTemplateParams {
  p_template_id: string;
  p_name: string;
  p_variable_values: Record<string, string | number | boolean>;
  p_format: "html" | "pdf" | "docx";
}

/** Parameters for rollback_template_version RPC */
export interface RollbackTemplateVersionParams {
  p_template_id: string;
  p_version: number;
}

/** Parameters for export_document RPC */
export interface ExportDocumentParams {
  p_document_id: string;
  p_file_url: string;
}

/** Parameters for deactivate_integration RPC */
export interface DeactivateIntegrationParams {
  p_integration_id: string;
}

/** Parameters for create_oauth_state RPC */
export interface CreateOAuthStateParams {
  p_provider_id: string;
}

/** Parameters for install_plugin RPC */
export interface InstallPluginParams {
  p_plugin_id: string;
  p_configuration: Record<string, unknown>;
}

/** Parameters for get_risk_statistics RPC */
export interface GetRiskStatisticsParams {
  p_vessel_id?: string | null;
  p_module?: string | null;
}

/** Parameters for get_risk_heatmap RPC */
export interface GetRiskHeatmapParams {
  p_vessel_id?: string | null;
}

/** Parameters for process_voice_command RPC */
export interface ProcessVoiceCommandParams {
  p_session_id: string;
  p_command_text: string;
  p_confidence_score: number;
}

/** Parameters for generate_certificate_id RPC */
export interface GenerateCertificateIdParams {
  p_result_id: string;
}

/** Parameters for add_user_to_group RPC */
export interface AddUserToGroupParams {
  p_user_id: string;
  p_group_id: string;
}

/** Parameters for generate_crew_ai_recommendations RPC */
export interface GenerateCrewAIRecommendationsParams {
  crew_uuid: string;
}

/** Parameters for dispatch_webhook_event RPC */
export interface DispatchWebhookEventParams {
  p_integration_id: string;
  p_event_type: string;
  p_payload: Record<string, unknown>;
}

// ============================================================================
// RPC RESPONSE TYPES
// ============================================================================

/** Response from get_restore_count_by_day_with_email */
export interface RestoreCountByDay {
  day: string;
  count: number;
}

/** Response from get_satcom_failover_stats */
export interface SatcomFailoverStats {
  total_failovers: number;
  successful_failovers: number;
  failed_failovers: number;
  avg_recovery_time_seconds: number;
  most_common_provider: string;
}

/** Response from get_risk_statistics */
export interface RiskStatistics {
  total_risks: number;
  critical_risks: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;
  mitigated_risks: number;
  average_risk_score: number;
}

/** Response from get_risk_heatmap */
export interface RiskHeatmapCell {
  category: string;
  severity: string;
  count: number;
  risk_score: number;
}

/** Response from jobs_trend_by_month */
export interface JobsTrendByMonth {
  month: string;
  count: number;
}

/** Response from get_backup_stats */
export interface BackupStats {
  total_backups: number;
  successful_backups: number;
  failed_backups: number;
  total_size_gb: number;
  last_backup_at: string;
}

/** Response from get_simulation_stats */
export interface SimulationStats {
  total_simulations: number;
  running_simulations: number;
  completed_simulations: number;
  average_duration_minutes: number;
}

/** Response from get_cron_stats */
export interface CronJobStats {
  total_jobs: number;
  active_jobs: number;
  failed_jobs_last_24h: number;
  next_execution: string | null;
}

/** Response from get_crew_training_stats */
export interface CrewTrainingStats {
  total_sessions: number;
  completed_sessions: number;
  average_score: number;
  total_hours: number;
}

/** Response from get_report_statistics */
export interface ReportStatistics {
  total_reports: number;
  generated_this_month: number;
  pending_reports: number;
  average_generation_time_ms: number;
}

/** Response from get_monthly_restore_summary_by_department */
export interface MonthlyRestoreSummary {
  department: string;
  month: string;
  count: number;
}

// ============================================================================
// TYPE-SAFE RPC CALLER
// ============================================================================

import { supabase } from "@/integrations/supabase/client";

/**
 * Type-safe RPC caller wrapper
 * Provides full type safety for Supabase RPC calls
 */
export const rpc = {
  /**
   * Get restore count by day with email filter
   */
  async getRestoreCountByDay(params: GetRestoreCountParams): Promise<RestoreCountByDay[]> {
    const { data, error } = await supabase.rpc(
      "get_restore_count_by_day_with_email" as never,
      params as never
    );
    if (error) throw error;
    return (data as RestoreCountByDay[]) || [];
  },

  /**
   * Get monthly restore summary by department
   */
  async getMonthlyRestoreSummary(): Promise<MonthlyRestoreSummary[]> {
    const { data, error } = await supabase.rpc(
      "get_monthly_restore_summary_by_department" as never
    );
    if (error) throw error;
    return (data as MonthlyRestoreSummary[]) || [];
  },

  /**
   * Calculate wellbeing score for a user
   */
  async calculateWellbeingScore(params: CalculateWellbeingScoreParams): Promise<number | null> {
    const { data, error } = await supabase.rpc(
      "calculate_wellbeing_score" as never,
      params as never
    );
    if (error) throw error;
    return data as number | null;
  },

  /**
   * Get jobs trend by month
   */
  async getJobsTrendByMonth(): Promise<JobsTrendByMonth[]> {
    const { data, error } = await supabase.rpc("jobs_trend_by_month" as never);
    if (error) throw error;
    return (data as JobsTrendByMonth[]) || [];
  },

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<BackupStats | null> {
    const { data, error } = await supabase.rpc("get_backup_stats" as never);
    if (error) throw error;
    const result = data as BackupStats[] | null;
    return result && result.length > 0 ? result[0] : null;
  },

  /**
   * Get simulation statistics
   */
  async getSimulationStats(): Promise<SimulationStats | null> {
    const { data, error } = await supabase.rpc("get_simulation_stats" as never);
    if (error) throw error;
    return data as SimulationStats | null;
  },

  /**
   * Get cron job statistics
   */
  async getCronStats(): Promise<CronJobStats | null> {
    const { data, error } = await supabase.rpc("get_cron_stats" as never);
    if (error) throw error;
    return data as CronJobStats | null;
  },

  /**
   * Get crew training statistics
   */
  async getCrewTrainingStats(): Promise<CrewTrainingStats | null> {
    const { data, error } = await supabase.rpc("get_crew_training_stats" as never);
    if (error) throw error;
    return data as CrewTrainingStats | null;
  },

  /**
   * Get report statistics
   */
  async getReportStatistics(): Promise<ReportStatistics> {
    const { data, error } = await supabase.rpc("get_report_statistics" as never);
    if (error) throw error;
    return (data as ReportStatistics) || {
      total_reports: 0,
      generated_this_month: 0,
      pending_reports: 0,
      average_generation_time_ms: 0,
    };
  },

  /**
   * Get risk statistics
   */
  async getRiskStatistics(params: GetRiskStatisticsParams): Promise<RiskStatistics> {
    const { data, error } = await supabase.rpc(
      "get_risk_statistics" as never,
      params as never
    );
    if (error) throw error;
    return data as RiskStatistics;
  },

  /**
   * Get risk heatmap
   */
  async getRiskHeatmap(params: GetRiskHeatmapParams): Promise<RiskHeatmapCell[]> {
    const { data, error } = await supabase.rpc(
      "get_risk_heatmap" as never,
      params as never
    );
    if (error) throw error;
    return (data as RiskHeatmapCell[]) || [];
  },

  /**
   * Process voice command
   */
  async processVoiceCommand(params: ProcessVoiceCommandParams): Promise<unknown> {
    const { data, error } = await supabase.rpc(
      "process_voice_command" as never,
      params as never
    );
    if (error) throw error;
    return data;
  },

  /**
   * Generate certificate ID
   */
  async generateCertificateId(params: GenerateCertificateIdParams): Promise<string | null> {
    const { data, error } = await supabase.rpc(
      "generate_certificate_id" as never,
      params as never
    );
    if (error) throw error;
    return data as string | null;
  },

  /**
   * Add user to group
   */
  async addUserToGroup(params: AddUserToGroupParams): Promise<void> {
    const { error } = await supabase.rpc(
      "add_user_to_group" as never,
      params as never
    );
    if (error) throw error;
  },

  /**
   * Generate crew AI recommendations
   */
  async generateCrewAIRecommendations(params: GenerateCrewAIRecommendationsParams): Promise<unknown> {
    const { data, error } = await supabase.rpc(
      "generate_crew_ai_recommendations" as never,
      params as never
    );
    if (error) throw error;
    return data;
  },

  /**
   * Dispatch webhook event
   */
  async dispatchWebhookEvent(params: DispatchWebhookEventParams): Promise<string> {
    const { data, error } = await supabase.rpc(
      "dispatch_webhook_event" as never,
      params as never
    );
    if (error) throw error;
    return data as string;
  },

  /**
   * Create template version
   */
  async createTemplateVersion(params: CreateTemplateVersionParams): Promise<void> {
    const { error } = await supabase.rpc(
      "create_template_version" as never,
      params as never
    );
    if (error) throw error;
  },

  /**
   * Generate document from template
   */
  async generateDocumentFromTemplate(params: GenerateDocumentFromTemplateParams): Promise<string> {
    const { data, error } = await supabase.rpc(
      "generate_document_from_template" as never,
      params as never
    );
    if (error) throw error;
    return data as string;
  },

  /**
   * Rollback template version
   */
  async rollbackTemplateVersion(params: RollbackTemplateVersionParams): Promise<void> {
    const { error } = await supabase.rpc(
      "rollback_template_version" as never,
      params as never
    );
    if (error) throw error;
  },

  /**
   * Export document
   */
  async exportDocument(params: ExportDocumentParams): Promise<void> {
    const { error } = await supabase.rpc("export_document" as never, params as never);
    if (error) throw error;
  },

  /**
   * Deactivate integration
   */
  async deactivateIntegration(params: DeactivateIntegrationParams): Promise<void> {
    const { error } = await supabase.rpc(
      "deactivate_integration" as never,
      params as never
    );
    if (error) throw error;
  },

  /**
   * Create OAuth state
   */
  async createOAuthState(params: CreateOAuthStateParams): Promise<string> {
    const { data, error } = await supabase.rpc(
      "create_oauth_state" as never,
      params as never
    );
    if (error) throw error;
    return data as string;
  },

  /**
   * Install plugin
   */
  async installPlugin(params: InstallPluginParams): Promise<void> {
    const { error } = await supabase.rpc("install_plugin" as never, params as never);
    if (error) throw error;
  },

  /**
   * Log satcom failover
   */
  async logSatcomFailover(params: LogSatcomFailoverParams): Promise<string | null> {
    const { data, error } = await supabase.rpc(
      "log_satcom_failover" as never,
      params as never
    );
    if (error) throw error;
    return data as string | null;
  },

  /**
   * Update satcom connection status
   */
  async updateSatcomConnectionStatus(params: UpdateSatcomConnectionStatusParams): Promise<void> {
    const { error } = await supabase.rpc(
      "update_satcom_connection_status" as never,
      params as never
    );
    if (error) throw error;
  },

  /**
   * Log satcom communication
   */
  async logSatcomCommunication(params: LogSatcomCommunicationParams): Promise<string | null> {
    const { data, error } = await supabase.rpc(
      "log_satcom_communication" as never,
      params as never
    );
    if (error) throw error;
    return data as string | null;
  },

  /**
   * Get satcom failover stats
   */
  async getSatcomFailoverStats(params: GetSatcomFailoverStatsParams): Promise<SatcomFailoverStats | null> {
    const { data, error } = await supabase.rpc(
      "get_satcom_failover_stats" as never,
      params as never
    );
    if (error) throw error;
    return data as SatcomFailoverStats | null;
  },
};
