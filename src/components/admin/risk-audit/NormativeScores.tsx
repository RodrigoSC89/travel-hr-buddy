"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Award, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface ComplianceScore {
  vessel_id: string;
  vessel_name: string;
  audit_type: string;
  predicted_score: number;
  readiness_status: string;
  pass_probability: number;
}

const AUDIT_TYPES = ["Petrobras", "IBAMA", "ISO", "IMCA", "ISM", "SGSO"];

export function NormativeScores() {
  const [scores, setScores] = useState<ComplianceScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .rpc("get_latest_audit_predictions");

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      console.error("Error loading scores:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar scores normativos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getReadinessIcon = (status: string) => {
    switch (status) {
      case "Ready":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Needs_Improvement":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "Critical":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getReadinessLabel = (status: string) => {
    switch (status) {
      case "Ready":
        return "Pronto";
      case "Needs_Improvement":
        return "Necessita Melhoria";
      case "Critical":
        return "Crítico";
      default:
        return "Desconhecido";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Group scores by vessel
  const vesselGroups = scores.reduce((acc, score) => {
    if (!acc[score.vessel_id]) {
      acc[score.vessel_id] = {
        vessel_name: score.vessel_name,
        scores: [],
      };
    }
    acc[score.vessel_id].scores.push(score);
    return acc;
  }, {} as Record<string, { vessel_name: string; scores: ComplianceScore[] }>);

  // Calculate overall statistics
  const stats = {
    totalScores: scores.length,
    avgScore: scores.length > 0 ? scores.reduce((sum, s) => sum + s.predicted_score, 0) / scores.length : 0,
    ready: scores.filter((s) => s.readiness_status === "Ready").length,
    needsImprovement: scores.filter((s) => s.readiness_status === "Needs_Improvement").length,
    critical: scores.filter((s) => s.readiness_status === "Critical").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6" />
          Scores Normativos
        </h2>
        <p className="text-muted-foreground">Pontuação de conformidade por norma</p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Score Médio</span>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(stats.avgScore)}`}>
              {stats.avgScore.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Prontos</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.ready}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-muted-foreground">Melhorias</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{stats.needsImprovement}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-muted-foreground">Críticos</span>
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Scores by Vessel */}
      {Object.entries(vesselGroups).map(([vesselId, group]) => (
        <Card key={vesselId}>
          <CardHeader>
            <CardTitle>{group.vessel_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {group.scores.map((score) => (
                <div key={`${score.vessel_id}-${score.audit_type}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{score.audit_type}</span>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getReadinessIcon(score.readiness_status)}
                        {getReadinessLabel(score.readiness_status)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(score.predicted_score)}`}>
                        {score.predicted_score.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {score.pass_probability.toFixed(0)}% prob. aprovação
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(score.predicted_score)} transition-all`}
                      style={{ width: `${score.predicted_score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Compliance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Conformidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Navio</th>
                  {AUDIT_TYPES.map((type) => (
                    <th key={type} className="text-center py-2 px-2">
                      {type}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(vesselGroups).map(([vesselId, group]) => (
                  <tr key={vesselId} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{group.vessel_name}</td>
                    {AUDIT_TYPES.map((type) => {
                      const score = group.scores.find((s) => s.audit_type === type);
                      return (
                        <td key={type} className="text-center py-2 px-2">
                          {score ? (
                            <Badge className={`${getProgressColor(score.predicted_score)} text-white`}>
                              {score.predicted_score.toFixed(0)}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {scores.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum score normativo disponível</p>
              <p className="text-sm mt-2">Gere previsões de auditoria para ver os scores</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
