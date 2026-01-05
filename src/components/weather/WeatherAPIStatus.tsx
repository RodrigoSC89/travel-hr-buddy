/**
 * Weather API Status Component
 * Displays real-time status of all weather data sources
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Cloud,
  Waves,
  Wind,
  Satellite
} from "lucide-react";

interface APIStatus {
  name: string;
  status: "operational" | "degraded" | "down" | "checking";
  responseTime: number | null;
  lastCheck: Date | null;
  message: string;
  icon: React.ElementType;
}

const STATUS_ICONS = {
  operational: CheckCircle2,
  degraded: AlertCircle,
  down: XCircle,
  checking: RefreshCw,
};

const STATUS_COLORS = {
  operational: "text-green-500",
  degraded: "text-yellow-500",
  down: "text-red-500",
  checking: "text-blue-500 animate-spin",
};

export function WeatherAPIStatus() {
  const [apis, setApis] = useState<APIStatus[]>([
    { name: "OpenWeatherMap", status: "checking", responseTime: null, lastCheck: null, message: "Verificando...", icon: Cloud },
    { name: "StormGlass", status: "checking", responseTime: null, lastCheck: null, message: "Verificando...", icon: Waves },
    { name: "Windy", status: "checking", responseTime: null, lastCheck: null, message: "Verificando...", icon: Wind },
    { name: "CelesTrak", status: "checking", responseTime: null, lastCheck: null, message: "Verificando...", icon: Satellite },
  ]);
  const [isChecking, setIsChecking] = useState(false);

  const checkAPIs = async () => {
    setIsChecking(true);

    // OpenWeatherMap check via Edge Function
    const openWeatherCheck = async (): Promise<Partial<APIStatus>> => {
      const start = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke("api-health-monitor", {
          body: { service: "openweathermap" },
        });
        
        if (error) throw error;
        
        return {
          status: data?.status === "healthy" ? "operational" : "degraded",
          responseTime: data?.responseTime || Date.now() - start,
          message: data?.message || "Conectado",
          lastCheck: new Date(),
        };
      } catch {
        return {
          status: "down",
          responseTime: Date.now() - start,
          message: "API indisponível",
          lastCheck: new Date(),
        };
      }
    };

    // StormGlass check (direct test)
    const stormGlassCheck = async (): Promise<Partial<APIStatus>> => {
      const start = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke("stormglass-forecast", {
          body: { lat: -22.9068, lng: -43.1729 },
        });
        
        if (error) throw error;
        
        return {
          status: data?.hours ? "operational" : "degraded",
          responseTime: Date.now() - start,
          message: data?.hours ? `${data.hours.length} horas de dados` : "Sem dados",
          lastCheck: new Date(),
        };
      } catch (e) {
        return {
          status: "down",
          responseTime: Date.now() - start,
          message: e instanceof Error ? e.message : "Erro desconhecido",
          lastCheck: new Date(),
        };
      }
    };

    // Windy check
    const windyCheck = async (): Promise<Partial<APIStatus>> => {
      const start = Date.now();
      try {
        const { data, error } = await supabase.functions.invoke("api-health-monitor", {
          body: { service: "windy" },
        });
        
        if (error) throw error;
        
        return {
          status: data?.status === "healthy" ? "operational" : "degraded",
          responseTime: data?.responseTime || Date.now() - start,
          message: data?.message || "Plugin configurado",
          lastCheck: new Date(),
        };
      } catch {
        return {
          status: "degraded",
          responseTime: Date.now() - start,
          message: "Usando embed fallback",
          lastCheck: new Date(),
        };
      }
    };

    // CelesTrak check (public API)
    const celestrakCheck = async (): Promise<Partial<APIStatus>> => {
      const start = Date.now();
      try {
        const response = await fetch(
          "https://celestrak.org/NORAD/elements/gp.php?GROUP=gps-ops&FORMAT=json"
        );
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        return {
          status: "operational",
          responseTime: Date.now() - start,
          message: `${data.length} satélites GPS`,
          lastCheck: new Date(),
        };
      } catch {
        return {
          status: "degraded",
          responseTime: Date.now() - start,
          message: "Usando cache local",
          lastCheck: new Date(),
        };
      }
    };

    // Execute all checks in parallel
    const [openWeather, stormGlass, windy, celestrak] = await Promise.all([
      openWeatherCheck(),
      stormGlassCheck(),
      windyCheck(),
      celestrakCheck(),
    ]);

    setApis([
      { ...apis[0], ...openWeather },
      { ...apis[1], ...stormGlass },
      { ...apis[2], ...windy },
      { ...apis[3], ...celestrak },
    ]);

    setIsChecking(false);
  };

  useEffect(() => {
    checkAPIs();
    // Check every 5 minutes
    const interval = setInterval(checkAPIs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const allOperational = apis.every((api) => api.status === "operational");

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Status das APIs Meteorológicas
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkAPIs}
          disabled={isChecking}
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Badge
            variant={allOperational ? "default" : "destructive"}
            className={allOperational ? "bg-green-500" : ""}
          >
            {allOperational ? "Todos Operacionais" : "Verificar Status"}
          </Badge>
        </div>

        <div className="space-y-3">
          {apis.map((api) => {
            const StatusIcon = STATUS_ICONS[api.status];
            const Icon = api.icon;

            return (
              <div
                key={api.name}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{api.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {api.message}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {api.responseTime && (
                    <span className="text-sm text-muted-foreground">
                      {api.responseTime}ms
                    </span>
                  )}
                  <StatusIcon className={`h-5 w-5 ${STATUS_COLORS[api.status]}`} />
                </div>
              </div>
            );
          })}
        </div>

        {apis[0].lastCheck && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Última verificação: {apis[0].lastCheck.toLocaleTimeString("pt-BR")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherAPIStatus;
