/**
 * PATCH 449: Enhanced Route Planner with dynamic ETA and database integration
 * Advanced route planning with Supabase integration
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Navigation,
  Plus,
  TrendingUp,
  Clock,
  MapPin,
  Save,
  Wind,
  Loader2,
} from "lucide-react";
import { RoutePlannerMap, type RouteData, type RoutePoint } from "./RoutePlannerMap";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlannedRoute {
  id: string;
  vessel_id?: string;
  route_name: string;
  route_type: "planned" | "alternative" | "actual";
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  waypoints: RoutePoint[];
  distance_nm?: number;
  estimated_duration_hours?: number;
  average_speed_knots?: number;
  departure_time?: string;
  eta?: string;
  weather_integrated: boolean;
  fuel_estimate?: number;
  route_color: string;
  is_active: boolean;
}

export function EnhancedRoutePlanner() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<PlannedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [livePosition, setLivePosition] = useState<{ longitude: number; latitude: number }>({
    longitude: -44.9,
    latitude: -23.3,
  });
  const { toast } = useToast();

  // Form state for new route
  const [routeName, setRouteName] = useState("New Route");
  const [originLat, setOriginLat] = useState("-23.9608");
  const [originLng, setOriginLng] = useState("-46.3333");
  const [originName, setOriginName] = useState("Porto de Santos");
  const [destLat, setDestLat] = useState("-22.9068");
  const [destLng, setDestLng] = useState("-43.1729");
  const [destName, setDestName] = useState("Porto do Rio de Janeiro");
  const [avgSpeed, setAvgSpeed] = useState("10"); // knots
  const [weatherFactor, setWeatherFactor] = useState("1.0"); // multiplier for ETA

  useEffect(() => {
    loadSavedRoutes();
  }, []);

  const loadSavedRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from("planned_routes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setSavedRoutes(data);
        
        // Convert to RouteData format for map display
        const mapRoutes: RouteData[] = data
          .filter((r) => r.is_active)
          .map((route) => ({
            id: route.id,
            name: route.route_name,
            type: route.route_type,
            color: route.route_color,
            distance: route.distance_nm,
            duration: route.estimated_duration_hours,
            points: route.waypoints as RoutePoint[],
          }));
        
        setRoutes(mapRoutes);
      }
    } catch (error) {
      console.error("Error loading routes:", error);
      toast({
        title: "Error",
        description: "Failed to load saved routes",
        variant: "destructive",
      });
    }
  };

  const calculateDistance = (p1: RoutePoint, p2: RoutePoint): number => {
    // Haversine formula for great circle distance
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
    const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.latitude * Math.PI) / 180) *
      Math.cos((p2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const generateWaypoints = (
    origin: RoutePoint,
    destination: RoutePoint,
    count: number = 5
  ): RoutePoint[] => {
    const waypoints: RoutePoint[] = [origin];
    
    for (let i = 1; i < count; i++) {
      const ratio = i / count;
      waypoints.push({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * ratio,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * ratio,
        name: `Waypoint ${i}`,
      });
    }
    
    waypoints.push(destination);
    return waypoints;
  };

  const calculateRouteDistance = (points: RoutePoint[]): number => {
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      totalDistance += calculateDistance(points[i], points[i + 1]);
    }
    return totalDistance;
  };

  const calculateETA = (distance: number, speed: number, weatherMultiplier: number): Date => {
    const baseHours = distance / speed;
    const adjustedHours = baseHours * weatherMultiplier;
    const eta = new Date();
    eta.setHours(eta.getHours() + adjustedHours);
    return eta;
  };

  const createNewRoute = async () => {
    setLoading(true);
    try {
      const origin: RoutePoint = {
        latitude: parseFloat(originLat),
        longitude: parseFloat(originLng),
        name: originName,
      };
      
      const destination: RoutePoint = {
        latitude: parseFloat(destLat),
        longitude: parseFloat(destLng),
        name: destName,
      };

      const waypoints = generateWaypoints(origin, destination, 5);
      const distance = calculateRouteDistance(waypoints);
      const speed = parseFloat(avgSpeed);
      const weather = parseFloat(weatherFactor);
      const duration = (distance / speed) * weather;
      const eta = calculateETA(distance, speed, weather);

      const newRoute: PlannedRoute = {
        id: crypto.randomUUID(),
        route_name: routeName,
        route_type: "planned",
        origin: { lat: origin.latitude, lng: origin.longitude, name: origin.name || "" },
        destination: { lat: destination.latitude, lng: destination.longitude, name: destination.name || "" },
        waypoints,
        distance_nm: distance,
        estimated_duration_hours: duration,
        average_speed_knots: speed,
        departure_time: new Date().toISOString(),
        eta: eta.toISOString(),
        weather_integrated: weather !== 1.0,
        route_color: "#3b82f6",
        is_active: true,
      };

      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("planned_routes").insert({
        vessel_id: null, // Can be set if vessel is selected
        route_name: newRoute.route_name,
        route_type: newRoute.route_type,
        origin: newRoute.origin,
        destination: newRoute.destination,
        waypoints: newRoute.waypoints,
        distance_nm: newRoute.distance_nm,
        estimated_duration_hours: newRoute.estimated_duration_hours,
        average_speed_knots: newRoute.average_speed_knots,
        departure_time: newRoute.departure_time,
        eta: newRoute.eta,
        weather_integrated: newRoute.weather_integrated,
        route_color: newRoute.route_color,
        is_active: newRoute.is_active,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Route Created",
        description: `${routeName} has been saved successfully`,
      });

      // Reload routes
      await loadSavedRoutes();
    } catch (error) {
      console.error("Error creating route:", error);
      toast({
        title: "Error",
        description: "Failed to create route",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (routeId: string) => {
    console.log("Route selected:", routeId);
  };

  const selectedRoute = routes.find((r) => r.type === "planned");
  const alternativeRoute = routes.find((r) => r.type === "alternative");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Route Planner v2</h1>
            <p className="text-muted-foreground">
              Advanced route planning with dynamic ETA - PATCH 449
            </p>
          </div>
        </div>
        <Badge variant="outline">{routes.length} Active Routes</Badge>
      </div>

      <Tabs defaultValue="planner" className="space-y-4">
        <TabsList>
          <TabsTrigger value="planner">Route Planner</TabsTrigger>
          <TabsTrigger value="saved">Saved Routes ({savedRoutes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Distance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedRoute ? (selectedRoute.distance! / 1852).toFixed(0) : "0"} nm
                </div>
                <p className="text-xs text-muted-foreground">Nautical miles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">ETA</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedRoute?.duration?.toFixed(1) || "0"}h
                </div>
                <p className="text-xs text-muted-foreground">Estimated time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Fuel Savings</CardTitle>
                <Navigation className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {selectedRoute && alternativeRoute
                    ? `${((alternativeRoute.distance! - selectedRoute.distance!) / 1852).toFixed(0)} nm`
                    : "0 nm"}
                </div>
                <p className="text-xs text-muted-foreground">vs. alternative</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create New Route</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Route Name</label>
                  <Input
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="Route name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    Weather Factor
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={weatherFactor}
                    onChange={(e) => setWeatherFactor(e.target.value)}
                    placeholder="1.0 = normal, 1.2 = 20% delay"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Origin
                  </label>
                  <Input
                    value={originName}
                    onChange={(e) => setOriginName(e.target.value)}
                    placeholder="Port name"
                    className="mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Latitude"
                      value={originLat}
                      onChange={(e) => setOriginLat(e.target.value)}
                    />
                    <Input
                      placeholder="Longitude"
                      value={originLng}
                      onChange={(e) => setOriginLng(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Destination
                  </label>
                  <Input
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    placeholder="Port name"
                    className="mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Latitude"
                      value={destLat}
                      onChange={(e) => setDestLat(e.target.value)}
                    />
                    <Input
                      placeholder="Longitude"
                      value={destLng}
                      onChange={(e) => setDestLng(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Average Speed (knots)</label>
                <Input
                  type="number"
                  value={avgSpeed}
                  onChange={(e) => setAvgSpeed(e.target.value)}
                  placeholder="10"
                />
              </div>

              <Button onClick={createNewRoute} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Route...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create & Save Route
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <RoutePlannerMap
            center={[-45, -23.5]}
            zoom={7}
            routes={routes}
            livePosition={livePosition}
            onRouteSelect={handleRouteSelect}
          />
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Routes</CardTitle>
            </CardHeader>
            <CardContent>
              {savedRoutes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Navigation className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No saved routes yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedRoutes.map((route) => (
                    <div
                      key={route.id}
                      className="p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4" />
                          <span className="font-medium">{route.route_name}</span>
                          <Badge variant={route.is_active ? "default" : "secondary"}>
                            {route.route_type}
                          </Badge>
                        </div>
                        {route.weather_integrated && (
                          <Badge variant="outline">
                            <Wind className="w-3 h-3 mr-1" />
                            Weather
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div>
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          {route.distance_nm?.toFixed(1)} nm
                        </div>
                        <div>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {route.estimated_duration_hours?.toFixed(1)}h
                        </div>
                        <div>
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {route.waypoints.length} waypoints
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        {route.origin.name} → {route.destination.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EnhancedRoutePlanner;
