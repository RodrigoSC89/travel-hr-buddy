/**
 * SmartRoutesMap - Mapa Interativo de Rotas Marítimas
 * ✅ P0 CORRIGIDO: Dados reais via Supabase (R01 MITIGADO)
 */

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from '@/lib/mapbox-shim';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { logger } from '@/lib/logger';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  Loader2,
  WifiOff,
  Settings
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

interface SmartRoutesMapProps {
  mapboxToken?: string;
}

export const SmartRoutesMap: React.FC<SmartRoutesMapProps> = ({ mapboxToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const token = mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '';

  // ✅ R01: Fetch real routes from database
  const { data: routesData, isLoading: routesLoading, refetch } = useQuery({
    queryKey: ["smart-routes"],
    queryFn: async (): Promise<RouteData[]> => {
      const { data, error } = await supabase
        .from("routes")
        .select(`
          id,
          name,
          vessel_id,
          origin_port_id,
          destination_port_id,
          status,
          distance_nm,
          estimated_duration_hours,
          fuel_consumption_mt,
          vessels (name),
          route_waypoints (id, port_id, sequence, ports (name, latitude, longitude))
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(r => {
        const waypoints = (r.route_waypoints || [])
          .sort((a: Record<string, unknown>, b: Record<string, unknown>) => 
            (Number(a.sequence) || 0) - (Number(b.sequence) || 0))
          .map((wp: Record<string, unknown>, idx: number) => ({
            id: String(wp.id),
            name: (wp.ports as Record<string, unknown>)?.name as string || `Waypoint ${idx + 1}`,
            coordinates: [
              Number((wp.ports as Record<string, unknown>)?.longitude) || 0,
              Number((wp.ports as Record<string, unknown>)?.latitude) || 0
            ] as [number, number],
            type: 'waypoint' as const
          }));

        return {
          id: r.id,
          name: r.name || "Rota",
          vessel: (r.vessels as Record<string, unknown>)?.name as string || "Embarcação",
          origin: waypoints[0] || { id: "o1", name: "Origem", coordinates: [0, 0], type: 'origin' as const },
          destination: waypoints[waypoints.length - 1] || { id: "d1", name: "Destino", coordinates: [0, 0], type: 'destination' as const },
          waypoints: waypoints.slice(1, -1),
          distance: Number(r.distance_nm) || 0,
          estimatedTime: `${Math.round((Number(r.estimated_duration_hours) || 0) / 24)} dias`,
          fuelConsumption: Number(r.fuel_consumption_mt) || 0,
          status: (r.status === 'active' ? 'active' : r.status === 'completed' ? 'completed' : 'planned') as RouteData["status"],
          weatherRisk: 'low' as const, // Would come from weather API
        };
      });
    },
  });

  const routes = routesData || [];

  useEffect(() => {
    if (!mapContainer.current || !token || routes.length === 0) {
      setIsMapLoading(false);
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

      map.current?.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      map.current?.on('load', () => {
        setIsMapLoading(false);
        if (routes.length > 0) {
          setSelectedRoute(routes[0]);
          addRouteToMap(routes[0]);
        }
      });

      map.current?.on('error', () => {
        setIsMapLoading(false);
        toast.error("Erro ao carregar mapa");
      });

    } catch (error) {
      logger.error("Mapbox init error:", error);
      setIsMapLoading(false);
    }

    return () => {
      map.current?.remove();
    };
  }, [token, routes]);

  const addRouteToMap = (route: RouteData) => {
    if (!map.current) return;

    const routeCoordinates = [
      route.origin.coordinates,
      ...route.waypoints.map(w => w.coordinates),
      route.destination.coordinates
    ].filter(c => c[0] !== 0 && c[1] !== 0);

    if (routeCoordinates.length < 2) return;

    // Add markers
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

    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat(route.destination.coordinates)
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <strong>📍 Destino</strong>
          <p>${route.destination.name}</p>
        </div>
      `))
      .addTo(map.current);

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

  const handleOptimizeRoute = async () => {
    if (!selectedRoute) return;
    
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-route-optimizer", {
        body: { routeId: selectedRoute.id },
      });

      if (error) throw error;

      await refetch();
      toast.success("Rota otimizada!", {
        description: data?.savings || "Otimização concluída"
      });
    } catch {
      toast.error("Erro ao otimizar rota");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSelectRoute = (route: RouteData) => {
    setSelectedRoute(route);
    if (map.current && route.origin.coordinates[0] !== 0) {
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

  // ⚠️ Estado "Não Configurado" quando não há rotas
  if (!routesLoading && routes.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center space-y-4">
          <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">Nenhuma Rota Configurada</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Configure rotas marítimas para visualizar no mapa.
          </p>
          <Alert className="max-w-lg mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sem Dados Simulados</AlertTitle>
            <AlertDescription>
              Este mapa exibe apenas rotas reais do banco de dados.
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.href = '/logistics/routes'}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Rotas
          </Button>
        </CardContent>
      </Card>
    );
  }

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

  if (routesLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Skeleton className="lg:col-span-3 h-[500px]" />
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      </div>
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
              <Badge variant="outline">Dados Reais</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOptimizeRoute}
                disabled={isOptimizing || !selectedRoute}
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
            {isMapLoading && (
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rotas Ativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {routes.map(route => (
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
                    {route.status === 'active' ? 'Em Navegação' : route.status === 'completed' ? 'Concluída' : 'Planejada'}
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
