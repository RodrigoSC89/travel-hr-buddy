/**
 * System Events Panel - Real-time cross-module event monitoring
 * Integrates useSystemEvents for Command Hub overview
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSystemEvents } from "@/hooks/useSystemEvents";
import { 
  Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, 
  Ship, Wrench, Shield, FileText, Users, Zap, Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const EVENT_ICONS: Record<string, typeof Activity> = {
  voyage: Ship,
  maintenance: Wrench,
  certificate: Shield,
  compliance: Shield,
  crew: Users,
  document: FileText,
  default: Zap,
};

const PRIORITY_STYLES: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-warning/10 text-warning border-warning/30",
  medium: "bg-primary/10 text-primary border-primary/30",
  low: "bg-muted text-muted-foreground border-border",
};

function getEventIcon(eventType: string) {
  const key = Object.keys(EVENT_ICONS).find(k => eventType.includes(k));
  return key ? EVENT_ICONS[key] : EVENT_ICONS.default;
}

export default function SystemEventsPanel() {
  const { recentEvents, isProcessing, processEvents } = useSystemEvents();
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const filteredEvents = filterPriority === "all" 
    ? recentEvents 
    : recentEvents.filter(e => e.priority === filterPriority);

  const criticalCount = recentEvents.filter(e => e.priority === "critical").length;
  const highCount = recentEvents.filter(e => e.priority === "high").length;
  const unprocessedCount = recentEvents.filter(e => !e.processed).length;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Sistema Nervoso Central</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount} críticos
              </Badge>
            )}
            {highCount > 0 && (
              <Badge className="bg-warning/10 text-warning border-warning/30">
                {highCount} altos
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={processEvents}
              disabled={isProcessing}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              {unprocessedCount > 0 ? `Processar (${unprocessedCount})` : 'Processar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {["all", "critical", "high", "medium", "low"].map(p => (
            <Button
              key={p}
              variant={filterPriority === p ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setFilterPriority(p)}
            >
              {p === "all" ? "Todos" : p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>

        {/* Events Timeline */}
        <ScrollArea className="h-[320px]">
          <div className="space-y-2 pr-3">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum evento registrado</p>
                <p className="text-xs">Eventos cross-module aparecerão aqui em tempo real</p>
              </div>
            ) : (
              filteredEvents.slice(0, 20).map((event) => {
                const Icon = getEventIcon(event.event_type);
                const priorityStyle = PRIORITY_STYLES[event.priority] || PRIORITY_STYLES.low;
                
                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${priorityStyle} transition-colors`}
                  >
                    <div className="mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        {event.processed ? (
                          <CheckCircle className="h-3 w-3 text-success shrink-0" />
                        ) : (
                          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {event.source_module} • {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {event.priority}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Stats Footer */}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span>{recentEvents.length} eventos totais</span>
          <span>{recentEvents.filter(e => e.processed).length} processados</span>
        </div>
      </CardContent>
    </Card>
  );
}
