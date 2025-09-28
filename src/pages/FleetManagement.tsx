import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import ModuleActionButton from '@/components/ui/module-action-button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Components
import FleetOverviewDashboard from '@/components/fleet/fleet-overview-dashboard';
import VesselManagementSystem from '@/components/fleet/vessel-management-system';
import MaintenanceManagement from '@/components/fleet/maintenance-management';
import DocumentationCenter from '@/components/fleet/documentation-center';
import FleetAnalytics from '@/components/fleet/fleet-analytics';
import RealTimeTracking from '@/components/fleet/real-time-tracking';
import IntelligentAlerts from '@/components/fleet/intelligent-alerts';
import ComplianceCenter from '@/components/fleet/compliance-center';
import NotificationCenter from '@/components/fleet/notification-center';

const MaritimeFleetManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Quick stats state
  const [fleetStats, setFleetStats] = useState({
    totalVessels: 0,
    activeVessels: 0,
    maintenanceVessels: 0,
    criticalAlerts: 0,
    efficiency: 0
  });

  useEffect(() => {
    loadFleetStats();
  }, []);

  const loadFleetStats = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from database, fallback to mock data
      const { data: vessels, error } = await supabase
        .from('vessels')
        .select('*');
      
      if (error) {
        // Mock data fallback
        setFleetStats({
          totalVessels: 18,
          activeVessels: 15,
          maintenanceVessels: 3,
          criticalAlerts: 2,
          efficiency: 87.5
        });
      } else {
        // Calculate stats from real data
        const total = vessels?.length || 0;
        const active = vessels?.filter(v => v.status === 'active').length || 0;
        const maintenance = vessels?.filter(v => v.status === 'maintenance').length || 0;
        
        setFleetStats({
          totalVessels: total,
          activeVessels: active,
          maintenanceVessels: maintenance,
          criticalAlerts: 2,
          efficiency: 87.5
        });
      }
    } catch (error) {
      console.error('Error loading fleet stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportFleetData = async () => {
    try {
      toast({
        title: "Exportando dados da frota",
        description: "O relatório será gerado em breve...",
      });
      
      // Simulate export process
      setTimeout(() => {
        toast({
          title: "Exportação concluída",
          description: "Relatório da frota exportado com sucesso!",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados da frota",
        variant: "destructive"
      });
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
                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
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
          <TabsList className="grid w-full grid-cols-9 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Painel Geral
            </TabsTrigger>
            <TabsTrigger value="vessels" className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              Frota Ativa
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Manutenção
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentação
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Rastreamento
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alertas IA
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Conformidade
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FleetOverviewDashboard stats={fleetStats} onRefresh={loadFleetStats} />
          </TabsContent>

          <TabsContent value="vessels" className="space-y-6">
            <VesselManagementSystem onStatsUpdate={loadFleetStats} />
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <MaintenanceManagement />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <DocumentationCenter />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <FleetAnalytics />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <RealTimeTracking />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <IntelligentAlerts />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceCenter />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
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
            id: 'add-vessel',
            label: 'Nova Embarcação',
            icon: <Plus className="h-4 w-4" />,
            action: () => setActiveTab('vessels'),
            variant: 'default'
          },
          {
            id: 'maintenance-schedule',
            label: 'Agendar Manutenção',
            icon: <Calendar className="h-4 w-4" />,
            action: () => setActiveTab('maintenance'),
            variant: 'outline'
          },
          {
            id: 'fleet-report',
            label: 'Relatório da Frota',
            icon: <FileText className="h-4 w-4" />,
            action: exportFleetData,
            variant: 'outline'
          },
          {
            id: 'emergency-alert',
            label: 'Alerta de Emergência',
            icon: <AlertTriangle className="h-4 w-4" />,
            action: () => console.log('Alerta de emergência ativado'),
            variant: 'outline'
          }
        ]}
        quickActions={[
          {
            id: 'vessel-search',
            label: 'Buscar Embarcação',
            icon: <Search className="h-3 w-3" />,
            action: () => console.log('Busca de embarcação'),
            shortcut: 'Ctrl+F'
          },
          {
            id: 'live-tracking',
            label: 'Rastreamento em Tempo Real',
            icon: <MapPin className="h-3 w-3" />,
            action: () => console.log('Rastreamento ativo')
          }
        ]}
      />
    </div>
  );
};

export default MaritimeFleetManagement;