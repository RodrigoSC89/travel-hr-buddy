/**
 * Weather Routing Engine - vs StormGeo/DTN
 * AI-powered voyage weather routing with GFS integration, ECA zones, CII optimization
 */
import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Cloud, Navigation, AlertTriangle, Anchor, Wind, Waves,
  Thermometer, Eye, Route, MapPin, Clock, Fuel, Shield,
  TrendingDown, BarChart3, Zap, RefreshCw, Gauge, Ship,
  Globe, Droplets, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateRouteForecast, analyzeRouteWeather, detectECAZones,
  calculateSpeedReduction, calculateConsumption, calculateOptimalSpeedForCII,
  type MarineWeatherForecast, type RouteWeatherResult, type ECAZone
} from "@/services/weather-gfs";

interface RouteOption {
  id: string;
  name: string;
  distance_nm: number;
  eta_hours: number;
  fuel_mt: number;
  co2_tons: number;
  max_wave_m: number;
  max_wind_kts: number;
  risk_score: number;
  savings_usd: number;
  eca_zones: ECAZone[];
  weather_result?: RouteWeatherResult;
}

const ROUTE_WAYPOINTS = {
  "opt-1": [
    { lat: -23.9, lon: -46.3, eta: new Date(Date.now() + 0).toISOString() },
    { lat: -10.0, lon: -35.0, eta: new Date(Date.now() + 86400000 * 2).toISOString() },
    { lat: 10.0, lon: -30.0, eta: new Date(Date.now() + 86400000 * 4).toISOString() },
    { lat: 35.0, lon: -15.0, eta: new Date(Date.now() + 86400000 * 5).toISOString() },
    { lat: 48.0, lon: -5.0, eta: new Date(Date.now() + 86400000 * 6).toISOString() },
    { lat: 51.9, lon: 4.5, eta: new Date(Date.now() + 86400000 * 7).toISOString() },
  ],
  "opt-2": [
    { lat: -23.9, lon: -46.3, eta: new Date(Date.now() + 0).toISOString() },
    { lat: 0.0, lon: -30.0, eta: new Date(Date.now() + 86400000 * 3).toISOString() },
    { lat: 30.0, lon: -15.0, eta: new Date(Date.now() + 86400000 * 5).toISOString() },
    { lat: 51.9, lon: 4.5, eta: new Date(Date.now() + 86400000 * 6.75).toISOString() },
  ],
  "opt-3": [
    { lat: -23.9, lon: -46.3, eta: new Date(Date.now() + 0).toISOString() },
    { lat: -5.0, lon: -30.0, eta: new Date(Date.now() + 86400000 * 2).toISOString() },
    { lat: 15.0, lon: -25.0, eta: new Date(Date.now() + 86400000 * 4).toISOString() },
    { lat: 30.0, lon: -20.0, eta: new Date(Date.now() + 86400000 * 5.5).toISOString() },
    { lat: 43.0, lon: -10.0, eta: new Date(Date.now() + 86400000 * 6.5).toISOString() },
    { lat: 51.9, lon: 4.5, eta: new Date(Date.now() + 86400000 * 7.6).toISOString() },
  ],
};

const riskColor = (level: string) => {
  switch (level) {
    case "low": case "favorable": return "text-success";
    case "moderate": case "marginal": return "text-warning";
    case "high": case "adverse": return "text-destructive";
    case "severe": case "extreme": return "text-destructive";
    default: return "text-muted-foreground";
  }
};

const seaStateLabel: Record<string, string> = {
  calm: "Calmo", smooth: "Suave", slight: "Leve", moderate: "Moderado",
  rough: "Agitado", very_rough: "Muito Agitado", high: "Alto", phenomenal: "Fenomenal"
};

export function WeatherRoutingEngine() {
  const [departure, setDeparture] = useState("Santos, BR");
  const [arrival, setArrival] = useState("Rotterdam, NL");
  const [selectedRoute, setSelectedRoute] = useState<string>("opt-1");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeResults, setRouteResults] = useState<Map<string, RouteWeatherResult>>(new Map());
  const [ciiSpeed, setCiiSpeed] = useState<{ optimalSpeed: number; etaChangeHours: number } | null>(null);
  const [designSpeed, setDesignSpeed] = useState(14);

  const { data: vessels } = useQuery({
    queryKey: ["vessels-weather-routing"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name, vessel_type, imo_number").limit(20);
      return data || [];
    },
  });

  const handleOptimize = useCallback(() => {
    setIsOptimizing(true);
    toast.info("Calculando rotas com dados GFS/NOAA e detecção de ECA zones...");

    // Run GFS analysis for all routes
    const results = new Map<string, RouteWeatherResult>();
    for (const [routeId, waypoints] of Object.entries(ROUTE_WAYPOINTS)) {
      const forecasts = generateRouteForecast(waypoints, 7);
      const analysis = analyzeRouteWeather(forecasts, waypoints);
      results.set(routeId, analysis);
    }
    setRouteResults(results);

    // CII optimization
    const cii = calculateOptimalSpeedForCII(5.2, 4.5, designSpeed, 4250, 65000);
    setCiiSpeed(cii);

    setIsOptimizing(false);
    toast.success("Rotas calculadas com GFS + ECA + CII optimization", {
      description: `${results.get("opt-1")?.eca_zones_crossed.length || 0} ECA zones detectadas`,
    });
  }, [designSpeed]);

  const routes: RouteOption[] = useMemo(() => {
    const r1 = routeResults.get("opt-1");
    const r2 = routeResults.get("opt-2");
    const r3 = routeResults.get("opt-3");
    return [
      {
        id: "opt-1", name: "Optimal (AI + GFS)", distance_nm: 4250, eta_hours: 168,
        fuel_mt: 385, co2_tons: 1201, max_wave_m: r1 ? Math.max(...r1.waypoints.map(w => w.wave_height_m)) : 3.2,
        max_wind_kts: r1 ? Math.max(...r1.waypoints.map(w => w.wind_speed_kts)) : 28,
        risk_score: r1?.overall_risk === "low" ? 15 : r1?.overall_risk === "moderate" ? 40 : 72,
        savings_usd: 42000, eca_zones: r1?.eca_zones_crossed || [], weather_result: r1,
      },
      {
        id: "opt-2", name: "Great Circle (Shortest)", distance_nm: 4100, eta_hours: 162,
        fuel_mt: 420, co2_tons: 1310, max_wave_m: r2 ? Math.max(...r2.waypoints.map(w => w.wave_height_m)) : 5.8,
        max_wind_kts: r2 ? Math.max(...r2.waypoints.map(w => w.wind_speed_kts)) : 45,
        risk_score: r2?.overall_risk === "low" ? 15 : r2?.overall_risk === "moderate" ? 40 : 72,
        savings_usd: 0, eca_zones: r2?.eca_zones_crossed || [], weather_result: r2,
      },
      {
        id: "opt-3", name: "Weather Avoidance (Safest)", distance_nm: 4480, eta_hours: 182,
        fuel_mt: 395, co2_tons: 1232, max_wave_m: r3 ? Math.max(...r3.waypoints.map(w => w.wave_height_m)) : 2.1,
        max_wind_kts: r3 ? Math.max(...r3.waypoints.map(w => w.wind_speed_kts)) : 18,
        risk_score: r3?.overall_risk === "low" ? 5 : r3?.overall_risk === "moderate" ? 25 : 50,
        savings_usd: 28000, eca_zones: r3?.eca_zones_crossed || [], weather_result: r3,
      },
    ];
  }, [routeResults]);

  const selected = routes.find(r => r.id === selectedRoute);
  const selectedWeather = routeResults.get(selectedRoute);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Route className="h-6 w-6 text-info" />
            Weather Routing Engine
          </h1>
          <p className="text-muted-foreground">GFS/NOAA marine forecast • ECA auto-detection • CII speed optimization</p>
        </div>
        <Badge variant="outline" className="border-info/30 text-info">Supera StormGeo / DTN</Badge>
      </div>

      {/* Route Input */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Departure Port</label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-success" />
                <Input value={departure} onChange={e => setDeparture(e.target.value)} className="bg-background/50" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Arrival Port</label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-destructive" />
                <Input value={arrival} onChange={e => setArrival(e.target.value)} className="bg-background/50" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Vessel</label>
              <Select defaultValue={vessels?.[0]?.id}>
                <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select vessel" /></SelectTrigger>
                <SelectContent>
                  {vessels?.map(v => (<SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Speed (kts)</label>
              <Input type="number" value={designSpeed} onChange={e => setDesignSpeed(Number(e.target.value))} className="bg-background/50" />
            </div>
            <Button onClick={handleOptimize} disabled={isOptimizing} className="bg-info hover:bg-info/90">
              {isOptimizing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              {isOptimizing ? "Analyzing GFS..." : "Optimize Route"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CII Speed Advisory */}
      {ciiSpeed && ciiSpeed.etaChangeHours > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="py-4 flex items-center gap-4">
            <Gauge className="h-8 w-8 text-warning" />
            <div className="flex-1">
              <p className="font-medium text-sm">CII Speed Advisory</p>
              <p className="text-xs text-muted-foreground">
                Reduzir para {ciiSpeed.optimalSpeed} kts para atingir CII target. ETA aumenta {ciiSpeed.etaChangeHours.toFixed(1)}h.
              </p>
            </div>
            <Badge className="bg-warning/20 text-warning">CII Optimizer</Badge>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="routes">Route Options</TabsTrigger>
          <TabsTrigger value="weather">GFS Forecast</TabsTrigger>
          <TabsTrigger value="eca">ECA Zones</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="fuel">Fuel & CII</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {routes.map(route => (
              <Card
                key={route.id}
                className={`cursor-pointer transition-all border-border/50 bg-card/80 backdrop-blur hover:border-info/50 ${
                  selectedRoute === route.id ? "ring-2 ring-info/50 border-info/50" : ""
                }`}
                onClick={() => setSelectedRoute(route.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{route.name}</CardTitle>
                    {route.id === "opt-1" && <Badge className="bg-info/20 text-info border-info/30">AI Pick</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1"><Navigation className="h-3 w-3 text-muted-foreground" /><span>{route.distance_nm.toLocaleString()} NM</span></div>
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-muted-foreground" /><span>{Math.floor(route.eta_hours / 24)}d {route.eta_hours % 24}h</span></div>
                    <div className="flex items-center gap-1"><Fuel className="h-3 w-3 text-muted-foreground" /><span>{route.fuel_mt} MT</span></div>
                    <div className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-muted-foreground" /><span>{route.co2_tons} t CO₂</span></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Risk Score</span>
                      <span className={route.risk_score < 30 ? "text-success" : route.risk_score < 60 ? "text-warning" : "text-destructive"}>{route.risk_score}/100</span>
                    </div>
                    <Progress value={100 - route.risk_score} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1"><Waves className="h-3 w-3" /><span>Max {route.max_wave_m.toFixed(1)}m</span></div>
                    <div className="flex items-center gap-1"><Wind className="h-3 w-3" /><span>Max {route.max_wind_kts.toFixed(0)} kts</span></div>
                  </div>
                  {route.eca_zones.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {route.eca_zones.map(eca => (
                        <Badge key={eca.name} variant="outline" className="text-[10px] border-warning/30 text-warning">
                          ⚠ {eca.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {route.savings_usd > 0 && (
                    <div className="text-center py-1 bg-success/10 rounded text-success text-xs font-medium">
                      💰 Saves US$ {route.savings_usd.toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weather" className="space-y-4">
          {selectedWeather ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { icon: Wind, label: "Max Wind", value: `${Math.max(...selectedWeather.waypoints.map(w => w.wind_speed_kts))} kts`, color: "text-primary" },
                  { icon: Waves, label: "Max Wave", value: `${Math.max(...selectedWeather.waypoints.map(w => w.wave_height_m)).toFixed(1)}m`, color: "text-info" },
                  { icon: Gauge, label: "Speed Reduction", value: `${selectedWeather.recommended_speed_reduction_pct}%`, color: "text-warning" },
                  { icon: Clock, label: "Est. Delay", value: `${selectedWeather.estimated_delay_hours}h`, color: "text-destructive" },
                ].map(item => (
                  <Card key={item.label} className="border-border/50 bg-card/80 backdrop-blur">
                    <CardContent className="pt-4 text-center">
                      <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold">{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Cloud className="h-4 w-4" /> GFS Waypoint Forecast</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="w-full">
                    <div className="flex gap-3 pb-2 min-w-max">
                      {selectedWeather.waypoints.map((wp, i) => {
                        const risk = wp.wave_height_m > 4 ? "high" : wp.wave_height_m > 2.5 ? "moderate" : "low";
                        return (
                          <div key={i} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-background/50 min-w-[120px]">
                            <span className="text-xs font-medium">WP {i + 1}</span>
                            <span className="text-[10px] text-muted-foreground">{wp.lat.toFixed(1)}°, {wp.lon.toFixed(1)}°</span>
                            <Wind className={`h-5 w-5 ${riskColor(risk)}`} />
                            <span className="text-sm font-bold">{wp.wind_speed_kts} kts</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Waves className="h-3 w-3" /> {wp.wave_height_m.toFixed(1)}m</div>
                            <Badge variant="outline" className={`text-[10px] ${riskColor(risk)}`}>{seaStateLabel[wp.sea_state] || wp.sea_state}</Badge>
                            <span className="text-[10px] text-muted-foreground">{wp.pressure_hpa} hPa</span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              {/* Weather Windows */}
              {selectedWeather.weather_windows.length > 0 && (
                <Card className="border-border/50 bg-card/80 backdrop-blur">
                  <CardHeader><CardTitle className="text-sm">Weather Windows</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {selectedWeather.weather_windows.map((w, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded bg-background/50">
                        <Badge variant="outline" className={riskColor(w.condition)}>{w.condition}</Badge>
                        <span className="text-xs text-muted-foreground">{w.description}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="border-border/50"><CardContent className="py-12 text-center text-muted-foreground">
              <Cloud className="h-12 w-12 mx-auto mb-4 opacity-30" />
              Clique em "Optimize Route" para gerar forecast GFS
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="eca" className="space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-warning" /> ECA Zone Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selected?.eca_zones && selected.eca_zones.length > 0 ? (
                selected.eca_zones.map((eca, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <div>
                        <p className="font-medium text-sm">{eca.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Type: {eca.type} • Entry: {eca.entry_lat}°N, {eca.entry_lon}°E → Exit: {eca.exit_lat}°N, {eca.exit_lon}°E
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-warning/20 text-warning">{eca.fuel_switch_required ? "Fuel Switch Required" : "Monitor"}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">VLSFO → ULSFO (0.10% S)</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{routeResults.size > 0 ? "No ECA zones on this route" : "Run optimization to detect ECA zones"}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Weather Hazards</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { hazard: "Tropical Storm Warning", region: "Caribbean Basin", severity: "high", eta: "48h" },
                  { hazard: "Heavy Swell Advisory", region: "North Atlantic", severity: "moderate", eta: "72h" },
                  { hazard: "Fog Advisory", region: "English Channel", severity: "low", eta: "144h" },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div>
                      <p className="text-sm font-medium">{h.hazard}</p>
                      <p className="text-xs text-muted-foreground">{h.region} • ETA {h.eta}</p>
                    </div>
                    <Badge variant="outline" className={riskColor(h.severity)}>{h.severity}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-success" /> Safety Recommendations</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Avoid Great Circle route due to severe weather window (Day 3-5)",
                  "Reduce speed to 12 kts through Bay of Biscay for crew comfort",
                  "Ballast adjustment recommended before entering North Atlantic swell",
                  "Consider waypoint deviation south of Azores High pressure system",
                  ...(selected?.eca_zones?.length ? [`Switch to ULSFO before entering ${selected.eca_zones[0]?.name}`] : []),
                ].map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-background/50">
                    <Shield className="h-3 w-3 text-info mt-1 shrink-0" />
                    <span className="text-xs">{rec}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: "Fuel Saved", value: "35 MT", sub: "vs Great Circle", color: "text-success" },
              { label: "Cost Savings", value: "$42,000", sub: "at $1,200/MT", color: "text-info" },
              { label: "CO₂ Reduction", value: "109 t", sub: "-8.3% emissions", color: "text-success" },
              { label: "CII Impact", value: "+0.12", sub: "Improves rating", color: "text-primary" },
              { label: "ECA Fuel Switch", value: selected?.eca_zones?.length ? `${selected.eca_zones.length} zones` : "None", sub: "VLSFO → ULSFO", color: "text-warning" },
            ].map((item, i) => (
              <Card key={i} className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="pt-4 text-center">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Speed/Consumption Curve */}
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Speed/Consumption Curve</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[10, 11, 12, 13, 14, 15, 16].map(speed => {
                  const consumption = calculateConsumption(speed, 14, 35, 65000, 2.0);
                  const maxConsumption = calculateConsumption(16, 14, 35, 65000, 2.0);
                  return (
                    <div key={speed} className="flex items-center gap-3">
                      <span className="text-xs w-16 text-right font-mono">{speed} kts</span>
                      <div className="flex-1">
                        <Progress value={(consumption / maxConsumption) * 100} className="h-3" />
                      </div>
                      <span className="text-xs w-20 font-mono">{consumption.toFixed(1)} MT/d</span>
                      {speed === ciiSpeed?.optimalSpeed && <Badge className="bg-success/20 text-success text-[10px]">CII Target</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader><CardTitle className="text-sm">Route Fuel Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.map(route => (
                  <div key={route.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{route.name}</span>
                      <span className="font-medium">{route.fuel_mt} MT</span>
                    </div>
                    <Progress value={(route.fuel_mt / 420) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
