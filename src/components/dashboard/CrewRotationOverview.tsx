/**
 * CrewRotationOverview - Crew rotation timeline showing upcoming sign-on/off
 * Uses crew_changes (planned_date, port, sign_on_count, sign_off_count) + crew_members (contract_end)
 */
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ArrowUpCircle, ArrowDownCircle, Calendar, Ship } from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";

export function CrewRotationOverview() {
  const { data: crewChanges = [], isLoading } = useQuery({
    queryKey: ["crew-rotation-overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_changes")
        .select("id, vessel_name, planned_date, status, port, sign_on_count, sign_off_count")
        .gte("planned_date", new Date().toISOString().split("T")[0])
        .order("planned_date")
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const { data: crewMembers = [] } = useQuery({
    queryKey: ["crew-rotation-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, contract_end, vessel_id, status")
        .not("contract_end", "is", null)
        .order("contract_end");
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  const rotationData = useMemo(() => {
    const expiringContracts = crewMembers
      .filter(c => c.contract_end)
      .map(c => {
        const endDate = parseISO(c.contract_end!);
        const daysLeft = differenceInDays(endDate, new Date());
        return { ...c, daysLeft, endDate };
      })
      .filter(c => c.daysLeft >= 0 && c.daysLeft <= 90)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const totalSignOns = crewChanges.reduce((acc, c) => acc + (c.sign_on_count || 0), 0);
    const totalSignOffs = crewChanges.reduce((acc, c) => acc + (c.sign_off_count || 0), 0);
    const critical = expiringContracts.filter(c => c.daysLeft <= 14).length;
    const warning = expiringContracts.filter(c => c.daysLeft > 14 && c.daysLeft <= 30).length;

    return { expiringContracts, totalSignOns, totalSignOffs, critical, warning };
  }, [crewMembers, crewChanges]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Crew Rotation Overview
          </CardTitle>
          <div className="flex gap-1.5">
            {rotationData.critical > 0 && (
              <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive">
                {rotationData.critical} críticos
              </Badge>
            )}
            {rotationData.warning > 0 && (
              <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning">
                {rotationData.warning} atenção
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {crewChanges.length} crew changes
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upcoming Crew Changes */}
        {crewChanges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Próximas Movimentações</h4>
            <div className="space-y-1.5">
              {crewChanges.slice(0, 6).map((change) => {
                const schedDate = change.planned_date ? parseISO(change.planned_date) : null;
                const daysUntil = schedDate ? differenceInDays(schedDate, new Date()) : null;
                return (
                  <div key={change.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/20">
                    <Ship className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {change.vessel_name} — {change.port}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {schedDate ? format(schedDate, "dd/MM/yyyy") : "—"}
                        {daysUntil !== null && ` • em ${daysUntil}d`}
                        {" • "}
                        <span className="text-success">↑{change.sign_on_count || 0}</span>
                        {" "}
                        <span className="text-warning">↓{change.sign_off_count || 0}</span>
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${
                      change.status === "confirmed" ? "bg-success/10 text-success" :
                      change.status === "completed" ? "bg-info/10 text-info" :
                      "bg-warning/10 text-warning"
                    }`}>
                      {change.status || "pendente"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expiring Contracts */}
        {rotationData.expiringContracts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contratos Expirando (90 dias)</h4>
            <div className="space-y-1.5">
              {rotationData.expiringContracts.slice(0, 8).map((crew) => (
                <div key={crew.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/20">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    crew.daysLeft <= 14 ? "bg-destructive" : crew.daysLeft <= 30 ? "bg-warning" : "bg-success"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{crew.full_name}</p>
                    <p className="text-[10px] text-muted-foreground">{crew.rank || "N/A"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-semibold ${
                      crew.daysLeft <= 14 ? "text-destructive" : crew.daysLeft <= 30 ? "text-warning" : "text-muted-foreground"
                    }`}>
                      {crew.daysLeft}d
                    </p>
                    <p className="text-[10px] text-muted-foreground">{format(crew.endDate, "dd/MM")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {crewChanges.length === 0 && rotationData.expiringContracts.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
            Nenhuma rotação programada nos próximos 90 dias.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CrewRotationOverview;
