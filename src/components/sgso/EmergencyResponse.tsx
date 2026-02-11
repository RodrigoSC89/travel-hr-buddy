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
import { NewEmergencyPlanDialog } from "./dialogs/NewEmergencyPlanDialog";
import { ScheduleDrillDialog } from "./dialogs/ScheduleDrillDialog";
import { EmergencyReportDialog } from "./dialogs/EmergencyReportDialog";
import { EmergencyLocationsDialog } from "./dialogs/EmergencyLocationsDialog";
import { ViewPlanDialog } from "./dialogs/ViewPlanDialog";
import { DrillSimulationDialog } from "./dialogs/DrillSimulationDialog";

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
      color: "bg-destructive text-destructive-foreground",
      label: "Incêndio",
      badgeColor: "bg-destructive"
    },
    oil_spill: {
      icon: Activity,
      color: "bg-success text-success-foreground",
      label: "Derramamento",
      badgeColor: "bg-success"
    },
    man_overboard: {
      icon: Users,
      color: "bg-primary text-primary-foreground",
      label: "Homem ao Mar",
      badgeColor: "bg-primary"
    },
    collision: {
      icon: AlertTriangle,
      color: "bg-warning text-warning-foreground",
      label: "Colisão",
      badgeColor: "bg-warning"
    },
    medical: {
      icon: Shield,
      color: "bg-secondary text-secondary-foreground",
      label: "Médica",
      badgeColor: "bg-secondary"
    },
    abandon_ship: {
      icon: AlertTriangle,
      color: "bg-destructive text-destructive-foreground",
      label: "Abandono",
      badgeColor: "bg-destructive"
    }
  };
  return configs[type as keyof typeof configs] || configs.fire;
};

const getStatusConfig = (status: string) => {
  const configs = {
    active: {
      color: "bg-success text-success-foreground",
      label: "Ativo"
    },
    under_review: {
      color: "bg-warning text-warning-foreground",
      label: "Em Revisão"
    },
    expired: {
      color: "bg-destructive text-destructive-foreground",
      label: "Expirado"
    }
  };
  return configs[status as keyof typeof configs] || configs.active;
};

export const EmergencyResponse: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const { handleViewDetails, showInfo, isLoading } = useMaritimeActions();
  
  // Dialog states
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [scheduleDrillOpen, setScheduleDrillOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [viewPlanOpen, setViewPlanOpen] = useState(false);
  const [drillSimOpen, setDrillSimOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<EmergencyPlan | null>(null);

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

  const handleViewPlan = (plan: EmergencyPlan) => {
    setSelectedPlan(plan);
    setViewPlanOpen(true);
  };

  const handleStartDrill = (plan: EmergencyPlan) => {
    setSelectedPlan(plan);
    setDrillSimOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-success/10 border-success/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
              <Badge className="bg-success text-success-foreground font-bold">ATIVOS</Badge>
            </div>
            <h3 className="text-sm font-medium text-success mb-1">Planos Ativos</h3>
            <p className="text-3xl font-bold text-foreground">{activeCount}</p>
            <p className="text-xs text-success mt-2">Prontos para ação</p>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-10 w-10 text-warning" />
              <Badge className="bg-warning text-warning-foreground font-bold">REVISÃO</Badge>
            </div>
            <h3 className="text-sm font-medium text-warning mb-1">Em Revisão</h3>
            <p className="text-3xl font-bold text-foreground">{reviewCount}</p>
            <p className="text-xs text-warning mt-2">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-10 w-10 text-primary" />
              <Badge className="bg-primary text-primary-foreground font-bold">SIMULADOS</Badge>
            </div>
            <h3 className="text-sm font-medium text-primary mb-1">Simulados no Mês</h3>
            <p className="text-3xl font-bold text-foreground">{totalDrillsThisMonth}</p>
            <p className="text-xs text-primary mt-2">Realizados</p>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-10 w-10 text-warning" />
              <Badge className="bg-warning text-warning-foreground font-bold">PRÓXIMO</Badge>
            </div>
            <h3 className="text-sm font-medium text-warning mb-1">Próximo Simulado</h3>
            <p className="text-xl font-bold text-foreground">
              {new Date(nextDrill).toLocaleDateString("pt-BR")}
            </p>
            <p className="text-xs text-warning mt-2">Agendado</p>
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
                            <h3 className="text-lg font-bold text-foreground">{plan.title}</h3>
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
                              <p className="text-sm font-bold text-foreground">
                                {new Date(plan.last_drill).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Próximo Simulado</p>
                              <p className="text-sm font-bold text-foreground">
                                {new Date(plan.next_drill).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Responsável</p>
                              <p className="text-sm font-bold text-foreground">
                                <Users className="h-3 w-3 inline mr-1" />
                                {plan.responsible}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground font-medium">Contatos</p>
                              <p className="text-sm font-bold text-foreground">
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
                          onClick={() => handleViewPlan(plan)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Plano
                        </Button>
                        <Button
                          size="sm"
                          className="min-h-[44px] px-6 bg-warning text-warning-foreground hover:bg-warning/90"
                          onClick={() => handleStartDrill(plan)}
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
            <Card className="border-2 border-destructive/30 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="font-bold text-foreground">Capitania dos Portos</p>
                    <p className="text-xl font-bold text-destructive">185</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-bold text-foreground">Marinha MRCC</p>
                    <p className="text-xl font-bold text-primary">0800-941-185</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-success/30 bg-success/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-8 w-8 text-success" />
                  <div>
                    <p className="font-bold text-foreground">IBAMA - Emergências</p>
                    <p className="text-xl font-bold text-success">0800-61-8080</p>
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
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground min-h-[56px] flex-col gap-2"
              onClick={() => setNewPlanOpen(true)}
            >
              <AlertTriangle className="h-6 w-6" />
              <span className="font-semibold">Novo Plano</span>
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-[56px] flex-col gap-2"
              onClick={() => setScheduleDrillOpen(true)}
            >
              <Clock className="h-6 w-6" />
              <span className="font-semibold">Agendar</span>
            </Button>
            <Button
              className="bg-success hover:bg-success/90 text-success-foreground min-h-[56px] flex-col gap-2"
              onClick={() => setReportOpen(true)}
            >
              <FileText className="h-6 w-6" />
              <span className="font-semibold">Relatório</span>
            </Button>
            <Button
              className="bg-warning hover:bg-warning/90 text-warning-foreground min-h-[56px] flex-col gap-2"
              onClick={() => setLocationsOpen(true)}
            >
              <MapPin className="h-6 w-6" />
              <span className="font-semibold">Localização</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <NewEmergencyPlanDialog 
        open={newPlanOpen} 
        onOpenChange={setNewPlanOpen}
        onPlanCreated={(_plan) => {
          // Plan creation handled - refresh list
        }}
      />
      <ScheduleDrillDialog 
        open={scheduleDrillOpen} 
        onOpenChange={setScheduleDrillOpen}
        onDrillScheduled={(_drill) => {
          // Drill scheduled - refresh list
        }}
      />
      <EmergencyReportDialog 
        open={reportOpen} 
        onOpenChange={setReportOpen} 
      />
      <EmergencyLocationsDialog 
        open={locationsOpen} 
        onOpenChange={setLocationsOpen} 
      />
      <ViewPlanDialog
        open={viewPlanOpen}
        onOpenChange={setViewPlanOpen}
        plan={selectedPlan}
      />
      <DrillSimulationDialog
        open={drillSimOpen}
        onOpenChange={setDrillSimOpen}
        plan={selectedPlan}
      />
    </div>
  );
};

export default EmergencyResponse;
