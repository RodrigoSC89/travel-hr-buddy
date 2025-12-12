/**
import { useEffect, useRef, useState, useCallback } from "react";;
 * Windy Map Plugin Component
 * Embeds interactive Windy weather map with full plugin features
 */

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, Wind, Waves, Thermometer, Loader2, RefreshCw, Maximize2 } from "lucide-react";

interface WindyMapPluginProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  className?: string;
  height?: string;
  showControls?: boolean;
  overlay?: "wind" | "rain" | "temp" | "clouds" | "waves" | "pressure";
  onMapReady?: (api: unknown: unknown: unknown) => void;
}

const WINDY_API_KEY = "5XejbCIAVmWgaG78DrWz0BkwEuyl6rrV";

const OVERLAY_OPTIONS = [
  { value: "wind", label: "Vento", icon: Wind },
  { value: "rain", label: "Chuva", icon: Cloud },
  { value: "temp", label: "Temperatura", icon: Thermometer },
  { value: "clouds", label: "Nuvens", icon: Cloud },
  { value: "waves", label: "Ondas", icon: Waves },
  { value: "pressure", label: "Pressão", icon: Cloud },
];

export const WindyMapPlugin: React.FC<WindyMapPluginProps> = ({
  latitude = -22.9068,
  longitude = -43.1729,
  zoom = 5,
  className = "",
  height = "500px",
  showControls = true,
  overlay = "wind",
  onMapReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOverlay, setCurrentOverlay] = useState<string>(overlay);
  const [windyAPI, setWindyAPI] = useState<unknown>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadWindyPlugin();
    return () => {
      // Cleanup
      const existingScript = document.getElementById("windy-api-script");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (windyAPI?.store) {
      windyAPI.store.set("overlay", currentOverlay);
    }
  }, [currentOverlay, windyAPI]);

  const loadWindyPlugin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Remove existing script if any
      const existingScript = document.getElementById("windy-api-script");
      if (existingScript) {
        existingScript.remove();
      }

      // Create script element
      const script = document.createElement("script");
      script.id = "windy-api-script";
      script.src = "https://api.windy.com/assets/map-forecast/libBoot.js";
      script.async = true;

      script.onload = () => {
        initializeWindy();
      };

      script.onerror = () => {
        setError("Falha ao carregar Windy API");
        setIsLoading(false);
      };

      document.head.appendChild(script);
    } catch (err) {
      console.error("Error loading Windy:", err);
      console.error("Error loading Windy:", err);
      setError("Erro ao inicializar mapa");
      setIsLoading(false);
    }
  };

  const initializeWindy = () => {
    if (!(window as unknown).windyInit) {
      setTimeout(initializeWindy, 100);
      return;
    }

    const options = {
      key: WINDY_API_KEY,
      verbose: false,
      lat: latitude,
      lon: longitude,
      zoom: zoom,
      overlay: currentOverlay,
    };

    (window as unknown).windyInit(options, (api: unknown: unknown: unknown) => {
      setWindyAPI(api);
      setIsLoading(false);
      
      if (onMapReady) {
        onMapReady(api);
      }

      // Add custom markers or layers if needed
      const { map, store, picker } = api;
      
      // Enable picker for point forecast
      picker.on("pickerOpened", (latLon: { lat: number; lon: number }) => {
      });

      // Log current overlay changes
      store.on("overlay", (overlayName: string) => {
      });
    });
  };

  const handleRefresh = () => {
    if (windyAPI) {
      windyAPI.map.setView([latitude, longitude], zoom);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const getOverlayIcon = (overlayValue: string) => {
    const option = OVERLAY_OPTIONS.find(o => o.value === overlayValue);
    return option?.icon || Wind;
  };

  const CurrentIcon = getOverlayIcon(currentOverlay);

  return (
    <Card className={className}>
      {showControls && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CurrentIcon className="h-5 w-5" />
              Windy Weather Map
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                API v4
              </Badge>
              <Select value={currentOverlay} onValueChange={setCurrentOverlay}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OVERLAY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="relative rounded-b-lg overflow-hidden"
          style={{ height }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Carregando Windy...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 z-10">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={loadWindyPlugin}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}
          
          <div id="windy" className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default WindyMapPlugin;
