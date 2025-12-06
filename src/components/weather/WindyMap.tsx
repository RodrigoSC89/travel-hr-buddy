import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Map, Wind, Thermometer, Droplets, Waves, Cloud } from "lucide-react";

interface WindyMapProps {
  lat?: number;
  lon?: number;
  location?: string;
}

type LayerType = "wind" | "temp" | "rain" | "clouds" | "waves" | "pressure";

const layers: { id: LayerType; label: string; icon: React.ElementType }[] = [
  { id: "wind", label: "Vento", icon: Wind },
  { id: "temp", label: "Temperatura", icon: Thermometer },
  { id: "rain", label: "Precipitação", icon: Droplets },
  { id: "clouds", label: "Nuvens", icon: Cloud },
  { id: "waves", label: "Ondas", icon: Waves },
];

export const WindyMap: React.FC<WindyMapProps> = ({ 
  lat = -23.9608, 
  lon = -46.3335,
  location = "Santos, BR"
}) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("wind");
  const [zoom, setZoom] = useState(6);

  // Windy embed URL with parameters
  const getWindyUrl = () => {
    const baseUrl = "https://embed.windy.com/embed2.html";
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      detailLat: lat.toString(),
      detailLon: lon.toString(),
      width: "100%",
      height: "100%",
      zoom: zoom.toString(),
      level: "surface",
      overlay: selectedLayer,
      product: "ecmwf",
      menu: "",
      message: "true",
      marker: "",
      calendar: "now",
      pressure: "true",
      type: "map",
      location: "coordinates",
      detail: "true",
      metricWind: "kt",
      metricTemp: "°C",
      radarRange: "-1",
    });
    return `${baseUrl}?${params.toString()}`;
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
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            Ao vivo
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Layer Controls */}
        <div className="p-4 bg-muted/30 border-b flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Camada:</span>
            <div className="flex gap-1">
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

        {/* Windy Map Embed */}
        <div className="relative h-[500px] w-full">
          <iframe
            src={getWindyUrl()}
            className="absolute inset-0 w-full h-full border-0"
            title="Windy Weather Map"
            loading="lazy"
            allowFullScreen
          />
        </div>

        {/* Legend */}
        <div className="p-4 bg-muted/30 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
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
              {selectedLayer === "waves" && (
                <>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-cyan-300 rounded" /> 0-1m
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-cyan-500 rounded" /> 1-2m
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-blue-500 rounded" /> 2-4m
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-purple-500 rounded" /> 4m+
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
