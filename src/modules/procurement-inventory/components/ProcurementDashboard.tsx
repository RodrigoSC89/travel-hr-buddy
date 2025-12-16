import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  Package,
  Truck,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Brain,
  Sparkles,
  Zap,
  Star,
  Building2,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertCircle,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, Legend, LineChart, Line } from "recharts";

// Mock data for charts
const spendingData = [
  { month: "Jan", actual: 45000, budget: 50000 },
  { month: "Fev", actual: 52000, budget: 50000 },
  { month: "Mar", actual: 48000, budget: 55000 },
  { month: "Abr", actual: 61000, budget: 55000 },
  { month: "Mai", actual: 55000, budget: 60000 },
  { month: "Jun", actual: 58000, budget: 60000 },
];

const categoryData = [
  { name: "Manutenção", value: 35, color: "hsl(var(--primary))" },
  { name: "Consumíveis", value: 25, color: "hsl(var(--chart-2))" },
  { name: "Segurança", value: 20, color: "hsl(var(--chart-3))" },
  { name: "DP System", value: 15, color: "hsl(var(--chart-4))" },
  { name: "Outros", value: 5, color: "hsl(var(--chart-5))" },
];

const inventoryTurnover = [
  { month: "Jan", turnover: 4.2 },
  { month: "Fev", turnover: 4.5 },
  { month: "Mar", turnover: 4.1 },
  { month: "Abr", turnover: 4.8 },
  { month: "Mai", turnover: 5.0 },
  { month: "Jun", turnover: 5.2 },
];

const stockAlerts = [
  { item: "Filtro de óleo hidráulico", current: 5, min: 10, status: "critical" },
  { item: "Válvula de segurança DP", current: 3, min: 5, status: "warning" },
  { item: "EPI - Capacetes", current: 12, min: 20, status: "warning" },
  { item: "Óleo lubrificante 15W40", current: 50, min: 100, status: "low" },
];

const aiPredictions = [
  { item: "Filtro de óleo hidráulico", daysUntilStockout: 7, recommendation: "Gerar PO urgente", confidence: 95 },
  { item: "Juntas de vedação", daysUntilStockout: 15, recommendation: "Incluir na próxima compra", confidence: 88 },
  { item: "Graxa para rolamentos", daysUntilStockout: 22, recommendation: "Monitorar", confidence: 82 },
];

const recentActivity = [
  { type: "order", message: "PO-2024-042 aprovado", time: "há 5 min", icon: CheckCircle2, color: "text-green-500" },
  { type: "stock", message: "Recebimento de 50un Filtros", time: "há 30 min", icon: Package, color: "text-blue-500" },
  { type: "requisition", message: "REQ-2024-089 criada por IA", time: "há 1h", icon: Brain, color: "text-purple-500" },
  { type: "alert", message: "Estoque baixo: EPI Capacetes", time: "há 2h", icon: AlertTriangle, color: "text-amber-500" },
  { type: "delivery", message: "Entrega confirmada: PO-2024-038", time: "há 3h", icon: Truck, color: "text-primary" },
];

export default function ProcurementDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Itens em Estoque</p>
                <p className="text-2xl font-bold">1,248</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +12 este mês
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Warehouse className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
                <p className="text-2xl font-bold">24</p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Activity className="h-3 w-3" />
                  8 em trânsito
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <ShoppingCart className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos do Mês</p>
                <p className="text-2xl font-bold">R$ 58k</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowDownRight className="h-3 w-3" />
                  -3% vs budget
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Estoque</p>
                <p className="text-2xl font-bold">4</p>
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  1 crítico
                </div>
              </div>
              <div className="p-3 rounded-full bg-amber-500/10">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Automação IA</p>
                <p className="text-2xl font-bold">67%</p>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <Zap className="h-3 w-3" />
                  16 POs auto
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-500/10">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lead Time Médio</p>
                <p className="text-2xl font-bold">4.8d</p>
                <div className="flex items-center gap-1 text-xs text-cyan-600">
                  <TrendingDown className="h-3 w-3" />
                  -1.2 dias
                </div>
              </div>
              <div className="p-3 rounded-full bg-cyan-500/10">
                <Clock className="h-6 w-6 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Gastos vs Budget
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Últimos 6 meses
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]}
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorActual)" 
                  name="Real"
                />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5" 
                  name="Budget"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts + AI Predictions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Alertas de Estoque
              </CardTitle>
              <Badge variant="destructive">{stockAlerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {stockAlerts.map((alert, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{alert.item}</span>
                  <Badge variant={
                    alert.status === "critical" ? "destructive" : 
                    alert.status === "warning" ? "default" : "secondary"
                  }>
                    {alert.current}/{alert.min}
                  </Badge>
                </div>
                <Progress 
                  value={(alert.current / alert.min) * 100} 
                  className={`h-2 ${
                    alert.status === "critical" ? "[&>div]:bg-destructive" : 
                    alert.status === "warning" ? "[&>div]:bg-amber-500" : "[&>div]:bg-primary"
                  }`}
                />
              </div>
            ))}
            <Button variant="outline" className="w-full" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Gerar Reposição Automática
            </Button>
          </CardContent>
        </Card>

        {/* AI Predictions */}
        <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Previsões IA
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                Preditivo
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiPredictions.map((pred, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-background/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{pred.item}</span>
                  <span className={`text-xs font-semibold ${
                    pred.daysUntilStockout <= 7 ? "text-destructive" : 
                    pred.daysUntilStockout <= 14 ? "text-amber-600" : "text-green-600"
                  }`}>
                    {pred.daysUntilStockout} dias
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{pred.recommendation}</span>
                  <Badge variant="outline" className="text-xs">
                    {pred.confidence}% conf.
                  </Badge>
                </div>
              </div>
            ))}
            <Button className="w-full" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Executar Sugestões
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Turnover + Top Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Turnover */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Giro de Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={inventoryTurnover}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" domain={[3, 6]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="turnover" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                  name="Giro"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Meta: 5.0x</span>
              <Badge variant="default">
                <Target className="h-3 w-3 mr-1" />
                Atual: 5.2x
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Top Suppliers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "NavTech", rating: 4.9, orders: 156, onTime: 99, value: "R$ 245k" },
                { name: "HidroMar", rating: 4.8, orders: 234, onTime: 97, value: "R$ 312k" },
                { name: "PetroLub", rating: 4.6, orders: 312, onTime: 94, value: "R$ 189k" },
                { name: "SafetyFirst", rating: 4.2, orders: 89, onTime: 85, value: "R$ 78k" },
              ].map((supplier, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {supplier.rating}
                        </span>
                        <span>•</span>
                        <span>{supplier.orders} pedidos</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{supplier.value}</p>
                    <p className={`text-xs ${supplier.onTime >= 95 ? "text-green-600" : supplier.onTime >= 90 ? "text-amber-600" : "text-red-600"}`}>
                      {supplier.onTime}% on-time
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
