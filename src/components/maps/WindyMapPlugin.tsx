/**
 * Windy Map Plugin Component
 * Embeds interactive Windy weather map with full plugin features
 * PATCH WINDY-3.0: Complete rewrite with proper Windy API integration
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, Wind, Waves, Thermometer, Loader2, RefreshCw, Maximize2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [apiKey, setApiKey] = useState<string>("");
  const initAttemptRef = useRef(0);
  const scriptLoadedRef = useRef(false);

  // Fetch Windy API key from Supabase secrets
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // Try to get from Supabase Edge Function
        const { data, error: fnError } = await supabase.functions.invoke("mapbox-token", {
          body: { type: "windy" }
        });
        
        if (!fnError && data?.windyToken) {
          setApiKey(data.windyToken);
          return;
        }

        // Fallback to environment variable
        const envKey = import.meta.env.VITE_WINDY_API_KEY;
        if (envKey) {
          setApiKey(envKey);
          return;
        }

        // Fallback to hardcoded public demo key
        // This is the official Windy demo key for development
        setApiKey("5XejbCIAVmWgaG78DrWz0BkwEuyl6rrV");
      } catch (err) {
        console.warn('[WindyMapPlugin] Using fallback API key');
        setApiKey("5XejbCIAVmWgaG78DrWz0BkwEuyl6rrV");
      }
    };

    fetchApiKey();
  }, []);

  // Initialize Windy after script loads
  const initializeWindy = useCallback(() => {
    if (!apiKey || !windyContainerRef.current) return;

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
        key: apiKey,
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
  }, [apiKey, latitude, longitude, zoom, currentOverlay, onMapReady]);

  // Load Windy script
  const loadWindyScript = useCallback(() => {
    if (!apiKey) return;
    
    setIsLoading(true);
    setError(null);
    initAttemptRef.current = 0;

    // Remove existing script if any
    const existingScript = document.getElementById("windy-api-script");
    if (existingScript) {
      existingScript.remove();
    }

    // Also remove existing Windy container content
    if (windyContainerRef.current) {
      windyContainerRef.current.innerHTML = '';
    }

    // Reset Windy global
    window.windyInit = undefined;
    window.W = undefined;

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
  }, [apiKey, initializeWindy]);

  // Load script when API key is available
  useEffect(() => {
    if (apiKey) {
      loadWindyScript();
    }

    return () => {
      // Cleanup on unmount
      const script = document.getElementById("windy-api-script");
      if (script) script.remove();
    };
  }, [apiKey, loadWindyScript]);

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
      // Reload script
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
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <CurrentIcon className="h-5 w-5 text-cyan-400" />
              Mapa Windy
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400/50">
                Windy API
              </Badge>
              <Select value={currentOverlay} onValueChange={setCurrentOverlay}>
                <SelectTrigger className="w-32 bg-slate-800 border-white/20 text-white">
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
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleFullscreen}
                className="border-white/20 text-white hover:bg-white/10"
              >
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
          
          {/* Windy map container - must have id="windy" for the API */}
          <div 
            ref={windyContainerRef}
            id="windy" 
            className="w-full h-full bg-slate-800"
            style={{ minHeight: height }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WindyMapPlugin;
