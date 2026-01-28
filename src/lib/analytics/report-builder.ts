/**
 * Report Builder Engine - Enterprise Excellence v5.0
 * Drag-drop report builder with custom visualizations
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table' | 'kpi';
type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'distinct';
type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';

interface DataSource {
  id: string;
  name: string;
  table: string;
  columns: ColumnDefinition[];
  relationships?: Relationship[];
}

interface ColumnDefinition {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  label: string;
  aggregatable: boolean;
  groupable: boolean;
}

interface Relationship {
  table: string;
  foreignKey: string;
  primaryKey: string;
}

interface ReportFilter {
  column: string;
  operator: FilterOperator;
  value: unknown;
}

interface ReportWidget {
  id: string;
  type: ChartType;
  title: string;
  dataSource: string;
  columns: string[];
  aggregation?: AggregationType;
  groupBy?: string;
  filters: ReportFilter[];
  options: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  widgets: ReportWidget[];
  filters: ReportFilter[];
  schedule?: ReportSchedule;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

interface ReportData {
  widget: ReportWidget;
  data: Record<string, unknown>[];
  metadata: {
    rowCount: number;
    executionTime: number;
    lastUpdated: Date;
  };
}

class ReportBuilder {
  private static instance: ReportBuilder;
  private dataSources: DataSource[] = [];
  private reports = new Map<string, ReportDefinition>();

  private constructor() {
    this.initializeDataSources();
  }

  static getInstance(): ReportBuilder {
    if (!ReportBuilder.instance) {
      ReportBuilder.instance = new ReportBuilder();
    }
    return ReportBuilder.instance;
  }

  /**
   * Initialize available data sources
   */
  private initializeDataSources(): void {
    this.dataSources = [
      {
        id: 'crew',
        name: 'Crew Members',
        table: 'crew_members',
        columns: [
          { name: 'id', type: 'string', label: 'ID', aggregatable: false, groupable: false },
          { name: 'name', type: 'string', label: 'Name', aggregatable: false, groupable: true },
          { name: 'position', type: 'string', label: 'Position', aggregatable: false, groupable: true },
          { name: 'nationality', type: 'string', label: 'Nationality', aggregatable: false, groupable: true },
          { name: 'status', type: 'string', label: 'Status', aggregatable: false, groupable: true },
          { name: 'daily_rate', type: 'number', label: 'Daily Rate', aggregatable: true, groupable: false },
          { name: 'hire_date', type: 'date', label: 'Hire Date', aggregatable: false, groupable: true },
          { name: 'created_at', type: 'date', label: 'Created At', aggregatable: false, groupable: true }
        ]
      },
      {
        id: 'vessels',
        name: 'Vessels',
        table: 'vessels',
        columns: [
          { name: 'id', type: 'string', label: 'ID', aggregatable: false, groupable: false },
          { name: 'name', type: 'string', label: 'Name', aggregatable: false, groupable: true },
          { name: 'type', type: 'string', label: 'Type', aggregatable: false, groupable: true },
          { name: 'flag', type: 'string', label: 'Flag', aggregatable: false, groupable: true },
          { name: 'status', type: 'string', label: 'Status', aggregatable: false, groupable: true },
          { name: 'imo_number', type: 'string', label: 'IMO Number', aggregatable: false, groupable: false }
        ]
      },
      {
        id: 'documents',
        name: 'Documents',
        table: 'documents',
        columns: [
          { name: 'id', type: 'string', label: 'ID', aggregatable: false, groupable: false },
          { name: 'type', type: 'string', label: 'Type', aggregatable: false, groupable: true },
          { name: 'status', type: 'string', label: 'Status', aggregatable: false, groupable: true },
          { name: 'expiry_date', type: 'date', label: 'Expiry Date', aggregatable: false, groupable: true },
          { name: 'created_at', type: 'date', label: 'Created At', aggregatable: false, groupable: true }
        ]
      },
      {
        id: 'payroll',
        name: 'Payroll',
        table: 'crew_payroll',
        columns: [
          { name: 'id', type: 'string', label: 'ID', aggregatable: false, groupable: false },
          { name: 'period_month', type: 'string', label: 'Period', aggregatable: false, groupable: true },
          { name: 'base_salary', type: 'number', label: 'Base Salary', aggregatable: true, groupable: false },
          { name: 'overtime_pay', type: 'number', label: 'Overtime', aggregatable: true, groupable: false },
          { name: 'bonuses', type: 'number', label: 'Bonuses', aggregatable: true, groupable: false },
          { name: 'deductions', type: 'number', label: 'Deductions', aggregatable: true, groupable: false },
          { name: 'net_pay', type: 'number', label: 'Net Pay', aggregatable: true, groupable: false }
        ]
      }
    ];
  }

  /**
   * Get available data sources
   */
  getDataSources(): DataSource[] {
    return this.dataSources;
  }

  /**
   * Get data source by ID
   */
  getDataSource(id: string): DataSource | undefined {
    return this.dataSources.find(ds => ds.id === id);
  }

  /**
   * Create a new report
   */
  createReport(name: string, description?: string): ReportDefinition {
    const report: ReportDefinition = {
      id: crypto.randomUUID(),
      name,
      description,
      widgets: [],
      filters: [],
      createdBy: '', // Set from auth context
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reports.set(report.id, report);
    return report;
  }

  /**
   * Add widget to report
   */
  addWidget(reportId: string, widget: Omit<ReportWidget, 'id'>): ReportWidget {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    const newWidget: ReportWidget = {
      ...widget,
      id: crypto.randomUUID()
    };

    report.widgets.push(newWidget);
    report.updatedAt = new Date();

    return newWidget;
  }

  /**
   * Update widget
   */
  updateWidget(reportId: string, widgetId: string, updates: Partial<ReportWidget>): void {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    const widgetIndex = report.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) throw new Error('Widget not found');

    report.widgets[widgetIndex] = { ...report.widgets[widgetIndex], ...updates };
    report.updatedAt = new Date();
  }

  /**
   * Remove widget from report
   */
  removeWidget(reportId: string, widgetId: string): void {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    report.widgets = report.widgets.filter(w => w.id !== widgetId);
    report.updatedAt = new Date();
  }

  /**
   * Execute widget query
   */
  async executeWidgetQuery(widget: ReportWidget): Promise<ReportData> {
    const startTime = Date.now();
    const dataSource = this.getDataSource(widget.dataSource);
    if (!dataSource) throw new Error('Data source not found');

    try {
      // Use dynamic query building - simplified for type safety
      const tableName = dataSource.table as 'crew_members' | 'vessels' | 'documents' | 'crew_payroll';
      const selectColumns = widget.columns.length > 0 ? widget.columns.join(',') : '*';
      
      const { data, error } = await supabase
        .from(tableName)
        .select(selectColumns)
        .limit(1000);
        
      if (error) throw error;

      // Apply client-side filtering and aggregation
      let processedData: Record<string, unknown>[] = (data || []) as unknown as Record<string, unknown>[];
      
      // Apply filters client-side
      for (const filter of widget.filters) {
        processedData = this.applyClientFilter(processedData, filter);
      }
      
      // Apply aggregation if needed
      if (widget.aggregation && widget.groupBy) {
        processedData = this.aggregateData(processedData, widget.aggregation, widget.groupBy, widget.columns);
      }

      return {
        widget,
        data: processedData,
        metadata: {
          rowCount: processedData.length,
          executionTime: Date.now() - startTime,
          lastUpdated: new Date()
        }
      };

    } catch (error) {
      logger.error('Widget query failed', error as Error);
      throw error;
    }
  }

  /**
   * Apply filter client-side
   */
  private applyClientFilter(data: Record<string, unknown>[], filter: ReportFilter): Record<string, unknown>[] {
    return data.filter(row => {
      const value = row[filter.column];
      switch (filter.operator) {
        case 'eq':
          return value === filter.value;
        case 'neq':
          return value !== filter.value;
        case 'gt':
          return typeof value === 'number' && value > (filter.value as number);
        case 'gte':
          return typeof value === 'number' && value >= (filter.value as number);
        case 'lt':
          return typeof value === 'number' && value < (filter.value as number);
        case 'lte':
          return typeof value === 'number' && value <= (filter.value as number);
        case 'like':
          return typeof value === 'string' && value.toLowerCase().includes(String(filter.value).toLowerCase());
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value);
        default:
          return true;
      }
    });
  }

  /**
   * Aggregate data
   */
  private aggregateData(
    data: Record<string, unknown>[],
    aggregation: AggregationType,
    groupBy: string,
    columns: string[]
  ): Record<string, unknown>[] {
    const groups = new Map<string, Record<string, unknown>[]>();

    // Group data
    for (const row of data) {
      const key = String(row[groupBy] || 'null');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    }

    // Aggregate each group
    const result: Record<string, unknown>[] = [];
    for (const [key, rows] of groups) {
      const aggregated: Record<string, unknown> = { [groupBy]: key };

      for (const column of columns) {
        if (column === groupBy) continue;

        const values = rows.map(r => r[column]).filter(v => typeof v === 'number') as number[];
        
        switch (aggregation) {
          case 'sum':
            aggregated[column] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            aggregated[column] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case 'count':
            aggregated[column] = rows.length;
            break;
          case 'min':
            aggregated[column] = Math.min(...values);
            break;
          case 'max':
            aggregated[column] = Math.max(...values);
            break;
          case 'distinct':
            aggregated[column] = new Set(rows.map(r => r[column])).size;
            break;
        }
      }

      result.push(aggregated);
    }

    return result;
  }

  /**
   * Execute full report
   */
  async executeReport(reportId: string): Promise<ReportData[]> {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    const results = await Promise.all(
      report.widgets.map(widget => this.executeWidgetQuery(widget))
    );

    return results;
  }

  /**
   * Export report to PDF
   */
  async exportToPDF(reportId: string): Promise<Blob> {
    const data = await this.executeReport(reportId);
    
    // Would use jspdf or similar
    const content = JSON.stringify(data, null, 2);
    return new Blob([content], { type: 'application/pdf' });
  }

  /**
   * Export report to Excel
   */
  async exportToExcel(reportId: string): Promise<Blob> {
    const data = await this.executeReport(reportId);
    
    // Would use xlsx library
    const content = JSON.stringify(data, null, 2);
    return new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  /**
   * Schedule report
   */
  setSchedule(reportId: string, schedule: ReportSchedule): void {
    const report = this.reports.get(reportId);
    if (!report) throw new Error('Report not found');

    report.schedule = schedule;
    report.updatedAt = new Date();

    logger.info('Report scheduled', { reportId, schedule });
  }

  /**
   * Save report to localStorage (simplified - no DB table dependency)
   */
  async saveReport(report: ReportDefinition): Promise<void> {
    try {
      const saved = localStorage.getItem('nautilus_custom_reports') || '{}';
      const reports = JSON.parse(saved);
      reports[report.id] = report;
      localStorage.setItem('nautilus_custom_reports', JSON.stringify(reports));
    } catch (error) {
      logger.error('Failed to save report', error as Error);
      throw error;
    }
  }

  /**
   * Load report from localStorage
   */
  async loadReport(reportId: string): Promise<ReportDefinition | null> {
    try {
      const saved = localStorage.getItem('nautilus_custom_reports') || '{}';
      const reports = JSON.parse(saved);
      const report = reports[reportId] as ReportDefinition | undefined;
      
      if (report) {
        this.reports.set(reportId, report);
      }
      return report || null;
    } catch {
      return null;
    }
  }

  /**
   * List user's reports
   */
  async listReports(_userId: string): Promise<ReportDefinition[]> {
    try {
      const saved = localStorage.getItem('nautilus_custom_reports') || '{}';
      const reports = JSON.parse(saved);
      return Object.values(reports) as ReportDefinition[];
    } catch {
      return [];
    }
  }
}

export const reportBuilder = ReportBuilder.getInstance();
export { ReportBuilder };
export type { 
  DataSource, 
  ColumnDefinition, 
  ReportWidget, 
  ReportDefinition, 
  ReportFilter, 
  ReportData,
  ReportSchedule,
  ChartType,
  AggregationType,
  FilterOperator
};
