/**
 * Windy Map Plugin Component
 * PATCH WINDY-6.0: Using iframe embed for reliability + Mapbox fallback
 * 
 * The Windy API has compatibility issues with React SPAs.
 * Using iframe embed provides the best stability and user experience.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, Wind, Waves, Thermometer, Loader2, RefreshCw, Maximize2, MapPin, Map, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface WindyMapPluginProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  className?: string;
  height?: string;
  showControls?: boolean;
  overlay?: "wind" | "rain" | "temp" | "clouds" | "waves" | "pressure";
  onMapReady?: (api: { type: string }) => void;
}

// Overlay options for the map
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mapboxContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Mapbox Map instance loaded dynamically
  const mapboxMapRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentOverlay, setCurrentOverlay] = useState<string>(overlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [iframeKey, setIframeKey] = useState(Date.now());
  
  const mountedRef = useRef(true);

  // Build Windy embed URL
  const getWindyUrl = useCallback(() => {
    const baseUrl = "https://embed.windy.com/embed2.html";
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      zoom: zoom.toString(),
      level: "surface",
      overlay: currentOverlay,
      product: "ecmwf",
      menu: "",
      message: "true",
      marker: "",
      calendar: "now",
      pressure: "true",
      type: "map",
      location: "coordinates",
      metricWind: "km/h",
      metricTemp: "°C",
      radarRange: "-1",
    });
    return `${baseUrl}?${params.toString()}`;
  }, [latitude, longitude, zoom, currentOverlay]);

  // Fetch Mapbox token for fallback
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data } = await supabase.functions.invoke("mapbox-token", {
          body: { type: "mapbox" }
        });
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (err) {
        logger.warn('[WindyMapPlugin] Could not fetch Mapbox token for fallback');
      }
    };
    fetchToken();
  }, []);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(false);
      onMapReady?.({ type: 'iframe' });
    }
  }, [onMapReady]);

  // Handle iframe error - switch to fallback
  const handleIframeError = useCallback(() => {
    logger.warn('[WindyMapPlugin] Iframe failed to load, switching to fallback');
    if (mountedRef.current) {
      setUseFallback(true);
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true;
    
    // Set a timeout to switch to fallback if iframe takes too long
    const timeout = setTimeout(() => {
      if (mountedRef.current && isLoading) {
        // Check if iframe is actually loaded
        if (iframeRef.current?.contentWindow) {
          setIsLoading(false);
        }
      }
    }, 5000);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
    };
  }, []);

  // Initialize Mapbox fallback
  const initializeMapboxFallback = useCallback(async () => {
    if (!mapboxContainerRef.current || !mapboxToken) return;
    
    try {
      const mapboxgl = await import('mapbox-gl');
      
      // Load Mapbox CSS
      if (!document.getElementById('mapbox-css')) {
        const link = document.createElement('link');
        link.id = 'mapbox-css';
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css';
        document.head.appendChild(link);
      }

      mapboxgl.default.accessToken = mapboxToken;

      if (mapboxMapRef.current) {
        mapboxMapRef.current.remove();
      }

      mapboxMapRef.current = new mapboxgl.default.Map({
        container: mapboxContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [longitude, latitude],
        zoom: zoom,
        pitch: 0,
      });

      mapboxMapRef.current.addControl(
        new mapboxgl.default.NavigationControl(),
        'top-right'
      );

      // Add weather layer overlay (OpenWeatherMap tile layer)
      mapboxMapRef.current.on('load', () => {
        const owmLayer = currentOverlay === 'temp' ? 'temp_new' :
                         currentOverlay === 'rain' ? 'precipitation_new' :
                         currentOverlay === 'clouds' ? 'clouds_new' :
                         currentOverlay === 'pressure' ? 'pressure_new' :
                         'wind_new';

        mapboxMapRef.current.addSource('weather-tiles', {
          type: 'raster',
          tiles: [
            `https://tile.openweathermap.org/map/${owmLayer}/{z}/{x}/{y}.png?appid=9de243494c0b295cca9337e1e96b00e2`
          ],
          tileSize: 256,
        });

        mapboxMapRef.current.addLayer({
          id: 'weather-layer',
          type: 'raster',
          source: 'weather-tiles',
          paint: {
            'raster-opacity': 0.7,
          },
        });

        setIsLoading(false);
      });
    } catch (err) {
      logger.error('[WindyMapPlugin] Mapbox fallback failed:', err);
      setIsLoading(false);
    }
  }, [mapboxToken, latitude, longitude, zoom, currentOverlay]);

  // Initialize fallback when needed
  useEffect(() => {
    if (useFallback && mapboxToken) {
      initializeMapboxFallback();
    }
  }, [useFallback, mapboxToken, initializeMapboxFallback]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (useFallback) {
      initializeMapboxFallback();
    } else {
      setIsLoading(true);
      setIframeKey(Date.now());
    }
  }, [useFallback, initializeMapboxFallback]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Open in new tab
  const openInNewTab = useCallback(() => {
    window.open(`https://www.windy.com/${latitude}/${longitude}?${currentOverlay}`, '_blank');
  }, [latitude, longitude, currentOverlay]);

  const CurrentIcon = OVERLAY_OPTIONS.find(o => o.value === currentOverlay)?.icon || Wind;

  return (
    <Card className={`bg-slate-900/80 border-white/10 flex flex-col ${className}`}>
      {showControls && (
        <CardHeader className="pb-2 pt-3 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <CurrentIcon className="h-4 w-4 text-cyan-400" />
              {useFallback ? 'Mapa Meteorológico' : 'Windy'}
              <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400/50 ml-2">
                <MapPin className="h-3 w-3 mr-1" />
                {latitude.toFixed(2)}, {longitude.toFixed(2)}
              </Badge>
              {useFallback && (
                <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/50">
                  <Map className="h-3 w-3 mr-1" />
                  Mapbox
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={currentOverlay} onValueChange={setCurrentOverlay}>
                <SelectTrigger className="w-32 h-8 bg-slate-800 border-white/20 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  {OVERLAY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-3 w-3" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                title="Atualizar"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={openInNewTab}
                className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                title="Abrir no Windy.com"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleFullscreen}
                className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
                title="Tela cheia"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0 flex-1 flex flex-col">
        <div 
          ref={containerRef} 
          className="relative rounded-b-lg overflow-hidden flex-1" 
          style={{ height, minHeight: '400px' }}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 z-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-400" />
                <p className="text-base text-white font-medium">
                  Carregando {useFallback ? 'mapa' : 'Windy'}...
                </p>
              </div>
            </div>
          )}
          
          {/* Windy iframe - Main view */}
          {!useFallback && (
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={getWindyUrl()}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="fullscreen"
              loading="lazy"
              title="Windy Weather Map"
              style={{ minHeight: '400px' }}
            />
          )}

          {/* Mapbox fallback container */}
          {useFallback && (
            <div 
              ref={mapboxContainerRef}
              className="w-full h-full bg-slate-800"
              style={{ minHeight: '400px' }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WindyMapPlugin;
