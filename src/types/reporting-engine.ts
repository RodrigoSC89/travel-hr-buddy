// PATCH 601: LLM Reporting Engine Types

export type ReportTemplateType = "inspection" | "risk" | "tasks" | "compliance" | "custom";
export type ReportFormat = "pdf" | "json" | "xlsx";
export type ReportFrequency = "daily" | "weekly" | "monthly" | "quarterly";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  template_type: ReportTemplateType;
  template_content: Record<string, unknown>;
  sections: ReportSection[];
  variables: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface GeneratedReport {
  id: string;
  template_id: string | null;
  title: string;
  report_type: string;
  content: Record<string, unknown>;
  format: ReportFormat;
  file_url: string | null;
  parameters: Record<string, unknown>;
  generated_by: string | null;
  generated_at: string;
  period_start: string | null;
  period_end: string | null;
  vessel_id: string | null;
  module: string | null;
  ai_generated: boolean;
  metadata: Record<string, unknown>;
}

export interface ReportSchedule {
  id: string;
  template_id: string;
  name: string;
  description: string | null;
  frequency: ReportFrequency;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string | null;
  recipients: string[];
  format: ReportFormat;
  parameters: Record<string, unknown>;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportGenerationRequest {
  template_id?: string;
  report_type: ReportTemplateType;
  title: string;
  period_start?: string;
  period_end?: string;
  vessel_id?: string;
  module?: string;
  format?: ReportFormat;
  parameters?: Record<string, unknown>;
}

export interface ReportGenerationResponse {
  report_id: string;
  content: Record<string, unknown>;
  file_url?: string;
}

export interface ReportStatistics {
  total_reports: number;
  reports_by_type: Record<string, number>;
  reports_by_format: Record<string, number>;
  ai_generated_count: number;
  recent_reports: Array<{
    id: string;
    title: string;
    type: string;
    generated_at: string;
  }>;
}
