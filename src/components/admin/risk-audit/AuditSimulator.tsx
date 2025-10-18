import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileCheck, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface AuditPrediction {
  id: string;
  vessel_id: string;
  audit_type: string;
  expected_score: number;
  probability: string;
  compliance_areas: Record<string, number>;
  weaknesses: string[];
  recommendations: string[];
  risk_factors: string[];
  ai_confidence: number;
  prediction_date: string;
  vessel?: { name: string };
}

const AUDIT_TYPES = ["Petrobras", "IBAMA", "ISO", "IMCA", "ISM", "SGSO"];

export function AuditSimulator() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedAuditType, setSelectedAuditType] = useState<string>("");
  const [vessels, setVessels] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<AuditPrediction | null>(null);

  useEffect(() => {
    loadVessels();
  }, []);

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

  async function generateAuditPrediction() {
    if (!selectedVessel || !selectedAuditType) {
      toast.error("Selecione um navio e tipo de auditoria");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/audit/score-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel_id: selectedVessel,
          audit_type: selectedAuditType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate prediction");
      }

      const result = await response.json();
      
      // Load vessel name
      const { data: vessel } = await supabase
        .from("vessels")
        .select("name")
        .eq("id", selectedVessel)
        .single();

      setPrediction({
        ...result.prediction,
        vessel: vessel,
      });
      
      toast.success("Previsão de auditoria gerada com sucesso");
    } catch (error) {
      console.error("Error generating prediction:", error);
      toast.error("Erro ao gerar previsão");
    } finally {
      setGenerating(false);
    }
  }

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Auditoria</CardTitle>
          <CardDescription>
            Gere previsões de resultados de auditoria com inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Select value={selectedVessel} onValueChange={setSelectedVessel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um navio" />
              </SelectTrigger>
              <SelectContent>
                {vessels.map((vessel) => (
                  <SelectItem key={vessel.id} value={vessel.id}>
                    {vessel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAuditType} onValueChange={setSelectedAuditType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de auditoria" />
              </SelectTrigger>
              <SelectContent>
                {AUDIT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={generateAuditPrediction}
              disabled={generating || !selectedVessel || !selectedAuditType}
              className="w-full"
            >
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar Previsão
            </Button>
          </div>
        </CardContent>
      </Card>

      {prediction && (
        <div className="space-y-4">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {prediction.vessel?.name} - {prediction.audit_type}
                  </CardTitle>
                  <CardDescription>
                    Previsão gerada em {new Date(prediction.prediction_date).toLocaleDateString("pt-BR")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Score Esperado</span>
                  <div className={`text-3xl font-bold ${getScoreColor(prediction.expected_score)}`}>
                    {prediction.expected_score}
                  </div>
                  <Progress value={prediction.expected_score} className="h-2" />
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Probabilidade de Aprovação</span>
                  <div>
                    <Badge variant={getProbabilityColor(prediction.probability)} className="text-lg px-4 py-1">
                      {prediction.probability}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Confiança da IA</span>
                  <div className="text-3xl font-bold text-blue-600">
                    {prediction.ai_confidence}%
                  </div>
                  <Progress value={prediction.ai_confidence} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Areas */}
          {prediction.compliance_areas && Object.keys(prediction.compliance_areas).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Conformidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(prediction.compliance_areas).map(([area, score]) => (
                    <div key={area} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{area}</span>
                        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weaknesses and Recommendations */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Weaknesses */}
            {prediction.weaknesses && prediction.weaknesses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Pontos Fracos Identificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prediction.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {prediction.recommendations && prediction.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-green-600" />
                    Recomendações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Risk Factors */}
          {prediction.risk_factors && prediction.risk_factors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-semibold">Fatores de Risco: </span>
                {prediction.risk_factors.join(" • ")}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {!prediction && !generating && (
        <Alert>
          <AlertDescription>
            Selecione um navio e tipo de auditoria para gerar uma previsão
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
