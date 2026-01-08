/**
 * Vessel Tracking Map Component
 * Real-time AIS vessel positions on Mapbox
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from '@/lib/mapbox-shim';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ship, RefreshCw, Loader2, Anchor, Navigation, Clock, Gauge } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VesselPosition {
  mmsi: string;
  imo?: string;
  name: string;
  lat: number;
  lon: number;
  speed: number;
  course: number;
  heading: number;
  destination?: string;
  eta?: string;
  status: string;
  navStatus?: string;
  timestamp?: string;
  lastUpdate?: string;
}

interface VesselTrackingMapProps {
  onVesselSelect?: (vessel: VesselPosition) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function VesselTrackingMap({ 
  onVesselSelect, 
  autoRefresh = true, 
  refreshInterval = 60000 
}: VesselTrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vessels, setVessels] = useState<VesselPosition[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [source, setSource] = useState<'marinetraffic' | 'mock'>('mock');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('mapbox-token');
        
        if (fnError) {
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
      }
    };

    fetchToken();
  }, []);

  // Fetch vessel positions
  const fetchVessels = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('ais-tracking', {
        body: { operation: 'fleet-status' }
      });

      if (fnError) throw fnError;

      if (data?.vessels) {
        // Map API response to component format
        const mappedVessels = data.vessels.map((v: any) => ({
          mmsi: v.mmsi,
          imo: v.imo,
          name: v.name,
          lat: v.latitude ?? v.lat,
          lon: v.longitude ?? v.lon,
          speed: v.speed,
          course: v.course,
          heading: v.heading,
          destination: v.destination,
          eta: v.eta,
          status: v.navStatus || v.status || 'Unknown',
          timestamp: v.lastUpdate || v.timestamp,
        }));
        setVessels(mappedVessels);
        setSource(data.source || 'mock');
      }
    } catch (err) {
      console.error('Failed to fetch vessels:', err);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar posições AIS',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [toast]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchVessels();

    if (autoRefresh) {
      const interval = setInterval(fetchVessels, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchVessels, autoRefresh, refreshInterval]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update markers when vessels change
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance || !vessels.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    vessels.forEach(vessel => {
      const el = document.createElement('div');
      el.className = 'vessel-marker';
      
      const isMoving = vessel.speed > 0.5;
      const color = isMoving ? '#3b82f6' : '#10b981';
      
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transform: rotate(${vessel.heading}deg);
        transition: transform 0.3s ease;
      `;
      
      // SVG ship icon
      el.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
          <path d="M12 2L4 12h3v7h10v-7h3L12 2z"/>
        </svg>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([vessel.lon, vessel.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 12px; min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 8px;">${vessel.name}</h3>
                <div style="font-size: 12px; color: #666;">
                  <p><strong>MMSI:</strong> ${vessel.mmsi}</p>
                  <p><strong>Status:</strong> ${vessel.status}</p>
                  <p><strong>Speed:</strong> ${vessel.speed.toFixed(1)} kn</p>
                  <p><strong>Course:</strong> ${vessel.course.toFixed(0)}°</p>
                  <p><strong>Destination:</strong> ${vessel.destination || 'N/A'}</p>
                  ${vessel.eta ? `<p><strong>ETA:</strong> ${new Date(vessel.eta).toLocaleDateString()}</p>` : ''}
                </div>
              </div>
            `)
        )
        .addTo(mapInstance);

      el.addEventListener('click', () => {
        setSelectedVessel(vessel);
        onVesselSelect?.(vessel);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all vessels
    if (vessels.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      vessels.forEach(v => bounds.extend([v.lon, v.lat]));
      mapInstance.fitBounds(bounds, { padding: 50 });
    } else if (vessels.length === 1) {
      mapInstance.flyTo({ center: [vessels[0].lon, vessels[0].lat], zoom: 8 });
    }
  }, [vessels, onVesselSelect]);

  if (loading && !mapboxToken) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[500px]">
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
            <Ship className="h-4 w-4" />
            Rastreamento AIS
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px] text-muted-foreground">
          <div className="text-center">
            <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Configure MAPBOX_PUBLIC_TOKEN para visualizar o mapa</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Ship className="h-4 w-4" />
              Rastreamento AIS em Tempo Real
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {source === 'marinetraffic' ? '📡 API Real' : '🔧 Mock'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {vessels.length} embarcações
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={fetchVessels}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", refreshing && "animate-spin")} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={mapContainer} className="h-[500px] rounded-b-lg" />
        </CardContent>
      </Card>

      {/* Vessel List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vessels.map(vessel => (
          <Card 
            key={vessel.mmsi}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selectedVessel?.mmsi === vessel.mmsi && "border-primary"
            )}
            onClick={() => {
              setSelectedVessel(vessel);
              onVesselSelect?.(vessel);
              map.current?.flyTo({ center: [vessel.lon, vessel.lat], zoom: 10 });
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-sm">{vessel.name}</h4>
                  <p className="text-xs text-muted-foreground">{vessel.mmsi}</p>
                </div>
                <Badge variant={vessel.speed > 0.5 ? 'default' : 'secondary'} className="text-xs">
                  {vessel.speed > 0.5 ? 'Em viagem' : 'Parado'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Gauge className="h-3 w-3" />
                  {vessel.speed.toFixed(1)} kn
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Navigation className="h-3 w-3" />
                  {vessel.course.toFixed(0)}°
                </div>
                <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                  <Anchor className="h-3 w-3" />
                  {vessel.destination || 'Destino N/A'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default VesselTrackingMap;
