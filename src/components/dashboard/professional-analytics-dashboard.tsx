/**
 * Professional Analytics BI Dashboard
 * Real-time analytics with drill-down using Supabase data
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3, TrendingUp, Users, Ship, Target, Zap, Activity,
  PieChart, Download, RefreshCw, Calendar, Shield, AlertTriangle, Wrench
} from "lucide-react";
import {
  ComposedChart, Line, Bar, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell
} from "recharts";
import { motion } from "framer-motion";
import { useAnalyticsBIData } from "@/hooks/useAnalyticsBIData";
import { useCertificateAlerts } from "@/hooks/useCertificateAlerts";
import { useQueryClient } from "@tanstack/react-query";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))",
  "#6366f1", "#ec4899", "#14b8a6", "#f97316"
];

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  subtitle: string;
  loading?: boolean;
}

const KPICard = ({ title, value, change, icon: Icon, subtitle, loading }: KPICardProps) => {
  if (loading) return <Skeleton className="h-32 rounded-lg" />;
  const isPositive = change >= 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full -mr-12 -mt-12" />
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span className={isPositive ? "text-success" : "text-destructive"}>
              {isPositive ? "↑" : "↓"} {Math.abs(change)}%
            </span>
            {subtitle}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function ProfessionalAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { kpis, chartData, complianceBreakdown, insights, isLoading } = useAnalyticsBIData();
  const { alerts, criticalCount, warningCount } = useCertificateAlerts();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["bi-vessels"] });
    queryClient.invalidateQueries({ queryKey: ["bi-crew"] });
    queryClient.invalidateQueries({ queryKey: ["bi-maintenance"] });
    queryClient.invalidateQueries({ queryKey: ["bi-certifications"] });
    queryClient.invalidateQueries({ queryKey: ["bi-insights"] });
    queryClient.invalidateQueries({ queryKey: ["certificate-alerts"] });
  };

  const handleExport = () => {
    const csvContent = [
      "Métrica,Valor",
      `Embarcações Ativas,${kpis.totalVessels}`,
      `Tripulação Ativa,${kpis.activeCrew}`,
      `Compliance Score,${kpis.complianceScore}%`,
      `Manutenções Pendentes,${kpis.maintenancePending}`,
      `Certificados Vencendo,${kpis.certificatesExpiring}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-bi-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const pieData = complianceBreakdown.map((item) => ({
    name: item.category,
    value: item.compliant,
    total: item.total,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Analytics BI
          </h1>
          <p className="text-muted-foreground mt-1">Inteligência operacional em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalCount} alertas críticos
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-warning text-warning-foreground gap-1">
              <AlertTriangle className="h-3 w-3" />
              {warningCount} avisos
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} aria-label="Atualizar dados">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Embarcações Ativas" value={kpis.totalVessels} change={kpis.vesselsTrend} icon={Ship} subtitle="na frota" loading={isLoading} />
        <KPICard title="Tripulação Ativa" value={kpis.activeCrew} change={kpis.crewTrend} icon={Users} subtitle="embarcados" loading={isLoading} />
        <KPICard title="Compliance Score" value={`${kpis.complianceScore}%`} change={kpis.complianceTrend} icon={Shield} subtitle="certificações válidas" loading={isLoading} />
        <KPICard title="Manutenções Pendentes" value={kpis.maintenancePending} change={-2.1} icon={Wrench} subtitle="aguardando execução" loading={isLoading} />
        <KPICard title="Não-Conformidades" value={kpis.incidentCount} change={-1.5} icon={AlertTriangle} subtitle="abertas" loading={isLoading} />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fleet">Frota</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Evolução Operacional (6 meses)</CardTitle>
              <CardDescription>Crescimento de frota, tripulação e manutenções</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[400px]" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCrew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="crew" fill="url(#colorCrew)" stroke="hsl(var(--primary))" name="Tripulação" />
                    <Bar yAxisId="left" dataKey="vessels" fill="hsl(var(--success))" name="Embarcações" radius={[8, 8, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="maintenance" stroke="hsl(var(--warning))" strokeWidth={3} name="Manutenções" dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FLEET */}
        <TabsContent value="fleet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5" />Performance da Frota</CardTitle>
              <CardDescription>Métricas operacionais por embarcação</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[350px]" />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="vessels" fill="hsl(var(--primary))" name="Embarcações" />
                    <Line type="monotone" dataKey="maintenance" stroke="hsl(var(--destructive))" strokeWidth={2} name="Manutenções" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPLIANCE */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Distribuição de Compliance</CardTitle>
                <CardDescription>Certificações válidas por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading || pieData.length === 0 ? (
                  <Skeleton className="h-[300px]" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Certificados Vencendo</CardTitle>
                <CardDescription>{alerts.length} certificados nos próximos 60 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum certificado vencendo nos próximos 60 dias ✅</p>
                  ) : (
                    alerts.slice(0, 10).map((alert) => (
                      <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${alert.severity === "critical" ? "border-l-destructive bg-destructive/5" : alert.severity === "warning" ? "border-l-warning bg-warning/5" : "border-l-primary bg-primary/5"}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{alert.certificationName}</p>
                            <p className="text-xs text-muted-foreground">{alert.crewName} • Vence em {alert.daysUntilExpiry} dias</p>
                          </div>
                          <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                            {alert.daysUntilExpiry}d
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* INSIGHTS */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Insights de IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
                ) : insights.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum insight disponível no momento</p>
                ) : (
                  insights.slice(0, 5).map((insight) => (
                    <div key={insight.id} className={`flex items-start gap-3 p-3 rounded-lg border ${insight.priority === "high" ? "bg-destructive/5 border-destructive/20" : insight.priority === "medium" ? "bg-warning/5 border-warning/20" : "bg-primary/5 border-primary/20"}`}>
                      <Activity className={`h-5 w-5 mt-0.5 ${insight.priority === "high" ? "text-destructive" : insight.priority === "medium" ? "text-warning" : "text-primary"}`} />
                      <div>
                        <p className="font-semibold text-sm">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Confiança: {Math.round(insight.confidence * 100)}%
                          </Badge>
                          <Badge variant="outline" className="text-xs">{insight.category}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Operacional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Embarcações na frota</p>
                    <Badge>{kpis.totalVessels}</Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Tripulação total</p>
                    <Badge variant="secondary">{kpis.activeCrew}</Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Certificados a vencer</p>
                    <Badge variant={kpis.certificatesExpiring > 0 ? "destructive" : "default"}>
                      {kpis.certificatesExpiring}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Score de Compliance</p>
                    <Badge className={kpis.complianceScore >= 90 ? "bg-success" : kpis.complianceScore >= 70 ? "bg-warning text-warning-foreground" : "bg-destructive"}>
                      {kpis.complianceScore}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProfessionalAnalyticsDashboard;
