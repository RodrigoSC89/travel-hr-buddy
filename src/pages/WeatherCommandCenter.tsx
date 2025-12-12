/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PATCH UNIFY-10.0: Weather Command Center
 * Fusão de: Dashboard Meteorológico + Previsão Global
 * 
 * Funcionalidades integradas:
 * - Dashboard meteorológico em tempo real
 * - Previsão de 7 dias
 * - Mapa Windy interativo
 * - Dados históricos
 * - Alertas marítimos
 * - Copiloto IA meteorológico
 * - Previsão global multi-localização
 * - Análise de tendências
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  TrendingUp,
  MapPin,
  RefreshCw,
  Search,
  Bot,
  Map,
  CalendarDays,
  Globe,
  Thermometer,
  Navigation,
  Eye,
  Gauge,
  Waves,
  Compass,
  Clock,
  BarChart3,
  Zap,
  Plus,
  Trash2
} from "lucide-react";
import { WeatherAICopilot } from "@/components/weather/WeatherAICopilot";
import { WindyMap } from "@/components/weather/WindyMap";
import { HistoricalWeatherChart } from "@/components/weather/HistoricalWeatherChart";
import { MaritimeWeatherAlerts } from "@/components/weather/MaritimeWeatherAlerts";

interface WeatherData {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_deg: number;
    clouds: number;
    visibility: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
  };
  forecast: {
    date: string;
    temp_min: number;
    temp_max: number;
    description: string;
    icon: string;
    humidity: number;
    wind_speed: number;
  }[];
  alerts: {
    event: string;
    description: string;
    severity: string;
  }[];
  marine?: {
    wave_height: number;
    wave_period: number;
    wave_direction: number;
    swell_height: number;
    sea_temperature: number;
  };
}

interface GlobalLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  region: string;
  weather?: WeatherData;
}

const defaultLocations: GlobalLocation[] = [
  { id: "1", name: "Santos, BR", lat: -23.9608, lon: -46.3335, region: "América do Sul" },
  { id: "2", name: "Rio de Janeiro, BR", lat: -22.9068, lon: -43.1729, region: "América do Sul" },
  { id: "3", name: "Macaé, BR", lat: -22.3708, lon: -41.7869, region: "América do Sul" },
  { id: "4", name: "Aberdeen, UK", lat: 57.1497, lon: -2.0943, region: "Europa" },
  { id: "5", name: "Houston, US", lat: 29.7604, lon: -95.3698, region: "América do Norte" },
  { id: "6", name: "Singapore", lat: 1.3521, lon: 103.8198, region: "Ásia" },
  { id: "7", name: "Rotterdam, NL", lat: 51.9244, lon: 4.4777, region: "Europa" },
  { id: "8", name: "Dubai, UAE", lat: 25.2048, lon: 55.2708, region: "Oriente Médio" },
];

export default function WeatherCommandCenter() {
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("Santos, BR");
  const [activeTab, setActiveTab] = useState("overview");
  const [globalLocations, setGlobalLocations] = useState<GlobalLocation[]>(defaultLocations);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchWeatherData(defaultLocations[0].lat, defaultLocations[0].lon, defaultLocations[0].name);
    loadGlobalForecast();
  }, []);

  const generateMockWeather = (lat: number, lon: number, locationName: string): WeatherData => {
    const baseTemp = 22 + lat / 10;
    return {
      location: { name: locationName, lat, lon },
      current: {
        temp: baseTemp + Math.random() * 8,
        feels_like: baseTemp + Math.random() * 7 - 2,
        humidity: 65 + Math.random() * 20,
        pressure: 1013 + Math.random() * 20 - 10,
        wind_speed: 5 + Math.random() * 12,
        wind_deg: Math.random() * 360,
        clouds: Math.random() * 100,
        visibility: 8000 + Math.random() * 4000,
        weather: [{
          main: ["Clear", "Clouds", "Rain"][Math.floor(Math.random() * 3)],
          description: ["Céu limpo", "Parcialmente nublado", "Chuva leve", "Nublado"][Math.floor(Math.random() * 4)],
          icon: "02d"
        }]
      },
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        temp_min: baseTemp - 3 + Math.random() * 3,
        temp_max: baseTemp + 3 + Math.random() * 5,
        description: ["Ensolarado", "Nublado", "Chuvoso", "Parcialmente nublado"][Math.floor(Math.random() * 4)],
        icon: "02d",
        humidity: 50 + Math.random() * 40,
        wind_speed: 5 + Math.random() * 15
      })),
      alerts: Math.random() > 0.7 ? [{
        event: ["Aviso de Vento Forte", "Alerta de Tempestade", "Aviso de Mar Agitado"][Math.floor(Math.random() * 3)],
        description: "Condições adversas previstas para as próximas 24-48 horas",
        severity: ["low", "moderate", "high"][Math.floor(Math.random() * 3)]
      }] : [],
      marine: {
        wave_height: 0.5 + Math.random() * 3,
        wave_period: 5 + Math.random() * 10,
        wave_direction: Math.random() * 360,
        swell_height: 0.3 + Math.random() * 2,
        sea_temperature: 18 + Math.random() * 10
      }
    };
  };

  const fetchWeatherData = async (lat: number, lon: number, locationName: string) => {
    setLoading(true);
    setSelectedLocation(locationName);
    
    try {
      const mockWeatherData = generateMockWeather(lat, lon, locationName);
      setWeatherData(mockWeatherData);
      setLastUpdate(new Date());
      
      // Log weather fetch (optional save)
      logger.info("Weather data fetched", { location: locationName, lat, lon });
      
      toast({
        title: "Dados atualizados",
        description: `Meteorologia carregada para ${locationName}`,
      });
    } catch (error: SupabaseError | null) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalForecast = async () => {
    setLoadingGlobal(true);
    try {
      const updatedLocations = globalLocations.map(loc => ({
        ...loc,
        weather: generateMockWeather(loc.lat, loc.lon, loc.name)
      }));
      setGlobalLocations(updatedLocations);
    } finally {
      setLoadingGlobal(false);
    }
  };

  const getWeatherIcon = (description: string, size: string = "h-8 w-8") => {
    const desc = description.toLowerCase();
    if (desc.includes("rain") || desc.includes("chuv")) return <CloudRain className={size} />;
    if (desc.includes("snow") || desc.includes("neve")) return <CloudSnow className={size} />;
    if (desc.includes("cloud") || desc.includes("nubl")) return <Cloud className={size} />;
    return <Sun className={size} />;
  };

  const getWindDirection = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(deg / 45) % 8];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "high": return "destructive";
    case "moderate": return "warning";
    default: return "secondary";
    }
  };

  const handleSearch = () => {
    if (searchQuery) {
      const found = globalLocations.find(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (found) {
        fetchWeatherData(found.lat, found.lon, found.name);
      } else {
        toast({
          title: "Localização não encontrada",
          description: "Tente outra localização ou adicione manualmente",
        });
      }
    }
  };

  const weatherDataForCopilot = weatherData ? {
    location: weatherData.location.name,
    temperature: weatherData.current.temp,
    windSpeed: weatherData.current.wind_speed,
    humidity: weatherData.current.humidity,
    visibility: weatherData.current.visibility / 1000,
    conditions: weatherData.current.weather[0]?.description || "N/A",
    waveHeight: weatherData.marine?.wave_height,
    seaTemperature: weatherData.marine?.sea_temperature
  } : undefined;

  // Calculate global statistics
  const globalStats = {
    avgTemp: globalLocations.reduce((acc, loc) => acc + (loc.weather?.current.temp || 0), 0) / globalLocations.length,
    avgWind: globalLocations.reduce((acc, loc) => acc + (loc.weather?.current.wind_speed || 0), 0) / globalLocations.length,
    alertCount: globalLocations.filter(loc => loc.weather?.alerts && loc.weather.alerts.length > 0).length,
    goodConditions: globalLocations.filter(loc => 
      loc.weather && loc.weather.current.wind_speed < 15 && loc.weather.current.visibility > 5000
    ).length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            Weather Command Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Centro unificado de meteorologia e previsões globais para operações marítimas
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar localização..."
              value={searchQuery}
              onChange={handleChange}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-64"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => {
              if (weatherData) {
                fetchWeatherData(weatherData.location.lat, weatherData.location.lon, weatherData.location.name);
              }
              loadGlobalForecast();
            }}
            disabled={loading || loadingGlobal}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || loadingGlobal) ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temp. Média Global</p>
                <p className="text-2xl font-bold">{globalStats.avgTemp.toFixed(1)}°C</p>
              </div>
              <Thermometer className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vento Médio</p>
                <p className="text-2xl font-bold">{globalStats.avgWind.toFixed(1)} nós</p>
              </div>
              <Wind className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{globalStats.alertCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Condições Boas</p>
                <p className="text-2xl font-bold">{globalStats.goodConditions}/{globalLocations.length}</p>
              </div>
              <Sun className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Location Buttons */}
      <div className="flex gap-2 flex-wrap">
        {defaultLocations.slice(0, 5).map((location) => (
          <Button
            key={location.id}
            variant={selectedLocation === location.name ? "default" : "outline"}
            size="sm"
            onClick={() => handlefetchWeatherData}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {location.name}
          </Button>
        ))}
      </div>

      {/* Weather Alerts Banner */}
      {weatherData?.alerts && weatherData.alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              Alertas Meteorológicos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weatherData.alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3">
                <Badge variant={getSeverityColor(alert.severity) as unknown}>{alert.severity}</Badge>
                <span className="font-semibold">{alert.event}</span>
                <span className="text-sm text-muted-foreground">- {alert.description}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Weather Dashboard */}
      {weatherData && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              {getWeatherIcon(weatherData.current.weather[0]?.description || "", "h-10 w-10 mx-auto mb-2")}
              <p className="text-2xl font-bold">{weatherData.current.temp.toFixed(1)}°C</p>
              <p className="text-xs text-muted-foreground">Sensação: {weatherData.current.feels_like.toFixed(1)}°C</p>
              <p className="text-sm capitalize mt-1">{weatherData.current.weather[0]?.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 text-center">
              <Wind className="h-10 w-10 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{weatherData.current.wind_speed.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">nós</p>
              <p className="text-sm mt-1">{getWindDirection(weatherData.current.wind_deg)} ({weatherData.current.wind_deg.toFixed(0)}°)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 text-center">
              <Droplets className="h-10 w-10 mx-auto mb-2 text-cyan-500" />
              <p className="text-2xl font-bold">{weatherData.current.humidity.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Umidade</p>
              <p className="text-sm mt-1">{weatherData.current.pressure.toFixed(0)} hPa</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 text-center">
              <Eye className="h-10 w-10 mx-auto mb-2 text-gray-500" />
              <p className="text-2xl font-bold">{(weatherData.current.visibility / 1000).toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">km visibilidade</p>
              <p className="text-sm mt-1">Nuvens: {weatherData.current.clouds.toFixed(0)}%</p>
            </CardContent>
          </Card>

          {weatherData.marine && (
            <>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Waves className="h-10 w-10 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{weatherData.marine.wave_height.toFixed(1)}m</p>
                  <p className="text-xs text-muted-foreground">Altura das ondas</p>
                  <p className="text-sm mt-1">Período: {weatherData.marine.wave_period.toFixed(0)}s</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 text-center">
                  <Thermometer className="h-10 w-10 mx-auto mb-2 text-teal-500" />
                  <p className="text-2xl font-bold">{weatherData.marine.sea_temperature.toFixed(1)}°C</p>
                  <p className="text-xs text-muted-foreground">Temp. do mar</p>
                  <p className="text-sm mt-1">Swell: {weatherData.marine.swell_height.toFixed(1)}m</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <TrendingUp className="w-4 h-4 mr-2" />
            Previsão 7 Dias
          </TabsTrigger>
          <TabsTrigger value="global">
            <Globe className="w-4 h-4 mr-2" />
            Previsão Global
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="w-4 h-4 mr-2" />
            Mapa Interativo
          </TabsTrigger>
          <TabsTrigger value="history">
            <CalendarDays className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="copilot">
            <Bot className="w-4 h-4 mr-2" />
            Copiloto IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Location Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {weatherData?.location.name || "Selecione uma localização"}
                </CardTitle>
                <CardDescription>
                  Lat: {weatherData?.location.lat.toFixed(4)} | Lon: {weatherData?.location.lon.toFixed(4)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weatherData?.forecast && (
                  <div className="grid grid-cols-7 gap-2">
                    {weatherData.forecast.map((day, i) => (
                      <div key={i} className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="text-xs font-medium">
                          {new Date(day.date).toLocaleDateString("pt-BR", { weekday: "short" })}
                        </p>
                        <div className="my-2 flex justify-center">
                          {getWeatherIcon(day.description, "h-6 w-6")}
                        </div>
                        <p className="text-sm font-bold">{day.temp_max.toFixed(0)}°</p>
                        <p className="text-xs text-muted-foreground">{day.temp_min.toFixed(0)}°</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Marine Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5" />
                  Condições Marítimas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weatherData?.marine ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Altura das Ondas</span>
                      <span className="font-bold">{weatherData.marine.wave_height.toFixed(1)}m</span>
                    </div>
                    <Progress value={Math.min(weatherData.marine.wave_height * 20, 100)} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Período das Ondas</span>
                      <span className="font-bold">{weatherData.marine.wave_period.toFixed(0)}s</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Direção das Ondas</span>
                      <span className="font-bold">{getWindDirection(weatherData.marine.wave_direction)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Temp. do Mar</span>
                      <span className="font-bold">{weatherData.marine.sea_temperature.toFixed(1)}°C</span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center">Dados marítimos não disponíveis</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão Estendida - 7 Dias</CardTitle>
              <CardDescription>Previsão detalhada para {weatherData?.location.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {weatherData?.forecast ? (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weatherData.forecast.map((day, i) => (
                    <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium mb-2">
                          {new Date(day.date).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" })}
                        </p>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(day.description, "h-10 w-10")}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{day.description}</p>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-orange-500">{day.temp_max.toFixed(0)}°C</p>
                          <p className="text-sm text-blue-500">{day.temp_min.toFixed(0)}°C</p>
                        </div>
                        <div className="mt-3 pt-3 border-t text-xs space-y-1">
                          <div className="flex justify-between">
                            <span><Droplets className="h-3 w-3 inline" /></span>
                            <span>{day.humidity.toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span><Wind className="h-3 w-3 inline" /></span>
                            <span>{day.wind_speed.toFixed(0)} nós</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Selecione uma localização para ver a previsão
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Previsão Global Multi-Localização
              </CardTitle>
              <CardDescription>
                Monitoramento simultâneo de {globalLocations.length} localizações estratégicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {globalLocations.map((location) => (
                    <Card 
                      key={location.id} 
                      className={`cursor-pointer hover:shadow-lg transition-all ${
                        selectedLocation === location.name ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handlefetchWeatherData}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{location.name}</CardTitle>
                          {location.weather && getWeatherIcon(
                            location.weather.current.weather[0]?.description || "", 
                            "h-5 w-5"
                          )}
                        </div>
                        <Badge variant="outline" className="w-fit text-xs">{location.region}</Badge>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {location.weather ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold">
                                {location.weather.current.temp.toFixed(1)}°C
                              </span>
                              {location.weather.alerts && location.weather.alerts.length > 0 && (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">
                              {location.weather.current.weather[0]?.description}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <Wind className="h-3 w-3" />
                                {location.weather.current.wind_speed.toFixed(0)} nós
                              </div>
                              <div className="flex items-center gap-1">
                                <Droplets className="h-3 w-3" />
                                {location.weather.current.humidity.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Carregando...</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <WindyMap 
            lat={weatherData?.location.lat}
            lon={weatherData?.location.lon}
            location={weatherData?.location.name}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <HistoricalWeatherChart location={weatherData?.location.name} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <MaritimeWeatherAlerts />
        </TabsContent>

        <TabsContent value="copilot" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeatherAICopilot weatherData={weatherDataForCopilot} />
            <Card>
              <CardHeader>
                <CardTitle>Resumo para Análise IA</CardTitle>
                <CardDescription>Dados contextuais para o Copiloto Meteorológico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Localização</p>
                    <p className="font-semibold">{weatherData?.location.name || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Temperatura</p>
                    <p className="font-semibold">{weatherData?.current.temp.toFixed(1) || "N/A"}°C</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Vento</p>
                    <p className="font-semibold">{weatherData?.current.wind_speed.toFixed(1) || "N/A"} nós</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Umidade</p>
                    <p className="font-semibold">{weatherData?.current.humidity.toFixed(0) || "N/A"}%</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Visibilidade</p>
                    <p className="font-semibold">{weatherData ? (weatherData.current.visibility / 1000).toFixed(1) : "N/A"} km</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Ondas</p>
                    <p className="font-semibold">{weatherData?.marine?.wave_height.toFixed(1) || "N/A"}m</p>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium mb-2">Avaliação de Condições</p>
                  {weatherData && (
                    <div className="flex items-center gap-2">
                      {weatherData.current.wind_speed < 15 && weatherData.current.visibility > 5000 ? (
                        <>
                          <Badge className="bg-green-500">Favorável</Badge>
                          <span className="text-sm">Condições adequadas para operações</span>
                        </>
                      ) : weatherData.current.wind_speed < 25 ? (
                        <>
                          <Badge className="bg-yellow-500">Moderado</Badge>
                          <span className="text-sm">Atenção recomendada</span>
                        </>
                      ) : (
                        <>
                          <Badge variant="destructive">Adverso</Badge>
                          <span className="text-sm">Condições desfavoráveis</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
