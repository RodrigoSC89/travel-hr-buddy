import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { 
  Wrench, 
  Calendar,
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

/**
 * MMI (Manutenção e Melhoria Industrial) - Main Module Page
 * Central hub for maintenance management, forecasting, and work orders
 */
export default function MMI() {
  const navigate = useNavigate();

  const stats = {
    activeTasks: 12,
    pendingForecasts: 5,
    completedOrders: 87,
    averageEfficiency: 94
  };

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Wrench}
        title="MMI - Manutenção & Melhoria Industrial"
        description="Sistema completo de gestão de manutenção com IA para previsões e otimização de ordens de serviço"
        gradient="orange"
        badges={[
          { icon: CheckCircle, label: `${stats.activeTasks} Tarefas Ativas` },
          { icon: TrendingUp, label: `${stats.averageEfficiency}% Eficiência` }
        ]}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tarefas Ativas</p>
                <p className="text-2xl font-bold">{stats.activeTasks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forecasts Pendentes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingForecasts}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">OS Completas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eficiência Média</p>
                <p className="text-2xl font-bold text-primary">{stats.averageEfficiency}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/mmi-tasks")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Tarefas de Manutenção
            </CardTitle>
            <CardDescription>
              Gerenciar tarefas de manutenção e criar ordens de serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Acessar Tarefas</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/mmi-forecast")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Forecast de Jobs
            </CardTitle>
            <CardDescription>
              Gerar previsões com IA para jobs de manutenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Gerar Forecast</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/mmi-history")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Histórico
            </CardTitle>
            <CardDescription>
              Visualizar histórico de manutenções e análises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Ver Histórico</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/mmi-jobs-panel")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Painel de Jobs
            </CardTitle>
            <CardDescription>
              Visualizar e exportar forecasts de jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Abrir Painel</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/mmi/orders")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ordens de Serviço
            </CardTitle>
            <CardDescription>
              Gerenciar ordens de serviço administrativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Gerenciar OS</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/mmi-dashboard")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dashboard BI
            </CardTitle>
            <CardDescription>
              Análises e métricas de Business Intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Ver Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    </ModulePageWrapper>
  );
}
