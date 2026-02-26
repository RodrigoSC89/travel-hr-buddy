/**
 * DashboardIntelligencePanel - Aggregates all intelligence widgets
 * Weather, Port ETA, Fuel Trends, Crew Fatigue, Automation, Finance, Offline
 */
import { Suspense, lazy } from "react";

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

export function DashboardIntelligencePanel() {
  return (
    <div className="space-y-4 mt-4">
      <Suspense fallback={null}><TrendAnalyticsCards /></Suspense>
      <Suspense fallback={null}><OperationalAutomationEngine /></Suspense>
      <Suspense fallback={null}><WeatherPortWidget /></Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={null}><FuelConsumptionTrends /></Suspense>
        <Suspense fallback={null}><CrewFatigueHeatmap /></Suspense>
      </div>
      <Suspense fallback={null}><FinancialIntegrationDashboard /></Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={null}><FleetBenchmarkDashboard /></Suspense>
        <Suspense fallback={null}><SyncQueueMonitor /></Suspense>
      </div>
    </div>
  );
}
