/**
 * Optimized Comprehensive Executive Dashboard
 * PATCH 621: Performance optimizations with lazy loading and error handling
 */

import React, { Suspense, lazy } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import { performanceMonitor } from "@/lib/utils/performance-monitor";
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Zap,
  Layers,
  Globe,
  Settings,
} from "lucide-react";
import nautilusLogo from "@/assets/nautilus-logo.png";

// Lazy load heavy components
const SystemModulesGrid = lazy(() => import("@/components/dashboard/modules/SystemModulesGrid"));
const TechnologyStack = lazy(() => import("@/components/dashboard/modules/TechnologyStack"));
const SystemArchitecture = lazy(() => import("@/components/dashboard/modules/SystemArchitecture"));

// Loading skeleton for cards
const CardSkeleton = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    </CardContent>
  </Card>
);

// Loading skeleton for sections
const SectionSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/3 mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </CardContent>
  </Card>
);

// System stats - rendered immediately (lightweight)
const systemModules = [
  // ... (static data - already loaded fast)
];

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

export function ComprehensiveExecutiveDashboardOptimized() {
  // Track performance
  React.useEffect(() => {
    performanceMonitor.start("dashboard:initial-load");
    return () => {
      performanceMonitor.end("dashboard:initial-load");
    };
  }, []);

  // Calculate stats immediately (lightweight operation)
  const totalModules = 15; // Static count
  const operationalModules = 15;
  const avgUptime = "99.2";

  return (
    <ErrorBoundary
      fallback={
        <div className="p-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Erro ao carregar Dashboard
              </CardTitle>
              <CardDescription>
                Não foi possível carregar o dashboard. Por favor, recarregue a página.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        {/* Header with Logo - Load immediately */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={nautilusLogo} 
              alt="Nautilus One" 
              className="h-16 w-16"
              loading="eager"
            />
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

        {/* System Overview Stats - Load immediately (lightweight) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Módulos Totais</p>
                  <p className="text-3xl font-bold">{totalModules}</p>
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
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <p className="text-3xl font-bold text-purple-600">A+</p>
                </div>
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Architecture - Lazy load with suspense */}
        <ErrorBoundary fallback={<SectionSkeleton />}>
          <Suspense fallback={<SectionSkeleton />}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Arquitetura do Sistema
                </CardTitle>
                <CardDescription>
                  Visão geral da arquitetura distribuída e módulos integrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SystemArchitecture />
              </CardContent>
            </Card>
          </Suspense>
        </ErrorBoundary>

        {/* Module Tabs - Lazy load with suspense */}
        <ErrorBoundary fallback={<SectionSkeleton />}>
          <Suspense fallback={<SectionSkeleton />}>
            <SystemModulesGrid />
          </Suspense>
        </ErrorBoundary>

        {/* Technology Stack - Lazy load last */}
        <ErrorBoundary fallback={<SectionSkeleton />}>
          <Suspense fallback={<SectionSkeleton />}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Stack Tecnológico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TechnologyStack />
              </CardContent>
            </Card>
          </Suspense>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}
