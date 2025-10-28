/**
 * PATCH 425 - Navigation Copilot v1
 * AI-powered navigation assistant with real-time recommendations
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Navigation,
  Wind,
  CloudRain,
  AlertTriangle,
  CheckCircle,
  Brain,
  MapPin,
  Compass,
  Activity,
  TrendingUp,
  Waves,
  ThermometerSun
} from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

interface WeatherCondition {
  location: string;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  waveHeight: number;
  visibility: number;
  severity: "safe" | "caution" | "danger";
  description: string;
}

interface AISuggestion {
  type: "route" | "weather" | "performance" | "risk";
  priority: "low" | "medium" | "high" | "critical";
  message: string;
  action?: string;
}

export default function NavigationCopilot() {
  const [origin, setOrigin] = useState<RoutePoint>({ lat: -23.5505, lng: -46.6333, name: "São Paulo Bay" });
  const [destination, setDestination] = useState<RoutePoint>({ lat: -22.9068, lng: -43.1729, name: "Rio de Janeiro" });
  const [isActive, setIsActive] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherCondition[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [routeDistance, setRouteDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  useEffect(() => {
    logger.info("Navigation Copilot initialized - PATCH 425");
    simulateWeatherData();
  }, []);

  useEffect(() => {
    if (isActive) {
      generateAISuggestions();
      const interval = setInterval(generateAISuggestions, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isActive, weatherData]);

  const simulateWeatherData = () => {
    // Simulate weather conditions along the route
    const conditions: WeatherCondition[] = [
      {
        location: "Origin - São Paulo Bay",
        temperature: 24,
        windSpeed: 15,
        windDirection: "NE",
        waveHeight: 1.5,
        visibility: 10,
        severity: "safe",
        description: "Clear conditions, light winds"
      },
      {
        location: "Mid-route - Santos Region",
        temperature: 25,
        windSpeed: 22,
        windDirection: "E",
        waveHeight: 2.3,
        visibility: 8,
        severity: "caution",
        description: "Moderate winds, increasing wave height"
      },
      {
        location: "Destination - Rio de Janeiro",
        temperature: 26,
        windSpeed: 18,
        windDirection: "SE",
        waveHeight: 1.8,
        visibility: 9,
        severity: "safe",
        description: "Good conditions, moderate sea state"
      }
    ];
    setWeatherData(conditions);
    logger.info("Weather data simulated", { conditionsCount: conditions.length });
  };

  const calculateRoute = () => {
    // Calculate distance using Haversine formula (simplified)
    const lat1 = origin.lat * Math.PI / 180;
    const lat2 = destination.lat * Math.PI / 180;
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLng = (destination.lng - origin.lng) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371 * c; // Earth radius in km

    const nauticalMiles = distance * 0.539957; // Convert to nautical miles
    const averageSpeed = 15; // knots
    const time = nauticalMiles / averageSpeed;

    setRouteDistance(nauticalMiles);
    setEstimatedTime(time);

    logger.info("Route calculated", { distance: nauticalMiles, time });
  };

  const generateAISuggestions = () => {
    const newSuggestions: AISuggestion[] = [];

    // Weather-based suggestions
    const cautionAreas = weatherData.filter(w => w.severity === "caution" || w.severity === "danger");
    if (cautionAreas.length > 0) {
      newSuggestions.push({
        type: "weather",
        priority: "medium",
        message: `${cautionAreas.length} weather alert(s) detected along route`,
        action: "Consider route adjustment to avoid high wind areas"
      });
    }

    // Performance suggestions
    const avgWindSpeed = weatherData.reduce((sum, w) => sum + w.windSpeed, 0) / weatherData.length;
    if (avgWindSpeed > 20) {
      newSuggestions.push({
        type: "performance",
        priority: "medium",
        message: "High wind conditions detected",
        action: "Reduce speed by 15% for optimal fuel efficiency and safety"
      });
    }

    // Route optimization
    if (routeDistance > 0) {
      newSuggestions.push({
        type: "route",
        priority: "low",
        message: "Optimal route calculated",
        action: `Maintain current heading. ETA: ${estimatedTime.toFixed(1)} hours`
      });
    }

    // Risk assessment
    const riskScore = calculateRiskScore();
    if (riskScore > 60) {
      newSuggestions.push({
        type: "risk",
        priority: "high",
        message: "Elevated risk level detected",
        action: "Monitor conditions closely and prepare contingency plans"
      });
    } else {
      newSuggestions.push({
        type: "risk",
        priority: "low",
        message: "Conditions are favorable for navigation",
        action: "Maintain current course and speed"
      });
    }

    setSuggestions(newSuggestions);
    logger.info("AI suggestions generated", { count: newSuggestions.length });
  };

  const calculateRiskScore = (): number => {
    let score = 0;
    weatherData.forEach(w => {
      if (w.severity === "caution") score += 20;
      if (w.severity === "danger") score += 40;
      if (w.windSpeed > 25) score += 15;
      if (w.waveHeight > 3) score += 10;
      if (w.visibility < 5) score += 15;
    });
    return Math.min(score, 100);
  };

  const activateCopilot = () => {
    calculateRoute();
    setIsActive(true);
    toast.success("Navigation Copilot activated");
    logger.info("Navigation Copilot activated");
  };

  const deactivateCopilot = () => {
    setIsActive(false);
    toast.info("Navigation Copilot deactivated");
    logger.info("Navigation Copilot deactivated");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "safe": return "text-green-500 bg-green-500/10";
      case "caution": return "text-yellow-500 bg-yellow-500/10";
      case "danger": return "text-red-500 bg-red-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-blue-500/10 text-blue-500";
      case "medium": return "bg-yellow-500/10 text-yellow-500";
      case "high": return "bg-orange-500/10 text-orange-500";
      case "critical": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Navigation className="h-8 w-8" />
            Navigation Copilot
          </h1>
          <p className="text-muted-foreground">
            PATCH 425 - AI-powered navigation assistant with real-time recommendations
          </p>
        </div>
        <Badge variant="outline" className={isActive ? "text-green-600" : "text-gray-600"}>
          {isActive ? (
            <>
              <Activity className="h-4 w-4 mr-1 animate-pulse" />
              Active
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Standby
            </>
          )}
        </Badge>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Route Configuration</CardTitle>
          <CardDescription>Set your origin and destination for AI-powered guidance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Origin</label>
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
              <label className="text-sm font-medium">Destination</label>
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

          <div className="flex gap-2">
            {!isActive ? (
              <Button onClick={activateCopilot} className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Activate Copilot
              </Button>
            ) : (
              <Button onClick={deactivateCopilot} variant="destructive" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Deactivate Copilot
              </Button>
            )}
          </div>

          {routeDistance > 0 && (
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Distance</p>
                  <p className="font-semibold">{routeDistance.toFixed(1)} NM</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">ETA</p>
                  <p className="font-semibold">{estimatedTime.toFixed(1)} hours</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="weather">Weather Data</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Risks</TabsTrigger>
        </TabsList>

        {/* AI Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>Real-time navigation guidance based on current conditions</CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Activate copilot to receive AI suggestions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${getPriorityColor(suggestion.priority)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {suggestion.type === "route" && <MapPin className="h-4 w-4" />}
                          {suggestion.type === "weather" && <CloudRain className="h-4 w-4" />}
                          {suggestion.type === "performance" && <TrendingUp className="h-4 w-4" />}
                          {suggestion.type === "risk" && <AlertTriangle className="h-4 w-4" />}
                          <span className="font-medium capitalize">{suggestion.type}</span>
                        </div>
                        <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{suggestion.message}</p>
                      {suggestion.action && (
                        <p className="text-xs opacity-75">
                          <strong>Action:</strong> {suggestion.action}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="h-5 w-5" />
                Weather Conditions
              </CardTitle>
              <CardDescription>Real-time weather data along your route</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weatherData.map((weather, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{weather.location}</span>
                      </div>
                      <Badge className={getSeverityColor(weather.severity)}>
                        {weather.severity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <ThermometerSun className="h-4 w-4 text-orange-500" />
                        <span>{weather.temperature}°C</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-blue-500" />
                        <span>{weather.windSpeed} kts {weather.windDirection}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Waves className="h-4 w-4 text-cyan-500" />
                        <span>{weather.waveHeight}m waves</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{weather.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alerts & Risk Assessment
              </CardTitle>
              <CardDescription>Current risk level and safety alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Overall Risk Score</span>
                    <Badge className={calculateRiskScore() > 60 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}>
                      {calculateRiskScore()}/100
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className={`h-2.5 rounded-full ${calculateRiskScore() > 60 ? "bg-red-500" : "bg-green-500"}`}
                      style={{ width: `${calculateRiskScore()}%` }}
                    ></div>
                  </div>
                </div>

                {weatherData.filter(w => w.severity !== "safe").map((weather, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-700 dark:text-yellow-400">
                          {weather.location}
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                          {weather.description} - Wind: {weather.windSpeed} kts, Waves: {weather.waveHeight}m
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {weatherData.every(w => w.severity === "safe") && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                    <p>No active alerts - Conditions are favorable</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
