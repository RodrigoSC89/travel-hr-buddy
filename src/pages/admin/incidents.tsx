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
  incident_type: string;
  severity: string;
  description: string | null;
  location: string | null;
  metadata: unknown;
  occurred_at: string;
  created_at: string;
  resolution_notes: string | null;
  resolved_at: string | null;
  vessel_id: string | null;
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
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setIncidents((data || []) as Incident[]);
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
                  const severityColor = incident.severity === "critical" ? "#dc2626" : 
                    incident.severity === "high" ? "#ca8a04" : "#2563eb";
                  const badgeVariant = incident.severity === "critical" ? "destructive" as const : 
                    incident.severity === "high" ? "secondary" as const : "default" as const;
                  return (
                    <Card key={incident.id} className="border-l-4" style={{ borderLeftColor: severityColor }}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={badgeVariant}>
                                {incident.severity.toUpperCase()}
                              </Badge>
                              <span className="font-semibold text-sm">
                                {incident.incident_type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(incident.occurred_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{incident.description || "Sem descrição"}</p>
                            {incident.location && (
                              <p className="text-xs text-muted-foreground">📍 {incident.location}</p>
                            )}
                            {incident.metadata != null && typeof incident.metadata === "object" ? (
                              <details className="text-xs">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                  Metadados
                                </summary>
                                <pre className="mt-2 p-2 bg-muted rounded-md overflow-x-auto">
                                  {JSON.stringify(incident.metadata, null, 2)}
                                </pre>
                              </details>
                            ) : null}
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
