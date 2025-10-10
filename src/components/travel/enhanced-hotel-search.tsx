import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import {
  Search,
  Calendar as CalendarIcon,
  MapPin,
  Star,
  Wifi,
  Car,
  Utensils,
  Plus,
  ExternalLink,
  Building,
  CreditCard,
  Download,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Printer,
  QrCode,
  Bookmark,
  Filter,
  RotateCcw,
  TrendingUp,
} from "lucide-react";

interface Hotel {
  id: string;
  name: string;
  location: string;
  address?: string;
  rating: number;
  price: number;
  originalPrice?: number;
  image: string;
  amenities: string[];
  distance: string;
  bookingUrl?: string;
  description?: string;
  checkInTime?: string;
  checkOutTime?: string;
  phone?: string;
  email?: string;
  website?: string;
  roomTypes?: string[];
  policies?: string[];
}

interface HotelReservation {
  id: string;
  hotel: Hotel;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms: number;
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled";
  confirmationCode?: string;
  createdAt: Date;
}

interface TravelItinerary {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  hotels: HotelReservation[];
  activities: string[];
  totalCost: number;
  status: "planned" | "active" | "completed";
}

export const EnhancedHotelSearch: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("search");

  // Search states
  const [destination, setDestination] = useState("");
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Data states
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [reservations, setReservations] = useState<HotelReservation[]>([]);
  const [itineraries, setItineraries] = useState<TravelItinerary[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Filter states
  const [sortBy, setSortBy] = useState("price");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  // Mock data for demonstration
  const mockHotels: Hotel[] = [
    {
      id: "1",
      name: "Hotel Copacabana Palace",
      location: "Rio de Janeiro, RJ",
      address: "Av. Atlântica, 1702 - Copacabana, Rio de Janeiro - RJ",
      rating: 4.8,
      price: 450,
      originalPrice: 580,
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      amenities: ["WiFi Gratuito", "Piscina", "Spa", "Restaurante", "Academia", "Estacionamento"],
      distance: "200m da praia de Copacabana",
      description: "Luxuoso hotel histórico com vista para a praia de Copacabana",
      checkInTime: "15:00",
      checkOutTime: "12:00",
      phone: "+55 21 2548-7070",
      email: "reservas@copacabanapalace.com.br",
      website: "https://www.copacabanapalace.com.br",
      roomTypes: ["Quarto Standard", "Suíte Vista Mar", "Suíte Presidencial"],
      policies: [
        "Cancelamento grátis até 24h antes",
        "Pets permitidos",
        "Check-in antecipado sujeito à disponibilidade",
      ],
      bookingUrl: "https://www.booking.com/hotel/br/copacabana-palace.html",
    },
    {
      id: "2",
      name: "Unique Garden Hotel & Spa",
      location: "São Paulo, SP",
      address: "Av. Paulista, 2424 - Bela Vista, São Paulo - SP",
      rating: 4.6,
      price: 320,
      originalPrice: 420,
      image:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      amenities: ["WiFi Gratuito", "Academia", "Business Center", "Spa", "Restaurante"],
      distance: "500m da Av. Paulista",
      description: "Hotel moderno no coração financeiro de São Paulo",
      checkInTime: "14:00",
      checkOutTime: "12:00",
      phone: "+55 11 3372-4000",
      email: "reservas@uniquegarden.com.br",
      website: "https://www.uniquegarden.com.br",
      roomTypes: ["Quarto Executivo", "Suíte Master", "Suíte Presidencial"],
      policies: [
        "Cancelamento grátis até 48h antes",
        "Business Center 24h",
        "Serviço de quarto 24h",
      ],
      bookingUrl: "https://www.booking.com/hotel/br/unique-garden.html",
    },
    {
      id: "3",
      name: "Pousada Villa Bahia",
      location: "Salvador, BA",
      address: "Largo do Cruzeiro de São Francisco, 16/18 - Pelourinho, Salvador - BA",
      rating: 4.4,
      price: 180,
      originalPrice: 240,
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      amenities: ["WiFi Gratuito", "Café da manhã", "Vista para o mar", "Ar condicionado"],
      distance: "50m do centro histórico",
      description: "Pousada charmosa no coração do Pelourinho",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      phone: "+55 71 3322-4271",
      email: "reservas@villabahia.com.br",
      website: "https://www.villabahia.com.br",
      roomTypes: ["Quarto Standard", "Quarto Superior", "Suíte Master"],
      policies: [
        "Cancelamento grátis até 24h antes",
        "Café da manhã incluso",
        "Tour histórico gratuito",
      ],
      bookingUrl: "https://www.booking.com/hotel/br/villa-bahia.html",
    },
  ];

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    setHotels(mockHotels);
    loadMockReservations();
    loadMockItineraries();
    generateAISuggestions();
  };

  const loadMockReservations = () => {
    const mockReservations: HotelReservation[] = [
      {
        id: "1",
        hotel: mockHotels[0],
        checkIn: new Date("2024-02-15"),
        checkOut: new Date("2024-02-18"),
        guests: 2,
        rooms: 1,
        totalPrice: 1350,
        status: "confirmed",
        confirmationCode: "CPL-2024-001",
        createdAt: new Date("2024-01-10"),
      },
      {
        id: "2",
        hotel: mockHotels[1],
        checkIn: new Date("2024-03-20"),
        checkOut: new Date("2024-03-22"),
        guests: 1,
        rooms: 1,
        totalPrice: 640,
        status: "pending",
        confirmationCode: "UG-2024-002",
        createdAt: new Date("2024-01-15"),
      },
    ];
    setReservations(mockReservations);
  };

  const loadMockItineraries = () => {
    const mockItineraries: TravelItinerary[] = [
      {
        id: "1",
        title: "Viagem de Negócios - Rio de Janeiro",
        destination: "Rio de Janeiro, RJ",
        startDate: new Date("2024-02-15"),
        endDate: new Date("2024-02-18"),
        hotels: reservations.slice(0, 1),
        activities: ["Reunião cliente A", "Apresentação proposta", "Visita obra portuária"],
        totalCost: 1350,
        status: "planned",
      },
      {
        id: "2",
        title: "Conferência Tech - São Paulo",
        destination: "São Paulo, SP",
        startDate: new Date("2024-03-20"),
        endDate: new Date("2024-03-22"),
        hotels: reservations.slice(1, 2),
        activities: ["Conferência TechBrazil", "Workshop IA", "Networking"],
        totalCost: 640,
        status: "planned",
      },
    ];
    setItineraries(mockItineraries);
  };

  const generateAISuggestions = async () => {
    try {
      // Simular chamada de IA
      const suggestions = [
        {
          type: "price_optimization",
          title: "Economia Identificada",
          description: "Reserve com 2 semanas de antecedência e economize até 25%",
          savings: 112,
          priority: "high",
        },
        {
          type: "alternative_dates",
          title: "Datas Alternativas",
          description: "Mudando para terça-feira, economize R$ 80 por noite",
          savings: 80,
          priority: "medium",
        },
        {
          type: "package_deal",
          title: "Pacote Disponível",
          description: "Hotel + transfer aeroporto por apenas R$ 50 extra",
          savings: -50,
          priority: "low",
        },
      ];
      setAiSuggestions(suggestions);
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const handleSearch = async () => {
    if (!destination || !checkInDate || !checkOutDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha destino, check-in e check-out",
        variant: "destructive",
      });
      return;
    }

    if (checkInDate >= checkOutDate) {
      toast({
        title: "Datas inválidas",
        description: "A data de check-out deve ser posterior ao check-in",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      // Chamar API Amadeus para busca real
      const { data, error } = await supabase.functions.invoke("amadeus-search", {
        body: {
          searchType: "hotels",
          cityName: destination,
          checkIn: format(checkInDate, "yyyy-MM-dd"),
          checkOut: format(checkOutDate, "yyyy-MM-dd"),
          adults: guests,
          rooms: rooms,
        },
      });

      if (error) throw error;

      if (data.success && data.data?.data) {
        const transformedHotels = data.data.data.map((offer: any, index: number) => ({
          id: offer.hotel?.hotelId || `hotel-${index}`,
          name: offer.hotel?.name || "Hotel Disponível",
          location: offer.hotel?.address?.cityName || destination,
          address: offer.hotel?.address?.lines?.join(", ") || "",
          rating: 4.0 + Math.random() * 1.0,
          price: Math.round(parseFloat(offer.offers?.[0]?.price?.total || "200")),
          originalPrice: Math.round(parseFloat(offer.offers?.[0]?.price?.total || "200") * 1.2),
          image: `https://images.unsplash.com/photo-${1566073771259 + index}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
          amenities: ["WiFi Gratuito", "Café da manhã"],
          distance: "Centro da cidade",
          bookingUrl: generateBookingUrl(offer, {
            destination,
            checkInDate,
            checkOutDate,
            guests,
            rooms,
          }),
          description: `Hotel disponível em ${destination}`,
          checkInTime: "14:00",
          checkOutTime: "11:00",
        }));

        setHotels(transformedHotels);
        toast({
          title: "Busca concluída",
          description: `${transformedHotels.length} hotéis encontrados!`,
        });
      } else {
        throw new Error("Nenhum hotel encontrado");
      }
    } catch (error) {
      // Usar dados mock como fallback
      const filteredHotels = mockHotels.filter(hotel =>
        hotel.location.toLowerCase().includes(destination.toLowerCase())
      );
      setHotels(filteredHotels.length > 0 ? filteredHotels : mockHotels);

      toast({
        title: "Dados de demonstração",
        description: "Exibindo hotéis de exemplo",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const generateBookingUrl = (offer: any, searchParams: any) => {
    const hotelId = offer.hotel?.hotelId || "";
    const cityName = encodeURIComponent(searchParams.destination);
    const checkin = format(searchParams.checkInDate, "yyyy-MM-dd");
    const checkout = format(searchParams.checkOutDate, "yyyy-MM-dd");

    return `https://www.booking.com/searchresults.html?ss=${cityName}&checkin=${checkin}&checkout=${checkout}&group_adults=${searchParams.guests}&group_children=0&no_rooms=${searchParams.rooms}&selected_currency=BRL`;
  };

  const handleBookHotel = async (hotel: Hotel) => {
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Selecione as datas",
        description: "Escolha as datas de check-in e check-out",
        variant: "destructive",
      });
      return;
    }

    const nights = differenceInDays(checkOutDate, checkInDate);
    const totalPrice = hotel.price * nights * rooms;

    // Simular processo de reserva
    toast({
      title: "Processando reserva...",
      description: `${hotel.name} - ${nights} noites`,
    });

    // Simular delay de processamento
    setTimeout(() => {
      const newReservation: HotelReservation = {
        id: `res-${Date.now()}`,
        hotel,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        rooms,
        totalPrice,
        status: "confirmed",
        confirmationCode: `HTL-${Date.now().toString().slice(-6)}`,
        createdAt: new Date(),
      };

      setReservations(prev => [newReservation, ...prev]);
      toast({
        title: "Reserva confirmada!",
        description: `Código: ${newReservation.confirmationCode}`,
      });
      setActiveTab("reservations");
    }, 2000);
  };

  const exportItinerary = async (itinerary: TravelItinerary) => {
    try {
      const itineraryData = {
        title: itinerary.title,
        destination: itinerary.destination,
        dates: `${format(itinerary.startDate, "dd/MM/yyyy")} - ${format(itinerary.endDate, "dd/MM/yyyy")}`,
        hotels: itinerary.hotels.map(h => ({
          name: h.hotel.name,
          address: h.hotel.address,
          checkin: format(h.checkIn, "dd/MM/yyyy"),
          checkout: format(h.checkOut, "dd/MM/yyyy"),
        })),
        activities: itinerary.activities,
        totalCost: itinerary.totalCost,
      };

      // Simular geração de PDF
      toast({
        title: "Exportando itinerário...",
        description: "Gerando arquivo PDF",
      });

      setTimeout(() => {
        toast({
          title: "Itinerário exportado!",
          description: "PDF salvo em Downloads",
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes("wifi")) return <Wifi className="h-4 w-4" />;
    if (lowerAmenity.includes("piscina")) return <span>🏊</span>;
    if (lowerAmenity.includes("spa")) return <span>💆</span>;
    if (lowerAmenity.includes("restaurante")) return <Utensils className="h-4 w-4" />;
    if (lowerAmenity.includes("academia")) return <span>🏋️</span>;
    if (lowerAmenity.includes("estacionamento")) return <Car className="h-4 w-4" />;
    return <Plus className="h-4 w-4" />;
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesPrice = hotel.price >= priceRange.min && hotel.price <= priceRange.max;
    const matchesAmenities =
      selectedAmenities.length === 0 ||
      selectedAmenities.some(amenity =>
        hotel.amenities.some(ha => ha.toLowerCase().includes(amenity.toLowerCase()))
      );

    return matchesPrice && matchesAmenities;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header com melhor contraste */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sistema de Hospedagem</h1>
            <p className="text-blue-100">
              Busque, reserve e gerencie suas hospedagens corporativas
            </p>
          </div>
          <Building className="h-12 w-12 text-blue-200" />
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="h-5 w-5" />
              Sugestões Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">{suggestion.title}</h4>
                  <p className="text-sm text-purple-600 mb-3">{suggestion.description}</p>
                  <Badge variant={suggestion.priority === "high" ? "destructive" : "secondary"}>
                    {suggestion.savings > 0
                      ? `+R$ ${suggestion.savings}`
                      : `R$ ${Math.abs(suggestion.savings)}`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Buscar
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Reservas
          </TabsTrigger>
          <TabsTrigger value="itinerary" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Roteiros
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        {/* Tab: Buscar Hotéis */}
        <TabsContent value="search" className="space-y-6">
          {/* Formulário de Busca Melhorado */}
          <Card>
            <CardHeader>
              <CardTitle>Encontre sua hospedagem ideal</CardTitle>
              <CardDescription>Sistema avançado de busca com filtros inteligentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destino</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="destination"
                      placeholder="Cidade ou região"
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !checkInDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={setCheckInDate}
                        disabled={date => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !checkOutDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? format(checkOutDate, "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={setCheckOutDate}
                        disabled={date => date <= (checkInDate || new Date())}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Hóspedes</Label>
                  <div className="flex gap-2">
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max="10"
                      value={guests}
                      onChange={e => setGuests(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={rooms}
                      onChange={e => setRooms(Number(e.target.value))}
                      placeholder="Quartos"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Filtros Avançados */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <Filter className="h-4 w-4" />
                  <Label className="text-sm font-medium">Filtros</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Faixa de Preço (por noite)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={e =>
                          setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))
                        }
                        className="text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={e =>
                          setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))
                        }
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Ordenar por</Label>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background text-xs"
                    >
                      <option value="price">Menor preço</option>
                      <option value="rating">Melhor avaliação</option>
                      <option value="name">Nome</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Comodidades</Label>
                    <div className="flex flex-wrap gap-1">
                      {["WiFi", "Piscina", "Academia", "Spa"].map(amenity => (
                        <Badge
                          key={amenity}
                          variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            setSelectedAmenities(prev =>
                              prev.includes(amenity)
                                ? prev.filter(a => a !== amenity)
                                : [...prev, amenity]
                            );
                          }}
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSearch} disabled={isSearching} className="w-full" size="lg">
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Hotéis
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados da Busca */}
          {sortedHotels.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{sortedHotels.length} hotéis encontrados</h2>
                <Button variant="outline" size="sm" onClick={() => setHotels([])}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              </div>

              <div className="grid gap-6">
                {sortedHotels.map(hotel => (
                  <Card
                    key={hotel.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row">
                      <div className="lg:w-1/3">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-48 lg:h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 p-6">
                        <div className="space-y-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">{hotel.name}</h3>
                              <div className="flex items-center text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">{hotel.location}</span>
                              </div>
                              <div className="flex items-center mb-2">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="font-medium">{hotel.rating}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {hotel.distance}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{hotel.description}</p>
                            </div>

                            <div className="text-right">
                              {hotel.originalPrice && (
                                <div className="text-sm text-muted-foreground line-through">
                                  R$ {hotel.originalPrice}
                                </div>
                              )}
                              <div className="text-2xl font-bold text-green-600">
                                R$ {hotel.price}
                              </div>
                              <div className="text-sm text-muted-foreground">por noite</div>
                              {hotel.originalPrice && (
                                <Badge variant="destructive" className="mt-1">
                                  {Math.round(
                                    ((hotel.originalPrice - hotel.price) / hotel.originalPrice) *
                                      100
                                  )}
                                  % OFF
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {hotel.amenities.slice(0, 6).map((amenity, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {getAmenityIcon(amenity)}
                                <span className="text-xs">{amenity}</span>
                              </Badge>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button onClick={() => handleBookHotel(hotel)} className="flex-1">
                              <Bookmark className="h-4 w-4 mr-2" />
                              Reservar Agora
                            </Button>

                            {hotel.bookingUrl && (
                              <Button
                                variant="outline"
                                onClick={() => window.open(hotel.bookingUrl, "_blank")}
                                className="flex-1"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver no Site
                              </Button>
                            )}

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{hotel.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <img
                                    src={hotel.image}
                                    alt={hotel.name}
                                    className="w-full h-48 object-cover rounded"
                                  />
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <strong>Endereço:</strong> {hotel.address}
                                    </div>
                                    <div>
                                      <strong>Check-in:</strong> {hotel.checkInTime}
                                    </div>
                                    <div>
                                      <strong>Check-out:</strong> {hotel.checkOutTime}
                                    </div>
                                    <div>
                                      <strong>Telefone:</strong> {hotel.phone}
                                    </div>
                                  </div>
                                  <div>
                                    <strong>Comodidades:</strong>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {hotel.amenities.map((amenity, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {amenity}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  {hotel.policies && (
                                    <div>
                                      <strong>Políticas:</strong>
                                      <ul className="list-disc list-inside text-sm mt-2">
                                        {hotel.policies.map((policy, index) => (
                                          <li key={index}>{policy}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab: Reservas */}
        <TabsContent value="reservations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Minhas Reservas
              </CardTitle>
              <CardDescription>Gerencie suas reservas de hospedagem</CardDescription>
            </CardHeader>
            <CardContent>
              {reservations.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma reserva encontrada</h3>
                  <p className="text-muted-foreground">
                    Suas reservas aparecerão aqui após fazer uma reserva
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map(reservation => (
                    <Card key={reservation.id} className="border border-muted">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold">{reservation.hotel.name}</h3>
                              <Badge className={getStatusColor(reservation.status)}>
                                {getStatusIcon(reservation.status)}
                                <span className="ml-1">
                                  {reservation.status === "confirmed"
                                    ? "Confirmada"
                                    : reservation.status === "pending"
                                      ? "Pendente"
                                      : "Cancelada"}
                                </span>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Check-in:</span>
                                <div className="font-medium">
                                  {format(reservation.checkIn, "dd/MM/yyyy")}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Check-out:</span>
                                <div className="font-medium">
                                  {format(reservation.checkOut, "dd/MM/yyyy")}
                                </div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Hóspedes:</span>
                                <div className="font-medium">{reservation.guests} pessoas</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Quartos:</span>
                                <div className="font-medium">{reservation.rooms}</div>
                              </div>
                            </div>

                            {reservation.confirmationCode && (
                              <div className="mt-3 p-3 bg-muted rounded-lg">
                                <span className="text-sm text-muted-foreground">
                                  Código de confirmação:
                                </span>
                                <div className="font-mono font-medium">
                                  {reservation.confirmationCode}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold mb-2">
                              R$ {reservation.totalPrice}
                            </div>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(reservation.hotel.bookingUrl, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Ver Detalhes
                              </Button>
                              <Button variant="outline" size="sm" className="ml-2">
                                <Download className="h-4 w-4 mr-1" />
                                Voucher
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Roteiros */}
        <TabsContent value="itinerary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Roteiros de Viagem
              </CardTitle>
              <CardDescription>Organize e gerencie seus itinerários completos</CardDescription>
            </CardHeader>
            <CardContent>
              {itineraries.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum roteiro criado</h3>
                  <p className="text-muted-foreground">
                    Crie roteiros personalizados para suas viagens
                  </p>
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Roteiro
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {itineraries.map(itinerary => (
                    <Card key={itinerary.id} className="border border-muted">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{itinerary.title}</h3>
                            <div className="flex items-center text-muted-foreground mb-4">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{itinerary.destination}</span>
                              <span className="mx-2">•</span>
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span>
                                {format(itinerary.startDate, "dd/MM")} -{" "}
                                {format(itinerary.endDate, "dd/MM/yyyy")}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Hospedagem</h4>
                                {itinerary.hotels.map((hotel, index) => (
                                  <div key={index} className="text-sm p-3 bg-muted rounded-lg">
                                    <div className="font-medium">{hotel.hotel.name}</div>
                                    <div className="text-muted-foreground">
                                      {format(hotel.checkIn, "dd/MM")} -{" "}
                                      {format(hotel.checkOut, "dd/MM")}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Atividades</h4>
                                <div className="space-y-1">
                                  {itinerary.activities.map((activity, index) => (
                                    <div
                                      key={index}
                                      className="text-sm p-2 bg-muted rounded flex items-center"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                                      {activity}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600 mb-4">
                              R$ {itinerary.totalCost}
                            </div>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportItinerary(itinerary)}
                                className="w-full"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Exportar PDF
                              </Button>
                              <Button variant="outline" size="sm" className="w-full">
                                <QrCode className="h-4 w-4 mr-1" />
                                QR Code
                              </Button>
                              <Button variant="outline" size="sm" className="w-full">
                                <Printer className="h-4 w-4 mr-1" />
                                Imprimir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Análises */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Gastos</p>
                    <p className="text-2xl font-bold">R$ 4.680</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reservas Ativas</p>
                    <p className="text-2xl font-bold">
                      {reservations.filter(r => r.status === "confirmed").length}
                    </p>
                  </div>
                  <Bookmark className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Economia IA</p>
                    <p className="text-2xl font-bold">R$ 890</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Viagem</CardTitle>
              <CardDescription>
                Análises detalhadas dos seus gastos e padrões de viagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Relatórios em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Em breve você terá acesso a análises avançadas dos seus gastos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
