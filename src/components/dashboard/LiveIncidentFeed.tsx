/**
 * Live Incident Feed - Real-time SOC alerts + non-conformities feed
 * Queries soc_alerts and non_conformities for live operational awareness
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useMemo } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface IncidentEvent {
  id: string;
  title: string;
  severity: string;
  status: string;
  source: "soc" | "nc";
  timestamp: string;
}

export function LiveIncidentFeed() {
  const { data: socAlerts = [] } = useQuery({
    queryKey: ["live-incident-soc"],
    queryFn: async () => {
      const { data } = await supabase
        .from("soc_alerts")
        .select("id, title, severity, is_acknowledged, resolved_at, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const { data: ncs = [] } = useQuery({
    queryKey: ["live-incident-nc"],
    queryFn: async () => {
      const { data } = await supabase
        .from("non_conformities")
        .select("id, title, severity, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const events: IncidentEvent[] = useMemo(() => {
    const all: IncidentEvent[] = [
      ...socAlerts.map((a) => ({
        id: a.id,
        title: a.title,
        severity: a.severity,
        status: a.resolved_at ? "resolved" : a.is_acknowledged ? "acknowledged" : "open",
        source: "soc" as const,
        timestamp: a.created_at,
      })),
      ...ncs.map((n) => ({
        id: n.id,
        title: n.title || "Non-Conformity",
        severity: n.severity || "medium",
        status: n.status || "open",
        source: "nc" as const,
        timestamp: n.created_at || new Date().toISOString(),
      })),
    ];
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 12);
  }, [socAlerts, ncs]);

  const stats = useMemo(() => {
    const open = events.filter((e) => e.status === "open" || e.status === "new" || e.status === "active").length;
    const critical = events.filter((e) => e.severity === "critical" || e.severity === "high").length;
    const resolved = events.filter((e) => e.status === "resolved" || e.status === "closed").length;
    return { total: events.length, open, critical, resolved };
  }, [events]);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical": return "text-destructive";
      case "high": return "text-warning";
      case "medium": return "text-info";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return <CheckCircle2 className="h-3 w-3 text-success" />;
      case "open":
      case "new":
      case "active":
        return <XCircle className="h-3 w-3 text-destructive" />;
      default:
        return <Clock className="h-3 w-3 text-warning" />;
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-destructive" />
            Incidentes em Tempo Real
            {stats.critical > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
              </span>
            )}
          </CardTitle>
          <div className="flex gap-1.5">
            {stats.open > 0 && (
              <Badge variant="destructive" className="text-[10px]">{stats.open} abertos</Badge>
            )}
            <Badge variant="outline" className="text-[10px]">{stats.total} total</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-destructive/10">
            <div className="text-sm font-bold text-destructive">{stats.critical}</div>
            <div className="text-[10px] text-muted-foreground">Críticos</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-warning/10">
            <div className="text-sm font-bold text-warning">{stats.open}</div>
            <div className="text-[10px] text-muted-foreground">Abertos</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-success/10">
            <div className="text-sm font-bold text-success">{stats.resolved}</div>
            <div className="text-[10px] text-muted-foreground">Resolvidos</div>
          </div>
        </div>

        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">✅ Nenhum incidente recente</p>
          ) : (
            events.map((e) => (
              <div key={`${e.source}-${e.id}`} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/20 text-xs">
                <div className="shrink-0 mt-0.5">
                  <AlertTriangle className={`h-3.5 w-3.5 ${getSeverityColor(e.severity)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{e.title}</div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                    {getStatusIcon(e.status)}
                    <span>{e.status}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {e.source === "soc" ? "SOC" : "NC"}
                    </Badge>
                    <span>•</span>
                    <span>{formatDistanceToNow(parseISO(e.timestamp), { addSuffix: true, locale: ptBR })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveIncidentFeed;
