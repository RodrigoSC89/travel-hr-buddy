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
      
      // Estado vazio quando API falha - sem mock data
      setPredictions([]);
      setLastUpdated(new Date());
      
      toast({
        title: "Análise preditiva indisponível",
        description: "Configure a integração de IA para obter previsões reais",
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
    case "up": return <TrendingUp className="w-4 h-4 text-success" />;
    case "down": return <TrendingDown className="w-4 h-4 text-destructive" />;
    default: return <Target className="w-4 h-4 text-warning" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
    case "up": return "text-success";
    case "down": return "text-destructive";
    default: return "text-warning";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-success";
    if (confidence >= 70) return "text-warning";
    return "text-destructive";
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
              {predictions.map((prediction) => (
                <Card key={prediction.metric} className="border-l-4 border-l-primary">
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
                        {prediction.factors.slice(0, 3).map((factor) => (
                          <div key={factor} className="flex items-center gap-2">
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
                <h4 className="font-medium text-success">Oportunidades</h4>
                {predictions
                  .filter(p => p.trend === "up" && p.confidence > 80)
                  .slice(0, 3)
                  .map((p) => (
                    <div key={p.metric} className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-success mt-0.5" />
                      <p className="text-sm">
                        {p.metric} deve aumentar {Math.abs(calculateChange(p.current, p.predicted)).toFixed(1)}%
                      </p>
                    </div>
                  ))}
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-destructive">Pontos de Atenção</h4>
                {predictions
                  .filter(p => (p.trend === "up" && p.metric.includes("Custos")) || (p.trend === "down" && !p.metric.includes("Rotatividade")))
                  .slice(0, 3)
                  .map((p) => (
                    <div key={p.metric} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
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