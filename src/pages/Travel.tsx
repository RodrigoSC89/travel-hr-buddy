import React, { useState, useEffect, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ModuleActionButton from "@/components/ui/module-action-button";
import { BackToDashboard } from "@/components/ui/back-to-dashboard";
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
  Download,
  CheckCircle,
  MessageSquare,
  Bell,
  FileText,
  Users,
} from "lucide-react";

// Lazy load travel components to reduce initial bundle size
const FlightSearch = lazy(() =>
  import("@/components/travel/flight-search").then(m => ({ default: m.FlightSearch }))
);
const EnhancedHotelSearch = lazy(() =>
  import("@/components/travel/enhanced-hotel-search").then(m => ({
    default: m.EnhancedHotelSearch,
  }))
);
const TravelMap = lazy(() =>
  import("@/components/travel/travel-map").then(m => ({ default: m.TravelMap }))
);
const PredictiveTravelDashboard = lazy(() =>
  import("@/components/travel/predictive-travel-dashboard").then(m => ({
    default: m.PredictiveTravelDashboard,
  }))
);
const TravelAnalyticsDashboard = lazy(() =>
  import("@/components/travel/travel-analytics-dashboard").then(m => ({
    default: m.TravelAnalyticsDashboard,
  }))
);
const TravelBookingSystem = lazy(() =>
  import("@/components/travel/travel-booking-system").then(m => ({
    default: m.TravelBookingSystem,
  }))
);
const TravelApprovalSystem = lazy(() =>
  import("@/components/travel/travel-approval-system").then(m => ({
    default: m.TravelApprovalSystem,
  }))
);
const TravelExpenseSystem = lazy(() =>
  import("@/components/travel/travel-expense-system").then(m => ({
    default: m.TravelExpenseSystem,
  }))
);
const TravelCommunication = lazy(() =>
  import("@/components/travel/travel-communication").then(m => ({ default: m.TravelCommunication }))
);
const TravelNotifications = lazy(() =>
  import("@/components/travel/travel-notifications").then(m => ({ default: m.TravelNotifications }))
);
const TravelDocumentManager = lazy(() =>
  import("@/components/travel/travel-document-manager").then(m => ({
    default: m.TravelDocumentManager,
  }))
);

// Loading component for suspense fallback
const ComponentLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

const Travel = () => {
  const [sampleLocations] = useState([
    {
      id: "1",
      name: "Aeroporto Internacional do Galeão",
      coordinates: [-43.2502, -22.8099] as [number, number],
      type: "airport" as const,
    },
    {
      id: "2",
      name: "Hotel Copacabana Palace",
      coordinates: [-43.1729, -22.9068] as [number, number],
      type: "hotel" as const,
    },
    {
      id: "3",
      name: "Aeroporto de Congonhas",
      coordinates: [-46.6566, -23.6262] as [number, number],
      type: "airport" as const,
    },
  ]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const quickStats = [
    { icon: Plane, label: "Voos Agendados", value: "12", color: "info" },
    { icon: Building, label: "Reservas Ativas", value: "8", color: "success" },
    { icon: Globe, label: "Destinos", value: "15", color: "primary" },
    { icon: CreditCard, label: "Economia", value: "R$ 45k", color: "warning" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20 animate-pulse" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-info/10 to-transparent rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-secondary/5 to-success/5 rounded-full blur-2xl animate-pulse" />

      <div className="relative z-10 p-6 space-y-8">
        <BackToDashboard />

        {/* Enhanced Hero Section with Modern Design */}
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-info via-info/90 to-info-glow p-8 text-info-foreground 
          transition-all duration-1000 transform border border-info/20 backdrop-blur-sm
          ${isLoaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}
        >
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-2xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-r from-success/10 to-warning/10 rounded-full blur-xl animate-bounce"
            style={{ animationDelay: "2s" }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-info/20 backdrop-blur-sm animate-pulse-glow shadow-lg border border-info/30">
                <Plane className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg bg-gradient-to-r from-white to-info-foreground/80 bg-clip-text">
                  Sistema de Viagens Inteligente
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md font-semibold flex items-center gap-2">
                  Planeje, gerencie e otimize suas viagens corporativas
                  <Sparkles className="w-6 h-6 animate-pulse text-warning" />
                </p>
              </div>
            </div>

            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium leading-relaxed">
              Tecnologia avançada com IA preditiva, integração global e otimização automática de
              custos para revolucionar sua experiência de viagens corporativas com análise em tempo
              real.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-primary/90 text-primary-foreground px-4 py-3 rounded-xl backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:bg-primary shadow-lg border border-primary/30 cursor-pointer">
                <Brain className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">IA Preditiva Avançada</span>
              </div>
              <div className="flex items-center gap-2 bg-success/90 text-success-foreground px-4 py-3 rounded-xl backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:bg-success shadow-lg border border-success/30 cursor-pointer">
                <Shield className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Segurança Total</span>
              </div>
              <div className="flex items-center gap-2 bg-warning/90 text-warning-foreground px-4 py-3 rounded-xl backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:bg-warning shadow-lg border border-warning/30 cursor-pointer">
                <TrendingUp className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Economia Máxima</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/90 text-secondary-foreground px-4 py-3 rounded-xl backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:bg-secondary shadow-lg border border-secondary/30 cursor-pointer">
                <Globe className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Cobertura Global</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats with Improved Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card
              key={index}
              className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl transform
              bg-gradient-to-br from-card via-card/95 to-${stat.color}/5 border-${stat.color}/20 hover:border-${stat.color}/40
              hover:shadow-${stat.color}/10 backdrop-blur-sm`}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div
                  className={`p-4 rounded-xl bg-${stat.color}/20 group-hover:scale-110 transition-all duration-300 shadow-lg border border-${stat.color}/30`}
                >
                  <stat.icon className={`w-7 h-7 text-${stat.color} group-hover:animate-pulse`} />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-foreground group-hover:text-${stat.color} transition-colors duration-300">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <div
                    className={`w-full h-1 bg-${stat.color}/20 rounded-full mt-2 overflow-hidden`}
                  >
                    <div
                      className={`h-full bg-${stat.color} rounded-full transform origin-left transition-transform duration-1000 group-hover:scale-x-100 scale-x-75`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="predictive" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-11 w-full max-w-full h-16 bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg rounded-2xl p-2 overflow-x-auto">
              <TabsTrigger
                value="predictive"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <Brain className="h-5 w-5 animate-pulse" />
                <span className="hidden md:inline font-semibold">IA Preditiva</span>
              </TabsTrigger>
              <TabsTrigger
                value="booking"
                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <CreditCard className="h-5 w-5" />
                <span className="hidden md:inline font-semibold">Reservas</span>
              </TabsTrigger>
              <TabsTrigger
                value="flights"
                className="flex items-center gap-2 data-[state=active]:bg-info data-[state=active]:text-info-foreground rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <Plane className="h-5 w-5" />
                <span className="hidden md:inline font-semibold">Voos</span>
              </TabsTrigger>
              <TabsTrigger
                value="hotels"
                className="flex items-center gap-2 data-[state=active]:bg-success data-[state=active]:text-success-foreground rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <Building className="h-5 w-5" />
                <span className="hidden md:inline font-semibold">Hotéis</span>
              </TabsTrigger>
              <TabsTrigger
                value="approvals"
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="hidden md:inline font-semibold">Aprovações</span>
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <DollarSign className="h-5 w-5" />
                <span className="hidden md:inline font-semibold">Despesas</span>
              </TabsTrigger>
              <TabsTrigger
                value="communication"
                className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="hidden md:inline font-semibold">Chat</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <Bell className="h-5 w-5" />
                <span className="hidden md:inline font-semibold">Notificações</span>
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <FileText className="h-5 w-5" />
                <span className="hidden md:inline font-semibold">Documentos</span>
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="flex items-center gap-2 data-[state=active]:bg-warning data-[state=active]:text-warning-foreground rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <MapPin className="h-5 w-5" />
                <span className="hidden md:inline font-semibold">Mapa</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="hidden md:inline font-semibold">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="predictive" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <PredictiveTravelDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="booking" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <TravelBookingSystem />
            </Suspense>
          </TabsContent>

          <TabsContent value="flights" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <FlightSearch />
            </Suspense>
          </TabsContent>

          <TabsContent value="hotels" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <EnhancedHotelSearch />
            </Suspense>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <TravelApprovalSystem />
            </Suspense>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <TravelExpenseSystem />
            </Suspense>
          </TabsContent>

          <TabsContent value="communication" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <TravelCommunication />
            </Suspense>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <TravelNotifications />
            </Suspense>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <TravelDocumentManager />
            </Suspense>
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
                  <Suspense fallback={<ComponentLoader />}>
                    <TravelMap locations={sampleLocations} className="h-full" />
                  </Suspense>
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

          <TabsContent value="analytics" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <TravelAnalyticsDashboard />
            </Suspense>
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
            id: "new-trip",
            label: "Nova Viagem",
            icon: <Plus className="h-4 w-4" />,
            action: () => {}, // console.log("Nova viagem")
            variant: "default",
          },
          {
            id: "bookings",
            label: "Reservas",
            icon: <Calendar className="h-4 w-4" />,
            action: () => {}, // console.log("Reservas")
            variant: "outline",
          },
          {
            id: "expenses",
            label: "Despesas",
            icon: <DollarSign className="h-4 w-4" />,
            action: () => {}, // console.log("Despesas"),
            variant: "outline",
          },
          {
            id: "reports",
            label: "Relatórios",
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => {}, // console.log("Relatórios"),
            variant: "outline",
          },
        ]}
        quickActions={[
          {
            id: "refresh",
            label: "Atualizar",
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => window.location.reload(),
            shortcut: "F5",
          },
          {
            id: "export",
            label: "Exportar",
            icon: <Download className="h-3 w-3" />,
            action: () => {}, // console.log("Export travel data")
          },
        ]}
      />
    </div>
  );
};

export default Travel;
