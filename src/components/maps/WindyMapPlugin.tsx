/**
 * Windy Map Plugin Component
 * Embeds interactive Windy weather map with full plugin features
 * PATCH WINDY-4.0: Fixed initialization - container MUST have id="windy"
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, Wind, Waves, Thermometer, Loader2, RefreshCw, Maximize2, AlertCircle, MapPin } from "lucide-react";

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

// Windy API Key
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOverlay, setCurrentOverlay] = useState<string>(overlay);
  const [windyAPI, setWindyAPI] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const initAttemptRef = useRef(0);
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);

  // Initialize Windy after script loads
  const initializeWindy = useCallback(() => {
    // CRITICAL: Windy API requires container with id="windy"
    const container = document.getElementById("windy");
    
    if (!container) {
      console.warn('[WindyMapPlugin] Container with id="windy" not found');
      return;
    }

    // Check if windyInit is available
    if (!window.windyInit) {
      if (initAttemptRef.current < 50) {
        initAttemptRef.current++;
        setTimeout(initializeWindy, 150);
      } else {
        if (mountedRef.current) {
          setError("Windy API não carregou. Verifique sua conexão.");
          setIsLoading(false);
        }
      }
      return;
    }

    // Prevent multiple initializations
    if (initializingRef.current) return;
    initializingRef.current = true;

    try {
      console.log('[WindyMapPlugin] Initializing Windy API...');
      
      const options = {
        key: WINDY_API_KEY,
        verbose: false,
        lat: latitude,
        lon: longitude,
        zoom: zoom,
        overlay: currentOverlay,
      };

      window.windyInit(options, (api: any) => {
        if (!mountedRef.current) return;
        
        console.log('[WindyMapPlugin] Windy initialized successfully');
        setWindyAPI(api);
        setIsLoading(false);
        setError(null);
        onMapReady?.(api);
      });
    } catch (err) {
      console.error('[WindyMapPlugin] Initialization error:', err);
      if (mountedRef.current) {
        setError("Erro ao inicializar o mapa Windy");
        setIsLoading(false);
      }
      initializingRef.current = false;
    }
  }, [latitude, longitude, zoom, currentOverlay, onMapReady]);

  // Load Windy script
  const loadWindyScript = useCallback(() => {
    setIsLoading(true);
    setError(null);
    initAttemptRef.current = 0;
    initializingRef.current = false;

    // Remove existing script if any
    const existingScript = document.getElementById("windy-api-script");
    if (existingScript) {
      existingScript.remove();
    }

    // Remove existing Windy styles
    const existingStyles = document.querySelectorAll('link[href*="windy"]');
    existingStyles.forEach(s => s.remove());

    // Reset Windy globals
    if (window.windyInit) delete (window as any).windyInit;
    if (window.W) delete (window as any).W;

    // Clear container
    const container = document.getElementById("windy");
    if (container) {
      container.innerHTML = '';
    }

    // Create new script
    const script = document.createElement("script");
    script.id = "windy-api-script";
    script.src = "https://api.windy.com/assets/map-forecast/libBoot.js";
    script.async = true;
    
    script.onload = () => {
      console.log('[WindyMapPlugin] Windy script loaded successfully');
      // Wait a bit for windyInit to be defined
      setTimeout(initializeWindy, 100);
    };
    
    script.onerror = (e) => {
      console.error('[WindyMapPlugin] Script load error:', e);
      if (mountedRef.current) {
        setError("Falha ao carregar o script do Windy. Verifique sua conexão.");
        setIsLoading(false);
      }
    };
    
    document.head.appendChild(script);
  }, [initializeWindy]);

  // Load script on mount
  useEffect(() => {
    mountedRef.current = true;
    
    // Small delay to ensure container is in DOM
    const timer = setTimeout(() => {
      loadWindyScript();
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      
      // Cleanup script on unmount
      const script = document.getElementById("windy-api-script");
      if (script) script.remove();
    };
  }, [loadWindyScript]);

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
      initializingRef.current = false;
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

  return (
    <Card className={`bg-slate-900/80 border-white/10 ${className}`}>
      {showControls && (
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <CurrentIcon className="h-4 w-4 text-cyan-400" />
              Mapa Windy
              <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400/50 ml-2">
                <MapPin className="h-3 w-3 mr-1" />
                {latitude.toFixed(2)}, {longitude.toFixed(2)}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={currentOverlay} onValueChange={setCurrentOverlay}>
                <SelectTrigger className="w-32 h-8 bg-slate-800 border-white/20 text-white text-xs">
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
                title="Atualizar"
              >
                <RefreshCw className="h-3 w-3" />
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
      <CardContent className="p-0">
        <div 
          ref={containerRef} 
          className="relative rounded-b-lg overflow-hidden" 
          style={{ height, minHeight: '450px' }}
        >
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 z-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-400" />
                <p className="text-base text-white font-medium">Carregando Windy Map...</p>
                <p className="text-sm text-white/60 mt-2">Conectando aos servidores de meteorologia</p>
              </div>
            </div>
          )}
          
          {/* Error overlay */}
          {error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 z-20">
              <div className="text-center p-6 max-w-md">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <p className="text-base text-red-400 font-medium mb-4">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  className="border-red-400/50 text-red-400 hover:bg-red-400/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
                <p className="text-xs text-white/40 mt-4">
                  Se o problema persistir, verifique sua conexão com a internet
                </p>
              </div>
            </div>
          )}
          
          {/* 
            CRITICAL: Windy API REQUIRES the container to have id="windy"
            This is a requirement of the Windy API, not optional
          */}
          <div 
            id="windy"
            className="w-full h-full bg-slate-800"
            style={{ height: '100%', minHeight: '450px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WindyMapPlugin;
