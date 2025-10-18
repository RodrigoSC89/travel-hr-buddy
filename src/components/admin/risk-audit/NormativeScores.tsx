import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Shield, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditReadinessSummary {
  audit_type: string;
  total_predictions: number;
  avg_score: number;
  high_probability_count: number;
  medium_probability_count: number;
  low_probability_count: number;
  vessels_ready: number;
  vessels_at_risk: number;
}

interface VesselScore {
  vessel_id: string;
  vessel_name: string;
  audit_type: string;
  expected_score: number;
  pass_probability: string;
}

export function NormativeScores() {
  const [readinessSummary, setReadinessSummary] = useState<
    AuditReadinessSummary[]
  >([]);
  const [vesselScores, setVesselScores] = useState<VesselScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load audit readiness summary
      const { data: summaryData, error: summaryError } = await supabase.rpc(
        "get_audit_readiness_summary"
      );

      if (summaryError) throw summaryError;
      setReadinessSummary(summaryData || []);

      // Load latest predictions for vessel scores
      const { data: predictionsData, error: predictionsError } =
        await supabase.rpc("get_latest_audit_predictions");

      if (predictionsError) throw predictionsError;

      const scores: VesselScore[] =
        predictionsData?.map((p: any) => ({
          vessel_id: p.vessel_id,
          vessel_name: p.vessel_name,
          audit_type: p.audit_type,
          expected_score: p.expected_score,
          pass_probability: p.pass_probability,
        })) || [];

      setVesselScores(scores);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProbabilityBadge = (probability: string) => {
    const colors = {
      Alta: "bg-green-500",
      Média: "bg-yellow-500",
      Baixa: "bg-red-500",
    };
    return (
      <Badge className={colors[probability as keyof typeof colors] || "bg-gray-500"}>
        {probability}
      </Badge>
    );
  };

  const overallStats = {
    totalVessels: new Set(vesselScores.map((s) => s.vessel_id)).size,
    avgScore:
      vesselScores.length > 0
        ? vesselScores.reduce((sum, s) => sum + s.expected_score, 0) /
          vesselScores.length
        : 0,
    readyCount: vesselScores.filter((s) => s.expected_score >= 70).length,
    atRiskCount: vesselScores.filter((s) => s.expected_score < 70).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Embarcações Monitoradas
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalVessels}</div>
            <p className="text-xs text-muted-foreground">
              Total de embarcações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getScoreColor(overallStats.avgScore)}`}
            >
              {overallStats.avgScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média geral de conformidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Embarcações Prontas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallStats.readyCount}
            </div>
            <p className="text-xs text-muted-foreground">Score ≥ 70</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Risco</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overallStats.atRiskCount}
            </div>
            <p className="text-xs text-muted-foreground">Score &lt; 70</p>
          </CardContent>
        </Card>
      </div>

      {/* Readiness by Audit Type */}
      <Card>
        <CardHeader>
          <CardTitle>Prontidão por Tipo de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {readinessSummary.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma previsão de auditoria disponível
              </p>
            ) : (
              readinessSummary.map((summary) => (
                <div key={summary.audit_type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">{summary.audit_type}</h4>
                    <div
                      className={`text-lg font-bold ${getScoreColor(Number(summary.avg_score))}`}
                    >
                      {Number(summary.avg_score).toFixed(1)}
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getScoreBarColor(Number(summary.avg_score))}`}
                      style={{ width: `${summary.avg_score}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold">
                        {summary.total_predictions}
                      </div>
                      <div className="text-muted-foreground">Previsões</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {summary.high_probability_count}
                      </div>
                      <div className="text-muted-foreground">Alta Prob.</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-yellow-600">
                        {summary.medium_probability_count}
                      </div>
                      <div className="text-muted-foreground">Média Prob.</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">
                        {summary.low_probability_count}
                      </div>
                      <div className="text-muted-foreground">Baixa Prob.</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {summary.vessels_ready} / {summary.vessels_at_risk}
                      </div>
                      <div className="text-muted-foreground">
                        Prontas / Em Risco
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vessel Scores Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Scores por Embarcação e Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vesselScores.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum score disponível
              </p>
            ) : (
              // Group by vessel
              Object.entries(
                vesselScores.reduce((acc, score) => {
                  if (!acc[score.vessel_name]) {
                    acc[score.vessel_name] = [];
                  }
                  acc[score.vessel_name].push(score);
                  return acc;
                }, {} as Record<string, VesselScore[]>)
              ).map(([vesselName, scores]) => (
                <div key={vesselName} className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">{vesselName}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {scores.map((score) => (
                      <div
                        key={`${score.vessel_id}-${score.audit_type}`}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {score.audit_type}
                          </span>
                          {getProbabilityBadge(score.pass_probability)}
                        </div>
                        <div
                          className={`text-2xl font-bold ${getScoreColor(score.expected_score)}`}
                        >
                          {score.expected_score}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getScoreBarColor(score.expected_score)}`}
                            style={{ width: `${score.expected_score}%` }}
                          />
                        </div>
                      </div>
                    ))}
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
