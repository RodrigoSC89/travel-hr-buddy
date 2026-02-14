import type { FC } from 'react';
import { useState, Suspense, lazy } from 'react';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Ship, FileCheck, Brain, ClipboardCheck, Sparkles, Search, MessageSquare, Zap, Globe, Clock, FileSearch } from 'lucide-react';
import { OVIDInspectionDashboard } from '@/components/ovid/OVIDInspectionDashboard';
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

const OVID_ITEMS = [
  { id: "OVID-1", name: "Management, Accountability & Recruitment", description: "OVIQ4 Chapter 1 - Company policies and management systems" },
  { id: "OVID-2", name: "Navigational Safety", description: "OVIQ4 Chapter 2 - Bridge equipment and procedures" },
  { id: "OVID-3", name: "DP Operations", description: "OVIQ4 Chapter 3 - Dynamic positioning systems" },
  { id: "OVID-4", name: "Cargo and Deck Operations", description: "OVIQ4 Chapter 4 - Crane, lifting, deck operations" },
  { id: "OVID-5", name: "Safety Management", description: "OVIQ4 Chapter 5 - ISM, ISPS, drills, PPE" },
  { id: "OVID-6", name: "Engine Room", description: "OVIQ4 Chapter 6 - Machinery, maintenance, fuel" },
  { id: "OVID-7", name: "Accommodation & Galley", description: "OVIQ4 Chapter 7 - MLC compliance" },
];

const PreOVIDInspection: FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="Pre-OVID Inspection"
        description="OCIMF Offshore Vessel Inspection Database - OVIQ4 (7300)"
        gradient="blue"
        badges={[
          { icon: ClipboardCheck, label: 'OVIQ4' },
          { icon: FileCheck, label: 'OCIMF' },
          { icon: Brain, label: 'IA Integrada' },
        ]}
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="dashboard">OVID Dashboard</TabsTrigger>
          <TabsTrigger value="sgi-evidence" className="gap-1"><Sparkles className="h-3 w-3" />SGI Evidence</TabsTrigger>
          <TabsTrigger value="gap-analyzer" className="gap-1"><Search className="h-3 w-3" />Gap Analyzer</TabsTrigger>
          <TabsTrigger value="interview-sim" className="gap-1"><MessageSquare className="h-3 w-3" />Simulador</TabsTrigger>
          <TabsTrigger value="audit-prep" className="gap-1"><Zap className="h-3 w-3" />Audit Prep</TabsTrigger>
          <TabsTrigger value="checklist-gen" className="gap-1"><ClipboardCheck className="h-3 w-3" />Checklist IA</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1"><Clock className="h-3 w-3" />Timeline</TabsTrigger>
          <TabsTrigger value="reg-tracker" className="gap-1"><Globe className="h-3 w-3" />Regulatório</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><OVIDInspectionDashboard /></TabsContent>

        <Suspense fallback={<LoadingFallback />}>
          <TabsContent value="sgi-evidence"><ComplianceSGIAutoEvidence moduleId="pre-ovid" moduleName="Pre-OVID/OVIQ4" checklistItems={OVID_ITEMS} /></TabsContent>
          <TabsContent value="gap-analyzer"><ComplianceGapAnalyzer moduleId="pre-ovid" moduleName="Pre-OVID/OVIQ4" standards={["OVIQ4", "OCIMF Guidelines", "ISM Code", "ISPS Code", "IMCA M149"]} /></TabsContent>
          <TabsContent value="interview-sim"><ComplianceInterviewSimulator moduleId="pre-ovid" moduleName="Pre-OVID/OVIQ4" standardContext="OVID/OVIQ4 inspection by OCIMF-accredited inspector for offshore vessels. Covers 7 chapters: Management, Navigation, DP Operations, Cargo/Deck, Safety, Engine Room, Accommodation. Focus on operational competence and SMS effectiveness." /></TabsContent>
          <TabsContent value="audit-prep"><ComplianceOneClickAuditPrep moduleId="pre-ovid" moduleName="Pre-OVID/OVIQ4" /></TabsContent>
          <TabsContent value="checklist-gen"><ComplianceAutoChecklistGenerator moduleId="pre-ovid" moduleName="Pre-OVID/OVIQ4" /></TabsContent>
          <TabsContent value="timeline"><ComplianceTimeline moduleId="pre-ovid" moduleName="Pre-OVID/OVIQ4" /></TabsContent>
          <TabsContent value="reg-tracker"><ComplianceRegulatoryChangeTracker moduleId="pre-ovid" moduleName="Pre-OVID/OVIQ4" /></TabsContent>
        </Suspense>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default PreOVIDInspection;
