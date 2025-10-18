import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, TrendingUp, Shield, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TacticalRisk {
  id: string;
  vessel_id: string;
  vessels?: { name: string };
  risk_category: string;
  risk_type: string;
  risk_score: number;
  risk_level: string;
  description: string;
  predicted_date: string;
  valid_until: string;
  status: string;
  recommended_actions: string[];
  assigned_to: string | null;
}

interface VesselRiskSummary {
  vessel_id: string;
  vessel_name: string;
  total_risks: number;
  critical_risks: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;
  active_risks: number;
  avg_risk_score: number;
}

export function TacticalRiskPanel() {
  const [risks, setRisks] = useState<TacticalRisk[]>([]);
  const [summaries, setSummaries] = useState<VesselRiskSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRisks();
    loadSummaries();
  }, []);

  const loadRisks = async () => {
    try {
      const { data, error } = await supabase
        .from("tactical_risks")
        .select(`
          *,
          vessels (name)
        `)
        .eq("status", "Active")
        .order("risk_score", { ascending: false });

      if (error) throw error;
      setRisks(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar riscos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSummaries = async () => {
    try {
      const { data, error } = await supabase.rpc("get_vessel_risk_summary");

      if (error) throw error;
      setSummaries(data || []);
    } catch (error: any) {
      console.error("Error loading summaries:", error);
    }
  };

  const generateForecast = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/forecast-risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedVessel ? { vessel_id: selectedVessel } : {}),
      });

      if (!response.ok) throw new Error("Failed to generate forecast");

      const result = await response.json();
      toast({
        title: "Previsão gerada com sucesso",
        description: `${result.forecasts?.length || 0} riscos previstos`,
      });

      await loadRisks();
      await loadSummaries();
    } catch (error: any) {
      toast({
        title: "Erro ao gerar previsão",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "Critical":
        return "bg-red-500";
      case "High":
        return "bg-orange-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredRisks = selectedVessel
    ? risks.filter((r) => r.vessel_id === selectedVessel)
    : risks;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Riscos Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaries.reduce((sum, s) => sum + Number(s.critical_risks), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Riscos Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaries.reduce((sum, s) => sum + Number(s.active_risks), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de riscos em monitoramento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embarcações</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaries.length}</div>
            <p className="text-xs text-muted-foreground">
              Sendo monitoradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mapa de Riscos Táticos</h3>
        <Button onClick={generateForecast} disabled={generating}>
          <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Gerando..." : "Gerar Previsão"}
        </Button>
      </div>

      {/* Vessel Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((summary) => (
          <Card
            key={summary.vessel_id}
            className={`cursor-pointer transition-all ${
              selectedVessel === summary.vessel_id
                ? "ring-2 ring-blue-500"
                : "hover:shadow-md"
            }`}
            onClick={() =>
              setSelectedVessel(
                selectedVessel === summary.vessel_id ? null : summary.vessel_id
              )
            }
          >
            <CardHeader>
              <CardTitle className="text-base">{summary.vessel_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Riscos Ativos:</span>
                  <span className="font-semibold">{summary.active_risks}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-red-500 font-bold">
                      {summary.critical_risks}
                    </div>
                    <div className="text-muted-foreground">Crítico</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-500 font-bold">
                      {summary.high_risks}
                    </div>
                    <div className="text-muted-foreground">Alto</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-500 font-bold">
                      {summary.medium_risks}
                    </div>
                    <div className="text-muted-foreground">Médio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-500 font-bold">
                      {summary.low_risks}
                    </div>
                    <div className="text-muted-foreground">Baixo</div>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Score Médio: {Number(summary.avg_risk_score).toFixed(1)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedVessel ? "Riscos da Embarcação Selecionada" : "Todos os Riscos"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRisks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum risco ativo encontrado
              </p>
            ) : (
              filteredRisks.map((risk) => (
                <div
                  key={risk.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{risk.vessels?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {risk.risk_category} - {risk.risk_type}
                      </p>
                    </div>
                    <Badge className={getRiskLevelColor(risk.risk_level)}>
                      {risk.risk_level} ({risk.risk_score})
                    </Badge>
                  </div>
                  <p className="text-sm">{risk.description}</p>
                  {risk.recommended_actions?.length > 0 && (
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Ações Recomendadas:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {risk.recommended_actions.map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      Previsto: {new Date(risk.predicted_date).toLocaleDateString()}
                    </span>
                    <span>
                      Válido até: {new Date(risk.valid_until).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
