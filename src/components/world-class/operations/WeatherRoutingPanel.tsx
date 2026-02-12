/**
 * M028 - Weather Routing Panel
 * Maritime weather analysis and route optimization
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Cloud, Wind, Waves, Thermometer, Eye, Loader2, Brain,
  AlertTriangle, Sun, CloudRain, CloudSnow, Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

const weatherIcons: Record<string, React.ElementType> = {
  clear: Sun,
  rain: CloudRain,
  snow: CloudSnow,
  cloudy: Cloud,
  wind: Wind,
};

const riskColors: Record<string, string> = {
  low: "bg-success/10 text-success border-success/30",
  moderate: "bg-warning/10 text-warning border-warning/30",
  high: "bg-warning/10 text-warning border-warning/30",
  severe: "bg-destructive/10 text-destructive border-destructive/30",
};

export function WeatherRoutingPanel() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Edge function returns dynamic weather shape
  const [forecast, setForecast] = useState<any>(null);
  const [analysisType, setAnalysisType] = useState<string>("forecast");
  const [route, setRoute] = useState({
    origin: { name: "", lat: 0, lng: 0 },
    destination: { name: "", lat: 0, lng: 0 },
  });
  const [vesselType, setVesselType] = useState("Tanker");

  const handleAnalyze = async () => {
    if (!route.origin.name || !route.destination.name) {
      toast({ title: "Preencha origem e destino", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("weather-routing-ai", {
        body: {
          type: analysisType,
          route: {
            origin: route.origin,
            destination: route.destination,
          },
          vessel: { type: vesselType },
          departure_date: new Date().toISOString(),
        },
      });
      if (error) throw error;
      setForecast(data.result);
      toast({ title: "🌤️ Análise meteorológica concluída" });
    } catch (err) {
      logger.error("Weather routing error", err as Error);
      toast({ title: "Erro na análise", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          Weather Routing
        </h2>
        <p className="text-sm text-muted-foreground">Roteamento meteorológico inteligente (StormGeo-class)</p>
      </div>

      {/* Input */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <Label className="text-xs">Porto Origem</Label>
              <Input
                value={route.origin.name}
                onChange={e => setRoute(r => ({ ...r, origin: { ...r.origin, name: e.target.value } }))}
                placeholder="Santos"
              />
            </div>
            <div>
              <Label className="text-xs">Porto Destino</Label>
              <Input
                value={route.destination.name}
                onChange={e => setRoute(r => ({ ...r, destination: { ...r.destination, name: e.target.value } }))}
                placeholder="Rotterdam"
              />
            </div>
            <div>
              <Label className="text-xs">Tipo Navio</Label>
              <Select value={vesselType} onValueChange={setVesselType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tanker">Tanker</SelectItem>
                  <SelectItem value="Bulk Carrier">Bulk Carrier</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="PSV">PSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipo Análise</Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="forecast">Previsão 7 dias</SelectItem>
                  <SelectItem value="route_weather">Rota + Weather</SelectItem>
                  <SelectItem value="optimal_window">Janela Ótima</SelectItem>
                  <SelectItem value="alert_check">Alertas Ativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            {isLoading ? "Analisando..." : "Analisar Condições Meteorológicas"}
          </Button>
        </CardContent>
      </Card>

      {/* Forecast Results */}
      <AnimatePresence>
        {forecast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Overall */}
            {forecast.overall_conditions && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-sm"><span className="font-medium text-primary">Condições Gerais:</span> {forecast.overall_conditions}</p>
                  {forecast.recommendation && (
                    <p className="text-sm mt-2"><span className="font-medium text-primary">Recomendação:</span> {forecast.recommendation}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Daily Forecast */}
            {forecast.forecast_days?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {forecast.forecast_days.map((day: Record<string, unknown>, i: number) => (
                  <motion.div key={`forecast-day-${i}-${String(day.date || i)}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xs">{String(day.date || `Dia ${i + 1}`)}</CardTitle>
                          <Badge variant="outline" className={riskColors[String(day.risk_level || "")] || ""}>
                            {String(day.risk_level || "N/A")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Wind className="h-3 w-3 text-muted-foreground" />
                            <span>{String((day.wind as Record<string, unknown>)?.speed_kts ?? "?")} kts {String((day.wind as Record<string, unknown>)?.direction ?? "")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Waves className="h-3 w-3 text-muted-foreground" />
                            <span>{String((day.waves as Record<string, unknown>)?.height_m ?? "?")}m</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3 text-muted-foreground" />
                            <span>{String(day.temp_air_c ?? "?")}°C</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span>{String(day.visibility_nm ?? "?")}NM</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Compass className="h-3 w-3 text-muted-foreground" />
                            <span>Bf {String(day.beaufort_scale ?? "?")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">{String(day.pressure_hpa ?? "?")}hPa</span>
                          </div>
                        </div>
                        {typeof day.sea_state === "string" && day.sea_state && (
                          <p className="text-xs text-muted-foreground">Mar: {day.sea_state}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Alerts */}
            {forecast.alerts?.length > 0 && (
              <Card className="border-warning/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Alertas Meteorológicos ({forecast.alerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {forecast.alerts.map((alert: Record<string, unknown>, i: number) => (
                    <div key={`alert-${i}-${String(alert.type)}`} className="p-2 rounded bg-warning/5 border border-warning/20 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-warning">{String(alert.severity)}</Badge>
                        <span className="font-medium">{String(alert.type)}</span>
                      </div>
                      <p className="text-muted-foreground">{String(alert.description)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
