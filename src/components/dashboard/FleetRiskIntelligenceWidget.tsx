/**
 * Fleet Risk Intelligence Widget
 * Real-time composite risk visualization across vessels with cross-module correlation
 */
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Activity, Anchor } from "lucide-react";
import { useVesselRiskScores, type VesselRisk } from "@/hooks/useVesselRiskScores";
import { useCrossModuleCorrelation, type CorrelatedRisk } from "@/hooks/useCrossModuleCorrelation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface RiskLevel {
  label: string;
  color: string;
  icon: typeof Shield;
  bgClass: string;
}

const RISK_LEVELS: Record<string, RiskLevel> = {
  excellent: { label: "Excelente", color: "text-emerald-400", icon: CheckCircle, bgClass: "bg-emerald-500/10 border-emerald-500/20" },
  good: { label: "Bom", color: "text-green-400", icon: Shield, bgClass: "bg-green-500/10 border-green-500/20" },
  moderate: { label: "Moderado", color: "text-amber-400", icon: Activity, bgClass: "bg-amber-500/10 border-amber-500/20" },
  high: { label: "Alto", color: "text-orange-400", icon: AlertTriangle, bgClass: "bg-orange-500/10 border-orange-500/20" },
  critical: { label: "Crítico", color: "text-red-400", icon: AlertTriangle, bgClass: "bg-red-500/10 border-red-500/20" },
};

function getRiskLevel(score: number): RiskLevel {
  if (score >= 90) return RISK_LEVELS.excellent;
  if (score >= 75) return RISK_LEVELS.good;
  if (score >= 60) return RISK_LEVELS.moderate;
  if (score >= 40) return RISK_LEVELS.high;
  return RISK_LEVELS.critical;
}

function getProgressColor(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export function FleetRiskIntelligenceWidget() {
  const { risks, isLoading, avgFleetScore, criticalVessels, degradedVessels, healthyVessels } = useVesselRiskScores();
  const { risks: correlations, criticalRisks } = useCrossModuleCorrelation();

  const fleetSummary = useMemo(() => {
    if (!risks || risks.length === 0) return null;
    return {
      avgScore: avgFleetScore,
      criticalCount: criticalVessels.length,
      warningCount: degradedVessels.length,
      healthyCount: healthyVessels.length,
      total: risks.length,
    };
  }, [risks, avgFleetScore, criticalVessels, degradedVessels, healthyVessels]);

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Anchor className="h-4 w-4 text-primary" />
            Fleet Risk Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-md bg-muted/30 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fleetSummary) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Anchor className="h-4 w-4 text-primary" />
            Fleet Risk Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Nenhum dado de risco disponível</p>
        </CardContent>
      </Card>
    );
  }

  const fleetRisk = getRiskLevel(fleetSummary.avgScore);
  const FleetIcon = fleetRisk.icon;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Anchor className="h-4 w-4 text-primary" />
            Fleet Risk Intelligence
          </span>
          <Badge variant="outline" className={cn("text-[10px] font-mono", fleetRisk.color)}>
            <FleetIcon className="h-3 w-3 mr-1" />
            {fleetSummary.avgScore}% — {fleetRisk.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Fleet distribution bar */}
        <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted/30">
          {fleetSummary.healthyCount > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(fleetSummary.healthyCount / fleetSummary.total) * 100}%` }}
              transition={{ duration: 0.6 }}
              className="bg-emerald-500 rounded-l-full"
            />
          )}
          {fleetSummary.warningCount > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(fleetSummary.warningCount / fleetSummary.total) * 100}%` }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-amber-500"
            />
          )}
          {fleetSummary.criticalCount > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(fleetSummary.criticalCount / fleetSummary.total) * 100}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-red-500 rounded-r-full"
            />
          )}
        </div>

        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span className="text-emerald-400">{fleetSummary.healthyCount} saudáveis</span>
          <span className="text-amber-400">{fleetSummary.warningCount} atenção</span>
          <span className="text-red-400">{fleetSummary.criticalCount} críticos</span>
        </div>

        {/* Top risk vessels */}
        <div className="space-y-1.5">
          <AnimatePresence>
            {risks
              .sort((a: VesselRisk, b: VesselRisk) => a.composite_score - b.composite_score)
              .slice(0, 4)
              .map((vessel: VesselRisk, idx: number) => {
                const score = vessel.composite_score;
                const risk = getRiskLevel(score);
                const VIcon = risk.icon;
                return (
                  <motion.div
                    key={vessel.vessel_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md border text-xs",
                      risk.bgClass
                    )}
                  >
                    <VIcon className={cn("h-3 w-3 shrink-0", risk.color)} />
                    <span className="truncate flex-1 text-foreground/80 font-medium">
                      {vessel.vessel_name || vessel.vessel_id.substring(0, 8)}
                    </span>
                    <div className="w-16">
                      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", getProgressColor(score))}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                    <span className={cn("font-mono text-[10px] w-8 text-right", risk.color)}>
                      {score}%
                    </span>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        {/* Cascading risks */}
        {criticalRisks.length > 0 && (
          <div className="pt-1 border-t border-border/30">
            <p className="text-[10px] text-destructive font-medium mb-1">
              ⚠ {criticalRisks.length} risco(s) sistêmico(s) ativo(s)
            </p>
            {criticalRisks.slice(0, 2).map((risk: CorrelatedRisk, i: number) => (
              <p key={i} className="text-[10px] text-muted-foreground truncate">
                {risk.description}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
