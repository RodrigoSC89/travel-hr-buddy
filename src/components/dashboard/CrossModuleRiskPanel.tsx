/**
 * CrossModuleRiskPanel - Dashboard widget showing correlated risks
 * Displays fleet-wide risk assessment with visual severity indicators
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Shield, Wrench, Ship, TrendingDown, RefreshCw, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useVesselRiskScores, type VesselRisk } from "@/hooks/useVesselRiskScores";
import { useCrossModuleCorrelation } from "@/hooks/useCrossModuleCorrelation";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const healthColors: Record<string, string> = {
  healthy: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  degraded: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  critical: "text-destructive bg-destructive/10 border-destructive/20",
};

const healthLabels: Record<string, string> = {
  healthy: "Saudável",
  degraded: "Degradado",
  critical: "Crítico",
};

const categoryIcons: Record<string, typeof Ship> = {
  maintenance: Wrench,
  compliance: Shield,
  safety: AlertTriangle,
  operational: Ship,
};

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: typeof Ship }) {
  const color = score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-destructive";
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="w-20 text-muted-foreground truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="w-8 text-right font-mono">{score}</span>
    </div>
  );
}

function VesselRiskCard({ vessel }: { vessel: VesselRisk }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-3 rounded-lg border transition-colors hover:bg-accent/30 cursor-pointer",
        healthColors[vessel.health_status]
      )}
      onClick={() => navigate(`/ops?vessel=${vessel.vessel_id}`)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Ship className="h-4 w-4" />
          <span className="font-medium text-sm">{vessel.vessel_name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {vessel.composite_score}%
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {healthLabels[vessel.health_status]}
          </Badge>
        </div>
      </div>

      <div className="space-y-1">
        <ScoreBar label="Manutenção" score={vessel.maintenance_score} icon={Wrench} />
        <ScoreBar label="Compliance" score={vessel.compliance_score} icon={Shield} />
        <ScoreBar label="Segurança" score={vessel.safety_score} icon={AlertTriangle} />
        <ScoreBar label="Operacional" score={vessel.operational_score} icon={Ship} />
      </div>

      {vessel.top_risks.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {vessel.top_risks.slice(0, 2).map((risk, i) => (
            <span key={i} className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
              ⚠ {risk}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function CrossModuleRiskPanel() {
  const { risks, isLoading, avgFleetScore, criticalVessels, degradedVessels, refetch, persistScores, isPersisting } = useVesselRiskScores();
  const { risks: correlatedRisks, criticalRisks } = useCrossModuleCorrelation();
  const navigate = useNavigate();

  const fleetHealthColor = avgFleetScore >= 75 ? "text-emerald-500" : avgFleetScore >= 50 ? "text-amber-500" : "text-destructive";

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Risk Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Risk Intelligence
            {criticalVessels.length > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 animate-pulse">
                {criticalVessels.length} crítico(s)
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { refetch(); persistScores(); }}>
                  <RefreshCw className={cn("h-3.5 w-3.5", isPersisting && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Recalcular scores</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Fleet summary */}
        <div className="flex items-center gap-4 mt-2">
          <div className="text-center">
            <div className={cn("text-2xl font-bold font-mono", fleetHealthColor)}>
              {avgFleetScore}%
            </div>
            <div className="text-[10px] text-muted-foreground">Saúde Frota</div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-2 text-center text-[10px]">
            <div>
              <div className="font-bold text-primary">{risks.filter(r => r.health_status === "healthy").length}</div>
              <div className="text-muted-foreground">Saudáveis</div>
            </div>
            <div>
              <div className="font-bold text-accent-foreground">{degradedVessels.length}</div>
              <div className="text-muted-foreground">Degradados</div>
            </div>
            <div>
              <div className="font-bold text-destructive">{criticalVessels.length}</div>
              <div className="text-muted-foreground">Críticos</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Correlated risks banner */}
        {criticalRisks.length > 0 && (
          <div className="mb-3 p-2 rounded-lg border border-destructive/30 bg-destructive/5">
            <div className="text-[11px] font-medium text-destructive flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-3 w-3" />
              {criticalRisks.length} Risco(s) Sistêmico(s) Detectado(s)
            </div>
            {criticalRisks.slice(0, 2).map(risk => (
              <div key={risk.id} className="text-[10px] text-muted-foreground">
                • {risk.title}: {risk.description}
              </div>
            ))}
          </div>
        )}

        {/* Vessel cards */}
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {risks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhuma embarcação registrada
              </div>
            ) : (
              risks.map(vessel => (
                <VesselRiskCard key={vessel.vessel_id} vessel={vessel} />
              ))
            )}
          </div>
        </ScrollArea>

        {risks.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs"
            onClick={() => navigate("/command")}
          >
            Ver análise completa no Command Center
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
