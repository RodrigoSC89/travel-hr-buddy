/**
 * Weather Intelligence Page
 * IA para otimização de rotas baseada em clima e ondas
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Cloud, Wind, Waves, Navigation, AlertTriangle, 
  TrendingUp, Map, Thermometer, Droplets, Sun, Brain
} from "lucide-react";

const WeatherIntelligencePage = () => {
  const [optimizing, setOptimizing] = useState(false);

  const currentWeather = {
    location: "Santos → Rotterdam",
    temperature: 24,
    humidity: 78,
    windSpeed: 18,
    windDirection: "NE",
    waveHeight: 2.3,
    visibility: 12,
    pressure: 1015
  };

  const forecasts = [
    { day: "Hoje", icon: Sun, temp: "24°C", wind: "18 kn", waves: "2.3m", risk: "low" },
    { day: "Amanhã", icon: Cloud, temp: "22°C", wind: "22 kn", waves: "2.8m", risk: "low" },
    { day: "Seg", icon: Cloud, temp: "20°C", wind: "28 kn", waves: "3.5m", risk: "medium" },
    { day: "Ter", icon: AlertTriangle, temp: "18°C", wind: "35 kn", waves: "4.2m", risk: "high" },
    { day: "Qua", icon: Cloud, temp: "21°C", wind: "20 kn", waves: "2.5m", risk: "low" }
  ];

  const routeOptimizations = [
    { 
      name: "Rota Original", 
      distance: "5,847 nm", 
      duration: "14 dias 6h",
      fuel: "892 tons",
      risk: 45,
      savings: "—"
    },
    { 
      name: "Rota Otimizada IA", 
      distance: "5,923 nm", 
      duration: "13 dias 18h",
      fuel: "834 tons",
      risk: 18,
      savings: "58 tons combustível",
      recommended: true
    },
    { 
      name: "Rota Mais Rápida", 
      distance: "5,789 nm", 
      duration: "13 dias 2h",
      fuel: "945 tons",
      risk: 62,
      savings: "-53 tons (mais consumo)"
    }
  ];

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => setOptimizing(false), 3000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
          <Button onClick={handleOptimize} disabled={optimizing}>
            {optimizing ? (
              <>Otimizando...</>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Otimizar Rota
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Current Weather Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Thermometer className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Temperatura</p>
                <p className="text-2xl font-bold">{currentWeather.temperature}°C</p>
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
                <p className="text-2xl font-bold">{currentWeather.windSpeed} kn {currentWeather.windDirection}</p>
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
                <p className="text-2xl font-bold">{currentWeather.waveHeight}m</p>
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
                <p className="text-2xl font-bold">{currentWeather.humidity}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="routes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="routes">Rotas Otimizadas</TabsTrigger>
          <TabsTrigger value="forecast">Previsão 5 Dias</TabsTrigger>
          <TabsTrigger value="map">Mapa Meteorológico</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Comparação de Rotas - {currentWeather.location}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routeOptimizations.map((route, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      route.recommended 
                        ? "border-primary bg-primary/5" 
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{route.name}</h3>
                        {route.recommended && (
                          <Badge className="bg-green-500">Recomendada IA</Badge>
                        )}
                      </div>
                      {route.savings !== "—" && (
                        <Badge variant={route.savings.includes("-") ? "destructive" : "outline"}>
                          {route.savings}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Distância</span>
                        <p className="font-medium">{route.distance}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duração</span>
                        <p className="font-medium">{route.duration}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Combustível</span>
                        <p className="font-medium">{route.fuel}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Risco Meteorológico</span>
                        <div className="flex items-center gap-2">
                          <Progress value={route.risk} className="h-2 flex-1" />
                          <span className={`font-medium ${
                            route.risk < 30 ? "text-green-500" :
                            route.risk < 50 ? "text-yellow-500" : "text-red-500"
                          }`}>{route.risk}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-sm">
                    <strong>🌊 Ondas:</strong> Prevista tempestade no Atlântico Norte em 3-4 dias. 
                    Rota otimizada desvia 76nm ao sul para evitar área de risco.
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-sm">
                    <strong>⛽ Economia:</strong> A rota recomendada economiza 58 tons de combustível 
                    aproveitando correntes favoráveis e evitando ventos contrários.
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm">
                    <strong>⏰ Tempo:</strong> Chegada prevista antecipada em 12 horas comparado 
                    à rota original, mesmo com distância maior.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Previsão Meteorológica - Próximos 5 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {forecasts.map((day, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border text-center ${
                      day.risk === "high" ? "border-red-500/50 bg-red-500/5" :
                      day.risk === "medium" ? "border-yellow-500/50 bg-yellow-500/5" :
                      "border-border"
                    }`}
                  >
                    <p className="font-semibold mb-2">{day.day}</p>
                    <day.icon className={`h-10 w-10 mx-auto mb-2 ${
                      day.risk === "high" ? "text-red-500" :
                      day.risk === "medium" ? "text-yellow-500" : "text-blue-500"
                    }`} />
                    <p className="text-xl font-bold">{day.temp}</p>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>🌬️ {day.wind}</p>
                      <p>🌊 {day.waves}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 ${
                        day.risk === "high" ? "border-red-500 text-red-500" :
                        day.risk === "medium" ? "border-yellow-500 text-yellow-500" :
                        "border-green-500 text-green-500"
                      }`}
                    >
                      {day.risk === "high" ? "Alto Risco" :
                       day.risk === "medium" ? "Médio" : "Baixo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card className="h-[500px]">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <Map className="h-16 w-16 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Mapa Meteorológico Interativo</h3>
                <p className="text-muted-foreground max-w-md">
                  Visualização em tempo real de condições meteorológicas, 
                  rotas e áreas de risco ao longo do trajeto.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Meteorológicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-semibold">Aviso de Tempestade - Atlântico Norte</p>
                      <p className="text-sm text-muted-foreground">
                        Prevista para 3-4 dias. Ventos de 35-45 kn e ondas de 4-5m.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherIntelligencePage;
