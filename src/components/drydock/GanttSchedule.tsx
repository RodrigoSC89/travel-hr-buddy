import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, ChevronLeft, ChevronRight, Ship, 
  Wrench, AlertTriangle, CheckCircle2, Clock, Brain
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DrydockEvent {
  id: string;
  vesselName: string;
  shipyard: string;
  eventType: 'drydock' | 'intermediate' | 'special';
  startDate: Date;
  endDate: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  cost: number;
}

const fallbackEvents: DrydockEvent[] = [
  {
    id: '1',
    vesselName: 'MV Nautilus Star',
    shipyard: 'Estaleiro Atlântico Sul',
    eventType: 'drydock',
    startDate: new Date('2025-01-10'),
    endDate: new Date('2025-01-25'),
    status: 'planned',
    progress: 0,
    cost: 850000
  },
  {
    id: '2',
    vesselName: 'MV Ocean Pride',
    shipyard: 'Jurong Shipyard',
    eventType: 'intermediate',
    startDate: new Date('2025-01-05'),
    endDate: new Date('2025-01-12'),
    status: 'in_progress',
    progress: 45,
    cost: 320000
  },
  {
    id: '3',
    vesselName: 'MV Pacific Dream',
    shipyard: 'Estaleiro Mauá',
    eventType: 'special',
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-02-05'),
    status: 'planned',
    progress: 0,
    cost: 1200000
  },
  {
    id: '4',
    vesselName: 'MV Atlantic Voyager',
    shipyard: 'Keppel FELS',
    eventType: 'drydock',
    startDate: new Date('2024-12-28'),
    endDate: new Date('2025-01-08'),
    status: 'delayed',
    progress: 72,
    cost: 950000
  }
];

const eventTypeConfig = {
  drydock: { label: 'Docagem Seca', color: 'bg-primary' },
  intermediate: { label: 'Intermediária', color: 'bg-warning' },
  special: { label: 'Especial', color: 'bg-accent' }
};

const statusConfig = {
  planned: { label: 'Planejada', color: 'border-l-primary' },
  in_progress: { label: 'Em Andamento', color: 'border-l-success' },
  completed: { label: 'Concluída', color: 'border-l-muted' },
  delayed: { label: 'Atrasada', color: 'border-l-destructive' }
};

export function GanttSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [events, setEvents] = useState<DrydockEvent[]>(fallbackEvents);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data, error } = await (supabase.from as Function)("maintenance_tasks")
          .select("id, title, description, status, scheduled_date, due_date, vessel_id, estimated_cost, progress_percent")
          .eq("task_type", "drydock")
          .limit(20);

        if (!error && data && data.length > 0) {
          setEvents(data.map((t: Record<string, unknown>) => ({
            id: String(t.id),
            vesselName: String(t.title || "Embarcação"),
            shipyard: String(t.description || "Estaleiro TBD"),
            eventType: "drydock" as const,
            startDate: new Date(String(t.scheduled_date || new Date().toISOString())),
            endDate: new Date(String(t.due_date || new Date().toISOString())),
            status: (t.status === "completed" ? "completed" : t.status === "in_progress" ? "in_progress" : "planned") as DrydockEvent["status"],
            progress: Number(t.progress_percent || 0),
            cost: Number(t.estimated_cost || 0)
          })));
        }
      } catch {
        // keep fallback
      }
    };
    loadEvents();
  }, []);

  const days = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      // Show 30 days
      return eachDayOfInterval({ 
        start: currentDate, 
        end: addDays(currentDate, 29) 
      });
    }
  }, [currentDate, viewMode]);

  const handlePrev = () => {
    setCurrentDate(prev => addDays(prev, viewMode === 'week' ? -7 : -30));
  };

  const handleNext = () => {
    setCurrentDate(prev => addDays(prev, viewMode === 'week' ? 7 : 30));
  };

  const handleOptimize = () => {
    toast.success('IA analisando cronograma...', {
      description: 'Buscando otimizações de datas e recursos'
    });
  };

  const getEventPosition = (event: DrydockEvent) => {
    const firstDay = days[0];
    const lastDay = days[days.length - 1];
    
    const eventStart = event.startDate < firstDay ? firstDay : event.startDate;
    const eventEnd = event.endDate > lastDay ? lastDay : event.endDate;
    
    if (eventStart > lastDay || eventEnd < firstDay) return null;
    
    const startOffset = Math.max(0, differenceInDays(eventStart, firstDay));
    const duration = differenceInDays(eventEnd, eventStart) + 1;
    
    return {
      left: `${(startOffset / days.length) * 100}%`,
      width: `${(duration / days.length) * 100}%`
    };
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Cronograma de Docagens
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {format(days[0], "dd MMM", { locale: ptBR })} - {format(days[days.length - 1], "dd MMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Select value={viewMode} onValueChange={(v: 'week' | 'month') => setViewMode(v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mês</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleOptimize}>
              <Brain className="h-4 w-4 mr-2" />
              Otimizar IA
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline Header */}
        <div className="border-b border-border/50 mb-4">
          <div className="grid" style={{ gridTemplateColumns: `200px repeat(${days.length}, 1fr)` }}>
            <div className="p-2 text-sm font-medium text-muted-foreground">Embarcação</div>
            {days.map((day, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-1 text-center text-xs border-l border-border/30",
                  day.getDay() === 0 || day.getDay() === 6 ? 'bg-muted/30' : ''
                )}
              >
                <div className="font-medium">{format(day, 'dd')}</div>
                <div className="text-muted-foreground">{format(day, 'EEE', { locale: ptBR })}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Events */}
        <div className="space-y-3">
          {events.map(event => {
            const position = getEventPosition(event);
            if (!position) return null;

            return (
              <div 
                key={event.id}
                className="grid items-center"
                style={{ gridTemplateColumns: `200px 1fr` }}
              >
                {/* Vessel Info */}
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm truncate">{event.vesselName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{event.shipyard}</p>
                </div>

                {/* Gantt Bar */}
                <div className="relative h-12 bg-muted/20 rounded">
                  <div 
                    className={cn(
                      "absolute top-1 bottom-1 rounded flex items-center px-2 border-l-4 cursor-pointer hover:opacity-90 transition-opacity",
                      eventTypeConfig[event.eventType].color,
                      statusConfig[event.status].color
                    )}
                    style={{ 
                      left: position.left, 
                      width: position.width,
                      minWidth: '60px'
                    }}
                    title={`${event.vesselName}: ${format(event.startDate, 'dd/MM')} - ${format(event.endDate, 'dd/MM')}`}
                  >
                    <div className="flex items-center gap-1 text-white text-xs font-medium truncate">
                      {event.status === 'delayed' && <AlertTriangle className="h-3 w-3" />}
                      {event.status === 'in_progress' && <Clock className="h-3 w-3" />}
                      {event.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                      <span className="truncate">{eventTypeConfig[event.eventType].label}</span>
                      {event.progress > 0 && (
                        <span className="ml-1">({event.progress}%)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap gap-4">
          <div className="text-sm text-muted-foreground">Tipos:</div>
          {Object.entries(eventTypeConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded", config.color)} />
              <span className="text-sm">{config.label}</span>
            </div>
          ))}
          <div className="text-sm text-muted-foreground ml-4">Status:</div>
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded border-l-4 bg-muted/50", config.color)} />
              <span className="text-sm">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-2xl font-bold">{events.length}</p>
            <p className="text-xs text-muted-foreground">Total de Docagens</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-2xl font-bold">{events.filter(e => e.status === 'in_progress').length}</p>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-destructive">{events.filter(e => e.status === 'delayed').length}</p>
            <p className="text-xs text-muted-foreground">Atrasadas</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-2xl font-bold">
              ${(events.reduce((a, e) => a + e.cost, 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-muted-foreground">Custo Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
