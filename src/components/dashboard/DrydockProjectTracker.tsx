/**
 * DrydockProjectTracker - Active drydock projects with budget vs actual tracking
 * Uses drydock_projects (budget_usd, spent_usd, vessel_name) + drydock_gantt_tasks (drydock_project_id)
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Anchor, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";

export function DrydockProjectTracker() {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["drydock-projects-tracker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drydock_projects")
        .select("id, vessel_name, yard_name, start_date, end_date, budget_usd, spent_usd, status, days_planned, days_elapsed")
        .order("created_at", { ascending: false })
        .limit(10);
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
        .select("id, drydock_project_id, task_name, status, is_critical_path")
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const enrichedProjects = useMemo(() => {
    return projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.drydock_project_id === p.id);
      const completedTasks = projectTasks.filter((t) => t.status === "completed").length;
      const criticalPending = projectTasks.filter((t) => t.is_critical_path && t.status !== "completed").length;
      const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 
        (p.days_planned > 0 ? Math.min(100, Math.round((p.days_elapsed / p.days_planned) * 100)) : 0);

      const budget = p.budget_usd || 0;
      const actual = p.spent_usd || 0;
      const budgetVariance = budget > 0 ? ((actual - budget) / budget) * 100 : 0;

      const startDate = p.start_date ? parseISO(p.start_date) : null;
      const endDate = p.end_date ? parseISO(p.end_date) : null;
      const daysRemaining = endDate ? differenceInDays(endDate, new Date()) : null;

      return {
        ...p,
        progress,
        totalTasks: projectTasks.length,
        completedTasks,
        criticalPending,
        budget,
        actual,
        budgetVariance,
        startDate,
        endDate,
        daysRemaining,
      };
    });
  }, [projects, tasks]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Anchor className="h-5 w-5 text-primary" />
            Drydock Projects
          </CardTitle>
          <Badge variant="outline">{enrichedProjects.length} projetos</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {enrichedProjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum projeto de doca seca cadastrado.
          </div>
        ) : (
          <div className="space-y-4">
            {enrichedProjects.map((proj) => (
              <div key={proj.id} className="p-4 rounded-xl border border-border/40 bg-card/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm">{proj.vessel_name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {proj.yard_name} • {proj.startDate ? format(proj.startDate, "dd/MM/yy") : "—"} → {proj.endDate ? format(proj.endDate, "dd/MM/yy") : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {proj.daysRemaining !== null && proj.daysRemaining >= 0 ? (
                      <Badge variant="outline" className="text-[10px] bg-info/10 text-info">
                        <Clock className="h-3 w-3 mr-1" />{proj.daysRemaining}d restantes
                      </Badge>
                    ) : proj.daysRemaining !== null ? (
                      <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />{Math.abs(proj.daysRemaining)}d atrasado
                      </Badge>
                    ) : null}
                    {proj.status === "completed" && (
                      <Badge variant="outline" className="text-[10px] bg-success/10 text-success">
                        <CheckCircle className="h-3 w-3 mr-1" />Concluído
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {proj.totalTasks > 0 ? `${proj.completedTasks}/${proj.totalTasks} tarefas` : `${proj.days_elapsed}/${proj.days_planned} dias`}
                    </span>
                    <span className="font-medium">{proj.progress}%</span>
                  </div>
                  <Progress value={proj.progress} className="h-2" />
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span>Orçamento: <span className="font-medium">${proj.budget.toLocaleString()}</span></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Real: <span className={`font-medium ${proj.budgetVariance > 10 ? "text-destructive" : proj.budgetVariance > 0 ? "text-warning" : "text-success"}`}>${proj.actual.toLocaleString()}</span></span>
                  </div>
                  {proj.criticalPending > 0 && (
                    <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning ml-auto">
                      {proj.criticalPending} itens críticos
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DrydockProjectTracker;
