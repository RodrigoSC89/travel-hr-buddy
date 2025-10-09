import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { EnhancedReservation } from "./enhanced-reservations-dashboard";

interface ReservationCalendarViewProps {
  reservations: EnhancedReservation[];
  onEdit: (reservation: EnhancedReservation) => void;
  onDelete: (id: string) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  reservations: EnhancedReservation[];
}

export const ReservationCalendarView: React.FC<ReservationCalendarViewProps> = ({
  reservations,
  onEdit,
  onDelete
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReservation, setSelectedReservation] = useState<EnhancedReservation | null>(null);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDateIter = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayReservations = getReservationsForDay(currentDateIter);
      
      days.push({
        date: new Date(currentDateIter),
        isCurrentMonth: currentDateIter.getMonth() === month,
        reservations: dayReservations
      });
      
      currentDateIter.setDate(currentDateIter.getDate() + 1);
    }
    
    return days;
  };

  const getReservationsForDay = (date: Date): EnhancedReservation[] => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return reservations.filter(reservation => {
      const startDate = new Date(reservation.start_date);
      const endDate = new Date(reservation.end_date);
      
      // Check if reservation spans this day
      return startDate <= dayEnd && endDate >= dayStart;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "confirmed": return "bg-green-500";
    case "pending": return "bg-yellow-500";
    case "cancelled": return "bg-red-500";
    case "completed": return "bg-blue-500";
    default: return "bg-gray-500";
    }
  };

  const days = getDaysInMonth();
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" />
          Visualização de Calendário
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Hoje
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] p-1 border rounded-sm transition-colors hover:bg-muted/50
                      ${!day.isCurrentMonth ? "text-muted-foreground bg-muted/20" : ""}
                      ${day.date.toDateString() === new Date().toDateString() ? "bg-primary/10 border-primary" : ""}
                    `}
                  >
                    <div className="text-sm font-medium mb-1">
                      {day.date.getDate()}
                    </div>
                    
                    {day.reservations.length > 0 && (
                      <div className="space-y-1">
                        {day.reservations.slice(0, 3).map(reservation => (
                          <div
                            key={reservation.id}
                            className={`
                              text-xs p-1 rounded cursor-pointer truncate
                              ${getStatusColor(reservation.status)} text-white
                              hover:opacity-80 transition-opacity
                            `}
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            <div className="flex items-center gap-1">
                              {reservation.conflict_detected && (
                                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                              )}
                              <span className="truncate">{reservation.title}</span>
                            </div>
                          </div>
                        ))}
                        {day.reservations.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{day.reservations.length - 3} mais
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Selected Reservation Details */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedReservation ? "Detalhes da Reserva" : "Selecione uma Reserva"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedReservation ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{selectedReservation.title}</h4>
                    <Badge className={`mt-1 ${
                      selectedReservation.status === "confirmed" ? "bg-green-100 text-green-800" :
                        selectedReservation.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          selectedReservation.status === "cancelled" ? "bg-red-100 text-red-800" :
                            "bg-blue-100 text-blue-800"
                    }`}>
                      {selectedReservation.status === "confirmed" ? "Confirmada" :
                        selectedReservation.status === "pending" ? "Pendente" :
                          selectedReservation.status === "cancelled" ? "Cancelada" : "Concluída"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div>{new Date(selectedReservation.start_date).toLocaleDateString("pt-BR")}</div>
                        <div className="text-muted-foreground">
                          {new Date(selectedReservation.start_date).toLocaleTimeString("pt-BR", { 
                            hour: "2-digit", minute: "2-digit" 
                          })}
                        </div>
                      </div>
                    </div>

                    {selectedReservation.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedReservation.location}</span>
                      </div>
                    )}

                    {selectedReservation.description && (
                      <p className="text-sm text-muted-foreground">
                        {selectedReservation.description}
                      </p>
                    )}

                    {selectedReservation.conflict_detected && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">Conflito Detectado</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => onEdit(selectedReservation)}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(selectedReservation.id)}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Clique em uma reserva no calendário para ver os detalhes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Legenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">Pendente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Concluída</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Cancelada</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Conflito</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};