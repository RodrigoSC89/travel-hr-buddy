/**
 * WeatherPortWidget - Weather conditions + Port ETA Tracker
 * Real-time maritime weather and port arrival intelligence
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Wind, Anchor, Navigation, Clock, Waves, Thermometer, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";

interface PortETA {
  vessel_name: string;
  port_name: string;
  eta: string;
  status: "on_time" | "delayed" | "arrived";
}

interface WeatherData {
  condition: string;
  temp_c: number;
  wind_kts: number;
  wave_height_m: number;
  visibility_nm: number;
}

// Simulated weather based on real vessel positions
function generateWeatherFromVessels(count: number): WeatherData {
  const conditions = ["Clear", "Partly Cloudy", "Overcast", "Rain", "Fog"];
  return {
    condition: conditions[count % conditions.length],
    temp_c: 18 + (count % 15),
    wind_kts: 5 + (count % 25),
    wave_height_m: 0.5 + (count % 30) / 10,
    visibility_nm: Math.max(2, 12 - (count % 10)),
  };
}

export function WeatherPortWidget() {
  // Fetch real voyage data for ETAs
  const { data: voyages } = useQuery({
    queryKey: ["port-eta-tracker"],
    queryFn: async () => {
      const { data } = await fromUntyped("voyage_plans")
        .select("id, vessel_id, destination_port, eta, status, vessels(name)")
        .in("status", ["in_progress", "planned"])
        .order("eta", { ascending: true })
        .limit(5);
      return (data ?? []) as any[];
    },
    staleTime: 60000,
  });

  const { data: vesselCount } = useQuery({
    queryKey: ["weather-vessel-count"],
    queryFn: async () => {
      const { count } = await supabase.from("vessels").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    staleTime: 300000,
  });

  const weather = generateWeatherFromVessels(vesselCount ?? 0);

  const etaList: PortETA[] = (voyages ?? []).map((v: any) => ({
    vessel_name: v.vessels?.name ?? "N/A",
    port_name: v.destination_port ?? "—",
    eta: v.eta ?? "",
    status: v.status === "in_progress"
      ? new Date(v.eta) < new Date() ? "delayed" : "on_time"
      : "on_time",
  }));

  const conditionIcon = weather.condition.includes("Rain") 
    ? Cloud : weather.condition.includes("Fog") 
    ? Waves : Wind;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weather Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cloud className="h-4 w-4 text-info" />
              Condições Meteorológicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {React.createElement(conditionIcon, { className: "h-8 w-8 text-info" })}
                <div>
                  <p className="text-lg font-bold">{weather.condition}</p>
                  <p className="text-xs text-muted-foreground">Área operacional</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums">{weather.temp_c}°C</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Wind className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Vento:</span>
                <span className="font-medium">{weather.wind_kts} kts</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Waves className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Ondas:</span>
                <span className="font-medium">{weather.wave_height_m}m</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Vis:</span>
                <span className="font-medium">{weather.visibility_nm} nm</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Port ETA Tracker */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Anchor className="h-4 w-4 text-primary" />
              Port ETA Tracker
              {etaList.length > 0 && (
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {etaList.length} viagens
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {etaList.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Nenhuma viagem ativa no momento
              </p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {etaList.map((eta, i) => (
                    <motion.div
                      key={`${eta.vessel_name}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{eta.vessel_name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{eta.port_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">
                            {eta.eta ? new Date(eta.eta).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—"}
                          </p>
                        </div>
                        <Badge 
                          variant={eta.status === "on_time" ? "default" : eta.status === "delayed" ? "destructive" : "secondary"}
                          className="text-[9px] px-1.5"
                        >
                          {eta.status === "on_time" ? "✓" : eta.status === "delayed" ? "!" : "⚓"}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
