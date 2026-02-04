/**
 * Tracking & Telemetry Premium - Centro de Rastreamento Completo
 * Integra todos os componentes de telemetria com abas
 */

import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, MapPin, Satellite, Activity, 
  History, Bell, Radio
} from "lucide-react";

// Lazy load components
const TrackingCommandCenter = lazy(() => import("@/modules/tracking-telemetry/components/TrackingCommandCenter"));
const VesselTrackingMap = lazy(() => import("@/modules/tracking-telemetry/components/VesselTrackingMap"));

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
        <Badge variant="outline" className="bg-success/10 text-success">
          <Radio className="h-3 w-3 mr-1 animate-pulse" />
          14/15 Online
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="command" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto p-1">
          <TabsTrigger value="command" className="flex flex-col items-center gap-1 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs">Comando</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex flex-col items-center gap-1 py-2">
            <MapPin className="h-4 w-4" />
            <span className="text-xs">Mapa AIS</span>
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="flex flex-col items-center gap-1 py-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs">Telemetria</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex flex-col items-center gap-1 py-2">
            <History className="h-4 w-4" />
            <span className="text-xs">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex flex-col items-center gap-1 py-2">
            <Bell className="h-4 w-4" />
            <span className="text-xs">Alertas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="command">
          <Suspense fallback={<LoadingSkeleton />}>
            <TrackingCommandCenter />
          </Suspense>
        </TabsContent>

        <TabsContent value="map">
          <Suspense fallback={<LoadingSkeleton />}>
            <VesselTrackingMap />
          </Suspense>
        </TabsContent>

        <TabsContent value="telemetry">
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Painel de Telemetria Avançada</p>
            <p className="text-sm">Sensores IoT e métricas em tempo real</p>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Histórico de Navegação</p>
            <p className="text-sm">Replay de rotas e análise de viagens</p>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Central de Alertas</p>
            <p className="text-sm">Gestão de notificações e geofencing</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
