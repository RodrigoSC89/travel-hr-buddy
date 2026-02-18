/**
 * Dry Dock Gantt Chart — Wave 5 PMS Enhancement
 * Interactive timeline visualization for drydock project tasks
 * BEATS: TM Master (Gantt chart for drydock projects)
 */
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Plus, Wrench, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, differenceInDays, addDays, parseISO, isWithinInterval } from 'date-fns';

const CATEGORIES = ['hull', 'machinery', 'piping', 'electrical', 'painting', 'class_survey', 'navigation'];
const CATEGORY_COLORS: Record<string, string> = {
  hull: 'bg-blue-500', machinery: 'bg-orange-500', piping: 'bg-cyan-500',
  electrical: 'bg-yellow-500', painting: 'bg-green-500', class_survey: 'bg-purple-500', navigation: 'bg-pink-500',
};
const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-muted text-muted-foreground', in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400', delayed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-muted text-muted-foreground',
};

interface GanttTask {
  id: string;
  task_name: string;
  category: string;
  planned_start: string;
  planned_end: string;
  actual_start: string | null;
  actual_end: string | null;
  progress_percent: number;
  is_critical_path: boolean;
  status: string;
  assigned_contractor: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
}

export function DryDockGanttChart({ projectId }: { projectId?: string }) {
  const [addOpen, setAddOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['drydock-gantt', projectId],
    queryFn: async () => {
      let q = (supabase.from as Function)('drydock_gantt_tasks').select('*').order('planned_start');
      if (projectId) q = q.eq('drydock_project_id', projectId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as GanttTask[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: Record<string, unknown>) => {
      const { error } = await (supabase.from as Function)('drydock_gantt_tasks').insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drydock-gantt'] });
      toast.success('Tarefa adicionada ao Gantt');
      setAddOpen(false);
    },
  });

  // Calculate timeline bounds
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (tasks.length === 0) return { minDate: new Date(), maxDate: addDays(new Date(), 30), totalDays: 30 };
    const dates = tasks.flatMap(t => [new Date(t.planned_start), new Date(t.planned_end)]);
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));
    return { minDate: min, maxDate: max, totalDays: Math.max(differenceInDays(max, min), 1) };
  }, [tasks]);

  // Stats
  const totalEstimated = tasks.reduce((a, t) => a + (t.estimated_cost || 0), 0);
  const totalActual = tasks.reduce((a, t) => a + (t.actual_cost || 0), 0);
  const criticalTasks = tasks.filter(t => t.is_critical_path).length;
  const avgProgress = tasks.length > 0 ? Math.round(tasks.reduce((a, t) => a + t.progress_percent, 0) / tasks.length) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Dry Dock Gantt Chart
          </h3>
          <p className="text-sm text-muted-foreground">
            {tasks.length} tarefas • {criticalTasks} caminho crítico • {avgProgress}% progresso médio
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3 w-3" /> Nova Tarefa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Tarefa Gantt</DialogTitle></DialogHeader>
            <CreateGanttTaskForm projectId={projectId} onSubmit={(f) => createMutation.mutate(f)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Orçamento</p><p className="text-lg font-bold">${(totalEstimated / 1000).toFixed(0)}K</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Realizado</p><p className="text-lg font-bold">${(totalActual / 1000).toFixed(0)}K</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Progresso</p><p className="text-lg font-bold">{avgProgress}%</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xs text-muted-foreground">Dias</p><p className="text-lg font-bold">{totalDays}</p></CardContent></Card>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardContent className="p-4 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Timeline Header */}
            <div className="flex border-b pb-2 mb-2">
              <div className="w-48 shrink-0 text-xs font-medium text-muted-foreground">Tarefa</div>
              <div className="flex-1 relative h-6">
                {Array.from({ length: Math.min(totalDays + 1, 60) }, (_, i) => {
                  if (i % 7 !== 0 && totalDays > 14) return null;
                  const date = addDays(minDate, i);
                  return (
                    <span
                      key={i}
                      className="absolute text-[10px] text-muted-foreground"
                      style={{ left: `${(i / totalDays) * 100}%` }}
                    >
                      {format(date, 'dd/MM')}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Tasks */}
            {CATEGORIES.map(cat => {
              const catTasks = tasks.filter(t => t.category === cat);
              if (catTasks.length === 0) return null;
              return (
                <div key={cat} className="mb-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">{cat.replace('_', ' ')}</p>
                  {catTasks.map(task => {
                    const startOffset = differenceInDays(parseISO(task.planned_start), minDate);
                    const duration = differenceInDays(parseISO(task.planned_end), parseISO(task.planned_start));
                    const left = (startOffset / totalDays) * 100;
                    const width = Math.max((duration / totalDays) * 100, 2);

                    return (
                      <div key={task.id} className="flex items-center h-8 mb-0.5">
                        <div className="w-48 shrink-0 flex items-center gap-1 text-xs truncate pr-2">
                          {task.is_critical_path && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                          <span className="truncate">{task.task_name}</span>
                        </div>
                        <div className="flex-1 relative h-6 bg-muted/30 rounded">
                          <div
                            className={`absolute h-full rounded ${CATEGORY_COLORS[cat]} opacity-30`}
                            style={{ left: `${left}%`, width: `${width}%` }}
                          />
                          <div
                            className={`absolute h-full rounded ${CATEGORY_COLORS[cat]}`}
                            style={{ left: `${left}%`, width: `${width * (task.progress_percent / 100)}%` }}
                          />
                          <span
                            className="absolute text-[9px] font-medium text-foreground"
                            style={{ left: `${left + width / 2}%`, transform: 'translateX(-50%)', top: '3px' }}
                          >
                            {task.progress_percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {tasks.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground text-center py-8">Adicione tarefas para visualizar o Gantt</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap">
        {CATEGORIES.map(cat => (
          <div key={cat} className="flex items-center gap-1 text-xs">
            <div className={`w-3 h-3 rounded ${CATEGORY_COLORS[cat]}`} />
            <span className="text-muted-foreground capitalize">{cat.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateGanttTaskForm({ projectId, onSubmit }: { projectId?: string; onSubmit: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({
    task_name: '', category: 'hull', planned_start: '', planned_end: '',
    assigned_contractor: '', estimated_cost: '', is_critical_path: false,
  });
  return (
    <div className="space-y-3">
      <div><Label>Nome da Tarefa</Label><Input value={form.task_name} onChange={e => setForm(f => ({ ...f, task_name: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Categoria</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Custo Est. (USD)</Label><Input type="number" value={form.estimated_cost} onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))} /></div>
        <div><Label>Início Planejado</Label><Input type="date" value={form.planned_start} onChange={e => setForm(f => ({ ...f, planned_start: e.target.value }))} /></div>
        <div><Label>Fim Planejado</Label><Input type="date" value={form.planned_end} onChange={e => setForm(f => ({ ...f, planned_end: e.target.value }))} /></div>
      </div>
      <div><Label>Empreiteiro</Label><Input value={form.assigned_contractor} onChange={e => setForm(f => ({ ...f, assigned_contractor: e.target.value }))} /></div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={form.is_critical_path} onChange={e => setForm(f => ({ ...f, is_critical_path: e.target.checked }))} />
        <Label>Caminho Crítico</Label>
      </div>
      <Button className="w-full" onClick={() => onSubmit({
        drydock_project_id: projectId || '00000000-0000-0000-0000-000000000000',
        task_name: form.task_name,
        category: form.category,
        planned_start: form.planned_start,
        planned_end: form.planned_end,
        assigned_contractor: form.assigned_contractor || null,
        estimated_cost: Number(form.estimated_cost) || null,
        is_critical_path: form.is_critical_path,
        status: 'planned',
        progress_percent: 0,
      })}>Adicionar Tarefa</Button>
    </div>
  );
}
