import React, { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertTriangle, Clock, CheckCircle2, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface TaskItem {
  id: string;
  title: string;
  status: string | null;
  priority: string | null;
  due_date: string | null;
}

interface PredictionItem {
  id: string;
  equipment_name: string;
  failure_probability: number;
}

interface MaintenanceStats {
  pending: number;
  inProgress: number;
  overdue: number;
  completedThisMonth: number;
  critical: number;
  tasks: TaskItem[];
  predictions: PredictionItem[];
}

export default function MaintenanceWidget() {
  const { data } = useQuery<MaintenanceStats>({
    queryKey: ["maintenance-widget-v3"],
    queryFn: async (): Promise<MaintenanceStats> => {
      const [tasksRes, predsRes] = await Promise.all([
        supabase.from("maintenance_tasks")
          .select("id, title, status, priority, due_date")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("ai_maintenance_predictions")
          .select("id, equipment_name, failure_probability")
          .gte("failure_probability", 0.6)
          .order("failure_probability", { ascending: false })
          .limit(3),
      ]);

      const tasks = (tasksRes.data || []) as TaskItem[];
      const preds = (predsRes.data || []) as PredictionItem[];
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      return {
        pending: tasks.filter(t => t.status === "pending").length,
        inProgress: tasks.filter(t => t.status === "in_progress").length,
        overdue: tasks.filter(t => t.status === "overdue").length,
        completedThisMonth: tasks.filter(t => t.status === "completed" && t.due_date && t.due_date >= monthStart).length,
        critical: tasks.filter(t => t.priority === "critical").length,
        tasks: tasks.filter(t => t.status !== "completed").slice(0, 4),
        predictions: preds,
      };
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const healthScore = useMemo(() => {
    if (!data) return 100;
    const total = data.pending + data.inProgress + data.overdue + data.completedThisMonth;
    if (total === 0) return 100;
    const penalty = (data.overdue * 15) + (data.critical * 10);
    return Math.max(0, Math.min(100, 100 - penalty));
  }, [data]);

  const priorityConfig: Record<string, { color: string; bg: string }> = {
    critical: { color: "text-destructive", bg: "bg-destructive/10" },
    high: { color: "text-warning", bg: "bg-warning/10" },
    medium: { color: "text-primary", bg: "bg-primary/10" },
    low: { color: "text-muted-foreground", bg: "bg-muted" },
  };

  return (
    <div className="space-y-3">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "Pendente", value: data?.pending || 0, icon: Clock, color: "text-warning" },
          { label: "Andamento", value: data?.inProgress || 0, icon: Wrench, color: "text-primary" },
          { label: "Atrasada", value: data?.overdue || 0, icon: AlertTriangle, color: "text-destructive" },
          { label: "Concluída", value: data?.completedThisMonth || 0, icon: CheckCircle2, color: "text-success" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            className="text-center p-1.5 rounded-md bg-muted/40"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <stat.icon className={`h-3 w-3 mx-auto mb-0.5 ${stat.color}`} />
            <div className="text-sm font-bold text-foreground">{stat.value}</div>
            <div className="text-[8px] text-muted-foreground leading-tight">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-1">
        {data?.tasks.map((t: TaskItem, i: number) => {
          const cfg = priorityConfig[t.priority || "medium"] || priorityConfig.medium;
          const isOverdue = t.status === "overdue";
          return (
            <motion.div
              key={t.id}
              className={`flex items-center justify-between text-xs p-1.5 rounded-md ${isOverdue ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted/30'}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <span className="truncate max-w-[65%] text-foreground">{t.title}</span>
              <Badge variant="outline" className={`text-[9px] px-1 py-0 ${cfg.color} border-transparent ${cfg.bg}`}>
                {t.priority || "med"}
              </Badge>
            </motion.div>
          );
        })}
      </div>

      {/* AI Predictions Alert */}
      {(data?.predictions?.length ?? 0) > 0 && (
        <motion.div
          className="p-2 rounded-md bg-accent/10 border border-accent/20 space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-1 text-[10px] font-medium text-accent-foreground">
            <TrendingDown className="h-3 w-3 text-accent" />
            Previsões IA
          </div>
          {data?.predictions.map((p: PredictionItem) => (
            <div key={p.id} className="flex items-center justify-between text-[10px]">
              <span className="truncate max-w-[70%] text-muted-foreground">{p.equipment_name}</span>
              <span className={`font-medium ${p.failure_probability >= 0.8 ? 'text-destructive' : 'text-warning'}`}>
                {Math.round(p.failure_probability * 100)}% risco
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
