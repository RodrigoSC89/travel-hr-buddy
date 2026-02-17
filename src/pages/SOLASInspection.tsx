/**
 * SOLAS/LSA/FFE Inspection Page - Optimized with Framer Motion + React.memo
 */
import type { FC } from 'react';
import { useState, Suspense, lazy, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Ship, FileCheck, Brain, AlertTriangle, CheckCircle2, Flame, LifeBuoy, ShieldCheck, Clock, Calendar, BarChart3, Sparkles, Search, MessageSquare, Zap, Globe, ClipboardCheck, FileSearch } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, kpiCard, fadeUp } from '@/lib/animations/motion-variants';

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

const SOLAS_CHECKLIST_ITEMS = [
  { id: "LSA-1", name: "Life-Saving Appliances (LSA)", description: "SOLAS Ch.III - Lifeboats, liferafts, lifejackets, immersion suits" },
  { id: "FFE-1", name: "Fire-Fighting Equipment (FFE)", description: "SOLAS Ch.II-2 - Extinguishers, fire mains, detection systems" },
  { id: "NAV-1", name: "Navigation Equipment", description: "SOLAS Ch.V - ECDIS, radar, AIS, compass, echo sounder" },
  { id: "GMDSS-1", name: "Radio Equipment (GMDSS)", description: "SOLAS Ch.IV - VHF, MF/HF, EPIRB, SART, Navtex" },
  { id: "STRUCT-1", name: "Structural Fire Protection", description: "SOLAS Ch.II-2 - Fire divisions, insulation, means of escape" },
  { id: "DRILL-1", name: "Safety Drills & Musters", description: "SOLAS Ch.III Reg.19 - Abandon ship, fire, man overboard drills" },
];

const CategoryCard = memo(({ category }: { category: { id: string; name: string; icon: React.ElementType; items: number; compliant: number; expiring: number } }) => {
  const CategoryIcon = category.icon;
  const rate = Math.round((category.compliant / category.items) * 100);
  return (
    <motion.div variants={kpiCard}>
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><CategoryIcon className="h-5 w-5" />{category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Compliance</span><span className="font-medium">{rate}%</span></div>
            <Progress value={rate} />
            <div className="flex justify-between text-xs text-muted-foreground pt-2">
              <span>{category.compliant}/{category.items} items</span>
              {category.expiring > 0 && <Badge variant="outline" className="text-warning">{category.expiring} expiring</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
CategoryCard.displayName = 'CategoryCard';

const SOLASInspection: FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const solasCategories = useMemo(() => [
    { id: 'lsa', name: 'Life-Saving Appliances', icon: LifeBuoy, items: 45, compliant: 43, expiring: 2 },
    { id: 'ffe', name: 'Fire-Fighting Equipment', icon: Flame, items: 67, compliant: 65, expiring: 4 },
    { id: 'nav', name: 'Navigation Equipment', icon: Ship, items: 32, compliant: 32, expiring: 0 },
    { id: 'radio', name: 'Radio Equipment (GMDSS)', icon: ShieldCheck, items: 18, compliant: 17, expiring: 1 },
  ], []);

  const upcomingDrills = useMemo(() => [
    { type: 'Abandon Ship Drill', vessel: 'MV Atlantic Pioneer', date: '2026-02-10', status: 'scheduled' },
    { type: 'Fire Drill', vessel: 'MT Pacific Spirit', date: '2026-02-12', status: 'scheduled' },
    { type: 'Man Overboard Drill', vessel: 'MV Ocean Voyager', date: '2026-02-15', status: 'pending' },
  ], []);

  const { totalItems, totalCompliant, totalExpiring, complianceRate } = useMemo(() => {
    const items = solasCategories.reduce((acc, cat) => acc + cat.items, 0);
    const compliant = solasCategories.reduce((acc, cat) => acc + cat.compliant, 0);
    const expiring = solasCategories.reduce((acc, cat) => acc + cat.expiring, 0);
    return { totalItems: items, totalCompliant: compliant, totalExpiring: expiring, complianceRate: Math.round((compliant / items) * 100) };
  }, [solasCategories]);

  return (
    <ModulePageWrapper gradient="orange">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <motion.div variants={fadeUp}>
          <ModuleHeader icon={Ship} title="SOLAS/LSA/FFE Compliance" description="Safety of Life at Sea - Life-Saving Appliances & Fire-Fighting Equipment" gradient="red"
            badges={[{ icon: LifeBuoy, label: 'LSA' }, { icon: Flame, label: 'FFE' }, { icon: Brain, label: 'AI Monitoring' }]} />
        </motion.div>

        <motion.div variants={fadeUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="drills">Drills</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              <TabsTrigger value="sgi-evidence" className="gap-1"><Sparkles className="h-3 w-3" />SGI Evidence</TabsTrigger>
              <TabsTrigger value="gap-analyzer" className="gap-1"><Search className="h-3 w-3" />Gap Analyzer</TabsTrigger>
              <TabsTrigger value="interview-sim" className="gap-1"><MessageSquare className="h-3 w-3" />Simulador</TabsTrigger>
              <TabsTrigger value="audit-prep" className="gap-1"><Zap className="h-3 w-3" />Audit Prep</TabsTrigger>
              <TabsTrigger value="checklist-gen" className="gap-1"><ClipboardCheck className="h-3 w-3" />Checklist IA</TabsTrigger>
              <TabsTrigger value="doc-crossref" className="gap-1"><FileSearch className="h-3 w-3" />Cross-Ref</TabsTrigger>
              <TabsTrigger value="timeline" className="gap-1"><Clock className="h-3 w-3" />Timeline</TabsTrigger>
              <TabsTrigger value="score-benchmark" className="gap-1"><BarChart3 className="h-3 w-3" />Benchmarking</TabsTrigger>
              <TabsTrigger value="nc-resolver" className="gap-1"><AlertTriangle className="h-3 w-3" />NC Resolver</TabsTrigger>
              <TabsTrigger value="photo-ai" className="gap-1"><Flame className="h-3 w-3" />Foto IA</TabsTrigger>
              <TabsTrigger value="psc-risk" className="gap-1"><ShieldCheck className="h-3 w-3" />Risco PSC</TabsTrigger>
              <TabsTrigger value="reg-tracker" className="gap-1"><Globe className="h-3 w-3" />Regulatório</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-4">
                {[
                  { title: "Compliance Rate", icon: CheckCircle2, iconColor: "text-success", value: `${complianceRate}%`, valueColor: "text-success", sub: null, showProgress: true, progressValue: complianceRate },
                  { title: "Total Equipment", icon: Ship, iconColor: "text-muted-foreground", value: totalItems, sub: `${totalCompliant} compliant` },
                  { title: "Expiring Soon", icon: AlertTriangle, iconColor: "text-warning", value: totalExpiring, valueColor: "text-warning", sub: "Within 30 days" },
                  { title: "Upcoming Drills", icon: Calendar, iconColor: "text-primary", value: upcomingDrills.length, sub: "This month" },
                ].map((kpi) => (
                  <motion.div key={kpi.title} variants={kpiCard}>
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${kpi.valueColor || ''}`}>{kpi.value}</div>
                        {kpi.showProgress && <Progress value={kpi.progressValue} className="mt-2" />}
                        {kpi.sub && <p className="text-xs text-muted-foreground">{kpi.sub}</p>}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {solasCategories.map((category) => <CategoryCard key={category.id} category={category} />)}
              </motion.div>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-6">
              <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Equipment Inventory</CardTitle><CardDescription>SOLAS-regulated safety equipment across fleet</CardDescription></div><Button><FileCheck className="h-4 w-4 mr-2" />Add Equipment</Button></CardHeader><CardContent><div className="text-center py-8 text-muted-foreground"><Ship className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Select a category above to view equipment details</p></div></CardContent></Card>
            </TabsContent>

            <TabsContent value="drills" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Safety Drills</CardTitle><CardDescription>SOLAS-mandated drills and exercises</CardDescription></div><Button><Calendar className="h-4 w-4 mr-2" />Schedule Drill</Button></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingDrills.map((drill) => (
                      <motion.div key={drill.type} variants={fadeUp} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded ${drill.type.includes('Fire') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            {drill.type.includes('Fire') ? <Flame className="h-5 w-5" /> : <LifeBuoy className="h-5 w-5" />}
                          </div>
                          <div><p className="font-medium">{drill.type}</p><p className="text-sm text-muted-foreground">{drill.vessel}</p></div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right"><p className="text-sm font-medium">{drill.date}</p><Badge variant={drill.status === 'scheduled' ? 'default' : 'outline'}>{drill.status}</Badge></div>
                          <Button variant="ghost" size="sm">Details</Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certificates" className="space-y-6">
              <Card><CardHeader><CardTitle>SOLAS Certificates</CardTitle><CardDescription>Safety Equipment Certificates and Service Records</CardDescription></CardHeader><CardContent><div className="text-center py-8 text-muted-foreground"><FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Certificate management for SOLAS equipment</p><Button className="mt-4" variant="outline">View All Certificates</Button></div></CardContent></Card>
            </TabsContent>

            <Suspense fallback={<LoadingFallback />}>
              <TabsContent value="sgi-evidence"><ComplianceSGIAutoEvidence moduleId="solas" moduleName="SOLAS/LSA/FFE" checklistItems={SOLAS_CHECKLIST_ITEMS} /></TabsContent>
              <TabsContent value="gap-analyzer"><ComplianceGapAnalyzer moduleId="solas" moduleName="SOLAS/LSA/FFE" standards={["SOLAS Ch.II-2", "SOLAS Ch.III", "SOLAS Ch.IV", "SOLAS Ch.V", "FSS Code", "LSA Code"]} /></TabsContent>
              <TabsContent value="interview-sim"><ComplianceInterviewSimulator moduleId="solas" moduleName="SOLAS/LSA/FFE" standardContext="SOLAS inspection covering Life-Saving Appliances (Ch.III), Fire Safety (Ch.II-2), Navigation (Ch.V), and Radio/GMDSS (Ch.IV)." /></TabsContent>
              <TabsContent value="audit-prep"><ComplianceOneClickAuditPrep moduleId="solas" moduleName="SOLAS/LSA/FFE" /></TabsContent>
              <TabsContent value="checklist-gen"><ComplianceAutoChecklistGenerator moduleId="solas" moduleName="SOLAS/LSA/FFE" /></TabsContent>
              <TabsContent value="doc-crossref"><ComplianceDocCrossReference moduleId="solas" moduleName="SOLAS/LSA/FFE" /></TabsContent>
              <TabsContent value="timeline"><ComplianceTimeline moduleId="solas" moduleName="SOLAS/LSA/FFE" /></TabsContent>
              <TabsContent value="reg-tracker"><ComplianceRegulatoryChangeTracker moduleId="solas" moduleName="SOLAS/LSA/FFE" /></TabsContent>
              <TabsContent value="score-benchmark"><ComplianceScoreBenchmark moduleId="solas" moduleName="SOLAS/LSA/FFE" /></TabsContent>
              <TabsContent value="nc-resolver"><ComplianceAutoNCResolver moduleId="solas" moduleName="SOLAS/LSA/FFE" /></TabsContent>
              <TabsContent value="photo-ai"><CompliancePhotoEvidenceAI moduleId="solas" moduleName="SOLAS/LSA/FFE" /></TabsContent>
              <TabsContent value="psc-risk"><CompliancePSCRiskPredictor moduleId="solas" moduleName="SOLAS/LSA/FFE" /></TabsContent>
            </Suspense>
          </Tabs>
        </motion.div>
      </motion.div>
    </ModulePageWrapper>
  );
};

export default SOLASInspection;
