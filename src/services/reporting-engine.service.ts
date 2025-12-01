// PATCH 601: Reporting Engine Service
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

export class ReportingEngineService {
  /**
   * Get all report templates
   */
  static async getTemplates(): Promise<ReportTemplate[]> {
    const { data, error } = await (supabase as any)
      .from('report_templates')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching templates', error as Error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a report template
   */
  static async createTemplate(template: Partial<ReportTemplate>): Promise<ReportTemplate> {
    const { data, error } = await (supabase as any)
      .from('report_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      logger.error('Error creating template', error as Error, { templateName: template.name });
      throw error;
    }

    return data;
  }

  /**
   * Update a report template
   */
  static async updateTemplate(
    id: string,
    updates: Partial<ReportTemplate>
  ): Promise<ReportTemplate> {
    const { data, error } = await (supabase as any)
      .from('report_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating template', error as Error, { templateId: id });
      throw error;
    }

    return data;
  }

  /**
   * Get generated reports
   */
  static async getReports(): Promise<GeneratedReport[]> {
    const { data, error } = await (supabase as any)
      .from('generated_reports')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(50);

    if (error) {
      logger.error('Error fetching reports', error as Error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a specific report
   */
  static async getReport(id: string): Promise<GeneratedReport> {
    const { data, error } = await (supabase as any)
      .from('generated_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching report', error as Error, { reportId: id });
      throw error;
    }

    return data;
  }

  /**
   * Generate a report using AI
   */
  static async generateReport(
    request: ReportGenerationRequest
  ): Promise<ReportGenerationResponse> {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: request,
    });

    if (error) {
      logger.error('Error generating report', error as Error, { requestType: request.report_type });
      throw error;
    }

    return data;
  }

  /**
   * Get report schedules
   */
  static async getSchedules(): Promise<ReportSchedule[]> {
    const { data, error } = await (supabase as any)
      .from('report_schedules')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error fetching schedules', error as Error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a report schedule
   */
  static async createSchedule(schedule: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const { data, error } = await (supabase as any)
      .from('report_schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) {
      logger.error('Error creating schedule', error as Error, { scheduleName: schedule.name });
      throw error;
    }

    return data;
  }

  /**
   * Update a report schedule
   */
  static async updateSchedule(
    id: string,
    updates: Partial<ReportSchedule>
  ): Promise<ReportSchedule> {
    const { data, error } = await (supabase as any)
      .from('report_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating schedule', error as Error, { scheduleId: id });
      throw error;
    }

    return data;
  }

  /**
   * Delete a schedule
   */
  static async deleteSchedule(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('report_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting schedule', error as Error, { scheduleId: id });
      throw error;
    }
  }

  /**
   * Get report statistics
   */
  static async getStatistics(): Promise<ReportStatistics> {
    const { data, error } = await (supabase as any).rpc('get_report_statistics');

    if (error) {
      logger.error('Error fetching statistics', error as Error);
      throw error;
    }

    return data as ReportStatistics;
  }

  /**
   * Export report as JSON
   */
  static async exportAsJSON(reportId: string): Promise<string> {
    const report = await this.getReport(reportId);
    return JSON.stringify(report.content, null, 2);
  }
}
