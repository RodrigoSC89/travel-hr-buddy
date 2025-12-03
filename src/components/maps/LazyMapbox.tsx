/**
 * Lazy-loaded Mapbox wrapper to reduce initial bundle size (~350KB savings)
 */

import React, { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

// Lazy load mapbox-gl - use any type to avoid complex mapbox types
let mapboxgl: any = null;

export const loadMapbox = async (): Promise<any> => {
  if (!mapboxgl) {
    const module = await import("mapbox-gl");
    await import("mapbox-gl/dist/mapbox-gl.css");
    mapboxgl = module.default || module;
  }
  return mapboxgl;
};

interface LazyMapboxProps {
  token: string;
  center?: [number, number];
  zoom?: number;
  style?: string;
  projection?: string;
  pitch?: number;
  onMapLoad?: (map: any) => void;
  className?: string;
  children?: React.ReactNode;
}

export const LazyMapbox: React.FC<LazyMapboxProps> = ({
  token,
  center = [-40, -15],
  zoom = 2,
  style = "mapbox://styles/mapbox/satellite-streets-v12",
  projection = "globe",
  pitch = 0,
  onMapLoad,
  className = "h-96",
  children
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !mapContainer.current) {
      setError("Mapbox token not configured");
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const initMap = async () => {
      try {
        const mb = await loadMapbox();
        
        if (!mounted || !mapContainer.current) return;

        mb.accessToken = token;

        const mapInstance = new mb.Map({
          container: mapContainer.current,
          style,
          center,
          zoom,
          pitch,
          projection: projection as any
        });
        
        map.current = mapInstance;

        mapInstance.addControl(new mb.NavigationControl(), "top-right");
        mapInstance.addControl(new mb.ScaleControl(), "bottom-left");

        mapInstance.on("load", () => {
          if (mounted) {
            setIsLoading(false);
            onMapLoad?.(mapInstance);
          }
        });

        mapInstance.on("error", (e: any) => {
          console.error("Mapbox error:", e);
          if (mounted) {
            setError("Failed to load map");
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to load Mapbox:", err);
        if (mounted) {
          setError("Failed to load Mapbox library");
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      map.current?.remove();
      map.current = null;
    };
  }, [token, style, projection]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
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
        <div className={`absolute inset-0 z-10 ${className}`}>
          <Skeleton className="w-full h-full rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Loading map...</p>
            </div>
          </div>
        </div>
      )}
      <div ref={mapContainer} className={`${className} rounded-lg`} />
      {children}
    </div>
  );
};

// Loading fallback component
export const MapLoadingFallback: React.FC<{ className?: string }> = ({ className = "h-96" }) => (
  <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
    <div className="text-center text-muted-foreground">
      <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
      <p className="text-sm">Loading map...</p>
    </div>
  </div>
);

export default LazyMapbox;
