/**
 * Weather Routing Panel Component
 * Interface for calculating and visualizing weather-optimized routes
 */

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Navigation,
  Ship,
  AlertTriangle,
  Wind,
  Waves,
  MapPin,
  Route,
  RefreshCw,
  CheckCircle,
  Clock,
  Fuel,
  Shield,
  CloudRain,
  Anchor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWeatherRouting } from "@/hooks/useWeatherRouting";
import { AlternativeRoute, Waypoint } from "@/lib/routing/weather-routing";
import { WeatherRoutingMap } from "./WeatherRoutingMap";

interface WeatherRoutingPanelProps {
  className?: string;
  onRouteSelected?: (route: AlternativeRoute) => void;
  showMap?: boolean;
}

// Common port coordinates
const PORTS: Record<string, { lat: number; lon: number }> = {
  "Santos, Brasil": { lat: -23.96, lon: -46.33 },
  "Rotterdam, Holanda": { lat: 51.92, lon: 4.48 },
  "Singapore": { lat: 1.26, lon: 103.82 },
  "Houston, EUA": { lat: 29.76, lon: -95.37 },
  "Shanghai, China": { lat: 31.23, lon: 121.47 },
  "Fujairah, EAU": { lat: 25.13, lon: 56.33 },
  "Gibraltar": { lat: 36.14, lon: -5.35 },
  "Cape Town, África do Sul": { lat: -33.92, lon: 18.42 },
};

export function WeatherRoutingPanel({
  className,
  onRouteSelected,
  showMap = true,
}: WeatherRoutingPanelProps) {
  const [origin, setOrigin] = useState("Santos, Brasil");
  const [destination, setDestination] = useState("Rotterdam, Holanda");
  const [vesselSpeed, setVesselSpeed] = useState(14);
  const [maxWindSpeed, setMaxWindSpeed] = useState(35);
  const [maxWaveHeight, setMaxWaveHeight] = useState(4);
  const [avoidPiracy, setAvoidPiracy] = useState(true);

  const {
    result,
    isCalculating,
    calculateRoute,
    selectRoute,
    selectedRoute,
  } = useWeatherRouting();

  const handleCalculate = async () => {
    const originCoords = PORTS[origin] || { lat: -23.96, lon: -46.33 };
    const destCoords = PORTS[destination] || { lat: 51.92, lon: 4.48 };

    const originWaypoint: Waypoint = {
      ...originCoords,
      name: origin,
    };

    const destWaypoint: Waypoint = {
      ...destCoords,
      name: destination,
    };

    await calculateRoute({
      origin: originWaypoint,
      destination: destWaypoint,
      vesselSpeed,
      departureTime: new Date(),
      avoidanceSettings: {
        maxWindSpeed,
        maxWaveHeight,
        avoidPiracyZones: avoidPiracy,
      },
    });
  };

  const handleSelectRoute = (route: AlternativeRoute) => {
    selectRoute(route);
    onRouteSelected?.(route);
  };

  const getRiskColor = (score: number) => {
    if (score >= 60) return "text-destructive bg-destructive/10";
    if (score >= 40) return "text-orange-500 bg-orange-500/10";
    if (score >= 20) return "text-amber-500 bg-amber-500/10";
    return "text-emerald-500 bg-emerald-500/10";
  };

  const getRouteTypeIcon = (type: string) => {
    switch (type) {
      case "direct":
        return <Route className="h-4 w-4" />;
      case "weather_avoidance":
        return <CloudRain className="h-4 w-4" />;
      case "fuel_optimized":
        return <Fuel className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Weather Routing
          </CardTitle>
          <CardDescription>
            Cálculo de rotas otimizadas com base em previsão meteorológica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Origin/Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Porto de Origem</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="pl-9"
                  list="ports"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Porto de Destino</Label>
              <div className="relative">
                <Anchor className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-9"
                  list="ports"
                />
              </div>
            </div>
            <datalist id="ports">
              {Object.keys(PORTS).map((port) => (
                <option key={port} value={port} />
              ))}
            </datalist>
          </div>

          {/* Vessel Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Velocidade da Embarcação</Label>
              <span className="text-sm font-medium">{vesselSpeed} nós</span>
            </div>
            <Slider
              value={[vesselSpeed]}
              onValueChange={([v]) => setVesselSpeed(v)}
              min={8}
              max={25}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Avoidance Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  Vento Máximo
                </Label>
                <span className="text-sm font-medium">{maxWindSpeed} nós</span>
              </div>
              <Slider
                value={[maxWindSpeed]}
                onValueChange={([v]) => setMaxWindSpeed(v)}
                min={20}
                max={50}
                step={5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1">
                  <Waves className="h-3 w-3" />
                  Ondas Máximas
                </Label>
                <span className="text-sm font-medium">{maxWaveHeight} m</span>
              </div>
              <Slider
                value={[maxWaveHeight]}
                onValueChange={([v]) => setMaxWaveHeight(v)}
                min={2}
                max={8}
                step={0.5}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <Label htmlFor="piracy" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500" />
                Evitar Zonas de Pirataria
              </Label>
              <Switch
                id="piracy"
                checked={avoidPiracy}
                onCheckedChange={setAvoidPiracy}
              />
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Route className="h-4 w-4 mr-2" />
                Calcular Rotas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {isCalculating && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {result && !isCalculating && (
        <>
          {/* Route Map */}
          {showMap && (
            <WeatherRoutingMap
              routes={[result.recommendedRoute, ...result.alternatives]}
              hazardZones={result.hazardZones}
              selectedRouteId={selectedRoute?.id}
              onRouteSelect={handleSelectRoute}
            />
          )}

          {/* Hazard Zones Alert */}
          {result.hazardZones.length > 0 && (
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-600">
                      {result.hazardZones.length} Zona(s) de Risco Identificada(s)
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.hazardZones.map((zone) => (
                        <Badge
                          key={zone.id}
                          variant="outline"
                          className={cn(
                            zone.type === "piracy"
                              ? "border-red-500 text-red-600"
                              : "border-amber-500 text-amber-600"
                          )}
                        >
                          {zone.type === "piracy" ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : (
                            <CloudRain className="h-3 w-3 mr-1" />
                          )}
                          {zone.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5" />
                Rotas Disponíveis
              </CardTitle>
              <CardDescription>
                Selecione a rota mais adequada para sua navegação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[result.recommendedRoute, ...result.alternatives].map(
                  (route, index) => (
                    <div
                      key={route.id}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-all",
                        selectedRoute?.id === route.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "hover:border-primary/50",
                        index === 0 && "border-emerald-500/50"
                      )}
                      onClick={() => handleSelectRoute(route)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Badge className="bg-emerald-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Recomendada
                            </Badge>
                          )}
                          <span className="font-semibold flex items-center gap-2">
                            {getRouteTypeIcon(route.type)}
                            {route.name}
                          </span>
                        </div>
                        <Badge className={getRiskColor(route.riskScore)}>
                          Risco: {route.riskScore.toFixed(0)}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <Route className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="font-medium">{route.totalDistance.toFixed(0)} nm</p>
                          <p className="text-xs text-muted-foreground">Distância</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                          <p className="font-medium">
                            {Math.floor(route.totalDuration / 24)}d {Math.round(route.totalDuration % 24)}h
                          </p>
                          <p className="text-xs text-muted-foreground">Duração</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <Fuel className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                          <p className="font-medium">{route.fuelEstimate.toFixed(1)} ton</p>
                          <p className="text-xs text-muted-foreground">Combustível</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <Navigation className="h-4 w-4 mx-auto mb-1 text-primary" />
                          <p className="font-medium">
                            {route.eta.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">ETA</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {route.recommendation}
                      </p>

                      {route.weatherRisks.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-xs text-muted-foreground">
                            Riscos climáticos: {route.weatherRisks.length}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Weather Forecast Preview */}
          {result.weatherForecast.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CloudRain className="h-4 w-4" />
                  Previsão na Rota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {result.weatherForecast.slice(0, 6).map((wp, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-lg border text-center",
                        getRiskColor(wp.riskScore)
                      )}
                    >
                      <p className="text-xs font-medium mb-1">
                        {wp.eta.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Wind className="h-3 w-3" />
                        <span>{wp.weather.windSpeed.toFixed(0)} kt</span>
                      </div>
                      {wp.weather.waveHeight !== undefined && (
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <Waves className="h-3 w-3" />
                          <span>{wp.weather.waveHeight.toFixed(1)} m</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default WeatherRoutingPanel;
