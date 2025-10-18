import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TacticalRisk {
  id: string;
  vessel_id: string;
  system: string;
  predicted_risk: string;
  risk_score: number;
  risk_level: string;
  suggested_action: string;
  assigned_to: string | null;
  status: string;
  generated_at: string;
  valid_until: string;
  ai_confidence: number;
}

interface VesselSummary {
  vessel_id: string;
  vessel_name: string;
  total_risks: number;
  critical_risks: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;
  avg_risk_score: number;
  pending_actions: number;
  latest_prediction: string;
}

export function TacticalRiskPanel() {
  const [vessels, setVessels] = useState<any[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [risks, setRisks] = useState<TacticalRisk[]>([]);
  const [summary, setSummary] = useState<VesselSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedVessel]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load vessels
      const { data: vesselsData } = await supabase
        .from("vessels")
        .select("id, name")
        .eq("status", "active")
        .order("name");

      setVessels((vesselsData as { id: string; name: string }[]) || []);

      // Load risk summary
      const { data: summaryData, error: summaryError } = await supabase
        .rpc("get_vessel_risk_summary", {
          vessel_uuid: selectedVessel === "all" ? null : selectedVessel,
        });

      if (summaryError) {
        console.error("Error loading summary:", summaryError);
      } else {
        setSummary(summaryData || []);
      }

      // Load detailed risks
      let query = supabase
        .from("tactical_risks")
        .select(`
          id,
          vessel_id,
          system,
          predicted_risk,
          risk_score,
          risk_level,
          suggested_action,
          assigned_to,
          status,
          generated_at,
          valid_until,
          ai_confidence
        `)
        .eq("status", "pending")
        .gt("valid_until", new Date().toISOString())
        .order("risk_score", { ascending: false });

      if (selectedVessel !== "all") {
        query = query.eq("vessel_id", selectedVessel);
      }

      const { data: risksData, error: risksError } = await query;

      if (risksError) {
        console.error("Error loading risks:", risksError);
        toast.error("Erro ao carregar riscos");
      } else {
        setRisks(risksData || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async () => {
    try {
      setGenerating(true);
      toast.info("Gerando previsões de risco...");

      const response = await fetch("/api/ai/forecast-risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel_id: selectedVessel === "all" ? null : selectedVessel,
          all_vessels: selectedVessel === "all",
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar previsões");
      }

      const result = await response.json();
      toast.success(`Previsões geradas com sucesso: ${result.results?.length || 0} embarcações`);
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast.error("Erro ao gerar previsões");
    } finally {
      setGenerating(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
    case "Critical":
      return "destructive";
    case "High":
      return "default";
    case "Medium":
      return "secondary";
    default:
      return "outline";
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
    case "Failure":
      return "🔴";
    case "Intermittency":
      return "⚠️";
    case "Delay":
      return "⏱️";
    case "Degradation":
      return "📉";
    default:
      return "✅";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione uma embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Embarcações</SelectItem>
              {vessels.map((vessel) => (
                <SelectItem key={vessel.id} value={vessel.id}>
                  {vessel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <Button onClick={generatePredictions} disabled={generating}>
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Gerar Previsões
            </>
          )}
        </Button>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((vessel) => (
          <Card key={vessel.vessel_id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{vessel.vessel_name}</CardTitle>
              <CardDescription className="text-xs">
                {vessel.total_risks} riscos ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Críticos:</span>
                  <Badge variant="destructive">{vessel.critical_risks}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Altos:</span>
                  <Badge variant="default">{vessel.high_risks}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Médios:</span>
                  <Badge variant="secondary">{vessel.medium_risks}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>Score Médio:</span>
                  <span className="font-bold">{vessel.avg_risk_score?.toFixed(1) || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Risks List */}
      <Card>
        <CardHeader>
          <CardTitle>Riscos Táticos Detalhados</CardTitle>
          <CardDescription>
            {risks.length} risco(s) pendente(s) - Válido por 15 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {risks.length === 0 ? (
            <Alert>
              <AlertDescription>
                Nenhum risco tático identificado no momento. Clique em &apos;Gerar Previsões&apos; para criar novas análises.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {risks.map((risk) => {
                const vessel = vessels.find((v) => v.id === risk.vessel_id);
                return (
                  <Card key={risk.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getRiskTypeIcon(risk.predicted_risk)}</span>
                            <div>
                              <div className="font-semibold">
                                {vessel?.name || "Embarcação"} - Sistema: {risk.system}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {risk.predicted_risk} detectado
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant={getRiskLevelColor(risk.risk_level) as "default" | "destructive" | "secondary" | "outline" | null | undefined}>
                              {risk.risk_level}
                            </Badge>
                            <span className="text-muted-foreground">Score: {risk.risk_score}</span>
                            <span className="text-muted-foreground">
                              Confiança IA: {(risk.ai_confidence * 100).toFixed(0)}%
                            </span>
                          </div>

                          <div className="bg-muted p-3 rounded-md">
                            <div className="text-sm font-medium mb-1">Ação Sugerida:</div>
                            <div className="text-sm">{risk.suggested_action}</div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Gerado em: {new Date(risk.generated_at).toLocaleString("pt-BR")} • 
                            Válido até: {new Date(risk.valid_until).toLocaleString("pt-BR")}
                          </div>
                        </div>

                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
