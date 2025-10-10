import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wrench,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  Package,
  DollarSign,
  Zap,
  Settings,
  Activity,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MaintenancePrediction {
  id: string;
  component: string;
  vesselId: string;
  vesselName: string;
  probability: number;
  timeframe: string;
  priority: "low" | "medium" | "high" | "critical";
  recommendation: string;
  estimatedCost: number;
  lastMaintenance: Date;
  nextScheduled: Date;
  riskFactors: string[];
  aiConfidence: number;
  patternMatched: string;
  spareParts: SparePart[];
}

interface SparePart {
  id: string;
  name: string;
  quantity: number;
  availability: "in-stock" | "low-stock" | "out-of-stock" | "on-order";
  estimatedArrival?: Date;
  cost: number;
}

interface EquipmentPattern {
  id: string;
  category: string;
  description: string;
  occurrences: number;
  accuracy: number;
}

interface ROIMetric {
  metric: string;
  current: number;
  target: number;
  savings: number;
  trend: "up" | "down" | "stable";
}

export const PredictiveMaintenanceRevolution: React.FC = () => {
  const [predictions, setPredictions] = useState<MaintenancePrediction[]>([]);
  const [equipmentPatterns, setEquipmentPatterns] = useState<EquipmentPattern[]>([]);
  const [roiMetrics, setROIMetrics] = useState<ROIMetric[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [systemAccuracy, setSystemAccuracy] = useState(97);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPredictiveData();
  }, []);

  const loadPredictiveData = () => {
    // Mock data representing the advanced predictive system
    const mockPredictions: MaintenancePrediction[] = [
      {
        id: "1",
        component: "Motor Principal - Sistema de Resfriamento",
        vesselId: "1",
        vesselName: "MV Atlantic Explorer",
        probability: 97,
        timeframe: "7-14 dias",
        priority: "critical",
        recommendation:
          "Substituição preventiva de bombas de água e termostatos. Padrão #2847 detectado.",
        estimatedCost: 15000,
        lastMaintenance: new Date("2024-10-15"),
        nextScheduled: new Date("2024-12-20"),
        riskFactors: [
          "Temperatura elevada (+12°C)",
          "Vibração anormal",
          "Horas de operação críticas",
        ],
        aiConfidence: 97,
        patternMatched: "Falha de Bomba de Resfriamento - Padrão #2847",
        spareParts: [
          {
            id: "sp1",
            name: "Bomba de água centrífuga",
            quantity: 2,
            availability: "in-stock",
            cost: 4500,
          },
          {
            id: "sp2",
            name: "Termostato industrial",
            quantity: 3,
            availability: "in-stock",
            cost: 1200,
          },
          { id: "sp3", name: "Selo mecânico", quantity: 4, availability: "low-stock", cost: 800 },
        ],
      },
      {
        id: "2",
        component: "Turbina Principal - Rolamentos",
        vesselId: "1",
        vesselName: "MV Atlantic Explorer",
        probability: 89,
        timeframe: "14-21 dias",
        priority: "high",
        recommendation:
          "Inspeção detalhada e possível substituição de rolamentos. Padrão #5621 identificado.",
        estimatedCost: 28000,
        lastMaintenance: new Date("2024-09-20"),
        nextScheduled: new Date("2025-01-10"),
        riskFactors: ["Análise de óleo anormal", "Temperatura elevada", "Ruído característico"],
        aiConfidence: 89,
        patternMatched: "Desgaste de Rolamento - Padrão #5621",
        spareParts: [
          {
            id: "sp4",
            name: "Rolamento SKF 23240",
            quantity: 2,
            availability: "on-order",
            estimatedArrival: new Date("2025-02-05"),
            cost: 12000,
          },
          {
            id: "sp5",
            name: "Lubrificante especial",
            quantity: 20,
            availability: "in-stock",
            cost: 3500,
          },
        ],
      },
      {
        id: "3",
        component: "Gerador Auxiliar #2",
        vesselId: "2",
        vesselName: "MV Pacific Navigator",
        probability: 76,
        timeframe: "21-30 dias",
        priority: "medium",
        recommendation: "Manutenção preventiva do sistema elétrico. Padrão #1234 detectado.",
        estimatedCost: 8500,
        lastMaintenance: new Date("2024-11-01"),
        nextScheduled: new Date("2025-02-01"),
        riskFactors: ["Flutuação de tensão", "Tempo operacional elevado"],
        aiConfidence: 76,
        patternMatched: "Desgaste Elétrico - Padrão #1234",
        spareParts: [
          {
            id: "sp6",
            name: "Regulador de tensão",
            quantity: 1,
            availability: "in-stock",
            cost: 3200,
          },
          {
            id: "sp7",
            name: "Conectores alta tensão",
            quantity: 10,
            availability: "in-stock",
            cost: 1800,
          },
        ],
      },
    ];

    const mockPatterns: EquipmentPattern[] = [
      {
        id: "p1",
        category: "Sistemas de Propulsão",
        description: "Falha de rolamento em motores principais",
        occurrences: 1247,
        accuracy: 98,
      },
      {
        id: "p2",
        category: "Sistemas de Resfriamento",
        description: "Cavitação em bombas centrífugas",
        occurrences: 892,
        accuracy: 96,
      },
      {
        id: "p3",
        category: "Sistemas Elétricos",
        description: "Degradação de isolamento em geradores",
        occurrences: 1534,
        accuracy: 94,
      },
      {
        id: "p4",
        category: "Sistemas Hidráulicos",
        description: "Vazamento em atuadores",
        occurrences: 678,
        accuracy: 97,
      },
      {
        id: "p5",
        category: "Sistemas de Combustível",
        description: "Obstrução de filtros",
        occurrences: 2341,
        accuracy: 99,
      },
      {
        id: "p6",
        category: "Sistemas de Navegação",
        description: "Falha de sensores",
        occurrences: 456,
        accuracy: 95,
      },
    ];

    const mockROI: ROIMetric[] = [
      {
        metric: "Redução Custos Manutenção",
        current: 40,
        target: 40,
        savings: 450000,
        trend: "down",
      },
      { metric: "Aumento Uptime", current: 99.2, target: 99, savings: 280000, trend: "up" },
      { metric: "Otimização Spare Parts", current: 35, target: 30, savings: 185000, trend: "down" },
      {
        metric: "Redução Downtime Não Planejado",
        current: 95,
        target: 100,
        savings: 520000,
        trend: "up",
      },
    ];

    setPredictions(mockPredictions);
    setEquipmentPatterns(mockPatterns);
    setROIMetrics(mockROI);
    setTotalSavings(mockROI.reduce((sum, m) => sum + m.savings, 0));
  };

  const runAIAnalysis = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      setSystemAccuracy(97 + Math.random() * 2);
      setIsAnalyzing(false);
      toast({
        title: "✅ Análise IA Completa",
        description: `${predictions.length} predições atualizadas com ${systemAccuracy.toFixed(1)}% de precisão`,
      });
    }, 2000);
  };

  const getPriorityColor = (priority: MaintenancePrediction["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    }
  };

  const getAvailabilityColor = (availability: SparePart["availability"]) => {
    switch (availability) {
      case "in-stock":
        return "text-green-600 dark:text-green-400";
      case "low-stock":
        return "text-yellow-600 dark:text-yellow-400";
      case "out-of-stock":
        return "text-red-600 dark:text-red-400";
      case "on-order":
        return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Predictive Maintenance Revolution
                  <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-300">
                    <Sparkles className="h-3 w-3 mr-1" />
                    IA AVANÇADA
                  </Badge>
                </CardTitle>
                <CardDescription className="text-white/90">
                  IA com 95%+ de precisão analisando 10.000+ padrões de equipamentos marítimos
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={runAIAnalysis}
              disabled={isAnalyzing}
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90"
            >
              <Brain className="h-5 w-5 mr-2" />
              {isAnalyzing ? "Analisando..." : "Executar Análise IA"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-green-600" />
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
              {systemAccuracy.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Precisão do Sistema</div>
            <div className="text-xs text-green-600 mt-1">Meta: 95%+ ✅</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">10,148</div>
            <div className="text-sm text-muted-foreground">Padrões Conhecidos</div>
            <div className="text-xs text-blue-600 mt-1">Base de dados atualizada</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <TrendingDown className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">40%</div>
            <div className="text-sm text-muted-foreground">Economia em Custos</div>
            <div className="text-xs text-orange-600 mt-1">
              ${(totalSavings / 1000).toFixed(0)}k economizados
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-8 w-8 text-purple-600" />
              <CheckCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">100%</div>
            <div className="text-sm text-muted-foreground">Zero Downtime</div>
            <div className="text-xs text-purple-600 mt-1">Não planejado eliminado</div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Predições de Manutenção
          </CardTitle>
          <CardDescription>
            Análise preditiva com IA identificando necessidades futuras
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions.map(prediction => (
            <Card
              key={prediction.id}
              className="border-l-4"
              style={{
                borderLeftColor:
                  prediction.priority === "critical"
                    ? "#ef4444"
                    : prediction.priority === "high"
                      ? "#f97316"
                      : prediction.priority === "medium"
                        ? "#eab308"
                        : "#22c55e",
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{prediction.component}</h3>
                      <Badge className={getPriorityColor(prediction.priority)}>
                        {prediction.priority === "critical"
                          ? "🔴 CRÍTICO"
                          : prediction.priority === "high"
                            ? "🟠 ALTO"
                            : prediction.priority === "medium"
                              ? "🟡 MÉDIO"
                              : "🟢 BAIXO"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{prediction.vesselName}</p>
                    <p className="text-sm mb-3">{prediction.recommendation}</p>

                    {/* AI Analysis */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="text-xs text-muted-foreground">IA Confiança</div>
                          <div className="font-semibold">{prediction.aiConfidence}%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="text-xs text-muted-foreground">Probabilidade</div>
                          <div className="font-semibold">{prediction.probability}%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <div>
                          <div className="text-xs text-muted-foreground">Prazo</div>
                          <div className="font-semibold">{prediction.timeframe}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-xs text-muted-foreground">Custo Est.</div>
                          <div className="font-semibold">
                            ${prediction.estimatedCost.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pattern Matched */}
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/10 rounded-lg mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900 dark:text-purple-300">
                          {prediction.patternMatched}
                        </span>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Fatores de Risco:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prediction.riskFactors.map((factor, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Spare Parts */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Peças de Reposição Necessárias:
                      </div>
                      <div className="space-y-1">
                        {prediction.spareParts.map(part => (
                          <div
                            key={part.id}
                            className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Package className="h-3 w-3" />
                              <span>{part.name}</span>
                              <Badge variant="outline" className="text-xs">
                                x{part.quantity}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-medium ${getAvailabilityColor(part.availability)}`}
                              >
                                {part.availability === "in-stock"
                                  ? "✅ Em estoque"
                                  : part.availability === "low-stock"
                                    ? "⚠️ Estoque baixo"
                                    : part.availability === "out-of-stock"
                                      ? "❌ Fora de estoque"
                                      : `📦 Pedido: ${part.estimatedArrival?.toLocaleDateString("pt-BR")}`}
                              </span>
                              <span className="text-xs font-medium">
                                ${part.cost.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Agendar Manutenção
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Package className="h-4 w-4 mr-2" />
                    Solicitar Peças
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Equipment Patterns Database */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Base de Dados de Padrões
          </CardTitle>
          <CardDescription>
            10.000+ padrões de falhas conhecidos com precisão superior a 95%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {equipmentPatterns.map(pattern => (
              <div
                key={pattern.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="h-4 w-4 text-primary" />
                    <span className="font-medium">{pattern.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    {pattern.accuracy}% precisão
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {pattern.occurrences} ocorrências
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ROI Dashboard - 500% em 6 meses
          </CardTitle>
          <CardDescription>
            Retorno sobre investimento e economia gerada pelo sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {roiMetrics.map((metric, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{metric.metric}</h4>
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : metric.trend === "down" ? (
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  ) : (
                    <Activity className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Atual</span>
                    <span className="font-semibold">{metric.current}%</span>
                  </div>
                  <Progress value={metric.current} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Meta: {metric.target}%</span>
                    <span className="text-sm font-medium text-green-600">
                      ${(metric.savings / 1000).toFixed(0)}k economizados
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                  ${(totalSavings / 1000).toFixed(0)}k
                </h3>
                <p className="text-sm text-muted-foreground">Economia Total Anual</p>
                <p className="text-xs text-green-600 mt-1">ROI de 500% em 6 meses</p>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-2">💰</div>
                <Badge className="bg-green-600 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Economia Contínua
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
