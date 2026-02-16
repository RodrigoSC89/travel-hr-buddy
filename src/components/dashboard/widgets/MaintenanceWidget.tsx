import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function MaintenanceWidget() {
  const { data: tasks = [] } = useQuery({
    queryKey: ["maintenance-widget"],
    queryFn: async () => {
      const { data } = await supabase
        .from("maintenance_tasks")
        .select("id, title, status, priority")
        .in("status", ["pending", "in_progress", "overdue"])
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    staleTime: 60_000,
  });

  const priorityColors: Record<string, string> = {
    critical: "text-destructive",
    high: "text-warning",
    medium: "text-primary",
    low: "text-muted-foreground",
  };

  return (
    <div className="space-y-2">
      <div className="text-2xl font-bold text-foreground">{tasks.length}</div>
      <p className="text-xs text-muted-foreground">Tarefas pendentes</p>
      <div className="space-y-1.5 mt-2">
        {tasks.slice(0, 4).map((t) => (
          <div key={t.id} className="flex items-center justify-between text-xs">
            <span className="truncate max-w-[70%]">{t.title}</span>
            <Badge variant="outline" className={`text-[10px] ${priorityColors[t.priority || "medium"]}`}>
              {t.priority || "medium"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
