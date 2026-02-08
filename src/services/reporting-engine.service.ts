/**
 * PATCH 601: Reporting Engine Service
 * DEBT-FIX: Removed all (supabase as any) - report_templates/generated_reports/report_schedules
 * don't exist in schema. Using localStorage persistence.
 */
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type {
  ReportTemplate,
  GeneratedReport,
  ReportSchedule,
  ReportGenerationRequest,
  ReportGenerationResponse,
  ReportStatistics,
} from '@/types/reporting-engine';

const STORAGE_KEYS = {
  TEMPLATES: 'nautilus_report_templates',
  REPORTS: 'nautilus_generated_reports',
  SCHEDULES: 'nautilus_report_schedules',
};

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    logger.error('Failed to save to storage', error as Error);
  }
}

export class ReportingEngineService {
  static async getTemplates(): Promise<ReportTemplate[]> {
    return loadFromStorage<ReportTemplate>(STORAGE_KEYS.TEMPLATES);
  }

  static async createTemplate(template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const templates = loadFromStorage<ReportTemplate>(STORAGE_KEYS.TEMPLATES);
    const newTemplate: ReportTemplate = {
      ...template,
      id: template.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ReportTemplate;
    templates.push(newTemplate);
    saveToStorage(STORAGE_KEYS.TEMPLATES, templates);
    return newTemplate;
  }

  static async updateTemplate(id: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const templates = loadFromStorage<ReportTemplate>(STORAGE_KEYS.TEMPLATES);
    const idx = templates.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Template not found');
    templates[idx] = { ...templates[idx], ...updates, updated_at: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.TEMPLATES, templates);
    return templates[idx];
  }

  static async getReports(): Promise<GeneratedReport[]> {
    return loadFromStorage<GeneratedReport>(STORAGE_KEYS.REPORTS);
  }

  static async getReport(id: string): Promise<GeneratedReport> {
    const reports = loadFromStorage<GeneratedReport>(STORAGE_KEYS.REPORTS);
    const report = reports.find(r => r.id === id);
    if (!report) throw new Error('Report not found');
    return report;
  }

  static async generateReport(request: ReportGenerationRequest): Promise<ReportGenerationResponse> {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: request,
    });

    if (error) {
      logger.error('Error generating report', error as Error, { requestType: request.report_type });
      throw error;
    }

    return data;
  }

  static async getSchedules(): Promise<ReportSchedule[]> {
    return loadFromStorage<ReportSchedule>(STORAGE_KEYS.SCHEDULES);
  }

  static async createSchedule(schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const schedules = loadFromStorage<ReportSchedule>(STORAGE_KEYS.SCHEDULES);
    const newSchedule: ReportSchedule = {
      ...schedule,
      id: schedule.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
    } as ReportSchedule;
    schedules.push(newSchedule);
    saveToStorage(STORAGE_KEYS.SCHEDULES, schedules);
    return newSchedule;
  }

  static async updateSchedule(id: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const schedules = loadFromStorage<ReportSchedule>(STORAGE_KEYS.SCHEDULES);
    const idx = schedules.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Schedule not found');
    schedules[idx] = { ...schedules[idx], ...updates };
    saveToStorage(STORAGE_KEYS.SCHEDULES, schedules);
    return schedules[idx];
  }

  static async deleteSchedule(id: string): Promise<void> {
    const schedules = loadFromStorage<ReportSchedule>(STORAGE_KEYS.SCHEDULES);
    saveToStorage(STORAGE_KEYS.SCHEDULES, schedules.filter(s => s.id !== id));
  }

  static async getStatistics(): Promise<ReportStatistics> {
    const reports = loadFromStorage<GeneratedReport>(STORAGE_KEYS.REPORTS);

    return {
      total_reports: reports.length,
      reports_by_type: {},
      reports_by_format: {},
      ai_generated_count: 0,
      recent_reports: reports.slice(0, 5).map(r => ({
        id: r.id,
        title: r.title,
        type: r.report_type,
        generated_at: r.generated_at,
      })),
    };
  }

  static async exportAsJSON(reportId: string): Promise<string> {
    const report = await this.getReport(reportId);
    return JSON.stringify(report.content, null, 2);
  }
}
