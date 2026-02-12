/**
 * PATCH OPS-V7: Non-Conformity Manager
 * Integrado com Supabase - dados reais de non_conformities
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import {
  XCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  TrendingDown,
  Plus,
  Eye,
  Loader2
} from "lucide-react";
import { useNonConformityData, type NonConformity as NCType } from "@/hooks/useSGSOData";

// Interface mantida para compatibilidade interna
interface NonConformity {
  id: string;
  number: string;
  title: string;
  type: "major" | "minor" | "observation";
  practice_id: number;
  practice_name: string;
  status: "open" | "in_treatment" | "closed" | "verified";
  severity: "critical" | "high" | "medium" | "low";
  identified_date: string;
  due_date: string;
  responsible: string;
  corrective_action?: string;
  preventive_action?: string;
  completion_percentage: number;
}

// Função para converter NCType para NonConformity (compatibilidade)
function convertToNC(record: NCType): NonConformity {
  return {
    id: record.id,
    number: record.number,
    title: record.title,
    type: record.type,
    practice_id: record.practiceId,
    practice_name: record.practiceName,
    status: record.status,
    severity: record.severity,
    identified_date: record.identifiedDate,
    due_date: record.dueDate,
    responsible: record.responsible,
    corrective_action: record.correctiveAction,
    preventive_action: record.preventiveAction,
    completion_percentage: record.completionPercentage,
  };
}

// SAMPLE_NCS removido - usar useNonConformityData()

// Placeholder removido - dados vêm do hook useNonConformityData()

const getTypeConfig = (type: string) => {
  const configs = {
    major: {
      icon: XCircle,
      color: "bg-destructive text-destructive-foreground",
      label: "NC Maior",
      badgeColor: "bg-destructive"
    },
    minor: {
      icon: AlertTriangle,
      color: "bg-warning text-warning-foreground",
      label: "NC Menor",
      badgeColor: "bg-warning"
    },
    observation: {
      icon: Eye,
      color: "bg-primary text-primary-foreground",
      label: "Observação",
      badgeColor: "bg-primary"
    }
  };
  return configs[type as keyof typeof configs] || configs.observation;
};

const getStatusConfig = (status: string) => {
  const configs = {
    open: {
      color: "bg-red-600 text-white",
      label: "Aberta"
    },
    in_treatment: {
      color: "bg-yellow-600 text-white",
      label: "Em Tratamento"
    },
    closed: {
      color: "bg-green-600 text-white",
      label: "Fechada"
    },
    verified: {
      color: "bg-blue-600 text-white",
      label: "Verificada"
    }
  };
  return configs[status as keyof typeof configs] || configs.open;
};

export const NonConformityManager: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const { handleViewDetails, handleUpdate, handleCreate, handleGenerateReport, showInfo } = useMaritimeActions();

  // PATCH OPS-V7: Usar dados reais do Supabase
  const { data: ncRecords = [], isLoading } = useNonConformityData();
  
  // Converter para formato de compatibilidade
  const ncs: NonConformity[] = ncRecords.map(convertToNC);

  const openCount = ncs.filter(nc => nc.status === "open").length;
  const inTreatmentCount = ncs.filter(nc => nc.status === "in_treatment").length;
  const closedCount = ncs.filter(nc => nc.status === "closed").length;
  const totalOpen = openCount + inTreatmentCount;

  const filteredNCs = selectedType === "all"
    ? ncs
    : ncs.filter(nc => nc.type === selectedType);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando não conformidades...</span>
      </div>
    );
  }

  // Empty state
  if (ncs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma não conformidade registrada</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Registre as não conformidades identificadas em auditorias e inspeções.
          </p>
          <Button onClick={() => handleCreate("Nova NC")}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar NC
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleViewNC = (ncId: string, ncNumber: string) => {
    handleViewDetails(`não conformidade ${ncNumber}`, ncId);
  };

  const handleUpdateNC = (ncId: string, ncNumber: string) => {
    handleUpdate(`não conformidade ${ncNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="h-10 w-10 text-destructive" />
              <Badge className="bg-destructive text-destructive-foreground font-bold">ABERTAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-destructive mb-1">NCs Abertas</h3>
            <p className="text-3xl font-bold text-foreground">{openCount}</p>
            <p className="text-xs text-destructive mt-2">Sem tratamento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-10 w-10 text-yellow-600" />
              <Badge className="bg-yellow-600 text-white font-bold">TRATAMENTO</Badge>
            </div>
            <h3 className="text-sm font-medium text-yellow-700 mb-1">Em Tratamento</h3>
            <p className="text-3xl font-bold text-yellow-900">{inTreatmentCount}</p>
            <p className="text-xs text-yellow-600 mt-2">Em andamento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <Badge className="bg-green-600 text-white font-bold">FECHADAS</Badge>
            </div>
            <h3 className="text-sm font-medium text-green-700 mb-1">NCs Fechadas</h3>
            <p className="text-3xl font-bold text-green-900">{closedCount}</p>
            <p className="text-xs text-green-600 mt-2">Resolvidas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="h-10 w-10 text-blue-600" />
              <Badge className="bg-blue-600 text-white font-bold">TOTAL</Badge>
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">Total Ativas</h3>
            <p className="text-3xl font-bold text-blue-900">{totalOpen}</p>
            <p className="text-xs text-blue-600 mt-2">Requerem atenção</p>
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
              variant={selectedType === "major" ? "default" : "outline"}
              onClick={() => setSelectedType("major")}
              className="min-h-[44px]"
            >
              NC Maior
            </Button>
            <Button
              variant={selectedType === "minor" ? "default" : "outline"}
              onClick={() => setSelectedType("minor")}
              className="min-h-[44px]"
            >
              NC Menor
            </Button>
            <Button
              variant={selectedType === "observation" ? "default" : "outline"}
              onClick={() => setSelectedType("observation")}
              className="min-h-[44px]"
            >
              Observações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* NC List */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Não Conformidades</CardTitle>
          <CardDescription>
            Tratamento e acompanhamento de não conformidades SGSO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNCs.map((nc) => {
              const typeConfig = getTypeConfig(nc.type);
              const statusConfig = getStatusConfig(nc.status);
              const TypeIcon = typeConfig.icon;

              return (
                <Card key={nc.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${typeConfig.color}`}>
                          <TypeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{nc.title}</h3>
                            <Badge className={typeConfig.badgeColor + " text-white"}>
                              {typeConfig.label}
                            </Badge>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            <strong>{nc.number}</strong> - {nc.practice_name}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Data Identificação</p>
                              <p className="text-sm font-bold text-gray-900">
                                {new Date(nc.identified_date).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Prazo</p>
                              <p className="text-sm font-bold text-gray-900">
                                {new Date(nc.due_date).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Responsável</p>
                              <p className="text-sm font-bold text-gray-900">{nc.responsible}</p>
                            </div>
                          </div>
                          {nc.corrective_action && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-muted-foreground font-medium mb-1">Ação Corretiva:</p>
                              <p className="text-sm text-gray-900">{nc.corrective_action}</p>
                            </div>
                          )}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground font-medium">Progresso do Tratamento</span>
                              <span className="text-gray-900 font-bold">{nc.completion_percentage}%</span>
                            </div>
                            <Progress value={nc.completion_percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[44px] px-6"
                          onClick={() => handleViewNC(nc.id, nc.number)}
                          disabled={isLoading}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                        {nc.status !== "closed" && (
                          <Button
                            size="sm"
                            className="min-h-[44px] px-6 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => handleUpdateNC(nc.id, nc.number)}
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Atualizar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredNCs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Nenhuma não conformidade encontrada</p>
              <p className="text-sm">Selecione outro filtro</p>
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
              className="bg-red-600 hover:bg-red-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => handleCreate("Não Conformidade")}
              disabled={isLoading}
            >
              <Plus className="h-6 w-6" />
              <span className="font-semibold">Registrar NC</span>
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => handleGenerateReport("Relatório de Não Conformidades")}
              disabled={isLoading}
            >
              <FileText className="h-6 w-6" />
              <span className="font-semibold">Relatório</span>
            </Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => showInfo("NCs Vencendo", "Abrindo lista de não conformidades próximas do vencimento")}
              disabled={isLoading}
            >
              <AlertTriangle className="h-6 w-6" />
              <span className="font-semibold">Vencendo</span>
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => showInfo("Estatísticas", "Abrindo painel de estatísticas de NCs")}
              disabled={isLoading}
            >
              <TrendingDown className="h-6 w-6" />
              <span className="font-semibold">Estatísticas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NonConformityManager;
