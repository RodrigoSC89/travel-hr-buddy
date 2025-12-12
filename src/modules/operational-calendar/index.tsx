import { useEffect, useMemo, useState, useCallback } from "react";;

/**
 * CALENDÁRIO OPERACIONAL UNIFICADO
 * Eventos integrados por embarcação/unidade com IA para reorganização
 * Melhoria Lovable #5
 */

import React, { useState, useEffect, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, addHours, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";
import {
  CalendarDays,
  Ship,
  Wrench,
  Users,
  FileCheck,
  AlertTriangle,
  Plus,
  Brain,
  Sparkles,
  Clock,
  MapPin,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle
} from "lucide-react";

const locales = { "pt-BR": ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "maintenance" | "inspection" | "crew" | "voyage" | "compliance" | "training" | "other";
  vessel?: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  aiSuggested?: boolean;
  conflict?: boolean;
}

const eventTypeColors: Record<string, string> = {
  maintenance: "#f97316",
  inspection: "#8b5cf6",
  crew: "#22c55e",
  voyage: "#3b82f6",
  compliance: "#ef4444",
  training: "#eab308",
  other: "#6b7280",
};

const eventTypeLabels: Record<string, string> = {
  maintenance: "Manutenção",
  inspection: "Inspeção",
  crew: "Tripulação",
  voyage: "Viagem",
  compliance: "Compliance",
  training: "Treinamento",
  other: "Outro",
};

// Generate sample events
const generateSampleEvents = (): CalendarEvent[] => {
  const today = new Date();
  return [
    {
      id: "1",
      title: "Manutenção Motor Principal - MV Ocean Star",
      start: addHours(today, 8),
      end: addHours(today, 16),
      type: "maintenance",
      vessel: "MV Ocean Star",
      description: "Troca de filtros e verificação de sistemas",
      priority: "high",
      status: "scheduled",
    },
    {
      id: "2",
      title: "Inspeção DNV - MV Atlantic",
      start: addDays(today, 2),
      end: addDays(addHours(today, 8), 2),
      type: "inspection",
      vessel: "MV Atlantic",
      description: "Auditoria anual de classificação",
      priority: "high",
      status: "scheduled",
    },
    {
      id: "3",
      title: "Embarque Tripulação - MV Pacific",
      start: addDays(addHours(today, 6), 1),
      end: addDays(addHours(today, 10), 1),
      type: "crew",
      vessel: "MV Pacific",
      description: "Troca de turma - 12 tripulantes",
      priority: "medium",
      status: "scheduled",
    },
    {
      id: "4",
      title: "Treinamento SOLAS - Base",
      start: addDays(addHours(today, 9), 3),
      end: addDays(addHours(today, 17), 3),
      type: "training",
      description: "Reciclagem obrigatória",
      priority: "medium",
      status: "scheduled",
    },
    {
      id: "5",
      title: "Vencimento Certificado ISPS - MV Ocean Star",
      start: addDays(today, 5),
      end: addDays(today, 5),
      type: "compliance",
      vessel: "MV Ocean Star",
      priority: "high",
      status: "scheduled",
      conflict: true,
    },
    {
      id: "6",
      title: "Viagem Santos → Rotterdam",
      start: addDays(today, 7),
      end: addDays(today, 21),
      type: "voyage",
      vessel: "MV Atlantic",
      description: "Carga: Containers 40ft",
      priority: "medium",
      status: "scheduled",
    },
  ];
};

const OperationalCalendar = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>(generateSampleEvents());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>("all");
  const [filterVessel, setFilterVessel] = useState<string>("all");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "other",
    vessel: "",
    description: "",
    priority: "medium",
    start: new Date(),
    end: addHours(new Date(), 2),
  });

  const vessels = useMemo(() => {
    const uniqueVessels = [...new Set(events.filter(e => e.vessel).map(e => e.vessel))];
    return uniqueVessels;
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (filterType !== "all" && event.type !== filterType) return false;
      if (filterVessel !== "all" && event.vessel !== filterVessel) return false;
      return true;
  });
  }, [events, filterType, filterVessel]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = eventTypeColors[event.type] || eventTypeColors.other;
    const style = {
      backgroundColor,
      borderRadius: "4px",
      opacity: event.status === "cancelled" ? 0.5 : 1,
      color: "white",
      border: event.conflict ? "2px solid red" : "none",
      boxShadow: event.aiSuggested ? "0 0 10px rgba(139, 92, 246, 0.5)" : "none",
    };
    return { style };
  });

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  });

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewEvent(prev => ({ ...prev, start, end }));
    setShowNewEventDialog(true);
  });

  const optimizeScheduleWithAI = async () => {
    setIsOptimizing(true);
    try {
      const response = await supabase.functions.invoke("ai-calendar-optimizer", {
        body: { events }
};

      if (response.data?.optimizedEvents) {
        setEvents(response.data.optimizedEvents);
        setAiSuggestions(response.data.suggestions || []);
        toast({ title: "Calendário Otimizado", description: "IA reorganizou os eventos para evitar conflitos" });
      } else {
        // Fallback optimization
        setAiSuggestions([
          "Manutenção do MV Ocean Star pode ser antecipada para evitar conflito com vencimento ISPS",
          "Embarque de tripulação pode ser combinado com inspeção para otimizar recursos",
          "Sugere-se agendar treinamento SOLAS antes da viagem internacional",
        ]);
        toast({ title: "Sugestões Geradas", description: "3 recomendações de otimização" });
      }
    } catch (error) {
      console.error("AI optimization error:", error);
      setAiSuggestions([
        "Considere reagendar eventos sobrepostos",
        "Priorize tarefas de compliance com prazo próximo",
      ]);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCreateEvent = () => {
    const event: CalendarEvent = {
      id: Date.now().toString(),
      ...newEvent,
      status: "scheduled",
    };
    setEvents(prev => [...prev, event]);
    setShowNewEventDialog(false);
    setNewEvent({
      title: "",
      type: "other",
      vessel: "",
      description: "",
      priority: "medium",
      start: new Date(),
      end: addHours(new Date(), 2),
    });
    toast({ title: "Evento Criado", description: event.title });
  });

  const getConflictCount = () => events.filter(e => e.conflict).length;
  const getUpcomingHighPriority = () => events.filter(e => e.priority === "high" && e.status === "scheduled").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
              <CalendarDays className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Calendário Operacional Unificado</h1>
              <p className="text-muted-foreground">Todos os eventos integrados com IA para otimização</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {getConflictCount() > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {getConflictCount()} Conflitos
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {getUpcomingHighPriority()} Alta Prioridade
            </Badge>

            <Button onClick={optimizeScheduleWithAI} disabled={isOptimizing}>
              {isOptimizing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Otimizar com IA
            </Button>

            <Button onClick={handleSetShowNewEventDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>

        {/* AI Suggestions Banner */}
        {aiSuggestions.length > 0 && (
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    Sugestões da IA
                  </h4>
                  <ul className="space-y-1">
                    {aiSuggestions.map((s, i) => (
                      <li key={i} className="text-sm text-purple-600 dark:text-purple-400 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-auto"
                  onClick={handleSetAiSuggestions}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(eventTypeLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={filterVessel} onValueChange={setFilterVessel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Embarcação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as embarcações</SelectItem>
              {vessels.map(vessel => (
                <SelectItem key={vessel} value={vessel!}>{vessel}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Event Type Legend */}
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            {Object.entries(eventTypeLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: eventTypeColors[key] }}
                />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <Card>
          <CardContent className="p-4">
            <div className="h-[700px]">
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                view={view}
                onView={(v) => setView(v}
                date={date}
                onNavigate={setDate}
                messages={{
                  today: "Hoje",
                  previous: "Anterior",
                  next: "Próximo",
                  month: "Mês",
                  week: "Semana",
                  day: "Dia",
                  agenda: "Agenda",
                  noEventsInRange: "Nenhum evento neste período",
                }}
                culture="pt-BR"
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Detail Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: eventTypeColors[selectedEvent?.type || "other"] }}
                />
                {selectedEvent?.title}
              </DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Tipo</Label>
                    <p className="font-medium">{eventTypeLabels[selectedEvent.type]}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Prioridade</Label>
                    <Badge variant={selectedEvent.priority === "high" ? "destructive" : "secondary"}>
                      {selectedEvent.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Início</Label>
                    <p className="font-medium">{format(selectedEvent.start, "dd/MM/yyyy HH:mm")}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fim</Label>
                    <p className="font-medium">{format(selectedEvent.end, "dd/MM/yyyy HH:mm")}</p>
                  </div>
                </div>
                {selectedEvent.vessel && (
                  <div>
                    <Label className="text-muted-foreground">Embarcação</Label>
                    <p className="font-medium flex items-center gap-1">
                      <Ship className="h-4 w-4" />
                      {selectedEvent.vessel}
                    </p>
                  </div>
                )}
                {selectedEvent.description && (
                  <div>
                    <Label className="text-muted-foreground">Descrição</Label>
                    <p>{selectedEvent.description}</p>
                  </div>
                )}
                {selectedEvent.conflict && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Conflito Detectado</span>
                    </div>
                    <p className="text-sm text-red-500 mt-1">
                      Este evento conflita com outros agendamentos. Use a IA para sugerir reorganização.
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleSetShowEventDialog}>
                Fechar
              </Button>
              <Button>Editar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Event Dialog */}
        <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input 
                  value={newEvent.title}
                  onChange={handleChange}))}
                  placeholder="Descrição do evento"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select 
                    value={newEvent.type} 
                    onValueChange={(v) => setNewEvent(prev => ({ ...prev, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(eventTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridade</Label>
                  <Select 
                    value={newEvent.priority} 
                    onValueChange={(v) => setNewEvent(prev => ({ ...prev, priority: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Embarcação (opcional)</Label>
                <Input 
                  value={newEvent.vessel}
                  onChange={handleChange}))}
                  placeholder="Nome da embarcação"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea 
                  value={newEvent.description}
                  onChange={handleChange}))}
                  placeholder="Detalhes do evento"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSetShowNewEventDialog}>
                Cancelar
              </Button>
              <Button onClick={handleCreateEvent} disabled={!newEvent.title}>
                Criar Evento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OperationalCalendar;
