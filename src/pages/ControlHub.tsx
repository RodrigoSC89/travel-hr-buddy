/**
 * ControlHub - Painel Central de Telemetria e Observabilidade
 * 
 * Dashboard de monitoramento em tempo real com MQTT, AI insights e alertas unificados.
 * 
 * @module ControlHub
 * @version 1.3.0 (Patch 19 - AI Predictive Optimization)
 */

import React, { Suspense } from "react";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { Loader } from "lucide-react";

const ControlHubPanel = safeLazyImport(() => import("@/components/control-hub/ControlHubPanel"), "ControlHubPanel");
const SystemAlerts = safeLazyImport(() => import("@/components/control-hub/SystemAlerts"), "SystemAlerts");
const AIInsightReporter = safeLazyImport(() => import("@/components/control-hub/AIInsightReporter"), "AIInsightReporter");
const ForecastDashboard = safeLazyImport(() => import("@/components/controlhub/ForecastDashboard"), "ForecastDashboard");

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

      {/* Main Grid */}
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
