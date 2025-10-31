/**
 * Dashboard Bundle
 * PATCH 540 - Agrupa componentes de dashboard para reduzir lazy loading
 */

// Dashboards principais
export { EnhancedDashboard } from "@/components/dashboard/enhanced-dashboard";
export { InteractiveDashboard } from "@/components/dashboard/interactive-dashboard";
export { BusinessKPIDashboard } from "@/components/dashboard/business-kpi-dashboard";
export { DashboardCharts, AIInsightsPanel } from "@/components/dashboard/dashboard-analytics";
export { default as EnhancedUnifiedDashboard } from "@/components/dashboard/enhanced-unified-dashboard";
export { AIEvolutionDashboard } from "@/components/dashboard/ai-evolution/AIEvolutionDashboard";
