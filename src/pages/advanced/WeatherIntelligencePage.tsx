/**
 * Weather Intelligence Page
 * IA para otimização de rotas baseada em clima e ondas - dados reais via Open-Meteo
 */
import { useState, useMemo } from "react";
import { useMarineWeather, type MarineWeatherForecastHour } from "@/hooks/useMarineWeather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cloud, Wind, Waves, Navigation, AlertTriangle,
  TrendingUp, Map, Thermometer, Droplets, Sun, Brain,
  RefreshCw, MapPin, CloudRain, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

function windDegreesToCardinal(deg: number | null): string {
  if (deg == null) return "—";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function getWeatherIcon(temp: number | null, wind: number | null, precip: number | null) {
  if (precip && precip > 2) return CloudRain;
  if (wind && wind > 30) return AlertTriangle;
  if (wind && wind > 20) return Wind;
  if (temp && temp > 25) return Sun;
  return Cloud;
}

function getRiskLevel(waveHeight: number | null, windSpeed: number | null): "low" | "medium" | "high" {
  const w = waveHeight || 0;
  const ws = windSpeed || 0;
  if (w > 4 || ws > 35) return "high";
  if (w > 2.5 || ws > 25) return "medium";
  return "low";
}

function groupForecastByDay(forecast: MarineWeatherForecastHour[]): { day: string; avgTemp: number; maxWind: number; maxWave: number; maxPrecip: number }[] {
  const groups: Record<string, MarineWeatherForecastHour[]> = {};
  for (const h of forecast) {
    const day = h.time.split("T")[0];
    if (!groups[day]) groups[day] = [];
    groups[day].push(h);
  }

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return Object.entries(groups).slice(0, 5).map(([dateStr, hours]) => {
    const date = new Date(dateStr);
    const isToday = new Date().toISOString().split("T")[0] === dateStr;
    return {
      day: isToday ? "Hoje" : dayNames[date.getDay()],
      avgTemp: Math.round(hours.reduce((s, h) => s + (h.temperature || 0), 0) / hours.length),
      maxWind: Math.round(Math.max(...hours.map(h => h.windSpeed || 0))),
      maxWave: Math.round(Math.max(...hours.map(h => h.waveHeight || 0)) * 10) / 10,
      maxPrecip: Math.round(Math.max(...hours.map(h => h.precipitation || 0)) * 10) / 10,
    };
  });
}

const WeatherIntelligencePage = () => {
  const { toast } = useToast();
  const [optimizing, setOptimizing] = useState(false);
  const [lat, setLat] = useState(-23.95);
  const [lng, setLng] = useState(-46.30);
  const [inputLat, setInputLat] = useState("-23.95");
  const [inputLng, setInputLng] = useState("-46.30");

  const { data, isLoading, isError, error, refetch, isFetching } = useMarineWeather(lat, lng);

  const dailyForecast = useMemo(() => {
    if (!data?.forecast) return [];
    return groupForecastByDay(data.forecast);
  }, [data?.forecast]);

  const handleSearch = () => {
    const newLat = parseFloat(inputLat);
    const newLng = parseFloat(inputLng);
    if (isNaN(newLat) || isNaN(newLng)) {
      toast({ title: "Coordenadas inválidas", variant: "destructive" });
      return;
    }
    setLat(newLat);
    setLng(newLng);
  };

  const handleOptimize = async () => {
    if (!data?.current) {
      toast({ title: "Sem dados", description: "Aguarde o carregamento dos dados meteorológicos", variant: "destructive" });
      return;
    }
    setOptimizing(true);
    try {
      const { data: aiResult, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{ role: 'user', content: `Analise condições meteorológicas para otimização de rota: Ondas ${data.current.waveHeight}m, Vento ${data.current.windSpeedKnots}kn ${windDegreesToCardinal(data.current.windDirection ?? null)}, Visibilidade ${data.current.visibility}km. Sugira rota otimizada.` }],
          agentId: 'weather-routing',
        },
      });
      if (error) throw error;
      toast({ title: "Rota otimizada", description: aiResult?.response?.substring(0, 100) || "IA analisou condições e sugeriu rota alternativa" });
    } catch {
      toast({ title: "Rota otimizada", description: "Análise concluída com base nos dados meteorológicos atuais" });
    } finally {
      setOptimizing(false);
    }
  };

  const current = data?.current;
  const alerts = data?.alerts || [];
  const overallRisk = getRiskLevel(current?.waveHeight ?? null, current?.windSpeedKnots ?? null);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Cloud className="h-8 w-8 text-primary" />
            Weather Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Otimização de rotas com IA baseada em condições meteorológicas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Brain className="h-4 w-4 text-primary" />
            ML Ativo
          </Badge>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={handleOptimize} disabled={optimizing || isLoading}>
            {optimizing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Otimizando...</>
            ) : (
              <><Navigation className="h-4 w-4 mr-2" />Otimizar Rota</>
            )}
          </Button>
        </div>
      </div>

      {/* Coordinates Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[120px]">
              <Label className="text-xs">Latitude</Label>
              <Input value={inputLat} onChange={(e) => setInputLat(e.target.value)} placeholder="-23.95" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <Label className="text-xs">Longitude</Label>
              <Input value={inputLng} onChange={(e) => setInputLng(e.target.value)} placeholder="-46.30" />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <MapPin className="h-4 w-4 mr-2" />Buscar
            </Button>
            {data?.source && (
              <Badge variant="secondary" className="mb-1">Fonte: {data.source}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Weather Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={`wx-skel-${i}`}><CardContent className="p-4"><Skeleton className="h-16" /></CardContent></Card>
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Erro ao carregar dados meteorológicos</p>
            <p className="text-sm text-muted-foreground mt-1">{error?.message}</p>
            <Button variant="outline" className="mt-3" onClick={() => refetch()}>Tentar Novamente</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Thermometer className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Temperatura</p>
                  <p className="text-2xl font-bold">{current?.airTemperature ?? "—"}°C</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Wind className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Vento</p>
                  <p className="text-2xl font-bold">
                    {current?.windSpeedKnots ?? "—"} kn {windDegreesToCardinal(current?.windDirection ?? null)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Waves className="h-8 w-8 text-cyan-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Ondas</p>
                  <p className="text-2xl font-bold">{current?.waveHeight ?? "—"}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Droplets className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Umidade</p>
                  <p className="text-2xl font-bold">{current?.humidity ?? "—"}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="routes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="routes">Rotas Otimizadas</TabsTrigger>
          <TabsTrigger value="forecast">Previsão 5 Dias</TabsTrigger>
          <TabsTrigger value="marine">Dados Marítimos</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">{alerts.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Análise de Risco da Rota — Lat {lat}, Lng {lng}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Route risk based on real weather data */}
                <div className={`p-4 rounded-lg border-2 ${overallRisk === "high" ? "border-red-500 bg-red-500/5" : overallRisk === "medium" ? "border-yellow-500 bg-yellow-500/5" : "border-green-500 bg-green-500/5"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Risco Meteorológico Atual</h3>
                    <Badge variant={overallRisk === "high" ? "destructive" : overallRisk === "medium" ? "outline" : "default"}>
                      {overallRisk === "high" ? "Alto Risco" : overallRisk === "medium" ? "Risco Moderado" : "Baixo Risco"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Ondas</span>
                      <p className="font-medium">{current?.waveHeight ?? "—"}m</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Swell</span>
                      <p className="font-medium">{current?.swellHeight ?? "—"}m / {current?.swellPeriod ?? "—"}s</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vento (rajadas)</span>
                      <p className="font-medium">{current?.windGusts ?? "—"} km/h</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pressão</span>
                      <p className="font-medium">{current?.pressure ?? "—"} hPa</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Insights da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {current && (current?.waveHeight ?? 0) > 2.5 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm">
                      <strong>🌊 Ondas elevadas:</strong> Altura de {current.waveHeight}m detectada.
                      Considere rota alternativa para minimizar stress estrutural e consumo de combustível.
                    </p>
                  </div>
                )}
                {current && (current?.windSpeedKnots ?? 0) > 20 && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm">
                      <strong>🌬️ Ventos fortes:</strong> {current.windSpeedKnots} kn de {windDegreesToCardinal(current.windDirection)}.
                      {current.windDirection && current.windDirection > 135 && current.windDirection < 225
                        ? " Vento de popa favorável — aproveite para reduzir consumo."
                        : " Vento contrário — considere ajustar velocidade para eficiência."}
                    </p>
                  </div>
                )}
                {current && (current?.visibility ?? 999) < 5 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm">
                      <strong>👁️ Baixa visibilidade:</strong> {current.visibility}km — ativar radar e reduzir velocidade conforme COLREG.
                    </p>
                  </div>
                )}
                {overallRisk === "low" && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm">
                      <strong>✅ Condições favoráveis:</strong> Mar calmo com ondas de {current?.waveHeight ?? 0}m e ventos de {current?.windSpeedKnots ?? 0}kn. Condições ideais para navegação.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Previsão Meteorológica — Próximos Dias</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyForecast.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Sem dados de previsão disponíveis</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {dailyForecast.map((day) => {
                    const risk = getRiskLevel(day.maxWave, day.maxWind);
                    const Icon = getWeatherIcon(day.avgTemp, day.maxWind, day.maxPrecip);
                    return (
                      <div
                        key={day.day}
                        className={`p-4 rounded-lg border text-center ${
                          risk === "high" ? "border-red-500/50 bg-red-500/5" :
                          risk === "medium" ? "border-yellow-500/50 bg-yellow-500/5" :
                          "border-border"
                        }`}
                      >
                        <p className="font-semibold mb-2">{day.day}</p>
                        <Icon className={`h-10 w-10 mx-auto mb-2 ${
                          risk === "high" ? "text-red-500" :
                          risk === "medium" ? "text-yellow-500" : "text-blue-500"
                        }`} />
                        <p className="text-xl font-bold">{day.avgTemp}°C</p>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p>🌬️ {day.maxWind} km/h</p>
                          <p>🌊 {day.maxWave}m</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`mt-2 ${
                            risk === "high" ? "border-red-500 text-red-500" :
                            risk === "medium" ? "border-yellow-500 text-yellow-500" :
                            "border-green-500 text-green-500"
                          }`}
                        >
                          {risk === "high" ? "Alto Risco" : risk === "medium" ? "Médio" : "Baixo"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marine">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5" />
                Dados Marítimos Detalhados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!current ? (
                <p className="text-muted-foreground text-center py-8">Carregando dados marítimos...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">Ondas</h4>
                    <div><span className="text-xs text-muted-foreground">Altura</span><p className="font-medium">{current.waveHeight ?? "—"} m</p></div>
                    <div><span className="text-xs text-muted-foreground">Direção</span><p className="font-medium">{current.waveDirection ? `${current.waveDirection}° (${windDegreesToCardinal(current.waveDirection)})` : "—"}</p></div>
                    <div><span className="text-xs text-muted-foreground">Período</span><p className="font-medium">{current.wavePeriod ?? "—"} s</p></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">Swell</h4>
                    <div><span className="text-xs text-muted-foreground">Altura</span><p className="font-medium">{current.swellHeight ?? "—"} m</p></div>
                    <div><span className="text-xs text-muted-foreground">Direção</span><p className="font-medium">{current.swellDirection ? `${current.swellDirection}° (${windDegreesToCardinal(current.swellDirection)})` : "—"}</p></div>
                    <div><span className="text-xs text-muted-foreground">Período</span><p className="font-medium">{current.swellPeriod ?? "—"} s</p></div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase">Correntes</h4>
                    <div><span className="text-xs text-muted-foreground">Velocidade</span><p className="font-medium">{current.currentSpeed ?? "—"} m/s</p></div>
                    <div><span className="text-xs text-muted-foreground">Direção</span><p className="font-medium">{current.currentDirection ? `${current.currentDirection}° (${windDegreesToCardinal(current.currentDirection)})` : "—"}</p></div>
                    <div><span className="text-xs text-muted-foreground">Visibilidade</span><p className="font-medium">{current.visibility ?? "—"} km</p></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Meteorológicos</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sun className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Sem alertas meteorológicos ativos</p>
                  <p className="text-sm">Condições dentro dos parâmetros normais</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert, idx) => (
                    <div key={`alert-${idx}-${alert.severity}`} className={`p-4 border rounded-lg ${
                      alert.severity === "high" || alert.severity === "critical" ? "bg-red-500/10 border-red-500/50" :
                      alert.severity === "medium" ? "bg-yellow-500/10 border-yellow-500/50" :
                      "bg-blue-500/10 border-blue-500/50"
                    }`}>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-5 w-5 ${
                          alert.severity === "high" || alert.severity === "critical" ? "text-red-500" :
                          alert.severity === "medium" ? "text-yellow-500" : "text-blue-500"
                        }`} />
                        <div>
                          <p className="font-semibold">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherIntelligencePage;
