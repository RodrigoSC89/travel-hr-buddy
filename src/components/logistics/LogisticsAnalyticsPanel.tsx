/**
 * Logistics Analytics Panel - Real interactive analytics with charts
 * Integrated with Supabase real-time data
 */
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Package, Clock, DollarSign, RefreshCw, Download, AlertTriangle, CheckCircle, Database } from "lucide-react";
import { useLogisticsAnalytics } from "@/hooks/use-logistics-analytics-data";
import { EmptyState } from "@/components/ui/EmptyState";

export function LogisticsAnalyticsPanel() {
  const { toast } = useToast();
  const [period, setPeriod] = useState("6m");
  
  // Use real Supabase data hook
  const { data, isLoading, refetch } = useLogisticsAnalytics(period);

  const handleRefresh = async () => {
    await refetch();
    toast({ title: "Analytics atualizados", description: "Dados recarregados com sucesso" });
  };

  const handleExport = () => {
    if (!data) return;
    
    const report = {
      generatedAt: new Date().toISOString(),
      period,
      deliveryMetrics: data.deliveryData,
      supplierPerformance: data.supplierData,
      inventoryStatus: data.inventoryData
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logistics_report_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Relatório exportado", description: "Arquivo JSON gerado com sucesso" });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Carregando analytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Sem dados de logística"
        description="Configure os dados de envios e fornecedores para visualizar analytics."
        icon={<Database className="h-12 w-12" />}
      />
    );
  }

  const displayData = data;

  const totalDeliveries = displayData.deliveryData.reduce((acc, d) => acc + d.total, 0);
  const avgOnTime = displayData.deliveryData.length > 0 
    ? Math.round(displayData.deliveryData.reduce((acc, d) => acc + d.onTime, 0) / displayData.deliveryData.length) 
    : 0;
  const totalCost = displayData.deliveryData.reduce((acc, d) => acc + d.cost, 0);
  const avgDays = displayData.deliveryData.length > 0 
    ? (displayData.deliveryData.reduce((acc, d) => acc + d.avgDays, 0) / displayData.deliveryData.length).toFixed(1) 
    : "0";

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Analytics Logístico</h2>
          <p className="text-muted-foreground">Métricas de performance e tendências</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mês</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Package className="h-8 w-8 text-primary/50" />
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{totalDeliveries}</p>
            <p className="text-sm text-muted-foreground">Total de Entregas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-8 w-8 text-success/50" />
              <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{avgOnTime}%</p>
            <p className="text-sm text-muted-foreground">Entregas no Prazo</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className="h-8 w-8 text-info/50" />
              <Badge variant="secondary" className="text-xs bg-info/10 text-info">
                <TrendingDown className="h-3 w-3 mr-1" />
                -0.5d
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{avgDays} dias</p>
            <p className="text-sm text-muted-foreground">Tempo Médio</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-warning/50" />
              <Badge variant="secondary" className="text-xs bg-warning/10 text-warning">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">R$ {(totalCost / 1000).toFixed(0)}k</p>
            <p className="text-sm text-muted-foreground">Custo Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="delivery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="delivery">Entregas</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
        </TabsList>

        <TabsContent value="delivery">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Taxa de Entrega no Prazo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={displayData.deliveryData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="onTime" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="No Prazo %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Volume de Entregas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={displayData.deliveryData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance por Fornecedor</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={displayData.supplierData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" fontSize={12} domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" fontSize={11} width={100} />
                    <Tooltip />
                    <Bar dataKey="onTimeRate" fill="hsl(var(--success))" radius={[0, 4, 4, 0]} name="Taxa %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ranking de Fornecedores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayData.supplierData.sort((a, b) => b.qualityScore - a.qualityScore).map((supplier, idx) => (
                    <div key={supplier.name} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center rounded-full">
                          {idx + 1}
                        </Badge>
                        <span className="font-medium">{supplier.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{supplier.deliveries} entregas</span>
                        <Badge variant={supplier.onTimeRate >= 90 ? "default" : "secondary"}>
                          {supplier.onTimeRate}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Níveis de Estoque por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={displayData.inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="category" fontSize={10} angle={-20} textAnchor="end" height={60} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="current" fill="hsl(var(--primary))" name="Atual" />
                    <Bar dataKey="optimal" fill="hsl(var(--muted))" name="Ótimo" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alertas de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayData.inventoryData.map(item => {
                    const percentage = Math.round((item.current / item.optimal) * 100);
                    const needsReorder = item.current <= item.reorderPoint;
                    
                    return (
                      <div key={item.category} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{item.category}</span>
                          {needsReorder ? (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Reabastecer
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">{percentage}%</Badge>
                          )}
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${needsReorder ? "bg-destructive" : percentage < 70 ? "bg-warning" : "bg-success"}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.current.toLocaleString()} / {item.optimal.toLocaleString()} unidades
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução de Custos Logísticos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={displayData.deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `R$${v/1000}k`} />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
                  <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Custo" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
