/**
 * Weather Command - Windy Style Complete Page
 * PATCH WINDY-1.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Heart, RefreshCw, Loader2 } from "lucide-react";
import { WeatherMapWind } from "./WeatherMapWind";
import { DailyForecastStrip } from "./DailyForecastStrip";
import { HourlyForecastTable } from "./HourlyForecastTable";
import { WeatherFooterControls } from "./WeatherFooterControls";
import { WeatherChat } from "./WeatherChat";
import { CitySearch } from "./CitySearch";
import type { WeatherLocation, CurrentWeather, DailyForecast, HourlyForecast, MarineData, ForecastModel, DisplayMode, ForecastRange } from "./types";

const DEFAULT_LOCATION: WeatherLocation = {
  id: "rio",
  name: "Rio de Janeiro",
  lat: -22.9068,
  lon: -43.1729
};

// Generate mock data for demo
const generateMockData = (location: WeatherLocation) => {
  const baseTemp = 25 + Math.random() * 5;
  
  const current: CurrentWeather = {
    temperature: baseTemp,
    feelsLike: baseTemp - 1,
    humidity: 65 + Math.random() * 20,
    pressure: 1013,
    visibility: 10,
    uvIndex: 6,
    cloudCoverage: 30,
    condition: "Partly Cloudy",
    description: "Parcialmente nublado",
    icon: "02d",
    wind: { speed: 12, gust: 18, direction: 225 },
    sunrise: "05:45",
    sunset: "18:30"
  };

  const daily: DailyForecast[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    return {
      date: date.toISOString().split('T')[0],
      dayOfWeek: days[date.getDay()],
      tempMin: baseTemp - 4 + Math.random() * 2,
      tempMax: baseTemp + 2 + Math.random() * 3,
      condition: ["Clear", "Partly Cloudy", "Cloudy", "Rain"][Math.floor(Math.random() * 4)],
      description: ["Ensolarado", "Parcialmente nublado", "Nublado", "Chuva"][Math.floor(Math.random() * 4)],
      icon: "02d",
      humidity: 60 + Math.random() * 30,
      windSpeed: 8 + Math.random() * 12,
      rainProbability: Math.random() * 60
    };
  });

  const hourly: HourlyForecast[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    time: `${i.toString().padStart(2, '0')}:00`,
    temperature: baseTemp + Math.sin(i / 4) * 4,
    rain: Math.random() > 0.7 ? Math.random() * 2 : 0,
    windSpeed: 5 + Math.random() * 10,
    windGust: 10 + Math.random() * 15,
    windDirection: 180 + Math.random() * 90,
    humidity: 60 + Math.random() * 30,
    icon: i >= 6 && i <= 18 ? "02d" : "02n",
    condition: "Partly Cloudy"
  }));

  const marine: MarineData = {
    waveHeight: 1.2 + Math.random(),
    wavePeriod: 8 + Math.random() * 4,
    waveDirection: 180,
    swellHeight: 0.8,
    waterTemperature: 24,
    tideLevel: 120,
    tideType: 'rising',
    nextTide: { time: "14:30", type: 'high', level: 180 }
  };

  return { current, daily, hourly, marine };
};

export const WindyWeatherPage: React.FC = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<WeatherLocation>(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [marine, setMarine] = useState<MarineData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [favorites, setFavorites] = useState<WeatherLocation[]>([]);
  const [recentSearches, setRecentSearches] = useState<WeatherLocation[]>([]);

  // Settings
  const [forecastRange, setForecastRange] = useState<ForecastRange>('3h');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('basic');
  const [forecastModel, setForecastModel] = useState<ForecastModel>('ECMWF');

  const fetchWeather = useCallback(async (loc: WeatherLocation) => {
    setIsLoading(true);
    try {
      // Use mock data for now - can be replaced with real API calls
      const data = generateMockData(loc);
      setWeather(data.current);
      setDailyForecast(data.daily);
      setHourlyForecast(data.hourly);
      setMarine(data.marine);
      
      toast({
        title: "Dados atualizados",
        description: `Clima carregado para ${loc.name}`,
      });
    } catch (err) {
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWeather(location);
  }, []);

  const handleSelectLocation = (loc: WeatherLocation) => {
    setLocation(loc);
    setRecentSearches(prev => [loc, ...prev.filter(l => l.id !== loc.id)].slice(0, 10));
    fetchWeather(loc);
  };

  const handleToggleFavorite = (loc: WeatherLocation) => {
    setFavorites(prev => 
      prev.some(f => f.id === loc.id)
        ? prev.filter(f => f.id !== loc.id)
        : [...prev, { ...loc, isFavorite: true }].slice(0, 5)
    );
  };

  const getDayLabel = () => {
    if (selectedDay === 0) return `HOJE - ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' }).toUpperCase()}`;
    const date = new Date();
    date.setDate(date.getDate() + selectedDay);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-900/80 border-b border-white/10 flex items-center gap-4">
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

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="text-white/70 border-white/20">
                {forecastModel}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchWeather(location)}
                disabled={isLoading}
                className="border-white/20 text-white"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">Atualizar</span>
              </Button>
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

          {/* Map */}
          <WeatherMapWind
            location={location}
            weather={weather}
            layer="wind"
            className="flex-shrink-0"
          />

          {/* Daily Forecast Strip */}
          <DailyForecastStrip
            forecasts={dailyForecast}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

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
            onShare={() => toast({ title: "Link copiado!" })}
          />
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 flex-shrink-0">
            <WeatherChat
              location={location}
              weather={weather}
              forecast={dailyForecast}
              marine={marine}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WindyWeatherPage;
