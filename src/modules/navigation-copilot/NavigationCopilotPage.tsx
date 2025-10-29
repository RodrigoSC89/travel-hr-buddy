/**
 * PATCH 456 - Navigation Copilot Main Page
 * Complete navigation system with AI-powered route planning, weather integration, and interactive map
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Navigation,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Clock,
  Compass,
  Save,
  RefreshCw,
  Activity,
  Wind,
  Waves,
} from "lucide-react";
import { NavigationMap } from "./components/NavigationMap";
import { navigationCopilot, type Coordinates, type NavigationRoute, type RouteOptimizationOptions } from "./index";
import { navigationAILogsService } from "./services/navigationAILogsService";
import { toast } from "sonner";

const NavigationCopilotPage: React.FC = () => {
  const [origin, setOrigin] = useState<Coordinates>({ lat: -23.5505, lng: -46.6333 }); // São Paulo
  const [destination, setDestination] = useState<Coordinates>({ lat: -22.9068, lng: -43.1729 }); // Rio
  const [routes, setRoutes] = useState<NavigationRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<NavigationRoute | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentPosition] = useState<Coordinates>({ lat: -23.5505, lng: -46.6333 });
  
  const [optimizationOptions, setOptimizationOptions] = useState<RouteOptimizationOptions>({
    avoidStorms: true,
    considerFuelEfficiency: true,
    preferShorterDistance: false,
  });

  const [stats, setStats] = useState({
    totalLogs: 0,
    recommendedCount: 0,
    avgRiskScore: 0,
    totalDistance: 0,
    totalAlerts: 0,
  });

  // Load statistics on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const userStats = await navigationAILogsService.getNavigationStats();
    if (userStats) {
      setStats(userStats);
    }
  };

  const calculateRoutes = async () => {
    setIsCalculating(true);
    try {
      const calculatedRoutes = await navigationCopilot.calculateRoute(
        origin,
        destination,
        optimizationOptions
      );

      setRoutes(calculatedRoutes);
      setSelectedRoute(calculatedRoutes[0] || null);

      // Save all routes to database
      for (const route of calculatedRoutes) {
        await navigationAILogsService.saveNavigationLog({
          origin,
          destination,
          route,
          optimizationOptions,
        });
      }

      // Reload stats
      await loadStats();

      toast.success(`${calculatedRoutes.length} rotas calculadas com sucesso!`);
    } catch (error) {
      console.error("Failed to calculate routes:", error);
      toast.error("Falha ao calcular rotas");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleRouteSelect = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (route) {
      setSelectedRoute(route);
      toast.info(`Rota selecionada: ${route.id}`);
    }
  };

  const allWeatherAlerts = routes.flatMap((route) => route.weatherAlerts);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Navigation Copilot</h1>
            <p className="text-sm text-muted-foreground">
              PATCH 456 - AI-powered navigation with weather integration
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-green-500 text-green-500">
          <Activity className="w-4 h-4 mr-1" />
          Active
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">Calculated routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recommended</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recommendedCount}</div>
            <p className="text-xs text-muted-foreground">AI recommended</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRiskScore.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <Compass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistance.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Nautical miles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weather Alerts</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">Total alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Route Planning Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Route Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origin (Latitude, Longitude)</Label>
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
              <Label>Destination (Latitude, Longitude)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.0001"
                  value={destination.lat}
                  onChange={(e) =>
                    setDestination({ ...destination, lat: parseFloat(e.target.value) })
                  }
                  placeholder="Latitude"
                />
                <Input
                  type="number"
                  step="0.0001"
                  value={destination.lng}
                  onChange={(e) =>
                    setDestination({ ...destination, lng: parseFloat(e.target.value) })
                  }
                  placeholder="Longitude"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={optimizationOptions.avoidStorms ? "default" : "outline"}
              onClick={() =>
                setOptimizationOptions({
                  ...optimizationOptions,
                  avoidStorms: !optimizationOptions.avoidStorms,
                })
              }
              size="sm"
            >
              <Waves className="w-4 h-4 mr-2" />
              Avoid Storms
            </Button>
            <Button
              variant={optimizationOptions.considerFuelEfficiency ? "default" : "outline"}
              onClick={() =>
                setOptimizationOptions({
                  ...optimizationOptions,
                  considerFuelEfficiency: !optimizationOptions.considerFuelEfficiency,
                })
              }
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Fuel Efficiency
            </Button>
            <Button
              variant={optimizationOptions.preferShorterDistance ? "default" : "outline"}
              onClick={() =>
                setOptimizationOptions({
                  ...optimizationOptions,
                  preferShorterDistance: !optimizationOptions.preferShorterDistance,
                })
              }
              size="sm"
            >
              <Compass className="w-4 h-4 mr-2" />
              Shorter Distance
            </Button>
          </div>

          <Button onClick={calculateRoutes} disabled={isCalculating} className="w-full">
            {isCalculating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Calculating routes with AI...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Calculate AI-Optimized Routes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <NavigationMap
        center={[origin.lng, origin.lat]}
        zoom={8}
        routes={routes}
        weatherAlerts={allWeatherAlerts}
        currentPosition={currentPosition}
        onRouteSelect={handleRouteSelect}
      />

      {/* Route Details */}
      {selectedRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Route Details: {selectedRoute.id}
              </span>
              {selectedRoute.recommended && (
                <Badge className="bg-green-500">AI Recommended</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Distance</div>
                <div className="text-2xl font-bold">{selectedRoute.distance.toFixed(1)} nm</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="text-2xl font-bold">
                  {selectedRoute.estimatedDuration.toFixed(1)}h
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Risk Score</div>
                <div className="text-2xl font-bold">{selectedRoute.riskScore}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">ETA</div>
                <div className="text-lg font-semibold">{selectedRoute.etaWithAI}</div>
              </div>
            </div>

            <Separator />

            {selectedRoute.weatherAlerts.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Weather Alerts ({selectedRoute.weatherAlerts.length})
                </div>
                <div className="space-y-2">
                  {selectedRoute.weatherAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium capitalize">
                            {alert.type.replace("_", " ")}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            alert.severity === "critical" || alert.severity === "high"
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
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Route calculated with {selectedRoute.waypoints.length} waypoints using AI-powered
              weather analysis and risk assessment.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features - PATCH 456</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Interactive Map (Mapbox)
              </h3>
              <p className="text-sm text-muted-foreground">
                Visualize routes with weather alerts and waypoints on an interactive map.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                AI Route Suggestions
              </h3>
              <p className="text-sm text-muted-foreground">
                Intelligent route optimization based on weather, traffic, and efficiency.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                Risk Alerts
              </h3>
              <p className="text-sm text-muted-foreground">
                Real-time weather and traffic alerts along your route.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Save className="w-4 h-4 text-primary" />
                Log Persistence
              </h3>
              <p className="text-sm text-muted-foreground">
                All route calculations saved to `navigation_ai_logs` table.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationCopilotPage;
