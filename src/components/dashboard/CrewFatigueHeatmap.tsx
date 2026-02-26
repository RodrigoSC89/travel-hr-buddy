/**
 * CrewFatigueHeatmap - Crew fatigue risk heatmap
 * Monitors work/rest compliance and wellbeing across vessels
 */
import { motion } from "framer-motion";
import { Brain, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

interface VesselRow {
  id: string;
  name: string | null;
  crew_count: number | null;
}

interface WorkRestRow {
  vessel_id: string;
  has_violation: boolean | null;
}

interface VesselFatigue {
  vessel_name: string;
  crew_count: number;
  risk_level: "low" | "medium" | "high" | "critical";
  violations: number;
}

export function CrewFatigueHeatmap() {
  const { data: vessels } = useQuery({
    queryKey: ["fatigue-heatmap"],
    queryFn: async () => {
      const { data } = await fromUntyped("vessels")
        .select("id, name, crew_count")
        .eq("status", "active")
        .limit(12);
      return (data ?? []) as VesselRow[];
    },
    staleTime: 120000,
  });

  const { data: workRestRecords } = useQuery({
    queryKey: ["fatigue-work-rest"],
    queryFn: async () => {
      const { data } = await fromUntyped("mlc_work_rest_records")
        .select("vessel_id, has_violation")
        .gte("record_date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0])
        .limit(500);
      return (data ?? []) as WorkRestRow[];
    },
    staleTime: 120000,
  });

  // Build violation map per vessel
  const violationMap = new Map<string, number>();
  (workRestRecords ?? []).forEach((r) => {
    if (r.has_violation) {
      violationMap.set(r.vessel_id, (violationMap.get(r.vessel_id) ?? 0) + 1);
    }
  });

  const heatmapData: VesselFatigue[] = (vessels ?? []).map((v) => {
    const violations = violationMap.get(v.id) ?? 0;
    const risk: VesselFatigue["risk_level"] =
      violations >= 5 ? "critical" : violations >= 3 ? "high" : violations >= 1 ? "medium" : "low";
    return {
      vessel_name: v.name ?? "N/A",
      crew_count: v.crew_count ?? 0,
      risk_level: risk,
      violations,
    };
  });

  const riskColors: Record<string, string> = {
    low: "bg-success/20 border-success/30 text-success",
    medium: "bg-warning/20 border-warning/30 text-warning",
    high: "bg-orange-500/20 border-orange-500/30 text-orange-500",
    critical: "bg-destructive/20 border-destructive/30 text-destructive",
  };

  const totalViolations = heatmapData.reduce((s, d) => s + d.violations, 0);
  const criticalCount = heatmapData.filter(d => d.risk_level === "critical" || d.risk_level === "high").length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-info" />
            Heatmap de Fadiga STCW
            <div className="ml-auto flex items-center gap-2">
              {criticalCount > 0 && (
                <Badge variant="destructive" className="text-[10px]">
                  {criticalCount} alerta{criticalCount > 1 ? "s" : ""}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px]">
                {totalViolations} violações/7d
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {heatmapData.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              Nenhuma embarcação ativa
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {heatmapData.map((v, i) => (
                <Tooltip key={v.vessel_name}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`p-2 rounded-lg border cursor-default ${riskColors[v.risk_level]}`}
                    >
                      <p className="text-[10px] font-medium truncate">{v.vessel_name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold">{v.violations}</span>
                        {v.risk_level === "low" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">{v.vessel_name}</p>
                    <p>Tripulação: {v.crew_count}</p>
                    <p>Violações (7d): {v.violations}</p>
                    <p>Risco: {v.risk_level.toUpperCase()}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Baixo</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Médio</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Alto</div>
            <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Crítico</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
