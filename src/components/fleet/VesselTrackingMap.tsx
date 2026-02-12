/**
 * Vessel Tracking Map Component
 * Real-time AIS vessel positions on Mapbox
 * Fixed version with proper async Mapbox loading
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getMapboxGLAsync, type MapboxGLInterface } from '@/lib/mapbox-shim';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ship, RefreshCw, Loader2, Anchor, Navigation, Gauge, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

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
  const mapRef = useRef<any>(null);
  const mapboxRef = useRef<MapboxGLInterface | null>(null);
  const markersRef = useRef<any[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [vessels, setVessels] = useState<VesselPosition[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<VesselPosition | null>(null);
  const [source, setSource] = useState<'database' | 'mock'>('mock');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('mapbox-token');
        
        if (fnError) {
          logger.error('Mapbox token error:', fnError);
          setError('Erro ao carregar token do mapa');
          setLoading(false);
          return;
        }
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setError('Token do Mapbox não configurado');
          setLoading(false);
        }
      } catch (err) {
        logger.error('Failed to get Mapbox token:', err);
        setError('Falha ao conectar com o serviço de mapas');
        setLoading(false);
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

      if (data?.vessels && data.vessels.length > 0) {
        // Map API response to component format
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- edge function response shape
        const mappedVessels = data.vessels.map((v: any) => ({
          mmsi: v.mmsi,
          imo: v.imo,
          name: v.name,
          lat: v.latitude ?? v.lat,
          lon: v.longitude ?? v.lon,
          speed: v.speed || 0,
          course: v.course || 0,
          heading: v.heading || 0,
          destination: v.destination,
          eta: v.eta,
          status: v.navStatus || v.status || 'Unknown',
          timestamp: v.lastUpdate || v.timestamp,
        }));
        setVessels(mappedVessels);
        setSource(data.source === 'database' || data.source === 'marinetraffic' ? 'database' : 'mock');
      }
    } catch (err) {
      logger.error('Failed to fetch vessels:', err);
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

  // Initial fetch when token is ready
  useEffect(() => {
    if (mapboxToken) {
      fetchVessels();
    }
  }, [mapboxToken, fetchVessels]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !mapboxToken) return;
    
    const interval = setInterval(fetchVessels, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchVessels, autoRefresh, refreshInterval, mapboxToken]);

  // Initialize map with async loader
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapRef.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        const mapboxgl = await getMapboxGLAsync();
        if (!mounted || !mapContainer.current) return;
        
        mapboxRef.current = mapboxgl;
        mapboxgl.accessToken = mapboxToken;

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [-45, -20], // Center on Brazil
          zoom: 4,
          pitch: 0,
        });

        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        mapInstance.on('load', () => {
          if (mounted) {
            setMapReady(true);
            setLoading(false);
          }
        });

        mapInstance.on('error', (e: { error?: string; message?: string }) => {
          logger.error('Mapbox error:', e);
          if (mounted) {
            setError('Erro ao carregar o mapa');
            setLoading(false);
          }
        });

        mapRef.current = mapInstance;
      } catch (err) {
        logger.error('Failed to initialize map:', err);
        if (mounted) {
          setError('Falha ao inicializar o mapa');
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapboxToken]);

  // Update markers when vessels change
  useEffect(() => {
    const mapInstance = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!mapInstance || !mapboxgl || !mapReady || vessels.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    vessels.forEach(vessel => {
      if (!vessel.lat || !vessel.lon) return;
      
      const el = document.createElement('div');
      el.className = 'vessel-marker';
      
      const isMoving = vessel.speed > 0.5;
      const isSelected = selectedVessel?.mmsi === vessel.mmsi;
      const color = isSelected ? '#f97316' : isMoving ? '#3b82f6' : '#10b981';
      
      el.style.cssText = `
        width: ${isSelected ? '40px' : '32px'};
        height: ${isSelected ? '40px' : '32px'};
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transform: rotate(${vessel.heading}deg);
        transition: all 0.3s ease;
        z-index: ${isSelected ? 100 : 1};
      `;
      
      el.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
          <path d="M12 2L4 12h3v7h10v-7h3L12 2z"/>
        </svg>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true })
        .setHTML(`
          <div style="padding: 12px; min-width: 200px; font-family: system-ui, sans-serif;">
            <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #1f2937;">${vessel.name}</h3>
            <div style="font-size: 12px; color: #6b7280; line-height: 1.6;">
              <p><strong>MMSI:</strong> ${vessel.mmsi}</p>
              <p><strong>Status:</strong> ${vessel.status}</p>
              <p><strong>Velocidade:</strong> ${vessel.speed.toFixed(1)} kn</p>
              <p><strong>Rumo:</strong> ${vessel.course.toFixed(0)}°</p>
              <p><strong>Destino:</strong> ${vessel.destination || 'N/A'}</p>
              ${vessel.eta ? `<p><strong>ETA:</strong> ${new Date(vessel.eta).toLocaleDateString('pt-BR')}</p>` : ''}
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([vessel.lon, vessel.lat])
        .setPopup(popup)
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
      vessels.forEach(v => {
        if (v.lat && v.lon) {
          bounds.extend([v.lon, v.lat]);
        }
      });
      mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 10 });
    } else if (vessels.length === 1 && vessels[0].lat && vessels[0].lon) {
      mapInstance.flyTo({ center: [vessels[0].lon, vessels[0].lat], zoom: 8 });
    }
  }, [vessels, selectedVessel, onVesselSelect, mapReady]);

  // Loading state
  if (loading && !mapboxToken) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Carregando mapa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && !mapboxToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ship className="h-4 w-4" />
            Rastreamento AIS
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Verifique a configuração do Mapbox
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
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
                {source === 'database' ? '📡 Dados Reais' : '🔧 Mock'}
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
        <CardContent className="p-0 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
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
              selectedVessel?.mmsi === vessel.mmsi && "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => {
              setSelectedVessel(vessel);
              onVesselSelect?.(vessel);
              if (mapRef.current && vessel.lat && vessel.lon) {
                mapRef.current.flyTo({ center: [vessel.lon, vessel.lat], zoom: 10 });
              }
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
