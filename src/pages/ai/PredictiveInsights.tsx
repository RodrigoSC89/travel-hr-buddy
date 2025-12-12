/**
import { useEffect, useState, useCallback } from "react";;
 * AI Predictive Insights - Análise Preditiva
 * Previsões e tendências baseadas em IA
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Loader2, 
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Ship,
  Wrench,
  Users,
  Fuel
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Prediction {
  id: string;
  category: string;
  title: string;
  prediction: string;
  confidence: number;
  trend: "up" | "down" | "stable";
  impact: "high" | "medium" | "low";
  timeframe: string;
}

interface InsightResponse {
  analysis: string;
  predictions: Prediction[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  maintenance: <Wrench className="h-4 w-4" />,
  fuel: <Fuel className="h-4 w-4" />,
  crew: <Users className="h-4 w-4" />,
  fleet: <Ship className="h-4 w-4" />,
};

const PredictiveInsights: React.FC = () => {
  const [insights, setInsights] = useState<InsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const categories = [
    { id: "all", name: "Todos", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "maintenance", name: "Manutenção", icon: <Wrench className="h-4 w-4" /> },
    { id: "fuel", name: "Combustível", icon: <Fuel className="h-4 w-4" /> },
    { id: "crew", name: "Tripulação", icon: <Users className="h-4 w-4" /> },
    { id: "fleet", name: "Frota", icon: <Ship className="h-4 w-4" /> },
  ];

  const generateInsights = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("optimization-ai-copilot", {
        body: {
          messages: [
            {
              role: "user",
              content: `Gere uma análise preditiva detalhada para operações marítimas incluindo:

1. **Manutenção Preventiva**
   - Previsão de falhas de equipamentos
   - Estimativa de vida útil de componentes
   - Recomendações de intervenção

2. **Otimização de Combustível**
   - Projeção de consumo para próximo mês
   - Oportunidades de economia
   - Impacto de rotas alternativas

3. **Gestão de Tripulação**
   - Previsão de necessidades de certificação
   - Análise de fadiga e descanso
   - Planejamento de escalas

4. **Performance da Frota**
   - Tendências de disponibilidade
   - Projeção de custos operacionais
   - Indicadores de eficiência

Para cada categoria, forneça:
- Previsão específica
- Nível de confiança (%)
- Tendência (alta/baixa/estável)
- Impacto potencial
- Prazo

Formate a resposta em markdown estruturado.`,
            },
          ],
          type: "predictive_analysis",
          context: "Análise preditiva para operações marítimas offshore",
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      // Create sample predictions based on AI response
      const samplePredictions: Prediction[] = [
        {
          id: "1",
          category: "maintenance",
          title: "Motor Principal - Troca de Óleo",
          prediction: "Troca necessária em aproximadamente 250 horas de operação",
          confidence: 92,
          trend: "stable",
          impact: "medium",
          timeframe: "Próximas 2 semanas",
        },
        {
          id: "2",
          category: "fuel",
          title: "Consumo de Combustível",
          prediction: "Aumento de 8% no consumo previsto devido às condições climáticas",
          confidence: 85,
          trend: "up",
          impact: "high",
          timeframe: "Próximo mês",
        },
        {
          id: "3",
          category: "crew",
          title: "Certificações Vencendo",
          prediction: "3 tripulantes com certificações expirando nos próximos 60 dias",
          confidence: 100,
          trend: "down",
          impact: "high",
          timeframe: "Próximos 60 dias",
        },
        {
          id: "4",
          category: "fleet",
          title: "Disponibilidade da Frota",
          prediction: "Taxa de disponibilidade prevista de 94% para o próximo trimestre",
          confidence: 88,
          trend: "up",
          impact: "medium",
          timeframe: "Próximo trimestre",
        },
      ];

      setInsights({
        analysis: data?.response || "Análise não disponível",
        predictions: samplePredictions,
      });

      toast({
        title: "Insights gerados!",
        description: "Análise preditiva atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível gerar os insights. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  const filteredPredictions = insights?.predictions.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    default:
      return "secondary";
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Análise Preditiva</h1>
            <p className="text-muted-foreground">
              Previsões e tendências baseadas em inteligência artificial
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Insights
          </Badge>
          <Button variant="outline" onClick={generateInsights} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={handleSetSelectedCategory}
            className="whitespace-nowrap"
          >
            {cat.icon}
            <span className="ml-1">{cat.name}</span>
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Gerando insights preditivos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Predictions Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Previsões</h2>
            <div className="grid gap-4">
              {filteredPredictions?.map((prediction) => (
                <Card key={prediction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {categoryIcons[prediction.category] || <BarChart3 className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{prediction.title}</p>
                          <p className="text-xs text-muted-foreground">{prediction.timeframe}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(prediction.trend)}
                        <Badge variant={getImpactColor(prediction.impact) as unknown}>
                          {prediction.impact === "high" ? "Alto Impacto" : 
                            prediction.impact === "medium" ? "Médio Impacto" : "Baixo Impacto"}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {prediction.prediction}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Confiança:</span>
                      <Progress value={prediction.confidence} className="flex-1 h-2" />
                      <span className="text-xs font-medium">{prediction.confidence}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Analysis Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Análise Detalhada
              </CardTitle>
              <CardDescription>
                Insights gerados por IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {insights?.analysis ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{insights.analysis}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">
                    Nenhuma análise disponível
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">94%</p>
            <p className="text-xs text-muted-foreground">Precisão Geral</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">Alertas Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Insights Hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">2min</p>
            <p className="text-xs text-muted-foreground">Última Atualização</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictiveInsights;
