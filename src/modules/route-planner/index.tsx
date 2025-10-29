/**
 * Route Planner Module - PATCH 431
 * Advanced maritime route planning with Mapbox integration
 * Full integration with Weather Dashboard and Forecast Global
 * Features: Waypoint marking, ETA calculation, climate risk alerts, data persistence
 */

import React, { useState, useEffect } from "react";
import { RoutePlannerMap, type RouteData } from "./components/RoutePlannerMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Navigation, 
  Plus, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Save,
  RefreshCw,
  MapPin,
  CloudRain
} from "lucide-react";
import { routePlannerService, type Route } from "./services/routePlannerService";
import type { Coordinates } from "@/modules/navigation-copilot";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RoutePlanner = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [calculatedRoutes, setCalculatedRoutes] = useState<Route[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  
  // Route planning inputs
  const [origin, setOrigin] = useState<Coordinates>({ lat: -23.9608, lng: -46.3333 }); // Santos
  const [destination, setDestination] = useState<Coordinates>({ lat: -22.9068, lng: -43.1729 }); // Rio
  
  const [livePosition] = useState({
    longitude: -44.9,
    latitude: -23.3,
  });

  // Load saved routes on mount
  useEffect(() => {
    if (user) {
      loadSavedRoutes();
    }
  }, [user]);

  const loadSavedRoutes = async () => {
    if (!user) return;
    
    setIsLoadingSaved(true);
    try {
      const savedRoutes = await routePlannerService.getUserRoutes(user.id);
      // Convert to RouteData format for map display
      const mapRoutes: RouteData[] = savedRoutes.map((route) => ({
        id: route.id || "",
        name: route.name,
        type: route.status === "active" ? "actual" : "planned",
        color: route.status === "active" ? "#22c55e" : "#3b82f6",
        distance: route.distance * 1852, // Convert NM to meters
        duration: route.estimatedDuration,
        points: route.waypoints.map((wp) => ({
          longitude: wp.longitude,
          latitude: wp.latitude,
          name: wp.name,
        })),
      }));
      setRoutes(mapRoutes);
    } catch (error) {
      console.error("Failed to load routes:", error);
      toast.error("Falha ao carregar rotas salvas");
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const calculateRoutes = async () => {
    setIsCalculating(true);
    try {
      const newRoutes = await routePlannerService.calculateRoutes(origin, destination, {
        avoidStorms: true,
        considerFuelEfficiency: true,
      });
      
      setCalculatedRoutes(newRoutes);
      
      // Convert to map format
      const mapRoutes: RouteData[] = newRoutes.map((route, index) => ({
        id: route.id || `calc-${index}`,
        name: route.name,
        type: route.riskScore < 30 ? "planned" : "alternative",
        color: route.recommended ? "#3b82f6" : "#f59e0b",
        distance: route.distance * 1852, // Convert NM to meters
        duration: route.estimatedDuration,
        points: route.waypoints.map((wp) => ({
          longitude: wp.longitude,
          latitude: wp.latitude,
          name: wp.name,
        })),
      }));
      
      setRoutes(mapRoutes);
      toast.success(`${newRoutes.length} rotas calculadas com análise meteorológica`);
    } catch (error) {
      console.error("Route calculation failed:", error);
      toast.error("Falha ao calcular rotas");
    } finally {
      setIsCalculating(false);
    }
  };

  // PATCH 494: AI-powered route suggestion
  const suggestOptimalRoute = async () => {
    setIsCalculating(true);
    try {
      const optimalRoute = await routePlannerService.suggestOptimalRoute(origin, destination, 12, 50);
      
      setCalculatedRoutes([optimalRoute]);
      
      // Convert to map format
      const mapRoute: RouteData = {
        id: optimalRoute.id || 'ai-optimized',
        name: optimalRoute.name,
        type: "planned",
        color: "#10b981", // Green for AI optimized
        distance: optimalRoute.distance * 1852,
        duration: optimalRoute.estimatedDuration,
        points: optimalRoute.waypoints.map((wp) => ({
          longitude: wp.longitude,
          latitude: wp.latitude,
          name: wp.name,
        })),
      };
      
      setRoutes([mapRoute]);
      
      toast.success(
        `AI Route: ${optimalRoute.timeSavings?.toFixed(1)}h faster, ${optimalRoute.fuelSavings?.toFixed(1)}% fuel savings`,
        { duration: 5000 }
      );
    } catch (error) {
      console.error("AI route suggestion failed:", error);
      toast.error("Falha ao sugerir rota otimizada");
    } finally {
      setIsCalculating(false);
    }
  };

  const saveRoute = async (route: Route) => {
    if (!user) {
      toast.error("Faça login para salvar rotas");
      return;
    }
    
    try {
      await routePlannerService.saveRoute(route, user.id);
      toast.success("Rota salva com sucesso!");
      await loadSavedRoutes();
    } catch (error) {
      console.error("Failed to save route:", error);
      toast.error("Falha ao salvar rota");
    }
  };

  const handleRouteSelect = (routeId: string) => {
    console.log("Route selected:", routeId);
  };

  const selectedRoute = routes.find(r => r.type === "planned") || routes[0];
  const alternativeRoute = routes.find(r => r.type === "alternative");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Planejamento de Rota</h1>
            <p className="text-sm text-muted-foreground">PATCH 431 - Integração completa</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isLoadingSaved && (
            <Button variant="outline" disabled>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Carregando...
            </Button>
          )}
          <Button onClick={loadSavedRoutes} variant="outline" disabled={isLoadingSaved}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Route Planning Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Planejador de Rotas com Análise Meteorológica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origem (Latitude, Longitude)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.0001"
                  value={origin.lat}
                  onChange={(e) => setOrigin({ ...origin, lat: parseFloat(e.target.value) })}
                  placeholder="Latitude"
                />
                <Input
                  type="number"
                  step="0.0001"
                  value={origin.lng}
                  onChange={(e) => setOrigin({ ...origin, lng: parseFloat(e.target.value) })}
                  placeholder="Longitude"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Destino (Latitude, Longitude)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.0001"
                  value={destination.lat}
                  onChange={(e) => setDestination({ ...destination, lat: parseFloat(e.target.value) })}
                  placeholder="Latitude"
                />
                <Input
                  type="number"
                  step="0.0001"
                  value={destination.lng}
                  onChange={(e) => setDestination({ ...destination, lng: parseFloat(e.target.value) })}
                  placeholder="Longitude"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={calculateRoutes} 
              disabled={isCalculating}
              variant="outline"
              className="w-full"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Calcular Rotas
                </>
              )}
            </Button>
            {/* PATCH 494: AI Suggestion Button */}
            <Button 
              onClick={suggestOptimalRoute} 
              disabled={isCalculating}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  AI Processando...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Sugerir Rota AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {selectedRoute?.duration ? `${selectedRoute.duration.toFixed(1)}h` : "0h"}
            </div>
            <p className="text-xs text-muted-foreground">ETA dinâmico</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alertas Climáticos</CardTitle>
            <CloudRain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {calculatedRoutes.reduce((sum, r) => sum + r.weatherAlerts.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Alertas ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Weather Alerts */}
      {calculatedRoutes.length > 0 && calculatedRoutes[0].weatherAlerts.length > 0 && (
        <Card className="border-orange-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <AlertTriangle className="h-5 w-5" />
              Alertas Meteorológicos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {calculatedRoutes[0].weatherAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium capitalize">
                        {alert.type.replace("_", " ")}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : alert.severity === "high"
                          ? "destructive"
                          : "default"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <RoutePlannerMap
        center={[-45, -23.5]}
        zoom={7}
        routes={routes}
        livePosition={livePosition}
        onRouteSelect={handleRouteSelect}
      />

      {/* Calculated Routes List */}
      {calculatedRoutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rotas Calculadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calculatedRoutes.map((route) => (
                <div
                  key={route.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{route.name}</div>
                      <p className="text-sm text-muted-foreground">
                        {route.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => saveRoute(route)}
                      disabled={!user}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Distância:</span>{" "}
                      <span className="font-medium">{route.distance.toFixed(1)} nm</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duração:</span>{" "}
                      <span className="font-medium">{route.estimatedDuration.toFixed(1)}h</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Score de Risco:</span>{" "}
                      <Badge
                        variant={route.riskScore > 50 ? "destructive" : "default"}
                      >
                        {route.riskScore.toFixed(0)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Alertas:</span>{" "}
                      <span className="font-medium">{route.weatherAlerts.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Description */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos do Planejador - PATCH 431</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">✅ Integração com Forecast Global</h3>
              <p className="text-sm text-muted-foreground">
                Dados meteorológicos em tempo real integrados ao planejamento de rotas.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">✅ Interface de Mapa (Mapbox)</h3>
              <p className="text-sm text-muted-foreground">
                Visualização interativa com controles de navegação e marcadores.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">✅ Marcação de Waypoints</h3>
              <p className="text-sm text-muted-foreground">
                Pontos de passagem configuráveis com informações detalhadas.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">✅ Cálculo de ETA Dinâmico</h3>
              <p className="text-sm text-muted-foreground">
                Estimativas de chegada considerando condições meteorológicas.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">✅ Alertas Climáticos</h3>
              <p className="text-sm text-muted-foreground">
                Detecção automática de riscos meteorológicos ao longo da rota.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">✅ Persistência de Dados</h3>
              <p className="text-sm text-muted-foreground">
                Rotas salvas e recuperáveis com histórico completo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoutePlanner;
