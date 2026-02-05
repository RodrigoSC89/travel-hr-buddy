/**
 * Tracking & Telemetry Premium - Centro de Rastreamento Completo
 * Integra todos os componentes de telemetria com abas
 */

import React, { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, MapPin, Satellite, Activity, 
  History, Bell, Radio, Brain, Fuel, TrendingUp, Eye
} from "lucide-react";

// Lazy load components
const TrackingCommandCenter = lazy(() => import("@/modules/tracking-telemetry/components/TrackingCommandCenter"));
const VesselTrackingMap = lazy(() => import("@/modules/tracking-telemetry/components/VesselTrackingMap"));
const TrackingIntelligence = lazy(() => import("@/components/premium/TrackingIntelligence"));

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function TrackingTelemetryPremium() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Satellite className="h-8 w-8 text-cyan-500" />
            Tracking & Telemetry
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de rastreamento AIS e telemetria em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Radio className="h-3 w-3 mr-1 animate-pulse" />
            14/15 Online
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600">
            <Brain className="h-3 w-3 mr-1" />
            AIS Intelligence
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1">
          <TabsTrigger value="overview" className="flex flex-col items-center gap-1 py-2">
            <Eye className="h-4 w-4" />
            <span className="text-xs">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex flex-col items-center gap-1 py-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs">Tempo Real</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex flex-col items-center gap-1 py-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Preditiva</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex flex-col items-center gap-1 py-2">
            <Bell className="h-4 w-4" />
            <span className="text-xs">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex flex-col items-center gap-1 py-2">
            <Brain className="h-4 w-4" />
            <span className="text-xs">Intelligence</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex flex-col items-center gap-1 py-2">
            <MapPin className="h-4 w-4" />
            <span className="text-xs">Mapa AIS</span>
          </TabsTrigger>
          <TabsTrigger value="fuel" className="flex flex-col items-center gap-1 py-2">
            <Fuel className="h-4 w-4" />
            <span className="text-xs">Combustível</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2">
            <History className="h-4 w-4" />
            <span className="text-xs">Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Suspense fallback={<LoadingSkeleton />}>
            <TrackingIntelligence />
          </Suspense>
        </TabsContent>

        <TabsContent value="realtime">
          <Suspense fallback={<LoadingSkeleton />}>
            <TrackingCommandCenter />
          </Suspense>
        </TabsContent>

        <TabsContent value="predictive">
          <Suspense fallback={<LoadingSkeleton />}>
            <TrackingIntelligence />
          </Suspense>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Central de Alertas</p>
            <p className="text-sm">Gestão de notificações e geofencing</p>
          </div>
        </TabsContent>

        <TabsContent value="intelligence">
          <Suspense fallback={<LoadingSkeleton />}>
            <TrackingIntelligence />
          </Suspense>
        </TabsContent>

        <TabsContent value="map">
          <Suspense fallback={<LoadingSkeleton />}>
            <VesselTrackingMap />
          </Suspense>
        </TabsContent>

        <TabsContent value="fuel">
          <div className="text-center py-12 text-muted-foreground">
            <Fuel className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Gestão de Combustível</p>
            <p className="text-sm">Consumo, bunkering e eficiência energética</p>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Histórico de Navegação</p>
            <p className="text-sm">Replay de rotas e análise de viagens</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
