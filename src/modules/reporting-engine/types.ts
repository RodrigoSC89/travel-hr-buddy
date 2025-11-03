/**
 * PATCH 601 - Reporting Engine Types
 */

export type ReportType = 'INSPECTION' | 'TASK' | 'RISK' | 'CREW_PERFORMANCE' | 'MONTHLY_CONSOLIDATED' | 'CUSTOM';
export type ExportFormat = 'PDF' | 'JSON' | 'XLSX' | 'CSV' | 'HTML';

export interface ReportTemplate {
  id: string;
  templateName: string;
  templateType: ReportType;
  description: string;
  active: boolean;
}

export interface GeneratedReport {
  id: string;
  reportTitle: string;
  reportType: ReportType;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed' | 'archived';
}

export interface ReportSchedule {
  id: string;
  scheduleName: string;
  scheduleType: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  nextExecution: string;
  active: boolean;
}
