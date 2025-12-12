import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Fuel, TrendingDown, Route, AlertCircle, Zap, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FuelOptimizer = () => {
  const { toast } = useToast();
  const [routeData, setRouteData] = useState({
    origin: "",
    destination: "",
    cargo_weight: "",
    weather_condition: "normal"
  });

  const [optimization, setOptimization] = useState<unknown>(null);
  const [history, setHistory] = useState([
    {
      id: "1",
      route: "Santos → Rio de Janeiro",
      estimated_consumption: 2500,
      actual_consumption: 2450,
      savings: 50,
      date: "2025-01-15"
    },
    {
      id: "2",
      route: "Rio de Janeiro → Vitória",
      estimated_consumption: 1800,
      actual_consumption: 1850,
      savings: -50,
      date: "2025-01-10"
    }
  ]);

  const handleOptimize = () => {
    if (!routeData.origin || !routeData.destination || !routeData.cargo_weight) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Simulação de otimização AI
    const baseConsumption = parseFloat(routeData.cargo_weight) * 0.15;
    const weatherFactor = routeData.weather_condition === "normal" ? 1.0 : 1.2;
    const optimizedConsumption = baseConsumption * weatherFactor * 0.85; // 15% de economia

    const result = {
      route: `${routeData.origin} → ${routeData.destination}`,
      standard_consumption: Math.round(baseConsumption * weatherFactor),
      optimized_consumption: Math.round(optimizedConsumption),
      savings_liters: Math.round(baseConsumption * weatherFactor - optimizedConsumption),
      savings_percentage: 15,
      recommendations: [
        "Velocidade ideal: 12 nós",
        "Evitar correntes contrárias no trecho sul",
        "Janela de tempo favorável: próximas 48h"
      ]
    });

    setOptimization(result);
    
    toast({
      title: "Otimização concluída",
      description: `Economia estimada: ${result.savings_liters}L (${result.savings_percentage}%)`
    });
  });

  const totalSavings = history.reduce((sum, h) => sum + h.savings, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Fuel className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Fuel Optimizer</h1>
          <p className="text-muted-foreground">Otimização inteligente de consumo de combustível</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalSavings}L</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rotas Otimizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Taxa de Precisão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Previsão vs Real</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">2</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de otimização */}
        <Card>
          <CardHeader>
            <CardTitle>Nova Otimização de Rota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Origem</Label>
              <Input
                value={routeData.origin}
                onChange={handleChange}
                placeholder="Porto de origem"
              />
            </div>
            <div>
              <Label>Destino</Label>
              <Input
                value={routeData.destination}
                onChange={handleChange}
                placeholder="Porto de destino"
              />
            </div>
            <div>
              <Label>Peso da Carga (ton)</Label>
              <Input
                type="number"
                value={routeData.cargo_weight}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Condição Climática</Label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={routeData.weather_condition}
                onChange={handleChange}
              >
                <option value="normal">Normal</option>
                <option value="adversa">Adversa</option>
              </select>
            </div>
            <Button onClick={handleOptimize} className="w-full">
              <Zap className="mr-2 h-4 w-4" />
              Otimizar Rota
            </Button>
          </CardContent>
        </Card>

        {/* Resultado da otimização */}
        {optimization && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Resultado da Otimização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rota</p>
                <p className="font-semibold">{optimization.route}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Consumo Padrão</p>
                  <p className="text-2xl font-bold">{optimization.standard_consumption}L</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Consumo Otimizado</p>
                  <p className="text-2xl font-bold text-green-600">{optimization.optimized_consumption}L</p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-600">
                    Economia: {optimization.savings_liters}L ({optimization.savings_percentage}%)
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Recomendações AI:</p>
                <ul className="space-y-2">
                  {optimization.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Otimizações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{item.route}</p>
                  <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Estimado: {item.estimated_consumption}L | Real: {item.actual_consumption}L
                  </p>
                  <Badge className={item.savings >= 0 ? "bg-green-500" : "bg-red-500"}>
                    {item.savings >= 0 ? "+" : ""}{item.savings}L
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FuelOptimizer;
