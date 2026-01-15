/**
 * Hourly Forecast Table - Windy Style
 * Detailed hourly data with scroll
 * PATCH WINDY-1.0
 */

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sun, Moon, CloudSun, CloudMoon, Cloud, CloudRain, CloudDrizzle, CloudLightning } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { HourlyForecast } from "./types";

interface HourlyForecastTableProps {
  forecasts: HourlyForecast[];
  selectedDay: number;
  dayLabel: string;
  className?: string;
}

const getWeatherIcon = (condition: string, hour: number, className = "h-5 w-5") => {
  const isNight = hour >= 18 || hour < 6;
  const c = condition.toLowerCase();
  
  if (c.includes('thunder') || c.includes('storm')) return <CloudLightning className={cn(className, "text-yellow-400")} />;
  if (c.includes('rain') || c.includes('chuv')) return <CloudRain className={cn(className, "text-blue-400")} />;
  if (c.includes('drizzle')) return <CloudDrizzle className={cn(className, "text-blue-300")} />;
  if (c.includes('cloud') || c.includes('nubl')) return <Cloud className={cn(className, "text-gray-300")} />;
  if (c.includes('partly') || c.includes('parcial')) {
    return isNight 
      ? <CloudMoon className={cn(className, "text-blue-200")} /> 
      : <CloudSun className={cn(className, "text-yellow-300")} />;
  }
  return isNight 
    ? <Moon className={cn(className, "text-blue-200")} /> 
    : <Sun className={cn(className, "text-yellow-400")} />;
};

const getWindArrow = (direction: number): string => {
  const arrows = ['↓', '↙', '←', '↖', '↑', '↗', '→', '↘'];
  const index = Math.round(direction / 45) % 8;
  return arrows[index];
};

const getGustColor = (gust: number): string => {
  if (gust >= 20) return 'bg-red-500/30 text-red-300';
  if (gust >= 10) return 'bg-cyan-500/30 text-cyan-300';
  return '';
};

const getRainColor = (rain: number): string => {
  if (rain > 0) return 'bg-blue-500/20 text-blue-300';
  return 'text-white/50';
};

export const HourlyForecastTable: React.FC<HourlyForecastTableProps> = ({
  forecasts,
  selectedDay,
  dayLabel,
  className
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Highlight current hour
  const currentHour = new Date().getHours();

  useEffect(() => {
    // Auto-scroll to current time on first render
    if (scrollRef.current && selectedDay === 0) {
      const currentIndex = forecasts.findIndex(f => f.hour >= currentHour);
      if (currentIndex > 0) {
        scrollRef.current.scrollLeft = currentIndex * 60 - 100;
      }
    }
  }, [selectedDay]);

  return (
    <div className={cn("bg-slate-900/90 backdrop-blur-sm", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
          {dayLabel}
        </h3>
        <span className="text-xs text-white/50">Previsão horária</span>
      </div>

      {/* Table */}
      <ScrollArea className="w-full" ref={scrollRef}>
        <div className="min-w-[800px]">
          {/* Hours Row */}
          <div className="flex border-b border-white/5">
            <div className="w-24 flex-shrink-0 px-3 py-2 text-xs text-white/50 font-medium">
              Horas
            </div>
            {forecasts.map((hour, idx) => (
              <div 
                key={`hour-${idx}`}
                className={cn(
                  "w-[60px] flex-shrink-0 text-center py-2 text-sm font-medium",
                  selectedDay === 0 && hour.hour === currentHour 
                    ? "bg-primary/20 text-primary border-b-2 border-primary" 
                    : "text-white/70"
                )}
              >
                {hour.hour}
              </div>
            ))}
          </div>

          {/* Icon Row */}
          <div className="flex border-b border-white/5">
            <div className="w-24 flex-shrink-0 px-3 py-2 text-xs text-white/50" />
            {forecasts.map((hour, idx) => (
              <div 
                key={`icon-${idx}`}
                className="w-[60px] flex-shrink-0 flex justify-center py-2"
              >
                {getWeatherIcon(hour.condition, hour.hour)}
              </div>
            ))}
          </div>

          {/* Temperature Row */}
          <div className="flex border-b border-white/5">
            <div className="w-24 flex-shrink-0 px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-white/50">Temperatura</span>
              <span className="text-[10px] text-white/30">°C</span>
            </div>
            {forecasts.map((hour, idx) => (
              <div 
                key={`temp-${idx}`}
                className="w-[60px] flex-shrink-0 text-center py-2 text-white font-bold"
              >
                {Math.round(hour.temperature)}°
              </div>
            ))}
          </div>

          {/* Rain Row */}
          <div className="flex border-b border-white/5">
            <div className="w-24 flex-shrink-0 px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-white/50">Chuva</span>
              <span className="text-[10px] text-white/30">mm</span>
            </div>
            {forecasts.map((hour, idx) => (
              <div 
                key={`rain-${idx}`}
                className={cn(
                  "w-[60px] flex-shrink-0 text-center py-2 text-sm",
                  getRainColor(hour.rain)
                )}
              >
                {hour.rain > 0 ? hour.rain.toFixed(1) : '-'}
              </div>
            ))}
          </div>

          {/* Wind Speed Row */}
          <div className="flex border-b border-white/5">
            <div className="w-24 flex-shrink-0 px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-white/50">Vento</span>
              <span className="text-[10px] text-white/30">kt</span>
            </div>
            {forecasts.map((hour, idx) => (
              <div 
                key={`wind-${idx}`}
                className="w-[60px] flex-shrink-0 text-center py-2 text-sm text-white/70"
              >
                {Math.round(hour.windSpeed)}
              </div>
            ))}
          </div>

          {/* Wind Gust Row */}
          <div className="flex border-b border-white/5">
            <div className="w-24 flex-shrink-0 px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-white/50">Rajadas</span>
              <span className="text-[10px] text-white/30">kt</span>
            </div>
            {forecasts.map((hour, idx) => (
              <div 
                key={`gust-${idx}`}
                className={cn(
                  "w-[60px] flex-shrink-0 text-center py-2 text-sm rounded-sm mx-0.5",
                  getGustColor(hour.windGust)
                )}
              >
                {Math.round(hour.windGust)}
              </div>
            ))}
          </div>

          {/* Wind Direction Row */}
          <div className="flex">
            <div className="w-24 flex-shrink-0 px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-white/50">Dir. vento</span>
            </div>
            {forecasts.map((hour, idx) => (
              <div 
                key={`dir-${idx}`}
                className="w-[60px] flex-shrink-0 text-center py-2 text-lg text-white/60"
              >
                {getWindArrow(hour.windDirection)}
              </div>
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default HourlyForecastTable;
