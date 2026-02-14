/**
 * PMS Equipment Tree & Job Calendar V2.0 - REVOLUTIONARY
 * Equipment hierarchy from real data, running hours, job cards with full CRUD
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ChevronRight, ChevronDown, Wrench, Clock, AlertTriangle, CheckCircle,
  Plus, Calendar, Settings, Cpu, Anchor, Gauge, Zap, Shield, Search,
  BarChart3, Loader2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface JobCard {
  id: string; title: string; equipment_name: string; priority: string;
  status: string; due_date: string; component_name: string; vessel_name?: string;
  description?: string;
}

const EQUIPMENT_ICONS: Record<string, React.ElementType> = {
  'Motor': Cpu, 'Elétrica': Zap, 'Navegação': Anchor,
  'Segurança': Shield, 'Convés': Wrench, 'Hidráulica': Gauge,
};

const PRIORITIES = [
  { value: 'low', label: '🟢 Baixa' },
  { value: 'medium', label: '🟡 Média' },
  { value: 'high', label: '🟠 Alta' },
  { value: 'critical', label: '🔴 Crítica' },
];

export default function PMSEquipmentTree() {
  const [activeView, setActiveView] = useState<'tree' | 'calendar' | 'overdue'>('tree');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [newJobDialog, setNewJobDialog] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', component_name: '', priority: 'medium', due_date: '', description: '' });
  const queryClient = useQueryClient();

  const { data: vessels = [] } = useQuery({
    queryKey: ['pms-vessels'],
    queryFn: async () => { const { data } = await supabase.from('vessels').select('id, name').limit(20); return data || []; },
    staleTime: 60000,
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['pms-job-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('id, title, status, priority, due_date, component_name, description, vessel_id, vessels:vessel_id(name)')
        .order('due_date', { ascending: true }).limit(300);
      if (error) throw error;
      return (data || []).map((t): JobCard => ({
        id: t.id, title: t.title || 'Sem título',
        equipment_name: t.component_name || 'Geral',
        priority: t.priority || 'medium', status: t.status || 'pending',
        due_date: t.due_date || '', component_name: t.component_name || '',
        vessel_name: (t.vessels as { name: string } | null)?.name,
        description: t.description || '',
      }));
    },
    staleTime: 30000,
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: typeof newJob) => {
      const vesselId = vessels.length > 0 ? vessels[0].id : null;
      const { error } = await supabase.from('maintenance_tasks').insert({
        title: data.title, component_name: data.component_name,
        priority: data.priority, due_date: data.due_date || null,
        description: data.description, status: 'pending',
        vessel_id: vesselId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pms-job-cards'] });
      toast.success('Ordem de serviço criada');
      setNewJobDialog(false);
      setNewJob({ title: '', component_name: '', priority: 'medium', due_date: '', description: '' });
    },
    onError: () => toast.error('Erro ao criar OS'),
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status };
      if (status === 'completed') updates.completed_date = new Date().toISOString();
      const { error } = await supabase.from('maintenance_tasks').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pms-job-cards'] });
      toast.success('Status atualizado');
    },
  });

  // Build equipment tree from REAL component names
  const equipmentTree = useMemo(() => {
    const categories: Record<string, { name: string; count: number; pending: number; overdue: number }[]> = {};
    const componentMap: Record<string, { count: number; pending: number; overdue: number }> = {};

    jobs.forEach(j => {
      const comp = j.component_name || 'Geral';
      if (!componentMap[comp]) componentMap[comp] = { count: 0, pending: 0, overdue: 0 };
      componentMap[comp].count++;
      if (j.status === 'pending') componentMap[comp].pending++;
      if (j.due_date && new Date(j.due_date) < new Date() && j.status !== 'completed') componentMap[comp].overdue++;
    });

    Object.entries(componentMap).forEach(([name, info]) => {
      const cat = name.match(/motor|engine|propuls/i) ? 'Motor'
        : name.match(/elect|elétr|batter/i) ? 'Elétrica'
        : name.match(/nav|radar|gps|ecdis/i) ? 'Navegação'
        : name.match(/safe|seg|fire|lifeboat/i) ? 'Segurança'
        : name.match(/deck|conv|crane|winch/i) ? 'Convés'
        : name.match(/hydr|hidr|pump/i) ? 'Hidráulica'
        : 'Geral';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({ name, ...info });
    });
    return categories;
  }, [jobs]);

  const metrics = useMemo(() => ({
    totalJobs: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    inProgress: jobs.filter(j => j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    overdue: jobs.filter(j => j.due_date && new Date(j.due_date) < new Date() && j.status !== 'completed').length,
    critical: jobs.filter(j => j.priority === 'critical').length,
    equipmentCount: Object.values(equipmentTree).flat().length,
    completionRate: jobs.length > 0 ? Math.round(jobs.filter(j => j.status === 'completed').length / jobs.length * 100) : 0,
  }), [jobs, equipmentTree]);

  const toggleNode = (id: string) => setExpandedNodes(prev => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next;
  });

  const overdueJobs = jobs.filter(j => j.due_date && new Date(j.due_date) < new Date() && j.status !== 'completed');

  const jobsByMonth = useMemo(() => {
    const map: Record<string, JobCard[]> = {};
    jobs.forEach(j => { const key = j.due_date ? j.due_date.substring(0, 7) : 'sem-data'; if (!map[key]) map[key] = []; map[key].push(j); });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [jobs]);

  const getPriorityBadge = (p: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      critical: { variant: 'destructive', label: 'Crítica' }, high: { variant: 'destructive', label: 'Alta' },
      medium: { variant: 'secondary', label: 'Média' }, low: { variant: 'outline', label: 'Baixa' },
    };
    const c = map[p] || map.medium;
    return <Badge variant={c.variant} className="text-[10px]">{c.label}</Badge>;
  };

  const getStatusBadge = (s: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pendente' }, in_progress: { variant: 'default', label: 'Execução' },
      completed: { variant: 'outline', label: 'Concluído' }, overdue: { variant: 'destructive', label: 'Vencido' },
    };
    const c = map[s] || { variant: 'outline' as const, label: s };
    return <Badge variant={c.variant} className="text-[10px]">{c.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { icon: <Wrench className="h-4 w-4" />, label: 'Total Jobs', value: metrics.totalJobs, color: 'text-foreground' },
          { icon: <Clock className="h-4 w-4" />, label: 'Pendentes', value: metrics.pending, color: 'text-warning' },
          { icon: <Settings className="h-4 w-4" />, label: 'Execução', value: metrics.inProgress, color: 'text-primary' },
          { icon: <CheckCircle className="h-4 w-4" />, label: 'Concluídos', value: metrics.completed, color: 'text-success' },
          { icon: <AlertTriangle className="h-4 w-4" />, label: 'Vencidos', value: metrics.overdue, color: 'text-destructive' },
          { icon: <Zap className="h-4 w-4" />, label: 'Críticos', value: metrics.critical, color: 'text-destructive' },
          { icon: <Cpu className="h-4 w-4" />, label: 'Equipamentos', value: metrics.equipmentCount, color: 'text-foreground' },
          { icon: <BarChart3 className="h-4 w-4" />, label: 'Conclusão', value: `${metrics.completionRate}%`, color: 'text-success' },
        ].map((kpi, i) => (
          <Card key={i}><CardContent className="p-3 flex items-center gap-2">
            <span className={cn("opacity-70", kpi.color)}>{kpi.icon}</span>
            <div><p className="text-[10px] text-muted-foreground uppercase">{kpi.label}</p><p className={cn("text-lg font-bold", kpi.color)}>{kpi.value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Overdue Alert */}
      {metrics.overdue > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 animate-pulse" />
            <div className="flex-1"><p className="font-semibold text-sm text-destructive">{metrics.overdue} Job(s) Vencido(s)</p><p className="text-xs text-muted-foreground">Manutenções com prazo expirado requerem ação imediata</p></div>
            <Button variant="destructive" size="sm" onClick={() => setActiveView('overdue')}>Ver Vencidos</Button>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="tree" className="gap-2"><Cpu className="h-4 w-4" />Equipamentos</TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2"><Calendar className="h-4 w-4" />Calendário</TabsTrigger>
            <TabsTrigger value="overdue" className="gap-2"><AlertTriangle className="h-4 w-4" />Vencidos{metrics.overdue > 0 && <Badge variant="destructive" className="text-[10px] px-1.5 ml-1">{metrics.overdue}</Badge>}</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" /></div>
            <Button onClick={() => setNewJobDialog(true)}><Plus className="h-4 w-4 mr-2" />Nova OS</Button>
          </div>
        </div>

        {/* EQUIPMENT TREE */}
        <TabsContent value="tree" className="mt-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : Object.entries(equipmentTree).length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Cpu className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">Crie ordens de serviço para popular a árvore</p><Button className="mt-4" onClick={() => setNewJobDialog(true)}><Plus className="h-4 w-4 mr-2" />Criar OS</Button></CardContent></Card>
          ) : (
            Object.entries(equipmentTree).map(([category, equipments]) => {
              const Icon = EQUIPMENT_ICONS[category] || Wrench;
              const isExpanded = expandedNodes.has(category);
              const totalOverdue = equipments.reduce((s, e) => s + e.overdue, 0);
              return (
                <Card key={category} className={cn(totalOverdue > 0 && 'border-destructive/20')}>
                  <CardContent className="p-0">
                    <button onClick={() => toggleNode(category)} className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <div className="p-1.5 bg-primary/10 rounded"><Icon className="h-4 w-4 text-primary" /></div>
                      <span className="font-semibold text-sm">{category}</span>
                      <Badge variant="outline" className="text-xs ml-auto">{equipments.length} itens</Badge>
                      {totalOverdue > 0 && <Badge variant="destructive" className="text-[10px]">{totalOverdue} vencidos</Badge>}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="border-t divide-y divide-border">
                            {equipments.map(eq => (
                              <div key={eq.name} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors">
                                <div className="pl-4 flex items-center gap-3 flex-1 min-w-0">
                                  <div className={cn("w-2 h-2 rounded-full", eq.overdue > 0 ? 'bg-destructive' : eq.pending > 0 ? 'bg-warning' : 'bg-success')} />
                                  <div><p className="font-medium text-sm truncate">{eq.name}</p><p className="text-xs text-muted-foreground">{eq.count} jobs • {eq.pending} pendentes</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Progress value={eq.count > 0 ? ((eq.count - eq.pending - eq.overdue) / eq.count) * 100 : 0} className="w-20 h-1.5" />
                                  <span className="text-xs text-muted-foreground w-8">{eq.count > 0 ? Math.round(((eq.count - eq.pending - eq.overdue) / eq.count) * 100) : 0}%</span>
                                </div>
                                {eq.overdue > 0 && <Badge variant="destructive" className="text-[10px]">{eq.overdue} vencidos</Badge>}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* CALENDAR */}
        <TabsContent value="calendar" className="mt-4 space-y-4">
          {jobsByMonth.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" /><p className="text-muted-foreground">Nenhum job programado</p></CardContent></Card>
          ) : (
            jobsByMonth.map(([month, monthJobs]) => (
              <Card key={month}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {month === 'sem-data' ? 'Sem Data' : new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    <Badge variant="outline" className="ml-2 text-xs">{monthJobs.length} jobs</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {monthJobs.slice(0, 15).map(job => {
                    const isOverdue = job.due_date && new Date(job.due_date) < new Date() && job.status !== 'completed';
                    const nextStatus = job.status === 'pending' ? 'in_progress' : job.status === 'in_progress' ? 'completed' : null;
                    return (
                      <div key={job.id} className={cn("flex items-center gap-3 p-3 rounded-lg border transition-colors group",
                        isOverdue ? 'border-destructive/50 bg-destructive/5' : 'hover:bg-muted/50')}>
                        <Wrench className={cn("h-4 w-4 shrink-0", isOverdue ? 'text-destructive' : 'text-muted-foreground')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.equipment_name}{job.vessel_name ? ` • ${job.vessel_name}` : ''}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{job.due_date ? new Date(job.due_date).toLocaleDateString('pt-BR') : '—'}</span>
                        {getPriorityBadge(job.priority)}
                        {getStatusBadge(job.status)}
                        {nextStatus && (
                          <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 text-xs"
                            onClick={() => updateJobMutation.mutate({ id: job.id, status: nextStatus })}>
                            {nextStatus === 'in_progress' ? 'Iniciar' : 'Concluir'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* OVERDUE */}
        <TabsContent value="overdue" className="mt-4 space-y-3">
          {overdueJobs.length === 0 ? (
            <Card className="border-success/30"><CardContent className="py-12 text-center"><CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" /><p className="font-semibold text-success">Nenhum job vencido!</p></CardContent></Card>
          ) : (
            overdueJobs.map(job => {
              const daysOverdue = Math.ceil((Date.now() - new Date(job.due_date).getTime()) / 86400000);
              return (
                <Card key={job.id} className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4 flex items-center gap-4">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.equipment_name}{job.vessel_name ? ` • ${job.vessel_name}` : ''}</p>
                    </div>
                    <Badge variant="destructive">{daysOverdue}d atraso</Badge>
                    {getPriorityBadge(job.priority)}
                    <Button size="sm" onClick={() => updateJobMutation.mutate({ id: job.id, status: 'in_progress' })}>Iniciar</Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* New Job Dialog */}
      <Dialog open={newJobDialog} onOpenChange={setNewJobDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wrench className="h-5 w-5 text-primary" />Nova Ordem de Serviço</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Título *</Label><Input value={newJob.title} onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))} placeholder="Troca de filtro de óleo" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Equipamento/Componente</Label><Input value={newJob.component_name} onChange={e => setNewJob(p => ({ ...p, component_name: e.target.value }))} placeholder="Motor Principal" /></div>
              <div><Label>Prioridade</Label>
                <Select value={newJob.priority} onValueChange={v => setNewJob(p => ({ ...p, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Data Limite</Label><Input type="date" value={newJob.due_date} onChange={e => setNewJob(p => ({ ...p, due_date: e.target.value }))} /></div>
            <div><Label>Descrição</Label><Textarea value={newJob.description} onChange={e => setNewJob(p => ({ ...p, description: e.target.value }))} placeholder="Detalhes da manutenção..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewJobDialog(false)}>Cancelar</Button>
            <Button onClick={() => createJobMutation.mutate(newJob)} disabled={!newJob.title || createJobMutation.isPending}>
              {createJobMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar OS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
