/**
 * Route Map Component - Mapbox visualization
 * Shows route with waypoints, weather conditions, and hazard zones
 * PATCH 1010: Fixed mapbox-gl loading using async getMapboxGLAsync
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getMapboxGLAsync, isMapboxLoaded, type MapboxGLInterface } from '@/lib/mapbox-shim';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Map, Loader2, RefreshCw, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface Waypoint {
  lat: number;
  lon: number;
  name: string;
}

interface WeatherData {
  location: string;
  lat: number;
  lon: number;
  temperature?: number;
  windSpeed?: number;
  waveHeight?: number;
  condition?: string;
  maritimeCondition: 'safe' | 'caution' | 'warning' | 'danger';
}

interface HazardZone {
  name: string;
  lat: number;
  lon: number;
  risk: 'piracy' | 'weather';
  severity: string;
  active: boolean;
}

interface RouteMapProps {
  waypoints: Waypoint[];
  weather?: WeatherData[];
  hazards?: HazardZone[];
  selectedRouteId?: string;
  className?: string;
  height?: string;
}

const MARITIME_CONDITION_COLORS: Record<string, string> = {
  safe: 'hsl(var(--success))',
  caution: 'hsl(var(--warning))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--destructive))',
};

export function RouteMap({ 
  waypoints, 
  weather = [], 
  hazards = [],
  className,
  height = '450px'
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mapbox GL Map instance has complex internal type
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Array<{ remove: () => void }>>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [mapboxgl, setMapboxgl] = useState<MapboxGLInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        
        // Load mapbox-gl library first
        const mbgl = await getMapboxGLAsync();
        setMapboxgl(mbgl);
        
        // Now fetch token
        const { data, error: fnError } = await supabase.functions.invoke('mapbox-token');
        
        if (fnError) {
          logger.error('Edge function error:', fnError);
          // Fallback to env variable
          const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
          if (envToken) {
            setMapboxToken(envToken);
          } else {
            throw new Error('Mapbox token not available');
          }
        } else if (data?.token) {
          setMapboxToken(data.token);
        } else {
          throw new Error('Token not returned from edge function');
        }
      } catch (err) {
        logger.error('Failed to get Mapbox token:', err);
        setError('Mapbox token não configurado');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  // Clean up markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (e) {
        // Ignore
      }
    });
    markersRef.current = [];
  }, []);

  // Initialize map when token and library are available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !mapboxgl || waypoints.length < 2) return;
    if (mapRef.current) return; // Already initialized

    try {
      // Set token
      mapboxgl.accessToken = mapboxToken;

      // Calculate bounds
      const lons = waypoints.map(w => w.lon);
      const lats = waypoints.map(w => w.lat);
      
      const minLon = Math.min(...lons) - 10;
      const maxLon = Math.max(...lons) + 10;
      const minLat = Math.min(...lats) - 10;
      const maxLat = Math.max(...lats) + 10;

      const bounds = new mapboxgl.LngLatBounds(
        [minLon, minLat],
        [maxLon, maxLat]
      );

      // Create map
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        bounds: bounds,
        fitBoundsOptions: { padding: 60 },
        attributionControl: false,
        antialias: true
      });

      mapRef.current = map;

      // Add navigation control
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

      map.on('load', () => {
        if (!mapRef.current) return;
        
        // Add route line
        const routeCoordinates = waypoints.map(w => [w.lon, w.lat]);
        
        // Add curved line source
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: routeCoordinates
            }
          }
        });

        // Outer glow
        map.addLayer({
          id: 'route-glow-outer',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#60a5fa',
            'line-width': 16,
            'line-opacity': 0.15,
            'line-blur': 8
          }
        });

        // Inner glow
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 10,
            'line-opacity': 0.3,
            'line-blur': 4
          }
        });

        // Main route line
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 1
          }
        });

        // Animated dash line
        map.addLayer({
          id: 'route-dash',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 2,
            'line-opacity': 0.5,
            'line-dasharray': [2, 4]
          }
        });

        // Add waypoint markers
        waypoints.forEach((waypoint, index) => {
          const isStart = index === 0;
          const isEnd = index === waypoints.length - 1;
          
          const el = document.createElement('div');
          el.className = 'waypoint-marker';
          el.style.cssText = `
            width: ${isStart || isEnd ? '28px' : '18px'};
            height: ${isStart || isEnd ? '28px' : '18px'};
            background: ${isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 4px ${isStart ? 'rgba(16,185,129,0.3)' : isEnd ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.2)'};
            cursor: pointer;
            transition: transform 0.2s;
          `;
          el.onmouseenter = () => { el.style.transform = 'scale(1.2)'; };
          el.onmouseleave = () => { el.style.transform = 'scale(1)'; };

          const marker = new mapboxgl.Marker(el)
            .setLngLat([waypoint.lon, waypoint.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false })
                .setHTML(`
                  <div style="padding: 12px; font-family: system-ui, sans-serif;">
                    <strong style="font-size: 14px; color: #1e293b;">${waypoint.name}</strong>
                    <br/>
                    <small style="color: #64748b;">
                      ${waypoint.lat.toFixed(4)}°, ${waypoint.lon.toFixed(4)}°
                    </small>
                    <br/>
                    <span style="
                      display: inline-block;
                      margin-top: 8px;
                      padding: 2px 8px;
                      background: ${isStart ? '#dcfce7' : isEnd ? '#fee2e2' : '#dbeafe'};
                      color: ${isStart ? '#166534' : isEnd ? '#991b1b' : '#1d4ed8'};
                      border-radius: 4px;
                      font-size: 11px;
                      font-weight: 600;
                    ">
                      ${isStart ? '🚢 PARTIDA' : isEnd ? '🏁 CHEGADA' : '📍 WAYPOINT'}
                    </span>
                  </div>
                `)
            )
            .addTo(map);
          
          markersRef.current.push(marker);
        });

        // Add weather markers
        weather.forEach((w) => {
          const color = MARITIME_CONDITION_COLORS[w.maritimeCondition] || '#6b7280';
          
          const el = document.createElement('div');
          el.className = 'weather-marker';
          el.style.cssText = `
            width: 36px;
            height: 36px;
            background: ${color};
            border: 2px solid white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: transform 0.2s;
          `;
          el.onmouseenter = () => { el.style.transform = 'scale(1.15)'; };
          el.onmouseleave = () => { el.style.transform = 'scale(1)'; };
          
          el.innerHTML = w.maritimeCondition === 'danger' ? '⛈️' : 
                         w.maritimeCondition === 'warning' ? '⚡' :
                         w.maritimeCondition === 'caution' ? '☁️' : '☀️';

          const marker = new mapboxgl.Marker(el)
            .setLngLat([w.lon, w.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false })
                .setHTML(`
                  <div style="padding: 12px; font-family: system-ui, sans-serif;">
                    <strong style="font-size: 14px; color: #1e293b;">${w.location}</strong>
                    <br/>
                    <span style="
                      display: inline-block;
                      margin: 8px 0;
                      padding: 4px 12px;
                      background: ${color}20;
                      color: ${color};
                      border-radius: 4px;
                      font-size: 12px;
                      font-weight: 700;
                      text-transform: uppercase;
                    ">
                      ${w.maritimeCondition}
                    </span>
                    <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                      ${w.windSpeed ? `💨 ${w.windSpeed.toFixed(0)} kt` : ''}
                      ${w.waveHeight ? ` | 🌊 ${w.waveHeight.toFixed(1)}m` : ''}
                      ${w.temperature ? ` | 🌡️ ${w.temperature.toFixed(0)}°C` : ''}
                    </div>
                  </div>
                `)
            )
            .addTo(map);
          
          markersRef.current.push(marker);
        });

        // Add hazard zones
        hazards.filter(h => h.active).forEach((hazard) => {
          const el = document.createElement('div');
          el.className = 'hazard-marker';
          el.style.cssText = `
            width: 44px;
            height: 44px;
            background: rgba(239, 68, 68, 0.25);
            border: 2px dashed #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            animation: hazardPulse 2s infinite;
            font-size: 20px;
          `;
          el.innerHTML = hazard.risk === 'piracy' ? '🏴‍☠️' : '🌀';

          const marker = new mapboxgl.Marker(el)
            .setLngLat([hazard.lon, hazard.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false })
                .setHTML(`
                  <div style="padding: 12px; font-family: system-ui, sans-serif;">
                    <strong style="font-size: 14px; color: #dc2626;">⚠️ ${hazard.name}</strong>
                    <br/>
                    <div style="margin-top: 8px; font-size: 12px;">
                      <div style="color: #64748b;">Tipo: <strong style="color: #1e293b;">${hazard.risk.toUpperCase()}</strong></div>
                      <div style="color: #64748b;">Severidade: <strong style="color: #dc2626;">${hazard.severity}</strong></div>
                    </div>
                  </div>
                `)
            )
            .addTo(map);
          
          markersRef.current.push(marker);
        });

        setMapReady(true);
      });

      map.on('error', (e: Record<string, unknown>) => {
        logger.error('Map error:', e);
      });

    } catch (err) {
      logger.error('Failed to initialize map:', err);
      setError('Falha ao inicializar o mapa');
    }

    return () => {
      clearMarkers();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapboxToken, mapboxgl, waypoints, weather, hazards, clearMarkers]);

  // Handle zoom
  const handleZoom = (delta: number) => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.easeTo({ zoom: currentZoom + delta, duration: 300 });
    }
  };

  // Handle fit bounds
  const handleFitBounds = () => {
    if (mapRef.current && waypoints.length >= 2) {
      const lons = waypoints.map(w => w.lon);
      const lats = waypoints.map(w => w.lat);
      
      const bounds = new mapboxgl!.LngLatBounds(
        [Math.min(...lons) - 5, Math.min(...lats) - 5],
        [Math.max(...lons) + 5, Math.max(...lats) + 5]
      );
      
      mapRef.current.fitBounds(bounds, { padding: 60, duration: 1000 });
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className={cn("flex items-center justify-center", `h-[${height}]`)} style={{ height }}>
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando mapa...</p>
          </div>
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
            Mapa da Rota
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center text-muted-foreground" style={{ height: '300px' }}>
          <div className="text-center">
            <Map className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Mapa não disponível</p>
            <p className="text-sm text-muted-foreground">
              {error || 'Configure MAPBOX_PUBLIC_TOKEN para visualizar o mapa'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className, isFullscreen && "fixed inset-4 z-50")}>
      <CardHeader className="pb-2 bg-card/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-4 w-4 text-primary" />
            Mapa da Rota
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
              Partida
            </Badge>
            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
              Chegada
            </Badge>
            {hazards.filter(h => h.active).length > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                {hazards.filter(h => h.active).length} Zonas de Risco
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div 
          ref={mapContainer} 
          className="w-full rounded-b-lg"
          style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}
        />
        
        {/* Map controls overlay */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 shadow-lg bg-background/90 backdrop-blur-sm"
            onClick={() => handleZoom(1)}
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 shadow-lg bg-background/90 backdrop-blur-sm"
            onClick={() => handleZoom(-1)}
            aria-label="Diminuir zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-8 w-8 shadow-lg bg-background/90 backdrop-blur-sm"
            onClick={handleFitBounds}
            aria-label="Ajustar mapa aos limites"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-muted-foreground">Condição Segura</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-muted-foreground">Atenção</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-muted-foreground">Alerta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-muted-foreground">Perigo</span>
          </div>
        </div>

        <style>{`
          @keyframes hazardPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.7; }
          }
          .mapboxgl-popup-content {
            background: white;
            border-radius: 8px;
            padding: 0;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          }
          .mapboxgl-popup-tip {
            border-top-color: white;
          }
        `}</style>
      </CardContent>
    </Card>
  );
}

export default RouteMap;
