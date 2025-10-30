/**
 * Comprehensive Executive Dashboard - Optimized Version
 * Dashboard executivo completo com carregamento progressivo
 * Optimized for Lovable Preview to prevent timeouts and freezes
 */

import React, { Suspense, lazy } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  CheckCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import nautilusLogo from "@/assets/nautilus-logo.png";
import { moduleStats } from "@/lib/data/system-modules";

// Lazy load heavy components for progressive loading
const SystemArchitecture = lazy(() => 
  import("@/components/dashboard/SystemArchitecture").then(m => ({ default: m.SystemArchitecture }))
);
const SystemModulesGrid = lazy(() => 
  import("@/components/dashboard/SystemModulesGrid").then(m => ({ default: m.SystemModulesGrid }))
);
const TechnologyStack = lazy(() => 
  import("@/components/dashboard/TechnologyStack").then(m => ({ default: m.TechnologyStack }))
);

// Simple loading skeleton for individual sections
const SectionSkeleton = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </CardContent>
  </Card>
);

const getStatusColor = (status: string) => {
  switch (status) {
  case "operational":
    return "bg-green-500";
  case "degraded":
    return "bg-yellow-500";
  case "offline":
    return "bg-red-500";
  default:
    return "bg-gray-500";
  }
};

export function ComprehensiveExecutiveDashboard() {
  const { total, operational, avgUptime, performance } = moduleStats;

  return (
    <div className="space-y-6 p-6">
      {/* Header with Logo - Loads immediately (<100ms) */}
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
          <div className={`h-2 w-2 rounded-full ${getStatusColor("operational")} animate-pulse`} />
          Sistema Operacional
        </Badge>
      </div>

      {/* System Overview Stats - KPI Cards (First Paint <500ms) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Módulos Totais</p>
                <p className="text-3xl font-bold">{total}</p>
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
                <p className="text-3xl font-bold text-green-600">{operational}</p>
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
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <p className="text-3xl font-bold text-purple-600">{performance}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Architecture - Lazy Loaded (Progressive 500-1000ms) */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <SystemArchitecture />
        </Suspense>
      </ErrorBoundary>

      {/* Module Tabs - Lazy Loaded (Progressive 1000-1500ms) */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <SystemModulesGrid />
        </Suspense>
      </ErrorBoundary>

      {/* Technology Stack - Lazy Loaded (Progressive 1500-2000ms) */}
      <ErrorBoundary>
        <Suspense fallback={<SectionSkeleton />}>
          <TechnologyStack />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
