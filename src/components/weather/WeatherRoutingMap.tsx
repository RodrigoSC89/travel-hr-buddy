/**
 * Weather Routing Map Component
 * Visualizes alternative routes, hazard zones, and real-time vessel position on Mapbox
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from '@/lib/mapbox-shim';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Map, Loader2, MapPin, Route, Shield, CloudRain, Layers, Ship, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AlternativeRoute, HazardZone, Waypoint } from '@/lib/routing/weather-routing';
import { cn } from '@/lib/utils';

interface VesselPosition {
  lat: number;
  lon: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

interface WeatherRoutingMapProps {
  routes: AlternativeRoute[];
  hazardZones: HazardZone[];
  selectedRouteId?: string;
  onRouteSelect?: (route: AlternativeRoute) => void;
  className?: string;
  showVesselAnimation?: boolean;
  vesselPosition?: VesselPosition;
}

const ROUTE_COLORS: Record<string, string> = {
  direct: '#3b82f6',           // Blue
  weather_avoidance: '#10b981', // Green
  fuel_optimized: '#f59e0b',   // Amber
  time_optimized: '#8b5cf6',   // Purple
};

const RISK_COLORS: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  severe: '#ef4444',
};

export function WeatherRoutingMap({
  routes,
  hazardZones,
  selectedRouteId,
  onRouteSelect,
  className,
  showVesselAnimation = true,
  vesselPosition: externalVesselPosition
}: WeatherRoutingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const vesselMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllRoutes, setShowAllRoutes] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [currentVesselPosition, setCurrentVesselPosition] = useState<VesselPosition | null>(
    externalVesselPosition || null
  );

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('mapbox-token');
        
        if (fnError) {
          const safeEnv = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}) as Record<string, string | undefined>;
          const envToken = safeEnv.VITE_MAPBOX_TOKEN || "";
          if (envToken) {
            setMapboxToken(envToken);
          } else {
            throw new Error('Mapbox token not available');
          }
        } else if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        console.error('Failed to get Mapbox token:', err);
        setError('Mapbox token not configured');
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
    const allWaypoints = routes.flatMap(r => r.waypoints);
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
      fitBoundsOptions: { padding: 50 }
    });

    map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current?.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.current?.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      vesselMarkerRef.current?.remove();
      clearMarkers();
      map.current?.remove();
      map.current = null;
      setMapLoaded(false);
    };
  }, [mapboxToken, routes.length > 0, clearMarkers]);

  // Update routes and markers when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded || routes.length === 0) return;

    clearMarkers();

    // Remove existing sources and layers
    routes.forEach((route, index) => {
      const sourceId = `route-${route.id}`;
      const layerId = `route-line-${route.id}`;
      const glowLayerId = `route-glow-${route.id}`;
      
      if (map.current?.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current?.getLayer(glowLayerId)) map.current.removeLayer(glowLayerId);
      if (map.current?.getSource(sourceId)) map.current.removeSource(sourceId);
    });

    // Remove hazard sources/layers
    hazardZones.forEach(zone => {
      const sourceId = `hazard-${zone.id}`;
      const layerId = `hazard-fill-${zone.id}`;
      const outlineId = `hazard-outline-${zone.id}`;
      
      if (map.current?.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current?.getLayer(outlineId)) map.current.removeLayer(outlineId);
      if (map.current?.getSource(sourceId)) map.current.removeSource(sourceId);
    });

    // Add hazard zones as polygons
    hazardZones.forEach(zone => {
      if (!map.current) return;

      const sourceId = `hazard-${zone.id}`;
      const color = zone.type === 'piracy' ? '#ef4444' : 
                   zone.type === 'weather' ? '#f97316' : '#f59e0b';

      // Create polygon from zone
      const coords = zone.polygon.map(p => [p.lon, p.lat]);
      coords.push(coords[0]); // Close polygon

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: zone.name, type: zone.type },
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          }
        }
      });

      map.current.addLayer({
        id: `hazard-fill-${zone.id}`,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.2
        }
      });

      map.current.addLayer({
        id: `hazard-outline-${zone.id}`,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': color,
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });

      // Add hazard label
      const centerLat = zone.polygon.reduce((sum, p) => sum + p.lat, 0) / zone.polygon.length;
      const centerLon = zone.polygon.reduce((sum, p) => sum + p.lon, 0) / zone.polygon.length;

      const el = document.createElement('div');
      el.className = 'hazard-marker';
      el.style.cssText = `
        padding: 4px 8px;
        background: ${color};
        color: white;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
      `;
      el.innerHTML = zone.type === 'piracy' ? `🏴‍☠️ ${zone.name}` : `⚠️ ${zone.name}`;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([centerLon, centerLat])
        .addTo(map.current);
      markersRef.current.push(marker);
    });

    // Add routes
    routes.forEach((route, index) => {
      if (!map.current) return;

      const isSelected = route.id === selectedRouteId;
      const shouldShow = showAllRoutes || isSelected;
      
      if (!shouldShow) return;

      const sourceId = `route-${route.id}`;
      const color = ROUTE_COLORS[route.type] || '#3b82f6';
      const coords = route.waypoints.map(w => [w.lon, w.lat]);

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: route.name, type: route.type },
          geometry: {
            type: 'LineString',
            coordinates: coords
          }
        }
      });

      // Add glow layer
      map.current.addLayer({
        id: `route-glow-${route.id}`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': isSelected ? 16 : 10,
          'line-opacity': isSelected ? 0.3 : 0.15,
          'line-blur': 4
        }
      });

      // Add main line
      map.current.addLayer({
        id: `route-line-${route.id}`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': isSelected ? 5 : 3,
          'line-opacity': isSelected ? 1 : 0.6
        }
      });

      // Add waypoint markers
      const mapInstance = map.current;
      if (!mapInstance) return;
      
      route.waypoints.forEach((wp, wpIndex) => {
        const isStart = wpIndex === 0;
        const isEnd = wpIndex === route.waypoints.length - 1;
        
        // Only show start/end markers for each route
        if (!isStart && !isEnd) return;

        const el = document.createElement('div');
        el.style.cssText = `
          width: ${isStart || isEnd ? '20px' : '12px'};
          height: ${isStart || isEnd ? '20px' : '12px'};
          background: ${isStart ? '#10b981' : isEnd ? '#ef4444' : color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([wp.lon, wp.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <strong>${wp.name || (isStart ? 'Origem' : 'Destino')}</strong>
                  <br/>
                  <small>${wp.lat.toFixed(4)}, ${wp.lon.toFixed(4)}</small>
                </div>
              `)
          )
          .addTo(mapInstance);
        markersRef.current.push(marker);
      });

      // Add weather risk markers along route
      route.weatherRisks.forEach((risk, riskIndex) => {
        const riskColor = RISK_COLORS[risk.severity] || '#f59e0b';
        
        const el = document.createElement('div');
        el.style.cssText = `
          width: 24px;
          height: 24px;
          background: ${riskColor};
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        el.innerHTML = risk.type === 'weather' ? '🌊' : '⚠️';

        const marker = new mapboxgl.Marker(el)
          .setLngLat([risk.position.lon, risk.position.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <strong style="color: ${riskColor};">${risk.severity.toUpperCase()}</strong>
                  <br/>
                  ${risk.description}
                </div>
              `)
          )
          .addTo(mapInstance);
        markersRef.current.push(marker);
      });
    });
  }, [routes, hazardZones, selectedRouteId, showAllRoutes, mapLoaded, clearMarkers]);

  // Create vessel marker
  const createVesselMarker = useCallback((position: VesselPosition) => {
    if (!map.current) return null;

    // Remove existing vessel marker
    vesselMarkerRef.current?.remove();

    const el = document.createElement('div');
    el.className = 'vessel-marker animate-pulse';
    el.style.cssText = `
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
      cursor: pointer;
      transform: rotate(${position.heading || 0}deg);
      transition: transform 0.5s ease-out;
    `;
    el.innerHTML = '🚢';

    const marker = new mapboxgl.Marker(el)
      .setLngLat([position.lon, position.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <strong>🚢 Posição Atual</strong>
              <br/>
              <small>Lat: ${position.lat.toFixed(4)}°</small>
              <br/>
              <small>Lon: ${position.lon.toFixed(4)}°</small>
              ${position.speed ? `<br/><small>Velocidade: ${position.speed.toFixed(1)} nós</small>` : ''}
              ${position.heading ? `<br/><small>Rumo: ${position.heading.toFixed(0)}°</small>` : ''}
              <br/>
              <small>Atualizado: ${position.timestamp.toLocaleTimeString("pt-BR")}</small>
            </div>
          `)
      )
      .addTo(map.current);

    vesselMarkerRef.current = marker;
    return marker;
  }, []);

  // Update vessel position when external position changes
  useEffect(() => {
    if (externalVesselPosition && mapLoaded) {
      setCurrentVesselPosition(externalVesselPosition);
      createVesselMarker(externalVesselPosition);
    }
  }, [externalVesselPosition, mapLoaded, createVesselMarker]);

  // Animation along route
  const startRouteAnimation = useCallback(() => {
    if (!map.current || routes.length === 0) return;

    const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];
    const waypoints = selectedRoute.waypoints;
    if (waypoints.length < 2) return;

    setIsAnimating(true);
    let progress = 0;
    const totalSteps = 200; // Animation smoothness
    const animationDuration = 15000; // 15 seconds total
    const stepDuration = animationDuration / totalSteps;

    // Calculate total distance and cumulative distances
    const distances: number[] = [0];
    let totalDistance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const d = Math.sqrt(
        Math.pow(waypoints[i].lat - waypoints[i-1].lat, 2) +
        Math.pow(waypoints[i].lon - waypoints[i-1].lon, 2)
      );
      totalDistance += d;
      distances.push(totalDistance);
    }

    const animate = () => {
      if (progress >= 1) {
        setIsAnimating(false);
        setAnimationProgress(100);
        return;
      }

      const currentDistance = progress * totalDistance;
      
      // Find current segment
      let segmentIndex = 0;
      for (let i = 1; i < distances.length; i++) {
        if (distances[i] >= currentDistance) {
          segmentIndex = i - 1;
          break;
        }
      }

      // Interpolate position within segment
      const segmentStart = distances[segmentIndex];
      const segmentEnd = distances[segmentIndex + 1] || totalDistance;
      const segmentProgress = (currentDistance - segmentStart) / (segmentEnd - segmentStart);

      const startWp = waypoints[segmentIndex];
      const endWp = waypoints[segmentIndex + 1] || waypoints[waypoints.length - 1];

      const lat = startWp.lat + (endWp.lat - startWp.lat) * segmentProgress;
      const lon = startWp.lon + (endWp.lon - startWp.lon) * segmentProgress;
      
      // Calculate heading
      const heading = Math.atan2(endWp.lon - startWp.lon, endWp.lat - startWp.lat) * (180 / Math.PI);

      const position: VesselPosition = {
        lat,
        lon,
        heading: (heading + 360) % 360,
        speed: 14,
        timestamp: new Date(),
      };

      setCurrentVesselPosition(position);
      createVesselMarker(position);
      setAnimationProgress(Math.round(progress * 100));

      progress += 1 / totalSteps;
      animationRef.current = requestAnimationFrame(() => {
        setTimeout(animate, stepDuration);
      });
    };

    animate();
  }, [routes, selectedRouteId, createVesselMarker]);

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !mapboxToken) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-4 w-4" />
            Mapa de Rotas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          <div className="text-center">
            <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Configure MAPBOX_PUBLIC_TOKEN para visualizar o mapa</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (routes.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-4 w-4" />
            Mapa de Rotas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-4 w-4" />
            Mapa de Rotas
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Animation controls */}
            {showVesselAnimation && (
              <Button
                variant={isAnimating ? "destructive" : "default"}
                size="sm"
                onClick={isAnimating ? stopAnimation : startRouteAnimation}
                className="text-xs"
              >
                {isAnimating ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Parar ({animationProgress}%)
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Simular Viagem
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllRoutes(!showAllRoutes)}
              className="text-xs"
            >
              <Layers className="h-3 w-3 mr-1" />
              {showAllRoutes ? 'Mostrar Selecionada' : 'Mostrar Todas'}
            </Button>
            
            {/* Route legends */}
            <div className="flex items-center gap-1">
              {routes.map(route => (
                <Badge
                  key={route.id}
                  variant="outline"
                  className={cn(
                    "text-xs cursor-pointer transition-all",
                    route.id === selectedRouteId && "ring-2 ring-primary"
                  )}
                  style={{ borderColor: ROUTE_COLORS[route.type] }}
                  onClick={() => onRouteSelect?.(route)}
                >
                  <div
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ background: ROUTE_COLORS[route.type] }}
                  />
                  {route.name}
                </Badge>
              ))}
            </div>

            {/* Vessel position indicator */}
            {currentVesselPosition && (
              <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500 text-blue-600">
                <Ship className="h-3 w-3 mr-1" />
                {currentVesselPosition.lat.toFixed(2)}°, {currentVesselPosition.lon.toFixed(2)}°
              </Badge>
            )}

            {hazardZones.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {hazardZones.length} Zona(s)
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div ref={mapContainer} className="h-[400px] rounded-b-lg" />
        
        {/* Animation progress bar */}
        {isAnimating && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${animationProgress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherRoutingMap;
