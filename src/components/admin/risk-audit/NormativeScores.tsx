import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NormativeScoresProps {
  selectedVessel: string | null;
}

interface NormativeScore {
  standard: string;
  score: number;
  status: string;
  description: string;
}

export const NormativeScores: React.FC<NormativeScoresProps> = ({
  selectedVessel,
}) => {
  const [scores, setScores] = useState<NormativeScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScores();
  }, [selectedVessel]);

  const loadScores = async () => {
    setLoading(true);
    try {
      // Load audit predictions grouped by audit type
      const query = supabase
        .from("audit_predictions")
        .select("audit_type, expected_score, probability_pass")
        .eq("status", "active");

      if (selectedVessel) {
        query.eq("vessel_id", selectedVessel);
      }

      const { data } = await query;

      // Group by audit type and calculate average
      const groupedScores: { [key: string]: { scores: number[]; probs: string[] } } = {};
      
      data?.forEach((pred) => {
        if (!groupedScores[pred.audit_type]) {
          groupedScores[pred.audit_type] = { scores: [], probs: [] };
        }
        groupedScores[pred.audit_type].scores.push(pred.expected_score);
        groupedScores[pred.audit_type].probs.push(pred.probability_pass);
      });

      const normativeScores: NormativeScore[] = Object.entries(groupedScores).map(
        ([standard, data]) => {
          const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
          const mostCommonProb = data.probs.sort(
            (a, b) =>
              data.probs.filter((v) => v === a).length -
              data.probs.filter((v) => v === b).length
          )[0];

          return {
            standard,
            score: Math.round(avgScore),
            status: mostCommonProb,
            description: getStandardDescription(standard),
          };
        }
      );

      setScores(normativeScores);
    } catch (error) {
      console.error("Error loading normative scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStandardDescription = (standard: string): string => {
    const descriptions: { [key: string]: string } = {
      IMCA: "International Marine Contractors Association",
      SGSO: "Sistema de Gestão de Segurança Operacional",
      ISM: "International Safety Management Code",
      ISO: "International Organization for Standardization",
      Petrobras: "Requisitos Petrobras",
      IBAMA: "Instituto Brasileiro do Meio Ambiente",
    };
    return descriptions[standard] || standard;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "warning";
    return "destructive";
  };

  const getStatusIcon = (status: string) => {
    if (status === "Alta") return <Award className="h-4 w-4 text-green-500" />;
    if (status === "Média") return <Shield className="h-4 w-4 text-yellow-500" />;
    return <Shield className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Scores Normativos
          </CardTitle>
          <CardDescription>
            Pontuação por padrão normativo (IMCA, SGSO, ISM, ISO)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Carregando scores...
            </p>
          ) : scores.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum score disponível. Execute simulações de auditoria primeiro.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {scores.map((score) => (
                <Card key={score.standard}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{score.standard}</CardTitle>
                      {getStatusIcon(score.status)}
                    </div>
                    <CardDescription className="text-xs">
                      {score.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Score</span>
                        <Badge variant={getScoreColor(score.score)}>
                          {score.score}
                        </Badge>
                      </div>
                      <Progress value={score.score} />
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">
                        Probabilidade de Aprovação
                      </span>
                      <Badge
                        variant={
                          score.status === "Alta"
                            ? "default"
                            : score.status === "Média"
                              ? "warning"
                              : "destructive"
                        }
                        className="w-full justify-center"
                      >
                        {score.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
