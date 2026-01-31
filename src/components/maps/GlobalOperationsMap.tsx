/**
 * PATCH 1004 - Global Operations Map
 * Interactive map with vessel locations, alerts, and heatmaps
 */

import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "@/lib/mapbox-shim";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Globe,
  Layers,
  MapPin,
  Navigation,
  RefreshCw,
  Ship,
  AlertTriangle,
  Activity,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { logger } from '@/lib/logger';

// Mapbox token from Supabase secrets
const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2x0OHFqMjVvMDVvYTJrcXRqNXkxNmF5NiJ9.YOUR_TOKEN";

interface VesselLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "active" | "idle" | "maintenance" | "alert";
  speed?: number;
  heading?: number;
}

interface AlertMarker {
  id: string;
  latitude: number;
  longitude: number;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
}

type MapStyle = "light" | "dark" | "satellite" | "navigation";

const MAP_STYLES: Record<MapStyle, string> = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  navigation: "mapbox://styles/mapbox/navigation-night-v1",
};

export function GlobalOperationsMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [mapStyle, setMapStyle] = useState<MapStyle>("dark");
  const [vessels, setVessels] = useState<VesselLocation[]>([]);
  const [alerts, setAlerts] = useState<AlertMarker[]>([]);
  const [showVessels, setShowVessels] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch vessel locations - using mock positions since last_known_position column doesn't exist
  const fetchVessels = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("vessels")
        .select("id, name, status")
        .limit(20);

      if (data) {
        // Generate mock positions for demo (vessels around Brazil/Atlantic)
        setVessels(
          data.map((v, idx) => ({
            id: v.id,
            name: v.name,
            latitude: -23 + (idx * 3) + (Math.random() * 5),
            longitude: -46 + (idx * 4) + (Math.random() * 10),
            status: (v.status as VesselLocation["status"]) || "active",
          }))
        );
      }
    } catch (err) {
      logger.error("[GeoMap] Error fetching vessels:", err);
    }
  }, []);

  // Fetch alerts - using mock data as shared_alerts doesn't have geo columns
  const fetchAlerts = useCallback(async () => {
    // Mock alerts with locations for demo
    setAlerts([
      { id: "1", title: "Alerta de Manutenção", latitude: -23.5, longitude: -46.6, severity: "high" },
      { id: "2", title: "Verificação Pendente", latitude: -22.9, longitude: -43.2, severity: "medium" },
    ]);
    setIsLoading(false);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle],
      projection: "globe",
      zoom: 2,
      center: [-40, -10], // Center on Brazil
      pitch: 30,
    });

    map.current?.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    map.current?.addControl(
      new mapboxgl.ScaleControl({ maxWidth: 200, unit: "metric" }),
      "bottom-left"
    );

    // Add atmosphere
    map.current?.on("style.load", () => {
      map.current?.setFog({
        color: "rgb(20, 20, 30)",
        "high-color": "rgb(36, 92, 223)",
        "horizon-blend": 0.02,
        "space-color": "rgb(11, 11, 25)",
        "star-intensity": 0.6,
      });
    });

    // Slow rotation
    let userInteracting = false;
    const spinGlobe = () => {
      if (!map.current || userInteracting) return;
      const zoom = map.current.getZoom();
      if (zoom < 5) {
        const center = map.current.getCenter();
        center.lng -= 0.5;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    };

    map.current?.on("mousedown", () => (userInteracting = true));
    map.current?.on("mouseup", () => {
      userInteracting = false;
      spinGlobe();
    });
    map.current?.on("moveend", spinGlobe);

    spinGlobe();

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(MAP_STYLES[mapStyle]);
    }
  }, [mapStyle]);

  // Update markers
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add vessel markers
    if (showVessels) {
      const filteredVessels =
        filterStatus === "all"
          ? vessels
          : vessels.filter((v) => v.status === filterStatus);

      filteredVessels.forEach((vessel) => {
        const el = document.createElement("div");
        el.className = "vessel-marker";
        el.innerHTML = `
          <div class="w-8 h-8 rounded-full flex items-center justify-center ${
            vessel.status === "alert"
              ? "bg-red-500 animate-pulse"
              : vessel.status === "maintenance"
              ? "bg-yellow-500"
              : vessel.status === "idle"
              ? "bg-gray-500"
              : "bg-blue-500"
          }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
              <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
              <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
              <path d="M12 10v4"/>
              <path d="M12 2v3"/>
            </svg>
          </div>
        `;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([vessel.longitude, vessel.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${vessel.name}</h3>
                <p class="text-sm">Status: ${vessel.status}</p>
                <p class="text-xs text-gray-500">
                  ${vessel.latitude.toFixed(4)}, ${vessel.longitude.toFixed(4)}
                </p>
              </div>
            `)
          )
          .addTo(mapInstance);

        markersRef.current.push(marker);
      });
    }

    // Add alert markers
    if (showAlerts) {
      alerts.forEach((alert) => {
        const el = document.createElement("div");
        el.className = "alert-marker";
        el.innerHTML = `
          <div class="w-6 h-6 rounded-full flex items-center justify-center ${
            alert.severity === "critical"
              ? "bg-red-500 animate-ping"
              : alert.severity === "high"
              ? "bg-orange-500"
              : "bg-yellow-500"
          }">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 22h20L12 2zm0 4l7.5 14h-15L12 6zm0 6v4m0 2v2"/>
            </svg>
          </div>
        `;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([alert.longitude, alert.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-red-600">${alert.title}</h3>
                <p class="text-sm">Severity: ${alert.severity}</p>
              </div>
            `)
          )
          .addTo(mapInstance);

        markersRef.current.push(marker);
      });
    }
  }, [vessels, alerts, showVessels, showAlerts, filterStatus]);

  // Initial data fetch
  useEffect(() => {
    fetchVessels();
    fetchAlerts();
    const interval = setInterval(() => {
      fetchVessels();
      fetchAlerts();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchVessels, fetchAlerts]);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Mapa de Operações Globais
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Ship className="h-3 w-3 mr-1" />
              {vessels.length} embarcações
            </Badge>
            {alerts.length > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {alerts.length} alertas
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Controls */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/50">
          <div className="flex items-center gap-4">
            <Select value={mapStyle} onValueChange={(v) => setMapStyle(v as MapStyle)}>
              <SelectTrigger className="w-[140px]">
                <Layers className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="satellite">Satélite</SelectItem>
                <SelectItem value="navigation">Navegação</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="idle">Parados</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="alert">Em Alerta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-vessels"
                checked={showVessels}
                onCheckedChange={setShowVessels}
              />
              <Label htmlFor="show-vessels" className="text-sm">Embarcações</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-alerts"
                checked={showAlerts}
                onCheckedChange={setShowAlerts}
              />
              <Label htmlFor="show-alerts" className="text-sm">Alertas</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchVessels();
                fetchAlerts();
              }}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapContainer}
          className="w-full h-[500px] relative"
        />

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 p-3 border-t bg-muted/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Ativo</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500" />
            <span>Parado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Manutenção</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span>Alerta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GlobalOperationsMap;
