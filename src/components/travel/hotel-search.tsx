import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from '@/components/ui/stats-card';
import { 
  Building, 
  Search, 
  Calendar,
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  Users,
  DollarSign,
  Filter
} from 'lucide-react';

interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  originalPrice?: number;
  savings?: number;
  images: string[];
  amenities: string[];
  roomType: string;
  description: string;
  distance: string;
  freeCancellation: boolean;
  breakfastIncluded: boolean;
}

const mockHotels: Hotel[] = [
  {
    id: '1',
    name: 'Copacabana Palace',
    address: 'Av. Atlântica, 1702',
    city: 'Rio de Janeiro',
    rating: 4.8,
    reviewCount: 2847,
    pricePerNight: 850,
    originalPrice: 1200,
    savings: 350,
    images: [],
    amenities: ['wifi', 'pool', 'gym', 'spa', 'parking'],
    roomType: 'Suíte Ocean View',
    description: 'Hotel icônico em Copacabana com vista para o mar',
    distance: '100m da praia',
    freeCancellation: true,
    breakfastIncluded: true
  },
  {
    id: '2',
    name: 'Hotel Fasano Rio',
    address: 'Av. Vieira Souto, 80',
    city: 'Rio de Janeiro',
    rating: 4.9,
    reviewCount: 1923,
    pricePerNight: 950,
    originalPrice: 1350,
    savings: 400,
    images: [],
    amenities: ['wifi', 'pool', 'gym', 'spa', 'restaurant'],
    roomType: 'Quarto Superior',
    description: 'Luxo e sofisticação em Ipanema',
    distance: '50m da praia',
    freeCancellation: true,
    breakfastIncluded: true
  },
  {
    id: '3',
    name: 'Windsor Barra',
    address: 'Av. Lúcio Costa, 2630',
    city: 'Rio de Janeiro',
    rating: 4.5,
    reviewCount: 3421,
    pricePerNight: 420,
    originalPrice: 520,
    savings: 100,
    images: [],
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'parking'],
    roomType: 'Quarto Standard',
    description: 'Conforto e qualidade na Barra da Tijuca',
    distance: '200m da praia',
    freeCancellation: true,
    breakfastIncluded: false
  }
];

export const HotelSearch = () => {
  const [hotels] = useState<Hotel[]>(mockHotels);
  const [searchParams, setSearchParams] = useState({
    destination: 'Rio de Janeiro',
    checkIn: '2024-01-15',
    checkOut: '2024-01-17',
    guests: 2,
    rooms: 1
  });

  const stats = [
    {
      title: "Melhor Preço",
      value: `R$ ${Math.min(...hotels.map(h => h.pricePerNight))}/noite`,
      icon: DollarSign,
      variant: 'success' as const
    },
    {
      title: "Economia Média",
      value: `R$ ${Math.round(hotels.reduce((acc, h) => acc + (h.savings || 0), 0) / hotels.length)}`,
      icon: Building,
      variant: 'ocean' as const
    },
    {
      title: "Hotéis Disponíveis",
      value: hotels.length.toString(),
      icon: Search,
      variant: 'default' as const
    },
    {
      title: "Melhor Avaliação",
      value: Math.max(...hotels.map(h => h.rating)).toFixed(1),
      icon: Star,
      variant: 'warning' as const
    }
  ];

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi size={16} />;
      case 'pool': return <Waves size={16} />;
      case 'gym': return <Dumbbell size={16} />;
      case 'spa': return <Star size={16} />;
      case 'restaurant': return <Coffee size={16} />;
      case 'parking': return <Car size={16} />;
      default: return null;
    }
  };

  const getAmenityName = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return 'Wi-Fi';
      case 'pool': return 'Piscina';
      case 'gym': return 'Academia';
      case 'spa': return 'Spa';
      case 'restaurant': return 'Restaurante';
      case 'parking': return 'Estacionamento';
      default: return amenity;
    }
  };

  const calculateNights = () => {
    const checkIn = new Date(searchParams.checkIn);
    const checkOut = new Date(searchParams.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
            Hospedagem
          </h1>
          <p className="text-muted-foreground mt-1">
            Encontre as melhores ofertas de hotéis
          </p>
        </div>
      </div>

      {/* Search Form */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Destino</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                value={searchParams.destination}
                onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
                className="pl-10"
                placeholder="Cidade ou hotel"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Check-in</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="date"
                value={searchParams.checkIn}
                onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Check-out</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="date"
                value={searchParams.checkOut}
                onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Hóspedes</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="number"
                min="1"
                value={searchParams.guests}
                onChange={(e) => setSearchParams({...searchParams, guests: parseInt(e.target.value)})}
                className="pl-10"
                placeholder="Número de hóspedes"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <Button className="w-full gradient-ocean">
              <Search className="mr-2" size={18} />
              Buscar
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-muted-foreground" />
            <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground">
              <option value="price_low">Menor preço</option>
              <option value="price_high">Maior preço</option>
              <option value="rating">Melhor avaliação</option>
              <option value="distance">Mais próximo</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Hotel Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Resultados da Busca</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{hotels.length} hotéis encontrados</span>
            <span>•</span>
            <span>{calculateNights()} noite(s)</span>
          </div>
        </div>

        {hotels.map((hotel) => (
          <Card key={hotel.id} className="p-6 hover:shadow-nautical transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:space-x-6">
              {/* Hotel Image Placeholder */}
              <div className="lg:w-64 h-48 lg:h-32 rounded-lg gradient-ocean flex items-center justify-center mb-4 lg:mb-0">
                <Building className="text-white" size={48} />
              </div>

              {/* Hotel Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{hotel.name}</h3>
                    <p className="text-muted-foreground flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {hotel.address}, {hotel.city}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{hotel.distance}</p>
                  </div>
                  
                  <div className="flex items-center mt-2 md:mt-0">
                    <div className="flex items-center mr-3">
                      <Star className="text-warning mr-1" size={16} fill="currentColor" />
                      <span className="font-semibold">{hotel.rating}</span>
                      <span className="text-muted-foreground text-sm ml-1">
                        ({hotel.reviewCount} avaliações)
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground">{hotel.description}</p>
                
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">{hotel.roomType}</Badge>
                  {hotel.freeCancellation && (
                    <Badge className="bg-success text-white">Cancelamento Grátis</Badge>
                  )}
                  {hotel.breakfastIncluded && (
                    <Badge className="bg-info text-white">Café Incluso</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {hotel.amenities.slice(0, 5).map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-1 text-sm text-muted-foreground">
                      {getAmenityIcon(amenity)}
                      <span>{getAmenityName(amenity)}</span>
                    </div>
                  ))}
                  {hotel.amenities.length > 5 && (
                    <span className="text-sm text-muted-foreground">
                      +{hotel.amenities.length - 5} mais
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="lg:w-48 text-center lg:text-right mt-4 lg:mt-0">
                <div className="space-y-2 mb-4">
                  {hotel.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      R$ {hotel.originalPrice}/noite
                    </p>
                  )}
                  <p className="text-2xl font-bold text-success">
                    R$ {hotel.pricePerNight}
                  </p>
                  <p className="text-sm text-muted-foreground">por noite</p>
                  {hotel.savings && (
                    <Badge className="bg-success text-white">
                      Economize R$ {hotel.savings}
                    </Badge>
                  )}
                  
                  <div className="pt-2 border-t border-border">
                    <p className="text-lg font-semibold">
                      Total: R$ {hotel.pricePerNight * calculateNights()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calculateNights()} noite(s)
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Ver Detalhes
                  </Button>
                  <Button className="w-full gradient-ocean">
                    Reservar Agora
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {hotels.length === 0 && (
        <Card className="p-12 text-center">
          <Building className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-semibold mb-2">Nenhum hotel encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os parâmetros de busca
          </p>
        </Card>
      )}
    </div>
  );
};