/**
 * Dashboard Base Components
 * Exportações centralizadas para componentes base de dashboard
 * FASE B.2 - Consolidação de Dashboards
 */

// Base Components
export { ExecutiveDashboardBase } from "./ExecutiveDashboardBase";
export { AnalyticsDashboardBase } from "./AnalyticsDashboardBase";

// Widgets
export { KPICard } from "./widgets/KPICard";
export { ChartWidget } from "./widgets/ChartWidget";
export { MetricIndicator } from "./widgets/MetricIndicator";
export { TableWidget } from "./widgets/TableWidget";
export { FilterPanel } from "./widgets/FilterPanel";

// Hooks
export { useDashboardData } from "./hooks/useDashboardData";
export { useDashboardFilters } from "./hooks/useDashboardFilters";
export { useDashboardExport } from "./hooks/useDashboardExport";

// Types
export * from "@/types/dashboard-config";
