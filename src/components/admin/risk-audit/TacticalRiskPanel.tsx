import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface TacticalRisk {
  id: string;
  vessel_id: string;
  system: string;
  predicted_risk: string;
  risk_score: number;
  suggested_action: string;
  generated_at: string;
  status: string;
}

interface VesselRiskSummary {
  vessel_id: string;
  vessel_name: string;
  total_risks: number;
  critical_risks: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;
  avg_risk_score: number;
  most_critical_system: string;
  last_update: string;
}

interface TacticalRiskPanelProps {
  selectedVessel: string | null;
  onVesselSelect: (vesselId: string | null) => void;
}

export const TacticalRiskPanel: React.FC<TacticalRiskPanelProps> = ({
  selectedVessel,
  onVesselSelect,
}) => {
  const [vessels, setVessels] = useState<any[]>([]);
  const [riskSummaries, setRiskSummaries] = useState<VesselRiskSummary[]>([]);
  const [tacticalRisks, setTacticalRisks] = useState<TacticalRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedVessel]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load vessels
      const { data: vesselsData, error: vesselsError } = await supabase
        .from("vessels")
        .select("*")
        .order("name");

      if (vesselsError) throw vesselsError;
      setVessels(vesselsData || []);

      // Load risk summaries
      const { data: summariesData, error: summariesError } = await supabase
        .rpc("get_vessel_risk_summary", {
          p_vessel_id: selectedVessel,
        });

      if (summariesError) throw summariesError;
      setRiskSummaries(summariesData || []);

      // Load tactical risks for selected vessel
      if (selectedVessel) {
        const { data: risksData, error: risksError } = await supabase
          .from("tactical_risks")
          .select("*")
          .eq("vessel_id", selectedVessel)
          .eq("status", "active")
          .order("risk_score", { ascending: false });

        if (risksError) throw risksError;
        setTacticalRisks(risksData || []);
      } else {
        setTacticalRisks([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de risco.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRisks = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/forecast-risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel_id: selectedVessel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate risks");
      }

      const result = await response.json();
      
      toast({
        title: "Previsões geradas com sucesso",
        description: `${result.processed_vessels} embarcação(ões) processada(s).`,
      });

      // Reload data
      await loadData();
    } catch (error) {
      console.error("Error generating risks:", error);
      toast({
        title: "Erro ao gerar previsões",
        description: "Não foi possível gerar as previsões de risco.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "destructive";
    if (score >= 60) return "warning";
    if (score >= 40) return "default";
    return "secondary";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return "Crítico";
    if (score >= 60) return "Alto";
    if (score >= 40) return "Médio";
    return "Baixo";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Mapa de Riscos Táticos
              </CardTitle>
              <CardDescription>
                Previsão de riscos operacionais por embarcação e sistema
              </CardDescription>
            </div>
            <Button
              onClick={handleGenerateRisks}
              disabled={generating}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
              {generating ? "Gerando..." : "Gerar Previsões"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Filtrar por Embarcação
              </label>
              <Select
                value={selectedVessel || "all"}
                onValueChange={(value) =>
                  onVesselSelect(value === "all" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as embarcações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as embarcações</SelectItem>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Summaries */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {riskSummaries.map((summary) => (
          <Card
            key={summary.vessel_id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onVesselSelect(summary.vessel_id)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{summary.vessel_name}</CardTitle>
              <CardDescription>
                Última atualização:{" "}
                {new Date(summary.last_update).toLocaleString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Score Médio</span>
                  <Badge variant={getRiskColor(summary.avg_risk_score)}>
                    {summary.avg_risk_score.toFixed(0)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Críticos:</span>
                    <span className="font-medium text-destructive">
                      {summary.critical_risks}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Altos:</span>
                    <span className="font-medium text-warning">
                      {summary.high_risks}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Médios:</span>
                    <span className="font-medium">{summary.medium_risks}</span>
                  </div>
                </div>

                {summary.most_critical_system && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Sistema Crítico:
                    </p>
                    <p className="text-sm font-medium">
                      {summary.most_critical_system}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Risks */}
      {selectedVessel && tacticalRisks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riscos Detalhados</CardTitle>
            <CardDescription>
              Análise detalhada dos riscos identificados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tacticalRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <AlertTriangle
                    className={`h-5 w-5 mt-1 ${
                      risk.risk_score >= 80
                        ? "text-destructive"
                        : risk.risk_score >= 60
                          ? "text-warning"
                          : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{risk.system}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskColor(risk.risk_score)}>
                          {getRiskLabel(risk.risk_score)}
                        </Badge>
                        <Badge variant="outline">{risk.risk_score}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Risco Previsto:</strong> {risk.predicted_risk}
                    </p>
                    <p className="text-sm">
                      <strong>Ação Recomendada:</strong>{" "}
                      {risk.suggested_action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedVessel && tacticalRisks.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum risco identificado para esta embarcação.</p>
              <Button
                onClick={handleGenerateRisks}
                disabled={generating}
                className="mt-4"
                variant="outline"
              >
                Gerar Previsões
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
