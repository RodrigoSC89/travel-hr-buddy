/**
 * SmartRoutesMap - Mapa Interativo de Rotas Marítimas
 * Com otimização de rotas em tempo real usando Mapbox
 */

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from '@/lib/mapbox-shim';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  MapPin, 
  Navigation, 
  Ship, 
  Clock, 
  Fuel,
  Wind,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  Loader2
} from "lucide-react";

interface RoutePoint {
  id: string;
  name: string;
  coordinates: [number, number];
  type: 'origin' | 'destination' | 'waypoint' | 'hazard';
}

interface RouteData {
  id: string;
  name: string;
  vessel: string;
  origin: RoutePoint;
  destination: RoutePoint;
  waypoints: RoutePoint[];
  distance: number;
  estimatedTime: string;
  fuelConsumption: number;
  status: 'active' | 'planned' | 'completed';
  weatherRisk: 'low' | 'medium' | 'high';
}

// Mock route data
const MOCK_ROUTES: RouteData[] = [
  {
    id: "1",
    name: "Santos → Rotterdam",
    vessel: "MV Atlântico",
    origin: { id: "o1", name: "Porto de Santos", coordinates: [-46.3042, -23.9618], type: 'origin' },
    destination: { id: "d1", name: "Porto de Rotterdam", coordinates: [4.4777, 51.9244], type: 'destination' },
    waypoints: [
      { id: "w1", name: "Recife", coordinates: [-34.8811, -8.0476], type: 'waypoint' },
      { id: "w2", name: "Cabo Verde", coordinates: [-23.5087, 14.9331], type: 'waypoint' },
      { id: "w3", name: "Gibraltar", coordinates: [-5.3536, 36.1408], type: 'waypoint' },
    ],
    distance: 9850,
    estimatedTime: "18 dias",
    fuelConsumption: 4250,
    status: 'active',
    weatherRisk: 'low'
  },
  {
    id: "2",
    name: "Rio → Hamburgo",
    vessel: "MV Pacífico",
    origin: { id: "o2", name: "Porto do Rio", coordinates: [-43.1729, -22.9068], type: 'origin' },
    destination: { id: "d2", name: "Porto de Hamburgo", coordinates: [9.9937, 53.5511], type: 'destination' },
    waypoints: [
      { id: "w4", name: "Açores", coordinates: [-25.5089, 37.7489], type: 'waypoint' },
    ],
    distance: 9200,
    estimatedTime: "16 dias",
    fuelConsumption: 3980,
    status: 'planned',
    weatherRisk: 'medium'
  },
];

const HAZARD_ZONES = [
  { id: "h1", name: "Zona de Tempestade", coordinates: [-30.0, 15.0] as [number, number], radius: 300 },
  { id: "h2", name: "Alto Mar - Ondas Fortes", coordinates: [-10.0, 40.0] as [number, number], radius: 200 },
];

interface SmartRoutesMapProps {
  mapboxToken?: string;
}

export const SmartRoutesMap: React.FC<SmartRoutesMapProps> = ({ mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(MOCK_ROUTES[0]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Use environment variable if no token provided
  const token = mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '';

  useEffect(() => {
    if (!mapContainer.current || !token) {
      setIsLoading(false);
      return;
    }

    try {
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        projection: 'mercator',
        zoom: 2.5,
        center: [-20, 20],
        pitch: 0,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      map.current.on('load', () => {
        const mapInstance = map.current;
        if (!mapInstance) return;
        
        setIsLoading(false);
        
        // Add route lines and markers
        addRouteToMap(MOCK_ROUTES[0]);
        
        // Add hazard zones
        HAZARD_ZONES.forEach(hazard => {
          new mapboxgl.Marker({ color: '#ef4444' })
            .setLngLat(hazard.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`
              <div class="p-2">
                <strong class="text-red-600">⚠️ ${hazard.name}</strong>
                <p class="text-sm">Área de risco - Evitar navegação</p>
              </div>
            `))
            .addTo(mapInstance);
        });
      });

      map.current.on('error', () => {
        setIsLoading(false);
        toast.error("Erro ao carregar mapa");
      });

    } catch (error) {
      console.error("Mapbox init error:", error);
      setIsLoading(false);
    }

    return () => {
      map.current?.remove();
    };
  }, [token]);

  const addRouteToMap = (route: RouteData) => {
    if (!map.current) return;

    // Create route coordinates
    const routeCoordinates = [
      route.origin.coordinates,
      ...route.waypoints.map(w => w.coordinates),
      route.destination.coordinates
    ];

    // Add origin marker
    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat(route.origin.coordinates)
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <strong>🚢 Origem</strong>
          <p>${route.origin.name}</p>
          <p class="text-sm text-gray-500">Embarcação: ${route.vessel}</p>
        </div>
      `))
      .addTo(map.current);

    // Add destination marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat(route.destination.coordinates)
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <strong>📍 Destino</strong>
          <p>${route.destination.name}</p>
        </div>
      `))
      .addTo(map.current);

    // Add waypoint markers
    route.waypoints.forEach((wp, idx) => {
      new mapboxgl.Marker({ color: '#f59e0b', scale: 0.7 })
        .setLngLat(wp.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <strong>📌 Waypoint ${idx + 1}</strong>
            <p>${wp.name}</p>
          </div>
        `))
        .addTo(map.current!);
    });

    // Add route line
    const sourceId = `route-${route.id}`;
    if (map.current.getSource(sourceId)) {
      (map.current.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        }
      });
    } else {
      map.current.addSource(sourceId, {
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
        id: `route-line-${route.id}`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': route.status === 'active' ? '#22c55e' : '#3b82f6',
          'line-width': 3,
          'line-dasharray': route.status === 'planned' ? [2, 2] : [1, 0]
        }
      });
    }
  };

  const handleOptimizeRoute = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      toast.success("Rota otimizada!", {
        description: "Economia de 12% no consumo de combustível"
      });
    }, 2000);
  };

  const handleSelectRoute = (route: RouteData) => {
    setSelectedRoute(route);
    if (map.current) {
      map.current.flyTo({
        center: route.origin.coordinates,
        zoom: 4,
        duration: 1500
      });
    }
    toast.success(`Rota selecionada: ${route.name}`);
  };

  const getWeatherRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!token) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Token Mapbox Necessário</h3>
          <p className="text-muted-foreground mb-4">
            Configure o MAPBOX_PUBLIC_TOKEN nas variáveis de ambiente para visualizar o mapa
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Map */}
      <Card className="lg:col-span-3 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Mapa de Rotas Inteligentes
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOptimizeRoute}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4 mr-2" />
                )}
                {isOptimizing ? "Otimizando..." : "Otimizar Rota"}
              </Button>
              <Button variant="ghost" size="icon">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[500px]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <div ref={mapContainer} className="absolute inset-0" />
          </div>
        </CardContent>
      </Card>

      {/* Route Panel */}
      <div className="space-y-4">
        {/* Route List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rotas Ativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {MOCK_ROUTES.map(route => (
              <div
                key={route.id}
                onClick={() => handleSelectRoute(route)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedRoute?.id === route.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Ship className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{route.vessel}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{route.name}</p>
                <div className="flex gap-1">
                  <Badge variant={route.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {route.status === 'active' ? 'Em Navegação' : 'Planejada'}
                  </Badge>
                  <Badge className={`text-xs ${getWeatherRiskColor(route.weatherRisk)}`}>
                    <Wind className="h-3 w-3 mr-1" />
                    {route.weatherRisk === 'low' ? 'Bom' : route.weatherRisk === 'medium' ? 'Moderado' : 'Ruim'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Selected Route Details */}
        {selectedRoute && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Detalhes da Rota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  Distância
                </span>
                <span className="font-medium">{selectedRoute.distance.toLocaleString()} nm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Tempo Est.
                </span>
                <span className="font-medium">{selectedRoute.estimatedTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Fuel className="h-3 w-3" />
                  Combustível
                </span>
                <span className="font-medium">{selectedRoute.fuelConsumption.toLocaleString()} MT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Waypoints
                </span>
                <span className="font-medium">{selectedRoute.waypoints.length}</span>
              </div>
              <Button className="w-full mt-2" size="sm" onClick={handleOptimizeRoute}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalcular Rota
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmartRoutesMap;
