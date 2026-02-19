/**
 * DrydockProjectTracker v2 - World-class drydock project management
 * Budget tracking, Gantt tasks, critical path, scope management
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Anchor, DollarSign, AlertTriangle, CheckCircle, Clock, TrendingUp, ListChecks, Download, Eye } from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--info))'];

export function DrydockProjectTracker() {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["drydock-projects-tracker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drydock_projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["drydock-gantt-tasks-tracker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drydock_gantt_tasks")
        .select("*")
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const enrichedProjects = useMemo(() => {
    return projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.drydock_project_id === p.id);
      const completedTasks = projectTasks.filter((t) => t.status === "completed").length;
      const criticalTasks = projectTasks.filter((t) => t.is_critical_path);
      const criticalPending = criticalTasks.filter((t) => t.status !== "completed").length;
      const progress = projectTasks.length > 0
        ? Math.round((completedTasks / projectTasks.length) * 100)
        : (p.days_planned > 0 ? Math.min(100, Math.round(((p.days_elapsed || 0) / p.days_planned) * 100)) : 0);

      const budget = p.budget_usd || 0;
      const actual = p.spent_usd || 0;
      const budgetVariance = budget > 0 ? ((actual - budget) / budget) * 100 : 0;

      const startDate = p.start_date ? parseISO(p.start_date) : null;
      const endDate = p.end_date ? parseISO(p.end_date) : null;
      const daysRemaining = endDate ? differenceInDays(endDate, new Date()) : null;
      const totalDays = startDate && endDate ? differenceInDays(endDate, startDate) : p.days_planned || 0;

      return {
        ...p, progress, totalTasks: projectTasks.length, completedTasks, criticalPending,
        criticalTotal: criticalTasks.length, budget, actual, budgetVariance,
        startDate, endDate, daysRemaining, totalDays, projectTasks,
      };
    });
  }, [projects, tasks]);

  // Portfolio KPIs
  const portfolio = useMemo(() => {
    const totalBudget = enrichedProjects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = enrichedProjects.reduce((s, p) => s + p.actual, 0);
    const activeCount = enrichedProjects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length;
    const overBudget = enrichedProjects.filter(p => p.budgetVariance > 10).length;
    const overdue = enrichedProjects.filter(p => p.daysRemaining !== null && p.daysRemaining < 0).length;
    const avgProgress = enrichedProjects.length > 0 ? Math.round(enrichedProjects.reduce((s, p) => s + p.progress, 0) / enrichedProjects.length) : 0;

    const budgetByProject = enrichedProjects.slice(0, 8).map(p => ({
      name: p.vessel_name?.substring(0, 12) || 'N/A',
      budget: p.budget,
      spent: p.actual,
    }));

    const statusDist = enrichedProjects.reduce<Record<string, number>>((acc, p) => {
      const s = p.status || 'unknown';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const statusData = Object.entries(statusDist).map(([name, value]) => ({ name, value }));

    return { totalBudget, totalSpent, activeCount, overBudget, overdue, avgProgress, budgetByProject, statusData };
  }, [enrichedProjects]);

  const fmt = (v: number) => `$${v.toLocaleString()}`;

  if (isLoading) {
    return <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
      <CardContent className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28" />)}</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Anchor className="h-6 w-6 text-primary" />Drydock Project Management
          </h2>
          <p className="text-muted-foreground">Gestão de projetos de doca seca — Orçamento, Gantt & Caminho Crítico</p>
        </div>
        <Badge variant="outline">{enrichedProjects.length} projetos</Badge>
      </div>

      {/* Portfolio KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { icon: Anchor, label: 'Projetos Ativos', value: portfolio.activeCount, color: 'text-primary' },
          { icon: DollarSign, label: 'Orçamento Total', value: fmt(portfolio.totalBudget), color: 'text-warning' },
          { icon: TrendingUp, label: 'Gasto Total', value: fmt(portfolio.totalSpent), color: portfolio.totalSpent > portfolio.totalBudget ? 'text-destructive' : 'text-success' },
          { icon: ListChecks, label: 'Progresso Médio', value: `${portfolio.avgProgress}%`, color: 'text-info' },
          { icon: AlertTriangle, label: 'Acima Orçamento', value: portfolio.overBudget, color: portfolio.overBudget > 0 ? 'text-destructive' : 'text-muted-foreground' },
          { icon: Clock, label: 'Atrasados', value: portfolio.overdue, color: portfolio.overdue > 0 ? 'text-destructive' : 'text-muted-foreground' },
        ].map(kpi => (
          <Card key={kpi.label}><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Charts */}
      {enrichedProjects.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Orçamento vs Realizado</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portfolio.budgetByProject}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="budget" fill="hsl(var(--primary))" name="Orçamento" radius={[4,4,0,0]} />
                  <Bar dataKey="spent" fill="hsl(var(--warning))" name="Gasto" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Status dos Projetos</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={portfolio.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {portfolio.statusData.map((e, i) => <Cell key={e.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects List */}
      {enrichedProjects.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhum projeto de doca seca cadastrado</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {enrichedProjects.map((proj) => (
            <Card key={proj.id} className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelectedProject(proj)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{proj.vessel_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {proj.yard_name} · {proj.startDate ? format(proj.startDate, "dd/MM/yy") : "—"} → {proj.endDate ? format(proj.endDate, "dd/MM/yy") : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {proj.daysRemaining !== null && proj.daysRemaining >= 0 ? (
                      <Badge variant="outline" className="text-xs bg-info/10 text-info"><Clock className="h-3 w-3 mr-1" />{proj.daysRemaining}d</Badge>
                    ) : proj.daysRemaining !== null ? (
                      <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive"><AlertTriangle className="h-3 w-3 mr-1" />{Math.abs(proj.daysRemaining)}d atraso</Badge>
                    ) : null}
                    {proj.status === "completed" && <Badge variant="outline" className="text-xs bg-success/10 text-success"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>}
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {proj.totalTasks > 0 ? `${proj.completedTasks}/${proj.totalTasks} tarefas` : `${proj.days_elapsed || 0}/${proj.days_planned || 0} dias`}
                    </span>
                    <span className="font-medium">{proj.progress}%</span>
                  </div>
                  <Progress value={proj.progress} className="h-2" />
                </div>
                <div className="flex items-center gap-4 text-xs flex-wrap">
                  <span><DollarSign className="h-3 w-3 inline text-muted-foreground" /> Orçamento: <b>{fmt(proj.budget)}</b></span>
                  <span>Real: <b className={proj.budgetVariance > 10 ? "text-destructive" : proj.budgetVariance > 0 ? "text-warning" : "text-success"}>{fmt(proj.actual)}</b></span>
                  <span className={proj.budgetVariance > 0 ? "text-destructive" : "text-success"}>({proj.budgetVariance > 0 ? '+' : ''}{proj.budgetVariance.toFixed(1)}%)</span>
                  {proj.criticalPending > 0 && <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning ml-auto">{proj.criticalPending} críticos pendentes</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.vessel_name} — {selectedProject?.yard_name}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="tasks">Tarefas ({selectedProject.totalTasks})</TabsTrigger>
                <TabsTrigger value="budget">Financeiro</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{selectedProject.progress}%</div>
                    <div className="text-xs text-muted-foreground">Progresso</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{selectedProject.daysRemaining ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">Dias Restantes</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl font-bold">{selectedProject.criticalTotal}</div>
                    <div className="text-xs text-muted-foreground">Itens Caminho Crítico</div>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className={`text-2xl font-bold ${selectedProject.budgetVariance > 10 ? 'text-destructive' : 'text-success'}`}>
                      {selectedProject.budgetVariance > 0 ? '+' : ''}{selectedProject.budgetVariance.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Variação Orçamentária</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Período:</span> {selectedProject.startDate ? format(selectedProject.startDate, 'dd/MM/yyyy') : '—'} — {selectedProject.endDate ? format(selectedProject.endDate, 'dd/MM/yyyy') : '—'}</div>
                  <div><span className="text-muted-foreground">Duração:</span> {selectedProject.totalDays} dias</div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline">{selectedProject.status}</Badge></div>
                  <div><span className="text-muted-foreground">Estaleiro:</span> {selectedProject.yard_name}</div>
                </div>
              </TabsContent>
              <TabsContent value="tasks" className="mt-4">
                {selectedProject.projectTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma tarefa cadastrada</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {selectedProject.projectTasks.map((t: any) => (
                      <div key={t.id} className="p-3 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {t.status === 'completed' ? <CheckCircle className="h-4 w-4 text-success" /> :
                           t.is_critical_path ? <AlertTriangle className="h-4 w-4 text-warning" /> :
                           <Clock className="h-4 w-4 text-muted-foreground" />}
                          <span className={`text-sm ${t.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{t.task_name}</span>
                        </div>
                        <div className="flex gap-2">
                          {t.is_critical_path && <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning">Crítico</Badge>}
                          <Badge variant={t.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{t.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="budget" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card><CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{fmt(selectedProject.budget)}</div>
                    <div className="text-xs text-muted-foreground">Orçamento</div>
                  </CardContent></Card>
                  <Card><CardContent className="p-4 text-center">
                    <TrendingUp className={`h-8 w-8 mx-auto mb-2 ${selectedProject.budgetVariance > 10 ? 'text-destructive' : 'text-success'}`} />
                    <div className="text-2xl font-bold">{fmt(selectedProject.actual)}</div>
                    <div className="text-xs text-muted-foreground">Gasto Real</div>
                  </CardContent></Card>
                </div>
                <div className="mt-4 p-4 border rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Utilização do Orçamento</span>
                    <span className="font-bold">{selectedProject.budget > 0 ? Math.round((selectedProject.actual / selectedProject.budget) * 100) : 0}%</span>
                  </div>
                  <Progress value={selectedProject.budget > 0 ? Math.min(100, (selectedProject.actual / selectedProject.budget) * 100) : 0} className="h-3" />
                  {selectedProject.budgetVariance > 10 && (
                    <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Projeto acima do orçamento em {selectedProject.budgetVariance.toFixed(1)}%
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DrydockProjectTracker;
