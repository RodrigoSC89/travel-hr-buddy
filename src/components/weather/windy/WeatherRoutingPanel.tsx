/**
 * Weather Routing Panel Component
 * Maritime route optimization considering weather, waves, and currents
 * PATCH WINDY-2.5: Fixed mapbox-gl async loading
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Navigation, Anchor, Fuel, Clock, AlertTriangle, 
  Loader2, MapPin, Ship, Waves,
  Wind, Zap, CheckCircle, Download, Map, FileText,
  TrendingDown, Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getMapboxGLAsync, type MapboxGL } from "@/lib/mapbox-shim";
import type { 
  OptimizedRoute, 
  RouteWaypoint, 
  WeatherCondition, 
  RiskZone,
  VesselSpecs
} from "@/lib/optimization/quantum-router";

interface WeatherRoutingPanelProps {
  className?: string;
}

// Sample ports
const PORTS: RouteWaypoint[] = [
  { id: "santos", name: "Porto de Santos", lat: -23.9618, lng: -46.3322, type: "origin", fuelPrice: 620 },
  { id: "rio", name: "Porto do Rio", lat: -22.8903, lng: -43.1729, type: "port", fuelPrice: 640 },
  { id: "vitoria", name: "Porto de Vitória", lat: -20.3155, lng: -40.3128, type: "port", fuelPrice: 650 },
  { id: "salvador", name: "Porto de Salvador", lat: -12.9714, lng: -38.5014, type: "port", fuelPrice: 680 },
  { id: "recife", name: "Porto de Recife", lat: -8.0476, lng: -34.8770, type: "destination", fuelPrice: 700 },
  { id: "fortaleza", name: "Porto de Fortaleza", lat: -3.7319, lng: -38.5267, type: "port", fuelPrice: 720 },
  { id: "rotterdam", name: "Porto de Rotterdam", lat: 51.9225, lng: 4.4792, type: "destination", fuelPrice: 580 },
  { id: "hamburg", name: "Porto de Hamburgo", lat: 53.5488, lng: 9.9872, type: "destination", fuelPrice: 590 },
  { id: "lisbon", name: "Porto de Lisboa", lat: 38.7223, lng: -9.1393, type: "port", fuelPrice: 610 },
];

// Sample risk zones
const RISK_ZONES: RiskZone[] = [
  { id: "gulf-of-guinea", name: "Golfo da Guiné", lat: 4.0, lng: 3.0, radius: 250, riskLevel: "high", type: "piracy" },
  { id: "cape-verde-storm", name: "Região de Cabo Verde", lat: 16.0, lng: -24.0, radius: 150, riskLevel: "medium", type: "weather" },
  { id: "azores-high", name: "Alto dos Açores", lat: 38.0, lng: -28.0, radius: 200, riskLevel: "low", type: "weather" },
];

export const WeatherRoutingPanel: React.FC<WeatherRoutingPanelProps> = ({
  className
}) => {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const mapboxglRef = useRef<MapboxGL | null>(null);
  
  const [origin, setOrigin] = useState<string>("santos");
  const [destination, setDestination] = useState<string>("rotterdam");
  const [vesselSpeed, setVesselSpeed] = useState<number>(14);
  const [avoidPiracy, setAvoidPiracy] = useState<boolean>(true);
  const [maxWaveHeight, setMaxWaveHeight] = useState<number>(4);
  const [maxWindSpeed, setMaxWindSpeed] = useState<number>(40);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('mapbox-token');
        if (error) {
          const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
          if (envToken) setMapboxToken(envToken);
        } else if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error('Failed to get Mapbox token:', err);
      }
    };
    fetchToken();
  }, []);

  // Initialize map asynchronously
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapRef.current) return;

    const initMap = async () => {
      try {
        const mapboxgl = await getMapboxGLAsync();
        mapboxglRef.current = mapboxgl;
        
        // Check if Map constructor is valid
        if (!mapboxgl.Map || typeof mapboxgl.Map !== 'function') {
          setMapError('Mapbox não disponível');
          return;
        }

        mapboxgl.accessToken = mapboxToken;
        const newMap = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/navigation-night-v1',
          center: [-30, 10],
          zoom: 2.5,
        });

        mapRef.current = newMap;
        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

        newMap.on('load', () => {
          setMapLoaded(true);
        
          PORTS.forEach(port => {
            const el = document.createElement('div');
            el.className = 'port-marker';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = port.type === 'origin' ? '#10b981' : 
                                       port.type === 'destination' ? '#ef4444' : '#3b82f6';
            el.style.border = '2px solid white';
            el.style.cursor = 'pointer';

            new mapboxgl.Marker(el)
              .setLngLat([port.lng, port.lat])
              .setPopup(new mapboxgl.Popup().setHTML(`<strong>${port.name}</strong><br/>Combustível: $${port.fuelPrice}/ton`))
              .addTo(newMap);
          });

          RISK_ZONES.forEach(zone => {
            const color = zone.riskLevel === 'high' ? '#ef4444' :
                         zone.riskLevel === 'medium' ? '#f59e0b' : '#3b82f6';
            
            newMap.addSource(`zone-${zone.id}`, {
              type: 'geojson',
              data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [zone.lng, zone.lat] } }
            });

            newMap.addLayer({
              id: `zone-${zone.id}`,
              type: 'circle',
              source: `zone-${zone.id}`,
              paint: { 'circle-radius': zone.radius / 10, 'circle-color': color, 'circle-opacity': 0.2, 'circle-stroke-width': 2, 'circle-stroke-color': color, 'circle-stroke-opacity': 0.5 }
            });
          });
        });
      } catch (error) {
        console.error('[WeatherRoutingPanel] Failed to initialize map:', error);
        setMapError('Erro ao inicializar mapa');
      }
    };

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  // Draw optimized route on map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !optimizedRoute || !mapboxglRef.current) return;

    // Remove existing route layer
    if (mapRef.current.getLayer('route')) {
      mapRef.current.removeLayer('route');
      mapRef.current.removeSource('route');
    }

    const coordinates = optimizedRoute.waypoints.map(wp => [wp.lng, wp.lat]);

    mapRef.current.addSource('route', {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }
    });

    mapRef.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#10b981', 'line-width': 4, 'line-dasharray': [2, 1] }
    });

    const bounds = new mapboxglRef.current.LngLatBounds();
    coordinates.forEach(coord => bounds.extend(coord as [number, number]));
    mapRef.current.fitBounds(bounds, { padding: 50 });
  }, [optimizedRoute, mapLoaded]);

  // Run optimization
  const runOptimization = useCallback(async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setOptimizedRoute(null);

    const originPort = PORTS.find(p => p.id === origin);
    const destPort = PORTS.find(p => p.id === destination);

    if (!originPort || !destPort) {
      toast({
        title: "Erro",
        description: "Selecione origem e destino válidos",
        variant: "destructive"
      });
      setIsOptimizing(false);
      return;
    }

    try {
      // Import quantum router dynamically
      const { QuantumMaritimeRouter } = await import("@/lib/optimization/quantum-router");
      const router = new QuantumMaritimeRouter({
        numQubits: 12,
        numLayers: 4,
        initialTemp: 100,
        coolingRate: 0.995,
      });

      // Generate weather conditions (would come from API in production)
      const weatherConditions: WeatherCondition[] = [
        { lat: -15, lng: -30, windSpeed: 25, waveHeight: 2.5, currentSpeed: 1.2, currentDirection: 45 },
        { lat: 0, lng: -20, windSpeed: 15, waveHeight: 1.5, currentSpeed: 0.8, currentDirection: 90 },
        { lat: 15, lng: -25, windSpeed: 30, waveHeight: 3.0, currentSpeed: 1.5, currentDirection: 180 },
        { lat: 30, lng: -15, windSpeed: 20, waveHeight: 2.0, currentSpeed: 1.0, currentDirection: 270 },
        { lat: 45, lng: 0, windSpeed: 35, waveHeight: 3.5, currentSpeed: 1.8, currentDirection: 45 },
      ];

      // Filter risk zones based on settings
      const activeRiskZones = avoidPiracy 
        ? RISK_ZONES 
        : RISK_ZONES.filter(z => z.type !== 'piracy');

      const vesselSpecs: VesselSpecs = {
        cruiseSpeed: vesselSpeed,
        maxSpeed: vesselSpeed + 4,
        fuelConsumption: 30 + (vesselSpeed - 10) * 2,
        cargoCapacity: 50000,
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setOptimizationProgress(prev => Math.min(prev + Math.random() * 15, 95));
      }, 200);

      const availablePorts = PORTS.filter(p => 
        p.id !== origin && p.id !== destination && p.type === 'port'
      );

      const result = await router.optimizeRoute(
        originPort,
        destPort,
        availablePorts,
        weatherConditions,
        activeRiskZones,
        vesselSpecs,
        3000
      );

      clearInterval(progressInterval);
      setOptimizationProgress(100);
      setOptimizedRoute(result);

      toast({
        title: "Rota otimizada!",
        description: `Confiança: ${(result.confidence * 100).toFixed(0)}% | Economia: $${result.savings.costSaved.toFixed(0)}`,
      });
    } catch (error) {
      console.error('Optimization failed:', error);
      toast({
        title: "Erro na otimização",
        description: "Falha ao calcular rota otimizada",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  }, [origin, destination, vesselSpeed, avoidPiracy, toast]);

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-4", className)}>
      {/* Configuration Panel */}
      <Card className="bg-slate-900/80 border-white/10 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Navigation className="h-5 w-5 text-primary" />
            Weather Routing
          </CardTitle>
          <CardDescription className="text-white/50">
            Otimização de rotas considerando clima, ondas e correntes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Origin */}
          <div className="space-y-2">
            <Label className="text-white/70">Porto de Origem</Label>
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PORTS.map(port => (
                  <SelectItem key={port.id} value={port.id}>
                    <div className="flex items-center gap-2">
                      <Anchor className="h-4 w-4" />
                      {port.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label className="text-white/70">Porto de Destino</Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PORTS.filter(p => p.id !== origin).map(port => (
                  <SelectItem key={port.id} value={port.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {port.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vessel Speed */}
          <div className="space-y-2">
            <Label className="text-white/70 flex items-center justify-between">
              <span>Velocidade de Cruzeiro</span>
              <span className="text-primary">{vesselSpeed} nós</span>
            </Label>
            <Slider
              value={[vesselSpeed]}
              onValueChange={([v]) => setVesselSpeed(v)}
              min={8}
              max={20}
              step={0.5}
              className="py-2"
            />
          </div>

          {/* Max Wave Height */}
          <div className="space-y-2">
            <Label className="text-white/70 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Waves className="h-3 w-3" />
                Ondas Máximas
              </span>
              <span className="text-cyan-400">{maxWaveHeight}m</span>
            </Label>
            <Slider
              value={[maxWaveHeight]}
              onValueChange={([v]) => setMaxWaveHeight(v)}
              min={1}
              max={8}
              step={0.5}
              className="py-2"
            />
          </div>

          {/* Max Wind Speed */}
          <div className="space-y-2">
            <Label className="text-white/70 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Wind className="h-3 w-3" />
                Vento Máximo
              </span>
              <span className="text-blue-400">{maxWindSpeed} kt</span>
            </Label>
            <Slider
              value={[maxWindSpeed]}
              onValueChange={([v]) => setMaxWindSpeed(v)}
              min={15}
              max={60}
              step={5}
              className="py-2"
            />
          </div>

          {/* Avoid Piracy */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-white/70 flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-400" />
              Evitar Zonas de Pirataria
            </Label>
            <Switch
              checked={avoidPiracy}
              onCheckedChange={setAvoidPiracy}
            />
          </div>

          {/* Optimize Button */}
          <Button
            onClick={runOptimization}
            disabled={isOptimizing || origin === destination}
            className="w-full bg-primary hover:bg-primary/80"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Otimizando... {optimizationProgress.toFixed(0)}%
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Calcular Rota Otimizada
              </>
            )}
          </Button>

          {isOptimizing && (
            <Progress value={optimizationProgress} className="h-2" />
          )}
        </CardContent>
      </Card>

      {/* Map and Results */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Map */}
        <Card className="bg-slate-900/80 border-white/10 overflow-hidden relative min-h-[400px]">
          <div 
            ref={mapContainer} 
            className="absolute inset-0"
          />
          {!mapboxToken && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <div className="text-center">
                <Map className="h-12 w-12 text-white/30 mx-auto mb-2" />
                <p className="text-white/50">Mapa não disponível</p>
                <p className="text-white/30 text-sm">Configure MAPBOX_TOKEN</p>
              </div>
            </div>
          )}
        </Card>

        {/* Results */}
        {optimizedRoute && (
          <Card className="bg-slate-900/80 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Rota Otimizada
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    optimizedRoute.confidence >= 0.9 && "text-green-400 border-green-400/50",
                    optimizedRoute.confidence >= 0.7 && optimizedRoute.confidence < 0.9 && "text-yellow-400 border-yellow-400/50",
                    optimizedRoute.confidence < 0.7 && "text-orange-400 border-orange-400/50"
                  )}
                >
                  Confiança: {(optimizedRoute.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Navigation className="h-3 w-3" />
                    Distância
                  </div>
                  <p className="text-white font-bold">{optimizedRoute.totalDistance.toFixed(0)} nm</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Clock className="h-3 w-3" />
                    Duração
                  </div>
                  <p className="text-white font-bold">{(optimizedRoute.totalDuration / 24).toFixed(1)} dias</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Fuel className="h-3 w-3" />
                    Combustível
                  </div>
                  <p className="text-white font-bold">{optimizedRoute.totalFuel.toFixed(0)} ton</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    Risco
                  </div>
                  <p className={cn(
                    "font-bold",
                    optimizedRoute.riskScore <= 20 && "text-green-400",
                    optimizedRoute.riskScore > 20 && optimizedRoute.riskScore <= 50 && "text-yellow-400",
                    optimizedRoute.riskScore > 50 && "text-red-400"
                  )}>
                    {optimizedRoute.riskScore.toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Savings */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 font-medium">Economia estimada</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-green-400 font-bold">${optimizedRoute.savings.costSaved.toFixed(0)}</p>
                    <p className="text-xs text-green-400/70">Custo</p>
                  </div>
                  <div>
                    <p className="text-green-400 font-bold">{optimizedRoute.savings.fuelSaved.toFixed(1)} ton</p>
                    <p className="text-xs text-green-400/70">Combustível</p>
                  </div>
                  <div>
                    <p className="text-green-400 font-bold">{optimizedRoute.savings.timeSaved.toFixed(1)}h</p>
                    <p className="text-xs text-green-400/70">Tempo</p>
                  </div>
                </div>
              </div>

              {/* Waypoints */}
              <div className="space-y-2">
                <p className="text-white/50 text-sm">Waypoints da rota:</p>
                <div className="flex flex-wrap gap-2">
                  {optimizedRoute.waypoints.map((wp, i) => (
                    <Badge
                      key={wp.id}
                      variant="outline"
                      className={cn(
                        "text-xs",
                        i === 0 && "bg-green-500/20 text-green-400 border-green-500/50",
                        i === optimizedRoute.waypoints.length - 1 && "bg-red-500/20 text-red-400 border-red-500/50",
                        i > 0 && i < optimizedRoute.waypoints.length - 1 && "bg-blue-500/20 text-blue-400 border-blue-500/50"
                      )}
                    >
                      {i + 1}. {wp.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    toast({ title: "Exportando PDF..." });
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => {
                    toast({ title: "Exportando GPX..." });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar GPX
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WeatherRoutingPanel;
