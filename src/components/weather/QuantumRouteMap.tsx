/**
 * Quantum Route Map Component
 * Mapa interativo Mapbox para visualização de rotas otimizadas pelo Quantum Router
 */

import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "@/lib/mapbox-shim";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  RefreshCw,
  Cpu,
  Navigation,
  Fuel,
  Clock,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Anchor,
  Zap,
  Eye,
  EyeOff,
  Layers
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { OptimizedRoute, RouteWaypoint, RiskZone } from "@/lib/optimization/quantum-router";
import { RouteExportButtons } from "@/components/optimization/RouteExportButtons";

// Sample ports for demo
const samplePorts: RouteWaypoint[] = [
  { id: "santos", name: "Porto de Santos", lat: -23.9618, lng: -46.3322, type: "origin" },
  { id: "rotterdam", name: "Porto de Rotterdam", lat: 51.9225, lng: 4.4792, type: "destination" },
  { id: "capetown", name: "Cidade do Cabo", lat: -33.9249, lng: 18.4241, type: "port", fuelPrice: 680 },
  { id: "dakar", name: "Dakar", lat: 14.6928, lng: -17.4467, type: "port", fuelPrice: 720 },
  { id: "lisbon", name: "Lisboa", lat: 38.7223, lng: -9.1393, type: "port", fuelPrice: 750 },
  { id: "canary", name: "Ilhas Canárias", lat: 28.2916, lng: -16.6291, type: "waypoint" },
];

const riskZones: RiskZone[] = [
  { id: "gulf-of-aden", name: "Golfo de Aden", lat: 12.0, lng: 48.0, radius: 300, riskLevel: "critical", type: "piracy" },
  { id: "gulf-of-guinea", name: "Golfo da Guiné", lat: 4.0, lng: 3.0, radius: 250, riskLevel: "high", type: "piracy" },
  { id: "strait-of-hormuz", name: "Estreito de Hormuz", lat: 26.5, lng: 56.5, radius: 100, riskLevel: "high", type: "political" },
];

interface QuantumRouteMapProps {
  mapboxToken?: string;
  onRouteOptimized?: (route: OptimizedRoute) => void;
  className?: string;
}

export function QuantumRouteMap({ mapboxToken, onRouteOptimized, className }: QuantumRouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [token, setToken] = useState(mapboxToken || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [origin, setOrigin] = useState<string>("santos");
  const [destination, setDestination] = useState<string>("rotterdam");
  const [iterations, setIterations] = useState([5000]);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showWeather, setShowWeather] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Mapbox token from Supabase Edge Function
  useEffect(() => {
    const fetchToken = async () => {
      if (mapboxToken) {
        setToken(mapboxToken);
        return;
      }
      
      try {
        const { data, error } = await supabase.functions.invoke("mapbox-token");
        if (error) throw error;
        if (data?.token) {
          setToken(data.token);
        }
      } catch (err) {
        console.error("Failed to fetch Mapbox token:", err);
        setError("Token Mapbox não configurado. Adicione MAPBOX_PUBLIC_TOKEN nos secrets.");
      }
    };
    
    fetchToken();
  }, [mapboxToken]);

  // Initialize map
  useEffect(() => {
    if (!token || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [-20, 10],
      zoom: 2.5,
      pitch: 30,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    map.current.on("load", () => {
      // Add port markers
      samplePorts.forEach((port) => {
        const color = port.type === "origin" ? "#22c55e" : port.type === "destination" ? "#ef4444" : "#3b82f6";
        
        const marker = new mapboxgl.Marker({ color })
          .setLngLat([port.lng, port.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <strong>${port.name}</strong>
              ${port.fuelPrice ? `<br/>Combustível: $${port.fuelPrice}/ton` : ""}
            </div>
          `))
          .addTo(map.current!);
        
        markersRef.current.push(marker);
      });

      // Add risk zones
      if (showRiskZones) {
        addRiskZones();
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [token]);

  // Toggle risk zones
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;
    
    if (showRiskZones) {
      addRiskZones();
    } else {
      riskZones.forEach((zone) => {
        if (map.current?.getLayer(`risk-zone-${zone.id}`)) {
          map.current.removeLayer(`risk-zone-${zone.id}`);
        }
        if (map.current?.getSource(`risk-zone-${zone.id}`)) {
          map.current.removeSource(`risk-zone-${zone.id}`);
        }
      });
    }
  }, [showRiskZones]);

  const addRiskZones = () => {
    if (!map.current) return;
    
    riskZones.forEach((zone) => {
      const color = zone.riskLevel === "critical" ? "#ef4444" : zone.riskLevel === "high" ? "#f97316" : "#eab308";
      
      // Create circle for risk zone
      if (!map.current?.getSource(`risk-zone-${zone.id}`)) {
        map.current?.addSource(`risk-zone-${zone.id}`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: { name: zone.name },
            geometry: {
              type: "Point",
              coordinates: [zone.lng, zone.lat],
            },
          },
        });
      }

      if (!map.current?.getLayer(`risk-zone-${zone.id}`)) {
        map.current?.addLayer({
          id: `risk-zone-${zone.id}`,
          type: "circle",
          source: `risk-zone-${zone.id}`,
          paint: {
            "circle-radius": zone.radius / 10,
            "circle-color": color,
            "circle-opacity": 0.3,
            "circle-stroke-width": 2,
            "circle-stroke-color": color,
          },
        });
      }
    });
  };

  const runQuantumOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setError(null);

    const originPort = samplePorts.find((p) => p.id === origin)!;
    const destPort = samplePorts.find((p) => p.id === destination)!;
    const intermediatePorts = samplePorts.filter((p) => p.id !== origin && p.id !== destination);

    try {
      // Simulate QAOA optimization progress
      const progressInterval = setInterval(() => {
        setOptimizationProgress((prev) => Math.min(prev + 5, 95));
      }, 200);

      // Dynamic import to avoid SSR issues
      const { QuantumMaritimeRouter } = await import("@/lib/optimization/quantum-router");
      const router = new QuantumMaritimeRouter({ numQubits: 12, numLayers: 4 });

      // Mock weather conditions
      const weatherConditions = [
        { lat: 0, lng: -20, windSpeed: 15, waveHeight: 2.5, currentSpeed: 1.2, currentDirection: 45 },
        { lat: 10, lng: -10, windSpeed: 25, waveHeight: 4.0, currentSpeed: 0.8, currentDirection: 90 },
        { lat: 35, lng: -5, windSpeed: 12, waveHeight: 1.8, currentSpeed: 1.5, currentDirection: 180 },
      ];

      const vesselSpecs = {
        cruiseSpeed: 14,
        fuelConsumption: 45,
        maxSpeed: 18,
        cargoCapacity: 50000,
      };

      const result = await router.optimizeRoute(
        originPort,
        destPort,
        intermediatePorts,
        weatherConditions,
        riskZones,
        vesselSpecs,
        iterations[0]
      );

      clearInterval(progressInterval);
      setOptimizationProgress(100);
      setOptimizedRoute(result);
      onRouteOptimized?.(result);

      // Draw optimized route on map
      drawRoute(result.waypoints);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na otimização");
    } finally {
      setIsOptimizing(false);
    }
  };

  const drawRoute = (waypoints: RouteWaypoint[]) => {
    if (!map.current) return;

    // Remove existing route
    if (map.current.getLayer("quantum-route")) {
      map.current.removeLayer("quantum-route");
    }
    if (map.current.getSource("quantum-route")) {
      map.current.removeSource("quantum-route");
    }

    // Create route line
    const coordinates = waypoints.map((wp) => [wp.lng, wp.lat]);

    map.current.addSource("quantum-route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      },
    });

    map.current.addLayer({
      id: "quantum-route",
      type: "line",
      source: "quantum-route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#a855f7",
        "line-width": 4,
        "line-opacity": 0.8,
        "line-dasharray": [2, 1],
      },
    });

    // Fit bounds to route
    const bounds = coordinates.reduce(
      (bounds, coord) => bounds.extend(coord as [number, number]),
      new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
    );

    map.current.fitBounds(bounds, { padding: 50 });
  };

  if (error && !token) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Token Mapbox Necessário</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Map */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-purple-500" />
                  Quantum Route Optimizer
                </CardTitle>
                <CardDescription>Otimização de rotas via QAOA-inspired algorithm</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="risk-zones"
                    checked={showRiskZones}
                    onCheckedChange={setShowRiskZones}
                  />
                  <Label htmlFor="risk-zones" className="text-xs">Zonas de Risco</Label>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={mapContainer} className="h-[500px] w-full rounded-b-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Controls & Results */}
      <div className="space-y-4">
        {/* Route Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Configuração da Rota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Origem</Label>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {samplePorts.map((port) => (
                    <SelectItem key={port.id} value={port.id}>
                      {port.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Destino</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {samplePorts.map((port) => (
                    <SelectItem key={port.id} value={port.id}>
                      {port.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Iterações QAOA: {iterations[0]}</Label>
              <Slider
                value={iterations}
                onValueChange={setIterations}
                min={1000}
                max={10000}
                step={500}
              />
            </div>

            <Button
              onClick={runQuantumOptimization}
              disabled={isOptimizing || origin === destination}
              className="w-full"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Otimizando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Otimizar Rota
                </>
              )}
            </Button>

            {isOptimizing && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progresso QAOA</span>
                  <span>{optimizationProgress}%</span>
                </div>
                <Progress value={optimizationProgress} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {optimizedRoute && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Rota Otimizada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted/50 p-2 rounded text-center">
                  <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Distância</p>
                  <p className="font-bold">{optimizedRoute.totalDistance.toLocaleString()} nm</p>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Duração</p>
                  <p className="font-bold">{Math.round(optimizedRoute.totalDuration)}h</p>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <Fuel className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Combustível</p>
                  <p className="font-bold">{optimizedRoute.totalFuel.toFixed(1)} ton</p>
                </div>
                <div className="bg-muted/50 p-2 rounded text-center">
                  <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Risco</p>
                  <p className="font-bold">{optimizedRoute.riskScore}/100</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Economia Estimada</p>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Fuel className="h-3 w-3 mr-1" />
                    {optimizedRoute.savings.fuelSaved.toFixed(1)}t
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    ${optimizedRoute.savings.costSaved.toLocaleString()}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {optimizedRoute.savings.timeSaved.toFixed(1)}h
                  </Badge>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Waypoints</p>
                <ScrollArea className="h-[100px]">
                  {optimizedRoute.waypoints.map((wp, i) => (
                    <div key={wp.id} className="flex items-center gap-2 text-xs py-1">
                      <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">
                        {i + 1}
                      </span>
                      <span>{wp.name}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <div className="text-center pt-2">
                <Badge variant="outline" className="text-xs">
                  Confiança: {(optimizedRoute.confidence * 100).toFixed(0)}% | {optimizedRoute.iterations} iterações
                </Badge>
              </div>

              {/* Export Buttons */}
              <div className="pt-2 border-t">
                <RouteExportButtons 
                  route={optimizedRoute} 
                  routeName={`quantum-route-${origin}-${destination}`}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Zones Legend */}
        {showRiskZones && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Layers className="h-3 w-3" />
                Zonas de Risco
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {riskZones.map((zone) => (
                <div key={zone.id} className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      zone.riskLevel === "critical" ? "bg-red-500" : zone.riskLevel === "high" ? "bg-orange-500" : "bg-yellow-500"
                    }`}
                  />
                  <span className="flex-1">{zone.name}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {zone.riskLevel}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default QuantumRouteMap;
