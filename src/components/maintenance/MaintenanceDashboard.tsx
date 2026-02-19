/**
 * MaintenanceDashboard v3 - World-Class PMS Intelligence
 * MTBF/MTTR · Criticality Matrix · Work Order Aging · Budget Utilization
 * ISM Code §10 · IMCA M109/M140 · Class Requirements
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Wrench, AlertTriangle, CheckCircle, Brain, Loader2, RefreshCw,
  Clock, TrendingUp, DollarSign, BarChart3, Target, Gauge, Download,
  Calendar, Timer, Shield, Zap, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePredictiveMaintenance } from "@/hooks/usePredictiveMaintenance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { differenceInDays } from 'date-fns';
import { toast } from 'sonner';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--accent))'];

export default function MaintenanceDashboard() {
  const { result, isAnalyzing, analyze } = usePredictiveMaintenance();
  const [mainTab, setMainTab] = useState('overview');

  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenance-tasks-dashboard'],
    queryFn: async () => {
      const { data } = await supabase.from('maintenance_tasks').select('*').limit(500);
      return (data || []) as Record<string, unknown>[];
    },
    staleTime: 30000,
  });

  const { data: records = [] } = useQuery({
    queryKey: ['maintenance-records-dashboard'],
    queryFn: async () => {
      const { data } = await supabase.from('maintenance_records').select('*').limit(500);
      return (data || []) as Record<string, unknown>[];
    },
    staleTime: 30000,
  });

  const analytics = useMemo(() => {
    const now = new Date();
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => t.status === 'pending' && t.due_date && new Date(String(t.due_date)) < now).length;
    const critical = tasks.filter(t => t.priority === 'critical').length;
    const high = tasks.filter(t => t.priority === 'high').length;

    // Completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // MTTR (Mean Time To Repair) — from completed tasks
    const completedWithDates = tasks.filter(t =>
      t.status === 'completed' && t.created_at && t.completed_date
    );
    const mttrDays = completedWithDates.length > 0
      ? Math.round(completedWithDates.reduce((sum, t) => {
          return sum + differenceInDays(new Date(String(t.completed_date)), new Date(String(t.created_at)));
        }, 0) / completedWithDates.length)
      : 0;

    // Work Order Aging
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
    const agingBuckets = [
      { range: '< 7d', count: pendingTasks.filter(t => differenceInDays(now, new Date(String(t.created_at))) < 7).length },
      { range: '7-30d', count: pendingTasks.filter(t => { const d = differenceInDays(now, new Date(String(t.created_at))); return d >= 7 && d < 30; }).length },
      { range: '30-90d', count: pendingTasks.filter(t => { const d = differenceInDays(now, new Date(String(t.created_at))); return d >= 30 && d < 90; }).length },
      { range: '> 90d', count: pendingTasks.filter(t => differenceInDays(now, new Date(String(t.created_at))) >= 90).length },
    ];

    // Priority distribution
    const priorityDist = [
      { name: 'Crítica', value: critical, fill: 'hsl(var(--destructive))' },
      { name: 'Alta', value: high, fill: 'hsl(var(--warning))' },
      { name: 'Média', value: tasks.filter(t => t.priority === 'medium').length, fill: 'hsl(var(--primary))' },
      { name: 'Baixa', value: tasks.filter(t => t.priority === 'low').length, fill: 'hsl(var(--success))' },
    ];

    // Status distribution
    const statusDist = [
      { name: 'Pendente', value: pending, fill: 'hsl(var(--warning))' },
      { name: 'Em Andamento', value: inProgress, fill: 'hsl(var(--primary))' },
      { name: 'Concluída', value: completed, fill: 'hsl(var(--success))' },
      { name: 'Atrasada', value: overdue, fill: 'hsl(var(--destructive))' },
    ];

    // Monthly trend
    const monthlyMap = tasks.reduce<Record<string, { created: number; completed: number }>>((acc, t) => {
      const mCreated = String(t.created_at || '').substring(0, 7);
      if (mCreated) {
        if (!acc[mCreated]) acc[mCreated] = { created: 0, completed: 0 };
        acc[mCreated].created++;
      }
      if (t.status === 'completed' && t.completed_date) {
        const mComp = String(t.completed_date).substring(0, 7);
        if (!acc[mComp]) acc[mComp] = { created: 0, completed: 0 };
        acc[mComp].completed++;
      }
      return acc;
    }, {});
    const monthlyTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, d]) => ({ month: month.substring(5), created: d.created, completed: d.completed }));

    // Component ranking (most issues)
    const compMap = tasks.reduce<Record<string, number>>((acc, t) => {
      const comp = String(t.component_name || t.component || 'Outros');
      acc[comp] = (acc[comp] || 0) + 1;
      return acc;
    }, {});
    const topComponents = Object.entries(compMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Budget estimation (from estimated_cost if available)
    const totalBudget = tasks.reduce((s, t) => s + (Number(t.estimated_cost) || 0), 0);
    const spentBudget = tasks.filter(t => t.status === 'completed').reduce((s, t) => s + (Number(t.actual_cost || t.estimated_cost) || 0), 0);
    const budgetUtil = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0;

    return {
      total, pending, inProgress, completed, overdue, critical, high,
      completionRate, mttrDays, agingBuckets, priorityDist, statusDist,
      monthlyTrend, topComponents, totalBudget, spentBudget, budgetUtil
    };
  }, [tasks]);

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Component', 'Priority', 'Status', 'Due Date', 'Created'];
    const rows = tasks.map(t => [t.id, t.title, t.component_name, t.priority, t.status, t.due_date, t.created_at].join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'maintenance-report.csv'; a.click();
    URL.revokeObjectURL(url); toast.success('Relatório exportado');
  };

  function getStatusIndicator(level: string) {
    switch (level) {
      case "low": return { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10", badgeVariant: "default" as const, label: "Normal" };
      case "medium": return { icon: AlertTriangle, color: "text-warning", bgColor: "bg-warning/10", badgeVariant: "secondary" as const, label: "Atenção" };
      case "high": case "critical": return { icon: Wrench, color: "text-destructive", bgColor: "bg-destructive/10", badgeVariant: "destructive" as const, label: level === "critical" ? "Crítico" : "Alto" };
      default: return { icon: CheckCircle, color: "text-muted-foreground", bgColor: "bg-muted", badgeVariant: "default" as const, label: "Desconhecido" };
    }
  }

  const indicator = result ? getStatusIndicator(result.overall_risk) : null;
  const Icon = indicator?.icon || CheckCircle;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Wrench className="h-6 w-6 text-primary" />Maintenance Command Center</h2>
          <p className="text-muted-foreground">ISM Code §10 · IMCA M109/M140 · Predictive Analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          <Button variant="outline" size="sm" onClick={() => analyze({ analysisType: 'health_assessment' })} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4 mr-1" />}AI Scan
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
        {[
          { icon: Settings, label: 'Total WOs', value: analytics.total, color: 'text-primary' },
          { icon: Clock, label: 'Pendentes', value: analytics.pending, color: 'text-warning' },
          { icon: Zap, label: 'Em Andamento', value: analytics.inProgress, color: 'text-primary' },
          { icon: CheckCircle, label: 'Concluídas', value: analytics.completed, color: 'text-success' },
          { icon: AlertTriangle, label: 'Atrasadas', value: analytics.overdue, color: analytics.overdue > 0 ? 'text-destructive' : 'text-muted-foreground' },
          { icon: Target, label: 'Completion', value: `${analytics.completionRate}%`, color: analytics.completionRate >= 80 ? 'text-success' : 'text-warning' },
          { icon: Timer, label: 'MTTR', value: `${analytics.mttrDays}d`, color: analytics.mttrDays <= 7 ? 'text-success' : 'text-warning' },
          { icon: DollarSign, label: 'Budget', value: fmt(analytics.spentBudget), color: 'text-accent-foreground' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* AI Prediction Card */}
      {result && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${indicator?.bgColor}`}>
              <Icon className={`h-6 w-6 ${indicator?.color}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={indicator?.badgeVariant}>{indicator?.label}</Badge>
                  <span className="text-sm text-muted-foreground">{result.predictions?.length || 0} equipamentos analisados</span>
                </div>
                <p className="text-sm">{result.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="aging">Work Order Aging</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="components">Componentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Status</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={analytics.statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {analytics.statusDist.map(e => <Cell key={e.name} fill={e.fill} />)}
                  </Pie><Tooltip /><Legend /></PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Prioridade</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={analytics.priorityDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {analytics.priorityDist.map(e => <Cell key={e.name} fill={e.fill} />)}
                  </Pie><Tooltip /><Legend /></PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Budget Utilization */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4" />Utilização de Orçamento</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Gasto: {fmt(analytics.spentBudget)}</span>
                      <span>Orçamento: {fmt(analytics.totalBudget)}</span>
                    </div>
                    <Progress value={analytics.budgetUtil} className={cn("h-3",
                      analytics.budgetUtil <= 80 ? "[&>div]:bg-success" : analytics.budgetUtil <= 95 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                    )} />
                  </div>
                  <span className="text-2xl font-bold">{analytics.budgetUtil}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aging">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Aging de Ordens de Serviço</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.agingBuckets}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="range" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" name="Work Orders" radius={[4, 4, 0, 0]}>
                      {analytics.agingBuckets.map((_, i) => (
                        <Cell key={i} fill={i >= 3 ? 'hsl(var(--destructive))' : i >= 2 ? 'hsl(var(--warning))' : 'hsl(var(--primary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Ordens Mais Antigas</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {tasks
                      .filter(t => t.status === 'pending' || t.status === 'in_progress')
                      .sort((a, b) => new Date(String(a.created_at)).getTime() - new Date(String(b.created_at)).getTime())
                      .slice(0, 10)
                      .map((t) => {
                        const age = differenceInDays(new Date(), new Date(String(t.created_at)));
                        return (
                          <div key={String(t.id)} className="flex items-center gap-3 p-2 rounded border text-sm">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{String(t.title)}</p>
                              <p className="text-xs text-muted-foreground">{String(t.component_name || '')}</p>
                            </div>
                            <Badge variant={age > 90 ? 'destructive' : age > 30 ? 'secondary' : 'outline'} className="text-xs shrink-0">{age}d</Badge>
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Tendência Mensal — Criadas vs Concluídas</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics.monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="created" stroke="hsl(var(--warning))" name="Criadas" strokeWidth={2} />
                      <Line type="monotone" dataKey="completed" stroke="hsl(var(--success))" name="Concluídas" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados suficientes</p>}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="py-3">
                <div className="text-xs text-muted-foreground">
                  ✅ ISM Code §10 (Maintenance of Ship & Equipment) · IMCA M109, M140, M254 · Class Society Requirements · SOLAS II-1/3-1 · NORMAM 101
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="components">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top Componentes com Mais Ocorrências</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topComponents} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" name="Work Orders" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
