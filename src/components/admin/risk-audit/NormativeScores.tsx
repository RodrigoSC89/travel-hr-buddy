import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AUDIT_TYPES = ["Petrobras", "IBAMA", "ISO", "IMCA", "ISM", "SGSO"];

interface NormativeScore {
  audit_type: string;
  vessel_name: string;
  latest_score: number;
  probability: string;
  risk_count: number;
  critical_risks: number;
  readiness_level: string;
}

export function NormativeScores() {
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<NormativeScore[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.rpc("get_audit_readiness_summary");
      
      if (data) {
        setScores(data);
      }
    } catch (error: any) {
      console.error("Error loading normative scores:", error);
      toast.error("Failed to load normative scores");
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityIcon = (probability: string) => {
    switch (probability) {
    case "Alta":
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case "Baixa":
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
    case "Excellent":
      return "text-green-600";
    case "Good":
      return "text-blue-600";
    case "Fair":
      return "text-yellow-600";
    default:
      return "text-red-600";
    }
  };

  const getReadinessBadge = (level: string) => {
    switch (level) {
    case "Excellent":
      return "default";
    case "Good":
      return "secondary";
    case "Fair":
      return "outline";
    default:
      return "destructive";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Group scores by audit type
  const scoresByType = AUDIT_TYPES.reduce((acc, type) => {
    acc[type] = scores.filter(s => s.audit_type === type);
    return acc;
  }, {} as Record<string, NormativeScore[]>);

  // Calculate overall statistics
  const overallStats = {
    avgScore: Math.round(scores.reduce((sum, s) => sum + (s.latest_score || 0), 0) / (scores.length || 1)),
    highReadiness: scores.filter(s => s.readiness_level === "Excellent" || s.readiness_level === "Good").length,
    totalRisks: scores.reduce((sum, s) => sum + s.risk_count, 0),
    criticalRisks: scores.reduce((sum, s) => sum + s.critical_risks, 0),
  };

  const filteredScores = selectedType
    ? scores.filter(s => s.audit_type === selectedType)
    : scores;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Scores Normativos</h2>
        <p className="text-sm text-muted-foreground">
          Pontuação de conformidade por padrão normativo
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(overallStats.avgScore)}`}>
              {overallStats.avgScore}
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alta Prontidão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-3xl font-bold text-green-600">
                {overallStats.highReadiness}
              </span>
              <span className="text-sm text-muted-foreground">
                / {scores.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Riscos Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.totalRisks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Riscos Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {overallStats.criticalRisks}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scores by Audit Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AUDIT_TYPES.map((type) => {
          const typeScores = scoresByType[type] || [];
          const avgScore = typeScores.length > 0
            ? Math.round(typeScores.reduce((sum, s) => sum + (s.latest_score || 0), 0) / typeScores.length)
            : 0;
          
          const highProbability = typeScores.filter(s => s.probability === "Alta").length;
          
          return (
            <Card 
              key={type}
              className={`cursor-pointer transition-shadow hover:shadow-lg ${
                selectedType === type ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{type}</span>
                  {typeScores.length > 0 && (
                    <Badge variant="outline">{typeScores.length}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {typeScores.length > 0 ? `Score médio: ${avgScore}` : "Sem dados"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {typeScores.length > 0 ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Score Médio</span>
                        <span className={`font-semibold ${getScoreColor(avgScore)}`}>
                          {avgScore}%
                        </span>
                      </div>
                      <Progress value={avgScore} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Alta Prob.:</span>
                        <span className="ml-2 font-semibold text-green-600">
                          {highProbability}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Embarcações:</span>
                        <span className="ml-2 font-semibold">
                          {typeScores.length}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sem previsões disponíveis
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Scores List */}
      {selectedType && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes - {selectedType}</CardTitle>
            <CardDescription>
              Prontidão por embarcação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredScores.map((score, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">{score.vessel_name}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getReadinessBadge(score.readiness_level)}>
                        {score.readiness_level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {score.risk_count} riscos
                        {score.critical_risks > 0 && (
                          <span className="text-red-600 ml-1">
                            ({score.critical_risks} críticos)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className={`text-2xl font-bold ${getScoreColor(score.latest_score)}`}>
                      {score.latest_score || "N/A"}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {getProbabilityIcon(score.probability)}
                      <span className="text-muted-foreground">{score.probability}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
