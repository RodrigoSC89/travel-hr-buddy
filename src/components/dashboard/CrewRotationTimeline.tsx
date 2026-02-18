/**
 * Crew Rotation Timeline - Visual timeline of crew planning assignments
 * Queries crew_planning_assignments for rotation schedule visibility
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { useMemo } from "react";
import { differenceInDays, format, parseISO } from "date-fns";

export function CrewRotationTimeline() {
  const { data: assignments = [] } = useQuery({
    queryKey: ["crew-rotation-timeline"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crew_planning_assignments")
        .select("id, crew_member_id, vessel_id, position, embark_date, disembark_date, status")
        .order("embark_date", { ascending: true })
        .limit(100);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: vessels = [] } = useQuery({
    queryKey: ["crew-rotation-vessels"],
    queryFn: async () => {
      const { data } = await supabase.from("vessels").select("id, name").limit(50);
      return data || [];
    },
    staleTime: 120000,
  });

  const vesselMap = useMemo(() => {
    const m: Record<string, string> = {};
    vessels.forEach((v) => (m[v.id] = v.name));
    return m;
  }, [vessels]);

  const stats = useMemo(() => {
    const now = new Date();
    const active = assignments.filter((a) => a.status === "confirmed" || a.status === "active");
    const upcoming = assignments.filter((a) => {
      const start = parseISO(a.embark_date);
      return start > now && differenceInDays(start, now) <= 30;
    });
    const overdue = assignments.filter((a) => {
      if (!a.disembark_date) return false;
      const end = parseISO(a.disembark_date);
      return end < now && a.status !== "completed" && a.status !== "disembarked";
    });
    return { active: active.length, upcoming: upcoming.length, overdue: overdue.length, total: assignments.length };
  }, [assignments]);

  const visibleAssignments = useMemo(() => {
    const now = new Date();
    return assignments
      .filter((a) => {
        const start = parseISO(a.embark_date);
        return differenceInDays(now, start) < 90 || (a.disembark_date && parseISO(a.disembark_date) > now);
      })
      .slice(0, 8);
  }, [assignments]);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-info" />
            Rotação de Tripulação
          </CardTitle>
          <Badge variant="outline" className="text-xs">{stats.total} assignments</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-success/10">
            <div className="text-sm font-bold text-success">{stats.active}</div>
            <div className="text-[10px] text-muted-foreground">Ativos</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-info/10">
            <div className="text-sm font-bold text-info">{stats.upcoming}</div>
            <div className="text-[10px] text-muted-foreground">Próximos 30d</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-destructive/10">
            <div className="text-sm font-bold text-destructive">{stats.overdue}</div>
            <div className="text-[10px] text-muted-foreground">Atrasados</div>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {visibleAssignments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Nenhum planejamento de rotação encontrado</p>
          ) : (
            visibleAssignments.map((a) => {
              const now = new Date();
              const isActive = a.status === "confirmed" || a.status === "active";
              const isOverdue = a.disembark_date && parseISO(a.disembark_date) < now && a.status !== "completed";
              const daysLeft = a.disembark_date ? differenceInDays(parseISO(a.disembark_date), now) : null;

              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 p-2 rounded-lg border text-xs ${
                    isOverdue ? "border-destructive/30 bg-destructive/5" : "border-border/30 bg-muted/20"
                  }`}
                >
                  <div className="shrink-0">
                    {isOverdue ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    ) : isActive ? (
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {a.position || "Crew"} — {vesselMap[a.vessel_id || ""] || "Sem embarcação"}
                    </div>
                    <div className="text-muted-foreground">
                      {format(parseISO(a.embark_date), "dd/MM/yy")} →{" "}
                      {a.disembark_date ? format(parseISO(a.disembark_date), "dd/MM/yy") : "TBD"}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {daysLeft !== null && daysLeft >= 0 ? (
                      <Badge variant="outline" className="text-[10px]">{daysLeft}d</Badge>
                    ) : isOverdue ? (
                      <Badge variant="destructive" className="text-[10px]">Atrasado</Badge>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CrewRotationTimeline;
