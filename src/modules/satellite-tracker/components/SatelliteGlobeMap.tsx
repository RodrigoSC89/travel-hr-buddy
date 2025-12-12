/**
import { useEffect, useRef, useState, useCallback } from "react";;
 * Satellite Globe Map Component
 * Interactive 3D globe showing satellite positions
 */

import React, { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { Globe, Satellite } from "lucide-react";
import { loadMapboxGL } from "@/lib/performance/heavy-libs-loader";
import type { DemoSatellite } from "../data/demo-satellites";

interface SatelliteGlobeMapProps {
  satellites: DemoSatellite[];
  selectedSatellite?: DemoSatellite | null;
  onSelectSatellite?: (satellite: DemoSatellite) => void;
}

export const SatelliteGlobeMap: React.FC<SatelliteGlobeMapProps> = ({
  satellites,
  selectedSatellite,
  onSelectSatellite
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || "";

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    if (!mapboxToken) {
      setError("Token do Mapbox não configurado");
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const initMap = async () => {
      try {
        const mapboxgl = await loadMapboxGL();
        
        if (!mounted || !mapContainer.current) return;

        mapboxgl.accessToken = mapboxToken;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/satellite-streets-v12",
          center: [0, 20],
          zoom: 1.5,
          projection: { name: "globe" }
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
        map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

        map.current.on("style.load", () => {
          if (map.current) {
            map.current.setFog({
              color: "rgb(186, 210, 235)",
              "high-color": "rgb(36, 92, 223)",
              "horizon-blend": 0.02,
              "space-color": "rgb(11, 11, 25)",
              "star-intensity": 0.8
            });
          }
        });

        map.current.on("load", () => {
          if (mounted) {
            setIsLoading(false);
            updateMarkers(mapboxgl);
          }
        });
      } catch (err) {
        console.error("Failed to load Mapbox:", err);
        if (mounted) {
          setError("Falha ao carregar o mapa");
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      markers.current.forEach(m => m.remove());
      if (map.current) map.current.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  const updateMarkers = async (mapboxgl: unknown: unknown: unknown) => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    // Add markers for each satellite
    satellites.forEach(sat => {
      const el = document.createElement("div");
      el.className = "satellite-marker-globe";
      el.style.width = sat.id === selectedSatellite?.id ? "24px" : "16px";
      el.style.height = sat.id === selectedSatellite?.id ? "24px" : "16px";
      el.style.borderRadius = "50%";
      el.style.cursor = "pointer";
      el.style.transition = "all 0.2s ease";
      
      // Color based on orbit type
      const colors: Record<string, string> = {
        LEO: "#3b82f6",
        MEO: "#22c55e",
        GEO: "#a855f7",
        HEO: "#f97316"
      };
      el.style.backgroundColor = colors[sat.orbit_type] || "#6b7280";
      el.style.border = sat.id === selectedSatellite?.id ? "3px solid white" : "2px solid rgba(255,255,255,0.7)";
      el.style.boxShadow = sat.id === selectedSatellite?.id 
        ? `0 0 15px ${colors[sat.orbit_type]}` 
        : `0 0 8px ${colors[sat.orbit_type]}80`;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${sat.satellite_name}</h3>
          <div style="font-size: 12px; color: #666;">
            <p><strong>Órbita:</strong> ${sat.orbit_type}</p>
            <p><strong>Altitude:</strong> ${sat.altitude_km.toFixed(0)} km</p>
            <p><strong>Velocidade:</strong> ${sat.velocity_kmh.toFixed(0)} km/h</p>
            <p><strong>Posição:</strong> ${sat.latitude.toFixed(2)}°, ${sat.longitude.toFixed(2)}°</p>
            <p><strong>Status:</strong> ${sat.status}</p>
          </div>
        </div>
      `);

      el.addEventListener("click", () => {
        onSelectSatellite?.(sat);
  });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([sat.longitude, sat.latitude])
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
  });
  });

  // Update markers when satellites or selection changes
  useEffect(() => {
    if (!map.current || isLoading) return;
    
    const initMarkers = async () => {
      const mapboxgl = await loadMapboxGL();
      updateMarkers(mapboxgl);
    };
    
    initMarkers();
  }, [satellites, selectedSatellite, isLoading]);

  // Fly to selected satellite
  useEffect(() => {
    if (map.current && selectedSatellite) {
      map.current.flyTo({
        center: [selectedSatellite.longitude, selectedSatellite.latitude],
        zoom: 3,
        duration: 1500
      });
    }
  }, [selectedSatellite]);

  if (error) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-[500px] rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Satellite className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Carregando mapa de satélites...</p>
            </div>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="h-[500px] rounded-lg" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur p-3 rounded-lg shadow-lg">
        <div className="text-xs font-medium mb-2">Legenda de Órbitas</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs">LEO (Órbita Baixa)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs">MEO (Órbita Média)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs">GEO (Geoestacionária)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs">HEO (Órbita Alta)</span>
          </div>
        </div>
      </div>

      {/* Satellite count */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <Satellite className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{satellites.length} satélites ativos</span>
        </div>
      </div>
    </div>
  );
};
