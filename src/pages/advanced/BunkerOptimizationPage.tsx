/**
 * Bunker Optimization AI Page
 * Previsão de consumo e otimização de combustível
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Fuel, TrendingDown, DollarSign, Ship, Brain, 
  Calculator, BarChart3, AlertTriangle, CheckCircle, Zap
} from "lucide-react";

const BunkerOptimizationPage = () => {
  const [analyzing, setAnalyzing] = useState(false);

  const currentStatus = {
    hfoLevel: 72,
    mdoLevel: 58,
    dailyConsumption: 48.5,
    autonomy: "12 dias",
    nextBunkering: "Singapore",
    estimatedCost: 245000
  };

  const optimizations = [
    {
      title: "Otimização de Velocidade",
      description: "Reduzir velocidade de 14 kn para 12.5 kn no trecho Malacca-Singapore",
      savings: "18 tons",
      savingsUSD: 12600,
      impact: "low",
      confidence: 94
    },
    {
      title: "Trim Otimizado",
      description: "Ajustar trim do navio de 0.5m para 0.8m popa",
      savings: "8 tons",
      savingsUSD: 5600,
      impact: "low",
      confidence: 89
    },
    {
      title: "Limpeza de Casco",
      description: "Casco com fouling estimado de 12%. Limpeza recomendada",
      savings: "45 tons/mês",
      savingsUSD: 31500,
      impact: "medium",
      confidence: 85
    },
    {
      title: "Rota Alternativa",
      description: "Desviar pelo Canal de Lombok reduz consumo contra corrente",
      savings: "32 tons",
      savingsUSD: 22400,
      impact: "medium",
      confidence: 78
    }
  ];

  const bunkeringOpportunities = [
    { port: "Singapore", price: 680, saving: 0, recommended: false, eta: "4 dias" },
    { port: "Fujairah", price: 645, saving: 12250, recommended: true, eta: "8 dias" },
    { port: "Rotterdam", price: 720, saving: -14000, recommended: false, eta: "14 dias" }
  ];

  const historicalData = [
    { month: "Jan", consumption: 1420, prediction: 1400 },
    { month: "Fev", consumption: 1380, prediction: 1350 },
    { month: "Mar", consumption: 1450, prediction: 1420 },
    { month: "Abr", consumption: 1520, prediction: 1480 },
    { month: "Mai", consumption: 1380, prediction: 1400 },
    { month: "Jun", consumption: 1290, prediction: 1320 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Fuel className="h-8 w-8 text-primary" />
            Bunker Optimization AI
          </h1>
          <p className="text-muted-foreground mt-1">
            Otimização inteligente de consumo de combustível
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Brain className="h-4 w-4 text-success" />
            ML Engine Ativo
          </Badge>
          <Button onClick={() => setAnalyzing(true)} disabled={analyzing}>
            <Calculator className="h-4 w-4 mr-2" />
            {analyzing ? "Analisando..." : "Nova Análise"}
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">HFO Tank</span>
                <span className="font-bold">{currentStatus.hfoLevel}%</span>
              </div>
              <Progress value={currentStatus.hfoLevel} className="h-3" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">MDO Tank</span>
                <span className="font-bold">{currentStatus.mdoLevel}%</span>
              </div>
              <Progress value={currentStatus.mdoLevel} className="h-3" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Consumo Diário</p>
                <p className="text-xl font-bold">{currentStatus.dailyConsumption} t/dia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Ship className="h-8 w-8 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Autonomia</p>
                <p className="text-xl font-bold">{currentStatus.autonomy}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="optimizations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="optimizations">Otimizações IA</TabsTrigger>
          <TabsTrigger value="bunkering">Oportunidades Bunkering</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="predictions">Predições ML</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-success" />
                Recomendações de Otimização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.map((opt) => (
                  <div 
                    key={opt.title}
                    className="p-4 border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{opt.title}</h3>
                          <Badge variant="outline" className={
                            opt.confidence >= 90 ? "border-success text-success" :
                            opt.confidence >= 80 ? "border-warning text-warning" :
                            "border-warning text-warning"
                          }>
                            {opt.confidence}% confiança
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{opt.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-success">-{opt.savings}</p>
                        <p className="text-sm text-muted-foreground">
                          ${opt.savingsUSD.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant={opt.impact === "low" ? "secondary" : "outline"}>
                        Impacto: {opt.impact === "low" ? "Baixo" : "Médio"}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aplicar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-success/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
...
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-success">103 tons</p>
                    <p className="text-lg text-success">$72,100/viagem</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bunkering">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Comparativo de Preços - Bunkering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bunkeringOpportunities.map((port) => (
                  <div 
                    key={port.port}
                    className={`p-4 rounded-lg border-2 ${
                      port.recommended 
                        ? "border-success bg-success/5" 
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold">{port.port}</h3>
                          <p className="text-sm text-muted-foreground">ETA: {port.eta}</p>
                        </div>
                        {port.recommended && (
                          <Badge className="bg-success">Recomendado IA</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${port.price}/mt</p>
                        <p className={`text-sm ${
                          port.saving > 0 ? "text-success" :
                          port.saving < 0 ? "text-destructive" : "text-muted-foreground"
                        }`}>
                          {port.saving > 0 ? `+$${port.saving.toLocaleString()} economia` :
                           port.saving < 0 ? `$${Math.abs(port.saving).toLocaleString()} a mais` :
                           "Preço base"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Histórico de Consumo vs Predição ML
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historicalData.map((data) => (
                  <div key={data.month} className="flex items-center gap-4">
                    <span className="w-12 font-medium">{data.month}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-4 bg-blue-500 rounded"
                          style={{ width: `${(data.consumption / 1600) * 100}%` }}
                        />
                        <span className="text-sm">{data.consumption} t</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-4 bg-green-500/50 rounded"
                          style={{ width: `${(data.prediction / 1600) * 100}%` }}
                        />
                        <span className="text-sm text-muted-foreground">{data.prediction} t (ML)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" />
                  <span>Consumo Real</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/50 rounded" />
                  <span>Predição ML</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle>Predições de Consumo - Próximos 30 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Modelo ML treinado com 2 anos de dados operacionais
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Precisão: 94.2% | Última atualização: há 2 horas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BunkerOptimizationPage;
