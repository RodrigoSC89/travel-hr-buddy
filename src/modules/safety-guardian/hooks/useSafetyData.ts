/**
 * Safety Guardian Data Hook
 * Hook para gerenciamento de dados de segurança com Supabase
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { 
  SafetyIncident, 
  SafetyMetrics, 
  SafetyAlert, 
  SafetyFilter,
  DDSRecord 
} from "../types";

// Demo data for fallback
const demoMetrics: SafetyMetrics = {
  daysWithoutLTI: 127,
  totalIncidentsYTD: 31,
  nearMissesYTD: 72,
  unsafeConditionsYTD: 98,
  trir: 0.42,
  trirTarget: 0.50,
  ddsCompliance: 98,
  totalDDS: 1248,
  openInvestigations: 5,
  pendingActions: 12,
  trainingCompliance: 94,
  criticalAlerts: 2,
};

const demoIncidents: SafetyIncident[] = [
  {
    id: "INC-2024-089",
    type: "near_miss",
    title: "Quase queda de objeto em área de convés",
    description: "Durante operação de carga, uma caixa quase caiu do guincho. A equipe agiu rapidamente evitando acidente.",
    vessel_name: "PSV Atlantic Explorer",
    location: "Convés principal",
    incident_date: "2024-08-15",
    reporter_name: "Carlos Silva",
    severity: "medium",
    status: "investigating",
    created_at: "2024-08-15T10:30:00Z",
    updated_at: "2024-08-15T10:30:00Z",
  },
  {
    id: "INC-2024-088",
    type: "unsafe_condition",
    title: "Corrimão solto na escada principal",
    description: "Identificado corrimão solto na escada de acesso ao convés superior. Risco de queda.",
    vessel_name: "AHTS Pacific Star",
    location: "Escada principal",
    incident_date: "2024-08-14",
    reporter_name: "Maria Santos",
    severity: "low",
    status: "resolved",
    created_at: "2024-08-14T08:15:00Z",
    updated_at: "2024-08-14T16:00:00Z",
  },
  {
    id: "INC-2024-087",
    type: "incident",
    title: "Lesão leve durante manuseio de equipamento",
    description: "Tripulante sofreu corte superficial na mão durante troca de filtro. Primeiros socorros aplicados.",
    vessel_name: "OSV Ocean Pioneer",
    location: "Sala de máquinas",
    incident_date: "2024-08-13",
    reporter_name: "João Oliveira",
    severity: "low",
    status: "closed",
    created_at: "2024-08-13T14:20:00Z",
    updated_at: "2024-08-13T18:00:00Z",
  },
];

const demoAlerts: SafetyAlert[] = [
  {
    id: "alert-1",
    type: "prediction",
    title: "Risco Elevado - Fadiga da Tripulação",
    description: "Análise indica 73% de probabilidade de incidente relacionado à fadiga nas próximas 48h",
    severity: "high",
    action: "Revisar escalas de trabalho",
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "alert-2",
    type: "pattern",
    title: "Padrão Detectado - Operações Noturnas",
    description: "68% dos near misses ocorreram durante operações entre 02:00-06:00",
    severity: "medium",
    action: "Reforçar iluminação e supervisão",
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "alert-3",
    type: "recommendation",
    title: "Manutenção Preventiva Recomendada",
    description: "Equipamentos de segurança com 85% de vida útil em 3 embarcações",
    severity: "low",
    action: "Programar substituição",
    read: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "alert-4",
    type: "warning",
    title: "Certificação STCW Vencendo",
    description: "3 tripulantes com certificação STCW vencendo nos próximos 30 dias",
    severity: "high",
    action: "Agendar renovação imediata",
    read: false,
    created_at: new Date().toISOString(),
  },
];

export function useSafetyData() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SafetyMetrics>(demoMetrics);
  const [incidents, setIncidents] = useState<SafetyIncident[]>(demoIncidents);
  const [alerts, setAlerts] = useState<SafetyAlert[]>(demoAlerts);
  const [filters, setFilters] = useState<SafetyFilter>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Try to load real incidents from dp_incidents table
      const { data: dpIncidents, error } = await supabase
        .from("dp_incidents")
        .select("*")
        .order("incident_date", { ascending: false })
        .limit(50);

      if (!error && dpIncidents && dpIncidents.length > 0) {
        const mappedIncidents: SafetyIncident[] = dpIncidents.map((inc: any) => ({
          id: inc.id,
          type: inc.severity === "critical" ? "incident" : "near_miss",
          title: inc.title,
          description: inc.summary || inc.title,
          vessel_name: inc.vessel || "N/A",
          location: inc.location || "N/A",
          incident_date: inc.incident_date,
          severity: inc.severity || "medium",
          status: "investigating" as const,
          root_cause: inc.root_cause,
          created_at: inc.created_at,
          updated_at: inc.updated_at || inc.created_at,
        }));
        setIncidents(mappedIncidents);
      }
    } catch (error) {
      console.error("Error loading safety data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createIncident = async (incident: Partial<SafetyIncident>) => {
    try {
      const newIncident: SafetyIncident = {
        id: `INC-${Date.now()}`,
        type: incident.type || "near_miss",
        title: incident.title || "",
        description: incident.description || "",
        vessel_name: incident.vessel_name || "",
        location: incident.location || "",
        incident_date: incident.incident_date || new Date().toISOString().split("T")[0],
        severity: incident.severity || "medium",
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setIncidents(prev => [newIncident, ...prev]);
      toast.success("Ocorrência registrada com sucesso!");
      return newIncident;
    } catch (error) {
      toast.error("Erro ao registrar ocorrência");
      throw error;
    }
  };

  const updateIncident = async (id: string, updates: Partial<SafetyIncident>) => {
    try {
      setIncidents(prev =>
        prev.map(inc =>
          inc.id === id
            ? { ...inc, ...updates, updated_at: new Date().toISOString() }
            : inc
        )
      );
      toast.success("Ocorrência atualizada!");
    } catch (error) {
      toast.error("Erro ao atualizar ocorrência");
      throw error;
    }
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  const markAllAlertsAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
    toast.success("Todos os alertas marcados como lidos");
  };

  const getFilteredIncidents = useCallback(() => {
    let filtered = [...incidents]);

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        inc =>
          inc.title.toLowerCase().includes(term) ||
          inc.description.toLowerCase().includes(term) ||
          inc.vessel_name.toLowerCase().includes(term)
      );
    }

    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(inc => filters.types!.includes(inc.type));
    }

    if (filters.severities && filters.severities.length > 0) {
      filtered = filtered.filter(inc => filters.severities!.includes(inc.severity));
    }

    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(inc => filters.statuses!.includes(inc.status));
    }

    if (filters.dateRange) {
      filtered = filtered.filter(inc => {
        const incDate = new Date(inc.incident_date);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return incDate >= start && incDate <= end;
      });
    }

    return filtered;
  }, [incidents, filters]);

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return {
    loading,
    metrics,
    incidents,
    alerts,
    filters,
    setFilters,
    createIncident,
    updateIncident,
    markAlertAsRead,
    markAllAlertsAsRead,
    getFilteredIncidents,
    unreadAlertsCount,
    refresh: loadData,
  };
}
