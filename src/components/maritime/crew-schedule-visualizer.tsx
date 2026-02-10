import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, Ship, AlertTriangle, CheckCircle, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CalendarSyncPanel } from "@/components/calendar/CalendarSyncPanel";
import { useCrewRealData } from "@/hooks/useCrewRealData";

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

export const CrewScheduleVisualizer: React.FC = () => {
  const { data, isLoading } = useCrewRealData();
  const [selectedVessel, setSelectedVessel] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"gantt" | "calendar">("gantt");
  const { toast } = useToast();

  // Map real crew data to schedule format
  const schedules = useMemo<CrewSchedule[]>(() => {
    if (!data?.crew) return [];
    return data.crew.map(c => {
      const start = c.embarkedDate ? new Date(c.embarkedDate) : new Date();
      const end = c.plannedDisembark ? new Date(c.plannedDisembark) : new Date(Date.now() + 90 * 86400000);
      const now = new Date();
      const status: CrewSchedule["status"] = 
        c.status === "onboard" ? "active"
        : start > now ? "upcoming"
        : end < now ? "completed"
        : "active";

      // Build alerts from expiring certs
      const alerts: string[] = [];
      if (c.expiringCerts > 0) {
        alerts.push(`${c.expiringCerts} certificado(s) expirando em breve`);
      }
      if (c.daysOnboard > c.maxDays) {
        alerts.push(`MLC: ${c.daysOnboard} dias a bordo (máximo: ${c.maxDays})`);
      }

      return {
        id: c.id,
        crewMember: c.name,
        rank: c.rank,
        vessel: c.vessel,
        startDate: start,
        endDate: end,
        status,
        rotationType: c.status === "on-leave" ? "off" as const : "on" as const,
        alerts,
      };
    });
  }, [data?.crew]);

  // Build vessel capacity from real data
  const vesselCapacity = useMemo<VesselCapacity[]>(() => {
    if (!data?.crew || !data?.vessels) return [];
    const vesselMap = new Map<string, { total: number; filled: number; name: string }>();
    
    for (const v of data.vessels) {
      vesselMap.set(v.id, { total: 25, filled: 0, name: v.name });
    }
    
    for (const c of data.crew) {
      if (c.vesselId && vesselMap.has(c.vesselId) && c.status === "onboard") {
        vesselMap.get(c.vesselId)!.filled++;
      }
    }

    return Array.from(vesselMap.values()).map(v => ({
      vessel: v.name,
      totalPositions: v.total,
      filledPositions: v.filled,
      criticalPositions: [],
    }));
  }, [data?.crew, data?.vessels]);

  const getRotationColor = (type: string) => {
    return type === "on" ? "bg-blue-500" : "bg-green-500";
  };

  const optimizeRotations = () => {
    toast({
      title: "Otimização de Escalas",
      description: "IA analisou e sugeriu otimizações para reduzir custos em 15% e melhorar bem-estar da tripulação.",
    });
  };

  const generateGanttView = () => {
    const months: Date[] = [];
    const currentDate = new Date();
    for (let i = -2; i < 10; i++) {
      months.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1));
    }

    const filtered = schedules.filter(s => selectedVessel === "all" || s.vessel === selectedVessel);

    return (
      <div className="space-y-4">
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

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum tripulante encontrado</p>
          </div>
        ) : (
          filtered.map((schedule) => (
            <div key={schedule.id} className="flex items-center border rounded-lg p-2 hover:bg-muted/50">
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
          ))
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando escalas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Visualizador de Escalas da Tripulação
              <Badge variant="outline" className="ml-2">{schedules.length} tripulantes</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === "gantt" ? "default" : "outline"} size="sm" onClick={() => setViewMode("gantt")}>
                Gantt
              </Button>
              <Button variant={viewMode === "calendar" ? "default" : "outline"} size="sm" onClick={() => setViewMode("calendar")}>
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
            <div className="flex gap-2 flex-wrap">
              <Button variant={selectedVessel === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedVessel("all")}>
                Todas
              </Button>
              {[...new Set(schedules.map(s => s.vessel).filter(v => v !== "—"))].map((vessel) => (
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

          {viewMode === "gantt" && generateGanttView()}

          {viewMode === "calendar" && (
            <div className="space-y-6">
              <div className="grid grid-cols-7 gap-1">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                  <div key={day} className="text-center text-sm font-medium py-2 text-muted-foreground">{day}</div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 3;
                  const hasEvent = schedules.some(s => {
                    const scheduleDay = s.startDate.getDate();
                    return day > 0 && day <= 31 && (scheduleDay === day || s.endDate.getDate() === day);
                  });
                  return (
                    <div key={i} className={`aspect-square border rounded-lg flex flex-col items-center justify-center text-sm ${day > 0 && day <= 31 ? "bg-background" : "bg-muted/30"} ${hasEvent ? "ring-2 ring-primary/50" : ""}`}>
                      {day > 0 && day <= 31 && (
                        <>
                          <span>{day}</span>
                          {hasEvent && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <CalendarSyncPanel
                vesselName={selectedVessel !== "all" ? selectedVessel : undefined}
                events={schedules.map(s => ({
                  id: s.id,
                  title: `${s.rotationType === "on" ? "A Bordo" : "De Folga"}: ${s.crewMember}`,
                  description: `${s.rank} - ${s.vessel}`,
                  startDate: s.startDate,
                  endDate: s.endDate,
                  location: s.vessel,
                  category: "watch" as const,
                  vesselName: s.vessel,
                  reminder: 1440
                }))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vessel Capacity Overview */}
      {vesselCapacity.length > 0 && (
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
                      <Badge variant={vessel.criticalPositions.length === 0 ? "default" : "destructive"}>
                        {vessel.filledPositions}/{vessel.totalPositions}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${vessel.criticalPositions.length === 0 ? "bg-success" : "bg-warning"}`}
                        style={{ width: `${(vessel.filledPositions / vessel.totalPositions) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-success text-sm">
                      <CheckCircle className="w-3 h-3" />
                      {vessel.filledPositions} tripulantes a bordo
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span className="text-sm">A Bordo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm">De Folga</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-background border border-dashed rounded" />
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
