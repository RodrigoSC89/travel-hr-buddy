import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Award
} from "lucide-react";

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

const SAMPLE_TRAININGS: Training[] = [
  {
    id: "1",
    name: "SGSO - 17 Práticas ANP",
    category: "sgso",
    status: "valid",
    completion_rate: 92,
    certified: 23,
    total: 25,
    validity_months: 24,
    last_conducted: "2023-05-15",
    next_due: "2025-05-15"
  },
  {
    id: "2",
    name: "Investigação de Incidentes",
    category: "safety",
    status: "expiring_soon",
    completion_rate: 88,
    certified: 22,
    total: 25,
    validity_months: 12,
    last_conducted: "2024-01-10",
    next_due: "2025-01-10"
  },
  {
    id: "3",
    name: "Resposta a Emergências",
    category: "safety",
    status: "valid",
    completion_rate: 96,
    certified: 24,
    total: 25,
    validity_months: 12,
    last_conducted: "2024-03-20",
    next_due: "2025-03-20"
  },
  {
    id: "4",
    name: "Gestão de Mudanças (MOC)",
    category: "sgso",
    status: "expired",
    completion_rate: 64,
    certified: 16,
    total: 25,
    validity_months: 24,
    last_conducted: "2022-08-15",
    next_due: "2024-08-15"
  },
  {
    id: "5",
    name: "Integridade Mecânica",
    category: "technical",
    status: "pending",
    completion_rate: 0,
    certified: 0,
    total: 25,
    validity_months: 12,
    next_due: "2025-12-31"
  }
];

const getStatusConfig = (status: string) => {
  const configs = {
    valid: { 
      icon: CheckCircle, 
      color: "bg-green-600 text-white", 
      label: "Válido",
      badgeVariant: "default" as const
    },
    expiring_soon: { 
      icon: AlertTriangle, 
      color: "bg-yellow-600 text-white", 
      label: "Expirando",
      badgeVariant: "default" as const
    },
    expired: { 
      icon: XCircle, 
      color: "bg-red-600 text-white", 
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
  const [isLoading, setIsLoading] = useState(false);
  const { handleViewDetails, showInfo, handleCreate } = useMaritimeActions();

  const validCount = SAMPLE_TRAININGS.filter(t => t.status === "valid").length;
  const expiringCount = SAMPLE_TRAININGS.filter(t => t.status === "expiring_soon").length;
  const expiredCount = SAMPLE_TRAININGS.filter(t => t.status === "expired").length;
  const pendingCount = SAMPLE_TRAININGS.filter(t => t.status === "pending").length;

  const filteredTrainings = selectedCategory === "all" 
    ? SAMPLE_TRAININGS 
    : SAMPLE_TRAININGS.filter(t => t.category === selectedCategory);

  const overallCompliance = Math.round(
    SAMPLE_TRAININGS.reduce((acc, t) => acc + t.completion_rate, 0) / SAMPLE_TRAININGS.length
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <Badge className="bg-green-600 text-white font-bold">VÁLIDOS</Badge>
            </div>
            <h3 className="text-sm font-medium text-green-700 mb-1">Treinamentos Válidos</h3>
            <p className="text-3xl font-bold text-green-900">{validCount}</p>
            <p className="text-xs text-green-600 mt-2">Certificações em dia</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-10 w-10 text-yellow-600" />
              <Badge className="bg-yellow-600 text-white font-bold">ATENÇÃO</Badge>
            </div>
            <h3 className="text-sm font-medium text-yellow-700 mb-1">Expirando em Breve</h3>
            <p className="text-3xl font-bold text-yellow-900">{expiringCount}</p>
            <p className="text-xs text-yellow-600 mt-2">Próximos 60 dias</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
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
              onClick={() => {}} // console.log("Relatório compliance")
            >
              <FileText className="h-6 w-6" />
              <span className="font-semibold">Relatório</span>
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => {}} // console.log("Certificados expirados")}
            >
              <AlertTriangle className="h-6 w-6" />
              <span className="font-semibold">Expirados</span>
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => {}} // console.log("Matriz competências")}
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
