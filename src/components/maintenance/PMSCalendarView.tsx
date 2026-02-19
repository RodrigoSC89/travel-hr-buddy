/**
 * PMS Calendar View - Drag-drop maintenance scheduling with conflict detection
 * Supera AMOS DNV calendar
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Calendar, Wrench, AlertTriangle, ChevronLeft, ChevronRight,
  Clock, Ship, CheckCircle, XCircle, Gauge
} from "lucide-react";
import { detectConflicts, type ScheduleConflict } from "@/services/pms-scheduling";

interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  jobs: PMSJob[];
  totalHours: number;
  hasConflict: boolean;
}

interface PMSJob {
  id: string;
  title: string;
  component: string;
  priority: "critical" | "high" | "medium" | "low";
  status: string;
  estimated_hours: number;
  scheduled_date: string;
  vessel_name?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-warning/20 text-warning border-warning/30",
  medium: "bg-info/20 text-info border-info/30",
  low: "bg-muted text-muted-foreground border-border",
};

export function PMSCalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: workOrders = [] } = useQuery({
    queryKey: ["pms-calendar-jobs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pms_work_orders")
        .select("*, pms_jobs(title, priority, interval_hours), pms_components(component_name)")
        .in("status", ["planned", "approved", "in_progress", "pending_parts"])
        .order("scheduled_date", { ascending: true });
      return data || [];
    },
  });

  const jobs: PMSJob[] = useMemo(() => {
    return workOrders.map((wo: Record<string, unknown>) => {
      const job = wo.pms_jobs as Record<string, unknown> | null;
      const comp = wo.pms_components as Record<string, unknown> | null;
      return {
        id: String(wo.id),
        title: String(job?.title || wo.work_order_number || "Job"),
        component: String(comp?.component_name || "Unknown"),
        priority: String(job?.priority || "medium") as PMSJob["priority"],
        status: String(wo.status || "planned"),
        estimated_hours: Number(wo.estimated_hours || 4),
        scheduled_date: String(wo.scheduled_date || "").split("T")[0],
        vessel_name: String(wo.vessel_id || "").slice(0, 8),
      };
    });
  }, [workOrders]);

  // Detect conflicts
  const conflicts = useMemo(() => {
    const mapped = jobs.map(j => ({
      id: j.id,
      title: j.title,
      component_name: j.component,
      vessel_id: j.vessel_name || "",
      priority: j.priority,
      status: j.status as "pending",
      scheduled_date: j.scheduled_date,
      due_date: j.scheduled_date,
      estimated_hours: j.estimated_hours,
    }));
    return detectConflicts(mapped);
  }, [jobs]);

  const conflictJobIds = useMemo(() => {
    const ids = new Set<string>();
    conflicts.forEach(c => { ids.add(c.job_a); ids.add(c.job_b); });
    return ids;
  }, [conflicts]);

  // Build calendar grid
  const calendarDays: CalendarDay[] = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const today = new Date().toISOString().split("T")[0];

    const days: CalendarDay[] = [];

    // Previous month filler
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const ds = d.toISOString().split("T")[0];
      days.push({ date: d, dateStr: ds, isCurrentMonth: false, isToday: false, jobs: [], totalHours: 0, hasConflict: false });
    }

    // Current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      const ds = d.toISOString().split("T")[0];
      const dayJobs = jobs.filter(j => j.scheduled_date === ds);
      const totalHours = dayJobs.reduce((s, j) => s + j.estimated_hours, 0);
      const hasConflict = dayJobs.some(j => conflictJobIds.has(j.id));
      days.push({ date: d, dateStr: ds, isCurrentMonth: true, isToday: ds === today, jobs: dayJobs, totalHours, hasConflict });
    }

    // Next month filler
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const ds = d.toISOString().split("T")[0];
      days.push({ date: d, dateStr: ds, isCurrentMonth: false, isToday: false, jobs: [], totalHours: 0, hasConflict: false });
    }

    return days;
  }, [currentMonth, jobs, conflictJobIds]);

  const monthLabel = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> PMS Calendar
        </h3>
        <div className="flex items-center gap-2">
          {conflicts.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />{conflicts.length} conflicts
            </Badge>
          )}
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-sm capitalize min-w-[160px] text-center">{monthLabel}</span>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conflict alerts */}
      {conflicts.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 space-y-2">
            {conflicts.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{c.description}</p>
                  <p className="text-muted-foreground">{c.suggested_resolution}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-2">
          <div className="grid grid-cols-7 gap-0.5">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
            {calendarDays.map(day => (
              <div
                key={day.dateStr}
                className={`
                  min-h-[80px] p-1 rounded-md border transition-all
                  ${day.isCurrentMonth ? "bg-background" : "bg-muted/20 opacity-50"}
                  ${day.isToday ? "ring-2 ring-primary/50 border-primary/30" : "border-border/30"}
                  ${day.hasConflict ? "border-destructive/50 bg-destructive/5" : ""}
                  ${day.totalHours > 12 ? "border-warning/50" : ""}
                `}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-medium ${day.isToday ? "text-primary" : day.isCurrentMonth ? "" : "text-muted-foreground"}`}>
                    {day.date.getDate()}
                  </span>
                  {day.totalHours > 0 && (
                    <span className={`text-[10px] ${day.totalHours > 12 ? "text-warning" : "text-muted-foreground"}`}>
                      {day.totalHours}h
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {day.jobs.slice(0, 3).map(job => (
                    <div
                      key={job.id}
                      className={`text-[10px] px-1 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 ${PRIORITY_COLORS[job.priority]}`}
                      title={`${job.title} (${job.component}) - ${job.estimated_hours}h`}
                    >
                      <Wrench className="h-2.5 w-2.5 inline mr-0.5" />
                      {job.title}
                    </div>
                  ))}
                  {day.jobs.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{day.jobs.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {Object.entries(PRIORITY_COLORS).map(([key, cls]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded border ${cls}`} />
            <span className="capitalize">{key}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border border-destructive/50 bg-destructive/10" />
          <span>Conflict</span>
        </div>
      </div>
    </div>
  );
}
