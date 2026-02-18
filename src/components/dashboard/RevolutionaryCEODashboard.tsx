/**
 * Revolutionary CEO Dashboard - Next-Gen Executive Intelligence
 * Real-time KPIs with animated counters, glassmorphism cards, and AI insights
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Ship, Users, Shield, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, Activity, Anchor, Wrench, FileCheck, Gauge,
  ArrowUpRight, ArrowDownRight, Zap, Globe, Brain, Bell
} from "lucide-react";
import { FleetHealthHeatmap } from "./FleetHealthHeatmap";
import { AIExecutiveInsights } from "./AIExecutiveInsights";
import { LiveActivityFeed } from "./LiveActivityFeed";
import { useEffect, useState } from "react";

const CHART_COLORS = [
  "hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
  "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--accent))"
];

// Animated counter component
function AnimatedValue({ value, suffix = "", prefix = "", duration = 1.5 }: { value: number; suffix?: string; prefix?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / (duration * 1000);
      if (elapsed >= 1) {
        setDisplayValue(value);
        return;
      }
      const eased = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic
      setDisplayValue(Math.round(startValue + diff * eased));
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

// Premium KPI Card with glassmorphism
function PremiumKPI({ title, value, suffix = "", prefix = "", change, icon, color, delay = 0 }: {
  title: string; value: number; suffix?: string; prefix?: string; change?: number;
  icon: React.ReactNode; color: string; delay?: number;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, type: 'spring', stiffness: 200 }}
    >
      <Card className="relative overflow-hidden border-border/30 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />
        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${color}`} />
        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
              <p className="text-3xl font-bold tracking-tight">
                <AnimatedValue value={value} suffix={suffix} prefix={prefix} />
              </p>
            </div>
            <motion.div 
              className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {icon}
            </motion.div>
          </div>
          {change !== undefined && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className="flex items-center gap-1.5 mt-3"
            >
              {isPositive ? <ArrowUpRight className="h-3.5 w-3.5 text-success" /> : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
              <span className={`text-xs font-semibold ${isPositive ? "text-success" : "text-destructive"}`}>
                {isPositive ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Radial Score Gauge
function ScoreGauge({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  const data = [{ value, fill: color }];
  return (
    <Card className="border-border/30">
      <CardContent className="p-4 flex flex-col items-center">
        <div className="relative w-32 h-32">
          <ResponsiveContainer>
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'hsl(var(--muted))' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {icon}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-2xl font-bold mt-1 ${value >= 80 ? "text-success" : value >= 60 ? "text-warning" : "text-destructive"}`}
            >
              <AnimatedValue value={value} suffix="%" />
            </motion.span>
          </div>
        </div>
        <p className="text-xs font-medium text-muted-foreground mt-2">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function RevolutionaryCEODashboard() {
  const { data: vessels = [] } = useQuery({
    queryKey: ["rev-ceo-vessels"],
    queryFn: async () => { const { data } = await supabase.from("vessels").select("id, name, status, vessel_type"); return data || []; },
    staleTime: 30000,
  });

  const { data: crew = [] } = useQuery({
    queryKey: ["rev-ceo-crew"],
    queryFn: async () => { const { data } = await supabase.from("crew_members").select("id, status, rank, vessel_id, nationality"); return data || []; },
    staleTime: 30000,
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ["rev-ceo-maintenance"],
    queryFn: async () => { const { data } = await supabase.from("maintenance_tasks").select("id, status, priority, created_at"); return data || []; },
    staleTime: 30000,
  });

  const { data: audits = [] } = useQuery({
    queryKey: ["rev-ceo-audits"],
    queryFn: async () => { const { data } = await supabase.from("internal_audits").select("id, status, audit_type, score"); return data || []; },
    staleTime: 30000,
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["rev-ceo-certs"],
    queryFn: async () => { const { data } = await supabase.from("certificates").select("id, status, expiry_date, certificate_type"); return data || []; },
    staleTime: 30000,
  });

  const { data: ncs = [] } = useQuery({
    queryKey: ["rev-ceo-ncs"],
    queryFn: async () => { const { data } = await supabase.from("non_conformities").select("id, status, severity"); return data || []; },
    staleTime: 30000,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["rev-ceo-expenses"],
    queryFn: async () => { const { data } = await supabase.from("expenses").select("id, amount, category, date").limit(500); return data || []; },
    staleTime: 30000,
  });

  // KPI calculations
  const activeVessels = vessels.filter(v => v.status === "active").length;
  const fleetUtil = vessels.length > 0 ? Math.round((activeVessels / vessels.length) * 100) : 0;
  const activeCrew = crew.filter(c => c.status === "active").length;
  const crewReady = crew.length > 0 ? Math.round((activeCrew / crew.length) * 100) : 0;
  const pendingMaint = maintenance.filter(m => m.status === "pending" || m.status === "overdue").length;
  const completedAudits = audits.filter(a => a.status === "completed").length;
  const avgScore = audits.filter(a => a.score).reduce((s, a) => s + (Number(a.score) || 0), 0) / (completedAudits || 1);
  const openNCs = ncs.filter(n => n.status !== "closed" && n.status !== "resolved").length;
  const criticalNCs = ncs.filter(n => n.severity === "critical" || n.severity === "high").length;
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const expiringCerts = certificates.filter(c => { if (!c.expiry_date) return false; const d = Math.ceil((new Date(c.expiry_date).getTime() - Date.now()) / 86400000); return d > 0 && d <= 30; }).length;

  const complianceScore = Math.round(
    ((completedAudits / (audits.length || 1)) * 40) +
    ((certificates.filter(c => c.status === "active").length / (certificates.length || 1)) * 30) +
    (((ncs.length - openNCs) / (ncs.length || 1)) * 30)
  );

  // Chart data
  const fleetStatus = [
    { name: "Ativo", value: vessels.filter(v => v.status === "active").length },
    { name: "Manutenção", value: vessels.filter(v => v.status === "maintenance").length },
    { name: "Docado", value: vessels.filter(v => v.status === "drydock").length },
    { name: "Inativo", value: vessels.filter(v => v.status === "inactive").length },
  ].filter(d => d.value > 0);

  const maintPriority = [
    { name: "Crítica", value: maintenance.filter(m => m.priority === "critical").length, fill: "hsl(var(--destructive))" },
    { name: "Alta", value: maintenance.filter(m => m.priority === "high").length, fill: "hsl(var(--warning))" },
    { name: "Média", value: maintenance.filter(m => m.priority === "medium").length, fill: "hsl(var(--chart-2))" },
    { name: "Baixa", value: maintenance.filter(m => m.priority === "low").length, fill: "hsl(var(--chart-3))" },
  ].filter(d => d.value > 0);

  const monthlyExp: Record<string, number> = {};
  expenses.forEach(e => {
    const m = String(e.date || '').substring(0, 7);
    if (m.match(/^\d{4}-\d{2}$/)) monthlyExp[m] = (monthlyExp[m] || 0) + (Number(e.amount) || 0);
  });
  const expTrend = Object.entries(monthlyExp).sort().slice(-6).map(([m, t]) => ({ month: m.substring(5), total: Math.round(t) }));

  const now = new Date();
  const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Globe className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Executive Command Center</h2>
              <p className="text-sm text-muted-foreground">Inteligência executiva em tempo real • {timeString}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 bg-success/10 text-success border-success/30">
            <Activity className="h-3 w-3 animate-pulse" />
            Live
          </Badge>
          {criticalNCs > 0 && (
            <Badge variant="destructive" className="gap-1.5 animate-pulse">
              <Bell className="h-3 w-3" />
              {criticalNCs} Alertas
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Critical Alert Banner */}
      {(criticalNCs > 0 || expiringCerts > 3) && (
        <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-destructive/40 bg-gradient-to-r from-destructive/5 via-destructive/10 to-destructive/5 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-destructive to-warning" />
            <CardContent className="p-4 flex items-center gap-4">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-sm">⚡ Atenção Executiva Requerida</p>
                <p className="text-xs text-muted-foreground">
                  {criticalNCs > 0 && `${criticalNCs} não-conformidades críticas`}
                  {criticalNCs > 0 && expiringCerts > 3 && " • "}
                  {expiringCerts > 3 && `${expiringCerts} certificados vencendo em 30 dias`}
                </p>
              </div>
              <Badge variant="destructive" className="shrink-0">Ação Imediata</Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <PremiumKPI title="Frota Ativa" value={activeVessels} suffix={`/${vessels.length}`} icon={<Ship className="h-4 w-4 text-primary-foreground" />} change={2.5} color="from-blue-500 to-cyan-500" delay={0} />
        <PremiumKPI title="Tripulação" value={activeCrew} icon={<Users className="h-4 w-4 text-primary-foreground" />} change={1.2} color="from-emerald-500 to-green-500" delay={0.05} />
        <PremiumKPI title="Compliance" value={complianceScore} suffix="%" icon={<Shield className="h-4 w-4 text-primary-foreground" />} change={-0.5} color="from-violet-500 to-purple-500" delay={0.1} />
        <PremiumKPI title="OPEX" value={Math.round(totalExpenses / 1000)} prefix="$" suffix="K" icon={<DollarSign className="h-4 w-4 text-primary-foreground" />} change={-3.2} color="from-amber-500 to-yellow-500" delay={0.15} />
        <PremiumKPI title="Manutenção" value={pendingMaint} icon={<Wrench className="h-4 w-4 text-primary-foreground" />} change={pendingMaint > 10 ? 5 : -2} color="from-red-500 to-orange-500" delay={0.2} />
        <PremiumKPI title="Cert. Vencendo" value={expiringCerts} icon={<FileCheck className="h-4 w-4 text-primary-foreground" />} color="from-pink-500 to-rose-500" delay={0.25} />
      </div>

      {/* Score Gauges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ScoreGauge label="Fleet Utilization" value={fleetUtil} color="hsl(var(--primary))" icon={<Anchor className="h-4 w-4 text-muted-foreground" />} />
        <ScoreGauge label="Crew Readiness" value={crewReady} color="hsl(var(--chart-2))" icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <ScoreGauge label="Compliance Score" value={complianceScore} color="hsl(var(--chart-3))" icon={<Shield className="h-4 w-4 text-muted-foreground" />} />
        <ScoreGauge label="Audit Score" value={Math.round(avgScore)} color="hsl(var(--chart-4))" icon={<Gauge className="h-4 w-4 text-muted-foreground" />} />
      </motion.div>

      {/* Charts Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* OPEX Trend */}
        <Card className="md:col-span-2 border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Tendência OPEX (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={expTrend}>
                <defs>
                  <linearGradient id="opexGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "OPEX"]} />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#opexGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Status */}
        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ship className="h-4 w-4 text-primary" />
              Status da Frota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={fleetStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={4} strokeWidth={0}>
                  {fleetStatus.map((entry, i) => <Cell key={`fleet-${entry.name}-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Maintenance + Vessels */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4 text-warning" />
              Manutenção por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={maintPriority} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={55} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {maintPriority.map((entry, i) => <Cell key={`maint-${entry.name}-${i}`} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ship className="h-4 w-4 text-primary" />
              Embarcações ({vessels.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {vessels.slice(0, 10).map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.03 }}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Ship className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{v.name}</span>
                </div>
                <Badge variant={v.status === "active" ? "default" : "secondary"} className="text-[10px]">{v.status}</Badge>
              </motion.div>
            ))}
            {vessels.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Nenhuma embarcação cadastrada</p>}
          </CardContent>
        </Card>
      </motion.div>

      {/* Fleet Health Heatmap */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
        <FleetHealthHeatmap vessels={vessels} maintenance={maintenance} certificates={certificates} />
      </motion.div>

      {/* AI Insights + Live Feed */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AIExecutiveInsights
          vesselCount={vessels.length}
          activeVessels={activeVessels}
          crewCount={crew.length}
          activeCrew={activeCrew}
          pendingMaint={pendingMaint}
          complianceScore={complianceScore}
          openNCs={openNCs}
          totalExpenses={totalExpenses}
          expiringCerts={expiringCerts}
        />
        <LiveActivityFeed />
      </motion.div>
    </div>
  );
}
