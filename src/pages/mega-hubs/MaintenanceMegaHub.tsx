/**
 * Maintenance Mega-Hub - Manutenção & Engenharia
 * Rota canônica: /maintenance
 * 
 * Consolida: Maintenance Hub + Drydock + Fuel + Digital Twin + MARPOL + ESG
 * 
 * ✅ WORLD-CLASS COMPONENTS INTEGRATED
 */

import React, { Suspense, lazy, useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wrench, Shield, Brain, Anchor, Fuel, Cpu, Trash2, Leaf, Calendar, Plus, Download, Wifi, Sparkles, BarChart3, Radio } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
// MaintenanceGanttCalendar removed - world-class deleted
import { HubEmptyState } from '@/components/ui/HubEmptyState';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { toast } from 'sonner';

// Lazy load sub-components
const MaintenanceHub = lazy(() => import('@/pages/MaintenanceCommandCenter'));
const ClassSurveysPage = lazy(() => import('@/pages/maintenance/ClassSurveysPage'));
const DrydockManagement = lazy(() => import('@/components/maintenance/DryDockPlanner').then(m => ({ default: () => React.createElement(m.DryDockPlanner) })));
const PredictiveMaintenancePage = lazy(() => import('@/pages/PredictiveMaintenancePage'));
const FuelManagementPage = lazy(() => import('@/pages/FuelManagementPage'));
const DigitalTwinPage = lazy(() => import('@/pages/advanced/DigitalTwin3DPage'));
const WasteManagementPremium = lazy(() => import('@/pages/advanced/MARPOLTrackerPage'));
const ESGEmissionsPremium = lazy(() => import('@/pages/ESGEmissionsPremium'));
const MaintenanceAIHub = lazy(() => import('@/components/maintenance/ai/MaintenanceAIHub'));
const SparePartsInventory = lazy(() => import('@/components/maintenance/SparePartsInventory'));
const PMSEquipmentTree = lazy(() => import('@/components/maintenance/PMSEquipmentTree'));
const DryDockGanttChart = lazy(() => import('@/components/maintenance/DryDockGanttChart').then(m => ({ default: m.DryDockGanttChart })));
const SensorLogbookManager = lazy(() => import('@/components/logbook/SensorLogbookManager').then(m => ({ default: m.SensorLogbookManager })));
const EquipmentHealthMatrix = lazy(() => import('@/components/dashboard/EquipmentHealthMatrix').then(m => ({ default: m.EquipmentHealthMatrix })));
const MaintenanceKPIStrip = lazy(() => import('@/components/dashboard/MaintenanceKPIStrip').then(m => ({ default: m.MaintenanceKPIStrip })));
const BacklogAgingAnalysis = lazy(() => import('@/components/dashboard/BacklogAgingAnalysis').then(m => ({ default: m.BacklogAgingAnalysis })));
const SparePartsCriticality = lazy(() => import('@/components/dashboard/SparePartsCriticality').then(m => ({ default: m.SparePartsCriticality })));
const ReliabilityMetricsPanel = lazy(() => import('@/components/dashboard/ReliabilityMetricsPanel').then(m => ({ default: m.ReliabilityMetricsPanel })));
const WorkOrderPipeline = lazy(() => import('@/components/dashboard/WorkOrderPipeline').then(m => ({ default: m.WorkOrderPipeline })));
const PredictiveFailureHeatmap = lazy(() => import('@/components/dashboard/PredictiveFailureHeatmap'));
const SupplyChainIntelligence = lazy(() => import('@/components/dashboard/SupplyChainIntelligence'));
const AssetIntegrityMatrix = lazy(() => import('@/components/dashboard/AssetIntegrityMatrix'));
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
  { id: 'planning', label: 'PMS Calendar', icon: Calendar },
  { id: 'equipment', label: 'Equipment Tree', icon: Cpu },
  { id: 'surveys', label: 'Class Surveys', icon: Shield },
  { id: 'predictive', label: 'Predictive', icon: Brain },
  { id: 'drydock', label: 'Drydock', icon: Anchor },
  { id: 'fuel', label: 'Fuel & ROB', icon: Fuel },
  { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
  { id: 'waste-marpol', label: 'MARPOL & Waste', icon: Trash2 },
  { id: 'esg', label: 'ESG Emissions', icon: Leaf },
  { id: 'gantt', label: 'Gantt Chart', icon: BarChart3 },
  { id: 'sensor-logbook', label: 'Sensor Logbook', icon: Radio },
  { id: 'ai-hub', label: '🧠 IA Hub', icon: Sparkles },
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
    pending: maintenanceRecords.filter((r: Record<string, unknown>) => r.status === 'pending').length,
    inProgress: maintenanceRecords.filter((r: Record<string, unknown>) => r.status === 'in_progress').length,
    completed: maintenanceRecords.filter((r: Record<string, unknown>) => r.status === 'completed').length,
    vesselsInMaint: vessels.filter((v: Record<string, unknown>) => v.status === 'maintenance').length,
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

  const [woDialogOpen, setWoDialogOpen] = useState(false);
  const [woForm, setWoForm] = useState({ vessel_id: '', component: '', title: '', description: '', priority: 'medium' });

  const handleNewWorkOrder = useCallback(() => {
    setWoDialogOpen(true);
  }, []);

  const handleSubmitWorkOrder = useCallback(async () => {
    if (!woForm.title) { toast.error('Título obrigatório'); return; }
    const { error } = await supabase.from('maintenance_tasks').insert({
      title: woForm.title,
      description: woForm.description || null,
      component_name: woForm.component || null,
      priority: woForm.priority,
      status: 'pending',
      vessel_id: woForm.vessel_id || null,
    });
    if (error) { toast.error('Erro ao criar OS: ' + error.message); return; }
    toast.success('Ordem de Serviço criada');
    queryClient.invalidateQueries({ queryKey: ['maintenance-records-hub'] });
    setWoDialogOpen(false);
    setWoForm({ vessel_id: '', component: '', title: '', description: '', priority: 'medium' });
  }, [woForm, queryClient]);

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
              <div className="p-2 bg-hub-maintenance/10 rounded-lg">
                <Wrench className="h-6 w-6 text-hub-maintenance" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hub de Manutenção</h1>
                <p className="text-sm text-muted-foreground">
                  Ordens de serviço, vistorias de classe, manutenção preditiva, ESG e gêmeo digital
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-hub-maintenance/10 text-hub-maintenance border-hub-maintenance/20">
                {maintMetrics.pending} pendentes
              </Badge>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {maintMetrics.completed} concluídas
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
                  className="data-[state=active]:bg-hub-maintenance data-[state=active]:text-white gap-2"
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
                  <Wifi className="h-3.5 w-3.5 text-success" />
                  <span>Conectado</span>
                </div>
                <span>•</span>
                <span>{maintMetrics.total} ordens registradas</span>
                <span>•</span>
                <span>{maintMetrics.pending} pendentes</span>
                <span>•</span>
                <span>{maintMetrics.vesselsInMaint} embarcações em manutenção</span>
              </div>

              {/* 🆕 Wave 13: Maintenance KPI Command Strip */}
              <MaintenanceKPIStrip />

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

              {/* 🆕 Wave 13: Equipment Health Matrix */}
              <EquipmentHealthMatrix />

              {/* 🆕 Wave 14: Backlog Aging + Spare Parts Criticality */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <BacklogAgingAnalysis />
                <SparePartsCriticality />
              </div>

              {/* 🆕 Wave 15: Reliability Engineering + Work Order Pipeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ReliabilityMetricsPanel />
                <WorkOrderPipeline />
              </div>

              {/* Wave 24: Predictive Failure & Supply Chain Intelligence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PredictiveFailureHeatmap />
                <SupplyChainIntelligence />
              </div>

              {/* Wave 32: Asset Integrity Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <AssetIntegrityMatrix />
                </Suspense>
              </div>

              {!maintLoading && maintMetrics.total === 0 && (
                <HubEmptyState 
                  hub="maintenance" 
                  onPrimaryAction={handleNewWorkOrder} 
                />
              )}

              {/* Original Maintenance Hub */}
              {(maintLoading || maintMetrics.total > 0) && <MaintenanceHub />}
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

              {/* MaintenanceGanttCalendar removed */}
            </TabsContent>
            
            <TabsContent value="equipment" className="mt-0">
              <PMSEquipmentTree />
            </TabsContent>
            
            <TabsContent value="spare-parts" className="mt-0">
              <SparePartsInventory />
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

            <TabsContent value="gantt" className="mt-0">
              <DryDockGanttChart />
            </TabsContent>

            <TabsContent value="sensor-logbook" className="mt-0">
              <SensorLogbookManager />
            </TabsContent>

            <TabsContent value="ai-hub" className="mt-0">
              <MaintenanceAIHub />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>

      {/* Work Order Dialog */}
      <Dialog open={woDialogOpen} onOpenChange={setWoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Ordem de Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={woForm.title} onChange={e => setWoForm(p => ({ ...p, title: e.target.value }))} placeholder="Descrição da OS" /></div>
            <div><Label>Componente</Label><Input value={woForm.component} onChange={e => setWoForm(p => ({ ...p, component: e.target.value }))} placeholder="Ex: Motor Principal" /></div>
            <div><Label>Descrição</Label><Textarea value={woForm.description} onChange={e => setWoForm(p => ({ ...p, description: e.target.value }))} placeholder="Detalhes da ordem..." /></div>
            <div><Label>Prioridade</Label>
              <Select value={woForm.priority} onValueChange={v => setWoForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSubmitWorkOrder}>Criar Ordem de Serviço</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
