/**
import { useEffect, useState } from "react";;
 * LazyMap - FASE 2.5 Lazy Loading
 * Wrapper lazy para Mapbox GL (1.65MB)
 */

import React, { Suspense, lazy, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string | number;
  width?: string | number;
  className?: string;
  onMapLoad?: (map: any) => void;
  style?: string;
}

function MapSkeleton({ height = "400px", width = "100%" }: { height?: string | number; width?: string | number }) {
  return (
    <div 
      className="relative bg-muted rounded-lg overflow-hidden"
      style={{ height, width }}
    >
      <Skeleton className="h-full w-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    </div>
  );
}

// Lazy load the actual map component
const MapComponent = lazy(() => import("./MapComponent"));

export function LazyMap({
  center = [-46.6333, -23.5505], // São Paulo default
  zoom = 12,
  height = "400px",
  width = "100%",
  className = "",
  onMapLoad,
  style = "mapbox://styles/mapbox/streets-v12",
}: LazyMapProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Use IntersectionObserver to load map only when visible
    const timer = setTimeout(() => setShouldLoad(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) {
    return <MapSkeleton height={height} width={width} />;
  }

  return (
    <Suspense fallback={<MapSkeleton height={height} width={width} />}>
      <MapComponent
        center={center}
        zoom={zoom}
        height={height}
        width={width}
        className={className}
        onMapLoad={onMapLoad}
        style={style}
      />
    </Suspense>
  );
}

export default LazyMap;
