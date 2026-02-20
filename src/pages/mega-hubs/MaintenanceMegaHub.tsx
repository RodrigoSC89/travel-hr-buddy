/**
 * Maintenance Mega-Hub - Manutenção & Engenharia
 * Rota canônica: /maintenance
 * 
 * P2: Consolidated from 15 tabs to 9 grouped tabs
 * ✅ ZERO FEATURE LOSS
 * ✅ BACKWARD COMPATIBLE DEEP LINKS
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
import { Wrench, Shield, Brain, Anchor, Fuel, Cpu, Trash2, Leaf, Calendar, Plus, Download, Wifi, Sparkles, BarChart3, Radio, Vibrate } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
import { HubEmptyState } from '@/components/ui/HubEmptyState';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { toast } from 'sonner';
import { CrossModulePanel } from '@/components/integration';
import { publishEvent } from '@/lib/events/event-bus';
import { HubModulesBrowser } from '@/components/ui/HubModulesBrowser';
import { MAINTENANCE_ABSORBED, MAINTENANCE_TAB_MODULES } from '@/lib/hub-absorbed-modules';
import { TabTriggerWithModules } from '@/components/ui/TabTriggerWithModules';
import { ModuleLauncherModal } from '@/components/ui/ModuleLauncherModal';
import { SubTabSelector } from '@/components/ui/SubTabSelector';

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
const DrydockCostOptimizer = lazy(() => import('@/components/dashboard/DrydockCostOptimizer'));
const DrydockProjectTracker = lazy(() => import('@/components/dashboard/DrydockProjectTracker').then(m => ({ default: m.DrydockProjectTracker })));
const PMSCalendarView = lazy(() => import('@/components/maintenance/PMSCalendarView').then(m => ({ default: m.PMSCalendarView })));
const MaintenanceBacklogAnalytics = lazy(() => import('@/components/dashboard/MaintenanceBacklogAnalytics').then(m => ({ default: m.MaintenanceBacklogAnalytics })));
const MaintenanceCostTrend = lazy(() => import('@/components/dashboard/MaintenanceCostTrend').then(m => ({ default: m.MaintenanceCostTrend })));
const InventoryCriticalityDashboard = lazy(() => import('@/components/dashboard/InventoryCriticalityDashboard').then(m => ({ default: m.InventoryCriticalityDashboard })));
const EquipmentFailurePredictionMap = lazy(() => import('@/components/dashboard/EquipmentFailurePredictionMap').then(m => ({ default: m.EquipmentFailurePredictionMap })));
const WarrantyClaimsTracker = lazy(() => import('@/components/dashboard/WarrantyClaimsTracker').then(m => ({ default: m.WarrantyClaimsTracker })));
const SparePartsIntelligence = lazy(() => import('@/components/dashboard/SparePartsIntelligence').then(m => ({ default: m.SparePartsIntelligence })));
const ConditionBasedMaintenanceTab = lazy(() => import('@/components/maintenance/ConditionBasedMaintenanceTab').then(m => ({ default: m.ConditionBasedMaintenanceTab })));

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
    <Skeleton className="h-64" />
  </div>
);

/**
 * P2: Consolidated from 15 tabs to 9 grouped tabs
 * Old 15: overview, planning, equipment, spare-parts, surveys, predictive, drydock, fuel, digital-twin, waste-marpol, esg, gantt, sensor-logbook, cbm, ai-hub
 * New 9:
 * 1. overview     → Overview
 * 2. planning     → Planning (PMS Calendar + Gantt subtabs)
 * 3. equipment    → Equipment (Equipment Tree + CBM + Sensor Logbook subtabs)
 * 4. spare-parts  → Spare Parts
 * 5. surveys      → Surveys & Predictive (Surveys + Predictive subtabs)
 * 6. drydock      → Drydock
 * 7. environment  → Fuel & Environment (Fuel + MARPOL + ESG subtabs)
 * 8. digital-twin → Digital Twin
 * 9. ai-hub       → IA Hub
 */
const tabConfig = [
  { id: 'overview', label: 'Overview', icon: Wrench },
  { id: 'planning', label: 'PMS & Planning', icon: Calendar },
  { id: 'equipment', label: 'Equipment', icon: Cpu },
  { id: 'spare-parts', label: 'Spare Parts', icon: Wrench },
  { id: 'surveys', label: 'Surveys & Predictive', icon: Shield },
  { id: 'drydock', label: 'Drydock', icon: Anchor },
  { id: 'environment', label: 'Fuel & Environment', icon: Leaf },
  { id: 'digital-twin', label: 'Digital Twin', icon: Cpu },
  { id: 'ai-hub', label: '🧠 IA Hub', icon: Sparkles },
];

const TAB_MIGRATION: Record<string, string> = {
  'gantt': 'planning',
  'cbm': 'equipment',
  'sensor-logbook': 'equipment',
  'predictive': 'surveys',
  'fuel': 'environment',
  'waste-marpol': 'environment',
  'esg': 'environment',
};

export default function MaintenanceMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'overview';
  const activeTab = TAB_MIGRATION[rawTab] || rawTab;
  const mode = searchParams.get('mode');
  const activeModuleId = searchParams.get('module');
  const [launcherOpen, setLauncherOpen] = useState(false);
  const queryClient = useQueryClient();
  const { createMaintenanceOrder, exportToCSV } = useRealActionHandlers();

  // Sub-tab state
  const [planningSubTab, setPlanningSubTab] = useState<'calendar' | 'gantt'>('calendar');
  const [equipmentSubTab, setEquipmentSubTab] = useState<'tree' | 'cbm' | 'sensor'>('tree');
  const [surveysSubTab, setSurveysSubTab] = useState<'surveys' | 'predictive'>('surveys');
  const [environmentSubTab, setEnvironmentSubTab] = useState<'fuel' | 'marpol' | 'esg'>('fuel');

  // Initialize sub-tab from old deep-link
  React.useEffect(() => {
    if (rawTab === 'gantt') setPlanningSubTab('gantt');
    if (rawTab === 'cbm') setEquipmentSubTab('cbm');
    if (rawTab === 'sensor-logbook') setEquipmentSubTab('sensor');
    if (rawTab === 'predictive') setSurveysSubTab('predictive');
    if (rawTab === 'fuel') setEnvironmentSubTab('fuel');
    if (rawTab === 'waste-marpol') setEnvironmentSubTab('marpol');
    if (rawTab === 'esg') setEnvironmentSubTab('esg');
  }, [rawTab]);

  // Real maintenance data
  const { data: maintenanceRecords = [], isLoading: maintLoading } = useQuery({
    queryKey: ['maintenance-records-hub'],
    queryFn: async () => {
      const { data, error } = await supabase.from('maintenance_records').select('*').order('created_at', { ascending: false }).limit(50);
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

  const maintMetrics = useMemo(() => ({
    total: maintenanceRecords.length,
    pending: maintenanceRecords.filter((r: Record<string, unknown>) => r.status === 'pending').length,
    inProgress: maintenanceRecords.filter((r: Record<string, unknown>) => r.status === 'in_progress').length,
    completed: maintenanceRecords.filter((r: Record<string, unknown>) => r.status === 'completed').length,
    vesselsInMaint: vessels.filter((v: Record<string, unknown>) => v.status === 'maintenance').length,
  }), [maintenanceRecords, vessels]);

  const workflowSteps = useMemo(() => [
    { id: 'request', label: 'Solicitação', status: maintMetrics.total > 0 ? 'completed' as const : 'current' as const },
    { id: 'planning', label: 'Planejamento', status: maintMetrics.pending > 0 ? 'current' as const : maintMetrics.total > 0 ? 'completed' as const : 'pending' as const },
    { id: 'approval', label: 'Aprovação', status: maintMetrics.inProgress > 0 ? 'completed' as const : maintMetrics.pending > 0 ? 'current' as const : 'pending' as const },
    { id: 'execution', label: 'Execução', status: maintMetrics.inProgress > 0 ? 'current' as const : 'pending' as const },
    { id: 'verification', label: 'Verificação', status: maintMetrics.completed > 0 ? 'completed' as const : 'pending' as const }
  ], [maintMetrics]);

  const handleTabChange = (value: string) => {
    const params: Record<string, string> = { tab: value };
    if (value === 'digital-twin' && mode) params.mode = mode;
    setSearchParams(params);
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['maintenance-records-hub'] });
    await queryClient.invalidateQueries({ queryKey: ['maintenance-vessels'] });
    toast.success('Dados de manutenção atualizados');
  }, [queryClient]);

  const [woDialogOpen, setWoDialogOpen] = useState(false);
  const [woForm, setWoForm] = useState({ vessel_id: '', component: '', title: '', description: '', priority: 'medium' });

  const handleNewWorkOrder = useCallback(() => { setWoDialogOpen(true); }, []);

  const handleSubmitWorkOrder = useCallback(async () => {
    if (!woForm.title) { toast.error('Título obrigatório'); return; }
    try {
      const { PMSService } = await import('@/services/domain/pms-service');
      await PMSService.createWorkOrder({ title: woForm.title, description: woForm.description || null, component_name: woForm.component || null, priority: woForm.priority, vessel_id: woForm.vessel_id || null });
      queryClient.invalidateQueries({ queryKey: ['maintenance-records-hub'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      setWoDialogOpen(false);
      setWoForm({ vessel_id: '', component: '', title: '', description: '', priority: 'medium' });
    } catch (err: any) {
      toast.error('Erro ao criar OS: ' + (err?.message || ''));
    }
  }, [woForm, queryClient]);

  const handleExport = useCallback(async () => { exportToCSV(maintenanceRecords, 'maintenance-records'); }, [maintenanceRecords, exportToCSV]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-hub-maintenance/10 rounded-lg"><Wrench className="h-6 w-6 text-hub-maintenance" /></div>
              <div>
                <h1 className="text-2xl font-bold">Hub de Manutenção</h1>
                <p className="text-sm text-muted-foreground">Ordens de serviço, vistorias de classe, manutenção preditiva, ESG e gêmeo digital</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-hub-maintenance/10 text-hub-maintenance border-hub-maintenance/20">{maintMetrics.pending} pendentes</Badge>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">{maintMetrics.completed} concluídas</Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-auto flex-wrap bg-transparent gap-1.5 justify-start py-2">
              {tabConfig.map((tab) => (
                <TabTriggerWithModules key={tab.id} tabId={tab.id} label={tab.label} icon={tab.icon} modules={MAINTENANCE_TAB_MODULES[tab.id] || []} onModuleSelect={(moduleId) => setSearchParams({ tab: 'modules', module: moduleId })} onOpenLauncher={() => setLauncherOpen(true)} />
              ))}
            </TabsList>
          </div>
        </div>

        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            {/* Overview - unchanged */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-1.5"><Wifi className="h-3.5 w-3.5 text-success" /><span>Conectado</span></div>
                <span>•</span><span>{maintMetrics.total} ordens registradas</span>
                <span>•</span><span>{maintMetrics.pending} pendentes</span>
                <span>•</span><span>{maintMetrics.vesselsInMaint} embarcações em manutenção</span>
              </div>
              <MaintenanceKPIStrip />
              <EnhancedActionBar title="Centro de Manutenção" subtitle={`${maintMetrics.inProgress} em execução | ${maintMetrics.pending} pendentes | ${maintMetrics.completed} concluídas`}
                actions={[
                  { id: 'new-work-order', label: 'Nova OS', icon: <Plus className="h-4 w-4" />, onClick: handleNewWorkOrder, variant: 'default', tooltip: 'Criar nova ordem de serviço' },
                  { id: 'schedule-survey', label: 'Vistorias', icon: <Calendar className="h-4 w-4" />, onClick: () => setSearchParams({ tab: 'surveys' }), variant: 'outline' },
                ]}
                onRefresh={handleRefresh} isRefreshing={maintLoading}
                secondaryActions={[
                  { id: 'export-csv', label: 'Exportar CSV', icon: <Download className="h-4 w-4" />, onClick: handleExport },
                  { id: 'planning', label: 'Planejamento Gantt', icon: <Calendar className="h-4 w-4" />, onClick: () => { setSearchParams({ tab: 'planning' }); setPlanningSubTab('gantt'); } }
                ]}
                showSearch searchPlaceholder="Buscar ordens, embarcações, equipamentos..."
              />
              <WorkflowStatusBar title="Fluxo de Manutenção" steps={workflowSteps} variant="horizontal" />
              <EquipmentHealthMatrix />
              <Suspense fallback={<Skeleton className="h-64" />}><MaintenanceBacklogAnalytics /></Suspense>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><BacklogAgingAnalysis /><SparePartsCriticality /></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><ReliabilityMetricsPanel /><WorkOrderPipeline /></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><PredictiveFailureHeatmap /><SupplyChainIntelligence /></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Suspense fallback={<Skeleton className="h-64" />}><AssetIntegrityMatrix /></Suspense></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}><DrydockCostOptimizer /></Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}><DrydockProjectTracker /></Suspense>
              </div>
              <Suspense fallback={<Skeleton className="h-80" />}><EquipmentFailurePredictionMap /></Suspense>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-80" />}><MaintenanceCostTrend /></Suspense>
                <Suspense fallback={<Skeleton className="h-80" />}><InventoryCriticalityDashboard /></Suspense>
              </div>
              <Suspense fallback={<Skeleton className="h-80" />}><WarrantyClaimsTracker /></Suspense>
              <Suspense fallback={<Skeleton className="h-80" />}><SparePartsIntelligence /></Suspense>
              {!maintLoading && maintMetrics.total === 0 && <HubEmptyState hub="maintenance" onPrimaryAction={handleNewWorkOrder} />}
              {(maintLoading || maintMetrics.total > 0) && <MaintenanceHub />}
              {vessels.length > 0 && <CrossModulePanel entityType="vessel" entityId={vessels[0]?.id} vesselId={vessels[0]?.id} showQuickActions showActivityFeed />}
            </TabsContent>

            {/* PMS & Planning (merged: calendar + gantt) */}
            <TabsContent value="planning" className="mt-0 space-y-4">
              <SubTabSelector options={[{ id: 'calendar', label: '📅 PMS Calendar' }, { id: 'gantt', label: '📊 Gantt Chart' }]} active={planningSubTab} onChange={(id) => setPlanningSubTab(id as 'calendar' | 'gantt')} />
              {planningSubTab === 'calendar' && (
                <>
                  <EnhancedActionBar title="Planejamento de Manutenção" subtitle="Visualização Gantt e calendário de atividades"
                    actions={[{ id: 'new-task', label: 'Nova Tarefa', icon: <Plus className="h-4 w-4" />, onClick: handleNewWorkOrder, variant: 'default' }]}
                    onRefresh={handleRefresh} secondaryActions={[{ id: 'export', label: 'Exportar Cronograma', icon: <Download className="h-4 w-4" />, onClick: handleExport }]}
                  />
                  <Suspense fallback={<LoadingSkeleton />}><PMSCalendarView /></Suspense>
                </>
              )}
              {planningSubTab === 'gantt' && <DryDockGanttChart />}
            </TabsContent>

            {/* Equipment (merged: tree + cbm + sensor) */}
            <TabsContent value="equipment" className="mt-0 space-y-4">
              <SubTabSelector options={[{ id: 'tree', label: '🌳 Equipment Tree' }, { id: 'cbm', label: '📈 CBM' }, { id: 'sensor', label: '📡 Sensor Logbook' }]} active={equipmentSubTab} onChange={(id) => setEquipmentSubTab(id as 'tree' | 'cbm' | 'sensor')} />
              {equipmentSubTab === 'tree' && <PMSEquipmentTree />}
              {equipmentSubTab === 'cbm' && <ConditionBasedMaintenanceTab />}
              {equipmentSubTab === 'sensor' && <SensorLogbookManager />}
            </TabsContent>

            <TabsContent value="spare-parts" className="mt-0"><SparePartsInventory /></TabsContent>

            {/* Surveys & Predictive (merged) */}
            <TabsContent value="surveys" className="mt-0 space-y-4">
              <SubTabSelector options={[{ id: 'surveys', label: '🔍 Class Surveys' }, { id: 'predictive', label: '🧠 Predictive' }]} active={surveysSubTab} onChange={(id) => setSurveysSubTab(id as 'surveys' | 'predictive')} />
              {surveysSubTab === 'surveys' && <ClassSurveysPage />}
              {surveysSubTab === 'predictive' && <PredictiveMaintenancePage />}
            </TabsContent>

            <TabsContent value="drydock" className="mt-0"><DrydockManagement /></TabsContent>

            {/* Fuel & Environment (merged: fuel + marpol + esg) */}
            <TabsContent value="environment" className="mt-0 space-y-4">
              <SubTabSelector options={[{ id: 'fuel', label: '⛽ Fuel & ROB' }, { id: 'marpol', label: '🗑️ MARPOL & Waste' }, { id: 'esg', label: '🌱 ESG Emissions' }]} active={environmentSubTab} onChange={(id) => setEnvironmentSubTab(id as 'fuel' | 'marpol' | 'esg')} />
              {environmentSubTab === 'fuel' && <FuelManagementPage />}
              {environmentSubTab === 'marpol' && <WasteManagementPremium />}
              {environmentSubTab === 'esg' && <ESGEmissionsPremium />}
            </TabsContent>

            <TabsContent value="digital-twin" className="mt-0"><DigitalTwinPage /></TabsContent>
            <TabsContent value="ai-hub" className="mt-0"><MaintenanceAIHub /></TabsContent>

            <TabsContent value="modules" className="mt-0">
              <HubModulesBrowser modules={MAINTENANCE_ABSORBED} hubName="Hub de Manutenção" hubColor="text-hub-maintenance" activeModuleId={activeModuleId}
                onModuleSelect={(id) => { if (id) setSearchParams({ tab: 'modules', module: id }); else setSearchParams({ tab: 'modules' }); }}
              />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>

      {/* Work Order Dialog */}
      <Dialog open={woDialogOpen} onOpenChange={setWoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nova Ordem de Serviço</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título *</Label><Input value={woForm.title} onChange={e => setWoForm(p => ({ ...p, title: e.target.value }))} placeholder="Descrição da OS" /></div>
            <div><Label>Componente</Label><Input value={woForm.component} onChange={e => setWoForm(p => ({ ...p, component: e.target.value }))} placeholder="Ex: Motor Principal" /></div>
            <div><Label>Descrição</Label><Textarea value={woForm.description} onChange={e => setWoForm(p => ({ ...p, description: e.target.value }))} placeholder="Detalhes da ordem..." /></div>
            <div><Label>Prioridade</Label>
              <Select value={woForm.priority} onValueChange={v => setWoForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSubmitWorkOrder}>Criar Ordem de Serviço</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ModuleLauncherModal open={launcherOpen} onOpenChange={setLauncherOpen} hubName="Toolkit de Engenharia" hubIcon={<Wrench className="h-5 w-5" />} modules={MAINTENANCE_ABSORBED} onModuleSelect={(moduleId) => setSearchParams({ tab: 'modules', module: moduleId })} />
    </div>
  );
}
