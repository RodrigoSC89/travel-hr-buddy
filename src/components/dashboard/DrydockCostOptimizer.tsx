/**
 * Wave 37: Drydock Cost Optimizer
 * Budget vs spent tracking, scope analysis, schedule performance
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Anchor, DollarSign, Clock, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DrydockCostOptimizer() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['drydock-optimizer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drydock_projects')
        .select('id, vessel_name, budget_usd, spent_usd, days_planned, days_elapsed, status, class_reqs, class_completed, yard_name, start_date, end_date')
        .order('start_date', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const metrics = useMemo(() => {
    const totalBudget = projects.reduce((s, p) => s + (p.budget_usd || 0), 0);
    const totalSpent = projects.reduce((s, p) => s + (p.spent_usd || 0), 0);
    const budgetVariance = totalBudget > 0 ? ((totalSpent - totalBudget) / totalBudget) * 100 : 0;

    const active = projects.filter(p => p.status === 'in_progress' || p.status === 'active');
    const completed = projects.filter(p => p.status === 'completed' || p.status === 'done');

    // Schedule performance
    const totalPlanned = projects.reduce((s, p) => s + (p.days_planned || 0), 0);
    const totalElapsed = projects.reduce((s, p) => s + (p.days_elapsed || 0), 0);
    const scheduleVariance = totalPlanned > 0 ? ((totalElapsed - totalPlanned) / totalPlanned) * 100 : 0;

    // Class requirements
    const totalClassReqs = projects.reduce((s, p) => s + (p.class_reqs || 0), 0);
    const totalClassDone = projects.reduce((s, p) => s + (p.class_completed || 0), 0);
    const classCompletion = totalClassReqs > 0 ? (totalClassDone / totalClassReqs) * 100 : 100;

    return {
      totalProjects: projects.length,
      activeProjects: active.length,
      completedProjects: completed.length,
      totalBudget,
      totalSpent,
      budgetVariance: Math.round(budgetVariance),
      scheduleVariance: Math.round(scheduleVariance),
      classCompletion: Math.round(classCompletion),
      totalClassReqs,
      totalClassDone,
      projectList: projects.slice(0, 5),
    };
  }, [projects]);

  if (isLoading) return <Skeleton className="h-[400px]" />;

  const fmt = (val: number) => val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${(val / 1000).toFixed(0)}K`;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Anchor className="h-5 w-5 text-hub-maintenance" />
            Drydock Cost Optimizer
          </CardTitle>
          <Badge variant="outline" className={metrics.budgetVariance <= 0
            ? 'bg-success/10 text-success border-success/20'
            : metrics.budgetVariance <= 10
            ? 'bg-warning/10 text-warning border-warning/20'
            : 'bg-destructive/10 text-destructive border-destructive/20'
          }>
            {metrics.budgetVariance > 0 ? '+' : ''}{metrics.budgetVariance}% budget
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: DollarSign, value: fmt(metrics.totalBudget), label: 'Budget', color: 'text-primary' },
            { icon: BarChart3, value: fmt(metrics.totalSpent), label: 'Gasto', color: metrics.totalSpent > metrics.totalBudget ? 'text-destructive' : 'text-success' },
            { icon: Clock, value: `${metrics.scheduleVariance > 0 ? '+' : ''}${metrics.scheduleVariance}%`, label: 'Schedule', color: metrics.scheduleVariance > 0 ? 'text-warning' : 'text-success' },
            { icon: CheckCircle2, value: metrics.activeProjects, label: 'Ativos', color: 'text-muted-foreground' },
          ].map((kpi, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/50">
              <kpi.icon className={`h-4 w-4 mx-auto ${kpi.color} mb-1`} />
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Budget utilization */}
        {metrics.totalBudget > 0 && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Utilização de Budget</span>
              <span>{fmt(metrics.totalSpent)} / {fmt(metrics.totalBudget)}</span>
            </div>
            <Progress value={Math.min((metrics.totalSpent / metrics.totalBudget) * 100, 100)} className="h-2" />
          </div>
        )}

        {/* Class Requirements */}
        {metrics.totalClassReqs > 0 && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Requisitos de Classe</span>
              <span>{metrics.totalClassDone}/{metrics.totalClassReqs}</span>
            </div>
            <Progress value={metrics.classCompletion} className="h-2" />
          </div>
        )}

        {/* Project list */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Projetos de Doca Seca</p>
          {metrics.projectList.map(p => {
            const budgetPct = p.budget_usd > 0 ? ((p.spent_usd || 0) / p.budget_usd) * 100 : 0;
            return (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground truncate block">{p.vessel_name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.yard_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16">
                    <Progress value={Math.min(budgetPct, 100)} className="h-1.5" />
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${
                    p.status === 'completed' || p.status === 'done' ? 'bg-success/10 text-success'
                    : p.status === 'in_progress' || p.status === 'active' ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                    {p.status}
                  </Badge>
                </div>
              </div>
            );
          })}
          {metrics.totalProjects === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum projeto de drydock</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
