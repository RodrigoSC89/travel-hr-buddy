/**
 * CEO Command Dashboard — Executive KPIs & Real-Time Intelligence
 * Consolidated C-Level view: OPEX, compliance, crew readiness, fleet utilization
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Ship, Users, Shield, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, Activity, Anchor, Wrench,
  FileCheck, Gauge, ArrowUpRight, ArrowDownRight
} from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

function KPICard({ title, value, change, icon, subtitle, trend, color }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
        <div className={`absolute top-0 left-0 w-1 h-full ${color || 'bg-primary'}`} />
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              ) : null}
              <span className={`text-xs font-medium ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                {change > 0 ? "+" : ""}{change}% vs mês anterior
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CeoCommandDashboard() {
  // Fleet data
  const { data: vessels = [] } = useQuery({
    queryKey: ["ceo-vessels"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name, status, vessel_type");
      return data || [];
    },
    staleTime: 60000,
  });

  // Crew data
  const { data: crew = [] } = useQuery({
    queryKey: ["ceo-crew"],
    queryFn: async () => {
      const { data } = await supabase.from("crew_members").select("id, status, rank, vessel_id, nationality");
      return data || [];
    },
    staleTime: 60000,
  });

  // Maintenance data
  const { data: maintenance = [] } = useQuery({
    queryKey: ["ceo-maintenance"],
    queryFn: async () => {
      const { data } = await supabase.from("maintenance_tasks").select("id, status, priority, created_at");
      return data || [];
    },
    staleTime: 60000,
  });

  // Compliance data
  const { data: audits = [] } = useQuery({
    queryKey: ["ceo-audits"],
    queryFn: async () => {
      const { data } = await supabase.from("internal_audits").select("id, status, audit_type, score, created_at");
      return data || [];
    },
    staleTime: 60000,
  });

  // Certificates expiring
  const { data: certificates = [] } = useQuery({
    queryKey: ["ceo-certificates"],
    queryFn: async () => {
      const { data } = await supabase.from("certificates").select("id, status, expiry_date, certificate_type");
      return data || [];
    },
    staleTime: 60000,
  });

  // Non-conformities
  const { data: ncs = [] } = useQuery({
    queryKey: ["ceo-ncs"],
    queryFn: async () => {
      const { data } = await supabase.from("non_conformities").select("id, status, severity, created_at");
      return data || [];
    },
    staleTime: 60000,
  });

  // Financial data
  const { data: expenses = [] } = useQuery({
    queryKey: ["ceo-expenses"],
    queryFn: async () => {
      const { data } = await supabase.from("expenses").select("id, amount, category, date, status").limit(500);
      return data || [];
    },
    staleTime: 60000,
  });

  // Computed KPIs
  const activeVessels = vessels.filter(v => v.status === "active").length;
  const fleetUtilization = vessels.length > 0 ? Math.round((activeVessels / vessels.length) * 100) : 0;
  const activeCrew = crew.filter(c => c.status === "active").length;
  const crewReadiness = crew.length > 0 ? Math.round((activeCrew / crew.length) * 100) : 0;
  const pendingMaint = maintenance.filter(m => m.status === "pending" || m.status === "overdue").length;
  const completedAudits = audits.filter(a => a.status === "completed").length;
  const avgAuditScore = audits.filter(a => a.score).reduce((sum, a) => sum + (Number(a.score) || 0), 0) / (completedAudits || 1);
  const openNCs = ncs.filter(n => n.status !== "closed" && n.status !== "resolved").length;
  const criticalNCs = ncs.filter(n => n.severity === "critical" || n.severity === "high").length;
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const expiringCerts = certificates.filter(c => {
    if (!c.expiry_date) return false;
    const days = Math.ceil((new Date(c.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 30;
  }).length;

  // Fleet status distribution
  const fleetStatusData = [
    { name: "Ativo", value: vessels.filter(v => v.status === "active").length },
    { name: "Manutenção", value: vessels.filter(v => v.status === "maintenance").length },
    { name: "Docado", value: vessels.filter(v => v.status === "drydock").length },
    { name: "Inativo", value: vessels.filter(v => v.status === "inactive").length },
  ].filter(d => d.value > 0);

  // Crew by nationality (top 5)
  const nationalityMap: Record<string, number> = {};
  crew.forEach(c => {
    const nat = String(c.nationality || "N/A");
    nationalityMap[nat] = (nationalityMap[nat] || 0) + 1;
  });
  const crewByNationality = Object.entries(nationalityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Maintenance by priority
  const maintByPriority = [
    { name: "Crítica", value: maintenance.filter(m => m.priority === "critical").length, fill: "hsl(var(--destructive))" },
    { name: "Alta", value: maintenance.filter(m => m.priority === "high").length, fill: "hsl(var(--chart-4))" },
    { name: "Média", value: maintenance.filter(m => m.priority === "medium").length, fill: "hsl(var(--chart-2))" },
    { name: "Baixa", value: maintenance.filter(m => m.priority === "low").length, fill: "hsl(var(--chart-3))" },
  ].filter(d => d.value > 0);

  // Monthly expenses trend
  const monthlyExpenses: Record<string, number> = {};
  expenses.forEach(e => {
    const month = String(e.date || e.id).substring(0, 7);
    if (month.match(/^\d{4}-\d{2}$/)) {
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + (Number(e.amount) || 0);
    }
  });
  const expensesTrend = Object.entries(monthlyExpenses)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, total]) => ({ month: month.substring(5), total: Math.round(total) }));

  // Compliance score
  const complianceScore = Math.round(
    ((completedAudits / (audits.length || 1)) * 40) +
    ((certificates.filter(c => c.status === "active").length / (certificates.length || 1)) * 30) +
    (((ncs.length - openNCs) / (ncs.length || 1)) * 30)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CEO Command Center</h2>
          <p className="text-sm text-muted-foreground">Visão consolidada em tempo real • Atualizado agora</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3 text-green-500 animate-pulse" />
            Live
          </Badge>
        </div>
      </motion.div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KPICard title="Frota Ativa" value={`${activeVessels}/${vessels.length}`} icon={<Ship className="h-4 w-4 text-primary" />} subtitle={`${fleetUtilization}% utilização`} change={2.5} trend="up" color="bg-blue-500" />
        <KPICard title="Tripulação" value={activeCrew} icon={<Users className="h-4 w-4 text-primary" />} subtitle={`${crewReadiness}% prontidão`} change={1.2} trend="up" color="bg-green-500" />
        <KPICard title="Compliance" value={`${complianceScore}%`} icon={<Shield className="h-4 w-4 text-primary" />} subtitle={`${openNCs} NCs abertas`} change={-0.5} trend={complianceScore > 85 ? "up" : "down"} color="bg-purple-500" />
        <KPICard title="OPEX Total" value={`$${(totalExpenses / 1000).toFixed(0)}K`} icon={<DollarSign className="h-4 w-4 text-primary" />} subtitle="Último período" change={-3.2} trend="down" color="bg-amber-500" />
        <KPICard title="Manutenção" value={pendingMaint} icon={<Wrench className="h-4 w-4 text-primary" />} subtitle="Pendentes/Atrasadas" change={pendingMaint > 10 ? 5 : -2} trend={pendingMaint > 10 ? "up" : "down"} color="bg-red-500" />
        <KPICard title="Certificados" value={expiringCerts} icon={<FileCheck className="h-4 w-4 text-primary" />} subtitle="Vencendo em 30 dias" color="bg-orange-500" />
      </div>

      {/* Alert Banner */}
      {(criticalNCs > 0 || expiringCerts > 3) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Atenção Executiva Requerida</p>
                <p className="text-xs text-muted-foreground">
                  {criticalNCs > 0 && `${criticalNCs} não-conformidades críticas • `}
                  {expiringCerts > 3 && `${expiringCerts} certificados vencendo`}
                </p>
              </div>
              <Badge variant="destructive">Ação Necessária</Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="operations">Operações</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fleet Status Pie */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Status da Frota</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={fleetStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={4}>
                      {fleetStatusData.map((entry, i) => <Cell key={`fleet-${entry.name}`} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Crew by Nationality */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tripulação por Nacionalidade</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={crewByNationality} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={60} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Maintenance Priority */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Manutenção por Prioridade</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={maintByPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {maintByPriority.map((entry) => <Cell key={`maint-${entry.name}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Scorecard gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Fleet Utilization", value: fleetUtilization, icon: <Anchor className="h-4 w-4" /> },
              { label: "Crew Readiness", value: crewReadiness, icon: <Users className="h-4 w-4" /> },
              { label: "Compliance Score", value: complianceScore, icon: <Shield className="h-4 w-4" /> },
              { label: "Audit Score", value: Math.round(avgAuditScore), icon: <Gauge className="h-4 w-4" /> },
            ].map((gauge) => (
              <Card key={gauge.label}>
                <CardContent className="p-4 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">{gauge.icon}<span className="text-xs">{gauge.label}</span></div>
                  <p className={`text-3xl font-bold ${gauge.value >= 80 ? "text-green-500" : gauge.value >= 60 ? "text-yellow-500" : "text-red-500"}`}>{gauge.value}%</p>
                  <Progress value={gauge.value} className="h-1.5" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Tendência OPEX (6 meses)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={expensesTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "OPEX"]} />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Embarcações</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {vessels.slice(0, 15).map(v => (
                  <div key={v.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Ship className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{v.name}</span>
                    </div>
                    <Badge variant={v.status === "active" ? "default" : "secondary"}>{v.status}</Badge>
                  </div>
                ))}
                {vessels.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma embarcação cadastrada</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Manutenções Pendentes</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {maintenance.filter(m => m.status === "pending" || m.status === "overdue").slice(0, 10).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <Badge variant={m.priority === "critical" ? "destructive" : "secondary"} className="text-xs">{String(m.priority)}</Badge>
                    <span className="text-xs text-muted-foreground">{String(m.status)}</span>
                  </div>
                ))}
                {pendingMaint === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sem manutenções pendentes ✓</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <CheckCircle className={`h-8 w-8 mx-auto ${complianceScore >= 80 ? "text-green-500" : "text-yellow-500"}`} />
                <p className="text-3xl font-bold">{complianceScore}%</p>
                <p className="text-xs text-muted-foreground">Compliance Score Global</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <AlertTriangle className={`h-8 w-8 mx-auto ${openNCs > 5 ? "text-red-500" : "text-yellow-500"}`} />
                <p className="text-3xl font-bold">{openNCs}</p>
                <p className="text-xs text-muted-foreground">Não-Conformidades Abertas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center space-y-2">
                <Clock className={`h-8 w-8 mx-auto ${expiringCerts > 5 ? "text-red-500" : "text-blue-500"}`} />
                <p className="text-3xl font-bold">{expiringCerts}</p>
                <p className="text-xs text-muted-foreground">Certificados Vencendo (30d)</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
