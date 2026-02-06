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

import React, { Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, BarChart3, Bot, Award, Target, AlertTriangle, FileText, Lock, Plus, Download, ClipboardCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';
import { EnhancedActionBar } from '@/components/ui/world-class/EnhancedActionBar';
import { WorkflowStatusBar } from '@/components/ui/world-class/WorkflowStatusBar';
import { AuditWorkflowManager } from '@/components/world-class';

// ═══════════════════════════════════════════════════════════
// LAZY LOAD - SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════
const ComplianceHubPage = lazy(() => import('@/pages/ComplianceHubPremium'));
const AgentsDashboard = lazy(() => import('@/pages/audit-agents/AgentsDashboard'));
const DiagnosticCertificatesPage = lazy(() => import('@/pages/DiagnosticCertificatesPage'));
const RiskMatrixV2 = lazy(() => import('@/pages/RiskMatrixV2'));
const DiagnosticNCsPage = lazy(() => import('@/pages/DiagnosticNCsPage'));
const RegulationsV2 = lazy(() => import('@/pages/RegulationsV2'));
const SecurityCenter = lazy(() => import('@/pages/SecurityCenter'));

// ═══════════════════════════════════════════════════════════
// 12 AUDITORIAS MARÍTIMAS COMPLETAS - ZERO SUPRESSÃO
// ═══════════════════════════════════════════════════════════
const PEODP = lazy(() => import('@/pages/PEODP'));
const PEOTRAM = lazy(() => import('@/pages/PEOTRAM'));
const SafetyIMCAV2 = lazy(() => import('@/pages/SafetyIMCAV2'));
const ISPSSecurityV2 = lazy(() => import('@/pages/ISPSSecurityV2'));
const SOLASInspection = lazy(() => import('@/pages/SOLASInspection'));
const WasteManagementPremium = lazy(() => import('@/pages/WasteManagementPremium'));
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
];

// ═══════════════════════════════════════════════════════════
// MAPEAMENTO COMPLETO DAS 12 AUDITORIAS MARÍTIMAS
// ═══════════════════════════════════════════════════════════
const auditStandards: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
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

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleActionBarAction = (action: string) => {
    console.log(`Compliance action: ${action}`);
  };

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
                <h1 className="text-2xl font-bold">Compliance Hub</h1>
                <p className="text-sm text-muted-foreground">12 Auditorias Marítimas + 10 Agentes IA</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                12 Audits
              </Badge>
              <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
                10 AI Agents
              </Badge>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                MEGA-HUB F
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
              {/* Enhanced Action Bar */}
              <EnhancedActionBar
                title="Compliance Command Center"
                subtitle="Manage audits, certifications, and regulatory compliance"
                actions={[
                  {
                    id: 'new-audit',
                    label: 'Start Audit',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('new-audit'),
                    variant: 'default'
                  },
                  {
                    id: 'workflow',
                    label: 'Audit Workflow',
                    icon: <ClipboardCheck className="h-4 w-4" />,
                    onClick: () => setSearchParams({ tab: 'audit-workflow' }),
                    variant: 'outline'
                  },
                  {
                    id: 'export',
                    label: 'Export Report',
                    icon: <Download className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('export'),
                    variant: 'outline'
                  }
                ]}
                showSearch
                searchPlaceholder="Search audits, certificates, NCs..."
              />

              {/* Workflow Status */}
              <WorkflowStatusBar
                title="Compliance Cycle"
                steps={[
                  { id: 'planning', label: 'Planning', status: 'completed' },
                  { id: 'execution', label: 'Audit Execution', status: 'completed' },
                  { id: 'findings', label: 'Findings Review', status: 'current' },
                  { id: 'capa', label: 'CAPA Actions', status: 'pending' },
                  { id: 'closure', label: 'Closure', status: 'pending' }
                ]}
                variant="horizontal"
              />

              <ComplianceHubPage />
            </TabsContent>

            <TabsContent value="audit-workflow" className="mt-0 space-y-6">
              {/* Enhanced Action Bar for Audit Workflow */}
              <EnhancedActionBar
                title="Audit Workflow Manager"
                subtitle="Dynamic scorecards for ISM, ISPS, MLC, and all 12 maritime audits"
                actions={[
                  {
                    id: 'new-audit',
                    label: 'New Audit',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => handleActionBarAction('new-audit'),
                    variant: 'default'
                  }
                ]}
              />

              {/* World-Class Audit Workflow Manager */}
              <AuditWorkflowManager />
            </TabsContent>
            
            <TabsContent value="scorecard" className="mt-0">
              <ComplianceHubPage />
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
          </Suspense>
        </div>
      </Tabs>
    </div>
  );
}
