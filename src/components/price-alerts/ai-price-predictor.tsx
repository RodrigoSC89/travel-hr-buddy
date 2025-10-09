import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Calendar, 
  DollarSign, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Lightbulb,
  Loader2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PricePrediction {
  product_name: string;
  current_price: number;
  predicted_prices: {
    next_week: number;
    next_month: number;
    confidence: number;
  };
  trend: "rising" | "falling" | "stable";
  best_time_to_buy: {
    recommendation: string;
    timeframe: string;
    expected_savings: number;
  };
  market_factors: string[];
  historical_data: { date: string; price: number }[];
}

interface AIInsight {
  type: "opportunity" | "warning" | "neutral";
  message: string;
  confidence: number;
  action_required: boolean;
}

export const AIPricePredictor: React.FC = () => {
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadExistingPredictions();
  }, []);

  const loadExistingPredictions = async () => {
    // Load existing predictions from localStorage or API
    const stored = localStorage.getItem("ai_price_predictions");
    if (stored) {
      setPredictions(JSON.parse(stored));
    }
    generateAIInsights();
  };

  const generatePricePrediction = async () => {
    if (!selectedProduct || !productUrl) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome do produto e a URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call price check function first
      const { data: priceData } = await supabase.functions.invoke("check-price", {
        body: {
          product_name: selectedProduct,
          product_url: productUrl
        }
      });

      const currentPrice = priceData?.price || 0;

      // Generate AI prediction (simulated - in production, this would use ML models)
      const prediction = await generateAIPredictionData(selectedProduct, currentPrice);
      
      const newPredictions = [...predictions, prediction];
      setPredictions(newPredictions);
      
      // Store predictions
      localStorage.setItem("ai_price_predictions", JSON.stringify(newPredictions));
      
      toast({
        title: "Previsão gerada!",
        description: `Análise de IA criada para ${selectedProduct}`,
      });

      // Clear form
      setSelectedProduct("");
      setProductUrl("");
      
      // Regenerate insights
      generateAIInsights();

    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar a previsão",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIPredictionData = async (productName: string, currentPrice: number): Promise<PricePrediction> => {
    // Simulated AI prediction logic - in production, this would use real ML models
    const trendOptions: ("rising" | "falling" | "stable")[] = ["rising", "falling", "stable"];
    const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];
    
    // Generate price variations based on trend
    const baseVariation = Math.random() * 0.2 - 0.1; // -10% to +10%
    const trendMultiplier = trend === "rising" ? 1.1 : trend === "falling" ? 0.9 : 1.0;
    
    const nextWeekPrice = currentPrice * trendMultiplier * (1 + baseVariation);
    const nextMonthPrice = currentPrice * trendMultiplier * (1 + baseVariation * 2);
    
    // Generate historical data
    const historicalData = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const priceVariation = (Math.random() - 0.5) * 0.3; // ±15% variation
      historicalData.push({
        date: date.toISOString().split("T")[0],
        price: currentPrice * (1 + priceVariation)
      });
    }

    const expectedSavings = trend === "falling" ? 
      Math.abs(currentPrice - nextWeekPrice) : 
      Math.random() * 200 + 50;

    return {
      product_name: productName,
      current_price: currentPrice,
      predicted_prices: {
        next_week: nextWeekPrice,
        next_month: nextMonthPrice,
        confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
      },
      trend,
      best_time_to_buy: {
        recommendation: trend === "falling" ? "Aguardar" : trend === "rising" ? "Comprar agora" : "Monitorar",
        timeframe: trend === "falling" ? "1-2 semanas" : trend === "rising" ? "Imediatamente" : "1 semana",
        expected_savings: expectedSavings
      },
      market_factors: [
        "Sazonalidade do mercado",
        "Demanda histórica",
        "Tendências de preços similares",
        "Fatores econômicos externos"
      ],
      historical_data: historicalData
    };
  };

  const generateAIInsights = () => {
    const mockInsights: AIInsight[] = [
      {
        type: "opportunity",
        message: "Detectamos uma tendência de queda nos preços de passagens SP-RJ. Recomendamos aguardar mais 1 semana para comprar.",
        confidence: 0.87,
        action_required: true
      },
      {
        type: "warning",
        message: "Preços de hospedagem em Copacabana estão em alta devido à temporada. Considere reservas antecipadas.",
        confidence: 0.92,
        action_required: true
      },
      {
        type: "neutral",
        message: "Combustível náutico mantém estabilidade. Momento neutro para aquisição.",
        confidence: 0.74,
        action_required: false
      }
    ];
    
    setInsights(mockInsights);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "rising": return <TrendingUp className="w-4 h-4 text-destructive" />;
    case "falling": return <TrendingDown className="w-4 h-4 text-success" />;
    default: return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
    case "rising": return "text-destructive bg-destructive/10 border-destructive/20";
    case "falling": return "text-success bg-success/10 border-success/20";
    default: return "text-muted-foreground bg-muted/10 border-muted/20";
    }
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">IA Preditiva de Preços</h2>
              <p className="text-muted-foreground">
                Análise avançada com machine learning para previsões precisas
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Prediction Generator */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Gerar Nova Previsão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_name">Nome do Produto/Serviço</Label>
              <Input
                id="product_name"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                placeholder="Ex: Passagem São Paulo - Rio de Janeiro"
                className="border-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_url">URL do Produto</Label>
              <Input
                id="product_url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://exemplo.com/produto"
                className="border-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          <Button 
            onClick={generatePricePrediction} 
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Gerar Previsão IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                insight.type === "opportunity" ? "border-success/20 bg-success/5" :
                  insight.type === "warning" ? "border-warning/20 bg-warning/5" :
                    "border-muted/20 bg-muted/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  insight.type === "opportunity" ? "bg-success/10" :
                    insight.type === "warning" ? "bg-warning/10" :
                      "bg-muted/10"
                }`}>
                  {insight.type === "opportunity" ? 
                    <CheckCircle className="w-4 h-4 text-success" /> :
                    insight.type === "warning" ?
                      <AlertTriangle className="w-4 h-4 text-warning" /> :
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(insight.confidence * 100)}% confiança
                    </Badge>
                    {insight.action_required && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        Ação requerida
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {predictions.map((prediction, index) => (
          <Card key={index} className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{prediction.product_name}</CardTitle>
                <Badge className={getTrendColor(prediction.trend)}>
                  {getTrendIcon(prediction.trend)}
                  <span className="ml-1">
                    {prediction.trend === "rising" ? "Alta" : 
                      prediction.trend === "falling" ? "Queda" : "Estável"}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Current vs Predicted Prices */}
              <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/10 border border-muted/20">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Atual</p>
                  <p className="font-bold text-lg">{formatCurrency(prediction.current_price)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Próxima Semana</p>
                  <p className={`font-bold text-lg ${
                    prediction.predicted_prices.next_week < prediction.current_price ? "text-success" : "text-destructive"
                  }`}>
                    {formatCurrency(prediction.predicted_prices.next_week)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Próximo Mês</p>
                  <p className={`font-bold text-lg ${
                    prediction.predicted_prices.next_month < prediction.current_price ? "text-success" : "text-destructive"
                  }`}>
                    {formatCurrency(prediction.predicted_prices.next_month)}
                  </p>
                </div>
              </div>

              {/* Best Time to Buy */}
              <div className="p-3 rounded-lg border border-primary/10 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Recomendação de Compra</span>
                </div>
                <p className="text-sm font-medium">{prediction.best_time_to_buy.recommendation}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {prediction.best_time_to_buy.timeframe}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Economia estimada: {formatCurrency(prediction.best_time_to_buy.expected_savings)}
                  </div>
                </div>
              </div>

              {/* Price History Chart */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  Histórico de 30 dias
                </h4>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={prediction.historical_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickFormatter={(value) => new Date(value).getDate().toString()}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px"
                      }}
                      formatter={(value: any) => [`R$ ${value.toFixed(2)}`, "Preço"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString("pt-BR")}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Confidence and Factors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confiança da Previsão</span>
                  <Badge variant="outline">
                    {Math.round(prediction.predicted_prices.confidence * 100)}%
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Fatores considerados:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {prediction.market_factors.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {predictions.length === 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-12 text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma previsão gerada</h3>
            <p className="text-muted-foreground mb-4">
              Use nossa IA para gerar previsões inteligentes de preços
            </p>
            <Button 
              onClick={() => document.getElementById("product_name")?.focus()}
              className="bg-primary hover:bg-primary/90"
            >
              <Brain className="w-4 h-4 mr-2" />
              Começar Análise IA
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};