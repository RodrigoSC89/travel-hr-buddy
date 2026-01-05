/**
 * Route Optimizer Dashboard - PATCH 1000
 * Visual interface for AI-powered route optimization
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Navigation, 
  Ship,
  Fuel,
  Clock,
  DollarSign,
  AlertTriangle,
  Wind,
  Waves,
  MapPin,
  Route,
  RefreshCw,
  CheckCircle,
  TrendingDown,
  Anchor,
  Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RouteOptimizer } from '@/lib/ai/route-optimizer';

interface RouteOption {
  id: string;
  name: string;
  distance: number;
  duration: number;
  fuelCost: number;
  fuelConsumption: number;
  riskScore: number;
  emissions: number;
  score: number;
  description: string;
  bunkerStops: number;
}

// Mock route options
const MOCK_ROUTES: RouteOption[] = [
  {
    id: '1',
    name: 'Rota Otimizada',
    distance: 2850,
    duration: 168,
    fuelCost: 45000,
    fuelConsumption: 85,
    riskScore: 15,
    emissions: 265,
    score: 92,
    description: 'Melhor equilíbrio entre custo, tempo e segurança',
    bunkerStops: 1,
  },
  {
    id: '2',
    name: 'Rota Econômica',
    distance: 3100,
    duration: 192,
    fuelCost: 38000,
    fuelConsumption: 72,
    riskScore: 22,
    emissions: 225,
    score: 85,
    description: 'Menor custo de combustível, tempo maior',
    bunkerStops: 2,
  },
  {
    id: '3',
    name: 'Rota Direta',
    distance: 2650,
    duration: 144,
    fuelCost: 52000,
    fuelConsumption: 98,
    riskScore: 35,
    emissions: 305,
    score: 78,
    description: 'Caminho mais curto, maior consumo e risco',
    bunkerStops: 0,
  },
];

const MOCK_WEATHER = [
  { zone: 'North Atlantic', condition: 'moderate', waveHeight: 2.5, windSpeed: 18 },
  { zone: 'English Channel', condition: 'calm', waveHeight: 1.2, windSpeed: 8 },
  { zone: 'Bay of Biscay', condition: 'rough', waveHeight: 4.5, windSpeed: 28 },
];

const MOCK_FUEL_PRICES = [
  { port: 'Rotterdam', hfo: 485, lsfo: 695, bestPrice: true },
  { port: 'Singapore', hfo: 450, lsfo: 650, bestPrice: false },
  { port: 'Houston', hfo: 475, lsfo: 680, bestPrice: false },
];

export function RouteOptimizerDashboard() {
  const [departurePort, setDeparturePort] = useState('Santos, Brazil');
  const [arrivalPort, setArrivalPort] = useState('Rotterdam, Netherlands');
  const [routes, setRoutes] = useState<RouteOption[]>(MOCK_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    // Simulate optimization
    setTimeout(() => {
      setRoutes(MOCK_ROUTES);
      setSelectedRoute(MOCK_ROUTES[0]);
      setLoading(false);
    }, 1500);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'calm': return 'text-emerald-500 bg-emerald-500/10';
      case 'moderate': return 'text-amber-500 bg-amber-500/10';
      case 'rough': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Route Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Otimização de Rota
          </CardTitle>
          <CardDescription>
            IA para cálculo de rotas com previsão meteorológica, combustível e zonas de risco
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure">Porto de Partida</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="departure"
                  value={departurePort}
                  onChange={(e) => setDeparturePort(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="arrival">Porto de Chegada</Label>
              <div className="relative">
                <Anchor className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="arrival"
                  value={arrivalPort}
                  onChange={(e) => setArrivalPort(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Input value="MV Nautilus Explorer" readOnly className="bg-muted" />
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                className="w-full" 
                onClick={handleOptimize}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Route className="h-4 w-4 mr-2" />
                )}
                Calcular Rotas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather & Fuel Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weather Conditions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wind className="h-4 w-4" />
              Condições Meteorológicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_WEATHER.map((weather, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Waves className={cn("h-4 w-4", getConditionColor(weather.condition))} />
                    <span className="font-medium">{weather.zone}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge className={getConditionColor(weather.condition)}>
                      {weather.condition}
                    </Badge>
                    <span className="text-muted-foreground">
                      {weather.waveHeight}m | {weather.windSpeed}kt
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fuel Prices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Preços de Combustível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_FUEL_PRICES.map((fuel, i) => (
                <div key={i} className={cn(
                  "flex items-center justify-between p-2 rounded-lg border",
                  fuel.bestPrice && "border-emerald-500/50 bg-emerald-500/5"
                )}>
                  <div className="flex items-center gap-2">
                    <Anchor className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{fuel.port}</span>
                    {fuel.bestPrice && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500">
                        Melhor
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>HFO: ${fuel.hfo}</span>
                    <span>LSFO: ${fuel.lsfo}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routes List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Opções de Rota
            </CardTitle>
            <CardDescription>
              Clique em uma rota para ver detalhes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routes.map((route, index) => (
                <div
                  key={route.id}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all",
                    selectedRoute?.id === route.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50",
                    index === 0 && "border-emerald-500/50"
                  )}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Badge className="bg-emerald-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Recomendada
                        </Badge>
                      )}
                      <span className="font-semibold">{route.name}</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">{route.score}%</span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <Route className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="font-medium">{route.distance} nm</p>
                      <p className="text-xs text-muted-foreground">Distância</p>
                    </div>
                    <div className="text-center">
                      <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="font-medium">{Math.round(route.duration / 24)}d {route.duration % 24}h</p>
                      <p className="text-xs text-muted-foreground">Duração</p>
                    </div>
                    <div className="text-center">
                      <DollarSign className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                      <p className="font-medium">${(route.fuelCost / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-muted-foreground">Combustível</p>
                    </div>
                    <div className="text-center">
                      <AlertTriangle className={cn(
                        "h-4 w-4 mx-auto mb-1",
                        route.riskScore < 20 ? "text-emerald-500" :
                        route.riskScore < 30 ? "text-amber-500" :
                        "text-destructive"
                      )} />
                      <p className="font-medium">{route.riskScore}%</p>
                      <p className="text-xs text-muted-foreground">Risco</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-3">
                    {route.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Route Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-500" />
              Detalhes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRoute ? (
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <span className="text-4xl font-bold text-primary">{selectedRoute.score}%</span>
                  <p className="text-sm text-muted-foreground mt-1">Score da Rota</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <Fuel className="h-4 w-4 mb-1 text-amber-500" />
                    <p className="font-bold">{selectedRoute.fuelConsumption} ton</p>
                    <p className="text-xs text-muted-foreground">Consumo</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Leaf className="h-4 w-4 mb-1 text-emerald-500" />
                    <p className="font-bold">{selectedRoute.emissions} ton</p>
                    <p className="text-xs text-muted-foreground">CO₂</p>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Risco</span>
                    <span className="font-medium">{selectedRoute.riskScore}%</span>
                  </div>
                  <Progress 
                    value={selectedRoute.riskScore} 
                    className={cn(
                      "h-2",
                      selectedRoute.riskScore < 20 ? "[&>div]:bg-emerald-500" :
                      selectedRoute.riskScore < 30 ? "[&>div]:bg-amber-500" :
                      "[&>div]:bg-destructive"
                    )}
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Anchor className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Paradas de Bunker</span>
                  </div>
                  <p className="font-bold">{selectedRoute.bunkerStops} parada(s)</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Custo Total</span>
                    <span className="text-xl font-bold text-emerald-600">
                      ${selectedRoute.fuelCost.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button className="w-full">
                  <Navigation className="h-4 w-4 mr-2" />
                  Selecionar Rota
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma rota para ver detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RouteOptimizerDashboard;
