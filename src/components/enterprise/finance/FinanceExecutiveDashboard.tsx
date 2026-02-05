/**
 * Finance Executive Dashboard
 * Dashboard executivo consolidado com métricas financeiras
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, TrendingUp, TrendingDown, PieChart,
  BarChart3, ArrowUpRight, ArrowDownRight, Ship,
  FileText, AlertTriangle, CheckCircle2, Calendar,
  Target, Wallet, CreditCard, Receipt
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 2400000, costs: 1800000, profit: 600000 },
  { month: "Feb", revenue: 2100000, costs: 1650000, profit: 450000 },
  { month: "Mar", revenue: 2800000, costs: 2100000, profit: 700000 },
  { month: "Apr", revenue: 3200000, costs: 2400000, profit: 800000 },
  { month: "May", revenue: 2900000, costs: 2200000, profit: 700000 },
  { month: "Jun", revenue: 3500000, costs: 2600000, profit: 900000 }
];

const vesselPerformance = [
  { vessel: "MV Atlantic Star", revenue: 4500000, costs: 3200000, margin: 28.9, voyages: 8 },
  { vessel: "MV Pacific Dream", revenue: 6200000, costs: 4800000, margin: 22.6, voyages: 12 },
  { vessel: "MV Nordic Wind", revenue: 3800000, costs: 2900000, margin: 23.7, voyages: 6 },
  { vessel: "MV Southern Cross", revenue: 5100000, costs: 3600000, margin: 29.4, voyages: 9 }
];

const pendingItems = [
  { type: "invoice", title: "Fatura #INV-2024-156", amount: 125000, dueDate: "2024-02-15", status: "overdue" },
  { type: "approval", title: "PR-2024-089 - Motor Parts", amount: 89000, dueDate: "2024-02-10", status: "pending" },
  { type: "payment", title: "Bunker Singapore", amount: 450000, dueDate: "2024-02-12", status: "due_soon" },
  { type: "invoice", title: "Fatura #INV-2024-152", amount: 78000, dueDate: "2024-02-08", status: "overdue" }
];

const budgetCategories = [
  { name: "Combustível", budget: 8000000, spent: 7200000, percentage: 90 },
  { name: "Tripulação", budget: 3500000, spent: 2800000, percentage: 80 },
  { name: "Manutenção", budget: 2500000, spent: 1950000, percentage: 78 },
  { name: "Portos", budget: 1800000, spent: 1620000, percentage: 90 },
  { name: "Seguros", budget: 1200000, spent: 1100000, percentage: 92 }
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
};

const formatFullCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0
  }).format(value);
};

export function FinanceExecutiveDashboard() {
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalCosts = revenueData.reduce((sum, d) => sum + d.costs, 0);
  const totalProfit = totalRevenue - totalCosts;
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  const lastMonth = revenueData[revenueData.length - 1];
  const prevMonth = revenueData[revenueData.length - 2];
  const revenueGrowth = ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Receita YTD</p>
                <p className="text-3xl font-bold text-green-800 dark:text-green-300 mt-1">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+{revenueGrowth}%</span>
                  <span className="text-xs text-green-600/70">vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Custos YTD</p>
                <p className="text-3xl font-bold text-red-800 dark:text-red-300 mt-1">
                  {formatCurrency(totalCosts)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">-3.2%</span>
                  <span className="text-xs text-muted-foreground">vs orçado</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-red-500/20">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Lucro Líquido</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-300 mt-1">
                  {formatCurrency(totalProfit)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{profitMargin}%</span>
                  <span className="text-xs text-muted-foreground">margem</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-400">Cash Flow</p>
                <p className="text-3xl font-bold text-purple-800 dark:text-purple-300 mt-1">
                  {formatCurrency(2850000)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Wallet className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">45 dias</span>
                  <span className="text-xs text-muted-foreground">runway</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Evolução Financeira
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50">Receita</Badge>
                <Badge variant="outline" className="bg-red-50">Custos</Badge>
                <Badge variant="outline" className="bg-blue-50">Lucro</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)} 
                    className="text-xs"
                  />
                  <Tooltip 
                    formatter={(value: number) => formatFullCurrency(value)}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.2}
                    name="Receita"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costs" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.1}
                    name="Custos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Lucro"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Ações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingItems.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {item.type === "invoice" ? <Receipt className="h-4 w-4 text-blue-600 mt-0.5" /> :
                     item.type === "approval" ? <FileText className="h-4 w-4 text-purple-600 mt-0.5" /> :
                     <CreditCard className="h-4 w-4 text-green-600 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence: {new Date(item.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={item.status === "overdue" ? "destructive" : "secondary"} className="text-xs">
                    {item.status === "overdue" ? "Vencido" : 
                     item.status === "due_soon" ? "Próximo" : "Pendente"}
                  </Badge>
                </div>
                <p className="text-sm font-bold text-right mt-2">{formatFullCurrency(item.amount)}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2">Ver Todas</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vessel Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Performance por Embarcação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vesselPerformance.map((vessel, idx) => (
                <div key={idx} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Ship className="h-4 w-4 text-primary" />
                      <span className="font-medium">{vessel.vessel}</span>
                    </div>
                    <Badge variant={vessel.margin >= 25 ? "default" : "secondary"}>
                      {vessel.margin}% margem
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Receita</p>
                      <p className="font-medium text-green-600">{formatCurrency(vessel.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Custos</p>
                      <p className="font-medium text-red-600">{formatCurrency(vessel.costs)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Viagens</p>
                      <p className="font-medium">{vessel.voyages}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Acompanhamento de Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetCategories.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {formatCurrency(cat.spent)} / {formatCurrency(cat.budget)}
                      </span>
                      <Badge 
                        variant={cat.percentage >= 90 ? "destructive" : cat.percentage >= 75 ? "secondary" : "outline"}
                        className="min-w-[50px] justify-center"
                      >
                        {cat.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={cat.percentage} 
                    className={`h-2 ${cat.percentage >= 90 ? "[&>div]:bg-red-500" : cat.percentage >= 75 ? "[&>div]:bg-yellow-500" : ""}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Total</p>
                  <p className="text-xl font-bold">{formatCurrency(17000000)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Utilizado</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(budgetCategories.reduce((sum, c) => sum + c.spent, 0))}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FinanceExecutiveDashboard;
