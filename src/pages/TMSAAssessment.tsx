/**
 * TMSA Assessment Page
 * OCIMF Tanker Management Self Assessment v3
 * With full AI Disruptive Suite (8 components)
 */
import type { FC } from 'react';
import { useState, lazy, Suspense } from 'react';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Ship, FileCheck, Brain, ClipboardCheck, AlertTriangle, CheckCircle2, TrendingUp, BarChart3, Target, Shield, Layers, Plus, RefreshCw, Download, Search, BookOpen, GitCompare, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMaritimeAudits, useCreateMaritimeAudit, useMaritimeAuditExport } from '@/hooks/useMaritimeAuditsCRUD';
import { DataStateWrapper } from '@/components/ui/UXStates';
import { toast } from 'sonner';

const ComplianceSGIAutoEvidence = lazy(() => import('@/components/compliance/ai/ComplianceSGIAutoEvidence').then(m => ({ default: m.ComplianceSGIAutoEvidence })));
const ComplianceGapAnalyzer = lazy(() => import('@/components/compliance/ai/ComplianceGapAnalyzer').then(m => ({ default: m.ComplianceGapAnalyzer })));
const ComplianceInterviewSimulator = lazy(() => import('@/components/compliance/ai/ComplianceInterviewSimulator').then(m => ({ default: m.ComplianceInterviewSimulator })));
const ComplianceOneClickAuditPrep = lazy(() => import('@/components/compliance/ai/ComplianceOneClickAuditPrep').then(m => ({ default: m.ComplianceOneClickAuditPrep })));
const ComplianceRegulatoryChangeTracker = lazy(() => import('@/components/compliance/ai/ComplianceRegulatoryChangeTracker').then(m => ({ default: m.ComplianceRegulatoryChangeTracker })));
const ComplianceAutoChecklistGenerator = lazy(() => import('@/components/compliance/ai/ComplianceAutoChecklistGenerator').then(m => ({ default: m.ComplianceAutoChecklistGenerator })));
const ComplianceDocCrossReference = lazy(() => import('@/components/compliance/ai/ComplianceDocCrossReference').then(m => ({ default: m.ComplianceDocCrossReference })));
const ComplianceTimeline = lazy(() => import('@/components/compliance/ai/ComplianceTimeline').then(m => ({ default: m.ComplianceTimeline })));
const ComplianceScoreBenchmark = lazy(() => import('@/components/compliance/ai/ComplianceScoreBenchmark').then(m => ({ default: m.ComplianceScoreBenchmark })));
const ComplianceAutoNCResolver = lazy(() => import('@/components/compliance/ai/ComplianceAutoNCResolver').then(m => ({ default: m.ComplianceAutoNCResolver })));
const CompliancePhotoEvidenceAI = lazy(() => import('@/components/compliance/ai/CompliancePhotoEvidenceAI').then(m => ({ default: m.CompliancePhotoEvidenceAI })));
const CompliancePSCRiskPredictor = lazy(() => import('@/components/compliance/ai/CompliancePSCRiskPredictor').then(m => ({ default: m.CompliancePSCRiskPredictor })));

const AILoader = () => <div className="flex items-center justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

const TMSA_CHECKLIST_ITEMS = [
  "Management leadership & accountability evidence",
  "Shore-based personnel recruitment records",
  "Vessel personnel competency management",
  "Reliability & maintenance standards documentation",
  "Navigational safety procedures",
  "Cargo, ballast & mooring operation records",
  "Management of change procedures",
  "Incident investigation & analysis reports",
  "Safety management system documentation",
  "Environmental management compliance",
  "Emergency preparedness & contingency plans",
  "Measurement, analysis & improvement records",
  "Maritime security procedures",
];

const TMSAAssessment: FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { data: tmsaAudits, isLoading, error, refetch } = useMaritimeAudits('tmsa');
  const { exportAudits, isExporting } = useMaritimeAuditExport('tmsa');
  const createAudit = useCreateMaritimeAudit();

  const baseElements = [
    { id: '1', name: 'Management, Leadership & Accountability', kpis: 23 },
    { id: '2', name: 'Recruitment & Management of Shore-Based Personnel', kpis: 18 },
    { id: '3', name: 'Recruitment & Management of Vessel Personnel', kpis: 21 },
    { id: '4', name: 'Reliability & Maintenance Standards', kpis: 28 },
    { id: '5', name: 'Navigational Safety', kpis: 32 },
    { id: '6', name: 'Cargo, Ballast & Mooring Operations', kpis: 35 },
    { id: '7', name: 'Management of Change', kpis: 15 },
    { id: '8', name: 'Incident Investigation & Analysis', kpis: 22 },
    { id: '9', name: 'Safety Management', kpis: 29 },
    { id: '10', name: 'Environmental Management', kpis: 26 },
    { id: '11', name: 'Emergency Preparedness & Contingency Planning', kpis: 24 },
    { id: '12', name: 'Measurement, Analysis & Improvement', kpis: 19 },
    { id: '13', name: 'Maritime Security', kpis: 17 },
  ];
  
  const latestAudit = tmsaAudits?.[0];
  const tmsaElements = baseElements.map((el, idx) => ({
    ...el,
    level: latestAudit?.metadata?.elements?.[idx]?.level || (idx % 2 === 0 ? 4 : 3),
    maxLevel: 4,
  }));

  const levelDescriptions = {
    1: 'No evidence of implementation',
    2: 'Documented procedures exist',
    3: 'Procedures implemented and effective',
    4: 'Continuous improvement demonstrated',
  };

  const overallLevel = Math.round(tmsaElements.reduce((acc, el) => acc + el.level, 0) / tmsaElements.length * 10) / 10;
  const totalKPIs = tmsaElements.reduce((acc, el) => acc + el.kpis, 0);
  const level4Count = tmsaElements.filter(el => el.level === 4).length;
  
  const handleNewAssessment = () => {
    createAudit.mutate({ audit_type: 'tmsa', status: 'draft', auditor_name: 'TMSA Assessor' });
  };
  const handleRefresh = () => { refetch(); toast.success('Dados atualizados'); };
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => { if (tmsaAudits) exportAudits(tmsaAudits, format); };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="TMSA Assessment"
        description="OCIMF Tanker Management Self Assessment v3 - 13 Elements"
        gradient="blue"
        badges={[
          { icon: ClipboardCheck, label: 'TMSA 3' },
          { icon: FileCheck, label: 'OCIMF' },
          { icon: Brain, label: 'AI Suite' },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="elements">13 Elements</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
          <TabsTrigger value="sgi-evidence" className="gap-1"><Search className="h-3 w-3" />SGI Evidence</TabsTrigger>
          <TabsTrigger value="gap-analyzer" className="gap-1"><AlertTriangle className="h-3 w-3" />Gap Analyzer</TabsTrigger>
          <TabsTrigger value="interview-sim" className="gap-1"><Brain className="h-3 w-3" />Interview Sim</TabsTrigger>
          <TabsTrigger value="audit-prep" className="gap-1"><ClipboardCheck className="h-3 w-3" />Audit Prep</TabsTrigger>
          <TabsTrigger value="reg-tracker" className="gap-1"><BookOpen className="h-3 w-3" />Reg. Tracker</TabsTrigger>
          <TabsTrigger value="checklist-gen" className="gap-1"><CheckCircle2 className="h-3 w-3" />Checklist Gen</TabsTrigger>
          <TabsTrigger value="doc-crossref" className="gap-1"><GitCompare className="h-3 w-3" />Doc Cross-Ref</TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1"><Calendar className="h-3 w-3" />Timeline</TabsTrigger>
          <TabsTrigger value="score-benchmark" className="gap-1"><BarChart3 className="h-3 w-3" />Benchmarking</TabsTrigger>
          <TabsTrigger value="nc-resolver" className="gap-1"><AlertTriangle className="h-3 w-3" />NC Resolver</TabsTrigger>
          <TabsTrigger value="photo-ai" className="gap-1"><Search className="h-3 w-3" />Foto IA</TabsTrigger>
          <TabsTrigger value="psc-risk" className="gap-1"><Shield className="h-3 w-3" />Risco PSC</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Level</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{overallLevel}</div>
                <p className="text-xs text-muted-foreground">of 4.0 maximum</p>
                <Progress value={overallLevel / 4 * 100} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Elements at Level 4</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{level4Count} / 13</div>
                <p className="text-xs text-muted-foreground">Best practice achieved</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalKPIs}</div>
                <p className="text-xs text-muted-foreground">Across all elements</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Improvement Areas</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{13 - level4Count}</div>
                <p className="text-xs text-muted-foreground">Elements below Level 4</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />TMSA 3 Elements Overview</CardTitle>
              <CardDescription>Current maturity level for each of the 13 TMSA elements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tmsaElements.map((element) => (
                  <div key={element.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium"><span className="text-muted-foreground mr-2">{element.id}.</span>{element.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{element.kpis} KPIs</span>
                        <Badge variant={element.level === 4 ? 'default' : element.level >= 3 ? 'secondary' : 'destructive'}>Level {element.level}</Badge>
                      </div>
                    </div>
                    <Progress value={element.level / 4 * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="elements" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tmsaElements.map((element) => (
              <Card key={element.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-lg font-bold">{element.id}</Badge>
                    <CardTitle className="text-base">{element.name}</CardTitle>
                  </div>
                  <CardDescription>{element.kpis} KPIs to assess</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Level</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div key={level} className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${level <= element.level ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{level}</div>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{levelDescriptions[element.level as keyof typeof levelDescriptions]}</p>
                    <Button variant="outline" size="sm" className="w-full">View KPIs</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>All {totalKPIs} KPIs across 13 TMSA elements</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRefresh} disabled={isLoading}><RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Atualizar</Button>
                <Button variant="outline" onClick={() => handleExport('excel')} disabled={isExporting}><Download className="h-4 w-4 mr-2" />Exportar</Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataStateWrapper data={tmsaAudits} isLoading={isLoading} error={error as Error} onRetry={refetch} emptyTitle="Nenhuma avaliação TMSA encontrada" emptyMessage="Clique em 'Start Full Assessment' para iniciar." emptyAction={{ label: 'Nova Avaliação', onClick: handleNewAssessment }}>
                {() => (
                  <div className="text-center py-8 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an element to view its specific KPIs</p>
                    <Button className="mt-4" onClick={handleNewAssessment} disabled={createAudit.isPending}><ClipboardCheck className="h-4 w-4 mr-2" />Start Full Assessment</Button>
                  </div>
                )}
              </DataStateWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI-Powered Benchmarking</CardTitle>
              <CardDescription>Compare your TMSA scores with industry standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-teal-50 dark:bg-teal-950 rounded-lg border border-teal-200 dark:border-teal-800">
                <h4 className="font-medium flex items-center gap-2 text-teal-900 dark:text-teal-100"><Shield className="h-4 w-4" />Improvement Recommendations</h4>
                <ul className="mt-2 space-y-2 text-sm text-teal-800 dark:text-teal-200">
                  <li>• Element 4 (Reliability & Maintenance) - Implement predictive maintenance program</li>
                  <li>• Element 7 (Management of Change) - Strengthen MOC documentation</li>
                  <li>• Element 9 (Safety Management) - Enhance near-miss reporting culture</li>
                  <li>• Element 12 (Measurement & Improvement) - Deploy analytics dashboard</li>
                </ul>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">{overallLevel}</div>
                  <p className="text-sm text-muted-foreground">Your Average Level</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">3.4</div>
                  <p className="text-sm text-muted-foreground">Industry Average</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-600">Top 15%</div>
                  <p className="text-sm text-muted-foreground">Your Ranking</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Disruptive Suite */}
        <TabsContent value="sgi-evidence">
          <Suspense fallback={<AILoader />}><ComplianceSGIAutoEvidence moduleId="tmsa" moduleName="TMSA 3" /></Suspense>
        </TabsContent>
        <TabsContent value="gap-analyzer">
          <Suspense fallback={<AILoader />}><ComplianceGapAnalyzer moduleId="tmsa" moduleName="TMSA 3" standards={["TMSA 3", "OCIMF SIRE 2.0", "ISM Code", "MARPOL"]} /></Suspense>
        </TabsContent>
        <TabsContent value="interview-sim">
          <Suspense fallback={<AILoader />}><ComplianceInterviewSimulator moduleId="tmsa" moduleName="TMSA 3" standardContext="TMSA 3 assessment covering 13 elements: Management Leadership, Personnel, Maintenance, Navigation, Cargo, MOC, Incidents, Safety, Environment, Emergency, Measurement, and Maritime Security" /></Suspense>
        </TabsContent>
        <TabsContent value="audit-prep">
          <Suspense fallback={<AILoader />}><ComplianceOneClickAuditPrep moduleId="tmsa" moduleName="TMSA 3" /></Suspense>
        </TabsContent>
        <TabsContent value="reg-tracker">
          <Suspense fallback={<AILoader />}><ComplianceRegulatoryChangeTracker moduleId="tmsa" moduleName="TMSA 3" /></Suspense>
        </TabsContent>
        <TabsContent value="checklist-gen">
          <Suspense fallback={<AILoader />}><ComplianceAutoChecklistGenerator moduleId="tmsa" moduleName="TMSA 3" /></Suspense>
        </TabsContent>
        <TabsContent value="doc-crossref">
          <Suspense fallback={<AILoader />}><ComplianceDocCrossReference moduleId="tmsa" moduleName="TMSA 3" /></Suspense>
        </TabsContent>
        <TabsContent value="timeline">
          <Suspense fallback={<AILoader />}><ComplianceTimeline moduleId="tmsa" moduleName="TMSA 3" /></Suspense>
        </TabsContent>
        <TabsContent value="score-benchmark">
          <Suspense fallback={<AILoader />}><ComplianceScoreBenchmark moduleId="tmsa" moduleName="TMSA 3" /></Suspense>
        </TabsContent>
        <TabsContent value="nc-resolver">
          <Suspense fallback={<AILoader />}><ComplianceAutoNCResolver moduleId="tmsa" moduleName="TMSA 3" /></Suspense>
        </TabsContent>
        <TabsContent value="photo-ai">
          <Suspense fallback={<AILoader />}><CompliancePhotoEvidenceAI moduleId="tmsa" moduleName="TMSA 3" /></Suspense>
        </TabsContent>
        <TabsContent value="psc-risk">
          <Suspense fallback={<AILoader />}><CompliancePSCRiskPredictor moduleId="tmsa" moduleName="TMSA 3" /></Suspense>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default TMSAAssessment;
