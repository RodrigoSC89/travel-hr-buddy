import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertTriangle, TrendingUp, Activity, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface TacticalRisk {
  id: string;
  vessel_id: string;
  system_name: string;
  risk_type: string;
  risk_score: number;
  risk_level: string;
  predicted_date: string;
  description: string;
  suggested_actions: string;
  ai_confidence: number;
  status: string;
  vessel?: { name: string };
}

interface VesselRiskSummary {
  vessel_id: string;
  vessel_name: string;
  total_risks: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  avg_risk_score: number;
}

export function TacticalRiskPanel() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [vessels, setVessels] = useState<any[]>([]);
  const [riskSummaries, setRiskSummaries] = useState<VesselRiskSummary[]>([]);
  const [risks, setRisks] = useState<TacticalRisk[]>([]);

  useEffect(() => {
    loadVessels();
    loadRiskData();
  }, [selectedVessel]);

  async function loadVessels() {
    try {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setVessels(data || []);
    } catch (error) {
      console.error("Error loading vessels:", error);
    }
  }

  async function loadRiskData() {
    setLoading(true);
    try {
      // Load risk summaries
      const vesselFilter = selectedVessel === "all" ? null : selectedVessel;
      const { data: summaries, error: summariesError } = await supabase
        .rpc("get_vessel_risk_summary", { vessel_uuid: vesselFilter });

      if (summariesError) throw summariesError;
      setRiskSummaries(summaries || []);

      // Load detailed risks
      let risksQuery = supabase
        .from("tactical_risks")
        .select(`
          *,
          vessel:vessels(name)
        `)
        .eq("status", "active")
        .order("risk_score", { ascending: false });

      if (selectedVessel !== "all") {
        risksQuery = risksQuery.eq("vessel_id", selectedVessel);
      }

      const { data: risksData, error: risksError } = await risksQuery;

      if (risksError) throw risksError;
      setRisks(risksData || []);
    } catch (error) {
      console.error("Error loading risk data:", error);
      toast.error("Erro ao carregar dados de risco");
    } finally {
      setLoading(false);
    }
  }

  async function generateRiskPredictions(vesselId?: string) {
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/forecast-risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel_id: vesselId,
          process_all: !vesselId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate predictions");
      }

      const result = await response.json();
      toast.success(`Previsões geradas com sucesso`);
      await loadRiskData();
    } catch (error) {
      console.error("Error generating predictions:", error);
      toast.error("Erro ao gerar previsões");
    } finally {
      setGenerating(false);
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "Critical":
        return "destructive";
      case "High":
        return "default";
      case "Medium":
        return "secondary";
      case "Low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case "Failure":
        return <AlertTriangle className="h-4 w-4" />;
      case "Intermittency":
        return <Activity className="h-4 w-4" />;
      case "Degradation":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedVessel} onValueChange={setSelectedVessel}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione um navio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Navios</SelectItem>
              {vessels.map((vessel) => (
                <SelectItem key={vessel.id} value={vessel.id}>
                  {vessel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => generateRiskPredictions(selectedVessel === "all" ? undefined : selectedVessel)}
          disabled={generating}
        >
          {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gerar Previsões
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* Risk Summaries */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {riskSummaries.map((summary) => (
              <Card key={summary.vessel_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{summary.vessel_name}</CardTitle>
                  <CardDescription>
                    {summary.total_risks} risco(s) ativo(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Crítico:</span>
                      <Badge variant="destructive">{summary.critical_count}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Alto:</span>
                      <Badge variant="default">{summary.high_count}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Médio:</span>
                      <Badge variant="secondary">{summary.medium_count}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Baixo:</span>
                      <Badge variant="outline">{summary.low_count}</Badge>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-sm font-medium">
                        Score Médio: {summary.avg_risk_score?.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Risks */}
          {risks.length === 0 ? (
            <Alert>
              <AlertDescription>
                Nenhum risco ativo encontrado. Clique em "Gerar Previsões" para criar novas análises.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Riscos Detalhados</h3>
              {risks.map((risk) => (
                <Card key={risk.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRiskTypeIcon(risk.risk_type)}
                        <CardTitle className="text-base">
                          {risk.vessel?.name} - {risk.system_name}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskLevelColor(risk.risk_level)}>
                          {risk.risk_level}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Score: {risk.risk_score}
                        </span>
                      </div>
                    </div>
                    <CardDescription>
                      Tipo: {risk.risk_type} | Confiança IA: {risk.ai_confidence}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold">Descrição:</span>
                        <p className="text-sm text-muted-foreground">{risk.description}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Ações Sugeridas:</span>
                        <p className="text-sm text-muted-foreground">{risk.suggested_actions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
