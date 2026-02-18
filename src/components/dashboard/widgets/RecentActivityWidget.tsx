import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Activity, Wrench, FileText, AlertTriangle, Ship, Users, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

interface ActivityItem {
  id: string;
  action: string;
  resource_type: string;
  resource_name: string | null;
  created_at: string;
}

const typeIcons: Record<string, { icon: typeof Activity; color: string }> = {
  maintenance: { icon: Wrench, color: "text-warning" },
  vessel: { icon: Ship, color: "text-primary" },
  crew: { icon: Users, color: "text-chart-2" },
  certificate: { icon: FileText, color: "text-success" },
  compliance: { icon: Shield, color: "text-accent" },
  incident: { icon: AlertTriangle, color: "text-destructive" },
};

function getIconForType(type: string) {
  const lower = type.toLowerCase();
  for (const [key, val] of Object.entries(typeIcons)) {
    if (lower.includes(key)) return val;
  }
  return { icon: Activity, color: "text-primary" };
}

export default function RecentActivityWidget() {
  const { data: logs = [] } = useQuery({
    queryKey: ["activity-widget-v3"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_trail")
        .select("id, action, resource_type, resource_name, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      return (data || []) as ActivityItem[];
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Atividade Recente</p>
        <span className="text-[10px] text-muted-foreground">{logs.length} eventos</span>
      </div>

      <div className="space-y-1">
        {logs.map((log, i) => {
          const cfg = getIconForType(log.resource_type || "");
          const Icon = cfg.icon;
          return (
            <motion.div
              key={log.id}
              className="flex items-start gap-2 p-1.5 rounded-md hover:bg-muted/40 transition-colors"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className={`p-1 rounded-md bg-muted/60 mt-0.5`}>
                <Icon className={`h-3 w-3 ${cfg.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium text-foreground truncate">{log.action}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span>{log.resource_type}</span>
                  {log.resource_name && (
                    <>
                      <span>•</span>
                      <span className="truncate">{log.resource_name}</span>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground/60 text-[9px]">
                  {log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR }) : ""}
                </p>
              </div>
            </motion.div>
          );
        })}
        {logs.length === 0 && (
          <div className="flex flex-col items-center py-4 text-center">
            <Activity className="h-5 w-5 text-muted-foreground/40 mb-1" />
            <p className="text-xs text-muted-foreground">Nenhuma atividade recente</p>
          </div>
        )}
      </div>
    </div>
  );
}
