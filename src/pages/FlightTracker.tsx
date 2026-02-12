/**
 * Flight Tracker Page
 * Real-time flight tracking via Edge Function
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plane, Search, RefreshCw, MapPin, Clock, Gauge, ArrowUp, Loader2, Navigation } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface FlightInfo {
  flightNumber: string;
  airline: string;
  origin: { code: string; name: string; city: string };
  destination: { code: string; name: string; city: string };
  status: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  aircraft: string;
  position?: {
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    heading: number;
  };
  gate?: {
    departure: string;
    arrival: string;
  };
}

const statusColors: Record<string, string> = {
  "Scheduled": "bg-muted",
  "Departed": "bg-success",
  "En Route": "bg-info",
  "Landed": "bg-accent",
  "Delayed": "bg-warning",
  "Cancelled": "bg-destructive",
};

const statusLabels: Record<string, string> = {
  "Scheduled": "Programado",
  "Departed": "Decolou",
  "En Route": "Em Voo",
  "Landed": "Pousou",
  "Delayed": "Atrasado",
  "Cancelled": "Cancelado",
};

export default function FlightTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [flight, setFlight] = useState<FlightInfo | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [origin, setOrigin] = useState("GRU");
  const [destination, setDestination] = useState("JFK");

  const handleTrackFlight = async () => {
    if (!searchQuery.trim()) {
      toast.error("Digite o número do voo");
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("flight-tracker", {
        body: { 
          operation: "track-flight",
          flightNumber: searchQuery.toUpperCase()
        }
      });

      if (error) throw error;

      if (data?.flight) {
        setFlight(data.flight);
        toast.success(`Voo ${data.flight.flightNumber} encontrado`);
      } else {
        toast.error("Voo não encontrado");
      }
    } catch (err) {
      logger.error("Error tracking flight:", err);
      toast.error("Erro ao rastrear voo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchFlights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("flight-tracker", {
        body: { 
          operation: "search-flights",
          origin,
          destination,
          date: new Date().toISOString().split("T")[0]
        }
      });

      if (error) throw error;

      if (data?.flights) {
        setSearchResults(data.flights);
        toast.success(`${data.flights.length} voos encontrados`);
      }
    } catch (err) {
      logger.error("Error searching flights:", err);
      toast.error("Erro ao buscar voos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (flight) {
      handleTrackFlight();
    } else {
      handleSearchFlights();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Plane className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Flight Tracker</h1>
            <p className="text-muted-foreground">Rastreamento de voos em tempo real</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Track Flight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rastrear Voo
          </CardTitle>
          <CardDescription>Digite o número do voo para rastrear em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Ex: LA8084, G31234..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrackFlight()}
              className="flex-1"
            />
            <Button onClick={handleTrackFlight} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Rastrear</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Flight Details */}
      {flight && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                {flight.flightNumber}
              </CardTitle>
              <Badge className={statusColors[flight.status] || "bg-gray-500"}>
                {statusLabels[flight.status] || flight.status}
              </Badge>
            </div>
            <CardDescription>{flight.airline} • {flight.aircraft}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Route */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="text-center">
                <p className="text-2xl font-bold">{flight.origin.code}</p>
                <p className="text-sm text-muted-foreground">{flight.origin.city}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(flight.scheduledDeparture).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="h-px bg-border flex-1" />
                <Plane className="h-5 w-5 mx-2 text-primary" />
                <div className="h-px bg-border flex-1" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{flight.destination.code}</p>
                <p className="text-sm text-muted-foreground">{flight.destination.city}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(flight.scheduledArrival).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            {/* Position Data */}
            {flight.position && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <ArrowUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-lg font-bold">{flight.position.altitude.toLocaleString()} ft</p>
                  <p className="text-sm text-muted-foreground">Altitude</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Gauge className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-lg font-bold">{flight.position.speed} kts</p>
                  <p className="text-sm text-muted-foreground">Velocidade</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <Navigation className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-lg font-bold">{flight.position.heading}°</p>
                  <p className="text-sm text-muted-foreground">Heading</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium">
                    {flight.position.latitude.toFixed(2)}°, {flight.position.longitude.toFixed(2)}°
                  </p>
                  <p className="text-sm text-muted-foreground">Posição</p>
                </div>
              </div>
            )}

            {/* Gates */}
            {flight.gate && (
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Gate {flight.gate.departure}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Embarque</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    Gate {flight.gate.arrival}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Desembarque</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Flights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Buscar Voos por Rota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Origem</label>
              <Input
                placeholder="GRU"
                value={origin}
                onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                className="w-24"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Destino</label>
              <Input
                placeholder="JFK"
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                className="w-24"
                maxLength={3}
              />
            </div>
            <Button onClick={handleSearchFlights} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Buscar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map((result) => (
            <Card 
              key={result.flightNumber} 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => {
                setSearchQuery(result.flightNumber);
                handleTrackFlight();
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    {result.flightNumber}
                  </CardTitle>
                  <Badge variant="outline">
                    {result.stops === 0 ? "Direto" : `${result.stops} parada(s)`}
                  </Badge>
                </div>
                <CardDescription>{result.duration}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Partida:</span>
                  <span>{new Date(result.departure).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Chegada:</span>
                  <span>{new Date(result.arrival).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço:</span>
                  <span className="font-medium text-green-500">
                    R$ {result.price?.economy?.toLocaleString() || "---"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
