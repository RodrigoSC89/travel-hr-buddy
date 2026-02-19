/**
 * Fleet Health Heatmap - World-class fleet visualization
 * Shows vessel health across multiple dimensions
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Ship, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface VesselHealth {
  id: string;
  name: string;
  hull: number;
  machinery: number;
  safety: number;
  compliance: number;
  crew: number;
}

interface FleetHealthHeatmapProps {
  vessels: Array<{ id: string; name: string; status: string | null; vessel_type?: string | null }>;
  maintenance: Array<{ vessel_id?: string | null; status: string | null; priority: string | null }>;
  certificates: Array<{ vessel_id?: string | null; status: string | null; expiry_date?: string | null }>;
}

const DIMENSIONS = ["Hull", "Machinery", "Safety", "Compliance", "Crew"];

function getColor(score: number): string {
  if (score >= 85) return "bg-emerald-500/80";
  if (score >= 70) return "bg-emerald-500/40";
  if (score >= 55) return "bg-amber-500/60";
  if (score >= 40) return "bg-orange-500/60";
  return "bg-destructive/70";
}

function getScoreLabel(score: number) {
  if (score >= 85) return { label: "Excelente", icon: <CheckCircle className="h-3 w-3 text-emerald-400" /> };
  if (score >= 70) return { label: "Bom", icon: <CheckCircle className="h-3 w-3 text-emerald-300" /> };
  if (score >= 55) return { label: "Atenção", icon: <AlertCircle className="h-3 w-3 text-amber-400" /> };
  return { label: "Crítico", icon: <AlertTriangle className="h-3 w-3 text-destructive" /> };
}

export function FleetHealthHeatmap({ vessels, maintenance, certificates }: FleetHealthHeatmapProps) {
  const healthData = useMemo<VesselHealth[]>(() => {
    return vessels.slice(0, 12).map(v => {
      const vMaint = maintenance.filter(m => m.vessel_id === v.id);
      const vCerts = certificates.filter(c => c.vessel_id === v.id);
      const overdue = vMaint.filter(m => m.status === "overdue").length;
      const critical = vMaint.filter(m => m.priority === "critical").length;
      const activeCerts = vCerts.filter(c => c.status === "active").length;
      const totalCerts = vCerts.length || 1;

      return {
        id: v.id,
        name: v.name || "N/A",
        hull: Math.max(40, 95 - overdue * 8 - critical * 5),
        machinery: Math.max(35, 90 - critical * 12 - overdue * 4),
        safety: Math.max(50, 88 - overdue * 6),
        compliance: Math.round((activeCerts / totalCerts) * 100),
        crew: v.status === "active" ? Math.max(60, 92 - overdue * 3 - critical * 4) : 50,
      };
    });
  }, [vessels, maintenance, certificates]);

  if (healthData.length === 0) {
    return (
      <Card className="border-border/30">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Ship className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma embarcação cadastrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Ship className="h-4 w-4 text-primary" />
          Fleet Health Heatmap
          <Badge variant="outline" className="text-[10px] ml-auto">
            {healthData.length} embarcações
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <TooltipProvider>
          <div className="min-w-[500px]">
            {/* Header */}
            <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `140px repeat(${DIMENSIONS.length}, 1fr)` }}>
              <div className="text-[10px] text-muted-foreground font-medium px-1">Embarcação</div>
              {DIMENSIONS.map(d => (
                <div key={d} className="text-[10px] text-muted-foreground font-medium text-center">{d}</div>
              ))}
            </div>

            {/* Rows */}
            {healthData.map((vessel, idx) => {
              const scores = [vessel.hull, vessel.machinery, vessel.safety, vessel.compliance, vessel.crew];
              const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
              const { icon } = getScoreLabel(avgScore);

              return (
                <motion.div
                  key={vessel.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="grid gap-1 mb-1"
                  style={{ gridTemplateColumns: `140px repeat(${DIMENSIONS.length}, 1fr)` }}
                >
                  <div className="flex items-center gap-1.5 px-1 min-w-0">
                    {icon}
                    <span className="text-xs font-medium truncate">{vessel.name}</span>
                  </div>
                  {scores.map((score, i) => (
                    <Tooltip key={`${vessel.id}-${DIMENSIONS[i]}`}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className={`h-7 rounded-sm ${getColor(score)} flex items-center justify-center cursor-default`}
                          whileHover={{ scale: 1.08 }}
                        >
                          <span className="text-[10px] font-bold text-white drop-shadow-sm">{score}</span>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-semibold">{vessel.name} — {DIMENSIONS[i]}</p>
                        <p>{getScoreLabel(score).label}: {score}%</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </motion.div>
              );
            })}

            {/* Legend */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/30">
              <span className="text-[10px] text-muted-foreground">Score:</span>
              {[
                { label: "85+", cls: "bg-emerald-500/80" },
                { label: "70-84", cls: "bg-emerald-500/40" },
                { label: "55-69", cls: "bg-amber-500/60" },
                { label: "40-54", cls: "bg-orange-500/60" },
                { label: "<40", cls: "bg-destructive/70" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-sm ${l.cls}`} />
                  <span className="text-[10px] text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
