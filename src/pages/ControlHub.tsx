/**
 * ControlHub - Painel Central de Telemetria e Observabilidade
 * 
 * Dashboard de monitoramento em tempo real com MQTT, AI insights e alertas unificados.
 * 
 * @module ControlHub
 * @version 1.3.0 (Patch 18 - AI Incident Response & Resilience Integration)
 */

import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loader } from "lucide-react";

const ControlHubPanel = safeLazyImport(() => import("@/components/control-hub/ControlHubPanel"), "ControlHubPanel");
const SystemAlerts = safeLazyImport(() => import("@/components/control-hub/SystemAlerts"), "SystemAlerts");
const AIInsightReporter = safeLazyImport(() => import("@/components/control-hub/AIInsightReporter"), "AIInsightReporter");
const ComplianceDashboard = safeLazyImport(() => import("@/components/compliance/ComplianceDashboard"), "ComplianceDashboard");
const ForecastDashboard = safeLazyImport(() => import("@/components/control-hub/ForecastDashboard"), "ForecastDashboard");
const ResilienceMonitor = safeLazyImport(() => import("@/components/resilience/ResilienceMonitor"), "ResilienceMonitor");
const ResilienceComplianceDashboard = safeLazyImport(() => import("@/components/resilience/ComplianceDashboard"), "ComplianceDashboard");
const IncidentResponsePanel = safeLazyImport(() => import("@/components/resilience/IncidentResponsePanel"), "IncidentResponsePanel");
const MaintenanceDashboard = safeLazyImport(() => import("@/components/maintenance/MaintenanceDashboard"), "MaintenanceDashboard");

export default function ControlHub() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">⚓ Control Hub – Observability & AI Insights</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real com MQTT, alertas unificados e análise de IA
          </p>
        </div>
      </div>

      {/* Top Row - 3 Column Grid with Forecast Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<LoadingCard />}>
          <ControlHubPanel />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <SystemAlerts />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <ForecastDashboard />
        </Suspense>
      </div>

      {/* Additional Monitoring Panels - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<LoadingCard />}>
          <ResilienceMonitor />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <ResilienceComplianceDashboard />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <MaintenanceDashboard />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <ComplianceDashboard />
        </Suspense>
      </div>

      {/* Incident Response Panel */}
      <Suspense fallback={<LoadingCard />}>
        <IncidentResponsePanel />
      </Suspense>

      {/* AI Insights */}
      <Suspense fallback={<LoadingCard />}>
        <AIInsightReporter />
      </Suspense>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="flex items-center justify-center p-8 border rounded-lg bg-card">
      <Loader className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
