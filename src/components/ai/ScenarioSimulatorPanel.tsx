/**
 * Scenario Simulator Panel - What-If analysis with AI
 */

import { memo, memo, useState, useCallback, useMemo } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FlaskConical,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  DollarSign,
  Clock,
  Fuel,
  Users,
  Wrench,
  Ship,
  Sparkles,
  Loader2,
  Save,
  Share2,
} from "lucide-react";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { motion } from "framer-motion";

interface SimulationResult {
  metric: string;
  current: number;
  simulated: number;
  change: number;
  unit: string;
  impact: "positive" | "negative" | "neutral";
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, number>;
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    id: "fuel-optimization",
    name: "Otimização de Combustível",
    description: "Reduzir velocidade média em 10% para economizar combustível",
    parameters: { speedReduction: 10, routeOptimization: 15, maintenanceInterval: 0 },
  },
  {
    id: "crew-reduction",
    name: "Redução de Tripulação",
    description: "Avaliar impacto de reduzir 2 tripulantes por embarcação",
    parameters: { crewReduction: 2, automationLevel: 20, trainingInvestment: 10 },
  },
  {
    id: "maintenance-delay",
    name: "Adiamento de Manutenção",
    description: "Adiar manutenção preventiva em 30 dias",
    parameters: { maintenanceDelay: 30, riskTolerance: 15, sparePartsStock: -10 },
  },
];

export const ScenarioSimulatorPanel = memo(function() {
  const [activeScenario, setActiveScenario] = useState<string>("custom");
  const [parameters, setParameters] = useState({
    fuelPrice: 0,
    crewCost: 0,
    maintenanceBudget: 0,
    operationalDays: 0,
    speedAdjustment: 0,
  });
  const [results, setResults] = useState<SimulationResult[] | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const { analyze, isLoading } = useNautilusAI();

  const runSimulation = async () => {
    // Simulate results based on parameters
    const simulatedResults: SimulationResult[] = [
      {
        metric: "Custo Operacional",
        current: 1250000,
        simulated: 1250000 * (1 + (parameters.fuelPrice + parameters.crewCost + parameters.maintenanceBudget) / 300),
        change: (parameters.fuelPrice + parameters.crewCost + parameters.maintenanceBudget) / 3,
        unit: "USD/mês",
        impact: parameters.fuelPrice + parameters.crewCost + parameters.maintenanceBudget > 0 ? "negative" : "positive",
      },
      {
        metric: "Consumo de Combustível",
        current: 45000,
        simulated: 45000 * (1 - parameters.speedAdjustment / 100),
        change: -parameters.speedAdjustment * 0.8,
        unit: "L/mês",
        impact: parameters.speedAdjustment > 0 ? "positive" : "negative",
      },
      {
        metric: "Dias Operacionais",
        current: 28,
        simulated: 28 + parameters.operationalDays * 0.1,
        change: parameters.operationalDays * 0.1,
        unit: "dias/mês",
        impact: parameters.operationalDays > 0 ? "positive" : "negative",
      },
      {
        metric: "Risco de Parada",
        current: 5,
        simulated: 5 + (parameters.maintenanceBudget < 0 ? Math.abs(parameters.maintenanceBudget) * 0.3 : -parameters.maintenanceBudget * 0.1),
        change: parameters.maintenanceBudget < 0 ? Math.abs(parameters.maintenanceBudget) * 0.3 : -parameters.maintenanceBudget * 0.1,
        unit: "%",
        impact: parameters.maintenanceBudget < 0 ? "negative" : "positive",
      },
    ];

    setResults(simulatedResults);

    // Get AI analysis
    try {
      const response = await analyze(
        "voyage",
        `Análise de cenário What-If com parâmetros: ${JSON.stringify(parameters)}`,
        { parameters, results: simulatedResults }
      );
      setAiAnalysis(response?.response || "Análise gerada com base nos parâmetros simulados.");
    } catch (error) {
      setAiAnalysis("Cenário analisado. Considere os trade-offs entre custo e risco operacional.");
    }
  };

  const resetSimulation = () => {
    setParameters({
      fuelPrice: 0,
      crewCost: 0,
      maintenanceBudget: 0,
      operationalDays: 0,
      speedAdjustment: 0,
    });
    setResults(null);
    setAiAnalysis("");
  };

  const loadPreset = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    const scenario = PRESET_SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      setParameters({
        fuelPrice: scenario.parameters.fuelPrice || 0,
        crewCost: scenario.parameters.crewCost || 0,
        maintenanceBudget: scenario.parameters.maintenanceBudget || 0,
        operationalDays: 0,
        speedAdjustment: scenario.parameters.speedReduction || 0,
      });
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
    case "positive":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "negative":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          Simulador de Cenários
          <Badge variant="outline" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            What-If AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeScenario} onValueChange={setActiveScenario}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
            <TabsTrigger value="fuel-optimization">Combustível</TabsTrigger>
            <TabsTrigger value="crew-reduction">Tripulação</TabsTrigger>
            <TabsTrigger value="maintenance-delay">Manutenção</TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-4 mt-4">
            {/* Parameter Sliders */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-orange-500" />
                    Variação Preço Combustível
                  </label>
                  <span className="text-sm font-mono">{parameters.fuelPrice > 0 ? "+" : ""}{parameters.fuelPrice}%</span>
                </div>
                <Slider
                  value={[parameters.fuelPrice]}
                  onValueChange={([v]) => setParameters(p => ({ ...p, fuelPrice: v }))}
                  min={-30}
                  max={30}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Custo Tripulação
                  </label>
                  <span className="text-sm font-mono">{parameters.crewCost > 0 ? "+" : ""}{parameters.crewCost}%</span>
                </div>
                <Slider
                  value={[parameters.crewCost]}
                  onValueChange={([v]) => setParameters(p => ({ ...p, crewCost: v }))}
                  min={-20}
                  max={20}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-purple-500" />
                    Orçamento Manutenção
                  </label>
                  <span className="text-sm font-mono">{parameters.maintenanceBudget > 0 ? "+" : ""}{parameters.maintenanceBudget}%</span>
                </div>
                <Slider
                  value={[parameters.maintenanceBudget]}
                  onValueChange={([v]) => setParameters(p => ({ ...p, maintenanceBudget: v }))}
                  min={-30}
                  max={30}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center gap-2">
                    <Ship className="h-4 w-4 text-cyan-500" />
                    Redução de Velocidade
                  </label>
                  <span className="text-sm font-mono">{parameters.speedAdjustment}%</span>
                </div>
                <Slider
                  value={[parameters.speedAdjustment]}
                  onValueChange={([v]) => setParameters(p => ({ ...p, speedAdjustment: v }))}
                  min={0}
                  max={25}
                  step={5}
                />
              </div>
            </div>
          </TabsContent>

          {PRESET_SCENARIOS.map(scenario => (
            <TabsContent key={scenario.id} value={scenario.id} className="mt-4">
              <div className="bg-muted/30 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-sm mb-1">{scenario.name}</h4>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleloadPreset}
                className="w-full"
              >
                Carregar Parâmetros
              </Button>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={runSimulation} disabled={isLoading} className="flex-1">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Simular
          </Button>
          <Button variant="outline" onClick={resetSimulation}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Save className="h-4 w-4" />
          </Button>
        </div>

        {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Resultados da Simulação
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {results.map((result, i) => (
                <div key={i} className="bg-muted/30 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{result.metric}</span>
                    {getImpactIcon(result.impact)}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">
                      {result.metric.includes("Custo") || result.metric.includes("USD")
                        ? `$${(result.simulated / 1000).toFixed(0)}k`
                        : result.simulated.toFixed(1)}
                    </span>
                    <span className={`text-xs ${result.change > 0 ? "text-red-500" : "text-green-500"}`}>
                      {result.change > 0 ? "+" : ""}{result.change.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{result.unit}</span>
                </div>
              ))}
            </div>

            {/* AI Analysis */}
            {aiAnalysis && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Análise IA</span>
                </div>
                <p className="text-xs text-muted-foreground">{aiAnalysis}</p>
              </div>
            )}

            {/* Risk Warning */}
            {results.some(r => r.impact === "negative" && Math.abs(r.change) > 10) && (
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  Este cenário apresenta riscos significativos. Avalie cuidadosamente antes de implementar.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
    );
  }
});
