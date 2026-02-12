import { useState } from "react";
import { useMarineWeather } from "@/hooks/useMarineWeather";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wind, Waves, Thermometer, Droplets, Eye, Compass, RefreshCw, MapPin, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WeatherMaritime() {
  const [coordinates, setCoordinates] = useState({ lat: -23.55, lng: -46.63 });
  const [inputLat, setInputLat] = useState("-23.55");
  const [inputLng, setInputLng] = useState("-46.63");

  const { data, isLoading, isError, error, refetch, isFetching } = useMarineWeather(
    coordinates.lat,
    coordinates.lng
  );

  const weather = data?.current;

  const handleSearch = () => {
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setCoordinates({ lat, lng });
    }
  };

  const getWindDescription = (speed: number | null) => {
    if (speed === null) return "—";
    if (speed < 5) return "Calmo";
    if (speed < 15) return "Moderado";
    if (speed < 25) return "Forte";
    return "Muito Forte";
  };

  const getWaveDescription = (height: number | null) => {
    if (height === null) return "—";
    if (height < 0.5) return "Calmo";
    if (height < 1.5) return "Moderado";
    if (height < 3) return "Agitado";
    return "Muito Agitado";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            🌊 Clima Marítimo
          </h1>
          <p className="text-muted-foreground">
            Previsão meteorológica marítima em tempo real via Open-Meteo Marine API
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data?.source && (
            <Badge variant="outline" className="text-xs">
              Fonte: {data.source}
            </Badge>
          )}
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Coordinates Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização
          </CardTitle>
          <CardDescription>
            Insira as coordenadas para obter a previsão marítima
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.01"
                value={inputLat}
                onChange={(e) => setInputLat(e.target.value)}
                placeholder="-23.55"
                className="w-32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.01"
                value={inputLng}
                onChange={(e) => setInputLng(e.target.value)}
                placeholder="-46.63"
                className="w-32"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando dados climáticos...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Erro ao carregar dados: {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Weather Data */}
      {weather && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Wave Height */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Altura das Ondas</p>
                  <p className="text-3xl font-bold text-primary">
                    {weather.waveHeight?.toFixed(1) ?? "—"} m
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {getWaveDescription(weather.waveHeight)}
                  </Badge>
                </div>
                <Waves className="h-12 w-12 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          {/* Wind Speed */}
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Velocidade do Vento</p>
                  <p className="text-3xl font-bold text-success">
                    {weather.windSpeed?.toFixed(1) ?? "—"} m/s
                  </p>
                  {weather.windSpeedKnots && (
                    <p className="text-xs text-muted-foreground mt-1">{weather.windSpeedKnots.toFixed(1)} knots</p>
                  )}
                  <Badge variant="outline" className="mt-2">
                    {getWindDescription(weather.windSpeed)}
                  </Badge>
                </div>
                <Wind className="h-12 w-12 text-success/50" />
              </div>
            </CardContent>
          </Card>

          {/* Swell Height */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Swell</p>
                  <p className="text-3xl font-bold text-primary">
                    {weather.swellHeight?.toFixed(1) ?? "—"} m
                  </p>
                  {weather.swellPeriod && (
                    <p className="text-xs text-muted-foreground mt-1">Período: {weather.swellPeriod.toFixed(1)}s</p>
                  )}
                </div>
                <Waves className="h-12 w-12 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          {/* Air Temperature */}
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Temp. Ar</p>
                  <p className="text-3xl font-bold text-warning">
                    {weather.airTemperature?.toFixed(1) ?? "—"} °C
                  </p>
                  {weather.feelsLike && (
                    <p className="text-xs text-muted-foreground mt-1">Sensação: {weather.feelsLike.toFixed(1)}°C</p>
                  )}
                </div>
                <Thermometer className="h-12 w-12 text-warning/50" />
              </div>
            </CardContent>
          </Card>

          {/* Humidity */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Umidade</p>
                  <p className="text-3xl font-bold text-primary">
                    {weather.humidity?.toFixed(0) ?? "—"} %
                  </p>
                </div>
                <Droplets className="h-12 w-12 text-primary/50" />
              </div>
            </CardContent>
          </Card>

          {/* Visibility */}
          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Visibilidade</p>
                  <p className="text-3xl font-bold text-secondary-foreground">
                    {weather.visibility?.toFixed(1) ?? "—"} km
                  </p>
                </div>
                <Eye className="h-12 w-12 text-secondary/50" />
              </div>
            </CardContent>
          </Card>

          {/* Current Speed */}
          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Corrente</p>
                  <p className="text-3xl font-bold text-secondary-foreground">
                    {weather.currentSpeed?.toFixed(2) ?? "—"} m/s
                  </p>
                </div>
                <Compass className="h-12 w-12 text-secondary/50" />
              </div>
            </CardContent>
          </Card>

          {/* Pressure */}
          <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-muted-foreground/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pressão</p>
                  <p className="text-3xl font-bold text-muted-foreground">
                    {weather.pressure?.toFixed(0) ?? "—"} hPa
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cloud Cover */}
          <Card className="bg-gradient-to-br from-muted/30 to-muted/20 border-muted-foreground/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cobertura de Nuvens</p>
                  <p className="text-3xl font-bold text-muted-foreground">
                    {weather.cloudCover?.toFixed(0) ?? "—"} %
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl">☁️</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {data?.alerts && data.alerts.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Alertas Meteorológicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.alerts.map((alert) => (
              <div key={alert.title} className={cn(
                "p-3 rounded-lg border",
                alert.severity === "high" ? "border-destructive/50 bg-destructive/5" : "border-warning/50 bg-warning/5"
              )}>
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Forecast */}
      {data?.forecast && data.forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Previsão (Próximas Horas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {data.forecast.slice(0, 12).map((hour) => (
                <div key={hour.time} className="p-3 rounded-lg border bg-card text-center">
                  <p className="text-xs text-muted-foreground">
                    {new Date(hour.time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-lg font-bold mt-1">
                    {hour.waveHeight?.toFixed(1) ?? "—"}m
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hour.windSpeed?.toFixed(0) ?? "—"} m/s
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hour.temperature?.toFixed(0) ?? "—"}°C
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Update */}
      {weather?.time && (
        <p className="text-center text-sm text-muted-foreground">
          Última atualização: {new Date(weather.time).toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  );
}
