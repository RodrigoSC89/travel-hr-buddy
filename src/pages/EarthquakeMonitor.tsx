/**
 * Earthquake Monitor Page
 * Real-time earthquake monitoring via USGS/NOAA API
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MapPin, Clock, RefreshCw, Activity, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface Earthquake {
  id: string;
  magnitude: number;
  location: string;
  depth: number;
  time: string;
  coordinates: { lat: number; lng: number };
  tsunami: boolean;
}

const getMagnitudeColor = (mag: number): string => {
  if (mag >= 7) return "bg-destructive";
  if (mag >= 5) return "bg-warning";
  if (mag >= 3) return "bg-warning";
  return "bg-success";
};

const getMagnitudeLabel = (mag: number): string => {
  if (mag >= 7) return "Maior";
  if (mag >= 5) return "Moderado";
  if (mag >= 3) return "Leve";
  return "Micro";
};

export default function EarthquakeMonitor() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all_day");
  const [minMagnitude, setMinMagnitude] = useState<string>("2.5");
  const [selectedQuake, setSelectedQuake] = useState<Earthquake | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchEarthquakes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("noaa-earthquake", {
        body: { 
          type: filter, 
          minMagnitude: parseFloat(minMagnitude) 
        }
      });

      if (error) throw error;

      if (data?.features) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- USGS GeoJSON feature shape is dynamic
        const formatted: Earthquake[] = data.features.map((f: Record<string, any>) => ({
          id: f.id,
          magnitude: f.properties.mag,
          location: f.properties.place,
          depth: f.geometry.coordinates[2],
          time: new Date(f.properties.time).toISOString(),
          coordinates: {
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0]
          },
          tsunami: f.properties.tsunami === 1
        }));
        
        setEarthquakes(formatted);
        setLastUpdate(new Date().toLocaleString("pt-BR"));
        toast.success(`${formatted.length} eventos sísmicos carregados`);
      }
    } catch (err) {
      logger.error("Error fetching earthquakes:", err);
      toast.error("Erro ao carregar dados sísmicos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarthquakes();
  }, [filter, minMagnitude]);

  const stats = {
    total: earthquakes.length,
    major: earthquakes.filter(eq => eq.magnitude >= 5).length,
    tsunami: earthquakes.filter(eq => eq.tsunami).length,
    avgMagnitude: earthquakes.length > 0 
      ? (earthquakes.reduce((acc, eq) => acc + eq.magnitude, 0) / earthquakes.length).toFixed(1)
      : "0",
  };

  const filteredQuakes = earthquakes.slice(0, 50); // Show top 50

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Earthquake Monitor</h1>
            <p className="text-muted-foreground">Monitoramento sísmico em tempo real via USGS</p>
          </div>
        </div>
        <Button onClick={fetchEarthquakes} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Eventos</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
         <Card className={stats.major > 0 ? "border-warning/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Magnitude 5+</p>
                <p className="text-3xl font-bold text-warning">{stats.major}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
         <Card className={stats.tsunami > 0 ? "border-destructive/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alerta Tsunami</p>
                <p className="text-3xl font-bold text-destructive">{stats.tsunami}</p>
              </div>
              <Activity className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Magnitude</p>
                <p className="text-3xl font-bold">{stats.avgMagnitude}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Eventos Sísmicos</CardTitle>
            <div className="flex gap-3">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_hour">Última hora</SelectItem>
                  <SelectItem value="all_day">Últimas 24h</SelectItem>
                  <SelectItem value="all_week">Última semana</SelectItem>
                  <SelectItem value="significant_month">Significativos (mês)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={minMagnitude} onValueChange={setMinMagnitude}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Min. Mag." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Mag ≥ 1.0</SelectItem>
                  <SelectItem value="2.5">Mag ≥ 2.5</SelectItem>
                  <SelectItem value="4">Mag ≥ 4.0</SelectItem>
                  <SelectItem value="5">Mag ≥ 5.0</SelectItem>
                  <SelectItem value="6">Mag ≥ 6.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {lastUpdate && (
            <CardDescription>Última atualização: {lastUpdate}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Carregando dados sísmicos...</span>
            </div>
          ) : filteredQuakes.length > 0 ? (
            filteredQuakes.map((quake) => (
              <div
                key={quake.id}
                className={`p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors ${
                  quake.tsunami ? "border-destructive/50 bg-destructive/5" : "bg-muted/30"
                } ${selectedQuake?.id === quake.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedQuake(quake)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full ${getMagnitudeColor(quake.magnitude)} flex items-center justify-center text-white`}>
                      <div className="text-center">
                        <p className="text-xl font-bold">{quake.magnitude.toFixed(1)}</p>
                        <p className="text-xs">mag</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{quake.location || "Localização desconhecida"}</h4>
                        {quake.tsunami && (
                          <Badge variant="destructive" className="animate-pulse">
                            🌊 TSUNAMI
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {quake.depth.toFixed(1)} km profundidade
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(quake.time).toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{getMagnitudeLabel(quake.magnitude)}</Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum evento encontrado</p>
              <p className="text-muted-foreground">Ajuste os filtros para ver mais eventos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Quake Details */}
      {selectedQuake && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Detalhes do Evento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{selectedQuake.magnitude.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Magnitude</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{selectedQuake.depth.toFixed(1)} km</p>
                <p className="text-sm text-muted-foreground">Profundidade</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-lg font-bold">{selectedQuake.coordinates.lat.toFixed(4)}°</p>
                <p className="text-sm text-muted-foreground">Latitude</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-lg font-bold">{selectedQuake.coordinates.lng.toFixed(4)}°</p>
                <p className="text-sm text-muted-foreground">Longitude</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
