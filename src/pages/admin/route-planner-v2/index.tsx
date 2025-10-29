/**
 * PATCH 532 - Route Planner v2 with AI Geospatial + Weather
 * Enhanced route planning with weather integration, multiple suggestions, and mission logging
 */

// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Navigation,
  Map,
  List,
  CloudRain,
  Save,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { routePlannerService, type Route } from "@/modules/route-planner/services/routePlannerService";
import { weatherIntegrationService, type RouteWeatherImpact } from "@/modules/route-planner/services/weatherIntegrationService";
import { RouteSuggestionCard } from "@/modules/route-planner/components/RouteSuggestionCard";
import type { Coordinates } from "@/modules/navigation-copilot";

const RoutePlannerV2Page: React.FC = () => {
  const { user } = useAuth();
  const [origin, setOrigin] = useState<Coordinates>({ lat: -23.9608, lng: -46.3333 }); // Santos
  const [destination, setDestination] = useState<Coordinates>({ lat: -22.9068, lng: -43.1729 }); // Rio
  const [missionId, setMissionId] = useState<string>("");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [weatherImpacts, setWeatherImpacts] = useState<Map<string, RouteWeatherImpact>>(new Map());
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [stats, setStats] = useState({
    totalRoutes: 0,
    avgSafety: 0,
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const savedRoutes = await routePlannerService.getUserRoutes(user.id);
      const avgSafety = savedRoutes.length > 0
        ? savedRoutes.reduce((sum, r) => sum + (100 - r.riskScore), 0) / savedRoutes.length
        : 0;

      setStats({
        totalRoutes: savedRoutes.length,
        avgSafety,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const calculateRoutesWithWeather = async () => {
    if (!origin || !destination) {
      toast.error("Please set origin and destination");
      return;
    }

    setIsCalculating(true);
    setRoutes([]);
    setSelectedRoute(null);
    setWeatherImpacts(new Map());

    try {
      toast.info("Calculating routes with weather analysis...");

      // Calculate multiple route options
      const calculatedRoutes = await routePlannerService.calculateRoutes(origin, destination, {
        avoidStorms: true,
        considerFuelEfficiency: true,
      });

      // Get AI-optimized route suggestion
      const optimizedRoute = await routePlannerService.suggestOptimalRoute(
        origin,
        destination,
        12, // vessel speed in knots
        50  // fuel consumption rate
      );

      // Combine routes (remove duplicates)
      const allRoutes = [optimizedRoute, ...calculatedRoutes.filter(r => r.id !== optimizedRoute.id)];
      
      // Calculate weather impact for each route
      const impacts = new Map<string, RouteWeatherImpact>();
      for (const route of allRoutes) {
        const waypoints = route.waypoints.map(wp => ({
          lat: wp.latitude,
          lng: wp.longitude,
        }));
        
        const impact = await weatherIntegrationService.calculateRouteWeatherImpact(waypoints, 12);
        impacts.set(route.id || route.name, impact);
      }

      setRoutes(allRoutes);
      setWeatherImpacts(impacts);
      setSelectedRoute(allRoutes[0]); // Select recommended route by default

      toast.success(`${allRoutes.length} routes calculated with weather analysis`);
    } catch (error) {
      console.error("Failed to calculate routes:", error);
      toast.error("Failed to calculate routes");
    } finally {
      setIsCalculating(false);
    }
  };

  const saveSelectedRoute = async () => {
    if (!selectedRoute || !user) {
      toast.error("Please select a route and ensure you're logged in");
      return;
    }

    setIsSaving(true);

    try {
      // Add mission ID to route metadata
      const routeWithMission = {
        ...selectedRoute,
        description: `${selectedRoute.description || ''} | Mission ID: ${missionId || 'N/A'}`,
      };

      await routePlannerService.saveRoute(routeWithMission, user.id);
      
      toast.success("Route saved successfully with mission ID");
      await loadStats();
    } catch (error) {
      console.error("Failed to save route:", error);
      toast.error("Failed to save route");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Route Planner v2</h1>
            <p className="text-sm text-muted-foreground">
              PATCH 532 - AI Geospatial Integration with Weather Analysis
            </p>
          </div>
        </div>
        <Badge variant="default" className="gap-2">
          <CloudRain className="h-4 w-4" />
          Weather Integrated
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Routes Planned</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoutes}</div>
            <p className="text-xs text-muted-foreground">Saved routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Safety Score</CardTitle>
            <CloudRain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSafety.toFixed(0)}/100</div>
            <p className="text-xs text-muted-foreground">Weather-adjusted</p>
          </CardContent>
        </Card>
      </div>

      {/* Route Planning Form */}
      <Card>
        <CardHeader>
          <CardTitle>Route Planning Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Origin (Lat, Lng)</Label>
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
              <Label>Destination (Lat, Lng)</Label>
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

            <div className="space-y-2">
              <Label>Mission ID (Optional)</Label>
              <Input
                value={missionId}
                onChange={(e) => setMissionId(e.target.value)}
                placeholder="Enter mission ID"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={calculateRoutesWithWeather}
              disabled={isCalculating}
              className="flex-1"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Calculate Routes with Weather
                </>
              )}
            </Button>

            <Button
              onClick={saveSelectedRoute}
              disabled={!selectedRoute || isSaving}
              variant="outline"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Route
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Route Suggestions */}
      {routes.length > 0 && (
        <Tabs defaultValue="suggestions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suggestions">
              <List className="mr-2 h-4 w-4" />
              Route Suggestions
            </TabsTrigger>
            <TabsTrigger value="map">
              <Map className="mr-2 h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {routes.map((route) => (
                <RouteSuggestionCard
                  key={route.id || route.name}
                  route={route}
                  weatherImpact={weatherImpacts.get(route.id || route.name)}
                  onSelect={() => setSelectedRoute(route)}
                  isSelected={selectedRoute?.id === route.id || selectedRoute?.name === route.name}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Route Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Map visualization with route overlay and weather data
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RoutePlannerV2Page;
