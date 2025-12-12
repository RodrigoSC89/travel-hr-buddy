/**
import { useEffect, useRef, useState } from "react";;
 * Telemetry Map Component
 * Interactive map visualization for satellite and vessel positions
 */

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Satellite, 
  Ship, 
  RefreshCw, 
  Maximize2,
  Layers,
  MapPin
} from "lucide-react";
import { toast } from "sonner";

interface MapMarker {
  id: string;
  type: "satellite" | "vessel" | "weather";
  name: string;
  latitude: number;
  longitude: number;
  data?: unknown;
}

interface TelemetryMapProps {
  satellites?: unknown[];
  vessels?: unknown[];
  weatherPoints?: unknown[];
  onRefresh?: () => void;
}

export function TelemetryMap({ 
  satellites = [], 
  vessels = [], 
  weatherPoints = [],
  onRefresh 
}: TelemetryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Convert data to markers
  const markers: MapMarker[] = [
    ...satellites.map((s, idx) => ({
      id: `sat-${idx}`,
      type: "satellite" as const,
      name: s.source || `Satélite ${idx + 1}`,
      latitude: s.latitude || -23.5505 + Math.random() * 10,
      longitude: s.longitude || -46.6333 + Math.random() * 10,
      data: s,
    })),
    ...vessels.map((v, idx) => ({
      id: `vessel-${idx}`,
      type: "vessel" as const,
      name: v.normalized_data?.vessel_name || `Embarcação ${idx + 1}`,
      latitude: v.latitude || -23.5505 + Math.random() * 5,
      longitude: v.longitude || -46.6333 + Math.random() * 5,
      data: v,
    })),
    ...weatherPoints.map((w, idx) => ({
      id: `weather-${idx}`,
      type: "weather" as const,
      name: w.location_name || `Ponto ${idx + 1}`,
      latitude: w.latitude || -23.5505 + Math.random() * 8,
      longitude: w.longitude || -46.6333 + Math.random() * 8,
      data: w,
    })),
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && mapRef.current) {
      mapRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleRefresh = () => {
    onRefresh?.();
    toast.success("Posições atualizadas");
  };

  // Simulated map rendering
  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const getMarkerIcon = (type: string) => {
    switch (type) {
    case "satellite": return <Satellite className="h-4 w-4 text-purple-500" />;
    case "vessel": return <Ship className="h-4 w-4 text-blue-500" />;
    default: return <MapPin className="h-4 w-4 text-green-500" />;
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
    case "satellite": return "bg-purple-500";
    case "vessel": return "bg-blue-500";
    default: return "bg-green-500";
    }
  };

  return (
    <Card className="h-full" ref={mapRef}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Mapa de Posições
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              <Satellite className="h-3 w-3 mr-1" />
              {satellites.length} satélites
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Ship className="h-3 w-3 mr-1" />
              {vessels.length} embarcações
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Map Container */}
        <div className="relative h-[400px] bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
          {/* Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />

          {/* Markers */}
          {mapLoaded && markers.map((marker, idx) => {
            // Convert lat/lng to percentages for positioning
            const x = ((marker.longitude + 180) / 360) * 100;
            const y = ((90 - marker.latitude) / 180) * 100;
            
            return (
              <div
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125 z-10"
                style={{ 
                  left: `${20 + (idx * 8) % 60}%`, 
                  top: `${20 + (idx * 12) % 60}%` 
                }}
                onClick={() => setSelectedMarker(marker)}
              >
                <div className={`w-4 h-4 ${getMarkerColor(marker.type)} rounded-full animate-pulse`}>
                  <div className={`absolute inset-0 ${getMarkerColor(marker.type)} rounded-full animate-ping opacity-75`} />
                </div>
                <span className="absolute top-5 left-1/2 transform -translate-x-1/2 text-xs text-white/80 whitespace-nowrap">
                  {marker.name}
                </span>
              </div>
            );
          })}

          {/* Selected Marker Info */}
          {selectedMarker && (
            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 max-w-[250px] z-20">
              <div className="flex items-center gap-2 mb-2">
                {getMarkerIcon(selectedMarker.type)}
                <span className="font-medium">{selectedMarker.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 ml-auto"
                  onClick={() => setSelectedMarker(null)}
                >
                  ×
                </Button>
              </div>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>Lat: {selectedMarker.latitude.toFixed(4)}</p>
                <p>Lon: {selectedMarker.longitude.toFixed(4)}</p>
                {selectedMarker.type === "satellite" && selectedMarker.data && (
                  <>
                    <p>Fonte: {selectedMarker.data.source}</p>
                    <p>Tipo: {selectedMarker.data.data_type}</p>
                  </>
                )}
                {selectedMarker.type === "vessel" && selectedMarker.data?.normalized_data && (
                  <>
                    <p>Velocidade: {selectedMarker.data.normalized_data.speed} kt</p>
                    <p>Curso: {selectedMarker.data.normalized_data.course}°</p>
                  </>
                )}
                {selectedMarker.type === "weather" && selectedMarker.data && (
                  <>
                    <p>Temp: {selectedMarker.data.temperature}°C</p>
                    <p>Vento: {selectedMarker.data.wind_speed} kt</p>
                    <Badge variant={
                      selectedMarker.data.risk_level === "danger" ? "destructive" :
                        selectedMarker.data.risk_level === "warning" ? "default" :
                          "secondary"
                    } className="mt-1">
                      {selectedMarker.data.risk_level}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 z-20">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span>Satélite</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>Embarcação</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Clima</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Globe className="h-12 w-12 mx-auto mb-2 animate-spin" />
                <p>Carregando mapa...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
