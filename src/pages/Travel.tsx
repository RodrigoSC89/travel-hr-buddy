import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ModuleActionButton from "@/components/ui/module-action-button";
import { BackToDashboard } from "@/components/ui/back-to-dashboard";
import { logger } from "@/lib/logger";
import { useNavigate } from "react-router-dom";
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
  Users
} from "lucide-react";

/**
 * PATCH 549.0 - Travel Module (Optimized)
 * Removed 11 lazy loads to prevent freezing
 */

const Travel = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  // PATCH 549: Fixed dependencies
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
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 bg-dots opacity-20 animate-pulse" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-info/10 to-transparent rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl animate-float-reverse" />
      
      <div className="relative z-10 p-6 space-y-8">
        <BackToDashboard />
        
        {/* Enhanced Hero Section */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-info via-info/90 to-info-glow p-8 text-info-foreground 
          transition-all duration-1000 transform border border-info/20 backdrop-blur-sm
          ${isLoaded ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24 blur-2xl" />
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-primary/10 backdrop-blur-md border border-primary/20 shadow-2xl">
                  <Plane className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <Badge className="mb-2 bg-primary/20 hover:bg-primary/30 text-primary-foreground border-primary/30 backdrop-blur-sm">
                    Sistema de Viagens
                  </Badge>
                  <h1 className="text-4xl font-black text-foreground tracking-tight">
                    Gestão de Viagens
                  </h1>
                </div>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mb-6 leading-relaxed">
                Sistema completo para reservas, aprovações e gestão de viagens corporativas
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className={`hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border-${stat.color}/20 bg-gradient-to-br from-card via-card/95 to-${stat.color}/5`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-${stat.color}/20 to-${stat.color}/10`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <Badge variant="outline" className={`text-${stat.color} border-${stat.color}/30`}>
                    Ativo
                  </Badge>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</h3>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 bg-muted/50 p-2 rounded-2xl backdrop-blur-sm">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="flights">Voos</TabsTrigger>
              <TabsTrigger value="hotels">Hotéis</TabsTrigger>
              <TabsTrigger value="bookings">Reservas</TabsTrigger>
              <TabsTrigger value="approvals">Aprovações</TabsTrigger>
              <TabsTrigger value="expenses">Despesas</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Viagens Corporativas</CardTitle>
                <CardDescription>Gestão completa de viagens e reservas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Plataforma completa para gerenciar todas as necessidades de viagens corporativas.
                </p>
                <div className="grid gap-3">
                  <Button onClick={() => navigate("/reservations")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Reserva
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/dashboard/document-hub")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Documentos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Busca de Voos</CardTitle>
                <CardDescription>Encontre e reserve passagens aéreas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sistema de busca e reserva de voos em desenvolvimento.
                </p>
                <Button onClick={() => navigate("/reservations")}>
                  Ir para Sistema de Reservas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Busca de Hotéis</CardTitle>
                <CardDescription>Encontre acomodações ideais</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sistema de busca de hotéis em desenvolvimento.
                </p>
                <Button onClick={() => navigate("/reservations")}>
                  Ir para Sistema de Reservas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Reservas</CardTitle>
                <CardDescription>Gerencie todas as suas reservas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/reservations")}>
                  Ir para Sistema de Reservas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aprovações de Viagens</CardTitle>
                <CardDescription>Sistema de aprovação e autorização</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fluxo de aprovações em desenvolvimento.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Despesas</CardTitle>
                <CardDescription>Controle financeiro de viagens</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sistema de controle de despesas em desenvolvimento.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics de Viagens</CardTitle>
                <CardDescription>Análise de padrões e custos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Painéis analíticos disponíveis em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos de Viagem</CardTitle>
                <CardDescription>Gestão de documentação</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/dashboard/document-hub")}>
                  Ir para Document Hub
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="travel"
        moduleName="Viagens"
        moduleIcon={<Plane className="h-4 w-4" />}
        actions={[
          {
            id: "new-booking",
            label: "Nova Reserva",
            icon: <Plus className="h-4 w-4" />,
            action: () => navigate("/reservations"),
            variant: "default"
          },
          {
            id: "analytics",
            label: "Ver Analytics",
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => logger.info("Opening travel analytics"),
            variant: "outline"
          },
          {
            id: "export",
            label: "Exportar Dados",
            icon: <Download className="h-4 w-4" />,
            action: () => logger.info("Exporting travel data"),
            variant: "outline"
          }
        ]}
        quickActions={[
          {
            id: "refresh",
            label: "Atualizar",
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => window.location.reload(),
            shortcut: "F5"
          }
        ]}
      />
    </div>
  );
};

export default Travel;
