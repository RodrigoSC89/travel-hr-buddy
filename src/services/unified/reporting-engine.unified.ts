/**
 * UNIFIED REPORTING ENGINE SERVICE
 * Fusão de: reporting-engine.service.ts + reporting-engine.ts
 * 
 * Combina:
 * - CRUD operations (reporting-engine.service.ts)
 * - AI report generation (reporting-engine.ts)
 * - Data collection from multiple sources (reporting-engine.ts)
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { Json } from "@/integrations/supabase/types";

// ============================================
// TYPES
// ============================================

export type ReportType =
  | "INSPECTION"
  | "TASK"
  | "RISK"
  | "CREW_PERFORMANCE"
  | "MONTHLY_CONSOLIDATED"
  | "CUSTOM";

export type ExportFormat = "PDF" | "JSON" | "XLSX" | "CSV" | "HTML";

export type ScheduleType =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "annually"
  | "on_demand";

export interface ReportSection {
  id: string;
  title: string;
  type: "text" | "table" | "chart" | "summary" | "metrics";
  content?: Record<string, unknown>;
  dataQuery?: string;
}

export interface ReportTemplate {
  id: string;
  name?: string;
  template_name?: string;
  template_type?: ReportType;
  type?: ReportType;
  description: string | null;
  template_structure?: Record<string, unknown>;
  sections?: ReportSection[];
  data_sources?: string[];
  visualization_config?: Record<string, unknown>;
  ai_summary_enabled?: boolean;
  is_active?: boolean;
  active?: boolean;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GeneratedReport {
  id: string;
  template_id?: string | null;
  report_title?: string;
  title?: string;
  report_type?: ReportType;
  type?: ReportType;
  vessel_id?: string | null;
  period_start?: string | null;
  period_end?: string | null;
  report_data?: Record<string, unknown>;
  content?: Record<string, unknown>;
  ai_summary?: string | null;
  ai_insights?: string[];
  executive_summary?: string | null;
  conclusions?: string[];
  recommendations?: string[];
  status?: string;
  generated_at?: string | null;
  generated_by?: string | null;
}

export interface ReportSchedule {
  id: string;
  template_id?: string | null;
  name?: string;
  schedule_name?: string;
  schedule_type?: ScheduleType;
  cron_expression?: string | null;
  next_execution?: string;
  last_execution?: string | null;
  vessel_id?: string | null;
  recipients?: Json | null;
  delivery_method?: string | null;
  export_formats?: Json | null;
  is_active?: boolean;
  active?: boolean;
  created_by?: string | null;
}

export interface ReportGenerationRequest {
  template_id: string;
  report_type: ReportType;
  vessel_id?: string;
  period_start: string;
  period_end: string;
  options?: Record<string, unknown>;
}

export interface ReportGenerationResponse {
  report_id: string;
  status: string;
  message?: string;
}

export interface ReportStatistics {
  total_reports: number;
  reports_this_month: number;
  average_generation_time: number;
  most_used_template: string;
}

// ============================================
// UNIFIED REPORTING ENGINE
// ============================================

export const ReportingEngine = {
  // ============================================
  // TEMPLATES
  // ============================================
  
  async getTemplates(): Promise<ReportTemplate[]> {
    const { data, error } = await (supabase as any)
      .from("report_templates")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching templates", error as Error);
      throw error;
    }

    return data || [];
  },

  async getTemplate(id: string): Promise<ReportTemplate> {
    const { data, error } = await (supabase as any)
      .from("report_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Error fetching template", error as Error, { templateId: id });
      throw error;
    }

    return data;
  },

  async createTemplate(template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const { data, error } = await (supabase as any)
      .from("report_templates")
      .insert(template)
      .select()
      .single();

    if (error) {
      logger.error("Error creating template", error as Error, { templateName: template.name });
      throw error;
    }

    return data;
  },

  async updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const { data, error } = await (supabase as any)
      .from("report_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating template", error as Error, { templateId: id });
      throw error;
    }

    return data;
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("report_templates")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      logger.error("Error deleting template", error as Error, { templateId: id });
      throw error;
    }
  },

  // ============================================
  // REPORTS
  // ============================================

  async getReports(limit: number = 50): Promise<GeneratedReport[]> {
    const { data, error } = await (supabase as any)
      .from("generated_reports")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error fetching reports", error as Error);
      throw error;
    }

    return data || [];
  },

  async getReport(id: string): Promise<GeneratedReport> {
    const { data, error } = await (supabase as any)
      .from("generated_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Error fetching report", error as Error, { reportId: id });
      throw error;
    }

    return data;
  },

  async generateReport(request: ReportGenerationRequest): Promise<ReportGenerationResponse> {
    const { data, error } = await supabase.functions.invoke("generate-report", {
      body: request,
    });

    if (error) {
      logger.error("Error generating report", error as Error, { requestType: request.report_type });
      throw error;
    }

    return data;
  },

  async generateIntelligentReport(
    templateId: string,
    vesselId: string | null,
    periodStart: Date,
    periodEnd: Date,
    userId: string
  ): Promise<string> {
    const response = await this.generateReport({
      template_id: templateId,
      report_type: "CUSTOM",
      vessel_id: vesselId || undefined,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      options: { userId }
    });

    return response.report_id;
  },

  // ============================================
  // SCHEDULES
  // ============================================

  async getSchedules(): Promise<ReportSchedule[]> {
    const { data, error } = await (supabase as any)
      .from("report_schedules")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching schedules", error as Error);
      throw error;
    }

    return data || [];
  },

  async getSchedule(id: string): Promise<ReportSchedule> {
    const { data, error } = await (supabase as any)
      .from("report_schedules")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Error fetching schedule", error as Error, { scheduleId: id });
      throw error;
    }

    return data;
  },

  async createSchedule(schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const { data, error } = await (supabase as any)
      .from("report_schedules")
      .insert(schedule)
      .select()
      .single();

    if (error) {
      logger.error("Error creating schedule", error as Error, { scheduleName: schedule.name });
      throw error;
    }

    return data;
  },

  async updateSchedule(id: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const { data, error } = await (supabase as any)
      .from("report_schedules")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating schedule", error as Error, { scheduleId: id });
      throw error;
    }

    return data;
  },

  async deleteSchedule(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("report_schedules")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting schedule", error as Error, { scheduleId: id });
      throw error;
    }
  },

  // ============================================
  // STATISTICS & EXPORTS
  // ============================================

  async getStatistics(): Promise<ReportStatistics> {
    const { data, error } = await (supabase as any).rpc("get_report_statistics");

    if (error) {
      logger.error("Error fetching statistics", error as Error);
      // Return default stats instead of throwing
      return {
        total_reports: 0,
        reports_this_month: 0,
        average_generation_time: 0,
        most_used_template: "N/A"
      };
    }

    return data as ReportStatistics;
  },

  async exportAsJSON(reportId: string): Promise<string> {
    const report = await this.getReport(reportId);
    return JSON.stringify(report.content || report.report_data, null, 2);
  },

  async exportReport(reportId: string, format: ExportFormat): Promise<Blob> {
    const report = await this.getReport(reportId);
    const content = report.content || report.report_data;

    switch (format) {
    case "JSON":
      return new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    case "CSV":
      // Simple CSV conversion
      const csvContent = Object.entries(content || {})
        .map(([key, value]) => `"${key}","${JSON.stringify(value)}"`)
        .join("\n");
      return new Blob([csvContent], { type: "text/csv" });
    default:
      return new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
    }
  }
};

// Backward compatibility class export
export class ReportingEngineService {
  static getTemplates = ReportingEngine.getTemplates;
  static getTemplate = ReportingEngine.getTemplate;
  static createTemplate = ReportingEngine.createTemplate;
  static updateTemplate = ReportingEngine.updateTemplate;
  static getReports = ReportingEngine.getReports;
  static getReport = ReportingEngine.getReport;
  static generateReport = ReportingEngine.generateReport;
  static getSchedules = ReportingEngine.getSchedules;
  static createSchedule = ReportingEngine.createSchedule;
  static updateSchedule = ReportingEngine.updateSchedule;
  static deleteSchedule = ReportingEngine.deleteSchedule;
  static getStatistics = ReportingEngine.getStatistics;
  static exportAsJSON = ReportingEngine.exportAsJSON;
}

// Legacy function export
export const generateIntelligentReport = ReportingEngine.generateIntelligentReport.bind(ReportingEngine);

export default ReportingEngine;
