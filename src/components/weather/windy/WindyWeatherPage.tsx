/**
 * Weather Command - Windy Style Complete Page
 * PATCH WINDY-2.4: IntegrationGuard + P2 Compliance
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Heart, 
  RefreshCw, 
  Loader2, 
  Settings, 
  AlertTriangle,
  Waves,
  Wind,
  Droplets,
  BarChart3,
  CloudRain,
  MapPin,
  TrendingUp,
  Bell,
  Download,
  Share2,
  Navigation,
  Anchor,
  History
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WeatherMapWind } from "./WeatherMapWind";
import { DailyForecastStrip } from "./DailyForecastStrip";
import { HourlyForecastTable } from "./HourlyForecastTable";
import { WeatherFooterControls } from "./WeatherFooterControls";
import { WeatherChat } from "./WeatherChat";
import { CitySearch } from "./CitySearch";
import { WeatherAlertSettings } from "./WeatherAlertSettings";
import { CityComparison } from "./CityComparison";
import { RainRadarMap } from "./RainRadarMap";
import { WeatherTrendCharts } from "./WeatherTrendCharts";
import { CityAlertManager } from "./CityAlertManager";
import { AlertHistoryTimeline } from "./AlertHistoryTimeline";
import { WeatherRoutingPanel } from "./WeatherRoutingPanel";
import { BrazilianSourcesPanel } from "./BrazilianSourcesPanel";
import { WindyMapPlugin } from "@/components/maps/WindyMapPlugin";
import { useOpenMeteoWeather } from "@/hooks/useOpenMeteoWeather";
import { downloadWeatherComparisonPDF, shareWeatherComparison } from "@/lib/pdf/weather-comparison-pdf";
import { openMeteoService } from "@/services/weather/open-meteo.service";
import { useWeatherIntegrationStatus } from "@/hooks/useWeatherIntegrationStatus";
import { IntegrationStatusBadge, IntegrationGuard } from "@/components/ui/IntegrationStatusBadge";
import type { WeatherLocation, ForecastModel, DisplayMode, ForecastRange, CurrentWeather, DailyForecast } from "./types";
import { logger } from '@/lib/logger';

// Popular Brazilian cities for alerts
const POPULAR_CITIES: WeatherLocation[] = [
  { id: "santos", name: "Santos, SP", lat: -23.9608, lon: -46.3335 },
  { id: "rio", name: "Rio de Janeiro, RJ", lat: -22.9068, lon: -43.1729 },
  { id: "sp", name: "São Paulo, SP", lat: -23.5505, lon: -46.6333 },
  { id: "macae", name: "Macaé, RJ", lat: -22.3708, lon: -41.7869 },
  { id: "vitoria", name: "Vitória, ES", lat: -20.3155, lon: -40.3128 },
  { id: "salvador", name: "Salvador, BA", lat: -12.9714, lon: -38.5014 },
  { id: "recife", name: "Recife, PE", lat: -8.0476, lon: -34.8770 },
  { id: "fortaleza", name: "Fortaleza, CE", lat: -3.7319, lon: -38.5267 },
];

const DEFAULT_LOCATION: WeatherLocation = {
  id: "rio",
  name: "Rio de Janeiro",
  lat: -22.9068,
  lon: -43.1729
};

export const WindyWeatherPage: React.FC = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<WeatherLocation>(DEFAULT_LOCATION);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [favorites, setFavorites] = useState<WeatherLocation[]>([]);
  const [recentSearches, setRecentSearches] = useState<WeatherLocation[]>([]);
  
  // New features state
  const [activeTab, setActiveTab] = useState<string>("forecast");
  const [comparisonCities, setComparisonCities] = useState<WeatherLocation[]>([]);
  const [isAddCityDialogOpen, setIsAddCityDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [comparisonData, setComparisonData] = useState<Map<string, { current: CurrentWeather | null; daily: DailyForecast[] }>>(new Map());

  // Settings
  const [forecastRange, setForecastRange] = useState<ForecastRange>('3h');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('basic');
  const [forecastModel, setForecastModel] = useState<ForecastModel>('ECMWF');

  // ✅ P2: Integration Status Guard
  const { data: integrationStatus, isLoading: isCheckingIntegration } = useWeatherIntegrationStatus();

  // Use Open-Meteo hook for REAL data
  const {
    currentWeather,
    hourlyForecast,
    dailyForecast,
    marineData,
    airQuality,
    isLoading,
    error,
    lastUpdated,
    dataSource,
    activeAlerts,
    refresh,
    refreshMarine,
    refreshAirQuality
  } = useOpenMeteoWeather({
    lat: location.lat,
    lon: location.lon,
    locationName: location.name,
    autoRefresh: true,
    refreshInterval: 600000, // 10 minutes
    enableAlerts: true
  });

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('weather_favorites');
      if (saved) setFavorites(JSON.parse(saved));
      
      const savedRecent = localStorage.getItem('weather_recent');
      if (savedRecent) setRecentSearches(JSON.parse(savedRecent));
    } catch (e) {
      logger.error('Failed to load saved locations:', e);
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('weather_recent', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Fetch comparison data when cities change
  useEffect(() => {
    const fetchComparisonData = async () => {
      const newData = new Map<string, { current: CurrentWeather | null; daily: DailyForecast[] }>();
      
      for (const city of comparisonCities) {
        try {
          const weatherData = await openMeteoService.getWeatherData(city.lat, city.lon);
          
          const current: CurrentWeather | null = weatherData.current ? {
            temperature: weatherData.current.temperature_2m,
            feelsLike: weatherData.current.apparent_temperature,
            humidity: weatherData.current.relative_humidity_2m,
            pressure: weatherData.current.pressure_msl,
            visibility: (weatherData.current.visibility || 10000) / 1000,
            uvIndex: weatherData.current.uv_index || 0,
            cloudCoverage: weatherData.current.cloud_cover,
            condition: 'Clear',
            description: 'Céu limpo',
            icon: '☀️',
            wind: {
              speed: weatherData.current.wind_speed_10m,
              gust: weatherData.current.wind_gusts_10m,
              direction: weatherData.current.wind_direction_10m
            },
            sunrise: weatherData.daily?.sunrise?.[0]?.split('T')[1] || '06:00',
            sunset: weatherData.daily?.sunset?.[0]?.split('T')[1] || '18:00'
          } : null;
          
          const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
          const daily: DailyForecast[] = weatherData.daily?.time?.slice(0, 7).map((date: string, i: number) => ({
            date,
            dayOfWeek: days[new Date(date).getDay()],
            tempMin: weatherData.daily!.temperature_2m_min[i],
            tempMax: weatherData.daily!.temperature_2m_max[i],
            condition: 'Clear',
            description: 'Céu limpo',
            icon: '☀️',
            humidity: 0,
            windSpeed: weatherData.daily!.wind_speed_10m_max[i],
            rainProbability: weatherData.daily!.precipitation_probability_max?.[i] || 0
          })) || [];
          
          newData.set(city.id, { current, daily });
        } catch (err) {
          logger.error(`Failed to fetch data for ${city.name}:`, err);
        }
      }
      
      setComparisonData(newData);
    };
    
    if (comparisonCities.length > 0) {
      fetchComparisonData();
    }
  }, [comparisonCities]);

  const handleSelectLocation = (loc: WeatherLocation) => {
    setLocation(loc);
    setRecentSearches(prev => [loc, ...prev.filter(l => l.id !== loc.id)].slice(0, 10));
  };

  const handleToggleFavorite = (loc: WeatherLocation) => {
    setFavorites(prev => 
      prev.some(f => f.id === loc.id)
        ? prev.filter(f => f.id !== loc.id)
        : [...prev, { ...loc, isFavorite: true }].slice(0, 5)
    );
  };

  const handleRefresh = async () => {
    await Promise.all([refresh(), refreshMarine(), refreshAirQuality()]);
    toast({
      title: "Dados atualizados",
      description: `Clima de ${location.name} atualizado via ${dataSource}`,
    });
  };

  const getDayLabel = () => {
    if (selectedDay === 0) return `HOJE - ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' }).toUpperCase()}`;
    const date = new Date();
    date.setDate(date.getDate() + selectedDay);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' }).toUpperCase();
  };

  // City comparison handlers
  const handleAddCityToComparison = (city: WeatherLocation) => {
    if (comparisonCities.length < 4 && !comparisonCities.some(c => c.id === city.id)) {
      setComparisonCities(prev => [...prev, city]);
    }
    setIsAddCityDialogOpen(false);
  };

  const handleRemoveCityFromComparison = (cityId: string) => {
    setComparisonCities(prev => prev.filter(c => c.id !== cityId));
  };

  // Export PDF handler
  const handleExportPDF = async () => {
    if (comparisonCities.length === 0) {
      toast({
        title: "Nenhuma cidade para exportar",
        description: "Adicione cidades para comparação primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      const citiesData = comparisonCities.map(city => {
        const data = comparisonData.get(city.id);
        return {
          location: city,
          current: data?.current || null,
          daily: data?.daily || []
        };
      });

      await downloadWeatherComparisonPDF(citiesData, undefined, {
        title: 'Comparação Meteorológica - Nautilus'
      });

      toast({
        title: "PDF exportado!",
        description: "O relatório foi baixado com sucesso"
      });
    } catch (err) {
      logger.error('PDF export failed:', err);
      toast({
        title: "Erro ao exportar",
        description: "Falha ao gerar o PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Share handler
  const handleShare = async () => {
    if (comparisonCities.length === 0) {
      toast({
        title: "Nenhuma cidade para compartilhar",
        description: "Adicione cidades para comparação primeiro",
        variant: "destructive"
      });
      return;
    }

    const citiesData = comparisonCities.map(city => {
      const data = comparisonData.get(city.id);
      return {
        location: city,
        current: data?.current || null,
        daily: data?.daily || []
      };
    });

    const success = await shareWeatherComparison(citiesData);
    if (success) {
      toast({
        title: "Compartilhado!",
        description: "Dados copiados para a área de transferência"
      });
    }
  };

  // Show error toast if API fails
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // ✅ P2: IntegrationGuard - bloqueia UI se não configurado
  if (isCheckingIntegration) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando integrações meteorológicas...</p>
        </div>
      </div>
    );
  }

  return (
    <IntegrationGuard
      status={integrationStatus?.status ?? "DEGRADED"}
      integrationName="Weather APIs"
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-lg">
            <AlertTriangle className="h-16 w-16 mx-auto text-warning" />
            <h2 className="text-2xl font-bold">APIs Meteorológicas Não Configuradas</h2>
            <p className="text-muted-foreground">
              Configure pelo menos uma fonte de dados meteorológicos para visualizar previsões reais.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {integrationStatus?.sources && Object.entries(integrationStatus.sources).map(([key, value]) => (
                <Badge key={key} variant={value ? "default" : "outline"} className={value ? "bg-success" : ""}>
                  {key}: {value ? "✓" : "✗"}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      }
    >
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with Integration Status */}
          <div className="p-4 bg-muted/80 border-b border-border flex items-center gap-4 flex-wrap">
            {integrationStatus && (
              <IntegrationStatusBadge 
                status={integrationStatus.status} 
                integrationName="Weather" 
                size="sm"
              />
            )}
            <CitySearch
              onSelectLocation={handleSelectLocation}
              favorites={favorites}
              recentSearches={recentSearches}
              onToggleFavorite={handleToggleFavorite}
              className="w-80"
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleFavorite(location)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Heart className={favorites.some(f => f.id === location.id) ? "fill-destructive text-destructive" : ""} />
            </Button>

            {/* Data source badge */}
            <Badge variant="outline" className="text-success border-success/50">
              {dataSource}
            </Badge>

            {/* Active alerts indicator */}
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {activeAlerts.length} Alerta{activeAlerts.length > 1 ? 's' : ''}
              </Badge>
            )}

            <div className="ml-auto flex items-center gap-2">
              {/* Marine data indicator */}
              {marineData && (
                <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
                  <Waves className="h-3 w-3 mr-1" />
                  {marineData.waveHeight.toFixed(1)}m
                </Badge>
              )}

              {/* Air quality indicator */}
              {airQuality && (
                <Badge variant="outline" className={
                  airQuality.aqi <= 40 ? "text-green-400 border-green-400/50" :
                  airQuality.aqi <= 80 ? "text-yellow-400 border-yellow-400/50" :
                  "text-red-400 border-red-400/50"
                }>
                  <Droplets className="h-3 w-3 mr-1" />
                  AQI {airQuality.aqi}
                </Badge>
              )}

              <Badge variant="outline" className="text-white/70 border-white/20">
                {forecastModel}
              </Badge>

              {/* Last updated */}
              {lastUpdated && (
                <span className="text-xs text-white/40">
                  {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-white/20 text-white"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Atualizar</span>
              </Button>

              {/* Settings Sheet */}
              <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-slate-900 border-white/10 w-full sm:max-w-lg overflow-y-auto">
                  <WeatherAlertSettings onClose={() => setIsSettingsOpen(false)} />
                </SheetContent>
              </Sheet>

              <Button
                variant={isChatOpen ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  logger.debug('[WeatherChat] Toggle chat:', { open: !isChatOpen });
                  setIsChatOpen(!isChatOpen);
                }}
                className={`transition-all duration-200 ${isChatOpen ? "bg-primary ring-2 ring-primary/50" : "border-white/20 text-white hover:bg-white/10"}`}
              >
                <MessageSquare className={`h-4 w-4 mr-2 ${isChatOpen ? "animate-pulse" : ""}`} />
                {isChatOpen ? "Fechar Chat" : "Chat IA"}
              </Button>
            </div>
          </div>

          {/* Active Alerts Banner */}
          {activeAlerts.length > 0 && (
            <div className="bg-red-900/50 border-b border-red-500/30 px-4 py-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                {activeAlerts.map((alert) => (
                  <Badge key={alert.title} variant="destructive" className="flex-shrink-0">
                    {alert.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="bg-slate-800/50 border-b border-white/10 rounded-none justify-start px-4 h-12 shrink-0 overflow-x-auto">
              <TabsTrigger 
                value="forecast" 
                className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-white/70"
              >
                <Wind className="h-4 w-4 mr-2" />
                Previsão
              </TabsTrigger>
              <TabsTrigger 
                value="windy" 
                className="data-[state=active]:bg-info/20 data-[state=active]:text-info text-foreground/70"
              >
                <Waves className="h-4 w-4 mr-2" />
                Mapa Windy
              </TabsTrigger>
              <TabsTrigger 
                value="routing" 
                className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-white/70"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Rotas
              </TabsTrigger>
              <TabsTrigger 
                value="brazil" 
                className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 text-white/70"
              >
                <Anchor className="h-4 w-4 mr-2" />
                Fontes BR
              </TabsTrigger>
              <TabsTrigger 
                value="trends" 
                className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-white/70"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Tendências
              </TabsTrigger>
              <TabsTrigger 
                value="radar" 
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-white/70"
              >
                <CloudRain className="h-4 w-4 mr-2" />
                Radar
              </TabsTrigger>
              <TabsTrigger 
                value="compare" 
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/70"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparar
              </TabsTrigger>
              <TabsTrigger 
                value="alerts" 
                className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-white/70"
              >
                <Bell className="h-4 w-4 mr-2" />
                Alertas
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-slate-500/20 data-[state=active]:text-slate-300 text-white/70"
              >
                <History className="h-4 w-4 mr-2" />
                Histórico
              </TabsTrigger>
            </TabsList>

            {/* Forecast Tab */}
            <TabsContent value="forecast" className="flex-1 flex flex-col overflow-hidden m-0">
              {/* Map */}
              <WeatherMapWind
                location={location}
                weather={currentWeather}
                layer="wind"
                className="flex-shrink-0"
              />

              {/* Daily Forecast Strip */}
              <DailyForecastStrip
                forecasts={dailyForecast}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
              />

              {/* Marine Data Row */}
              {marineData && (
                <div className="bg-slate-900/80 border-b border-white/10 px-4 py-2">
                  <div className="flex items-center gap-4 text-sm overflow-x-auto">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Waves className="h-4 w-4" />
                      <span>Ondas: {marineData.waveHeight.toFixed(1)}m</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400">
                      <span>Período: {marineData.wavePeriod.toFixed(0)}s</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400">
                      <span>Swell: {marineData.swellHeight.toFixed(1)}m</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <span>Água: {marineData.waterTemperature}°C</span>
                    </div>
                    {currentWeather && (
                      <div className="flex items-center gap-2 text-yellow-400 ml-auto">
                        <Wind className="h-4 w-4" />
                        <span>Vento: {Math.round(currentWeather.wind.speed)} km/h</span>
                        {currentWeather.wind.gust > currentWeather.wind.speed && (
                          <span className="text-orange-400">(raj. {Math.round(currentWeather.wind.gust)})</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hourly Table */}
              <div className="flex-1 overflow-auto">
                <HourlyForecastTable
                  forecasts={hourlyForecast}
                  selectedDay={selectedDay}
                  dayLabel={getDayLabel()}
                />
              </div>
            </TabsContent>

            {/* Windy Map Tab - Official Windy Plugin */}
            <TabsContent 
              value="windy" 
              className="flex-1 m-0 p-0"
              forceMount
              style={{ display: activeTab === 'windy' ? 'flex' : 'none', flexDirection: 'column' }}
            >
              <WindyMapPlugin
                latitude={location.lat}
                longitude={location.lon}
                zoom={6}
                height="calc(100vh - 180px)"
                showControls={true}
                overlay="wind"
                className="h-full flex-1"
              />
            </TabsContent>

            {/* Maritime Routing Tab */}
            <TabsContent value="routing" className="m-0 p-2 sm:p-4 pb-8">
              <WeatherRoutingPanel />
            </TabsContent>

            {/* Brazilian Sources Tab */}
            <TabsContent value="brazil" className="m-0 p-2 sm:p-4 pb-8">
              <BrazilianSourcesPanel />
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="m-0 p-2 sm:p-4 pb-8">
              <WeatherTrendCharts 
                dailyForecast={dailyForecast}
                hourlyForecast={hourlyForecast}
              />
            </TabsContent>

            {/* Rain Radar Tab */}
            <TabsContent value="radar" className="m-0 p-2 sm:p-4 pb-8">
              <RainRadarMap location={location} />
            </TabsContent>

            {/* Compare Tab */}
            <TabsContent value="compare" className="m-0 p-2 sm:p-4 pb-8">
              <div className="space-y-4">
                {/* Export Actions */}
                {comparisonCities.length > 0 && (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleExportPDF}
                      disabled={isExporting}
                      className="bg-primary hover:bg-primary/80"
                    >
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Exportar PDF
                    </Button>
                  </div>
                )}
                
                <CityComparison
                  cities={comparisonCities}
                  onRemoveCity={handleRemoveCityFromComparison}
                  onAddCity={() => setIsAddCityDialogOpen(true)}
                  maxCities={4}
                />
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="m-0 p-2 sm:p-4 pb-8">
              <CityAlertManager 
                cities={POPULAR_CITIES}
                onAddCity={() => setIsAddCityDialogOpen(true)}
              />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="m-0 p-2 sm:p-4 pb-8">
              <AlertHistoryTimeline />
            </TabsContent>
          </Tabs>

          {/* Footer Controls */}
          <WeatherFooterControls
            forecastRange={forecastRange}
            onForecastRangeChange={setForecastRange}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            forecastModel={forecastModel}
            onForecastModelChange={setForecastModel}
            onShare={() => {
              navigator.clipboard.writeText(window.location.href);
              toast({ title: "Link copiado!" });
            }}
          />
        </div>

        {/* Chat Sidebar - Desktop */}
        {isChatOpen && (
          <div className="w-80 flex-shrink-0 hidden md:flex animate-in slide-in-from-right-5 duration-300">
            <WeatherChat
              location={location}
              weather={currentWeather}
              forecast={dailyForecast}
              marine={marineData}
              isOpen={isChatOpen}
              onClose={() => {
                logger.debug('[WeatherChat] Closing desktop chat');
                setIsChatOpen(false);
              }}
            />
          </div>
        )}

        {/* Mobile Chat Drawer - Full Screen Overlay */}
        {isChatOpen && (
          <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
              onClick={() => {
                logger.debug('[WeatherChat] Closing mobile chat via overlay');
                setIsChatOpen(false);
              }} 
            />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm animate-in slide-in-from-right duration-300 shadow-2xl">
              <WeatherChat
                location={location}
                weather={currentWeather}
                forecast={dailyForecast}
                marine={marineData}
                isOpen={isChatOpen}
                onClose={() => {
                  logger.debug('[WeatherChat] Closing mobile chat');
                  setIsChatOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Add City Dialog */}
        <Dialog open={isAddCityDialogOpen} onOpenChange={setIsAddCityDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Adicionar Cidade
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <CitySearch
                onSelectLocation={handleAddCityToComparison}
                favorites={favorites}
                recentSearches={recentSearches}
                onToggleFavorite={handleToggleFavorite}
                className="w-full"
              />
              
              {/* Quick add from favorites */}
              {favorites.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-white/50">Favoritos</p>
                  <div className="flex flex-wrap gap-2">
                    {favorites.filter(f => !comparisonCities.some(c => c.id === f.id)).map(fav => (
                      <Button
                        key={fav.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddCityToComparison(fav)}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Heart className="h-3 w-3 mr-1 fill-red-400 text-red-400" />
                        {fav.name.split(',')[0]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Currently comparing */}
              {comparisonCities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-white/50">Comparando ({comparisonCities.length}/4)</p>
                  <div className="flex flex-wrap gap-2">
                    {comparisonCities.map(city => (
                      <Badge
                        key={city.id}
                        variant="secondary"
                        className="bg-primary/20 text-primary"
                      >
                        {city.name.split(',')[0]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </IntegrationGuard>
  );
};

export default WindyWeatherPage;
