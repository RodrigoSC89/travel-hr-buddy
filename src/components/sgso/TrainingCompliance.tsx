/**
 * PATCH OPS-V7: Componente SGSO Training Compliance
 * Integrado com Supabase - dados reais de crew_training_records
 */

import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Award,
  Loader2
} from "lucide-react";
import { useTrainingComplianceData, type TrainingRecord } from "@/hooks/useSGSOData";

// Interface mantida para compatibilidade
interface Training {
  id: string;
  name: string;
  category: "sgso" | "safety" | "environmental" | "operational" | "technical";
  status: "valid" | "expiring_soon" | "expired" | "pending";
  completion_rate: number;
  certified: number;
  total: number;
  validity_months: number;
  last_conducted?: string;
  next_due?: string;
}

// Função para converter TrainingRecord para Training (compatibilidade)
function convertToTraining(record: TrainingRecord): Training {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    status: record.status,
    completion_rate: record.completionRate,
    certified: record.certified,
    total: record.total,
    validity_months: record.validityMonths,
    last_conducted: record.lastConducted,
    next_due: record.nextDue,
  };
}

// SAMPLE_TRAININGS removido - dados vêm do hook useTrainingComplianceData()

const getStatusConfig = (status: string) => {
  const configs = {
    valid: { 
      icon: CheckCircle, 
      color: "bg-success text-success-foreground", 
      label: "Válido",
      badgeVariant: "default" as const
    },
    expiring_soon: { 
      icon: AlertTriangle, 
      color: "bg-warning text-warning-foreground", 
      label: "Expirando",
      badgeVariant: "default" as const
    },
    expired: { 
      icon: XCircle, 
      color: "bg-destructive text-destructive-foreground", 
      label: "Expirado",
      badgeVariant: "destructive" as const
    },
    pending: { 
      icon: Clock, 
      color: "bg-gray-600 text-white", 
      label: "Pendente",
      badgeVariant: "outline" as const
    }
  };
  return configs[status as keyof typeof configs] || configs.pending;
};

export const TrainingCompliance: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { handleViewDetails, showInfo, handleCreate } = useMaritimeActions();
  const { toast } = useToast();

  // PATCH OPS-V7: Usar dados reais do Supabase
  const { data: trainingRecords = [], isLoading } = useTrainingComplianceData();
  
  // Converter para formato de compatibilidade
  const trainings: Training[] = trainingRecords.map(convertToTraining);

  const validCount = trainings.filter(t => t.status === "valid").length;
  const expiringCount = trainings.filter(t => t.status === "expiring_soon").length;
  const expiredCount = trainings.filter(t => t.status === "expired").length;
  const pendingCount = trainings.filter(t => t.status === "pending").length;

  const filteredTrainings = selectedCategory === "all" 
    ? trainings 
    : trainings.filter(t => t.category === selectedCategory);

  const overallCompliance = trainings.length > 0 
    ? Math.round(trainings.reduce((acc, t) => acc + t.completion_rate, 0) / trainings.length)
    : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando treinamentos...</span>
      </div>
    );
  }

  // Empty state
  if (trainings.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Award className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum treinamento cadastrado</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            Cadastre os treinamentos da tripulação para acompanhar o compliance SGSO.
          </p>
          <Button onClick={() => handleCreate("Novo Treinamento")}>
            <FileText className="h-4 w-4 mr-2" />
            Cadastrar Treinamento
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
              <Badge className="bg-success text-success-foreground font-bold">VÁLIDOS</Badge>
            </div>
            <h3 className="text-sm font-medium text-success mb-1">Treinamentos Válidos</h3>
            <p className="text-3xl font-bold text-foreground">{validCount}</p>
            <p className="text-xs text-success mt-2">Certificações em dia</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-10 w-10 text-warning" />
              <Badge className="bg-warning text-warning-foreground font-bold">ATENÇÃO</Badge>
            </div>
            <h3 className="text-sm font-medium text-warning mb-1">Expirando em Breve</h3>
            <p className="text-3xl font-bold text-foreground">{expiringCount}</p>
            <p className="text-xs text-warning mt-2">Próximos 60 dias</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
              <Badge className="bg-red-600 text-white font-bold">CRÍTICO</Badge>
            </div>
            <h3 className="text-sm font-medium text-red-700 mb-1">Treinamentos Expirados</h3>
            <p className="text-3xl font-bold text-red-900">{expiredCount}</p>
            <p className="text-xs text-red-600 mt-2">Requer ação imediata</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-10 w-10 text-blue-600" />
              <Badge className="bg-blue-600 text-white font-bold">COMPLIANCE</Badge>
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">Compliance Geral</h3>
            <p className="text-3xl font-bold text-blue-900">{overallCompliance}%</p>
            <Progress value={overallCompliance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="min-h-[44px]"
            >
              Todos
            </Button>
            <Button
              variant={selectedCategory === "sgso" ? "default" : "outline"}
              onClick={() => setSelectedCategory("sgso")}
              className="min-h-[44px]"
            >
              SGSO
            </Button>
            <Button
              variant={selectedCategory === "safety" ? "default" : "outline"}
              onClick={() => setSelectedCategory("safety")}
              className="min-h-[44px]"
            >
              Segurança
            </Button>
            <Button
              variant={selectedCategory === "environmental" ? "default" : "outline"}
              onClick={() => setSelectedCategory("environmental")}
              className="min-h-[44px]"
            >
              Ambiental
            </Button>
            <Button
              variant={selectedCategory === "operational" ? "default" : "outline"}
              onClick={() => setSelectedCategory("operational")}
              className="min-h-[44px]"
            >
              Operacional
            </Button>
            <Button
              variant={selectedCategory === "technical" ? "default" : "outline"}
              onClick={() => setSelectedCategory("technical")}
              className="min-h-[44px]"
            >
              Técnico
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training List */}
      <Card>
        <CardHeader>
          <CardTitle>Treinamentos e Certificações ANP</CardTitle>
          <CardDescription>
            Gestão de competências e compliance de treinamento da tripulação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTrainings.map((training) => {
              const statusConfig = getStatusConfig(training.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={training.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${statusConfig.color}`}>
                          <StatusIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{training.name}</h3>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Taxa de Conclusão</p>
                              <p className="text-xl font-bold text-gray-900">{training.completion_rate}%</p>
                              <Progress value={training.completion_rate} className="mt-1" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Certificados</p>
                              <p className="text-xl font-bold text-gray-900">
                                {training.certified} / {training.total}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                <Users className="h-3 w-3 inline mr-1" />
                                tripulantes
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Próxima Data</p>
                              <p className="text-sm font-bold text-gray-900">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {training.next_due || "A definir"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Validade: {training.validity_months} meses
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="min-h-[44px] px-6"
                          onClick={() => handleViewDetails("training", training.id)} disabled={isLoading}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Detalhes
                        </Button>
                        <Button 
                          size="sm"
                          className="min-h-[44px] px-6 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => showInfo("Agendando Treinamento", "Abrindo agenda")} disabled={isLoading}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTrainings.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Nenhum treinamento encontrado</p>
              <p className="text-sm">Selecione outra categoria</p>
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
              className="bg-green-600 hover:bg-green-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => handleCreate("Treinamento")} disabled={isLoading}
            >
              <Award className="h-6 w-6" />
              <span className="font-semibold">Novo Treinamento</span>
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => {
                toast({
                  title: "📊 Gerando Relatório",
                  description: "Relatório de compliance de treinamentos está sendo gerado..."
                });
              }}
            >
              <FileText className="h-6 w-6" />
              <span className="font-semibold">Relatório</span>
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => {
                toast({
                  title: "⚠️ Certificados Expirados",
                  description: "Listando certificados expirados que precisam de renovação..."
                });
              }}
            >
              <AlertTriangle className="h-6 w-6" />
              <span className="font-semibold">Expirados</span>
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => {
                toast({
                  title: "👥 Matriz de Competências",
                  description: "Abrindo matriz de competências da tripulação..."
                });
              }}
            >
              <Users className="h-6 w-6" />
              <span className="font-semibold">Matriz</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingCompliance;
