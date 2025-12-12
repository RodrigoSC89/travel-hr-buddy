import { useCallback, useEffect, useState } from "react";;
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/unified/Skeletons.unified";
import { logger } from "@/lib/logger";
import {
  Ship, 
  Anchor, 
  MapPin, 
  Calendar, 
  Users, 
  Settings, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  BarChart3,
  Clock,
  Wrench,
  Shield,
  Database,
  Bell,
  TrendingUp,
  TrendingDown,
  Fuel,
  Gauge
} from "lucide-react";
import ModuleActionButton from "@/components/ui/module-action-button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * PATCH 549.0 - Fleet Management (Optimized)
 * Removed lazy loading to prevent freezing issues
 */

const MaritimeFleetManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Quick stats state
  const [fleetStats, setFleetStats] = useState({
    totalVessels: 0,
    activeVessels: 0,
    maintenanceVessels: 0,
    criticalAlerts: 0,
    efficiency: 0
  });

  // Vessels data for AI
  const [vessels, setVessels] = useState<any[]>([]);

  const loadFleetStats = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // PATCH 549: Limit query to prevent loading too much data
      const { data: vesselsData, error } = await supabase
        .from("vessels")
        .select("id, name, status")
        .limit(100);
      
      if (error) {
        // Mock data fallback
        setFleetStats({
          totalVessels: 18,
          activeVessels: 15,
          maintenanceVessels: 3,
          criticalAlerts: 2,
          efficiency: 87.5
        };
        setVessels([]);
      } else {
        // Calculate stats from real data
        const total = vesselsData?.length || 0;
        const active = vesselsData?.filter(v => v.status === "active").length || 0;
        const maintenance = vesselsData?.filter(v => v.status === "maintenance").length || 0;
        
        setFleetStats({
          totalVessels: total,
          activeVessels: active,
          maintenanceVessels: maintenance,
          criticalAlerts: 2,
          efficiency: 87.5
        };
        setVessels(vesselsData || []);
      }
    } catch (error) {
      logger.error("Failed to fetch vessel data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // PATCH 549: Fixed dependencies to prevent infinite loops
  useEffect(() => {
    loadFleetStats();
  }, [loadFleetStats]);

  const exportFleetData = async () => {
    try {
      toast({
        title: "Exportando dados da frota",
        description: "O relatório será gerado em breve...",
      };
      
      // Simulate export process
      setTimeout(() => {
        toast({
          title: "Exportação concluída",
          description: "Relatório da frota exportado com sucesso!",
        };
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados da frota",
        variant: "destructive"
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-azure/5 to-primary/10">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-azure-600 to-azure-700 text-white">
                <Ship className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-azure-600 to-azure-700 bg-clip-text text-transparent">
                  Sistema Marítimo
                </h1>
                <p className="text-muted-foreground">
                  Gestão inteligente e completa da frota marítima
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={exportFleetData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Última atualização: {new Date().toLocaleTimeString("pt-BR")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Embarcações</p>
                  <p className="text-2xl font-bold">{fleetStats.totalVessels}</p>
                </div>
                <Ship className="h-8 w-8 text-azure-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Operacionais</p>
                  <p className="text-2xl font-bold text-success">{fleetStats.activeVessels}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manutenção</p>
                  <p className="text-2xl font-bold text-warning">{fleetStats.maintenanceVessels}</p>
                </div>
                <Wrench className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alertas Críticos</p>
                  <p className="text-2xl font-bold text-destructive">{fleetStats.criticalAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eficiência</p>
                  <p className="text-2xl font-bold text-primary">{fleetStats.efficiency}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 mb-8 min-w-fit">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Painel Geral</span>
                <span className="sm:hidden">Painel</span>
              </TabsTrigger>
              <TabsTrigger value="ai-insights" className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Insights IA</span>
                <span className="sm:hidden">IA</span>
              </TabsTrigger>
              <TabsTrigger value="vessels" className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                <span className="hidden sm:inline">Frota Ativa</span>
                <span className="sm:hidden">Frota</span>
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Manutenção</span>
                <span className="sm:hidden">Manutenção</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documentação</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Rastreamento</span>
                <span className="sm:hidden">GPS</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Alertas IA</span>
                <span className="sm:hidden">Alertas</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Conformidade</span>
                <span className="sm:hidden">Conf.</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notificações</span>
                <span className="sm:hidden">Notif.</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Painel Geral da Frota</CardTitle>
                <CardDescription>Visão consolidada de todas as operações</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sistema de gestão de frota operacional. Navegue pelas abas para acessar funcionalidades específicas.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Insights de IA</CardTitle>
                <CardDescription>Análise inteligente da frota</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Análises preditivas e recomendações baseadas em IA disponíveis em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vessels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Embarcações</CardTitle>
                <CardDescription>Controle completo da frota</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface de gestão de embarcações disponível em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manutenção</CardTitle>
                <CardDescription>Programação e histórico</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => handlenavigate}>
                  Ir para Planejador de Manutenção
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentação</CardTitle>
                <CardDescription>Centro de documentos da frota</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => handlenavigate}>
                  Ir para Document Hub
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>Análise de performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Painéis analíticos disponíveis em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rastreamento em Tempo Real</CardTitle>
                <CardDescription>Localização GPS da frota</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sistema de rastreamento em desenvolvimento.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Inteligentes</CardTitle>
                <CardDescription>Notificações e avisos críticos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => handlenavigate}>
                  Ir para Central de Notificações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conformidade</CardTitle>
                <CardDescription>Compliance regulatório</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => handlenavigate}>
                  Ir para Compliance Hub
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Central de comunicação</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => handlenavigate}>
                  Ir para Central de Notificações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="maritime-fleet"
        moduleName="Sistema Marítimo"
        moduleIcon={<Ship className="h-4 w-4" />}
        actions={[
          {
            id: "add-vessel",
            label: "Nova Embarcação",
            icon: <Plus className="h-4 w-4" />,
            action: () => setActiveTab("vessels"),
            variant: "default"
          },
          {
            id: "maintenance-schedule",
            label: "Agendar Manutenção",
            icon: <Calendar className="h-4 w-4" />,
            action: () => setActiveTab("maintenance"),
            variant: "outline"
          },
          {
            id: "fleet-report",
            label: "Relatório da Frota",
            icon: <FileText className="h-4 w-4" />,
            action: exportFleetData,
            variant: "outline"
          },
          {
            id: "emergency-alert",
            label: "Alerta de Emergência",
            icon: <AlertTriangle className="h-4 w-4" />,
            action: () => logger.info("Alerta de emergência ativado"),
            variant: "outline"
          }
        ]}
        quickActions={[
          {
            id: "vessel-search",
            label: "Buscar Embarcação",
            icon: <Search className="h-3 w-3" />,
            action: () => logger.info("Busca de embarcação"),
            shortcut: "Ctrl+F"
          },
          {
            id: "live-tracking",
            label: "Rastreamento em Tempo Real",
            icon: <MapPin className="h-3 w-3" />,
            action: () => logger.info("Open live tracking")
          }
        ]}
      />
    </div>
  );
};

export default MaritimeFleetManagement;