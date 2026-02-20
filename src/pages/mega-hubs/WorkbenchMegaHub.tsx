/**
 * Workbench Mega-Hub - Centro de Trabalho Unificado
 * Rota canônica: /workbench
 * 
 * P2: Consolidated from 16 tabs to 9 grouped tabs
 * ✅ ZERO FEATURE LOSS
 * ✅ BACKWARD COMPATIBLE DEEP LINKS
 */

import React, { Suspense, lazy, useMemo, useCallback, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Briefcase, FileText, Users, DollarSign, Settings, Plane, Plus, Download, Upload, Calendar, Wifi, Brain, Heart, Stamp, Banknote, ShieldCheck, TreePine } from 'lucide-react';
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
import { WORKBENCH_ABSORBED, WORKBENCH_TAB_MODULES } from '@/lib/hub-absorbed-modules';
import { TabTriggerWithModules } from '@/components/ui/TabTriggerWithModules';
import { ModuleLauncherModal } from '@/components/ui/ModuleLauncherModal';
import { SubTabSelector } from '@/components/ui/SubTabSelector';

// Lazy load
const DocumentCenterHub = lazy(() => import('@/pages/Documents'));
const DocumentVersionControl = lazy(() => import('@/components/documents/DocumentVersionControl'));
const CrewSchedulerGantt = lazy(() => import('@/components/crew/CrewSchedulerGantt'));
const PeopleHub = lazy(() => import('@/components/crew/CrewManagementPremium'));
const FinanceHub = lazy(() => import('@/pages/VoyageAccountingPage'));
const SystemHub = lazy(() => import('@/pages/Settings'));
const TravelCommandPremium = lazy(() => import('@/components/travel/TravelCommandPremium'));
const CrewAIHub = lazy(() => import('@/components/crew/ai/CrewAIHub'));
const FinanceAIHub = lazy(() => import('@/components/finance/ai/FinanceAIHub'));
const DocumentsAIHub = lazy(() => import('@/components/documents/ai/DocumentsAIHub'));
const CrewPoolPlanner = lazy(() => import('@/components/crew/CrewPoolPlanner'));
const TravelItineraryBuilder = lazy(() => import('@/components/travel/TravelItineraryBuilder'));
const ApprovalWorkflow = lazy(() => import('@/components/workflows/ApprovalWorkflow'));
const CrewProductivityPulse = lazy(() => import('@/components/dashboard/CrewProductivityPulse'));
const DocumentIntelligencePanel = lazy(() => import('@/components/dashboard/DocumentIntelligencePanel'));
const WorkflowAutomationEngine = lazy(() => import('@/components/dashboard/WorkflowAutomationEngine'));
const CrewCertificationHeatmap = lazy(() => import('@/components/dashboard/CrewCertificationHeatmap'));
const PayrollIntelligence = lazy(() => import('@/components/dashboard/PayrollIntelligence'));
const CrewRotationOverview = lazy(() => import('@/components/dashboard/CrewRotationOverview').then(m => ({ default: m.CrewRotationOverview })));
const CrewCompetencyRadar = lazy(() => import('@/components/dashboard/CrewCompetencyRadar').then(m => ({ default: m.CrewCompetencyRadar })));
const CashFlowForecast = lazy(() => import('@/components/dashboard/CashFlowForecast').then(m => ({ default: m.CashFlowForecast })));
const CrewOvertimeTracker = lazy(() => import('@/components/dashboard/CrewOvertimeTracker').then(m => ({ default: m.CrewOvertimeTracker })));
const ProcurementPipelineTracker = lazy(() => import('@/components/dashboard/ProcurementPipelineTracker').then(m => ({ default: m.ProcurementPipelineTracker })));
const PayrollSummaryDashboard = lazy(() => import('@/components/dashboard/PayrollSummaryDashboard').then(m => ({ default: m.PayrollSummaryDashboard })));
const DocumentProcessingAnalytics = lazy(() => import('@/components/dashboard/DocumentProcessingAnalytics').then(m => ({ default: m.DocumentProcessingAnalytics })));
const CrewVisaTracker = lazy(() => import('@/components/crew/CrewVisaTracker').then(m => ({ default: m.CrewVisaTracker })));
const AllotmentManagementTab = lazy(() => import('@/components/crew/AllotmentManagementTab').then(m => ({ default: m.AllotmentManagementTab })));
const SupplierScorecard = lazy(() => import('@/components/procurement/SupplierScorecard').then(m => ({ default: m.SupplierScorecard })));
const CarbonCreditTradingTab = lazy(() => import('@/components/esg/CarbonCreditTradingTab').then(m => ({ default: m.CarbonCreditTradingTab })));

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6"><Skeleton className="h-8 w-64" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div><Skeleton className="h-64" /></div>
);

/**
 * P2: Consolidated from 16 tabs to 9 grouped tabs
 * Old 16: docs, docs-control, people, crew-schedule, finance, approvals, travel, itinerary, crew-pool, visa-tracker, allotment, supplier-score, carbon-trading, ai-crew, ai-finance, ai-docs
 * New 9:
 * 1. docs       → Documents (docs + docs-control subtabs)
 * 2. people     → People (people + crew-schedule + crew-pool + visa-tracker subtabs)
 * 3. finance    → Finance (finance + approvals + allotment subtabs)
 * 4. travel     → Travel (travel + itinerary subtabs)
 * 5. procurement → Procurement & ESG (supplier-score + carbon-trading subtabs)
 * 6. ai-hub     → IA Hub (crew AI + finance AI + docs AI subtabs)
 * 7. system     → System (settings)
 */
const sectionConfig = [
  { id: 'docs', label: 'Documents', icon: FileText, color: 'blue' },
  { id: 'people', label: 'People', icon: Users, color: 'green' },
  { id: 'finance', label: 'Finance', icon: DollarSign, color: 'yellow' },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'purple' },
  { id: 'procurement', label: 'Procurement & ESG', icon: ShieldCheck, color: 'orange' },
  { id: 'ai-hub', label: '🧠 IA Hub', icon: Brain, color: 'indigo' },
  { id: 'system', label: 'System', icon: Settings, color: 'gray' },
];

const SECTION_MIGRATION: Record<string, string> = {
  'docs-control': 'docs',
  'crew-schedule': 'people',
  'crew-pool': 'people',
  'visa-tracker': 'people',
  'approvals': 'finance',
  'allotment': 'finance',
  'itinerary': 'travel',
  'supplier-score': 'procurement',
  'carbon-trading': 'procurement',
  'ai-crew': 'ai-hub',
  'ai-finance': 'ai-hub',
  'ai-docs': 'ai-hub',
};

export default function WorkbenchMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { exportToCSV, exportToJSON } = useRealActionHandlers();
  
  const pathSection = location.pathname.split('/')[2] || '';
  const rawSection = pathSection || searchParams.get('section') || 'docs';
  const activeSection = SECTION_MIGRATION[rawSection] || rawSection;
  const activeModuleId = searchParams.get('module');
  const [launcherOpen, setLauncherOpen] = useState(false);

  // Sub-tab state
  const [docsSubTab, setDocsSubTab] = useState<'docs' | 'docs-control'>('docs');
  const [peopleSubTab, setPeopleSubTab] = useState<'people' | 'crew-schedule' | 'crew-pool' | 'visa-tracker'>('people');
  const [financeSubTab, setFinanceSubTab] = useState<'finance' | 'approvals' | 'allotment'>('finance');
  const [travelSubTab, setTravelSubTab] = useState<'travel' | 'itinerary'>('travel');
  const [procurementSubTab, setProcurementSubTab] = useState<'supplier-score' | 'carbon-trading'>('supplier-score');
  const [aiHubSubTab, setAiHubSubTab] = useState<'ai-crew' | 'ai-finance' | 'ai-docs'>('ai-crew');

  // Initialize sub-tab from old deep-link
  React.useEffect(() => {
    if (rawSection === 'docs-control') setDocsSubTab('docs-control');
    if (rawSection === 'crew-schedule') setPeopleSubTab('crew-schedule');
    if (rawSection === 'crew-pool') setPeopleSubTab('crew-pool');
    if (rawSection === 'visa-tracker') setPeopleSubTab('visa-tracker');
    if (rawSection === 'approvals') setFinanceSubTab('approvals');
    if (rawSection === 'allotment') setFinanceSubTab('allotment');
    if (rawSection === 'itinerary') setTravelSubTab('itinerary');
    if (rawSection === 'supplier-score') setProcurementSubTab('supplier-score');
    if (rawSection === 'carbon-trading') setProcurementSubTab('carbon-trading');
    if (rawSection === 'ai-crew') setAiHubSubTab('ai-crew');
    if (rawSection === 'ai-finance') setAiHubSubTab('ai-finance');
    if (rawSection === 'ai-docs') setAiHubSubTab('ai-docs');
  }, [rawSection]);

  // Real data
  const { data: crewMembers = [], isLoading: crewLoading } = useQuery({
    queryKey: ['workbench-crew'],
    queryFn: async () => { const { data, error } = await supabase.from('crew_members').select('id, full_name, rank, status, vessel_id').order('full_name'); if (error) throw error; return data || []; },
    staleTime: 30000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ['workbench-vessels'],
    queryFn: async () => { const { data, error } = await supabase.from('vessels').select('id, name, status').order('name'); if (error) throw error; return data || []; },
    staleTime: 60000,
  });

  const workbenchMetrics = useMemo(() => ({
    totalCrew: crewMembers.length,
    activeCrew: crewMembers.filter((c) => c.status === 'active' || c.status === 'onboard').length,
    totalVessels: vessels.length,
  }), [crewMembers, vessels]);

  const crewWorkflowSteps = useMemo(() => {
    const hasCrew = crewMembers.length > 0;
    const hasAssigned = crewMembers.some((c) => c.vessel_id);
    return [
      { id: 'planning', label: 'Planning', status: hasCrew ? 'completed' as const : 'current' as const },
      { id: 'assignment', label: 'Assignment', status: hasAssigned ? 'completed' as const : hasCrew ? 'current' as const : 'pending' as const },
      { id: 'onboard', label: 'On-board', status: hasAssigned ? 'current' as const : 'pending' as const },
      { id: 'rotation', label: 'Rotation', status: 'pending' as const },
      { id: 'offboard', label: 'Off-board', status: 'pending' as const }
    ];
  }, [crewMembers]);

  const handleSectionChange = (value: string) => { setSearchParams({ section: value }); };
  const handleRefresh = useCallback(async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ['workbench-crew'] }), queryClient.invalidateQueries({ queryKey: ['workbench-vessels'] })]); toast.success('Dados atualizados'); }, [queryClient]);

  const handleDocUpload = useCallback(() => { setSearchParams({ section: 'docs' }); setDocsSubTab('docs'); toast.success('Navegando ao Document Center para upload.'); }, [setSearchParams]);
  const handleNewTemplate = useCallback(() => { navigate('/templates'); }, [navigate]);
  const handleAddCrew = useCallback(async () => { navigate('/workbench?section=people'); toast.success('Navegando ao People Hub para adicionar tripulantes.'); }, [navigate]);
  const handleExportCrew = useCallback(async () => { if (crewMembers.length === 0) { toast.error('Nenhum tripulante para exportar'); return; } exportToCSV(crewMembers.map((c) => ({ nome: c.full_name, cargo: c.rank, status: c.status, embarcacao: c.vessel_id || 'Sem designação' })), 'crew-report'); }, [crewMembers, exportToCSV]);
  const handleNewExpense = useCallback(() => { navigate('/workbench?section=finance'); toast.success('Navegando ao Finance Command.'); }, [navigate]);
  const handleExportFinance = useCallback(async () => { if (vessels.length === 0) { toast.error('Nenhum dado financeiro disponível'); return; } exportToCSV(vessels.map((v) => ({ embarcacao: v.name, status: v.status })), 'finance-report'); }, [vessels, exportToCSV]);
  const handleNewBooking = useCallback(() => { setSearchParams({ section: 'travel' }); }, [setSearchParams]);
  const handleNewIntegration = useCallback(() => { navigate('/integrations'); }, [navigate]);
  const handleExportSchedule = useCallback(async () => { if (crewMembers.length === 0) { toast.error('Nenhum dado de escala disponível'); return; } exportToJSON(crewMembers, 'crew-schedule'); }, [crewMembers, exportToJSON]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-hub-workbench/10 rounded-lg"><Briefcase className="h-6 w-6 text-hub-workbench" /></div>
              <div><h1 className="text-2xl font-bold">Área de Trabalho</h1><p className="text-sm text-muted-foreground">Documentos, tripulação, finanças, viagens e configurações do sistema</p></div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">{workbenchMetrics.activeCrew} tripulantes ativos</Badge>
              <Badge variant="outline" className="bg-hub-workbench/10 text-hub-workbench border-hub-workbench/20">{workbenchMetrics.totalVessels} embarcações</Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={handleSectionChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-auto flex-wrap bg-transparent gap-1.5 justify-start py-2">
              {sectionConfig.map((section) => (
                <TabTriggerWithModules key={section.id} tabId={section.id} label={section.label} icon={section.icon} modules={WORKBENCH_TAB_MODULES[section.id] || []} onModuleSelect={(moduleId) => setSearchParams({ section: 'modules', module: moduleId })} onOpenLauncher={() => setLauncherOpen(true)} />
              ))}
            </TabsList>
          </div>
        </div>

        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            {/* Documents (merged: docs + docs-control) */}
            <TabsContent value="docs" className="mt-0 space-y-6">
              <SubTabSelector options={[{ id: 'docs', label: '📄 Document Center' }, { id: 'docs-control', label: '📋 Version Control' }]} active={docsSubTab} onChange={(id) => setDocsSubTab(id as 'docs' | 'docs-control')} />
              {docsSubTab === 'docs' && (
                <>
                  <EnhancedActionBar title="Document Center" subtitle="Gerencie documentos, templates e base de conhecimento"
                    actions={[
                      { id: 'upload', label: 'Upload Document', icon: <Upload className="h-4 w-4" />, onClick: handleDocUpload, variant: 'default', tooltip: 'Fazer upload de documento' },
                      { id: 'new-template', label: 'New Template', icon: <Plus className="h-4 w-4" />, onClick: handleNewTemplate, variant: 'outline', tooltip: 'Criar novo template' },
                    ]}
                    onRefresh={handleRefresh} showSearch searchPlaceholder="Search documents, templates..."
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Suspense fallback={<Skeleton className="h-64" />}><DocumentIntelligencePanel /></Suspense>
                    <Suspense fallback={<Skeleton className="h-64" />}><CrewProductivityPulse /></Suspense>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Suspense fallback={<Skeleton className="h-64" />}><WorkflowAutomationEngine /></Suspense>
                    <Suspense fallback={<Skeleton className="h-64" />}><CrewCertificationHeatmap /></Suspense>
                  </div>
                  <Suspense fallback={<Skeleton className="h-64" />}><DocumentProcessingAnalytics /></Suspense>
                  <DocumentCenterHub />
                </>
              )}
              {docsSubTab === 'docs-control' && (
                <>
                  <EnhancedActionBar title="Document Version Control" subtitle="Versionamento avançado, metadata e assinaturas digitais"
                    actions={[{ id: 'upload-version', label: 'Upload New Version', icon: <Upload className="h-4 w-4" />, onClick: handleDocUpload, variant: 'default', tooltip: 'Upload de nova versão' }]}
                    onRefresh={handleRefresh}
                  />
                  <DocumentVersionControl />
                </>
              )}
            </TabsContent>

            {/* People (merged: people + crew-schedule + crew-pool + visa-tracker) */}
            <TabsContent value="people" className="mt-0 space-y-6">
              <SubTabSelector options={[{ id: 'people', label: '👥 Crew Management' }, { id: 'crew-schedule', label: '📅 Schedule' }, { id: 'crew-pool', label: '🏊 Crew Pool' }, { id: 'visa-tracker', label: '🛂 Visa Tracker' }]} active={peopleSubTab} onChange={(id) => setPeopleSubTab(id as any)} />
              {peopleSubTab === 'people' && (
                <>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                    <div className="flex items-center gap-1.5"><Wifi className="h-3.5 w-3.5 text-success" /><span>Online</span></div>
                    <span>•</span><span>{workbenchMetrics.totalCrew} tripulantes</span>
                    <span>•</span><span>{workbenchMetrics.activeCrew} ativos</span>
                    <span>•</span><span>{workbenchMetrics.totalVessels} embarcações</span>
                  </div>
                  <EnhancedActionBar title="People Hub" subtitle={`${workbenchMetrics.activeCrew} tripulantes ativos | ${workbenchMetrics.totalCrew} total`}
                    actions={[
                      { id: 'add-crew', label: 'Add Crew Member', icon: <Plus className="h-4 w-4" />, onClick: handleAddCrew, variant: 'default', tooltip: 'Adicionar novo tripulante' },
                      { id: 'schedule', label: 'Crew Schedule', icon: <Calendar className="h-4 w-4" />, onClick: () => setPeopleSubTab('crew-schedule'), variant: 'outline', tooltip: 'Visualizar escalas' },
                    ]}
                    onRefresh={handleRefresh} isRefreshing={crewLoading}
                    secondaryActions={[{ id: 'export-crew', label: 'Exportar Tripulação (CSV)', icon: <Download className="h-4 w-4" />, onClick: handleExportCrew }]}
                    showSearch searchPlaceholder="Search crew, training records..."
                  />
                  <WorkflowStatusBar title="Crew Rotation Cycle" steps={crewWorkflowSteps} variant="horizontal" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Suspense fallback={<Skeleton className="h-80" />}><CrewRotationOverview /></Suspense>
                    <Suspense fallback={<Skeleton className="h-80" />}><CrewCompetencyRadar /></Suspense>
                  </div>
                  <Suspense fallback={<Skeleton className="h-64" />}><CrewOvertimeTracker /></Suspense>
                  <PeopleHub />
                  {crewMembers.length > 0 && <CrossModulePanel entityType="crew_member" entityId={crewMembers[0]?.id} vesselId={crewMembers[0]?.vessel_id ?? undefined} showQuickActions showActivityFeed />}
                </>
              )}
              {peopleSubTab === 'crew-schedule' && (
                <>
                  <EnhancedActionBar title="Crew Scheduler Gantt" subtitle={`Gestão visual de rotações — ${workbenchMetrics.totalCrew} tripulantes`}
                    actions={[{ id: 'add-rotation', label: 'New Rotation', icon: <Plus className="h-4 w-4" />, onClick: () => {}, variant: 'default', tooltip: 'Criar nova rotação' }]}
                    onRefresh={handleRefresh}
                    secondaryActions={[{ id: 'export-schedule', label: 'Exportar Cronograma (JSON)', icon: <Download className="h-4 w-4" />, onClick: handleExportSchedule }]}
                  />
                  <CrewSchedulerGantt />
                </>
              )}
              {peopleSubTab === 'crew-pool' && <CrewPoolPlanner />}
              {peopleSubTab === 'visa-tracker' && <CrewVisaTracker />}
            </TabsContent>

            {/* Finance (merged: finance + approvals + allotment) */}
            <TabsContent value="finance" className="mt-0 space-y-6">
              <SubTabSelector options={[{ id: 'finance', label: '💰 Finance Command' }, { id: 'approvals', label: '✅ Approvals' }, { id: 'allotment', label: '💳 Allotment' }]} active={financeSubTab} onChange={(id) => setFinanceSubTab(id as 'finance' | 'approvals' | 'allotment')} />
              {financeSubTab === 'finance' && (
                <>
                  <EnhancedActionBar title="Finance Command" subtitle="Voyage accounting, P&L e operações financeiras"
                    actions={[
                      { id: 'new-expense', label: 'New Expense', icon: <Plus className="h-4 w-4" />, onClick: handleNewExpense, variant: 'default', tooltip: 'Registrar nova despesa' },
                      { id: 'approvals', label: 'Pending Approvals', icon: <DollarSign className="h-4 w-4" />, onClick: () => setFinanceSubTab('approvals'), variant: 'outline', tooltip: 'Ver aprovações pendentes' },
                    ]}
                    onRefresh={handleRefresh}
                    secondaryActions={[{ id: 'export-finance', label: 'Exportar Relatório (CSV)', icon: <Download className="h-4 w-4" />, onClick: handleExportFinance }]}
                    showSearch searchPlaceholder="Search transactions, invoices..."
                  />
                  <Suspense fallback={<Skeleton className="h-64" />}><CashFlowForecast /></Suspense>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Suspense fallback={<Skeleton className="h-64" />}><PayrollIntelligence /></Suspense>
                    <Suspense fallback={<Skeleton className="h-64" />}><PayrollSummaryDashboard /></Suspense>
                  </div>
                  <Suspense fallback={<Skeleton className="h-64" />}><ProcurementPipelineTracker /></Suspense>
                  <FinanceHub />
                  {vessels.length > 0 && <CrossModulePanel entityType="vessel" entityId={vessels[0]?.id} vesselId={vessels[0]?.id} showQuickActions={false} showActivityFeed />}
                </>
              )}
              {financeSubTab === 'approvals' && (
                <>
                  <EnhancedActionBar title="Finance Approval Workflow" subtitle="Aprovação multi-etapa para compras, despesas e faturas"
                    actions={[{ id: 'bulk-approve', label: 'Bulk Approve', icon: <DollarSign className="h-4 w-4" />, onClick: () => {}, variant: 'default', tooltip: 'Aprovar múltiplos itens' }]}
                    onRefresh={handleRefresh}
                  />
                  <ApprovalWorkflow />
                </>
              )}
              {financeSubTab === 'allotment' && <AllotmentManagementTab />}
            </TabsContent>

            {/* Travel (merged: travel + itinerary) */}
            <TabsContent value="travel" className="mt-0 space-y-6">
              <SubTabSelector options={[{ id: 'travel', label: '✈️ Travel Command' }, { id: 'itinerary', label: '📋 Itinerário' }]} active={travelSubTab} onChange={(id) => setTravelSubTab(id as 'travel' | 'itinerary')} />
              {travelSubTab === 'travel' && (
                <>
                  <EnhancedActionBar title="Travel Command" subtitle="Viagens de tripulação, logística e gestão de despesas"
                    actions={[{ id: 'new-booking', label: 'New Booking', icon: <Plus className="h-4 w-4" />, onClick: handleNewBooking, variant: 'default', tooltip: 'Criar nova reserva' }]}
                    onRefresh={handleRefresh}
                    secondaryActions={[{ id: 'export-travel', label: 'Exportar Viagens (CSV)', icon: <Download className="h-4 w-4" />, onClick: () => exportToCSV([], 'travel-report') }]}
                    showSearch searchPlaceholder="Search bookings, crew travel..."
                  />
                  <TravelCommandPremium />
                </>
              )}
              {travelSubTab === 'itinerary' && <TravelItineraryBuilder />}
            </TabsContent>

            {/* Procurement & ESG (merged: supplier-score + carbon-trading) */}
            <TabsContent value="procurement" className="mt-0 space-y-4">
              <SubTabSelector options={[{ id: 'supplier-score', label: '🏢 Supplier Scorecard' }, { id: 'carbon-trading', label: '🌱 Carbon Trading' }]} active={procurementSubTab} onChange={(id) => setProcurementSubTab(id as 'supplier-score' | 'carbon-trading')} />
              {procurementSubTab === 'supplier-score' && <SupplierScorecard />}
              {procurementSubTab === 'carbon-trading' && <CarbonCreditTradingTab />}
            </TabsContent>

            {/* AI Hub (merged: crew AI + finance AI + docs AI) */}
            <TabsContent value="ai-hub" className="mt-0 space-y-4">
              <SubTabSelector options={[{ id: 'ai-crew', label: '🧠 Crew AI' }, { id: 'ai-finance', label: '💰 Finance AI' }, { id: 'ai-docs', label: '📄 Docs AI' }]} active={aiHubSubTab} onChange={(id) => setAiHubSubTab(id as 'ai-crew' | 'ai-finance' | 'ai-docs')} />
              {aiHubSubTab === 'ai-crew' && <CrewAIHub />}
              {aiHubSubTab === 'ai-finance' && <FinanceAIHub />}
              {aiHubSubTab === 'ai-docs' && <DocumentsAIHub />}
            </TabsContent>

            {/* System */}
            <TabsContent value="system" className="mt-0 space-y-6">
              <EnhancedActionBar title="System Hub" subtitle="Configurações, integrações e administração do sistema"
                actions={[{ id: 'new-integration', label: 'Add Integration', icon: <Plus className="h-4 w-4" />, onClick: handleNewIntegration, variant: 'default', tooltip: 'Adicionar nova integração' }]}
                onRefresh={handleRefresh} showSearch searchPlaceholder="Search settings, integrations..."
              />
              <SystemHub />
            </TabsContent>

            <TabsContent value="modules" className="mt-0">
              <HubModulesBrowser modules={WORKBENCH_ABSORBED} hubName="Área de Trabalho" hubColor="text-hub-workbench" activeModuleId={activeModuleId}
                onModuleSelect={(id) => { if (id) setSearchParams({ section: 'modules', module: id }); else setSearchParams({ section: 'modules' }); }}
              />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>

      <ModuleLauncherModal open={launcherOpen} onOpenChange={setLauncherOpen} hubName="Centro de Recursos" hubIcon={<Briefcase className="h-5 w-5" />} modules={WORKBENCH_ABSORBED} onModuleSelect={(moduleId) => setSearchParams({ section: 'modules', module: moduleId })} />
    </div>
  );
}
