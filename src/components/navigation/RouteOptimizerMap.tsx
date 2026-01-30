/**
 * Route Optimizer Map - Advanced Mapbox visualization with real data
 * PATCH 1003: Full map with routes, vessels, weather and hazards
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Map, 
  Loader2, 
  Navigation, 
  Waves, 
  Wind, 
  AlertTriangle,
  Ship,
  Anchor,
  LocateFixed,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Waypoint {
  lat: number;
  lon: number;
  name: string;
  type?: 'departure' | 'arrival' | 'waypoint';
}

interface RouteSegment {
  id: string;
  name: string;
  coordinates: [number, number][];
  color: string;
  isRecommended?: boolean;
}

interface WeatherMarker {
  lat: number;
  lon: number;
  location: string;
  temperature?: number;
  windSpeed?: number;
  waveHeight?: number;
  condition: 'safe' | 'caution' | 'warning' | 'danger';
}

interface HazardZone {
  name: string;
  lat: number;
  lon: number;
  radius: number;
  type: 'piracy' | 'weather' | 'eca';
  severity: 'low' | 'medium' | 'high';
}

interface VesselMarker {
  id: string;
  name: string;
  lat: number;
  lon: number;
  course: number;
  speed: number;
  status: string;
}

interface RouteOptimizerMapProps {
  waypoints: Waypoint[];
  routes?: RouteSegment[];
  weather?: WeatherMarker[];
  hazards?: HazardZone[];
  vessels?: VesselMarker[];
  selectedRouteId?: string;
  onRouteSelect?: (routeId: string) => void;
  showVessels?: boolean;
  showWeather?: boolean;
  showHazards?: boolean;
  className?: string;
}

const CONDITION_COLORS: Record<string, string> = {
  safe: '#10b981',
  caution: '#f59e0b',
  warning: '#f97316',
  danger: '#ef4444',
};

const CONDITION_ICONS: Record<string, string> = {
  safe: '☀️',
  caution: '⛅',
  warning: '🌧️',
  danger: '🌪️',
};

export function RouteOptimizerMap({ 
  waypoints, 
  routes = [],
  weather = [], 
  hazards = [],
  vessels = [],
  selectedRouteId,
  onRouteSelect,
  showVessels = true,
  showWeather = true,
  showHazards = true,
  className 
}: RouteOptimizerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'dark' | 'navigation'>('dark');

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('mapbox-token');
        
        if (fnError) throw fnError;
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          throw new Error('Token não encontrado');
        }
      } catch (err) {
        console.error('Failed to get Mapbox token:', err);
        setError('Token do Mapbox não configurado');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  // Clean up markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    const initMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        mapboxgl.accessToken = mapboxToken;

        // Calculate bounds from waypoints
        const allPoints = [
          ...waypoints.map(w => [w.lon, w.lat]),
          ...weather.map(w => [w.lon, w.lat]),
          ...vessels.map(v => [v.lon, v.lat]),
        ];

        let center: [number, number] = [-40, -15];
        let zoom = 3;

        if (allPoints.length >= 2) {
          const lons = allPoints.map(p => p[0]);
          const lats = allPoints.map(p => p[1]);
          center = [
            (Math.min(...lons) + Math.max(...lons)) / 2,
            (Math.min(...lats) + Math.max(...lats)) / 2
          ];
        }

        const styles: Record<string, string> = {
          dark: 'mapbox://styles/mapbox/dark-v11',
          satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
          navigation: 'mapbox://styles/mapbox/navigation-night-v1',
        };

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: styles[activeLayer],
          center,
          zoom,
          pitch: 20,
          bearing: 0,
          projection: 'mercator' as any,
        });

        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
        map.current.addControl(new mapboxgl.ScaleControl({ maxWidth: 200, unit: 'nautical' }), 'bottom-left');

        // Fit bounds if we have waypoints
        if (waypoints.length >= 2) {
          const lons = waypoints.map(w => w.lon);
          const lats = waypoints.map(w => w.lat);
          const bounds = new mapboxgl.LngLatBounds(
            [Math.min(...lons) - 5, Math.min(...lats) - 5],
            [Math.max(...lons) + 5, Math.max(...lats) + 5]
          );
          map.current.fitBounds(bounds, { padding: 60, duration: 1000 });
        }

        map.current.on('load', () => {
          setMapLoaded(true);
          addMapLayers(mapboxgl);
        });

        map.current.on('error', (e: any) => {
          console.error('Mapbox error:', e);
        });

      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError('Erro ao carregar o mapa');
      }
    };

    initMap();

    return () => {
      clearMarkers();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, activeLayer]);

  // Add layers when map loads
  const addMapLayers = async (mapboxgl: any) => {
    if (!map.current || !mapLoaded) return;

    try {
      // Add route sources and layers for each route
      routes.forEach((route, index) => {
        const sourceId = `route-${route.id}`;
        const layerId = `route-layer-${route.id}`;
        const glowLayerId = `route-glow-${route.id}`;

        if (map.current.getSource(sourceId)) {
          map.current.removeLayer(glowLayerId);
          map.current.removeLayer(layerId);
          map.current.removeSource(sourceId);
        }

        map.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { id: route.id, name: route.name },
            geometry: {
              type: 'LineString',
              coordinates: route.coordinates
            }
          }
        });

        // Glow layer
        map.current.addLayer({
          id: glowLayerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': route.color,
            'line-width': selectedRouteId === route.id ? 16 : 10,
            'line-opacity': selectedRouteId === route.id ? 0.3 : 0.15,
            'line-blur': 6
          }
        });

        // Main route line
        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': route.color,
            'line-width': selectedRouteId === route.id ? 5 : 3,
            'line-opacity': selectedRouteId === route.id ? 1 : 0.6,
            'line-dasharray': route.isRecommended ? [1, 0] : [2, 2]
          }
        });

        // Click handler
        map.current.on('click', layerId, () => {
          onRouteSelect?.(route.id);
        });

        map.current.on('mouseenter', layerId, () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', layerId, () => {
          map.current.getCanvas().style.cursor = '';
        });
      });

      // If no routes, add default route from waypoints
      if (routes.length === 0 && waypoints.length >= 2) {
        const defaultRouteCoords = waypoints.map(w => [w.lon, w.lat]);
        
        if (!map.current.getSource('default-route')) {
          map.current.addSource('default-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: defaultRouteCoords }
            }
          });

          map.current.addLayer({
            id: 'default-route-glow',
            type: 'line',
            source: 'default-route',
            paint: {
              'line-color': '#3b82f6',
              'line-width': 12,
              'line-opacity': 0.2,
              'line-blur': 4
            }
          });

          map.current.addLayer({
            id: 'default-route-line',
            type: 'line',
            source: 'default-route',
            paint: {
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });
        }
      }

      // Add hazard zones as circles
      if (showHazards) {
        hazards.forEach((hazard, index) => {
          const sourceId = `hazard-${index}`;
          
          if (!map.current.getSource(sourceId)) {
            // Create circle polygon
            const center = [hazard.lon, hazard.lat];
            const radiusKm = hazard.radius;
            const points = 64;
            const coords: [number, number][] = [];
            
            for (let i = 0; i <= points; i++) {
              const angle = (i / points) * 2 * Math.PI;
              const dx = radiusKm * Math.cos(angle) / 111;
              const dy = radiusKm * Math.sin(angle) / (111 * Math.cos(hazard.lat * Math.PI / 180));
              coords.push([hazard.lon + dy, hazard.lat + dx]);
            }

            map.current.addSource(sourceId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: { name: hazard.name, type: hazard.type },
                geometry: { type: 'Polygon', coordinates: [coords] }
              }
            });

            const hazardColor = hazard.type === 'piracy' ? '#ef4444' : 
                               hazard.type === 'weather' ? '#f97316' : '#f59e0b';

            map.current.addLayer({
              id: `hazard-fill-${index}`,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color': hazardColor,
                'fill-opacity': 0.15
              }
            });

            map.current.addLayer({
              id: `hazard-line-${index}`,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': hazardColor,
                'line-width': 2,
                'line-dasharray': [3, 3]
              }
            });
          }
        });
      }

      // Add markers
      addMarkers(mapboxgl);

    } catch (err) {
      console.error('Error adding map layers:', err);
    }
  };

  // Add markers for waypoints, weather, vessels
  const addMarkers = async (mapboxgl: any) => {
    if (!map.current) return;
    
    clearMarkers();

    // Waypoint markers
    waypoints.forEach((waypoint, index) => {
      const isStart = index === 0 || waypoint.type === 'departure';
      const isEnd = index === waypoints.length - 1 || waypoint.type === 'arrival';
      
      const el = document.createElement('div');
      el.className = 'waypoint-marker';
      el.innerHTML = `
        <div style="
          width: ${isStart || isEnd ? '32px' : '20px'};
          height: ${isStart || isEnd ? '32px' : '20px'};
          background: ${isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6'};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isStart || isEnd ? '14px' : '10px'};
          color: white;
          font-weight: bold;
        ">
          ${isStart ? '⚓' : isEnd ? '🏁' : index}
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([waypoint.lon, waypoint.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, className: 'route-popup' })
            .setHTML(`
              <div style="padding: 12px; min-width: 180px;">
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
                  ${isStart ? '🚢 Partida' : isEnd ? '🏁 Chegada' : '📍 Waypoint'}
                </div>
                <div style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">
                  ${waypoint.name}
                </div>
                <div style="font-size: 12px; color: #888;">
                  ${waypoint.lat.toFixed(4)}°, ${waypoint.lon.toFixed(4)}°
                </div>
              </div>
            `)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });

    // Weather markers
    if (showWeather) {
      weather.forEach((w) => {
        const color = CONDITION_COLORS[w.condition];
        const icon = CONDITION_ICONS[w.condition];
        
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="
            width: 40px;
            height: 40px;
            background: ${color};
            border: 2px solid white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            transform: rotate(-10deg);
          ">
            ${icon}
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([w.lon, w.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 12px; min-width: 200px;">
                  <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">
                    🌊 ${w.location}
                  </div>
                  <div style="
                    display: inline-block;
                    background: ${color};
                    color: white;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                  ">
                    ${w.condition}
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                    ${w.windSpeed !== undefined ? `<div>💨 ${w.windSpeed.toFixed(0)} kt</div>` : ''}
                    ${w.waveHeight !== undefined ? `<div>🌊 ${w.waveHeight.toFixed(1)} m</div>` : ''}
                    ${w.temperature !== undefined ? `<div>🌡️ ${w.temperature.toFixed(0)}°C</div>` : ''}
                  </div>
                </div>
              `)
          )
          .addTo(map.current);

        markersRef.current.push(marker);
      });
    }

    // Vessel markers
    if (showVessels) {
      vessels.forEach((vessel) => {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="
            width: 36px;
            height: 36px;
            background: #0ea5e9;
            border: 2px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            transform: rotate(${vessel.course}deg);
          ">
            🚢
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([vessel.lon, vessel.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 12px; min-width: 200px;">
                  <div style="font-weight: 700; font-size: 15px; margin-bottom: 8px;">
                    ${vessel.name}
                  </div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 13px;">
                    <div>🚢 ${vessel.status}</div>
                    <div>🧭 ${vessel.course}°</div>
                    <div>⚡ ${vessel.speed} kt</div>
                  </div>
                </div>
              `)
          )
          .addTo(map.current);

        markersRef.current.push(marker);
      });
    }

    // Hazard markers
    if (showHazards) {
      hazards.forEach((hazard) => {
        const hazardIcon = hazard.type === 'piracy' ? '🏴‍☠️' : 
                          hazard.type === 'weather' ? '⛈️' : '🏭';
        
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="
            width: 44px;
            height: 44px;
            background: rgba(239, 68, 68, 0.9);
            border: 2px dashed white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            cursor: pointer;
            animation: pulse 2s infinite;
          ">
            ${hazardIcon}
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([hazard.lon, hazard.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 12px; min-width: 180px;">
                  <div style="color: #ef4444; font-weight: 700; font-size: 15px; margin-bottom: 6px;">
                    ⚠️ ${hazard.name}
                  </div>
                  <div style="font-size: 13px;">
                    <div>Tipo: ${hazard.type.toUpperCase()}</div>
                    <div>Raio: ${hazard.radius} km</div>
                    <div>Severidade: ${hazard.severity}</div>
                  </div>
                </div>
              `)
          )
          .addTo(map.current);

        markersRef.current.push(marker);
      });
    }
  };

  // Update markers when data changes
  useEffect(() => {
    if (mapLoaded && map.current) {
      const loadMapbox = async () => {
        const mapboxgl = (await import('mapbox-gl')).default;
        addMapLayers(mapboxgl);
      };
      loadMapbox();
    }
  }, [mapLoaded, waypoints, routes, weather, hazards, vessels, selectedRouteId, showVessels, showWeather, showHazards]);

  // Recenter map
  const handleRecenter = () => {
    if (!map.current || waypoints.length < 2) return;
    
    const lons = waypoints.map(w => w.lon);
    const lats = waypoints.map(w => w.lat);
    
    map.current.fitBounds([
      [Math.min(...lons) - 5, Math.min(...lats) - 5],
      [Math.max(...lons) + 5, Math.max(...lats) + 5]
    ], { padding: 60, duration: 1000 });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <Skeleton className="h-[500px] rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error || !mapboxToken) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-5 w-5" />
            Mapa da Rota
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-4">
            <Map className="h-16 w-16 mx-auto opacity-40" />
            <p className="text-muted-foreground">{error || 'Configure o token do Mapbox'}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            Mapa da Rota
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Layer badges */}
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success">
              <Anchor className="h-3 w-3 mr-1" />
              Partida
            </Badge>
            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive">
              <LocateFixed className="h-3 w-3 mr-1" />
              Chegada
            </Badge>
            {hazards.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {hazards.length} Zonas de Risco
              </Badge>
            )}
            {vessels.length > 0 && (
              <Badge variant="outline" className="text-xs bg-info/10 text-info border-info">
                <Ship className="h-3 w-3 mr-1" />
                {vessels.length} Navios
              </Badge>
            )}
          </div>
        </div>

        {/* Map controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex rounded-md border overflow-hidden">
            {(['dark', 'satellite', 'navigation'] as const).map((layer) => (
              <Button
                key={layer}
                variant={activeLayer === layer ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none px-3 text-xs h-7"
                onClick={() => setActiveLayer(layer)}
              >
                {layer === 'dark' && <Layers className="h-3 w-3 mr-1" />}
                {layer === 'satellite' && '🛰️'}
                {layer === 'navigation' && '🧭'}
                {layer === 'dark' ? 'Escuro' : layer === 'satellite' ? 'Satélite' : 'Nav'}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm" className="h-7 px-2" onClick={handleRecenter}>
            <LocateFixed className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        <div ref={mapContainer} className="h-[500px]" />
        
        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Carregando mapa...</p>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border text-xs space-y-2">
          <div className="font-medium mb-2">Legenda</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Partida</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>Chegada</span>
          </div>
          {routes.length > 0 && routes.map(route => (
            <div key={route.id} className="flex items-center gap-2">
              <div className="w-6 h-1 rounded" style={{ background: route.color }} />
              <span>{route.name}</span>
            </div>
          ))}
          {weather.length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t">
              <span className="text-muted-foreground">Condições:</span>
              {Object.entries(CONDITION_ICONS).map(([key, icon]) => (
                <span key={key} title={key}>{icon}</span>
              ))}
            </div>
          )}
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.7; }
          }
          .mapboxgl-popup-content {
            background: hsl(var(--card));
            color: hsl(var(--card-foreground));
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            border: 1px solid hsl(var(--border));
          }
          .mapboxgl-popup-tip {
            border-top-color: hsl(var(--card)) !important;
          }
          .mapboxgl-ctrl-group {
            background: hsl(var(--card)) !important;
            border-radius: 8px !important;
          }
          .mapboxgl-ctrl-group button {
            background: transparent !important;
          }
          .mapboxgl-ctrl-scale {
            background: hsl(var(--card)/0.9) !important;
            border-radius: 4px !important;
            color: hsl(var(--foreground)) !important;
            border-color: hsl(var(--border)) !important;
          }
        `}</style>
      </CardContent>
    </Card>
  );
}

export default RouteOptimizerMap;
