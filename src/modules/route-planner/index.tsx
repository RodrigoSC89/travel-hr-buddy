/**
 * Route Planner Module
 * Advanced maritime route planning with Mapbox integration
 * Patch 145.0
 */

import React, { useState } from "react";
import { RoutePlannerMap, type RouteData } from "./components/RoutePlannerMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, Plus, TrendingUp, Clock } from "lucide-react";

const RoutePlanner = () => {
  const [routes] = useState<RouteData[]>([
    {
      id: "route-1",
      name: "Rota Principal - Santos → Rio",
      type: "planned",
      color: "#3b82f6",
      distance: 370000, // meters
      duration: 18, // hours
      points: [
        { longitude: -46.3333, latitude: -23.9608, name: "Porto de Santos" },
        { longitude: -45.5, latitude: -23.5, name: "Waypoint 1" },
        { longitude: -44.5, latitude: -23.2, name: "Waypoint 2" },
        { longitude: -43.1729, latitude: -22.9068, name: "Porto do Rio de Janeiro" },
      ],
    },
    {
      id: "route-2",
      name: "Rota Alternativa (Costeira)",
      type: "alternative",
      color: "#f59e0b",
      distance: 420000,
      duration: 21,
      points: [
        { longitude: -46.3333, latitude: -23.9608, name: "Porto de Santos" },
        { longitude: -46.0, latitude: -23.8, name: "Alt Waypoint 1" },
        { longitude: -45.2, latitude: -23.4, name: "Alt Waypoint 2" },
        { longitude: -44.0, latitude: -23.0, name: "Alt Waypoint 3" },
        { longitude: -43.1729, latitude: -22.9068, name: "Porto do Rio de Janeiro" },
      ],
    },
    {
      id: "route-3",
      name: "Rota Atual (Navegação)",
      type: "actual",
      color: "#22c55e",
      distance: 185000,
      duration: 9,
      points: [
        { longitude: -46.3333, latitude: -23.9608, name: "Porto de Santos" },
        { longitude: -45.5, latitude: -23.5, name: "Atual Waypoint 1" },
        { longitude: -44.9, latitude: -23.3, name: "Posição Atual" },
      ],
    },
  ]);

  const [livePosition] = useState({
    longitude: -44.9,
    latitude: -23.3,
  });

  const handleRouteSelect = (routeId: string) => {
    console.log("Route selected:", routeId);
  };

  const selectedRoute = routes.find(r => r.type === "planned");
  const alternativeRoute = routes.find(r => r.type === "alternative");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Planejamento de Rota</h1>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Rota
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Distância Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedRoute ? ((selectedRoute.distance ?? 0) / 1852).toFixed(0) : "0"} nm
            </div>
            <p className="text-xs text-muted-foreground">Rota planejada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Estimado</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedRoute?.duration || 0}h
            </div>
            <p className="text-xs text-muted-foreground">Velocidade média: 10 kn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Economia</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {selectedRoute && alternativeRoute
                ? `${((((alternativeRoute.distance ?? 0) - (selectedRoute.distance ?? 0)) / 1852)).toFixed(0)} nm`
                : "0 nm"}
            </div>
            <p className="text-xs text-muted-foreground">vs. rota alternativa</p>
          </CardContent>
        </Card>
      </div>

      <RoutePlannerMap
        center={[-45, -23.5]}
        zoom={7}
        routes={routes}
        livePosition={livePosition}
        onRouteSelect={handleRouteSelect}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recursos do Planejador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Rota Planejada (Azul)</h3>
              <p className="text-sm text-muted-foreground">
                Rota otimizada principal baseada em distância, tempo e condições
                meteorológicas previstas.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Rota Alternativa (Laranja)</h3>
              <p className="text-sm text-muted-foreground">
                Rota de backup com pontos de passagem alternativos, ideal para
                condições adversas.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Rastreamento ao Vivo (Verde)</h3>
              <p className="text-sm text-muted-foreground">
                Posição atual da embarcação com histórico de navegação e desvios
                da rota planejada.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Camadas Customizadas</h3>
              <p className="text-sm text-muted-foreground">
                Overlay de dados AIS, condições meteorológicas, profundidade e
                áreas restritas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoutePlanner;
