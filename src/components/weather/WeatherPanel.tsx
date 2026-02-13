/**
 * WeatherPanel Component
 * Displays weather data with loading/error states and responsive design
 * 
 * @module components/weather/WeatherPanel
 */

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeatherData } from "@/hooks/useWeatherData";
import {
  Wind,
  Waves,
  Gauge,
  Thermometer,
  Eye,
  Droplets,
  RefreshCw,
  AlertTriangle,
  Compass,
  CloudOff,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherPanelProps {
  latitude: number;
  longitude: number;
  title?: string;
  className?: string;
  compact?: boolean;
  showSource?: boolean;
}

/**
 * Get wind direction as compass text
 */
function getWindDirectionText(degrees: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Get wind severity level
 */
function getWindSeverity(speedKnots: number): "low" | "medium" | "high" {
  if (speedKnots < 15) return "low";
  if (speedKnots < 30) return "medium";
  return "high";
}

/**
 * Get sea severity based on wave height
 */
function getSeaSeverity(waveHeight?: number): "low" | "medium" | "high" | undefined {
  if (waveHeight === undefined) return undefined;
  if (waveHeight < 1.5) return "low";
  if (waveHeight < 3) return "medium";
  return "high";
}

const severityStyles = {
  low: "bg-green-500/10 text-green-500 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20",
};

const severityLabels = {
  low: "Condições Boas",
  medium: "Atenção",
  high: "Alerta",
};

/**
 * Loading skeleton for weather panel
 */
function WeatherPanelSkeleton({ compact }: { compact?: boolean }) {
  return (
    <Card className="animate-pulse">
      <CardHeader className={compact ? "pb-2" : undefined}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-4", compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
          {[1, 2, 3, 4].map((i) => (
            <div key={`weather-skeleton-${i}`} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Error state for weather panel
 */
function WeatherPanelError({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <CloudOff className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium text-destructive">Erro ao obter dados meteorológicos</h4>
            <p className="text-sm text-muted-foreground">
              Não foi possível conectar aos serviços de previsão
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
            {isRetrying ? "Tentando..." : "Tentar novamente"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Weather data item display
 */
function WeatherItem({
  icon: Icon,
  label,
  value,
  unit,
  severity,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined;
  unit?: string;
  severity?: "low" | "medium" | "high";
  className?: string;
}) {
  if (value === undefined || value === null) return null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {typeof value === "number" ? value.toFixed(1) : value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </span>
        {severity && (
          <Badge variant="outline" className={cn("text-xs", severityStyles[severity])}>
            {severity === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
            {severityLabels[severity]}
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Wind compass visualization
 */
function WindCompass({
  direction,
  speed,
  className,
}: {
  direction: number;
  speed: number;
  className?: string;
}) {
  return (
    <div className={cn("relative w-16 h-16 flex items-center justify-center", className)}>
      <div className="absolute inset-0 rounded-full border-2 border-muted" />
      <div className="absolute inset-1 rounded-full bg-muted/30" />
      <Navigation
        className="h-6 w-6 text-primary transition-transform duration-500"
        style={{ transform: `rotate(${direction}deg)` }}
      />
      <span className="absolute -bottom-5 text-xs text-muted-foreground">
        {getWindDirectionText(direction)}
      </span>
    </div>
  );
}

/**
 * Main WeatherPanel component
 */
export function WeatherPanel({
  latitude,
  longitude,
  title = "Condições Meteorológicas",
  className,
  compact = false,
  showSource = true,
}: WeatherPanelProps) {
  const { data, isLoading, isFetching, isError, refetch, lastUpdated, source } =
    useWeatherData(latitude, longitude);

  if (isLoading) {
    return <WeatherPanelSkeleton compact={compact} />;
  }

  if (isError || !data) {
    return <WeatherPanelError onRetry={refetch} isRetrying={isFetching} />;
  }

  const windSeverity = getWindSeverity(data.windSpeedKnots);
  const seaSeverity = getSeaSeverity(data.waveHeight);

  return (
    <Card className={cn("transition-all", className)}>
      <CardHeader className={cn("pb-2", compact && "py-3")}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Compass className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {showSource && source && (
              <Badge variant="secondary" className="text-xs capitalize">
                {source}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={refetch}
              disabled={isFetching}
              title="Atualizar dados"
              aria-label="Atualizar dados meteorológicos"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </Button>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Atualizado: {lastUpdated.toLocaleTimeString("pt-BR")}
          </p>
        )}
      </CardHeader>

      <CardContent className={compact ? "pt-2" : undefined}>
        <div className={cn(
          "grid gap-4",
          compact
            ? "grid-cols-2 gap-3"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        )}>
          {/* Wind Speed */}
          <div className="flex items-start gap-3">
            <WindCompass
              direction={data.windDirection}
              speed={data.windSpeedKnots}
              className="hidden sm:flex"
            />
            <WeatherItem
              icon={Wind}
              label="Vento"
              value={data.windSpeedKnots}
              unit="nós"
              severity={windSeverity}
            />
          </div>

          {/* Wave Height */}
          {data.waveHeight !== undefined && (
            <WeatherItem
              icon={Waves}
              label="Ondulação"
              value={data.waveHeight}
              unit="m"
              severity={seaSeverity}
            />
          )}

          {/* Swell Height */}
          {data.swellHeight !== undefined && (
            <WeatherItem
              icon={Waves}
              label="Swell"
              value={data.swellHeight}
              unit="m"
            />
          )}

          {/* Pressure */}
          {data.pressure !== undefined && (
            <WeatherItem
              icon={Gauge}
              label="Pressão"
              value={data.pressure}
              unit="hPa"
            />
          )}

          {/* Temperature */}
          {data.temperature !== undefined && (
            <WeatherItem
              icon={Thermometer}
              label="Temperatura"
              value={data.temperature}
              unit="°C"
            />
          )}

          {/* Humidity */}
          {data.humidity !== undefined && (
            <WeatherItem
              icon={Droplets}
              label="Umidade"
              value={data.humidity}
              unit="%"
            />
          )}

          {/* Visibility */}
          {data.visibility !== undefined && (
            <WeatherItem
              icon={Eye}
              label="Visibilidade"
              value={(data.visibility / 1000).toFixed(1)}
              unit="km"
            />
          )}

          {/* Sea State */}
          {data.seaState && (
            <div className="flex flex-col gap-1 col-span-full md:col-span-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Waves className="h-3 w-3" />
                Estado do Mar
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "w-fit",
                  seaSeverity && severityStyles[seaSeverity]
                )}
              >
                {data.seaState}
              </Badge>
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && !compact && (
          <p className="mt-4 text-sm text-muted-foreground border-t pt-3">
            {data.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherPanel;
