/**
 * UNIFIED REPORTING ENGINE SERVICE
 * DEBT-FIX: report_templates, report_schedules, generated_reports not in schema
 * Using in-memory stores with localStorage persistence
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
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
// IN-MEMORY STORES (tables not in schema)
// ============================================

const STORAGE_KEY_TEMPLATES = "nautilus_report_templates";
const STORAGE_KEY_REPORTS = "nautilus_generated_reports";
const STORAGE_KEY_SCHEDULES = "nautilus_report_schedules";

function loadStore<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStore<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    logger.error(`Failed to save ${key}`, error as Error);
  }
}

// ============================================
// UNIFIED REPORTING ENGINE
// ============================================

export const ReportingEngine = {
  // ============================================
  // TEMPLATES
  // ============================================
  
  async getTemplates(): Promise<ReportTemplate[]> {
    return loadStore<ReportTemplate>(STORAGE_KEY_TEMPLATES).filter(t => t.is_active !== false);
  },

  async getTemplate(id: string): Promise<ReportTemplate> {
    const templates = loadStore<ReportTemplate>(STORAGE_KEY_TEMPLATES);
    const found = templates.find(t => t.id === id);
    if (!found) throw new Error(`Template ${id} not found`);
    return found;
  },

  async createTemplate(template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const templates = loadStore<ReportTemplate>(STORAGE_KEY_TEMPLATES);
    const newTemplate: ReportTemplate = {
      id: crypto.randomUUID(),
      ...template,
      description: template.description ?? null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    templates.push(newTemplate);
    saveStore(STORAGE_KEY_TEMPLATES, templates);
    return newTemplate;
  },

  async updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const templates = loadStore<ReportTemplate>(STORAGE_KEY_TEMPLATES);
    const idx = templates.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Template ${id} not found`);
    templates[idx] = { ...templates[idx], ...updates, updated_at: new Date().toISOString() };
    saveStore(STORAGE_KEY_TEMPLATES, templates);
    return templates[idx];
  },

  async deleteTemplate(id: string): Promise<void> {
    const templates = loadStore<ReportTemplate>(STORAGE_KEY_TEMPLATES);
    const idx = templates.findIndex(t => t.id === id);
    if (idx !== -1) {
      templates[idx].is_active = false;
      saveStore(STORAGE_KEY_TEMPLATES, templates);
    }
  },

  // ============================================
  // REPORTS
  // ============================================

  async getReports(limit: number = 50): Promise<GeneratedReport[]> {
    return loadStore<GeneratedReport>(STORAGE_KEY_REPORTS).slice(0, limit);
  },

  async getReport(id: string): Promise<GeneratedReport> {
    const reports = loadStore<GeneratedReport>(STORAGE_KEY_REPORTS);
    const found = reports.find(r => r.id === id);
    if (!found) throw new Error(`Report ${id} not found`);
    return found;
  },

  async generateReport(request: ReportGenerationRequest): Promise<ReportGenerationResponse> {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: request,
    });

    if (error) {
      logger.error('Error generating report', error as Error, { requestType: request.report_type });
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
      report_type: 'CUSTOM',
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
    return loadStore<ReportSchedule>(STORAGE_KEY_SCHEDULES);
  },

  async getSchedule(id: string): Promise<ReportSchedule> {
    const schedules = loadStore<ReportSchedule>(STORAGE_KEY_SCHEDULES);
    const found = schedules.find(s => s.id === id);
    if (!found) throw new Error(`Schedule ${id} not found`);
    return found;
  },

  async createSchedule(schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const schedules = loadStore<ReportSchedule>(STORAGE_KEY_SCHEDULES);
    const newSchedule: ReportSchedule = {
      id: crypto.randomUUID(),
      ...schedule,
      is_active: true,
    };
    schedules.push(newSchedule);
    saveStore(STORAGE_KEY_SCHEDULES, schedules);
    return newSchedule;
  },

  async updateSchedule(id: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const schedules = loadStore<ReportSchedule>(STORAGE_KEY_SCHEDULES);
    const idx = schedules.findIndex(s => s.id === id);
    if (idx === -1) throw new Error(`Schedule ${id} not found`);
    schedules[idx] = { ...schedules[idx], ...updates };
    saveStore(STORAGE_KEY_SCHEDULES, schedules);
    return schedules[idx];
  },

  async deleteSchedule(id: string): Promise<void> {
    const schedules = loadStore<ReportSchedule>(STORAGE_KEY_SCHEDULES);
    saveStore(STORAGE_KEY_SCHEDULES, schedules.filter(s => s.id !== id));
  },

  // ============================================
  // STATISTICS & EXPORTS
  // ============================================

  async getStatistics(): Promise<ReportStatistics> {
    const reports = loadStore<GeneratedReport>(STORAGE_KEY_REPORTS);
    const templates = loadStore<ReportTemplate>(STORAGE_KEY_TEMPLATES);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    return {
      total_reports: reports.length,
      reports_this_month: reports.filter(r => (r.generated_at || "") >= monthStart).length,
      average_generation_time: 0,
      most_used_template: templates[0]?.name || 'N/A'
    };
  },

  async exportAsJSON(reportId: string): Promise<string> {
    const report = await this.getReport(reportId);
    return JSON.stringify(report.content || report.report_data, null, 2);
  },

  async exportReport(reportId: string, format: ExportFormat): Promise<Blob> {
    const report = await this.getReport(reportId);
    const content = report.content || report.report_data;

    switch (format) {
      case 'JSON':
        return new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
      case 'CSV': {
        const csvContent = Object.entries(content || {})
          .map(([key, value]) => `"${key}","${JSON.stringify(value)}"`)
          .join('\n');
        return new Blob([csvContent], { type: 'text/csv' });
      }
      default:
        return new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
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
