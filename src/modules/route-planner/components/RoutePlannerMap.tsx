/**
 * Route Planner Map Component with Mapbox GL
 * Advanced maritime navigation with route planning and live tracking
 * Patch 145.0
 */

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Route, Anchor } from "lucide-react";

// Set Mapbox access token (in production, use env variable)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export interface RoutePoint {
  longitude: number;
  latitude: number;
  name?: string;
}

export interface RouteData {
  id: string;
  name: string;
  points: RoutePoint[];
  type: "planned" | "alternative" | "actual";
  distance?: number;
  duration?: number;
  color?: string;
}

interface RoutePlannerMapProps {
  center?: [number, number];
  zoom?: number;
  routes?: RouteData[];
  livePosition?: { longitude: number; latitude: number };
  onRouteSelect?: (routeId: string) => void;
}

export const RoutePlannerMap: React.FC<RoutePlannerMapProps> = ({
  center = [-45, -15],
  zoom = 5,
  routes = [],
  livePosition,
  onRouteSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !MAPBOX_TOKEN) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-day-v1",
      center: center,
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, []);

  // Update routes on map
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Remove existing route layers
    routes.forEach((_, index) => {
      const layerId = `route-${index}`;
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
      if (map.current!.getSource(layerId)) {
        map.current!.removeSource(layerId);
      }
    });

    // Add routes to map
    routes.forEach((route, index) => {
      const coordinates = route.points.map(p => [p.longitude, p.latitude]);
      
      const routeColor = route.color || (
        route.type === "planned" ? "#3b82f6" :
          route.type === "alternative" ? "#f59e0b" :
            "#22c55e"
      );

      const lineStyle = route.type === "alternative" ? "dashed" : "solid";

      // Add route source
      map.current!.addSource(`route-${index}`, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      });

      // Add route layer
      map.current!.addLayer({
        id: `route-${index}`,
        type: "line",
        source: `route-${index}`,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": routeColor,
          "line-width": 4,
          "line-opacity": selectedRoute === route.id || !selectedRoute ? 0.8 : 0.3,
          ...(lineStyle === "dashed" && {
            "line-dasharray": [2, 2],
          }),
        },
      });

      // Add markers for waypoints
      route.points.forEach((point, pointIndex) => {
        const el = document.createElement("div");
        el.className = "route-marker";
        el.style.width = "12px";
        el.style.height = "12px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = routeColor;
        el.style.border = "2px solid white";
        el.style.cursor = "pointer";

        const marker = new mapboxgl.Marker(el)
          .setLngLat([point.longitude, point.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div>
                <strong>${route.name}</strong><br/>
                ${point.name || `Waypoint ${pointIndex + 1}`}<br/>
                ${point.latitude.toFixed(4)}°, ${point.longitude.toFixed(4)}°
              </div>`
            )
          )
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    });

    // Add live position marker if provided
    if (livePosition) {
      const el = document.createElement("div");
      el.className = "live-position-marker";
      el.innerHTML = "<span role=\"img\" aria-label=\"Current position\">📍</span>";
      el.style.fontSize = "24px";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([livePosition.longitude, livePosition.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div>
              <strong>Posição Atual</strong><br/>
              ${livePosition.latitude.toFixed(4)}°, ${livePosition.longitude.toFixed(4)}°
            </div>`
          )
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    }

    // Fit map to show all routes
    if (routes.length > 0 && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      routes.forEach(route => {
        route.points.forEach(point => {
          bounds.extend([point.longitude, point.latitude]);
        });
      });
      if (livePosition) {
        bounds.extend([livePosition.longitude, livePosition.latitude]);
      }
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [routes, livePosition, mapLoaded, selectedRoute]);

  const handleRouteClick = (routeId: string) => {
    setSelectedRoute(routeId === selectedRoute ? null : routeId);
    onRouteSelect?.(routeId);
  };

  const getRouteIcon = (type: RouteData["type"]) => {
    switch (type) {
    case "planned":
      return <Route className="h-4 w-4" />;
    case "alternative":
      return <Navigation className="h-4 w-4" />;
    case "actual":
      return <Anchor className="h-4 w-4" />;
    default:
      return <MapPin className="h-4 w-4" />;
    }
  };

  const getRouteLabel = (type: RouteData["type"]) => {
    switch (type) {
    case "planned":
      return "Planejada";
    case "alternative":
      return "Alternativa";
    case "actual":
      return "Atual";
    default:
      return "Rota";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Planejamento de Rota
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!MAPBOX_TOKEN ? (
            <div 
              className="w-full rounded-lg bg-muted flex items-center justify-center"
              style={{ height: "600px" }}
            >
              <div className="text-center space-y-4 p-8">
                <Navigation className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Mapbox Token Necessário
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Configure a variável de ambiente VITE_MAPBOX_TOKEN para habilitar 
                    o mapa de navegação. Obtenha uma chave gratuita em mapbox.com
                  </p>
                </div>
                <div className="pt-4">
                  <Badge variant="outline" className="text-xs">
                    Modo de Desenvolvimento
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div
              ref={mapContainer}
              className="w-full rounded-lg overflow-hidden"
              style={{ height: "600px" }}
            />
          )}
        </CardContent>
      </Card>

      {routes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rotas Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRoute === route.id
                      ? "bg-accent border-primary"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => handleRouteClick(route.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor:
                            route.color ||
                            (route.type === "planned"
                              ? "#3b82f6"
                              : route.type === "alternative"
                                ? "#f59e0b"
                                : "#22c55e"),
                        }}
                      />
                      <div>
                        <div className="font-medium">{route.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {route.points.length} waypoints
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getRouteIcon(route.type)}
                        <span className="ml-1">{getRouteLabel(route.type)}</span>
                      </Badge>
                      {route.distance && (
                        <span className="text-sm text-muted-foreground">
                          {(route.distance / 1852).toFixed(1)} nm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
