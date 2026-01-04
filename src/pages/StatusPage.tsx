/**
 * Status Page - Real-time System Status
 * Shows component status, incidents, and uptime history
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Wrench,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface StatusComponent {
  id: string;
  name: string;
  description: string | null;
  status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
  display_order: number;
}

interface Incident {
  id: string;
  title: string;
  description: string | null;
  status: "investigating" | "identified" | "monitoring" | "resolved" | "scheduled";
  severity: "p0_critical" | "p1_high" | "p2_medium" | "p3_low" | "maintenance";
  affected_components: string[] | null;
  started_at: string;
  resolved_at: string | null;
  created_at: string;
}

interface IncidentUpdate {
  id: string;
  incident_id: string;
  status: string;
  message: string;
  created_at: string;
}

const STATUS_CONFIG = {
  operational: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500", label: "Operacional" },
  degraded: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500", label: "Degradado" },
  partial_outage: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500", label: "Interrupção Parcial" },
  major_outage: { icon: XCircle, color: "text-red-500", bg: "bg-red-500", label: "Interrupção Total" },
  maintenance: { icon: Wrench, color: "text-blue-500", bg: "bg-blue-500", label: "Manutenção" },
};

const INCIDENT_STATUS_CONFIG = {
  investigating: { color: "bg-yellow-500", label: "Investigando" },
  identified: { color: "bg-orange-500", label: "Identificado" },
  monitoring: { color: "bg-blue-500", label: "Monitorando" },
  resolved: { color: "bg-green-500", label: "Resolvido" },
  scheduled: { color: "bg-purple-500", label: "Agendado" },
};

const SEVERITY_CONFIG = {
  p0_critical: { color: "bg-red-600", label: "P0 - Crítico" },
  p1_high: { color: "bg-orange-500", label: "P1 - Alto" },
  p2_medium: { color: "bg-yellow-500", label: "P2 - Médio" },
  p3_low: { color: "bg-blue-500", label: "P3 - Baixo" },
  maintenance: { color: "bg-purple-500", label: "Manutenção" },
};

export default function StatusPage() {
  const [components, setComponents] = useState<StatusComponent[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentUpdates, setIncidentUpdates] = useState<Record<string, IncidentUpdate[]>>({});
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch components
      const { data: componentsData } = await supabase
        .from("status_components" as any)
        .select("*")
        .order("display_order");

      // Fetch recent incidents (last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data: incidentsData } = await supabase
        .from("status_incidents" as any)
        .select("*")
        .gte("started_at", thirtyDaysAgo)
        .order("started_at", { ascending: false });

      // Fetch all updates for these incidents
      const incidents = (incidentsData as unknown as Incident[]) || [];
      if (incidents.length > 0) {
        const incidentIds = incidents.map((i) => i.id);
        const { data: updatesData } = await supabase
          .from("status_incident_updates" as any)
          .select("*")
          .in("incident_id", incidentIds)
          .order("created_at", { ascending: false });

        // Group updates by incident_id
        const groupedUpdates: Record<string, IncidentUpdate[]> = {};
        (updatesData as any[] || []).forEach((update) => {
          if (!groupedUpdates[update.incident_id]) {
            groupedUpdates[update.incident_id] = [];
          }
          groupedUpdates[update.incident_id].push({
            ...update,
            created_at: update.created_at || new Date().toISOString(),
          });
        });
        setIncidentUpdates(groupedUpdates);
      }

      setComponents((componentsData as unknown as StatusComponent[]) || []);
      setIncidents(incidents);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching status data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates
    const componentsChannel = supabase
      .channel("status-components-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "status_components" },
        () => fetchData()
      )
      .subscribe();

    const incidentsChannel = supabase
      .channel("status-incidents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "status_incidents" },
        () => fetchData()
      )
      .subscribe();

    const updatesChannel = supabase
      .channel("status-updates-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "status_incident_updates" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(componentsChannel);
      supabase.removeChannel(incidentsChannel);
      supabase.removeChannel(updatesChannel);
    };
  }, []);

  const getOverallStatus = () => {
    if (components.some((c) => c.status === "major_outage")) return "major_outage";
    if (components.some((c) => c.status === "partial_outage")) return "partial_outage";
    if (components.some((c) => c.status === "degraded")) return "degraded";
    if (components.some((c) => c.status === "maintenance")) return "maintenance";
    return "operational";
  };

  const overallStatus = getOverallStatus();
  const overallConfig = STATUS_CONFIG[overallStatus];
  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const resolvedIncidents = incidents.filter((i) => i.status === "resolved");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className={`${overallConfig.bg} py-8 text-white`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Nautilus One Status</h1>
              <p className="opacity-90">Status atual de todos os sistemas</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <overallConfig.icon className="w-8 h-8" />
                <span className="text-xl font-semibold">{overallConfig.label}</span>
              </div>
              <p className="text-sm opacity-75">
                Atualizado {formatDistanceToNow(lastUpdated, { locale: ptBR, addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Active Incidents */}
        {activeIncidents.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Incidentes Ativos ({activeIncidents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={SEVERITY_CONFIG[incident.severity].color}>
                          {SEVERITY_CONFIG[incident.severity].label}
                        </Badge>
                        <Badge variant="outline" className={INCIDENT_STATUS_CONFIG[incident.status].color + " text-white"}>
                          {INCIDENT_STATUS_CONFIG[incident.status].label}
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{incident.title}</h3>
                      {incident.description && (
                        <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedIncident(expandedIncident === incident.id ? null : incident.id)}
                    >
                      {expandedIncident === incident.id ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Iniciado {formatDistanceToNow(new Date(incident.started_at), { locale: ptBR, addSuffix: true })}
                    </span>
                    {incident.affected_components && incident.affected_components.length > 0 && (
                      <span>Afetando: {incident.affected_components.join(", ")}</span>
                    )}
                  </div>

                  {/* Timeline */}
                  {expandedIncident === incident.id && incidentUpdates[incident.id] && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-3">Timeline</h4>
                      <div className="space-y-3">
                        {incidentUpdates[incident.id].map((update) => (
                          <div key={update.id} className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                            <div>
                              <p className="text-sm font-medium">
                                {format(new Date(update.created_at), "HH:mm", { locale: ptBR })} -{" "}
                                {INCIDENT_STATUS_CONFIG[update.status as keyof typeof INCIDENT_STATUS_CONFIG]?.label || update.status}
                              </p>
                              <p className="text-sm text-muted-foreground">{update.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Components Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Componentes</CardTitle>
            <CardDescription>Status atual de cada serviço do Nautilus One</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {components.map((component) => {
                const config = STATUS_CONFIG[component.status];
                const Icon = config.icon;
                return (
                  <div
                    key={component.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div>
                      <h3 className="font-medium">{component.name}</h3>
                      {component.description && (
                        <p className="text-sm text-muted-foreground">{component.description}</p>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 ${config.color}`}>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{config.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Uptime Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Uptime (Últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {Array.from({ length: 30 }).map((_, i) => {
                const hasIncident = incidents.some((incident) => {
                  const incidentDate = new Date(incident.started_at);
                  const dayDate = subDays(new Date(), 29 - i);
                  return (
                    incidentDate.toDateString() === dayDate.toDateString() &&
                    incident.severity !== "p3_low"
                  );
                });
                return (
                  <div
                    key={i}
                    className={`h-8 flex-1 rounded-sm ${
                      hasIncident ? "bg-yellow-400" : "bg-green-400"
                    }`}
                    title={format(subDays(new Date(), 29 - i), "dd/MM/yyyy")}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>30 dias atrás</span>
              <span>Hoje</span>
            </div>
          </CardContent>
        </Card>

        {/* Past Incidents */}
        {resolvedIncidents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Incidentes Resolvidos</CardTitle>
              <CardDescription>Histórico dos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resolvedIncidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Resolvido
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(incident.started_at), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <h3 className="font-medium">{incident.title}</h3>
                      {incident.description && (
                        <p className="text-sm text-muted-foreground">{incident.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedIncident(expandedIncident === incident.id ? null : incident.id)}
                    >
                      {expandedIncident === incident.id ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>

                  {expandedIncident === incident.id && incidentUpdates[incident.id] && (
                    <div className="mt-3 pl-4 border-l-2">
                      {incidentUpdates[incident.id].map((update) => (
                        <div key={update.id} className="mb-2">
                          <p className="text-sm font-medium">
                            {format(new Date(update.created_at), "HH:mm dd/MM", { locale: ptBR })}
                          </p>
                          <p className="text-sm text-muted-foreground">{update.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-8">
          <p>Todas as datas estão em horário local (Brasília)</p>
          <p className="mt-2">
            <a href="/central-comando" className="text-primary hover:underline inline-flex items-center gap-1">
              Voltar ao Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
