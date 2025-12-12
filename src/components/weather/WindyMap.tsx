/**
import { useEffect, useRef, useState } from "react";;
 * Weather Map Component
 * Interactive weather map with OpenWeatherMap tiles as primary source
 * Falls back to static visualization if APIs unavailable
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Map, Wind, Thermometer, Droplets, Waves, Cloud, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WindyMapProps {
  lat?: number;
  lon?: number;
  location?: string;
}

type LayerType = "wind" | "temp" | "precipitation" | "clouds" | "pressure";

const layers: { id: LayerType; label: string; icon: React.ElementType; owmLayer: string }[] = [
  { id: "wind", label: "Vento", icon: Wind, owmLayer: "wind_new" },
  { id: "temp", label: "Temperatura", icon: Thermometer, owmLayer: "temp_new" },
  { id: "precipitation", label: "Precipitação", icon: Droplets, owmLayer: "precipitation_new" },
  { id: "clouds", label: "Nuvens", icon: Cloud, owmLayer: "clouds_new" },
  { id: "pressure", label: "Pressão", icon: Waves, owmLayer: "pressure_new" },
];

export const WindyMap: React.FC<WindyMapProps> = ({ 
  lat = -23.9608, 
  lon = -46.3335,
  location = "Santos, BR"
}) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("wind");
  const [zoom, setZoom] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [useAlternative, setUseAlternative] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<unknown>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Fetch API key from edge function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("weather-map-proxy", {
          body: { action: "get_keys" }
        });

        if (error) {
          setMapError(true);
          setUseAlternative(true);
          return;
        }

        if (data?.openweather) {
          setApiKey(data.openweather);
        } else {
          setMapError(true);
          setUseAlternative(true);
        }
      } catch (err) {
        console.error("Failed to fetch API keys:", err);
        console.error("Failed to fetch API keys:", err);
        setMapError(true);
        setUseAlternative(true);
      }
    };

    fetchApiKey();
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("weather-map-proxy", {
          body: { action: "weather_data", lat, lon }
        });

        if (!error && data?.data) {
          setWeatherData(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch weather data:", err);
        console.error("Failed to fetch weather data:", err);
      }
    };

    fetchWeatherData();
  }, [lat, lon]);

  // Check if iframe loaded successfully
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && !apiKey) {
        setMapError(true);
        setIsLoading(false);
        setUseAlternative(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [isLoading, apiKey]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setMapError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setMapError(true);
    setUseAlternative(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setMapError(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    toast({
      title: "Atualizando mapa",
      description: "Carregando dados meteorológicos...",
      duration: 2000,
    });
  };

  // Get tile URL with API key
  const getOWMTileUrl = (z: number, x: number, y: number) => {
    if (!apiKey) return "";
    const layer = layers.find(l => l.id === selectedLayer);
    return `https://tile.openweathermap.org/map/${layer?.owmLayer}/${z}/${x}/${y}.png?appid=${apiKey}`;
  };

  // Alternative embedded weather visualization
  const renderAlternativeMap = () => {
    const currentLayer = layers.find(l => l.id === selectedLayer);
    
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 overflow-hidden">
        {/* Animated weather patterns */}
        <div className="absolute inset-0">
          {/* Grid overlay */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px"
          }} />
          
          {/* Simulated weather cells */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${30 + Math.random() * 60}px`,
                height: `${30 + Math.random() * 60}px`,
                background: selectedLayer === "temp" 
                  ? `radial-gradient(circle, rgba(255,${100 + Math.random() * 155},0,0.4) 0%, transparent 70%)`
                  : selectedLayer === "precipitation"
                    ? "radial-gradient(circle, rgba(0,100,255,0.4) 0%, transparent 70%)"
                    : selectedLayer === "clouds"
                      ? "radial-gradient(circle, rgba(200,200,200,0.3) 0%, transparent 70%)"
                      : "radial-gradient(circle, rgba(0,255,200,0.3) 0%, transparent 70%)",
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
          
          {/* Wind lines animation */}
          {selectedLayer === "wind" && [...Array(15)].map((_, i) => (
            <div
              key={`wind-${i}`}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
              style={{
                left: "-10%",
                top: `${10 + i * 6}%`,
                width: `${60 + Math.random() * 40}%`,
                opacity: 0.3 + Math.random() * 0.4,
                transform: `rotate(${-10 + Math.random() * 20}deg)`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        
        {/* Center marker */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <Badge variant="secondary" className="text-xs">
                {location}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Weather info overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 text-white">
              {currentLayer && <currentLayer.icon className="h-5 w-5" />}
              <span className="font-medium">{currentLayer?.label}</span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              Lat: {lat.toFixed(4)} | Lon: {lon.toFixed(4)}
            </p>
          </div>
          
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-white/70">Zoom: {zoom}</p>
          </div>
        </div>
        
        {/* Data source notice */}
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-black/50 text-white border-white/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Visualização alternativa
          </Badge>
        </div>
      </div>
    );
  };

  // Windy embed URL
  const getWindyUrl = () => {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      detailLat: lat.toString(),
      detailLon: lon.toString(),
      width: "650",
      height: "450",
      zoom: zoom.toString(),
      level: "surface",
      overlay: selectedLayer === "precipitation" ? "rain" : selectedLayer,
      product: "ecmwf",
      menu: "",
      message: "true",
      marker: "",
      calendar: "now",
      pressure: "true",
      type: "map",
      location: "coordinates",
      detail: "",
      metricWind: "kt",
      metricTemp: "°C",
      radarRange: "-1",
    });
    return `https://embed.windy.com/embed2.html?${params.toString()}`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Mapa Meteorológico Interativo
            </CardTitle>
            <CardDescription>
              Visualização em tempo real powered by Windy
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Ao vivo
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Layer Controls */}
        <div className="p-4 bg-muted/30 border-b flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Camada:</span>
            <div className="flex gap-1 flex-wrap">
              {layers.map((layer) => (
                <Button
                  key={layer.id}
                  variant={selectedLayer === layer.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLayer(layer.id)}
                  className="h-8"
                >
                  <layer.icon className="h-3 w-3 mr-1" />
                  {layer.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Zoom:</span>
            <Select value={zoom.toString()} onValueChange={(v) => setZoom(parseInt(v))}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">Regional</SelectItem>
                <SelectItem value="6">Área</SelectItem>
                <SelectItem value="8">Local</SelectItem>
                <SelectItem value="10">Detalhado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="ml-auto text-sm text-muted-foreground">
            📍 {location}
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-[500px] w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Carregando mapa meteorológico...</p>
              </div>
            </div>
          )}
          
          {useAlternative ? (
            renderAlternativeMap()
          ) : (
            <iframe
              ref={iframeRef}
              src={getWindyUrl()}
              className="absolute inset-0 w-full h-full border-0"
              title="Windy Weather Map"
              loading="lazy"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-popups"
              allow="geolocation"
            />
          )}
        </div>

        {/* Legend */}
        <div className="p-4 bg-muted/30 border-t">
          <div className="flex items-center justify-between text-sm flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              {selectedLayer === "wind" && (
                <>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded" /> 0-10 nós
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-yellow-500 rounded" /> 10-20 nós
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-orange-500 rounded" /> 20-30 nós
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-500 rounded" /> 30+ nós
                  </span>
                </>
              )}
              {selectedLayer === "temp" && (
                <>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-500 rounded" /> &lt;15°C
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded" /> 15-25°C
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-orange-500 rounded" /> 25-35°C
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-500 rounded" /> &gt;35°C
                  </span>
                </>
              )}
              {selectedLayer === "precipitation" && (
                <>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-cyan-300 rounded" /> Leve
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-cyan-500 rounded" /> Moderada
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-500 rounded" /> Forte
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-purple-500 rounded" /> Intensa
                  </span>
                </>
              )}
              {(selectedLayer === "clouds" || selectedLayer === "pressure") && (
                <>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-gray-300 rounded" /> Baixo
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-gray-400 rounded" /> Médio
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-gray-500 rounded" /> Alto
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-gray-600 rounded" /> Muito Alto
                  </span>
                </>
              )}
            </div>
            <span className="text-muted-foreground">
              Dados: ECMWF | Atualizado a cada 6h
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WindyMap;