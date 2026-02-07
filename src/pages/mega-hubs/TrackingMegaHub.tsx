/**
 * Tracking Mega-Hub - Rastreamento & Telemetria
 * Rota canônica: /tracking
 * 
 * Consolida: Tracking & Telemetry + AIS + SATCOM + Weather Intelligence
 * 
 * ✅ ZERO CONSOLE.LOG HANDLERS
 * ✅ REAL DATA INTEGRATION
 * ✅ SYSTEM STATUS BAR
 * ✅ FUNCTIONAL EXPORT & REFRESH
 */

import React, { Suspense, lazy, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Satellite, Activity, Ship, Radio, Cloud, AlertTriangle, Map, RefreshCw, Download, Filter, Wifi, Bell } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { RealTimeTrackingMap } from '@/components/world-class';
import { HubEmptyState } from '@/components/ui/HubEmptyState';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { toast } from 'sonner';

// Lazy load sub-components
const TrackingTelemetryHub = lazy(() => import('@/pages/TrackingTelemetryPremium'));
const RealTimeTrackingPage = lazy(() => import('@/pages/tracking/RealTimeTrackingPage'));
const AISTrackerPage = lazy(() => import('@/pages/AISTrackerPage'));
const SatcomDashboardEnhanced = lazy(() => import('@/pages/SatcomDashboardEnhanced'));
const WeatherIntelligencePage = lazy(() => import('@/pages/advanced/WeatherIntelligencePage'));
const AlertsCommandCenter = lazy(() => import('@/pages/AlertsCommandCenter'));
const PredictiveTelemetry = lazy(() => import('@/pages/PredictiveTelemetry'));

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

const tabConfig = [
  { id: 'overview', label: 'Overview', icon: Satellite },
  { id: 'live-map', label: 'Live Map', icon: Map },
  { id: 'realtime', label: 'Real-time', icon: Activity },
  { id: 'ais', label: 'AIS Fleet', icon: Ship },
  { id: 'satcom', label: 'SATCOM', icon: Radio },
  { id: 'weather', label: 'Weather AI', icon: Cloud },
  { id: 'predictive', label: 'Predictive', icon: Map },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
];

export default function TrackingMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const queryClient = useQueryClient();
  const { exportToCSV } = useRealActionHandlers();

  // Real data: vessels for tracking
  const { data: vessels = [], isLoading: vesselsLoading } = useQuery({
    queryKey: ['tracking-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, status, vessel_type, flag_state, imo_number, updated_at')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
  });

  // Real data: telemetry alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ['tracking-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telemetry_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
  });

  const trackingMetrics = useMemo(() => ({
    totalVessels: vessels.length,
    activeVessels: vessels.filter((v: any) => v.status === 'active' || v.status === 'operational').length,
    openAlerts: alerts.filter((a: any) => !a.resolved && !a.acknowledged).length,
  }), [vessels, alerts]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['tracking-vessels'] }),
      queryClient.invalidateQueries({ queryKey: ['tracking-alerts'] }),
      queryClient.invalidateQueries({ queryKey: ['fleet-tracking'] }),
    ]);
    toast.success('Posições e alertas atualizados');
  }, [queryClient]);

  const handleExportPositions = useCallback(async () => {
    if (vessels.length === 0) {
      toast.error('Nenhuma embarcação para exportar');
      return;
    }
    const exportData = vessels.map((v: any) => ({
      name: v.name,
      imo: v.imo_number,
      type: v.vessel_type,
      status: v.status,
      flag: v.flag_state,
      last_update: v.updated_at,
    }));
    exportToCSV(exportData, 'fleet-positions');
  }, [vessels, exportToCSV]);

  const handleCreateAlert = useCallback(async () => {
    const { error } = await supabase.from('telemetry_alerts').insert([{
      sensor_id: 'manual',
      alert_type: 'geofence',
      severity: 'medium',
      message: `Alerta manual - ${new Date().toLocaleString('pt-BR')}`,
    }]);
    if (error) {
      toast.error(`Erro ao criar alerta: ${error.message}`);
    } else {
      toast.success('Alerta criado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['tracking-alerts'] });
    }
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-hub-tracking/10 rounded-lg">
                <Satellite className="h-6 w-6 text-hub-tracking" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hub de Rastreamento</h1>
                <p className="text-sm text-muted-foreground">
                  Posições AIS, telemetria, SATCOM, previsão meteorológica e alertas de geofencing
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {trackingMetrics.openAlerts > 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  {trackingMetrics.openAlerts} alertas ativos
                </Badge>
              )}
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {trackingMetrics.totalVessels} rastreadas
              </Badge>
              <Badge variant="outline" className="bg-hub-tracking/10 text-hub-tracking border-hub-tracking/20">
                AIS Ativo
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-12 bg-transparent gap-2 justify-start overflow-x-auto">
              {tabConfig.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-hub-tracking data-[state=active]:text-white gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === 'alerts' && trackingMetrics.openAlerts > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-5 px-1 text-[10px]">
                      {trackingMetrics.openAlerts}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* System Status */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 text-green-500" />
                  <span>Online</span>
                </div>
                <span>•</span>
                <span>{trackingMetrics.totalVessels} embarcações rastreadas</span>
                <span>•</span>
                <span>{trackingMetrics.activeVessels} ativas</span>
                <span>•</span>
                <span>{trackingMetrics.openAlerts} alertas abertos</span>
                <span>•</span>
                <span>Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Enhanced Action Bar */}
              <EnhancedActionBar
                title="Fleet Tracking Command"
                subtitle={`${trackingMetrics.activeVessels} embarcações ativas | ${trackingMetrics.openAlerts} alertas pendentes`}
                actions={[
                  {
                    id: 'refresh-positions',
                    label: 'Refresh Positions',
                    icon: <RefreshCw className="h-4 w-4" />,
                    onClick: handleRefresh,
                    variant: 'default',
                    tooltip: 'Recarregar posições AIS e alertas'
                  },
                  {
                    id: 'live-map',
                    label: 'Live Map',
                    icon: <Map className="h-4 w-4" />,
                    onClick: () => setSearchParams({ tab: 'live-map' }),
                    variant: 'outline',
                    tooltip: 'Abrir mapa interativo ao vivo'
                  },
                  {
                    id: 'new-alert',
                    label: 'Novo Alerta',
                    icon: <Bell className="h-4 w-4" />,
                    onClick: handleCreateAlert,
                    variant: 'outline',
                    tooltip: 'Criar alerta manual de geofencing'
                  }
                ]}
                onRefresh={handleRefresh}
                isRefreshing={vesselsLoading}
                secondaryActions={[
                  {
                    id: 'export-positions',
                    label: 'Exportar Posições (CSV)',
                    icon: <Download className="h-4 w-4" />,
                    onClick: handleExportPositions,
                  }
                ]}
                showSearch
                searchPlaceholder="Search vessels, routes, locations..."
              />

              {/* Empty state when no vessels */}
              {!vesselsLoading && trackingMetrics.totalVessels === 0 && (
                <HubEmptyState 
                  hub="tracking" 
                  onPrimaryAction={() => window.location.href = '/ops'} 
                />
              )}

              {(vesselsLoading || trackingMetrics.totalVessels > 0) && <TrackingTelemetryHub />}
            </TabsContent>

            <TabsContent value="live-map" className="mt-0 space-y-6">
              {/* Enhanced Action Bar for Live Map */}
              <EnhancedActionBar
                title="Live Fleet Map"
                subtitle={`${trackingMetrics.activeVessels} embarcações ativas no mapa`}
                actions={[
                  {
                    id: 'refresh-map',
                    label: 'Refresh',
                    icon: <RefreshCw className="h-4 w-4" />,
                    onClick: handleRefresh,
                    variant: 'default',
                    tooltip: 'Recarregar mapa'
                  },
                  {
                    id: 'filter',
                    label: 'Filters',
                    icon: <Filter className="h-4 w-4" />,
                    onClick: () => { toast.info('Filtros de mapa: use as opções de tipo e status no mapa abaixo'); },
                    variant: 'outline',
                    tooltip: 'Filtrar embarcações por tipo ou status'
                  }
                ]}
                onRefresh={handleRefresh}
                isRefreshing={vesselsLoading}
                secondaryActions={[
                  {
                    id: 'export-map-data',
                    label: 'Exportar Dados do Mapa',
                    icon: <Download className="h-4 w-4" />,
                    onClick: handleExportPositions,
                  }
                ]}
              />

              {/* World-Class Real-Time Tracking Map */}
              <RealTimeTrackingMap />
            </TabsContent>
            
            <TabsContent value="realtime" className="mt-0">
              <RealTimeTrackingPage />
            </TabsContent>
            
            <TabsContent value="ais" className="mt-0">
              <AISTrackerPage />
            </TabsContent>
            
            <TabsContent value="satcom" className="mt-0">
              <SatcomDashboardEnhanced />
            </TabsContent>
            
            <TabsContent value="weather" className="mt-0">
              <WeatherIntelligencePage />
            </TabsContent>
            
            <TabsContent value="predictive" className="mt-0">
              <PredictiveTelemetry />
            </TabsContent>
            
            <TabsContent value="alerts" className="mt-0">
              <AlertsCommandCenter />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
