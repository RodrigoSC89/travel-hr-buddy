/**
 * Route Optimizer Dashboard - PATCH 1001
 * Visual interface for AI-powered route optimization with real API integration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Leaf,
  Cloud,
  Thermometer,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouteWeatherFuel } from '@/hooks/useRouteWeatherFuel';
import { useToast } from '@/hooks/use-toast';

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

// Port coordinates for route calculation
const PORT_COORDS: Record<string, { lat: number; lon: number }> = {
  'Santos, Brazil': { lat: -23.9608, lon: -46.3336 },
  'Rotterdam, Netherlands': { lat: 51.9225, lon: 4.4792 },
  'Singapore': { lat: 1.2644, lon: 103.8222 },
  'Houston, USA': { lat: 29.7604, lon: -95.3698 },
  'Shanghai, China': { lat: 31.2304, lon: 121.4737 },
  'Fujairah, UAE': { lat: 25.1288, lon: 56.3264 },
  'Gibraltar': { lat: 36.1408, lon: -5.3536 },
};

export function RouteOptimizerDashboard() {
  const [departurePort, setDeparturePort] = useState('Santos, Brazil');
  const [arrivalPort, setArrivalPort] = useState('Rotterdam, Netherlands');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  
  const { weather, fuelPrices, bestBunkerPort, hazards, loading, error, source, fetchRouteData } = useRouteWeatherFuel();
  const { toast } = useToast();

  // Load initial data on mount
  useEffect(() => {
    const departure = PORT_COORDS[departurePort] || { lat: -23.96, lon: -46.33 };
    const arrival = PORT_COORDS[arrivalPort] || { lat: 51.92, lon: 4.48 };
    
    fetchRouteData([
      { ...departure, name: departurePort },
      { lat: 36.14, lon: -5.35, name: 'Gibraltar' },
      { lat: 45.0, lon: -5.0, name: 'Bay of Biscay' },
      { ...arrival, name: arrivalPort },
    ]);
  }, []);

  const handleOptimize = async () => {
    setOptimizing(true);
    
    const departure = PORT_COORDS[departurePort] || { lat: -23.96, lon: -46.33 };
    const arrival = PORT_COORDS[arrivalPort] || { lat: 51.92, lon: 4.48 };
    
    // Fetch real weather and fuel data
    await fetchRouteData([
      { ...departure, name: departurePort },
      { lat: 36.14, lon: -5.35, name: 'Gibraltar' },
      { lat: 45.0, lon: -5.0, name: 'Bay of Biscay' },
      { ...arrival, name: arrivalPort },
    ]);

    // Calculate routes based on weather conditions
    const baseDistance = 2850;
    const hasRoughWeather = weather.some(w => w.maritimeCondition === 'danger' || w.maritimeCondition === 'warning');
    const avgFuelPrice = fuelPrices.length > 0 
      ? fuelPrices.reduce((sum, p) => sum + p.lsfo, 0) / fuelPrices.length 
      : 680;

    const calculatedRoutes: RouteOption[] = [
      {
        id: '1',
        name: 'Rota Otimizada',
        distance: baseDistance + (hasRoughWeather ? 150 : 0),
        duration: 168 + (hasRoughWeather ? 12 : 0),
        fuelCost: Math.round((85 * avgFuelPrice)),
        fuelConsumption: 85,
        riskScore: hasRoughWeather ? 25 : 15,
        emissions: 265,
        score: hasRoughWeather ? 85 : 92,
        description: hasRoughWeather 
          ? 'Desvio de área de mau tempo, equilibrando segurança e eficiência'
          : 'Melhor equilíbrio entre custo, tempo e segurança',
        bunkerStops: bestBunkerPort ? 1 : 0,
      },
      {
        id: '2',
        name: 'Rota Econômica',
        distance: baseDistance + 250,
        duration: 192,
        fuelCost: Math.round((72 * (bestBunkerPort?.lsfo || avgFuelPrice * 0.9))),
        fuelConsumption: 72,
        riskScore: hasRoughWeather ? 30 : 22,
        emissions: 225,
        score: 85,
        description: `Reabastecimento em ${bestBunkerPort?.port || 'melhor porto'} para menor custo`,
        bunkerStops: 2,
      },
      {
        id: '3',
        name: 'Rota Direta',
        distance: baseDistance - 200,
        duration: 144,
        fuelCost: Math.round((98 * avgFuelPrice)),
        fuelConsumption: 98,
        riskScore: hasRoughWeather ? 55 : 35,
        emissions: 305,
        score: hasRoughWeather ? 60 : 78,
        description: hasRoughWeather
          ? 'ATENÇÃO: Passa por área de mau tempo - risco elevado'
          : 'Caminho mais curto, maior consumo e risco',
        bunkerStops: 0,
      },
    ];

    setRoutes(calculatedRoutes);
    setSelectedRoute(calculatedRoutes[0]);
    setOptimizing(false);

    toast({
      title: 'Rotas Calculadas',
      description: `${calculatedRoutes.length} opções com dados ${source === 'openweathermap' ? 'reais' : 'simulados'}`,
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'safe': return 'text-emerald-500 bg-emerald-500/10';
      case 'caution': return 'text-amber-500 bg-amber-500/10';
      case 'warning': return 'text-orange-500 bg-orange-500/10';
      case 'danger': return 'text-destructive bg-destructive/10';
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Wind className="h-4 w-4" />
                Condições Meteorológicas
              </CardTitle>
              {source && (
                <Badge variant="outline" className="text-xs">
                  {source === 'openweathermap' ? (
                    <><Cloud className="h-3 w-3 mr-1" /> API Real</>
                  ) : (
                    <><Zap className="h-3 w-3 mr-1" /> Simulado</>
                  )}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weather.length > 0 ? weather.map((w, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Waves className={cn("h-4 w-4", getConditionColor(w.maritimeCondition))} />
                    <span className="font-medium">{w.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge className={getConditionColor(w.maritimeCondition)}>
                      {w.maritimeCondition}
                    </Badge>
                    <span className="text-muted-foreground">
                      {w.waveHeight?.toFixed(1) || '?'}m | {w.windSpeed?.toFixed(0) || '?'}kt
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Thermometer className="h-3 w-3" />
                      {w.temperature?.toFixed(0) || '?'}°C
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-4">
                  Clique em "Calcular Rotas" para obter dados meteorológicos
                </div>
              )}
              {hazards.length > 0 && (
                <div className="pt-2 border-t mt-2">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                    <Shield className="h-3 w-3" /> Alertas de Zona
                  </span>
                  {hazards.map((h, i) => (
                    <Badge key={i} variant="destructive" className="mr-1 mb-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {h.name} ({h.risk})
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fuel Prices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Preços de Combustível (LSFO)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fuelPrices.length > 0 ? fuelPrices.slice(0, 5).map((fuel, i) => (
                <div key={i} className={cn(
                  "flex items-center justify-between p-2 rounded-lg border",
                  bestBunkerPort?.port === fuel.port && "border-emerald-500/50 bg-emerald-500/5"
                )}>
                  <div className="flex items-center gap-2">
                    <Anchor className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{fuel.port}</span>
                    {bestBunkerPort?.port === fuel.port && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-500">
                        Melhor
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>HFO: ${fuel.hfo.toFixed(0)}</span>
                    <span className="font-medium">LSFO: ${fuel.lsfo.toFixed(0)}</span>
                    <span>MGO: ${fuel.mgo.toFixed(0)}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-4">
                  Clique em "Calcular Rotas" para obter preços de bunker
                </div>
              )}
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
