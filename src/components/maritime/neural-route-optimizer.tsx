import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Navigation, 
  TrendingDown, 
  Cloud,
  Waves,
  Fuel,
  Clock,
  DollarSign,
  MapPin,
  Zap,
  Brain,
  Satellite,
  Wind,
  Thermometer,
  CheckCircle,
  AlertTriangle,
  Ship,
  Target,
  BarChart3,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RouteOptimization {
  id: string;
  from: string;
  to: string;
  distance: number;
  estimatedTime: number;
  fuelConsumption: number;
  fuelSavings: number;
  timeSavings: number;
  costSavings: number;
  weatherConditions: string[];
  currentConditions: string[];
  trafficLevel: "low" | "medium" | "high";
  recommendation: "optimal" | "good" | "acceptable" | "avoid";
  confidence: number;
}

interface WeatherForecast {
  date: Date;
  windSpeed: number;
  waveHeight: number;
  temperature: number;
  precipitation: number;
  visibility: number;
  conditions: string;
  severity: "calm" | "moderate" | "rough" | "severe";
}

export const NeuralRouteOptimizer: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<RouteOptimization | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const { toast } = useToast();

  const [routes] = useState<RouteOptimization[]>([
    {
      id: "route1",
      from: "Santos, Brasil",
      to: "Rotterdam, Holanda",
      distance: 5890,
      estimatedTime: 16.5,
      fuelConsumption: 1850,
      fuelSavings: 30,
      timeSavings: 25,
      costSavings: 125000,
      weatherConditions: ["Bom tempo", "Ventos favoráveis", "Mar calmo"],
      currentConditions: ["Corrente favorável 2.5kt", "Temperatura ideal"],
      trafficLevel: "low",
      recommendation: "optimal",
      confidence: 98
    },
    {
      id: "route2",
      from: "Santos, Brasil",
      to: "Rotterdam, Holanda",
      distance: 6120,
      estimatedTime: 18.2,
      fuelConsumption: 2100,
      fuelSavings: 15,
      timeSavings: 10,
      costSavings: 65000,
      weatherConditions: ["Ventos moderados", "Chuva leve"],
      currentConditions: ["Corrente neutra", "Tráfego moderado"],
      trafficLevel: "medium",
      recommendation: "good",
      confidence: 85
    },
    {
      id: "route3",
      from: "Santos, Brasil",
      to: "Rotterdam, Holanda",
      distance: 5750,
      estimatedTime: 17.8,
      fuelConsumption: 2250,
      fuelSavings: 5,
      timeSavings: 5,
      costSavings: 25000,
      weatherConditions: ["Mar agitado previsto", "Tempestade possível"],
      currentConditions: ["Corrente contrária 1.5kt", "Zona de alta densidade"],
      trafficLevel: "high",
      recommendation: "acceptable",
      confidence: 72
    }
  ]);

  useEffect(() => {
    generateWeatherForecast();
  }, []);

  const generateWeatherForecast = () => {
    const forecast: WeatherForecast[] = [];
    const now = new Date();

    for (let i = 0; i < 15; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date,
        windSpeed: 10 + ((i * 7 + 3) % 20),
        waveHeight: 1 + ((i * 11 + 2) % 30) / 10,
        temperature: 18 + ((i * 13 + 1) % 10),
        precipitation: ((i * 17 + 5) % 100),
        visibility: 5 + ((i * 9 + 4) % 10),
        conditions: i % 3 === 0 ? "Ensolarado" : i % 3 === 1 ? "Parcialmente nublado" : "Nublado",
        severity: i % 4 === 0 ? "calm" : i % 4 === 1 ? "moderate" : i % 4 === 2 ? "rough" : "moderate"
      });
    }

    setWeatherForecast(forecast);
  };

  const optimizeRoute = () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    let intervalCleared = false;
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100 && !intervalCleared) {
          intervalCleared = true;
          clearInterval(interval);
          setIsOptimizing(false);
          setSelectedRoute(routes[0]);
          toast({
            title: "✅ Otimização Completa",
            description: "Rota otimizada com 30% de economia de combustível e 25% menos tempo de viagem",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getRecommendationColor = (rec: RouteOptimization["recommendation"]) => {
    switch (rec) {
    case "optimal": return "bg-success/10 text-success";
    case "good": return "bg-primary/10 text-primary";
    case "acceptable": return "bg-warning/10 text-warning";
    case "avoid": return "bg-destructive/10 text-destructive";
    }
  };

  const getTrafficColor = (level: RouteOptimization["trafficLevel"]) => {
    switch (level) {
    case "low": return "text-success";
    case "medium": return "text-warning";
    case "high": return "text-destructive";
    }
  };

  const getSeverityColor = (severity: WeatherForecast["severity"]) => {
    switch (severity) {
    case "calm": return "bg-success/10 text-success";
    case "moderate": return "bg-primary/10 text-primary";
    case "rough": return "bg-warning/10 text-warning";
    case "severe": return "bg-destructive/10 text-destructive";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Navigation className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Neural Route Optimizer
                  <Badge className="bg-purple-400 text-purple-900 hover:bg-purple-300">
                    <Zap className="h-3 w-3 mr-1" />
                    QUANTUM
                  </Badge>
                </CardTitle>
                <CardDescription className="text-white/90">
                  Otimização quântica de rotas com análise em tempo real: clima, correntes, tráfego e combustível
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={optimizeRoute}
              disabled={isOptimizing}
              size="lg"
              className="bg-background text-primary hover:bg-background/90"
            >
              <Brain className="h-5 w-5 mr-2" />
              {isOptimizing ? "Otimizando..." : "Otimizar Rota"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Optimization Progress */}
      {isOptimizing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 animate-pulse" />
              Processamento Quântico em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={optimizationProgress} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Cloud className={optimizationProgress > 25 ? "text-success" : "text-muted-foreground"} />
                <span className="text-sm">Dados meteorológicos</span>
              </div>
              <div className="flex items-center gap-2">
                <Waves className={optimizationProgress > 50 ? "text-success" : "text-muted-foreground"} />
                <span className="text-sm">Análise de correntes</span>
              </div>
              <div className="flex items-center gap-2">
                <Ship className={optimizationProgress > 75 ? "text-success" : "text-muted-foreground"} />
                <span className="text-sm">Tráfego marítimo</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className={optimizationProgress === 100 ? "text-success" : "text-muted-foreground"} />
                <span className="text-sm">Otimização combustível</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Options */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Rotas Otimizadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {routes.map((route) => (
                <Card 
                  key={route.id} 
                  className={`cursor-pointer transition-all ${
                    selectedRoute?.id === route.id ? "border-primary border-2" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Ship className="h-5 w-5 text-primary" />
                          <span className="font-semibold">{route.from} → {route.to}</span>
                          <Badge className={getRecommendationColor(route.recommendation)}>
                            {route.recommendation === "optimal" ? "⭐ ÓTIMA" : 
                              route.recommendation === "good" ? "✅ BOA" : 
                                route.recommendation === "acceptable" ? "⚠️ ACEITÁVEL" : "❌ EVITAR"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Navigation className="h-4 w-4 text-muted-foreground" />
                            <span>{route.distance} nm</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{route.estimatedTime} dias</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Fuel className="h-4 w-4 text-muted-foreground" />
                            <span>{route.fuelConsumption}t</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>${route.costSavings.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{route.confidence}%</div>
                        <div className="text-xs text-muted-foreground">Confiança</div>
                      </div>
                    </div>

                    {/* Savings */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <div className="flex items-center gap-1 text-success text-xs font-medium">
                          <TrendingDown className="h-3 w-3" />
                          <span>{route.fuelSavings}% Combustível</span>
                        </div>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <div className="flex items-center gap-1 text-primary text-xs font-medium">
                          <Clock className="h-3 w-3" />
                          <span>{route.timeSavings}% Tempo</span>
                        </div>
                      </div>
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <div className="flex items-center gap-1 text-accent-foreground text-xs font-medium">
                          <DollarSign className="h-3 w-3" />
                          <span>${(route.costSavings/1000).toFixed(0)}k</span>
                        </div>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Condições Meteorológicas:</div>
                        <div className="flex flex-wrap gap-1">
                          {route.weatherConditions.map((condition, idx) => (
                          <Badge key={condition} variant="outline" className="text-xs">
                              <Cloud className="h-3 w-3 mr-1" />
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Condições Oceânicas:</div>
                        <div className="flex flex-wrap gap-1">
                          {route.currentConditions.map((condition) => (
                            <Badge key={condition} variant="outline" className="text-xs">
                              <Waves className="h-3 w-3 mr-1" />
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Tráfego:</span>
                        <Badge className={`text-xs ${getTrafficColor(route.trafficLevel)}`}>
                          {route.trafficLevel === "low" ? "🟢 Baixo" : 
                            route.trafficLevel === "medium" ? "🟡 Médio" : "🔴 Alto"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Weather Forecast */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              Previsão 15 Dias
            </CardTitle>
            <CardDescription>
              Dados meteorológicos em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {weatherForecast.map((forecast) => (
                <div key={forecast.date.toISOString()} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {forecast.date.toLocaleDateString("pt-BR", { 
                        day: "2-digit", 
                        month: "short" 
                      })}
                    </span>
                    <Badge className={getSeverityColor(forecast.severity)}>
                      {forecast.severity === "calm" ? "🌊 Calmo" : 
                        forecast.severity === "moderate" ? "🌊 Moderado" : 
                          forecast.severity === "rough" ? "🌊 Agitado" : "⚠️ Severo"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{forecast.conditions}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Wind className="h-3 w-3" />
                      <span>{forecast.windSpeed.toFixed(1)} kt</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Waves className="h-3 w-3" />
                      <span>{forecast.waveHeight.toFixed(1)} m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      <span>{forecast.temperature.toFixed(0)}°C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Cloud className="h-3 w-3" />
                      <span>{forecast.visibility.toFixed(1)} nm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboard de Economia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-success/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Fuel className="h-8 w-8 text-success" />
                <TrendingDown className="h-5 w-5 text-success" />
              </div>
              <div className="text-2xl font-bold text-success">30%</div>
              <div className="text-sm text-muted-foreground">Economia de Combustível</div>
              <div className="text-xs text-success mt-1">≈ 555t por viagem</div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-primary" />
                <TrendingDown className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">25%</div>
              <div className="text-sm text-muted-foreground">Redução de Tempo</div>
              <div className="text-xs text-primary mt-1">≈ 4.1 dias economizados</div>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-8 w-8 text-accent-foreground" />
                <TrendingDown className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="text-2xl font-bold text-accent-foreground">$125k</div>
              <div className="text-sm text-muted-foreground">Economia por Viagem</div>
              <div className="text-xs text-accent-foreground mt-1">ROI de 500% em 6 meses</div>
            </div>
            <div className="p-4 bg-warning/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-warning" />
                <CheckCircle className="h-5 w-5 text-warning" />
              </div>
              <div className="text-2xl font-bold text-warning">98%</div>
              <div className="text-sm text-muted-foreground">Precisão do Sistema</div>
              <div className="text-xs text-warning mt-1">IA de última geração</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
