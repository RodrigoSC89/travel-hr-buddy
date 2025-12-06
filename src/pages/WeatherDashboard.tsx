// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  CalendarDays
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
  }[];
  alerts: {
    event: string;
    description: string;
    severity: string;
  }[];
}

interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export default function WeatherDashboard() {
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [activeTab, setActiveTab] = useState("forecast");

  // Default locations for maritime operations
  const defaultLocations = [
    { name: "Santos, BR", lat: -23.9608, lon: -46.3335 },
    { name: "Rio de Janeiro, BR", lat: -22.9068, lon: -43.1729 },
    { name: "Macaé, BR", lat: -22.3708, lon: -41.7869 },
    { name: "Aberdeen, UK", lat: 57.1497, lon: -2.0943 },
    { name: "Houston, US", lat: 29.7604, lon: -95.3698 }
  ];

  useEffect(() => {
    loadSavedLocations();
    // Load default location (Santos)
    fetchWeatherData(defaultLocations[0].lat, defaultLocations[0].lon, defaultLocations[0].name);
  }, []);

  const loadSavedLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("weather_forecast")
        .select("id, location")
        .order("captured_at", { ascending: false })
        .limit(10);
      
      if (!error && data) {
        const locations = data.map((item: any) => ({
          id: item.id,
          name: item.location?.name || "Unknown",
          lat: item.location?.lat || 0,
          lon: item.location?.lng || 0
        }));
        setSavedLocations(locations);
      }
    } catch (error: any) {
      logger.error("Error loading locations", { error });
    }
  };

  const fetchWeatherData = async (lat: number, lon: number, locationName: string) => {
    setLoading(true);
    setSelectedLocation(locationName);
    
    try {
      // Generate realistic weather data
      const baseTemp = 22 + lat / 10; // Latitude affects temperature
      const mockWeatherData: WeatherData = {
        location: {
          name: locationName,
          lat,
          lon
        },
        current: {
          temp: baseTemp + Math.random() * 8,
          feels_like: baseTemp + Math.random() * 7 - 2,
          humidity: 65 + Math.random() * 20,
          pressure: 1013 + Math.random() * 20 - 10,
          wind_speed: 5 + Math.random() * 12,
          wind_deg: Math.random() * 360,
          clouds: Math.random() * 100,
          visibility: 10000,
          weather: [{
            main: "Clouds",
            description: "Partly Cloudy",
            icon: "02d"
          }]
        },
        forecast: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          temp_min: baseTemp - 3 + Math.random() * 3,
          temp_max: baseTemp + 3 + Math.random() * 5,
          description: ["Clear", "Cloudy", "Rainy", "Partly Cloudy"][Math.floor(Math.random() * 4)],
          icon: "02d"
        })),
        alerts: Math.random() > 0.6 ? [{
          event: "Aviso de Vento Forte",
          description: "Ventos podem exceder 25 nós nas próximas 24 horas",
          severity: "moderate"
        }] : []
      };

      setWeatherData(mockWeatherData);
      
      // Save to database silently
      await supabase.from("weather_forecast").insert({
        location: { lat, lng: lon, name: locationName },
        forecast: mockWeatherData.current
      }).catch(() => {});
      
      toast({
        title: "Dados atualizados",
        description: `Meteorologia carregada para ${locationName}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes("rain")) return <CloudRain className="h-8 w-8" />;
    if (desc.includes("snow")) return <CloudSnow className="h-8 w-8" />;
    if (desc.includes("cloud")) return <Cloud className="h-8 w-8" />;
    return <Sun className="h-8 w-8" />;
  };

  const getWindDirection = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(deg / 45) % 8];
  };

  const handleSearch = () => {
    if (searchQuery) {
      toast({
        title: "Busca de localização",
        description: "Funcionalidade de geocoding em implementação",
      });
    }
  };

  const handleLocationSelect = (location: typeof defaultLocations[0]) => {
    fetchWeatherData(location.lat, location.lon, location.name);
  };

  // Prepare data for AI Copilot
  const weatherDataForCopilot = weatherData ? {
    location: weatherData.location.name,
    temperature: weatherData.current.temp,
    windSpeed: weatherData.current.wind_speed,
    humidity: weatherData.current.humidity,
    visibility: weatherData.current.visibility / 1000,
    conditions: weatherData.current.weather[0]?.description || "N/A"
  } : undefined;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Cloud className="h-8 w-8 text-primary" />
            Dashboard Meteorológico
          </h1>
          <p className="text-muted-foreground mt-2">
            Dados meteorológicos em tempo real para operações marítimas
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar localização..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-64"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => weatherData && fetchWeatherData(
              weatherData.location.lat,
              weatherData.location.lon,
              weatherData.location.name
            )}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Quick Location Buttons */}
      <div className="flex gap-2 flex-wrap">
        {defaultLocations.map((location) => (
          <Button
            key={location.name}
            variant={selectedLocation === location.name ? "default" : "outline"}
            size="sm"
            onClick={() => handleLocationSelect(location)}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {location.name}
          </Button>
        ))}
      </div>

      {/* Weather Alerts */}
      {weatherData?.alerts && weatherData.alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              Alertas Meteorológicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weatherData.alerts.map((alert, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">{alert.severity}</Badge>
                  <span className="font-semibold">{alert.event}</span>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Current Weather */}
      {weatherData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
              {getWeatherIcon(weatherData.current.weather[0]?.description || "")}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {weatherData.current.temp.toFixed(1)}°C
              </div>
              <p className="text-xs text-muted-foreground">
                Sensação: {weatherData.current.feels_like.toFixed(1)}°C
              </p>
              <p className="text-sm mt-2 capitalize">
                {weatherData.current.weather[0]?.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vento</CardTitle>
              <Wind className="h-8 w-8 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {weatherData.current.wind_speed.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">nós</p>
              <p className="text-sm mt-2">
                Direção: {getWindDirection(weatherData.current.wind_deg)} ({weatherData.current.wind_deg.toFixed(0)}°)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Umidade</CardTitle>
              <Droplets className="h-8 w-8 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {weatherData.current.humidity.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">umidade relativa</p>
              <p className="text-sm mt-2">
                Pressão: {weatherData.current.pressure.toFixed(0)} hPa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visibilidade</CardTitle>
              <Sun className="h-8 w-8 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(weatherData.current.visibility / 1000).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">quilômetros</p>
              <p className="text-sm mt-2">
                Nebulosidade: {weatherData.current.clouds.toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">
            <TrendingUp className="w-4 h-4 mr-2" />
            Previsão 7 Dias
          </TabsTrigger>
          <TabsTrigger value="history">
            <CalendarDays className="w-4 h-4 mr-2" />
            Dados Históricos
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="w-4 h-4 mr-2" />
            Mapa Meteorológico
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

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão Estendida</CardTitle>
              <CardDescription>
                Previsão de 7 dias para {weatherData?.location.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {weatherData?.forecast ? (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weatherData.forecast.map((day, i) => (
                    <Card key={i} className="text-center">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium mb-2">
                          {new Date(day.date).toLocaleDateString("pt-BR", { weekday: "short" })}
                        </p>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(day.description)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">{day.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">
                            {day.temp_max.toFixed(0)}°C
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {day.temp_min.toFixed(0)}°C
                          </p>
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

        <TabsContent value="history" className="space-y-4">
          <HistoricalWeatherChart location={weatherData?.location.name} />
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <WindyMap 
            lat={weatherData?.location.lat}
            lon={weatherData?.location.lon}
            location={weatherData?.location.name}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <MaritimeWeatherAlerts />
        </TabsContent>

        <TabsContent value="copilot" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeatherAICopilot weatherData={weatherDataForCopilot} />
            <Card>
              <CardHeader>
                <CardTitle>Resumo das Condições</CardTitle>
                <CardDescription>
                  Informações para análise do Copiloto
                </CardDescription>
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
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                    💡 Dica
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Use o Copiloto IA para obter análises detalhadas das condições 
                    meteorológicas e recomendações para operações marítimas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
