/**
 * DashboardIntelligencePanel - Aggregates all intelligence widgets
 * Weather, Port ETA, Fuel Trends, Crew Fatigue, Automation, Finance, Offline
 */
import { Suspense, lazy } from "react";
import { WidgetSkeleton, GridSkeleton } from "./IntelligencePanelSkeleton";

const WeatherPortWidget = lazy(() =>
  import("./WeatherPortWidget").then(m => ({ default: m.WeatherPortWidget }))
);
const FuelConsumptionTrends = lazy(() =>
  import("./FuelConsumptionTrends").then(m => ({ default: m.FuelConsumptionTrends }))
);
const CrewFatigueHeatmap = lazy(() =>
  import("./CrewFatigueHeatmap").then(m => ({ default: m.CrewFatigueHeatmap }))
);
const TrendAnalyticsCards = lazy(() =>
  import("./TrendAnalyticsCards").then(m => ({ default: m.TrendAnalyticsCards }))
);
const FleetBenchmarkDashboard = lazy(() =>
  import("@/components/analytics/FleetBenchmarkDashboard")
);
const OperationalAutomationEngine = lazy(() =>
  import("@/components/automation/OperationalAutomationEngine")
);
const FinancialIntegrationDashboard = lazy(() =>
  import("@/components/finance/FinancialIntegrationDashboard")
);
const SyncQueueMonitor = lazy(() =>
  import("@/components/offline/SyncQueueMonitor")
);
const KPIAlertsEngine = lazy(() =>
  import("@/components/alerts/KPIAlertsEngine")
);
const AdvancedPDFReportBuilder = lazy(() =>
  import("@/components/reports/AdvancedPDFReportBuilder")
);
const FleetMapIntelligence = lazy(() =>
  import("@/components/fleet/FleetMapIntelligence")
);
const CrewCompetencyMatrix = lazy(() =>
  import("@/components/crew/CrewCompetencyMatrix")
);
const PredictiveMaintenanceEngine = lazy(() =>
  import("@/components/maintenance/PredictiveMaintenanceEngine")
);

export function DashboardIntelligencePanel() {
  return (
    <div className="space-y-4 mt-4">
      <Suspense fallback={<WidgetSkeleton />}><TrendAnalyticsCards /></Suspense>
      <Suspense fallback={<WidgetSkeleton />}><OperationalAutomationEngine /></Suspense>
      <Suspense fallback={<WidgetSkeleton />}><KPIAlertsEngine /></Suspense>
      <Suspense fallback={<WidgetSkeleton />}><WeatherPortWidget /></Suspense>
      <Suspense fallback={<GridSkeleton />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FuelConsumptionTrends />
          <CrewFatigueHeatmap />
        </div>
      </Suspense>
      <Suspense fallback={<WidgetSkeleton />}><FleetMapIntelligence /></Suspense>
      <Suspense fallback={<WidgetSkeleton />}><CrewCompetencyMatrix /></Suspense>
      <Suspense fallback={<WidgetSkeleton />}><PredictiveMaintenanceEngine /></Suspense>
      <Suspense fallback={<WidgetSkeleton />}><FinancialIntegrationDashboard /></Suspense>
      <Suspense fallback={<GridSkeleton />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FleetBenchmarkDashboard />
          <AdvancedPDFReportBuilder />
        </div>
      </Suspense>
      <Suspense fallback={<WidgetSkeleton />}><SyncQueueMonitor /></Suspense>
    </div>
  );
}
