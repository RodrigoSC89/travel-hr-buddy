/**
 * Compliance Mega-Hub - Auditorias & Conformidade
 * Rota canônica: /compliance
 * 
 * P2: Consolidated from 15 tabs to 9 grouped tabs
 * ✅ 12 AUDITORIAS MARÍTIMAS COMPLETAS
 * ✅ 10 AGENTES DE AUDITORIA IA
 * ✅ ZERO FEATURE LOSS
 * ✅ BACKWARD COMPATIBLE DEEP LINKS
 */

import React, { Suspense, lazy, useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, BarChart3, Bot, Award, Target, AlertTriangle, FileText, Lock, Plus, Download, ClipboardCheck, Wifi, Brain, HardHat, ClipboardList, Activity, Radar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
const AuditWorkflowManager = lazy(() => import('@/components/compliance/AuditWorkflowManager'));
import { HubEmptyState } from '@/components/ui/HubEmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { toast } from 'sonner';
import { CrossModulePanel } from '@/components/integration';
import { publishEvent } from '@/lib/events/event-bus';
import { HubModulesBrowser } from '@/components/ui/HubModulesBrowser';
import { COMPLIANCE_ABSORBED, COMPLIANCE_TAB_MODULES } from '@/lib/hub-absorbed-modules';
import { TabTriggerWithModules } from '@/components/ui/TabTriggerWithModules';
import { ModuleLauncherModal } from '@/components/ui/ModuleLauncherModal';
import { SubTabSelector } from '@/components/ui/SubTabSelector';
import { cn } from '@/lib/utils';

// Lazy components
const ComplianceHubPage = lazy(() => import('@/pages/ComplianceRoadmapPage'));
const ComplianceScorecardPage = lazy(() => import('@/pages/ExecutiveCompliancePage'));
const AgentsDashboard = lazy(() => import('@/pages/audit-agents/AgentsDashboard'));
const DiagnosticCertificatesPage = lazy(() => import('@/pages/DiagnosticCertificatesPage'));
const RiskMatrixV2 = lazy(() => import('@/pages/DiagnosticDashboardPage'));
const DiagnosticNCsPage = lazy(() => import('@/pages/DiagnosticNCsPage'));
const RegulationsV2 = lazy(() => import('@/pages/DiagnosticReportsPage'));
const SecurityCenter = lazy(() => import('@/pages/SecurityCenter'));
const ComplianceAIHub = lazy(() => import('@/components/compliance/ai/ComplianceAIHub'));
const LOTOProceduresManager = lazy(() => import('@/components/safety/LOTOProceduresManager').then(m => ({ default: m.LOTOProceduresManager })));
const JSATemplatesManager = lazy(() => import('@/components/safety/JSATemplatesManager').then(m => ({ default: m.JSATemplatesManager })));
const ComplianceRiskPredictor = lazy(() => import('@/components/dashboard/ComplianceRiskPredictor'));
const AuditReadinessTimeline = lazy(() => import('@/components/dashboard/AuditReadinessTimeline'));
const RegulatoryChangeTracker = lazy(() => import('@/components/dashboard/RegulatoryChangeTracker'));
const AuditGapHeatmap = lazy(() => import('@/components/dashboard/AuditGapHeatmap'));
const VettingReadinessCenter = lazy(() => import('@/components/dashboard/VettingReadinessCenter'));
const RegulatoryRadarLive = lazy(() => import('@/components/dashboard/RegulatoryRadarLive'));
const ISMGapAnalyzer = lazy(() => import('@/components/dashboard/ISMGapAnalyzer'));
const PSCDetentionPredictor = lazy(() => import('@/components/dashboard/PSCDetentionPredictor'));
const ComplianceEventsMonitor = lazy(() => import('@/components/compliance/ComplianceEventsMonitor'));
const ComplianceScoreDashboard = lazy(() => import('@/components/dashboard/ComplianceScoreDashboard').then(m => ({ default: m.ComplianceScoreDashboard })));
const DocumentExpiryMatrix = lazy(() => import('@/components/dashboard/DocumentExpiryMatrix').then(m => ({ default: m.DocumentExpiryMatrix })));
const AuditCountdownCards = lazy(() => import('@/components/dashboard/AuditCountdownCards').then(m => ({ default: m.AuditCountdownCards })));
const SafetyIncidentAnalytics = lazy(() => import('@/components/dashboard/SafetyIncidentAnalytics').then(m => ({ default: m.SafetyIncidentAnalytics })));
const ComplianceReadinessTimeline = lazy(() => import('@/components/dashboard/ComplianceReadinessTimeline').then(m => ({ default: m.ComplianceReadinessTimeline })));
const ISMKPIDashboard = lazy(() => import('@/components/compliance/ISMKPIDashboard').then(m => ({ default: m.ISMKPIDashboard })));
const SIRE2HubPage = lazy(() => import('@/pages/SIRE2HubPage'));

// 12 Maritime Audits
const PEODP = lazy(() => import('@/pages/PEODP'));
const PEOTRAM = lazy(() => import('@/pages/PEOTRAMPage'));
const SafetyIMCAV2 = lazy(() => import('@/pages/ISMCodePage'));
const ISPSSecurityV2 = lazy(() => import('@/pages/ISPSSecurityPage'));
const SOLASInspection = lazy(() => import('@/pages/SOLASInspection'));
const WasteManagementPremium = lazy(() => import('@/pages/advanced/MARPOLTrackerPage'));
const PreOVIDInspection = lazy(() => import('@/pages/PreOVIDInspection'));
const MLCInspection = lazy(() => import('@/pages/MLCInspection'));
const PSCPackage = lazy(() => import('@/pages/PSCPackage'));
const SGSO = lazy(() => import('@/pages/SGSO'));
const PreSIREInspection = lazy(() => import('@/pages/PreSIREInspection'));
const TMSAAssessment = lazy(() => import('@/pages/TMSAAssessment'));

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div><Skeleton className="h-64" />
  </div>
);

/**
 * P2: Consolidated from 15 tabs to 9 grouped tabs
 * Old 15: hub, audits, audit-workflow, scorecard, audit-agents, certificates, risk-matrix, ncs-capas, regulations, security, loto, jsa, ism-kpi, sire2, ai-hub
 * New 9:
 * 1. hub           → Compliance Hub
 * 2. audits        → 12 Auditorias
 * 3. audit-workflow → Audit Workflow
 * 4. scorecard     → Scorecard & KPIs (scorecard + ISM KPIs subtabs)
 * 5. audit-agents  → AI Agents
 * 6. certificates  → Certificates
 * 7. risk-safety   → Risk & Safety (Risk Matrix + NCs/CAPAs + LOTO + JSA subtabs)
 * 8. regulations   → Regulations & Security (Regulations + Security + SIRE 2.0 subtabs)
 * 9. ai-hub        → IA Compliance
 */
const useComplianceTabConfig = () => {
  const { t } = useTranslation();
  return useMemo((): { id: string; label: string; icon: LucideIcon }[] => [
    { id: 'hub', label: t('megaHubs.compliance.tabs.hub'), icon: Shield },
    { id: 'audits', label: t('megaHubs.compliance.tabs.audits'), icon: ClipboardCheck },
    { id: 'audit-workflow', label: t('megaHubs.compliance.tabs.auditWorkflow'), icon: ClipboardList },
    { id: 'scorecard', label: t('megaHubs.compliance.tabs.scorecard'), icon: BarChart3 },
    { id: 'audit-agents', label: t('megaHubs.compliance.tabs.auditAgents'), icon: Bot },
    { id: 'certificates', label: t('megaHubs.compliance.tabs.certificates'), icon: Award },
    { id: 'risk-safety', label: t('megaHubs.compliance.tabs.riskSafety'), icon: AlertTriangle },
    { id: 'regulations', label: t('megaHubs.compliance.tabs.regulations'), icon: FileText },
    { id: 'ai-hub', label: t('megaHubs.compliance.tabs.aiHub'), icon: Brain },
  ], [t]);
};

const TAB_MIGRATION: Record<string, string> = {
  'risk-matrix': 'risk-safety',
  'ncs-capas': 'risk-safety',
  'loto': 'risk-safety',
  'jsa': 'risk-safety',
  'ism-kpi': 'scorecard',
  'security': 'regulations',
  'sire2': 'regulations',
};

const AUDIT_STANDARDS_CARDS: { key: string; label: string; description: string; icon: LucideIcon; color: string }[] = [
  { key: 'peo-dp', label: 'PEO-DP', description: 'Petrobras DP Operations', icon: Target, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
  { key: 'peotram', label: 'PEOTRAM', description: 'Petrobras Transport', icon: Activity, color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30' },
  { key: 'ism', label: 'ISM Code', description: 'International Safety Management', icon: Shield, color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
  { key: 'isps', label: 'ISPS Code', description: 'Port Facility Security', icon: Lock, color: 'from-red-500/20 to-red-600/10 border-red-500/30' },
  { key: 'solas', label: 'SOLAS', description: 'Safety of Life at Sea', icon: AlertTriangle, color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30' },
  { key: 'marpol', label: 'MARPOL', description: 'Marine Pollution Prevention', icon: FileText, color: 'from-teal-500/20 to-teal-600/10 border-teal-500/30' },
  { key: 'pre-ovid', label: 'Pre-OVID', description: 'OCIMF Vessel Inspection', icon: ClipboardCheck, color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
  { key: 'pre-mlc', label: 'MLC 2006', description: 'Maritime Labour Convention', icon: Award, color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
  { key: 'psc', label: 'PSC', description: 'Port State Control', icon: Radar, color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30' },
  { key: 'sgso', label: 'SGSO (ANP)', description: 'Sistema de Gestão de Segurança Operacional', icon: HardHat, color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30' },
  { key: 'pre-sire', label: 'Pre-SIRE', description: 'Ship Inspection Report Exchange', icon: BarChart3, color: 'from-violet-500/20 to-violet-600/10 border-violet-500/30' },
  { key: 'tmsa', label: 'TMSA', description: 'Tanker Management Self Assessment', icon: Bot, color: 'from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30' },
];

const auditStandards: Record<string, React.LazyExoticComponent<React.ComponentType<Record<string, never>>>> = {
  'peo-dp': PEODP, 'peotram': PEOTRAM, 'ism': SafetyIMCAV2, 'isps': ISPSSecurityV2,
  'solas': SOLASInspection, 'marpol': WasteManagementPremium, 'pre-ovid': PreOVIDInspection,
  'pre-mlc': MLCInspection, 'psc': PSCPackage, 'sgso': SGSO, 'pre-sire': PreSIREInspection, 'tmsa': TMSAAssessment,
};

export default function ComplianceMegaHub() {
  const { t } = useTranslation();
  const tabConfig = useComplianceTabConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'hub';
  const activeTab = TAB_MIGRATION[rawTab] || rawTab;
  const standard = searchParams.get('standard');
  const activeModuleId = searchParams.get('module');
  const [launcherOpen, setLauncherOpen] = useState(false);
  const queryClient = useQueryClient();
  const { exportToCSV } = useRealActionHandlers();

  // Sub-tab state
  const [scorecardSubTab, setScorecardSubTab] = useState<'scorecard' | 'ism-kpi'>('scorecard');
  const [riskSafetySubTab, setRiskSafetySubTab] = useState<'risk-matrix' | 'ncs-capas' | 'loto' | 'jsa'>('risk-matrix');
  const [regulationsSubTab, setRegulationsSubTab] = useState<'regulations' | 'security' | 'sire2'>('regulations');

  // Initialize sub-tab from old deep-link
  React.useEffect(() => {
    if (rawTab === 'ism-kpi') setScorecardSubTab('ism-kpi');
    if (rawTab === 'ncs-capas') setRiskSafetySubTab('ncs-capas');
    if (rawTab === 'loto') setRiskSafetySubTab('loto');
    if (rawTab === 'jsa') setRiskSafetySubTab('jsa');
    if (rawTab === 'security') setRegulationsSubTab('security');
    if (rawTab === 'sire2') setRegulationsSubTab('sire2');
  }, [rawTab]);

  // Real data
  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ['compliance-audits-hub'],
    queryFn: async () => { const { data, error } = await supabase.from('internal_audits').select('*').order('created_at', { ascending: false }).limit(50); if (error) throw error; return data || []; },
    staleTime: 30000,
  });
  const { data: nonConformities = [] } = useQuery({
    queryKey: ['compliance-ncs-hub'],
    queryFn: async () => { const { data, error } = await supabase.from('non_conformities').select('*').order('created_at', { ascending: false }).limit(50); if (error) throw error; return data || []; },
    staleTime: 30000,
  });

  const complianceMetrics = useMemo(() => ({
    totalAudits: audits.length,
    openAudits: audits.filter((a) => a.status === 'open' || a.status === 'in_progress').length,
    completedAudits: audits.filter((a) => a.status === 'completed' || a.status === 'closed').length,
    totalNCs: nonConformities.length,
    openNCs: nonConformities.filter((nc) => nc.status === 'open').length,
  }), [audits, nonConformities]);

  const workflowSteps = useMemo(() => [
    { id: 'planning', label: 'Planejamento', status: complianceMetrics.totalAudits > 0 ? 'completed' as const : 'current' as const },
    { id: 'execution', label: 'Execução', status: complianceMetrics.openAudits > 0 ? 'current' as const : complianceMetrics.totalAudits > 0 ? 'completed' as const : 'pending' as const },
    { id: 'findings', label: 'Achados', status: complianceMetrics.totalNCs > 0 ? 'current' as const : 'pending' as const },
    { id: 'capa', label: 'CAPA', status: complianceMetrics.openNCs > 0 ? 'current' as const : complianceMetrics.totalNCs > 0 ? 'completed' as const : 'pending' as const },
    { id: 'closure', label: 'Encerramento', status: complianceMetrics.completedAudits > 2 ? 'completed' as const : 'pending' as const }
  ], [complianceMetrics]);

  const handleTabChange = (value: string) => { setSearchParams({ tab: value }); };
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['compliance-audits-hub'] });
    await queryClient.invalidateQueries({ queryKey: ['compliance-ncs-hub'] });
    toast.success('Dados de compliance atualizados');
  }, [queryClient]);

  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditForm, setAuditForm] = useState({ audit_type: 'internal', scope: '', vessel_id: '' });
  const handleNewAudit = useCallback(() => { setAuditDialogOpen(true); }, []);

  const handleSubmitAudit = useCallback(async () => {
    if (!auditForm.audit_type) { toast.error('Tipo de auditoria obrigatório'); return; }
    const auditNumber = `AUD-${new Date().getFullYear()}-${String(Date.now() % 9999).padStart(4, '0')}`;
    const { data, error } = await supabase.from('internal_audits').insert({ audit_number: auditNumber, audit_type: auditForm.audit_type, scope: auditForm.scope || null, vessel_id: auditForm.vessel_id || null, status: 'planned' }).select().single();
    if (error) { toast.error('Erro ao criar auditoria: ' + error.message); return; }
    toast.success('Auditoria criada: ' + auditNumber);
    publishEvent({ type: 'compliance.audit.created', payload: { audit_id: data?.id, audit_number: auditNumber, audit_type: auditForm.audit_type, vessel_id: auditForm.vessel_id }, sourceEntityType: 'audit', sourceEntityId: data?.id });
    queryClient.invalidateQueries({ queryKey: ['compliance-audits-hub'] });
    queryClient.invalidateQueries({ queryKey: ['compliance'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    setAuditDialogOpen(false);
    setAuditForm({ audit_type: 'internal', scope: '', vessel_id: '' });
  }, [auditForm, queryClient]);

  const handleExportCompliance = useCallback(async () => {
    const allData = [...audits.map((a) => ({ tipo: 'Auditoria', ...a })), ...nonConformities.map((nc) => ({ tipo: 'NC', ...nc }))];
    exportToCSV(allData, 'compliance-report');
  }, [audits, nonConformities, exportToCSV]);

  // If accessing a specific standard, render that audit page
  if (standard && auditStandards[standard]) {
    const AuditComponent = auditStandards[standard];
    return <Suspense fallback={<LoadingSkeleton />}><AuditComponent /></Suspense>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg"><Shield className="h-6 w-6 text-destructive" /></div>
              <div>
                <h1 className="text-2xl font-bold">{t('megaHubs.compliance.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('megaHubs.compliance.subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{t('megaHubs.compliance.audits', { count: complianceMetrics.totalAudits })}</Badge>
              {complianceMetrics.openNCs > 0 && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">{t('megaHubs.compliance.openNCs', { count: complianceMetrics.openNCs })}</Badge>}
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">{t('megaHubs.compliance.standards')}</Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[73px] z-10">
          <div className="container">
            <TabsList className="h-auto flex-wrap bg-transparent gap-1.5 justify-start py-2">
              {tabConfig.map((tab) => (
                <TabTriggerWithModules key={tab.id} tabId={tab.id} label={tab.label} icon={tab.icon} modules={COMPLIANCE_TAB_MODULES[tab.id] || []} onModuleSelect={(moduleId) => setSearchParams({ tab: 'modules', module: moduleId })} onOpenLauncher={() => setLauncherOpen(true)} />
              ))}
            </TabsList>
          </div>
        </div>

        <div className="container py-6">
          <Suspense fallback={<LoadingSkeleton />}>
            {/* Hub Overview */}
            <TabsContent value="hub" className="mt-0 space-y-6">
              <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-1.5"><Wifi className="h-3.5 w-3.5 text-success" /><span>Conectado</span></div>
                <span>•</span><span>{complianceMetrics.totalAudits} auditorias</span>
                <span>•</span><span>{complianceMetrics.openNCs} NCs abertas</span>
                <span>•</span><span>12 padrões marítimos</span>
              </div>
              <EnhancedActionBar title="Centro de Compliance" subtitle={`${complianceMetrics.openAudits} auditorias em andamento | ${complianceMetrics.openNCs} não-conformidades abertas`}
                actions={[
                  { id: 'new-audit', label: 'Nova Auditoria', icon: <Plus className="h-4 w-4" />, onClick: handleNewAudit, variant: 'default', tooltip: 'Iniciar nova auditoria interna' },
                  { id: 'workflow', label: 'Workflow', icon: <ClipboardCheck className="h-4 w-4" />, onClick: () => setSearchParams({ tab: 'audit-workflow' }), variant: 'outline' },
                ]}
                onRefresh={handleRefresh} isRefreshing={auditsLoading}
                secondaryActions={[{ id: 'export', label: 'Exportar Relatório', icon: <Download className="h-4 w-4" />, onClick: handleExportCompliance }]}
                showSearch searchPlaceholder="Buscar auditorias, certificados, NCs..."
              />
              <WorkflowStatusBar title="Ciclo de Compliance" steps={workflowSteps} variant="horizontal" />
              {!auditsLoading && complianceMetrics.totalAudits === 0 && <HubEmptyState hub="compliance" onPrimaryAction={handleNewAudit} />}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}><AuditCountdownCards /></Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}><ComplianceScoreDashboard /></Suspense>
              </div>
              <Suspense fallback={<Skeleton className="h-64" />}><DocumentExpiryMatrix /></Suspense>
              <Suspense fallback={<Skeleton className="h-64" />}><ComplianceEventsMonitor /></Suspense>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}><ComplianceRiskPredictor /></Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}><AuditReadinessTimeline /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Suspense fallback={<Skeleton className="h-64" />}><RegulatoryChangeTracker /></Suspense></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}><VettingReadinessCenter /></Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}><AuditGapHeatmap /></Suspense>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Suspense fallback={<Skeleton className="h-64" />}><RegulatoryRadarLive /></Suspense></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}><ISMGapAnalyzer /></Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}><PSCDetentionPredictor /></Suspense>
              </div>
              <Suspense fallback={<Skeleton className="h-64" />}><SafetyIncidentAnalytics /></Suspense>
              <Suspense fallback={<Skeleton className="h-64" />}><ComplianceReadinessTimeline /></Suspense>
              {(auditsLoading || complianceMetrics.totalAudits > 0) && <ComplianceHubPage />}
              <CrossModulePanel entityType="audit" entityId={audits[0]?.id ?? ''} vesselId={audits[0]?.vessel_id ?? undefined} showQuickActions showActivityFeed />
            </TabsContent>

            {/* Audit Workflow */}
            <TabsContent value="audit-workflow" className="mt-0 space-y-6">
              <EnhancedActionBar title="Gerenciador de Auditorias" subtitle="Scorecards dinâmicos para ISM, ISPS, MLC e todas 12 auditorias marítimas"
                actions={[{ id: 'new-audit', label: 'Nova Auditoria', icon: <Plus className="h-4 w-4" />, onClick: handleNewAudit, variant: 'default' }]}
                onRefresh={handleRefresh}
              />
              <AuditWorkflowManager />
            </TabsContent>

            {/* 12 Auditorias */}
            <TabsContent value="audits" className="mt-0 space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground">12 Auditorias Marítimas</h2>
                <p className="text-sm text-muted-foreground mt-1">IMO, OCIMF, ILO, ANP — Selecione um padrão para iniciar</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {AUDIT_STANDARDS_CARDS.map((std) => (
                  <button key={std.key} onClick={() => setSearchParams({ tab: 'audits', standard: std.key })}
                    className={cn("group relative flex flex-col items-start gap-3 p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300 text-left hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]", std.color)}>
                    <div className="p-2.5 rounded-xl bg-background/60 backdrop-blur-sm group-hover:bg-background/80 transition-colors"><std.icon className="h-5 w-5 text-foreground" /></div>
                    <div><div className="text-base font-bold text-foreground">{std.label}</div><div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{std.description}</div></div>
                  </button>
                ))}
              </div>
            </TabsContent>

            {/* Scorecard & KPIs (merged: scorecard + ISM KPIs) */}
            <TabsContent value="scorecard" className="mt-0 space-y-4">
              <SubTabSelector options={[{ id: 'scorecard', label: '📊 Scorecard' }, { id: 'ism-kpi', label: '📈 ISM KPIs' }]} active={scorecardSubTab} onChange={(id) => setScorecardSubTab(id as 'scorecard' | 'ism-kpi')} />
              {scorecardSubTab === 'scorecard' && <ComplianceScorecardPage />}
              {scorecardSubTab === 'ism-kpi' && <ISMKPIDashboard />}
            </TabsContent>

            <TabsContent value="audit-agents" className="mt-0"><AgentsDashboard /></TabsContent>
            <TabsContent value="certificates" className="mt-0"><DiagnosticCertificatesPage /></TabsContent>

            {/* Risk & Safety (merged: risk-matrix + ncs-capas + loto + jsa) */}
            <TabsContent value="risk-safety" className="mt-0 space-y-4">
              <SubTabSelector options={[{ id: 'risk-matrix', label: '🎯 Risk Matrix' }, { id: 'ncs-capas', label: '⚠️ NCs & CAPAs' }, { id: 'loto', label: '🔒 LOTO' }, { id: 'jsa', label: '📋 JSA' }]} active={riskSafetySubTab} onChange={(id) => setRiskSafetySubTab(id as typeof riskSafetySubTab)} />
              {riskSafetySubTab === 'risk-matrix' && <RiskMatrixV2 />}
              {riskSafetySubTab === 'ncs-capas' && <DiagnosticNCsPage />}
              {riskSafetySubTab === 'loto' && <LOTOProceduresManager />}
              {riskSafetySubTab === 'jsa' && <JSATemplatesManager />}
            </TabsContent>

            {/* Regulations & Security (merged: regulations + security + sire2) */}
            <TabsContent value="regulations" className="mt-0 space-y-4">
              <SubTabSelector options={[{ id: 'regulations', label: '📜 Regulations' }, { id: 'security', label: '🔐 Security' }, { id: 'sire2', label: '📡 SIRE 2.0' }]} active={regulationsSubTab} onChange={(id) => setRegulationsSubTab(id as 'regulations' | 'security' | 'sire2')} />
              {regulationsSubTab === 'regulations' && <RegulationsV2 />}
              {regulationsSubTab === 'security' && <SecurityCenter />}
              {regulationsSubTab === 'sire2' && <SIRE2HubPage />}
            </TabsContent>

            <TabsContent value="ai-hub" className="mt-0"><ComplianceAIHub /></TabsContent>

            <TabsContent value="modules" className="mt-0">
              <HubModulesBrowser modules={COMPLIANCE_ABSORBED} hubName="Hub de Compliance" hubColor="text-destructive" activeModuleId={activeModuleId}
                onModuleSelect={(id) => { if (id) setSearchParams({ tab: 'modules', module: id }); else setSearchParams({ tab: 'modules' }); }}
              />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>

      {/* New Audit Dialog */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nova Auditoria</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Tipo de Auditoria *</Label>
              <Select value={auditForm.audit_type} onValueChange={v => setAuditForm(p => ({ ...p, audit_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Interna</SelectItem><SelectItem value="external">Externa</SelectItem><SelectItem value="flag_state">Flag State</SelectItem><SelectItem value="psc">PSC</SelectItem><SelectItem value="class">Sociedade Classificadora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Escopo</Label><Input value={auditForm.scope} onChange={e => setAuditForm(p => ({ ...p, scope: e.target.value }))} placeholder="Ex: ISM Code, ISPS, MLC 2006" /></div>
            <Button className="w-full" onClick={handleSubmitAudit}>Criar Auditoria</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ModuleLauncherModal open={launcherOpen} onOpenChange={setLauncherOpen} hubName="Arsenal Regulatório" hubIcon={<Shield className="h-5 w-5" />} modules={COMPLIANCE_ABSORBED} onModuleSelect={(moduleId) => setSearchParams({ tab: 'modules', module: moduleId })} />
    </div>
  );
}
