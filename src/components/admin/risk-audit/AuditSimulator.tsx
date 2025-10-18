import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface AuditSimulatorProps {
  selectedVessel: string | null;
  onVesselSelect: (vesselId: string | null) => void;
}

export const AuditSimulator: React.FC<AuditSimulatorProps> = ({
  selectedVessel,
  onVesselSelect,
}) => {
  const [vessels, setVessels] = useState<{ id: string; name: string }[]>([]);
  const [auditType, setAuditType] = useState<string>("Petrobras");
  const [prediction, setPrediction] = useState<{
    expected_score: number;
    probability_pass: string;
    ai_confidence?: number;
    weaknesses?: string[];
    recommendations?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
    const { data } = await supabase.from("vessels").select("*").order("name");
    setVessels(data || []);
  };

  const handleSimulate = async () => {
    if (!selectedVessel) {
      toast({
        title: "Selecione uma embarcação",
        description: "É necessário selecionar uma embarcação para simular.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/audit/score-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vessel_id: selectedVessel,
          audit_type: auditType,
        }),
      });

      if (!response.ok) throw new Error("Failed to predict");

      const result = await response.json();
      setPrediction(result.prediction);

      toast({
        title: "Simulação concluída",
        description: "Previsão de auditoria gerada com sucesso.",
      });
    } catch (error) {
      console.error("Error simulating:", error);
      toast({
        title: "Erro na simulação",
        description: "Não foi possível gerar a previsão.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = (prob: string) => {
    if (prob === "Alta") return "default";
    if (prob === "Média") return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Simulador de Auditoria
          </CardTitle>
          <CardDescription>
            Simule aprovação/reprovação futura em auditorias usando IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Embarcação
              </label>
              <Select
                value={selectedVessel || ""}
                onValueChange={onVesselSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
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

            <div>
              <label className="text-sm font-medium mb-2 block">
                Tipo de Auditoria
              </label>
              <Select value={auditType} onValueChange={setAuditType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrobras">Petrobras</SelectItem>
                  <SelectItem value="IBAMA">IBAMA</SelectItem>
                  <SelectItem value="ISO">ISO</SelectItem>
                  <SelectItem value="IMCA">IMCA</SelectItem>
                  <SelectItem value="ISM">ISM</SelectItem>
                  <SelectItem value="SGSO">SGSO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleSimulate}
                disabled={!selectedVessel || loading}
                className="w-full"
              >
                {loading ? "Simulando..." : "Simular Auditoria"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {prediction && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Simulação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Score Esperado</span>
                  <Badge
                    variant={
                      prediction.expected_score >= 75
                        ? "default"
                        : prediction.expected_score >= 60
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {prediction.expected_score}
                  </Badge>
                </div>
                <Progress value={prediction.expected_score} />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">
                  Probabilidade de Aprovação
                </span>
                <Badge
                  variant={getProbabilityColor(prediction.probability_pass)}
                  className="w-full justify-center"
                >
                  {prediction.probability_pass}
                </Badge>
              </div>

              {prediction.ai_confidence && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Confiança da IA
                    </span>
                    <span className="text-sm">{prediction.ai_confidence}%</span>
                  </div>
                  <Progress value={prediction.ai_confidence} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Pontos Fracos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prediction.weaknesses?.map((weakness: string, idx: number) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    {weakness}
                  </li>
                ))}
                {(!prediction.weaknesses ||
                  prediction.weaknesses.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum ponto fraco identificado
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prediction.recommendations?.map(
                  (rec: string, idx: number) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      {rec}
                    </li>
                  )
                )}
                {(!prediction.recommendations ||
                  prediction.recommendations.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma recomendação disponível
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
