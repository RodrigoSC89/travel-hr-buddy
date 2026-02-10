/**
 * Windy-Style Weather Map with Animated Wind
 * PATCH WINDY-1.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, MapPin, Thermometer, Wind } from "lucide-react";
import type { WeatherLocation, CurrentWeather, MapLayer } from "./types";
import { cn } from "@/lib/utils";

interface WeatherMapWindProps {
  location: WeatherLocation;
  weather: CurrentWeather | null;
  onClose?: () => void;
  layer?: MapLayer;
  className?: string;
}

// Brazilian cities for map display
const MAP_CITIES = [
  { name: "Brasília", lat: -15.78, lon: -47.93, temp: 21 },
  { name: "Porto Seguro", lat: -16.45, lon: -39.07, temp: 25 },
  { name: "Montes Claros", lat: -16.72, lon: -43.86, temp: 21 },
  { name: "Belo Horizonte", lat: -19.92, lon: -43.94, temp: 19 },
  { name: "São Paulo", lat: -23.55, lon: -46.63, temp: 20 },
  { name: "Rio de Janeiro", lat: -22.91, lon: -43.17, temp: 26 },
  { name: "Jataí", lat: -17.88, lon: -51.71, temp: 22 },
  { name: "Barretos", lat: -20.56, lon: -48.57, temp: 22 },
  { name: "Londrina", lat: -23.31, lon: -51.16, temp: 20 },
  { name: "Joinville", lat: -26.30, lon: -48.84, temp: 23 },
];

// Wind particle animation
const WindParticle: React.FC<{ id: number; delay: number; direction: number }> = ({ id, delay, direction }) => {
  // Deterministic positions based on particle id
  const left = ((id * 37 + 13) % 100);
  const top = ((id * 53 + 7) % 100);
  const style: React.CSSProperties = {
    position: 'absolute',
    width: '60px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transform: `rotate(${direction}deg)`,
    animationDelay: `${delay}s`,
    left: `${left}%`,
    top: `${top}%`,
  };

  return (
    <div 
      className="animate-pulse opacity-50"
      style={style}
    />
  );
};

export const WeatherMapWind: React.FC<WeatherMapWindProps> = ({
  location,
  weather,
  onClose,
  layer = 'wind',
  className
}) => {
  const [windDirection] = useState(weather?.wind.direction || 225);

  // Generate wind particles
  const windParticles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      delay: (i * 0.1) % 3,
      direction: windDirection + ((i * 17 % 30) - 15)
    })), [windDirection]
  );

  // Get gradient based on layer
  const getLayerGradient = () => {
    switch (layer) {
      case 'temp':
        return 'from-primary/90 via-secondary/80 via-warning/60 to-destructive';
      case 'rain':
        return 'from-muted via-primary/80 to-info';
      case 'pressure':
        return 'from-secondary/90 via-primary/70 to-success';
      default:
        return 'from-primary/95 via-primary/80 via-info/70 to-success/60';
    }
  };

  return (
    <div className={cn(
      "relative w-full h-[450px] rounded-xl overflow-hidden",
      className
    )}>
      {/* Map Background with Gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        getLayerGradient()
      )}>
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Wind Particles Animation */}
        {layer === 'wind' && (
          <div className="absolute inset-0 overflow-hidden">
            {windParticles.map(particle => (
              <WindParticle 
                key={particle.id}
                id={particle.id}
                delay={particle.delay}
                direction={particle.direction}
              />
            ))}
          </div>
        )}

        {/* City Temperature Labels */}
        {MAP_CITIES.map((city, idx) => (
          <div
            key={city.name}
            className="absolute text-white/90 text-xs font-medium"
            style={{
              left: `${10 + (idx % 5) * 18}%`,
              top: `${15 + Math.floor(idx / 5) * 35}%`,
            }}
          >
            <div className="flex items-center gap-1">
              <span className="text-white/60">{city.name}</span>
              <span className="text-white font-bold">{city.temp}°</span>
            </div>
          </div>
        ))}

        {/* Current Location Marker */}
        <div 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <div className="relative">
            {/* Pulse ring */}
            <div className="absolute -inset-4 bg-white/20 rounded-full animate-ping" />
            {/* Center dot */}
            <div className="w-4 h-4 bg-white rounded-full border-2 border-primary shadow-lg relative z-10" />
            {/* Location name */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-white text-sm font-medium">{location.name}</span>
              {weather && (
                <span className="ml-2 text-white font-bold">{Math.round(weather.temperature)}°</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-30 bg-black/30 hover:bg-black/50 text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      {/* Bottom Left Badge */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
          <MapPin className="h-5 w-5 text-destructive" />
          <div className="text-white">
            <div className="text-2xl font-bold flex items-center gap-2">
              {weather ? Math.round(weather.temperature) : '--'}°
            </div>
            <div className="text-xs text-white/70">{location.name}</div>
          </div>
          {weather && (
            <div className="ml-4 flex items-center gap-2 text-white/80">
              <Wind className="h-4 w-4" />
              <span className="text-sm">{Math.round(weather.wind.speed)} kt</span>
            </div>
          )}
        </div>
      </div>

      {/* Layer Indicator */}
      <Badge 
        variant="outline" 
        className="absolute top-4 left-4 z-20 bg-black/40 text-white border-white/30"
      >
        {layer === 'wind' && <Wind className="h-3 w-3 mr-1" />}
        {layer === 'temp' && <Thermometer className="h-3 w-3 mr-1" />}
        {layer.toUpperCase()}
      </Badge>
    </div>
  );
};

export default WeatherMapWind;
