import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Navigation,
  MapPin,
  TrendingDown,
  Clock,
  Fuel,
  Wind,
  Waves,
  AlertTriangle,
  CheckCircle,
  Route,
  Zap,
} from "lucide-react";

interface RouteOptimization {
  id: string;
  vessel: string;
  origin: string;
  destination: string;
  currentRoute: {
    distance: number;
    estimatedTime: number;
    fuelConsumption: number;
    weatherRisk: "low" | "medium" | "high";
  };
  optimizedRoute: {
    distance: number;
    estimatedTime: number;
    fuelConsumption: number;
    weatherRisk: "low" | "medium" | "high";
  };
  savings: {
    fuel: number;
    time: number;
    cost: number;
    co2: number;
  };
  weatherConditions: {
    windSpeed: number;
    waveHeight: number;
    visibility: number;
  };
  recommendation: string;
  status: "active" | "pending" | "applied";
}

export const RealTimeRouteOptimizer: React.FC = () => {
  const [optimizations, setOptimizations] = useState<RouteOptimization[]>([
    {
      id: "1",
      vessel: "MV-Atlas",
      origin: "Santos, SP",
      destination: "Rio de Janeiro, RJ",
      currentRoute: {
        distance: 425,
        estimatedTime: 8.5,
        fuelConsumption: 1850,
        weatherRisk: "medium",
      },
      optimizedRoute: {
        distance: 418,
        estimatedTime: 8.2,
        fuelConsumption: 1628,
        weatherRisk: "low",
      },
      savings: {
        fuel: 12,
        time: 0.3,
        cost: 2840,
        co2: 698,
      },
      weatherConditions: {
        windSpeed: 15,
        waveHeight: 1.8,
        visibility: 8,
      },
      recommendation:
        "Desviar 7nm a leste para evitar zona de vento forte. Economia de 12% em combustível.",
      status: "active",
    },
    {
      id: "2",
      vessel: "MV-Neptune",
      origin: "Paranaguá, PR",
      destination: "Santos, SP",
      currentRoute: {
        distance: 285,
        estimatedTime: 5.8,
        fuelConsumption: 1240,
        weatherRisk: "low",
      },
      optimizedRoute: {
        distance: 282,
        estimatedTime: 5.6,
        fuelConsumption: 1175,
        weatherRisk: "low",
      },
      savings: {
        fuel: 5.2,
        time: 0.2,
        cost: 1580,
        co2: 195,
      },
      weatherConditions: {
        windSpeed: 8,
        waveHeight: 0.9,
        visibility: 10,
      },
      recommendation:
        "Condições ideais. Ajustar velocidade para 12.5 nós para otimização de consumo.",
      status: "pending",
    },
    {
      id: "3",
      vessel: "MV-Poseidon",
      origin: "Rio de Janeiro, RJ",
      destination: "Vitória, ES",
      currentRoute: {
        distance: 380,
        estimatedTime: 7.2,
        fuelConsumption: 1680,
        weatherRisk: "high",
      },
      optimizedRoute: {
        distance: 395,
        estimatedTime: 7.8,
        fuelConsumption: 1520,
        weatherRisk: "low",
      },
      savings: {
        fuel: 9.5,
        time: -0.6,
        cost: 2200,
        co2: 480,
      },
      weatherConditions: {
        windSpeed: 22,
        waveHeight: 2.8,
        visibility: 5,
      },
      recommendation:
        "URGENTE: Desviar para rota alternativa mais longa para evitar tempestade. Prioridade: segurança.",
      status: "active",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "applied":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  const totalFuelSavings = optimizations.reduce((sum, opt) => sum + opt.savings.fuel, 0);
  const totalCostSavings = optimizations.reduce((sum, opt) => sum + opt.savings.cost, 0);
  const totalCO2Reduction = optimizations.reduce((sum, opt) => sum + opt.savings.co2, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rotas Otimizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{optimizations.length}</div>
            <p className="text-xs text-muted-foreground">Ativas agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Economia Combustível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalFuelSavings.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Média ponderada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Economia Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {(totalCostSavings / 1000).toFixed(1)}k</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Redução CO₂</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(totalCO2Reduction / 1000).toFixed(1)}t
            </div>
            <p className="text-xs text-muted-foreground">Emissões evitadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Optimizer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Otimizador de Rotas em Tempo Real
              </CardTitle>
              <CardDescription>
                IA analisa condições meteoceanográficas e otimiza rotas continuamente
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              Tempo Real
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {optimizations.map(opt => (
            <Card key={opt.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{opt.vessel}</Badge>
                      <Badge variant={getStatusColor(opt.status) as any}>
                        {opt.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{opt.origin}</span>
                      <Route className="h-4 w-4" />
                      <span>{opt.destination}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Route Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium text-sm">Rota Atual</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distância:</span>
                        <span className="font-medium">{opt.currentRoute.distance} nm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo:</span>
                        <span className="font-medium">{opt.currentRoute.estimatedTime}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Combustível:</span>
                        <span className="font-medium">{opt.currentRoute.fuelConsumption}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risco:</span>
                        <span
                          className={`font-medium ${getRiskColor(opt.currentRoute.weatherRisk)}`}
                        >
                          {opt.currentRoute.weatherRisk.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-500">
                    <div className="font-medium text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Rota Otimizada
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distância:</span>
                        <span className="font-medium">{opt.optimizedRoute.distance} nm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo:</span>
                        <span className="font-medium">{opt.optimizedRoute.estimatedTime}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Combustível:</span>
                        <span className="font-medium text-green-600">
                          {opt.optimizedRoute.fuelConsumption}L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risco:</span>
                        <span
                          className={`font-medium ${getRiskColor(opt.optimizedRoute.weatherRisk)}`}
                        >
                          {opt.optimizedRoute.weatherRisk.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Savings */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Fuel className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-xl font-bold text-green-600">{opt.savings.fuel}%</div>
                    <div className="text-xs text-muted-foreground">Combustível</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      {opt.savings.time > 0 ? "+" : ""}
                      {opt.savings.time}h
                    </div>
                    <div className="text-xs text-muted-foreground">Tempo</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      R$ {(opt.savings.cost / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-muted-foreground">Economia</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{opt.savings.co2}kg</div>
                    <div className="text-xs text-muted-foreground">CO₂ Evitado</div>
                  </div>
                </div>

                {/* Weather Conditions */}
                <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{opt.weatherConditions.windSpeed} nós</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Waves className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{opt.weatherConditions.waveHeight}m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Vis: {opt.weatherConditions.visibility}nm</span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Recomendação
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    {opt.recommendation}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aplicar Rota Otimizada
                  </Button>
                  <Button size="sm" variant="outline">
                    Ver Mapa
                  </Button>
                  <Button size="sm" variant="outline">
                    Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeRouteOptimizer;
