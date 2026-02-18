/**
 * Wave 30: Workflow Automation Engine
 * Task automation analytics, approval pipeline, efficiency metrics
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Workflow, CheckCircle2, Clock, AlertCircle, Zap, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function WorkflowAutomationEngine() {
  const { data: actionItems = [], isLoading } = useQuery({
    queryKey: ['workflow-action-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_items')
        .select('id, title, status, priority, due_date, completion_date, created_at, source_module')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const metrics = useMemo(() => {
    const completed = actionItems.filter(a => a.status === 'completed' || a.status === 'done');
    const pending = actionItems.filter(a => a.status === 'pending' || a.status === 'open');
    const inProgress = actionItems.filter(a => a.status === 'in_progress');
    const overdue = actionItems.filter(a => {
      if (!a.due_date || a.status === 'completed' || a.status === 'done') return false;
      return new Date(a.due_date) < new Date();
    });

    // Avg completion time (days)
    const withCompletion = completed.filter(a => a.completion_date && a.created_at);
    let avgDays = 0;
    if (withCompletion.length > 0) {
      const totalMs = withCompletion.reduce((sum, a) => {
        return sum + (new Date(a.completion_date!).getTime() - new Date(a.created_at!).getTime());
      }, 0);
      avgDays = totalMs / withCompletion.length / (1000 * 60 * 60 * 24);
    }

    // By module
    const byModule: Record<string, number> = {};
    actionItems.forEach(a => {
      const mod = a.source_module || 'general';
      byModule[mod] = (byModule[mod] || 0) + 1;
    });
    const topModules = Object.entries(byModule)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const completionRate = actionItems.length > 0 ? (completed.length / actionItems.length) * 100 : 0;

    return {
      total: actionItems.length,
      completed: completed.length,
      pending: pending.length,
      inProgress: inProgress.length,
      overdue: overdue.length,
      avgDays: avgDays.toFixed(1),
      completionRate: Math.round(completionRate),
      topModules,
    };
  }, [actionItems]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="h-5 w-5 text-hub-workbench" />
            Workflow Automation
          </CardTitle>
          <Badge variant="outline" className="bg-hub-workbench/10 text-hub-workbench border-hub-workbench/20">
            {metrics.completionRate}% concluído
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: CheckCircle2, value: metrics.completed, label: 'Concluídas', color: 'text-success' },
            { icon: Clock, value: metrics.inProgress, label: 'Em Andamento', color: 'text-primary' },
            { icon: AlertCircle, value: metrics.overdue, label: 'Atrasadas', color: 'text-destructive' },
            { icon: Zap, value: `${metrics.avgDays}d`, label: 'Tempo Médio', color: 'text-warning' },
          ].map((kpi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-4 w-4 mx-auto ${kpi.color} mb-1`} />
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Completion Progress */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Taxa de Conclusão</span>
            <span>{metrics.completed}/{metrics.total}</span>
          </div>
          <Progress value={metrics.completionRate} className="h-2" />
        </div>

        {/* Top Modules */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <BarChart3 className="h-3 w-3" /> Tarefas por Módulo
          </p>
          {metrics.topModules.map(([mod, count]) => (
            <div key={mod} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <span className="text-sm text-foreground capitalize">{mod.replace(/_/g, ' ')}</span>
              <div className="flex items-center gap-2">
                <div className="w-20">
                  <Progress value={(count / metrics.total) * 100} className="h-1.5" />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
          {metrics.topModules.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tarefa registrada</p>
          )}
        </div>

        {/* Recent Overdue */}
        {metrics.overdue > 0 && (
          <div className="border-t border-border/50 pt-3 space-y-1.5">
            <p className="text-xs font-medium text-destructive">⚠️ {metrics.overdue} tarefas atrasadas</p>
            {actionItems
              .filter(a => a.due_date && new Date(a.due_date) < new Date() && a.status !== 'completed' && a.status !== 'done')
              .slice(0, 3)
              .map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-destructive/5">
                  <span className="truncate text-foreground">{item.title}</span>
                  <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive">
                    {item.priority || 'medium'}
                  </Badge>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
