import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Cloud,
  Wind,
  Waves,
  Eye,
  Gauge,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  Activity,
  MapPin,
  RefreshCw,
  TrendingUp,
  Navigation,
  Droplets,
  Zap,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { 
  MaritimeWeatherData, 
  WeatherAlert, 
  OperabilityIndex,
  GeoLocation 
} from '@/types/weather';

interface WeatherCommandCenterProps {
  vesselId?: string;
  location?: GeoLocation;
}

export const WeatherCommandCenter: React.FC<WeatherCommandCenterProps> = ({ 
  vesselId, 
  location 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [operabilityIndex, setOperabilityIndex] = useState<OperabilityIndex | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Default location (Santos, Brazil) if not provided
      const lat = location?.lat || -23.9608;
      const lon = location?.lon || -46.3333;

      const { data, error } = await supabase.functions.invoke('windy-integration', {
        body: {
          latitude: lat,
          longitude: lon,
          vessel_id: vesselId,
          include_forecast: true
        }
      });

      if (error) throw error;

      if (data && data.success) {
        setWeatherData(data.data);
        setAlerts(data.data.alerts || []);
        setOperabilityIndex(data.data.operabilityIndex);
        setLastUpdate(new Date());
        
        toast({
          title: "Dados meteorológicos atualizados",
          description: "Informações do Windy carregadas com sucesso",
        });
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar os dados meteorológicos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    
    // Auto-refresh every 15 minutes
    const interval = setInterval(fetchWeatherData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [vesselId, location]);

  const getOperabilityColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'marginal': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!weatherData && loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Carregando dados meteorológicos...</p>
        </CardContent>
      </Card>
    );
  }

  const current = weatherData?.current;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Cloud className="h-8 w-8 text-blue-600" />
            Weather Command Center
          </h2>
          <p className="text-muted-foreground mt-1">
            Sistema Meteorológico Integrado Windy + Multi-fontes
          </p>
        </div>
        <Button onClick={fetchWeatherData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Operability Status */}
      {operabilityIndex && (
        <Card className={`border-2 ${getOperabilityColor(operabilityIndex.status)}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Índice de Operabilidade
              </span>
              <Badge variant="outline" className="text-lg px-4 py-1">
                {operabilityIndex.overall}%
              </Badge>
            </CardTitle>
            <CardDescription>
              Status: <strong className="uppercase">{operabilityIndex.status}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Vento</p>
                <p className="text-2xl font-bold">{operabilityIndex.factors.wind}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ondas</p>
                <p className="text-2xl font-bold">{operabilityIndex.factors.waves}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visibilidade</p>
                <p className="text-2xl font-bold">{operabilityIndex.factors.visibility}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Corrente</p>
                <p className="text-2xl font-bold">{operabilityIndex.factors.currentSpeed}%</p>
              </div>
            </div>
            {operabilityIndex.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="font-semibold text-sm">Recomendações:</p>
                {operabilityIndex.recommendations.map((rec, idx) => (
                  <p key={idx} className="text-sm flex items-start gap-2">
                    <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {rec}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertas Meteorológicos ({alerts.length})
          </h3>
          {alerts.map((alert, idx) => (
            <Alert key={idx} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>
                <p className="mb-2">{alert.description}</p>
                <p className="text-sm font-medium">
                  <strong>Recomendação:</strong> {alert.recommendation}
                </p>
                {alert.affectedOperations && alert.affectedOperations.length > 0 && (
                  <p className="text-xs mt-2 text-muted-foreground">
                    Operações afetadas: {alert.affectedOperations.join(', ')}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Current Conditions */}
      {current && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Condições Atuais
            </CardTitle>
            <CardDescription>
              {weatherData.location.name} • Atualizado: {lastUpdate?.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wind className="h-4 w-4" />
                  <span className="text-sm">Vento</span>
                </div>
                <p className="text-2xl font-bold">{current.windSpeed.toFixed(1)} <span className="text-sm font-normal">nós</span></p>
                <p className="text-sm text-muted-foreground">{current.windDirection}°</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Waves className="h-4 w-4" />
                  <span className="text-sm">Ondas</span>
                </div>
                <p className="text-2xl font-bold">{current.waveHeight.toFixed(1)} <span className="text-sm font-normal">m</span></p>
                <p className="text-sm text-muted-foreground">{current.wavePeriod.toFixed(1)}s período</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">Visibilidade</span>
                </div>
                <p className="text-2xl font-bold">{current.visibility.toFixed(1)} <span className="text-sm font-normal">NM</span></p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Gauge className="h-4 w-4" />
                  <span className="text-sm">Pressão</span>
                </div>
                <p className="text-2xl font-bold">{current.barometricPressure} <span className="text-sm font-normal">hPa</span></p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Thermometer className="h-4 w-4" />
                  <span className="text-sm">Temperatura Ar</span>
                </div>
                <p className="text-2xl font-bold">{current.temperature.toFixed(1)} <span className="text-sm font-normal">°C</span></p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Thermometer className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Temperatura Mar</span>
                </div>
                <p className="text-2xl font-bold">{current.seaTemperature.toFixed(1)} <span className="text-sm font-normal">°C</span></p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cloud className="h-4 w-4" />
                  <span className="text-sm">Nuvens</span>
                </div>
                <p className="text-2xl font-bold">{current.cloudCover} <span className="text-sm font-normal">%</span></p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplets className="h-4 w-4" />
                  <span className="text-sm">Precipitação</span>
                </div>
                <p className="text-2xl font-bold">{current.precipitationRate.toFixed(1)} <span className="text-sm font-normal">mm/h</span></p>
              </div>
            </div>

            {current.swellHeight > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Dados de Swell</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Altura</p>
                    <p className="text-lg font-bold">{current.swellHeight.toFixed(1)} m</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Período</p>
                    <p className="text-lg font-bold">{current.swellPeriod.toFixed(1)} s</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Direção</p>
                    <p className="text-lg font-bold">{current.swellDirection}°</p>
                  </div>
                </div>
              </div>
            )}

            {current.thunderstormProbability > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">Risco de Tempestade</p>
                  <p className="text-sm text-yellow-700">
                    Probabilidade: {current.thunderstormProbability}%
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Forecast */}
      {weatherData?.forecast && weatherData.forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Previsão Estendida (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weatherData.forecast.slice(0, 8).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Wind className="h-4 w-4 text-muted-foreground" />
                      <span>{item.weather.windSpeed.toFixed(0)} nós</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Waves className="h-4 w-4 text-muted-foreground" />
                      <span>{item.weather.waveHeight.toFixed(1)} m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span>{item.weather.temperature.toFixed(0)}°C</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Windy Map Embed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Mapa Windy Interativo
          </CardTitle>
          <CardDescription>
            Visualização em tempo real das condições meteorológicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://embed.windy.com/embed2.html?lat=${location?.lat || -23.96}&lon=${location?.lon || -46.33}&detailLat=${location?.lat || -23.96}&detailLon=${location?.lon || -46.33}&width=650&height=450&zoom=8&level=surface&overlay=wind&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=kt&metricTemp=%C2%B0C&radarRange=-1`}
              frameBorder="0"
              title="Windy Map"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Dados fornecidos por Windy.com - Clique no mapa para interagir
          </p>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Fontes de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              Windy.com
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              OpenWeather
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-blue-600" />
              Multi-source Validation
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherCommandCenter;
