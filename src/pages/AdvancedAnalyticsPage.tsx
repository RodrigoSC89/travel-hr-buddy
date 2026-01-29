/**
 * Advanced Analytics Page - Dashboard Analytics Completo
 * KPIs em tempo real, gráficos interativos, exportação
 */
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, TrendingUp, TrendingDown, Download, RefreshCw,
  Users, Ship, FileText, Shield, DollarSign, Activity,
  Calendar, Filter, Maximize2
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ComposedChart
} from "recharts";
import { AdvancedAnalyticsDashboard } from "@/components/analytics";

// Mock data for charts
const monthlyData = [
  { month: "Jan", crew: 245, vessels: 12, compliance: 94, incidents: 2, revenue: 1200000 },
  { month: "Fev", crew: 252, vessels: 12, compliance: 96, incidents: 1, revenue: 1350000 },
  { month: "Mar", crew: 248, vessels: 13, compliance: 95, incidents: 3, revenue: 1280000 },
  { month: "Abr", crew: 260, vessels: 13, compliance: 97, incidents: 0, revenue: 1420000 },
  { month: "Mai", crew: 265, vessels: 14, compliance: 98, incidents: 1, revenue: 1500000 },
  { month: "Jun", crew: 270, vessels: 14, compliance: 97, incidents: 2, revenue: 1480000 },
];

const complianceByArea = [
  { name: "SOLAS", value: 98, color: "#22c55e" },
  { name: "MARPOL", value: 95, color: "#3b82f6" },
  { name: "MLC", value: 92, color: "#8b5cf6" },
  { name: "ISM", value: 96, color: "#f59e0b" },
  { name: "ISPS", value: 94, color: "#ec4899" },
];

const fleetPerformance = [
  { vessel: "MV Atlantic Star", efficiency: 94, uptime: 98, compliance: 100 },
  { vessel: "MT Pacific Ocean", efficiency: 88, uptime: 95, compliance: 97 },
  { vessel: "SS Nordic Explorer", efficiency: 91, uptime: 96, compliance: 99 },
  { vessel: "MV Southern Cross", efficiency: 87, uptime: 92, compliance: 95 },
  { vessel: "MT Eastern Wind", efficiency: 93, uptime: 97, compliance: 98 },
];

const crewDistribution = [
  { category: "Deck Officers", count: 45, percentage: 18 },
  { category: "Engine Officers", count: 38, percentage: 15 },
  { category: "Ratings - Deck", count: 72, percentage: 29 },
  { category: "Ratings - Engine", count: 55, percentage: 22 },
  { category: "Catering", count: 40, percentage: 16 },
];

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdvancedAnalyticsPage() {
  const [period, setPeriod] = React.useState("6m");
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleExport = (format: string) => {
    // Mock export functionality
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Avançado
          </h1>
          <p className="text-muted-foreground mt-1">
            Dashboard executivo com KPIs em tempo real e análises preditivas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button variant="default" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Tripulantes", value: "270", change: "+5.2%", trend: "up", icon: Users, color: "blue" },
          { label: "Embarcações Ativas", value: "14", change: "+7.7%", trend: "up", icon: Ship, color: "green" },
          { label: "Compliance Score", value: "97%", change: "+2.1%", trend: "up", icon: Shield, color: "purple" },
          { label: "Documentos Ativos", value: "1,284", change: "-1.2%", trend: "down", icon: FileText, color: "yellow" },
          { label: "Receita Mensal", value: "R$ 1.5M", change: "+12.8%", trend: "up", icon: DollarSign, color: "emerald" },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${kpi.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                        {kpi.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-${kpi.color}-100 dark:bg-${kpi.color}-900/20`}>
                    <Icon className={`h-6 w-6 text-${kpi.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="fleet">Frota</TabsTrigger>
          <TabsTrigger value="crew">Tripulação</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências Operacionais</CardTitle>
                <CardDescription>Evolução mensal dos principais indicadores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis yAxisId="left" className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="crew" fill="#3b82f6" name="Tripulantes" />
                      <Line yAxisId="right" type="monotone" dataKey="compliance" stroke="#22c55e" strokeWidth={2} name="Compliance %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Compliance by Area */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance por Área</CardTitle>
                <CardDescription>Status de conformidade por regulamentação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complianceByArea} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} className="text-xs" />
                      <YAxis type="category" dataKey="name" className="text-xs" width={60} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {complianceByArea.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal</CardTitle>
              <CardDescription>Evolução da receita operacional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `R$ ${(v/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(v: number) => `R$ ${(v/1000000).toFixed(2)}M`} />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf680" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance da Frota</CardTitle>
              <CardDescription>Indicadores de eficiência por embarcação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fleetPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                    <YAxis type="category" dataKey="vessel" className="text-xs" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="efficiency" fill="#3b82f6" name="Eficiência %" />
                    <Bar dataKey="uptime" fill="#22c55e" name="Uptime %" />
                    <Bar dataKey="compliance" fill="#8b5cf6" name="Compliance %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crew" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição da Tripulação</CardTitle>
                <CardDescription>Por categoria funcional</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={crewDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {crewDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução do Quadro</CardTitle>
                <CardDescription>Crescimento do efetivo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line type="monotone" dataKey="crew" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <AdvancedAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Financeira</CardTitle>
              <CardDescription>Receitas, custos e margens operacionais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `R$ ${(v/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(v: number) => `R$ ${(v/1000000).toFixed(2)}M`} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#22c55e40" strokeWidth={2} name="Receita" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
