import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Plane,
  Hotel,
  Car,
  Calendar as CalendarIcon,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  Star,
  Wifi,
  Car as CarIcon,
  Utensils,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingOption {
  id: string;
  type: "flight" | "hotel" | "car";
  provider: string;
  price: number;
  duration?: string;
  rating?: number;
  amenities?: string[];
  details: any;
}

interface BookingStep {
  id: string;
  title: string;
  completed: boolean;
  current: boolean;
}

export const TravelBookingSystem = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [searchResults, setSearchResults] = useState<BookingOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    flight?: BookingOption;
    hotel?: BookingOption;
    car?: BookingOption;
  }>({});
  const [bookingProgress, setBookingProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [searchCriteria, setSearchCriteria] = useState({
    origin: "",
    destination: "",
    departureDate: undefined as Date | undefined,
    returnDate: undefined as Date | undefined,
    passengers: 1,
    tripType: "round-trip",
    cabinClass: "economy",
    hotelRooms: 1,
    carType: "compact",
  });

  const steps: BookingStep[] = [
    { id: "search", title: "Buscar", completed: false, current: true },
    { id: "select", title: "Selecionar", completed: false, current: false },
    { id: "details", title: "Detalhes", completed: false, current: false },
    { id: "payment", title: "Pagamento", completed: false, current: false },
    { id: "confirmation", title: "Confirmação", completed: false, current: false },
  ];

  // Mock data for search results
  const mockFlights: BookingOption[] = [
    {
      id: "flight-1",
      type: "flight",
      provider: "LATAM Airlines",
      price: 850,
      duration: "2h 30m",
      rating: 4.2,
      details: {
        departure: "08:00",
        arrival: "10:30",
        aircraft: "Airbus A320",
        stops: 0,
      },
    },
    {
      id: "flight-2",
      type: "flight",
      provider: "GOL",
      price: 720,
      duration: "2h 45m",
      rating: 4.0,
      details: {
        departure: "14:20",
        arrival: "17:05",
        aircraft: "Boeing 737",
        stops: 0,
      },
    },
  ];

  const mockHotels: BookingOption[] = [
    {
      id: "hotel-1",
      type: "hotel",
      provider: "Marriott",
      price: 320,
      rating: 4.5,
      amenities: ["Wifi", "Piscina", "Academia", "Spa"],
      details: {
        roomType: "Quarto Executivo",
        address: "Centro da cidade",
        checkIn: "15:00",
        checkOut: "12:00",
      },
    },
    {
      id: "hotel-2",
      type: "hotel",
      provider: "Hilton",
      price: 280,
      rating: 4.3,
      amenities: ["Wifi", "Business Center", "Restaurante"],
      details: {
        roomType: "Quarto Standard",
        address: "Zona Empresarial",
        checkIn: "14:00",
        checkOut: "11:00",
      },
    },
  ];

  const mockCars: BookingOption[] = [
    {
      id: "car-1",
      type: "car",
      provider: "Hertz",
      price: 150,
      rating: 4.1,
      details: {
        model: "Nissan Versa",
        category: "Econômico",
        transmission: "Automático",
        fuel: "Flex",
      },
    },
  ];

  const validateSearchForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!searchCriteria.origin.trim()) {
      errors.origin = "Origem é obrigatória";
    }

    if (!searchCriteria.destination.trim()) {
      errors.destination = "Destino é obrigatório";
    }

    if (!searchCriteria.departureDate) {
      errors.departureDate = "Data de ida é obrigatória";
    }

    if (searchCriteria.tripType === "round-trip" && !searchCriteria.returnDate) {
      errors.returnDate = "Data de volta é obrigatória para viagens ida e volta";
    }

    if (searchCriteria.departureDate && searchCriteria.returnDate) {
      if (searchCriteria.returnDate < searchCriteria.departureDate) {
        errors.returnDate = "Data de volta deve ser posterior à data de ida";
      }
    }

    if (searchCriteria.passengers < 1 || searchCriteria.passengers > 9) {
      errors.passengers = "Número de passageiros deve estar entre 1 e 9";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSearch = async () => {
    // Validate form before searching
    if (!validateSearchForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios corretamente.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setBookingProgress(20);
    setFormErrors({}); // Clear any previous errors

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSearchResults([...mockFlights, ...mockHotels, ...mockCars]);
      setCurrentStep(1);
      setBookingProgress(40);
      toast({
        title: "Busca realizada",
        description: "Encontramos as melhores opções para sua viagem!",
      });
    } catch (error) {
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar opções de viagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectOption = (option: BookingOption) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option.type]: option,
    }));
    setBookingProgress(60);
  };

  const handleBooking = () => {
    setBookingProgress(100);
    setCurrentStep(4);
    toast({
      title: "Reserva confirmada!",
      description: "Sua viagem foi reservada com sucesso. Você receberá os vouchers por email.",
    });
  };

  const renderSearchForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="origin">Origem *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="origin"
              placeholder="São Paulo, SP"
              value={searchCriteria.origin}
              onChange={e => {
                setSearchCriteria(prev => ({ ...prev, origin: e.target.value }));
                if (formErrors.origin) {
                  setFormErrors(prev => ({ ...prev, origin: "" }));
                }
              }}
              className={cn("pl-10", formErrors.origin && "border-destructive")}
            />
          </div>
          {formErrors.origin && (
            <p className="text-sm text-destructive mt-1">{formErrors.origin}</p>
          )}
        </div>
        <div>
          <Label htmlFor="destination">Destino *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="destination"
              placeholder="Rio de Janeiro, RJ"
              value={searchCriteria.destination}
              onChange={e => {
                setSearchCriteria(prev => ({ ...prev, destination: e.target.value }));
                if (formErrors.destination) {
                  setFormErrors(prev => ({ ...prev, destination: "" }));
                }
              }}
              className={cn("pl-10", formErrors.destination && "border-destructive")}
            />
          </div>
          {formErrors.destination && (
            <p className="text-sm text-destructive mt-1">{formErrors.destination}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Data de Ida *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !searchCriteria.departureDate && "text-muted-foreground",
                  formErrors.departureDate && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchCriteria.departureDate
                  ? format(searchCriteria.departureDate, "PPP")
                  : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={searchCriteria.departureDate}
                onSelect={date => {
                  setSearchCriteria(prev => ({ ...prev, departureDate: date }));
                  if (formErrors.departureDate) {
                    setFormErrors(prev => ({ ...prev, departureDate: "" }));
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {formErrors.departureDate && (
            <p className="text-sm text-destructive mt-1">{formErrors.departureDate}</p>
          )}
        </div>
        <div>
          <Label>Data de Volta {searchCriteria.tripType === "round-trip" && "*"}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !searchCriteria.returnDate && "text-muted-foreground",
                  formErrors.returnDate && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchCriteria.returnDate
                  ? format(searchCriteria.returnDate, "PPP")
                  : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={searchCriteria.returnDate}
                onSelect={date => {
                  setSearchCriteria(prev => ({ ...prev, returnDate: date }));
                  if (formErrors.returnDate) {
                    setFormErrors(prev => ({ ...prev, returnDate: "" }));
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {formErrors.returnDate && (
            <p className="text-sm text-destructive mt-1">{formErrors.returnDate}</p>
          )}
        </div>
        <div>
          <Label>Passageiros</Label>
          <Select
            value={searchCriteria.passengers.toString()}
            onValueChange={value =>
              setSearchCriteria(prev => ({ ...prev, passengers: parseInt(value) }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Passageiro</SelectItem>
              <SelectItem value="2">2 Passageiros</SelectItem>
              <SelectItem value="3">3 Passageiros</SelectItem>
              <SelectItem value="4">4+ Passageiros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full" disabled={isSearching}>
        {isSearching ? (
          <>
            <Clock className="mr-2 h-4 w-4 animate-spin" />
            Buscando melhores opções...
          </>
        ) : (
          <>
            <Plane className="mr-2 h-4 w-4" />
            Buscar Viagens
          </>
        )}
      </Button>
    </div>
  );

  const renderSearchResults = () => (
    <div className="space-y-6">
      <Tabs defaultValue="flights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flights">
            <Plane className="mr-2 h-4 w-4" />
            Voos
          </TabsTrigger>
          <TabsTrigger value="hotels">
            <Hotel className="mr-2 h-4 w-4" />
            Hotéis
          </TabsTrigger>
          <TabsTrigger value="cars">
            <Car className="mr-2 h-4 w-4" />
            Carros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights" className="space-y-4">
          {mockFlights.map(flight => (
            <Card key={flight.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-semibold">{flight.provider}</span>
                      <Badge variant="secondary">
                        {flight.details.stops === 0
                          ? "Direto"
                          : `${flight.details.stops} parada(s)`}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{flight.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {flight.details.departure} - {flight.details.arrival}
                      </span>
                      <span>{flight.duration}</span>
                      <span>{flight.details.aircraft}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">R$ {flight.price}</div>
                    <Button
                      onClick={() => handleSelectOption(flight)}
                      variant={selectedOptions.flight?.id === flight.id ? "default" : "outline"}
                    >
                      {selectedOptions.flight?.id === flight.id ? "Selecionado" : "Selecionar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="hotels" className="space-y-4">
          {mockHotels.map(hotel => (
            <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-semibold">{hotel.provider}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{hotel.rating}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {hotel.details.address}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {hotel.amenities?.map(amenity => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity === "Wifi" && <Wifi className="mr-1 h-3 w-3" />}
                          {amenity === "Restaurante" && <Utensils className="mr-1 h-3 w-3" />}
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">R$ {hotel.price}</div>
                    <div className="text-sm text-muted-foreground">por noite</div>
                    <Button
                      onClick={() => handleSelectOption(hotel)}
                      variant={selectedOptions.hotel?.id === hotel.id ? "default" : "outline"}
                      className="mt-2"
                    >
                      {selectedOptions.hotel?.id === hotel.id ? "Selecionado" : "Selecionar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="cars" className="space-y-4">
          {mockCars.map(car => (
            <Card key={car.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="font-semibold">{car.provider}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{car.rating}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {car.details.model} - {car.details.category} - {car.details.transmission}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">R$ {car.price}</div>
                    <div className="text-sm text-muted-foreground">por dia</div>
                    <Button
                      onClick={() => handleSelectOption(car)}
                      variant={selectedOptions.car?.id === car.id ? "default" : "outline"}
                      className="mt-2"
                    >
                      {selectedOptions.car?.id === car.id ? "Selecionado" : "Selecionar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {Object.keys(selectedOptions).length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <span className="text-sm text-muted-foreground">Total selecionado: </span>
            <span className="text-xl font-bold">
              R${" "}
              {Object.values(selectedOptions).reduce(
                (total, option) => total + (option?.price || 0),
                0
              )}
            </span>
          </div>
          <Button onClick={() => setCurrentStep(2)}>Continuar para Detalhes</Button>
        </div>
      )}
    </div>
  );

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Passageiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nome</Label>
                <Input id="firstName" placeholder="João" />
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input id="lastName" placeholder="Silva" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="joao@empresa.com" />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="+55 11 99999-9999" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências de Viagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notificações por SMS</Label>
              <Switch id="notifications" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="insurance">Seguro Viagem</Label>
              <Switch id="insurance" />
            </div>
            <div>
              <Label htmlFor="requests">Solicitações Especiais</Label>
              <Textarea
                id="requests"
                placeholder="Dietary restrictions, accessibility needs, etc."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Reserva</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedOptions.flight && (
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Plane className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{selectedOptions.flight.provider}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedOptions.flight.duration}
                    </div>
                  </div>
                </div>
                <div className="font-bold">R$ {selectedOptions.flight.price}</div>
              </div>
            )}
            {selectedOptions.hotel && (
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Hotel className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{selectedOptions.hotel.provider}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedOptions.hotel.details.roomType}
                    </div>
                  </div>
                </div>
                <div className="font-bold">R$ {selectedOptions.hotel.price}</div>
              </div>
            )}
            {selectedOptions.car && (
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <CarIcon className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{selectedOptions.car.provider}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedOptions.car.details.model}
                    </div>
                  </div>
                </div>
                <div className="font-bold">R$ {selectedOptions.car.price}</div>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold">
              R${" "}
              {Object.values(selectedOptions).reduce(
                (total, option) => total + (option?.price || 0),
                0
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          Voltar
        </Button>
        <Button onClick={() => setCurrentStep(3)}>Continuar para Pagamento</Button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="pl-10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Validade</Label>
              <Input id="expiry" placeholder="MM/AA" />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" placeholder="123" />
            </div>
          </div>
          <div>
            <Label htmlFor="cardName">Nome no Cartão</Label>
            <Input id="cardName" placeholder="João Silva" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          Voltar
        </Button>
        <Button onClick={handleBooking}>Confirmar Reserva</Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold">Reserva Confirmada!</h3>
        <p className="text-muted-foreground mt-2">
          Sua viagem foi reservada com sucesso. Você receberá os vouchers e confirmações por email.
        </p>
      </div>
      <div className="bg-muted p-6 rounded-lg">
        <div className="text-left space-y-2">
          <div className="flex justify-between">
            <span>Número da Reserva:</span>
            <span className="font-mono font-bold">
              TR-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge>Confirmado</Badge>
          </div>
          <div className="flex justify-between">
            <span>Total Pago:</span>
            <span className="font-bold">
              R${" "}
              {Object.values(selectedOptions).reduce(
                (total, option) => total + (option?.price || 0),
                0
              )}
            </span>
          </div>
        </div>
      </div>
      <Button onClick={() => window.location.reload()}>Nova Reserva</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Sistema de Reservas</h2>
        <div className="flex items-center gap-2">
          <Progress value={bookingProgress} className="w-48" />
          <span className="text-sm text-muted-foreground">{bookingProgress}%</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                currentStep >= index
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-muted-foreground text-muted-foreground"
              )}
            >
              {currentStep > index ? <CheckCircle className="h-5 w-5" /> : index + 1}
            </div>
            <div className="ml-2 text-sm font-medium text-muted-foreground">{step.title}</div>
            {index < steps.length - 1 && (
              <div
                className={cn("w-16 h-0.5 mx-4", currentStep > index ? "bg-primary" : "bg-muted")}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && renderSearchForm()}
          {currentStep === 1 && renderSearchResults()}
          {currentStep === 2 && renderBookingDetails()}
          {currentStep === 3 && renderPayment()}
          {currentStep === 4 && renderConfirmation()}
        </CardContent>
      </Card>
    </div>
  );
};
