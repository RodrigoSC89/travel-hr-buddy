import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { EnhancedReservationsCalendar } from './enhanced-reservations-calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/ui/stats-card';
import {
  Calendar,
  Clock,
  MapPin,
  Plane,
  Building,
  User,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

interface Reservation {
  id: string;
  type: 'flight' | 'hotel';
  employee: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  cost: number;
  savings: number;
  details: {
    flight?: {
      airline: string;
      flightNumber: string;
      departure: string;
      arrival: string;
    };
    hotel?: {
      name: string;
      rating: number;
      checkIn: string;
      checkOut: string;
      room: string;
    };
  };
}

const mockReservations: Reservation[] = [
  {
    id: 'RSV001',
    type: 'flight',
    employee: 'Ana Silva',
    destination: 'São Paulo, SP',
    departureDate: '2024-01-15',
    returnDate: '2024-01-20',
    status: 'confirmed',
    cost: 1200,
    savings: 350,
    details: {
      flight: {
        airline: 'LATAM',
        flightNumber: 'LA3347',
        departure: 'FOR 08:30',
        arrival: 'GRU 11:45'
      }
    }
  },
  {
    id: 'RSV002',
    type: 'hotel',
    employee: 'Carlos Santos',
    destination: 'Rio de Janeiro, RJ',
    departureDate: '2024-01-18',
    returnDate: '2024-01-22',
    status: 'confirmed',
    cost: 800,
    savings: 120,
    details: {
      hotel: {
        name: 'Hotel Copacabana Palace',
        rating: 5,
        checkIn: '14:00',
        checkOut: '12:00',
        room: 'Quarto Executivo'
      }
    }
  },
  {
    id: 'RSV003',
    type: 'flight',
    employee: 'Marina Costa',
    destination: 'Miami, FL',
    departureDate: '2024-02-01',
    returnDate: '2024-02-08',
    status: 'pending',
    cost: 2800,
    savings: 450,
    details: {
      flight: {
        airline: 'American Airlines',
        flightNumber: 'AA2456',
        departure: 'FOR 14:30',
        arrival: 'MIA 22:15'
      }
    }
  },
  {
    id: 'RSV004',
    type: 'hotel',
    employee: 'Roberto Lima',
    destination: 'Salvador, BA',
    departureDate: '2024-01-25',
    returnDate: '2024-01-28',
    status: 'completed',
    cost: 600,
    savings: 80,
    details: {
      hotel: {
        name: 'Hotel Casa do Amarelindo',
        rating: 4,
        checkIn: '15:00',
        checkOut: '11:00',
        room: 'Suíte Master'
      }
    }
  }
];

export const ReservationsDashboard = () => {
  const [reservations] = useState<Reservation[]>(mockReservations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const stats = [
    {
      title: "Reservas Ativas",
      value: reservations.filter(r => r.status === 'confirmed').length.toString(),
      icon: CheckCircle,
      variant: 'success' as const
    },
    {
      title: "Pendentes",
      value: reservations.filter(r => r.status === 'pending').length.toString(),
      icon: AlertCircle,
      variant: 'warning' as const
    },
    {
      title: "Economia Total",
      value: `R$ ${reservations.reduce((acc, r) => acc + r.savings, 0).toLocaleString()}`,
      icon: MapPin,
      variant: 'ocean' as const
    },
    {
      title: "Custo Total",
      value: `R$ ${reservations.reduce((acc, r) => acc + r.cost, 0).toLocaleString()}`,
      icon: Clock,
      variant: 'default' as const
    }
  ];

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const matchesType = typeFilter === 'all' || reservation.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-white';
      case 'cancelled': return 'bg-destructive text-white';
      case 'completed': return 'bg-info text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Finalizada';
      default: return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
            Reservas & Agendamentos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão centralizada de todas as reservas
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline">
            <Filter className="mr-2" size={18} />
            Filtros Avançados
          </Button>
          <Button className="gradient-ocean">
            <Calendar className="mr-2" size={18} />
            Nova Reserva
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Buscar por funcionário, destino ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">Todos os Status</option>
              <option value="confirmed">Confirmada</option>
              <option value="pending">Pendente</option>
              <option value="completed">Finalizada</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">Todos os Tipos</option>
              <option value="flight">Voos</option>
              <option value="hotel">Hotéis</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => (
          <Card key={reservation.id} className="p-6 hover:shadow-nautical transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  reservation.type === 'flight' ? 'bg-primary/10' : 'bg-secondary/10'
                }`}>
                  {reservation.type === 'flight' ? (
                    <Plane className="text-primary" size={24} />
                  ) : (
                    <Building className="text-secondary" size={24} />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{reservation.id}</h3>
                    <Badge className={getStatusColor(reservation.status)}>
                      {getStatusLabel(reservation.status)}
                    </Badge>
                    <Badge variant="outline">
                      {reservation.type === 'flight' ? 'Voo' : 'Hotel'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User size={16} className="mr-2" />
                      {reservation.employee}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin size={16} className="mr-2" />
                      {reservation.destination}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar size={16} className="mr-2" />
                      {new Date(reservation.departureDate).toLocaleDateString('pt-BR')}
                      {reservation.returnDate && ` - ${new Date(reservation.returnDate).toLocaleDateString('pt-BR')}`}
                    </div>
                  </div>

                  {/* Details */}
                  {reservation.details.flight && (
                    <div className="bg-muted/50 p-3 rounded-lg mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Companhia</p>
                          <p className="text-muted-foreground">{reservation.details.flight.airline}</p>
                        </div>
                        <div>
                          <p className="font-medium">Voo</p>
                          <p className="text-muted-foreground">{reservation.details.flight.flightNumber}</p>
                        </div>
                        <div>
                          <p className="font-medium">Partida</p>
                          <p className="text-muted-foreground">{reservation.details.flight.departure}</p>
                        </div>
                        <div>
                          <p className="font-medium">Chegada</p>
                          <p className="text-muted-foreground">{reservation.details.flight.arrival}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {reservation.details.hotel && (
                    <div className="bg-muted/50 p-3 rounded-lg mb-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Hotel</p>
                          <p className="text-muted-foreground">{reservation.details.hotel.name}</p>
                        </div>
                        <div>
                          <p className="font-medium">Categoria</p>
                          <p className="text-muted-foreground">{'★'.repeat(reservation.details.hotel.rating)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Check-in</p>
                          <p className="text-muted-foreground">{reservation.details.hotel.checkIn}</p>
                        </div>
                        <div>
                          <p className="font-medium">Tipo de Quarto</p>
                          <p className="text-muted-foreground">{reservation.details.hotel.room}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-sm">
                      <div>
                        <span className="font-medium">Custo: </span>
                        <span className="text-muted-foreground">R$ {reservation.cost.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Economia: </span>
                        <span className="text-success">R$ {reservation.savings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Eye size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No results */}
      {filteredReservations.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou termos de busca
          </p>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="calendar">
          <EnhancedReservationsCalendar />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card className="p-12 text-center">
            <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h3 className="text-lg font-semibold mb-2">Visualização Timeline</h3>
            <p className="text-muted-foreground">
              Em desenvolvimento - Linha do tempo interativa das reservas
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};