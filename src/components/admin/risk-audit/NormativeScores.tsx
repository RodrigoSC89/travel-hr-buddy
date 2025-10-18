import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Award, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuditScore {
  audit_type: string;
  expected_score: number;
  probability: string;
  vessel_name: string;
  prediction_date: string;
}

const AUDIT_TYPES = ["Petrobras", "IBAMA", "ISO", "IMCA", "ISM", "SGSO"];

export function NormativeScores() {
  const [loading, setLoading] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [vessels, setVessels] = useState<any[]>([]);
  const [scores, setScores] = useState<AuditScore[]>([]);

  useEffect(() => {
    loadVessels();
    loadScores();
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

  async function loadScores() {
    setLoading(true);
    try {
      const vesselFilter = selectedVessel === "all" ? null : selectedVessel;
      
      const { data, error } = await supabase
        .rpc("get_latest_audit_predictions", { vessel_uuid: vesselFilter });

      if (error) throw error;

      const formattedScores: AuditScore[] = (data || []).map((pred: any) => ({
        audit_type: pred.audit_type,
        expected_score: pred.expected_score,
        probability: pred.probability,
        vessel_name: pred.vessel_name,
        prediction_date: pred.prediction_date,
      }));

      setScores(formattedScores);
    } catch (error) {
      console.error("Error loading scores:", error);
      toast.error("Erro ao carregar scores");
    } finally {
      setLoading(false);
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-600";
    if (score >= 70) return "bg-blue-600";
    if (score >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case "Alta":
        return "default";
      case "Média":
        return "secondary";
      case "Baixa":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getReadinessStatus = (score: number, probability: string) => {
    if (score >= 85 && probability === "Alta") return "Excelente";
    if (score >= 70) return "Bom";
    if (score >= 60) return "Adequado";
    return "Necessita Melhoria";
  };

  // Group scores by audit type
  const scoresByType = AUDIT_TYPES.map((type) => {
    const typeScores = scores.filter((s) => s.audit_type === type);
    if (typeScores.length === 0) return null;

    const avgScore = typeScores.reduce((sum, s) => sum + s.expected_score, 0) / typeScores.length;
    
    // Count probability distribution
    const probCounts = {
      Alta: typeScores.filter((s) => s.probability === "Alta").length,
      Média: typeScores.filter((s) => s.probability === "Média").length,
      Baixa: typeScores.filter((s) => s.probability === "Baixa").length,
    };

    return {
      type,
      avgScore: Math.round(avgScore),
      vessels: typeScores.length,
      probCounts,
      scores: typeScores,
    };
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scores Normativos</h2>
          <p className="text-muted-foreground">
            Prontidão de auditoria por padrão normativo
          </p>
        </div>

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

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : scores.length === 0 ? (
        <Alert>
          <AlertDescription>
            Nenhuma previsão de auditoria disponível. Use o Simulador de Auditoria para gerar previsões.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Overall Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Resumo Geral de Conformidade
              </CardTitle>
              <CardDescription>
                Média de scores de todos os padrões normativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <span className="text-sm font-medium">Score Médio Geral</span>
                  <div className={`text-3xl font-bold ${getScoreColor(
                    scores.reduce((sum, s) => sum + s.expected_score, 0) / scores.length
                  )}`}>
                    {Math.round(scores.reduce((sum, s) => sum + s.expected_score, 0) / scores.length)}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium">Total de Avaliações</span>
                  <div className="text-3xl font-bold text-blue-600">{scores.length}</div>
                </div>
                <div>
                  <span className="text-sm font-medium">Navios Avaliados</span>
                  <div className="text-3xl font-bold text-purple-600">
                    {new Set(scores.map((s) => s.vessel_name)).size}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scores by Normative Standard */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scores por Padrão Normativo</h3>
            {scoresByType.map((item: any) => (
              <Card key={item.type}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.type}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {item.vessels} navio{item.vessels > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Score Médio</span>
                        <span className={`text-2xl font-bold ${getScoreColor(item.avgScore)}`}>
                          {item.avgScore}
                        </span>
                      </div>
                      <Progress value={item.avgScore} className="h-3" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <Badge variant="default" className="mb-1">Alta</Badge>
                        <div className="text-xl font-bold">{item.probCounts.Alta}</div>
                      </div>
                      <div className="text-center">
                        <Badge variant="secondary" className="mb-1">Média</Badge>
                        <div className="text-xl font-bold">{item.probCounts.Média}</div>
                      </div>
                      <div className="text-center">
                        <Badge variant="destructive" className="mb-1">Baixa</Badge>
                        <div className="text-xl font-bold">{item.probCounts.Baixa}</div>
                      </div>
                    </div>

                    {/* Individual vessel scores */}
                    {selectedVessel === "all" && item.vessels > 1 && (
                      <div className="pt-2 border-t space-y-2">
                        <span className="text-sm font-medium">Detalhamento por Navio:</span>
                        {item.scores.map((score: AuditScore, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span>{score.vessel_name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${getScoreColor(score.expected_score)}`}>
                                {score.expected_score}
                              </span>
                              <Badge variant={getProbabilityColor(score.probability)} className="text-xs">
                                {score.probability}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
