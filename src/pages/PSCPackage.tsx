import type { FC } from 'react';
import { useState, Suspense, lazy } from 'react';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Shield, AlertTriangle, Package, Download, Sparkles, Search, MessageSquare, Zap, ClipboardCheck, FileSearch, Clock, Globe, Brain } from 'lucide-react';
import { PSCPackagePanel } from '@/components/psc/PSCPackagePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const ComplianceSGIAutoEvidence = lazy(() => import('@/components/compliance/ai/ComplianceSGIAutoEvidence').then(m => ({ default: m.ComplianceSGIAutoEvidence })));
const ComplianceGapAnalyzer = lazy(() => import('@/components/compliance/ai/ComplianceGapAnalyzer').then(m => ({ default: m.ComplianceGapAnalyzer })));
const ComplianceInterviewSimulator = lazy(() => import('@/components/compliance/ai/ComplianceInterviewSimulator').then(m => ({ default: m.ComplianceInterviewSimulator })));
const ComplianceOneClickAuditPrep = lazy(() => import('@/components/compliance/ai/ComplianceOneClickAuditPrep').then(m => ({ default: m.ComplianceOneClickAuditPrep })));
const ComplianceAutoChecklistGenerator = lazy(() => import('@/components/compliance/ai/ComplianceAutoChecklistGenerator').then(m => ({ default: m.ComplianceAutoChecklistGenerator })));
const ComplianceTimeline = lazy(() => import('@/components/compliance/ai/ComplianceTimeline').then(m => ({ default: m.ComplianceTimeline })));
const ComplianceRegulatoryChangeTracker = lazy(() => import('@/components/compliance/ai/ComplianceRegulatoryChangeTracker').then(m => ({ default: m.ComplianceRegulatoryChangeTracker })));

const LoadingFallback = () => <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64" /></div>;

const PSC_ITEMS = [
  { id: "PSC-01", name: "Certificates & Documentation", description: "SOLAS, MARPOL, MLC certificates validity" },
  { id: "PSC-02", name: "Structural Condition", description: "Hull, deck, superstructure integrity" },
  { id: "PSC-03", name: "Life-Saving Appliances", description: "Lifeboats, liferafts, lifejackets, EPIRBs" },
  { id: "PSC-04", name: "Fire Safety", description: "Fire detection, extinguishing systems, drills" },
  { id: "PSC-05", name: "MARPOL Compliance", description: "Oil record book, garbage management, IOPP" },
  { id: "PSC-06", name: "Working & Living Conditions", description: "MLC 2006 requirements, accommodation, food" },
  { id: "PSC-07", name: "Navigation Safety", description: "ECDIS, radar, AIS, charts, passage planning" },
  { id: "PSC-08", name: "ISM Code Compliance", description: "SMS documentation, DPA designation, drills" },
  { id: "PSC-09", name: "ISPS Code Compliance", description: "SSP, ISSC, security drills, access control" },
];

const PSCPackagePage: FC = () => {
  const [activeTab, setActiveTab] = useState('psc-panel');

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="PSC Readiness Package"
        description="Port State Control - Preparação e rastreamento de deficiências"
        gradient="orange"
        badges={[
          { icon: Package, label: 'Pacotes ZIP/PDF' },
          { icon: AlertTriangle, label: 'Deficiências' },
          { icon: Brain, label: 'IA Integrada' },
        ]}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="psc-panel">PSC Package</TabsTrigger>
          <TabsTrigger value="sgi-evidence" className="gap-1"><Sparkles className="h-3 w-3" />SGI Evidence</TabsTrigger>
          <TabsTrigger value="gap-analyzer" className="gap-1"><Search className="h-3 w-3" />Gap Analyzer</TabsTrigger>
          <TabsTrigger value="interview-sim" className="gap-1"><MessageSquare className="h-3 w-3" />Simulador</TabsTrigger>
          <TabsTrigger value="audit-prep" className="gap-1"><Zap className="h-3 w-3" />Audit Prep</TabsTrigger>
          <TabsTrigger value="checklist-gen" className="gap-1"><ClipboardCheck className="h-3 w-3" />Checklist IA</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1"><Clock className="h-3 w-3" />Timeline</TabsTrigger>
          <TabsTrigger value="reg-tracker" className="gap-1"><Globe className="h-3 w-3" />Regulatório</TabsTrigger>
        </TabsList>

        <TabsContent value="psc-panel"><PSCPackagePanel /></TabsContent>

        <Suspense fallback={<LoadingFallback />}>
          <TabsContent value="sgi-evidence"><ComplianceSGIAutoEvidence moduleId="psc" moduleName="PSC Readiness" checklistItems={PSC_ITEMS} /></TabsContent>
          <TabsContent value="gap-analyzer"><ComplianceGapAnalyzer moduleId="psc" moduleName="PSC Readiness" standards={["Paris MoU", "Tokyo MoU", "USCG", "AMSA", "Indian Ocean MoU"]} /></TabsContent>
          <TabsContent value="interview-sim"><ComplianceInterviewSimulator moduleId="psc" moduleName="PSC Readiness" standardContext="Port State Control inspection simulation. Covers SOLAS, MARPOL, MLC, ISM, ISPS compliance checks. Focus on certificate validity, crew competence, equipment readiness, and operational deficiencies commonly found by PSC inspectors." /></TabsContent>
          <TabsContent value="audit-prep"><ComplianceOneClickAuditPrep moduleId="psc" moduleName="PSC Readiness" /></TabsContent>
          <TabsContent value="checklist-gen"><ComplianceAutoChecklistGenerator moduleId="psc" moduleName="PSC Readiness" /></TabsContent>
          <TabsContent value="timeline"><ComplianceTimeline moduleId="psc" moduleName="PSC Readiness" /></TabsContent>
          <TabsContent value="reg-tracker"><ComplianceRegulatoryChangeTracker moduleId="psc" moduleName="PSC Readiness" /></TabsContent>
        </Suspense>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default PSCPackagePage;
