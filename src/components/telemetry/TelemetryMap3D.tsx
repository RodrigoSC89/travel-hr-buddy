/**
 * TelemetryMap3D - Mapa 3D Revolucionário com Telemetria em Tempo Real
 * PATCH 860 - Integração Mapbox + Dados de Sensores + IA
 */

import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "@/lib/mapbox-shim";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Globe,
  Layers,
  Ship,
  AlertTriangle,
  Radio,
  Thermometer,
  Gauge,
  Radar,
  Navigation,
  RefreshCw,
  Maximize2,
  Play,
  Pause,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Mapbox token from environment with fallback
const safeEnv = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}) as Record<string, string | undefined>;
const MAPBOX_TOKEN = safeEnv.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2x0OHFqMjVvMDVvYTJrcXRqNXkxNmF5NiJ9.XkO2Cc9_HKIbM9azT9Ifjw";

type MapStyle = "dark" | "satellite" | "navigation" | "ocean";

const MAP_STYLES: Record<MapStyle, string> = {
  dark: "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  navigation: "mapbox://styles/mapbox/navigation-night-v1",
  ocean: "mapbox://styles/mapbox/outdoors-v12",
};

export interface VesselTelemetry {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "active" | "idle" | "maintenance" | "alert" | "emergency";
  speed: number;
  heading: number;
  fuelLevel: number;
  engineTemp: number;
  hullStress: number;
  lastUpdate: string;
  crewCount: number;
  destination?: string;
  eta?: string;
  sensors: SensorReading[];
}

export interface SensorReading {
  id: string;
  type: "temperature" | "pressure" | "vibration" | "fuel" | "gps" | "radar";
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  trend: "up" | "down" | "stable";
}

export interface TelemetryAlert {
  id: string;
  vesselId: string;
  vesselName: string;
  type: "critical" | "warning" | "info";
  message: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface TelemetryMap3DProps {
  onVesselSelect?: (vessel: VesselTelemetry) => void;
  onAlertClick?: (alert: TelemetryAlert) => void;
  className?: string;
}

export function TelemetryMap3D({ onVesselSelect, onAlertClick, className }: TelemetryMap3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const animationRef = useRef<number | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>("dark");
  const [vessels, setVessels] = useState<VesselTelemetry[]>([]);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselTelemetry | null>(null);
  const [showVessels, setShowVessels] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(true);
  const [pitch, setPitch] = useState(45);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate realistic mock telemetry data
  const generateMockTelemetry = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("vessels")
        .select("id, name, status, vessel_type")
        .limit(15);

      if (data) {
        const telemetryData: VesselTelemetry[] = data.map((v, idx) => {
          const baseLatitude = -23 + Math.sin(idx * 0.5) * 15;
          const baseLongitude = -46 + Math.cos(idx * 0.7) * 25;
          
          return {
            id: v.id,
            name: v.name,
            latitude: baseLatitude + (Math.random() - 0.5) * 2,
            longitude: baseLongitude + (Math.random() - 0.5) * 2,
            status: (["active", "active", "active", "idle", "maintenance", "alert"][Math.floor(Math.random() * 6)] as VesselTelemetry["status"]) || "active",
            speed: 8 + Math.random() * 14,
            heading: Math.random() * 360,
            fuelLevel: 40 + Math.random() * 55,
            engineTemp: 75 + Math.random() * 20,
            hullStress: 10 + Math.random() * 30,
            lastUpdate: new Date().toISOString(),
            crewCount: 10 + Math.floor(Math.random() * 25),
            destination: ["Porto de Santos", "Rio de Janeiro", "Salvador", "Recife", "Manaus"][Math.floor(Math.random() * 5)],
            eta: new Date(Date.now() + Math.random() * 86400000 * 5).toISOString(),
            sensors: [
              { id: `temp-${v.id}`, type: "temperature", value: 75 + Math.random() * 20, unit: "°C", status: "normal", trend: "stable" },
              { id: `press-${v.id}`, type: "pressure", value: 1.0 + Math.random() * 0.3, unit: "bar", status: "normal", trend: "up" },
              { id: `vib-${v.id}`, type: "vibration", value: Math.random() * 5, unit: "mm/s", status: Math.random() > 0.8 ? "warning" : "normal", trend: "stable" },
              { id: `fuel-${v.id}`, type: "fuel", value: 40 + Math.random() * 55, unit: "%", status: Math.random() > 0.9 ? "warning" : "normal", trend: "down" },
            ]
          };
        });

        setVessels(telemetryData);
        
        // Generate alerts for vessels with issues
        const newAlerts: TelemetryAlert[] = telemetryData
          .filter(v => v.status === "alert" || v.status === "emergency")
          .map(v => ({
            id: `alert-${v.id}`,
            vesselId: v.id,
            vesselName: v.name,
            type: v.status === "emergency" ? "critical" : "warning",
            message: v.status === "emergency" ? "Emergência detectada - Ação imediata necessária" : "Anomalia detectada nos sensores",
            latitude: v.latitude,
            longitude: v.longitude,
            timestamp: new Date().toISOString(),
          }));

        setAlerts(newAlerts);
      }
    } catch (err) {
      console.error("[TelemetryMap3D] Error fetching vessels:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle],
      projection: "globe",
      zoom: 3,
      center: [-40, -15],
      pitch: pitch,
      bearing: 0,
      antialias: true,
    });

    map.current?.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    map.current?.addControl(
      new mapboxgl.ScaleControl({ maxWidth: 200, unit: "metric" }),
      "bottom-left"
    );

    // Add atmosphere and fog for 3D effect
    map.current?.on("style.load", () => {
      map.current?.setFog({
        color: "rgb(15, 23, 42)",
        "high-color": "rgb(30, 58, 138)",
        "horizon-blend": 0.05,
        "space-color": "rgb(8, 12, 21)",
        "star-intensity": 0.8,
      });
    });

    // Globe rotation
    let userInteracting = false;

    const spinGlobe = () => {
      if (!map.current || userInteracting || !isRotating) return;
      const zoom = map.current.getZoom();
      if (zoom < 5) {
        const center = map.current.getCenter();
        center.lng -= 0.15;
        map.current.easeTo({ center, duration: 100, easing: (n) => n });
      }
    };

    map.current?.on("mousedown", () => (userInteracting = true));
    map.current?.on("touchstart", () => (userInteracting = true));
    map.current?.on("mouseup", () => {
      userInteracting = false;
    });
    map.current?.on("touchend", () => {
      userInteracting = false;
    });

    if (isRotating) {
      animationRef.current = window.setInterval(spinGlobe, 100);
    }

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update rotation state
  useEffect(() => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    if (isRotating && map.current) {
      let userInteracting = false;
      
      const spinGlobe = () => {
        if (!map.current || userInteracting) return;
        const zoom = map.current.getZoom();
        if (zoom < 5) {
          const center = map.current.getCenter();
          center.lng -= 0.15;
          map.current.easeTo({ center, duration: 100, easing: (n) => n });
        }
      };

      animationRef.current = window.setInterval(spinGlobe, 100);
    }
  }, [isRotating]);

  // Update map style
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(MAP_STYLES[mapStyle]);
    }
  }, [mapStyle]);

  // Update pitch
  useEffect(() => {
    if (map.current) {
      map.current.setPitch(pitch);
    }
  }, [pitch]);

  // Update markers
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add vessel markers
    if (showVessels) {
      vessels.forEach((vessel) => {
        const el = document.createElement("div");
        el.className = "vessel-marker-3d cursor-pointer";
        
        const statusColors: Record<VesselTelemetry["status"], string> = {
          active: "bg-success shadow-success/50",
          idle: "bg-muted shadow-muted/50",
          maintenance: "bg-warning shadow-warning/50",
          alert: "bg-warning shadow-warning/50 animate-pulse",
          emergency: "bg-destructive shadow-destructive/50 animate-ping",
        };

        el.innerHTML = `
          <div class="relative group">
            <div class="absolute -inset-2 ${statusColors[vessel.status]} rounded-full opacity-30 blur-md"></div>
            <div class="relative w-10 h-10 rounded-full ${statusColors[vessel.status]} shadow-lg flex items-center justify-center border-2 border-white/30 backdrop-blur-sm transition-transform duration-300 hover:scale-125">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${vessel.heading}deg)">
                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
                <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
                <path d="M12 10v4"/>
                <path d="M12 2v3"/>
              </svg>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[10px] text-white font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              ${vessel.name}
            </div>
          </div>
        `;

        el.addEventListener("click", () => {
          setSelectedVessel(vessel);
          onVesselSelect?.(vessel);
          
          mapInstance.flyTo({
            center: [vessel.longitude, vessel.latitude],
            zoom: 8,
            pitch: 60,
            duration: 2000,
          });
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([vessel.longitude, vessel.latitude])
          .addTo(mapInstance);

        markersRef.current.push(marker);
      });
    }

    // Add alert markers
    if (showAlerts) {
      alerts.forEach((alert) => {
        const el = document.createElement("div");
        el.className = "alert-marker-3d cursor-pointer";
        
        const severityColors: Record<TelemetryAlert["type"], string> = {
          critical: "bg-red-500",
          warning: "bg-amber-500",
          info: "bg-blue-500",
        };

        el.innerHTML = `
          <div class="relative">
            <div class="absolute inset-0 ${severityColors[alert.type]} rounded-full animate-ping opacity-75"></div>
            <div class="relative w-8 h-8 ${severityColors[alert.type]} rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L2 22h20L12 2z"/>
              </svg>
            </div>
          </div>
        `;

        el.addEventListener("click", () => {
          onAlertClick?.(alert);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([alert.longitude, alert.latitude])
          .addTo(mapInstance);

        markersRef.current.push(marker);
      });
    }
  }, [vessels, alerts, showVessels, showAlerts, onVesselSelect, onAlertClick]);

  // Initial data fetch
  useEffect(() => {
    generateMockTelemetry();
    const interval = setInterval(generateMockTelemetry, 30000);
    return () => clearInterval(interval);
  }, [generateMockTelemetry]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainer.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getStatusColor = (status: VesselTelemetry["status"]) => {
    const colors: Record<VesselTelemetry["status"], string> = {
      active: "text-success",
      idle: "text-muted-foreground",
      maintenance: "text-warning",
      alert: "text-warning",
      emergency: "text-destructive",
    };
    return colors[status];
  };

  const getSensorIcon = (type: SensorReading["type"]) => {
    const icons: Record<SensorReading["type"], React.ReactNode> = {
      temperature: <Thermometer className="h-4 w-4" />,
      pressure: <Gauge className="h-4 w-4" />,
      vibration: <Radio className="h-4 w-4" />,
      fuel: <Zap className="h-4 w-4" />,
      gps: <Navigation className="h-4 w-4" />,
      radar: <Radar className="h-4 w-4" />,
    };
    return icons[type];
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-4 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Select value={mapStyle} onValueChange={(v) => setMapStyle(v as MapStyle)}>
            <SelectTrigger className="w-[140px] bg-background/80 backdrop-blur-md border-primary/20">
              <Layers className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Modo Escuro</SelectItem>
              <SelectItem value="satellite">Satélite</SelectItem>
              <SelectItem value="navigation">Navegação</SelectItem>
              <SelectItem value="ocean">Oceânico</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-3 px-3 py-2 bg-background/80 backdrop-blur-md rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Switch
                id="vessels"
                checked={showVessels}
                onCheckedChange={setShowVessels}
              />
              <Label htmlFor="vessels" className="text-xs">Navios</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="alerts"
                checked={showAlerts}
                onCheckedChange={setShowAlerts}
              />
              <Label htmlFor="alerts" className="text-xs">Alertas</Label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-md">
            <Ship className="h-3 w-3 mr-1" />
            {vessels.length} embarcações
          </Badge>
          {alerts.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {alerts.length} alertas
            </Badge>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className={cn(
          "w-full rounded-lg overflow-hidden border border-primary/20",
          isFullscreen ? "h-screen" : "h-[600px]"
        )}
      />

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto bg-background/80 backdrop-blur-md rounded-lg p-3 border border-primary/20">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Inclinação</Label>
            <Slider
              value={[pitch]}
              onValueChange={(v) => setPitch(v[0])}
              max={85}
              min={0}
              step={5}
              className="w-24"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRotating(!isRotating)}
            className="gap-1"
          >
            {isRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRotating ? "Pausar" : "Rotacionar"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateMockTelemetry()}
            className="gap-1"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Atualizar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="gap-1"
          >
            <Maximize2 className="h-4 w-4" />
            {isFullscreen ? "Sair" : "Expandir"}
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pointer-events-auto bg-background/80 backdrop-blur-md rounded-lg p-3 border border-primary/20">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-xs">Ativo</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
            <span className="text-xs">Parado</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-xs">Manutenção</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs">Emergência</span>
          </div>
        </div>
      </div>

      {/* Selected Vessel Panel */}
      <AnimatePresence>
        {selectedVessel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-20 right-4 w-80 z-20"
          >
            <Card className="bg-background/95 backdrop-blur-lg border-primary/30 shadow-xl">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{selectedVessel.name}</h3>
                    <p className={cn("text-sm font-medium capitalize", getStatusColor(selectedVessel.status))}>
                      {selectedVessel.status}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVessel(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    <span>{selectedVessel.speed.toFixed(1)} nós</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    <span>{selectedVessel.heading.toFixed(0)}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>{selectedVessel.fuelLevel.toFixed(0)}% comb.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-primary" />
                    <span>{selectedVessel.engineTemp.toFixed(0)}°C</span>
                  </div>
                </div>

                {selectedVessel.destination && (
                  <div className="p-2 bg-muted/50 rounded-lg text-sm">
                    <p className="text-muted-foreground">Destino</p>
                    <p className="font-medium">{selectedVessel.destination}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Sensores</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedVessel.sensors.map((sensor) => (
                      <div
                        key={sensor.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg text-xs",
                          sensor.status === "normal" && "bg-success/10",
                          sensor.status === "warning" && "bg-warning/10",
                          sensor.status === "critical" && "bg-destructive/10"
                        )}
                      >
                        {getSensorIcon(sensor.type)}
                        <span>{sensor.value.toFixed(1)} {sensor.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Tripulação: {selectedVessel.crewCount} pessoas
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TelemetryMap3D;
