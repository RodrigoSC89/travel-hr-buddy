/**
 * Weather API Test Panel
 * Permite testar todas as APIs meteorológicas integradas
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  RefreshCw,
  Thermometer,
  Wind,
  Waves,
  Anchor,
  Cloud,
  Zap,
  Sun
} from "lucide-react";

interface APITestResult {
  name: string;
  status: "idle" | "loading" | "success" | "error";
  data?: any;
  error?: string;
  latency?: number;
  timestamp?: string;
}

const DEFAULT_COORDS = { lat: -23.9608, lon: -46.3335 }; // Santos, BR

export function WeatherAPITestPanel() {
  const { toast } = useToast();
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [testResults, setTestResults] = useState<Record<string, APITestResult>>({
    openweather: { name: "OpenWeather", status: "idle" },
    stormglass: { name: "StormGlass (Marine)", status: "idle" },
    windy: { name: "Windy", status: "idle" },
    marinha: { name: "Marinha do Brasil", status: "idle" },
    cptec: { name: "CPTEC/INPE (Brasil)", status: "idle" },
    weatherIntegration: { name: "Weather Integration (Unified)", status: "idle" }
  });
  const [isRunningAll, setIsRunningAll] = useState(false);

  const updateResult = (key: string, update: Partial<APITestResult>) => {
    setTestResults(prev => ({
      ...prev,
      [key]: { ...prev[key], ...update }
    }));
  };

  const testOpenWeather = async () => {
    updateResult("openweather", { status: "loading" });
    const start = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke("weather-integration", {
        body: {
          latitude: coords.lat,
          longitude: coords.lon,
          source: "openweather",
          vessel_id: "test-api"
        }
      });

      if (error) throw error;

      updateResult("openweather", {
        status: "success",
        data: data?.weather?.current || data,
        latency: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      updateResult("openweather", {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - start
      });
    }
  };

  const testStormGlass = async () => {
    updateResult("stormglass", { status: "loading" });
    const start = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke("stormglass-forecast", {
        body: { lat: coords.lat, lng: coords.lon }
      });

      if (error) throw error;

      updateResult("stormglass", {
        status: "success",
        data: data?.hours?.[0] || data,
        latency: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      updateResult("stormglass", {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - start
      });
    }
  };

  const testWindy = async () => {
    updateResult("windy", { status: "loading" });
    const start = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke("weather-integration", {
        body: {
          latitude: coords.lat,
          longitude: coords.lon,
          source: "windy",
          vessel_id: "test-api"
        }
      });

      if (error) throw error;

      updateResult("windy", {
        status: "success",
        data: data?.weather?.windy_forecast || data?.weather?.waves || data,
        latency: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      updateResult("windy", {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - start
      });
    }
  };

  const testMarinha = async () => {
    updateResult("marinha", { status: "loading" });
    const start = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke("marinha-brasil", {
        body: { type: "all", lat: coords.lat, lon: coords.lon }
      });

      if (error) throw error;

      updateResult("marinha", {
        status: "success",
        data: {
          region: data?.regionName,
          avisos: data?.avisos?.length || 0,
          previsao: data?.previsao?.length || 0,
          ondas: data?.ondas
        },
        latency: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      updateResult("marinha", {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - start
      });
    }
  };

  const testCPTEC = async () => {
    updateResult("cptec", { status: "loading" });
    const start = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke("cptec-inpe", {
        body: { type: "previsao", lat: coords.lat, lon: coords.lon }
      });

      if (error) throw error;

      updateResult("cptec", {
        status: "success",
        data: {
          source: data?.source,
          cidade: data?.cidade,
          previsoes: data?.previsoes?.length || 0,
          proxima: data?.previsoes?.[0]
        },
        latency: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      updateResult("cptec", {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - start
      });
    }
  };

  const testWeatherIntegration = async () => {
    updateResult("weatherIntegration", { status: "loading" });
    const start = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke("weather-integration", {
        body: {
          latitude: coords.lat,
          longitude: coords.lon,
          source: "auto",
          vessel_id: "test-unified"
        }
      });

      if (error) throw error;

      updateResult("weatherIntegration", {
        status: "success",
        data: {
          sources: data?.weather?.sources,
          temperature: data?.weather?.current?.temperature,
          wind: data?.weather?.current?.wind_speed,
          waves: data?.weather?.waves?.height,
          alerts: data?.alerts_count
        },
        latency: Date.now() - start,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      updateResult("weatherIntegration", {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        latency: Date.now() - start
      });
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    
    await Promise.all([
      testOpenWeather(),
      testStormGlass(),
      testWindy(),
      testMarinha(),
      testCPTEC(),
      testWeatherIntegration()
    ]);

    setIsRunningAll(false);
    
    toast({
      title: "Testes concluídos",
      description: "Todas as 6 APIs foram testadas",
    });
  };

  const getStatusIcon = (status: APITestResult["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const getAPIIcon = (key: string) => {
    switch (key) {
      case "openweather":
        return <Thermometer className="h-4 w-4" />;
      case "stormglass":
        return <Waves className="h-4 w-4" />;
      case "windy":
        return <Wind className="h-4 w-4" />;
      case "marinha":
        return <Anchor className="h-4 w-4" />;
      case "cptec":
        return <Sun className="h-4 w-4" />;
      case "weatherIntegration":
        return <Cloud className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const successCount = Object.values(testResults).filter(r => r.status === "success").length;
  const errorCount = Object.values(testResults).filter(r => r.status === "error").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Teste de APIs Meteorológicas
            </CardTitle>
            <CardDescription>
              Verificar conectividade e dados de todas as fontes
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {(successCount > 0 || errorCount > 0) && (
              <div className="flex items-center gap-2 mr-4">
                {successCount > 0 && (
                  <Badge variant="default" className="bg-green-500">
                    {successCount} OK
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="destructive">
                    {errorCount} Erro
                  </Badge>
                )}
              </div>
            )}
            <Button onClick={runAllTests} disabled={isRunningAll}>
              {isRunningAll ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Testar Todas
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coordinates Input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="0.0001"
              value={coords.lat}
              onChange={(e) => setCoords(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label htmlFor="lon">Longitude</Label>
            <Input
              id="lon"
              type="number"
              step="0.0001"
              value={coords.lon}
              onChange={(e) => setCoords(prev => ({ ...prev, lon: parseFloat(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <Separator />

        {/* API Test Results */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {Object.entries(testResults).map(([key, result]) => (
              <Card key={key} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getAPIIcon(key)}
                      <span className="font-medium">{result.name}</span>
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      {result.latency && (
                        <Badge variant="outline" className="text-xs">
                          {result.latency}ms
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (key === "openweather") testOpenWeather();
                          else if (key === "stormglass") testStormGlass();
                          else if (key === "windy") testWindy();
                          else if (key === "marinha") testMarinha();
                          else if (key === "cptec") testCPTEC();
                          else if (key === "weatherIntegration") testWeatherIntegration();
                        }}
                        disabled={result.status === "loading"}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {result.status === "success" && result.data && (
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                      <pre className="text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {result.status === "error" && result.error && (
                    <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {result.error}
                      </p>
                    </div>
                  )}

                  {result.timestamp && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Testado em: {new Date(result.timestamp).toLocaleString("pt-BR")}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default WeatherAPITestPanel;
