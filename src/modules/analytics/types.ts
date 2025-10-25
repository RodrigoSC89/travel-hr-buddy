/**
 * PATCH 101.0 - Analytics Core Types
 */

export interface DataSource {
  id: string;
  name: string;
  type: "logs" | "finance" | "missions" | "fleet";
  recordCount: number;
  lastUpdated: Date;
  isConnected: boolean;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: "chart" | "metric" | "table";
  dataSource: string;
  config: Record<string, any>;
}

export interface KPIMetric {
  name: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  category: "consumption" | "performance" | "downtime" | "efficiency";
}

export interface AIInsight {
  id: string;
  type: "prediction" | "recommendation" | "alert";
  title: string;
  message: string;
  confidence: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface ExportOptions {
  format: "pdf" | "csv";
  includeCharts: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
