/**
 * Daily Forecast Strip - Windy Style
 * 6-day horizontal forecast cards
 * PATCH WINDY-1.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudDrizzle, CloudSun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DailyForecast } from "./types";

interface DailyForecastStripProps {
  forecasts: DailyForecast[];
  selectedDay?: number;
  onSelectDay?: (index: number) => void;
  onClose?: () => void;
  className?: string;
}

const getWeatherIcon = (condition: string, className = "h-8 w-8") => {
  const c = condition.toLowerCase();
  if (c.includes('thunder') || c.includes('storm')) return <CloudLightning className={cn(className, "text-warning")} />;
  if (c.includes('rain') || c.includes('chuv')) return <CloudRain className={cn(className, "text-primary")} />;
  if (c.includes('drizzle') || c.includes('garo')) return <CloudDrizzle className={cn(className, "text-info")} />;
  if (c.includes('snow') || c.includes('neve')) return <CloudSnow className={cn(className, "text-info")} />;
  if (c.includes('cloud') || c.includes('nubl')) return <Cloud className={cn(className, "text-muted-foreground")} />;
  if (c.includes('partly') || c.includes('parcial')) return <CloudSun className={cn(className, "text-warning")} />;
  return <Sun className={cn(className, "text-warning")} />;
};

const getDayName = (dateStr: string, index: number): string => {
  const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
  const date = new Date(dateStr);
  if (index === 0) return 'HOJE';
  return days[date.getDay()];
};

export const DailyForecastStrip: React.FC<DailyForecastStripProps> = ({
  forecasts,
  selectedDay = 0,
  onSelectDay,
  onClose,
  className
}) => {
  return (
    <div className={cn("relative bg-slate-900/90 backdrop-blur-sm", className)}>
      {/* Close Button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Forecast Cards */}
      <div className="flex overflow-x-auto scrollbar-hide">
        {forecasts.slice(0, 6).map((day, index) => (
          <button
            key={day.date}
            onClick={() => onSelectDay?.(index)}
            className={cn(
              "flex-1 min-w-[90px] p-3 flex flex-col items-center gap-2 transition-all border-r border-white/10 last:border-r-0",
              selectedDay === index 
                ? "bg-slate-700/50" 
                : "hover:bg-slate-800/50"
            )}
          >
            {/* Day Name */}
            <span className={cn(
              "text-xs font-medium",
              index === 0 ? "text-primary" : "text-white/70"
            )}>
              {getDayName(day.date, index)}
            </span>

            {/* Weather Icon */}
            {getWeatherIcon(day.condition)}

            {/* Temperature */}
            <div className="flex items-baseline gap-1">
              <span className="text-white font-bold text-lg">
                {Math.round(day.tempMax)}°
              </span>
              <span className="text-white/50 text-sm">
                / {Math.round(day.tempMin)}°
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="h-2 flex">
        <div 
          className="bg-primary transition-all duration-300"
          style={{ width: `${((selectedDay + 1) / forecasts.length) * 100}%` }}
        />
        <div className="flex-1 bg-slate-700" />
      </div>
    </div>
  );
};

export default DailyForecastStrip;
