/**
 * PATCH 1005 - Activity Timeline Component
 * Interactive timeline with historical events and filtering
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Filter,
  Search,
  Ship,
  User,
  Wrench,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type EventType = "vessel" | "crew" | "maintenance" | "document" | "alert" | "system";
type EventSeverity = "info" | "success" | "warning" | "error";

interface TimelineEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  timestamp: Date;
  severity: EventSeverity;
  metadata?: Record<string, unknown>;
  user?: string;
}

const EVENT_ICONS: Record<EventType, React.ReactNode> = {
  vessel: <Ship className="h-4 w-4" />,
  crew: <User className="h-4 w-4" />,
  maintenance: <Wrench className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  alert: <AlertTriangle className="h-4 w-4" />,
  system: <Activity className="h-4 w-4" />,
};

const SEVERITY_STYLES: Record<EventSeverity, string> = {
  info: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  success: "bg-green-500/10 text-green-500 border-green-500/30",
  warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  error: "bg-red-500/10 text-red-500 border-red-500/30",
};

const SEVERITY_ICONS: Record<EventSeverity, React.ReactNode> = {
  info: <Activity className="h-3 w-3" />,
  success: <CheckCircle2 className="h-3 w-3" />,
  warning: <AlertTriangle className="h-3 w-3" />,
  error: <XCircle className="h-3 w-3" />,
};

export function ActivityTimeline() {
  const [filter, setFilter] = useState<EventType | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<EventSeverity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["today"]));

  // Fetch events from multiple sources
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["timeline-events"],
    queryFn: async () => {
      const [auditRes, alertsRes, maintenanceRes] = await Promise.all([
        supabase
          .from("audit_logs")
          .select("id, action, resource_type, created_at, user_id, metadata")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("shared_alerts")
          .select("id, title, description, created_at")
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("maintenance_schedules")
          .select("id, status, updated_at")
          .order("updated_at", { ascending: false })
          .limit(30),
      ]);

      const timelineEvents: TimelineEvent[] = [];

      // Map audit logs
      (auditRes.data || []).forEach((log) => {
        timelineEvents.push({
          id: `audit-${log.id}`,
          type: mapResourceToType(log.resource_type),
          title: formatAction(log.action),
          description: `${log.resource_type}: ${log.action}`,
          timestamp: new Date(log.created_at),
          severity: "info",
          metadata: log.metadata as Record<string, unknown>,
          user: log.user_id || undefined,
        });
      });

      // Map alerts
      (alertsRes.data || []).forEach((alert) => {
        timelineEvents.push({
          id: `alert-${alert.id}`,
          type: "alert",
          title: alert.title,
          description: alert.description || "",
          timestamp: new Date(alert.created_at || new Date()),
          severity: "warning",
        });
      });

      // Map maintenance
      (maintenanceRes.data || []).forEach((m) => {
        timelineEvents.push({
          id: `maintenance-${m.id}`,
          type: "maintenance",
          title: "Manutenção",
          description: `Status: ${m.status}`,
          timestamp: new Date(m.updated_at || new Date()),
          severity: m.status === "overdue" ? "error" : "info",
        });
      });

      return timelineEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
    refetchInterval: 30000,
  });

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filter !== "all" && event.type !== filter) return false;
      if (severityFilter !== "all" && event.severity !== severityFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [events, filter, severityFilter, searchQuery]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TimelineEvent[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    filteredEvents.forEach((event) => {
      if (isToday(event.timestamp)) {
        groups.today.push(event);
      } else if (isYesterday(event.timestamp)) {
        groups.yesterday.push(event);
      } else if (isThisWeek(event.timestamp)) {
        groups.thisWeek.push(event);
      } else {
        groups.older.push(event);
      }
    });

    return groups;
  }, [filteredEvents]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const groupLabels: Record<string, string> = {
    today: "Hoje",
    yesterday: "Ontem",
    thisWeek: "Esta Semana",
    older: "Anteriores",
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Timeline de Atividades
          </CardTitle>
          <Badge variant="outline">
            {filteredEvents.length} eventos
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={filter} onValueChange={(v) => setFilter(v as EventType | "all")}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="vessel">Embarcações</SelectItem>
              <SelectItem value="crew">Tripulação</SelectItem>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="document">Documentos</SelectItem>
              <SelectItem value="alert">Alertas</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as EventSeverity | "all")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <Activity className="h-5 w-5 animate-spin mr-2" />
              Carregando...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <p>Nenhum evento encontrado</p>
            </div>
          ) : (
            <div className="px-4 pb-4">
              {Object.entries(groupedEvents).map(([group, groupEvents]) => {
                if (groupEvents.length === 0) return null;
                const isExpanded = expandedGroups.has(group);

                return (
                  <div key={group} className="mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between mb-2 hover:bg-muted"
                      onClick={() => toggleGroup(group)}
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {groupLabels[group]}
                        <Badge variant="secondary" className="ml-1">
                          {groupEvents.length}
                        </Badge>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="relative pl-4 border-l-2 border-border ml-3 space-y-3">
                        {groupEvents.map((event) => (
                          <TimelineEventCard key={event.id} event={event} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  return (
    <div className="relative">
      {/* Timeline dot */}
      <div
        className={cn(
          "absolute -left-[21px] w-4 h-4 rounded-full border-2 flex items-center justify-center",
          SEVERITY_STYLES[event.severity]
        )}
      >
        {SEVERITY_ICONS[event.severity]}
      </div>

      <div
        className={cn(
          "p-3 rounded-lg border transition-colors hover:bg-muted/50",
          SEVERITY_STYLES[event.severity]
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {EVENT_ICONS[event.type]}
            </span>
            <span className="font-medium text-sm">{event.title}</span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(event.timestamp, { addSuffix: true, locale: ptBR })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {event.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {event.type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(event.timestamp, "HH:mm", { locale: ptBR })}
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function mapResourceToType(resource: string): EventType {
  const resourceMap: Record<string, EventType> = {
    vessel: "vessel",
    vessels: "vessel",
    crew: "crew",
    crew_member: "crew",
    maintenance: "maintenance",
    document: "document",
    alert: "alert",
  };
  return resourceMap[resource.toLowerCase()] || "system";
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    create: "Criação",
    update: "Atualização",
    delete: "Remoção",
    login: "Login",
    logout: "Logout",
  };
  return actionMap[action.toLowerCase()] || action;
}

function mapAlertSeverity(severity: string | null): EventSeverity {
  const severityMap: Record<string, EventSeverity> = {
    critical: "error",
    high: "error",
    medium: "warning",
    low: "info",
  };
  return severityMap[severity?.toLowerCase() || ""] || "info";
}

export default ActivityTimeline;
