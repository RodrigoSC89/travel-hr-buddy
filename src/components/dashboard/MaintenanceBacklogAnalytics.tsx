/**
 * Maintenance Backlog Analytics - Task aging and priority breakdown
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, AlertTriangle, Clock, CheckCircle2, Timer } from "lucide-react";
import { useMemo } from "react";
import { differenceInDays } from "date-fns";

export function MaintenanceBacklogAnalytics() {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["maint-backlog-analytics"],
    queryFn: async () => {
      const { data } = await supabase
        .from("maintenance_tasks")
        .select("id, title, status, priority, created_at, due_date, component_name, vessel_id")
        .order("created_at", { ascending: false })
        .limit(200);
      return data || [];
    },
    staleTime: 30000,
  });

  const analytics = useMemo(() => {
    const today = new Date();
    const pending = tasks.filter((t) => t.status === "pending" || t.status === "open");
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const completed = tasks.filter((t) => t.status === "completed" || t.status === "closed");
    const overdue = pending.filter((t) => t.due_date && new Date(t.due_date) < today);

    // Aging buckets
    const aging = pending.reduce(
      (acc, t) => {
        const age = differenceInDays(today, new Date(t.created_at));
        if (age <= 7) acc["0-7d"]++;
        else if (age <= 30) acc["8-30d"]++;
        else if (age <= 90) acc["31-90d"]++;
        else acc["90d+"]++;
        return acc;
      },
      { "0-7d": 0, "8-30d": 0, "31-90d": 0, "90d+": 0 } as Record<string, number>
    );

    // Priority breakdown
    const byPriority = tasks.reduce(
      (acc, t) => {
        const p = (t.priority || "medium").toLowerCase();
        if (p === "critical" || p === "emergency") acc.critical++;
        else if (p === "high") acc.high++;
        else if (p === "medium") acc.medium++;
        else acc.low++;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0 }
    );

    const completionRate = tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

    return {
      total: tasks.length,
      pending: pending.length,
      inProgress: inProgress.length,
      completed: completed.length,
      overdue: overdue.length,
      aging,
      byPriority,
      completionRate,
    };
  }, [tasks]);

  const agingColors: Record<string, string> = {
    "0-7d": "bg-success",
    "8-30d": "bg-info",
    "31-90d": "bg-warning",
    "90d+": "bg-destructive",
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-5 w-5 text-hub-maintenance" />
            Maintenance Backlog Analytics
          </CardTitle>
          <Badge variant="outline" className="text-[10px] h-5">
            {analytics.total} total tasks
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Status Summary */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Pending", value: analytics.pending, icon: Clock, color: "text-warning" },
                { label: "In Progress", value: analytics.inProgress, icon: Timer, color: "text-info" },
                { label: "Completed", value: analytics.completed, icon: CheckCircle2, color: "text-success" },
                { label: "Overdue", value: analytics.overdue, icon: AlertTriangle, color: "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 rounded-lg bg-muted/30">
                  <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Completion Rate */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium text-foreground">{analytics.completionRate}%</span>
              </div>
              <Progress value={analytics.completionRate} className="h-2" />
            </div>

            {/* Aging Breakdown */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Backlog Aging (Pending Tasks)</p>
              <div className="space-y-1.5">
                {Object.entries(analytics.aging).map(([bucket, count]) => (
                  <div key={bucket} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-10">{bucket}</span>
                    <div className="flex-1 h-4 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${agingColors[bucket]} rounded-full transition-all duration-500`}
                        style={{
                          width: `${analytics.pending > 0 ? (count / analytics.pending) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Breakdown */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Priority Distribution</p>
              <div className="flex gap-2">
                {[
                  { label: "Critical", value: analytics.byPriority.critical, color: "bg-destructive/10 text-destructive border-destructive/20" },
                  { label: "High", value: analytics.byPriority.high, color: "bg-warning/10 text-warning border-warning/20" },
                  { label: "Medium", value: analytics.byPriority.medium, color: "bg-info/10 text-info border-info/20" },
                  { label: "Low", value: analytics.byPriority.low, color: "bg-muted text-muted-foreground border-border" },
                ].map((p) => (
                  <Badge key={p.label} variant="outline" className={`text-[10px] ${p.color}`}>
                    {p.label}: {p.value}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
