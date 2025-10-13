import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Zap,
  RefreshCw,
  Play,
  Save,
  Download,
  Lightbulb,
  Gauge,
  Award,
  Shield,
  Archive,
  Eye
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    [key: string]: {
      name: string;
      currentValue: number;
      simulatedValue: number;
      min: number;
      max: number;
      unit: string;
      impact: "positive" | "negative" | "neutral";
    };
  };
  results: {
    overallScore: number;
    complianceRate: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    estimatedCost: number;
    implementationTime: number;
    recommendations: string[];
    impacts: {
      category: string;
      current: number;
      projected: number;
      improvement: number;
    }[];
  };
}

interface WhatIfAnalysis {
  scenario: string;
  inputChanges: { parameter: string; change: number }[];
  outputChanges: { metric: string; change: number; impact: "positive" | "negative" }[];
  recommendations: string[];
  feasibility: "high" | "medium" | "low";
  priority: "critical" | "high" | "medium" | "low";
}

const SIMULATION_PARAMETERS = {
  trainingInvestment: {
    name: "Investimento em Treinamento",
    currentValue: 100000,
    simulatedValue: 100000,
    min: 50000,
    max: 500000,
    unit: "R$",
    impact: "positive" as const
  },
  maintenanceFrequency: {
    name: "Frequência de Manutenção",
    currentValue: 30,
    simulatedValue: 30,
    min: 15,
    max: 90,
    unit: "dias",
    impact: "positive" as const
  },
  auditFrequency: {
    name: "Frequência de Auditorias",
    currentValue: 90,
    simulatedValue: 90,
    min: 30,
    max: 180,
    unit: "dias",
    impact: "positive" as const
  },
  staffing: {
    name: "Nível de Equipe",
    currentValue: 100,
    simulatedValue: 100,
    min: 80,
    max: 150,
    unit: "%",
    impact: "positive" as const
  },
  technologyInvestment: {
    name: "Investimento em Tecnologia",
    currentValue: 200000,
    simulatedValue: 200000,
    min: 50000,
    max: 1000000,
    unit: "R$",
    impact: "positive" as const
  }
};

export const PeotramSimulationTool: React.FC = () => {
  const [parameters, setParameters] = useState(SIMULATION_PARAMETERS);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SimulationScenario[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<string[]>([]);

  useEffect(() => {
    // Simular carregamento de cenários salvos
    loadSavedScenarios();
  }, []);

  const loadSavedScenarios = () => {
    // Mock de cenários salvos
    const mockScenarios: SimulationScenario[] = [
      {
        id: "scenario_1",
        name: "Investimento em Treinamento Avançado",
        description: "Aumento de 50% no investimento em treinamento",
        parameters: { ...SIMULATION_PARAMETERS },
        results: {
          overallScore: 92.3,
          complianceRate: 87.5,
          riskLevel: "low",
          estimatedCost: 150000,
          implementationTime: 60,
          recommendations: [
            "Implementar programa de treinamento contínuo",
            "Criar certificações internas",
            "Estabelecer mentoria técnica"
          ],
          impacts: [
            { category: "Segurança", current: 85, projected: 92, improvement: 8.2 },
            { category: "Conformidade", current: 78, projected: 88, improvement: 12.8 },
            { category: "Eficiência", current: 82, projected: 87, improvement: 6.1 }
          ]
        }
      }
    ];
    setSavedScenarios(mockScenarios);
  };

  const runSimulation = async () => {
    setIsRunning(true);
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calcular resultados baseado nos parâmetros
      const results = calculateSimulationResults();
      
      const scenario: SimulationScenario = {
        id: `scenario_${Date.now()}`,
        name: `Simulação ${new Date().toLocaleString("pt-BR")}`,
        description: "Simulação customizada dos parâmetros PEOTRAM",
        parameters: { ...parameters },
        results
      };
      
      setCurrentScenario(scenario);
    } catch (error) {
      console.error("Error in peotram-simulation-tool.tsx:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const calculateSimulationResults = () => {
    // Algoritmo simplificado de cálculo de impacto
    let baseScore = 75;
    let complianceBase = 70;
    let costBase = 0;
    
    // Calcular impacto do treinamento
    const trainingImpact = (parameters.trainingInvestment.simulatedValue - parameters.trainingInvestment.currentValue) / 10000;
    baseScore += trainingImpact * 0.3;
    complianceBase += trainingImpact * 0.2;
    costBase += parameters.trainingInvestment.simulatedValue - parameters.trainingInvestment.currentValue;
    
    // Calcular impacto da manutenção
    const maintenanceImpact = (parameters.maintenanceFrequency.currentValue - parameters.maintenanceFrequency.simulatedValue) / 5;
    baseScore += maintenanceImpact * 0.4;
    complianceBase += maintenanceImpact * 0.3;
    
    // Calcular impacto das auditorias
    const auditImpact = (parameters.auditFrequency.currentValue - parameters.auditFrequency.simulatedValue) / 10;
    baseScore += auditImpact * 0.2;
    complianceBase += auditImpact * 0.4;
    
    // Calcular impacto da equipe
    const staffingImpact = (parameters.staffing.simulatedValue - parameters.staffing.currentValue) / 10;
    baseScore += staffingImpact * 0.3;
    complianceBase += staffingImpact * 0.2;
    
    // Calcular impacto da tecnologia
    const technologyImpact = (parameters.technologyInvestment.simulatedValue - parameters.technologyInvestment.currentValue) / 50000;
    baseScore += technologyImpact * 0.5;
    complianceBase += technologyImpact * 0.3;
    costBase += parameters.technologyInvestment.simulatedValue - parameters.technologyInvestment.currentValue;
    
    // Normalizar scores
    const overallScore = Math.min(Math.max(baseScore, 0), 100);
    const complianceRate = Math.min(Math.max(complianceBase, 0), 100);
    
    // Determinar nível de risco
    let riskLevel: "low" | "medium" | "high" | "critical" = "medium";
    if (overallScore >= 90) riskLevel = "low";
    else if (overallScore >= 75) riskLevel = "medium";
    else if (overallScore >= 60) riskLevel = "high";
    else riskLevel = "critical";
    
    return {
      overallScore: Math.round(overallScore * 10) / 10,
      complianceRate: Math.round(complianceRate * 10) / 10,
      riskLevel,
      estimatedCost: Math.abs(costBase),
      implementationTime: Math.ceil((Math.abs(costBase) / 10000) + 30),
      recommendations: generateRecommendations(),
      impacts: [
        { category: "Segurança", current: 85, projected: Math.min(85 + (overallScore - 75) * 0.4, 100), improvement: (overallScore - 75) * 0.4 },
        { category: "Conformidade", current: 78, projected: Math.min(78 + (complianceRate - 70) * 0.5, 100), improvement: (complianceRate - 70) * 0.5 },
        { category: "Eficiência", current: 82, projected: Math.min(82 + (overallScore - 75) * 0.3, 100), improvement: (overallScore - 75) * 0.3 }
      ]
    };
  };

  const generateRecommendations = (): string[] => {
    const recommendations = [];
    
    if (parameters.trainingInvestment.simulatedValue > parameters.trainingInvestment.currentValue) {
      recommendations.push("Implementar programa de capacitação técnica avançada");
    }
    
    if (parameters.maintenanceFrequency.simulatedValue < parameters.maintenanceFrequency.currentValue) {
      recommendations.push("Estabelecer cronograma de manutenção preventiva mais rigoroso");
    }
    
    if (parameters.auditFrequency.simulatedValue < parameters.auditFrequency.currentValue) {
      recommendations.push("Aumentar frequência de auditorias internas");
    }
    
    if (parameters.technologyInvestment.simulatedValue > parameters.technologyInvestment.currentValue) {
      recommendations.push("Investir em sistemas de monitoramento digital");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Manter estratégia atual com monitoramento contínuo");
    }
    
    return recommendations;
  };

  const updateParameter = (key: string, value: number) => {
    setParameters(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        simulatedValue: value
      }
    }));
  };

  const resetToDefaults = () => {
    setParameters(SIMULATION_PARAMETERS);
    setCurrentScenario(null);
  };

  const saveScenario = () => {
    if (currentScenario) {
      setSavedScenarios(prev => [...prev, currentScenario]);
    }
  };

  const getImpactColor = (improvement: number) => {
    if (improvement > 5) return "text-success";
    if (improvement > 0) return "text-info";
    if (improvement > -5) return "text-warning";
    return "text-destructive";
  };

  const getRiskColor = (level: string) => {
    switch (level) {
    case "low": return "bg-success/20 text-success border-success/30";
    case "medium": return "bg-warning/20 text-warning border-warning/30";
    case "high": return "bg-destructive/20 text-destructive border-destructive/30";
    case "critical": return "bg-destructive/30 text-destructive border-destructive/40";
    default: return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-7 h-7" />
            Simulador PEOTRAM "E Se"
          </h2>
          <p className="text-muted-foreground">
            Analise cenários hipotéticos e otimize estratégias de conformidade
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          {currentScenario && (
            <Button variant="outline" onClick={saveScenario}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Cenário
            </Button>
          )}
          <Button onClick={runSimulation} disabled={isRunning}>
            {isRunning ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isRunning ? "Simulando..." : "Executar Simulação"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Parâmetros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Parâmetros de Entrada
            </CardTitle>
            <CardDescription>
              Ajuste os parâmetros para simular diferentes cenários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(parameters).map(([key, param]) => (
              <div key={key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{param.name}</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {param.simulatedValue.toLocaleString("pt-BR")} {param.unit}
                    </span>
                    {param.simulatedValue !== param.currentValue && (
                      <Badge variant="outline" className={
                        param.simulatedValue > param.currentValue ? "text-success" : "text-destructive"
                      }>
                        {param.simulatedValue > param.currentValue ? "+" : ""}
                        {((param.simulatedValue - param.currentValue) / param.currentValue * 100).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="px-3">
                  <Slider
                    value={[param.simulatedValue]}
                    onValueChange={(value) => updateParameter(key, value[0])}
                    max={param.max}
                    min={param.min}
                    step={(param.max - param.min) / 100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{param.min.toLocaleString("pt-BR")} {param.unit}</span>
                    <span className="font-medium">
                      Atual: {param.currentValue.toLocaleString("pt-BR")} {param.unit}
                    </span>
                    <span>{param.max.toLocaleString("pt-BR")} {param.unit}</span>
                  </div>
                </div>
              </div>
            ))}

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Dica:</strong> Experimente aumentar o investimento em treinamento e reduzir 
                os intervalos de manutenção para ver o impacto na conformidade geral.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Resultados da Simulação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Resultados da Simulação
            </CardTitle>
            <CardDescription>
              Impactos projetados das alterações propostas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentScenario ? (
              <div className="space-y-6">
                {/* KPIs principais */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                    <div className="text-2xl font-bold text-primary">
                      {currentScenario.results.overallScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Score Geral</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-success" />
                      <span className="text-xs text-success">+3.2%</span>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-success/5 to-success/10 rounded-lg border border-success/20">
                    <div className="text-2xl font-bold text-success">
                      {currentScenario.results.complianceRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Conformidade</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-success" />
                      <span className="text-xs text-success">+5.1%</span>
                    </div>
                  </div>
                </div>

                {/* Nível de Risco */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">Nível de Risco Projetado:</span>
                  <Badge variant="outline" className={getRiskColor(currentScenario.results.riskLevel)}>
                    {currentScenario.results.riskLevel === "low" ? "Baixo" :
                      currentScenario.results.riskLevel === "medium" ? "Médio" :
                        currentScenario.results.riskLevel === "high" ? "Alto" : "Crítico"}
                  </Badge>
                </div>

                {/* Impactos por Categoria */}
                <div className="space-y-3">
                  <h4 className="font-medium">Impactos por Categoria</h4>
                  {currentScenario.results.impacts.map((impact) => (
                    <div key={impact.category} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{impact.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {impact.current}% → {Math.round(impact.projected)}%
                        </span>
                        <span className={`text-sm font-medium ${getImpactColor(impact.improvement)}`}>
                          {impact.improvement > 0 ? "+" : ""}{impact.improvement.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custos e Cronograma */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Investimento Estimado:</span>
                    <div className="font-bold">R$ {currentScenario.results.estimatedCost.toLocaleString("pt-BR")}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prazo de Implementação:</span>
                    <div className="font-bold">{currentScenario.results.implementationTime} dias</div>
                  </div>
                </div>

                {/* Recomendações */}
                <div className="space-y-2">
                  <h4 className="font-medium">Recomendações Principais</h4>
                  <ul className="space-y-1">
                    {currentScenario.results.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Pronto para Simular</h3>
                <p className="text-muted-foreground mb-4">
                  Ajuste os parâmetros e execute a simulação para ver os resultados projetados
                </p>
                <Button onClick={runSimulation} disabled={isRunning}>
                  <Play className="w-4 h-4 mr-2" />
                  Executar Primeira Simulação
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cenários Salvos */}
      {savedScenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Cenários Salvos
            </CardTitle>
            <CardDescription>
              Compare diferentes estratégias e suas projeções
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedScenarios.map((scenario) => (
                <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium truncate">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {scenario.description}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Score:</span>
                          <div className="font-bold">{scenario.results.overallScore}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risco:</span>
                          <Badge variant="outline" className={getRiskColor(scenario.results.riskLevel)}>
                            {scenario.results.riskLevel === "low" ? "Baixo" :
                              scenario.results.riskLevel === "medium" ? "Médio" : "Alto"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};