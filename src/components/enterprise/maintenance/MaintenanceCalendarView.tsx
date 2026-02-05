/**
 * MaintenanceCalendarView - Calendário Visual de Manutenções
 * Enterprise-grade maintenance scheduling with interactive calendar
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Wrench, AlertTriangle, CheckCircle2, Clock, Ship, ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MaintenanceEvent {
  id: string;
  title: string;
  vessel: string;
  vesselId: string;
  type: "preventive" | "corrective" | "inspection" | "class";
  priority: "critical" | "high" | "medium" | "low";
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  date: Date;
  duration: number; // hours
  equipment: string;
  assignedTo: string;
  cost?: number;
}

const mockEvents: MaintenanceEvent[] = [
  {
    id: "1",
    title: "Inspeção de Motor Principal",
    vessel: "MV Atlantic Star",
    vesselId: "v1",
    type: "preventive",
    priority: "high",
    status: "scheduled",
    date: new Date(),
    duration: 8,
    equipment: "Motor Principal Wartsila",
    assignedTo: "Eng. Carlos Silva",
    cost: 15000,
  },
  {
    id: "2",
    title: "Troca de Óleo Hidráulico",
    vessel: "MV Pacific Dawn",
    vesselId: "v2",
    type: "preventive",
    priority: "medium",
    status: "scheduled",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    duration: 4,
    equipment: "Sistema Hidráulico",
    assignedTo: "Eng. João Santos",
    cost: 5000,
  },
  {
    id: "3",
    title: "Reparo Emergencial Bomba",
    vessel: "MV Caribbean Blue",
    vesselId: "v3",
    type: "corrective",
    priority: "critical",
    status: "in_progress",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    duration: 12,
    equipment: "Bomba de Lastro",
    assignedTo: "Eng. Maria Oliveira",
    cost: 25000,
  },
  {
    id: "4",
    title: "Vistoria de Classe Anual",
    vessel: "MV Atlantic Star",
    vesselId: "v1",
    type: "class",
    priority: "high",
    status: "scheduled",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    duration: 24,
    equipment: "Casco e Estrutura",
    assignedTo: "Lloyd's Register",
    cost: 50000,
  },
  {
    id: "5",
    title: "Calibração de Instrumentos",
    vessel: "MV Pacific Dawn",
    vesselId: "v2",
    type: "inspection",
    priority: "low",
    status: "completed",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    duration: 6,
    equipment: "Instrumentação Bridge",
    assignedTo: "Técnico Pedro Lima",
    cost: 3000,
  },
];

const typeColors = {
  preventive: "bg-blue-500",
  corrective: "bg-red-500",
  inspection: "bg-purple-500",
  class: "bg-amber-500",
};

const priorityColors = {
  critical: "text-red-500 bg-red-50",
  high: "text-orange-500 bg-orange-50",
  medium: "text-yellow-500 bg-yellow-50",
  low: "text-green-500 bg-green-50",
};

const statusConfig = {
  scheduled: { label: "Agendado", color: "bg-blue-100 text-blue-700", icon: Clock },
  in_progress: { label: "Em Andamento", color: "bg-amber-100 text-amber-700", icon: Wrench },
  completed: { label: "Concluído", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  overdue: { label: "Atrasado", color: "bg-red-100 text-red-700", icon: AlertTriangle },
};

export function MaintenanceCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceEvent | null>(null);
  const [view, setView] = useState<"month" | "week" | "list">("month");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return mockEvents.filter(event => isSameDay(event.date, day));
  };

  const stats = {
    total: mockEvents.length,
    scheduled: mockEvents.filter(e => e.status === "scheduled").length,
    inProgress: mockEvents.filter(e => e.status === "in_progress").length,
    overdue: mockEvents.filter(e => e.status === "overdue" || (e.status !== "completed" && isBefore(e.date, new Date()))).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Manutenções</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendário de Manutenções
            </CardTitle>
            <CardDescription>Visualização interativa de todas as manutenções programadas</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
              <TabsList className="h-8">
                <TabsTrigger value="month" className="text-xs">Mês</TabsTrigger>
                <TabsTrigger value="week" className="text-xs">Semana</TabsTrigger>
                <TabsTrigger value="list" className="text-xs">Lista</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filtrar
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Manutenção
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <motion.div
                  key={day.toISOString()}
                  className={`
                    min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors
                    ${isToday(day) ? "bg-primary/5 border-primary" : "hover:bg-muted/50"}
                    ${isSelected ? "ring-2 ring-primary" : ""}
                  `}
                  onClick={() => setSelectedDate(day)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${typeColors[event.type]} text-white`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 2} mais
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Legenda:</span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span className="text-xs">Preventiva</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-red-500" />
              <span className="text-xs">Corretiva</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-purple-500" />
              <span className="text-xs">Inspeção</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-amber-500" />
              <span className="text-xs">Classe</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Event Detail */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${typeColors[selectedEvent.type]}`} />
                      {selectedEvent.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Ship className="h-4 w-4" />
                      {selectedEvent.vessel}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusConfig[selectedEvent.status].color}>
                      {statusConfig[selectedEvent.status].label}
                    </Badge>
                    <Badge className={priorityColors[selectedEvent.priority]}>
                      {selectedEvent.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">{format(selectedEvent.date, "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duração</p>
                    <p className="font-medium">{selectedEvent.duration}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Equipamento</p>
                    <p className="font-medium">{selectedEvent.equipment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Responsável</p>
                    <p className="font-medium">{selectedEvent.assignedTo}</p>
                  </div>
                </div>
                {selectedEvent.cost && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Custo Estimado</p>
                    <p className="text-xl font-bold text-primary">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" }).format(selectedEvent.cost)}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1">Editar</Button>
                  <Button variant="outline" className="flex-1">Ver Detalhes</Button>
                  <Button variant="ghost" onClick={() => setSelectedEvent(null)}>Fechar</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MaintenanceCalendarView;
