import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Copy,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReservationEvent {
  id: string;
  title: string;
  employee: string;
  type: "flight" | "hotel";
  startDate: Date;
  endDate: Date;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  conflicts: boolean;
}

const mockEvents: ReservationEvent[] = [
  {
    id: "RSV001",
    title: "Viagem São Paulo",
    employee: "Ana Silva",
    type: "flight",
    startDate: new Date(2024, 0, 15),
    endDate: new Date(2024, 0, 20),
    status: "confirmed",
    conflicts: false,
  },
  {
    id: "RSV002",
    title: "Hotel Rio de Janeiro",
    employee: "Carlos Santos",
    type: "hotel",
    startDate: new Date(2024, 0, 18),
    endDate: new Date(2024, 0, 22),
    status: "confirmed",
    conflicts: false,
  },
  {
    id: "RSV003",
    title: "Viagem Miami",
    employee: "Marina Costa",
    type: "flight",
    startDate: new Date(2024, 1, 1),
    endDate: new Date(2024, 1, 8),
    status: "pending",
    conflicts: true,
  },
];

export const EnhancedReservationsCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events] = useState<ReservationEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<ReservationEvent | null>(null);
  const { toast } = useToast();

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];

    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return date >= eventStart && date <= eventEnd;
    });
  };

  const duplicateReservation = (reservation: ReservationEvent) => {
    toast({
      title: "Reserva Duplicada",
      description: `Reserva ${reservation.id} duplicada com sucesso. Nova reserva: ${reservation.id}-COPY`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success text-azure-50";
      case "pending":
        return "bg-warning text-azure-900";
      case "cancelled":
        return "bg-destructive text-azure-50";
      case "completed":
        return "bg-info text-azure-50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "flight" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary";
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Calendário de Reservas
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium text-lg capitalize">{monthName}</span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const hasConflicts = dayEvents.some(event => event.conflicts);

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    day ? "bg-background hover:bg-muted/50 cursor-pointer" : "bg-muted/20"
                  } ${hasConflicts ? "border-destructive bg-destructive/5" : "border-border"}`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium mb-1 flex items-center justify-between">
                        {day.getDate()}
                        {hasConflicts && <AlertTriangle className="w-3 h-3 text-destructive" />}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getTypeColor(event.type)}`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="font-medium truncate">{event.employee}</div>
                            <div className="truncate">{event.title}</div>
                            <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                              {event.status}
                            </Badge>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayEvents.length - 2} mais
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Detalhes da Reserva
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => duplicateReservation(selectedEvent)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
                  Fechar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Código</label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Funcionário</label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.employee}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <Badge className={getTypeColor(selectedEvent.type)}>
                    {selectedEvent.type === "flight" ? "Voo" : "Hotel"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={getStatusColor(selectedEvent.status)}>
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Data de Início</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.startDate.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Data de Fim</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.endDate.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {selectedEvent.conflicts && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Conflito Detectado</span>
                    </div>
                    <p className="text-sm text-destructive/80 mt-1">
                      Esta reserva tem conflito de horário ou capacidade com outras reservas.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {events.filter(e => e.status === "confirmed").length}
            </div>
            <p className="text-sm text-muted-foreground">Confirmadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {events.filter(e => e.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {events.filter(e => e.conflicts).length}
            </div>
            <p className="text-sm text-muted-foreground">Conflitos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{events.length}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
