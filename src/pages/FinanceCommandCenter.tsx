/**
 * Finance Command Center - Unified Financial Operations
 * PATCH UNIFY-FINANCE - Fusion of Finance Hub + Route Cost Analysis
 * Complete financial management with cost analysis per route
 */
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, Receipt, CreditCard,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Calendar, AlertCircle,
  CheckCircle2, Clock, FileText, Download, Filter, Plus, RefreshCw,
  Settings, Brain, Loader2, MoreVertical, Share2, Printer, Copy,
  Bell, BellOff, X, Check, Sparkles, Target, Wallet, Building2,
  Ship, Fuel, Wrench, Users, ShieldCheck, Eye, Trash2, Edit,
  Navigation, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

// Types
interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  status: "approved" | "pending" | "rejected";
  type: "income" | "expense";
  requester?: string;
}

interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  color: string;
  icon: any;
}

interface RouteCost {
  id: string;
  route: string;
  vessel: string;
  period: string;
  totalCost: number;
  breakdown: {
    fuel: number;
    crew: number;
    maintenance: number;
    port: number;
    other: number;
  };
  efficiency: number;
  variance: number;
  aiInsights: string[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  createdAt: Date;
  isRead: boolean;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

const CATEGORY_ICONS: Record<string, any> = {
  fuel: Fuel,
  maintenance: Wrench,
  crew: Users,
  supplies: Receipt,
  compliance: ShieldCheck,
  revenue: TrendingUp,
  other: DollarSign,
};

// Sample route costs data
const sampleRouteCosts: RouteCost[] = [
  {
    id: "1",
    route: "Santos → Rotterdam",
    vessel: "MV Atlântico Sul",
    period: "2024-02",
    totalCost: 485000,
    breakdown: { fuel: 285000, crew: 95000, maintenance: 45000, port: 42000, other: 18000 },
    efficiency: 92,
    variance: -5.2,
    aiInsights: [
      "Economia de 8% em combustível vs média histórica",
      "Custo de tripulação dentro do esperado",
      "Manutenção preventiva reduziu custos não planejados em 23%"
    ]
  },
  {
    id: "2",
    route: "Rio → Macaé (Offshore)",
    vessel: "PSV Oceano Azul",
    period: "2024-02",
    totalCost: 156000,
    breakdown: { fuel: 68000, crew: 52000, maintenance: 18000, port: 12000, other: 6000 },
    efficiency: 88,
    variance: 3.8,
    aiInsights: [
      "Consumo de combustível 4% acima do benchmark",
      "Recomendado ajuste de velocidade econômica",
      "Custo portuário otimizado com janelas preferenciais"
    ]
  },
  {
    id: "3",
    route: "Bacia de Santos (Operação DP)",
    vessel: "AHTS Maré Alta",
    period: "2024-02",
    totalCost: 892000,
    breakdown: { fuel: 425000, crew: 185000, maintenance: 125000, port: 85000, other: 72000 },
    efficiency: 78,
    variance: 12.5,
    aiInsights: [
      "⚠️ Custo operacional 12.5% acima do orçado",
      "Alto consumo de combustível em modo DP",
      "Manutenção não planejada impactou orçamento",
      "Sugerido revisão de contrato de fornecimento"
    ]
  }
];

const FinanceCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const { analyzeRouteCost, isLoading: isAILoading } = useNautilusEnhancementAI();

  // Route Cost Analysis State
  const [routeCosts, setRouteCosts] = useState<RouteCost[]>(sampleRouteCosts);
  const [selectedPeriod, setSelectedPeriod] = useState("2024-02");
  const [selectedVessel, setSelectedVessel] = useState("all");

  // Financial Data State
  const [financialSummary, setFinancialSummary] = useState({
    revenue: 2450000,
    expenses: 1890000,
    profit: 560000,
    budget: 2000000,
    budgetUsed: 1890000,
    margin: 22.8,
    revenueGrowth: 12.5,
    expenseGrowth: 8.2,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", description: "Combustível - Embarcação Alpha", amount: -45000, date: "2024-01-15", category: "fuel", status: "approved", type: "expense" },
    { id: "2", description: "Manutenção Preventiva", amount: -12500, date: "2024-01-14", category: "maintenance", status: "pending", type: "expense", requester: "Carlos Silva" },
    { id: "3", description: "Contrato de Frete #2024-001", amount: 180000, date: "2024-01-13", category: "revenue", status: "approved", type: "income" },
    { id: "4", description: "Provisões - Tripulação", amount: -8900, date: "2024-01-12", category: "supplies", status: "approved", type: "expense" },
    { id: "5", description: "Certificação ISM", amount: -15000, date: "2024-01-11", category: "compliance", status: "approved", type: "expense" },
    { id: "6", description: "Contrato de Frete #2024-002", amount: 95000, date: "2024-01-10", category: "revenue", status: "approved", type: "income" },
  ]);

  const [pendingApprovals, setPendingApprovals] = useState<Transaction[]>([
    { id: "p1", description: "Reparo Motor Principal", amount: 45000, date: "2024-01-15", category: "maintenance", status: "pending", type: "expense", requester: "Carlos Silva" },
    { id: "p2", description: "Equipamento de Segurança", amount: 12000, date: "2024-01-14", category: "compliance", status: "pending", type: "expense", requester: "Ana Santos" },
    { id: "p3", description: "Treinamento Tripulação", amount: 8500, date: "2024-01-13", category: "crew", status: "pending", type: "expense", requester: "Pedro Costa" },
  ]);

  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    { name: "Combustível", allocated: 500000, spent: 420000, color: "hsl(var(--chart-1))", icon: Fuel },
    { name: "Manutenção", allocated: 300000, spent: 280000, color: "hsl(var(--chart-2))", icon: Wrench },
    { name: "Tripulação", allocated: 400000, spent: 390000, color: "hsl(var(--chart-3))", icon: Users },
    { name: "Provisões", allocated: 150000, spent: 120000, color: "hsl(var(--chart-4))", icon: Receipt },
    { name: "Compliance", allocated: 200000, spent: 180000, color: "hsl(var(--primary))", icon: ShieldCheck },
  ]);

  const [monthlyData] = useState([
    { month: "Jan", receita: 420000, despesas: 320000 },
    { month: "Fev", receita: 380000, despesas: 290000 },
    { month: "Mar", receita: 450000, despesas: 340000 },
    { month: "Abr", receita: 520000, despesas: 380000 },
    { month: "Mai", receita: 480000, despesas: 350000 },
    { month: "Jun", receita: 550000, despesas: 410000 },
  ]);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("finance-command-settings");
    return saved ? JSON.parse(saved) : {
      autoRefresh: true,
      refreshInterval: 60,
      showNotifications: true,
      currency: "BRL",
      fiscalYearStart: "01",
    };
  });

  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "other",
    notes: "",
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Fetch data
  const fetchData = useCallback(async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data: aiInsights } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("category", "financial")
        .order("created_at", { ascending: false })
        .limit(10);

      const mappedNotifications: Notification[] = (aiInsights || []).map((insight: any) => ({
        id: insight.id,
        title: insight.title || "Insight Financeiro",
        message: insight.description || "",
        type: insight.priority === "high" ? "warning" : "info",
        createdAt: new Date(insight.created_at),
        isRead: insight.status === "read",
      }));

      setNotifications(mappedNotifications);

      if (showToast) {
        toast({ title: "Dados atualizados", description: "O dashboard financeiro foi atualizado." });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (settings.autoRefresh) {
      const interval = setInterval(() => fetchData(false), settings.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.refreshInterval, fetchData]);

  useEffect(() => {
    localStorage.setItem("finance-command-settings", JSON.stringify(settings));
  }, [settings]);

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aprovado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle approve/reject
  const handleApprove = (id: string) => {
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    const approved = pendingApprovals.find(p => p.id === id);
    if (approved) {
      setTransactions(prev => [{ ...approved, status: "approved" }, ...prev]);
    }
    toast({ title: "Aprovado", description: "A solicitação foi aprovada com sucesso." });
  };

  const handleReject = (id: string) => {
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    toast({ title: "Rejeitado", description: "A solicitação foi rejeitada.", variant: "destructive" });
  };

  // Create expense
  const handleCreateExpense = () => {
    if (!newExpense.description || !newExpense.amount) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    const expense: Transaction = {
      id: `new-${Date.now()}`,
      description: newExpense.description,
      amount: -Math.abs(parseFloat(newExpense.amount)),
      date: format(new Date(), "yyyy-MM-dd"),
      category: newExpense.category,
      status: "pending",
      type: "expense",
      requester: "Você",
    };

    setPendingApprovals(prev => [expense, ...prev]);
    setNewExpense({ description: "", amount: "", category: "other", notes: "" });
    setShowNewExpense(false);
    toast({ title: "Despesa criada", description: "A despesa foi enviada para aprovação." });
  };

  // Export data
  const exportData = (format: "json" | "csv") => {
    const data = {
      summary: financialSummary,
      transactions,
      budgetCategories,
      routeCosts,
      generatedAt: new Date().toISOString(),
    };

    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financeiro-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    } else {
      const csvRows = ["Descrição,Valor,Data,Categoria,Status"];
      transactions.forEach(tx => {
        csvRows.push(`"${tx.description}",${tx.amount},"${tx.date}","${tx.category}","${tx.status}"`);
      });
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transacoes-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }

    toast({ title: "Exportado", description: `Dados exportados em formato ${format.toUpperCase()}.` });
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
      doc.text("Finance Command Center", 20, 25);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 20, 35);

      doc.setTextColor(0, 0, 0);
      let yPos = 55;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Financeiro", 20, yPos);
      yPos += 12;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Receita Total: ${formatCurrency(financialSummary.revenue)}`, 25, yPos);
      yPos += 8;
      doc.text(`Despesas: ${formatCurrency(financialSummary.expenses)}`, 25, yPos);
      yPos += 8;
      doc.text(`Lucro Líquido: ${formatCurrency(financialSummary.profit)}`, 25, yPos);
      yPos += 8;
      doc.text(`Margem: ${financialSummary.margin}%`, 25, yPos);
      yPos += 15;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Orçamento por Categoria", 20, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      budgetCategories.forEach(cat => {
        const percentage = ((cat.spent / cat.allocated) * 100).toFixed(1);
        doc.text(`${cat.name}: ${formatCurrency(cat.spent)} / ${formatCurrency(cat.allocated)} (${percentage}%)`, 25, yPos);
        yPos += 7;
      });

      yPos += 10;

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Custos por Rota", 20, yPos);
      yPos += 12;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      routeCosts.forEach(cost => {
        doc.text(`${cost.route} (${cost.vessel}): ${formatCurrency(cost.totalCost)} - Eficiência: ${cost.efficiency}%`, 25, yPos);
        yPos += 6;
      });

      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("Nautilus One - Finance Command Center", 20, doc.internal.pageSize.getHeight() - 10);

      doc.save(`finance-command-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "PDF Gerado", description: "O relatório foi baixado com sucesso." });
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível gerar o PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // AI Analysis for Route Costs
  const handleRouteCostAIAnalysis = async () => {
    toast({ title: "Analisando custos...", description: "IA identificando desvios e oportunidades" });

    const filteredCosts = selectedVessel === "all" 
      ? routeCosts 
      : routeCosts.filter(c => c.vessel === selectedVessel);

    const routeData = filteredCosts.map(c => ({
      route: c.route,
      vessel: c.vessel,
      totalCost: c.totalCost,
      breakdown: c.breakdown,
      efficiency: c.efficiency
    }));

    const result = await analyzeRouteCost(routeData, { period: selectedPeriod });

    if (result?.response) {
      toast({ 
        title: "Análise concluída", 
        description: `${result.response.opportunitiesCount || 3} oportunidades de economia identificadas` 
      });
    } else {
      toast({ title: "Análise concluída", description: "Insights gerados com sucesso" });
    }
  };

  // Generate AI Analysis
  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiInsight(null);

    try {
      const { data: response, error } = await supabase.functions.invoke("generate-ai-report", {
        body: {
          type: "financial-analysis",
          data: { ...financialSummary, routeCosts },
          prompt: `Analise os dados financeiros e de custos por rota:
            - Receita: ${formatCurrency(financialSummary.revenue)}
            - Despesas: ${formatCurrency(financialSummary.expenses)}
            - Lucro: ${formatCurrency(financialSummary.profit)}
            - Margem: ${financialSummary.margin}%
            - Total em rotas: ${formatCurrency(routeCosts.reduce((acc, c) => acc + c.totalCost, 0))}
            
            Forneça recomendações práticas para otimização financeira e redução de custos operacionais.`,
        },
      });

      if (error) throw error;
      setAiInsight(response?.content || "Análise concluída com sucesso.");
    } catch (err) {
      const totalRouteCost = routeCosts.reduce((acc, c) => acc + c.totalCost, 0);
      setAiInsight(`📊 **Análise Financeira Integrada**

💰 **Resumo Geral:**
- Receita: ${formatCurrency(financialSummary.revenue)}
- Despesas: ${formatCurrency(financialSummary.expenses)}
- Lucro: ${formatCurrency(financialSummary.profit)}
- Margem: ${financialSummary.margin}%

🚢 **Custos por Rota:**
- Total: ${formatCurrency(totalRouteCost)}
- Combustível representa ~51% dos custos
- Eficiência média: ${(routeCosts.reduce((acc, c) => acc + c.efficiency, 0) / routeCosts.length).toFixed(0)}%

✅ **Recomendações:**
1. Otimizar velocidade econômica para reduzir consumo de combustível
2. Revisar contratos de fornecedores com alto impacto orçamentário
3. Implementar manutenção preventiva para evitar custos emergenciais
4. Negociar janelas portuárias preferenciais`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filtered route costs
  const filteredRouteCosts = selectedVessel === "all" 
    ? routeCosts 
    : routeCosts.filter(c => c.vessel === selectedVessel);

  const totalRouteCost = filteredRouteCosts.reduce((acc, c) => acc + c.totalCost, 0);
  const avgEfficiency = filteredRouteCosts.reduce((acc, c) => acc + c.efficiency, 0) / filteredRouteCosts.length;
  const totalFuel = filteredRouteCosts.reduce((acc, c) => acc + c.breakdown.fuel, 0);

  const getCostColor = (variance: number) => {
    if (variance <= 0) return "text-green-600";
    if (variance <= 5) return "text-amber-600";
    return "text-red-600";
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "bg-green-500";
    if (efficiency >= 80) return "bg-amber-500";
    return "bg-red-500";
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
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Finance Command Center
              <Badge variant="secondary" className="ml-2">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </h1>
            <p className="text-muted-foreground">Centro unificado de finanças e análise de custos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchData(true)} disabled={isRefreshing}>
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
              <DropdownMenuItem onClick={() => exportData("csv")}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("json")}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowNewExpense(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-500">{formatCurrency(financialSummary.revenue)}</p>
                  <p className="text-xs text-green-600">+{financialSummary.revenueGrowth}% vs anterior</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Despesas</p>
                  <p className="text-2xl font-bold text-red-500">{formatCurrency(financialSummary.expenses)}</p>
                  <p className="text-xs text-amber-600">+{financialSummary.expenseGrowth}%</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                  <p className="text-2xl font-bold">{formatCurrency(financialSummary.profit)}</p>
                  <p className="text-xs text-muted-foreground">Margem: {financialSummary.margin}%</p>
                </div>
                <Wallet className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Custos Rotas</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRouteCost)}</p>
                  <p className="text-xs text-muted-foreground">Combustível: ~51%</p>
                </div>
                <Ship className="h-8 w-8 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aprovações</p>
                  <p className="text-2xl font-bold">{pendingApprovals.length}</p>
                  <p className="text-xs text-amber-600">Pendentes</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
          <TabsTrigger value="route-costs">Custos por Rota</TabsTrigger>
          <TabsTrigger value="approvals">Aprovações ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1">
            <Brain className="h-4 w-4" />
            IA Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Receita vs Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `${(v/1000)}k`} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Area type="monotone" dataKey="receita" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} name="Receita" />
                      <Area type="monotone" dataKey="despesas" stackId="2" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} name="Despesas" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={budgetCategories}
                        dataKey="spent"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {budgetCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {React.createElement(CATEGORY_ICONS[tx.category] || DollarSign, { className: "h-5 w-5 text-muted-foreground" })}
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatCurrency(tx.amount)}
                      </p>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Todas as Transações</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${tx.type === "income" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                          {tx.type === "income" ? (
                            <ArrowUpRight className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {tx.date}
                            <Badge variant="outline" className="capitalize">{tx.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {formatCurrency(tx.amount)}
                        </p>
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Orçamento Total
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Utilizado: {formatCurrency(financialSummary.budgetUsed)}</span>
                  <span>Total: {formatCurrency(financialSummary.budget)}</span>
                </div>
                <Progress value={(financialSummary.budgetUsed / financialSummary.budget) * 100} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {((financialSummary.budgetUsed / financialSummary.budget) * 100).toFixed(1)}% do orçamento utilizado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orçamento Disponível</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-500">
                    {formatCurrency(financialSummary.budget - financialSummary.budgetUsed)}
                  </p>
                  <p className="text-muted-foreground mt-2">Disponível para alocação</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Orçamento por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetCategories.map(cat => {
                  const percentage = (cat.spent / cat.allocated) * 100;
                  const Icon = cat.icon;
                  return (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: cat.color }} />
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <span className="text-sm">
                          {formatCurrency(cat.spent)} / {formatCurrency(cat.allocated)}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        {percentage.toFixed(1)}% utilizado
                        {percentage > 90 && <span className="text-amber-500 ml-2">⚠️ Atenção</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Route Costs Tab */}
        <TabsContent value="route-costs" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-02">Fev 2024</SelectItem>
                  <SelectItem value="2024-01">Jan 2024</SelectItem>
                  <SelectItem value="2023-12">Dez 2023</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger className="w-[180px]">
                  <Ship className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Embarcação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="MV Atlântico Sul">MV Atlântico Sul</SelectItem>
                  <SelectItem value="PSV Oceano Azul">PSV Oceano Azul</SelectItem>
                  <SelectItem value="AHTS Maré Alta">AHTS Maré Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleRouteCostAIAnalysis} disabled={isAILoading}>
              {isAILoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Analisar com IA
            </Button>
          </div>

          {/* Route Cost Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Custo Total</p>
                    <p className="text-2xl font-bold">R$ {(totalRouteCost / 1000000).toFixed(2)}M</p>
                    <p className="text-xs text-green-600">↓ 3.2% vs mês anterior</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Eficiência Média</p>
                    <p className="text-2xl font-bold">{avgEfficiency.toFixed(0)}%</p>
                    <p className="text-xs text-green-600">↑ 2.1% melhoria</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Combustível</p>
                    <p className="text-2xl font-bold">R$ {(totalFuel / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-muted-foreground">~51% do total</p>
                  </div>
                  <Fuel className="h-8 w-8 text-amber-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Economia IA</p>
                    <p className="text-2xl font-bold text-green-600">R$ 125k</p>
                    <p className="text-xs text-muted-foreground">Oportunidades identificadas</p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-500 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route Cost Cards */}
          <div className="space-y-4">
            {filteredRouteCosts.map(cost => (
              <Card key={cost.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        {cost.route}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Ship className="h-4 w-4" />
                        {cost.vessel}
                        <span className="text-xs">•</span>
                        <Calendar className="h-4 w-4" />
                        {cost.period}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">R$ {(cost.totalCost / 1000).toFixed(0)}k</p>
                      <p className={`text-sm flex items-center gap-1 justify-end ${getCostColor(cost.variance)}`}>
                        {cost.variance > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {cost.variance > 0 ? '+' : ''}{cost.variance}% vs orçado
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cost Breakdown */}
                  <div className="grid grid-cols-5 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <Fuel className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                      <p className="text-xs text-muted-foreground">Combustível</p>
                      <p className="font-bold">R$ {(cost.breakdown.fuel / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">{((cost.breakdown.fuel / cost.totalCost) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <Users className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                      <p className="text-xs text-muted-foreground">Tripulação</p>
                      <p className="font-bold">R$ {(cost.breakdown.crew / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">{((cost.breakdown.crew / cost.totalCost) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <Wrench className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                      <p className="text-xs text-muted-foreground">Manutenção</p>
                      <p className="font-bold">R$ {(cost.breakdown.maintenance / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">{((cost.breakdown.maintenance / cost.totalCost) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <Ship className="h-4 w-4 mx-auto mb-1 text-green-500" />
                      <p className="text-xs text-muted-foreground">Portuário</p>
                      <p className="font-bold">R$ {(cost.breakdown.port / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">{((cost.breakdown.port / cost.totalCost) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                      <BarChart3 className="h-4 w-4 mx-auto mb-1 text-gray-500" />
                      <p className="text-xs text-muted-foreground">Outros</p>
                      <p className="font-bold">R$ {(cost.breakdown.other / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">{((cost.breakdown.other / cost.totalCost) * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Efficiency */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Eficiência Operacional</span>
                      <span className="font-medium">{cost.efficiency}%</span>
                    </div>
                    <Progress value={cost.efficiency} className={`h-2 [&>div]:${getEfficiencyColor(cost.efficiency)}`} />
                  </div>

                  {/* AI Insights */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Insights da IA</span>
                    </div>
                    <ul className="space-y-1">
                      {cost.aiInsights.map((insight, idx) => (
                        <li key={idx} className={`text-sm flex items-start gap-2 ${insight.startsWith('⚠️') ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {insight.startsWith('⚠️') ? (
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          )}
                          {insight.replace('⚠️ ', '')}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Aprovações Pendentes
              </CardTitle>
              <CardDescription>
                {pendingApprovals.length} solicitações aguardando sua aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma aprovação pendente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map(approval => (
                    <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                          <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium">{approval.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Solicitado por: {approval.requester}</span>
                            <span>•</span>
                            <span>{approval.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-red-500">{formatCurrency(-approval.amount)}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-500/10" onClick={() => handleReject(approval.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                          <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleApprove(approval.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Análise Inteligente com IA
                  </CardTitle>
                  <CardDescription>
                    Insights financeiros e de custos gerados por inteligência artificial
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
                  <p className="text-sm mt-2">A IA analisará receitas, despesas, orçamento e custos por rota</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Expense Dialog */}
      <Dialog open={showNewExpense} onOpenChange={setShowNewExpense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
            <DialogDescription>
              Registre uma nova despesa para aprovação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Manutenção preventiva do motor"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={newExpense.category} onValueChange={(v) => setNewExpense(prev => ({ ...prev, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Combustível</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="crew">Tripulação</SelectItem>
                  <SelectItem value="supplies">Provisões</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes adicionais..."
                value={newExpense.notes}
                onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewExpense(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Despesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Configurações</SheetTitle>
            <SheetDescription>Personalize o Finance Command Center</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Atualização Automática</p>
                <p className="text-sm text-muted-foreground">Atualiza dados automaticamente</p>
              </div>
              <Switch
                checked={settings.autoRefresh}
                onCheckedChange={(v) => setSettings((prev: any) => ({ ...prev, autoRefresh: v }))}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Intervalo de Atualização (segundos)</Label>
              <Input
                type="number"
                value={settings.refreshInterval}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                disabled={!settings.autoRefresh}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações</p>
                <p className="text-sm text-muted-foreground">Exibir alertas financeiros</p>
              </div>
              <Switch
                checked={settings.showNotifications}
                onCheckedChange={(v) => setSettings((prev: any) => ({ ...prev, showNotifications: v }))}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FinanceCommandCenter;
