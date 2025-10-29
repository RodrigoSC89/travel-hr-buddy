/**
 * PATCH 489 - Navigation Copilot v2
 * Enhanced with route overlay, AI suggestions, and decision logs
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Navigation,
  MapPin,
  AlertTriangle,
  Wind,
  Waves,
  Compass,
  Clock,
  Brain,
  TrendingUp,
  CheckCircle,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { navigationCopilot, type Coordinates, type NavigationRoute } from "@/modules/navigation-copilot";

interface AISuggestion {
  id: string;
  type: "weather" | "route" | "speed" | "fuel" | "safety";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  recommendation: string;
  timestamp: Date;
}

interface DecisionLog {
  id: string;
  timestamp: Date;
  decision: string;
  rationale: string;
  parameters: Record<string, any>;
  outcome: "applied" | "ignored" | "pending";
}

const NavigationCopilotV2: React.FC = () => {
  const [origin, setOrigin] = useState<Coordinates>({ lat: -23.5505, lng: -46.6333 });
  const [destination, setDestination] = useState<Coordinates>({ lat: -22.9068, lng: -43.1729 });
  const [routes, setRoutes] = useState<NavigationRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<NavigationRoute | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [simulationMode, setSimulationMode] = useState(true);

  useEffect(() => {
    // Initialize with mock suggestions
    generateAISuggestions();
    initializeDecisionLogs();
  }, []);

  const calculateRoutes = async () => {
    setIsCalculating(true);
    try {
      const calculatedRoutes = await navigationCopilot.calculateRoute(
        origin,
        destination,
        { avoidStorms: true, considerFuelEfficiency: true }
      );

      setRoutes(calculatedRoutes);
      setSelectedRoute(calculatedRoutes[0] || null);

      // Generate AI suggestions based on route
      generateAISuggestions(calculatedRoutes[0]);

      // Log decision
      logDecision("Route Calculated", "AI-optimized route selected based on weather and fuel efficiency", {
        routeCount: calculatedRoutes.length,
        recommendedRoute: calculatedRoutes[0]?.id
      });

      toast.success(`${calculatedRoutes.length} routes calculated successfully`);
    } catch (error) {
      console.error("Failed to calculate routes:", error);
      toast.error("Failed to calculate routes");
    } finally {
      setIsCalculating(false);
    }
  };

  const generateAISuggestions = (route?: NavigationRoute) => {
    const suggestions: AISuggestion[] = [
      {
        id: "sug-1",
        type: "weather",
        priority: "high",
        title: "Wind Adjustment Recommended",
        description: "Strong crosswinds detected at 15:00-18:00 UTC",
        recommendation: "Adjust heading +5° to compensate for 25-knot westerly winds",
        timestamp: new Date()
      },
      {
        id: "sug-2",
        type: "route",
        priority: "medium",
        title: "Alternative Route Available",
        description: "Current route passes near tropical disturbance",
        recommendation: "Consider route alternative +20nm to avoid weather system",
        timestamp: new Date()
      },
      {
        id: "sug-3",
        type: "speed",
        priority: "low",
        title: "Optimal Speed Window",
        description: "Weather window opens 06:00 tomorrow",
        recommendation: "Reduce speed by 2 knots to optimize arrival timing",
        timestamp: new Date()
      },
      {
        id: "sug-4",
        type: "fuel",
        priority: "medium",
        title: "Fuel Optimization",
        description: "Current course has favorable current assistance",
        recommendation: "Maintain current speed for optimal fuel efficiency (12% savings)",
        timestamp: new Date()
      },
      {
        id: "sug-5",
        type: "safety",
        priority: "critical",
        title: "Heavy Weather Warning",
        description: "Severe weather system forming ahead",
        recommendation: "Delay departure 6 hours or divert to safe harbor",
        timestamp: new Date()
      }
    ];

    // Add route-specific suggestions
    if (route && route.weatherAlerts.length > 0) {
      suggestions.push({
        id: "sug-route-1",
        type: "weather",
        priority: "high",
        title: `${route.weatherAlerts.length} Weather Alerts on Route`,
        description: route.weatherAlerts.map(a => a.description).join(", "),
        recommendation: `Monitor weather closely and consider alternative route`,
        timestamp: new Date()
      });
    }

    setAiSuggestions(suggestions);
  };

  const initializeDecisionLogs = () => {
    const logs: DecisionLog[] = [
      {
        id: "log-1",
        timestamp: new Date(Date.now() - 3600000),
        decision: "Route Optimization Applied",
        rationale: "AI detected favorable weather window and adjusted route to minimize transit time",
        parameters: { fuelSavings: "12%", timeSavings: "2.5 hours" },
        outcome: "applied"
      },
      {
        id: "log-2",
        timestamp: new Date(Date.now() - 7200000),
        decision: "Speed Adjustment Recommended",
        rationale: "Weather system moving slower than predicted, safe to maintain current speed",
        parameters: { speedChange: "0 knots", confidence: "high" },
        outcome: "ignored"
      },
      {
        id: "log-3",
        timestamp: new Date(Date.now() - 10800000),
        decision: "Course Correction: +3°",
        rationale: "Crosswind compensation to maintain optimal track",
        parameters: { windSpeed: "25 knots", windDirection: "270°" },
        outcome: "applied"
      }
    ];

    setDecisionLogs(logs);
  };

  const logDecision = (decision: string, rationale: string, parameters: Record<string, any>) => {
    const newLog: DecisionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      decision,
      rationale,
      parameters,
      outcome: "applied"
    };

    setDecisionLogs(prev => [newLog, ...prev]);
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    logDecision(
      suggestion.title,
      suggestion.recommendation,
      { type: suggestion.type, priority: suggestion.priority }
    );

    toast.success(`Applied: ${suggestion.title}`);
  };

  const getSuggestionIcon = (type: AISuggestion["type"]) => {
    switch (type) {
      case "weather": return Wind;
      case "route": return Navigation;
      case "speed": return TrendingUp;
      case "fuel": return Activity;
      case "safety": return AlertTriangle;
      default: return Info;
    }
  };

  const getPriorityColor = (priority: AISuggestion["priority"]) => {
    switch (priority) {
      case "critical": return "text-red-500 bg-red-50 border-red-200";
      case "high": return "text-orange-500 bg-orange-50 border-orange-200";
      case "medium": return "text-yellow-500 bg-yellow-50 border-yellow-200";
      case "low": return "text-blue-500 bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Navigation Copilot v2</h1>
            <p className="text-sm text-muted-foreground">
              PATCH 489 - AI-powered route planning with contextual suggestions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={simulationMode ? "default" : "secondary"}>
            {simulationMode ? "● Simulation Mode" : "○ Live Mode"}
          </Badge>
          <Button onClick={() => setSimulationMode(!simulationMode)} size="sm" variant="outline">
            Toggle Mode
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Route</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedRoute ? "1" : "0"}</div>
            <p className="text-xs text-muted-foreground">
              {selectedRoute ? `${selectedRoute.distance.toFixed(0)}nm` : "No route"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiSuggestions.length}</div>
            <p className="text-xs text-muted-foreground">
              {aiSuggestions.filter(s => s.priority === "critical" || s.priority === "high").length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weather Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedRoute?.weatherAlerts.length || 0}</div>
            <p className="text-xs text-muted-foreground">On current route</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Decision Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisionLogs.length}</div>
            <p className="text-xs text-muted-foreground">Total decisions logged</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planning */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Route Planning & Overlay</CardTitle>
            <CardDescription>Interactive map with AI-optimized routing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Coordinates Input */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Origin</label>
                  <div className="text-sm text-muted-foreground">
                    {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <div className="text-sm text-muted-foreground">
                    {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                  </div>
                </div>
              </div>

              <Button onClick={calculateRoutes} disabled={isCalculating} className="w-full">
                <Compass className="h-4 w-4 mr-2" />
                {isCalculating ? "Calculating..." : "Calculate AI-Optimized Route"}
              </Button>

              {/* Route Display */}
              {selectedRoute && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Recommended Route</h3>
                    <Badge variant={selectedRoute.recommended ? "default" : "secondary"}>
                      {selectedRoute.recommended ? "Recommended" : "Alternative"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Distance</div>
                      <div className="font-medium">{selectedRoute.distance.toFixed(1)} nm</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Duration</div>
                      <div className="font-medium">{selectedRoute.estimatedDuration.toFixed(1)} hrs</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Risk Score</div>
                      <div className="font-medium">{selectedRoute.riskScore}/100</div>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="text-muted-foreground">ETA (AI-adjusted)</div>
                    <div>{selectedRoute.etaWithAI}</div>
                  </div>
                </div>
              )}

              {/* Map Placeholder */}
              <div className="border rounded-lg p-8 bg-muted/20 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Interactive map with route overlay would render here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  (Integration with Mapbox/Leaflet for production)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Suggestions
              </CardTitle>
              <CardDescription>Contextual recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {aiSuggestions.map(suggestion => {
                    const Icon = getSuggestionIcon(suggestion.type);
                    return (
                      <div
                        key={suggestion.id}
                        className={`p-3 border rounded-lg ${getPriorityColor(suggestion.priority)}`}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className="h-4 w-4 mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <div className="font-medium text-sm">{suggestion.title}</div>
                            <div className="text-xs opacity-80">{suggestion.description}</div>
                            <div className="text-xs font-medium mt-2">
                              → {suggestion.recommendation}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 h-7 text-xs"
                              onClick={() => applySuggestion(suggestion)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decision Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Decision Logs</CardTitle>
          <CardDescription>AI decision history with rationale</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {decisionLogs.map(log => (
                <div key={log.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{log.decision}</div>
                      <div className="text-sm text-muted-foreground mt-1">{log.rationale}</div>
                      {Object.keys(log.parameters).length > 0 && (
                        <div className="text-xs mt-2 space-x-2">
                          {Object.entries(log.parameters).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={log.outcome === "applied" ? "default" : "secondary"}>
                        {log.outcome}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationCopilotV2;
