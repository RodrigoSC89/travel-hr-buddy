import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatsCard } from "@/components/ui/stats-card";
import { useToast } from "@/hooks/use-toast";
import { useTravelPredictions } from "@/hooks/use-travel-predictions";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plane, 
  Search, 
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Wifi,
  Coffee,
  Luggage,
  Filter,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from "lucide-react";

// Cache interface for storing last 5 queries
interface SearchCache {
  params: {
    from: string;
    to: string;
    departure: string;
    return: string;
    passengers: number;
    class: string;
  };
  results: FlightOption[];
  timestamp: number;
}

const CACHE_KEY = "travel_search_cache";
const MAX_CACHE_ITEMS = 5;
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

interface FlightOption {
  id: string;
  airline: string;
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
  price: number;
  originalPrice?: number;
  savings?: number;
  class: "economy" | "business" | "first";
  amenities: string[];
  rating: number;
  stops: number;
  bookingUrl?: string;
}

const mockFlights: FlightOption[] = [
  {
    id: "1",
    airline: "LATAM",
    flightNumber: "LA3511",
    departure: {
      airport: "GRU",
      city: "São Paulo",
      time: "08:30",
      date: "2024-01-15"
    },
    arrival: {
      airport: "SDU",
      city: "Rio de Janeiro",
      time: "09:45",
      date: "2024-01-15"
    },
    duration: "1h 15m",
    price: 299,
    originalPrice: 399,
    savings: 100,
    class: "economy",
    amenities: ["wifi", "snack"],
    rating: 4.5,
    stops: 0,
    bookingUrl: "https://www.latam.com"
  },
  {
    id: "2",
    airline: "GOL",
    flightNumber: "G31847",
    departure: {
      airport: "GRU",
      city: "São Paulo",
      time: "14:20",
      date: "2024-01-15"
    },
    arrival: {
      airport: "GIG",
      city: "Rio de Janeiro",
      time: "15:30",
      date: "2024-01-15"
    },
    duration: "1h 10m",
    price: 259,
    originalPrice: 329,
    savings: 70,
    class: "economy",
    amenities: ["wifi"],
    rating: 4.2,
    stops: 0,
    bookingUrl: "https://www.voegol.com.br"
  },
  {
    id: "3",
    airline: "Azul",
    flightNumber: "AD4502",
    departure: {
      airport: "VCP",
      city: "Campinas",
      time: "16:45",
      date: "2024-01-15"
    },
    arrival: {
      airport: "SDU",
      city: "Rio de Janeiro",
      time: "18:15",
      date: "2024-01-15"
    },
    duration: "1h 30m",
    price: 279,
    originalPrice: 349,
    savings: 70,
    class: "economy",
    amenities: ["wifi", "snack", "entertainment"],
    rating: 4.7,
    stops: 0,
    bookingUrl: "https://www.voeazul.com.br"
  }
];

// Cache management functions
const loadCache = (): SearchCache[] => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const items = JSON.parse(cached) as SearchCache[];
      // Filter out expired items
      return items.filter(item => Date.now() - item.timestamp < CACHE_EXPIRY_MS);
    }
  } catch (error) {
    console.error("Error loading cache:", error);
  }
  return [];
};

const saveToCache = (params: SearchCache["params"], results: FlightOption[]) => {
  try {
    const cache = loadCache();
    // Add new item to the beginning
    cache.unshift({
      params,
      results,
      timestamp: Date.now()
    });
    // Keep only last 5 items
    const trimmedCache = cache.slice(0, MAX_CACHE_ITEMS);
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmedCache));
  } catch (error) {
    console.error("Error saving to cache:", error);
  }
};

const findInCache = (params: SearchCache["params"]): FlightOption[] | null => {
  try {
    const cache = loadCache();
    const match = cache.find(item => 
      item.params.from === params.from &&
      item.params.to === params.to &&
      item.params.departure === params.departure &&
      item.params.return === params.return &&
      item.params.passengers === params.passengers &&
      item.params.class === params.class
    );
    return match?.results || null;
  } catch (error) {
    console.error("Error finding in cache:", error);
    return null;
  }
};

// Input validation and intelligent rewriting
const validateAndRewriteInput = (input: string, type: "origin" | "destination"): string => {
  if (!input || input.trim().length === 0) {
    return "";
  }
  
  // Remove special characters and normalize
  let cleaned = input.trim().replace(/[^\w\s()-]/g, "");
  
  // If it's just a code (3 letters), capitalize it
  if (cleaned.length === 3 && /^[a-zA-Z]{3}$/.test(cleaned)) {
    return cleaned.toUpperCase();
  }
  
  // If it contains a code in parentheses, ensure it's properly formatted
  const codeMatch = cleaned.match(/\(([a-zA-Z]{3})\)/);
  if (codeMatch) {
    const cityPart = cleaned.split("(")[0].trim();
    const code = codeMatch[1].toUpperCase();
    return `${cityPart} (${code})`;
  }
  
  return cleaned;
};

export const FlightSearch = () => {
  const { toast } = useToast();
  const { 
    loading: predictionLoading, 
    predictions, 
    generatePrediction, 
    getInsights, 
    formatPredictionSummary 
  } = useTravelPredictions();
  
  const [flights, setFlights] = useState<FlightOption[]>(mockFlights);
  const [filteredFlights, setFilteredFlights] = useState<FlightOption[]>(mockFlights);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    from: "São Paulo (GRU)",
    to: "Rio de Janeiro (SDU)",
    departure: "2024-01-15",
    return: "",
    passengers: 1,
    class: "economy"
  });

  // Load cache on mount
  useEffect(() => {
    const cached = findInCache(searchParams);
    if (cached && cached.length > 0) {
      setFlights(cached);
      setFilteredFlights(cached);
    }
  }, []);

  // Função para buscar voos com validação melhorada
  const handleSearch = async () => {
    // Input validation and rewriting
    const validatedFrom = validateAndRewriteInput(searchParams.from, "origin");
    const validatedTo = validateAndRewriteInput(searchParams.to, "destination");
    const validatedDate = searchParams.departure;

    if (!validatedFrom || !validatedTo || !validatedDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, informe origem, destino e data válidos.",
        variant: "destructive"
      });
      return;
    }

    // Update params with validated values
    const validatedParams = {
      ...searchParams,
      from: validatedFrom,
      to: validatedTo
    };

    // Check cache first
    const cachedResults = findInCache(validatedParams);
    if (cachedResults) {
      setFlights(cachedResults);
      setFilteredFlights(cachedResults);
      setApiError(null);
      toast({
        title: "Resultados do cache",
        description: `${cachedResults.length} voos carregados do cache`,
      });
      return;
    }

    setIsSearching(true);
    setApiError(null);
    
    try {
      // Extrair códigos de aeroporto dos campos de origem e destino
      const originCode = validatedFrom.includes("(") 
        ? validatedFrom.match(/\(([^)]+)\)/)?.[1] || validatedFrom.slice(0, 3).toUpperCase()
        : validatedFrom.slice(0, 3).toUpperCase();
      
      const destinationCode = validatedTo.includes("(") 
        ? validatedTo.match(/\(([^)]+)\)/)?.[1] || validatedTo.slice(0, 3).toUpperCase()
        : validatedTo.slice(0, 3).toUpperCase();

      // Set timeout for API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout: API não respondeu em tempo hábil")), 10000)
      );

      const apiPromise = supabase.functions.invoke("amadeus-search", {
        body: {
          searchType: "flights",
          origin: originCode,
          destination: destinationCode,
          departureDate: validatedDate,
          adults: validatedParams.passengers,
        }
      });

      const { data, error } = await Promise.race([apiPromise, timeoutPromise]) as any;

      if (error) {
        throw error;
      }
      
      if (data.success && data.data?.data) {
        // Transform Amadeus data to our format
        const transformedFlights = data.data.data.map((offer: any, index: number) => {
          // Gerar URL específica de booking com parâmetros do voo
          const bookingUrl = generateFlightBookingUrl(offer, validatedParams);
          
          return {
            id: offer.id || `flight-${index}`,
            airline: offer.itineraries[0]?.segments[0]?.carrierCode || "XX",
            flightNumber: offer.itineraries[0]?.segments[0]?.number || "0000",
            departure: {
              airport: offer.itineraries[0]?.segments[0]?.departure?.iataCode || originCode,
              time: offer.itineraries[0]?.segments[0]?.departure?.at?.split("T")[1]?.substring(0, 5) || "00:00",
              city: validatedFrom.split("(")[0].trim(),
              date: offer.itineraries[0]?.segments[0]?.departure?.at?.split("T")[0] || validatedDate,
            },
            arrival: {
              airport: offer.itineraries[0]?.segments[0]?.arrival?.iataCode || destinationCode,
              time: offer.itineraries[0]?.segments[0]?.arrival?.at?.split("T")[1]?.substring(0, 5) || "00:00",
              city: validatedTo.split("(")[0].trim(),
              date: offer.itineraries[0]?.segments[0]?.arrival?.at?.split("T")[0] || validatedDate,
            },
            duration: offer.itineraries[0]?.duration?.replace("PT", "").replace("H", "h ").replace("M", "m") || "2h 30m",
            price: Math.round(parseFloat(offer.price?.total || "299")),
            originalPrice: Math.round(parseFloat(offer.price?.total || "299") * 1.2),
            savings: Math.round(parseFloat(offer.price?.total || "299") * 0.2),
            class: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin?.toLowerCase() || "economy",
            amenities: ["wifi", "snack"],
            rating: 4.0 + Math.random() * 1.0,
            stops: offer.itineraries[0]?.segments?.length - 1 || 0,
            bookingUrl: bookingUrl,
          };
        });

        if (transformedFlights.length > 0) {
          setFlights(transformedFlights);
          setFilteredFlights(transformedFlights);
          saveToCache(validatedParams, transformedFlights);
          setApiError(null);
          toast({
            title: "Busca concluída",
            description: `${transformedFlights.length} voos reais encontrados!`
          });
        } else {
          throw new Error("Nenhum voo encontrado na API");
        }
      } else {
        throw new Error("Resposta inválida da API");
      }
    } catch (error: any) {
      // Enhanced fallback with better error messages
      console.error("Flight search error:", error);
      
      let errorMessage = "Falha ao buscar dados. Exibindo resultados de demonstração.";
      if (error?.message?.includes("Timeout")) {
        errorMessage = "A API não respondeu a tempo. Exibindo resultados de demonstração.";
      } else if (error?.message?.includes("quota") || error?.message?.includes("rate limit")) {
        errorMessage = "Limite de requisições atingido. Exibindo resultados de demonstração.";
      } else if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
        errorMessage = "Erro de conexão. Verifique sua internet. Exibindo resultados de demonstração.";
      }

      setApiError(errorMessage);
      
      const newFlights = mockFlights.map(flight => ({
        ...flight,
        price: flight.price + Math.floor(Math.random() * 100) - 50,
        departure: {
          ...flight.departure,
          city: searchParams.from.split("(")[0].trim(),
        },
        arrival: {
          ...flight.arrival,
          city: searchParams.to.split("(")[0].trim(),
        },
        bookingUrl: generateMockFlightBookingUrl(flight, searchParams)
      }));
      
      setFlights(newFlights);
      setFilteredFlights(newFlights);
      saveToCache(validatedParams, newFlights);
      
      toast({
        title: "Modo de demonstração",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Função para gerar predição IA
  const handleGeneratePrediction = async () => {
    const originCode = searchParams.from.includes("(") 
      ? searchParams.from.match(/\(([^)]+)\)/)?.[1] || searchParams.from.slice(0, 3).toUpperCase()
      : searchParams.from.slice(0, 3).toUpperCase();
    
    const destinationCode = searchParams.to.includes("(") 
      ? searchParams.to.match(/\(([^)]+)\)/)?.[1] || searchParams.to.slice(0, 3).toUpperCase()
      : searchParams.to.slice(0, 3).toUpperCase();

    const routeCode = `${originCode}-${destinationCode}`;
    
    await generatePrediction("flight", routeCode);
    setShowPredictions(true);
  };

  const handleSelectFlight = (flightId: string) => {
    const newSelection = selectedFlight === flightId ? null : flightId;
    setSelectedFlight(newSelection);
    
    if (newSelection) {
      const flight = flights.find(f => f.id === flightId);
      toast({
        title: "Voo selecionado",
        description: `${flight?.airline} ${flight?.flightNumber} - R$ ${flight?.price}`
      });
    }
  };

  const stats = [
    {
      title: "Melhor Preço",
      value: filteredFlights.length > 0 ? `R$ ${Math.min(...filteredFlights.map(f => f.price))}` : "R$ 0",
      icon: DollarSign,
      variant: "success" as const
    },
    {
      title: "Economia Média",
      value: filteredFlights.length > 0 ? `R$ ${Math.round(filteredFlights.reduce((acc, f) => acc + (f.savings || 0), 0) / filteredFlights.length)}` : "R$ 0",
      icon: Plane,
      variant: "ocean" as const
    },
    {
      title: "Opções Disponíveis",
      value: filteredFlights.length.toString(),
      icon: Search,
      variant: "default" as const
    },
    {
      title: "Melhor Avaliação",
      value: filteredFlights.length > 0 ? Math.max(...filteredFlights.map(f => f.rating)).toFixed(1) : "0.0",
      icon: Star,
      variant: "warning" as const
    }
  ];

  const getClassLabel = (flightClass: string) => {
    switch (flightClass) {
    case "economy": return "Econômica";
    case "business": return "Executiva";
    case "first": return "Primeira Classe";
    default: return flightClass;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
    case "wifi": return <Wifi size={16} />;
    case "snack": return <Coffee size={16} />;
    case "entertainment": return <Star size={16} />;
    case "luggage": return <Luggage size={16} />;
    default: return null;
    }
  };

  // Função para gerar URL específica de booking com parâmetros do voo
  const generateFlightBookingUrl = (offer: any, searchParams: any) => {
    const airline = offer.itineraries[0]?.segments[0]?.carrierCode || "XX";
    const flightNumber = offer.itineraries[0]?.segments[0]?.number || "0000";
    const originCode = offer.itineraries[0]?.segments[0]?.departure?.iataCode || "";
    const destinationCode = offer.itineraries[0]?.segments[0]?.arrival?.iataCode || "";
    const departureDate = offer.itineraries[0]?.segments[0]?.departure?.at?.split("T")[0] || searchParams.departure;
    
    // URLs específicas por companhia aérea
    switch (airline.toUpperCase()) {
    case "LA":
    case "LATAM":
      return `https://www.latam.com/pt_br/apps/personas?fecha1_dia=${departureDate}&from=${originCode}&to=${destinationCode}&auAvailability=1&ida_vuelta=ida&vuelos_origen=${originCode}&vuelos_destino=${destinationCode}&flex=1&pax=1`;
    case "G3":
    case "GOL":
      return `https://www.voegol.com.br/pt/passagens-aereas?origem=${originCode}&destino=${destinationCode}&ida=${departureDate}&volta=&adultos=${searchParams.passengers}&criancas=0&bebes=0&classeServico=ECONOMIC`;
    case "AD":
    case "AZUL":
      return `https://www.voeazul.com.br/reservas/selecionar-voos?origem=${originCode}&destino=${destinationCode}&dataida=${departureDate}&volta=&adultos=${searchParams.passengers}&criancas=0&bebes=0&promocional=false`;
    default:
      return `https://www.kayak.com.br/flights/${originCode}-${destinationCode}/${departureDate}/${searchParams.passengers}adults?sort=bestflight_a&fs=airlines=${airline};stops=0`;
    }
  };

  const generateMockFlightBookingUrl = (flight: FlightOption, searchParams: any) => {
    const originCode = flight.departure.airport;
    const destinationCode = flight.arrival.airport;
    const departureDate = searchParams.departure;
    
    // URLs específicas baseadas na companhia aérea
    if (flight.airline === "LATAM") {
      return `https://www.latam.com/pt_br/apps/personas?fecha1_dia=${departureDate}&from=${originCode}&to=${destinationCode}&auAvailability=1&ida_vuelta=ida&vuelos_origen=${originCode}&vuelos_destino=${destinationCode}&flex=1&pax=${searchParams.passengers}`;
    } else if (flight.airline === "GOL") {
      return `https://www.voegol.com.br/pt/passagens-aereas?origem=${originCode}&destino=${destinationCode}&ida=${departureDate}&volta=&adultos=${searchParams.passengers}&criancas=0&bebes=0&classeServico=ECONOMIC`;
    } else if (flight.airline === "Azul") {
      return `https://www.voeazul.com.br/reservas/selecionar-voos?origem=${originCode}&destino=${destinationCode}&dataida=${departureDate}&volta=&adultos=${searchParams.passengers}&criancas=0&bebes=0&promocional=false`;
    }
    
    return flight.bookingUrl || `https://www.kayak.com.br/flights/${originCode}-${destinationCode}/${departureDate}/${searchParams.passengers}adults`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
            Passagens Aéreas
          </h1>
          <p className="text-muted-foreground mt-1">
            Busque e compare os melhores preços
          </p>
        </div>
      </div>

      {/* Predições IA */}
      {showPredictions && predictions && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  🤖 Análise Preditiva com IA
                </h3>
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                  {formatPredictionSummary(predictions)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={predictions.price_trend === "rising" ? "destructive" : predictions.price_trend === "falling" ? "default" : "secondary"}>
                    {predictions.price_trend === "rising" ? (
                      <><TrendingUp className="h-3 w-3 mr-1" /> Preços Subindo</>
                    ) : predictions.price_trend === "falling" ? (
                      <><TrendingDown className="h-3 w-3 mr-1" /> Preços Caindo</>
                    ) : (
                      <><AlertTriangle className="h-3 w-3 mr-1" /> Preços Estáveis</>
                    )}
                  </Badge>
                  <Badge variant="outline">
                    Confiança: {Math.round(predictions.confidence_score * 100)}%
                  </Badge>
                  <Badge variant="secondary">
                    Economia Potencial: R$ {Math.abs(predictions.predicted_price - predictions.current_avg_price).toFixed(0)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Form */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Origem</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                value={searchParams.from}
                onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                className="pl-10"
                placeholder="Cidade de origem"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Destino</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                value={searchParams.to}
                onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                className="pl-10"
                placeholder="Cidade de destino"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Data de Ida</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="date"
                value={searchParams.departure}
                onChange={(e) => setSearchParams({...searchParams, departure: e.target.value})}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Passageiros</label>
            <Input
              type="number"
              min="1"
              value={searchParams.passengers}
              onChange={(e) => setSearchParams({...searchParams, passengers: parseInt(e.target.value)})}
              placeholder="Número de passageiros"
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-muted-foreground" />
              <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                <option value="economy">Econômica</option>
                <option value="business">Executiva</option>
                <option value="first">Primeira Classe</option>
              </select>
            </div>
          </div>
            
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleGeneratePrediction}
              disabled={predictionLoading}
              className="flex-1 md:flex-initial"
            >
              {predictionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Analisando...
                </>
              ) : (
                <>
                  <Brain className="mr-2" size={18} />
                    IA Preditiva
                </>
              )}
            </Button>
              
            <Button 
              className="gradient-ocean flex-1 md:flex-initial"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-azure-100 mr-2"></div>
                    Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2" size={18} />
                    Buscar Voos
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* API Error Alert */}
      {apiError && (
        <Alert variant="destructive" className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            <strong>Aviso:</strong> {apiError}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Flight Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Resultados da Busca</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{filteredFlights.length} voos encontrados</span>
            {selectedFlight && <span>• 1 voo selecionado</span>}
          </div>
        </div>

        {filteredFlights.map((flight) => (
          <Card 
            key={flight.id} 
            className={`p-6 hover:shadow-nautical transition-all duration-300 cursor-pointer ${
              selectedFlight === flight.id ? "ring-2 ring-primary shadow-nautical" : ""
            }`}
            onClick={() => handleSelectFlight(flight.id)}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Flight Info */}
              <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-8">
                {/* Airline & Flight Number */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg gradient-ocean flex items-center justify-center text-azure-50 font-bold">
                    {flight.airline.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold">{flight.airline}</p>
                    <p className="text-sm text-muted-foreground">{flight.flightNumber}</p>
                  </div>
                </div>

                {/* Route Info */}
                <div className="flex items-center space-x-4 lg:space-x-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{flight.departure.time}</p>
                    <p className="text-sm text-muted-foreground">{flight.departure.airport}</p>
                    <p className="text-sm text-muted-foreground">{flight.departure.city}</p>
                  </div>
                  
                  <div className="flex-1 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-px bg-border flex-1"></div>
                      <Plane className="text-primary" size={20} />
                      <div className="h-px bg-border flex-1"></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{flight.duration}</p>
                    {flight.stops === 0 ? (
                      <Badge variant="secondary" className="mt-1">Direto</Badge>
                    ) : (
                      <Badge variant="outline" className="mt-1">{flight.stops} parada(s)</Badge>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold">{flight.arrival.time}</p>
                    <p className="text-sm text-muted-foreground">{flight.arrival.airport}</p>
                    <p className="text-sm text-muted-foreground">{flight.arrival.city}</p>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{getClassLabel(flight.class)}</Badge>
                    <div className="flex items-center">
                      <Star className="text-warning mr-1" size={14} fill="currentColor" />
                      <span className="text-sm font-medium">{flight.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {flight.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-muted-foreground" title={amenity}>
                        {getAmenityIcon(amenity)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="mt-4 lg:mt-0 lg:ml-8 text-center lg:text-right">
                <div className="space-y-2 mb-4">
                  {flight.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      R$ {flight.originalPrice}
                    </p>
                  )}
                  <p className="text-3xl font-bold text-success">
                    R$ {flight.price}
                  </p>
                  {flight.savings && (
                    <Badge className="bg-success text-azure-50">
                      Economize R$ {flight.savings}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full lg:w-auto">
                    Detalhes
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant={selectedFlight === flight.id ? "secondary" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFlight(flight.id);
                      }}
                      className="flex-1"
                    >
                      {selectedFlight === flight.id ? "Selecionado ✓" : "Selecionar"}
                    </Button>
                    {flight.bookingUrl && (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(flight.bookingUrl, "_blank");
                        }}
                        className="flex-1 gradient-ocean"
                      >
                        Comprar Passagem
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredFlights.length === 0 && (
        <Card className="p-12 text-center">
          <Plane className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-semibold mb-2">Nenhum voo encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os parâmetros de busca
          </p>
        </Card>
      )}
    </div>
  );
};