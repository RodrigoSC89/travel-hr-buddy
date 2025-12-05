import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
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
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";

/**
 * PATCH 191.0 + 549.0 - Maritime Operations Module (Optimized)
 * 
 * Specialized maritime operations focused on:
 * - Compliance checklists and certifications
 * - IoT sensor integration and monitoring
 * - Predictive maintenance systems
 * - Crew rotation and scheduling
 * - QR equipment management
 * 
 * Built on top of unified Fleet Management (see: /fleet or src/modules/fleet)
 * Shares database tables: vessels, maintenance, routes, crew_assignments
 * 
 * PATCH 549: Removed lazy loading for sub-components to prevent freezing
 */

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
  const { stats, vessels, loading, loadDashboardData } = useDashboardStats();

  // PATCH 549: Fixed dependencies to prevent infinite loops
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const StatCard = memo(({ title, value, icon: Icon, variant = "default", trend, onClick }: any) => (
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
  ));

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
          onClick={() => navigate("/crew")}
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
                {vessels.length > 0 ? vessels.map((vessel) => (
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
                )) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Carregando embarcações...
                  </div>
                )}
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
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/crew")}>
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Tripulação
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/maritime-certifications")}>
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar Certificações
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/checklists")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard de Checklists
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/maintenance/planner")}>
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
              {useMemo(() => (
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
              ), [])}
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
    </ModulePageWrapper>
  );
}