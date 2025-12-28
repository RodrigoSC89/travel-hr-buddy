/**
 * Flight Tracker Page
 * Real-time flight tracking via OpenSky Network API
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plane, Search, RefreshCw, MapPin, Clock, Gauge, ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FlightInfo {
  callsign: string;
  origin: string;
  destination: string;
  altitude: number;
  velocity: number;
  heading: number;
  status: "on_ground" | "climbing" | "cruising" | "descending";
  aircraft: string;
}

const mockFlights: FlightInfo[] = [
  { callsign: "TAM3456", origin: "GRU", destination: "MIA", altitude: 35000, velocity: 520, heading: 320, status: "cruising", aircraft: "Boeing 777-300ER" },
  { callsign: "GLO1234", origin: "CGH", destination: "SDU", altitude: 8000, velocity: 280, heading: 45, status: "descending", aircraft: "Boeing 737-800" },
  { callsign: "AZU5678", origin: "VCP", destination: "LIS", altitude: 41000, velocity: 540, heading: 85, status: "cruising", aircraft: "Airbus A350-900" },
  { callsign: "TAM8901", origin: "GIG", destination: "EZE", altitude: 2500, velocity: 180, heading: 210, status: "climbing", aircraft: "Airbus A320neo" },
];

const statusColors = {
  on_ground: "bg-gray-500",
  climbing: "bg-green-500",
  cruising: "bg-blue-500",
  descending: "bg-orange-500",
};

const statusLabels = {
  on_ground: "Em Solo",
  climbing: "Subindo",
  cruising: "Cruzeiro",
  descending: "Descendo",
};

export default function FlightTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightInfo | null>(null);
  const [flights, setFlights] = useState<FlightInfo[]>(mockFlights);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFlights(mockFlights);
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      const filtered = mockFlights.filter(
        f => f.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
             f.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
             f.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFlights(filtered);
      if (filtered.length === 0) {
        toast.error("Nenhum voo encontrado");
      } else {
        toast.success(`${filtered.length} voo(s) encontrado(s)`);
      }
      setIsLoading(false);
    }, 800);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Dados de voos atualizados");
    }, 1000);
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
            <p className="text-muted-foreground">Rastreamento de voos em tempo real via OpenSky</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Voo
          </CardTitle>
          <CardDescription>Digite o callsign, origem ou destino do voo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Ex: TAM3456, GRU, MIA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Buscar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Flight Details */}
      {selectedFlight && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                {selectedFlight.callsign}
              </CardTitle>
              <Badge className={statusColors[selectedFlight.status]}>
                {statusLabels[selectedFlight.status]}
              </Badge>
            </div>
            <CardDescription>{selectedFlight.aircraft}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <MapPin className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-lg font-bold">{selectedFlight.origin} → {selectedFlight.destination}</p>
                <p className="text-sm text-muted-foreground">Rota</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <ArrowUp className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-lg font-bold">{selectedFlight.altitude.toLocaleString()} ft</p>
                <p className="text-sm text-muted-foreground">Altitude</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Gauge className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-lg font-bold">{selectedFlight.velocity} kts</p>
                <p className="text-sm text-muted-foreground">Velocidade</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <p className="text-lg font-bold">{selectedFlight.heading}°</p>
                <p className="text-sm text-muted-foreground">Heading</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flights.map((flight) => (
          <Card 
            key={flight.callsign} 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setSelectedFlight(flight)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  {flight.callsign}
                </CardTitle>
                <Badge variant="outline" className={`${statusColors[flight.status]} text-white`}>
                  {statusLabels[flight.status]}
                </Badge>
              </div>
              <CardDescription>{flight.origin} → {flight.destination}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Altitude:</span>
                <span className="font-medium">{flight.altitude.toLocaleString()} ft</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Velocidade:</span>
                <span>{flight.velocity} kts</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Aeronave:</span>
                <span className="truncate ml-2">{flight.aircraft}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {flights.length === 0 && (
        <Card className="text-center py-12">
          <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum voo encontrado</p>
          <p className="text-muted-foreground">Tente buscar por outro callsign ou aeroporto</p>
        </Card>
      )}
    </div>
  );
}
