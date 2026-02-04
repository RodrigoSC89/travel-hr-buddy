/**
 * Hotel Reservation Panel - Sistema de reserva de hotéis
 * Gestão de acomodações para tripulação em mobilização/desmobilização
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Hotel, Calendar as CalendarIcon, MapPin, Users, Search, Star,
  Wifi, Car, UtensilsCrossed, Coffee, Dumbbell, Waves, AirVent,
  Shield, Clock, DollarSign, ChevronDown, ChevronUp, Heart,
  Sparkles, Brain, Check, X, Phone, Mail, MapPinned, Filter,
  Minus, Plus
} from "lucide-react";

interface HotelResult {
  id: string;
  name: string;
  category: string;
  stars: number;
  address: string;
  city: string;
  distance: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  originalPrice?: number;
  totalPrice: number;
  amenities: string[];
  images: string[];
  isPreferred?: boolean;
  isAgreed?: boolean;
  cancellationPolicy: "free" | "partial" | "strict";
  breakfastIncluded: boolean;
  roomType: string;
  availableRooms: number;
}

// Mock hotel results
const mockHotelResults: HotelResult[] = [
  {
    id: "1",
    name: "Macaé Business Hotel",
    category: "Business",
    stars: 4,
    address: "Av. Atlântica, 1250",
    city: "Macaé, RJ",
    distance: "0.5 km do aeroporto",
    rating: 8.7,
    reviewCount: 1245,
    pricePerNight: 320,
    originalPrice: 420,
    totalPrice: 2560,
    amenities: ["wifi", "parking", "restaurant", "gym", "pool", "ac"],
    images: [],
    isPreferred: true,
    isAgreed: true,
    cancellationPolicy: "free",
    breakfastIncluded: true,
    roomType: "Superior Duplo",
    availableRooms: 8
  },
  {
    id: "2",
    name: "Offshore Plaza Hotel",
    category: "Premium",
    stars: 5,
    address: "Rua das Palmeiras, 450",
    city: "Macaé, RJ",
    distance: "1.2 km do aeroporto",
    rating: 9.2,
    reviewCount: 856,
    pricePerNight: 485,
    totalPrice: 3880,
    amenities: ["wifi", "parking", "restaurant", "gym", "pool", "ac", "spa"],
    images: [],
    isPreferred: true,
    isAgreed: true,
    cancellationPolicy: "free",
    breakfastIncluded: true,
    roomType: "Executivo",
    availableRooms: 3
  },
  {
    id: "3",
    name: "Hotel Beira Mar",
    category: "Standard",
    stars: 3,
    address: "Av. Beira Mar, 780",
    city: "Macaé, RJ",
    distance: "2.0 km do aeroporto",
    rating: 7.8,
    reviewCount: 2134,
    pricePerNight: 185,
    totalPrice: 1480,
    amenities: ["wifi", "parking", "restaurant", "ac"],
    images: [],
    isAgreed: true,
    cancellationPolicy: "partial",
    breakfastIncluded: true,
    roomType: "Standard Duplo",
    availableRooms: 15
  },
  {
    id: "4",
    name: "Pousada Solar",
    category: "Econômico",
    stars: 2,
    address: "Rua São Jorge, 122",
    city: "Macaé, RJ",
    distance: "3.5 km do aeroporto",
    rating: 7.2,
    reviewCount: 567,
    pricePerNight: 125,
    totalPrice: 1000,
    amenities: ["wifi", "ac"],
    images: [],
    cancellationPolicy: "strict",
    breakfastIncluded: false,
    roomType: "Standard",
    availableRooms: 22
  },
];

// Cities for offshore operations
const cities = [
  { name: "Macaé", state: "RJ" },
  { name: "Rio de Janeiro", state: "RJ" },
  { name: "Vitória", state: "ES" },
  { name: "São Paulo", state: "SP" },
  { name: "Salvador", state: "BA" },
  { name: "Santos", state: "SP" },
];

export function HotelReservationPanel() {
  const [city, setCity] = useState("Macaé");
  const [checkIn, setCheckIn] = useState<Date | undefined>(new Date());
  const [checkOut, setCheckOut] = useState<Date | undefined>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [starsFilter, setStarsFilter] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [sortBy, setSortBy] = useState<"price" | "rating" | "distance">("price");
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<HotelResult | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  const handleSearch = async () => {
    setIsSearching(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSearching(false);
    setShowResults(true);
    toast.success("Hotéis encontrados", {
      description: `${mockHotelResults.length} opções disponíveis em ${city}`,
    });
  };

  const handleSelectHotel = (hotel: HotelResult) => {
    setSelectedHotel(hotel);
    toast.success("Hotel selecionado", {
      description: `${hotel.name} - ${hotel.roomType}`,
    });
  };

  const toggleFavorite = (hotelId: string) => {
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(hotelId)) {
        newFavs.delete(hotelId);
      } else {
        newFavs.add(hotelId);
      }
      return newFavs;
    });
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, React.ReactNode> = {
      wifi: <Wifi className="h-4 w-4" />,
      parking: <Car className="h-4 w-4" />,
      restaurant: <UtensilsCrossed className="h-4 w-4" />,
      gym: <Dumbbell className="h-4 w-4" />,
      pool: <Waves className="h-4 w-4" />,
      ac: <AirVent className="h-4 w-4" />,
      spa: <Sparkles className="h-4 w-4" />,
      breakfast: <Coffee className="h-4 w-4" />,
    };
    return icons[amenity] || null;
  };

  const getCancellationBadge = (policy: string) => {
    switch (policy) {
      case "free":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Cancelamento Grátis</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Cancelamento Parcial</Badge>;
      case "strict":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Não Reembolsável</Badge>;
      default:
        return null;
    }
  };

  const sortedResults = [...mockHotelResults]
    .filter(h => h.pricePerNight >= priceRange[0] && h.pricePerNight <= priceRange[1])
    .filter(h => starsFilter.length === 0 || starsFilter.includes(h.stars))
    .sort((a, b) => {
      switch (sortBy) {
        case "price": return a.pricePerNight - b.pricePerNight;
        case "rating": return b.rating - a.rating;
        case "distance": return parseFloat(a.distance) - parseFloat(b.distance);
        default: return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Search Panel */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5 text-amber-600" />
            Reserva de Hotéis
          </CardTitle>
          <CardDescription>
            Hotéis acordados com tarifas especiais para operações offshore
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* City */}
            <div className="md:col-span-3">
              <Label className="text-sm mb-2 block">Cidade</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}, {c.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check In */}
            <div className="md:col-span-2">
              <Label className="text-sm mb-2 block">Check-in</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    disabled={(date) => date < new Date()}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Check Out */}
            <div className="md:col-span-2">
              <Label className="text-sm mb-2 block">Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => date <= (checkIn || new Date())}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Nights Display */}
            <div className="md:col-span-1">
              <Label className="text-sm mb-2 block">Noites</Label>
              <div className="h-10 flex items-center justify-center bg-muted rounded-md font-semibold">
                {nights}
              </div>
            </div>

            {/* Guests */}
            <div className="md:col-span-2">
              <Label className="text-sm mb-2 block">Hóspedes</Label>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="flex-1 text-center font-medium">{guests}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10"
                  onClick={() => setGuests(Math.min(10, guests + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Rooms */}
            <div className="md:col-span-2">
              <Label className="text-sm mb-2 block">Quartos</Label>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10"
                  onClick={() => setRooms(Math.max(1, rooms - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="flex-1 text-center font-medium">{rooms}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10"
                  onClick={() => setRooms(Math.min(10, rooms + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Toggle & Search Button */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-amber-500 to-orange-600"
            >
              {isSearching ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Hotéis
                </>
              )}
            </Button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Range */}
                  <div>
                    <Label className="text-sm mb-3 block">
                      Preço por noite: R$ {priceRange[0]} - R$ {priceRange[1]}
                    </Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={600}
                      step={50}
                      className="w-full"
                    />
                  </div>

                  {/* Stars Filter */}
                  <div>
                    <Label className="text-sm mb-3 block">Classificação</Label>
                    <div className="flex gap-2">
                      {[2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          variant={starsFilter.includes(star) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setStarsFilter(prev =>
                              prev.includes(star)
                                ? prev.filter(s => s !== star)
                                : [...prev, star]
                            );
                          }}
                          className="gap-1"
                        >
                          {star} <Star className="h-3 w-3" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                {sortedResults.length} hotéis encontrados
              </h3>
              <Badge variant="secondary">
                {city} • {nights} noite(s)
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
                  <SelectItem value="rating">Avaliação</SelectItem>
                  <SelectItem value="distance">Distância</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hotel Results */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {sortedResults.map((hotel, idx) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={cn(
                      "overflow-hidden transition-all",
                      selectedHotel?.id === hotel.id && "ring-2 ring-primary",
                      hotel.isPreferred && "border-amber-500/50"
                    )}
                  >
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Hotel Image Placeholder */}
                        <div className="w-48 h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shrink-0 relative">
                          <Hotel className="h-16 w-16 text-muted-foreground/30" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                            onClick={() => toggleFavorite(hotel.id)}
                          >
                            <Heart className={cn(
                              "h-4 w-4",
                              favorites.has(hotel.id) && "fill-red-500 text-red-500"
                            )} />
                          </Button>
                        </div>

                        {/* Hotel Info */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-lg">{hotel.name}</h4>
                                {hotel.isPreferred && (
                                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Acordado
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                {Array.from({ length: hotel.stars }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                ))}
                                <span className="text-sm text-muted-foreground ml-2">
                                  {hotel.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPinned className="h-4 w-4" />
                                  {hotel.distance}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-amber-500" />
                                  {hotel.rating} ({hotel.reviewCount} avaliações)
                                </span>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              {hotel.originalPrice && (
                                <p className="text-sm text-muted-foreground line-through">
                                  R$ {hotel.originalPrice}
                                </p>
                              )}
                              <p className="text-2xl font-bold text-primary">
                                R$ {hotel.pricePerNight}
                              </p>
                              <p className="text-xs text-muted-foreground">por noite</p>
                              <p className="text-sm font-medium mt-1">
                                Total: R$ {hotel.totalPrice.toLocaleString("pt-BR")}
                              </p>
                            </div>
                          </div>

                          {/* Amenities & Badges */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Amenities */}
                              <div className="flex items-center gap-1.5">
                                {hotel.amenities.slice(0, 5).map((amenity) => (
                                  <div
                                    key={amenity}
                                    className="p-1.5 bg-muted rounded"
                                    title={amenity}
                                  >
                                    {getAmenityIcon(amenity)}
                                  </div>
                                ))}
                                {hotel.amenities.length > 5 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{hotel.amenities.length - 5}
                                  </span>
                                )}
                              </div>

                              <Separator orientation="vertical" className="h-6" />

                              {/* Badges */}
                              <div className="flex items-center gap-2">
                                {hotel.breakfastIncluded && (
                                  <Badge variant="outline" className="gap-1">
                                    <Coffee className="h-3 w-3" />
                                    Café incluso
                                  </Badge>
                                )}
                                {getCancellationBadge(hotel.cancellationPolicy)}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpandedHotel(expandedHotel === hotel.id ? null : hotel.id)}
                              >
                                Detalhes
                                {expandedHotel === hotel.id ? (
                                  <ChevronUp className="h-4 w-4 ml-1" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 ml-1" />
                                )}
                              </Button>
                              <Button onClick={() => handleSelectHotel(hotel)}>
                                Reservar
                              </Button>
                            </div>
                          </div>

                          {/* Room Info */}
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Tipo: <span className="font-medium text-foreground">{hotel.roomType}</span>
                            </span>
                            <span className={cn(
                              hotel.availableRooms <= 3 ? "text-orange-600" : "text-muted-foreground"
                            )}>
                              {hotel.availableRooms <= 3 && "⚠️"} {hotel.availableRooms} quartos disponíveis
                            </span>
                          </div>

                          {/* Expanded Details */}
                          <AnimatePresence>
                            {expandedHotel === hotel.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <Separator className="my-4" />
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <h5 className="font-medium mb-2">Comodidades</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {hotel.amenities.map((amenity) => (
                                        <Badge key={amenity} variant="secondary" className="gap-1">
                                          {getAmenityIcon(amenity)}
                                          {amenity}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="font-medium mb-2">Contato</h5>
                                    <ul className="space-y-1 text-muted-foreground">
                                      <li className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        +55 22 2XXX-XXXX
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        reservas@hotel.com
                                      </li>
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="font-medium mb-2">Política de Cancelamento</h5>
                                    <p className="text-muted-foreground">
                                      {hotel.cancellationPolicy === "free" && "Cancelamento gratuito até 24h antes do check-in."}
                                      {hotel.cancellationPolicy === "partial" && "Reembolso de 50% para cancelamentos até 48h antes."}
                                      {hotel.cancellationPolicy === "strict" && "Reserva não reembolsável."}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
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

export default HotelReservationPanel;
