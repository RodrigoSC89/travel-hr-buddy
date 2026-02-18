/**
 * Command Mega-Hub - Central Operacional Unificada
 * Rota canônica: /command
 * 
 * Consolida: Central de Comando + NOC + SOC + Comms + Alerts
 * 
 * ✅ WORLD-CLASS COMPONENTS INTEGRATED
 */

import React, { Suspense, lazy, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, Activity, BarChart3, Eye, Shield, Bell, Radio, RefreshCw, Wifi, WifiOff, Brain, Ship, Users, FileText, Wrench, Plus, AlertTriangle, Gauge } from 'lucide-react';
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
const EnhancedUnifiedDashboard = lazy(() => import('@/components/dashboard/enhanced-unified-dashboard'));
const OperationsOverviewPage = lazy(() => import('@/pages/command/OperationsOverviewPage'));
const ExecutiveDashboardPage = lazy(() => import('@/pages/command/ExecutiveDashboardPage'));
const NOC = lazy(() => import('@/pages/NOC'));
const SOCPage = lazy(() => import('@/pages/SecurityCenter'));
const CommunicationCommandCenter = lazy(() => import('@/modules/nauti-comms'));
const AlertsCommandCenter = lazy(() => import('@/components/fleet/intelligent-alerts'));
const CommandAIHub = lazy(() => import('@/components/command/ai/CommandAIHub'));
const CeoCommandDashboard = lazy(() => import('@/components/dashboard/RevolutionaryCEODashboard'));
const CustomizableDashboardGrid = lazy(() => import('@/components/dashboard/CustomizableDashboardGrid'));
const VesselDigitalTwin = lazy(() => import('@/components/three/VesselDigitalTwin').then(m => ({ default: m.VesselDigitalTwin })));
const PerformanceMetrics = lazy(() => import('@/components/performance/PerformanceMetrics').then(m => ({ default: m.PerformanceMetrics })));
const EnhancedPresence = lazy(() => import('@/components/collaboration/EnhancedPresence').then(m => ({ default: m.EnhancedPresence })));
const OperationalRadar = lazy(() => import('@/components/dashboard/OperationalRadar'));
const SituationRoom = lazy(() => import('@/components/dashboard/SituationRoom'));
const FleetDigitalTwinMap = lazy(() => import('@/components/dashboard/FleetDigitalTwinMap'));
const AIDecisionEngine = lazy(() => import('@/components/dashboard/AIDecisionEngine'));
const PredictiveCommandCenter = lazy(() => import('@/components/dashboard/PredictiveCommandCenter'));
const AutonomousFleetOptimizer = lazy(() => import('@/components/dashboard/AutonomousFleetOptimizer'));
const FuelIntelligencePanel = lazy(() => import('@/components/dashboard/FuelIntelligencePanel'));
const ComplianceNerveCenter = lazy(() => import('@/components/dashboard/ComplianceNerveCenter'));
const CrewWellnessCommand = lazy(() => import('@/components/dashboard/CrewWellnessCommand'));
const FinancialCockpit = lazy(() => import('@/components/dashboard/FinancialCockpit'));
const IncidentResponseTimeline = lazy(() => import('@/components/dashboard/IncidentResponseTimeline'));
const SystemUptimeMonitor = lazy(() => import('@/components/dashboard/SystemUptimeMonitor'));
const FleetROICommand = lazy(() => import('@/components/dashboard/FleetROICommand'));
const PredictiveCrewTurnover = lazy(() => import('@/components/dashboard/PredictiveCrewTurnover'));
const ContractExpiryRadar = lazy(() => import('@/components/dashboard/ContractExpiryRadar'));
const FleetRiskHeatmap = lazy(() => import('@/components/dashboard/FleetRiskHeatmap'));
const SystemEventsPanel = lazy(() => import('@/components/dashboard/SystemEventsPanel'));
const FleetKPISummaryCards = lazy(() => import('@/components/dashboard/FleetKPISummaryCards').then(m => ({ default: m.FleetKPISummaryCards })));
const FleetStatusGrid = lazy(() => import('@/components/dashboard/FleetStatusGrid').then(m => ({ default: m.FleetStatusGrid })));
const VoyagePnLQuickView = lazy(() => import('@/components/dashboard/VoyagePnLQuickView').then(m => ({ default: m.VoyagePnLQuickView })));
const FleetUtilizationKPI = lazy(() => import('@/components/dashboard/FleetUtilizationKPI').then(m => ({ default: m.FleetUtilizationKPI })));
const LiveIncidentFeed = lazy(() => import('@/components/dashboard/LiveIncidentFeed').then(m => ({ default: m.LiveIncidentFeed })));
const CrewCertificationRadar = lazy(() => import('@/components/dashboard/CrewCertificationRadar').then(m => ({ default: m.CrewCertificationRadar })));
const PIClaimsIntelligence = lazy(() => import('@/components/dashboard/PIClaimsIntelligence').then(m => ({ default: m.PIClaimsIntelligence })));

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
  { id: 'operations', label: 'Operations', icon: Activity },
  { id: 'executive', label: 'Executive', icon: BarChart3 },
  { id: 'digital-twin', label: '🚢 Digital Twin', icon: Ship },
  { id: 'noc', label: 'NOC 24/7', icon: Eye },
  { id: 'soc', label: 'SOC Security', icon: Shield },
  { id: 'comms', label: 'Comms', icon: Radio },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'ai-copilot', label: '🧠 IA Copiloto', icon: Brain },
  { id: 'ceo', label: '👔 CEO Dashboard', icon: BarChart3 },
  { id: 'my-dashboard', label: '🎯 Meu Dashboard', icon: Activity },
  { id: 'performance', label: '📊 Performance', icon: Gauge },
];

export default function CommandMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'overview';
  const queryClient = useQueryClient();
  const { quickActions, exportToCSV } = useRealActionHandlers();
  const { vessels, voyages, metrics, isLoading } = useOperationsCommandData();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Build real timeline events from vessel/voyage data
  const commandTimelineEvents = useMemo(() => {
    const events: Array<{ id: string; title: string; description: string; timestamp: string; type: 'success' | 'warning' | 'info'; metadata: Record<string, unknown> }> = [];
    
    vessels.slice(0, 3).forEach((v) => {
      events.push({
        id: `vessel-${v.id}`,
        title: `${v.name || 'Vessel'} — ${v.status || 'Unknown'}`,
        description: `Type: ${v.vessel_type || 'N/A'} | Flag: ${v.flag_state || 'N/A'}`,
        timestamp: v.updated_at || new Date().toISOString(),
        type: v.status === 'active' ? 'success' as const : v.status === 'maintenance' ? 'warning' as const : 'info' as const,
        metadata: { vessel: v.name, status: v.status }
      });
    });

    voyages.slice(0, 3).forEach((voy) => {
      const v = voy as Record<string, unknown>;
      events.push({
        id: `voyage-${v.id}`,
        title: `Voyage ${v.voyage_number || ''}`,
        description: `${v.origin_port || '?'} → ${v.destination_port || '?'} | Status: ${v.status || 'N/A'}`,
        timestamp: String(v.created_at || new Date().toISOString()),
        type: v.status === 'completed' ? 'success' as const : v.status === 'in_progress' ? 'info' as const : 'warning' as const,
        metadata: { voyage: String(v.voyage_number || '') }
      });
    });

    if (events.length === 0) {
      events.push({
        id: 'no-events',
        title: 'Nenhum evento recente',
        description: 'Cadastre embarcações e viagens para ver atividades aqui.',
        timestamp: new Date().toISOString(),
        type: 'info' as const,
        metadata: {}
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
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
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
                  <Wifi className="h-3.5 w-3.5 text-success" />
                  <span>Online</span>
                </div>
                <span>•</span>
                <span>{metrics.totalVessels} embarcações</span>
                <span>•</span>
                <span>{metrics.activeVoyages} viagens ativas</span>
                <span>•</span>
                <span>Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Nova Viagem', icon: Plus, color: 'text-primary', bg: 'bg-primary/10', onClick: () => navigate('/ops?tab=voyage') },
                  { label: 'Tripulação', icon: Users, color: 'text-info', bg: 'bg-info/10', onClick: () => navigate('/workbench?section=people') },
                  { label: 'Manutenção', icon: Wrench, color: 'text-warning', bg: 'bg-warning/10', onClick: () => navigate('/maintenance') },
                  { label: 'Documentos', icon: FileText, color: 'text-success', bg: 'bg-success/10', onClick: () => navigate('/workbench?section=docs') },
                  { label: 'Compliance', icon: Shield, color: 'text-accent', bg: 'bg-accent/10', onClick: () => navigate('/compliance') },
                  { label: 'Alertas', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', onClick: () => setSearchParams({ tab: 'alerts' }) },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.bg} border border-transparent hover:border-border/50 transition-all duration-200 active:scale-[0.97] group`}
                  >
                    <action.icon className={`h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Fleet KPI Summary Cards */}
              <Suspense fallback={<Skeleton className="h-24" />}>
                <FleetKPISummaryCards />
              </Suspense>

              {/* Fleet Utilization KPI */}
              <Suspense fallback={<Skeleton className="h-48" />}>
                <FleetUtilizationKPI />
              </Suspense>

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

              {/* Mission Control Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Operational Radar */}
                <div className="lg:col-span-1">
                  <Suspense fallback={<Skeleton className="h-[400px]" />}>
                    <OperationalRadar />
                  </Suspense>
                </div>
                {/* Situation Room */}
                <div className="lg:col-span-1">
                  <Suspense fallback={<Skeleton className="h-[400px]" />}>
                    <SituationRoom />
                  </Suspense>
                </div>
                {/* Activity Feed */}
                <div className="lg:col-span-1">
                  <PremiumTimeline
                    title="Activity Feed"
                    events={commandTimelineEvents}
                    maxItems={10}
                    showFilters
                  />
                </div>
              </div>

              {/* Global Intelligence Network */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[500px]" />}>
                  <FleetDigitalTwinMap />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-[500px]" />}>
                  <AIDecisionEngine />
                </Suspense>
              </div>

              {/* Wave 10: Autonomous Fleet Intelligence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[500px]" />}>
                  <PredictiveCommandCenter />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-[500px]" />}>
                  <AutonomousFleetOptimizer />
                </Suspense>
              </div>

              {/* Wave 11: Fleet Nerve Center */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[500px]" />}>
                  <FuelIntelligencePanel />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-[500px]" />}>
                  <ComplianceNerveCenter />
                </Suspense>
              </div>

              {/* Wave 12: Crew Wellness & Financial Cockpit */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[500px]" />}>
                  <CrewWellnessCommand />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-[500px]" />}>
                  <FinancialCockpit />
                </Suspense>
              </div>

              {/* Wave 21: Command Intelligence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[400px]" />}>
                  <IncidentResponseTimeline />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-[400px]" />}>
                  <SystemUptimeMonitor />
                </Suspense>
              </div>

              {/* Wave 33: Fleet ROI Command */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <FleetROICommand />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <FleetRiskHeatmap />
                </Suspense>
              </div>

              {/* Wave 36: Predictive Crew Turnover + Wave 41: Contract Expiry */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <PredictiveCrewTurnover />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <ContractExpiryRadar />
                </Suspense>
              </div>

              {/* Voyage P&L Quick View + Fleet Status Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-80" />}>
                  <VoyagePnLQuickView />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-80" />}>
                  <FleetStatusGrid />
                </Suspense>
              </div>

              {/* Crew Certification Radar + Live Incident Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <CrewCertificationRadar />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <LiveIncidentFeed />
                </Suspense>
              </div>

              {/* Event System - Central Nervous System */}
              <Suspense fallback={<Skeleton className="h-64" />}>
                <SystemEventsPanel />
              </Suspense>

              {/* Wave 53: P&I Claims Intelligence */}
              <Suspense fallback={<Skeleton className="h-80" />}>
                <PIClaimsIntelligence />
              </Suspense>

              {/* Full Dashboard below */}
              <EnhancedUnifiedDashboard />

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

            <TabsContent value="ai-copilot" className="mt-0">
              <CommandAIHub />
            </TabsContent>

            <TabsContent value="ceo" className="mt-0">
              <CeoCommandDashboard />
            </TabsContent>

            <TabsContent value="my-dashboard" className="mt-0">
              <CustomizableDashboardGrid />
            </TabsContent>
            <TabsContent value="digital-twin" className="mt-0 space-y-6">
              <VesselDigitalTwin />
              <EnhancedPresence />
            </TabsContent>

            <TabsContent value="performance" className="mt-0 space-y-6">
              <PerformanceMetrics />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
