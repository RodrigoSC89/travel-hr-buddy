import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, Eye,
  AlertTriangle, ThermometerSun, Navigation, Waves, RefreshCw,
  MapPin, Ship, Activity
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface WeatherData {
  id: string;
  location_name: string;
  temperature: number;
  feels_like: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  visibility: number;
  clouds_percentage: number;
  wave_height?: number;
  sea_state?: string;
  observation_time: string;
}

interface WeatherEvent {
  id: string;
  event_type: string;
  severity: string;
  title: string;
  description: string;
  start_time: string;
  status: string;
  acknowledged: boolean;
}

interface Vessel {
  id: string;
  name: string;
  last_known_position?: { lat: number; lng: number };
}

export function WeatherDashboard() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [weatherEvents, setWeatherEvents] = useState<WeatherEvent[]>([]);
  const [customLocation, setCustomLocation] = useState("");

  // API key from environment
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  useEffect(() => {
    loadVessels();
    loadWeatherData();
    loadWeatherEvents();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshWeatherData();
      }, 5 * 60 * 1000); // Refresh every 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadVessels = async () => {
    try {
      const { data, error } = await supabase
        .from('vessels')
        .select('id, name, last_known_position')
        .eq('status', 'active');

      if (error) throw error;
      setVessels(data || []);
    } catch (error) {
      console.error('Error loading vessels:', error);
    }
  };

  const loadWeatherData = async () => {
    try {
      const { data, error } = await supabase
        .from('weather_logs')
        .select('*')
        .order('observation_time', { ascending: false })
        .limit(10);

      if (error) throw error;
      setWeatherData(data || []);
    } catch (error) {
      console.error('Error loading weather data:', error);
    }
  };

  const loadWeatherEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('critical_weather_events')
        .select('*');

      if (error) throw error;
      setWeatherEvents(data || []);
    } catch (error) {
      console.error('Error loading weather events:', error);
    }
  };

  const fetchWeatherFromAPI = async (lat: number, lng: number, locationName: string, vesselId?: string) => {
    if (!apiKey) {
      toast({
        title: "API Key não configurada",
        description: "Configure VITE_OPENWEATHER_API_KEY no arquivo .env",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=pt_br`
      );

      if (!currentResponse.ok) throw new Error('Failed to fetch weather data');

      const currentData = await currentResponse.json();

      // Save to database
      const { error: insertError } = await supabase
        .from('weather_logs')
        .insert({
          vessel_id: vesselId || null,
          location_name: locationName,
          location: { lat, lng },
          temperature: currentData.main.temp,
          feels_like: currentData.main.feels_like,
          temp_min: currentData.main.temp_min,
          temp_max: currentData.main.temp_max,
          pressure: currentData.main.pressure,
          humidity: currentData.main.humidity,
          visibility: currentData.visibility,
          wind_speed: currentData.wind.speed,
          wind_direction: currentData.wind.deg,
          wind_gust: currentData.wind.gust,
          clouds_percentage: currentData.clouds.all,
          weather_main: currentData.weather[0].main,
          weather_description: currentData.weather[0].description,
          weather_icon: currentData.weather[0].icon,
          observation_time: new Date(currentData.dt * 1000).toISOString(),
          sunrise: new Date(currentData.sys.sunrise * 1000).toISOString(),
          sunset: new Date(currentData.sys.sunset * 1000).toISOString(),
          api_response: currentData,
        });

      if (insertError) throw insertError;

      // Fetch forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=pt_br`
      );

      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();

        // Save forecast data (sample first 8 entries - 24 hours)
        for (const item of forecastData.list.slice(0, 8)) {
          await supabase.from('weather_predictions').insert({
            vessel_id: vesselId || null,
            location_name: locationName,
            location: { lat, lng },
            forecast_time: new Date(item.dt * 1000).toISOString(),
            forecast_range: 'short',
            temperature: item.main.temp,
            feels_like: item.main.feels_like,
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            pressure: item.main.pressure,
            humidity: item.main.humidity,
            wind_speed: item.wind.speed,
            wind_direction: item.wind.deg,
            clouds_percentage: item.clouds.all,
            rain_probability: item.pop * 100,
            rain_volume: item.rain?.['3h'] || 0,
            weather_main: item.weather[0].main,
            weather_description: item.weather[0].description,
            weather_icon: item.weather[0].icon,
            confidence_score: 85,
            api_response: item,
          });
        }
      }

      // Check for critical conditions
      if (currentData.wind.speed > 15 || currentData.visibility < 2000) {
        await supabase.from('weather_events').insert({
          event_type: currentData.wind.speed > 20 ? 'high_winds' : 'fog',
          severity: currentData.wind.speed > 20 ? 'high' : 'moderate',
          title: currentData.wind.speed > 20 ? 'Ventos Fortes Detectados' : 'Baixa Visibilidade',
          description: `Condições críticas em ${locationName}. Vento: ${currentData.wind.speed} m/s, Visibilidade: ${currentData.visibility} m`,
          affected_area: { coordinates: [{ lat, lng }] },
          affected_vessels: vesselId ? [vesselId] : [],
          start_time: new Date().toISOString(),
          status: 'warning',
        });
      }

      toast({
        title: "Dados meteorológicos atualizados",
        description: `Informações carregadas para ${locationName}`,
      });

      await loadWeatherData();
      await loadWeatherEvents();

    } catch (error: any) {
      console.error('Error fetching weather:', error);
      toast({
        title: "Erro ao buscar dados meteorológicos",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const handleFetchWeather = async () => {
    setLoading(true);

    if (selectedVessel) {
      const vessel = vessels.find(v => v.id === selectedVessel);
      if (vessel?.last_known_position) {
        await fetchWeatherFromAPI(
          vessel.last_known_position.lat,
          vessel.last_known_position.lng,
          vessel.name,
          vessel.id
        );
      } else {
        toast({
          title: "Posição não disponível",
          description: "A embarcação não possui posição conhecida",
          variant: "destructive",
        });
      }
    } else if (customLocation) {
      // Geocoding for custom location
      try {
        const geocodeResponse = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${customLocation}&limit=1&appid=${apiKey}`
        );
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.length > 0) {
          await fetchWeatherFromAPI(
            geocodeData[0].lat,
            geocodeData[0].lon,
            customLocation
          );
        } else {
          toast({
            title: "Localização não encontrada",
            description: "Tente um nome de cidade diferente",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }

    setLoading(false);
  };

  const refreshWeatherData = async () => {
    setRefreshing(true);
    await loadWeatherData();
    await loadWeatherEvents();
    setRefreshing(false);

    toast({
      title: "Dados atualizados",
      description: "Informações meteorológicas recarregadas",
    });
  };

  const acknowledgeEvent = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('weather_events')
        .update({
          acknowledged: true,
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Evento confirmado",
        description: "O alerta meteorológico foi marcado como lido",
      });

      await loadWeatherEvents();
    } catch (error) {
      console.error('Error acknowledging event:', error);
    }
  };

  const getWeatherIcon = (main: string) => {
    const iconMap: Record<string, any> = {
      Clear: <Sun className="h-8 w-8 text-yellow-500" />,
      Clouds: <Cloud className="h-8 w-8 text-gray-500" />,
      Rain: <CloudRain className="h-8 w-8 text-blue-500" />,
      Snow: <CloudSnow className="h-8 w-8 text-blue-300" />,
      Drizzle: <CloudRain className="h-8 w-8 text-blue-400" />,
      Thunderstorm: <CloudRain className="h-8 w-8 text-purple-600" />,
    };
    return iconMap[main] || <Cloud className="h-8 w-8 text-gray-500" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      severe: 'bg-red-100 text-red-800 border-red-300',
      extreme: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getSeaStateColor = (seaState: string) => {
    const colors: Record<string, string> = {
      calm: 'text-green-600',
      slight: 'text-blue-600',
      moderate: 'text-yellow-600',
      rough: 'text-orange-600',
      very_rough: 'text-red-600',
      high: 'text-red-700',
      very_high: 'text-purple-600',
      phenomenal: 'text-purple-800',
    };
    return colors[seaState] || 'text-gray-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Cloud className="h-8 w-8" />
            Weather Dashboard v1
          </h1>
          <p className="text-muted-foreground">Monitoramento meteorológico e marítimo em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshWeatherData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Critical Weather Events */}
      {weatherEvents.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Eventos Críticos ({weatherEvents.length})
          </h2>
          <div className="grid gap-2">
            {weatherEvents.map((event) => (
              <Card key={event.id} className={`border-2 ${getSeverityColor(event.severity)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{event.event_type}</Badge>
                        <Badge variant="outline">{event.status}</Badge>
                      </div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Início: {format(new Date(event.start_time), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    {!event.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => acknowledgeEvent(event.id)}
                      >
                        Confirmar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Condições Atuais</TabsTrigger>
          <TabsTrigger value="fetch">Buscar Dados</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {weatherData.map((weather) => (
              <Card key={weather.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{weather.location_name}</CardTitle>
                      <CardDescription>
                        {format(new Date(weather.observation_time), 'dd/MM HH:mm')}
                      </CardDescription>
                    </div>
                    {getWeatherIcon(weather.weather_main)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{Math.round(weather.temperature)}°C</div>
                    <p className="text-sm text-muted-foreground">
                      Sensação: {Math.round(weather.feels_like)}°C
                    </p>
                    <p className="text-sm capitalize">{weather.weather_description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Wind className="h-4 w-4" />
                      <span>{weather.wind_speed} m/s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="h-4 w-4" />
                      <span>{weather.wind_direction}°</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="h-4 w-4" />
                      <span>{weather.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{(weather.visibility / 1000).toFixed(1)} km</span>
                    </div>
                    {weather.wave_height && (
                      <div className="flex items-center gap-1 col-span-2">
                        <Waves className="h-4 w-4" />
                        <span>{weather.wave_height}m</span>
                        {weather.sea_state && (
                          <Badge className={getSeaStateColor(weather.sea_state)} variant="outline">
                            {weather.sea_state}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fetch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Dados Meteorológicos</CardTitle>
              <CardDescription>
                Obtenha dados atualizados do OpenWeather API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar Embarcação</Label>
                <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma embarcação" />
                  </SelectTrigger>
                  <SelectContent>
                    {vessels.map((vessel) => (
                      <SelectItem key={vessel.id} value={vessel.id}>
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4" />
                          {vessel.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground">OU</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-2">
                <Label>Localização Personalizada</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ex: Rio de Janeiro, Santos, Rotterdam"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleFetchWeather}
                disabled={loading || (!selectedVessel && !customLocation)}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Cloud className="mr-2 h-4 w-4" />
                    Buscar Dados Meteorológicos
                  </>
                )}
              </Button>

              {!apiKey && (
                <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>API Key não configurada:</strong> Configure a variável VITE_OPENWEATHER_API_KEY
                    no arquivo .env para habilitar a busca de dados meteorológicos.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Observações</CardTitle>
              <CardDescription>
                Últimas 10 leituras meteorológicas registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weatherData.map((weather) => (
                  <div key={weather.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-accent transition-colors">
                    <div className="flex items-center gap-4">
                      {getWeatherIcon(weather.weather_main)}
                      <div>
                        <p className="font-semibold">{weather.location_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(weather.observation_time), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <ThermometerSun className="h-4 w-4 mx-auto mb-1" />
                        <p className="font-semibold">{Math.round(weather.temperature)}°C</p>
                      </div>
                      <div className="text-center">
                        <Wind className="h-4 w-4 mx-auto mb-1" />
                        <p className="font-semibold">{weather.wind_speed} m/s</p>
                      </div>
                      <div className="text-center">
                        <Droplets className="h-4 w-4 mx-auto mb-1" />
                        <p className="font-semibold">{weather.humidity}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
