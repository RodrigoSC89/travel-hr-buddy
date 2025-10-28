/**
 * PATCH 456 - Navigation Copilot Interactive Map
 * Interactive map component with route visualization, weather alerts, and AI suggestions
 */

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Navigation, Waves } from "lucide-react";
import type { Coordinates, NavigationRoute, WeatherAlert } from "../index";

// Set Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

interface NavigationMapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  routes?: NavigationRoute[];
  weatherAlerts?: WeatherAlert[];
  currentPosition?: Coordinates;
  onMapClick?: (coordinates: Coordinates) => void;
  onRouteSelect?: (routeId: string) => void;
}

export const NavigationMap: React.FC<NavigationMapProps> = ({
  center = [-45, -23.5],
  zoom = 8,
  routes = [],
  weatherAlerts = [],
  currentPosition,
  onMapClick,
  onRouteSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Initialize map only once

    // Check if token is available
    if (!mapboxgl.accessToken) {
      console.warn("Mapbox token not configured, using mock map");
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: center,
        zoom: zoom,
      });

      map.current.on("load", () => {
        setMapReady(true);
      });

      // Handle map clicks
      if (onMapClick) {
        map.current.on("click", (e) => {
          onMapClick({
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
          });
        });
      }

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left");
    } catch (error) {
      console.error("Failed to initialize map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update current position marker
  useEffect(() => {
    if (!map.current || !mapReady || !currentPosition) return;

    // Remove existing position marker
    const existingMarker = markersRef.current.find((m) => m.getElement().classList.contains("current-position"));
    if (existingMarker) {
      existingMarker.remove();
    }

    // Add new position marker
    const el = document.createElement("div");
    el.className = "current-position";
    el.style.width = "20px";
    el.style.height = "20px";
    el.style.backgroundColor = "#00ff00";
    el.style.borderRadius = "50%";
    el.style.border = "3px solid white";
    el.style.boxShadow = "0 0 10px rgba(0, 255, 0, 0.5)";

    const marker = new mapboxgl.Marker(el)
      .setLngLat([currentPosition.lng, currentPosition.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div class="text-sm">
            <strong>Current Position</strong><br/>
            Lat: ${currentPosition.lat.toFixed(4)}°<br/>
            Lng: ${currentPosition.lng.toFixed(4)}°
          </div>`
        )
      )
      .addTo(map.current);

    markersRef.current.push(marker);
  }, [currentPosition, mapReady]);

  // Draw routes on map
  useEffect(() => {
    if (!map.current || !mapReady || routes.length === 0) return;

    // Remove existing route layers
    routes.forEach((_, idx) => {
      const sourceId = `route-${idx}`;
      const layerId = `route-layer-${idx}`;
      
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
      if (map.current!.getSource(sourceId)) {
        map.current!.removeSource(sourceId);
      }
    });

    // Add new routes
    routes.forEach((route, idx) => {
      const sourceId = `route-${idx}`;
      const layerId = `route-layer-${idx}`;

      // Create GeoJSON for route
      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        properties: {
          routeId: route.id,
          recommended: route.recommended,
        },
        geometry: {
          type: "LineString",
          coordinates: route.waypoints.map((wp) => [wp.lng, wp.lat]),
        },
      };

      // Add source
      map.current!.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });

      // Add layer
      map.current!.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": route.recommended ? "#3b82f6" : "#f59e0b",
          "line-width": route.recommended ? 4 : 2,
          "line-opacity": 0.8,
        },
      });

      // Add click handler
      map.current!.on("click", layerId, () => {
        if (onRouteSelect) {
          onRouteSelect(route.id);
        }
      });

      // Change cursor on hover
      map.current!.on("mouseenter", layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = "pointer";
        }
      });

      map.current!.on("mouseleave", layerId, () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = "";
        }
      });

      // Add waypoint markers
      route.waypoints.forEach((waypoint, wpIdx) => {
        const isOrigin = wpIdx === 0;
        const isDestination = wpIdx === route.waypoints.length - 1;

        const el = document.createElement("div");
        el.style.width = isOrigin || isDestination ? "15px" : "10px";
        el.style.height = isOrigin || isDestination ? "15px" : "10px";
        el.style.backgroundColor = route.recommended ? "#3b82f6" : "#f59e0b";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid white";

        const marker = new mapboxgl.Marker(el)
          .setLngLat([waypoint.lng, waypoint.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 15 }).setHTML(
              `<div class="text-sm">
                <strong>${isOrigin ? "Origin" : isDestination ? "Destination" : "Waypoint"}</strong><br/>
                Lat: ${waypoint.lat.toFixed(4)}°<br/>
                Lng: ${waypoint.lng.toFixed(4)}°
              </div>`
            )
          )
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    });

    // Fit map to show all routes
    if (routes.length > 0 && routes[0].waypoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      routes.forEach((route) => {
        route.waypoints.forEach((wp) => {
          bounds.extend([wp.lng, wp.lat]);
        });
      });
      map.current!.fitBounds(bounds, { padding: 50 });
    }
  }, [routes, mapReady, onRouteSelect]);

  // Draw weather alerts on map
  useEffect(() => {
    if (!map.current || !mapReady || weatherAlerts.length === 0) return;

    // Remove existing alert markers
    markersRef.current = markersRef.current.filter((marker) => {
      if (marker.getElement().classList.contains("weather-alert")) {
        marker.remove();
        return false;
      }
      return true;
    });

    // Add new alert markers
    weatherAlerts.forEach((alert) => {
      const el = document.createElement("div");
      el.className = "weather-alert";
      el.innerHTML = `
        <div style="
          width: 30px;
          height: 30px;
          background-color: ${alert.severity === "critical" ? "#ef4444" : alert.severity === "high" ? "#f97316" : "#facc15"};
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        ">
          <span style="color: white; font-size: 12px;">⚠</span>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([alert.location.lng, alert.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="text-sm">
              <strong class="text-${alert.severity === "critical" ? "red" : alert.severity === "high" ? "orange" : "yellow"}-500">
                ${alert.type.replace("_", " ").toUpperCase()}
              </strong><br/>
              <span class="text-xs">${alert.description}</span><br/>
              <span class="text-xs text-gray-500">Severity: ${alert.severity}</span>
            </div>`
          )
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [weatherAlerts, mapReady]);

  // Mock map fallback when Mapbox is not available
  if (!mapboxgl.accessToken) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center bg-zinc-900 border-zinc-700">
        <div className="text-center space-y-4">
          <Navigation className="w-16 h-16 mx-auto text-cyan-400" />
          <div className="text-xl font-semibold text-white">Interactive Navigation Map</div>
          <div className="text-sm text-zinc-400 max-w-md">
            Mapbox token not configured. Add VITE_MAPBOX_TOKEN to your environment variables to enable the interactive map.
          </div>
          {routes.length > 0 && (
            <div className="mt-4 space-y-2">
              <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                {routes.length} route(s) calculated
              </Badge>
              {weatherAlerts.length > 0 && (
                <Badge variant="outline" className="border-orange-500 text-orange-400">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {weatherAlerts.length} weather alert(s)
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      <div ref={mapContainer} className="w-full h-full rounded-lg overflow-hidden" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-lg">
          <div className="text-center space-y-2">
            <Waves className="w-8 h-8 mx-auto text-cyan-400 animate-pulse" />
            <div className="text-sm text-white">Loading map...</div>
          </div>
        </div>
      )}
    </div>
  );
};
