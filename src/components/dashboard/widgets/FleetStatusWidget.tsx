import React, { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Ship, Anchor, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface VesselRow {
  id: string;
  name: string;
  status: string | null;
  vessel_type: string | null;
}

export default function FleetStatusWidget() {
  const { data: vessels = [] } = useQuery({
    queryKey: ["fleet-widget-v3"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name, status, vessel_type").limit(10);
      return (data || []) as VesselRow[];
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const stats = useMemo(() => {
    const active = vessels.filter(v => v.status === "active" || v.status === "operational").length;
    const maintenance = vessels.filter(v => v.status === "maintenance" || v.status === "drydock").length;
    const docked = vessels.filter(v => v.status === "docked" || v.status === "idle" || v.status === "laid_up").length;
    const utilization = vessels.length > 0 ? Math.round((active / vessels.length) * 100) : 0;
    return { active, maintenance, docked, utilization, total: vessels.length };
  }, [vessels]);

  const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
    active: { color: "bg-success/15 text-success border-success/30", dot: "bg-success", label: "Ativo" },
    operational: { color: "bg-success/15 text-success border-success/30", dot: "bg-success", label: "Operacional" },
    maintenance: { color: "bg-warning/15 text-warning border-warning/30", dot: "bg-warning", label: "Manutenção" },
    drydock: { color: "bg-warning/15 text-warning border-warning/30", dot: "bg-warning", label: "Doca Seca" },
    docked: { color: "bg-primary/15 text-primary border-primary/30", dot: "bg-primary", label: "Atracado" },
    idle: { color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground", label: "Parado" },
    laid_up: { color: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground", label: "Laid-up" },
  };

  return (
    <div className="space-y-3">
      {/* Header with utilization */}
      <div className="flex items-center justify-between">
        <div>
          <motion.div
            className="text-3xl font-bold text-foreground"
            key={stats.total}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {stats.total}
          </motion.div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Embarcações</p>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${stats.utilization >= 80 ? 'text-success' : stats.utilization >= 50 ? 'text-warning' : 'text-destructive'}`}>
            {stats.utilization}%
          </div>
          <p className="text-[10px] text-muted-foreground">Utilização</p>
        </div>
      </div>

      {/* Status Breakdown Bar */}
      <div className="space-y-1">
        <div className="flex h-2 rounded-full overflow-hidden bg-muted">
          {stats.active > 0 && (
            <motion.div
              className="bg-success h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.active / stats.total) * 100}%` }}
              transition={{ duration: 0.8 }}
            />
          )}
          {stats.maintenance > 0 && (
            <motion.div
              className="bg-warning h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.maintenance / stats.total) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
            />
          )}
          {stats.docked > 0 && (
            <motion.div
              className="bg-primary h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.docked / stats.total) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          )}
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />{stats.active} ativos</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" />{stats.maintenance} manut.</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />{stats.docked} atracados</span>
        </div>
      </div>

      {/* Vessel List */}
      <div className="space-y-1">
        {vessels.slice(0, 5).map((v, i) => {
          const cfg = statusConfig[v.status || "active"] || statusConfig.active;
          return (
            <motion.div
              key={v.id}
              className="flex items-center justify-between text-xs p-1 rounded-md hover:bg-muted/40 transition-colors"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <span className="flex items-center gap-1.5 truncate min-w-0">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot, v.status === "active" && "animate-pulse")} />
                <Ship className="h-3 w-3 text-primary shrink-0" />
                <span className="truncate text-foreground">{v.name}</span>
              </span>
              <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 shrink-0", cfg.color)}>
                {cfg.label}
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
