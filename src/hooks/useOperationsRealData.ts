/**
 * Hook para dados reais de Operações
 * Substitui sampleProcesses e sampleLogs por queries Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Process {
  id: string;
  name: string;
  type: string;
  status: "running" | "paused" | "completed" | "error";
  progress: number;
  startTime: string;
  vessel?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  source: string;
  message: string;
}

export interface OperationsStats {
  operational: number;
  warning: number;
  critical: number;
}

// Buscar processos ativos
async function fetchProcesses(): Promise<Process[]> {
  // Buscar de maintenance_records como processos
  const { data: maintenance } = await supabase
    .from("maintenance_records")
    .select("id, title, status, scheduled_date, vessel_id, vessels(name)")
    .in("status", ["scheduled", "in_progress", "pending"])
    .order("scheduled_date", { ascending: false })
    .limit(20);

  // Buscar voyages ativos
  const { data: voyages } = await supabase
    .from("voyages")
    .select("id, voyage_number, status, start_date, vessel_id, vessels(name)")
    .in("status", ["active", "in_progress", "planned"])
    .order("start_date", { ascending: false })
    .limit(10);

  const processes: Process[] = [];

  // Converter maintenance para processos
  maintenance?.forEach((m: any) => {
    const startDate = m.scheduled_date ? new Date(m.scheduled_date) : new Date();
    processes.push({
      id: m.id,
      name: m.title || "Manutenção",
      type: "maintenance",
      status: m.status === "in_progress" ? "running" : m.status === "scheduled" ? "paused" : "completed",
      progress: m.status === "completed" ? 100 : m.status === "in_progress" ? 50 : 0,
      startTime: startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      vessel: m.vessels?.name
    });
  });

  // Converter voyages para processos
  voyages?.forEach((v: any) => {
    const startDate = v.start_date ? new Date(v.start_date) : new Date();
    processes.push({
      id: v.id,
      name: `Viagem ${v.voyage_number || v.id.slice(0, 8)}`,
      type: "voyage",
      status: v.status === "active" || v.status === "in_progress" ? "running" : "paused",
      progress: v.status === "active" ? 67 : 30,
      startTime: startDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      vessel: v.vessels?.name
    });
  });

  return processes.length > 0 ? processes : getDefaultProcesses();
}

// Buscar logs do sistema
async function fetchSystemLogs(): Promise<LogEntry[]> {
  const { data: logs, error } = await supabase
    .from("access_logs")
    .select("id, timestamp, action, module_accessed, result, severity")
    .order("timestamp", { ascending: false })
    .limit(30);

  if (error || !logs?.length) {
    return getDefaultLogs();
  }

  return logs.map(log => ({
    id: log.id,
    timestamp: new Date(log.timestamp).toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit" 
    }),
    level: mapResultToLevel(log.result, log.severity),
    source: log.module_accessed || "System",
    message: `${log.action} - ${log.module_accessed || "Sistema"}`
  }));
}

// Buscar estatísticas de status
async function fetchOperationsStats(): Promise<OperationsStats> {
  const [
    { count: activeVessels },
    { count: warningAlerts },
    { count: criticalAlerts }
  ] = await Promise.all([
    supabase.from("vessels").select("*", { count: "exact", head: true }).eq("status", "operational"),
    supabase.from("soc_alerts").select("*", { count: "exact", head: true }).eq("severity", "warning").is("resolved_at", null),
    supabase.from("soc_alerts").select("*", { count: "exact", head: true }).eq("severity", "critical").is("resolved_at", null)
  ]);

  return {
    operational: activeVessels || 0,
    warning: warningAlerts || 0,
    critical: criticalAlerts || 0
  };
}

function mapResultToLevel(result: string | null, severity: string | null): LogEntry["level"] {
  if (severity === "critical" || result === "error") return "error";
  if (severity === "warning" || result === "failure") return "warning";
  if (result === "success") return "success";
  return "info";
}

// Defaults quando não há dados
function getDefaultProcesses(): Process[] {
  return [
    { id: "default-1", name: "Sistema Iniciando...", type: "system", status: "running", progress: 100, startTime: "00:00" }
  ];
}

function getDefaultLogs(): LogEntry[] {
  const now = new Date();
  return [
    { 
      id: "default-1", 
      timestamp: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), 
      level: "info", 
      source: "System", 
      message: "Sistema iniciado com sucesso" 
    }
  ];
}

// ============================================
// HOOKS EXPORTADOS
// ============================================

export function useOperationsProcesses() {
  return useQuery({
    queryKey: ["operations-processes"],
    queryFn: fetchProcesses,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
  });
}

export function useSystemLogs() {
  return useQuery({
    queryKey: ["system-logs"],
    queryFn: fetchSystemLogs,
    staleTime: 1000 * 10, // 10 seconds
    refetchInterval: 1000 * 30, // 30 seconds
  });
}

export function useOperationsStats() {
  return useQuery({
    queryKey: ["operations-stats"],
    queryFn: fetchOperationsStats,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // 2 minutes
  });
}

export function useToggleProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ processId, newStatus }: { processId: string; newStatus: string }) => {
      // Tentar atualizar em maintenance_records
      const { error } = await supabase
        .from("maintenance_records")
        .update({ status: newStatus === "running" ? "in_progress" : "scheduled" })
        .eq("id", processId);

      if (error) {
        // Tentar em voyages
        await supabase
          .from("voyages")
          .update({ status: newStatus === "running" ? "active" : "planned" })
          .eq("id", processId);
      }

      return { processId, newStatus };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations-processes"] });
    }
  });
}

export function useOperationsRealData() {
  const processes = useOperationsProcesses();
  const logs = useSystemLogs();
  const stats = useOperationsStats();

  return {
    processes: processes.data || [],
    logs: logs.data || [],
    stats: stats.data || { operational: 0, warning: 0, critical: 0 },
    isLoading: processes.isLoading || logs.isLoading || stats.isLoading,
    refetch: () => {
      processes.refetch();
      logs.refetch();
      stats.refetch();
    }
  };
}
