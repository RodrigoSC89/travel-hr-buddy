import { useEffect, useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFleetAI, type VesselData } from "@/hooks/use-fleet-ai";
import { Brain, TrendingUp, Wrench, Fuel, Route, AlertTriangle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface FleetAIInsightsProps {
  vessels: VesselData[];
}

export const FleetAIInsights = ({ vessels }: FleetAIInsightsProps) => {
  const {
    isAnalyzing,
    predictMaintenance,
    optimizeRoutes,
    predictFuelConsumption,
    generateFleetRecommendations,
  } = useFleetAI();

  const [maintenancePredictions, setMaintenancePredictions] = useState<any[]>([]);
  const [routeOptimizations, setRouteOptimizations] = useState<any[]>([]);
  const [fuelPredictions, setFuelPredictions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);

  const handlePredictMaintenance = async () => {
    const predictions = await predictMaintenance(vessels);
    setMaintenancePredictions(predictions);
  };

  const handleOptimizeRoutes = async () => {
    const optimizations = await optimizeRoutes(vessels);
    setRouteOptimizations(optimizations);
  };

  const handlePredictFuel = async () => {
    const predictions = await predictFuelConsumption(vessels);
    setFuelPredictions(predictions);
  };

  const handleGenerateRecommendations = async () => {
    const recs = await generateFleetRecommendations(vessels);
    setRecommendations(recs);
  };

  useEffect(() => {
    // Auto-generate recommendations on load
    if (vessels.length > 0) {
      handleGenerateRecommendations();
    }
  }, [vessels.length]);

  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      {/* AI Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Insights Inteligentes da Frota</CardTitle>
            </div>
            {isAnalyzing && (
              <Badge variant="outline" className="gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analisando...
              </Badge>
            )}
          </div>
          <CardDescription>
            Análises preditivas e recomendações baseadas em IA para otimizar operações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={handlePredictMaintenance}
              disabled={isAnalyzing || vessels.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <Wrench className="h-5 w-5" />
              <span className="text-sm">Prever Manutenção</span>
            </Button>

            <Button
              onClick={handleOptimizeRoutes}
              disabled={isAnalyzing || vessels.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <Route className="h-5 w-5" />
              <span className="text-sm">Otimizar Rotas</span>
            </Button>

            <Button
              onClick={handlePredictFuel}
              disabled={isAnalyzing || vessels.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <Fuel className="h-5 w-5" />
              <span className="text-sm">Análise de Combustível</span>
            </Button>

            <Button
              onClick={handleGenerateRecommendations}
              disabled={isAnalyzing || vessels.length === 0}
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Recomendações</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="routes">Rotas</TabsTrigger>
          <TabsTrigger value="fuel">Combustível</TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations ? (
            <Card>
              <CardHeader>
                <CardTitle>Recomendações Gerais</CardTitle>
                <CardDescription>{recommendations.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.recommendations?.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}

                {recommendations.alerts?.length > 0 && (
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Alertas
                    </h4>
                    {recommendations.alerts.map((alert: string, index: number) => (
                      <div key={index} className="text-sm text-muted-foreground pl-6">
                        • {alert}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Recomendações" para gerar insights da frota
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Maintenance Predictions Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          {maintenancePredictions.length > 0 ? (
            maintenancePredictions.map((pred) => (
              <Card key={pred.vesselId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pred.vesselName}</CardTitle>
                    <Badge className={priorityColors[pred.priority as keyof typeof priorityColors]}>
                      {pred.priority.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Data Prevista:</span>
                      <p className="font-medium">{new Date(pred.predictedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Custo Estimado:</span>
                      <p className="font-medium">R$ {pred.estimatedCost.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Confiança:</span>
                    <Progress value={pred.confidence * 100} className="mt-2" />
                    <span className="text-xs text-muted-foreground">{(pred.confidence * 100).toFixed(0)}%</span>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Componentes Críticos:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pred.criticalComponents.map((comp: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{comp}</Badge>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground border-t pt-3">{pred.reasoning}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Prever Manutenção" para gerar previsões
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Route Optimizations Tab */}
        <TabsContent value="routes" className="space-y-4">
          {routeOptimizations.length > 0 ? (
            routeOptimizations.map((opt) => (
              <Card key={opt.vesselId}>
                <CardHeader>
                  <CardTitle className="text-lg">{opt.vesselName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-accent/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-500">-{opt.fuelSavings}%</p>
                      <p className="text-muted-foreground">Combustível</p>
                    </div>
                    <div className="text-center p-3 bg-accent/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-500">-{opt.timeSavings}h</p>
                      <p className="text-muted-foreground">Tempo</p>
                    </div>
                    <div className="text-center p-3 bg-accent/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">R$ {opt.costSavings.toLocaleString()}</p>
                      <p className="text-muted-foreground">Economia</p>
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

                  <p className="text-sm text-muted-foreground border-t pt-3">{opt.reasoning}</p>
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

        {/* Fuel Predictions Tab */}
        <TabsContent value="fuel" className="space-y-4">
          {fuelPredictions.length > 0 ? (
            fuelPredictions.map((pred) => (
              <Card key={pred.vesselId}>
                <CardHeader>
                  <CardTitle className="text-lg">{pred.vesselName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Nível Atual:</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{pred.currentLevel}</span>
                        <span className="text-sm text-muted-foreground">litros</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Consumo Previsto:</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{pred.predictedConsumption}</span>
                        <span className="text-sm text-muted-foreground">L/h</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-accent/50 rounded-lg">
                    <span className="text-sm font-medium">Recomendação:</span>
                    <p className="text-sm mt-1">{pred.refuelRecommendation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Autonomia Estimada:</span>
                      <p className="font-medium">{pred.estimatedRange} km</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Porto Recomendado:</span>
                      <p className="font-medium">{pred.optimalRefuelPort}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground border-t pt-3">{pred.reasoning}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Clique em "Análise de Combustível" para gerar previsões
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
