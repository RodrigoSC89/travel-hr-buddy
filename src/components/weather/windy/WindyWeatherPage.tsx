/**
 * Weather Command - Windy Style Complete Page
 * PATCH WINDY-2.0: Integrated real Open-Meteo data
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  X
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { WeatherMapWind } from "./WeatherMapWind";
import { DailyForecastStrip } from "./DailyForecastStrip";
import { HourlyForecastTable } from "./HourlyForecastTable";
import { WeatherFooterControls } from "./WeatherFooterControls";
import { WeatherChat } from "./WeatherChat";
import { CitySearch } from "./CitySearch";
import { WeatherAlertSettings } from "./WeatherAlertSettings";
import { useOpenMeteoWeather } from "@/hooks/useOpenMeteoWeather";
import type { WeatherLocation, ForecastModel, DisplayMode, ForecastRange } from "./types";

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

  // Settings
  const [forecastRange, setForecastRange] = useState<ForecastRange>('3h');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('basic');
  const [forecastModel, setForecastModel] = useState<ForecastModel>('ECMWF');

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
      console.error('Failed to load saved locations:', e);
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('weather_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('weather_recent', JSON.stringify(recentSearches));
  }, [recentSearches]);

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

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-900/80 border-b border-white/10 flex items-center gap-4 flex-wrap">
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
              className="text-white/60 hover:text-white"
            >
              <Heart className={favorites.some(f => f.id === location.id) ? "fill-red-400 text-red-400" : ""} />
            </Button>

            {/* Data source badge */}
            <Badge variant="outline" className="text-green-400 border-green-400/50">
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
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={isChatOpen ? "" : "border-white/20 text-white"}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat IA
              </Button>
            </div>
          </div>

          {/* Active Alerts Banner */}
          {activeAlerts.length > 0 && (
            <div className="bg-red-900/50 border-b border-red-500/30 px-4 py-2">
              <div className="flex items-center gap-2 overflow-x-auto">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                {activeAlerts.map((alert, idx) => (
                  <Badge key={idx} variant="destructive" className="flex-shrink-0">
                    {alert.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

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

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 flex-shrink-0 hidden md:block">
            <WeatherChat
              location={location}
              weather={currentWeather}
              forecast={dailyForecast}
              marine={marineData}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}

        {/* Mobile Chat Drawer */}
        {isChatOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsChatOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm">
              <WeatherChat
                location={location}
                weather={currentWeather}
                forecast={dailyForecast}
                marine={marineData}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WindyWeatherPage;
