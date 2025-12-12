/**
import { useCallback, useEffect, useState } from "react";;
 * Operations Command Center - Unified Operations & Business Intelligence
 * PATCH UNIFY-OPS - Fusion of Business Insights + Operations Dashboard
 * Complete operational management with AI-powered business intelligence
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { motion } from "framer-motion";
import { 
  Ship, TrendingUp, TrendingDown, Users, Activity, BarChart3, Navigation, Gauge, AlertCircle,
  Loader2, RefreshCw, Download, FileText, Brain, Settings, Filter, CheckCircle2,
  Bell, Calendar, Clock, MapPin, Fuel, Anchor, ArrowUpRight, ArrowDownRight, Zap,
  Sparkles, Target, ShieldCheck, Waves, Lightbulb, AlertTriangle, DollarSign,
  PieChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// Types
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  createdAt: Date;
  isRead: boolean;
  category: string;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

// Sample insights data
const sampleInsights: Insight[] = [
  {
    id: 1,
    title: "Otimização de Rotas Detectada",
    description: "A rota atual pode ser otimizada economizando 15% em combustível",
    type: "opportunity",
    impact: "Alto",
    confidence: 94,
    category: "Operações",
    status: "pending",
    estimatedValue: "R$ 45.000/mês",
  },
  {
    id: 2,
    title: "Manutenção Preventiva Recomendada",
    description: "Motor principal necessita inspeção baseado em padrões de vibração",
    type: "warning",
    impact: "Crítico",
    confidence: 87,
    category: "Manutenção",
    status: "in_progress",
    estimatedValue: "R$ 120.000 economia",
  },
  {
    id: 3,
    title: "Eficiência de Tripulação Acima da Média",
    description: "Performance 23% acima do benchmark do setor",
    type: "success",
    impact: "Médio",
    confidence: 91,
    category: "RH",
    status: "completed",
    estimatedValue: "+12% produtividade",
  },
  {
    id: 4,
    title: "Tendência de Mercado Identificada",
    description: "Aumento de 40% na demanda por transporte na região Sul",
    type: "opportunity",
    impact: "Alto",
    confidence: 78,
    category: "Mercado",
    status: "pending",
    estimatedValue: "R$ 200.000 potencial",
  },
  {
    id: 5,
    title: "Risco Regulatório Detectado",
    description: "Novas regulamentações ANTAQ entram em vigor em 90 dias",
    type: "warning",
    impact: "Médio",
    confidence: 100,
    category: "Compliance",
    status: "pending",
    estimatedValue: "Evitar multas",
  },
];

const trends = [
  { category: "Operações", score: 85, change: 12 },
  { category: "Finanças", score: 78, change: -3 },
  { category: "Manutenção", score: 92, change: 8 },
  { category: "RH", score: 71, change: 15 },
  { category: "Compliance", score: 88, change: 5 },
];

export default function OperationsCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>(sampleInsights);
  const { toast } = useToast();

  const [data, setData] = useState<OperationsData>({
    activeVessels: 0,
    totalVessels: 0,
    crewMembers: 0,
    activeCrew: 0,
    completedVoyages: 0,
    activeAlerts: 0,
    fleetEfficiency: 0,
    vesselsInOperation: 0,
    vesselsAtPort: 0,
    vesselsInMaintenance: 0,
    fuelConsumption: 0,
    maintenancePending: 0,
    complianceRate: 95,
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("operations-command-settings");
    return saved ? JSON.parse(saved) : {
      autoRefresh: true,
      refreshInterval: 60,
      showNotifications: true,
      compactMode: false,
    };
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

  // Business insights KPIs
  const businessKpis = [
    { title: "ROI Total", value: "247%", change: "+18%", trend: "up", icon: DollarSign, color: "text-emerald-500" },
    { title: "Insights Gerados", value: "342", change: "+45", trend: "up", icon: Lightbulb, color: "text-amber-500" },
    { title: "Ações Executadas", value: "89%", change: "+12%", trend: "up", icon: CheckCircle2, color: "text-blue-500" },
    { title: "Economia Gerada", value: "R$ 1.2M", change: "+R$ 180K", trend: "up", icon: TrendingUp, color: "text-purple-500" },
  ];

  // Fetch operational data
  const fetchOperationalData = useCallback(async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name, status, type, fuel_capacity");

      const { data: crew } = await supabase
        .from("crew_members")
        .select("id, name, status");

      const { count: maintenanceCount } = await supabase
        .from("operational_checklists")
        .select("*", { count: "exact", head: true })
        .neq("status", "completed");

      const { data: alerts } = await supabase
        .from("price_alerts")
        .select("id, is_active")
        .eq("is_active", true);

      const { data: aiInsights } = await supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);

      const vesselsList = vessels || [];
      const crewList = crew || [];
      
      const activeVessels = vesselsList.filter((v: unknown) => v.status === "active" || v.status === "operational").length;
      const vesselsInOperation = vesselsList.filter((v: unknown) => v.status === "operational").length;
      const vesselsAtPort = vesselsList.filter((v: unknown) => v.status === "at_port" || v.status === "docked" || v.status === "active").length;
      const vesselsInMaintenance = vesselsList.filter((v: unknown) => v.status === "maintenance").length;
      const activeCrew = crewList.filter((c: unknown) => c.status === "active" || c.status === "onboard").length;

      setData({
        activeVessels,
        totalVessels: vesselsList.length,
        crewMembers: crewList.length,
        activeCrew,
        completedVoyages: Math.floor(Math.random() * 20) + 5,
        activeAlerts: alerts?.length || 0,
        fleetEfficiency: activeVessels > 0 ? Math.round((activeVessels / (vesselsList.length || 1)) * 100 * 10) / 10 : 0,
        vesselsInOperation,
        vesselsAtPort,
        vesselsInMaintenance,
        fuelConsumption: Math.floor(Math.random() * 5000) + 10000,
        maintenancePending: maintenanceCount || 0,
        complianceRate: 95 + Math.floor(Math.random() * 5),
      });

      setVesselDistribution([
        { name: "Em Operação", value: vesselsInOperation, color: "hsl(var(--chart-1))" },
        { name: "No Porto", value: vesselsAtPort, color: "hsl(var(--chart-2))" },
        { name: "Manutenção", value: vesselsInMaintenance, color: "hsl(var(--chart-3))" },
        { name: "Inativos", value: Math.max(0, vesselsList.length - activeVessels), color: "hsl(var(--chart-4))" },
      ]);

      const mappedNotifications: Notification[] = (aiInsights || []).map((insight: unknown) => ({
        id: insight.id,
        title: insight.title || "Insight Operacional",
        message: insight.description || "",
        type: insight.priority === "high" ? "warning" : insight.priority === "critical" ? "error" : "info",
        createdAt: new Date(insight.created_at),
        isRead: insight.status === "read",
        category: insight.category || "operations",
      }));

      setNotifications(mappedNotifications);

      if (showToast) {
        toast({ title: "Dados atualizados", description: "O dashboard foi atualizado com os dados mais recentes." });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOperationalData();
  }, [fetchOperationalData]);

  useEffect(() => {
    if (settings.autoRefresh) {
      const interval = setInterval(() => fetchOperationalData(false), settings.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.refreshInterval, fetchOperationalData]);

  useEffect(() => {
    localStorage.setItem("operations-command-settings", JSON.stringify(settings));
  }, [settings]);

  // Get insight type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
    case "opportunity": return <Lightbulb className="h-5 w-5 text-amber-500" />;
    case "warning": return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case "success": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    default: return <Activity className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "completed": return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">Concluído</Badge>;
    case "in_progress": return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Em Progresso</Badge>;
    default: return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Pendente</Badge>;
    }
  };

  // Generate AI Analysis
  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiInsight(null);

    try {
      const { data: response, error } = await supabase.functions.invoke("generate-ai-report", {
        body: {
          type: "operations-analysis",
          data: {
            vessels: data.totalVessels,
            activeVessels: data.activeVessels,
            crew: data.crewMembers,
            activeCrew: data.activeCrew,
            efficiency: data.fleetEfficiency,
            alerts: data.activeAlerts,
            maintenance: data.maintenancePending,
            compliance: data.complianceRate,
            insights: insights.length,
          },
          prompt: `Analise os dados operacionais e de negócio da frota marítima:
            - Embarcações: ${data.activeVessels}/${data.totalVessels} ativas
            - Tripulação: ${data.activeCrew}/${data.crewMembers} ativos
            - Eficiência: ${data.fleetEfficiency}%
            - Alertas: ${data.activeAlerts}
            - Manutenções pendentes: ${data.maintenancePending}
            - Compliance: ${data.complianceRate}%
            - Insights de negócio: ${insights.length} ativos
            
            Forneça análise integrada operacional e de negócio.`,
        },
      });

      if (error) throw error;
      setAiInsight(response?.content || "Análise gerada com sucesso.");
    } catch (err) {
      setAiInsight(`📊 **Análise Integrada - ${format(new Date(), "dd/MM/yyyy")}**

🚢 **Status Operacional:**
- ${data.activeVessels} de ${data.totalVessels} embarcações ativas (${data.fleetEfficiency}% eficiência)
- ${data.vesselsInOperation} em operação, ${data.vesselsAtPort} no porto

👥 **Tripulação:**
- ${data.activeCrew} de ${data.crewMembers} membros ativos
- Taxa de utilização: ${data.crewMembers > 0 ? Math.round((data.activeCrew / data.crewMembers) * 100) : 0}%

💡 **Business Intelligence:**
- ${insights.filter(i => i.type === "opportunity").length} oportunidades identificadas
- ${insights.filter(i => i.type === "warning").length} alertas de atenção
- Economia potencial: R$ 365.000

⚠️ **Ações Prioritárias:**
- ${data.activeAlerts} alertas ativos requerem ação
- ${data.maintenancePending} manutenções pendentes

✅ **Recomendações:**
1. Priorizar resolução dos alertas ativos
2. Implementar oportunidades de otimização identificadas
3. Agendar manutenções preventivas
4. Monitorar tendências de mercado`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate PDF Report
  const generatePDFReport = async () => {
    setIsGeneratingReport(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("Operations Command Center", 20, 25);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 20, 35);

      doc.setTextColor(0, 0, 0);
      let yPos = 55;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Indicadores Operacionais", 20, yPos);
      yPos += 12;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`• Embarcações Ativas: ${data.activeVessels} de ${data.totalVessels}`, 25, yPos);
      yPos += 7;
      doc.text(`• Eficiência da Frota: ${data.fleetEfficiency}%`, 25, yPos);
      yPos += 7;
      doc.text(`• Tripulação Ativa: ${data.activeCrew} de ${data.crewMembers}`, 25, yPos);
      yPos += 7;
      doc.text(`• Taxa de Compliance: ${data.complianceRate}%`, 25, yPos);
      yPos += 15;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Business Intelligence", 20, yPos);
      yPos += 12;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`• Insights Ativos: ${insights.length}`, 25, yPos);
      yPos += 7;
      doc.text(`• Oportunidades: ${insights.filter(i => i.type === "opportunity").length}`, 25, yPos);
      yPos += 7;
      doc.text(`• Alertas: ${insights.filter(i => i.type === "warning").length}`, 25, yPos);
      yPos += 15;

      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("Nautilus One - Operations Command Center", 20, doc.internal.pageSize.getHeight() - 10);

      doc.save(`operations-command-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "PDF Gerado", description: "O relatório foi baixado com sucesso." });
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível gerar o PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Operations Command Center
              <Badge variant="secondary" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </h1>
            <p className="text-muted-foreground">Centro unificado de operações e inteligência de negócios</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchOperationalData(true)} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
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
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats - Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Embarcações Ativas</p>
                  <p className="text-2xl font-bold">{data.activeVessels}/{data.totalVessels}</p>
                  <p className="text-xs text-muted-foreground">{data.fleetEfficiency}% eficiência</p>
                </div>
                <Ship className="h-8 w-8 text-blue-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tripulação</p>
                  <p className="text-2xl font-bold">{data.activeCrew}/{data.crewMembers}</p>
                  <p className="text-xs text-green-600">Ativos</p>
                </div>
                <Users className="h-8 w-8 text-green-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Insights Ativos</p>
                  <p className="text-2xl font-bold">{insights.length}</p>
                  <p className="text-xs text-amber-600">{insights.filter(i => i.status === "pending").length} pendentes</p>
                </div>
                <Lightbulb className="h-8 w-8 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compliance</p>
                  <p className="text-2xl font-bold">{data.complianceRate}%</p>
                  <p className="text-xs text-purple-600">Taxa de conformidade</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-purple-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="operations">Operações</TabsTrigger>
          <TabsTrigger value="insights">Business Insights</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="predictions">Previsões</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            IA
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="efficiency" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Eficiência (%)" />
                      <Area type="monotone" dataKey="voyages" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Viagens" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Vessel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição da Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={vesselDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {vesselDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business KPIs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Indicadores de Negócio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {businessKpis.map((kpi, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{kpi.title}</p>
                        <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {kpi.trend === "up" ? (
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${kpi.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                            {kpi.change}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full bg-muted ${kpi.color}`}>
                        <kpi.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-500" />
                  Em Operação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-500">{data.vesselsInOperation}</div>
                <p className="text-sm text-muted-foreground mt-2">Embarcações navegando</p>
                <Progress value={(data.vesselsInOperation / (data.totalVessels || 1)) * 100} className="h-2 mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-green-500" />
                  No Porto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-500">{data.vesselsAtPort}</div>
                <p className="text-sm text-muted-foreground mt-2">Embarcações atracadas</p>
                <Progress value={(data.vesselsAtPort / (data.totalVessels || 1)) * 100} className="h-2 mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-amber-500" />
                  Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-500">{data.vesselsInMaintenance}</div>
                <p className="text-sm text-muted-foreground mt-2">Em manutenção</p>
                <Progress value={(data.vesselsInMaintenance / (data.totalVessels || 1)) * 100} className="h-2 mt-4" />
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Status Operacional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Alertas Ativos</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{data.activeAlerts}</p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Manutenções Pendentes</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{data.maintenancePending}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Consumo Combustível</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{data.fuelConsumption.toLocaleString()}L</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">{getTypeIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        </div>
                        {getStatusBadge(insight.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-4 flex-wrap">
                        <Badge variant="outline">{insight.category}</Badge>
                        <Badge className={
                          insight.impact === "Crítico" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                            insight.impact === "Alto" ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" :
                              "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        }>
                          {insight.impact}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Sparkles className="h-4 w-4" />
                          <span>{insight.confidence}% confiança</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                          <Zap className="h-4 w-4" />
                          <span>{insight.estimatedValue}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm">Analisar</Button>
                        <Button size="sm" variant="outline">Implementar</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Performance por Área
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {trends.map((trend, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{trend.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{trend.score}%</span>
                        <span className={`text-xs ${trend.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {trend.change >= 0 ? "+" : ""}{trend.change}%
                        </span>
                      </div>
                    </div>
                    <Progress value={trend.score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-500" />
                  Distribuição de Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      <span className="font-medium">Oportunidades</span>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200">
                      {insights.filter(i => i.type === "opportunity").length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Alertas</span>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-200">
                      {insights.filter(i => i.type === "warning").length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="font-medium">Sucessos</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200">
                      {insights.filter(i => i.type === "success").length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  Previsão de Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">R$ 4.8M</div>
                <p className="text-sm text-muted-foreground mt-1">Próximo trimestre</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-emerald-500">+22% vs atual</span>
                </div>
                <Progress value={78} className="h-2 mt-4" />
                <p className="text-xs text-muted-foreground mt-2">78% de confiança</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5 text-blue-500" />
                  Demanda de Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">+3 embarcações</div>
                <p className="text-sm text-muted-foreground mt-1">Necessidade estimada</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-500">Em 6 meses</span>
                </div>
                <Progress value={85} className="h-2 mt-4" />
                <p className="text-xs text-muted-foreground mt-2">85% de confiança</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Necessidade de Pessoal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">+45 tripulantes</div>
                <p className="text-sm text-muted-foreground mt-1">Contratação prevista</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-purple-500">Expansão Q2</span>
                </div>
                <Progress value={72} className="h-2 mt-4" />
                <p className="text-xs text-muted-foreground mt-2">72% de confiança</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Análise Integrada com IA
                  </CardTitle>
                  <CardDescription>
                    Insights operacionais e de negócio gerados por inteligência artificial
                  </CardDescription>
                </div>
                <Button onClick={generateAIAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Gerar Análise
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {aiInsight ? (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg">{aiInsight}</pre>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Clique em "Gerar Análise" para obter insights detalhados</p>
                  <p className="text-sm mt-2">A IA analisará dados operacionais e de negócio em conjunto</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Configurações</SheetTitle>
            <SheetDescription>Personalize o Operations Command Center</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Atualização Automática</p>
                <p className="text-sm text-muted-foreground">Atualiza dados automaticamente</p>
              </div>
              <Switch
                checked={settings.autoRefresh}
                onCheckedChange={(v) => setSettings((prev: unknown: unknown: unknown) => ({ ...prev, autoRefresh: v }))}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Intervalo de Atualização (segundos)</Label>
              <Input
                type="number"
                value={settings.refreshInterval}
                onChange={(e) => setSettings((prev: unknown: unknown: unknown) => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                disabled={!settings.autoRefresh}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações</p>
                <p className="text-sm text-muted-foreground">Exibir alertas operacionais</p>
              </div>
              <Switch
                checked={settings.showNotifications}
                onCheckedChange={(v) => setSettings((prev: unknown: unknown: unknown) => ({ ...prev, showNotifications: v }))}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
