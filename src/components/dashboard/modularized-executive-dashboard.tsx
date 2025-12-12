/**
import { useState } from "react";;
 * Modularized Executive Dashboard
 * PATCHES 622-626 - Performance-optimized dashboard with lazy loading
 */

import React, { Suspense, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { CheckCircle, Layers, TrendingUp } from "lucide-react";
import { KPIErrorBoundary } from "./kpis/KPIErrorBoundary";
import { LayoutGrid } from "./LayoutGrid";
import { DashboardWatchdog } from "./DashboardWatchdog";
import { OfflineStatusBanner } from "./OfflineStatusBanner";
import { usePerformanceLog } from "@/hooks/performance/usePerformanceLog";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { usePreviewSafeMode } from "@/hooks/qa/usePreviewSafeMode";
import nautilusLogo from "@/assets/nautilus-logo.png";

// Lazy load KPI components
const RevenueKPI = React.lazy(() => 
  import("./kpis/RevenueKPI").then(module => ({ default: module.RevenueKPI }))
);
const VesselsKPI = React.lazy(() => 
  import("./kpis/VesselsKPI").then(module => ({ default: module.VesselsKPI }))
);
const ComplianceKPI = React.lazy(() => 
  import("./kpis/ComplianceKPI").then(module => ({ default: module.ComplianceKPI }))
);
const EfficiencyKPI = React.lazy(() => 
  import("./kpis/EfficiencyKPI").then(module => ({ default: module.EfficiencyKPI }))
);

/**
 * Loading fallback for KPIs
 */
function KPILoadingFallback({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between animate-pulse">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">{message}</p>
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export const ModularizedExecutiveDashboard = memo(function() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // PATCH 623: Performance monitoring
  usePerformanceLog({ 
    componentName: "ModularizedExecutiveDashboard",
    threshold: 3000,
    onSlowRender: (time) => {
    }
  });

  // PATCH 624: Preview Safe Mode
  const { isValidated, validationPassed } = usePreviewSafeMode({
    componentName: "ModularizedExecutiveDashboard",
    enableValidation: true,
    maxRenderTime: 3000,
    maxDataSize: 5120,
    silenceErrors: true
  });

  // PATCH 624: Offline sync for dashboard metadata
  const { syncState, retry } = useRealtimeSync({
    table: "dashboard_metadata",
    cacheKey: "dashboard_overview",
    select: "*",
    cacheTTL: 3600000 // 1 hour
  });

  const systemModules = 15; // Mock data
  const operationalModules = 14;
  const avgUptime = 98.9;

  /**
   * PATCH 626: Auto-heal function
   */
  const handleAutoHeal = () => {
    setRefreshKey(prev => prev + 1);
  });

  return (
    <div className="space-y-6 p-6" data-dashboard-content key={refreshKey}>
      {/* PATCH 626: Watchdog monitoring */}
      <DashboardWatchdog onHeal={handleAutoHeal} />

      {/* PATCH 624: Offline status banner */}
      <OfflineStatusBanner
        isFromCache={syncState.isFromCache}
        lastSync={syncState.lastSync}
        onRetry={retry}
        retryCount={syncState.retryCount}
        maxRetries={5}
      />

      {/* Header with Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={nautilusLogo} alt="Nautilus One" className="h-16 w-16" />
          <div>
            <h1 className="text-4xl font-bold font-playfair">NAUTILUS ONE</h1>
            <p className="text-muted-foreground mt-1">
              Sistema Revolucionário de Gestão Marítima e IA Distribuída
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-2 py-2 px-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Sistema Operacional
        </Badge>
      </div>

      {/* PATCH 622: Modularized KPIs with lazy loading and error boundaries */}
      {/* PATCH 625: Optimized layout grid */}
      <LayoutGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }}>
        {/* Revenue KPI */}
        <KPIErrorBoundary kpiName="Receita">
          <Suspense fallback={<KPILoadingFallback message="Carregando receita..." />}>
            <div data-kpi-card="revenue">
              <RevenueKPI />
            </div>
          </Suspense>
        </KPIErrorBoundary>

        {/* Vessels KPI */}
        <KPIErrorBoundary kpiName="Embarcações">
          <Suspense fallback={<KPILoadingFallback message="Carregando embarcações..." />}>
            <div data-kpi-card="vessels">
              <VesselsKPI />
            </div>
          </Suspense>
        </KPIErrorBoundary>

        {/* Compliance KPI */}
        <KPIErrorBoundary kpiName="Compliance">
          <Suspense fallback={<KPILoadingFallback message="Carregando compliance..." />}>
            <div data-kpi-card="compliance">
              <ComplianceKPI />
            </div>
          </Suspense>
        </KPIErrorBoundary>

        {/* Efficiency KPI */}
        <KPIErrorBoundary kpiName="Eficiência">
          <Suspense fallback={<KPILoadingFallback message="Carregando eficiência..." />}>
            <div data-kpi-card="efficiency">
              <EfficiencyKPI />
            </div>
          </Suspense>
        </KPIErrorBoundary>
      </LayoutGrid>

      {/* System Overview Stats - Always visible, not lazy loaded */}
      <LayoutGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Módulos Totais</p>
                <p className="text-3xl font-bold">{systemModules}</p>
              </div>
              <Layers className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Operacionais</p>
                <p className="text-3xl font-bold text-green-600">{operationalModules}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime Médio</p>
                <p className="text-3xl font-bold text-blue-600">{avgUptime}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </LayoutGrid>

      {/* System Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>
            Todos os componentes críticos estão operacionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Dashboard modularizado e otimizado</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Monitoramento de performance ativo</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Fallback offline configurado</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Watchdog auto-healing ativo</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
