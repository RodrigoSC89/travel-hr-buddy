import type { FC } from 'react';
import { useState, Suspense, lazy } from 'react';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Shield, Brain, Scale, Globe, Sparkles, Search, MessageSquare, Zap, ClipboardCheck, FileSearch, Clock, Heart, Users, Calculator } from 'lucide-react';
import { MLCInspectionDashboardV2 } from '@/components/mlc/MLCInspectionDashboardV2';
import { MLCWelfareScoring } from '@/components/mlc/MLCWelfareScoring';
import { MLCDMLCChecklist } from '@/components/mlc/MLCDMLCChecklist';
import { MLCWorkRestCalculator } from '@/components/mlc/MLCWorkRestCalculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const ComplianceSGIAutoEvidence = lazy(() => import('@/components/compliance/ai/ComplianceSGIAutoEvidence').then(m => ({ default: m.ComplianceSGIAutoEvidence })));
const ComplianceGapAnalyzer = lazy(() => import('@/components/compliance/ai/ComplianceGapAnalyzer').then(m => ({ default: m.ComplianceGapAnalyzer })));
const ComplianceInterviewSimulator = lazy(() => import('@/components/compliance/ai/ComplianceInterviewSimulator').then(m => ({ default: m.ComplianceInterviewSimulator })));
const ComplianceOneClickAuditPrep = lazy(() => import('@/components/compliance/ai/ComplianceOneClickAuditPrep').then(m => ({ default: m.ComplianceOneClickAuditPrep })));
const ComplianceAutoChecklistGenerator = lazy(() => import('@/components/compliance/ai/ComplianceAutoChecklistGenerator').then(m => ({ default: m.ComplianceAutoChecklistGenerator })));
const ComplianceDocCrossReference = lazy(() => import('@/components/compliance/ai/ComplianceDocCrossReference').then(m => ({ default: m.ComplianceDocCrossReference })));
const ComplianceTimeline = lazy(() => import('@/components/compliance/ai/ComplianceTimeline').then(m => ({ default: m.ComplianceTimeline })));
const ComplianceRegulatoryChangeTracker = lazy(() => import('@/components/compliance/ai/ComplianceRegulatoryChangeTracker').then(m => ({ default: m.ComplianceRegulatoryChangeTracker })));
const ComplianceScoreBenchmark = lazy(() => import('@/components/compliance/ai/ComplianceScoreBenchmark').then(m => ({ default: m.ComplianceScoreBenchmark })));
const ComplianceAutoNCResolver = lazy(() => import('@/components/compliance/ai/ComplianceAutoNCResolver').then(m => ({ default: m.ComplianceAutoNCResolver })));
const CompliancePhotoEvidenceAI = lazy(() => import('@/components/compliance/ai/CompliancePhotoEvidenceAI').then(m => ({ default: m.CompliancePhotoEvidenceAI })));
const CompliancePSCRiskPredictor = lazy(() => import('@/components/compliance/ai/CompliancePSCRiskPredictor').then(m => ({ default: m.CompliancePSCRiskPredictor })));

const LoadingFallback = () => <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>;

const MLC_ITEMS = [
  { id: "MLC-1.1", name: "Minimum Age", description: "MLC Standard A1.1 - Minimum age requirements" },
  { id: "MLC-1.4", name: "Recruitment and Placement", description: "MLC Standard A1.4 - Manning agencies" },
  { id: "MLC-2.1", name: "Seafarers' Employment Agreements", description: "MLC Standard A2.1 - SEA requirements" },
  { id: "MLC-2.2", name: "Wages", description: "MLC Standard A2.2 - Payment of wages" },
  { id: "MLC-2.3", name: "Hours of Work and Rest", description: "MLC Standard A2.3 - Work/rest hours" },
  { id: "MLC-2.5", name: "Repatriation", description: "MLC Standard A2.5 - Repatriation rights" },
  { id: "MLC-3.1", name: "Accommodation and Recreation", description: "MLC Standard A3.1 - Crew accommodation" },
  { id: "MLC-3.2", name: "Food and Catering", description: "MLC Standard A3.2 - Food quality" },
  { id: "MLC-4.1", name: "Medical Care", description: "MLC Standard A4.1 - Medical care on board" },
  { id: "MLC-4.3", name: "Health and Safety", description: "MLC Standard A4.3 - H&S protection" },
];

const MLCInspection: FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Shield}
        title="MLC 2006 — Maritime Labour Convention"
        description="Inspeção e Conformidade MLC • DMLC Part I/II • Work/Rest • Welfare Score"
        gradient="green"
        badges={[
          { icon: Scale, label: 'MLC 2006' },
          { icon: Globe, label: 'ILO' },
          { icon: Brain, label: 'IA Integrada' },
          { icon: Users, label: 'Crew Welfare' },
        ]}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="dmlc" className="gap-1"><ClipboardCheck className="h-3 w-3" />DMLC I/II</TabsTrigger>
          <TabsTrigger value="work-rest" className="gap-1"><Clock className="h-3 w-3" />Work/Rest</TabsTrigger>
          <TabsTrigger value="welfare" className="gap-1"><Heart className="h-3 w-3" />Welfare</TabsTrigger>
          <TabsTrigger value="sgi-evidence" className="gap-1"><Sparkles className="h-3 w-3" />Evidências</TabsTrigger>
          <TabsTrigger value="gap-analyzer" className="gap-1"><Search className="h-3 w-3" />Gap Analyzer</TabsTrigger>
          <TabsTrigger value="interview-sim" className="gap-1"><MessageSquare className="h-3 w-3" />Simulador</TabsTrigger>
          <TabsTrigger value="audit-prep" className="gap-1"><Zap className="h-3 w-3" />Audit Prep</TabsTrigger>
          <TabsTrigger value="checklist-gen" className="gap-1"><ClipboardCheck className="h-3 w-3" />Checklist IA</TabsTrigger>
          <TabsTrigger value="nc-resolver" className="gap-1"><Shield className="h-3 w-3" />NC Resolver</TabsTrigger>
          <TabsTrigger value="photo-ai" className="gap-1"><Brain className="h-3 w-3" />Foto IA</TabsTrigger>
          <TabsTrigger value="psc-risk" className="gap-1"><Globe className="h-3 w-3" />Risco PSC</TabsTrigger>
          <TabsTrigger value="reg-tracker" className="gap-1"><Globe className="h-3 w-3" />Regulatório</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><MLCInspectionDashboardV2 /></TabsContent>
        <TabsContent value="dmlc"><MLCDMLCChecklist /></TabsContent>
        <TabsContent value="work-rest"><MLCWorkRestCalculator /></TabsContent>
        <TabsContent value="welfare"><MLCWelfareScoring /></TabsContent>

        <Suspense fallback={<LoadingFallback />}>
          <TabsContent value="sgi-evidence"><ComplianceSGIAutoEvidence moduleId="mlc" moduleName="MLC 2006" checklistItems={MLC_ITEMS} /></TabsContent>
          <TabsContent value="gap-analyzer"><ComplianceGapAnalyzer moduleId="mlc" moduleName="MLC 2006" standards={["MLC 2006 Title 1", "MLC 2006 Title 2", "MLC 2006 Title 3", "MLC 2006 Title 4", "MLC 2006 Title 5"]} /></TabsContent>
          <TabsContent value="interview-sim"><ComplianceInterviewSimulator moduleId="mlc" moduleName="MLC 2006" standardContext="MLC 2006 inspection covering seafarer employment agreements, wages, hours of work/rest, accommodation, food/catering, medical care, health & safety, and social security. Focus on DMLC Part I/II compliance, work/rest hour records, crew welfare indicators, and onboard complaint procedures." /></TabsContent>
          <TabsContent value="audit-prep"><ComplianceOneClickAuditPrep moduleId="mlc" moduleName="MLC 2006" /></TabsContent>
          <TabsContent value="checklist-gen"><ComplianceAutoChecklistGenerator moduleId="mlc" moduleName="MLC 2006" /></TabsContent>
          <TabsContent value="reg-tracker"><ComplianceRegulatoryChangeTracker moduleId="mlc" moduleName="MLC 2006" /></TabsContent>
          <TabsContent value="nc-resolver"><ComplianceAutoNCResolver moduleId="mlc" moduleName="MLC 2006" /></TabsContent>
          <TabsContent value="photo-ai"><CompliancePhotoEvidenceAI moduleId="mlc" moduleName="MLC 2006" /></TabsContent>
          <TabsContent value="psc-risk"><CompliancePSCRiskPredictor moduleId="mlc" moduleName="MLC 2006" /></TabsContent>
        </Suspense>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default MLCInspection;
