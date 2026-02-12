/**
 * Audit Planner - R01 COMPLIANCE
 * ✅ Dados reais via Supabase
 */
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Target,
  TrendingUp,
  Plus,
  WifiOff,
  Settings
} from "lucide-react";
import { useAuditPlannerData, type Audit } from "@/hooks/useAuditPlannerData";

const getStatusConfig = (status: string) => {
  const configs = {
    planned: {
      icon: Calendar,
      color: "bg-primary text-primary-foreground",
      label: "Planejada",
      badgeVariant: "default" as const
    },
    in_progress: {
      icon: Clock,
      color: "bg-warning text-warning-foreground",
      label: "Em Andamento",
      badgeVariant: "default" as const
    },
    completed: {
      icon: CheckCircle,
      color: "bg-success text-success-foreground",
      label: "Concluída",
      badgeVariant: "default" as const
    },
    overdue: {
      icon: AlertTriangle,
      color: "bg-destructive text-destructive-foreground",
      label: "Atrasada",
      badgeVariant: "destructive" as const
    }
  };
  return configs[status as keyof typeof configs] || configs.planned;
};

const getTypeLabel = (type: string) => {
  const labels = {
    internal: "Interna",
    external: "Externa",
    regulatory: "Regulatória",
    certification: "Certificação"
  };
  return labels[type as keyof typeof labels] || type;
};

export const AuditPlanner: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const { handleViewDetails, showInfo, handleCreate, handleGenerateReport } = useMaritimeActions();
  
  // ✅ R01: Dados reais via hook
  const { data: audits = [], isLoading } = useAuditPlannerData();

  const plannedCount = audits.filter(a => a.status === "planned").length;
  const inProgressCount = audits.filter(a => a.status === "in_progress").length;
  const completedCount = audits.filter(a => a.status === "completed").length;
  const overdueCount = audits.filter(a => a.status === "overdue").length;

  const filteredAudits = selectedType === "all"
    ? audits
    : audits.filter(a => a.type === selectedType);

  const totalAudits = audits.length || 1;
  const completionRate = Math.round((completedCount / totalAudits) * 100);

  // Empty state
  if (!isLoading && audits.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="py-16 text-center space-y-4">
            <WifiOff className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Nenhuma Auditoria Configurada</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Configure auditorias SGSO para visualizar o planejamento.
            </p>
            <Alert className="max-w-lg mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Sem Dados Simulados</AlertTitle>
              <AlertDescription>
                Este módulo exibe apenas auditorias reais cadastradas no sistema.
              </AlertDescription>
            </Alert>
            <Button onClick={() => handleCreate("audit")}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Auditoria
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={`audit-planner-skeleton-${i}`} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-10 w-10 text-primary" />
              <Badge className="bg-primary text-primary-foreground font-bold">PLANEJADAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-primary mb-1">Auditorias Planejadas</h3>
            <p className="text-3xl font-bold text-foreground">{plannedCount}</p>
            <p className="text-xs text-primary mt-2">Aguardando execução</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-10 w-10 text-warning" />
              <Badge className="bg-warning text-warning-foreground font-bold">ATIVAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-warning mb-1">Em Andamento</h3>
            <p className="text-3xl font-bold text-foreground">{inProgressCount}</p>
            <p className="text-xs text-warning mt-2">Em execução</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
              <Badge className="bg-success text-success-foreground font-bold">CONCLUÍDAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-success mb-1">Auditorias Concluídas</h3>
            <p className="text-3xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-success mt-2">Taxa: {completionRate}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <Badge className="bg-destructive text-destructive-foreground font-bold">ATRASADAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-destructive mb-1">Auditorias Atrasadas</h3>
            <p className="text-3xl font-bold text-foreground">{overdueCount}</p>
            <p className="text-xs text-destructive mt-2">Requer ação</p>
          </CardContent>
        </Card>
      </div>

      {/* Type Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              className="min-h-[44px]"
            >
              Todas
            </Button>
            <Button
              variant={selectedType === "internal" ? "default" : "outline"}
              onClick={() => setSelectedType("internal")}
              className="min-h-[44px]"
            >
              Internas
            </Button>
            <Button
              variant={selectedType === "external" ? "default" : "outline"}
              onClick={() => setSelectedType("external")}
              className="min-h-[44px]"
            >
              Externas
            </Button>
            <Button
              variant={selectedType === "regulatory" ? "default" : "outline"}
              onClick={() => setSelectedType("regulatory")}
              className="min-h-[44px]"
            >
              Regulatórias
            </Button>
            <Button
              variant={selectedType === "certification" ? "default" : "outline"}
              onClick={() => setSelectedType("certification")}
              className="min-h-[44px]"
            >
              Certificação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit List */}
      <Card>
        <CardHeader>
          <CardTitle>Planejamento de Auditorias</CardTitle>
          <CardDescription>
            Gestão de auditorias internas, externas e regulatórias SGSO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAudits.map((audit) => {
              const statusConfig = getStatusConfig(audit.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={audit.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${statusConfig.color}`}>
                          <StatusIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-foreground">{audit.title}</h3>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="outline" className="bg-white">
                              {getTypeLabel(audit.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            <Target className="h-3 w-3 inline mr-1" />
                            {audit.scope}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Data Agendada</p>
                               <p className="text-sm font-bold text-foreground">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(audit.scheduled_date).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Auditor</p>
                              <p className="text-sm font-bold text-foreground">
                                <Users className="h-3 w-3 inline mr-1" />
                                {audit.auditor}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Práticas Cobertas</p>
                              <p className="text-sm font-bold text-foreground">
                                {audit.practices_covered.length} de 17
                              </p>
                            </div>
                            {audit.findings_count !== undefined && (
                              <div>
                                <p className="text-xs text-muted-foreground font-medium">Achados</p>
                                <p className="text-sm font-bold text-foreground">
                                  <FileText className="h-3 w-3 inline mr-1" />
                                  {audit.findings_count} ({audit.non_conformities || 0} NC)
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] px-6"
                          onClick={() => handleViewDetails("audit", audit.id)} disabled={isLoading}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                        {audit.status !== "completed" && (
                          <Button
                            size="sm"
                            className="min-h-[44px] px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => showInfo("Iniciando Auditoria", "Preparando auditoria")} disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {audit.status === "in_progress" ? "Continuar" : "Iniciar"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredAudits.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Nenhuma auditoria encontrada</p>
              <p className="text-sm">Selecione outro tipo ou crie uma nova auditoria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              className="bg-success hover:bg-success/90 text-success-foreground min-h-[56px] flex-col gap-2"
              onClick={() => handleCreate("Auditoria")} disabled={isLoading}
            >
              <Plus className="h-6 w-6" />
              <span className="font-semibold">Nova Auditoria</span>
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-[56px] flex-col gap-2"
              onClick={() => showInfo("Calendário", "Abrindo calendário de auditorias")} disabled={isLoading}
            >
              <Calendar className="h-6 w-6" />
              <span className="font-semibold">Calendário</span>
            </Button>
            <Button
              className="bg-warning hover:bg-warning/90 text-warning-foreground min-h-[56px] flex-col gap-2"
              onClick={() => handleGenerateReport("Relatório de Auditorias")} disabled={isLoading}
            >
              <FileText className="h-6 w-6" />
              <span className="font-semibold">Relatório</span>
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground min-h-[56px] flex-col gap-2"
              onClick={() => showInfo("Tendências", "Abrindo análise de tendências")} disabled={isLoading}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="font-semibold">Tendências</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditPlanner;
