"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Activity, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface TacticalRisk {
  id: string;
  vessel_id: string;
  risk_type: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  probability: number;
  impact_score: number;
  forecasted_date: string;
  status: string;
  ai_confidence: number;
}

interface VesselRiskSummary {
  vessel_id: string;
  vessel_name: string;
  total_risks: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  open_risks: number;
}

export function TacticalRiskPanel() {
  const [risks, setRisks] = useState<TacticalRisk[]>([]);
  const [summaries, setSummaries] = useState<VesselRiskSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const loadData = async () => {
    try {
      setLoading(true);

      // Load risk summaries
      const { data: summaryData, error: summaryError } = await supabase
        .rpc("get_vessel_risk_summary");

      if (summaryError) throw summaryError;
      setSummaries(summaryData || []);

      // Load recent risks
      const { data: riskData, error: riskError } = await supabase
        .from("tactical_risks")
        .select("*")
        .eq("status", "open")
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      if (riskError) throw riskError;
      setRisks(riskData || []);
    } catch (error) {
      console.error("Error loading risks:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar riscos táticos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async (vesselId?: string) => {
    try {
      setGenerating(true);
      const response = await fetch("/api/ai/forecast-risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vessel_id: vesselId }),
      });

      if (!response.ok) throw new Error("Failed to generate forecast");

      const data = await response.json();
      toast({
        title: "Sucesso",
        description: `Previsão gerada para ${data.results.length} navio(s)`,
      });
      
      loadData();
    } catch (error) {
      console.error("Error generating forecast:", error);
      toast({
        title: "Erro",
        description: "Falha ao gerar previsão",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "destructive";
      case "High":
        return "orange";
      case "Medium":
        return "yellow";
      case "Low":
        return "default";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Riscos Táticos
          </h2>
          <p className="text-muted-foreground">Previsão de riscos operacionais com IA</p>
        </div>
        <Button onClick={() => generateForecast()} disabled={generating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${generating ? "animate-spin" : ""}`} />
          Gerar Previsão
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaries.map((summary) => (
          <Card key={summary.vessel_id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{summary.vessel_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <Badge>{summary.total_risks}</Badge>
                </div>
                <div className="flex gap-2">
                  {summary.critical_count > 0 && (
                    <Badge variant="destructive">{summary.critical_count} Crítico</Badge>
                  )}
                  {summary.high_count > 0 && (
                    <Badge className="bg-orange-500">{summary.high_count} Alto</Badge>
                  )}
                  {summary.medium_count > 0 && (
                    <Badge className="bg-yellow-500">{summary.medium_count} Médio</Badge>
                  )}
                  {summary.low_count > 0 && (
                    <Badge variant="secondary">{summary.low_count} Baixo</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk List */}
      <Card>
        <CardHeader>
          <CardTitle>Riscos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {risks.map((risk) => (
              <div key={risk.id} className="border-l-4 border-l-red-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(risk.severity) as any}>
                        {risk.severity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{risk.risk_type}</span>
                    </div>
                    <p className="font-medium">{risk.description}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>Probabilidade: {risk.probability}%</div>
                    <div>Impacto: {risk.impact_score}/10</div>
                    <div>Confiança IA: {risk.ai_confidence}%</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Previsto para: {new Date(risk.forecasted_date).toLocaleDateString("pt-BR")}
                </div>
              </div>
            ))}
            {risks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum risco ativo encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
