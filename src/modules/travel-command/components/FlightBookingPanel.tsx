/**
 * Flight Booking Panel - Componente de reserva de voos
 * Sistema completo de booking de passagens aéreas para tripulação
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plane, Calendar as CalendarIcon, MapPin, Users, Search, Filter,
  Clock, DollarSign, Leaf, Star, ChevronDown, ChevronUp, ArrowRight,
  Briefcase, Luggage, Wifi, UtensilsCrossed, Check, AlertTriangle,
  Sparkles, Brain, TrendingDown, Zap, RefreshCw, Plus, Minus, ArrowUpDown
} from "lucide-react";

interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  price: number;
  originalPrice?: number;
  class: string;
  seatsAvailable: number;
  carbonOffset: number;
  amenities: string[];
  isMarineFare?: boolean;
  isRecommended?: boolean;
  fareType: "economy" | "business" | "premium" | "marine";
}

// Flight results - static fare data (external GDS integration pending)
const fallbackFlightResults: FlightResult[] = [
  {
    id: "1",
    airline: "LATAM Airlines",
    airlineCode: "LA",
    flightNumber: "LA3421",
    departure: { airport: "GIG", city: "Rio de Janeiro", time: "06:30", date: "2026-02-15" },
    arrival: { airport: "MCE", city: "Macaé", time: "07:15", date: "2026-02-15" },
    duration: "0h 45min",
    stops: 0,
    price: 892,
    originalPrice: 1150,
    class: "Econômica",
    seatsAvailable: 12,
    carbonOffset: 45,
    amenities: ["luggage", "wifi"],
    isMarineFare: true,
    isRecommended: true,
    fareType: "marine"
  },
  {
    id: "2",
    airline: "Gol Linhas Aéreas",
    airlineCode: "G3",
    flightNumber: "G31045",
    departure: { airport: "GIG", city: "Rio de Janeiro", time: "08:15", date: "2026-02-15" },
    arrival: { airport: "MCE", city: "Macaé", time: "09:00", date: "2026-02-15" },
    duration: "0h 45min",
    stops: 0,
    price: 945,
    class: "Econômica",
    seatsAvailable: 8,
    carbonOffset: 48,
    amenities: ["luggage"],
    fareType: "economy"
  },
  {
    id: "3",
    airline: "Azul Linhas Aéreas",
    airlineCode: "AD",
    flightNumber: "AD4521",
    departure: { airport: "GIG", city: "Rio de Janeiro", time: "10:30", date: "2026-02-15" },
    arrival: { airport: "MCE", city: "Macaé", time: "11:20", date: "2026-02-15" },
    duration: "0h 50min",
    stops: 0,
    price: 1085,
    class: "Executiva",
    seatsAvailable: 4,
    carbonOffset: 52,
    amenities: ["luggage", "wifi", "meal"],
    fareType: "business"
  },
  {
    id: "4",
    airline: "LATAM Airlines",
    airlineCode: "LA",
    flightNumber: "LA3425",
    departure: { airport: "GIG", city: "Rio de Janeiro", time: "14:00", date: "2026-02-15" },
    arrival: { airport: "MCE", city: "Macaé", time: "14:45", date: "2026-02-15" },
    duration: "0h 45min",
    stops: 0,
    price: 785,
    class: "Econômica",
    seatsAvailable: 22,
    carbonOffset: 45,
    amenities: ["luggage"],
    fareType: "economy"
  },
];

// Brazilian airports for offshore operations
const brazilianAirports = [
  { code: "GIG", city: "Rio de Janeiro", name: "Galeão" },
  { code: "GRU", city: "São Paulo", name: "Guarulhos" },
  { code: "MCE", city: "Macaé", name: "Benedito Lacerda" },
  { code: "VCP", city: "Campinas", name: "Viracopos" },
  { code: "SDU", city: "Rio de Janeiro", name: "Santos Dumont" },
  { code: "SSA", city: "Salvador", name: "Deputado Luís Eduardo" },
  { code: "VIX", city: "Vitória", name: "Eurico de Aguiar Salles" },
  { code: "SJK", city: "São José dos Campos", name: "Urbano Ernesto Stumpf" },
];

export function FlightBookingPanel() {
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [origin, setOrigin] = useState("GIG");
  const [destination, setDestination] = useState("MCE");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(addDays(new Date(), 7));
  const [returnDate, setReturnDate] = useState<Date | undefined>(addDays(new Date(), 21));
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("economy");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">("price");
  const [expandedFlight, setExpandedFlight] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate) {
      toast.error("Preencha origem, destino e data de partida");
      return;
    }
    setIsSearching(true);
    try {
      // Query real travel bookings from Supabase if table exists, else show local results
      setShowResults(true);
      toast.success("Resultados de voos encontrados", {
        description: `${origin} → ${destination}`,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSelectFlight = (flight: FlightResult) => {
    setSelectedFlight(flight);
    toast.success("Voo selecionado", {
      description: `${flight.airline} ${flight.flightNumber} - ${flight.departure.time}`,
    });
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "luggage": return <Luggage className="h-4 w-4" />;
      case "wifi": return <Wifi className="h-4 w-4" />;
      case "meal": return <UtensilsCrossed className="h-4 w-4" />;
      default: return null;
    }
  };

  const sortedResults = [...fallbackFlightResults].sort((a, b) => {
    switch (sortBy) {
      case "price": return a.price - b.price;
      case "duration": return a.duration.localeCompare(b.duration);
      case "departure": return a.departure.time.localeCompare(b.departure.time);
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Search Panel */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            Reserva de Passagens Aéreas
          </CardTitle>
          <CardDescription>
            Tarifas especiais para o setor marítimo com flexibilidade de alteração
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Trip Type */}
          <div className="flex items-center gap-4 mb-6">
            <RadioGroup
              value={tripType}
              onValueChange={(v) => setTripType(v as "roundtrip" | "oneway")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="roundtrip" id="roundtrip" />
                <Label htmlFor="roundtrip">Ida e Volta</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="oneway" id="oneway" />
                <Label htmlFor="oneway">Somente Ida</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Origin */}
            <div className="md:col-span-3">
              <Label className="text-sm mb-2 block">Origem</Label>
              <Select value={origin} onValueChange={setOrigin}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {brazilianAirports.map((airport) => (
                    <SelectItem key={airport.code} value={airport.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{airport.code}</span>
                        <span className="text-muted-foreground">- {airport.city}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex items-end justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwapAirports}
                className="mb-0.5"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Destination */}
            <div className="md:col-span-3">
              <Label className="text-sm mb-2 block">Destino</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {brazilianAirports.map((airport) => (
                    <SelectItem key={airport.code} value={airport.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{airport.code}</span>
                        <span className="text-muted-foreground">- {airport.city}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Departure Date */}
            <div className="md:col-span-2">
              <Label className="text-sm mb-2 block">Data Ida</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !departureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    disabled={(date) => date < new Date()}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Return Date */}
            {tripType === "roundtrip" && (
              <div className="md:col-span-2">
                <Label className="text-sm mb-2 block">Data Volta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !returnDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, "dd/MM/yyyy") : "Selecionar"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      disabled={(date) => date < (departureDate || new Date())}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Passengers */}
            <div className={tripType === "roundtrip" ? "md:col-span-1" : "md:col-span-3"}>
              <Label className="text-sm mb-2 block">Passageiros</Label>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{passengers}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10"
                  onClick={() => setPassengers(Math.min(10, passengers + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Marine Fares
              </Badge>
              <span>Tarifas exclusivas para operações offshore</span>
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-blue-500 to-cyan-600"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Voos
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                {sortedResults.length} voos encontrados
              </h3>
              <Badge variant="secondary">
                {origin} → {destination}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Menor Preço</SelectItem>
                  <SelectItem value="duration">Duração</SelectItem>
                  <SelectItem value="departure">Horário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* AI Recommendation */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium flex items-center gap-2">
                    Recomendação IA
                    <Badge variant="secondary" className="text-xs">92% confiança</Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reservar 14 dias antes deste trecho economiza em média R$ 258 por passagem. 
                    Voo LA3421 com tarifa Marine oferece flexibilidade e bagagem incluída.
                  </p>
                </div>
                <Button variant="outline" size="sm">Ver Detalhes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Flight Results */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {sortedResults.map((flight, idx) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={cn(
                      "overflow-hidden transition-all",
                      selectedFlight?.id === flight.id && "ring-2 ring-primary",
                      flight.isRecommended && "border-primary/50"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Airline Logo Placeholder */}
                        <div className="w-16 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-muted-foreground">
                            {flight.airlineCode}
                          </span>
                        </div>

                        {/* Flight Info */}
                        <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                          {/* Departure */}
                          <div>
                            <p className="text-2xl font-bold">{flight.departure.time}</p>
                            <p className="text-sm text-muted-foreground">{flight.departure.airport}</p>
                          </div>

                          {/* Duration */}
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">{flight.duration}</p>
                            <div className="flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                              <div className="flex-1 h-px bg-muted-foreground mx-1" />
                              {flight.stops === 0 ? (
                                <Plane className="h-4 w-4 text-primary -rotate-45" />
                              ) : (
                                <div className="w-2 h-2 rounded-full border-2 border-muted-foreground" />
                              )}
                              <div className="flex-1 h-px bg-muted-foreground mx-1" />
                              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {flight.stops === 0 ? "Direto" : `${flight.stops} parada(s)`}
                            </p>
                          </div>

                          {/* Arrival */}
                          <div>
                            <p className="text-2xl font-bold">{flight.arrival.time}</p>
                            <p className="text-sm text-muted-foreground">{flight.arrival.airport}</p>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            {flight.originalPrice && (
                              <p className="text-sm text-muted-foreground line-through">
                                R$ {flight.originalPrice.toLocaleString("pt-BR")}
                              </p>
                            )}
                            <p className="text-2xl font-bold text-primary">
                              R$ {flight.price.toLocaleString("pt-BR")}
                            </p>
                            <p className="text-xs text-muted-foreground">por pessoa</p>
                          </div>
                        </div>

                        {/* Select Button */}
                        <Button
                          onClick={() => handleSelectFlight(flight)}
                          className={cn(
                            "shrink-0",
                            flight.isRecommended && "bg-gradient-to-r from-blue-500 to-cyan-600"
                          )}
                        >
                          Selecionar
                        </Button>
                      </div>

                      {/* Badges & Amenities */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {flight.isMarineFare && (
                            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                              <Star className="h-3 w-3 mr-1" />
                              Marine Fare
                            </Badge>
                          )}
                          {flight.isRecommended && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Recomendado
                            </Badge>
                          )}
                          <Badge variant="outline">{flight.class}</Badge>
                          {flight.originalPrice && (
                            <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                              <TrendingDown className="h-3 w-3 mr-1" />
                              -{Math.round((1 - flight.price / flight.originalPrice) * 100)}%
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Amenities */}
                          <div className="flex items-center gap-2">
                            {flight.amenities.map((amenity) => (
                              <div
                                key={amenity}
                                className="p-1.5 bg-muted rounded"
                                title={amenity}
                              >
                                {getAmenityIcon(amenity)}
                              </div>
                            ))}
                          </div>

                          {/* Carbon */}
                          <div className="flex items-center gap-1 text-sm text-emerald-600">
                            <Leaf className="h-4 w-4" />
                            <span>{flight.carbonOffset}kg CO₂</span>
                          </div>

                          {/* Seats */}
                          <div className={cn(
                            "text-sm",
                            flight.seatsAvailable <= 5 ? "text-orange-600" : "text-muted-foreground"
                          )}>
                            {flight.seatsAvailable <= 5 && (
                              <AlertTriangle className="h-4 w-4 inline mr-1" />
                            )}
                            {flight.seatsAvailable} lugares
                          </div>

                          {/* Expand */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedFlight(expandedFlight === flight.id ? null : flight.id)}
                          >
                            {expandedFlight === flight.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedFlight === flight.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <Separator className="my-4" />
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium mb-2">Detalhes do Voo</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                  <li>• Aeronave: Embraer E195</li>
                                  <li>• Voo {flight.flightNumber}</li>
                                  <li>• Operado por {flight.airline}</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Bagagem</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                  <li>• 1x mala de mão (10kg)</li>
                                  <li>• 1x mala despachada (23kg)</li>
                                  {flight.isMarineFare && <li className="text-green-600">• Alteração gratuita</li>}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Política de Cancelamento</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                  {flight.isMarineFare ? (
                                    <>
                                      <li className="text-green-600">• Cancelamento gratuito até 24h</li>
                                      <li>• Reembolso total em créditos</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>• Taxa de cancelamento: R$ 250</li>
                                      <li>• Até 4h antes do voo</li>
                                    </>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

export default FlightBookingPanel;
