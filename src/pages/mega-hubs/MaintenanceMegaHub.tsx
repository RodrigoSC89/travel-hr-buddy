/**
 * Maintenance Mega-Hub - Manutenção & Engenharia
 * Rota canônica: /maintenance
 * 
 * Consolida: Maintenance Hub + Drydock + Fuel + Digital Twin + MARPOL + ESG
 * 
 * ✅ WORLD-CLASS COMPONENTS INTEGRATED
 */

import React, { Suspense, lazy, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wrench, Shield, Brain, Anchor, Fuel, Cpu, Trash2, Leaf, Calendar, Plus, Download, Wifi } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
import { MaintenanceGanttCalendar } from '@/components/world-class';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { toast } from 'sonner';

// Lazy load sub-components
const MaintenanceHub = lazy(() => import('@/pages/MaintenanceHubPremium'));
const ClassSurveysPage = lazy(() => import('@/pages/maintenance/ClassSurveysPage'));
const DrydockManagement = lazy(() => import('@/pages/DrydockManagement'));
const PredictiveMaintenancePage = lazy(() => import('@/pages/PredictiveMaintenancePage'));
const FuelManagementPage = lazy(() => import('@/pages/FuelManagementPage'));
const DigitalTwinPage = lazy(() => import('@/pages/DigitalTwinPage'));
const WasteManagementPremium = lazy(() => import('@/pages/WasteManagementPremium'));
const ESGEmissionsPremium = lazy(() => import('@/pages/ESGEmissionsPremium'));

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
  { id: 'overview', label: 'Overview', icon: Wrench },
  { id: 'planning', label: 'Planning', icon: Calendar },
  { id: 'surveys', label: 'Class Surveys', icon: Shield },
  { id: 'predictive', label: 'Predictive', icon: Brain },
  { id: 'drydock', label: 'Drydock', icon: Anchor },
  { id: 'fuel', label: 'Fuel & ROB', icon: Fuel },
  { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
  { id: 'waste-marpol', label: 'MARPOL & Waste', icon: Trash2 },
  { id: 'esg', label: 'ESG Emissions', icon: Leaf },
];

export default function MaintenanceMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const mode = searchParams.get('mode');
  const queryClient = useQueryClient();
  const { createMaintenanceOrder, exportToCSV } = useRealActionHandlers();

  // Real maintenance data
  const { data: maintenanceRecords = [], isLoading: maintLoading } = useQuery({
    queryKey: ['maintenance-records-hub'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['maintenance-vessels'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vessels').select('id, name, status').order('name');
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Dynamic metrics
  const maintMetrics = useMemo(() => ({
    total: maintenanceRecords.length,
    pending: maintenanceRecords.filter((r: any) => r.status === 'pending').length,
    inProgress: maintenanceRecords.filter((r: any) => r.status === 'in_progress').length,
    completed: maintenanceRecords.filter((r: any) => r.status === 'completed').length,
    vesselsInMaint: vessels.filter((v: any) => v.status === 'maintenance').length,
  }), [maintenanceRecords, vessels]);

  // Dynamic workflow
  const workflowSteps = useMemo(() => [
    { id: 'request', label: 'Solicitação', status: maintMetrics.total > 0 ? 'completed' as const : 'current' as const },
    { id: 'planning', label: 'Planejamento', status: maintMetrics.pending > 0 ? 'current' as const : maintMetrics.total > 0 ? 'completed' as const : 'pending' as const },
    { id: 'approval', label: 'Aprovação', status: maintMetrics.inProgress > 0 ? 'completed' as const : maintMetrics.pending > 0 ? 'current' as const : 'pending' as const },
    { id: 'execution', label: 'Execução', status: maintMetrics.inProgress > 0 ? 'current' as const : 'pending' as const },
    { id: 'verification', label: 'Verificação', status: maintMetrics.completed > 0 ? 'completed' as const : 'pending' as const }
  ], [maintMetrics]);

  const handleTabChange = (value: string) => {
    const params: Record<string, string> = { tab: value };
    if (value === 'digital-twin' && mode) {
      params.mode = mode;
    }
    setSearchParams(params);
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['maintenance-records-hub'] });
    await queryClient.invalidateQueries({ queryKey: ['maintenance-vessels'] });
    toast.success('Dados de manutenção atualizados');
  }, [queryClient]);

  const handleNewWorkOrder = useCallback(() => {
    createMaintenanceOrder.mutate({
      title: `OS-${Date.now().toString().slice(-6)}`,
      description: 'Nova ordem de serviço',
      priority: 'medium',
    });
  }, [createMaintenanceOrder]);

  const handleExport = useCallback(async () => {
    exportToCSV(maintenanceRecords, 'maintenance-records');
  }, [maintenanceRecords, exportToCSV]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Wrench className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Maintenance Hub</h1>
                <p className="text-sm text-muted-foreground">Manutenção, ESG & Digital Twin</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              MEGA-HUB C
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
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white gap-2"
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
                  <span>Conectado</span>
                </div>
                <span>•</span>
                <span>{maintMetrics.total} ordens registradas</span>
                <span>•</span>
                <span>{maintMetrics.pending} pendentes</span>
                <span>•</span>
                <span>{maintMetrics.vesselsInMaint} embarcações em manutenção</span>
              </div>

              {/* Enhanced Action Bar */}
              <EnhancedActionBar
                title="Centro de Manutenção"
                subtitle={`${maintMetrics.inProgress} em execução | ${maintMetrics.pending} pendentes | ${maintMetrics.completed} concluídas`}
                actions={[
                  {
                    id: 'new-work-order',
                    label: 'Nova OS',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: handleNewWorkOrder,
                    variant: 'default',
                    tooltip: 'Criar nova ordem de serviço'
                  },
                  {
                    id: 'schedule-survey',
                    label: 'Vistorias',
                    icon: <Calendar className="h-4 w-4" />,
                    onClick: () => setSearchParams({ tab: 'surveys' }),
                    variant: 'outline'
                  },
                ]}
                onRefresh={handleRefresh}
                isRefreshing={maintLoading}
                secondaryActions={[
                  {
                    id: 'export-csv',
                    label: 'Exportar CSV',
                    icon: <Download className="h-4 w-4" />,
                    onClick: handleExport,
                  },
                  {
                    id: 'planning',
                    label: 'Planejamento Gantt',
                    icon: <Calendar className="h-4 w-4" />,
                    onClick: () => setSearchParams({ tab: 'planning' }),
                  }
                ]}
                showSearch
                searchPlaceholder="Buscar ordens, embarcações, equipamentos..."
              />

              {/* Workflow Status - Dynamic */}
              <WorkflowStatusBar
                title="Fluxo de Manutenção"
                steps={workflowSteps}
                variant="horizontal"
              />

              {/* Original Maintenance Hub */}
              <MaintenanceHub />
            </TabsContent>

            <TabsContent value="planning" className="mt-0 space-y-6">
              {/* Enhanced Action Bar for Planning */}
              <EnhancedActionBar
                title="Planejamento de Manutenção"
                subtitle="Visualização Gantt e calendário de atividades"
                actions={[
                  {
                    id: 'new-task',
                    label: 'Nova Tarefa',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: handleNewWorkOrder,
                    variant: 'default'
                  },
                ]}
                onRefresh={handleRefresh}
                secondaryActions={[
                  {
                    id: 'export',
                    label: 'Exportar Cronograma',
                    icon: <Download className="h-4 w-4" />,
                    onClick: handleExport,
                  }
                ]}
              />

              {/* World-Class Gantt Calendar */}
              <MaintenanceGanttCalendar />
            </TabsContent>
            
            <TabsContent value="surveys" className="mt-0">
              <ClassSurveysPage />
            </TabsContent>
            
            <TabsContent value="predictive" className="mt-0">
              <PredictiveMaintenancePage />
            </TabsContent>
            
            <TabsContent value="drydock" className="mt-0">
              <DrydockManagement />
            </TabsContent>
            
            <TabsContent value="fuel" className="mt-0">
              <FuelManagementPage />
            </TabsContent>
            
            <TabsContent value="digital-twin" className="mt-0">
              <DigitalTwinPage />
            </TabsContent>
            
            <TabsContent value="waste-marpol" className="mt-0">
              <WasteManagementPremium />
            </TabsContent>
            
            <TabsContent value="esg" className="mt-0">
              <ESGEmissionsPremium />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
