import { useEffect, useState, useCallback } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLogisticsAI, type LogisticsOperation } from "@/hooks/use-logistics-ai";
import { Brain, Navigation, AlertTriangle, TrendingUp, Package, Loader2, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface LogisticsAIInsightsProps {
  operations: LogisticsOperation[];
}

export const LogisticsAIInsights = ({ operations }: LogisticsAIInsightsProps) => {
  const {
    isAnalyzing,
    optimizeRoutes,
    predictDelays,
    optimizeInventory,
    generateLogisticsInsights,
  } = useLogisticsAI();

  const [routeOptimizations, setRouteOptimizations] = useState<any[]>([]);
  const [delayPredictions, setDelayPredictions] = useState<any[]>([]);
  const [inventoryOptimizations, setInventoryOptimizations] = useState<any[]>([]);
  const [insights, setInsights] = useState<unknown>(null);

  const handleOptimizeRoutes = async () => {
    const opts = await optimizeRoutes(operations);
    setRouteOptimizations(opts);
  });

  const handlePredictDelays = async () => {
    const preds = await predictDelays(operations);
    setDelayPredictions(preds);
  });

  const handleOptimizeInventory = async () => {
    const opts = await optimizeInventory();
    setInventoryOptimizations(opts);
  });

  const handleGenerateInsights = async () => {
    const ins = await generateLogisticsInsights(operations);
    setInsights(ins);
  });

  useEffect(() => {
    if (operations.length > 0) {
      handleGenerateInsights();
    }
  }, [operations.length]);

  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
    urgent: "bg-red-600",
  };

  return (
    <div className="space-y-6">
      {/* AI Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Análise Inteligente de Logística</CardTitle>
            </div>
            {isAnalyzing && (
              <Badge variant="outline" className="gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analisando...
              </Badge>
            )}
          </div>
          <CardDescription>
            Insights baseados em IA para otimizar operações logísticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={handleOptimizeRoutes}
              disabled={isAnalyzing || operations.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <Navigation className="h-5 w-5" />
              <span className="text-sm">Otimizar Rotas</span>
            </Button>

            <Button
              onClick={handlePredictDelays}
              disabled={isAnalyzing || operations.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">Prever Atrasos</span>
            </Button>

            <Button
              onClick={handleOptimizeInventory}
              disabled={isAnalyzing}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <Package className="h-5 w-5" />
              <span className="text-sm">Otimizar Estoque</span>
            </Button>

            <Button
              onClick={handleGenerateInsights}
              disabled={isAnalyzing || operations.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Insights Gerais</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="routes">Rotas</TabsTrigger>
          <TabsTrigger value="delays">Atrasos</TabsTrigger>
          <TabsTrigger value="inventory">Estoque</TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insights ? (
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral de Logística</CardTitle>
                <CardDescription>{insights.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Indicadores de Eficiência</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{insights.efficiency.overall}%</p>
                      <p className="text-sm text-muted-foreground mt-1">Eficiência Geral</p>
                    </div>
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <p className="text-3xl font-bold text-green-500">{insights.efficiency.onTimeDelivery}%</p>
                      <p className="text-sm text-muted-foreground mt-1">Entregas no Prazo</p>
                    </div>
                    <div className="text-center p-4 bg-accent/50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-500">{insights.efficiency.routeOptimization}%</p>
                      <p className="text-sm text-muted-foreground mt-1">Otimização de Rotas</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Recomendações Estratégicas
                  </h4>
                  <div className="space-y-2">
                    {insights.recommendations?.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {insights.alerts?.length > 0 && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Alertas
                    </h4>
                    <div className="space-y-2">
                      {insights.alerts.map((alert: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg">
                          <span className="text-sm">{alert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Insights Gerais" para gerar análise
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          {routeOptimizations.length > 0 ? (
            routeOptimizations.map((opt) => (
              <Card key={opt.operationId}>
                <CardHeader>
                  <CardTitle className="text-lg">{opt.cargo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-green-500">-{opt.savings.time}h</p>
                      <p className="text-muted-foreground">Tempo</p>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                      <p className="text-2xl font-bold text-blue-500">R$ {opt.savings.cost.toLocaleString()}</p>
                      <p className="text-muted-foreground">Economia</p>
                    </div>
                    <div className="text-center p-3 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">-{opt.savings.distance}km</p>
                      <p className="text-muted-foreground">Distância</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Rota Atual:</span>
                      <p className="font-medium">{opt.currentRoute}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rota Otimizada:</span>
                      <p className="font-medium text-green-600">{opt.optimizedRoute}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground border-t pt-3">{opt.reason}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Otimizar Rotas" para gerar otimizações
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Delays Tab */}
        <TabsContent value="delays" className="space-y-4">
          {delayPredictions.length > 0 ? (
            delayPredictions.map((pred) => (
              <Card key={pred.operationId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pred.cargo}</CardTitle>
                    <Badge variant={pred.delayProbability > 0.6 ? "destructive" : "secondary"}>
                      {(pred.delayProbability * 100).toFixed(0)}% risco
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Probabilidade de Atraso:</span>
                    <Progress value={pred.delayProbability * 100} className="mt-2" />
                  </div>

                  {pred.estimatedDelay > 0 && (
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <span className="text-sm font-medium">Atraso Estimado:</span>
                      <p className="text-2xl font-bold text-orange-500 mt-1">{pred.estimatedDelay} horas</p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Fatores de Risco
                    </span>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      {pred.riskFactors.map((factor: string, idx: number) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-sm font-medium flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Ações de Mitigação
                    </span>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      {pred.mitigationActions.map((action: string, idx: number) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Prever Atrasos" para gerar previsões
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {inventoryOptimizations.length > 0 ? (
            inventoryOptimizations.map((inv, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{inv.item}</CardTitle>
                    <Badge className={priorityColors[inv.priority as keyof typeof priorityColors]}>
                      {inv.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Estoque Atual:</span>
                      <p className="text-2xl font-bold">{inv.currentStock}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estoque Ideal:</span>
                      <p className="text-2xl font-bold text-green-600">{inv.optimalStock}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ponto de Reposição:</span>
                      <p className="font-medium">{inv.reorderPoint}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Demanda Estimada:</span>
                      <p className="font-medium">{inv.estimatedDemand}/mês</p>
                    </div>
                  </div>

                  <div className="p-3 bg-accent/50 rounded-lg">
                    <span className="text-sm font-medium">Recomendação:</span>
                    <p className="text-sm mt-1">{inv.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Otimizar Estoque" para gerar recomendações
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
