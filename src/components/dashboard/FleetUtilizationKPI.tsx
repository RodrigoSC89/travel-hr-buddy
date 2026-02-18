/**
 * FleetUtilizationKPI - Fleet utilization % and idle time analysis
 * Shows operational vs idle vs maintenance breakdown
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Ship, Clock, Wrench } from "lucide-react";

export function FleetUtilizationKPI() {
  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["fleet-utilization-kpi"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vessels")
        .select("id, name, status, vessel_type, updated_at")
        .order("name");
      return data || [];
    },
    staleTime: 30000,
  });

  const { data: voyages = [] } = useQuery({
    queryKey: ["fleet-utilization-voyages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("voyage_plans")
        .select("id, vessel_id, status")
        .in("status", ["in_progress", "active", "underway"]);
      return data || [];
    },
    staleTime: 30000,
  });

  const total = vessels.length;
  const operational = vessels.filter(v => v.status === "active" || v.status === "operational").length;
  const inMaintenance = vessels.filter(v => v.status === "maintenance" || v.status === "drydock").length;
  const idle = vessels.filter(v => v.status === "idle" || v.status === "laid_up" || v.status === "standby").length;
  const onVoyage = new Set(voyages.map(v => v.vessel_id)).size;

  const utilizationPct = total > 0 ? Math.round((operational / total) * 100) : 0;
  const voyagePct = total > 0 ? Math.round((onVoyage / total) * 100) : 0;

  const segments = [
    { label: "Em Viagem", count: onVoyage, color: "bg-primary", pct: voyagePct },
    { label: "Operacional", count: operational - onVoyage, color: "bg-success", pct: total > 0 ? Math.round(((operational - onVoyage) / total) * 100) : 0 },
    { label: "Manutenção", count: inMaintenance, color: "bg-warning", pct: total > 0 ? Math.round((inMaintenance / total) * 100) : 0 },
    { label: "Idle", count: idle, color: "bg-muted-foreground/40", pct: total > 0 ? Math.round((idle / total) * 100) : 0 },
  ].filter(s => s.count > 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Utilização da Frota
          <Badge variant="outline" className="ml-auto text-[10px]">
            {total} embarcações
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Utilization */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-muted" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                className="stroke-primary"
                strokeWidth="3"
                strokeDasharray={`${utilizationPct} ${100 - utilizationPct}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{utilizationPct}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Taxa de Utilização</p>
            <p className="text-xs text-muted-foreground">
              {operational} de {total} embarcações operacionais
            </p>
            <p className="text-xs text-muted-foreground">
              {onVoyage} em viagem ativa
            </p>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={`h-full ${seg.color} transition-all`}
              style={{ width: `${Math.max(seg.pct, 2)}%` }}
              title={`${seg.label}: ${seg.count} (${seg.pct}%)`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-2 text-xs">
              <div className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
              <span className="text-muted-foreground">{seg.label}</span>
              <span className="font-medium ml-auto">{seg.count}</span>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs">
            <Ship className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground">Viagem:</span>
            <span className="font-medium">{voyagePct}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Wrench className="h-3 w-3 text-warning" />
            <span className="text-muted-foreground">Maint:</span>
            <span className="font-medium">{inMaintenance}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Idle:</span>
            <span className="font-medium">{idle}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FleetUtilizationKPI;
