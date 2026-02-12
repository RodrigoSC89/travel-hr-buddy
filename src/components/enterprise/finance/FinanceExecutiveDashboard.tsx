/**
 * Finance Executive Dashboard
 * Dashboard executivo consolidado com métricas financeiras
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
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
        <Card className="bg-gradient-to-br from-success/10 to-success/20 dark:from-success/10 dark:to-success/5 border-success/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-success">Receita YTD</p>
                <p className="text-3xl font-bold text-success mt-1">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">+{revenueGrowth}%</span>
                  <span className="text-xs text-success/70">vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-success/20">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/20 dark:from-destructive/10 dark:to-destructive/5 border-destructive/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Custos YTD</p>
                <p className="text-3xl font-bold text-destructive mt-1">
                  {formatCurrency(totalCosts)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDownRight className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">-3.2%</span>
                  <span className="text-xs text-muted-foreground">vs orçado</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-destructive/20">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-info/10 to-info/20 dark:from-info/10 dark:to-info/5 border-info/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-info">Lucro Líquido</p>
                <p className="text-3xl font-bold text-info mt-1">
                  {formatCurrency(totalProfit)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Target className="h-4 w-4 text-info" />
                  <span className="text-sm font-medium">{profitMargin}%</span>
                  <span className="text-xs text-muted-foreground">margem</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-info/20">
                <DollarSign className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/20 dark:from-accent/10 dark:to-accent/5 border-accent/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-accent-foreground">Cash Flow</p>
                <p className="text-3xl font-bold text-accent-foreground mt-1">
                  {formatCurrency(2850000)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Wallet className="h-4 w-4 text-accent-foreground" />
                  <span className="text-sm font-medium">45 dias</span>
                  <span className="text-xs text-muted-foreground">runway</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-accent/20">
                <Wallet className="h-6 w-6 text-accent-foreground" />
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
                <Badge variant="outline" className="bg-success/10">Receita</Badge>
                <Badge variant="outline" className="bg-destructive/10">Custos</Badge>
                <Badge variant="outline" className="bg-info/10">Lucro</Badge>
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
                    stroke="hsl(var(--success))" 
                    fill="hsl(var(--success))" 
                    fillOpacity={0.2}
                    name="Receita"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costs" 
                    stroke="hsl(var(--destructive))" 
                    fill="hsl(var(--destructive))" 
                    fillOpacity={0.1}
                    name="Custos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="hsl(var(--info))" 
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
              <AlertTriangle className="h-5 w-5 text-warning" />
              Ações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingItems.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {item.type === "invoice" ? <Receipt className="h-4 w-4 text-info mt-0.5" /> :
                     item.type === "approval" ? <FileText className="h-4 w-4 text-accent-foreground mt-0.5" /> :
                     <CreditCard className="h-4 w-4 text-success mt-0.5" />}
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
            <Button variant="outline" className="w-full mt-2" onClick={() => {
              const nav = document.querySelector('[data-tab="approvals"]') as HTMLElement;
              if (nav) nav.click();
              else toast.info(`${pendingItems.length} itens pendentes. Acesse a aba Aprovações no Centro Financeiro.`);
            }}>Ver Todas</Button>
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
                <div key={idx} className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toast(`${vessel.vessel}`, { description: `Receita: ${formatCurrency(vessel.revenue)} | Custos: ${formatCurrency(vessel.costs)} | Margem: ${vessel.margin}% | Viagens: ${vessel.voyages}`, duration: 5000 })}>
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
                      <p className="font-medium text-success">{formatCurrency(vessel.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Custos</p>
                      <p className="font-medium text-destructive">{formatCurrency(vessel.costs)}</p>
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
                    className={`h-2 ${cat.percentage >= 90 ? "[&>div]:bg-destructive" : cat.percentage >= 75 ? "[&>div]:bg-warning" : ""}`}
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
