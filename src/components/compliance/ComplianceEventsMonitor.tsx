/**
 * Compliance Events Monitor - Real-time compliance-related system events
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSystemEvents } from "@/hooks/useSystemEvents";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ComplianceEventsMonitor() {
  const { recentEvents } = useSystemEvents();

  // Filter only compliance-related events
  const complianceEvents = recentEvents.filter(e => 
    e.event_type.includes('certificate') ||
    e.event_type.includes('compliance') ||
    e.event_type.includes('audit') ||
    e.event_type.includes('inspection') ||
    e.source_module.includes('compliance')
  );

  const criticalCount = complianceEvents.filter(e => e.priority === 'critical').length;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Eventos de Compliance</CardTitle>
          </div>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalCount} críticos
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px]">
          <div className="space-y-2 pr-3">
            {complianceEvents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum evento de compliance recente</p>
                <p className="text-xs">Certificados vencendo e auditorias aparecerão aqui</p>
              </div>
            ) : (
              complianceEvents.slice(0, 15).map(event => (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border ${
                    event.priority === 'critical' ? 'bg-destructive/5 border-destructive/20' :
                    event.priority === 'high' ? 'bg-warning/5 border-warning/20' :
                    'bg-muted/50 border-border'
                  }`}
                >
                  {event.priority === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  ) : event.processed ? (
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
