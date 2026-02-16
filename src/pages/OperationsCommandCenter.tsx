/**
 * Operations Command Center - Premium Deep Ocean Edition
 * Refactored: orchestrator pattern with sub-components
 */
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import {
  Ship, Users, Activity, Brain, Settings, RefreshCw, Download, FileText,
  Lightbulb, ShieldCheck, Loader2, DollarSign, TrendingUp, CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getJsPDF } from '@/lib/pdf/lazy-pdf';
import { logger } from '@/lib/logger';
import type { OperationsData, Insight, OperationsSettings, VesselRecord, CrewRecord } from "./operations/types";
import { sampleInsights, stagger } from "./operations/types";
import { OverviewTab, OperationsTab, InsightsTab, TrendsTab, PredictionsTab, AITab, InsightDialogs } from "./operations/OperationsTabs";

export default function OperationsCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>(sampleInsights);
  const { toast } = useToast();

  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [isAnalyzeDialogOpen, setIsAnalyzeDialogOpen] = useState(false);
  const [isImplementDialogOpen, setIsImplementDialogOpen] = useState(false);
  const [analysisNotes, setAnalysisNotes] = useState("");
  const [implementationPlan, setImplementationPlan] = useState("");
  const [isProcessingInsight, setIsProcessingInsight] = useState(false);

  const [data, setData] = useState<OperationsData>({
    activeVessels: 0, totalVessels: 0, crewMembers: 0, activeCrew: 0,
    completedVoyages: 0, activeAlerts: 0, fleetEfficiency: 0,
    vesselsInOperation: 0, vesselsAtPort: 0, vesselsInMaintenance: 0,
    fuelConsumption: 0, maintenancePending: 0, complianceRate: 95,
  });

  const [settings, setSettings] = useState<OperationsSettings>(() => {
    const saved = localStorage.getItem("operations-command-settings");
    return saved ? JSON.parse(saved) : { autoRefresh: true, refreshInterval: 60, showNotifications: true, compactMode: false };
  });

  const [performanceData] = useState([
    { day: "Seg", efficiency: 85, fuel: 120, voyages: 12 },
    { day: "Ter", efficiency: 88, fuel: 115, voyages: 14 },
    { day: "Qua", efficiency: 82, fuel: 125, voyages: 10 },
    { day: "Qui", efficiency: 91, fuel: 110, voyages: 16 },
    { day: "Sex", efficiency: 87, fuel: 118, voyages: 13 },
    { day: "Sáb", efficiency: 78, fuel: 130, voyages: 8 },
    { day: "Dom", efficiency: 72, fuel: 95, voyages: 6 },
  ]);

  const [vesselDistribution, setVesselDistribution] = useState([
    { name: "Em Operação", value: 12, color: "hsl(var(--chart-1))" },
    { name: "No Porto", value: 5, color: "hsl(var(--chart-2))" },
    { name: "Manutenção", value: 3, color: "hsl(var(--chart-3))" },
    { name: "Inativos", value: 2, color: "hsl(var(--chart-4))" },
  ]);

  const fetchOperationalData = useCallback(async (showToast = false) => {
    if (showToast) setIsRefreshing(true); else setIsLoading(true);
    try {
      const { data: vessels } = await supabase.from("vessels").select("id, name, status, vessel_type, fuel_capacity");
      const { data: crew } = await supabase.from("crew_members").select("id, full_name, status");
      const { count: maintenanceCount } = await supabase.from("operational_checklists").select("*", { count: "exact", head: true }).neq("status", "completed");
      const { data: alerts } = await supabase.from("price_alerts").select("id, is_active").eq("is_active", true);
      const vesselsList = ((vessels || []) as unknown as VesselRecord[]);
      const crewList = ((crew || []) as unknown as CrewRecord[]);
      const activeVessels = vesselsList.filter(v => v.status === "active" || v.status === "operational").length;
      const vesselsInOperation = vesselsList.filter(v => v.status === "operational").length;
      const vesselsAtPort = vesselsList.filter(v => ["at_port", "docked", "active", "in_port"].includes(v.status)).length;
      const vesselsInMaintenance = vesselsList.filter(v => v.status === "maintenance").length;
      const activeCrew = crewList.filter(c => c.status === "active" || c.status === "onboard").length;
      setData({
        activeVessels, totalVessels: vesselsList.length, crewMembers: crewList.length, activeCrew,
        completedVoyages: 12, activeAlerts: alerts?.length || 0,
        fleetEfficiency: activeVessels > 0 ? Math.round((activeVessels / (vesselsList.length || 1)) * 100 * 10) / 10 : 0,
        vesselsInOperation, vesselsAtPort, vesselsInMaintenance,
        fuelConsumption: 12500, maintenancePending: maintenanceCount || 0, complianceRate: 97,
      });
      setVesselDistribution([
        { name: "Em Operação", value: vesselsInOperation || 1, color: "hsl(var(--chart-1))" },
        { name: "No Porto", value: vesselsAtPort || 1, color: "hsl(var(--chart-2))" },
        { name: "Manutenção", value: vesselsInMaintenance || 1, color: "hsl(var(--chart-3))" },
        { name: "Inativos", value: Math.max(0, vesselsList.length - activeVessels) || 1, color: "hsl(var(--chart-4))" },
      ]);
      if (showToast) toast({ title: "Dados atualizados", description: "Dashboard atualizado com dados mais recentes." });
    } catch (err) { logger.error("Error fetching data:", err); }
    finally { setIsLoading(false); setIsRefreshing(false); }
  }, [toast]);

  useEffect(() => { fetchOperationalData(); }, [fetchOperationalData]);
  useEffect(() => { if (settings.autoRefresh) { const i = setInterval(() => fetchOperationalData(false), settings.refreshInterval * 1000); return () => clearInterval(i); } }, [settings.autoRefresh, settings.refreshInterval, fetchOperationalData]);
  useEffect(() => { localStorage.setItem("operations-command-settings", JSON.stringify(settings)); }, [settings]);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true); setAiInsight(null);
    try {
      const { data: response, error } = await supabase.functions.invoke("generate-ai-report", { body: { type: "operations-analysis", data, prompt: `Analise os dados operacionais da frota.` } });
      if (error) throw error;
      setAiInsight(response?.content || "Análise gerada com sucesso.");
    } catch { setAiInsight(`📊 **Análise Integrada - ${format(new Date(), "dd/MM/yyyy")}**\n\n🚢 ${data.activeVessels}/${data.totalVessels} embarcações ativas (${data.fleetEfficiency}%)\n👥 ${data.activeCrew}/${data.crewMembers} tripulantes ativos\n💡 ${insights.filter(i => i.type === "opportunity").length} oportunidades identificadas\n⚠️ ${data.activeAlerts} alertas ativos\n✅ Compliance: ${data.complianceRate}%`); }
    finally { setIsAnalyzing(false); }
  };

  const generatePDFReport = async () => {
    setIsGeneratingReport(true);
    try {
      const JsPDF = await getJsPDF(); const doc = new JsPDF(); const w = doc.internal.pageSize.getWidth();
      doc.setFillColor(10, 22, 40); doc.rect(0, 0, w, 40, "F");
      doc.setTextColor(0, 242, 255); doc.setFontSize(22); doc.text("Operations Command Center", 20, 25);
      doc.setFontSize(9); doc.setTextColor(180, 200, 220); doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 20, 34);
      doc.setTextColor(0, 0, 0); let y = 55;
      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("Indicadores Operacionais", 20, y); y += 10;
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      doc.text(`• Embarcações Ativas: ${data.activeVessels}/${data.totalVessels}`, 25, y); y += 7;
      doc.text(`• Eficiência: ${data.fleetEfficiency}%`, 25, y); y += 7;
      doc.text(`• Tripulação: ${data.activeCrew}/${data.crewMembers}`, 25, y); y += 7;
      doc.text(`• Compliance: ${data.complianceRate}%`, 25, y);
      doc.save(`ops-command-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "PDF Gerado", description: "Relatório baixado com sucesso." });
    } catch { toast({ title: "Erro", description: "Não foi possível gerar o PDF.", variant: "destructive" }); }
    finally { setIsGeneratingReport(false); }
  };

  const submitAnalysis = async () => {
    if (!selectedInsight) return; setIsProcessingInsight(true);
    try {
      await supabase.from("ai_audit_logs").insert({ user_input: JSON.stringify({ insightId: selectedInsight.id, type: "analysis", notes: analysisNotes }), ai_response: `Análise: ${selectedInsight.title}`, interaction_type: "insight_analysis", module_name: "operations_command" });
      setInsights(prev => prev.map(i => i.id === selectedInsight.id ? { ...i, status: "in_progress" } : i));
      toast({ title: "✅ Análise Registrada" }); setIsAnalyzeDialogOpen(false);
    } catch { toast({ title: "Erro", variant: "destructive" }); } finally { setIsProcessingInsight(false); }
  };

  const submitImplementation = async () => {
    if (!selectedInsight) return; setIsProcessingInsight(true);
    try {
      await supabase.from("ai_audit_logs").insert({ user_input: JSON.stringify({ insightId: selectedInsight.id, type: "implementation", plan: implementationPlan }), ai_response: `Implementação: ${selectedInsight.title}`, interaction_type: "insight_implementation", module_name: "operations_command" });
      setInsights(prev => prev.map(i => i.id === selectedInsight.id ? { ...i, status: "completed" } : i));
      toast({ title: "🚀 Implementação Registrada" }); setIsImplementDialogOpen(false);
    } catch { toast({ title: "Erro", variant: "destructive" }); } finally { setIsProcessingInsight(false); }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
          <div className="space-y-2"><div className="h-7 w-72 rounded-lg bg-muted animate-pulse" /><div className="h-4 w-48 rounded bg-muted animate-pulse" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (<div key={i} className="h-36 rounded-xl bg-card border border-border/30 animate-pulse" />))}
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: "Embarcações Ativas", value: data.activeVessels, suffix: `/${data.totalVessels}`, sub: `${data.fleetEfficiency}% eficiência`, icon: Ship, glow: "cyan" as const, gradient: "from-primary/10 to-primary/5" },
    { label: "Tripulação Ativa", value: data.activeCrew, suffix: `/${data.crewMembers}`, sub: `${data.crewMembers > 0 ? Math.round((data.activeCrew / data.crewMembers) * 100) : 0}% alocação`, icon: Users, glow: "success" as const, gradient: "from-success/10 to-success/5" },
    { label: "Insights Ativos", value: insights.length, sub: `${insights.filter(i => i.status === "pending").length} pendentes`, icon: Lightbulb, glow: "warning" as const, gradient: "from-warning/10 to-warning/5" },
    { label: "Compliance", value: data.complianceRate, suffix: "%", sub: "Taxa de conformidade", icon: ShieldCheck, glow: "primary" as const, gradient: "from-primary/10 to-primary/5" },
  ];

  const businessKpis = [
    { title: "ROI Total", value: "247%", change: "+18%", trend: "up", icon: DollarSign },
    { title: "Insights Gerados", value: "342", change: "+45", trend: "up", icon: Lightbulb },
    { title: "Ações Executadas", value: "89%", change: "+12%", trend: "up", icon: CheckCircle2 },
    { title: "Economia Gerada", value: "R$ 1.2M", change: "+R$ 180K", trend: "up", icon: TrendingUp },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg" whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
            <Activity className="h-8 w-8" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">Operations Command Center<Badge variant="secondary" className="text-xs font-medium"><Brain className="h-3 w-3 mr-1" />AI-Powered</Badge></h1>
            <p className="text-sm text-muted-foreground mt-0.5">Centro unificado de operações e inteligência de negócios</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchOperationalData(true)} disabled={isRefreshing}><RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />Atualizar</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Exportar</Button></DropdownMenuTrigger>
            <DropdownMenuContent><DropdownMenuItem onClick={generatePDFReport} disabled={isGeneratingReport}><FileText className="h-4 w-4 mr-2" />Relatório PDF</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}><Settings className="h-4 w-4" /></Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => (
          <motion.div key={kpi.label} variants={stagger.item}>
            <PremiumCard glowColor={kpi.glow} delay={idx} className="p-0">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-3xl font-bold tracking-tight"><AnimatedCounter value={kpi.value} />{kpi.suffix && <span className="text-lg text-muted-foreground font-normal">{kpi.suffix}</span>}</p>
                    <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.gradient}`}><kpi.icon className="h-6 w-6 text-foreground/70" /></div>
                </div>
              </div>
              <div className="h-1 w-full rounded-b-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </PremiumCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto p-1 bg-muted/50 rounded-xl">
          {[{ value: "overview", label: "Visão Geral" }, { value: "operations", label: "Operações" }, { value: "insights", label: "Business Insights" }, { value: "trends", label: "Tendências" }, { value: "predictions", label: "Previsões" }, { value: "ai", label: "IA", icon: Brain }].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-lg text-xs md:text-sm">
              {"icon" in tab && tab.icon && <tab.icon className="h-3.5 w-3.5 mr-1" />}{tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent value="overview" key="overview"><OverviewTab performanceData={performanceData} vesselDistribution={vesselDistribution} businessKpis={businessKpis} /></TabsContent>
          <TabsContent value="operations" key="operations"><OperationsTab data={data} /></TabsContent>
          <TabsContent value="insights" key="insights"><InsightsTab insights={insights} onAnalyze={i => { setSelectedInsight(i); setAnalysisNotes(""); setIsAnalyzeDialogOpen(true); }} onImplement={i => { setSelectedInsight(i); setImplementationPlan(""); setIsImplementDialogOpen(true); }} /></TabsContent>
          <TabsContent value="trends" key="trends"><TrendsTab insights={insights} /></TabsContent>
          <TabsContent value="predictions" key="predictions"><PredictionsTab /></TabsContent>
          <TabsContent value="ai" key="ai"><AITab aiInsight={aiInsight} isAnalyzing={isAnalyzing} onGenerate={generateAIAnalysis} /></TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent>
          <SheetHeader><SheetTitle>Configurações</SheetTitle><SheetDescription>Personalize o Operations Command Center</SheetDescription></SheetHeader>
          <div className="space-y-6 py-6">
            <div className="flex items-center justify-between"><div><p className="font-medium text-sm">Atualização Automática</p><p className="text-xs text-muted-foreground">Atualiza dados automaticamente</p></div><Switch checked={settings.autoRefresh} onCheckedChange={v => setSettings(p => ({ ...p, autoRefresh: v }))} /></div>
            <Separator />
            <div className="space-y-2"><Label className="text-sm">Intervalo (segundos)</Label><Input type="number" value={settings.refreshInterval} onChange={e => setSettings(p => ({ ...p, refreshInterval: parseInt(e.target.value) }))} disabled={!settings.autoRefresh} /></div>
            <Separator />
            <div className="flex items-center justify-between"><div><p className="font-medium text-sm">Notificações</p><p className="text-xs text-muted-foreground">Exibir alertas operacionais</p></div><Switch checked={settings.showNotifications} onCheckedChange={v => setSettings(p => ({ ...p, showNotifications: v }))} /></div>
          </div>
        </SheetContent>
      </Sheet>

      <InsightDialogs selectedInsight={selectedInsight} isAnalyzeDialogOpen={isAnalyzeDialogOpen} isImplementDialogOpen={isImplementDialogOpen} analysisNotes={analysisNotes} implementationPlan={implementationPlan} isProcessing={isProcessingInsight} onAnalyzeOpenChange={setIsAnalyzeDialogOpen} onImplementOpenChange={setIsImplementDialogOpen} onAnalysisNotesChange={setAnalysisNotes} onImplementationPlanChange={setImplementationPlan} onSubmitAnalysis={submitAnalysis} onSubmitImplementation={submitImplementation} />
    </div>
  );
}
