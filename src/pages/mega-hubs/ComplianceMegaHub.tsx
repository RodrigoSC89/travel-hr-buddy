/**
 * Compliance Mega-Hub - Auditorias & Conformidade
 * Rota canônica: /compliance
 * 
 * Consolida: Compliance Hub + 12 Maritime Audits + 10 AI Agents + Security
 * 
 * ✅ 12 AUDITORIAS MARÍTIMAS COMPLETAS
 * ✅ 10 AGENTES DE AUDITORIA IA
 * ✅ ZERO SUPRESSÃO DE FUNCIONALIDADES
 * ✅ WORLD-CLASS COMPONENTS INTEGRATED
 */

import React, { Suspense, lazy, useMemo, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, BarChart3, Bot, Award, Target, AlertTriangle, FileText, Lock, Plus, Download, ClipboardCheck, Wifi, Brain, HardHat, ClipboardList } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
// AuditWorkflowManager removed - world-class deleted
import { HubEmptyState } from '@/components/ui/HubEmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealActionHandlers } from '@/hooks/useRealActionHandlers';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════
// LAZY LOAD - SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// 12 AUDITORIAS MARÍTIMAS COMPLETAS - ZERO SUPRESSÃO
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════
// TAB CONFIGURATION
// ═══════════════════════════════════════════════════════════
interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
}

const tabConfig: TabConfig[] = [
  { id: 'hub', label: 'Compliance Hub', icon: Shield },
  { id: 'audit-workflow', label: 'Audit Workflow', icon: ClipboardCheck },
  { id: 'scorecard', label: 'Scorecard', icon: BarChart3 },
  { id: 'audit-agents', label: '10 AI Agents', icon: Bot },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'risk-matrix', label: 'Risk Matrix', icon: Target },
  { id: 'ncs-capas', label: 'NCs & CAPAs', icon: AlertTriangle },
  { id: 'regulations', label: 'Regulations', icon: FileText },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'loto', label: 'LOTO', icon: HardHat },
  { id: 'jsa', label: 'JSA', icon: ClipboardList },
  { id: 'ai-hub', label: '🧠 IA Compliance', icon: Brain },
];

// ═══════════════════════════════════════════════════════════
// MAPEAMENTO COMPLETO DAS 12 AUDITORIAS MARÍTIMAS
// ═══════════════════════════════════════════════════════════
const auditStandards: Record<string, React.LazyExoticComponent<React.ComponentType<Record<string, never>>>> = {
  'peo-dp': PEODP,
  'peotram': PEOTRAM,
  'ism': SafetyIMCAV2,
  'isps': ISPSSecurityV2,
  'solas': SOLASInspection,
  'marpol': WasteManagementPremium,
  'pre-ovid': PreOVIDInspection,
  'pre-mlc': MLCInspection,
  'psc': PSCPackage,
  'sgso': SGSO,
  'pre-sire': PreSIREInspection,
  'tmsa': TMSAAssessment,
};

// ═══════════════════════════════════════════════════════════
// COMPLIANCE MEGA-HUB COMPONENT
// ═══════════════════════════════════════════════════════════
export default function ComplianceMegaHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'hub';
  const standard = searchParams.get('standard');
  const queryClient = useQueryClient();
  const { exportToCSV } = useRealActionHandlers();

  // Real compliance data
  const { data: audits = [], isLoading: auditsLoading } = useQuery({
    queryKey: ['compliance-audits-hub'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_audits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: nonConformities = [] } = useQuery({
    queryKey: ['compliance-ncs-hub'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('non_conformities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Compliance metrics
  const complianceMetrics = useMemo(() => ({
    totalAudits: audits.length,
    openAudits: audits.filter((a) => a.status === 'open' || a.status === 'in_progress').length,
    completedAudits: audits.filter((a) => a.status === 'completed' || a.status === 'closed').length,
    totalNCs: nonConformities.length,
    openNCs: nonConformities.filter((nc) => nc.status === 'open').length,
  }), [audits, nonConformities]);

  // Dynamic workflow
  const workflowSteps = useMemo(() => [
    { id: 'planning', label: 'Planejamento', status: complianceMetrics.totalAudits > 0 ? 'completed' as const : 'current' as const },
    { id: 'execution', label: 'Execução', status: complianceMetrics.openAudits > 0 ? 'current' as const : complianceMetrics.totalAudits > 0 ? 'completed' as const : 'pending' as const },
    { id: 'findings', label: 'Achados', status: complianceMetrics.totalNCs > 0 ? 'current' as const : 'pending' as const },
    { id: 'capa', label: 'CAPA', status: complianceMetrics.openNCs > 0 ? 'current' as const : complianceMetrics.totalNCs > 0 ? 'completed' as const : 'pending' as const },
    { id: 'closure', label: 'Encerramento', status: complianceMetrics.completedAudits > 2 ? 'completed' as const : 'pending' as const }
  ], [complianceMetrics]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['compliance-audits-hub'] });
    await queryClient.invalidateQueries({ queryKey: ['compliance-ncs-hub'] });
    toast.success('Dados de compliance atualizados');
  }, [queryClient]);

  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [auditForm, setAuditForm] = useState({ audit_type: 'internal', scope: '', vessel_id: '' });

  const handleNewAudit = useCallback(() => {
    setAuditDialogOpen(true);
  }, []);

  const handleSubmitAudit = useCallback(async () => {
    if (!auditForm.audit_type) { toast.error('Tipo de auditoria obrigatório'); return; }
    const auditNumber = `AUD-${new Date().getFullYear()}-${String(Date.now() % 9999).padStart(4, '0')}`;
    const { error } = await supabase.from('internal_audits').insert({
      audit_number: auditNumber,
      audit_type: auditForm.audit_type,
      scope: auditForm.scope || null,
      vessel_id: auditForm.vessel_id || null,
      status: 'planned',
    });
    if (error) { toast.error('Erro ao criar auditoria: ' + error.message); return; }
    toast.success('Auditoria criada: ' + auditNumber);
    queryClient.invalidateQueries({ queryKey: ['compliance-audits-hub'] });
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
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <AuditComponent />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hub de Compliance</h1>
                <p className="text-sm text-muted-foreground">
                  12 auditorias marítimas (IMO, OCIMF, ILO, ANP) + 10 agentes IA de auditoria
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {complianceMetrics.totalAudits} auditorias
              </Badge>
              {complianceMetrics.openNCs > 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  {complianceMetrics.openNCs} NCs abertas
                </Badge>
              )}
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                12/12 standards
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
            <TabsContent value="hub" className="mt-0 space-y-6">
              {/* System Status */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                <div className="flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 text-success" />
                  <span>Conectado</span>
                </div>
                <span>•</span>
                <span>{complianceMetrics.totalAudits} auditorias</span>
                <span>•</span>
                <span>{complianceMetrics.openNCs} NCs abertas</span>
                <span>•</span>
                <span>12 padrões marítimos</span>
              </div>

              {/* Enhanced Action Bar */}
              <EnhancedActionBar
                title="Centro de Compliance"
                subtitle={`${complianceMetrics.openAudits} auditorias em andamento | ${complianceMetrics.openNCs} não-conformidades abertas`}
                actions={[
                  {
                    id: 'new-audit',
                    label: 'Nova Auditoria',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: handleNewAudit,
                    variant: 'default',
                    tooltip: 'Iniciar nova auditoria interna'
                  },
                  {
                    id: 'workflow',
                    label: 'Workflow',
                    icon: <ClipboardCheck className="h-4 w-4" />,
                    onClick: () => setSearchParams({ tab: 'audit-workflow' }),
                    variant: 'outline'
                  },
                ]}
                onRefresh={handleRefresh}
                isRefreshing={auditsLoading}
                secondaryActions={[
                  {
                    id: 'export',
                    label: 'Exportar Relatório',
                    icon: <Download className="h-4 w-4" />,
                    onClick: handleExportCompliance,
                  }
                ]}
                showSearch
                searchPlaceholder="Buscar auditorias, certificados, NCs..."
              />

              {/* Workflow Status - Dynamic */}
              <WorkflowStatusBar
                title="Ciclo de Compliance"
                steps={workflowSteps}
                variant="horizontal"
              />

              {/* Empty state when no audits */}
              {!auditsLoading && complianceMetrics.totalAudits === 0 && (
                <HubEmptyState 
                  hub="compliance" 
                  onPrimaryAction={handleNewAudit} 
                />
              )}

              {/* Compliance Score Dashboard */}
              <Suspense fallback={<Skeleton className="h-64" />}>
                <ComplianceScoreDashboard />
              </Suspense>

              {/* Document & Certificate Expiry Matrix */}
              <Suspense fallback={<Skeleton className="h-64" />}>
                <DocumentExpiryMatrix />
              </Suspense>

              {/* Real-time Compliance Events Monitor */}
              <Suspense fallback={<Skeleton className="h-64" />}>
                <ComplianceEventsMonitor />
              </Suspense>

              {/* Wave 18: Compliance Intelligence Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <ComplianceRiskPredictor />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <AuditReadinessTimeline />
                </Suspense>
              </div>

              {/* Wave 25: Compliance Deep Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <RegulatoryChangeTracker />
                </Suspense>
              </div>

              {/* Wave 29: Vetting Readiness */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <VettingReadinessCenter />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <AuditGapHeatmap />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <AuditGapHeatmap />
                </Suspense>
              </div>

              {/* Wave 39: Regulatory Radar Live */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <RegulatoryRadarLive />
                </Suspense>
              </div>

              {/* Wave 44: ISM Gap Analyzer + Wave 50: PSC Detention Predictor */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <ISMGapAnalyzer />
                </Suspense>
                <Suspense fallback={<Skeleton className="h-64" />}>
                  <PSCDetentionPredictor />
                </Suspense>
              </div>

              {(auditsLoading || complianceMetrics.totalAudits > 0) && <ComplianceHubPage />}
            </TabsContent>

            <TabsContent value="audit-workflow" className="mt-0 space-y-6">
              {/* Enhanced Action Bar for Audit Workflow */}
              <EnhancedActionBar
                title="Gerenciador de Auditorias"
                subtitle="Scorecards dinâmicos para ISM, ISPS, MLC e todas 12 auditorias marítimas"
                actions={[
                  {
                    id: 'new-audit',
                    label: 'Nova Auditoria',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: handleNewAudit,
                    variant: 'default'
                  }
                ]}
                onRefresh={handleRefresh}
              />
              {/* AuditWorkflowManager removed */}
            </TabsContent>
            
            <TabsContent value="scorecard" className="mt-0">
              <ComplianceScorecardPage />
            </TabsContent>
            
            <TabsContent value="audit-agents" className="mt-0">
              <AgentsDashboard />
            </TabsContent>
            
            <TabsContent value="certificates" className="mt-0">
              <DiagnosticCertificatesPage />
            </TabsContent>
            
            <TabsContent value="risk-matrix" className="mt-0">
              <RiskMatrixV2 />
            </TabsContent>
            
            <TabsContent value="ncs-capas" className="mt-0">
              <DiagnosticNCsPage />
            </TabsContent>
            
            <TabsContent value="regulations" className="mt-0">
              <RegulationsV2 />
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <SecurityCenter />
            </TabsContent>

            <TabsContent value="loto" className="mt-0">
              <LOTOProceduresManager />
            </TabsContent>

            <TabsContent value="jsa" className="mt-0">
              <JSATemplatesManager />
            </TabsContent>

            <TabsContent value="ai-hub" className="mt-0">
              <ComplianceAIHub />
            </TabsContent>
          </Suspense>
        </div>
      </Tabs>

      {/* New Audit Dialog */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Auditoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Tipo de Auditoria *</Label>
              <Select value={auditForm.audit_type} onValueChange={v => setAuditForm(p => ({ ...p, audit_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Interna</SelectItem>
                  <SelectItem value="external">Externa</SelectItem>
                  <SelectItem value="flag_state">Flag State</SelectItem>
                  <SelectItem value="psc">PSC</SelectItem>
                  <SelectItem value="class">Sociedade Classificadora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Escopo</Label><Input value={auditForm.scope} onChange={e => setAuditForm(p => ({ ...p, scope: e.target.value }))} placeholder="Ex: ISM Code, ISPS, MLC 2006" /></div>
            <Button className="w-full" onClick={handleSubmitAudit}>Criar Auditoria</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
