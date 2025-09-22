import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { useToast } from '@/hooks/use-toast';
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
  Filter
} from 'lucide-react';

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
  class: 'economy' | 'business' | 'first';
  amenities: string[];
  rating: number;
  stops: number;
}

const mockFlights: FlightOption[] = [
  {
    id: '1',
    airline: 'LATAM',
    flightNumber: 'LA3511',
    departure: {
      airport: 'GRU',
      city: 'São Paulo',
      time: '08:30',
      date: '2024-01-15'
    },
    arrival: {
      airport: 'SDU',
      city: 'Rio de Janeiro',
      time: '09:45',
      date: '2024-01-15'
    },
    duration: '1h 15m',
    price: 299,
    originalPrice: 399,
    savings: 100,
    class: 'economy',
    amenities: ['wifi', 'snack'],
    rating: 4.5,
    stops: 0
  },
  {
    id: '2',
    airline: 'GOL',
    flightNumber: 'G31847',
    departure: {
      airport: 'GRU',
      city: 'São Paulo',
      time: '14:20',
      date: '2024-01-15'
    },
    arrival: {
      airport: 'GIG',
      city: 'Rio de Janeiro',
      time: '15:30',
      date: '2024-01-15'
    },
    duration: '1h 10m',
    price: 259,
    originalPrice: 329,
    savings: 70,
    class: 'economy',
    amenities: ['wifi'],
    rating: 4.2,
    stops: 0
  },
  {
    id: '3',
    airline: 'Azul',
    flightNumber: 'AD4502',
    departure: {
      airport: 'VCP',
      city: 'Campinas',
      time: '16:45',
      date: '2024-01-15'
    },
    arrival: {
      airport: 'SDU',
      city: 'Rio de Janeiro',
      time: '18:15',
      date: '2024-01-15'
    },
    duration: '1h 30m',
    price: 279,
    originalPrice: 349,
    savings: 70,
    class: 'economy',
    amenities: ['wifi', 'snack', 'entertainment'],
    rating: 4.7,
    stops: 0
  }
];

export const FlightSearch = () => {
  const { toast } = useToast();
  const [flights, setFlights] = useState<FlightOption[]>(mockFlights);
  const [filteredFlights, setFilteredFlights] = useState<FlightOption[]>(mockFlights);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    from: 'São Paulo (GRU)',
    to: 'Rio de Janeiro (SDU)',
    departure: '2024-01-15',
    return: '',
    passengers: 1,
    class: 'economy'
  });

  // Função para buscar voos
  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simular delay de busca
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular novos resultados baseados na busca
    const newFlights = mockFlights.map(flight => ({
      ...flight,
      price: flight.price + Math.floor(Math.random() * 100) - 50,
      departure: {
        ...flight.departure,
        city: searchParams.from.split('(')[0].trim(),
        airport: searchParams.from.includes('(') ? searchParams.from.match(/\(([^)]+)\)/)?.[1] || 'N/A' : 'N/A'
      },
      arrival: {
        ...flight.arrival,
        city: searchParams.to.split('(')[0].trim(),
        airport: searchParams.to.includes('(') ? searchParams.to.match(/\(([^)]+)\)/)?.[1] || 'N/A' : 'N/A'
      }
    }));
    
    setFlights(newFlights);
    setFilteredFlights(newFlights);
    setIsSearching(false);
    
    toast({
      title: "Busca concluída",
      description: `${newFlights.length} voos encontrados para ${searchParams.from} → ${searchParams.to}`
    });
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
      variant: 'success' as const
    },
    {
      title: "Economia Média",
      value: filteredFlights.length > 0 ? `R$ ${Math.round(filteredFlights.reduce((acc, f) => acc + (f.savings || 0), 0) / filteredFlights.length)}` : "R$ 0",
      icon: Plane,
      variant: 'ocean' as const
    },
    {
      title: "Opções Disponíveis",
      value: filteredFlights.length.toString(),
      icon: Search,
      variant: 'default' as const
    },
    {
      title: "Melhor Avaliação",
      value: filteredFlights.length > 0 ? Math.max(...filteredFlights.map(f => f.rating)).toFixed(1) : "0.0",
      icon: Star,
      variant: 'warning' as const
    }
  ];

  const getClassLabel = (flightClass: string) => {
    switch (flightClass) {
      case 'economy': return 'Econômica';
      case 'business': return 'Executiva';
      case 'first': return 'Primeira Classe';
      default: return flightClass;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi size={16} />;
      case 'snack': return <Coffee size={16} />;
      case 'entertainment': return <Star size={16} />;
      case 'luggage': return <Luggage size={16} />;
      default: return null;
    }
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
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-muted-foreground" />
              <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                <option value="economy">Econômica</option>
                <option value="business">Executiva</option>
                <option value="first">Primeira Classe</option>
              </select>
            </div>
          </div>
          
          <Button 
            className="gradient-ocean"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
      </Card>

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
              selectedFlight === flight.id ? 'ring-2 ring-primary shadow-nautical' : ''
            }`}
            onClick={() => handleSelectFlight(flight.id)}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Flight Info */}
              <div className="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-8">
                {/* Airline & Flight Number */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg gradient-ocean flex items-center justify-center text-white font-bold">
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
                    <Badge className="bg-success text-white">
                      Economize R$ {flight.savings}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full lg:w-auto">
                    Detalhes
                  </Button>
                  <Button 
                    className={`w-full lg:w-auto ${
                      selectedFlight === flight.id ? 'bg-success hover:bg-success/90' : 'gradient-ocean'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFlight(flight.id);
                    }}
                  >
                    {selectedFlight === flight.id ? 'Selecionado ✓' : 'Selecionar'}
                  </Button>
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