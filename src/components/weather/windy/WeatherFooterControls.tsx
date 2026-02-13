/**
 * Weather Footer Controls - Windy Style
 * Forecast options, display modes, model selection
 * PATCH WINDY-1.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, Eye, BarChart3, Share2, Settings } from "lucide-react";
import type { ForecastModel, DisplayMode, ForecastRange } from "./types";

interface WeatherFooterControlsProps {
  forecastRange: ForecastRange;
  onForecastRangeChange: (range: ForecastRange) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  forecastModel: ForecastModel;
  onForecastModelChange: (model: ForecastModel) => void;
  onShare?: () => void;
  onSettings?: () => void;
  className?: string;
}

export const WeatherFooterControls: React.FC<WeatherFooterControlsProps> = ({
  forecastRange,
  onForecastRangeChange,
  displayMode,
  onDisplayModeChange,
  forecastModel,
  onForecastModelChange,
  onShare,
  onSettings,
  className
}) => {
  return (
    <div className={cn(
      "bg-red-600 px-4 py-2 flex items-center justify-between gap-4 flex-wrap",
      className
    )}>
      {/* Left Controls */}
      <div className="flex items-center gap-4">
        {/* Forecast Range */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-white/80" />
          <Select value={forecastRange} onValueChange={(v) => onForecastRangeChange(v as ForecastRange)}>
            <SelectTrigger className="w-[100px] h-8 bg-white/10 border-white/20 text-white text-xs">
              <SelectValue placeholder="Previsão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3h">3 horas</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Display Mode */}
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-white/80" />
          <Select value={displayMode} onValueChange={(v) => onDisplayModeChange(v as DisplayMode)}>
            <SelectTrigger className="w-[100px] h-8 bg-white/10 border-white/20 text-white text-xs">
              <SelectValue placeholder="Exibir como" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Básico</SelectItem>
              <SelectItem value="advanced">Avançado</SelectItem>
              <SelectItem value="table">Tabela</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Forecast Model */}
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-white/80" />
          <Select value={forecastModel} onValueChange={(v) => onForecastModelChange(v as ForecastModel)}>
            <SelectTrigger className="w-[100px] h-8 bg-white/10 border-white/20 text-white text-xs">
              <SelectValue placeholder="Modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ECMWF">ECMWF</SelectItem>
              <SelectItem value="GFS">GFS</SelectItem>
              <SelectItem value="ICON">ICON</SelectItem>
              <SelectItem value="NAM">NAM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {onSettings && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            onClick={onSettings}
            aria-label="Configurações meteorológicas"
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        {onShare && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
            onClick={onShare}
            aria-label="Compartilhar previsão"
            title="Compartilhar"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default WeatherFooterControls;
