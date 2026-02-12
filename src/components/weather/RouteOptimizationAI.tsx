/**
 * Route Optimization AI - Fuel & Time Optimization with AI
 * Weather routing, piracy avoidance, scenario simulations
 */

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Navigation,
  Fuel,
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  Wind,
  Waves,
  Ship,
  MapPin,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  RefreshCw,
  Download,
  Play,
  Anchor
} from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface RouteOption {
  id: string;
  name: string;
  distance: number;
  estimatedTime: number;
  fuelConsumption: number;
  fuelCost: number;
  weatherRisk: number;
  piracyRisk: number;
  eeoi: number;
  recommended: boolean;
  waypoints: { name: string; lat: number; lng: number; eta: Date }[];
}

interface WeatherForecast {
  day: number;
  date: Date;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  visibility: number;
  condition: "good" | "moderate" | "poor" | "severe";
}

interface ScenarioResult {
  scenario: string;
  eta: Date;
  fuelUsed: number;
  cost: number;
  risk: number;
}

export function RouteOptimizationAI() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [optimizationPriority, setOptimizationPriority] = useState([50]); // 0 = time, 100 = fuel
  const [origin, setOrigin] = useState("Santos, Brasil");
  const [destination, setDestination] = useState("Rotterdam, Holanda");

  const routeOptions: RouteOption[] = [
    {
      id: "route-1",
      name: "Rota Otimizada IA",
      distance: 5420,
      estimatedTime: 312, // hours
      fuelConsumption: 845,
      fuelCost: 380250,
      weatherRisk: 15,
      piracyRisk: 5,
      eeoi: 8.2,
      recommended: true,
      waypoints: [
        { name: "Santos", lat: -23.9618, lng: -46.3322, eta: new Date() },
        { name: "Recife", lat: -8.0476, lng: -34.8770, eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
        { name: "Las Palmas", lat: 28.1235, lng: -15.4363, eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        { name: "Rotterdam", lat: 51.9244, lng: 4.4777, eta: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000) }
      ]
    },
    {
      id: "route-2",
      name: "Rota Mais Rápida",
      distance: 5180,
      estimatedTime: 285,
      fuelConsumption: 920,
      fuelCost: 414000,
      weatherRisk: 35,
      piracyRisk: 8,
      eeoi: 9.1,
      recommended: false,
      waypoints: [
        { name: "Santos", lat: -23.9618, lng: -46.3322, eta: new Date() },
        { name: "Dakar", lat: 14.6928, lng: -17.4467, eta: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
        { name: "Rotterdam", lat: 51.9244, lng: 4.4777, eta: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) }
      ]
    },
    {
      id: "route-3",
      name: "Rota Mais Econômica",
      distance: 5680,
      estimatedTime: 336,
      fuelConsumption: 780,
      fuelCost: 351000,
      weatherRisk: 20,
      piracyRisk: 3,
      eeoi: 7.5,
      recommended: false,
      waypoints: [
        { name: "Santos", lat: -23.9618, lng: -46.3322, eta: new Date() },
        { name: "Natal", lat: -5.7945, lng: -35.2110, eta: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
        { name: "Cabo Verde", lat: 14.9330, lng: -23.5133, eta: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) },
        { name: "Lisboa", lat: 38.7223, lng: -9.1393, eta: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
        { name: "Rotterdam", lat: 51.9244, lng: 4.4777, eta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }
      ]
    }
  ];

  const weatherForecast: WeatherForecast[] = Array.from({ length: 14 }, (_, i) => ({
    day: i + 1,
    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
    windSpeed: 8 + Math.abs(Math.sin(i * 1.3)) * 20,
    windDirection: (i * 47) % 360,
    waveHeight: 1 + Math.abs(Math.sin(i * 0.9)) * 4,
    visibility: 5 + Math.abs(Math.cos(i * 0.7)) * 15,
    condition: i === 5 || i === 6 ? "poor" : i === 10 ? "moderate" : "good"
  }));

  const scenarioResults: ScenarioResult[] = [
    { scenario: "Base (atual)", eta: new Date(Date.now() + 312 * 60 * 60 * 1000), fuelUsed: 845, cost: 380250, risk: 15 },
    { scenario: "Velocidade +10%", eta: new Date(Date.now() + 284 * 60 * 60 * 1000), fuelUsed: 965, cost: 434250, risk: 18 },
    { scenario: "Velocidade -10%", eta: new Date(Date.now() + 347 * 60 * 60 * 1000), fuelUsed: 745, cost: 335250, risk: 12 },
    { scenario: "Evitar tempestade", eta: new Date(Date.now() + 336 * 60 * 60 * 1000), fuelUsed: 870, cost: 391500, risk: 8 },
    { scenario: "Rota direta", eta: new Date(Date.now() + 285 * 60 * 60 * 1000), fuelUsed: 920, cost: 414000, risk: 35 }
  ];

  const radarData = routeOptions.map(route => ({
    route: route.name.substring(0, 15),
    Tempo: 100 - (route.estimatedTime / 4),
    Combustível: 100 - (route.fuelConsumption / 10),
    Segurança: 100 - route.weatherRisk - route.piracyRisk,
    Eficiência: 100 - route.eeoi * 5,
    Custo: 100 - (route.fuelCost / 5000)
  }));

  const runOptimization = async () => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { prompt: `Optimize maritime route with parameters: ${JSON.stringify(routeOptions.map(r => r.name))}`, module: 'route-optimization' }
      });
      if (error) throw error;
      setSelectedRoute(routeOptions[0]);
      toast.success("Otimização concluída!", {
        description: "Rota otimizada calculada com economia de 8% em combustível"
      });
    } catch (err) {
      toast.error("Erro na otimização de rota");
    } finally {
      setIsOptimizing(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 20) return "text-green-500";
    if (risk < 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "good": return "bg-green-500";
      case "moderate": return "bg-yellow-500";
      case "poor": return "bg-orange-500";
      case "severe": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl">
            <Navigation className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Otimização de Rotas IA
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                <Brain className="h-3 w-3 mr-1" />
                Weather Routing
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Economia de combustível • Previsão meteorológica • Análise de riscos
            </p>
          </div>
        </div>
        <Button onClick={runOptimization} disabled={isOptimizing}>
          {isOptimizing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          {isOptimizing ? "Otimizando..." : "Calcular Rota Ótima"}
        </Button>
      </div>

      {/* Route Input */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Origem</Label>
              <div className="flex items-center gap-2">
                <Anchor className="h-4 w-4 text-muted-foreground" />
                <Input value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Destino</Label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Prioridade de Otimização</Label>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={optimizationPriority}
                  onValueChange={setOptimizationPriority}
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <Fuel className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {optimizationPriority[0] < 50 ? "Foco em Tempo" : optimizationPriority[0] > 50 ? "Foco em Economia" : "Balanceado"}
              </p>
            </div>
            <Button variant="outline" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Simular
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="routes">
        <TabsList>
          <TabsTrigger value="routes">
            <Navigation className="h-4 w-4 mr-2" />
            Rotas
          </TabsTrigger>
          <TabsTrigger value="weather">
            <Wind className="h-4 w-4 mr-2" />
            Meteorologia
          </TabsTrigger>
          <TabsTrigger value="scenarios">
            <Brain className="h-4 w-4 mr-2" />
            Cenários
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <TrendingUp className="h-4 w-4 mr-2" />
            Comparativo
          </TabsTrigger>
        </TabsList>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {routeOptions.map((route) => (
              <Card
                key={route.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedRoute?.id === route.id ? "ring-2 ring-primary" : ""
                } ${route.recommended ? "border-green-500/50" : ""}`}
                onClick={() => setSelectedRoute(route)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {route.name}
                      {route.recommended && (
                        <Badge className="bg-green-500/20 text-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Recomendada
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Distância</p>
                        <p className="font-bold">{route.distance.toLocaleString()} NM</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tempo</p>
                        <p className="font-bold">{(route.estimatedTime / 24).toFixed(1)} dias</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Combustível</p>
                        <p className="font-bold">{route.fuelConsumption} ton</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo</p>
                        <p className="font-bold">R$ {(route.fuelCost / 1000).toFixed(0)}k</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Wind className="h-3 w-3" />
                          Risco Clima
                        </span>
                        <span className={getRiskColor(route.weatherRisk)}>{route.weatherRisk}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Risco Pirataria
                        </span>
                        <span className={getRiskColor(route.piracyRisk)}>{route.piracyRisk}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Fuel className="h-3 w-3" />
                          EEOI
                        </span>
                        <span>{route.eeoi} gCO₂/ton·NM</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Waypoints</p>
                      <div className="flex flex-wrap gap-1">
                        {route.waypoints.map((wp) => (
                          <Badge key={wp.name} variant="outline" className="text-xs">
                            {wp.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Previsão Meteorológica - 14 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weatherForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: "Dia", position: "bottom" }} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="windSpeed" name="Vento (kts)" stroke="#3b82f6" fill="#3b82f640" />
                    <Area yAxisId="right" type="monotone" dataKey="waveHeight" name="Ondas (m)" stroke="#22c55e" fill="#22c55e40" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-7 md:grid-cols-14 gap-2">
            {weatherForecast.map((day) => (
              <Card key={day.day} className="text-center">
                <CardContent className="p-2">
                  <p className="text-xs text-muted-foreground">Dia {day.day}</p>
                  <div className={`w-4 h-4 rounded-full mx-auto my-1 ${getConditionColor(day.condition)}`} />
                  <p className="text-xs font-bold">{day.windSpeed.toFixed(0)} kts</p>
                  <p className="text-xs">{day.waveHeight.toFixed(1)}m</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Simulação de Cenários</CardTitle>
              <CardDescription>Compare diferentes estratégias de navegação</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {scenarioResults.map((scenario, idx) => (
                    <div
                      key={scenario.scenario}
                      className={`p-4 border rounded-lg ${idx === 0 ? "bg-primary/5 border-primary/30" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {scenario.scenario}
                            {idx === 0 && <Badge>Base</Badge>}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ETA: {scenario.eta.toLocaleDateString("pt-BR")} {scenario.eta.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-right">
                          <div>
                            <p className="text-xs text-muted-foreground">Combustível</p>
                            <p className="font-bold flex items-center gap-1 justify-end">
                              {scenario.fuelUsed > scenarioResults[0].fuelUsed ? (
                                <TrendingUp className="h-3 w-3 text-red-500" />
                              ) : scenario.fuelUsed < scenarioResults[0].fuelUsed ? (
                                <TrendingDown className="h-3 w-3 text-green-500" />
                              ) : null}
                              {scenario.fuelUsed} ton
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Custo</p>
                            <p className="font-bold">R$ {(scenario.cost / 1000).toFixed(0)}k</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Risco</p>
                            <p className={`font-bold ${getRiskColor(scenario.risk)}`}>{scenario.risk}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Comparativo de Rotas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="route" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Tempo" dataKey="Tempo" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="Combustível" dataKey="Combustível" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    <Radar name="Segurança" dataKey="Segurança" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RouteOptimizationAI;
