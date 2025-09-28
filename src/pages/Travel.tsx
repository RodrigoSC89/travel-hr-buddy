import React, { useState, useEffect } from 'react';
import { FlightSearch } from '@/components/travel/flight-search';
import { HotelSearch } from '@/components/travel/hotel-search';
import { TravelMap } from '@/components/travel/travel-map';
import { PredictiveTravelDashboard } from '@/components/travel/predictive-travel-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ModuleActionButton from '@/components/ui/module-action-button';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import { 
  Plane, 
  Building, 
  MapPin, 
  Calendar, 
  BarChart3, 
  Brain,
  Globe,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Briefcase,
  CreditCard,
  Shield,
  Plus,
  DollarSign,
  RefreshCw,
  Download
} from 'lucide-react';

const Travel = () => {
  const [sampleLocations] = useState([
    {
      id: '1',
      name: 'Aeroporto Internacional do Galeão',
      coordinates: [-43.2502, -22.8099] as [number, number],
      type: 'airport' as const
    },
    {
      id: '2', 
      name: 'Hotel Copacabana Palace',
      coordinates: [-43.1729, -22.9068] as [number, number],
      type: 'hotel' as const
    },
    {
      id: '3',
      name: 'Aeroporto de Congonhas',
      coordinates: [-46.6566, -23.6262] as [number, number],
      type: 'airport' as const
    }
  ]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const quickStats = [
    { icon: Plane, label: "Voos Agendados", value: "12", color: "info" },
    { icon: Building, label: "Reservas Ativas", value: "8", color: "success" },
    { icon: Globe, label: "Destinos", value: "15", color: "primary" },
    { icon: CreditCard, label: "Economia", value: "R$ 45k", color: "warning" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-info/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
      
      <div className="relative z-10 p-6 space-y-8">
        <BackToDashboard />
        
        {/* Enhanced Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-info via-info/90 to-info-glow p-8 text-info-foreground 
          transition-all duration-1000 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-info/20 backdrop-blur-sm animate-pulse-glow">
                <Plane className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                  Sistema de Viagens Inteligente
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                  Planeje, gerencie e otimize suas viagens corporativas
                  <Sparkles className="inline-block w-6 h-6 ml-2 animate-pulse" />
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
              Tecnologia avançada com IA preditiva, integração global e otimização automática de custos 
              para revolucionar sua experiência de viagens corporativas.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-primary shadow-lg border border-primary/30">
                <Brain className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">IA Preditiva</span>
              </div>
              <div className="flex items-center gap-2 bg-success/90 text-success-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-success shadow-lg border border-success/30">
                <Shield className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Segurança Total</span>
              </div>
              <div className="flex items-center gap-2 bg-warning/90 text-warning-foreground px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 hover:bg-warning shadow-lg border border-warning/30">
                <TrendingUp className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Economia Máxima</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl
              bg-gradient-to-br from-card via-card/95 to-${stat.color}/5 border-${stat.color}/20 hover:border-${stat.color}/40`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-${stat.color}/20 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="predictive" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-5 w-full max-w-4xl h-14 bg-card/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="predictive" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Brain className="h-5 w-5" />
                <span className="hidden md:inline">IA Preditiva</span>
              </TabsTrigger>
              <TabsTrigger value="flights" className="flex items-center gap-2 data-[state=active]:bg-info data-[state=active]:text-info-foreground">
                <Plane className="h-5 w-5" />
                <span className="hidden md:inline">Voos</span>
              </TabsTrigger>
              <TabsTrigger value="hotels" className="flex items-center gap-2 data-[state=active]:bg-success data-[state=active]:text-success-foreground">
                <Building className="h-5 w-5" />
                <span className="hidden md:inline">Hotéis</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2 data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">
                <MapPin className="h-5 w-5" />
                <span className="hidden md:inline">Mapa</span>
              </TabsTrigger>
              <TabsTrigger value="itinerary" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <Calendar className="h-5 w-5" />
                <span className="hidden md:inline">Roteiro</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="predictive" className="space-y-6">
            <PredictiveTravelDashboard />
          </TabsContent>

          <TabsContent value="flights" className="space-y-6">
            <FlightSearch />
          </TabsContent>

          <TabsContent value="hotels" className="space-y-6">
            <HotelSearch />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card className="bg-gradient-to-br from-card via-card/95 to-warning/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10">
                    <MapPin className="w-6 h-6 text-warning" />
                  </div>
                  <span className="text-gradient">Mapa Interativo de Viagens</span>
                  <Star className="w-6 h-6 text-warning animate-pulse" />
                </CardTitle>
                <CardDescription className="text-base">
                  Visualize destinos, rotas otimizadas e pontos de interesse em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-xl overflow-hidden border border-border/20">
                  <TravelMap locations={sampleLocations} className="h-full" />
                </div>
                <div className="mt-4 flex gap-2">
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    GPS Integrado
                  </Badge>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Tempo Real
                  </Badge>
                  <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                    Rotas Otimizadas
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="itinerary" className="space-y-6">
            <Card className="bg-gradient-to-br from-card via-card/95 to-secondary/5 hover:shadow-2xl transition-all duration-700 backdrop-blur-sm border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10">
                    <Calendar className="w-6 h-6 text-secondary" />
                  </div>
                  <span className="text-gradient">Roteiros Inteligentes</span>
                  <Clock className="w-6 h-6 text-secondary animate-pulse" />
                </CardTitle>
                <CardDescription className="text-base">
                  Gerencie itinerários, compromissos e otimize seu tempo de viagem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 inline-block mb-6">
                    <Calendar className="h-16 w-16 text-secondary mx-auto animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gradient">
                    Sistema de Roteiros em Desenvolvimento
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                    Funcionalidade avançada de roteiros com IA será disponibilizada em breve
                  </p>
                  <Button variant="outline" className="gap-2">
                    <Briefcase className="h-4 w-4" />
                    Solicitar Acesso Antecipado
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced FAB */}
      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="travel"
        moduleName="Viagens"
        moduleIcon={<Plane className="h-4 w-4" />}
        actions={[
          {
            id: 'new-trip',
            label: 'Nova Viagem',
            icon: <Plus className="h-4 w-4" />,
            action: () => console.log('Nova viagem'),
            variant: 'default'
          },
          {
            id: 'bookings',
            label: 'Reservas',
            icon: <Calendar className="h-4 w-4" />,
            action: () => console.log('Reservas'),
            variant: 'outline'
          },
          {
            id: 'expenses',
            label: 'Despesas',
            icon: <DollarSign className="h-4 w-4" />,
            action: () => console.log('Despesas'),
            variant: 'outline'
          },
          {
            id: 'reports',
            label: 'Relatórios',
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => console.log('Relatórios'),
            variant: 'outline'
          }
        ]}
        quickActions={[
          {
            id: 'refresh',
            label: 'Atualizar',
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => window.location.reload(),
            shortcut: 'F5'
          },
          {
            id: 'export',
            label: 'Exportar',
            icon: <Download className="h-3 w-3" />,
            action: () => console.log('Exportar')
          }
        ]}
      />
    </div>
  );
};

export default Travel;