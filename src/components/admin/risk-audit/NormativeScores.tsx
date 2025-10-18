import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NormativeScore {
  audit_type: string;
  avg_score: number;
  total_predictions: number;
  alta: number;
  media: number;
  baixa: number;
}

const AUDIT_TYPES = ["IMCA", "SGSO", "ISM", "ISO", "Petrobras", "IBAMA"];

export function NormativeScores() {
  const [scores, setScores] = useState<NormativeScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      setLoading(true);

      const scoresData: NormativeScore[] = [];

      for (const auditType of AUDIT_TYPES) {
        const { data, error } = await supabase
          .from("audit_predictions")
          .select("expected_score, probability")
          .eq("audit_type", auditType)
          .gt("valid_until", new Date().toISOString());

        if (error) {
          console.error(`Error loading ${auditType} scores:`, error);
          continue;
        }

        if (data && data.length > 0) {
          const avgScore = data.reduce((sum, item) => sum + item.expected_score, 0) / data.length;
          const alta = data.filter((item) => item.probability === "Alta").length;
          const media = data.filter((item) => item.probability === "Média").length;
          const baixa = data.filter((item) => item.probability === "Baixa").length;

          scoresData.push({
            audit_type: auditType,
            avg_score: Math.round(avgScore),
            total_predictions: data.length,
            alta,
            media,
            baixa,
          });
        }
      }

      setScores(scoresData);
    } catch (error) {
      console.error("Error loading normative scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (score: number, alta: number, total: number) => {
    const altaPercentage = total > 0 ? (alta / total) * 100 : 0;

    if (score >= 80 && altaPercentage >= 70) {
      return <Badge variant="default" className="bg-green-600">Excelente</Badge>;
    } else if (score >= 60 && altaPercentage >= 50) {
      return <Badge variant="default" className="bg-yellow-600">Bom</Badge>;
    } else {
      return <Badge variant="destructive">Requer Atenção</Badge>;
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
      <Card>
        <CardHeader>
          <CardTitle>Scores Normativos</CardTitle>
          <CardDescription>
            Conformidade por padrão e tipo de auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scores.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum score disponível. Execute simulações de auditoria primeiro.
            </div>
          ) : (
            <div className="space-y-6">
              {scores.map((score) => (
                <Card key={score.audit_type}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{score.audit_type}</h3>
                          <p className="text-sm text-muted-foreground">
                            {score.total_predictions} previsão(ões) ativa(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getScoreColor(score.avg_score)}`}>
                            {score.avg_score}
                          </div>
                          {getStatusBadge(score.avg_score, score.alta, score.total_predictions)}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Score Médio</span>
                          <span className="text-sm font-medium">{score.avg_score}/100</span>
                        </div>
                        <Progress value={score.avg_score} className="h-2" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{score.alta}</div>
                          <div className="text-xs text-muted-foreground">Alta</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{score.media}</div>
                          <div className="text-xs text-muted-foreground">Média</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{score.baixa}</div>
                          <div className="text-xs text-muted-foreground">Baixa</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo Geral de Conformidade</CardTitle>
        </CardHeader>
        <CardContent>
          {scores.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Score Médio Geral</div>
                  <div className={`text-3xl font-bold ${getScoreColor(
                    Math.round(scores.reduce((sum, s) => sum + s.avg_score, 0) / scores.length)
                  )}`}>
                    {Math.round(scores.reduce((sum, s) => sum + s.avg_score, 0) / scores.length)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total de Auditorias</div>
                  <div className="text-3xl font-bold">{scores.length}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Distribuição de Probabilidade</div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-green-100 rounded-md p-2 text-center">
                    <div className="text-lg font-bold text-green-700">
                      {scores.reduce((sum, s) => sum + s.alta, 0)}
                    </div>
                    <div className="text-xs text-green-600">Alta</div>
                  </div>
                  <div className="flex-1 bg-yellow-100 rounded-md p-2 text-center">
                    <div className="text-lg font-bold text-yellow-700">
                      {scores.reduce((sum, s) => sum + s.media, 0)}
                    </div>
                    <div className="text-xs text-yellow-600">Média</div>
                  </div>
                  <div className="flex-1 bg-red-100 rounded-md p-2 text-center">
                    <div className="text-lg font-bold text-red-700">
                      {scores.reduce((sum, s) => sum + s.baixa, 0)}
                    </div>
                    <div className="text-xs text-red-600">Baixa</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
