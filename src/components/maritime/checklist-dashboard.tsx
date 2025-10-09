import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Ship,
  FileText,
  BarChart3,
} from "lucide-react";
import { useMaritimeChecklists } from "@/hooks/use-maritime-checklists";
import { supabase } from "@/integrations/supabase/client";

interface DashboardMetrics {
  totalChecklists: number;
  completedToday: number;
  pendingChecklists: number;
  overdueChecklists: number;
  complianceScore: number;
  avgCompletionTime: number;
}

export const ChecklistDashboard = ({ userId }: { userId: string }) => {
  const { checklists, loading } = useMaritimeChecklists(userId);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalChecklists: 0,
    completedToday: 0,
    pendingChecklists: 0,
    overdueChecklists: 0,
    complianceScore: 0,
    avgCompletionTime: 0,
  });

  useEffect(() => {
    if (checklists.length > 0) {
      calculateMetrics();
    }
  }, [checklists]);

  const calculateMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedToday = checklists.filter(c => {
      const completedDate = new Date(c.completedAt || "");
      completedDate.setHours(0, 0, 0, 0);
      return c.status === "completed" && completedDate.getTime() === today.getTime();
    }).length;

    const pendingChecklists = checklists.filter(c => c.status === "in_progress").length;
    const overdueChecklists = checklists.filter(c => {
      const dueDate = new Date(c.createdAt);
      dueDate.setDate(dueDate.getDate() + 1); // 1 day to complete
      return c.status === "in_progress" && new Date() > dueDate;
    }).length;

    const completedChecklists = checklists.filter(c => c.status === "completed");
    const totalCompleted = completedChecklists.length;
    const complianceScore =
      checklists.length > 0 ? Math.round((totalCompleted / checklists.length) * 100) : 0;

    setMetrics({
      totalChecklists: checklists.length,
      completedToday,
      pendingChecklists,
      overdueChecklists,
      complianceScore,
      avgCompletionTime: 45, // Mock data - would calculate from actual completion times
    });
  };

  const MetricCard = ({ title, value, icon: Icon, variant = "default", subtitle }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={`h-4 w-4 ${
            variant === "success"
              ? "text-green-600"
              : variant === "warning"
                ? "text-yellow-600"
                : variant === "danger"
                  ? "text-red-600"
                  : "text-muted-foreground"
          }`}
        />
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${
            variant === "success"
              ? "text-green-600"
              : variant === "warning"
                ? "text-yellow-600"
                : variant === "danger"
                  ? "text-red-600"
                  : ""
          }`}
        >
          {value}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard de Checklists</h2>
        <p className="text-muted-foreground">
          Visão geral do status e performance dos checklists marítimos
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Checklists"
          value={metrics.totalChecklists}
          icon={FileText}
          subtitle="Este mês"
        />
        <MetricCard
          title="Concluídos Hoje"
          value={metrics.completedToday}
          icon={CheckCircle}
          variant="success"
          subtitle="Desde 00:00"
        />
        <MetricCard
          title="Pendentes"
          value={metrics.pendingChecklists}
          icon={Clock}
          variant="warning"
          subtitle="Em andamento"
        />
        <MetricCard
          title="Atrasados"
          value={metrics.overdueChecklists}
          icon={AlertTriangle}
          variant="danger"
          subtitle="Vencidos"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Score de Conformidade
            </CardTitle>
            <CardDescription>Taxa geral de conclusão dos checklists</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {metrics.complianceScore}%
                </span>
                <Badge variant={metrics.complianceScore > 85 ? "default" : "destructive"}>
                  {metrics.complianceScore > 85 ? "Excelente" : "Precisa Melhorar"}
                </Badge>
              </div>
              <Progress value={metrics.complianceScore} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Meta: 90% • Atual: {metrics.complianceScore}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>Métricas de execução dos checklists</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tempo Médio</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.avgCompletionTime} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Conclusão</span>
                <span className="text-sm text-muted-foreground">{metrics.complianceScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Itens Críticos</span>
                <span className="text-sm text-red-600">3 pendentes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimos checklists criados e concluídos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checklists.slice(0, 5).map(checklist => (
              <div
                key={checklist.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      checklist.status === "completed"
                        ? "bg-green-500"
                        : checklist.status === "in_progress"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{checklist.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Checklist • {new Date(checklist.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    checklist.status === "completed"
                      ? "default"
                      : checklist.status === "in_progress"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {checklist.status === "completed"
                    ? "Concluído"
                    : checklist.status === "in_progress"
                      ? "Em Andamento"
                      : "Rascunho"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
