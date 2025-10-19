import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { supabase } from "@/integrations/supabase/client";
import { 
  Ship, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  FileText,
  Calendar,
  Activity,
  Shield,
  Globe,
  BarChart3,
  Settings,
  MapPin,
  Navigation,
  QrCode,
  Bell,
  Wrench
} from "lucide-react";
import { ChecklistScheduler } from "../components/maritime/checklist-scheduler";
import { ChecklistReports } from "../components/maritime/checklist-reports";
import { QREquipmentManager } from "../components/maritime/qr-equipment-manager";
import { ChecklistDashboard } from "../components/maritime/checklist-dashboard";
import { NotificationCenter } from "../components/maritime/notification-center";
import { RealTimeFleetMonitor } from "../components/maritime/real-time-fleet-monitor";
import { VesselPerformanceDashboard } from "../components/maritime/vessel-performance-dashboard";
import { IoTSensorDashboard } from "../components/maritime/iot-sensor-dashboard";
import { PredictiveMaintenanceSystem } from "../components/maritime/predictive-maintenance-system";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalVessels: number;
  activeCrew: number;
  pendingCertifications: number;
  completedAudits: number;
  activeAlerts: number;
  complianceScore: number;
}

export default function Maritime() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalVessels: 0,
    activeCrew: 0,
    pendingCertifications: 0,
    completedAudits: 0,
    activeAlerts: 0,
    complianceScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [vessels, setVessels] = useState<any[]>([]);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados dos navios
      const { data: vesselsData, error: vesselsError } = await supabase
        .from("vessels")
        .select("*")
        .eq("organization_id", "550e8400-e29b-41d4-a716-446655440000")
        .limit(10);

      if (!vesselsError && vesselsData) {
        setVessels(vesselsData);
        setStats(prev => ({ ...prev, totalVessels: vesselsData.length }));
      }

      // Dados demo para demonstração
      setStats({
        totalVessels: vesselsData?.length || 3,
        activeCrew: 45,
        pendingCertifications: 8,
        completedAudits: 12,
        activeAlerts: 3,
        complianceScore: 87
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, variant = "default", trend, onClick }: unknown) => (
    <Card className={onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${
              variant === "danger" ? "text-red-600" : 
                variant === "warning" ? "text-yellow-600" : 
                  variant === "success" ? "text-green-600" : ""
            }`}>
              {value}
            </p>
            {trend && (
              <p className="text-xs text-muted-foreground mt-1">
                {trend}
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${
            variant === "danger" ? "text-red-600" : 
              variant === "warning" ? "text-yellow-600" : 
                variant === "success" ? "text-green-600" : 
                  "text-muted-foreground"
          }`} />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <ModulePageWrapper gradient="blue">
        <DashboardSkeleton />
      </ModulePageWrapper>
    );
  }

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="Dashboard Marítimo"
        description="Gestão completa da operação marítima e conformidade regulatória"
        gradient="blue"
        badges={[
          { icon: Users, label: `${stats.activeCrew} Tripulação` },
          { icon: CheckCircle, label: `${stats.complianceScore}% Compliance` },
          { icon: TrendingUp, label: "Performance" }
        ]}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Embarcações"
          value={stats.totalVessels}
          icon={Ship}
          trend="+2 este mês"
          onClick={() => navigate("/fleet-dashboard")}
        />
        <StatCard
          title="Tripulação Ativa"
          value={stats.activeCrew}
          icon={Users}
          variant="success"
          trend="100% operacional"
          onClick={() => navigate("/crew-management")}
        />
        <StatCard
          title="Certificações Pendentes"
          value={stats.pendingCertifications}
          icon={AlertTriangle}
          variant="warning"
          trend="3 vencem em 30 dias"
          onClick={() => navigate("/maritime-certifications")}
        />
        <StatCard
          title="Auditorias Completas"
          value={stats.completedAudits}
          icon={CheckCircle}
          variant="success"
          trend="+4 este mês"
          onClick={() => navigate("/peotram")}
        />
        <StatCard
          title="Alertas Ativos"
          value={stats.activeAlerts}
          icon={AlertTriangle}
          variant="danger"
          trend="2 críticos"
          onClick={() => navigate("/intelligent-alerts")}
        />
        <StatCard
          title="Compliance Score"
          value={`${stats.complianceScore}%`}
          icon={TrendingUp}
          variant="success"
          trend="+5% vs mês anterior"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 w-fit min-w-fit">
            <TabsTrigger value="overview">
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Visão</span>
            </TabsTrigger>
            <TabsTrigger value="fleet">
              <span className="hidden sm:inline">Frota</span>
              <span className="sm:hidden">Frota</span>
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <span className="hidden sm:inline">Conformidade</span>
              <span className="sm:hidden">Conf.</span>
            </TabsTrigger>
            <TabsTrigger value="operations">
              <span className="hidden sm:inline">Operações</span>
              <span className="sm:hidden">Oper.</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="h-5 w-5" />
                  Status da Frota
                </CardTitle>
                <CardDescription>
                  Monitoramento em tempo real das embarcações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {vessels.map((vessel, index) => (
                  <div key={vessel.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">{vessel.name}</p>
                        <p className="text-sm text-muted-foreground">
                          IMO: {vessel.imo_number} • {vessel.vessel_type}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Operacional</Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => navigate("/fleet-dashboard")}>
                  Ver Todas as Embarcações
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>
                  Acesso direto às funcionalidades principais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/peotram")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Nova Auditoria PEOTRAM
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/crew-management")}>
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Tripulação
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/maritime-certifications")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar Certificações
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveFeature("dashboard")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard de Checklists
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveFeature("scheduler")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendamento de Checklists
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveFeature("reports")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Relatórios de Checklists
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveFeature("qr-equipment")}>
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Equipamentos
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveFeature("notifications")}>
                  <Bell className="h-4 w-4 mr-2" />
                  Central de Notificações
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveFeature("fleet-monitor")}>
                  <Activity className="h-4 w-4 mr-2" />
                  Monitor Tempo Real
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveFeature("performance")}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance de Navios
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveFeature("iot-sensors")}>
                  <Activity className="h-4 w-4 mr-2" />
                  Sensores IoT
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveFeature("predictive-maintenance")}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Manutenção Preditiva
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Visão Geral de Conformidade
              </CardTitle>
              <CardDescription>
                Status atual dos requisitos regulatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">PEOTRAM</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={87} className="w-24" />
                    <span className="text-sm text-green-600">87%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ISM Code</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={92} className="w-24" />
                    <span className="text-sm text-green-600">92%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ISPS Code</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={78} className="w-24" />
                    <span className="text-sm text-yellow-600">78%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">MARPOL</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={95} className="w-24" />
                    <span className="text-sm text-green-600">95%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Frota</CardTitle>
              <CardDescription>
                Controle detalhado de todas as embarcações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Ship className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Módulo de Frota</h3>
                <p className="text-muted-foreground mb-4">
                  Acesse a gestão completa da frota através do menu dedicado
                </p>
                <Button onClick={() => navigate("/fleet-dashboard")}>Ir para Gestão de Frota</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conformidade Regulatória</CardTitle>
              <CardDescription>
                Monitoramento de compliance e auditorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">PEOTRAM & Conformidade</h3>
                <p className="text-muted-foreground mb-4">
                  Sistema completo de auditorias e gestão de conformidade
                </p>
                <Button onClick={() => navigate("/peotram")}>Acessar PEOTRAM</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operações Marítimas</CardTitle>
              <CardDescription>
                Controle operacional e logístico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-gray-50" onClick={() => navigate("/task-management")}>
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-semibold">Planejamento</h4>
                  <p className="text-sm text-muted-foreground">Cronogramas e roteiros</p>
                </div>
                <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-gray-50" onClick={() => navigate("/fleet-tracking")}>
                  <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-semibold">Monitoramento</h4>
                  <p className="text-sm text-muted-foreground">Tempo real</p>
                </div>
                <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-gray-50">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h4 className="font-semibold">Manutenção</h4>
                  <p className="text-sm text-muted-foreground">Preventiva e corretiva</p>
                </div>
                <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-gray-50" onClick={() => navigate("/analytics")}>
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-semibold">Analytics</h4>
                  <p className="text-sm text-muted-foreground">KPIs operacionais</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Components */}
      {activeFeature === "dashboard" && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setActiveFeature(null)} className="mb-4">
            ← Voltar ao Dashboard
          </Button>
          <ChecklistDashboard userId="user-123" />
        </div>
      )}
      {activeFeature === "scheduler" && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setActiveFeature(null)} className="mb-4">
            ← Voltar ao Dashboard
          </Button>
          <ChecklistScheduler />
        </div>
      )}
      {activeFeature === "reports" && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setActiveFeature(null)} className="mb-4">
            ← Voltar ao Dashboard
          </Button>
          <ChecklistReports />
        </div>
      )}
      {activeFeature === "qr-equipment" && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setActiveFeature(null)} className="mb-4">
            ← Voltar ao Dashboard
          </Button>
          <QREquipmentManager />
        </div>
      )}
      {activeFeature === "notifications" && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setActiveFeature(null)} className="mb-4">
            ← Voltar ao Dashboard
          </Button>
          <NotificationCenter userId="user-123" />
        </div>
      )}
      {activeFeature === "fleet-monitor" && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setActiveFeature(null)} className="mb-4">
            ← Voltar ao Dashboard
          </Button>
          <RealTimeFleetMonitor />
        </div>
      )}
      {activeFeature === "performance" && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setActiveFeature(null)} className="mb-4">
            ← Voltar ao Dashboard
          </Button>
          <VesselPerformanceDashboard />
        </div>
      )}
      {activeFeature === "iot-sensors" && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setActiveFeature(null)} className="mb-4">
            ← Voltar ao Dashboard
          </Button>
          <IoTSensorDashboard />
        </div>
      )}
      {activeFeature === "predictive-maintenance" && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setActiveFeature(null)} className="mb-4">
            ← Voltar ao Dashboard
          </Button>
          <PredictiveMaintenanceSystem />
        </div>
      )}
    </ModulePageWrapper>
  );
}