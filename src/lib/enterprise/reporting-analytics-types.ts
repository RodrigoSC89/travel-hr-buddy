/**
 * 📊 REPORTING & ANALYTICS - Types & Logic
 */

export interface Report {
  id: string;
  title: string;
  type: 'operational' | 'financial' | 'safety' | 'compliance' | 'custom';
  format: 'pdf' | 'excel' | 'dashboard';
  schedule?: { frequency: 'daily' | 'weekly' | 'monthly'; recipients: string[] };
  filters: Record<string, any>;
  createdAt: Date;
}

export interface Dashboard {
  id: string;
  title: string;
  widgets: Widget[];
  refreshInterval: number;
}

export interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'map';
  title: string;
  dataSource: string;
  config: Record<string, any>;
}

export interface KPI {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target?: number;
}

export class ReportingAnalyticsEngine {
  private static instance: ReportingAnalyticsEngine;
  static getInstance() { return this.instance || (this.instance = new ReportingAnalyticsEngine()); }

  createReport(params: Omit<Report, 'id' | 'createdAt'>): Report {
    return { ...params, id: crypto.randomUUID(), createdAt: new Date() };
  }

  createDashboard(title: string, widgets: Omit<Widget, 'id'>[]): Dashboard {
    return {
      id: crypto.randomUUID(),
      title,
      widgets: widgets.map(w => ({ ...w, id: crypto.randomUUID() })),
      refreshInterval: 300,
    };
  }

  calculateKPIs(data: any[]): KPI[] {
    return [
      { name: 'Fleet Utilization', value: 87, unit: '%', trend: 'up', target: 90 },
      { name: 'Safety Score', value: 94, unit: 'pts', trend: 'stable', target: 95 },
      { name: 'Compliance Rate', value: 98, unit: '%', trend: 'up', target: 100 },
    ];
  }
}

export const reportingAnalytics = ReportingAnalyticsEngine.getInstance();
