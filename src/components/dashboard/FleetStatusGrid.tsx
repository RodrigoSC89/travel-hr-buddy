/**
 * FleetStatusGrid - Real-time vessel status grid with health indicators
 * Shows all vessels in a compact grid with status, type, and quick actions
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Ship, Anchor, AlertTriangle, CheckCircle, Wrench, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { label: string; color: string; icon: typeof Ship }> = {
  active: { label: "Ativo", color: "bg-success/15 text-success border-success/30", icon: CheckCircle },
  operational: { label: "Operacional", color: "bg-success/15 text-success border-success/30", icon: CheckCircle },
  maintenance: { label: "Manutenção", color: "bg-warning/15 text-warning border-warning/30", icon: Wrench },
  idle: { label: "Parado", color: "bg-muted text-muted-foreground border-border", icon: Anchor },
  drydock: { label: "Doca Seca", color: "bg-info/15 text-info border-info/30", icon: Anchor },
  decommissioned: { label: "Desativado", color: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle },
};

export function FleetStatusGrid() {
  const navigate = useNavigate();

  const { data: vessels = [], isLoading } = useQuery({
    queryKey: ["fleet-status-grid"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, vessel_type, status, flag_state, imo_number, updated_at")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const summary = useMemo(() => {
    const active = vessels.filter(v => v.status === "active" || v.status === "operational").length;
    const maint = vessels.filter(v => v.status === "maintenance" || v.status === "drydock").length;
    return { total: vessels.length, active, maint, idle: vessels.length - active - maint };
  }, [vessels]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            Fleet Status Grid
          </CardTitle>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="bg-success/10 text-success">{summary.active} ativos</Badge>
            {summary.maint > 0 && <Badge variant="outline" className="bg-warning/10 text-warning">{summary.maint} manutenção</Badge>}
            {summary.idle > 0 && <Badge variant="outline" className="bg-muted">{summary.idle} parados</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {vessels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma embarcação cadastrada. Adicione embarcações para visualizar a frota.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {vessels.map((vessel) => {
              const config = statusConfig[vessel.status || "idle"] || statusConfig.idle;
              const StatusIcon = config.icon;
              const lastUpdate = vessel.updated_at
                ? new Date(vessel.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                : "—";

              return (
                <button
                  key={vessel.id}
                  onClick={() => navigate(`/ops?tab=fleet`)}
                  className={`relative p-3 rounded-xl border ${config.color} transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] text-left group`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <StatusIcon className="h-4 w-4 opacity-70" />
                    <span className="text-[10px] opacity-60 flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {lastUpdate}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm truncate">{vessel.name || "N/A"}</h4>
                  <p className="text-[11px] opacity-70 truncate mt-0.5">
                    {vessel.vessel_type || "Tipo N/A"} {vessel.flag_state ? `• ${vessel.flag_state}` : ""}
                  </p>
                  {vessel.imo_number && (
                    <p className="text-[10px] opacity-50 mt-1">IMO {vessel.imo_number}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FleetStatusGrid;
