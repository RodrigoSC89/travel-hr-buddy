/**
 * Operations Command Center - Premium Deep Ocean Edition
 * Cinematographic animations, glassmorphism, AnimatedCounter KPIs
 */
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import {
  Ship, TrendingUp, TrendingDown, Users, Activity, BarChart3, Navigation, Gauge, AlertCircle,
  Loader2, RefreshCw, Download, FileText, Brain, Settings, CheckCircle2,
  Bell, Clock, Fuel, Anchor, ArrowUpRight, ArrowDownRight, Zap,
  Sparkles, ShieldCheck, Lightbulb, AlertTriangle, DollarSign,
  PieChart, Play, Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getJsPDF } from '@/lib/pdf/lazy-pdf';
import { logger } from '@/lib/logger';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Types ────────────────────────────────────────
interface OperationsData {
  activeVessels: number;
  totalVessels: number;
  crewMembers: number;
  activeCrew: number;
  completedVoyages: number;
  activeAlerts: number;
  fleetEfficiency: number;
  vesselsInOperation: number;
  vesselsAtPort: number;
  vesselsInMaintenance: number;
  fuelConsumption: number;
  maintenancePending: number;
  complianceRate: number;
}

interface Insight {
  id: number;
  title: string;
  description: string;
  type: "opportunity" | "warning" | "success";
  impact: string;
  confidence: number;
  category: string;
  status: string;
  estimatedValue: string;
}

interface OperationsSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  showNotifications: boolean;
  compactMode: boolean;
}

interface VesselRecord { id: string; name: string; status: string; vessel_type?: string; }
interface CrewRecord { id: string; full_name: string; status: string; }
interface AIInsightRecord { id: string; title?: string; description?: string; priority?: string; created_at: string; status?: string; category?: string; }

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

const sampleInsights: Insight[] = [
  { id: 1, title: "Otimização de Rotas Detectada", description: "A rota atual pode ser otimizada economizando 15% em combustível", type: "opportunity", impact: "Alto", confidence: 94, category: "Operações", status: "pending", estimatedValue: "R$ 45.000/mês" },
  { id: 2, title: "Manutenção Preventiva Recomendada", description: "Motor principal necessita inspeção baseado em padrões de vibração", type: "warning", impact: "Crítico", confidence: 87, category: "Manutenção", status: "in_progress", estimatedValue: "R$ 120.000 economia" },
  { id: 3, title: "Eficiência de Tripulação Acima da Média", description: "Performance 23% acima do benchmark do setor", type: "success", impact: "Médio", confidence: 91, category: "RH", status: "completed", estimatedValue: "+12% produtividade" },
  { id: 4, title: "Tendência de Mercado Identificada", description: "Aumento de 40% na demanda por transporte na região Sul", type: "opportunity", impact: "Alto", confidence: 78, category: "Mercado", status: "pending", estimatedValue: "R$ 200.000 potencial" },
  { id: 5, title: "Risco Regulatório Detectado", description: "Novas regulamentações ANTAQ entram em vigor em 90 dias", type: "warning", impact: "Médio", confidence: 100, category: "Compliance", status: "pending", estimatedValue: "Evitar multas" },
];

const trends = [
  { category: "Operações", score: 85, change: 12 },
  { category: "Finanças", score: 78, change: -3 },
  { category: "Manutenção", score: 92, change: 8 },
  { category: "RH", score: 71, change: 15 },
  { category: "Compliance", score: 88, change: 5 },
];

// ─── Stagger animation helpers ────────────────────
const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } } },
};

const tabFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ─── Component ────────────────────────────────────
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

  // Insight dialogs
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

  // ─── Data fetching (unchanged logic) ────────────
  const fetchOperationalData = useCallback(async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    else setIsLoading(true);
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
    } catch (err) {
      logger.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => { fetchOperationalData(); }, [fetchOperationalData]);
  useEffect(() => {
    if (settings.autoRefresh) {
      const interval = setInterval(() => fetchOperationalData(false), settings.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.refreshInterval, fetchOperationalData]);
  useEffect(() => { localStorage.setItem("operations-command-settings", JSON.stringify(settings)); }, [settings]);

  // ─── Helpers ────────────────────────────────────
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "opportunity": return <Lightbulb className="h-5 w-5 text-warning" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "success": return <CheckCircle2 className="h-5 w-5 text-success" />;
      default: return <Activity className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-success/10 text-success border-success/20">Concluído</Badge>;
      case "in_progress": return <Badge className="bg-primary/10 text-primary border-primary/20">Em Progresso</Badge>;
      default: return <Badge className="bg-warning/10 text-warning border-warning/20">Pendente</Badge>;
    }
  };

  // ─── AI Analysis ────────────────────────────────
  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiInsight(null);
    try {
      const { data: response, error } = await supabase.functions.invoke("generate-ai-report", {
        body: { type: "operations-analysis", data, prompt: `Analise os dados operacionais da frota.` },
      });
      if (error) throw error;
      setAiInsight(response?.content || "Análise gerada com sucesso.");
    } catch {
      setAiInsight(`📊 **Análise Integrada - ${format(new Date(), "dd/MM/yyyy")}**\n\n🚢 ${data.activeVessels}/${data.totalVessels} embarcações ativas (${data.fleetEfficiency}%)\n👥 ${data.activeCrew}/${data.crewMembers} tripulantes ativos\n💡 ${insights.filter(i => i.type === "opportunity").length} oportunidades identificadas\n⚠️ ${data.activeAlerts} alertas ativos\n✅ Compliance: ${data.complianceRate}%`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ─── PDF Report ────────────────────────────────
  const generatePDFReport = async () => {
    setIsGeneratingReport(true);
    try {
      const JsPDF = await getJsPDF();
      const doc = new JsPDF();
      const w = doc.internal.pageSize.getWidth();
      doc.setFillColor(10, 22, 40);
      doc.rect(0, 0, w, 40, "F");
      doc.setTextColor(0, 242, 255);
      doc.setFontSize(22);
      doc.text("Operations Command Center", 20, 25);
      doc.setFontSize(9);
      doc.setTextColor(180, 200, 220);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 20, 34);
      doc.setTextColor(0, 0, 0);
      let y = 55;
      doc.setFontSize(14); doc.setFont("helvetica", "bold");
      doc.text("Indicadores Operacionais", 20, y); y += 10;
      doc.setFontSize(10); doc.setFont("helvetica", "normal");
      doc.text(`• Embarcações Ativas: ${data.activeVessels}/${data.totalVessels}`, 25, y); y += 7;
      doc.text(`• Eficiência: ${data.fleetEfficiency}%`, 25, y); y += 7;
      doc.text(`• Tripulação: ${data.activeCrew}/${data.crewMembers}`, 25, y); y += 7;
      doc.text(`• Compliance: ${data.complianceRate}%`, 25, y);
      doc.save(`ops-command-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "PDF Gerado", description: "Relatório baixado com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Não foi possível gerar o PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // ─── Insight handlers ────────────────────────────
  const handleAnalyzeInsight = (insight: Insight) => { setSelectedInsight(insight); setAnalysisNotes(""); setIsAnalyzeDialogOpen(true); };
  const handleImplementInsight = (insight: Insight) => { setSelectedInsight(insight); setImplementationPlan(""); setIsImplementDialogOpen(true); };

  const submitAnalysis = async () => {
    if (!selectedInsight) return;
    setIsProcessingInsight(true);
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: JSON.stringify({ insightId: selectedInsight.id, type: "analysis", notes: analysisNotes }),
        ai_response: `Análise: ${selectedInsight.title}`, interaction_type: "insight_analysis", module_name: "operations_command"
      });
      setInsights(prev => prev.map(i => i.id === selectedInsight.id ? { ...i, status: "in_progress" } : i));
      toast({ title: "✅ Análise Registrada" });
      setIsAnalyzeDialogOpen(false);
    } catch { toast({ title: "Erro", variant: "destructive" }); }
    finally { setIsProcessingInsight(false); }
  };

  const submitImplementation = async () => {
    if (!selectedInsight) return;
    setIsProcessingInsight(true);
    try {
      await supabase.from("ai_audit_logs").insert({
        user_input: JSON.stringify({ insightId: selectedInsight.id, type: "implementation", plan: implementationPlan }),
        ai_response: `Implementação: ${selectedInsight.title}`, interaction_type: "insight_implementation", module_name: "operations_command"
      });
      setInsights(prev => prev.map(i => i.id === selectedInsight.id ? { ...i, status: "completed" } : i));
      toast({ title: "🚀 Implementação Registrada" });
      setIsImplementDialogOpen(false);
    } catch { toast({ title: "Erro", variant: "destructive" }); }
    finally { setIsProcessingInsight(false); }
  };

  // ─── Loading skeleton ────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-72 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 rounded-xl bg-card border border-border/30 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-80 rounded-xl bg-card border border-border/30 animate-pulse" />
          <div className="h-80 rounded-xl bg-card border border-border/30 animate-pulse" />
        </div>
      </div>
    );
  }

  // ─── KPI Cards Data ────────────────────────────
  const kpiCards = [
    { label: "Embarcações Ativas", value: data.activeVessels, total: data.totalVessels, suffix: `/${data.totalVessels}`, sub: `${data.fleetEfficiency}% eficiência`, icon: Ship, glow: "cyan" as const, gradient: "from-primary/10 to-primary/5" },
    { label: "Tripulação Ativa", value: data.activeCrew, total: data.crewMembers, suffix: `/${data.crewMembers}`, sub: `${data.crewMembers > 0 ? Math.round((data.activeCrew / data.crewMembers) * 100) : 0}% alocação`, icon: Users, glow: "success" as const, gradient: "from-success/10 to-success/5" },
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
      {/* ─── Header ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="p-3.5 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Activity className="h-8 w-8" />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              Operations Command Center
              <Badge variant="secondary" className="text-xs font-medium">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Centro unificado de operações e inteligência de negócios</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchOperationalData(true)} disabled={isRefreshing} className="active:scale-95 transition-transform">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="active:scale-95 transition-transform">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={generatePDFReport} disabled={isGeneratingReport}>
                <FileText className="h-4 w-4 mr-2" />
                Relatório PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="active:scale-95 transition-transform">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* ─── KPI Cards ─────────────────────────────── */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpiCards.map((kpi, idx) => (
          <motion.div key={kpi.label} variants={stagger.item}>
            <PremiumCard glowColor={kpi.glow} delay={idx} className="p-0">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-3xl font-bold tracking-tight">
                      <AnimatedCounter value={kpi.value} />
                      {kpi.suffix && <span className="text-lg text-muted-foreground font-normal">{kpi.suffix}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{kpi.sub}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.gradient}`}>
                    <kpi.icon className="h-6 w-6 text-foreground/70" />
                  </div>
                </div>
              </div>
              {/* Bottom accent line */}
              <div className="h-1 w-full rounded-b-xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </PremiumCard>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Main Tabs ─────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto p-1 bg-muted/50 rounded-xl">
          {[
            { value: "overview", label: "Visão Geral" },
            { value: "operations", label: "Operações" },
            { value: "insights", label: "Business Insights" },
            { value: "trends", label: "Tendências" },
            { value: "predictions", label: "Previsões" },
            { value: "ai", label: "IA", icon: Brain },
          ].map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-lg text-xs md:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
              {tab.icon && <tab.icon className="h-3.5 w-3.5 mr-1" />}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          {/* ─── Overview Tab ──────────────────────── */}
          <TabsContent value="overview" className="space-y-4" key="overview">
            <motion.div {...tabFade} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PremiumCard glowColor="cyan" delay={0}>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Performance Semanal</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="gradEff" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradVoy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }} />
                        <Legend />
                        <Area type="monotone" dataKey="efficiency" stroke="hsl(var(--chart-1))" fill="url(#gradEff)" strokeWidth={2.5} name="Eficiência (%)" />
                        <Area type="monotone" dataKey="voyages" stroke="hsl(var(--chart-2))" fill="url(#gradVoy)" strokeWidth={2.5} name="Viagens" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </PremiumCard>

                <PremiumCard glowColor="primary" delay={1}>
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Distribuição da Frota</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={vesselDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={4}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {vesselDistribution.map((entry, idx) => (
                            <Cell key={entry.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--card))" }} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </PremiumCard>
              </div>

              {/* Business KPIs */}
              <PremiumCard glowColor="success" delay={2}>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <h3 className="font-semibold">Indicadores de Negócio</h3>
                </div>
                <motion.div
                  variants={stagger.container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {businessKpis.map((kpi, idx) => (
                    <motion.div
                      key={kpi.title}
                      variants={stagger.item}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-xl bg-muted/40 border border-border/30 transition-colors hover:bg-muted/60"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpi.title}</p>
                          <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {kpi.trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5 text-success" /> : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
                            <span className={`text-xs font-medium ${kpi.trend === "up" ? "text-success" : "text-destructive"}`}>{kpi.change}</span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-primary/5">
                          <kpi.icon className="h-5 w-5 text-primary/70" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </PremiumCard>
            </motion.div>
          </TabsContent>

          {/* ─── Operations Tab ──────────────────────── */}
          <TabsContent value="operations" className="space-y-4" key="operations">
            <motion.div {...tabFade} className="space-y-4">
              <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Em Operação", value: data.vesselsInOperation, icon: Navigation, glow: "cyan" as const, sub: "Embarcações navegando" },
                  { label: "No Porto", value: data.vesselsAtPort, icon: Anchor, glow: "success" as const, sub: "Embarcações atracadas" },
                  { label: "Manutenção", value: data.vesselsInMaintenance, icon: Gauge, glow: "warning" as const, sub: "Em manutenção" },
                ].map((item, idx) => (
                  <motion.div key={item.label} variants={stagger.item}>
                    <PremiumCard glowColor={item.glow} delay={idx}>
                      <div className="flex items-center gap-2 mb-3">
                        <item.icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-sm">{item.label}</h3>
                      </div>
                      <p className="text-4xl font-bold tracking-tight">
                        <AnimatedCounter value={item.value} />
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
                      <Progress value={(item.value / (data.totalVessels || 1)) * 100} className="h-1.5 mt-4" />
                    </PremiumCard>
                  </motion.div>
                ))}
              </motion.div>

              <PremiumCard glowColor="warning" delay={3}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <h3 className="font-semibold">Status Operacional</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Alertas Ativos", value: data.activeAlerts, icon: Bell, bg: "bg-destructive/5 border-destructive/10" },
                    { label: "Manutenções Pendentes", value: data.maintenancePending, icon: Gauge, bg: "bg-warning/5 border-warning/10" },
                    { label: "Consumo Combustível", value: data.fuelConsumption, icon: Fuel, bg: "bg-primary/5 border-primary/10", suffix: "L" },
                  ].map(item => (
                    <motion.div
                      key={item.label}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl border ${item.bg} transition-all`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                      </div>
                      <p className="text-2xl font-bold">
                        <AnimatedCounter value={item.value} />
                        {item.suffix && <span className="text-sm text-muted-foreground ml-0.5">{item.suffix}</span>}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>
            </motion.div>
          </TabsContent>

          {/* ─── Insights Tab ──────────────────────── */}
          <TabsContent value="insights" className="space-y-3" key="insights">
            <motion.div {...tabFade} className="space-y-3">
              {insights.map((insight, idx) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.35 }}
                >
                  <PremiumCard
                    glowColor={insight.type === "opportunity" ? "warning" : insight.type === "warning" ? "destructive" : "success"}
                    delay={idx}
                    className="p-0"
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-muted/50">{getTypeIcon(insight.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-sm">{insight.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                            </div>
                            {getStatusBadge(insight.status)}
                          </div>
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <Badge variant="outline" className="text-xs">{insight.category}</Badge>
                            <Badge className={`text-xs ${
                              insight.impact === "Crítico" ? "bg-destructive/10 text-destructive border-destructive/20" :
                              insight.impact === "Alto" ? "bg-warning/10 text-warning border-warning/20" :
                              "bg-primary/10 text-primary border-primary/20"
                            }`}>{insight.impact}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> {insight.confidence}%
                            </span>
                            <span className="text-xs font-medium text-success flex items-center gap-1">
                              <Zap className="h-3 w-3" /> {insight.estimatedValue}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="default" className="h-7 text-xs active:scale-95 transition-transform" onClick={() => handleAnalyzeInsight(insight)}>
                              <Eye className="h-3 w-3 mr-1" /> Analisar
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs active:scale-95 transition-transform" onClick={() => handleImplementInsight(insight)}>
                              <Play className="h-3 w-3 mr-1" /> Implementar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* ─── Trends Tab ──────────────────────── */}
          <TabsContent value="trends" className="space-y-4" key="trends">
            <motion.div {...tabFade} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PremiumCard glowColor="primary" delay={0}>
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Performance por Área</h3>
                </div>
                <div className="space-y-4">
                  {trends.map((trend, idx) => (
                    <motion.div
                      key={trend.category}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{trend.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold"><AnimatedCounter value={trend.score} suffix="%" /></span>
                          <span className={`text-xs font-medium ${trend.change >= 0 ? "text-success" : "text-destructive"}`}>
                            {trend.change >= 0 ? "+" : ""}{trend.change}%
                          </span>
                        </div>
                      </div>
                      <Progress value={trend.score} className="h-2" />
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>

              <PremiumCard glowColor="success" delay={1}>
                <div className="flex items-center gap-2 mb-5">
                  <PieChart className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Distribuição de Insights</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Oportunidades", icon: Lightbulb, count: insights.filter(i => i.type === "opportunity").length, bg: "bg-warning/5 border-warning/15", iconColor: "text-warning" },
                    { label: "Alertas", icon: AlertTriangle, count: insights.filter(i => i.type === "warning").length, bg: "bg-destructive/5 border-destructive/15", iconColor: "text-destructive" },
                    { label: "Sucessos", icon: CheckCircle2, count: insights.filter(i => i.type === "success").length, bg: "bg-success/5 border-success/15", iconColor: "text-success" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border ${item.bg} transition-all`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      <span className="text-lg font-bold"><AnimatedCounter value={item.count} /></span>
                    </motion.div>
                  ))}
                </div>
              </PremiumCard>
            </motion.div>
          </TabsContent>

          {/* ─── Predictions Tab ──────────────────────── */}
          <TabsContent value="predictions" className="space-y-4" key="predictions">
            <motion.div {...tabFade}>
              <motion.div variants={stagger.container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "Previsão de Receita", value: "R$ 4.8M", sub: "Próximo trimestre", change: "+22% vs atual", confidence: 78, icon: DollarSign, glow: "success" as const },
                  { title: "Demanda de Frota", value: "+3 embarcações", sub: "Necessidade estimada", change: "Em 6 meses", confidence: 85, icon: Ship, glow: "cyan" as const },
                  { title: "Necessidade de Pessoal", value: "+45 tripulantes", sub: "Contratação prevista", change: "Expansão Q2", confidence: 72, icon: Users, glow: "primary" as const },
                ].map((pred, idx) => (
                  <motion.div key={pred.title} variants={stagger.item}>
                    <PremiumCard glowColor={pred.glow} delay={idx}>
                      <div className="flex items-center gap-2 mb-3">
                        <pred.icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-sm">{pred.title}</h3>
                      </div>
                      <p className="text-3xl font-bold tracking-tight">{pred.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{pred.sub}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                        <span className="text-xs text-success font-medium">{pred.change}</span>
                      </div>
                      <Progress value={pred.confidence} className="h-1.5 mt-4" />
                      <p className="text-xs text-muted-foreground mt-1.5">{pred.confidence}% de confiança</p>
                    </PremiumCard>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ─── AI Tab ──────────────────────── */}
          <TabsContent value="ai" className="space-y-4" key="ai">
            <motion.div {...tabFade}>
              <PremiumCard glowColor="cyan" delay={0}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Análise Integrada com IA</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Insights operacionais e de negócio gerados por inteligência artificial</p>
                  </div>
                  <Button onClick={generateAIAnalysis} disabled={isAnalyzing} size="sm" className="active:scale-95 transition-transform">
                    {isAnalyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Gerar Análise
                  </Button>
                </div>
                {aiInsight ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-5 rounded-xl border border-border/30 leading-relaxed">{aiInsight}</pre>
                  </motion.div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                      <Brain className="h-14 w-14 mx-auto mb-4 opacity-20" />
                    </motion.div>
                    <p className="text-sm">Clique em "Gerar Análise" para obter insights detalhados</p>
                    <p className="text-xs mt-1 text-muted-foreground/70">A IA analisará dados operacionais e de negócio em conjunto</p>
                  </div>
                )}
              </PremiumCard>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* ─── Settings Sheet ──────────────────────── */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Configurações</SheetTitle>
            <SheetDescription>Personalize o Operations Command Center</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Atualização Automática</p>
                <p className="text-xs text-muted-foreground">Atualiza dados automaticamente</p>
              </div>
              <Switch checked={settings.autoRefresh} onCheckedChange={v => setSettings(p => ({ ...p, autoRefresh: v }))} />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm">Intervalo (segundos)</Label>
              <Input type="number" value={settings.refreshInterval} onChange={e => setSettings(p => ({ ...p, refreshInterval: parseInt(e.target.value) }))} disabled={!settings.autoRefresh} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Notificações</p>
                <p className="text-xs text-muted-foreground">Exibir alertas operacionais</p>
              </div>
              <Switch checked={settings.showNotifications} onCheckedChange={v => setSettings(p => ({ ...p, showNotifications: v }))} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Analyze Dialog ──────────────────────── */}
      <Dialog open={isAnalyzeDialogOpen} onOpenChange={setIsAnalyzeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Analisar Insight
            </DialogTitle>
            <DialogDescription>{selectedInsight?.title}</DialogDescription>
          </DialogHeader>
          {selectedInsight && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-sm">{selectedInsight.description}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">{selectedInsight.category}</Badge>
                  <Badge className="text-xs bg-primary/10 text-primary">{selectedInsight.confidence}% confiança</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Notas de Análise</Label>
                <Textarea placeholder="Suas observações..." value={analysisNotes} onChange={e => setAnalysisNotes(e.target.value)} rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnalyzeDialogOpen(false)}>Cancelar</Button>
            <Button onClick={submitAnalysis} disabled={isProcessingInsight}>
              {isProcessingInsight && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Análise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Implement Dialog ──────────────────────── */}
      <Dialog open={isImplementDialogOpen} onOpenChange={setIsImplementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-success" /> Implementar Insight
            </DialogTitle>
            <DialogDescription>{selectedInsight?.title}</DialogDescription>
          </DialogHeader>
          {selectedInsight && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">{selectedInsight.estimatedValue}</span>
                </div>
                <p className="text-sm">{selectedInsight.description}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Plano de Implementação</Label>
                <Textarea placeholder="Descreva o plano..." value={implementationPlan} onChange={e => setImplementationPlan(e.target.value)} rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImplementDialogOpen(false)}>Cancelar</Button>
            <Button onClick={submitImplementation} disabled={isProcessingInsight} className="bg-success text-success-foreground hover:bg-success/90">
              {isProcessingInsight && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Implementar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
