/**
 * Windy Map Plugin Component
 * PATCH WINDY-5.0: Fixed Leaflet loading + Mapbox fallback
 * 
 * Requirements:
 * 1. Leaflet MUST be loaded before libBoot.js
 * 2. Container MUST have id="windy"
 * 3. windyInit should only be called once per app lifetime
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, Wind, Waves, Thermometer, Loader2, RefreshCw, Maximize2, AlertCircle, MapPin, Map } from "lucide-react";
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

// Global state to track Windy initialization
let windyInitialized = false;
let windyAPI: any = null;

// Declare global Windy types
declare global {
  interface Window {
    windyInit?: (options: any, callback: (api: any) => void) => void;
    W?: any;
    L?: any;
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
  const mapboxContainerRef = useRef<HTMLDivElement>(null);
  const mapboxMapRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOverlay, setCurrentOverlay] = useState<string>(overlay);
  const [localWindyAPI, setLocalWindyAPI] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  
  const initAttemptRef = useRef(0);
  const mountedRef = useRef(true);
  const leafletLoadedRef = useRef(false);
  const windyScriptLoadedRef = useRef(false);

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
        console.warn('[WindyMapPlugin] Could not fetch Mapbox token for fallback');
      }
    };
    fetchToken();
  }, []);

  // Load Leaflet CSS and JS first
  const loadLeaflet = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if Leaflet is already loaded
      if (window.L) {
        console.log('[WindyMapPlugin] Leaflet already loaded');
        leafletLoadedRef.current = true;
        resolve();
        return;
      }

      // Load Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const leafletCSS = document.createElement('link');
        leafletCSS.id = 'leaflet-css';
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.4.0/dist/leaflet.css';
        document.head.appendChild(leafletCSS);
      }

      // Load Leaflet JS
      const existingScript = document.getElementById('leaflet-js');
      if (existingScript) {
        existingScript.remove();
      }

      const leafletScript = document.createElement('script');
      leafletScript.id = 'leaflet-js';
      leafletScript.src = 'https://unpkg.com/leaflet@1.4.0/dist/leaflet.js';
      leafletScript.async = true;
      
      leafletScript.onload = () => {
        console.log('[WindyMapPlugin] Leaflet loaded successfully');
        leafletLoadedRef.current = true;
        resolve();
      };
      
      leafletScript.onerror = () => {
        console.error('[WindyMapPlugin] Failed to load Leaflet');
        reject(new Error('Failed to load Leaflet'));
      };
      
      document.head.appendChild(leafletScript);
    });
  }, []);

  // Load Windy script (after Leaflet)
  const loadWindyScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.windyInit) {
        console.log('[WindyMapPlugin] Windy already loaded');
        windyScriptLoadedRef.current = true;
        resolve();
        return;
      }

      const existingScript = document.getElementById('windy-api-script');
      if (existingScript) {
        existingScript.remove();
      }

      const windyScript = document.createElement('script');
      windyScript.id = 'windy-api-script';
      windyScript.src = 'https://api.windy.com/assets/map-forecast/libBoot.js';
      windyScript.async = true;
      
      windyScript.onload = () => {
        console.log('[WindyMapPlugin] Windy script loaded');
        windyScriptLoadedRef.current = true;
        resolve();
      };
      
      windyScript.onerror = () => {
        console.error('[WindyMapPlugin] Failed to load Windy script');
        reject(new Error('Failed to load Windy script'));
      };
      
      document.head.appendChild(windyScript);
    });
  }, []);

  // Initialize Windy
  const initializeWindy = useCallback(() => {
    const container = document.getElementById('windy');
    if (!container) {
      console.warn('[WindyMapPlugin] Container #windy not found');
      return;
    }

    // If already initialized globally, reuse
    if (windyInitialized && windyAPI) {
      console.log('[WindyMapPlugin] Reusing existing Windy instance');
      setLocalWindyAPI(windyAPI);
      setIsLoading(false);
      
      // Update view
      if (windyAPI.map) {
        windyAPI.map.setView([latitude, longitude], zoom);
      }
      if (windyAPI.store) {
        windyAPI.store.set('overlay', currentOverlay);
      }
      onMapReady?.(windyAPI);
      return;
    }

    // Wait for windyInit to be available
    if (!window.windyInit) {
      if (initAttemptRef.current < 100) {
        initAttemptRef.current++;
        setTimeout(initializeWindy, 100);
        return;
      } else {
        console.error('[WindyMapPlugin] windyInit not available after 10s');
        if (mountedRef.current) {
          setError("Windy API não respondeu. Usando mapa alternativo.");
          setUseFallback(true);
          setIsLoading(false);
        }
        return;
      }
    }

    try {
      console.log('[WindyMapPlugin] Calling windyInit...');
      
      window.windyInit({
        key: WINDY_API_KEY,
        verbose: false,
        lat: latitude,
        lon: longitude,
        zoom: zoom,
        overlay: currentOverlay,
      }, (api: any) => {
        if (!mountedRef.current) return;
        
        console.log('[WindyMapPlugin] Windy initialized successfully!');
        windyInitialized = true;
        windyAPI = api;
        setLocalWindyAPI(api);
        setIsLoading(false);
        setError(null);
        onMapReady?.(api);
      });
    } catch (err) {
      console.error('[WindyMapPlugin] Error initializing Windy:', err);
      if (mountedRef.current) {
        setError("Erro ao inicializar Windy. Usando mapa alternativo.");
        setUseFallback(true);
        setIsLoading(false);
      }
    }
  }, [latitude, longitude, zoom, currentOverlay, onMapReady]);

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
      console.error('[WindyMapPlugin] Mapbox fallback failed:', err);
      setError("Não foi possível carregar nenhum mapa.");
      setIsLoading(false);
    }
  }, [mapboxToken, latitude, longitude, zoom, currentOverlay]);

  // Main initialization effect
  useEffect(() => {
    mountedRef.current = true;
    initAttemptRef.current = 0;

    const init = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Load Leaflet first (required by Windy)
        await loadLeaflet();
        
        // Step 2: Load Windy script
        await loadWindyScript();
        
        // Step 3: Initialize Windy
        // Small delay to ensure windyInit is defined
        setTimeout(() => {
          initializeWindy();
        }, 300);
        
      } catch (err) {
        console.error('[WindyMapPlugin] Initialization failed:', err);
        if (mountedRef.current) {
          setError("Falha ao carregar Windy. Usando mapa alternativo.");
          setUseFallback(true);
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;
    };
  }, [loadLeaflet, loadWindyScript, initializeWindy]);

  // Initialize fallback when needed
  useEffect(() => {
    if (useFallback && mapboxToken) {
      initializeMapboxFallback();
    }
  }, [useFallback, mapboxToken, initializeMapboxFallback]);

  // Update overlay
  useEffect(() => {
    if (localWindyAPI?.store) {
      try {
        localWindyAPI.store.set('overlay', currentOverlay);
      } catch (e) {
        console.warn('[WindyMapPlugin] Failed to change overlay:', e);
      }
    }
  }, [currentOverlay, localWindyAPI]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (useFallback) {
      initializeMapboxFallback();
    } else if (localWindyAPI?.map) {
      localWindyAPI.map.setView([latitude, longitude], zoom);
    } else {
      // Full reload
      setIsLoading(true);
      setError(null);
      setUseFallback(false);
      initAttemptRef.current = 0;
      
      setTimeout(() => {
        initializeWindy();
      }, 100);
    }
  }, [useFallback, localWindyAPI, latitude, longitude, zoom, initializeWindy, initializeMapboxFallback]);

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

  const CurrentIcon = OVERLAY_OPTIONS.find(o => o.value === currentOverlay)?.icon || Wind;

  return (
    <Card className={`bg-slate-900/80 border-white/10 ${className}`}>
      {showControls && (
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <CurrentIcon className="h-4 w-4 text-cyan-400" />
              {useFallback ? 'Mapa Meteorológico' : 'Mapa Windy'}
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
                <p className="text-base text-white font-medium">
                  {useFallback ? 'Carregando mapa alternativo...' : 'Carregando Windy...'}
                </p>
                <p className="text-sm text-white/60 mt-2">
                  Conectando aos servidores de meteorologia
                </p>
              </div>
            </div>
          )}
          
          {/* Error overlay (only if no fallback available) */}
          {error && !isLoading && !useFallback && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 z-20">
              <div className="text-center p-6 max-w-md">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                <p className="text-base text-yellow-400 font-medium mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => setUseFallback(true)}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Usar mapa alternativo
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Windy container - MUST have id="windy" */}
          <div 
            id="windy"
            className="w-full h-full bg-slate-800"
            style={{ 
              height: '100%', 
              minHeight: '450px',
              display: useFallback ? 'none' : 'block'
            }}
          />

          {/* Mapbox fallback container */}
          {useFallback && (
            <div 
              ref={mapboxContainerRef}
              className="w-full h-full bg-slate-800"
              style={{ height: '100%', minHeight: '450px' }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WindyMapPlugin;
