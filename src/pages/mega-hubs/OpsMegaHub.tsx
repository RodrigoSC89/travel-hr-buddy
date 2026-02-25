/**
 * Ops Mega-Hub - Operações & Contratos
 * Rota canônica: /ops
 * 
 * P2: Consolidated from 12 tabs to 7 grouped tabs
 * ✅ ZERO FEATURE LOSS
 * ✅ BACKWARD COMPATIBLE DEEP LINKS
 */

import React, { Suspense, lazy, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Compass, Anchor, Ship, Map, Target, Package, FileText, Plus, CheckCircle, Wifi, Download, Brain, Building2, ClipboardCheck, Droplets, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
import { HubEmptyState } from '@/components/ui/HubEmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useOperationsCommandData } from '@/hooks/useOperationsCommandData';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { toast } from 'sonner';
import { NewVoyageDialog } from '@/components/operations/QuickActionDialogs';
import { CrossModulePanel } from '@/components/integration';
import { HubModulesBrowser } from '@/components/ui/HubModulesBrowser';
import { OPS_ABSORBED, OPS_TAB_MODULES } from '@/lib/hub-absorbed-modules';
import { TabTriggerWithModules } from '@/components/ui/TabTriggerWithModules';
import { ModuleLauncherModal } from '@/components/ui/ModuleLauncherModal';
import { SubTabSelector } from '@/components/ui/SubTabSelector';

// Lazy load sub-components
const OperationsCommandHub = lazy(() => import('@/pages/OperationsCommandCenter'));
const MaritimeCommandCenter = lazy(() => import('@/pages/MaritimeCommandCenter'));
const FleetCommandCenter = lazy(() => import('@/pages/FleetCommandCenter'));
const VoyageCommandCenter = lazy(() => import('@/pages/VoyageCommandCenter'));
const MissionCommandCenter = lazy(() => import('@/modules/operations/components/MissionControlCenter'));
const LogisticsCommandPage = lazy(() => import('@/pages/ai/VoyageLogisticsAIPage'));
const VesselContractsUnified = lazy(() => import('@/pages/CharterPartyPage'));
const OperationsAIHub = lazy(() => import('@/components/operations/ai/OperationsAIHub'));
const ManningAgentPortal = lazy(() => import('@/components/crew/ManningAgentPortal').then(m => ({ default: m.ManningAgentPortal })));
const VoyagePerformanceAnalytics = lazy(() => import('@/components/dashboard/VoyagePerformanceAnalytics'));
const FleetUtilizationMatrix = lazy(() => import('@/components/dashboard/FleetUtilizationMatrix'));
const CrewWellbeingDashboard = lazy(() => import('@/components/dashboard/CrewWellbeingDashboard'));
const CompetencyGapAnalyzer = lazy(() => import('@/components/dashboard/CompetencyGapAnalyzer'));
const FuelEfficiencyAnalytics = lazy(() => import('@/components/dashboard/FuelEfficiencyAnalytics'));
const CargoPerformanceDashboard = lazy(() => import('@/components/dashboard/CargoPerformanceDashboard'));
const WeatherRoutingIntelligence = lazy(() => import('@/components/dashboard/WeatherRoutingIntelligence'));
const PortPerformanceAnalytics = lazy(() => import('@/components/dashboard/PortPerformanceAnalytics'));
const CrewFatigueCommand = lazy(() => import('@/components/dashboard/CrewFatigueCommand'));
const BunkerIntelligence = lazy(() => import('@/components/dashboard/BunkerIntelligence'));
const CargoUtilizationOptimizer = lazy(() => import('@/components/dashboard/CargoUtilizationOptimizer'));
const NoonReportAnalytics = lazy(() => import('@/components/dashboard/NoonReportAnalytics'));
const NoonReportAIValidation = lazy(() => import('@/components/operations/NoonReportAIValidation').then(m => ({ default: m.NoonReportAIValidation })));
const FuelQualityTrackerTab = lazy(() => import('@/components/operations/FuelQualityTrackerTab').then(m => ({ default: m.FuelQualityTrackerTab })));
const ClauseLibraryTab = lazy(() => import('@/components/operations/ClauseLibraryTab').then(m => ({ default: m.ClauseLibraryTab })));
const WeatherRoutingQuickPanel = lazy(() => import('@/components/operations/WeatherRoutingQuickPanel'));
const LaytimeQuickPanel = lazy(() => import('@/components/operations/LaytimeQuickPanel'));
const CertificationExpiryTracker = lazy(() => import('@/components/dashboard/CertificationExpiryTracker').then(m => ({ default: m.CertificationExpiryTracker })));
const PortCallTimeline = lazy(() => import('@/components/dashboard/PortCallTimeline').then(m => ({ default: m.PortCallTimeline })));
const VoyageWeatherRiskPanel = lazy(() => import('@/components/dashboard/VoyageWeatherRiskPanel').then(m => ({ default: m.VoyageWeatherRiskPanel })));
const BunkerConsumptionAnalytics = lazy(() => import('@/components/dashboard/BunkerConsumptionAnalytics').then(m => ({ default: m.BunkerConsumptionAnalytics })));
const CrewRotationTimeline = lazy(() => import('@/components/dashboard/CrewRotationTimeline').then(m => ({ default: m.CrewRotationTimeline })));
const PortCostIntelligence = lazy(() => import('@/components/dashboard/PortCostIntelligence').then(m => ({ default: m.PortCostIntelligence })));
const FleetFuelEfficiencyTracker = lazy(() => import('@/components/dashboard/FleetFuelEfficiencyTracker').then(m => ({ default: m.FleetFuelEfficiencyTracker })));
const CrewOvertimeTracker = lazy(() => import('@/components/dashboard/CrewOvertimeTracker').then(m => ({ default: m.CrewOvertimeTracker })));
const CharterPartyPerformance = lazy(() => import('@/components/dashboard/CharterPartyPerformance').then(m => ({ default: m.CharterPartyPerformance })));
const CrewRotationOverview = lazy(() => import('@/components/dashboard/CrewRotationOverview').then(m => ({ default: m.CrewRotationOverview })));
const CrewFatigueRiskMonitor = lazy(() => import('@/components/dashboard/CrewFatigueRiskMonitor').then(m => ({ default: m.CrewFatigueRiskMonitor })));
const VoyageTCEPerformance = lazy(() => import('@/components/dashboard/VoyageTCEPerformance').then(m => ({ default: m.VoyageTCEPerformance })));
// Market Parity Modules
const BerthSchedulingPage = lazy(() => import('@/pages/operations/BerthSchedulingPage'));
const BargingLighteringPage = lazy(() => import('@/pages/operations/BargingLighteringPage'));
const TradingRiskPage = lazy(() => import('@/pages/operations/TradingRiskPage'));
const ForumKnowledgePage = lazy(() => import('@/pages/operations/ForumKnowledgePage'));

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

/**
 * P2: Consolidated from 12 tabs to 7 grouped tabs
 * 
 * Old 12: overview, maritime, fleet, voyage, missions, logistics, contracts, manning, noon-validation, fuel-quality, clause-library, ai-copilot
 * 
 * New 7:
 * 1. overview       → Overview (unchanged)
 * 2. maritime-fleet  → Maritime & Fleet (maritime + fleet subtabs)
 * 3. voyage-missions → Voyage & Missions (voyage + missions subtabs)
 * 4. logistics       → Logistics (unchanged)
 * 5. contracts       → Contracts (contracts + clause-library subtabs)
 * 6. field-ops       → Field Ops (manning + noon-validation + fuel-quality subtabs)
 * 7. ai-copilot      → IA Copiloto (unchanged)
 */
const useOpsTabConfig = () => {
  const { t } = useTranslation();
  return useMemo(() => [
    { id: 'overview', label: t('megaHubs.ops.tabs.overview'), icon: Compass },
    { id: 'maritime-fleet', label: t('megaHubs.ops.tabs.maritimeFleet'), icon: Anchor },
    { id: 'voyage-missions', label: t('megaHubs.ops.tabs.voyageMissions'), icon: Map },
    { id: 'logistics', label: t('megaHubs.ops.tabs.logistics'), icon: Package },
    { id: 'contracts', label: t('megaHubs.ops.tabs.contracts'), icon: FileText },
    { id: 'port-ops', label: t('megaHubs.ops.tabs.portOps'), icon: Building2 },
    { id: 'trading', label: t('megaHubs.ops.tabs.trading'), icon: Droplets },
    { id: 'field-ops', label: t('megaHubs.ops.tabs.fieldOps'), icon: ClipboardCheck },
    { id: 'forum', label: t('megaHubs.ops.tabs.forum'), icon: BookOpen },
    { id: 'ai-copilot', label: t('megaHubs.ops.tabs.aiCopilot'), icon: Brain },
  ], [t]);
};

const TAB_MIGRATION: Record<string, string> = {
  'maritime': 'maritime-fleet',
  'fleet': 'maritime-fleet',
  'voyage': 'voyage-missions',
  'missions': 'voyage-missions',
  'manning': 'field-ops',
  'noon-validation': 'field-ops',
  'fuel-quality': 'field-ops',
  'clause-library': 'contracts',
};

export default function OpsMegaHub() {
  const { t } = useTranslation();
  const tabConfig = useOpsTabConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'overview';
  const activeTab = TAB_MIGRATION[rawTab] || rawTab;
  const activeModuleId = searchParams.get('module');
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [voyageDialogOpen, setVoyageDialogOpen] = useState(false);
  const { vessels, voyages, metrics, isLoading } = useOperationsCommandData();
  const { exportToCSV } = useRealActionHandlers();
  const queryClient = useQueryClient();

  // Sub-tab state
  const [maritimeFleetSubTab, setMaritimeFleetSubTab] = useState<'maritime' | 'fleet'>('maritime');
  const [voyageMissionsSubTab, setVoyageMissionsSubTab] = useState<'voyage' | 'missions'>('voyage');
  const [contractsSubTab, setContractsSubTab] = useState<'contracts' | 'clause-library'>('contracts');
  const [portOpsSubTab, setPortOpsSubTab] = useState<'berth' | 'sts'>('berth');
  const [fieldOpsSubTab, setFieldOpsSubTab] = useState<'manning' | 'noon-validation' | 'fuel-quality'>('manning');

  // Initialize sub-tab from old deep-link
  React.useEffect(() => {
    if (rawTab === 'fleet') setMaritimeFleetSubTab('fleet');
    if (rawTab === 'missions') setVoyageMissionsSubTab('missions');
    if (rawTab === 'clause-library') setContractsSubTab('clause-library');
    if (rawTab === 'noon-validation') setFieldOpsSubTab('noon-validation');
    if (rawTab === 'fuel-quality') setFieldOpsSubTab('fuel-quality');
  }, [rawTab]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['operations-voyages'] });
    await queryClient.invalidateQueries({ queryKey: ['operations-vessels'] });
    toast.success('Dados operacionais atualizados');
  }, [queryClient]);

  const handleExport = useCallback(() => {
    if (vessels.length === 0) { toast.error('Nenhum dado para exportar'); return; }
    exportToCSV(vessels, 'operations-fleet');
  }, [vessels, exportToCSV]);

  const handleActionBarAction = (action: string) => {
    switch (action) {
      case 'new-voyage': setVoyageDialogOpen(true); break;
      case 'bulk-approve':
        toast.success('Selecione operações na lista e use o botão "Aprovar"');
        break;
      default: setSearchParams({ tab: action });
    }
  };

  const workflowSteps = useMemo(() => [
    { id: 'request', label: t('megaHubs.ops.workflow.request'), status: metrics.totalVessels > 0 ? 'completed' as const : 'current' as const },
    { id: 'planning', label: t('megaHubs.ops.workflow.planning'), status: metrics.plannedVoyages > 0 ? 'current' as const : metrics.totalVessels > 0 ? 'completed' as const : 'pending' as const },
    { id: 'approval', label: t('megaHubs.ops.workflow.approval'), status: metrics.activeVoyages > 0 ? 'completed' as const : 'pending' as const },
    { id: 'execution', label: t('megaHubs.ops.workflow.execution'), status: metrics.activeVoyages > 0 ? 'current' as const : 'pending' as const },
    { id: 'completion', label: t('megaHubs.ops.workflow.completion'), status: metrics.completedVoyages > 0 ? 'completed' as const : 'pending' as const }
  ], [metrics, t]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-hub-ops/10 rounded-lg">
                <Compass className="h-6 w-6 text-hub-ops" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t('megaHubs.ops.title')}</h1>
                <p className="text-sm text-muted-foreground">
                  {t('megaHubs.ops.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-hub-ops/10 text-hub-ops border-hub-ops/20">
                {t('megaHubs.ops.activeVoyages', { count: metrics.activeVoyages })}
              </Badge>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {t('megaHubs.ops.operational')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-auto flex-wrap bg-transparent gap-1.5 justify-start py-2">
              {tabConfig.map((tab) => (
                <TabTriggerWithModules
                  key={tab.id}
                  tabId={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  modules={OPS_TAB_MODULES[tab.id] || []}
                  onModuleSelect={(moduleId) => setSearchParams({ tab: 'modules', module: moduleId })}
                  onOpenLauncher={() => setLauncherOpen(true)}
                />
              ))}
            </TabsList>
          </div>
        </div>

        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            {/* Overview - unchanged */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-1.5"><Wifi className="h-3.5 w-3.5 text-success" /><span>{t('common.online')}</span></div>
                <span>•</span><span>{t('megaHubs.command.vessels', { count: metrics.totalVessels })}</span>
                <span>•</span><span>{t('megaHubs.ops.activeVoyages', { count: metrics.activeVoyages })}</span>
                <span>•</span><span>{metrics.plannedVoyages} {t('common.pending').toLowerCase()}</span>
              </div>

              <EnhancedActionBar
                title={t('megaHubs.ops.opsCommandCenter')}
                subtitle={`${t('megaHubs.command.operationalVessels', { count: metrics.operationalVessels })} | ${t('megaHubs.ops.activeVoyages', { count: metrics.activeVoyages })}`}
                actions={[
                  { id: 'new-voyage', label: t('megaHubs.ops.actions.newVoyage'), icon: <Plus className="h-4 w-4" />, onClick: () => handleActionBarAction('new-voyage'), variant: 'default', tooltip: t('megaHubs.ops.actions.newVoyage') },
                  { id: 'new-contract', label: t('megaHubs.ops.actions.newContract'), icon: <FileText className="h-4 w-4" />, onClick: () => setSearchParams({ tab: 'contracts' }), variant: 'outline', tooltip: t('megaHubs.ops.actions.newContract') },
                  { id: 'bulk-approve', label: t('megaHubs.ops.actions.bulkApprove'), icon: <CheckCircle className="h-4 w-4" />, onClick: () => handleActionBarAction('bulk-approve'), variant: 'outline', tooltip: t('megaHubs.ops.actions.bulkApprove') }
                ]}
                onRefresh={handleRefresh}
                isRefreshing={isLoading}
                secondaryActions={[{ id: 'export-fleet', label: t('common.export') + ' (CSV)', icon: <Download className="h-4 w-4" />, onClick: handleExport }]}
                showSearch searchPlaceholder={t('megaHubs.ops.searchPlaceholder')}
              />

              <WorkflowStatusBar title={t('megaHubs.ops.opsWorkflow')} steps={workflowSteps} variant="horizontal" />

              {!isLoading && metrics.totalVessels === 0 && (
                <HubEmptyState hub="ops" onPrimaryAction={() => setVoyageDialogOpen(true)} />
              )}

              {/* Intelligence Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[500px]" />}><VoyagePerformanceAnalytics /></Suspense>
                <Suspense fallback={<Skeleton className="h-[500px]" />}><FleetUtilizationMatrix /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[500px]" />}><CrewWellbeingDashboard /></Suspense>
                <Suspense fallback={<Skeleton className="h-[500px]" />}><CompetencyGapAnalyzer /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[500px]" />}><FuelEfficiencyAnalytics /></Suspense>
                <Suspense fallback={<Skeleton className="h-[500px]" />}><CargoPerformanceDashboard /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[500px]" />}><WeatherRoutingIntelligence /></Suspense>
                <Suspense fallback={<Skeleton className="h-[500px]" />}><PortPerformanceAnalytics /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}><CrewFatigueCommand /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}><BunkerIntelligence /></Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}><CargoUtilizationOptimizer /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}><NoonReportAnalytics /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}><WeatherRoutingQuickPanel /></Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}><LaytimeQuickPanel /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-80" />}><CertificationExpiryTracker /></Suspense>
                <Suspense fallback={<Skeleton className="h-80" />}><PortCallTimeline /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-80" />}><VoyageWeatherRiskPanel /></Suspense>
                <Suspense fallback={<Skeleton className="h-80" />}><BunkerConsumptionAnalytics /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-80" />}><CrewRotationTimeline /></Suspense>
                <Suspense fallback={<Skeleton className="h-80" />}><PortCostIntelligence /></Suspense>
              </div>
              <Suspense fallback={<Skeleton className="h-80" />}><FleetFuelEfficiencyTracker /></Suspense>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-80" />}><CharterPartyPerformance /></Suspense>
                <Suspense fallback={<Skeleton className="h-80" />}><CrewOvertimeTracker /></Suspense>
              </div>
              <Suspense fallback={<Skeleton className="h-80" />}><CrewRotationOverview /></Suspense>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-80" />}><CrewFatigueRiskMonitor /></Suspense>
                <Suspense fallback={<Skeleton className="h-80" />}><VoyageTCEPerformance /></Suspense>
              </div>

              <CrossModulePanel entityType="voyage" entityId={voyages[0]?.id ?? ''} showQuickActions showActivityFeed className="mt-6" />
              {(isLoading || metrics.totalVessels > 0) && <OperationsCommandHub />}
            </TabsContent>

            {/* Maritime & Fleet (merged) */}
            <TabsContent value="maritime-fleet" className="mt-0 space-y-4">
              <SubTabSelector
                options={[
                  { id: 'maritime', label: '⚓ Maritime Command' },
                  { id: 'fleet', label: '🚢 Fleet Command' },
                ]}
                active={maritimeFleetSubTab}
                onChange={(id) => setMaritimeFleetSubTab(id as 'maritime' | 'fleet')}
              />
              {maritimeFleetSubTab === 'maritime' && <MaritimeCommandCenter />}
              {maritimeFleetSubTab === 'fleet' && <FleetCommandCenter />}
            </TabsContent>

            {/* Voyage & Missions (merged) */}
            <TabsContent value="voyage-missions" className="mt-0 space-y-4">
              <SubTabSelector
                options={[
                  { id: 'voyage', label: '🗺️ Voyage Center' },
                  { id: 'missions', label: '🎯 Mission Control' },
                ]}
                active={voyageMissionsSubTab}
                onChange={(id) => setVoyageMissionsSubTab(id as 'voyage' | 'missions')}
              />
              {voyageMissionsSubTab === 'voyage' && <VoyageCommandCenter />}
              {voyageMissionsSubTab === 'missions' && <MissionCommandCenter />}
            </TabsContent>

            <TabsContent value="logistics" className="mt-0">
              <LogisticsCommandPage />
            </TabsContent>

            {/* Contracts (merged: contracts + clause-library) */}
            <TabsContent value="contracts" className="mt-0 space-y-4">
              <SubTabSelector
                options={[
                  { id: 'contracts', label: '📄 Contracts' },
                  { id: 'clause-library', label: '📚 Clause Library' },
                ]}
                active={contractsSubTab}
                onChange={(id) => setContractsSubTab(id as 'contracts' | 'clause-library')}
              />
              {contractsSubTab === 'contracts' && <VesselContractsUnified />}
              {contractsSubTab === 'clause-library' && <ClauseLibraryTab />}
            </TabsContent>

            {/* Field Ops (merged: manning + noon-validation + fuel-quality) */}
            <TabsContent value="field-ops" className="mt-0 space-y-4">
              <SubTabSelector
                options={[
                  { id: 'manning', label: '🏢 Manning Agents' },
                  { id: 'noon-validation', label: '📋 Noon Report IA' },
                  { id: 'fuel-quality', label: '⛽ Fuel Quality' },
                ]}
                active={fieldOpsSubTab}
                onChange={(id) => setFieldOpsSubTab(id as 'manning' | 'noon-validation' | 'fuel-quality')}
              />
              {fieldOpsSubTab === 'manning' && <ManningAgentPortal />}
              {fieldOpsSubTab === 'noon-validation' && <NoonReportAIValidation />}
              {fieldOpsSubTab === 'fuel-quality' && <FuelQualityTrackerTab />}
            </TabsContent>

            {/* Port & STS (Berth + Barging) */}
            <TabsContent value="port-ops" className="mt-0 space-y-4">
              <SubTabSelector
                options={[
                  { id: 'berth', label: '🏗️ Berth Scheduling' },
                  { id: 'sts', label: '🔄 STS / Barging' },
                ]}
                active={portOpsSubTab}
                onChange={(id) => setPortOpsSubTab(id as 'berth' | 'sts')}
              />
              {portOpsSubTab === 'berth' && <BerthSchedulingPage />}
              {portOpsSubTab === 'sts' && <BargingLighteringPage />}
            </TabsContent>

            {/* Trading & Risk */}
            <TabsContent value="trading" className="mt-0">
              <TradingRiskPage />
            </TabsContent>

            {/* Forum & Knowledge */}
            <TabsContent value="forum" className="mt-0">
              <ForumKnowledgePage />
            </TabsContent>

            <TabsContent value="ai-copilot" className="mt-0">
              <OperationsAIHub />
            </TabsContent>

            <TabsContent value="modules" className="mt-0">
              <HubModulesBrowser modules={OPS_ABSORBED} hubName="Ferramentas Operacionais" hubColor="text-hub-ops" activeModuleId={activeModuleId}
                onModuleSelect={(id) => { if (id) setSearchParams({ tab: 'modules', module: id }); else setSearchParams({ tab: 'modules' }); }}
              />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>

      <NewVoyageDialog open={voyageDialogOpen} onOpenChange={setVoyageDialogOpen} />
      <ModuleLauncherModal open={launcherOpen} onOpenChange={setLauncherOpen} hubName="Ferramentas Operacionais" hubIcon={<Compass className="h-5 w-5" />} modules={OPS_ABSORBED} onModuleSelect={(moduleId) => setSearchParams({ tab: 'modules', module: moduleId })} />
    </div>
  );
}
