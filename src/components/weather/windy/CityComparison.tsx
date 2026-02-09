/**
 * City Comparison Component - Side by Side Weather Forecast
 * PATCH WINDY-2.0
 */

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, Plus, MapPin, Thermometer, Wind, Droplets, 
  CloudRain, ArrowUp, ArrowDown, Sun, Cloud, CloudSun,
  Loader2, RefreshCw
} from "lucide-react";
import type { WeatherLocation, CurrentWeather, DailyForecast, HourlyForecast } from "./types";
import { openMeteoService } from "@/services/weather/open-meteo.service";

interface CityWeatherData {
  location: WeatherLocation;
  current: CurrentWeather | null;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  isLoading: boolean;
  error?: string;
}

interface CityComparisonProps {
  cities: WeatherLocation[];
  onRemoveCity: (cityId: string) => void;
  onAddCity: () => void;
  maxCities?: number;
  className?: string;
}

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();
  if (lower.includes('rain') || lower.includes('chuva')) return CloudRain;
  if (lower.includes('cloud') || lower.includes('nublado')) return Cloud;
  if (lower.includes('partly') || lower.includes('parcialmente')) return CloudSun;
  return Sun;
};

const getWindArrow = (direction: number): string => {
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
  const index = Math.round(direction / 45) % 8;
  return arrows[index];
};

export const CityComparison: React.FC<CityComparisonProps> = ({
  cities,
  onRemoveCity,
  onAddCity,
  maxCities = 4,
  className
}) => {
  const [cityData, setCityData] = useState<Map<string, CityWeatherData>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch weather data for all cities
  useEffect(() => {
    const fetchAllCities = async () => {
      const newData = new Map<string, CityWeatherData>();
      
      for (const city of cities) {
        if (!cityData.has(city.id) || cityData.get(city.id)?.isLoading) {
          newData.set(city.id, {
            location: city,
            current: null,
            daily: [],
            hourly: [],
            isLoading: true
          });
        }
      }
      
      setCityData(prev => new Map([...prev, ...newData]));
      
      // Fetch data for each city
      await Promise.all(cities.map(async (city) => {
        try {
          const [weatherData, marineData] = await Promise.all([
            openMeteoService.getWeatherData(city.lat, city.lon),
            openMeteoService.getMarineData(city.lat, city.lon).catch(() => null)
          ]);
          
          // Transform to our format
          const current = weatherData.current ? {
            temperature: weatherData.current.temperature_2m,
            feelsLike: weatherData.current.apparent_temperature,
            humidity: weatherData.current.relative_humidity_2m,
            pressure: weatherData.current.pressure_msl,
            visibility: (weatherData.current.visibility || 10000) / 1000,
            uvIndex: weatherData.current.uv_index || 0,
            cloudCoverage: weatherData.current.cloud_cover,
            condition: getConditionFromCode(weatherData.current.weather_code),
            description: getDescriptionFromCode(weatherData.current.weather_code),
            icon: getIconFromCode(weatherData.current.weather_code),
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
            condition: getConditionFromCode(weatherData.daily!.weather_code[i]),
            description: getDescriptionFromCode(weatherData.daily!.weather_code[i]),
            icon: getIconFromCode(weatherData.daily!.weather_code[i]),
            humidity: 0,
            windSpeed: weatherData.daily!.wind_speed_10m_max[i],
            rainProbability: weatherData.daily!.precipitation_probability_max?.[i] || 0
          })) || [];
          
          const hourly: HourlyForecast[] = weatherData.hourly?.time?.slice(0, 24).map((time: string, i: number) => ({
            hour: new Date(time).getHours(),
            time: `${new Date(time).getHours().toString().padStart(2, '0')}:00`,
            temperature: weatherData.hourly!.temperature_2m[i],
            rain: weatherData.hourly!.precipitation[i] || 0,
            windSpeed: weatherData.hourly!.wind_speed_10m[i],
            windGust: weatherData.hourly!.wind_gusts_10m[i],
            windDirection: weatherData.hourly!.wind_direction_10m[i],
            humidity: weatherData.hourly!.relative_humidity_2m[i],
            icon: getIconFromCode(weatherData.hourly!.weather_code[i]),
            condition: getConditionFromCode(weatherData.hourly!.weather_code[i])
          })) || [];
          
          setCityData(prev => new Map([...prev, [city.id, {
            location: city,
            current,
            daily,
            hourly,
            isLoading: false
          }]]));
        } catch (err) {
          setCityData(prev => new Map([...prev, [city.id, {
            location: city,
            current: null,
            daily: [],
            hourly: [],
            isLoading: false,
            error: 'Falha ao carregar dados'
          }]]));
        }
      }));
    };
    
    if (cities.length > 0) {
      fetchAllCities();
    }
  }, [cities]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCityData(new Map());
    // Data will re-fetch via useEffect when cityData is cleared
    setIsRefreshing(false);
  };

  return (
    <div className={cn("space-y-4 min-h-[400px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Comparação de Cidades
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-white/70 hover:text-white"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          {cities.length < maxCities && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddCity}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          )}
        </div>
      </div>

      {/* Cities Grid */}
      <div className="mt-4">
        {cities.length === 0 ? (
          <Card className="bg-slate-800/50 border-white/10 p-8 text-center">
            <MapPin className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 mb-4">Nenhuma cidade selecionada para comparação</p>
            <Button onClick={onAddCity} className="bg-primary hover:bg-primary/80">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cidade
            </Button>
          </Card>
        ) : (
          <div>
          <div className={cn(
            "grid gap-4",
            cities.length === 1 && "grid-cols-1",
            cities.length === 2 && "grid-cols-2",
            cities.length === 3 && "grid-cols-3",
            cities.length >= 4 && "grid-cols-4"
          )}>
            {cities.map(city => {
              const data = cityData.get(city.id);
              const WeatherIcon = data?.current?.condition ? getWeatherIcon(data.current.condition) : Sun;
              
              return (
                <Card 
                  key={city.id}
                  className="bg-slate-800/70 border-white/10 overflow-hidden"
                >
                  {/* City Header */}
                  <div className="p-3 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-white font-medium truncate">{city.name.split(',')[0]}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-white/50 hover:text-white flex-shrink-0"
                      onClick={() => onRemoveCity(city.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Loading State */}
                  {data?.isLoading && (
                    <div className="p-8 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white/50 animate-spin" />
                    </div>
                  )}

                  {/* Error State */}
                  {data?.error && (
                    <div className="p-4 text-center">
                      <p className="text-red-400 text-sm">{data.error}</p>
                    </div>
                  )}

                  {/* Current Weather */}
                  {data?.current && !data.isLoading && (
                    <div className="p-4 space-y-4">
                      {/* Temperature */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <WeatherIcon className="h-8 w-8 text-yellow-400" />
                          <span className="text-4xl font-bold text-white">
                            {Math.round(data.current.temperature)}°
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{data.current.description}</p>
                        <p className="text-white/40 text-xs">
                          Sensação {Math.round(data.current.feelsLike)}°
                        </p>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/50 rounded p-2 flex items-center gap-2">
                          <Wind className="h-3 w-3 text-cyan-400" />
                          <div>
                            <div className="text-white/70">Vento</div>
                            <div className="text-white font-medium">
                              {Math.round(data.current.wind.speed)} kt {getWindArrow(data.current.wind.direction)}
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded p-2 flex items-center gap-2">
                          <Droplets className="h-3 w-3 text-blue-400" />
                          <div>
                            <div className="text-white/70">Umidade</div>
                            <div className="text-white font-medium">{data.current.humidity}%</div>
                          </div>
                        </div>
                      </div>

                      {/* Daily Forecast */}
                      <div className="space-y-1">
                        <div className="text-xs text-white/50 uppercase tracking-wide">Próximos dias</div>
                        <div className="space-y-1">
                          {data.daily.slice(0, 5).map((day, i) => (
                            <div 
                              key={day.date}
                              className={cn(
                                "flex items-center justify-between py-1 px-2 rounded text-xs",
                                i === 0 && "bg-primary/20"
                              )}
                            >
                              <span className="text-white/70 w-8">{day.dayOfWeek}</span>
                              <div className="flex items-center gap-2">
                                {day.rainProbability > 30 && (
                                  <span className="text-blue-400 flex items-center">
                                    <Droplets className="h-3 w-3 mr-0.5" />
                                    {day.rainProbability}%
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-white">
                                <ArrowUp className="h-3 w-3 text-red-400" />
                                <span>{Math.round(day.tempMax)}°</span>
                                <ArrowDown className="h-3 w-3 text-blue-400 ml-1" />
                                <span>{Math.round(day.tempMin)}°</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hourly Preview */}
                      <div className="space-y-1">
                        <div className="text-xs text-white/50 uppercase tracking-wide">Próximas horas</div>
                        <div className="flex gap-1 overflow-x-auto pb-1">
                          {data.hourly.slice(0, 8).map(hour => (
                            <div 
                              key={hour.time}
                              className="flex-shrink-0 w-10 bg-slate-900/50 rounded p-1.5 text-center"
                            >
                              <div className="text-white/50 text-[10px]">{hour.time}</div>
                              <div className="text-white font-medium text-xs">{Math.round(hour.temperature)}°</div>
                              {hour.rain > 0 && (
                                <div className="text-blue-400 text-[10px]">{hour.rain.toFixed(1)}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

// Helper functions for weather codes
function getConditionFromCode(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail'
  };
  return conditions[code] || 'Unknown';
}

function getDescriptionFromCode(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Céu limpo', 1: 'Predominantemente limpo', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Nevoeiro', 48: 'Nevoeiro com geada',
    51: 'Chuvisco leve', 53: 'Chuvisco moderado', 55: 'Chuvisco intenso',
    61: 'Chuva fraca', 63: 'Chuva moderada', 65: 'Chuva forte',
    71: 'Neve fraca', 73: 'Neve moderada', 75: 'Neve forte',
    80: 'Pancadas leves', 81: 'Pancadas moderadas', 82: 'Pancadas fortes',
    95: 'Tempestade', 96: 'Tempestade com granizo', 99: 'Tempestade severa'
  };
  return descriptions[code] || 'Condição desconhecida';
}

function getIconFromCode(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌧️';
  if (code <= 65) return '🌧️';
  if (code <= 75) return '❄️';
  if (code <= 82) return '🌧️';
  return '⛈️';
}

export default CityComparison;
