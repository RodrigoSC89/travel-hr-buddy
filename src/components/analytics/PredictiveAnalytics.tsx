import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  BarChart3,
  Brain,
  Calendar,
  RefreshCw,
  Zap
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PredictionData {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  trend: "up" | "down" | "stable";
  timeframe: string;
  factors: string[];
}

const PredictiveAnalytics: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30_days");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const timeframes = [
    { value: "7_days", label: "7 Dias" },
    { value: "30_days", label: "30 Dias" },
    { value: "90_days", label: "90 Dias" },
    { value: "6_months", label: "6 Meses" },
    { value: "1_year", label: "1 Ano" }
  ];

  const generatePredictions = useCallback(async () => {
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-predictions", {
        body: {
          timeframe: selectedTimeframe,
          includeFactors: true
        }
      });

      if (error) throw error;

      if (data.success) {
        setPredictions(data.predictions);
        setLastUpdated(new Date());
        
        toast({
          title: "Análises Atualizadas",
          description: "Previsões geradas com sucesso",
        });
      } else {
        throw new Error(data.error || "Erro ao gerar previsões");
      }
    } catch (error) {
      
      // Mock data for demonstration
      const mockPredictions: PredictionData[] = [
        {
          metric: "Receita Mensal",
          current: 125432,
          predicted: 142850,
          confidence: 87,
          trend: "up",
          timeframe: selectedTimeframe,
          factors: ["Sazonalidade", "Novos clientes", "Expansão de mercado"]
        },
        {
          metric: "Satisfação do Cliente",
          current: 94,
          predicted: 96.5,
          confidence: 92,
          trend: "up",
          timeframe: selectedTimeframe,
          factors: ["Melhoria no atendimento", "Novos treinamentos", "Feedback proativo"]
        },
        {
          metric: "Rotatividade de Funcionários",
          current: 8.5,
          predicted: 6.2,
          confidence: 78,
          trend: "down",
          timeframe: selectedTimeframe,
          factors: ["Programa de retenção", "Melhores benefícios", "Cultura organizacional"]
        },
        {
          metric: "Produtividade da Equipe",
          current: 89,
          predicted: 93.8,
          confidence: 85,
          trend: "up",
          timeframe: selectedTimeframe,
          factors: ["Automatização", "Novos processos", "Capacitação técnica"]
        },
        {
          metric: "Custos Operacionais",
          current: 89500,
          predicted: 92300,
          confidence: 81,
          trend: "up",
          timeframe: selectedTimeframe,
          factors: ["Inflação", "Expansão da equipe", "Investimentos em tecnologia"]
        }
      ];

      setPredictions(mockPredictions);
      setLastUpdated(new Date());
      
      toast({
        title: "Usando dados simulados",
        description: "Conecte-se à API para obter previsões reais",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedTimeframe, toast]);

  useEffect(() => {
    generatePredictions();
  }, [generatePredictions]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up": return <TrendingUp className="w-4 h-4 text-green-600" />;
    case "down": return <TrendingDown className="w-4 h-4 text-red-600" />;
    default: return <Target className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
    case "up": return "text-green-600";
    case "down": return "text-red-600";
    default: return "text-yellow-600";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const formatValue = (value: number, metric: string) => {
    if (metric.includes("Receita") || metric.includes("Custos")) {
      return `R$ ${value.toLocaleString()}`;
    }
    if (metric.includes("Satisfação") || metric.includes("Produtividade") || metric.includes("Rotatividade")) {
      return `${value}%`;
    }
    return value.toString();
  };

  const calculateChange = (current: number, predicted: number) => {
    const change = ((predicted - current) / current) * 100;
    return change;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Análise Preditiva
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={generatePredictions}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Última atualização: {lastUpdated.toLocaleString("pt-BR")}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Zap className="w-8 h-8 animate-pulse text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Gerando previsões com IA...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {predictions.map((prediction, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{prediction.metric}</CardTitle>
                      {getTrendIcon(prediction.trend)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Atual</p>
                        <p className="text-lg font-semibold">
                          {formatValue(prediction.current, prediction.metric)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Previsão</p>
                        <p className={`text-lg font-semibold ${getTrendColor(prediction.trend)}`}>
                          {formatValue(prediction.predicted, prediction.metric)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Variação</span>
                        <span className={getTrendColor(prediction.trend)}>
                          {calculateChange(prediction.current, prediction.predicted) > 0 ? "+" : ""}
                          {calculateChange(prediction.current, prediction.predicted).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span>Confiança</span>
                        <span className={getConfidenceColor(prediction.confidence)}>
                          {prediction.confidence}%
                        </span>
                      </div>
                      <Progress 
                        value={prediction.confidence} 
                        className="h-2"
                      />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Fatores Influentes:</p>
                      <div className="space-y-1">
                        {prediction.factors.slice(0, 3).map((factor, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            <span className="text-xs">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Insights */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Insights Principais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">Oportunidades</h4>
                {predictions
                  .filter(p => p.trend === "up" && p.confidence > 80)
                  .slice(0, 3)
                  .map((p, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                      <p className="text-sm">
                        {p.metric} deve aumentar {Math.abs(calculateChange(p.current, p.predicted)).toFixed(1)}%
                      </p>
                    </div>
                  ))}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-red-600">Pontos de Atenção</h4>
                {predictions
                  .filter(p => (p.trend === "up" && p.metric.includes("Custos")) || (p.trend === "down" && !p.metric.includes("Rotatividade")))
                  .slice(0, 3)
                  .map((p, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <p className="text-sm">
                        {p.metric}: monitorar tendência de 
                        {p.trend === "up" ? " aumento" : " redução"}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictiveAnalytics;