/**
 * Ops Mega-Hub - Operações & Contratos
 * Rota canônica: /ops
 * 
 * Consolida: Operations Command + Maritime + Fleet + Voyage + Missions + Logistics + Contracts
 * 
 * ✅ WORLD-CLASS COMPONENTS INTEGRATED
 */

import React, { Suspense, lazy, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Compass, Anchor, Ship, Map, Target, Package, FileText, Plus, CheckCircle, Wifi, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
import { OperationsActionPanel } from '@/components/world-class';
import { useQueryClient } from '@tanstack/react-query';
import { useOperationsCommandData } from '@/hooks/useOperationsCommandData';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { toast } from 'sonner';
// Lazy load sub-components
const OperationsCommandHub = lazy(() => import('@/pages/OperationsCommandHubEnhanced'));
const MaritimeCommandCenter = lazy(() => import('@/pages/MaritimeCommandCenter'));
const FleetCommandCenter = lazy(() => import('@/pages/FleetCommandCenter'));
const VoyageCommandCenter = lazy(() => import('@/pages/VoyageCommandCenter'));
const MissionCommandCenter = lazy(() => import('@/pages/MissionCommandCenter'));
const LogisticsCommandPage = lazy(() => import('@/pages/LogisticsCommandPage'));
const VesselContractsUnified = lazy(() => import('@/pages/VesselContractsUnified'));

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
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'maritime', label: 'Maritime', icon: Anchor },
  { id: 'fleet', label: 'Fleet', icon: Ship },
  { id: 'voyage', label: 'Voyage', icon: Map },
  { id: 'missions', label: 'Missions', icon: Target },
  { id: 'logistics', label: 'Logistics', icon: Package },
  { id: 'contracts', label: 'Contracts', icon: FileText },
];

export default function OpsMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [showActionPanel, setShowActionPanel] = useState(true);
  const queryClient = useQueryClient();
  const { vessels, voyages, metrics, isLoading } = useOperationsCommandData();
  const { exportToCSV } = useRealActionHandlers();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['operations-voyages'] });
    await queryClient.invalidateQueries({ queryKey: ['operations-vessels'] });
    toast.success('Dados operacionais atualizados');
  }, [queryClient]);

  const handleExport = useCallback(() => {
    if (vessels.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }
    exportToCSV(vessels, 'operations-fleet');
  }, [vessels, exportToCSV]);

  const handleActionBarAction = (action: string) => {
    switch (action) {
      case 'new-voyage':
        setSearchParams({ tab: 'overview' });
        window.dispatchEvent(new CustomEvent('ops:new-voyage'));
        break;
      case 'bulk-approve':
        window.dispatchEvent(new CustomEvent('ops:bulk-approve'));
        break;
      default:
        setSearchParams({ tab: action });
    }
  };

  // Dynamic workflow based on real data
  const workflowSteps = useMemo(() => [
    { id: 'request', label: 'Request', status: metrics.totalVessels > 0 ? 'completed' as const : 'current' as const },
    { id: 'planning', label: 'Planning', status: metrics.plannedVoyages > 0 ? 'current' as const : metrics.totalVessels > 0 ? 'completed' as const : 'pending' as const },
    { id: 'approval', label: 'Approval', status: metrics.activeVoyages > 0 ? 'completed' as const : 'pending' as const },
    { id: 'execution', label: 'Execution', status: metrics.activeVoyages > 0 ? 'current' as const : 'pending' as const },
    { id: 'completion', label: 'Completion', status: metrics.completedVoyages > 0 ? 'completed' as const : 'pending' as const }
  ], [metrics]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Compass className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Operations Hub</h1>
                <p className="text-sm text-muted-foreground">Operações & Contratos Marítimos</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              MEGA-HUB B
            </Badge>
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
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white gap-2"
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
              {/* System Status */}
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
                <span>{metrics.plannedVoyages} planejadas</span>
              </div>

              {/* Enhanced Action Bar */}
              <EnhancedActionBar
                title="Operations Command Center"
                subtitle={`${metrics.operationalVessels} embarcações operacionais | ${metrics.activeVoyages} viagens ativas`}
                actions={[
                  {
                    id: 'new-voyage',
                    label: 'New Voyage',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('new-voyage'),
                    variant: 'default',
                    tooltip: 'Criar nova viagem'
                  },
                  {
                    id: 'new-contract',
                    label: 'New Contract',
                    icon: <FileText className="h-4 w-4" />,
                    onClick: () => setSearchParams({ tab: 'contracts' }),
                    variant: 'outline',
                    tooltip: 'Ir para contratos'
                  },
                  {
                    id: 'bulk-approve',
                    label: 'Bulk Approve',
                    icon: <CheckCircle className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('bulk-approve'),
                    variant: 'outline',
                    tooltip: 'Aprovar operações em lote'
                  }
                ]}
                onRefresh={handleRefresh}
                isRefreshing={isLoading}
                secondaryActions={[
                  {
                    id: 'export-fleet',
                    label: 'Exportar Frota (CSV)',
                    icon: <Download className="h-4 w-4" />,
                    onClick: handleExport,
                  }
                ]}
                showSearch
                searchPlaceholder="Search voyages, vessels, contracts..."
              />

              {/* Workflow Status - Dynamic */}
              <WorkflowStatusBar
                title="Operations Workflow"
                steps={workflowSteps}
                variant="horizontal"
              />

              {/* Operations Action Panel with Real Data */}
              {showActionPanel && <OperationsActionPanel />}

              {/* Original Operations Hub */}
              <OperationsCommandHub />
            </TabsContent>
            
            <TabsContent value="maritime" className="mt-0">
              <MaritimeCommandCenter />
            </TabsContent>
            
            <TabsContent value="fleet" className="mt-0">
              <FleetCommandCenter />
            </TabsContent>
            
            <TabsContent value="voyage" className="mt-0">
              <VoyageCommandCenter />
            </TabsContent>
            
            <TabsContent value="missions" className="mt-0">
              <MissionCommandCenter />
            </TabsContent>
            
            <TabsContent value="logistics" className="mt-0">
              <LogisticsCommandPage />
            </TabsContent>
            
            <TabsContent value="contracts" className="mt-0">
              <VesselContractsUnified />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
