/**
 * PATCH 425 - Navigation Copilot Page
 * AI-powered navigation with weather integration and route optimization
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  Navigation,
  MapPin,
  Cloud,
  AlertTriangle,
  TrendingUp,
  Gauge,
  Wind,
  Waves,
  Ship,
  Route as RouteIcon,
  Clock,
  Loader2,
} from "lucide-react";
import { navigationCopilot, NavigationRoute, WeatherAlert, Coordinates } from "@/modules/navigation-copilot";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const NavigationCopilot: React.FC = () => {
  const [routes, setRoutes] = useState<NavigationRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<NavigationRoute | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Route planning form state
  const [originLat, setOriginLat] = useState(-23.5505);
  const [originLng, setOriginLng] = useState(-46.6333);
  const [originName, setOriginName] = useState("Port of Santos");
  const [destLat, setDestLat] = useState(-32.0345);
  const [destLng, setDestLng] = useState(-52.0985);
  const [destName, setDestName] = useState("Rio Grande");

  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);

  useEffect(() => {
    logger.info("Navigation Copilot initialized");
    loadSavedRoutes();
  }, []);

  const loadSavedRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from("navigation_routes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        logger.warn("Failed to load saved routes", { error: error.message });
        return;
      }

      if (data) {
        setSavedRoutes(data);
        logger.info("Saved routes loaded", { count: data.length });
      }
    } catch (error) {
      logger.error("Error loading saved routes", error);
    }
  };

  const handleCalculateRoutes = async () => {
    setIsCalculating(true);
    setRoutes([]);
    setSelectedRoute(null);

    try {
      logger.info("Calculating routes with weather optimization");
      
      const origin: Coordinates = { lat: originLat, lng: originLng };
      const destination: Coordinates = { lat: destLat, lng: destLng };

      const calculatedRoutes = await navigationCopilot.calculateRoute(origin, destination, {
        avoidStorms: true,
        considerFuelEfficiency: true,
        preferShorterDistance: false,
      });

      setRoutes(calculatedRoutes);
      
      if (calculatedRoutes.length > 0) {
        setSelectedRoute(calculatedRoutes[0]);
        toast.success(`${calculatedRoutes.length} route(s) calculated successfully`);
      }

      logger.info("Routes calculated", { count: calculatedRoutes.length });
    } catch (error) {
      logger.error("Failed to calculate routes", error);
      toast.error("Failed to calculate routes. Please try again.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveRoute = async (route: NavigationRoute) => {
    if (isSaving) return;
    
    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("navigation_routes")
        .insert({
          route_name: `${originName} to ${destName}`,
          origin: { lat: route.origin.lat, lng: route.origin.lng, name: originName },
          destination: { lat: route.destination.lat, lng: route.destination.lng, name: destName },
          waypoints: route.waypoints,
          distance_nautical_miles: route.distance,
          estimated_duration_hours: route.estimatedDuration,
          eta_calculated: new Date(Date.now() + route.estimatedDuration * 60 * 60 * 1000).toISOString(),
          eta_with_weather: route.etaWithAI,
          route_type: route.id === "direct" ? "direct" : "weather_optimized",
          risk_score: route.riskScore,
          is_recommended: route.recommended,
          status: "planned",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Save associated alerts
      if (data && route.weatherAlerts.length > 0) {
        const alertsToInsert = route.weatherAlerts.map(alert => ({
          route_id: data.id,
          alert_type: alert.type,
          severity: alert.severity,
          title: `Weather Alert: ${alert.type}`,
          description: alert.description,
          location: alert.location,
          affected_radius_nautical_miles: 50,
          valid_until: new Date(alert.validUntil).toISOString(),
        }));

        await supabase.from("navigation_alerts").insert(alertsToInsert);
      }

      toast.success("Route saved successfully!");
      logger.info("Route saved to database", { routeId: data?.id });
      loadSavedRoutes();
    } catch (error) {
      logger.error("Failed to save route", error);
      toast.error("Failed to save route. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "text-green-400 bg-green-500/10";
      case "medium": return "text-yellow-400 bg-yellow-500/10";
      case "high": return "text-orange-400 bg-orange-500/10";
      case "critical": return "text-red-400 bg-red-500/10";
      default: return "text-gray-400 bg-gray-500/10";
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 20) return "text-green-500";
    if (risk <= 50) return "text-yellow-500";
    if (risk <= 75) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Navigation}
        title="Navigation Copilot"
        description="AI-powered route planning with real-time weather integration"
        gradient="blue"
        badges={[
          { icon: MapPin, label: "Route Optimization" },
          { icon: Cloud, label: "Weather Integration" },
          { icon: AlertTriangle, label: "Risk Assessment" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Planning Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RouteIcon className="w-5 h-5" />
              Route Planning
            </CardTitle>
            <CardDescription>
              Enter origin and destination coordinates to calculate optimized routes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Origin</label>
              <Input
                placeholder="Location name"
                value={originName}
                onChange={(e) => setOriginName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Latitude"
                  value={originLat}
                  onChange={(e) => setOriginLat(parseFloat(e.target.value))}
                />
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Longitude"
                  value={originLng}
                  onChange={(e) => setOriginLng(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <Input
                placeholder="Location name"
                value={destName}
                onChange={(e) => setDestName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Latitude"
                  value={destLat}
                  onChange={(e) => setDestLat(parseFloat(e.target.value))}
                />
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Longitude"
                  value={destLng}
                  onChange={(e) => setDestLng(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <Button
              onClick={handleCalculateRoutes}
              disabled={isCalculating}
              className="w-full"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating Routes...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Calculate Routes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Route Options Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="w-5 h-5" />
              Route Options
            </CardTitle>
            <CardDescription>
              Available routes sorted by risk score
            </CardDescription>
          </CardHeader>
          <CardContent>
            {routes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <RouteIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No routes calculated yet</p>
                <p className="text-sm">Enter coordinates and click Calculate Routes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedRoute?.id === route.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium capitalize">{route.id} Route</h4>
                        {route.recommended && (
                          <Badge variant="default" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <Badge className={getRiskColor(route.riskScore)}>
                        Risk: {route.riskScore}%
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Gauge className="w-4 h-4" />
                        {route.distance.toFixed(1)} nm
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {route.estimatedDuration.toFixed(1)} hrs
                      </div>
                    </div>

                    {route.weatherAlerts.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-yellow-500">
                        <AlertTriangle className="w-3 h-3" />
                        {route.weatherAlerts.length} weather alert(s)
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveRoute(route);
                      }}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Route"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Route Details */}
      {selectedRoute && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Route Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="weather">Weather Alerts</TabsTrigger>
                <TabsTrigger value="waypoints">Waypoints</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Distance</div>
                    <div className="text-2xl font-bold">{selectedRoute.distance.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">nautical miles</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Duration</div>
                    <div className="text-2xl font-bold">{selectedRoute.estimatedDuration.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">hours</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Risk Score</div>
                    <div className={`text-2xl font-bold ${getRiskColor(selectedRoute.riskScore)}`}>
                      {selectedRoute.riskScore}%
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">ETA (w/ AI)</div>
                    <div className="text-sm font-medium">{new Date(selectedRoute.etaWithAI).toLocaleString()}</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="weather" className="space-y-3">
                {selectedRoute.weatherAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Cloud className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No weather alerts for this route</p>
                  </div>
                ) : (
                  selectedRoute.weatherAlerts.map((alert) => (
                    <Card key={alert.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <h4 className="font-medium capitalize">{alert.type.replace("_", " ")}</h4>
                          </div>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Valid until: {new Date(alert.validUntil).toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="waypoints" className="space-y-2">
                <div className="max-h-96 overflow-y-auto">
                  {selectedRoute.waypoints.map((waypoint, index) => (
                    <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <div className="text-sm font-medium">
                            {waypoint.lat.toFixed(4)}°, {waypoint.lng.toFixed(4)}°
                          </div>
                          {waypoint.speed && (
                            <div className="text-xs text-muted-foreground">
                              Speed: {waypoint.speed.toFixed(1)} knots
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Saved Routes */}
      {savedRoutes.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RouteIcon className="w-5 h-5" />
              Saved Routes
            </CardTitle>
            <CardDescription>Recently saved navigation routes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedRoutes.map((route) => (
                <div key={route.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">{route.route_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {route.distance_nautical_miles?.toFixed(1)} nm • Risk: {route.risk_score}%
                    </div>
                  </div>
                  <Badge variant={route.status === "active" ? "default" : "secondary"}>
                    {route.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </ModulePageWrapper>
  );
};

export default NavigationCopilot;
