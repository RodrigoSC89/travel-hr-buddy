/**
 * ESG & Emissions Premium - Centro de Sustentabilidade Completo
 * Integra todos os componentes ESG com monitoramento avançado
 */

import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Leaf, Factory, Droplets, Fuel,
  Globe, BarChart3, FileText, Settings, Shield, RefreshCw, Coins
} from "lucide-react";
import { useCIICalculator } from "@/hooks/useCIICalculator";

// Lazy load components
const ESGCommandCenter = lazy(() => import("@/modules/esg-emissions/components/ESGCommandCenter"));
const CarbonTrackingPanel = lazy(() => import("@/modules/esg-emissions/components/CarbonTrackingPanel"));
const MARPOLCompliancePanel = lazy(() => import("@/modules/esg-emissions/components/MARPOLCompliancePanel"));
const ESGFuelOptimizationPanel = lazy(() => import("@/modules/esg-emissions/components/ESGFuelOptimizationPanel"));
const SocialSustainabilityPanel = lazy(() => import("@/modules/esg-emissions/components/SocialSustainabilityPanel"));
const GovernanceESGPanel = lazy(() => import("@/modules/esg-emissions/components/GovernanceESGPanel"));
const ESGAnalyticsBenchmark = lazy(() => import("@/modules/esg-emissions/components/ESGAnalyticsBenchmark"));
const ESGReports = lazy(() => import("@/modules/esg-emissions/components/ESGReports").then(m => ({ default: m.ESGReports })));
const ESGSettings = lazy(() => import("@/modules/esg-emissions/components/ESGSettings").then(m => ({ default: m.ESGSettings })));
const CarbonCreditTradingTab = lazy(() => import("@/components/esg/CarbonCreditTradingTab").then(m => ({ default: m.CarbonCreditTradingTab })));

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={`esg-skel-${i}`} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function ESGEmissionsPremium() {
  const cii = useCIICalculator();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Leaf className="h-8 w-8 text-success" />
            ESG & Emissões
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento ambiental, Carbon Footprint e Compliance IMO/MARPOL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={cii.recalculate} disabled={cii.isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${cii.isLoading ? 'animate-spin' : ''}`} />
            Recalcular CII
          </Button>
          <Badge variant="outline" className="bg-success/10 text-success">
            CII Fleet: {cii.fleetRating} ({cii.fleetAvgCII || '—'})
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            CO₂: {cii.totalCO2.toLocaleString()} t
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="command" className="space-y-6">
        <TabsList className="grid w-full grid-cols-10 h-auto p-1">
          <TabsTrigger value="command" className="flex flex-col items-center gap-1 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs">Comando</span>
          </TabsTrigger>
          <TabsTrigger value="carbon" className="flex flex-col items-center gap-1 py-2">
            <Factory className="h-4 w-4" />
            <span className="text-xs">Carbono</span>
          </TabsTrigger>
          <TabsTrigger value="carbon-trading" className="flex flex-col items-center gap-1 py-2">
            <Coins className="h-4 w-4" />
            <span className="text-xs">Credits</span>
          </TabsTrigger>
          <TabsTrigger value="marpol" className="flex flex-col items-center gap-1 py-2">
            <Globe className="h-4 w-4" />
            <span className="text-xs">MARPOL</span>
          </TabsTrigger>
          <TabsTrigger value="fuel" className="flex flex-col items-center gap-1 py-2">
            <Fuel className="h-4 w-4" />
            <span className="text-xs">Combustível</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex flex-col items-center gap-1 py-2">
            <Droplets className="h-4 w-4" />
            <span className="text-xs">Social</span>
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex flex-col items-center gap-1 py-2">
            <Shield className="h-4 w-4" />
            <span className="text-xs">Governança</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col items-center gap-1 py-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex flex-col items-center gap-1 py-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col items-center gap-1 py-2">
            <Settings className="h-4 w-4" />
            <span className="text-xs">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="command">
          <Suspense fallback={<LoadingSkeleton />}>
            <ESGCommandCenter />
          </Suspense>
        </TabsContent>

        <TabsContent value="carbon">
          <Suspense fallback={<LoadingSkeleton />}>
            <CarbonTrackingPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="carbon-trading">
          <Suspense fallback={<LoadingSkeleton />}>
            <CarbonCreditTradingTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="marpol">
          <Suspense fallback={<LoadingSkeleton />}>
            <MARPOLCompliancePanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="fuel">
          <Suspense fallback={<LoadingSkeleton />}>
            <ESGFuelOptimizationPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="social">
          <Suspense fallback={<LoadingSkeleton />}>
            <SocialSustainabilityPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="governance">
          <Suspense fallback={<LoadingSkeleton />}>
            <GovernanceESGPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<LoadingSkeleton />}>
            <ESGAnalyticsBenchmark />
          </Suspense>
        </TabsContent>

        <TabsContent value="reports">
          <Suspense fallback={<LoadingSkeleton />}>
            <ESGReports />
          </Suspense>
        </TabsContent>

        <TabsContent value="settings">
          <Suspense fallback={<LoadingSkeleton />}>
            <ESGSettings />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
