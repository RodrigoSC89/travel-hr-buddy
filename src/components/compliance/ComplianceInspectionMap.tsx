/**
 * Compliance Inspection Map Component
 * Interactive Mapbox map showing vessel locations and pending inspections
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { loadMapboxGL } from '@/lib/performance/heavy-libs-loader';
import { supabase } from '@/integrations/supabase/client';
import { 
  Ship, MapPin, AlertTriangle, CheckCircle, Clock, 
  RefreshCw, Maximize2, Filter, Layers
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/lib/logger';

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

interface ComplianceInspectionMapProps {
  onVesselClick?: (vessel: VesselInspection) => void;
  height?: string;
  showControls?: boolean;
}

export function ComplianceInspectionMap({
  onVesselClick,
  height = "h-96",
  showControls = true
}: ComplianceInspectionMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mapbox GL types not available
  const map = useRef<any>(null);
  const markersRef = useRef<Array<{ remove: () => void }>>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vessels, setVessels] = useState<VesselInspection[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedVessel, setSelectedVessel] = useState<VesselInspection | null>(null);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (err) {
        logger.error('Failed to fetch Mapbox token:', err);
        setError('Mapbox token não configurado');
        setIsLoading(false);
      }
    };
    fetchToken();
  }, []);

  // Load vessel inspection data (fallback until dedicated table exists)
  useEffect(() => {
    const fallbackVessels: VesselInspection[] = [
      {
        id: '1',
        vesselName: 'MV Ocean Star',
        imoNumber: '9876543',
        flagState: 'Panama',
        lat: 25.7617,
        lng: -80.1918,
        status: 'overdue',
        inspectionType: 'mlc',
        dueDate: '2024-01-15',
        lastInspection: '2023-01-15'
      },
      {
        id: '2',
        vesselName: 'MV Seawind',
        imoNumber: '9876544',
        flagState: 'Norway',
        lat: 51.5074,
        lng: -0.1278,
        status: 'due-soon',
        inspectionType: 'psc',
        dueDate: '2024-02-01',
        lastInspection: '2023-06-15'
      },
      {
        id: '3',
        vesselName: 'MV Horizon',
        imoNumber: '9876545',
        flagState: 'Singapore',
        lat: 1.3521,
        lng: 103.8198,
        status: 'compliant',
        inspectionType: 'internal',
        dueDate: '2024-06-15',
        lastInspection: '2024-01-10'
      },
      {
        id: '4',
        vesselName: 'MV Blue Wave',
        imoNumber: '9876546',
        flagState: 'Liberia',
        lat: -33.8688,
        lng: 151.2093,
        status: 'in-progress',
        inspectionType: 'pre-ovid',
        dueDate: '2024-01-20'
      },
      {
        id: '5',
        vesselName: 'MV Nordic Spirit',
        imoNumber: '9876547',
        flagState: 'Denmark',
        lat: 35.6762,
        lng: 139.6503,
        status: 'overdue',
        inspectionType: 'mlc',
        dueDate: '2024-01-10'
      },
      {
        id: '6',
        vesselName: 'MV Atlantic Dream',
        imoNumber: '9876548',
        flagState: 'Malta',
        lat: -23.5505,
        lng: -46.6333,
        status: 'due-soon',
        inspectionType: 'psc',
        dueDate: '2024-02-05'
      }
    ];
    setVessels(fallbackVessels);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        const mapboxgl = await loadMapboxGL();
        if (!mounted || !mapContainer.current) return;

        mapboxgl.accessToken = mapboxToken;

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          projection: 'globe',
          zoom: 1.5,
          center: [0, 20],
          pitch: 30
        });

        map.current = mapInstance;

        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapInstance.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

        mapInstance.on('style.load', () => {
          mapInstance.setFog({
            color: 'rgb(20, 20, 30)',
            'high-color': 'rgb(40, 40, 60)',
            'horizon-blend': 0.1
          });
        });

        mapInstance.on('load', () => {
          if (mounted) {
            setIsLoading(false);
            addVesselMarkers(mapInstance, mapboxgl);
          }
        });
      } catch (err) {
        logger.error('Failed to initialize map:', err);
        if (mounted) {
          setError('Erro ao carregar mapa');
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Add vessel markers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mapbox GL dynamic import
  const addVesselMarkers = useCallback((mapInstance: any, mapboxgl: any) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const filteredVessels = filter === 'all' 
      ? vessels 
      : vessels.filter(v => v.status === filter);

    filteredVessels.forEach(vessel => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'vessel-marker';
      el.innerHTML = getMarkerHTML(vessel.status);
      el.style.cursor = 'pointer';

      // Create popup with XSS-safe content
      const escapeHtml = (str: string) => str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c);
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600;">${escapeHtml(vessel.vesselName)}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">IMO: ${escapeHtml(vessel.imoNumber)}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Flag: ${escapeHtml(vessel.flagState)}</p>
          <p style="margin: 0 0 8px 0; font-size: 12px;">
            <strong>Status:</strong> 
            <span style="color: ${getStatusColor(vessel.status)}">${escapeHtml(getStatusLabel(vessel.status))}</span>
          </p>
          <p style="margin: 0; font-size: 12px;">
            <strong>Próxima Inspeção:</strong> ${new Date(vessel.dueDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([vessel.lng, vessel.lat])
        .setPopup(popup)
        .addTo(mapInstance);

      el.addEventListener('click', () => {
        setSelectedVessel(vessel);
        onVesselClick?.(vessel);
      });

      markersRef.current.push(marker);
    });
  }, [vessels, filter, onVesselClick]);

  // Update markers when filter changes
  useEffect(() => {
    if (map.current && vessels.length > 0) {
      loadMapboxGL().then(mapboxgl => {
        addVesselMarkers(map.current, mapboxgl);
      });
    }
  }, [filter, vessels, addVesselMarkers]);

  const getMarkerHTML = (status: VesselInspection['status']): string => {
    const colors = {
      'overdue': '#ef4444',
      'due-soon': '#f59e0b',
      'compliant': '#22c55e',
      'in-progress': '#3b82f6'
    };
    const color = colors[status];
    
    return `
      <div style="
        width: 24px; 
        height: 24px; 
        background: ${color}; 
        border-radius: 50%; 
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
        </svg>
      </div>
    `;
  };

  const getStatusColor = (status: VesselInspection['status']): string => {
    const colors = {
      'overdue': '#ef4444',
      'due-soon': '#f59e0b',
      'compliant': '#22c55e',
      'in-progress': '#3b82f6'
    };
    return colors[status];
  };

  const getStatusLabel = (status: VesselInspection['status']): string => {
    const labels = {
      'overdue': 'Vencida',
      'due-soon': 'Próxima',
      'compliant': 'Conforme',
      'in-progress': 'Em Andamento'
    };
    return labels[status];
  };

  const getStatusBadge = (status: VesselInspection['status']) => {
    const variants: Record<string, string> = {
      'overdue': 'bg-destructive text-destructive-foreground',
      'due-soon': 'bg-warning text-warning-foreground',
      'compliant': 'bg-success text-success-foreground',
      'in-progress': 'bg-primary text-primary-foreground'
    };
    return <Badge className={variants[status]}>{getStatusLabel(status)}</Badge>;
  };

  const stats = {
    total: vessels.length,
    overdue: vessels.filter(v => v.status === 'overdue').length,
    dueSoon: vessels.filter(v => v.status === 'due-soon').length,
    compliant: vessels.filter(v => v.status === 'compliant').length,
    inProgress: vessels.filter(v => v.status === 'in-progress').length
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Mapa de Inspeções
          </CardTitle>
          {showControls && (
            <div className="flex items-center gap-2">
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
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Layers className="h-4 w-4" />
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
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span>Vencidas: {stats.overdue}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span>Próximas: {stats.dueSoon}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Em Andamento: {stats.inProgress}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span>Conformes: {stats.compliant}</span>
            </div>
          </div>
        </div>

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
    </Card>
  );
}
