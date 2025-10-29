/**
 * PATCH 546 – Incident Timeline Generator
 * Visual timeline component for incidents by module
 */

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Calendar, AlertCircle } from "lucide-react";
import html2canvas from "html2canvas";
import type { DPIncident } from "@/types/incident";

interface IncidentTimelineProps {
  moduleFilter?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface TimelineIncident extends DPIncident {
  module?: string;
}

const SEVERITY_CONFIG = {
  Alta: { color: "bg-red-600", label: "Alta", icon: "🔴" },
  Média: { color: "bg-yellow-600", label: "Média", icon: "🟡" },
  Baixa: { color: "bg-green-600", label: "Baixa", icon: "🟢" },
} as const;

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  moduleFilter,
  dateFrom,
  dateTo,
}) => {
  const [incidents, setIncidents] = useState<TimelineIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchIncidents();
  }, [moduleFilter, dateFrom, dateTo]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("dp_incidents")
        .select("*")
        .order("incident_date", { ascending: false });

      if (moduleFilter) {
        query = query.eq("vessel", moduleFilter);
      }

      if (dateFrom) {
        query = query.gte("incident_date", dateFrom);
      }

      if (dateTo) {
        query = query.lte("incident_date", dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Group and sort by severity
      const sortedData = (data || []).sort((a, b) => {
        const severityOrder = { Alta: 3, Média: 2, Baixa: 1 };
        return (
          severityOrder[b.severity as keyof typeof severityOrder] -
          severityOrder[a.severity as keyof typeof severityOrder]
        );
      });

      setIncidents(sortedData);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPNG = async () => {
    if (!timelineRef.current) return;

    try {
      setExporting(true);
      const canvas = await html2canvas(timelineRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const link = document.createElement("a");
      link.download = `incident-timeline-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error exporting timeline:", error);
    } finally {
      setExporting(false);
    }
  };

  const groupIncidentsByMonth = () => {
    const grouped: Record<string, TimelineIncident[]> = {};

    incidents.forEach((incident) => {
      const date = new Date(incident.incident_date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(incident);
    });

    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  };

  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <div className="text-muted-foreground">Carregando timeline...</div>
        </div>
      </Card>
    );
  }

  const groupedIncidents = groupIncidentsByMonth();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Incident Timeline</h2>
        </div>
        <Button
          onClick={exportToPNG}
          disabled={exporting || incidents.length === 0}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exportando..." : "Exportar PNG"}
        </Button>
      </div>

      <Card className="p-6" ref={timelineRef}>
        {incidents.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum incidente encontrado para os filtros selecionados
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedIncidents.map(([monthKey, monthIncidents]) => (
              <div key={monthKey} className="relative">
                <div className="sticky top-0 bg-background/95 backdrop-blur py-2 mb-4 border-b">
                  <h3 className="text-lg font-semibold capitalize">
                    {formatMonthYear(monthKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {monthIncidents.length} incidente(s)
                  </p>
                </div>

                <div className="space-y-4 relative pl-8">
                  {/* Timeline vertical line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

                  {monthIncidents.map((incident, idx) => {
                    const severityConfig =
                      SEVERITY_CONFIG[
                        incident.severity as keyof typeof SEVERITY_CONFIG
                      ];

                    return (
                      <div key={incident.id} className="relative">
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-[-1.375rem] top-2 w-4 h-4 rounded-full border-4 border-background ${severityConfig.color}`}
                        />

                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${severityConfig.color}`}
                                >
                                  {severityConfig.icon} {severityConfig.label}
                                </span>
                                {incident.vessel && (
                                  <span className="text-xs text-muted-foreground">
                                    {incident.vessel}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-semibold">
                                {incident.title || "Incidente sem título"}
                              </h4>

                              {incident.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {incident.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  {new Date(
                                    incident.incident_date
                                  ).toLocaleDateString("pt-BR")}
                                </span>
                                {incident.location && (
                                  <span>📍 {incident.location}</span>
                                )}
                                {incident.status && (
                                  <span className="capitalize">
                                    {incident.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
