/**
 * Finance Command Dashboard - Premium Financial Control Center
 * Centro de Comando Financeiro Completo
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DollarSign, TrendingUp, TrendingDown, PiggyBank, Receipt, 
  CreditCard, BarChart3, ArrowUpRight, ArrowDownRight, Calendar,
  AlertCircle, CheckCircle2, Clock, FileText, Download, Plus,
  Brain, Sparkles, Ship, Fuel, Wrench, Users, Wallet, Building2,
  Target, Search, Filter, ArrowRight, RefreshCw, Eye, Bell
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// Mock data
const cashFlowData = [
  { month: "Jan", receitas: 4200000, despesas: 3100000 },
  { month: "Fev", receitas: 3800000, despesas: 2900000 },
  { month: "Mar", receitas: 5100000, despesas: 3400000 },
  { month: "Abr", receitas: 4600000, despesas: 3200000 },
  { month: "Mai", receitas: 5500000, despesas: 3800000 },
  { month: "Jun", receitas: 4900000, despesas: 3500000 },
];

const budgetAllocation = [
  { name: "Combustível", value: 35, color: "#f59e0b" },
  { name: "Tripulação", value: 25, color: "#3b82f6" },
  { name: "Manutenção", value: 20, color: "#10b981" },
  { name: "Porto/Operações", value: 15, color: "#8b5cf6" },
  { name: "Outros", value: 5, color: "#6b7280" },
];

const pendingApprovals = [
  { id: "1", description: "Reposição de Peças - Motor Principal", amount: 125000, requester: "Eng. Carlos", category: "Manutenção", priority: "high", date: "2026-02-03" },
  { id: "2", description: "Combustível - Bunker Santos", amount: 450000, requester: "Op. Marina", category: "Combustível", priority: "high", date: "2026-02-02" },
  { id: "3", description: "Treinamento STCW - Equipe Deck", amount: 28000, requester: "RH João", category: "Treinamento", priority: "normal", date: "2026-02-01" },
  { id: "4", description: "Certificação Equipamentos Salvatagem", amount: 45000, requester: "Seg. Pedro", category: "Compliance", priority: "normal", date: "2026-02-01" },
];

const recentTransactions = [
  { id: "1", description: "Receita Afretamento - Petrobras", amount: 1250000, type: "income", status: "approved", date: "2026-02-04" },
  { id: "2", description: "Pagamento Tripulação - Jan/26", amount: -850000, type: "expense", status: "approved", date: "2026-02-01" },
  { id: "3", description: "Manutenção Preventiva - MV Atlântico", amount: -125000, type: "expense", status: "pending", date: "2026-01-31" },
  { id: "4", description: "Reembolso Seguro P&I", amount: 75000, type: "income", status: "approved", date: "2026-01-30" },
];

const aiInsights = [
  { id: "1", type: "optimization", message: "Oportunidade de economia de 12% em combustível com otimização de rotas", priority: "high", action: "Ver análise", savings: 156000 },
  { id: "2", type: "forecast", message: "Previsão de aumento de 8% nos custos de manutenção no Q2", priority: "warning", action: "Ver projeção" },
  { id: "3", type: "alert", message: "3 contratos de afretamento vencem nos próximos 60 dias", priority: "info", action: "Ver contratos" },
];

const vesselCosts = [
  { vessel: "MV Atlântico Sul", opex: 1850000, efficiency: 92, trend: "up", variance: -3.2 },
  { vessel: "MV Horizonte", opex: 1620000, efficiency: 88, trend: "down", variance: 5.1 },
  { vessel: "MV Oceano", opex: 2100000, efficiency: 85, trend: "stable", variance: 1.2 },
  { vessel: "MV Pacífico", opex: 1750000, efficiency: 94, trend: "up", variance: -4.5 },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    high: { label: "Urgente", className: "bg-destructive/10 text-destructive border-destructive/20" },
    normal: { label: "Normal", className: "bg-primary/10 text-primary border-primary/20" },
    low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
  };
  const variant = variants[priority] || variants.normal;
  return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
}

export default function FinanceCommandDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleApproval = (id: string, approved: boolean) => {
    toast.success(approved ? "Aprovação registrada com sucesso" : "Solicitação rejeitada");
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-l-4 border-l-success hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Receita Mensal</p>
                  <p className="text-xl font-bold text-success">R$ 4.9M</p>
                  <div className="flex items-center gap-1 text-xs text-success">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>+12.5%</span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-destructive hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Despesas Mensal</p>
                  <p className="text-xl font-bold text-destructive">R$ 3.5M</p>
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <ArrowDownRight className="h-3 w-3" />
                    <span>-2.3%</span>
                  </div>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Margem</p>
                  <p className="text-xl font-bold">28.6%</p>
                  <p className="text-xs text-muted-foreground">EBITDA</p>
                </div>
                <PiggyBank className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-warning hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Aprovações</p>
                  <p className="text-xl font-bold text-warning">{pendingApprovals.length}</p>
                  <p className="text-xs">Pendentes</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">OPEX/Navio</p>
                  <p className="text-xl font-bold text-purple-600">R$ 1.83M</p>
                  <p className="text-xs">Média</p>
                </div>
                <Ship className="h-8 w-8 text-purple-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="text-xl font-bold text-cyan-600">87%</p>
                  <p className="text-xs">Utilizado</p>
                </div>
                <Target className="h-8 w-8 text-cyan-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Fluxo de Caixa
                  </CardTitle>
                  <CardDescription>Receitas vs Despesas - Últimos 6 meses</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  const csv = ["Mês;Receitas;Despesas", ...cashFlowData.map(d => `${d.month};${d.receitas};${d.despesas}`)].join('\n');
                  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `fluxo-caixa-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
                  toast.success("Fluxo de caixa exportado como CSV");
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Area type="monotone" dataKey="receitas" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} name="Receitas" />
                  <Area type="monotone" dataKey="despesas" stackId="2" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} name="Despesas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Insights IA Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[260px]">
              <div className="space-y-3">
                {aiInsights.map((insight) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${
                      insight.priority === "high" ? "border-success/50 bg-success/5" :
                      insight.priority === "warning" ? "border-warning/50 bg-warning/5" :
                      "border-primary/50 bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Brain className={`h-4 w-4 mt-0.5 ${
                        insight.priority === "high" ? "text-success" :
                        insight.priority === "warning" ? "text-warning" : "text-primary"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{insight.message}</p>
                        {insight.savings && (
                          <p className="text-xs text-success font-medium mt-1">
                            Economia potencial: {formatCurrency(insight.savings)}
                          </p>
                        )}
                        <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs gap-1 p-0" onClick={() => {
                          if (insight.type === 'optimization') toast.info("Análise de otimização de rotas em desenvolvimento. Economia estimada: " + formatCurrency(insight.savings || 0));
                          else if (insight.type === 'forecast') toast.info("Projeção Q2: aumento estimado de 8% nos custos de manutenção baseado em histórico");
                          else toast.info("Navegue à aba Contratos para ver contratos próximos do vencimento");
                        }}>
                          {insight.action}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Aprovações Pendentes
              </CardTitle>
              <Badge variant="secondary">{pendingApprovals.length} pendentes</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{item.description}</p>
                          <PriorityBadge priority={item.priority} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.requester} • {item.category} • {item.date}
                        </p>
                        <p className="font-bold text-lg mt-2">{formatCurrency(item.amount)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1"
                        onClick={() => handleApproval(item.id, true)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 gap-1"
                        onClick={() => handleApproval(item.id, false)}
                      >
                        Rejeitar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(`${item.description} | Solicitante: ${item.requester} | Categoria: ${item.category} | Data: ${item.date}`); toast.success("Detalhes copiados"); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Vessel OPEX Comparison */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                OPEX por Embarcação
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => { window.dispatchEvent(new Event('finance:refresh')); }} aria-label="Atualizar dados OPEX" title="Atualizar">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {vesselCosts.map((vessel, idx) => (
                  <motion.div
                    key={vessel.vessel}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vessel.vessel}</p>
                        <p className="text-lg font-bold mt-1">{formatCurrency(vessel.opex)}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Eficiência</span>
                          <Badge variant={vessel.efficiency >= 90 ? "default" : vessel.efficiency >= 80 ? "secondary" : "destructive"}>
                            {vessel.efficiency}%
                          </Badge>
                        </div>
                        <div className={`flex items-center gap-1 text-xs mt-1 ${
                          vessel.variance < 0 ? "text-success" : "text-destructive"
                        }`}>
                          {vessel.variance < 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                          {Math.abs(vessel.variance)}% vs budget
                        </div>
                      </div>
                    </div>
                    <Progress value={vessel.efficiency} className="h-1.5 mt-3" />
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Transações Recentes
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar transação..." 
                  className="pl-8 h-8 w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => {
                const csv = ["Descrição;Valor;Tipo;Status;Data", ...recentTransactions.map(t => `${t.description};${t.amount};${t.type};${t.status};${t.date}`)].join('\n');
                const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `transacoes-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
                toast.success("Transações exportadas como CSV");
              }}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm" className="gap-2" onClick={() => { window.history.pushState({}, '', '/finance-hub?tab=transactions'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
                <Plus className="h-4 w-4" />
                Nova
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === "income" ? "bg-success/10" : "bg-destructive/10"}`}>
                    {tx.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-bold ${tx.amount >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency(Math.abs(tx.amount))}
                  </p>
                  <Badge variant={tx.status === "approved" ? "default" : "secondary"}>
                    {tx.status === "approved" ? "Aprovado" : "Pendente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
