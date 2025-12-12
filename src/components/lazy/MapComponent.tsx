/**
import { useEffect, useRef, useCallback } from "react";;
 * MapComponent - Componente interno de mapa
 * Carregado apenas quando necessário
 */

import React, { useEffect, useRef } from "react";
import { loadMapbox } from "@/lib/lazy-loaders";

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  height: string | number;
  width: string | number;
  className?: string;
  onMapLoad?: (map: unknown: unknown: unknown) => void;
  style: string;
}

export default function MapComponent({
  center,
  zoom,
  height,
  width,
  className = "",
  onMapLoad,
  style,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    loadMapbox().then((mapboxgl) => {
      if (!mapContainer.current) return;

      // Initialize map
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: center,
        zoom: zoom,
        accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
      });

      map.current = mapInstance;

      mapInstance.on("load", () => {
        if (onMapLoad) {
          onMapLoad(mapInstance);
        }
      });
    }).catch((error) => {
      console.error("Erro ao carregar mapa:", error);
  };

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [center, zoom, style, onMapLoad]);

  return (
    <div
      ref={mapContainer}
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ height, width }}
    />
  );
}
