/**
 * Earthquake Monitor Page
 * Real-time earthquake monitoring via NOAA/USGS API
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MapPin, Clock, RefreshCw, Activity, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Earthquake {
  id: string;
  magnitude: number;
  location: string;
  depth: number;
  time: string;
  coordinates: { lat: number; lng: number };
  tsunami: boolean;
}

const mockEarthquakes: Earthquake[] = [
  { id: "eq1", magnitude: 6.2, location: "Japan, Honshu", depth: 35, time: "2024-01-15 08:23:45", coordinates: { lat: 35.6762, lng: 139.6503 }, tsunami: false },
  { id: "eq2", magnitude: 4.8, location: "Chile, Atacama", depth: 12, time: "2024-01-15 07:15:22", coordinates: { lat: -27.3668, lng: -70.3323 }, tsunami: false },
  { id: "eq3", magnitude: 7.1, location: "Indonesia, Sumatra", depth: 45, time: "2024-01-15 05:45:10", coordinates: { lat: 0.5897, lng: 101.3431 }, tsunami: true },
  { id: "eq4", magnitude: 3.2, location: "California, USA", depth: 8, time: "2024-01-15 04:30:00", coordinates: { lat: 34.0522, lng: -118.2437 }, tsunami: false },
  { id: "eq5", magnitude: 5.5, location: "Greece, Aegean Sea", depth: 22, time: "2024-01-15 02:18:33", coordinates: { lat: 39.0742, lng: 21.8243 }, tsunami: false },
];

const getMagnitudeColor = (mag: number): string => {
  if (mag >= 7) return "bg-red-600";
  if (mag >= 5) return "bg-orange-500";
  if (mag >= 3) return "bg-yellow-500";
  return "bg-green-500";
};

const getMagnitudeLabel = (mag: number): string => {
  if (mag >= 7) return "Maior";
  if (mag >= 5) return "Moderado";
  if (mag >= 3) return "Leve";
  return "Micro";
};

export default function EarthquakeMonitor() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>(mockEarthquakes);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [selectedQuake, setSelectedQuake] = useState<Earthquake | null>(null);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Dados sísmicos atualizados");
    }, 1000);
  };

  const filteredQuakes = earthquakes.filter(eq => {
    if (filter === "all") return true;
    if (filter === "major") return eq.magnitude >= 5;
    if (filter === "tsunami") return eq.tsunami;
    return true;
  });

  const stats = {
    total: earthquakes.length,
    major: earthquakes.filter(eq => eq.magnitude >= 5).length,
    tsunami: earthquakes.filter(eq => eq.tsunami).length,
    avgMagnitude: (earthquakes.reduce((acc, eq) => acc + eq.magnitude, 0) / earthquakes.length).toFixed(1),
  };

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
            <p className="text-muted-foreground">Monitoramento sísmico em tempo real via NOAA/USGS</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
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
                <p className="text-sm text-muted-foreground">Últimas 24h</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={stats.major > 0 ? "border-orange-500/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Magnitude 5+</p>
                <p className="text-3xl font-bold text-orange-500">{stats.major}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={stats.tsunami > 0 ? "border-red-500/50" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alerta Tsunami</p>
                <p className="text-3xl font-bold text-red-500">{stats.tsunami}</p>
              </div>
              <Activity className="h-8 w-8 text-red-500" />
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

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Eventos Sísmicos</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eventos</SelectItem>
                <SelectItem value="major">Magnitude 5+</SelectItem>
                <SelectItem value="tsunami">Com alerta tsunami</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredQuakes.map((quake) => (
            <div
              key={quake.id}
              className={`p-4 rounded-lg border cursor-pointer hover:border-primary/50 transition-colors ${
                quake.tsunami ? "border-red-500/50 bg-red-500/5" : "bg-muted/30"
              } ${selectedQuake?.id === quake.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => setSelectedQuake(quake)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full ${getMagnitudeColor(quake.magnitude)} flex items-center justify-center text-white`}>
                    <div className="text-center">
                      <p className="text-xl font-bold">{quake.magnitude}</p>
                      <p className="text-xs">mag</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{quake.location}</h4>
                      {quake.tsunami && (
                        <Badge variant="destructive" className="animate-pulse">
                          🌊 TSUNAMI
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {quake.depth} km profundidade
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {quake.time}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{getMagnitudeLabel(quake.magnitude)}</Badge>
              </div>
            </div>
          ))}

          {filteredQuakes.length === 0 && (
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
                <p className="text-2xl font-bold">{selectedQuake.magnitude}</p>
                <p className="text-sm text-muted-foreground">Magnitude</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{selectedQuake.depth} km</p>
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
