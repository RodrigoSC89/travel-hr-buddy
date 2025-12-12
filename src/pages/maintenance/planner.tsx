import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Filter,
  Download
} from "lucide-react";

export default function MaintenancePlanner() {
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">("all");

  const stats = {
    total: 156,
    scheduled: 24,
    pending: 8,
    completed: 124
  };

  const maintenanceJobs = [
    {
      id: 1,
      equipment: "Gerador Diesel A",
      type: "Preventiva",
      priority: "high",
      status: "pending",
      scheduled: "2025-11-10",
      description: "Substituição de filtros e óleo"
    },
    {
      id: 2,
      equipment: "Bomba Hidráulica 1",
      type: "Corretiva",
      priority: "critical",
      status: "overdue",
      scheduled: "2025-11-01",
      description: "Reparo de vazamento"
    },
    {
      id: 3,
      equipment: "Sistema HVAC",
      type: "Preditiva",
      priority: "medium",
      status: "scheduled",
      scheduled: "2025-11-15",
      description: "Manutenção baseada em sensores"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "critical": return "destructive";
    case "high": return "destructive";
    case "medium": return "secondary";
    default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "completed": return "text-green-600";
    case "pending": return "text-yellow-600";
    case "overdue": return "text-red-600";
    case "scheduled": return "text-blue-600";
    default: return "text-gray-600";
    }
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Wrench}
        title="Manutenções Ativas"
        description="Planejamento e gestão de manutenções preventivas, corretivas e preditivas"
        gradient="blue"
        badges={[
          { icon: Calendar, label: "Agendamento Inteligente" },
          { icon: TrendingUp, label: "Análise Preditiva" },
          { icon: CheckCircle, label: "KPIs em Tempo Real" }
        ]}
      />

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Manutenções</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+12% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">No prazo: 95%</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button onClick={() => setFilter("all")} variant={filter === "all" ? "default" : "outline"}>
            Todas
          </Button>
          <Button onClick={() => setFilter("pending")} variant={filter === "pending" ? "default" : "outline"}>
            Pendentes
          </Button>
          <Button onClick={() => setFilter("completed")} variant={filter === "completed" ? "default" : "outline"}>
            Concluídas
          </Button>
          <Button onClick={() => setFilter("overdue")} variant={filter === "overdue" ? "default" : "outline"}>
            Atrasadas
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova OS
          </Button>
        </div>
      </div>

      {/* Maintenance Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço</CardTitle>
          <CardDescription>
            Gerenciamento de manutenções programadas e emergenciais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{job.equipment}</h3>
                      <Badge variant={getPriorityColor(job.priority as any)}>
                        {job.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{job.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.scheduled}
                      </span>
                      <span className={`flex items-center gap-1 ${getStatusColor(job.status)}`}>
                        <CheckCircle className="h-3 w-3" />
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Ver Detalhes</Button>
                    <Button size="sm">Executar</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ModulePageWrapper>
  );
}
