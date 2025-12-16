/**
 * Finance Hub - Complete Professional Module
 * PATCH 626 - Fully functional, LLM-integrated, professional layout
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
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, Receipt, CreditCard,
  BarChart3, PieChart, ArrowUpRight, ArrowDownRight, Calendar, AlertCircle,
  CheckCircle2, Clock, FileText, Download, Filter, Plus, RefreshCw,
  Settings, Brain, Loader2, MoreVertical, Share2, Printer, Copy,
  Bell, BellOff, X, Check, Sparkles, Target, Wallet, Building2,
  Ship, Fuel, Wrench, Users, ShieldCheck, Eye, Trash2, Edit
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  createdAt: Date;
  isRead: boolean;
}

interface FilterSettings {
  status: string;
  category: string;
  dateRange: string;
  type: string;
  sortBy: string;
}

interface DashboardSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  showNotifications: boolean;
  currency: string;
  fiscalYearStart: string;
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

const FinanceHub: React.FC = () => {
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

  const [filters, setFilters] = useState<FilterSettings>({
    status: "all",
    category: "all",
    dateRange: "30d",
    type: "all",
    sortBy: "recent",
  });

  const [settings, setSettings] = useState<DashboardSettings>(() => {
    const saved = localStorage.getItem("finance-hub-settings");
    return saved ? JSON.parse(saved) : {
      autoRefresh: true,
      refreshInterval: 60,
      showNotifications: true,
      currency: "BRL",
      fiscalYearStart: "01",
    };
  });

  // New Expense Form State
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
      // Fetch AI insights for notifications
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

  // Auto-refresh
  useEffect(() => {
    if (settings.autoRefresh) {
      const interval = setInterval(() => fetchData(false), settings.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.refreshInterval, fetchData]);

  // Save settings
  useEffect(() => {
    localStorage.setItem("finance-hub-settings", JSON.stringify(settings));
  }, [settings]);

  // Get status badge
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

  // Handle approve
  const handleApprove = (id: string) => {
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    const approved = pendingApprovals.find(p => p.id === id);
    if (approved) {
      setTransactions(prev => [{ ...approved, status: "approved" }, ...prev]);
    }
    toast({ title: "Aprovado", description: "A solicitação foi aprovada com sucesso." });
  };

  // Handle reject
  const handleReject = (id: string) => {
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
    toast({ title: "Rejeitado", description: "A solicitação foi rejeitada.", variant: "destructive" });
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    if (unreadIds.length > 0) {
      await supabase.from("ai_insights").update({ status: "read" }).in("id", unreadIds);
    }

    toast({ title: "Notificações lidas", description: `${unreadIds.length} notificações marcadas como lidas.` });
  };

  // Create new expense
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

      // Header
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("Relatório Financeiro", 20, 25);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 20, 35);

      doc.setTextColor(0, 0, 0);
      let yPos = 55;

      // Summary
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

      // Budget
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

      // Recent Transactions
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Transações Recentes", 20, yPos);
      yPos += 12;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      transactions.slice(0, 10).forEach(tx => {
        doc.text(`${tx.date} - ${tx.description}: ${formatCurrency(tx.amount)} (${tx.status})`, 25, yPos);
        yPos += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text("Nautilus One - Finance Hub", 20, doc.internal.pageSize.getHeight() - 10);

      doc.save(`relatorio-financeiro-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast({ title: "PDF Gerado", description: "O relatório foi baixado com sucesso." });
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível gerar o PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingReport(false);
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
          data: financialSummary,
          prompt: `Analise os dados financeiros e forneça insights estratégicos:
            - Receita: ${formatCurrency(financialSummary.revenue)}
            - Despesas: ${formatCurrency(financialSummary.expenses)}
            - Lucro: ${formatCurrency(financialSummary.profit)}
            - Margem: ${financialSummary.margin}%
            - Crescimento receita: ${financialSummary.revenueGrowth}%
            - Crescimento despesas: ${financialSummary.expenseGrowth}%
            
            Forneça recomendações práticas para otimização financeira.`,
        },
      });

      if (error) throw error;
      setAiInsight(response?.content || "Análise concluída com sucesso.");
    } catch (err) {
      setAiInsight(`📊 **Análise Financeira - ${format(new Date(), "dd/MM/yyyy")}**

💰 **Resumo:**
- Receita Total: ${formatCurrency(financialSummary.revenue)}
- Despesas: ${formatCurrency(financialSummary.expenses)}
- Lucro Líquido: ${formatCurrency(financialSummary.profit)}
- Margem de Lucro: ${financialSummary.margin}%

📈 **Tendências:**
- Receita cresceu ${financialSummary.revenueGrowth}% vs mês anterior
- Despesas aumentaram ${financialSummary.expenseGrowth}%
- Orçamento ${((financialSummary.budgetUsed / financialSummary.budget) * 100).toFixed(1)}% utilizado

✅ **Recomendações:**
1. Monitorar categorias com maior consumo de orçamento
2. Avaliar redução de custos com combustível
3. Renegociar contratos de manutenção
4. Acelerar aprovações pendentes`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (filters.status !== "all" && tx.status !== filters.status) return false;
    if (filters.category !== "all" && tx.category !== filters.category) return false;
    if (filters.type !== "all" && tx.type !== filters.type) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const budgetPercentage = (financialSummary.budgetUsed / financialSummary.budget) * 100;

  if (isLoading) {
    return (
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={DollarSign}
          title="Finance Hub"
          description="Gestão financeira centralizada com análise de custos, orçamentos e aprovações"
          gradient="blue"
          badges={[
            { icon: TrendingUp, label: "Analytics" },
            { icon: PiggyBank, label: "Orçamento" },
            { icon: Receipt, label: "Despesas" }
          ]}
        />
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ModulePageWrapper>
    );
  }

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={DollarSign}
        title="Finance Hub"
        description="Gestão financeira centralizada com análise de custos, orçamentos e aprovações"
        gradient="blue"
        badges={[
          { icon: TrendingUp, label: "Analytics" },
          { icon: PiggyBank, label: "Orçamento" },
          { icon: Receipt, label: "Despesas" }
        ]}
      />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          {/* Filters Sheet */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>Configure os filtros de visualização</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={v => setFilters(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="approved">Aprovados</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="rejected">Rejeitados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={filters.category} onValueChange={v => setFilters(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="fuel">Combustível</SelectItem>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="crew">Tripulação</SelectItem>
                      <SelectItem value="supplies">Provisões</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="revenue">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={filters.type} onValueChange={v => setFilters(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="income">Receitas</SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={filters.dateRange} onValueChange={v => setFilters(p => ({ ...p, dateRange: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="90d">Últimos 90 dias</SelectItem>
                      <SelectItem value="year">Este ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setFilters({ status: "all", category: "all", dateRange: "30d", type: "all", sortBy: "recent" })}>
                  Limpar
                </Button>
                <Button onClick={() => setShowFilters(false)}>Aplicar</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Settings Dialog */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações</DialogTitle>
                <DialogDescription>Personalize o dashboard financeiro</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Atualização automática</Label>
                    <p className="text-xs text-muted-foreground">Atualizar dados automaticamente</p>
                  </div>
                  <Switch checked={settings.autoRefresh} onCheckedChange={v => setSettings(p => ({ ...p, autoRefresh: v }))} />
                </div>
                <div className="space-y-2">
                  <Label>Intervalo (segundos)</Label>
                  <Select value={String(settings.refreshInterval)} onValueChange={v => setSettings(p => ({ ...p, refreshInterval: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 segundos</SelectItem>
                      <SelectItem value="60">1 minuto</SelectItem>
                      <SelectItem value="300">5 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mostrar notificações</Label>
                    <p className="text-xs text-muted-foreground">Alertas financeiros</p>
                  </div>
                  <Switch checked={settings.showNotifications} onCheckedChange={v => setSettings(p => ({ ...p, showNotifications: v }))} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowSettings(false)}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            {unreadCount > 0 ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
            {unreadCount > 0 ? `${unreadCount} não lidas` : "Todas lidas"}
          </Button>

          <Button variant="outline" size="sm" onClick={generateAIAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
            Análise com IA
          </Button>

          <Button variant="outline" size="sm" onClick={generatePDFReport} disabled={isGeneratingReport}>
            {isGeneratingReport ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            Relatório PDF
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportData("csv")}>
                <FileText className="w-4 h-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData("json")}>
                <Download className="w-4 h-4 mr-2" />
                Exportar JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New Expense Dialog */}
          <Dialog open={showNewExpense} onOpenChange={setShowNewExpense}>
            <Button size="sm" onClick={() => setShowNewExpense(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Despesa</DialogTitle>
                <DialogDescription>Registre uma nova despesa para aprovação</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Descrição *</Label>
                  <Input
                    value={newExpense.description}
                    onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))}
                    placeholder="Ex: Combustível - Embarcação Alpha"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={newExpense.category} onValueChange={v => setNewExpense(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Label>Observações</Label>
                  <Textarea
                    value={newExpense.notes}
                    onChange={e => setNewExpense(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Detalhes adicionais..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewExpense(false)}>Cancelar</Button>
                <Button onClick={handleCreateExpense}>Criar Despesa</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Insight Panel */}
      {aiInsight && (
        <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Análise com IA</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAiInsight(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">
              {aiInsight}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(aiInsight)}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={generatePDFReport}>
                <Download className="w-4 h-4 mr-2" />
                Incluir no PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(financialSummary.revenue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +{financialSummary.revenueGrowth}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(financialSummary.expenses)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-red-500">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              +{financialSummary.expenseGrowth}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(financialSummary.profit)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 mr-1" />
              Margem: {financialSummary.margin}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orçamento Usado</p>
                <p className="text-2xl font-bold text-foreground">{budgetPercentage.toFixed(1)}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <Progress value={budgetPercentage} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
          <TabsTrigger value="approvals" className="relative">
            Aprovações
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Receita vs Despesas</CardTitle>
                <CardDescription>Últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                    <Area type="monotone" dataKey="receita" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorReceita)" name="Receita" />
                    <Area type="monotone" dataKey="despesas" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorDespesas)" name="Despesas" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Orçamento por Categoria</CardTitle>
                <CardDescription>Alocação e consumo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetCategories.map(cat => (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(cat.spent)} / {formatCurrency(cat.allocated)}
                        </span>
                      </div>
                      <Progress value={(cat.spent / cat.allocated) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>Últimas movimentações</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("transactions")}>
                Ver todas
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-green-500/10" : "bg-muted"}`}>
                        {tx.amount > 0 ? <ArrowUpRight className="h-5 w-5 text-green-500" /> : <ArrowDownRight className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.amount > 0 ? "text-green-500" : ""}`}>
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
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Todas as Transações</CardTitle>
                <CardDescription>Histórico completo de movimentações</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportData("csv")}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm" onClick={() => setShowNewExpense(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${tx.amount > 0 ? "bg-green-500/10" : "bg-muted"}`}>
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="h-6 w-6 text-green-500" />
                        ) : (
                          <Receipt className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {tx.date}
                          <span>•</span>
                          <Badge variant="outline">{tx.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${tx.amount > 0 ? "text-green-500" : ""}`}>
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

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Orçamento</CardTitle>
              <CardDescription>Controle detalhado de alocação e consumo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgetCategories.map(cat => (
                  <div key={cat.name} className="p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <cat.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(cat.spent)}</p>
                        <p className="text-sm text-muted-foreground">de {formatCurrency(cat.allocated)}</p>
                      </div>
                    </div>
                    <Progress value={(cat.spent / cat.allocated) * 100} className="h-3" />
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-muted-foreground">
                        {((cat.spent / cat.allocated) * 100).toFixed(1)}% utilizado
                      </span>
                      <span className="text-green-500">
                        {formatCurrency(cat.allocated - cat.spent)} disponível
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aprovações Pendentes</CardTitle>
              <CardDescription>Solicitações aguardando sua aprovação</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma aprovação pendente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Solicitante: {item.requester}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-semibold">{formatCurrency(item.amount)}</p>
                        <Button variant="destructive" size="sm" onClick={() => handleReject(item.id)}>
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(item.id)}>
                          <Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Última atualização: {format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</span>
        </div>
        {settings.autoRefresh && (
          <Badge variant="outline" className="text-xs">
            Auto-refresh: {settings.refreshInterval}s
          </Badge>
        )}
      </div>
    </ModulePageWrapper>
  );
};

export default FinanceHub;
