/**
 * CrewOvertimeTracker - MLC 2006 Work/Rest Hours Monitor
 * Tracks overtime and rest hour compliance per crew member
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2, Users } from "lucide-react";

export function CrewOvertimeTracker() {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["crew-overtime-records"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data } = await supabase
        .from("mlc_work_rest_records")
        .select("id, crew_member_id, record_date, work_hours, rest_hours, has_violation, violation_type")
        .gte("record_date", sevenDaysAgo.toISOString().split("T")[0])
        .order("record_date", { ascending: false })
        .limit(200);
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: crewMap = {} } = useQuery({
    queryKey: ["crew-names-map"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crew_members")
        .select("id, full_name, rank");
      const map: Record<string, { name: string; rank: string }> = {};
      (data || []).forEach(c => { map[c.id] = { name: c.full_name || "N/A", rank: c.rank || "" }; });
      return map;
    },
    staleTime: 120000,
  });

  // Aggregate by crew member
  const crewSummaries = Object.entries(
    records.reduce<Record<string, { totalWork: number; totalRest: number; days: number; violations: number }>>((acc, r) => {
      const id = r.crew_member_id;
      if (!id) return acc;
      if (!acc[id]) acc[id] = { totalWork: 0, totalRest: 0, days: 0, violations: 0 };
      acc[id].totalWork += r.work_hours || 0;
      acc[id].totalRest += r.rest_hours || 0;
      acc[id].days += 1;
      if (r.has_violation) {
        acc[id].violations += 1;
      }
      return acc;
    }, {})
  )
    .map(([id, stats]) => ({
      id,
      name: crewMap[id]?.name || id.slice(0, 8),
      rank: crewMap[id]?.rank || "",
      avgWorkPerDay: stats.days > 0 ? Math.round((stats.totalWork / stats.days) * 10) / 10 : 0,
      avgRestPerDay: stats.days > 0 ? Math.round((stats.totalRest / stats.days) * 10) / 10 : 0,
      violations: stats.violations,
      days: stats.days,
    }))
    .sort((a, b) => b.violations - a.violations || b.avgWorkPerDay - a.avgWorkPerDay)
    .slice(0, 10);

  const totalViolations = crewSummaries.reduce((s, c) => s + c.violations, 0);
  const compliantCrew = crewSummaries.filter(c => c.violations === 0).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Monitor Work/Rest MLC 2006
          <Badge variant="outline" className="ml-auto text-[10px]">
            Últimos 7 dias
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Users className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
            <p className="text-lg font-bold mt-1">{crewSummaries.length}</p>
            <p className="text-[10px] text-muted-foreground">Monitorados</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/10">
            <CheckCircle2 className="h-3.5 w-3.5 mx-auto text-success" />
            <p className="text-lg font-bold mt-1 text-success">{compliantCrew}</p>
            <p className="text-[10px] text-muted-foreground">Conformes</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-destructive/10">
            <AlertTriangle className="h-3.5 w-3.5 mx-auto text-destructive" />
            <p className="text-lg font-bold mt-1 text-destructive">{totalViolations}</p>
            <p className="text-[10px] text-muted-foreground">Violações</p>
          </div>
        </div>

        {/* Crew List */}
        {crewSummaries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum registro de trabalho/descanso nos últimos 7 dias
          </p>
        ) : (
          <div className="space-y-2 max-h-[240px] overflow-y-auto">
            {crewSummaries.map((crew) => (
              <div key={crew.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{crew.name}</p>
                  <p className="text-[10px] text-muted-foreground">{crew.rank} • {crew.days}d registros</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <span className={crew.avgWorkPerDay > 14 ? "text-destructive font-bold" : "text-foreground"}>
                      {crew.avgWorkPerDay}h/d
                    </span>
                    <p className="text-[10px] text-muted-foreground">trabalho</p>
                  </div>
                  <div className="text-right">
                    <span className={crew.avgRestPerDay < 10 ? "text-destructive font-bold" : "text-success"}>
                      {crew.avgRestPerDay}h/d
                    </span>
                    <p className="text-[10px] text-muted-foreground">descanso</p>
                  </div>
                  {crew.violations > 0 ? (
                    <Badge variant="destructive" className="text-[10px] h-5">
                      {crew.violations}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] h-5 text-success border-success/30">
                      OK
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CrewOvertimeTracker;
