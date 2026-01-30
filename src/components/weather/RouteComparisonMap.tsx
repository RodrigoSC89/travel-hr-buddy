/**
 * Route Comparison Map Component
 * Shows multiple routes overlaid on a map with different colors
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from '@/lib/mapbox-shim';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { AlternativeRoute } from '@/lib/routing/weather-routing';
import { cn } from '@/lib/utils';

interface RouteComparisonMapProps {
  routes: {
    id: string;
    name: string;
    route: AlternativeRoute;
    color?: string;
  }[];
  className?: string;
  height?: string;
}

// Distinct colors for route comparison
const COMPARISON_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red  
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
];

export function RouteComparisonMap({
  routes,
  className,
  height = '300px',
}: RouteComparisonMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('mapbox-token');
        
        if (fnError) {
          const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
          if (envToken) {
            setMapboxToken(envToken);
          }
        } else if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error('Failed to get Mapbox token:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || routes.length === 0) return;

    mapboxgl.accessToken = mapboxToken;

    // Calculate bounds from all routes
    const allWaypoints = routes.flatMap(r => r.route.waypoints);
    if (allWaypoints.length < 2) return;

    const lons = allWaypoints.map(w => w.lon);
    const lats = allWaypoints.map(w => w.lat);
    const bounds = new mapboxgl.LngLatBounds(
      [Math.min(...lons) - 5, Math.min(...lats) - 5],
      [Math.max(...lons) + 5, Math.max(...lats) + 5]
    );

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      bounds: bounds,
      fitBoundsOptions: { padding: 40 }
    });

    map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current?.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      clearMarkers();
      map.current?.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, [mapboxToken, routes.length, clearMarkers]);

  // Draw routes when map is loaded
  useEffect(() => {
    if (!map.current || !mapLoaded || routes.length === 0) return;

    clearMarkers();

    // Remove any existing route layers/sources
    routes.forEach((_, index) => {
      const sourceId = `comparison-route-${index}`;
      const layerId = `comparison-line-${index}`;
      const glowLayerId = `comparison-glow-${index}`;
      
      if (map.current?.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current?.getLayer(glowLayerId)) map.current.removeLayer(glowLayerId);
      if (map.current?.getSource(sourceId)) map.current.removeSource(sourceId);
    });

    // Add each route with distinct color
    routes.forEach((routeData, index) => {
      if (!map.current) return;

      const color = routeData.color || COMPARISON_COLORS[index % COMPARISON_COLORS.length];
      const sourceId = `comparison-route-${index}`;
      const coords = routeData.route.waypoints.map(w => [w.lon, w.lat]);

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: routeData.name },
          geometry: {
            type: 'LineString',
            coordinates: coords
          }
        }
      });

      // Add glow layer
      map.current.addLayer({
        id: `comparison-glow-${index}`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': 12,
          'line-opacity': 0.25,
          'line-blur': 3
        }
      });

      // Add main line
      map.current.addLayer({
        id: `comparison-line-${index}`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': 4,
          'line-opacity': 0.9
        }
      });

      // Add start marker (only for first route to avoid clutter, or if origins differ)
      const startWp = routeData.route.waypoints[0];
      const endWp = routeData.route.waypoints[routeData.route.waypoints.length - 1];

      // Start marker
      if (index === 0) {
        const startEl = document.createElement('div');
        startEl.style.cssText = `
          width: 20px;
          height: 20px;
          background: #10b981;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;

        const startMarker = new mapboxgl.Marker(startEl)
          .setLngLat([startWp.lon, startWp.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div style="padding: 8px;"><strong>Origem</strong><br/><small>${startWp.name || `${startWp.lat.toFixed(2)}, ${startWp.lon.toFixed(2)}`}</small></div>`)
          )
          .addTo(map.current);
        markersRef.current.push(startMarker);
      }

      // End marker with route color
      const endEl = document.createElement('div');
      endEl.style.cssText = `
        width: 16px;
        height: 16px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;

      const endMarker = new mapboxgl.Marker(endEl)
        .setLngLat([endWp.lon, endWp.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px;">
                <strong style="color: ${color};">Rota ${index + 1}: ${routeData.name}</strong>
                <br/>
                <small>${endWp.name || `${endWp.lat.toFixed(2)}, ${endWp.lon.toFixed(2)}`}</small>
                <br/>
                <small>${routeData.route.totalDistance.toFixed(0)} nm</small>
              </div>
            `)
        )
        .addTo(map.current);
      markersRef.current.push(endMarker);
    });
  }, [routes, mapLoaded, clearMarkers]);

  if (loading) {
    return <Skeleton className={cn("rounded-lg", className)} style={{ height }} />;
  }

  if (!mapboxToken) {
    return (
      <div 
        className={cn("bg-muted/50 rounded-lg flex items-center justify-center", className)}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">Mapa indisponível - Token não configurado</p>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)} style={{ height }}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg p-2 space-y-1">
        {routes.map((routeData, index) => (
          <div key={routeData.id} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: routeData.color || COMPARISON_COLORS[index % COMPARISON_COLORS.length] }}
            />
            <span className="text-xs font-medium truncate max-w-[120px]">
              Rota {index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RouteComparisonMap;
