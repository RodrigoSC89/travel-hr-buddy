/**
import { useEffect, useRef, useState, useCallback } from "react";;
 * PATCH 501: Satellite Map Component
 * Displays satellite position on interactive map
 * Optimized with lazy-loaded Mapbox (~350KB bundle savings)
 */

import React, { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { MapPin } from "lucide-react";
import { loadMapboxGL } from "@/lib/performance/heavy-libs-loader";

interface SatelliteMapProps {
  satellite: {
    id: string;
    name: string;
    position?: {
      latitude: number;
      longitude: number;
      altitude: number;
    };
  };
}

export const SatelliteMap: React.FC<SatelliteMapProps> = ({ satellite }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN || "";

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!mapboxToken) {
      setError("Mapbox token not configured");
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const initMap = async () => {
      try {
        const mapboxgl = await loadMapboxGL();
        
        if (!mounted || !mapContainer.current) return;

        mapboxgl.accessToken = mapboxToken;
        const initialPosition = satellite.position || { latitude: 0, longitude: 0 };

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/satellite-streets-v12",
          center: [initialPosition.longitude, initialPosition.latitude],
          zoom: 3,
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
              "star-intensity": 0.6
            });
          }
        });

        map.current.on("load", () => {
          if (mounted) setIsLoading(false);
  });
      } catch (err) {
        console.error("Failed to load Mapbox:", err);
        if (mounted) {
          setError("Failed to load map");
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (marker.current) marker.current.remove();
      if (map.current) map.current.remove();
      map.current = null;
    });
  }, [mapboxToken]);

  useEffect(() => {
    const updateMarker = async () => {
      if (!map.current || !satellite.position) return;

      const mapboxgl = await loadMapboxGL();
      const { latitude, longitude, altitude } = satellite.position;

      if (marker.current) marker.current.remove();

      const el = document.createElement("div");
      el.className = "satellite-marker";
      el.style.backgroundImage = "url(/satellite-icon.svg)";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.backgroundSize = "100%";
      el.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${satellite.name}</h3>
          <p class="text-sm">Lat: ${latitude.toFixed(4)}°</p>
          <p class="text-sm">Lon: ${longitude.toFixed(4)}°</p>
          <p class="text-sm">Alt: ${altitude.toFixed(1)} km</p>
        </div>
      `);

      marker.current = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map.current);

      map.current.flyTo({
        center: [longitude, latitude],
        zoom: 4,
        duration: 1500
      });
    };

    updateMarker();
  }, [satellite]);

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-96 rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="h-96 rounded-lg" />
      {satellite.position && (
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur p-3 rounded-lg shadow-lg text-sm">
          <div className="font-semibold mb-1">{satellite.name}</div>
          <div className="space-y-0.5 text-xs text-muted-foreground">
            <div>Lat: {satellite.position.latitude.toFixed(6)}°</div>
            <div>Lon: {satellite.position.longitude.toFixed(6)}°</div>
            <div>Alt: {satellite.position.altitude.toFixed(2)} km</div>
          </div>
        </div>
      )}
    </div>
  );
};
