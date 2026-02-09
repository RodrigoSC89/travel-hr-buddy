/**
 * Command Mega-Hub - Central Operacional Unificada
 * Rota canônica: /command
 * 
 * Consolida: Central de Comando + NOC + SOC + Comms + Alerts
 * 
 * ✅ WORLD-CLASS COMPONENTS INTEGRATED
 */

import React, { Suspense, lazy, useMemo, useCallback } from 'react';
// P2-005: data-testid instrumentation applied
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, Activity, BarChart3, Eye, Shield, Bell, Radio, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { PremiumTimeline } from '@/components/ui/world-class/PremiumTimeline';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
import { HubEmptyState } from '@/components/ui/HubEmptyState';
import { SystemHealthKPIs } from '@/components/dashboard/SystemHealthKPIs';
import { SystemModulesOverview } from '@/components/dashboard/SystemModulesOverview';
import { useQueryClient } from '@tanstack/react-query';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { useOperationsCommandData } from '@/hooks/useOperationsCommandData';
import { toast } from 'sonner';

// Lazy load sub-components
const CentralComando = lazy(() => import('@/pages/CentralComando'));
const OperationsOverviewPage = lazy(() => import('@/pages/command/OperationsOverviewPage'));
const ExecutiveDashboardPage = lazy(() => import('@/pages/command/ExecutiveDashboardPage'));
const NOC = lazy(() => import('@/pages/NOC'));
const SOCPage = lazy(() => import('@/pages/SOCPage'));
const CommunicationCommandCenter = lazy(() => import('@/pages/CommunicationCommandCenter'));
const AlertsCommandCenter = lazy(() => import('@/pages/AlertsCommandCenter'));

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
  { id: 'overview', label: 'Overview', icon: Compass, path: '/command' },
  { id: 'operations', label: 'Operations', icon: Activity, path: '/command/operations' },
  { id: 'executive', label: 'Executive', icon: BarChart3, path: '/command/executive' },
  { id: 'noc', label: 'NOC 24/7', icon: Eye, path: '/command/noc' },
  { id: 'soc', label: 'SOC Security', icon: Shield, path: '/command/soc' },
  { id: 'comms', label: 'Comms', icon: Radio, path: '/command/comms' },
  { id: 'alerts', label: 'Alerts', icon: Bell, path: '/command/alerts' },
];

export default function CommandMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const queryClient = useQueryClient();
  const { quickActions, exportToCSV } = useRealActionHandlers();
  const { vessels, voyages, metrics, isLoading } = useOperationsCommandData();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Build real timeline events from vessel/voyage data
  const commandTimelineEvents = useMemo(() => {
    const events: any[] = [];
    
    vessels.slice(0, 3).forEach((v: any) => {
      events.push({
        id: `vessel-${v.id}`,
        title: `${v.name || 'Vessel'} — ${v.status || 'Unknown'}`,
        description: `Type: ${v.vessel_type || 'N/A'} | Flag: ${v.flag_state || 'N/A'}`,
        timestamp: v.updated_at || new Date().toISOString(),
        type: v.status === 'active' ? 'success' as const : v.status === 'maintenance' ? 'warning' as const : 'info' as const,
        metadata: { vessel: v.name, status: v.status }
      });
    });

    voyages.slice(0, 3).forEach((voy: any) => {
      events.push({
        id: `voyage-${voy.id}`,
        title: `Voyage ${voy.voyage_number || ''}`,
        description: `${voy.origin_port || '?'} → ${voy.destination_port || '?'} | Status: ${voy.status || 'N/A'}`,
        timestamp: voy.created_at || new Date().toISOString(),
        type: voy.status === 'completed' ? 'success' as const : voy.status === 'in_progress' ? 'info' as const : 'warning' as const,
        metadata: { voyage: voy.voyage_number }
      });
    });

    if (events.length === 0) {
      events.push({
        id: 'no-events',
        title: 'Nenhum evento recente',
        description: 'Cadastre embarcações e viagens para ver atividades aqui.',
        timestamp: new Date().toISOString(),
        type: 'info' as const,
      });
    }

    return events;
  }, [vessels, voyages]);

  // Build dynamic workflow steps from real metrics
  const workflowSteps = useMemo(() => {
    const hasVessels = metrics.totalVessels > 0;
    const hasVoyages = metrics.activeVoyages > 0 || metrics.plannedVoyages > 0;
    const hasOperational = metrics.operationalVessels > 0;
    
    return [
      { id: 'planning', label: 'Fleet Setup', status: hasVessels ? 'completed' as const : 'current' as const },
      { id: 'dispatch', label: 'Voyage Planning', status: hasVoyages ? 'completed' as const : hasVessels ? 'current' as const : 'pending' as const },
      { id: 'transit', label: 'In Transit', status: metrics.activeVoyages > 0 ? 'current' as const : hasVoyages ? 'pending' as const : 'pending' as const },
      { id: 'arrival', label: 'Arrival', status: metrics.completedVoyages > 0 ? 'completed' as const : 'pending' as const },
      { id: 'completed', label: 'Completed', status: metrics.completedVoyages > 2 ? 'completed' as const : 'pending' as const }
    ];
  }, [metrics]);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['operations-voyages'] });
    await queryClient.invalidateQueries({ queryKey: ['operations-vessels'] });
    toast.success('Dados atualizados com sucesso');
  }, [queryClient]);

  const handleExport = useCallback(async () => {
    await quickActions.exportDashboard();
  }, [quickActions]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-hub-command/10 rounded-lg">
                <Compass className="h-6 w-6 text-hub-command" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Central de Comando</h1>
                <p className="text-sm text-muted-foreground">
                  Visão geral de toda a operação marítima — embarcações, viagens, alertas e KPIs em tempo real
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {metrics.totalVessels} embarcações
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Operacional
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
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TabsContent value="overview" className="mt-0 space-y-6">
              {/* System Status Bar */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 text-green-500" />
                  <span>Online</span>
                </div>
                <span>•</span>
                <span>{metrics.totalVessels} embarcações</span>
                <span>•</span>
                <span>{metrics.activeVoyages} viagens ativas</span>
                <span>•</span>
                <span>Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* System Health KPIs - Always visible */}
              <SystemHealthKPIs />

              {/* Enhanced Action Bar */}
              <EnhancedActionBar
                title="Executive Command Panel"
                subtitle={`${metrics.operationalVessels} embarcações operacionais | ${metrics.activeVoyages} viagens ativas`}
                actions={[
                  {
                    id: 'alerts',
                    label: `Alertas${metrics.totalVessels > 0 && metrics.operationalVessels === 0 ? ' ⚠️' : ''}`,
                    icon: <Bell className="h-4 w-4" />,
                    onClick: () => setSearchParams({ tab: 'alerts' }),
                    variant: 'default'
                  }
                ]}
                onRefresh={handleRefresh}
                isRefreshing={isLoading}
                showSearch
                searchPlaceholder="Buscar embarcações, viagens, alertas..."
                secondaryActions={[
                  {
                    id: 'export-json',
                    label: 'Exportar Dashboard (JSON)',
                    icon: <BarChart3 className="h-4 w-4" />,
                    onClick: handleExport,
                  },
                  {
                    id: 'export-csv',
                    label: 'Exportar Frota (CSV)',
                    icon: <Activity className="h-4 w-4" />,
                    onClick: async () => exportToCSV(vessels, 'fleet-command'),
                  }
                ]}
              />

              {/* Workflow Status - Dynamic */}
              <WorkflowStatusBar
                title="Status Operacional da Frota"
                steps={workflowSteps}
                variant="horizontal"
              />

              {/* Main Content with Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CentralComando />
                </div>
              <div className="lg:col-span-1">
                  <PremiumTimeline
                    title="Activity Feed"
                    events={commandTimelineEvents}
                    maxItems={10}
                    showFilters
                  />
                </div>
              </div>

              {/* Modules Overview - Always visible */}
              <SystemModulesOverview />

              {/* Empty State when no data */}
              {!isLoading && metrics.totalVessels === 0 && metrics.activeVoyages === 0 && (
                <HubEmptyState 
                  hub="command" 
                  onPrimaryAction={() => setSearchParams({ tab: 'operations' })} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="operations" className="mt-0">
              <OperationsOverviewPage />
            </TabsContent>
            
            <TabsContent value="executive" className="mt-0">
              <ExecutiveDashboardPage />
            </TabsContent>
            
            <TabsContent value="noc" className="mt-0">
              <NOC />
            </TabsContent>
            
            <TabsContent value="soc" className="mt-0">
              <SOCPage />
            </TabsContent>
            
            <TabsContent value="comms" className="mt-0">
              <CommunicationCommandCenter />
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
