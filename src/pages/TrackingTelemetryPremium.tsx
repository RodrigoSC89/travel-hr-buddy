/**
 * Tracking & Telemetry Premium - Centro de Rastreamento Completo
 * Tier-1 UX: Zero placeholders, real data badges, functional empty states
 */

import React, { Suspense, lazy, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, MapPin, Satellite, Activity, 
  History, Bell, Radio, Brain, Fuel, TrendingUp, Eye,
  RefreshCw, Download, Ship
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/ui/UXStates";

// Lazy load components
const TrackingCommandCenter = lazy(() => import("@/modules/tracking-telemetry/components/TrackingCommandCenter"));
const VesselTrackingMap = lazy(() => import("@/modules/tracking-telemetry/components/VesselTrackingMap"));
const TrackingIntelligence = lazy(() => import("@/components/premium/TrackingIntelligence"));

// FASE 4 - Premium Components
const AlertsNotificationHub = lazy(() => import("@/components/premium/tracking/AlertsNotificationHub"));
const SATCOMDashboard = lazy(() => import("@/components/premium/tracking/SATCOMDashboard"));

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

// Fuel Consumption Tab - Real data
function FuelConsumptionTab() {
  const navigate = useNavigate();
  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["tracking-fuel-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, status, vessel_type, fuel_capacity")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: fuelRecords = [] } = useQuery({
    queryKey: ["tracking-fuel-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fuel_records")
        .select("*")
        .order("record_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (fuelRecords.length === 0 && vessels.length === 0) {
    return (
      <EmptyState
        icon={Fuel}
        title="Sem registros de combustível"
        message="Registros de consumo, bunkering e ROB aparecerão aqui quando disponíveis. Cadastre embarcações primeiro."
        actionLabel="Ver Frota"
        onAction={() => navigate('/ops?tab=fleet')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          Gestão de Combustível
        </h3>
        <Badge variant="outline">{fuelRecords.length} registros</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Embarcações</p>
            <p className="text-2xl font-bold">{vessels.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Registros Fuel</p>
            <p className="text-2xl font-bold">{fuelRecords.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Capacidade Total</p>
            <p className="text-2xl font-bold">
              {vessels.reduce((sum: number, v: Record<string, unknown>) => sum + (Number(v.fuel_capacity) || 0), 0).toLocaleString()} t
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Último Registro</p>
            <p className="text-sm font-bold">
              {fuelRecords[0] ? new Date(fuelRecords[0].record_date).toLocaleDateString('pt-BR') : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {fuelRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum registro de combustível encontrado</p>
          ) : (
            <div className="space-y-2">
              {fuelRecords.slice(0, 10).map((r: Record<string, unknown>) => (
                <div key={String(r.id)} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50">
                  <span className="text-sm font-medium">{String(r.fuel_type || 'Fuel')}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{Number(r.quantity_mt || 0).toFixed(1)} MT</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(String(r.recorded_at)).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Navigation History Tab
function NavigationHistoryTab() {
  interface NavHistoryEntry {
    id: string;
    latitude: number | null;
    longitude: number | null;
    speed_knots: number | null;
    course: number | null;
    recorded_at: string;
  }

  const { data: navHistory = [], isLoading } = useQuery({
    queryKey: ["tracking-nav-history"],
    queryFn: async (): Promise<NavHistoryEntry[]> => {
      const { data, error } = await (supabase.from as Function)("navigation_history")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as NavHistoryEntry[];
    },
    staleTime: 30000,
  });

  if (isLoading) return <LoadingSkeleton />;

  if (navHistory.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Sem histórico de navegação"
        message="O histórico de rotas, posições e análise de viagens será exibido aqui à medida que os dados de AIS/GNSS forem registrados."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Navegação
        </h3>
        <Button variant="outline" size="sm" onClick={() => {
          const csv = ["Data,Latitude,Longitude,Velocidade,Curso", ...navHistory.map((n) => 
            `${n.recorded_at},${n.latitude},${n.longitude},${n.speed_knots || 0},${n.course || 0}`
          )].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'navigation-history.csv'; a.click();
          URL.revokeObjectURL(url);
          toast.success("Histórico exportado");
        }}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {navHistory.slice(0, 20).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {Number(entry.latitude || 0).toFixed(4)}°, {Number(entry.longitude || 0).toFixed(4)}°
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(entry.speed_knots || 0).toFixed(1)} kn | Curso: {entry.course || 0}°
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(String(entry.recorded_at)).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TrackingTelemetryPremium() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  const queryClient = useQueryClient();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Real vessel count for badge
  const { data: vesselStats } = useQuery({
    queryKey: ["tracking-vessel-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, status");
      if (error) throw error;
      const total = data?.length || 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase dynamic query
      const online = (data as any[])?.filter((v) => v.status === 'active' || v.status === 'operational').length || 0;
      return { total, online };
    },
    staleTime: 30000,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Satellite className="h-8 w-8 text-primary" />
            Tracking & Telemetry
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de rastreamento AIS, SATCOM e alertas em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Radio className="h-3 w-3 mr-1 animate-pulse" />
            {vesselStats ? `${vesselStats.online}/${vesselStats.total}` : '...'} Online
          </Badge>
          <Button variant="outline" size="sm" onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["tracking"] });
            toast.success("Dados de tracking atualizados");
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto p-1">
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
          <TabsTrigger value="satcom" className="flex flex-col items-center gap-1 py-2">
            <Satellite className="h-4 w-4" />
            <span className="text-xs">SATCOM</span>
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
          <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs">Dashboard</span>
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
          <Suspense fallback={<LoadingSkeleton />}>
            <AlertsNotificationHub />
          </Suspense>
        </TabsContent>

        <TabsContent value="satcom">
          <Suspense fallback={<LoadingSkeleton />}>
            <SATCOMDashboard />
          </Suspense>
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
          <FuelConsumptionTab />
        </TabsContent>

        <TabsContent value="history">
          <NavigationHistoryTab />
        </TabsContent>

        <TabsContent value="dashboard">
          <Suspense fallback={<LoadingSkeleton />}>
            <TrackingCommandCenter />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
