/**
 * Enhanced Compliance Inspection Map with Geofencing
 * Features: Real-time vessel tracking, geofence alerts, Supabase integration
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { loadMapboxGL } from '@/lib/performance/heavy-libs-loader';
import { supabase } from '@/integrations/supabase/client';
import { 
  Ship, MapPin, AlertTriangle, CheckCircle, Clock, 
  RefreshCw, Filter, Layers, Radio, Target, Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface VesselInspection {
  id: string;
  vesselName: string;
  imoNumber: string;
  flagState: string;
  lat: number;
  lng: number;
  status: 'overdue' | 'due-soon' | 'compliant' | 'in-progress';
  inspectionType: 'mlc' | 'psc' | 'internal' | 'pre-ovid';
  dueDate: string;
  lastInspection?: string;
}

interface Geofence {
  id: string;
  name: string;
  type: 'inspection-required' | 'restricted' | 'warning';
  center: [number, number];
  radiusKm: number;
  active: boolean;
}

interface ComplianceMapWithGeofencingProps {
  onVesselClick?: (vessel: VesselInspection) => void;
  onGeofenceAlert?: (vessel: VesselInspection, geofence: Geofence) => void;
  height?: string;
  showControls?: boolean;
}

// Predefined geofence zones (inspection-required ports)
const INSPECTION_ZONES: Geofence[] = [
  { id: 'gz-1', name: 'Port of Rotterdam', type: 'inspection-required', center: [4.4777, 51.9244], radiusKm: 15, active: true },
  { id: 'gz-2', name: 'Port of Singapore', type: 'inspection-required', center: [103.8198, 1.2644], radiusKm: 20, active: true },
  { id: 'gz-3', name: 'Port of Santos', type: 'inspection-required', center: [-46.3042, -23.9608], radiusKm: 12, active: true },
  { id: 'gz-4', name: 'Port of Miami', type: 'inspection-required', center: [-80.1695, 25.7751], radiusKm: 10, active: true },
  { id: 'gz-5', name: 'Port of Tokyo', type: 'inspection-required', center: [139.7706, 35.6284], radiusKm: 18, active: true },
  { id: 'gz-6', name: 'Restricted Zone - North Sea', type: 'restricted', center: [3.0, 56.0], radiusKm: 50, active: true },
  { id: 'gz-7', name: 'Warning Zone - Gulf of Aden', type: 'warning', center: [48.0, 12.0], radiusKm: 100, active: true },
];

export function ComplianceMapWithGeofencing({
  onVesselClick,
  onGeofenceAlert,
  height = "h-[500px]",
  showControls = true
}: ComplianceMapWithGeofencingProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const geofenceLayersRef = useRef<string[]>([]);
  const geofenceInitializedRef = useRef(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [mapboxgl, setMapboxgl] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vessels, setVessels] = useState<VesselInspection[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>(INSPECTION_ZONES);
  const [filter, setFilter] = useState<string>('all');
  const [selectedVessel, setSelectedVessel] = useState<VesselInspection | null>(null);
  const [showGeofences, setShowGeofences] = useState(true);
  const [isRealtime, setIsRealtime] = useState(true);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
        setError('Mapbox token não configurado');
        setIsLoading(false);
      }
    };
    fetchToken();
  }, []);

  // Fetch real vessel data from Supabase
  const fetchVessels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, imo_number, flag_state, flag, status, current_location, vessel_type, metadata')
        .eq('status', 'active');

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedVessels: VesselInspection[] = data
          .filter(vessel => {
            // Try to parse location from current_location or metadata
            const location = parseLocation(vessel.current_location, vessel.metadata as any);
            return location !== null;
          })
          .map(vessel => {
            const location = parseLocation(vessel.current_location, vessel.metadata as any);
            return {
              id: vessel.id,
              vesselName: vessel.name,
              imoNumber: vessel.imo_number || 'N/A',
              flagState: vessel.flag_state || vessel.flag || 'Unknown',
              lat: location!.lat,
              lng: location!.lng,
              status: mapVesselStatus(vessel.status),
              inspectionType: 'mlc' as const,
              dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            };
          });
        
        if (mappedVessels.length > 0) {
          setVessels(mappedVessels);
          return mappedVessels;
        }
      }
      
      // Use mock data if no real vessels with valid locations
      setVessels(getMockVessels());
      return getMockVessels();
    } catch (err) {
      console.error('Error fetching vessels:', err);
      setVessels(getMockVessels());
      return getMockVessels();
    }
  }, []);

  const parseLocation = (locationStr: string | null, metadata: any): { lat: number; lng: number } | null => {
    // Try metadata first (might have JSON coordinates)
    if (metadata?.position) {
      const pos = metadata.position;
      if (typeof pos.lat === 'number' && typeof pos.lng === 'number') {
        return { lat: pos.lat, lng: pos.lng };
      }
    }
    
    if (metadata?.coordinates) {
      const coords = metadata.coordinates;
      if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        return { lat: coords.lat, lng: coords.lng };
      }
    }

    // Try parsing location string (e.g., "-23.5505, -46.6333" or "lat: -23.5505, lng: -46.6333")
    if (locationStr) {
      const coordMatch = locationStr.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }

    return null;
  };

  const mapVesselStatus = (status: string | null): VesselInspection['status'] => {
    switch (status) {
      case 'critical': return 'overdue';
      case 'maintenance': return 'in-progress';
      case 'inactive': return 'due-soon';
      default: return 'compliant';
    }
  };

  const getMockVessels = (): VesselInspection[] => [
    { id: '1', vesselName: 'MV Ocean Star', imoNumber: '9876543', flagState: 'Panama', lat: 25.7617, lng: -80.1918, status: 'overdue', inspectionType: 'mlc', dueDate: '2024-01-15' },
    { id: '2', vesselName: 'MV Seawind', imoNumber: '9876544', flagState: 'Norway', lat: 51.9244, lng: 4.4777, status: 'due-soon', inspectionType: 'psc', dueDate: '2024-02-01' },
    { id: '3', vesselName: 'MV Horizon', imoNumber: '9876545', flagState: 'Singapore', lat: 1.3521, lng: 103.8198, status: 'compliant', inspectionType: 'internal', dueDate: '2024-06-15' },
    { id: '4', vesselName: 'MV Blue Wave', imoNumber: '9876546', flagState: 'Liberia', lat: -23.9608, lng: -46.3042, status: 'in-progress', inspectionType: 'pre-ovid', dueDate: '2024-01-20' },
    { id: '5', vesselName: 'MV Nordic Spirit', imoNumber: '9876547', flagState: 'Denmark', lat: 35.6762, lng: 139.6503, status: 'overdue', inspectionType: 'mlc', dueDate: '2024-01-10' },
    { id: '6', vesselName: 'MV Atlantic Dream', imoNumber: '9876548', flagState: 'Malta', lat: 56.0, lng: 3.0, status: 'due-soon', inspectionType: 'psc', dueDate: '2024-02-05' },
  ];

  // Real-time subscription for vessel updates
  useEffect(() => {
    if (!isRealtime) return;

    const channel = supabase
      .channel('vessel-tracking-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vessels' },
        (payload) => {
          console.log('Vessel update:', payload);
          fetchVessels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isRealtime, fetchVessels]);

  // Initialize map
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        const mb = await loadMapboxGL();
        if (!mounted || !mapContainer.current) return;

        setMapboxgl(mb);
        mb.accessToken = mapboxToken;

        const mapInstance = new mb.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          projection: 'globe',
          zoom: 2,
          center: [0, 20],
          pitch: 30
        });

        map.current = mapInstance;

        mapInstance.addControl(new mb.NavigationControl(), 'top-right');
        mapInstance.addControl(new mb.ScaleControl(), 'bottom-left');

        mapInstance.on('style.load', () => {
          mapInstance.setFog({
            color: 'rgb(20, 20, 30)',
            'high-color': 'rgb(40, 40, 60)',
            'horizon-blend': 0.1
          });
        });

        mapInstance.on('load', async () => {
          if (mounted) {
            const fetchedVessels = await fetchVessels();
            
            // Only add geofences once
            if (!geofenceInitializedRef.current) {
              geofenceInitializedRef.current = true;
              addGeofenceZones(mapInstance);
            }
            
            addVesselMarkers(mapInstance, mb, fetchedVessels);
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error('Failed to initialize map:', err);
        if (mounted) {
          setError('Erro ao carregar mapa');
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      geofenceInitializedRef.current = false;
      markersRef.current.forEach(marker => marker.remove());
      geofenceLayersRef.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken, fetchVessels]);

  // Add geofence zones to map
  const addGeofenceZones = useCallback((mapInstance: any) => {
    if (!showGeofences || !mapInstance) return;

    // Remove existing geofence layers first
    geofenceLayersRef.current.forEach(id => {
      try {
        if (mapInstance.getLayer(id)) {
          mapInstance.removeLayer(id);
        }
      } catch (e) {
        // Ignore errors
      }
    });
    
    // Remove sources after layers
    geofenceLayersRef.current.forEach(id => {
      try {
        if (mapInstance.getSource(id)) {
          mapInstance.removeSource(id);
        }
      } catch (e) {
        // Ignore errors
      }
    });
    geofenceLayersRef.current = [];

    geofences.filter(g => g.active).forEach(geofence => {
      const sourceId = `geofence-${geofence.id}`;
      const layerId = `geofence-layer-${geofence.id}`;
      const outlineId = `geofence-outline-${geofence.id}`;

      // Skip if source already exists
      if (mapInstance.getSource(sourceId)) {
        return;
      }

      try {
        // Create circle polygon
        const circlePoints = createCirclePolygon(geofence.center, geofence.radiusKm);

        mapInstance.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [circlePoints]
            },
            properties: { name: geofence.name, type: geofence.type }
          }
        });

        const colors: Record<string, string> = {
          'inspection-required': 'rgba(59, 130, 246, 0.2)',
          'restricted': 'rgba(239, 68, 68, 0.2)',
          'warning': 'rgba(245, 158, 11, 0.2)'
        };

        const outlineColors: Record<string, string> = {
          'inspection-required': 'rgba(59, 130, 246, 0.8)',
          'restricted': 'rgba(239, 68, 68, 0.8)',
          'warning': 'rgba(245, 158, 11, 0.8)'
        };

        mapInstance.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': colors[geofence.type],
            'fill-opacity': 0.6
          }
        });

        mapInstance.addLayer({
          id: outlineId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': outlineColors[geofence.type],
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });

        geofenceLayersRef.current.push(sourceId, layerId, outlineId);
      } catch (e) {
        console.warn('Error adding geofence:', geofence.id, e);
      }
    });
  }, [geofences, showGeofences]);

  // Create circle polygon for geofence
  const createCirclePolygon = (center: [number, number], radiusKm: number): number[][] => {
    const points = 64;
    const coords: number[][] = [];
    const km = radiusKm;
    const distanceX = km / (111.32 * Math.cos(center[1] * Math.PI / 180));
    const distanceY = km / 110.574;

    for (let i = 0; i < points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const x = distanceX * Math.cos(theta);
      const y = distanceY * Math.sin(theta);
      coords.push([center[0] + x, center[1] + y]);
    }
    coords.push(coords[0]); // Close the polygon
    return coords;
  };

  // Check if vessel is inside geofence
  const checkGeofenceViolation = useCallback((vessel: VesselInspection): Geofence | null => {
    for (const geofence of geofences.filter(g => g.active)) {
      const distance = calculateDistance(
        vessel.lat, vessel.lng,
        geofence.center[1], geofence.center[0]
      );
      if (distance <= geofence.radiusKm) {
        return geofence;
      }
    }
    return null;
  }, [geofences]);

  // Calculate distance between two points (Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Add vessel markers
  const addVesselMarkers = useCallback((mapInstance: any, mb: any, vesselList: VesselInspection[]) => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const filteredVessels = filter === 'all' 
      ? vesselList 
      : vesselList.filter(v => v.status === filter);

    filteredVessels.forEach(vessel => {
      const geofence = checkGeofenceViolation(vessel);
      
      if (geofence && onGeofenceAlert) {
        onGeofenceAlert(vessel, geofence);
      }

      const el = document.createElement('div');
      el.className = 'vessel-marker';
      el.innerHTML = getMarkerHTML(vessel.status, !!geofence);
      el.style.cursor = 'pointer';

      const popup = new mb.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; min-width: 220px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600;">${vessel.vesselName}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">IMO: ${vessel.imoNumber}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Flag: ${vessel.flagState}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">
            <strong>Status:</strong> 
            <span style="color: ${getStatusColor(vessel.status)}">${getStatusLabel(vessel.status)}</span>
          </p>
          ${geofence ? `
            <p style="margin: 8px 0 0 0; padding: 4px 8px; background: ${getGeofenceColor(geofence.type)}; border-radius: 4px; font-size: 11px;">
              ⚠️ Dentro da zona: ${geofence.name}
            </p>
          ` : ''}
        </div>
      `);

      const marker = new mb.Marker(el)
        .setLngLat([vessel.lng, vessel.lat])
        .setPopup(popup)
        .addTo(mapInstance);

      el.addEventListener('click', () => {
        setSelectedVessel(vessel);
        onVesselClick?.(vessel);
        
        if (geofence) {
          toast.warning(`${vessel.vesselName} está na zona: ${geofence.name}`, {
            description: geofence.type === 'inspection-required' 
              ? 'Inspeção obrigatória nesta região'
              : 'Atenção: área com restrições'
          });
        }
      });

      markersRef.current.push(marker);
    });
  }, [filter, checkGeofenceViolation, onVesselClick, onGeofenceAlert]);

  // Update markers when filter or vessels change (not geofences - those are added on map load)
  useEffect(() => {
    if (map.current && mapboxgl && vessels.length > 0 && !isLoading) {
      addVesselMarkers(map.current, mapboxgl, vessels);
    }
  }, [filter, vessels, mapboxgl, addVesselMarkers, isLoading]);

  // Toggle geofences visibility
  useEffect(() => {
    if (!map.current || !mapboxgl || isLoading) return;
    
    // When showGeofences changes, we need to update the visibility
    geofenceLayersRef.current.forEach(id => {
      try {
        if (map.current.getLayer(id)) {
          map.current.setLayoutProperty(id, 'visibility', showGeofences ? 'visible' : 'none');
        }
      } catch (e) {
        // Ignore
      }
    });
  }, [showGeofences, mapboxgl, isLoading]);

  const getMarkerHTML = (status: VesselInspection['status'], inGeofence: boolean): string => {
    const colors = {
      'overdue': '#ef4444',
      'due-soon': '#f59e0b',
      'compliant': '#22c55e',
      'in-progress': '#3b82f6'
    };
    const color = colors[status];
    const ring = inGeofence ? 'box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.5), 0 2px 8px rgba(0,0,0,0.3);' : 'box-shadow: 0 2px 8px rgba(0,0,0,0.3);';
    
    return `
      <div style="
        width: 28px; 
        height: 28px; 
        background: ${color}; 
        border-radius: 50%; 
        border: 2px solid white;
        ${ring}
        display: flex;
        align-items: center;
        justify-content: center;
        ${inGeofence ? 'animation: pulse 2s infinite;' : ''}
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
        </svg>
      </div>
    `;
  };

  const getStatusColor = (status: VesselInspection['status']): string => {
    const colors = { 'overdue': '#ef4444', 'due-soon': '#f59e0b', 'compliant': '#22c55e', 'in-progress': '#3b82f6' };
    return colors[status];
  };

  const getStatusLabel = (status: VesselInspection['status']): string => {
    const labels = { 'overdue': 'Vencida', 'due-soon': 'Próxima', 'compliant': 'Conforme', 'in-progress': 'Em Andamento' };
    return labels[status];
  };

  const getGeofenceColor = (type: Geofence['type']): string => {
    const colors = { 'inspection-required': 'rgba(59, 130, 246, 0.2)', 'restricted': 'rgba(239, 68, 68, 0.2)', 'warning': 'rgba(245, 158, 11, 0.2)' };
    return colors[type];
  };

  const getStatusBadge = (status: VesselInspection['status']) => {
    const variants: Record<string, string> = {
      'overdue': 'bg-red-500 text-white',
      'due-soon': 'bg-orange-500 text-white',
      'compliant': 'bg-green-500 text-white',
      'in-progress': 'bg-blue-500 text-white'
    };
    return <Badge className={variants[status]}>{getStatusLabel(status)}</Badge>;
  };

  const stats = {
    total: vessels.length,
    overdue: vessels.filter(v => v.status === 'overdue').length,
    dueSoon: vessels.filter(v => v.status === 'due-soon').length,
    compliant: vessels.filter(v => v.status === 'compliant').length,
    inProgress: vessels.filter(v => v.status === 'in-progress').length,
    inGeofence: vessels.filter(v => checkGeofenceViolation(v)).length
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Mapa de Inspeções com Geofencing
            {isRealtime && (
              <Badge variant="outline" className="text-xs">
                <Radio className="h-3 w-3 mr-1 animate-pulse text-green-500" />
                Tempo Real
              </Badge>
            )}
          </CardTitle>
          {showControls && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={showGeofences} 
                  onCheckedChange={setShowGeofences}
                  id="geofence-toggle"
                />
                <label htmlFor="geofence-toggle" className="text-xs cursor-pointer">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Geofences
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={isRealtime} 
                  onCheckedChange={setIsRealtime}
                  id="realtime-toggle"
                />
                <label htmlFor="realtime-toggle" className="text-xs cursor-pointer">
                  <Radio className="h-3 w-3 inline mr-1" />
                  Real-time
                </label>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas ({stats.total})</SelectItem>
                  <SelectItem value="overdue">Vencidas ({stats.overdue})</SelectItem>
                  <SelectItem value="due-soon">Próximas ({stats.dueSoon})</SelectItem>
                  <SelectItem value="in-progress">Em Andamento ({stats.inProgress})</SelectItem>
                  <SelectItem value="compliant">Conformes ({stats.compliant})</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => fetchVessels()}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Carregando mapa...</p>
            </div>
          </div>
        )}
        
        <div ref={mapContainer} className={`${height} w-full`} />

        {/* Stats overlay */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Vencidas: {stats.overdue}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Próximas: {stats.dueSoon}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Em Andamento: {stats.inProgress}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Conformes: {stats.compliant}</span>
            </div>
            {stats.inGeofence > 0 && (
              <div className="flex items-center gap-1 col-span-2 text-orange-500 font-medium">
                <Target className="h-3 w-3" />
                <span>{stats.inGeofence} em zona de inspeção</span>
              </div>
            )}
          </div>
        </div>

        {/* Geofence legend */}
        {showGeofences && (
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg">
            <p className="text-xs font-medium mb-2">Zonas de Geofencing</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500/50 border border-blue-500" />
                <span>Inspeção Obrigatória</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500" />
                <span>Área Restrita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500/50 border border-orange-500" />
                <span>Zona de Alerta</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected vessel info */}
        {selectedVessel && (
          <div className="absolute top-4 right-4 bg-background/95 backdrop-blur rounded-lg p-4 shadow-lg max-w-xs">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold">{selectedVessel.vesselName}</h4>
                <p className="text-xs text-muted-foreground">IMO: {selectedVessel.imoNumber}</p>
              </div>
              {getStatusBadge(selectedVessel.status)}
            </div>
            <div className="space-y-1 text-xs">
              <p><strong>Bandeira:</strong> {selectedVessel.flagState}</p>
              <p><strong>Tipo:</strong> {selectedVessel.inspectionType.toUpperCase()}</p>
              <p><strong>Vencimento:</strong> {new Date(selectedVessel.dueDate).toLocaleDateString('pt-BR')}</p>
              {checkGeofenceViolation(selectedVessel) && (
                <Badge variant="outline" className="mt-2 text-orange-500 border-orange-500">
                  <Target className="h-3 w-3 mr-1" />
                  Em zona de inspeção
                </Badge>
              )}
            </div>
            <Button 
              className="w-full mt-3" 
              size="sm"
              onClick={() => onVesselClick?.(selectedVessel)}
            >
              <Ship className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </Card>
  );
}
