/**
 * AuditCountdownCards - Countdown to next scheduled audits
 * Shows days remaining per framework with urgency indicators
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Shield } from "lucide-react";
import { differenceInDays, format } from "date-fns";

interface AuditRecord {
  id: string;
  audit_type: string;
  status: string;
  scheduled_date?: string | null;
  created_at: string;
}

export function AuditCountdownCards() {
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["audit-countdown"],
    queryFn: async () => {
      const { data } = await supabase
        .from("internal_audits")
        .select("id, audit_type, status, scheduled_date, created_at")
        .in("status", ["planned", "in_progress", "scheduled"])
        .order("scheduled_date", { ascending: true })
        .limit(50);
      return (data || []) as AuditRecord[];
    },
    staleTime: 60000,
  });

  const now = new Date();

  // Group by audit_type, pick the nearest scheduled date
  const frameworkMap = new Map<string, { date: Date; status: string; id: string }>();
  audits.forEach((a) => {
    const dateStr = a.scheduled_date || a.created_at;
    const date = new Date(dateStr);
    const existing = frameworkMap.get(a.audit_type);
    if (!existing || date < existing.date) {
      frameworkMap.set(a.audit_type, { date, status: a.status, id: a.id });
    }
  });

  const countdowns = Array.from(frameworkMap.entries())
    .map(([type, info]) => {
      const daysLeft = differenceInDays(info.date, now);
      return {
        framework: type.toUpperCase().replace(/_/g, " "),
        date: info.date,
        daysLeft,
        status: info.status,
        urgency: daysLeft < 0 ? "overdue" : daysLeft <= 14 ? "critical" : daysLeft <= 30 ? "warning" : "ok",
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 8);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          Countdown de Auditorias
          <Badge variant="outline" className="ml-auto text-[10px]">
            {countdowns.length} agendadas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {countdowns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma auditoria agendada. Planeje suas próximas auditorias.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {countdowns.map((item) => (
              <div
                key={item.framework}
                className={`p-3 rounded-lg border transition-colors ${
                  item.urgency === "overdue"
                    ? "bg-destructive/10 border-destructive/30"
                    : item.urgency === "critical"
                    ? "bg-warning/10 border-warning/30"
                    : item.urgency === "warning"
                    ? "bg-accent/10 border-accent/30"
                    : "bg-muted/30 border-border/50"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] font-medium truncate">{item.framework}</span>
                </div>
                <p className={`text-xl font-bold ${
                  item.urgency === "overdue"
                    ? "text-destructive"
                    : item.urgency === "critical"
                    ? "text-warning"
                    : "text-foreground"
                }`}>
                  {item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d atrasada` : `${item.daysLeft}d`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {format(item.date, "dd/MM/yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AuditCountdownCards;
