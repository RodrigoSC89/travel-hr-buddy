/**
 * PATCH 447: Navigation Copilot UI Component
 * AI-powered navigation with route visualization and weather integration
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Navigation,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Cloud,
  Wind,
  Waves,
  Clock,
  Compass,
  Loader2,
} from "lucide-react";
import { navigationCopilot } from "../index";
import type { NavigationRoute, Coordinates } from "../index";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function NavigationCopilotUI() {
  const [routes, setRoutes] = useState<NavigationRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<NavigationRoute | null>(null);
  const { toast } = useToast();

  // Form state
  const [originLat, setOriginLat] = useState("-23.9608");
  const [originLng, setOriginLng] = useState("-46.3333");
  const [destLat, setDestLat] = useState("-22.9068");
  const [destLng, setDestLng] = useState("-43.1729");

  const calculateRoutes = async () => {
    setLoading(true);
    try {
      const origin: Coordinates = {
        lat: parseFloat(originLat),
        lng: parseFloat(originLng),
      };
      const destination: Coordinates = {
        lat: parseFloat(destLat),
        lng: parseFloat(destLng),
      };

      const calculatedRoutes = await navigationCopilot.calculateRoute(origin, destination, {
        avoidStorms: true,
        maxWindSpeed: 35,
        maxWaveHeight: 4,
        preferShorterDistance: false,
        considerFuelEfficiency: true,
      });

      setRoutes(calculatedRoutes);
      if (calculatedRoutes.length > 0) {
        setSelectedRoute(calculatedRoutes[0]);
        
        // Save to database
        await saveRouteToDatabase(calculatedRoutes[0]);
      }

      toast({
        title: "Routes Calculated",
        description: `Found ${calculatedRoutes.length} route option(s)`,
      });
    } catch (error) {
      console.error("Error calculating routes:", error);
      toast({
        title: "Error",
        description: "Failed to calculate routes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRouteToDatabase = async (route: NavigationRoute) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("route_suggestions").insert({
        origin_lat: route.origin.lat,
        origin_lng: route.origin.lng,
        destination_lat: route.destination.lat,
        destination_lng: route.destination.lng,
        suggested_route: route.waypoints,
        distance_nm: route.distance,
        estimated_duration_hours: route.estimatedDuration,
        eta: route.etaWithAI,
        weather_conditions: route.weatherAlerts,
        risk_score: route.riskScore,
        ai_confidence: route.recommended ? 95 : 75,
        reasoning: `AI recommended route with ${route.weatherAlerts.length} weather alerts`,
        status: "suggested",
        created_by: user?.id,
      });
    } catch (error) {
      console.error("Error saving route:", error);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 20) return "bg-green-500";
    if (score < 40) return "bg-yellow-500";
    if (score < 70) return "bg-orange-500";
    return "bg-red-500";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-orange-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Navigation className="w-8 h-8 text-blue-500" />
            Navigation Copilot
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered navigation with weather integration - PATCH 447
          </p>
        </div>
        {selectedRoute && (
          <Badge className={getRiskColor(selectedRoute.riskScore)}>
            Risk: {selectedRoute.riskScore}/100
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500" />
                Origin (Lat, Lng)
              </label>
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
                Destination (Lat, Lng)
              </label>
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

          <Button
            className="w-full mt-4"
            onClick={calculateRoutes}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating Routes...
              </>
            ) : (
              <>
                <Compass className="w-4 h-4 mr-2" />
                Calculate AI Routes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {routes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Options ({routes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRoute?.id === route.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      <span className="font-medium capitalize">
                        {route.id} Route
                      </span>
                      {route.recommended && (
                        <Badge variant="default">Recommended</Badge>
                      )}
                    </div>
                    <Badge className={getRiskColor(route.riskScore)}>
                      {route.riskScore}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {route.distance.toFixed(1)} nm
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {route.estimatedDuration.toFixed(1)}h
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {route.weatherAlerts.length} alerts
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    ETA: {route.etaWithAI}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {selectedRoute && (
            <Card>
              <CardHeader>
                <CardTitle>Route Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="weather">
                      Weather Alerts ({selectedRoute.weatherAlerts.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Distance
                        </div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-500" />
                          {selectedRoute.distance.toFixed(1)} nm
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Duration
                        </div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-500" />
                          {selectedRoute.estimatedDuration.toFixed(1)}h
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Risk Score
                        </div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                          {selectedRoute.riskScore}/100
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Waypoints
                        </div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-green-500" />
                          {selectedRoute.waypoints.length}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium mb-2">
                        Estimated Time of Arrival
                      </div>
                      <div className="text-lg">{selectedRoute.etaWithAI}</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="weather" className="space-y-3">
                    {selectedRoute.weatherAlerts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Cloud className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No weather alerts for this route</p>
                      </div>
                    ) : (
                      selectedRoute.weatherAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-4 border rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {alert.type === "storm" && (
                                <Cloud className="w-4 h-4" />
                              )}
                              {alert.type === "high_winds" && (
                                <Wind className="w-4 h-4" />
                              )}
                              {alert.type === "high_waves" && (
                                <Waves className="w-4 h-4" />
                              )}
                              <span className="font-medium capitalize">
                                {alert.type.replace("_", " ")}
                              </span>
                            </div>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>

                          <p className="text-sm">{alert.description}</p>

                          <div className="text-xs text-muted-foreground">
                            Valid until:{" "}
                            {new Date(alert.validUntil).toLocaleString()}
                          </div>

                          <div className="text-xs">
                            📍 {alert.location.lat.toFixed(4)}°,{" "}
                            {alert.location.lng.toFixed(4)}°
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default NavigationCopilotUI;
