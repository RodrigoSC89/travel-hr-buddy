"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Target, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";

interface Vessel {
  id: string;
  name: string;
}

interface AuditPrediction {
  id: string;
  vessel_id: string;
  audit_type: string;
  predicted_score: number;
  confidence_level: number;
  pass_probability: number;
  compliance_areas: Array<{ area: string; score: number }>;
  weaknesses: string[];
  recommendations: string[];
  readiness_status: string;
  prediction_date: string;
}

const AUDIT_TYPES = ["Petrobras", "IBAMA", "ISO", "IMCA", "ISM", "SGSO"];

export function AuditSimulator() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedAudit, setSelectedAudit] = useState<string>("");
  const [prediction, setPrediction] = useState<AuditPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
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
  };

  const simulateAudit = async () => {
    if (!selectedVessel || !selectedAudit) {
      toast({
        title: "Atenção",
        description: "Selecione um navio e tipo de auditoria",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/audit/score-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel_id: selectedVessel,
          audit_type: selectedAudit,
        }),
      });

      if (!response.ok) throw new Error("Failed to simulate audit");

      const data = await response.json();
      setPrediction(data.prediction);
      
      toast({
        title: "Simulação Concluída",
        description: `Previsão gerada para ${data.vessel_name}`,
      });
    } catch (error) {
      console.error("Error simulating audit:", error);
      toast({
        title: "Erro",
        description: "Falha ao simular auditoria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-green-500";
      case "Needs_Improvement":
        return "bg-yellow-500";
      case "Critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6" />
          Simulador de Auditoria
        </h2>
        <p className="text-muted-foreground">Preveja resultados de auditoria com IA</p>
      </div>

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração da Simulação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Navio</label>
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Auditoria</label>
              <Select value={selectedAudit} onValueChange={setSelectedAudit}>
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

          <Button onClick={simulateAudit} disabled={loading} className="w-full">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Simulando...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Simular Auditoria
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {prediction && (
        <div className="space-y-4">
          {/* Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Previsão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {prediction.predicted_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Score Previsto</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">
                    {prediction.confidence_level.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confiança</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {prediction.pass_probability.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Probabilidade</div>
                </div>
                <div className="text-center">
                  <Badge className={`${getReadinessColor(prediction.readiness_status)} text-white px-4 py-2 text-base`}>
                    {getReadinessLabel(prediction.readiness_status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Áreas de Conformidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prediction.compliance_areas?.map((area, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{area.area}</span>
                      <span className="font-medium">{area.score.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          area.score >= 70 ? "bg-green-500" : area.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${area.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weaknesses & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Pontos Fracos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.weaknesses?.map((weakness, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <span className="text-orange-600">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prediction.recommendations?.map((rec, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <span className="text-blue-600">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
