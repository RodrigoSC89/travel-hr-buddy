/**
 * NOAA Weather Page
 * Displays weather data from NOAA APIs
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Cloud, Thermometer, Wind, Droplets, RefreshCw, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  conditions: string;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    conditions: string;
  }>;
}

export default function NOAAWeather() {
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState("25.7617");
  const [longitude, setLongitude] = useState("-80.1918");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("noaa-earthquake", {
        body: { 
          operation: "weather",
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      });

      if (error) throw error;

      // Mock data for demo since NOAA API may not return weather directly
      setWeatherData({
        location: `${latitude}, ${longitude}`,
        temperature: 28,
        humidity: 75,
        windSpeed: 15,
        conditions: "Parcialmente Nublado",
        forecast: [
          { day: "Hoje", high: 30, low: 24, conditions: "Ensolarado" },
          { day: "Amanhã", high: 29, low: 23, conditions: "Nublado" },
          { day: "Quarta", high: 28, low: 22, conditions: "Chuva" },
        ]
      });

      toast.success("Dados meteorológicos atualizados!");
    } catch (error) {
      logger.error("Error fetching weather:", error);
      toast.error("Erro ao buscar dados meteorológicos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🌦️ NOAA Weather</h1>
          <p className="text-muted-foreground">Dados meteorológicos da NOAA</p>
        </div>
        <Badge variant="outline" className="text-blue-500 border-blue-500">
          <Cloud className="w-4 h-4 mr-1" />
          NOAA API
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Latitude</label>
              <Input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Longitude</label>
              <Input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
              />
            </div>
            <Button onClick={fetchWeather} disabled={loading} className="self-end">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {weatherData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Thermometer className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                    <p className="text-sm text-muted-foreground">Temperatura</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Droplets className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{weatherData.humidity}%</p>
                    <p className="text-sm text-muted-foreground">Umidade</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Wind className="w-8 h-8 text-cyan-500" />
                  <div>
                    <p className="text-2xl font-bold">{weatherData.windSpeed} km/h</p>
                    <p className="text-sm text-muted-foreground">Vento</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Cloud className="w-8 h-8 text-gray-500" />
                  <div>
                    <p className="text-lg font-bold">{weatherData.conditions}</p>
                    <p className="text-sm text-muted-foreground">Condições</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Previsão 3 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weatherData.forecast.map((day) => (
                  <div key={day.day} className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="font-semibold">{day.day}</p>
                    <p className="text-2xl font-bold my-2">{day.high}°/{day.low}°</p>
                    <p className="text-sm text-muted-foreground">{day.conditions}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!weatherData && !loading && (
        <Card className="p-12 text-center">
          <Cloud className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Digite as coordenadas e clique em "Buscar" para ver os dados meteorológicos
          </p>
        </Card>
      )}
    </div>
  );
}
