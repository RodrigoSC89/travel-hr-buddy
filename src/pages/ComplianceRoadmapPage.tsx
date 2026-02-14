/**
 * ComplianceRoadmapPage - Página unificada do Roadmap de Compliance
 * Integra Dashboard, Alertas, Scoring, Workflow NC, Análise Preditiva, Calendário e Audit Trail
 */

import { Suspense, lazy, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard, Bell, Calculator, GitBranch, Brain, Calendar, History, BellRing,
  Sparkles, Search, MessageSquare, Zap
} from 'lucide-react';

// Lazy load components for better performance
const ComplianceRoadmapDashboard = lazy(() => 
  import('@/components/compliance/roadmap/ComplianceRoadmapDashboard').then(m => ({ default: m.ComplianceRoadmapDashboard }))
);
const SmartAlertsSystem = lazy(() => 
  import('@/components/compliance/roadmap/SmartAlertsSystem').then(m => ({ default: m.SmartAlertsSystem }))
);
const AutoScoringEngine = lazy(() => 
  import('@/components/compliance/roadmap/AutoScoringEngine').then(m => ({ default: m.AutoScoringEngine }))
);
const NCAutomaticWorkflow = lazy(() => 
  import('@/components/compliance/roadmap/NCAutomaticWorkflow').then(m => ({ default: m.NCAutomaticWorkflow }))
);
const PredictiveComplianceAI = lazy(() => 
  import('@/components/compliance/roadmap/PredictiveComplianceAI').then(m => ({ default: m.PredictiveComplianceAI }))
);
const CalendarIntegration = lazy(() => 
  import('@/components/compliance/roadmap/CalendarIntegration').then(m => ({ default: m.CalendarIntegration }))
);
const AuditTrailSystem = lazy(() => 
  import('@/components/compliance/roadmap/AuditTrailSystem').then(m => ({ default: m.AuditTrailSystem }))
);
const SmartNotifications = lazy(() => 
  import('@/components/compliance/roadmap/SmartNotifications').then(m => ({ default: m.SmartNotifications }))
);
const ComplianceSGIAutoEvidence = lazy(() =>
  import('@/components/compliance/ai/ComplianceSGIAutoEvidence').then(m => ({ default: m.ComplianceSGIAutoEvidence }))
);
const ComplianceGapAnalyzer = lazy(() =>
  import('@/components/compliance/ai/ComplianceGapAnalyzer').then(m => ({ default: m.ComplianceGapAnalyzer }))
);
const ComplianceInterviewSimulator = lazy(() =>
  import('@/components/compliance/ai/ComplianceInterviewSimulator').then(m => ({ default: m.ComplianceInterviewSimulator }))
);
const ComplianceOneClickAuditPrep = lazy(() =>
  import('@/components/compliance/ai/ComplianceOneClickAuditPrep').then(m => ({ default: m.ComplianceOneClickAuditPrep }))
);

const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={`roadmap-skel-${i}`} className="h-32" />
      ))}
    </div>
    <Skeleton className="h-64" />
  </div>
);

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'scoring', label: 'Scoring', icon: Calculator },
  { id: 'workflow', label: 'Fluxo NC', icon: GitBranch },
  { id: 'predictive', label: 'Preditivo', icon: Brain },
  { id: 'calendar', label: 'Calendário', icon: Calendar },
  { id: 'notifications', label: 'Notificações', icon: BellRing },
  { id: 'audit', label: 'Audit Trail', icon: History },
  { id: 'sgi-evidence', label: 'SGI Evidence', icon: Sparkles },
  { id: 'gap-analyzer', label: 'Gap Analyzer', icon: Search },
  { id: 'interview-sim', label: 'Simulador', icon: MessageSquare },
  { id: 'audit-prep', label: 'Audit Prep', icon: Zap },
];

export default function ComplianceRoadmapPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <>
      <Helmet>
        <title>Compliance Roadmap - Nauti One</title>
        <meta name="description" content="Dashboard avançado de conformidade com alertas inteligentes, scoring automático, workflow de NCs, análise preditiva com IA, integração de calendário e audit trail completo" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Centro de Compliance Avançado</h1>
          <p className="text-muted-foreground">
            Gestão inteligente de conformidade com automação e IA preditiva
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-6">
            <Suspense fallback={<LoadingFallback />}>
              <TabsContent value="dashboard" className="m-0">
                <ComplianceRoadmapDashboard />
              </TabsContent>
              <TabsContent value="alerts" className="m-0">
                <SmartAlertsSystem />
              </TabsContent>
              <TabsContent value="scoring" className="m-0">
                <AutoScoringEngine />
              </TabsContent>
              <TabsContent value="workflow" className="m-0">
                <NCAutomaticWorkflow />
              </TabsContent>
              <TabsContent value="predictive" className="m-0">
                <PredictiveComplianceAI />
              </TabsContent>
              <TabsContent value="calendar" className="m-0">
                <CalendarIntegration />
              </TabsContent>
              <TabsContent value="notifications" className="m-0">
                <SmartNotifications />
              </TabsContent>
              <TabsContent value="audit" className="m-0">
                <AuditTrailSystem />
              </TabsContent>
              <TabsContent value="sgi-evidence" className="m-0">
                <ComplianceSGIAutoEvidence
                  moduleId="compliance-roadmap"
                  moduleName="Compliance Center"
                  checklistItems={[
                    { id: "ISM-1", name: "ISM Code - Safety Management System", description: "SMS implementation and DOC/SMC" },
                    { id: "ISPS-1", name: "ISPS Code - Ship Security", description: "SSP, SSA, Security Levels" },
                    { id: "SOLAS-1", name: "SOLAS - Safety of Life at Sea", description: "Life-saving, fire safety, navigation" },
                    { id: "MARPOL-1", name: "MARPOL - Pollution Prevention", description: "Annexes I-VI compliance" },
                    { id: "MLC-1", name: "MLC 2006 - Maritime Labour", description: "Working conditions, crew welfare" },
                    { id: "STCW-1", name: "STCW - Training Standards", description: "Certificates, competencies" },
                  ]}
                />
              </TabsContent>
              <TabsContent value="gap-analyzer" className="m-0">
                <ComplianceGapAnalyzer
                  moduleId="compliance-roadmap"
                  moduleName="Compliance Center"
                  standards={["ISM Code", "ISPS Code", "SOLAS", "MARPOL", "MLC 2006", "STCW", "TMSA", "OCIMF SIRE"]}
                />
              </TabsContent>
              <TabsContent value="interview-sim" className="m-0">
                <ComplianceInterviewSimulator
                  moduleId="compliance-roadmap"
                  moduleName="Compliance Center"
                  standardContext="Multi-framework compliance audit covering ISM, ISPS, SOLAS, MARPOL, MLC, and STCW. Prepare crew for external auditor interviews across all major maritime regulatory frameworks."
                />
              </TabsContent>
              <TabsContent value="audit-prep" className="m-0">
                <ComplianceOneClickAuditPrep
                  moduleId="compliance-roadmap"
                  moduleName="Compliance Center"
                />
              </TabsContent>
            </Suspense>
          </div>
        </Tabs>
      </div>
    </>
  );
}
