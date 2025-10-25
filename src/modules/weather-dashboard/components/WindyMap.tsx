/**
 * Windy Map Component
 * Integrates Windy.com API for weather visualization
 * Patch 143.1 - Enhanced with lazy loading and dynamic overlays
 */

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Waves, CloudRain, Thermometer, Gauge } from "lucide-react";
import { logger } from "@/lib/logger";

export type WindyOverlay = 'wind' | 'waves' | 'rain' | 'temp' | 'pressure' | 'clouds';

interface WindyMapProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  overlay?: WindyOverlay;
  height?: number;
  onOverlayChange?: (overlay: WindyOverlay) => void;
}

export const WindyMap: React.FC<WindyMapProps> = ({
  latitude = -15,
  longitude = -45,
  zoom = 5,
  overlay = 'wind',
  height = 500,
  onOverlayChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentOverlay, setCurrentOverlay] = useState<WindyOverlay>(overlay);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const windyInstanceRef = useRef<any>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Lazy load Windy script only when component mounts
  useEffect(() => {
    if (isScriptLoading || isLoaded) return;

    const loadWindyScript = () => {
      setIsScriptLoading(true);
      logger.info("Loading Windy API script");

      const script = document.createElement('script');
      script.src = 'https://api.windy.com/assets/map-forecast/libBoot.js';
      script.async = true;
      scriptRef.current = script;
      
      script.onload = () => {
        logger.info("Windy API script loaded successfully");
        setIsLoaded(true);
        setIsScriptLoading(false);
        initWindy();
      };

      script.onerror = () => {
        logger.error("Failed to load Windy API script");
        setIsScriptLoading(false);
      };

      document.body.appendChild(script);
    };

    // Use IntersectionObserver for lazy loading when component is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.length > 0 && entries[0].isIntersecting) {
          loadWindyScript();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      // Cleanup script on unmount
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, [isScriptLoading, isLoaded]);

  const initWindy = () => {
    if (!containerRef.current) return;

    const options = {
      key: 'windy-demo-key', // In production, use actual API key from env
      lat: latitude,
      lon: longitude,
      zoom: zoom,
    };

    // @ts-ignore - Windy API types
    if (window.windyInit) {
      // @ts-ignore
      window.windyInit(options, (windyAPI: any) => {
        const { map, store } = windyAPI;
        windyInstanceRef.current = windyAPI;
        
        // Set initial overlay
        store.set('overlay', currentOverlay);
        logger.info(`Windy map initialized with ${currentOverlay} overlay`);
      });
    }
  };

  const handleOverlayChange = (newOverlay: WindyOverlay) => {
    setCurrentOverlay(newOverlay);
    onOverlayChange?.(newOverlay);

    // Update Windy overlay if instance exists
    if (windyInstanceRef.current) {
      const { store } = windyInstanceRef.current;
      store.set('overlay', newOverlay);
      logger.debug(`Switched to ${newOverlay} overlay`);
    }
  };

  const overlayOptions: Array<{ value: WindyOverlay; label: string; icon: React.ReactNode }> = [
    { value: 'wind', label: 'Vento', icon: <Wind className="h-4 w-4" /> },
    { value: 'waves', label: 'Ondas', icon: <Waves className="h-4 w-4" /> },
    { value: 'rain', label: 'Chuva', icon: <CloudRain className="h-4 w-4" /> },
    { value: 'temp', label: 'Temperatura', icon: <Thermometer className="h-4 w-4" /> },
    { value: 'pressure', label: 'Pressão', icon: <Gauge className="h-4 w-4" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5" />
            Mapa Meteorológico
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {overlayOptions.map((option) => (
              <Button
                key={option.value}
                variant={currentOverlay === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleOverlayChange(option.value)}
                disabled={!isLoaded}
              >
                {option.icon}
                <span className="ml-2 hidden sm:inline">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isScriptLoading && (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando mapa meteorológico...</p>
            </div>
          </div>
        )}
        <div 
          ref={containerRef}
          id="windy"
          style={{ 
            height,
            width: '100%',
            borderRadius: '8px',
            overflow: 'hidden',
            display: isLoaded ? 'block' : 'none',
          }}
        />
        {!isLoaded && !isScriptLoading && (
          <div 
            className="bg-muted rounded-lg flex items-center justify-center"
            style={{ height }}
          >
            <div className="text-center space-y-2">
              <Wind className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Mapa Windy será carregado aqui
              </p>
              <p className="text-xs text-muted-foreground">
                Camada atual: {overlayOptions.find(o => o.value === currentOverlay)?.label}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Alternative simple embed version using iframe (fallback)
export const WindyMapEmbed: React.FC<WindyMapProps> = ({
  latitude = -15,
  longitude = -45,
  zoom = 5,
  overlay = 'wind',
  height = 500,
}) => {
  const embedUrl = `https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&detailLat=${latitude}&detailLon=${longitude}&width=100%&height=${height}&zoom=${zoom}&level=surface&overlay=${overlay}&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5" />
          Mapa Meteorológico (Windy)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
          frameBorder="0"
          style={{ borderRadius: '8px' }}
          title="Windy Weather Map"
        />
      </CardContent>
    </Card>
  );
};
