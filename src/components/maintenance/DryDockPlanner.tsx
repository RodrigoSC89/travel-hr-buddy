/**
 * Dry Dock Planner v3 — World-Class (vs Veson/AMOS)
 * Full CRUD + Budget Analytics + Work Category Breakdown + Timeline + Yard Performance
 */
import React, { useState, useMemo } from "react";
import { quickExport } from "@/lib/export-utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wrench, Calendar, DollarSign, Ship, Clock, CheckCircle,
  AlertTriangle, Plus, Download, Target, BarChart3, Eye, Trash2,
  TrendingUp, Award
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

type DockStatus = "planned" | "preparation" | "in_dock" | "completed" | "cancelled";

interface DryDockProject {
  id: string;
  vessel_id: string | null;
  vessel_name: string;
  yard_name: string;
  yard_location: string;
  status: DockStatus;
  start_date: string;
  end_date: string;
  days_planned: number;
  days_elapsed: number;
  budget_usd: number;
  spent_usd: number;
  work_items: { category: string; count: number; completed: number }[];
  class_reqs: number;
  class_completed: number;
  critical_path: string[];
  notes: string | null;
}

const STATUS_CONFIG: Record<DockStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  planned: { label: "Planejado", variant: "outline" },
  preparation: { label: "Preparação", variant: "secondary" },
  in_dock: { label: "Em Dique", variant: "default" },
  completed: { label: "Concluído", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const DEFAULT_WORK_ITEMS = [
  { category: "Hull & Estrutura", count: 0, completed: 0 },
  { category: "Propulsão", count: 0, completed: 0 },
  { category: "Elétrica", count: 0, completed: 0 },
  { category: "Pintura & Coating", count: 0, completed: 0 },
  { category: "Classe (Survey)", count: 0, completed: 0 },
  { category: "Segurança/LSA", count: 0, completed: 0 },
];

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(210,70%,55%)', 'hsl(280,60%,55%)'];

export function DryDockPlanner() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [addDialog, setAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const queryClient = useQueryClient();

  const [newProject, setNewProject] = useState({
    vessel_name: '', yard_name: '', yard_location: '', start_date: '', end_date: '',
    days_planned: '30', budget_usd: '0', notes: '',
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['drydock-projects'],
    queryFn: async () => {
      const { data, error } = await fromUntyped('drydock_projects')
        .select('*')
        .order('start_date', { ascending: true });
      if (error) throw error;
      return (data || []).map((p: any): DryDockProject => ({
        id: p.id, vessel_id: p.vessel_id, vessel_name: p.vessel_name || '',
        yard_name: p.yard_name || '', yard_location: p.yard_location || '',
        status: p.status || 'planned', start_date: p.start_date || '', end_date: p.end_date || '',
        days_planned: Number(p.days_planned) || 30, days_elapsed: Number(p.days_elapsed) || 0,
        budget_usd: Number(p.budget_usd) || 0, spent_usd: Number(p.spent_usd) || 0,
        work_items: Array.isArray(p.work_items) ? p.work_items : DEFAULT_WORK_ITEMS,
        class_reqs: Number(p.class_reqs) || 0, class_completed: Number(p.class_completed) || 0,
        critical_path: Array.isArray(p.critical_path) ? p.critical_path : [],
        notes: p.notes,
      }));
    },
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newProject) => {
      const { error } = await fromUntyped('drydock_projects').insert({
        vessel_name: data.vessel_name, yard_name: data.yard_name, yard_location: data.yard_location,
        start_date: data.start_date, end_date: data.end_date, days_planned: Number(data.days_planned),
        budget_usd: Number(data.budget_usd), notes: data.notes || null, work_items: DEFAULT_WORK_ITEMS, status: 'planned',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drydock-projects'] });
      toast.success('Projeto de docagem criado');
      setAddDialog(false);
      setNewProject({ vessel_name: '', yard_name: '', yard_location: '', start_date: '', end_date: '', days_planned: '30', budget_usd: '0', notes: '' });
    },
    onError: () => toast.error('Erro ao criar projeto'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'in_dock') updates.days_elapsed = 0;
      const { error } = await fromUntyped('drydock_projects').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['drydock-projects'] }); toast.success('Status atualizado'); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromUntyped('drydock_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['drydock-projects'] }); toast.success('Projeto removido'); setSelectedProject(null); },
  });

  // V3 Analytics
  const analytics = useMemo(() => {
    if (projects.length === 0) return null;
    const totalBudget = projects.reduce((a: number, p: DryDockProject) => a + p.budget_usd, 0);
    const totalSpent = projects.reduce((a: number, p: DryDockProject) => a + p.spent_usd, 0);
    const activeProjects = projects.filter((p: DryDockProject) => p.status === 'in_dock' || p.status === 'preparation').length;
    const completed = projects.filter((p: DryDockProject) => p.status === 'completed');
    const avgDuration = completed.length > 0 ? Math.round(completed.reduce((s: number, p: DryDockProject) => s + p.days_elapsed, 0) / completed.length) : 0;
    const avgOverrun = completed.length > 0
      ? +(completed.reduce((s: number, p: DryDockProject) => s + (p.budget_usd > 0 ? ((p.spent_usd - p.budget_usd) / p.budget_usd) * 100 : 0), 0) / completed.length).toFixed(1)
      : 0;

    // Work category breakdown across all projects
    const workCategories: Record<string, { total: number; completed: number }> = {};
    projects.forEach((p: DryDockProject) => {
      p.work_items.forEach((w: { category: string; count: number; completed: number }) => {
        if (!workCategories[w.category]) workCategories[w.category] = { total: 0, completed: 0 };
        workCategories[w.category].total += w.count;
        workCategories[w.category].completed += w.completed;
      });
    });
    const workBreakdown = Object.entries(workCategories).map(([name, d]) => ({
      name, total: d.total, completed: d.completed,
      pct: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
    })).filter(w => w.total > 0);

    // Yard performance ranking
    const yards: Record<string, { name: string; projects: number; budget: number; spent: number; days: number }> = {};
    projects.forEach((p: DryDockProject) => {
      const key = p.yard_name || 'Unknown';
      if (!yards[key]) yards[key] = { name: key, projects: 0, budget: 0, spent: 0, days: 0 };
      yards[key].projects++;
      yards[key].budget += p.budget_usd;
      yards[key].spent += p.spent_usd;
      yards[key].days += p.days_elapsed || p.days_planned;
    });
    const yardRanking = Object.values(yards).sort((a, b) => b.projects - a.projects);

    // Budget by status
    const budgetByStatus = Object.entries(STATUS_CONFIG).map(([status, cfg]) => ({
      name: cfg.label,
      budget: projects.filter((p: DryDockProject) => p.status === status).reduce((s: number, p: DryDockProject) => s + p.budget_usd, 0) / 1e6,
      spent: projects.filter((p: DryDockProject) => p.status === status).reduce((s: number, p: DryDockProject) => s + p.spent_usd, 0) / 1e6,
    })).filter(d => d.budget > 0 || d.spent > 0);

    return { totalBudget, totalSpent, activeProjects, completed: completed.length, avgDuration, avgOverrun, workBreakdown, yardRanking, budgetByStatus };
  }, [projects]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />Dry Dock Planner <Badge variant="outline" className="text-[10px]">v3</Badge>
          </h3>
          <p className="text-sm text-muted-foreground">Planejamento de docagem • Work scope • Budget • Analytics</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => quickExport(projects, "Dry Dock Planner")}><Download className="h-3 w-3 mr-1" /> Exportar</Button>
          <Button size="sm" onClick={() => setAddDialog(true)}><Plus className="h-3 w-3 mr-1" /> Nova Docagem</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card><CardContent className="pt-4 text-center"><Ship className="h-4 w-4 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{projects.length}</p><p className="text-[10px] text-muted-foreground">Projetos</p></CardContent></Card>
        <Card className="border-primary/20"><CardContent className="pt-4 text-center"><Wrench className="h-4 w-4 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold text-primary">{analytics?.activeProjects || 0}</p><p className="text-[10px] text-muted-foreground">Ativos</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">${((analytics?.totalBudget || 0) / 1e6).toFixed(1)}M</p><p className="text-[10px] text-muted-foreground">Budget</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><BarChart3 className="h-4 w-4 mx-auto mb-1 text-warning" /><p className="text-2xl font-bold text-warning">${((analytics?.totalSpent || 0) / 1e6).toFixed(1)}M</p><p className="text-[10px] text-muted-foreground">Gasto</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Clock className="h-4 w-4 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{analytics?.avgDuration || 0}d</p><p className="text-[10px] text-muted-foreground">Duração Média</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><TrendingUp className={`h-4 w-4 mx-auto mb-1 ${(analytics?.avgOverrun || 0) > 0 ? 'text-destructive' : 'text-success'}`} /><p className={`text-2xl font-bold ${(analytics?.avgOverrun || 0) > 0 ? 'text-destructive' : 'text-success'}`}>{analytics?.avgOverrun || 0}%</p><p className="text-[10px] text-muted-foreground">Desvio Médio</p></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="projects">Projetos ({projects.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="yards">Estaleiros</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : projects.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Nenhum projeto</p><Button className="mt-4" onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Criar Projeto</Button></CardContent></Card>
          ) : (
            <div className="space-y-3">
          {projects.map((project: DryDockProject) => {
                const totalItems = project.work_items.reduce((a: number, w: { count: number }) => a + w.count, 0);
                const completedItems = project.work_items.reduce((a: number, w: { completed: number }) => a + w.completed, 0);
                const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                const budgetPct = project.budget_usd > 0 ? Math.round((project.spent_usd / project.budget_usd) * 100) : 0;
                const isOverBudget = budgetPct > 90;
                const isExpanded = selectedProject === project.id;

                return (
                  <Card key={project.id} className={project.status === "in_dock" ? "border-primary/30" : project.status === "preparation" ? "border-warning/20" : ""}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{project.vessel_name}</span>
                            <Badge variant={STATUS_CONFIG[project.status]?.variant || 'outline'} className="text-xs">
                              {STATUS_CONFIG[project.status]?.label || project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{project.yard_name}, {project.yard_location}</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{project.start_date} → {project.end_date}</span>
                            <span>{project.days_planned}d planejados{project.days_elapsed > 0 ? ` • ${project.days_elapsed}d decorridos` : ""}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Select value={project.status} onValueChange={(v) => updateStatusMutation.mutate({ id: project.id, status: v })}>
                            <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" onClick={() => setSelectedProject(isExpanded ? null : project.id)}><Eye className="h-3 w-3" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(project.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div><div className="flex justify-between text-xs mb-1"><span>Progresso: {completedItems}/{totalItems}</span><span className="font-bold">{progressPct}%</span></div><Progress value={progressPct} className="h-2" /></div>
                        <div><div className="flex justify-between text-xs mb-1"><span>Budget: ${(project.spent_usd / 1e6).toFixed(2)}M / ${(project.budget_usd / 1e6).toFixed(2)}M</span><span className={`font-bold ${isOverBudget ? "text-destructive" : ""}`}>{budgetPct}%</span></div><Progress value={budgetPct} className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`} /></div>
                      </div>
                      {isExpanded && (
                        <div className="border-t pt-3 space-y-4">
                          <div><h4 className="text-sm font-semibold mb-2">Work Scope</h4><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{project.work_items.map((w, i) => (<div key={`${project.id}-work-${w.category}-${i}`} className="p-2 rounded border text-xs"><div className="flex justify-between mb-1"><span className="font-medium">{w.category}</span><span>{w.completed}/{w.count}</span></div><Progress value={w.count > 0 ? (w.completed / w.count) * 100 : 0} className="h-1.5" /></div>))}</div></div>
                          <div><h4 className="text-sm font-semibold mb-2">Classe</h4><div className="flex items-center gap-3"><Progress value={project.class_reqs > 0 ? (project.class_completed / project.class_reqs) * 100 : 0} className="flex-1 h-2" /><span className="text-xs font-bold">{project.class_completed}/{project.class_reqs}</span></div></div>
                          {project.critical_path.length > 0 && (<div><h4 className="text-sm font-semibold mb-2">Caminho Crítico</h4><div className="space-y-1">{project.critical_path.map((item, i) => (<div key={`${project.id}-cp-${i}`} className="flex items-center gap-2 text-xs p-1.5 rounded bg-muted/50"><span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</span>{String(item)}</div>))}</div></div>)}
                          {project.notes && <p className="text-xs text-muted-foreground border-t pt-2">{project.notes}</p>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* V3: Analytics */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Budget vs Gasto por Status</CardTitle></CardHeader>
              <CardContent className="h-64">
                {analytics?.budgetByStatus?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.budgetByStatus}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip formatter={(v: number) => `$${v.toFixed(2)}M`} />
                      <Legend />
                      <Bar dataKey="budget" fill="hsl(var(--primary))" name="Budget ($M)" radius={[4,4,0,0]} />
                      <Bar dataKey="spent" fill="hsl(var(--warning))" name="Gasto ($M)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Work Scope por Categoria</CardTitle></CardHeader>
              <CardContent className="h-64">
                {analytics?.workBreakdown?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.workBreakdown} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, pct }) => `${name} (${pct}%)`}>
                        {analytics.workBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados de work scope</p>}
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Progresso por Categoria</CardTitle></CardHeader>
              <CardContent>
                {analytics?.workBreakdown?.length ? (
                  <div className="space-y-3">
                    {analytics.workBreakdown.map(w => (
                      <div key={w.name} className="flex items-center gap-3">
                        <span className="text-sm w-40 truncate">{w.name}</span>
                        <Progress value={w.pct} className="flex-1 h-2" />
                        <span className="text-xs font-medium w-20 text-right">{w.completed}/{w.total} ({w.pct}%)</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-muted-foreground text-center py-8 text-sm">Sem dados</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* V3: Yard Ranking */}
        <TabsContent value="yards">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-primary" />Ranking de Estaleiros</CardTitle></CardHeader>
            <CardContent>
              {analytics?.yardRanking?.length ? (
                <div className="space-y-3">
                  {analytics.yardRanking.map((y, i) => (
                    <div key={y.name} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                      }`}>{i + 1}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{y.name}</div>
                        <div className="text-xs text-muted-foreground">{y.projects} projetos · {y.days} dias totais</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">${(y.spent / 1e6).toFixed(2)}M</div>
                        <div className="text-[10px] text-muted-foreground">de ${(y.budget / 1e6).toFixed(2)}M</div>
                      </div>
                      <Progress value={y.budget > 0 ? (y.spent / y.budget) * 100 : 0} className="w-20 h-2" />
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-center py-8">Sem dados de estaleiros</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Novo Projeto de Docagem</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome da Embarcação *</Label><Input value={newProject.vessel_name} onChange={e => setNewProject(p => ({ ...p, vessel_name: e.target.value }))} placeholder="Nautilus Explorer" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Estaleiro *</Label><Input value={newProject.yard_name} onChange={e => setNewProject(p => ({ ...p, yard_name: e.target.value }))} placeholder="Jurong Shipyard" /></div>
              <div><Label>Localização</Label><Input value={newProject.yard_location} onChange={e => setNewProject(p => ({ ...p, yard_location: e.target.value }))} placeholder="Singapura" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Data Início *</Label><Input type="date" value={newProject.start_date} onChange={e => setNewProject(p => ({ ...p, start_date: e.target.value }))} /></div>
              <div><Label>Data Fim *</Label><Input type="date" value={newProject.end_date} onChange={e => setNewProject(p => ({ ...p, end_date: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Dias Planejados</Label><Input type="number" value={newProject.days_planned} onChange={e => setNewProject(p => ({ ...p, days_planned: e.target.value }))} /></div>
              <div><Label>Budget (USD)</Label><Input type="number" value={newProject.budget_usd} onChange={e => setNewProject(p => ({ ...p, budget_usd: e.target.value }))} /></div>
            </div>
            <div><Label>Observações</Label><Textarea value={newProject.notes} onChange={e => setNewProject(p => ({ ...p, notes: e.target.value }))} placeholder="Notas..." rows={2} /></div>
            <Button className="w-full" onClick={() => createMutation.mutate(newProject)} disabled={!newProject.vessel_name || !newProject.yard_name || !newProject.start_date || createMutation.isPending}>
              {createMutation.isPending ? 'Criando...' : 'Criar Projeto de Docagem'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
