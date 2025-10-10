import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Activity,
  Zap,
  Shield,
  Anchor,
} from "lucide-react";

interface PredictiveInsight {
  id: string;
  category: "maintenance" | "performance" | "compliance" | "safety" | "efficiency";
  title: string;
  description: string;
  confidence: number;
  impact: "low" | "medium" | "high" | "critical";
  timeframe: string;
  recommendation: string;
  affectedVessels?: string[];
  estimatedSavings?: number;
}

export const InsightEngine: React.FC = () => {
  const [insights, setInsights] = useState<PredictiveInsight[]>([
    {
      id: "1",
      category: "maintenance",
      title: "Manutenção Preditiva - Motor Principal",
      description:
        "Análise de vibração detectou anomalia no motor principal da embarcação MV-Atlas",
      confidence: 94,
      impact: "high",
      timeframe: "5-7 dias",
      recommendation: "Agendar inspeção técnica e substituição preventiva de rolamentos",
      affectedVessels: ["MV-Atlas"],
      estimatedSavings: 45000,
    },
    {
      id: "2",
      category: "efficiency",
      title: "Otimização de Consumo de Combustível",
      description:
        "Padrão de navegação indica potencial de economia através de ajuste de velocidade",
      confidence: 87,
      impact: "medium",
      timeframe: "Imediato",
      recommendation: "Reduzir velocidade média em 1.5 nós nas rotas Santos-Rio",
      affectedVessels: ["MV-Atlas", "MV-Neptune"],
      estimatedSavings: 12500,
    },
    {
      id: "3",
      category: "compliance",
      title: "Vencimento de Certificações STCW",
      description: "Sistema detectou 8 certificados com vencimento em menos de 60 dias",
      confidence: 100,
      impact: "critical",
      timeframe: "30-60 dias",
      recommendation: "Iniciar processo de renovação imediatamente para evitar não-conformidade",
      affectedVessels: ["MV-Atlas", "MV-Neptune", "MV-Poseidon"],
    },
    {
      id: "4",
      category: "safety",
      title: "Análise de Fadiga da Tripulação",
      description: "Padrões de trabalho indicam risco de fadiga em 3 tripulantes",
      confidence: 78,
      impact: "high",
      timeframe: "7-14 dias",
      recommendation: "Ajustar escalas de trabalho e considerar rodízio de funções",
      affectedVessels: ["MV-Neptune"],
    },
    {
      id: "5",
      category: "performance",
      title: "Desvio de Performance Operacional",
      description: "Embarcação MV-Poseidon apresenta redução de 8% na eficiência operacional",
      confidence: 91,
      impact: "medium",
      timeframe: "Contínuo",
      recommendation: "Verificar limpeza do casco e sistema de propulsão",
      affectedVessels: ["MV-Poseidon"],
      estimatedSavings: 8200,
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>("all");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "maintenance":
        return <Zap className="h-4 w-4" />;
      case "performance":
        return <Activity className="h-4 w-4" />;
      case "compliance":
        return <Shield className="h-4 w-4" />;
      case "safety":
        return <AlertTriangle className="h-4 w-4" />;
      case "efficiency":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const filteredInsights =
    activeCategory === "all" ? insights : insights.filter(i => i.category === activeCategory);

  const totalSavings = insights
    .filter(i => i.estimatedSavings)
    .reduce((sum, i) => sum + (i.estimatedSavings || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">Ativos no momento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Economia Potencial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(totalSavings / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Precisão do modelo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {insights.filter(i => i.impact === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">Ação imediata</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Motor de Insights Preditivos
              </CardTitle>
              <CardDescription>
                Análise inteligente com IA para otimização operacional marítima
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Activity className="h-3 w-3" />
              Tempo Real
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveCategory}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
              <TabsTrigger value="efficiency">Eficiência</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="safety">Segurança</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="space-y-4 mt-4">
              {filteredInsights.map(insight => (
                <Card key={insight.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getCategoryIcon(insight.category)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{insight.title}</CardTitle>
                          <CardDescription className="mt-1">{insight.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={getImpactColor(insight.impact) as any}>
                        {insight.impact.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confiança:</span>
                      <Progress value={insight.confidence} className="flex-1" />
                      <span className="text-sm font-medium">{insight.confidence}%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Prazo:</span>
                        <span className="ml-2 font-medium">{insight.timeframe}</span>
                      </div>
                      {insight.estimatedSavings && (
                        <div>
                          <span className="text-muted-foreground">Economia:</span>
                          <span className="ml-2 font-medium text-green-600">
                            R$ {insight.estimatedSavings.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {insight.affectedVessels && (
                      <div>
                        <span className="text-sm text-muted-foreground">Embarcações:</span>
                        <div className="flex gap-2 mt-1">
                          {insight.affectedVessels.map(vessel => (
                            <Badge key={vessel} variant="outline" className="gap-1">
                              <Anchor className="h-3 w-3" />
                              {vessel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 mt-0.5 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Recomendação
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            {insight.recommendation}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Target className="h-4 w-4 mr-2" />
                        Aplicar Recomendação
                      </Button>
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightEngine;
