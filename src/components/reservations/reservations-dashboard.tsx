import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatsCard } from '@/components/ui/stats-card';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Building,
  Bed,
  Wifi,
  Car,
  Coffee,
  Star
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Reservation {
  id: string;
  type: 'hotel' | 'flight' | 'car' | 'restaurant' | 'meeting_room';
  title: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalPrice: number;
  description?: string;
  amenities?: string[];
  rating?: number;
}

const mockReservations: Reservation[] = [
  {
    id: '1',
    type: 'hotel',
    title: 'Hotel Copacabana Palace',
    location: 'Rio de Janeiro, RJ',
    checkIn: '2024-02-15',
    checkOut: '2024-02-18',
    guests: 2,
    status: 'confirmed',
    totalPrice: 1850,
    amenities: ['wifi', 'pool', 'spa', 'gym'],
    rating: 4.8
  },
  {
    id: '2',
    type: 'flight',
    title: 'Voo São Paulo - Rio',
    location: 'GRU → SDU',
    checkIn: '2024-02-15',
    checkOut: '2024-02-15',
    guests: 1,
    status: 'confirmed',
    totalPrice: 450
  },
  {
    id: '3',
    type: 'car',
    title: 'Aluguel de Carro',
    location: 'Rio de Janeiro, RJ',
    checkIn: '2024-02-15',
    checkOut: '2024-02-18',
    guests: 1,
    status: 'pending',
    totalPrice: 320
  },
  {
    id: '4',
    type: 'meeting_room',
    title: 'Sala de Reunião Executive',
    location: 'Centro Empresarial Rio',
    checkIn: '2024-02-16',
    checkOut: '2024-02-16',
    guests: 8,
    status: 'confirmed',
    totalPrice: 650,
    amenities: ['projector', 'wifi', 'coffee', 'whiteboard']
  }
];

export const ReservationsDashboard = () => {
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [newReservation, setNewReservation] = useState<Partial<Reservation>>({
    type: 'hotel',
    title: '',
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    status: 'pending',
    totalPrice: 0,
    description: ''
  });

  const handleCreateReservation = () => {
    if (!newReservation.title || !newReservation.location || !newReservation.checkIn) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      title: newReservation.title!,
      type: newReservation.type as Reservation['type'],
      location: newReservation.location!,
      checkIn: newReservation.checkIn!,
      checkOut: newReservation.checkOut || newReservation.checkIn!,
      guests: newReservation.guests || 1,
      status: 'pending',
      totalPrice: newReservation.totalPrice || 0,
      description: newReservation.description
    };

    setReservations(prev => [reservation, ...prev]);
    setNewReservation({
      type: 'hotel',
      title: '',
      location: '',
      checkIn: '',
      checkOut: '',
      guests: 1,
      status: 'pending',
      totalPrice: 0,
      description: ''
    });
    setIsCreatingReservation(false);
    
    toast({
      title: "Reserva criada!",
      description: `${reservation.title} foi adicionada com sucesso`
    });
  };

  const handleCancelReservation = (id: string) => {
    setReservations(prev => prev.map(res => 
      res.id === id ? { ...res, status: 'cancelled' } : res
    ));
    toast({
      title: "Reserva cancelada",
      description: "A reserva foi cancelada com sucesso"
    });
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || reservation.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || reservation.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = [
    {
      title: "Total de Reservas",
      value: reservations.length.toString(),
      icon: Calendar,
      variant: 'ocean' as const
    },
    {
      title: "Confirmadas",
      value: reservations.filter(r => r.status === 'confirmed').length.toString(),
      icon: CheckCircle,
      variant: 'success' as const
    },
    {
      title: "Pendentes",
      value: reservations.filter(r => r.status === 'pending').length.toString(),
      icon: Clock,
      variant: 'warning' as const
    },
    {
      title: "Valor Total",
      value: `R$ ${reservations.reduce((acc, r) => acc + r.totalPrice, 0).toLocaleString()}`,
      icon: Building,
      variant: 'default' as const
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return <Building className="w-4 h-4" />;
      case 'flight': return <Calendar className="w-4 h-4" />;
      case 'car': return <Car className="w-4 h-4" />;
      case 'restaurant': return <Coffee className="w-4 h-4" />;
      case 'meeting_room': return <Users className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hotel': return 'Hotel';
      case 'flight': return 'Voo';
      case 'car': return 'Carro';
      case 'restaurant': return 'Restaurante';
      case 'meeting_room': return 'Sala de Reunião';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as suas reservas e agendamentos
          </p>
        </div>
        <Dialog open={isCreatingReservation} onOpenChange={setIsCreatingReservation}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <Plus className="mr-2 w-4 h-4" />
              Nova Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Reserva</DialogTitle>
              <DialogDescription>
                Adicione uma nova reserva ao sistema
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Tipo</Label>
                <Select value={newReservation.type} onValueChange={(value) => setNewReservation(prev => ({ ...prev, type: value as Reservation['type'] }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="flight">Voo</SelectItem>
                    <SelectItem value="car">Carro</SelectItem>
                    <SelectItem value="restaurant">Restaurante</SelectItem>
                    <SelectItem value="meeting_room">Sala de Reunião</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Título *</Label>
                <Input
                  id="title"
                  value={newReservation.title || ''}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, title: e.target.value }))}
                  className="col-span-3"
                  placeholder="Nome da reserva"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Local *</Label>
                <Input
                  id="location"
                  value={newReservation.location || ''}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, location: e.target.value }))}
                  className="col-span-3"
                  placeholder="Localização"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="checkIn" className="text-right">Check-in *</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={newReservation.checkIn || ''}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, checkIn: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="checkOut" className="text-right">Check-out</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={newReservation.checkOut || ''}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, checkOut: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="guests" className="text-right">Pessoas</Label>
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  value={newReservation.guests || 1}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Valor (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  value={newReservation.totalPrice || ''}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, totalPrice: parseFloat(e.target.value) || 0 }))}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right">Descrição</Label>
                <Textarea
                  id="description"
                  value={newReservation.description || ''}
                  onChange={(e) => setNewReservation(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  placeholder="Detalhes adicionais..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateReservation}>
                Criar Reserva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
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
              placeholder="Buscar reservas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-muted-foreground" />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="flight">Voo</SelectItem>
                <SelectItem value="car">Carro</SelectItem>
                <SelectItem value="restaurant">Restaurante</SelectItem>
                <SelectItem value="meeting_room">Sala de Reunião</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Reservations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Suas Reservas</h2>
          <span className="text-sm text-muted-foreground">
            {filteredReservations.length} reservas encontradas
          </span>
        </div>

        {filteredReservations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma reserva encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira reserva
              </p>
              <Button onClick={() => setIsCreatingReservation(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Reserva
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredReservations.map((reservation) => (
              <Card key={reservation.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(reservation.type)}
                        <h3 className="text-lg font-semibold">{reservation.title}</h3>
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusLabel(reservation.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {reservation.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(reservation.checkIn).toLocaleDateString('pt-BR')}
                          {reservation.checkOut !== reservation.checkIn && (
                            <> - {new Date(reservation.checkOut).toLocaleDateString('pt-BR')}</>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {reservation.guests} pessoa{reservation.guests > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            R$ {reservation.totalPrice.toLocaleString()}
                          </Badge>
                        </div>
                      </div>

                      {reservation.amenities && (
                        <div className="flex items-center gap-2 mt-3">
                          {reservation.amenities.map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {reservation.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{reservation.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      {reservation.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelReservation(reservation.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};