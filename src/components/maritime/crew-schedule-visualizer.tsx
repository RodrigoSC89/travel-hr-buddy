import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, Ship, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CrewSchedule {
  id: string;
  crewMember: string;
  rank: string;
  vessel: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "upcoming" | "completed" | "cancelled";
  rotationType: "on" | "off";
  alerts: string[];
}

interface VesselCapacity {
  vessel: string;
  totalPositions: number;
  filledPositions: number;
  criticalPositions: string[];
}

const mockSchedules: CrewSchedule[] = [
  {
    id: "1",
    crewMember: "Capitão João Silva",
    rank: "Master",
    vessel: "MV Nautilus Pioneer",
    startDate: new Date(2024, 0, 15),
    endDate: new Date(2024, 4, 15),
    status: "active",
    rotationType: "on",
    alerts: ["Certificado STCW expira em 45 dias"],
  },
  {
    id: "2",
    crewMember: "Oficial Maria Santos",
    rank: "Chief Officer",
    vessel: "MV Atlantic Explorer",
    startDate: new Date(2024, 1, 1),
    endDate: new Date(2024, 5, 1),
    status: "upcoming",
    rotationType: "on",
    alerts: [],
  },
  {
    id: "3",
    crewMember: "Eng. Carlos Lima",
    rank: "Chief Engineer",
    vessel: "MV Pacific Star",
    startDate: new Date(2023, 11, 1),
    endDate: new Date(2024, 3, 1),
    status: "completed",
    rotationType: "on",
    alerts: [],
  },
];

const mockVesselCapacity: VesselCapacity[] = [
  {
    vessel: "MV Nautilus Pioneer",
    totalPositions: 25,
    filledPositions: 23,
    criticalPositions: ["Second Engineer"],
  },
  {
    vessel: "MV Atlantic Explorer",
    totalPositions: 22,
    filledPositions: 22,
    criticalPositions: [],
  },
  {
    vessel: "MV Pacific Star",
    totalPositions: 28,
    filledPositions: 26,
    criticalPositions: ["Radio Officer", "AB Seaman"],
  },
];

export const CrewScheduleVisualizer: React.FC = () => {
  const [schedules] = useState<CrewSchedule[]>(mockSchedules);
  const [vesselCapacity] = useState<VesselCapacity[]>(mockVesselCapacity);
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"gantt" | "calendar">("gantt");
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
    case "active":
      return "bg-success text-azure-50";
    case "upcoming":
      return "bg-info text-azure-50";
    case "completed":
      return "bg-muted text-muted-foreground";
    case "cancelled":
      return "bg-destructive text-azure-50";
    default:
      return "bg-muted text-muted-foreground";
    }
  };

  const getRotationColor = (type: string) => {
    return type === "on" ? "bg-blue-500" : "bg-green-500";
  };

  const optimizeRotations = () => {
    toast({
      title: "Otimização de Escalas",
      description:
        "IA analisou e sugeriu otimizações para reduzir custos em 15% e melhorar bem-estar da tripulação.",
    });
  };

  const generateGanttView = () => {
    const months = [];
    const currentDate = new Date();

    // Generate 12 months starting from current month
    for (let i = -2; i < 10; i++) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push(month);
    }

    return (
      <div className="space-y-4">
        {/* Time Scale */}
        <div className="flex">
          <div className="w-64 p-2 font-medium text-sm">Tripulante / Embarcação</div>
          <div className="flex-1 grid grid-cols-12 gap-1">
            {months.map((month, index) => (
              <div key={index} className="text-center text-xs font-medium p-1">
                {month.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
              </div>
            ))}
          </div>
        </div>

        {/* Crew Rows */}
        {schedules
          .filter(schedule => selectedVessel === "all" || schedule.vessel === selectedVessel)
          .map(schedule => (
            <div
              key={schedule.id}
              className="flex items-center border rounded-lg p-2 hover:bg-muted/50"
            >
              <div className="w-64 space-y-1">
                <div className="font-medium text-sm">{schedule.crewMember}</div>
                <div className="text-xs text-muted-foreground">{schedule.rank}</div>
                <div className="text-xs text-muted-foreground">{schedule.vessel}</div>
                {schedule.alerts.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {schedule.alerts.length} alerta(s)
                  </Badge>
                )}
              </div>

              <div className="flex-1 grid grid-cols-12 gap-1 relative">
                {months.map((month, monthIndex) => {
                  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
                  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

                  const isActive = schedule.startDate <= monthEnd && schedule.endDate >= monthStart;

                  return (
                    <div
                      key={monthIndex}
                      className={`h-8 rounded border flex items-center justify-center ${
                        isActive
                          ? `${getRotationColor(schedule.rotationType)} text-azure-50 text-xs font-medium`
                          : "bg-background border-dashed"
                      }`}
                    >
                      {isActive && schedule.rotationType === "on" && <Ship className="w-3 h-3" />}
                      {isActive && schedule.rotationType === "off" && <Clock className="w-3 h-3" />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Visualizador de Escalas da Tripulação
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "gantt" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("gantt")}
              >
                Gantt
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                Calendário
              </Button>
              <Button variant="outline" size="sm" onClick={optimizeRotations}>
                <Zap className="w-4 h-4 mr-2" />
                Otimizar IA
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4" />
              <span className="text-sm font-medium">Embarcação:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedVessel === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedVessel("all")}
              >
                Todas
              </Button>
              {Array.from(new Set(schedules.map(s => s.vessel))).map(vessel => (
                <Button
                  key={vessel}
                  variant={selectedVessel === vessel ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedVessel(vessel)}
                >
                  {vessel.replace("MV ", "")}
                </Button>
              ))}
            </div>
          </div>

          {/* Gantt Chart */}
          {viewMode === "gantt" && generateGanttView()}

          {/* Calendar View Placeholder */}
          {viewMode === "calendar" && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Visualização em Calendário</h3>
              <p>Em desenvolvimento - Mostrará escalas em formato de calendário mensal</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vessel Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Capacidade das Embarcações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vesselCapacity.map((vessel, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{vessel.vessel}</h4>
                    <Badge
                      variant={vessel.criticalPositions.length === 0 ? "default" : "destructive"}
                    >
                      {vessel.filledPositions}/{vessel.totalPositions}
                    </Badge>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        vessel.criticalPositions.length === 0 ? "bg-success" : "bg-warning"
                      }`}
                      style={{
                        width: `${(vessel.filledPositions / vessel.totalPositions) * 100}%`,
                      }}
                    ></div>
                  </div>

                  {vessel.criticalPositions.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-destructive text-sm">
                        <AlertTriangle className="w-3 h-3" />
                        Posições Críticas:
                      </div>
                      {vessel.criticalPositions.map((position, posIndex) => (
                        <Badge key={posIndex} variant="destructive" className="text-xs mr-1">
                          {position}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-success text-sm">
                      <CheckCircle className="w-3 h-3" />
                      Totalmente tripulada
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">A Bordo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">De Folga</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-background border border-dashed rounded"></div>
              <span className="text-sm">Sem Escala</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm">Alertas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
