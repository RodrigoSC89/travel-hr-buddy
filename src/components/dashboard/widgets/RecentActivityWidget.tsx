import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RecentActivityWidget() {
  const { data: logs = [] } = useQuery({
    queryKey: ["activity-widget"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_trail")
        .select("id, action, resource_type, resource_name, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
    staleTime: 30_000,
  });

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">Últimas atividades</p>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 text-xs">
            <Activity className="h-3 w-3 mt-0.5 text-primary shrink-0" />
            <div className="min-w-0">
              <span className="font-medium">{log.action}</span>
              <span className="text-muted-foreground"> em {log.resource_type}</span>
              {log.resource_name && (
                <span className="text-muted-foreground"> ({log.resource_name})</span>
              )}
              <p className="text-muted-foreground/70 text-[10px]">
                {log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR }) : ""}
              </p>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhuma atividade recente</p>
        )}
      </div>
    </div>
  );
}
