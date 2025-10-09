import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import {
  AlertTriangle,
  Phone,
  FileText,
  Users,
  MapPin,
  Clock,
  Activity,
  CheckCircle,
  Shield
} from "lucide-react";

interface EmergencyPlan {
  id: string;
  type: "fire" | "oil_spill" | "man_overboard" | "collision" | "medical" | "abandon_ship";
  title: string;
  status: "active" | "under_review" | "expired";
  last_drill: string;
  next_drill: string;
  drill_frequency_days: number;
  responsible: string;
  contacts: number;
}

const EMERGENCY_PLANS: EmergencyPlan[] = [
  {
    id: "1",
    type: "fire",
    title: "Plano de Combate a Incêndio",
    status: "active",
    last_drill: "2024-09-15",
    next_drill: "2024-12-15",
    drill_frequency_days: 90,
    responsible: "Capitão Silva",
    contacts: 8
  },
  {
    id: "2",
    type: "oil_spill",
    title: "Plano de Resposta a Derramamento",
    status: "active",
    last_drill: "2024-08-20",
    next_drill: "2025-02-20",
    drill_frequency_days: 180,
    responsible: "Eng. Ambiental Costa",
    contacts: 12
  },
  {
    id: "3",
    type: "man_overboard",
    title: "Procedimento Homem ao Mar",
    status: "active",
    last_drill: "2024-09-30",
    next_drill: "2024-10-30",
    drill_frequency_days: 30,
    responsible: "Imediato Santos",
    contacts: 6
  },
  {
    id: "4",
    type: "medical",
    title: "Emergência Médica",
    status: "active",
    last_drill: "2024-09-10",
    next_drill: "2024-12-10",
    drill_frequency_days: 90,
    responsible: "Enfermeiro Bordo",
    contacts: 5
  },
  {
    id: "5",
    type: "abandon_ship",
    title: "Abandono de Embarcação",
    status: "under_review",
    last_drill: "2024-07-01",
    next_drill: "2025-01-01",
    drill_frequency_days: 180,
    responsible: "Capitão Silva",
    contacts: 10
  }
];

const getTypeConfig = (type: string) => {
  const configs = {
    fire: {
      icon: AlertTriangle,
      color: "bg-red-600 text-white",
      label: "Incêndio",
      badgeColor: "bg-red-600"
    },
    oil_spill: {
      icon: Activity,
      color: "bg-green-600 text-white",
      label: "Derramamento",
      badgeColor: "bg-green-600"
    },
    man_overboard: {
      icon: Users,
      color: "bg-blue-600 text-white",
      label: "Homem ao Mar",
      badgeColor: "bg-blue-600"
    },
    collision: {
      icon: AlertTriangle,
      color: "bg-orange-600 text-white",
      label: "Colisão",
      badgeColor: "bg-orange-600"
    },
    medical: {
      icon: Shield,
      color: "bg-purple-600 text-white",
      label: "Médica",
      badgeColor: "bg-purple-600"
    },
    abandon_ship: {
      icon: AlertTriangle,
      color: "bg-red-700 text-white",
      label: "Abandono",
      badgeColor: "bg-red-700"
    }
  };
  return configs[type as keyof typeof configs] || configs.fire;
};

const getStatusConfig = (status: string) => {
  const configs = {
    active: {
      color: "bg-green-600 text-white",
      label: "Ativo"
    },
    under_review: {
      color: "bg-yellow-600 text-white",
      label: "Em Revisão"
    },
    expired: {
      color: "bg-red-600 text-white",
      label: "Expirado"
    }
  };
  return configs[status as keyof typeof configs] || configs.active;
};

export const EmergencyResponse: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const { handleViewDetails, showInfo, isLoading } = useMaritimeActions();

  const activeCount = EMERGENCY_PLANS.filter(p => p.status === "active").length;
  const reviewCount = EMERGENCY_PLANS.filter(p => p.status === "under_review").length;
  const totalDrillsThisMonth = 3;
  const nextDrill = EMERGENCY_PLANS.reduce((next, plan) => {
    const planDate = new Date(plan.next_drill);
    const nextDate = new Date(next);
    return planDate < nextDate ? plan.next_drill : next;
  }, "2099-12-31");

  const filteredPlans = selectedType === "all"
    ? EMERGENCY_PLANS
    : EMERGENCY_PLANS.filter(p => p.type === selectedType);

  const handleViewPlan = (planId: string, planTitle: string) => {
    handleViewDetails(`plano ${planTitle}`, planId);
  };

  const handleStartDrill = (planId: string, planTitle: string) => {
    showInfo("Iniciando simulado", `Preparando simulado de ${planTitle}`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <Badge className="bg-green-600 text-white font-bold">ATIVOS</Badge>
            </div>
            <h3 className="text-sm font-medium text-green-700 mb-1">Planos Ativos</h3>
            <p className="text-3xl font-bold text-green-900">{activeCount}</p>
            <p className="text-xs text-green-600 mt-2">Prontos para ação</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-10 w-10 text-yellow-600" />
              <Badge className="bg-yellow-600 text-white font-bold">REVISÃO</Badge>
            </div>
            <h3 className="text-sm font-medium text-yellow-700 mb-1">Em Revisão</h3>
            <p className="text-3xl font-bold text-yellow-900">{reviewCount}</p>
            <p className="text-xs text-yellow-600 mt-2">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-10 w-10 text-blue-600" />
              <Badge className="bg-blue-600 text-white font-bold">SIMULADOS</Badge>
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">Simulados no Mês</h3>
            <p className="text-3xl font-bold text-blue-900">{totalDrillsThisMonth}</p>
            <p className="text-xs text-blue-600 mt-2">Realizados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-10 w-10 text-orange-600" />
              <Badge className="bg-orange-600 text-white font-bold">PRÓXIMO</Badge>
            </div>
            <h3 className="text-sm font-medium text-orange-700 mb-1">Próximo Simulado</h3>
            <p className="text-xl font-bold text-orange-900">
              {new Date(nextDrill).toLocaleDateString("pt-BR")}
            </p>
            <p className="text-xs text-orange-600 mt-2">Agendado</p>
          </CardContent>
        </Card>
      </div>

      {/* Type Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Tipo de Emergência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              className="min-h-[44px]"
            >
              Todos
            </Button>
            <Button
              variant={selectedType === "fire" ? "default" : "outline"}
              onClick={() => setSelectedType("fire")}
              className="min-h-[44px]"
            >
              Incêndio
            </Button>
            <Button
              variant={selectedType === "oil_spill" ? "default" : "outline"}
              onClick={() => setSelectedType("oil_spill")}
              className="min-h-[44px]"
            >
              Derramamento
            </Button>
            <Button
              variant={selectedType === "man_overboard" ? "default" : "outline"}
              onClick={() => setSelectedType("man_overboard")}
              className="min-h-[44px]"
            >
              Homem ao Mar
            </Button>
            <Button
              variant={selectedType === "medical" ? "default" : "outline"}
              onClick={() => setSelectedType("medical")}
              className="min-h-[44px]"
            >
              Médica
            </Button>
            <Button
              variant={selectedType === "abandon_ship" ? "default" : "outline"}
              onClick={() => setSelectedType("abandon_ship")}
              className="min-h-[44px]"
            >
              Abandono
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Plans List */}
      <Card>
        <CardHeader>
          <CardTitle>Planos de Resposta a Emergências</CardTitle>
          <CardDescription>
            Gestão de planos de emergência e simulados SGSO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPlans.map((plan) => {
              const typeConfig = getTypeConfig(plan.type);
              const statusConfig = getStatusConfig(plan.status);
              const TypeIcon = typeConfig.icon;

              return (
                <Card key={plan.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${typeConfig.color}`}>
                          <TypeIcon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{plan.title}</h3>
                            <Badge className={typeConfig.badgeColor + " text-white"}>
                              {typeConfig.label}
                            </Badge>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Último Simulado</p>
                              <p className="text-sm font-bold text-gray-900">
                                {new Date(plan.last_drill).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Próximo Simulado</p>
                              <p className="text-sm font-bold text-gray-900">
                                {new Date(plan.next_drill).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Responsável</p>
                              <p className="text-sm font-bold text-gray-900">
                                <Users className="h-3 w-3 inline mr-1" />
                                {plan.responsible}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Contatos</p>
                              <p className="text-sm font-bold text-gray-900">
                                <Phone className="h-3 w-3 inline mr-1" />
                                {plan.contacts} pessoas
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
                          onClick={() => handleViewPlan(plan.id, plan.title)}
                          disabled={isLoading}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Plano
                        </Button>
                        <Button
                          size="sm"
                          className="min-h-[44px] px-6 bg-orange-600 hover:bg-orange-700 text-white"
                          onClick={() => handleStartDrill(plan.id, plan.title)}
                          disabled={isLoading}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Simulado
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredPlans.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">Nenhum plano encontrado</p>
              <p className="text-sm">Selecione outro tipo</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Contatos de Emergência</CardTitle>
          <CardDescription>Números e procedimentos para acionamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-red-300 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="font-bold text-gray-900">Capitania dos Portos</p>
                    <p className="text-xl font-bold text-red-600">185</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-bold text-gray-900">Marinha MRCC</p>
                    <p className="text-xl font-bold text-blue-600">0800-941-185</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-300 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-bold text-gray-900">IBAMA - Emergências</p>
                    <p className="text-xl font-bold text-green-600">0800-61-8080</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
              onClick={() => showInfo("Novo Plano", "Abrindo formulário para criar novo plano de emergência")}
              disabled={isLoading}
            >
              <AlertTriangle className="h-6 w-6" />
              <span className="font-semibold">Novo Plano</span>
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => showInfo("Agendar Simulado", "Abrindo agenda de simulados")}
              disabled={isLoading}
            >
              <Clock className="h-6 w-6" />
              <span className="font-semibold">Agendar</span>
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => showInfo("Relatório", "Gerando relatório de simulados")}
              disabled={isLoading}
            >
              <FileText className="h-6 w-6" />
              <span className="font-semibold">Relatório</span>
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white min-h-[56px] flex-col gap-2"
              onClick={() => showInfo("Localização", "Abrindo mapa de pontos de encontro")}
              disabled={isLoading}
            >
              <MapPin className="h-6 w-6" />
              <span className="font-semibold">Localização</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyResponse;
