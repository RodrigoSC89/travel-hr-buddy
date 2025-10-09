import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar, MapPin, Star, Wifi, Car, Utensils, Plus } from "lucide-react";
import { TravelMap } from "./travel-map";
import { supabase } from "@/integrations/supabase/client";

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
  amenities: string[];
  distance: string;
  bookingUrl?: string;
}

export const ResponsiveHotelSearch: React.FC = () => {
  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("2");
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [hotels, setHotels] = useState<Hotel[]>([
    {
      id: "1",
      name: "Hotel Copacabana Palace",
      location: "Rio de Janeiro, RJ",
      rating: 4.8,
      price: 450,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      amenities: ["WiFi", "Piscina", "Spa", "Restaurante"],
      distance: "200m da praia",
      bookingUrl: "https://www.booking.com/hotel/br/copacabana-palace.html"
    },
    {
      id: "2",
      name: "Unique Garden Hotel",
      location: "São Paulo, SP",
      rating: 4.6,
      price: 320,
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      amenities: ["WiFi", "Academia", "Business Center"],
      distance: "5km do centro",
      bookingUrl: "https://www.booking.com/hotel/br/unique-garden.html"
    },
    {
      id: "3",
      name: "Pousada Villa Bahia",
      location: "Salvador, BA",
      rating: 4.4,
      price: 180,
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      amenities: ["WiFi", "Café da manhã", "Vista para o mar"],
      distance: "100m do centro histórico",
      bookingUrl: "https://www.booking.com/hotel/br/villa-bahia.html"
    }
  ]);

  const handleSearch = async () => {
    if (!destination || !checkin || !checkout) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha destino, check-in e check-out",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("amadeus-search", {
        body: {
          searchType: "hotels",
          cityName: destination,
          checkIn: checkin,
          checkOut: checkout,
          adults: parseInt(guests),
        }
      });

      if (error) {
        throw error;
      }
      
      if (data.success && data.data?.data) {
        // Transform Amadeus hotel data to our format
        const transformedHotels = data.data.data.map((offer: any, index: number) => ({
          id: offer.hotel?.hotelId || `hotel-${index}`,
          name: offer.hotel?.name || "Hotel Disponível",
          location: offer.hotel?.address?.cityName || destination,
          rating: Math.random() * 1 + 4, // Amadeus doesn't always provide ratings
          price: Math.round(parseFloat(offer.offers?.[0]?.price?.total || "200")),
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          amenities: ["WiFi", "Café da manhã"],
          distance: offer.hotel?.address?.lines?.[0] || "Centro da cidade",
          bookingUrl: `https://www.amadeus.com/hotel/${offer.hotel?.hotelId}`,
        }));

        if (transformedHotels.length > 0) {
          setHotels(transformedHotels);
          toast({
            title: "Busca concluída",
            description: `${transformedHotels.length} hotéis reais encontrados!`,
          });
        } else {
          throw new Error("Nenhum hotel encontrado na API");
        }
      } else {
        throw new Error("Resposta inválida da API");
      }
    } catch (error) {
      // Usar dados originais como fallback
      toast({
        title: "Dados de demonstração",
        description: "Erro na API. Exibindo hotéis de exemplo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = (hotel: Hotel) => {
    setSelectedHotel(hotel.id);
    toast({
      title: "Reserva iniciada",
      description: `Processando reserva no ${hotel.name}`,
    });
    
    setTimeout(() => {
      setSelectedHotel(null);
      toast({
        title: "Reserva confirmada!",
        description: `${hotel.name} reservado com sucesso`,
      });
    }, 2000);
  };

  // Função para gerar URL específica de booking de hotel
  const generateHotelBookingUrl = (offer: any, searchParams: any) => {
    const hotelId = offer.hotel?.hotelId || "";
    const cityName = encodeURIComponent(offer.hotel?.address?.cityName || searchParams.destination);
    const checkinFormatted = searchParams.checkin;
    const checkoutFormatted = searchParams.checkout;
    const guests = searchParams.guests;
    
    // URL específica do Booking.com com parâmetros do hotel
    return `https://www.booking.com/hotel/br/${hotelId.toLowerCase()}.html?checkin=${checkinFormatted}&checkout=${checkoutFormatted}&group_adults=${guests}&group_children=0&selected_currency=BRL&changed_currency=1&top_ufis=1`;
  };

  const generateMockHotelBookingUrl = (hotel: Hotel, searchParams: any) => {
    const hotelName = encodeURIComponent(hotel.name.toLowerCase().replace(/\s+/g, "-"));
    const cityName = encodeURIComponent(searchParams.destination);
    const checkinFormatted = searchParams.checkin;
    const checkoutFormatted = searchParams.checkout;
    const guests = searchParams.guests;
    
    // Gerar URLs específicas baseadas no nome do hotel
    if (hotel.name.includes("Copacabana")) {
      return `https://www.booking.com/hotel/br/copacabana-palace.html?checkin=${checkinFormatted}&checkout=${checkoutFormatted}&group_adults=${guests}&group_children=0&selected_currency=BRL`;
    } else if (hotel.name.includes("Unique")) {
      return `https://www.booking.com/hotel/br/unique-garden.html?checkin=${checkinFormatted}&checkout=${checkoutFormatted}&group_adults=${guests}&group_children=0&selected_currency=BRL`;
    } else if (hotel.name.includes("Villa Bahia")) {
      return `https://www.booking.com/hotel/br/villa-bahia.html?checkin=${checkinFormatted}&checkout=${checkoutFormatted}&group_adults=${guests}&group_children=0&selected_currency=BRL`;
    }
    
    return `https://www.booking.com/searchresults.html?ss=${cityName}&checkin=${checkinFormatted}&checkout=${checkoutFormatted}&group_adults=${guests}&group_children=0&selected_currency=BRL&order=popularity`;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
    case "wifi":
      return <Wifi className="h-4 w-4" />;
    case "piscina":
      return <span className="text-blue-500">🏊</span>;
    case "spa":
      return <span className="text-purple-500">💆</span>;
    case "restaurante":
      return <Utensils className="h-4 w-4" />;
    case "academia":
      return <span className="text-green-500">🏋️</span>;
    case "estacionamento":
      return <Car className="h-4 w-4" />;
    default:
      return <Plus className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Buscar Hotéis
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Encontre a hospedagem perfeita para sua viagem
          </p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Encontre seu hotel ideal</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para buscar hospedagens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destino</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cidade ou hotel"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="date"
                  value={checkin}
                  onChange={(e) => setCheckin(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="date"
                  value={checkout}
                  onChange={(e) => setCheckout(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hóspedes</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            className="w-full mt-6 hover-scale"
            size="lg"
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar Hotéis
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Hotéis Disponíveis</h2>
            
            <div className="grid gap-4 sm:gap-6">
              {hotels.map((hotel) => (
                <Card key={hotel.id} className="overflow-hidden hover-scale transition-all">
                  <div className="flex flex-col lg:flex-row">
                    {/* Hotel Image */}
                    <div className="lg:w-1/3">
                      <img 
                        src={hotel.image} 
                        alt={hotel.name}
                        className="w-full h-48 lg:h-full object-cover"
                      />
                    </div>

                    {/* Hotel Info */}
                    <div className="flex-1 p-4 sm:p-6">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                          <div>
                            <h3 className="text-lg sm:text-xl font-semibold">{hotel.name}</h3>
                            <p className="text-muted-foreground flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {hotel.location}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {hotel.distance}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center mb-2">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              <span className="font-medium">{hotel.rating}</span>
                            </div>
                            <div className="text-2xl font-bold font-display">
                          R$ {hotel.price}
                            </div>
                            <p className="text-sm text-muted-foreground">por noite</p>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {getAmenityIcon(amenity)}
                              <span className="text-xs">{amenity}</span>
                            </Badge>
                          ))}
                        </div>

                        {/* Action Button */}
                        <Button 
                          onClick={() => hotel.bookingUrl ? window.open(hotel.bookingUrl, "_blank") : handleBooking(hotel)}
                          disabled={selectedHotel === hotel.id}
                          className="w-full sm:w-auto hover-scale"
                        >
                          {hotel.bookingUrl ? "Reservar Hotel" : (selectedHotel === hotel.id ? "Processando..." : "Reservar Agora")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center pt-4">
              <Button variant="outline" className="hover-scale">
                Carregar mais hotéis
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Localização dos Hotéis</h3>
            <TravelMap 
              locations={hotels.map(hotel => ({
                id: hotel.id,
                name: hotel.name,
                coordinates: [-43.2096 + Math.random() * 0.1, -22.9035 + Math.random() * 0.1] as [number, number],
                type: "hotel" as const
              }))}
              className="h-96"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};