/**
 * Windy Map Plugin Component
 * Embeds interactive Windy weather map with full plugin features
 * PATCH WINDY-3.1: Fixed layout and initialization
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, Wind, Waves, Thermometer, Loader2, RefreshCw, Maximize2, AlertCircle } from "lucide-react";

interface WindyMapPluginProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  className?: string;
  height?: string;
  showControls?: boolean;
  overlay?: "wind" | "rain" | "temp" | "clouds" | "waves" | "pressure";
  onMapReady?: (api: any) => void;
}

// Windy API Key - demo key for development
const WINDY_API_KEY = "5XejbCIAVmWgaG78DrWz0BkwEuyl6rrV";

// Overlay options for the map
const OVERLAY_OPTIONS = [
  { value: "wind", label: "Vento", icon: Wind },
  { value: "rain", label: "Chuva", icon: Cloud },
  { value: "temp", label: "Temperatura", icon: Thermometer },
  { value: "clouds", label: "Nuvens", icon: Cloud },
  { value: "waves", label: "Ondas", icon: Waves },
  { value: "pressure", label: "Pressão", icon: Cloud },
];

// Declare global Windy types
declare global {
  interface Window {
    windyInit?: (options: any, callback: (api: any) => void) => void;
    W?: any;
  }
}

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
  const windyContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOverlay, setCurrentOverlay] = useState<string>(overlay);
  const [windyAPI, setWindyAPI] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const initAttemptRef = useRef(0);
  const scriptLoadedRef = useRef(false);
  const windyIdRef = useRef(`windy-${Date.now()}`);

  // Initialize Windy after script loads
  const initializeWindy = useCallback(() => {
    const containerId = windyIdRef.current;
    const container = document.getElementById(containerId);
    
    if (!container) {
      console.warn('[WindyMapPlugin] Container not found');
      return;
    }

    // Check if windyInit is available
    if (!window.windyInit) {
      if (initAttemptRef.current < 30) {
        initAttemptRef.current++;
        setTimeout(initializeWindy, 200);
      } else {
        setError("Windy API não carregou após várias tentativas");
        setIsLoading(false);
      }
      return;
    }

    try {
      console.log('[WindyMapPlugin] Initializing Windy...');
      
      window.windyInit({
        key: WINDY_API_KEY,
        verbose: false,
        lat: latitude,
        lon: longitude,
        zoom: zoom,
        overlay: currentOverlay,
      }, (api: any) => {
        console.log('[WindyMapPlugin] Windy initialized successfully');
        setWindyAPI(api);
        setIsLoading(false);
        setError(null);
        onMapReady?.(api);
      });
    } catch (err) {
      console.error('[WindyMapPlugin] Initialization error:', err);
      setError("Erro ao inicializar o mapa Windy");
      setIsLoading(false);
    }
  }, [latitude, longitude, zoom, currentOverlay, onMapReady]);

  // Load Windy script
  const loadWindyScript = useCallback(() => {
    setIsLoading(true);
    setError(null);
    initAttemptRef.current = 0;

    // Remove existing script if any
    const existingScript = document.getElementById("windy-api-script");
    if (existingScript) {
      existingScript.remove();
    }

    // Reset Windy global
    delete (window as any).windyInit;
    delete (window as any).W;

    // Create new script
    const script = document.createElement("script");
    script.id = "windy-api-script";
    script.src = "https://api.windy.com/assets/map-forecast/libBoot.js";
    script.async = true;
    
    script.onload = () => {
      console.log('[WindyMapPlugin] Windy script loaded');
      scriptLoadedRef.current = true;
      initializeWindy();
    };
    
    script.onerror = (e) => {
      console.error('[WindyMapPlugin] Script load error:', e);
      setError("Falha ao carregar o script do Windy");
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
  }, [initializeWindy]);

  // Load script on mount
  useEffect(() => {
    loadWindyScript();

    return () => {
      // Cleanup on unmount
      const script = document.getElementById("windy-api-script");
      if (script) script.remove();
    };
  }, []);
    const existingScript = document.getElementById("windy-api-script");
    if (existingScript) {
      existingScript.remove();
    }

  // Update overlay when changed
  useEffect(() => {
    if (windyAPI?.store) {
      try {
        windyAPI.store.set("overlay", currentOverlay);
      } catch (e) {
        console.warn('[WindyMapPlugin] Failed to set overlay:', e);
      }
    }
  }, [currentOverlay, windyAPI]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (windyAPI?.map) {
      windyAPI.map.setView([latitude, longitude], zoom);
    } else {
      loadWindyScript();
    }
  }, [windyAPI, latitude, longitude, zoom, loadWindyScript]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const CurrentIcon = OVERLAY_OPTIONS.find(o => o.value === currentOverlay)?.icon || Wind;
  const windyId = windyIdRef.current;

  return (
    <Card className={`bg-slate-900/80 border-white/10 ${className}`}>
      {showControls && (
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <CurrentIcon className="h-4 w-4 text-cyan-400" />
              Mapa Windy
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400/50">
                API v4
              </Badge>
              <Select value={currentOverlay} onValueChange={setCurrentOverlay}>
                <SelectTrigger className="w-28 h-8 bg-slate-800 border-white/20 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleFullscreen}
                className="h-8 w-8 border-white/20 text-white hover:bg-white/10"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div 
          ref={containerRef} 
          className="relative rounded-b-lg overflow-hidden" 
          style={{ height, minHeight: '400px' }}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-cyan-400" />
                <p className="text-sm text-white/70">Carregando mapa Windy...</p>
                <p className="text-xs text-white/40 mt-1">Dados meteorológicos em tempo real</p>
              </div>
            </div>
          )}
          
          {/* Error overlay */}
          {error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
              <div className="text-center p-4">
                <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-400" />
                <p className="text-sm text-red-400 mb-3">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="border-red-400/50 text-red-400 hover:bg-red-400/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          )}
          
          {/* Windy map container - MUST have id="windy" for the API */}
          <div 
            ref={windyContainerRef}
            id={windyId}
            className="w-full h-full bg-slate-800"
            style={{ minHeight: '400px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WindyMapPlugin;
