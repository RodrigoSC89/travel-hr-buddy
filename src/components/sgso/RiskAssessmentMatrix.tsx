import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, TrendingUp, Shield, Activity } from "lucide-react";

interface Risk {
  id: string;
  title: string;
  category: string;
  probability: number;
  impact: number;
  riskLevel: "negligible" | "low" | "medium" | "high" | "critical";
  riskScore: number;
}

const SAMPLE_RISKS: Risk[] = [
  {
    id: "1",
    title: "Falha DP em operação crítica",
    category: "operational",
    probability: 2,
    impact: 5,
    riskLevel: "high",
    riskScore: 10,
  },
  {
    id: "2",
    title: "Vazamento de óleo",
    category: "environmental",
    probability: 3,
    impact: 4,
    riskLevel: "medium",
    riskScore: 12,
  },
  {
    id: "3",
    title: "Acidente com tripulante",
    category: "health_safety",
    probability: 2,
    impact: 4,
    riskLevel: "medium",
    riskScore: 8,
  },
  {
    id: "4",
    title: "Falha sistema contraincêndio",
    category: "operational",
    probability: 4,
    impact: 5,
    riskLevel: "critical",
    riskScore: 20,
  },
];

const getRiskColor = (level: string) => {
  const colors = {
    critical: "bg-red-700 text-white border-red-900",
    high: "bg-orange-600 text-white border-orange-800",
    medium: "bg-yellow-500 text-white border-yellow-700",
    low: "bg-blue-500 text-white border-blue-700",
    negligible: "bg-green-500 text-white border-green-700",
  };
  return colors[level as keyof typeof colors] || "bg-gray-500";
};

const getRiskLevelLabel = (level: string) => {
  const labels = {
    critical: "Crítico",
    high: "Alto",
    medium: "Médio",
    low: "Baixo",
    negligible: "Negligível",
  };
  return labels[level as keyof typeof labels] || level;
};

const calculateRiskLevel = (probability: number, impact: number): string => {
  const score = probability * impact;
  if (score >= 20) return "critical";
  if (score >= 15) return "high";
  if (score >= 8) return "medium";
  if (score >= 4) return "low";
  return "negligible";
};

export const RiskAssessmentMatrix: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<{ probability: number; impact: number } | null>(
    null
  );
  const { toast } = useToast();

  const handleViewDetails = (riskTitle: string) => {
    toast({
      title: "📋 Detalhes do Risco",
      description: `Abrindo análise detalhada: ${riskTitle}`,
    });
    // TODO: Open risk details dialog
  };

  const handleNewRisk = () => {
    toast({
      title: "➕ Novo Registro de Risco",
      description: "Abrindo formulário de registro de risco",
    });
    // TODO: Open new risk registration form
  };

  const probabilityLabels = [
    "Muito Baixa (1)",
    "Baixa (2)",
    "Média (3)",
    "Alta (4)",
    "Muito Alta (5)",
  ];
  const impactLabels = [
    "Insignificante (1)",
    "Menor (2)",
    "Moderado (3)",
    "Maior (4)",
    "Catastrófico (5)",
  ];

  const criticalCount = SAMPLE_RISKS.filter(r => r.riskLevel === "critical").length;
  const highCount = SAMPLE_RISKS.filter(r => r.riskLevel === "high").length;
  const mediumCount = SAMPLE_RISKS.filter(r => r.riskLevel === "medium").length;

  return (
    <div className="space-y-6">
      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Riscos Críticos</p>
                <p className="text-3xl font-bold text-red-900">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Riscos Altos</p>
                <p className="text-3xl font-bold text-orange-900">{highCount}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Riscos Médios</p>
                <p className="text-3xl font-bold text-yellow-900">{mediumCount}</p>
              </div>
              <Activity className="h-12 w-12 text-yellow-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Riscos</p>
                <p className="text-3xl font-bold text-blue-900">{SAMPLE_RISKS.length}</p>
              </div>
              <Shield className="h-12 w-12 text-blue-600 opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Matrix 5x5 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            Matriz de Riscos 5x5
          </CardTitle>
          <CardDescription>Avaliação de riscos baseada em Probabilidade x Impacto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Matrix Grid */}
              <div className="grid grid-cols-6 gap-1 bg-gray-200 p-2 rounded-lg">
                {/* Top-left corner cell */}
                <div className="bg-secondary p-4 flex items-center justify-center font-bold text-sm text-secondary-foreground rounded">
                  Probabilidade
                  <br />↓ / Impacto →
                </div>

                {/* Impact headers (columns) */}
                {impactLabels.map((label, index) => (
                  <div
                    key={`impact-${index}`}
                    className="bg-blue-100 p-4 flex items-center justify-center text-center font-bold text-sm text-blue-900 rounded border-2 border-blue-300"
                  >
                    {label}
                  </div>
                ))}

                {/* Probability rows with cells */}
                {[5, 4, 3, 2, 1].map(probability => (
                  <React.Fragment key={`prob-${probability}`}>
                    {/* Probability label */}
                    <div className="bg-blue-100 p-4 flex items-center justify-center text-center font-bold text-sm text-blue-900 rounded border-2 border-blue-300">
                      {probabilityLabels[probability - 1]}
                    </div>

                    {/* Risk cells for each impact level */}
                    {[1, 2, 3, 4, 5].map(impact => {
                      const riskLevel = calculateRiskLevel(probability, impact);
                      const score = probability * impact;
                      const risksInCell = SAMPLE_RISKS.filter(
                        r => r.probability === probability && r.impact === impact
                      );

                      return (
                        <div
                          key={`cell-${probability}-${impact}`}
                          className={`${getRiskColor(riskLevel)} p-4 rounded cursor-pointer hover:opacity-90 transition-all border-2 flex flex-col items-center justify-center min-h-[100px] relative`}
                          onClick={() => setSelectedCell({ probability, impact })}
                        >
                          <div className="text-center">
                            <div className="font-bold text-lg mb-1">{score}</div>
                            <div className="text-xs font-semibold uppercase">
                              {getRiskLevelLabel(riskLevel)}
                            </div>
                          </div>
                          {risksInCell.length > 0 && (
                            <Badge className="absolute top-1 right-1 bg-white text-gray-900 font-bold border-2">
                              {risksInCell.length}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                {["critical", "high", "medium", "low", "negligible"].map(level => (
                  <div key={level} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded ${getRiskColor(level)} border-2`} />
                    <span className="text-sm font-semibold text-gray-900">
                      {getRiskLevelLabel(level)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Riscos Identificados</CardTitle>
          <CardDescription>Lista de riscos ativos no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SAMPLE_RISKS.sort((a, b) => b.riskScore - a.riskScore).map(risk => (
              <Card key={risk.id} className="border-2 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getRiskColor(risk.riskLevel)}>
                          {getRiskLevelLabel(risk.riskLevel)}
                        </Badge>
                        <h3 className="font-bold text-gray-900">{risk.title}</h3>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>
                          Probabilidade: <strong>{risk.probability}/5</strong>
                        </span>
                        <span>
                          Impacto: <strong>{risk.impact}/5</strong>
                        </span>
                        <span>
                          Score: <strong className="text-red-600">{risk.riskScore}</strong>
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white"
                      onClick={() => handleViewDetails(risk.title)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
              onClick={handleNewRisk}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Novo Registro de Risco
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAssessmentMatrix;
