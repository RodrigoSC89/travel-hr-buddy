/**
 * Route Map Component - Mapbox visualization
 * Shows route with waypoints, weather conditions, and hazard zones
 */

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from '@/lib/mapbox-shim';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
}

const MARITIME_CONDITION_COLORS: Record<string, string> = {
  safe: '#10b981',
  caution: '#f59e0b',
  warning: '#f97316',
  danger: '#ef4444',
};

export function RouteMap({ waypoints, weather = [], hazards = [] }: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('mapbox-token');
        
        if (fnError) {
          // Fallback to env variable if edge function fails
          const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
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

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || waypoints.length < 2) return;

    mapboxgl.accessToken = mapboxToken;

    // Calculate bounds
    const lons = waypoints.map(w => w.lon);
    const lats = waypoints.map(w => w.lat);
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

    map.current?.on('load', () => {
      if (!map.current) return;

      // Add route line
      const routeCoordinates = waypoints.map(w => [w.lon, w.lat]);
      
      map.current.addSource('route', {
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

      map.current.addLayer({
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
          'line-opacity': 0.8
        }
      });

      // Add route glow
      map.current.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 12,
          'line-opacity': 0.2,
          'line-blur': 4
        }
      }, 'route-line');

      // Add waypoint markers
      const mapInstance = map.current;
      if (!mapInstance) return;
      
      waypoints.forEach((waypoint, index) => {
        const isStart = index === 0;
        const isEnd = index === waypoints.length - 1;
        
        const el = document.createElement('div');
        el.className = 'waypoint-marker';
        el.style.cssText = `
          width: ${isStart || isEnd ? '24px' : '16px'};
          height: ${isStart || isEnd ? '24px' : '16px'};
          background: ${isStart ? '#10b981' : isEnd ? '#ef4444' : '#3b82f6'};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        `;

        new mapboxgl.Marker(el)
          .setLngLat([waypoint.lon, waypoint.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <strong>${waypoint.name}</strong>
                  <br/>
                  <small>${waypoint.lat.toFixed(4)}, ${waypoint.lon.toFixed(4)}</small>
                </div>
              `)
          )
          .addTo(mapInstance);
      });

      // Add weather markers
      weather.forEach((w) => {
        const color = MARITIME_CONDITION_COLORS[w.maritimeCondition] || '#6b7280';
        
        const el = document.createElement('div');
        el.className = 'weather-marker';
        el.style.cssText = `
          width: 32px;
          height: 32px;
          background: ${color};
          border: 2px solid white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;
        el.innerHTML = w.maritimeCondition === 'danger' ? '⚠️' : 
                       w.maritimeCondition === 'warning' ? '⚡' :
                       w.maritimeCondition === 'caution' ? '☁️' : '☀️';

        new mapboxgl.Marker(el)
          .setLngLat([w.lon, w.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <strong>${w.location}</strong>
                  <br/>
                  <span style="color: ${color}; font-weight: bold;">${w.maritimeCondition.toUpperCase()}</span>
                  <br/>
                  ${w.windSpeed ? `Wind: ${w.windSpeed.toFixed(0)} kt` : ''}
                  ${w.waveHeight ? ` | Waves: ${w.waveHeight.toFixed(1)}m` : ''}
                  ${w.temperature ? ` | ${w.temperature.toFixed(0)}°C` : ''}
                </div>
              `)
          )
          .addTo(mapInstance);
      });

      // Add hazard zones
      hazards.filter(h => h.active).forEach((hazard) => {
        const el = document.createElement('div');
        el.className = 'hazard-marker';
        el.style.cssText = `
          width: 40px;
          height: 40px;
          background: rgba(239, 68, 68, 0.3);
          border: 2px dashed #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          animation: pulse 2s infinite;
        `;
        el.innerHTML = hazard.risk === 'piracy' ? '🏴‍☠️' : '🌊';

        new mapboxgl.Marker(el)
          .setLngLat([hazard.lon, hazard.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px; color: #ef4444;">
                  <strong>⚠️ ${hazard.name}</strong>
                  <br/>
                  Risk: ${hazard.risk.toUpperCase()}
                  <br/>
                  Severity: ${hazard.severity}
                </div>
              `)
          )
          .addTo(mapInstance);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, waypoints, weather, hazards]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !mapboxToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-4 w-4" />
            Mapa da Rota
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="h-4 w-4" />
            Mapa da Rota
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success">
              Partida
            </Badge>
            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive">
              Chegada
            </Badge>
            {hazards.filter(h => h.active).length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {hazards.filter(h => h.active).length} Zonas de Risco
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="h-[400px] rounded-b-lg" />
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
          }
        `}</style>
      </CardContent>
    </Card>
  );
}

export default RouteMap;
