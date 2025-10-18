import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditPrediction {
  id: string;
  vessel_id: string;
  audit_type: string;
  expected_score: number;
  probability: string;
  weaknesses: string[];
  recommendations: string[];
  compliance_areas: Record<string, number>;
  risk_factors: string[];
  ai_confidence: number;
  generated_at: string;
}

const AUDIT_TYPES = [
  { value: "Petrobras", label: "Petrobras" },
  { value: "IBAMA", label: "IBAMA" },
  { value: "ISO", label: "ISO" },
  { value: "IMCA", label: "IMCA" },
  { value: "ISM", label: "ISM" },
  { value: "SGSO", label: "SGSO" },
];

export function AuditSimulator() {
  const [vessels, setVessels] = useState<any[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedAuditType, setSelectedAuditType] = useState<string>("IMCA");
  const [prediction, setPrediction] = useState<AuditPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadVessels();
  }, []);

  useEffect(() => {
    if (selectedVessel) {
      loadLatestPrediction();
    }
  }, [selectedVessel, selectedAuditType]);

  const loadVessels = async () => {
    try {
      const { data } = await supabase
        .from("vessels")
        .select("id, name")
        .eq("status", "active")
        .order("name");

      setVessels((data as { id: string; name: string }[]) || []);
      if (data && data.length > 0) {
        setSelectedVessel(data[0].id);
      }
    } catch (error) {
      console.error("Error loading vessels:", error);
    }
  };

  const loadLatestPrediction = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("audit_predictions")
        .select("*")
        .eq("vessel_id", selectedVessel)
        .eq("audit_type", selectedAuditType)
        .gt("valid_until", new Date().toISOString())
        .order("generated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading prediction:", error);
      } else {
        setPrediction(data || null);
      }
    } catch (error) {
      console.error("Error loading prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  const simulateAudit = async () => {
    if (!selectedVessel) {
      toast.error("Selecione uma embarcação");
      return;
    }

    try {
      setSimulating(true);
      toast.info("Simulando auditoria...");

      const response = await fetch("/api/audit/score-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel_id: selectedVessel,
          audit_type: selectedAuditType,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao simular auditoria");
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success("Simulação concluída!");
        setPrediction({
          id: result.prediction.id,
          vessel_id: selectedVessel,
          audit_type: selectedAuditType,
          ...result.prediction,
        });
      }
    } catch (error) {
      console.error("Error simulating audit:", error);
      toast.error("Erro ao simular auditoria");
    } finally {
      setSimulating(false);
    }
  };

  const getProbabilityVariant = (probability: string) => {
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
      {/* Simulator Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Auditoria</CardTitle>
          <CardDescription>
            Preveja o resultado de auditorias antes que elas aconteçam
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Embarcação</label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Tipo de Auditoria</label>
              <Select value={selectedAuditType} onValueChange={setSelectedAuditType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={simulateAudit} disabled={simulating || !selectedVessel}>
              {simulating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Simulando...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 mr-2" />
                  Simular Auditoria
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : prediction ? (
        <div className="space-y-4">
          {/* Score & Probability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Score Esperado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${getScoreColor(prediction.expected_score)}`}>
                  {prediction.expected_score}
                  <span className="text-base text-muted-foreground">/100</span>
                </div>
                <Progress value={prediction.expected_score} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Probabilidade de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge 
                  variant={getProbabilityVariant(prediction.probability) as "default" | "secondary" | "destructive" | "outline" | null | undefined} 
                  className="text-lg px-4 py-2"
                >
                  {prediction.probability}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Confiança da IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {(prediction.ai_confidence * 100).toFixed(0)}%
                </div>
                <Progress value={prediction.ai_confidence * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Compliance Areas */}
          {prediction.compliance_areas && Object.keys(prediction.compliance_areas).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Conformidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(prediction.compliance_areas).map(([area, score]) => (
                    <div key={area}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{area}</span>
                        <span className={`text-sm font-bold ${getScoreColor(score as number)}`}>
                          {score}
                        </span>
                      </div>
                      <Progress value={score as number} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weaknesses */}
          {prediction.weaknesses && prediction.weaknesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Pontos Fracos Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-sm">{weakness}</span>
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
                  <FileCheck className="w-5 h-5 text-blue-500" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Risk Factors */}
          {prediction.risk_factors && prediction.risk_factors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fatores de Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {prediction.risk_factors.map((factor, index) => (
                    <Badge key={index} variant="outline">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Alert>
            <AlertDescription className="text-xs text-muted-foreground">
              Gerado em: {new Date(prediction.generated_at).toLocaleString('pt-BR')} • 
              Esta previsão é válida por 30 dias e tem caráter consultivo.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            Nenhuma simulação disponível. Clique em "Simular Auditoria" para gerar uma previsão.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
