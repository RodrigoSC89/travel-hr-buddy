import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from "@/lib/logger";

interface Incident {
  id: string;
  module: string;
  severity: "info" | "warning" | "critical";
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  created_at: string;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial incidents
    loadIncidents();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("incidents-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "incidents",
        },
        (payload) => {
          setIncidents((prev) => [payload.new as Incident, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadIncidents = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      logger.error("Error loading incidents", { error });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityVariant = (
    severity: string
  ): "default" | "secondary" | "destructive" => {
    switch (severity) {
    case "critical":
      return "destructive";
    case "warning":
      return "secondary";
    default:
      return "default";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Painel de Incidentes
            {incidents.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {incidents.length} registros
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitoramento em tempo real de incidentes do sistema
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                Nenhum incidente registrado
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {incidents.map((incident) => {
                  const borderColor = incident.severity === "critical" ? "#dc2626" : 
                    incident.severity === "warning" ? "#ca8a04" : "#2563eb";
                  return (
                    <Card key={incident.id} className="border-l-4" style={{ borderLeftColor: borderColor }}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={getSeverityVariant(incident.severity)}>
                                {incident.severity.toUpperCase()}
                              </Badge>
                              <span className="font-semibold text-sm">
                                {incident.module}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(incident.timestamp), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{incident.message}</p>
                            {incident.metadata && Object.keys(incident.metadata).length > 0 && (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  Metadados
                                </summary>
                                <pre className="mt-2 p-2 bg-muted rounded-md overflow-x-auto">
                                  {JSON.stringify(incident.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
