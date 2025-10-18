import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Target, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vessel {
  id: string;
  name: string;
}

interface AuditPrediction {
  id: string;
  vessel_id: string;
  audit_type: string;
  expected_score: number;
  pass_probability: string;
  confidence_level: number;
  weaknesses: string[];
  recommendations: string[];
  compliance_areas: Record<string, number>;
  predicted_date: string;
  valid_until: string;
}

const AUDIT_TYPES = ["Petrobras", "IBAMA", "ISO", "IMCA", "ISM", "SGSO"];

export function AuditSimulator() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedAuditType, setSelectedAuditType] = useState<string>("");
  const [prediction, setPrediction] = useState<AuditPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
    try {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setVessels(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar embarcações",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadExistingPrediction = async (vesselId: string, auditType: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_predictions")
        .select("*")
        .eq("vessel_id", vesselId)
        .eq("audit_type", auditType)
        .eq("status", "Active")
        .gt("valid_until", new Date().toISOString())
        .order("predicted_date", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setPrediction(data || null);
    } catch (error: any) {
      console.error("Error loading prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePrediction = async () => {
    if (!selectedVessel || !selectedAuditType) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione uma embarcação e tipo de auditoria",
        variant: "destructive",
      });
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

      if (!response.ok) throw new Error("Failed to generate prediction");

      const result = await response.json();
      setPrediction(result.prediction);
      toast({
        title: "Previsão gerada com sucesso",
        description: `Score esperado: ${result.prediction.expected_score}`,
      });
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

  useEffect(() => {
    if (selectedVessel && selectedAuditType) {
      loadExistingPrediction(selectedVessel, selectedAuditType);
    } else {
      setPrediction(null);
    }
  }, [selectedVessel, selectedAuditType]);

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case "Alta":
        return "bg-green-500";
      case "Média":
        return "bg-yellow-500";
      case "Baixa":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Auditoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Embarcação</label>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Auditoria</label>
              <Select
                value={selectedAuditType}
                onValueChange={setSelectedAuditType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generatePrediction}
            disabled={!selectedVessel || !selectedAuditType || generating}
            className="w-full"
          >
            <Target className="mr-2 h-4 w-4" />
            {generating ? "Gerando Previsão..." : "Simular Auditoria"}
          </Button>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : prediction ? (
        <div className="space-y-4">
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Score Esperado
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(prediction.expected_score)}`}>
                  {prediction.expected_score}
                </div>
                <p className="text-xs text-muted-foreground">De 0 a 100</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Probabilidade
                </CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <Badge className={getProbabilityColor(prediction.pass_probability)}>
                  {prediction.pass_probability}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  De aprovação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confiança</CardTitle>
                <AlertCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {prediction.confidence_level}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Nível de confiança
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Áreas de Conformidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(prediction.compliance_areas || {}).map(
                  ([area, score]) => (
                    <div key={area} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">
                          {area.replace(/_/g, " ")}
                        </span>
                        <span className={`font-semibold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            score >= 80
                              ? "bg-green-500"
                              : score >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weaknesses */}
          {prediction.weaknesses && prediction.weaknesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Pontos de Atenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
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
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground text-center">
            Previsão válida até:{" "}
            {new Date(prediction.valid_until).toLocaleDateString()}
          </div>
        </div>
      ) : (
        selectedVessel &&
        selectedAuditType && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma previsão disponível. Clique em "Simular Auditoria" para
              gerar uma nova previsão.
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
