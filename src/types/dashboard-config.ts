/**
 * Dashboard Configuration Types
 * Tipos TypeScript para configuração genérica de dashboards
 * FASE B.2 - Consolidação de Dashboards
 */

import { LucideIcon } from "lucide-react";

// ============================================================================
// KPI & METRICS TYPES
// ============================================================================

export interface KPIConfig {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "stable";
  icon?: LucideIcon;
  prefix?: string;
  suffix?: string;
  target?: number;
  color?: string;
  description?: string;
}

export interface MetricConfig {
  id: string;
  label: string;
  value: number;
  target?: number;
  unit?: string;
  color?: string;
  format?: "number" | "percentage" | "currency" | "time";
}

// ============================================================================
// CHART TYPES
// ============================================================================

export type ChartType = "line" | "bar" | "area" | "pie" | "donut" | "radar" | "scatter";

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  data: any[];
  dataKeys?: string[];
  xAxisKey?: string;
  yAxisKey?: string;
  colors?: string[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  customConfig?: Record<string, any>;
}

// ============================================================================
// WIDGET TYPES
// ============================================================================

export type WidgetType = "kpi" | "chart" | "table" | "metric" | "status" | "custom";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title?: string;
  description?: string;
  colspan?: number; // Grid column span (1-12)
  rowspan?: number; // Grid row span
  config: KPIConfig | ChartConfig | MetricConfig | any;
  order?: number;
  visible?: boolean;
  refreshInterval?: number; // milliseconds
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface FilterConfig {
  id: string;
  type: "select" | "date" | "daterange" | "multiselect" | "search";
  label: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  placeholder?: string;
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

export interface LayoutConfig {
  type: "grid" | "flex" | "tabs";
  columns?: number; // For grid layout (default: 12)
  gap?: number; // Gap between items
  responsive?: boolean;
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  widgets: WidgetConfig[];
}

// ============================================================================
// THEME TYPES
// ============================================================================

export interface ThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  backgroundColor?: string;
  cardStyle?: "default" | "bordered" | "elevated" | "flat";
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
}

// ============================================================================
// ACTION TYPES
// ============================================================================

export interface ActionConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost" | "destructive";
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

// ============================================================================
// DATA SOURCE TYPES
// ============================================================================

export interface DataSourceConfig {
  type: "static" | "api" | "supabase" | "realtime";
  endpoint?: string;
  query?: any;
  transform?: (data: any) => any;
  refreshInterval?: number;
  cache?: boolean;
  cacheKey?: string;
}

// ============================================================================
// EXECUTIVE DASHBOARD CONFIG
// ============================================================================

export interface ExecutiveDashboardConfig {
  id: string;
  title: string;
  description?: string;
  layout: LayoutConfig;
  theme?: ThemeConfig;
  widgets: WidgetConfig[];
  tabs?: TabConfig[];
  filters?: FilterConfig[];
  actions?: ActionConfig[];
  dataSource?: DataSourceConfig;
  refreshInterval?: number;
  showHeader?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
}

// ============================================================================
// ANALYTICS DASHBOARD CONFIG
// ============================================================================

export interface AnalyticsDashboardConfig {
  id: string;
  title: string;
  description?: string;
  layout: LayoutConfig;
  theme?: ThemeConfig;
  widgets: WidgetConfig[];
  filters?: FilterConfig[];
  timeRanges?: string[]; // e.g., ["7d", "30d", "90d", "1y"]
  defaultTimeRange?: string;
  categories?: string[];
  actions?: ActionConfig[];
  dataSource?: DataSourceConfig;
  exportFormats?: ("pdf" | "excel" | "csv" | "json")[];
  drillDownEnabled?: boolean;
  realtimeEnabled?: boolean;
  aggregationOptions?: string[];
  compareMode?: boolean;
}

// ============================================================================
// DASHBOARD STATE
// ============================================================================

export interface DashboardState {
  isLoading: boolean;
  error: Error | null;
  data: any;
  filters: Record<string, any>;
  timeRange?: string;
  selectedCategory?: string;
  refreshing?: boolean;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type DashboardType = "executive" | "analytics";

export interface BaseDashboardProps {
  config: ExecutiveDashboardConfig | AnalyticsDashboardConfig;
  className?: string;
  onError?: (error: Error) => void;
  onDataLoad?: (data: any) => void;
}
