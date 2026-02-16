/**
 * MaintenanceKPIs - Live maintenance KPIs from Supabase
 * Surpasses AMOS/Sertica: real-time vs weekly manual reports
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, CheckCircle, AlertTriangle, Clock, Gauge } from "lucide-react";

interface MaintenanceKPIsProps {
  vesselId?: string;
}

export function MaintenanceKPIs({ vesselId }: MaintenanceKPIsProps) {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["maintenance-kpis", vesselId],
    queryFn: async () => {
      const baseQuery = supabase.from("maintenance_tasks").select("status,priority,component_name");
      const query = vesselId ? baseQuery.eq("vessel_id", vesselId) : baseQuery;
      const { data, error } = await query;
      if (error) throw error;

      const tasks = data ?? [];
      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === "completed").length;
      const overdue = tasks.filter((t) => t.status === "overdue").length;
      const critical = tasks.filter(
        (t) => t.priority === "critical" && t.status !== "completed"
      ).length;
      const inProgress = tasks.filter((t) => t.status === "in_progress").length;
      const efficiency = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { total, completed, overdue, critical, inProgress, efficiency };
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const items = [
    { icon: Wrench, label: "Total Jobs", value: kpis?.total ?? 0, color: "text-primary" },
    { icon: CheckCircle, label: "Concluídos", value: kpis?.completed ?? 0, color: "text-success" },
    { icon: Clock, label: "Em Andamento", value: kpis?.inProgress ?? 0, color: "text-info" },
    { icon: AlertTriangle, label: "Vencidos", value: kpis?.overdue ?? 0, color: "text-destructive" },
    { icon: AlertTriangle, label: "Críticos", value: kpis?.critical ?? 0, color: "text-warning" },
    { icon: Gauge, label: "Eficiência", value: `${kpis?.efficiency ?? 0}%`, color: "text-primary" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          Manutenção — KPIs ao Vivo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
