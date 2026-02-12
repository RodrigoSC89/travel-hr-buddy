import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart, Package, Truck, Clock, DollarSign, AlertTriangle,
  TrendingUp, TrendingDown, Brain, Sparkles, Zap, Building2,
  Warehouse, ArrowUpRight, ArrowDownRight, BarChart3, PieChart,
  Activity, Target, AlertCircle, Calendar, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend,
  LineChart, Line
} from "recharts";
import { useProcurementData } from "@/hooks/useProcurementData";

export default function ProcurementDashboard() {
  const { items, orders, suppliers, stats, lowStockAlerts, categoryData, isLoading, refetch } = useProcurementData();

  // Build spending trend from orders by month
  const spendingByMonth = orders.reduce((acc: Record<string, number>, order) => {
    const date = new Date(order.created_at);
    const key = date.toLocaleDateString("pt-BR", { month: "short" });
    acc[key] = (acc[key] || 0) + Number(order.total_amount || 0);
    return acc;
  }, {});
  const spendingData = Object.entries(spendingByMonth).slice(-6).map(([month, actual]) => ({
    month, actual: Math.round(actual), budget: Math.round(actual * 1.1),
  }));

  // Recent activity from orders
  const recentActivity = orders.slice(0, 5).map((o) => ({
    type: o.status,
    message: `${o.order_number} - ${o.supplier_name || "Fornecedor"} (${o.status})`,
    time: new Date(o.created_at).toLocaleDateString("pt-BR"),
    icon: o.status === "delivered" ? Package : o.status === "approved" ? ShoppingCart : Truck,
    color: o.status === "delivered" ? "text-success" : o.status === "pending" ? "text-warning" : "text-primary",
  }));

  // Top suppliers
  const topSuppliers = suppliers
    .sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={`skel-${i}`} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Itens em Estoque</p>
                <p className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-xs text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  Dados reais
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Warehouse className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info bg-gradient-to-r from-info/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
                <p className="text-2xl font-bold">{stats.activeOrders}</p>
                <div className="flex items-center gap-1 text-xs text-info">
                  <Activity className="h-3 w-3" />
                  {orders.filter((o) => o.status === "in_transit").length} em trânsito
                </div>
              </div>
              <div className="p-3 rounded-full bg-info/10">
                <ShoppingCart className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success bg-gradient-to-r from-success/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos Total</p>
                <p className="text-2xl font-bold">
                  {stats.totalOrderValue > 0
                    ? `$${(stats.totalOrderValue / 1000).toFixed(0)}k`
                    : "$0"}
                </p>
                <div className="flex items-center gap-1 text-xs text-success">
                  <ArrowDownRight className="h-3 w-3" />
                  {orders.length} pedidos
                </div>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning bg-gradient-to-r from-warning/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Estoque</p>
                <p className="text-2xl font-bold">{stats.lowStockItems}</p>
                <div className="flex items-center gap-1 text-xs text-warning">
                  <AlertTriangle className="h-3 w-3" />
                  {stats.criticalItems} crítico(s)
                </div>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent bg-gradient-to-r from-accent/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fornecedores</p>
                <p className="text-2xl font-bold">{stats.totalSuppliers}</p>
                <div className="flex items-center gap-1 text-xs text-accent-foreground">
                  <Building2 className="h-3 w-3" />
                  Ativos
                </div>
              </div>
              <div className="p-3 rounded-full bg-accent/10">
                <Building2 className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary bg-gradient-to-r from-secondary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lead Time Médio</p>
                <p className="text-2xl font-bold">{stats.avgLeadTime}d</p>
                <div className="flex items-center gap-1 text-xs text-secondary-foreground">
                  <TrendingDown className="h-3 w-3" />
                  Fornecedores
                </div>
              </div>
              <div className="p-3 rounded-full bg-secondary/10">
                <Clock className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Gastos por Período
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {spendingData.length > 0 ? (
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
                  <YAxis className="text-xs" tickFormatter={(v: number) => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorActual)" name="Real" />
                  <Line type="monotone" dataKey="budget" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" name="Budget" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Sem dados de pedidos para exibir</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <p>Sem dados de categorias</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts + AI + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alertas de Estoque
              </CardTitle>
              <Badge variant={lowStockAlerts.length > 0 ? "destructive" : "secondary"}>
                {lowStockAlerts.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowStockAlerts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Todos os itens acima do mínimo</p>
              </div>
            ) : (
              lowStockAlerts.map((alert) => (
                <div key={alert.item} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{alert.item}</span>
                    <Badge variant={alert.status === "critical" ? "destructive" : "default"}>
                      {alert.current}/{alert.min}
                    </Badge>
                  </div>
                  <Progress
                    value={alert.min > 0 ? (alert.current / alert.min) * 100 : 0}
                    className={`h-2 ${alert.status === "critical" ? "[&>div]:bg-destructive" : "[&>div]:bg-warning"}`}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Insights Supabase
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.lowStockItems > 0 && (
              <div className="p-3 rounded-lg bg-background/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Reposição Necessária</span>
                  <span className="text-xs font-semibold text-destructive">{stats.lowStockItems} itens</span>
                </div>
                <span className="text-xs text-muted-foreground">Itens abaixo do nível mínimo</span>
              </div>
            )}
            {stats.activeOrders > 0 && (
              <div className="p-3 rounded-lg bg-background/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pedidos em Andamento</span>
                  <span className="text-xs font-semibold text-primary">{stats.activeOrders}</span>
                </div>
                <span className="text-xs text-muted-foreground">Aguardando entrega ou aprovação</span>
              </div>
            )}
            {stats.totalSuppliers > 0 && (
              <div className="p-3 rounded-lg bg-background/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Base de Fornecedores</span>
                  <span className="text-xs font-semibold text-success">{stats.totalSuppliers} ativos</span>
                </div>
                <span className="text-xs text-muted-foreground">Lead time médio: {stats.avgLeadTime} dias</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum pedido recente</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.message} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Top Fornecedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topSuppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum fornecedor cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topSuppliers.map((supplier, idx) => (
                <div key={supplier.id} className="p-4 rounded-xl bg-muted/30 border hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">#{idx + 1}</Badge>
                    <span className="text-sm font-semibold truncate">{supplier.company_name}</span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>Pedidos: {supplier.total_orders || 0}</p>
                    <p>Rating: {supplier.rating ? `${supplier.rating}/5` : "N/A"}</p>
                    <p>Lead: {supplier.lead_time_days || "N/A"} dias</p>
                    {supplier.country && <p>{supplier.country}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
