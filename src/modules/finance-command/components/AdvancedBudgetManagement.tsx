/**
 * Advanced Budget Management - Gestão Orçamentária Avançada
 * Planejamento financeiro, previsões e análises
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart, 
  BarChart3, Calendar, Target, AlertTriangle, 
  CheckCircle2, Plus, Download, Filter, ArrowUpRight,
  ArrowDownRight, Wallet, CreditCard, Building2,
  Ship, Fuel, Users, Wrench, FileText, Brain, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, Legend } from "recharts";

const monthlyBudgetData = [
  { month: "Jan", budget: 450000, actual: 420000, forecast: 425000 },
  { month: "Fev", budget: 450000, actual: 465000, forecast: 455000 },
  { month: "Mar", budget: 480000, actual: 445000, forecast: 460000 },
  { month: "Abr", budget: 480000, actual: 490000, forecast: 485000 },
  { month: "Mai", budget: 500000, actual: 475000, forecast: 480000 },
  { month: "Jun", budget: 500000, actual: null, forecast: 495000 },
];

const categoryBreakdown = [
  { name: "Combustível", value: 35, amount: 175000, color: "#f59e0b", trend: 5 },
  { name: "Tripulação", value: 25, amount: 125000, color: "#3b82f6", trend: -2 },
  { name: "Manutenção", value: 18, amount: 90000, color: "#10b981", trend: 8 },
  { name: "Porto & Taxas", value: 12, amount: 60000, color: "#8b5cf6", trend: 0 },
  { name: "Seguros", value: 7, amount: 35000, color: "#ec4899", trend: 3 },
  { name: "Outros", value: 3, amount: 15000, color: "#6b7280", trend: -1 },
];

const vesselBudgets = [
  { vessel: "MV Atlantic Star", budget: 500000, spent: 425000, remaining: 75000, status: "on-track" },
  { vessel: "MV Pacific Dream", budget: 480000, spent: 510000, remaining: -30000, status: "over-budget" },
  { vessel: "MV Caribbean Sun", budget: 520000, spent: 390000, remaining: 130000, status: "under-budget" },
  { vessel: "MV Northern Light", budget: 450000, spent: 445000, remaining: 5000, status: "at-risk" },
];

const pendingApprovals = [
  { id: 1, type: "Manutenção", description: "Reparo de motor principal", amount: 45000, vessel: "MV Atlantic Star", priority: "high" },
  { id: 2, type: "Suprimentos", description: "Reabastecimento de provisões", amount: 12000, vessel: "MV Pacific Dream", priority: "medium" },
  { id: 3, type: "Equipamento", description: "Atualização sistema navegação", amount: 28000, vessel: "MV Caribbean Sun", priority: "low" },
];

export default function AdvancedBudgetManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");
  const [selectedVessel, setSelectedVessel] = useState("all");

  const totalBudget = 2850000;
  const totalSpent = 1770000;
  const totalRemaining = totalBudget - totalSpent;
  const spentPercentage = (totalSpent / totalBudget) * 100;

  return (
    <div className="space-y-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Orçamento Total</p>
                  <p className="text-2xl font-bold">$2.85M</p>
                  <p className="text-xs text-muted-foreground">Ano 2024</p>
                </div>
                <Wallet className="h-8 w-8 text-primary opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Gasto YTD</p>
                  <p className="text-2xl font-bold">$1.77M</p>
                  <p className="text-xs flex items-center gap-1 text-warning">
                    <ArrowUpRight className="h-3 w-3" />
                    62% utilizado
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-amber-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-success/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Saldo Disponível</p>
                  <p className="text-2xl font-bold text-success">$1.08M</p>
                  <p className="text-xs text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    38% restante
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-success opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Previsão Anual</p>
                  <p className="text-2xl font-bold">$2.92M</p>
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +2.5% sobre budget
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={pendingApprovals.length > 0 ? "border-warning/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Aprovações</p>
                  <p className="text-2xl font-bold text-warning">{pendingApprovals.length}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <FileText className="h-8 w-8 text-warning opacity-60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">YTD</SelectItem>
              <SelectItem value="q1">Q1 2024</SelectItem>
              <SelectItem value="q2">Q2 2024</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-48">
              <Ship className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Navios</SelectItem>
              {vesselBudgets.map(v => (
                <SelectItem key={v.vessel} value={v.vessel}>{v.vessel}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Alocação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget vs Actual Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Orçamento vs Realizado
            </CardTitle>
            <CardDescription>Acompanhamento mensal com previsão</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyBudgetData}>
                  <defs>
                    <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="budget" 
                    stroke="#6366f1" 
                    fillOpacity={1} 
                    fill="url(#colorBudget)" 
                    strokeWidth={2}
                    name="Orçamento"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#colorActual)" 
                    strokeWidth={2}
                    name="Realizado"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#f59e0b" 
                    strokeDasharray="5 5"
                    fill="none"
                    strokeWidth={2}
                    name="Previsão"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-sm">Orçamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-sm">Realizado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-warning" />
                <span className="text-sm">Previsão</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Por Categoria
            </CardTitle>
            <CardDescription>Distribuição de gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {categoryBreakdown.slice(0, 4).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${(cat.amount/1000).toFixed(0)}K</span>
                    {cat.trend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-destructive" />
                    ) : cat.trend < 0 ? (
                      <TrendingDown className="h-3 w-3 text-success" />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vessel Budgets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Orçamento por Navio
            </CardTitle>
            <CardDescription>Status de utilização individual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vesselBudgets.map((vessel, index) => (
                <motion.div
                  key={vessel.vessel}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{vessel.vessel}</span>
                    </div>
                    <Badge variant={
                      vessel.status === "on-track" ? "outline" :
                      vessel.status === "over-budget" ? "destructive" :
                      vessel.status === "under-budget" ? "secondary" : "secondary"
                    } className={
                      vessel.status === "on-track" ? "border-success text-success" :
                      vessel.status === "under-budget" ? "bg-success/10 text-success" : ""
                    }>
                      {vessel.status === "on-track" ? "No prazo" :
                       vessel.status === "over-budget" ? "Acima" :
                       vessel.status === "under-budget" ? "Economia" : "Atenção"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${(vessel.spent/1000).toFixed(0)}K / ${(vessel.budget/1000).toFixed(0)}K
                      </span>
                      <span className={vessel.remaining < 0 ? "text-destructive font-medium" : "text-success"}>
                        {vessel.remaining >= 0 ? "+" : ""}{(vessel.remaining/1000).toFixed(0)}K
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((vessel.spent / vessel.budget) * 100, 100)} 
                      className={`h-2 ${
                        vessel.status === "over-budget" ? "[&>div]:bg-destructive" :
                        vessel.status === "at-risk" ? "[&>div]:bg-warning" : ""
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-warning" />
              Aprovações Pendentes
            </CardTitle>
            <CardDescription>Solicitações aguardando análise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        <Badge variant={
                          item.priority === "high" ? "destructive" :
                          item.priority === "medium" ? "secondary" : "outline"
                        } className="text-xs">
                          {item.priority === "high" ? "Urgente" :
                           item.priority === "medium" ? "Normal" : "Baixa"}
                        </Badge>
                      </div>
                      <p className="font-medium mt-1">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.vessel}</p>
                    </div>
                    <p className="text-lg font-bold">${item.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      Detalhes
                    </Button>
                    <Button size="sm" className="flex-1">
                      Aprovar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-purple-500/5 via-background to-blue-500/5 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Insights Financeiros IA
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              Análise Preditiva
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Fuel className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Alerta Combustível</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Preços de bunker podem subir 8% no próximo mês. Considere antecipar compras.
                    </p>
                    <Button size="sm" className="mt-3" variant="outline">
                      Ver Análise
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <TrendingDown className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium">Oportunidade Economia</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Consolidar manutenções de 3 navios em Santos pode economizar $15K.
                    </p>
                    <Button size="sm" className="mt-3" variant="outline">
                      Simular
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-medium">Risco Orçamentário</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      MV Pacific Dream projetado 6% acima do budget no Q3. Ação recomendada.
                    </p>
                    <Button size="sm" className="mt-3" variant="outline">
                      Revisar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
