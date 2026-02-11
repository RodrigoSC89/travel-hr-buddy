/**
 * MaintenanceCalendarView - Real data from maintenance_records
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Wrench, AlertTriangle, CheckCircle2, Clock, Ship, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/ui/UXStates";

const typeColors: Record<string, string> = {
  preventive: "bg-primary",
  corrective: "bg-destructive",
  predictive: "bg-accent",
  emergency: "bg-warning",
};

export function MaintenanceCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Record<string, unknown> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["maintenance-calendar"],
    queryFn: async () => {
      const [recResult, vesResult] = await Promise.all([
        supabase.from("maintenance_records")
          .select("id, title, description, maintenance_type, priority, status, scheduled_date, completed_date, estimated_duration, actual_duration, vessel_id, assigned_technician, cost_estimate")
          .order("scheduled_date"),
        supabase.from("vessels").select("id, name").order("name"),
      ]);
      if (recResult.error) throw recResult.error;
      if (vesResult.error) throw vesResult.error;
      const vesselMap = new Map((vesResult.data || []).map((v) => [v.id, v.name]));
      return (recResult.data || []).map((r) => ({
        ...r,
        vesselName: vesselMap.get(r.vessel_id) || "N/A",
        date: new Date(r.scheduled_date),
      }));
    },
    staleTime: 30000,
  });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-96" /></div>;

  const events = data || [];

  if (events.length === 0) {
    return <EmptyState icon={Calendar} title="Sem manutenções agendadas" message="Crie ordens de serviço para visualizar no calendário." />;
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const getEventsForDay = (day: Date) => events.filter((e) => isSameDay(e.date, day));

  const stats = {
    total: events.length,
    scheduled: events.filter((e) => e.status === "pending").length,
    inProgress: events.filter((e) => e.status === "in_progress").length,
    overdue: events.filter((e) => e.status !== "completed" && isBefore(e.date, new Date())).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></div><Wrench className="h-5 w-5 text-primary" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pendentes</p><p className="text-2xl font-bold text-primary">{stats.scheduled}</p></div><Clock className="h-5 w-5 text-primary" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Em Andamento</p><p className="text-2xl font-bold text-warning">{stats.inProgress}</p></div><Wrench className="h-5 w-5 text-warning" /></div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Atrasadas</p><p className="text-2xl font-bold text-destructive">{stats.overdue}</p></div><AlertTriangle className="h-5 w-5 text-destructive" /></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Calendário de Manutenções</CardTitle>
            <CardDescription>{events.length} registros</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <h3 className="text-lg font-semibold capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h3>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>
            ))}
            {/* Offset for first day of month */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[70px] p-1 border rounded-lg cursor-pointer transition-colors ${isToday(day) ? "bg-primary/5 border-primary" : "hover:bg-muted/50"}`}
                  onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-primary" : ""}`}>{format(day, "d")}</div>
                  {dayEvents.slice(0, 2).map((ev) => (
                    <div key={ev.id} className={`text-xs px-1 py-0.5 rounded truncate ${typeColors[ev.maintenance_type] || "bg-primary"} text-white`}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-xs text-muted-foreground px-1">+{dayEvents.length - 2}</div>}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Legenda:</span>
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div className={`h-3 w-3 rounded ${color}`} />
                <span className="text-xs capitalize">{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{String(selectedEvent.title ?? "")}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Ship className="h-4 w-4" />{String(selectedEvent.vesselName ?? "")}
                    </CardDescription>
                  </div>
                  <Badge variant={selectedEvent.status === "completed" ? "default" : "secondary"}>{String(selectedEvent.status ?? "")}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Data</p><p className="font-medium">{format(selectedEvent.date as Date, "dd/MM/yyyy")}</p></div>
                  <div><p className="text-muted-foreground">Duração Est.</p><p className="font-medium">{String(selectedEvent.estimated_duration ?? "?")}h</p></div>
                  <div><p className="text-muted-foreground">Tipo</p><p className="font-medium capitalize">{String(selectedEvent.maintenance_type ?? "")}</p></div>
                  <div><p className="text-muted-foreground">Responsável</p><p className="font-medium">{String(selectedEvent.assigned_technician ?? "N/A")}</p></div>
                </div>
                <Button variant="ghost" className="mt-4" onClick={() => setSelectedEvent(null)}>Fechar</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MaintenanceCalendarView;
