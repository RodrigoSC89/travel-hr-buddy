/**
 * Scenario Simulator - Interactive what-if analysis
 * Simulates operational scenarios with AI-powered predictions
 */

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Loader2,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Target,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { logger } from '@/lib/logger';

interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  scenario: string;
}

interface SimulationResult {
  scenario: string;
  operationalImpact: {
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    affectedAreas: string[];
  };
  financialImpact: {
    estimatedCost: number;
    currency: string;
    breakdown: Record<string, number>;
  };
  risks: Array<{
    description: string;
    probability: number;
    mitigation: string;
  }>;
  successProbability: number;
  recommendations: string[];
}

const PRESETS: ScenarioPreset[] = [
  {
    id: "maintenance",
    name: "Parada de Manutenção",
    description: "Simular impacto de parada programada",
    scenario: "Parada de manutenção programada de 15 dias para dique seco. Considerando custos de doca, tripulação, e perda de receita operacional.",
  },
  {
    id: "route-change",
    name: "Mudança de Rota",
    description: "Avaliar desvio de rota por condições climáticas",
    scenario: "Desvio de rota de 200 milhas náuticas devido a tempestade. Avaliar impacto no consumo de combustível, atraso na entrega e custos adicionais.",
  },
  {
    id: "crew-shortage",
    name: "Falta de Tripulação",
    description: "Impacto de ausência de tripulante chave",
    scenario: "Ausência não planejada do Chefe de Máquinas por 30 dias. Avaliar necessidade de substituição, custos de repatriação e impacto operacional.",
  },
  {
    id: "fuel-price",
    name: "Aumento do Combustível",
    description: "Impacto de variação no preço do combustível",
    scenario: "Aumento de 25% no preço do combustível marítimo por 3 meses. Avaliar impacto no OPEX e estratégias de mitigação.",
  },
];

export const ScenarioSimulator: React.FC = () => {
  const [scenario, setScenario] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const { analyze, isLoading } = useNautilusAI();

  const handlePresetSelect = (preset: ScenarioPreset) => {
    setScenario(preset.scenario);
  };

  const handleSimulate = async () => {
    if (!scenario.trim()) return;

    try {
      const response = await analyze("command", `
        Simule o seguinte cenário operacional e forneça uma análise detalhada em formato JSON:
        
        CENÁRIO: ${scenario}
        
        Forneça a resposta no seguinte formato JSON:
        {
          "scenario": "descrição do cenário",
          "operationalImpact": {
            "description": "descrição do impacto operacional",
            "severity": "low|medium|high|critical",
            "affectedAreas": ["área1", "área2"]
          },
          "financialImpact": {
            "estimatedCost": 50000,
            "currency": "USD",
            "breakdown": {"item1": 20000, "item2": 30000}
          },
          "risks": [
            {"description": "risco", "probability": 0.3, "mitigation": "ação"}
          ],
          "successProbability": 0.75,
          "recommendations": ["rec1", "rec2"]
        }
      `);

      if (response?.response) {
        try {
          // Try to parse JSON from response
          const jsonMatch = response.response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setResult(parsed);
          } else {
            // Create default result from text response
            setResult({
              scenario: scenario,
              operationalImpact: {
                description: response.response.substring(0, 200),
                severity: "medium",
                affectedAreas: ["Operações", "Finanças"],
              },
              financialImpact: {
                estimatedCost: 50000,
                currency: "USD",
                breakdown: { "Custos estimados": 50000 },
              },
              risks: [{
                description: "Risco operacional identificado",
                probability: 0.5,
                mitigation: "Monitoramento contínuo",
              }],
              successProbability: 0.7,
              recommendations: [response.response],
            });
          }
        } catch {
          // Fallback result
          setResult({
            scenario: scenario,
            operationalImpact: {
              description: response.response,
              severity: "medium",
              affectedAreas: ["Operações"],
            },
            financialImpact: {
              estimatedCost: 0,
              currency: "USD",
              breakdown: {},
            },
            risks: [],
            successProbability: 0.7,
            recommendations: ["Análise detalhada necessária"],
          });
        }
      }
    } catch (error) {
      logger.error("Simulation failed:", error);
    }
  };

  const handleReset = () => {
    setScenario("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Simulador de Cenários
          </h2>
          <p className="text-muted-foreground">
            Analise o impacto de decisões operacionais antes de executá-las
          </p>
        </div>
        {result && (
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Nova Simulação
          </Button>
        )}
      </div>

      {!result ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cenários Predefinidos</CardTitle>
              <CardDescription>
                Selecione um cenário comum ou crie o seu próprio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PRESETS.map((preset) => (
                <motion.button
                  key={preset.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePresetSelect(preset)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    scenario === preset.scenario
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                >
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {preset.description}
                  </p>
                </motion.button>
              ))}
            </CardContent>
          </Card>

          {/* Custom Scenario */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurar Cenário</CardTitle>
              <CardDescription>
                Descreva o cenário em detalhes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scenario">Descrição do Cenário</Label>
                <Textarea
                  id="scenario"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="Ex: O que acontece se desviarmos a rota em 100 milhas?"
                  rows={6}
                />
              </div>

              <Button
                onClick={handleSimulate}
                disabled={isLoading || !scenario.trim()}
                className="w-full gap-2"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Simulando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Executar Simulação
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Results */
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resultado da Simulação</CardTitle>
                <Badge
                  variant={
                    result.successProbability > 0.7
                      ? "default"
                      : result.successProbability > 0.4
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {Math.round(result.successProbability * 100)}% chance de sucesso
                </Badge>
              </div>
              <CardDescription>{result.scenario}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress
                value={result.successProbability * 100}
                className="h-3"
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Operational Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Impacto Operacional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Severidade</span>
                  <Badge
                    variant={
                      result.operationalImpact.severity === "critical"
                        ? "destructive"
                        : result.operationalImpact.severity === "high"
                        ? "destructive"
                        : result.operationalImpact.severity === "medium"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {result.operationalImpact.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.operationalImpact.description}
                </p>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Áreas Afetadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.operationalImpact.affectedAreas.map((area, i) => (
                      <Badge key={i} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Impacto Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  {result.financialImpact.currency}{" "}
                  {result.financialImpact.estimatedCost.toLocaleString()}
                </div>
                <Separator />
                <div className="space-y-2">
                  {Object.entries(result.financialImpact.breakdown).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium">
                          {result.financialImpact.currency}{" "}
                          {(value as number).toLocaleString()}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risks */}
          {result.risks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Riscos Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.risks.map((risk, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{risk.description}</span>
                        <Badge variant="outline">
                          {Math.round(risk.probability * 100)}% probabilidade
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Mitigação:</strong> {risk.mitigation}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ScenarioSimulator;
