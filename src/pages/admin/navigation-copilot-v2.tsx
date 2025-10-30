// PATCH 489.0 - Navigation Copilot v2
// Enhanced navigation with AI suggestions and decision logging

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Navigation, 
  CloudRain, 
  Route, 
  Fuel, 
  Shield, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Brain, 
  Activity,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AISuggestion {
  id: string;
  type: "weather" | "route" | "speed" | "fuel" | "safety";
  priority: "high" | "medium" | "low";
  title: string;
  recommendation: string;
  confidence: number;
  timestamp: string;
}

interface DecisionLog {
  id: string;
  decision: string;
  rationale: string;
  parameters: Record<string, any>;
  timestamp: string;
  aiSuggestionId?: string;
}

export default function NavigationCopilotV2() {
  const [simulationMode, setSimulationMode] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [activeRoute, setActiveRoute] = useState({
    origin: "Santos, Brazil",
    destination: "Rio de Janeiro, Brazil",
    distance: 312,
    eta: "8.5 hours",
    weatherRisk: "moderate",
  });
  const { toast } = useToast();

  useEffect(() => {
    // Generate initial AI suggestions
    generateAISuggestions();
    const interval = setInterval(() => {
      if (simulationMode) {
        generateAISuggestions();
      }
    }, 30000); // Every 30 seconds in simulation mode

    return () => clearInterval(interval);
  }, [simulationMode]);

  const generateAISuggestions = () => {
    const suggestions: AISuggestion[] = [
      {
        id: `sug-${Date.now()}-1`,
        type: "weather",
        priority: "high",
        title: "Wind Adjustment Recommended",
        recommendation: "Adjust heading +5° to compensate for 25-knot westerly winds. This will reduce drift and maintain optimal fuel consumption.",
        confidence: 87,
        timestamp: new Date().toISOString(),
      },
      {
        id: `sug-${Date.now()}-2`,
        type: "route",
        priority: "medium",
        title: "Alternative Route Available",
        recommendation: "Consider route via waypoint Alpha-7. Adds 15nm but avoids upcoming weather system. Saves estimated 45 minutes.",
        confidence: 92,
        timestamp: new Date().toISOString(),
      },
      {
        id: `sug-${Date.now()}-3`,
        type: "fuel",
        priority: "low",
        title: "Fuel Optimization Opportunity",
        recommendation: "Reduce speed to 12 knots for next 2 hours. Current conditions allow 8% fuel savings with minimal ETA impact.",
        confidence: 78,
        timestamp: new Date().toISOString(),
      },
      {
        id: `sug-${Date.now()}-4`,
        type: "safety",
        priority: "high",
        title: "Traffic Density Alert",
        recommendation: "Increase watch alertness. AIS shows 12 vessels within 5nm radius. Recommend reducing speed to 10 knots temporarily.",
        confidence: 95,
        timestamp: new Date().toISOString(),
      },
    ];

    setAiSuggestions((prev) => [...suggestions, ...prev].slice(0, 10));
  };

  const logDecision = (decision: string, rationale: string, suggestionId?: string) => {
    const log: DecisionLog = {
      id: `dec-${Date.now()}`,
      decision,
      rationale,
      parameters: {
        currentSpeed: 14.5,
        currentHeading: 125,
        weatherConditions: "moderate",
        fuelLevel: 78,
      },
      timestamp: new Date().toISOString(),
      aiSuggestionId: suggestionId,
    };

    setDecisionLogs((prev) => [log, ...prev].slice(0, 20));
    toast({
      title: "Decision Logged",
      description: decision,
    });
  };

  const acceptSuggestion = (suggestion: AISuggestion) => {
    logDecision(
      `Accepted: ${suggestion.title}`,
      suggestion.recommendation,
      suggestion.id
    );
    toast({
      title: "Suggestion Accepted",
      description: suggestion.title,
    });
  };

  const dismissSuggestion = (suggestionId: string) => {
    setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    toast({
      title: "Suggestion Dismissed",
      description: "AI suggestion removed",
      variant: "destructive",
    });
  };

  const typeIcons: Record<string, any> = {
    weather: CloudRain,
    route: Route,
    speed: Zap,
    fuel: Fuel,
    safety: Shield,
  };

  const priorityColors: Record<string, string> = {
    high: "text-red-500",
    medium: "text-yellow-500",
    low: "text-blue-500",
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Navigation className="h-8 w-8" />
            Navigation Copilot v2
          </h1>
          <p className="text-muted-foreground">
            AI-powered navigation with contextual suggestions and decision logging
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="simulation-mode"
              checked={simulationMode}
              onCheckedChange={setSimulationMode}
            />
            <Label htmlFor="simulation-mode">Simulation Mode</Label>
          </div>
          <Badge variant="outline">PATCH 489.0</Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Route</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoute.distance}nm</div>
            <p className="text-xs text-muted-foreground">ETA: {activeRoute.eta}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiSuggestions.length}</div>
            <p className="text-xs text-muted-foreground">
              {aiSuggestions.filter((s) => s.priority === "high").length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weather Alerts</CardTitle>
            <CloudRain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">2</div>
            <p className="text-xs text-muted-foreground">Moderate conditions ahead</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decision Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisionLogs.length}</div>
            <p className="text-xs text-muted-foreground">Recorded decisions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>AI Navigation Suggestions</CardTitle>
            <CardDescription>
              Contextual recommendations based on current conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {aiSuggestions.map((suggestion) => {
                  const Icon = typeIcons[suggestion.type] || Navigation;
                  return (
                    <Card key={suggestion.id} className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${priorityColors[suggestion.priority]}`} />
                            <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                          </div>
                          <Badge
                            variant={
                              suggestion.priority === "high"
                                ? "destructive"
                                : suggestion.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          {suggestion.recommendation}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Confidence: {suggestion.confidence}%
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => dismissSuggestion(suggestion.id)}
                            >
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => acceptSuggestion(suggestion)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {aiSuggestions.length === 0 && (
                  <div className="text-center py-12">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No AI suggestions at this time</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      System is analyzing current conditions
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Decision Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Decision Log</CardTitle>
            <CardDescription>
              Track navigation decisions with rationale and parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {decisionLogs.map((log) => (
                  <Card key={log.id} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="font-semibold text-sm">{log.decision}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{log.rationale}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(log.parameters).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {typeof value === "number" ? value.toFixed(1) : value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {decisionLogs.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No decisions logged yet</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Accept AI suggestions to start logging
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
