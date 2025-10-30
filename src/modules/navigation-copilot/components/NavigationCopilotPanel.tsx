/**
 * Navigation Copilot v2 Panel - PATCH 432
 * Integrated copilot with mission context, route and weather
 * Features: Real-time AI suggestions, dynamic alerts, decision history
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Target,
  Wind,
  Waves,
} from "lucide-react";
import { navigationCopilot, type Coordinates, type WeatherData } from "../index";
import { supabase } from "@/integrations/supabase/client";

interface Mission {
  id: string;
  name: string;
  status: "planned" | "active" | "completed" | "paused";
  priority: "low" | "medium" | "high" | "critical";
  targetLocation?: Coordinates;
  startTime?: string;
  estimatedCompletion?: string;
}

interface DecisionLog {
  id: string;
  timestamp: string;
  type: "suggestion" | "alert" | "action";
  description: string;
  aiReasoning: string;
  severity?: "info" | "warning" | "critical";
  accepted?: boolean;
}

interface NavigationSuggestion {
  id: string;
  type: "route_adjustment" | "speed_change" | "weather_avoidance" | "fuel_optimization";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  reasoning: string;
  recommendation: string;
  estimatedImpact?: {
    timeChange?: number; // hours
    fuelChange?: number; // percentage
    riskChange?: number; // score delta
  };
}

export const NavigationCopilotPanel: React.FC = () => {
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [currentPosition] = useState<Coordinates>({ lat: -23.5, lng: -45.0 });
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [suggestions, setSuggestions] = useState<NavigationSuggestion[]>([]);
  const [decisionHistory, setDecisionHistory] = useState<DecisionLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load current mission and weather
  useEffect(() => {
    loadCurrentMission();
    loadWeather();
    const interval = setInterval(() => {
      loadWeather();
      generateSuggestions();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadCurrentMission = async () => {
    try {
      const { data } = await supabase
        .from("missions")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const safeStatus = (value: any): Mission["status"] =>
          ["planned", "active", "completed", "paused"].includes(value) ? value : "active";
        const safePriority = (value: any): Mission["priority"] =>
          ["low", "medium", "high", "critical"].includes(value) ? value : "medium";
        setCurrentMission({
          id: (data as any).id,
          name: (data as any).name || (data as any).title || (data as any).description || "Missão",
          status: safeStatus((data as any).status),
          priority: safePriority((data as any).priority),
          targetLocation: (data as any).target_location,
          startTime: (data as any).start_time || (data as any).start_date,
          estimatedCompletion: (data as any).estimated_completion || (data as any).end_date,
        } as Mission);
      }
    } catch (error) {
      console.error("Failed to load mission:", error);
    }
  };

  const loadWeather = async () => {
    try {
      const weather = await navigationCopilot.getWeatherData(currentPosition);
      setCurrentWeather(weather);
    } catch (error) {
      console.error("Failed to load weather:", error);
    }
  };

  const generateSuggestions = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI-powered suggestions based on mission, weather, and route
      const newSuggestions: NavigationSuggestion[] = [];

      // Weather-based suggestion
      if (currentWeather && currentWeather.severity !== "safe") {
        newSuggestions.push({
          id: `sug-weather-${Date.now()}`,
          type: "weather_avoidance",
          priority: currentWeather.severity === "danger" ? "critical" : "high",
          title: "Ajuste de Rota - Condições Meteorológicas",
          description: `${currentWeather.conditions} detectado com ventos de ${Math.round(currentWeather.windSpeed)} kts`,
          reasoning: "Condições meteorológicas adversas podem afetar segurança e eficiência",
          recommendation: "Considere rota alternativa ou aguarde melhora das condições",
          estimatedImpact: {
            timeChange: 2,
            riskChange: -30,
          },
        });
      }

      // Mission-based suggestion
      if (currentMission && currentMission.priority === "critical") {
        newSuggestions.push({
          id: `sug-mission-${Date.now()}`,
          type: "speed_change",
          priority: "high",
          title: "Otimização de Velocidade - Missão Crítica",
          description: `Missão "${currentMission.name}" requer ajuste de velocidade`,
          reasoning: "Prioridade crítica da missão justifica aumento de velocidade",
          recommendation: "Aumentar velocidade para 12 kts para garantir ETA",
          estimatedImpact: {
            timeChange: -1.5,
            fuelChange: 15,
          },
        });
      }

      // Fuel optimization suggestion
      newSuggestions.push({
        id: `sug-fuel-${Date.now()}`,
        type: "fuel_optimization",
        priority: "medium",
        title: "Otimização de Combustível",
        description: "Rota alternativa pode reduzir consumo",
        reasoning: "Análise de correntes marinhas indica oportunidade de economia",
        recommendation: "Ajustar rota 5° para leste para aproveitar corrente favorável",
        estimatedImpact: {
          timeChange: 0.3,
          fuelChange: -8,
        },
      });

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const acceptSuggestion = async (suggestion: NavigationSuggestion) => {
    const logEntry: DecisionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "action",
      description: `Aceita sugestão: ${suggestion.title}`,
      aiReasoning: suggestion.reasoning,
      severity: suggestion.priority === "critical" ? "critical" : "info",
      accepted: true,
    };

    // Save to database
    try {
      await (supabase as any).from("navigation_decisions").insert({
        suggestion_id: suggestion.id,
        suggestion_type: suggestion.type,
        priority: suggestion.priority,
        title: suggestion.title,
        description: suggestion.description,
        accepted: true,
        timestamp: logEntry.timestamp,
      });

      setDecisionHistory([logEntry, ...decisionHistory]);
      setSuggestions(suggestions.filter((s) => s.id !== suggestion.id));
    } catch (error) {
      console.error("Failed to log decision:", error);
    }
  };

  const dismissSuggestion = async (suggestion: NavigationSuggestion) => {
    const logEntry: DecisionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "action",
      description: `Rejeitada sugestão: ${suggestion.title}`,
      aiReasoning: suggestion.reasoning,
      severity: "info",
      accepted: false,
    };

    try {
      await (supabase as any).from("navigation_decisions").insert({
        suggestion_id: suggestion.id,
        suggestion_type: suggestion.type,
        priority: suggestion.priority,
        title: suggestion.title,
        description: suggestion.description,
        accepted: false,
        timestamp: logEntry.timestamp,
      });

      setDecisionHistory([logEntry, ...decisionHistory]);
      setSuggestions(suggestions.filter((s) => s.id !== suggestion.id));
    } catch (error) {
      console.error("Failed to log decision:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    default:
      return "bg-blue-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "route_adjustment":
      return <Navigation className="h-4 w-4" />;
    case "speed_change":
      return <TrendingUp className="h-4 w-4" />;
    case "weather_avoidance":
      return <Wind className="h-4 w-4" />;
    case "fuel_optimization":
      return <Activity className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400 animate-pulse" />
            Navigation Copilot v2
            <Badge variant="outline" className="ml-auto">PATCH 432</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Missão Ativa</div>
              <div className="font-medium">
                {currentMission ? currentMission.name : "Nenhuma"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Status Meteorológico</div>
              <Badge variant={currentWeather?.severity === "safe" ? "default" : "destructive"}>
                {currentWeather?.conditions || "Carregando..."}
              </Badge>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Sugestões Ativas</div>
              <div className="text-2xl font-bold text-purple-400">{suggestions.length}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Decisões Registradas</div>
              <div className="text-2xl font-bold text-cyan-400">{decisionHistory.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Weather */}
      {currentWeather && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wind className="h-5 w-5" />
              Condições Atuais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Temperatura</div>
                <div className="font-medium">{Math.round(currentWeather.temperature)}°C</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Vento</div>
                <div className="font-medium">{Math.round(currentWeather.windSpeed)} kts</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Visibilidade</div>
                <div className="font-medium">{Math.round(currentWeather.visibility)} km</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Ondas</div>
                <div className="font-medium">{currentWeather.waveHeight?.toFixed(1) || "N/A"} m</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Sugestões em Tempo Real
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={generateSuggestions}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                "Atualizar"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma sugestão no momento</p>
              <p className="text-sm">Navegação otimizada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(suggestion.type)}
                        <span className="font-medium">{suggestion.title}</span>
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      <div className="text-sm bg-purple-500/10 p-2 rounded border border-purple-500/30">
                        <div className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-purple-400">AI Reasoning:</div>
                            <div className="text-muted-foreground">{suggestion.reasoning}</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/30">
                        <div className="text-sm font-medium text-green-400">
                          Recomendação:
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {suggestion.recommendation}
                        </div>
                      </div>
                      {suggestion.estimatedImpact && (
                        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                          {suggestion.estimatedImpact.timeChange !== undefined && (
                            <div>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {suggestion.estimatedImpact.timeChange > 0 ? "+" : ""}
                              {suggestion.estimatedImpact.timeChange.toFixed(1)}h
                            </div>
                          )}
                          {suggestion.estimatedImpact.fuelChange !== undefined && (
                            <div>
                              <Activity className="h-3 w-3 inline mr-1" />
                              {suggestion.estimatedImpact.fuelChange > 0 ? "+" : ""}
                              {suggestion.estimatedImpact.fuelChange}% combustível
                            </div>
                          )}
                          {suggestion.estimatedImpact.riskChange !== undefined && (
                            <div>
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              {suggestion.estimatedImpact.riskChange > 0 ? "+" : ""}
                              {suggestion.estimatedImpact.riskChange} risco
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptSuggestion(suggestion)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissSuggestion(suggestion)}
                      className="flex-1"
                    >
                      Dispensar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decision History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Histórico de Decisões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {decisionHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma decisão registrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {decisionHistory.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-medium">{log.description}</div>
                      <Badge
                        variant={log.accepted ? "default" : "outline"}
                        className="text-xs"
                      >
                        {log.accepted ? "Aceita" : "Rejeitada"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
