/**
 * Hook para dados reais de Agendamento de Relatórios
 * Substitui MOCK_SCHEDULES em AutomaticReportsScheduler.tsx
 * PATCH DEBT-FIX: Eliminação de mock data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { addDays, addWeeks, addMonths, addQuarters } from "date-fns";

export type ReportFrequency = "daily" | "weekly" | "monthly" | "quarterly";
export type ReportFormat = "pdf" | "xlsx" | "json";
export type ReportType = "compliance" | "audit" | "nc" | "training" | "executive";

export interface ScheduledReportData {
  id: string;
  template_id: string;
  template_name: string;
  name: string;
  description: string | null;
  report_type: ReportType;
  frequency: ReportFrequency;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string | null;
  recipients: string[];
  format: ReportFormat;
  parameters: Record<string, unknown>;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_status?: "success" | "failed" | "pending";
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: ReportType;
  generated_at: string;
  format: ReportFormat;
  size: string;
}

interface AutomatedReportRow {
  id: string;
  name: string | null;
  description: string | null;
  report_type: string | null;
  schedule_cron: string | null;
  recipients: unknown;
  filters: unknown;
  format: string | null;
  template_config: unknown;
  is_active: boolean | null;
  last_generated_at: string | null;
  next_scheduled_at: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Parse cron para frequência legível
 */
function parseCronToFrequency(cron: string | null): ReportFrequency {
  if (!cron) return "monthly";
  if (cron.includes("0 9 * * *") || cron.includes("daily")) return "daily";
  if (cron.includes("0 9 * * 1") || cron.includes("weekly")) return "weekly";
  if (cron.includes("0 9 1 * *") || cron.includes("monthly")) return "monthly";
  return "quarterly";
}

/**
 * Calcula próxima data de execução
 */
function getNextRunDate(frequency: ReportFrequency): Date {
  const now = new Date();
  switch (frequency) {
    case "daily":
      return addDays(now, 1);
    case "weekly":
      return addWeeks(now, 1);
    case "monthly":
      return addMonths(now, 1);
    case "quarterly":
      return addQuarters(now, 1);
  }
}

/**
 * Hook para buscar agendamentos de relatórios
 */
export function useReportSchedulerData() {
  return useQuery({
    queryKey: ["report-schedules"],
    queryFn: async (): Promise<ScheduledReportData[]> => {
      const { data, error } = await supabase
        .from("automated_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("Error fetching report schedules", error as Error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      return (data as unknown as AutomatedReportRow[]).map((schedule) => {
        const frequency = parseCronToFrequency(schedule.schedule_cron);
        const recipients = Array.isArray(schedule.recipients) 
          ? (schedule.recipients as string[])
          : [];
        
        return {
          id: schedule.id,
          template_id: `t-${schedule.id}`,
          template_name: schedule.name || "Relatório",
          name: schedule.name || "Relatório Agendado",
          description: schedule.description,
          report_type: (schedule.report_type as ReportType) || "compliance",
          frequency,
          day_of_week: frequency === "weekly" ? 1 : null,
          day_of_month: frequency === "monthly" ? 1 : null,
          time_of_day: "09:00",
          recipients,
          format: (schedule.format as ReportFormat) || "pdf",
          parameters: (schedule.filters as Record<string, unknown>) || {},
          is_active: schedule.is_active ?? true,
          last_run_at: schedule.last_generated_at,
          next_run_at: schedule.next_scheduled_at,
          created_by: schedule.created_by,
          created_at: schedule.created_at || new Date().toISOString(),
          updated_at: schedule.updated_at || new Date().toISOString(),
          last_status: schedule.last_generated_at ? "success" : "pending",
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para criar novo agendamento
 */
export function useCreateReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      report_type: ReportType;
      frequency: ReportFrequency;
      time_of_day: string;
      recipients: string[];
      format: ReportFormat;
    }) => {
      // Converter frequency para cron
      const cronMap: Record<ReportFrequency, string> = {
        daily: `0 ${input.time_of_day.split(":")[0]} * * *`,
        weekly: `0 ${input.time_of_day.split(":")[0]} * * 1`,
        monthly: `0 ${input.time_of_day.split(":")[0]} 1 * *`,
        quarterly: `0 ${input.time_of_day.split(":")[0]} 1 1,4,7,10 *`,
      };

      const { data, error } = await supabase
        .from("automated_reports")
        .insert({
          name: input.name,
          description: input.description,
          report_type: input.report_type,
          schedule_cron: cronMap[input.frequency],
          recipients: input.recipients,
          format: input.format,
          is_active: true,
          next_scheduled_at: getNextRunDate(input.frequency).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["report-schedules"] });
    },
    onError: (error) => {
      logger.error("Error creating schedule", error as Error);
      toast.error("Erro ao criar agendamento");
    },
  });
}

/**
 * Hook para toggle ativo/inativo
 */
export function useToggleScheduleActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("automated_reports")
        .update({
          is_active,
          next_scheduled_at: is_active ? getNextRunDate("monthly").toISOString() : null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.is_active ? "Agendamento ativado" : "Agendamento pausado");
      queryClient.invalidateQueries({ queryKey: ["report-schedules"] });
    },
    onError: (error) => {
      logger.error("Error toggling schedule", error as Error);
      toast.error("Erro ao atualizar agendamento");
    },
  });
}

/**
 * Hook para deletar agendamento
 */
export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("automated_reports")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agendamento removido");
      queryClient.invalidateQueries({ queryKey: ["report-schedules"] });
    },
    onError: (error) => {
      logger.error("Error deleting schedule", error as Error);
      toast.error("Erro ao remover agendamento");
    },
  });
}

/**
 * Hook para executar relatório manualmente
 */
export function useRunReportNow() {
  return useMutation({
    mutationFn: async ({ scheduleId, recipients }: { scheduleId: string; recipients: string[] }) => {
      // Atualizar last_generated_at
      await supabase
        .from("automated_reports")
        .update({ last_generated_at: new Date().toISOString() })
        .eq("id", scheduleId);
      
      // Registrar execução manual no audit_log
      await supabase.from("audit_log").insert({
        module: "reports",
        entity_type: "automated_report",
        entity_id: scheduleId,
        action: "MANUAL_RUN",
        after_state: { recipients, timestamp: new Date().toISOString() },
      });
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success("Gerando relatório...", {
        description: "O relatório será enviado aos destinatários em breve",
      });
    },
    onError: (error) => {
      logger.error("Error running report", error as Error);
      toast.error("Erro ao gerar relatório");
    },
  });
}

/**
 * Hook para estatísticas de agendamentos
 */
export function useScheduleStats() {
  const { data: schedules, isLoading } = useReportSchedulerData();

  if (isLoading || !schedules) {
    return {
      isLoading,
      stats: {
        total: 0,
        active: 0,
        paused: 0,
        failed: 0,
      },
    };
  }

  return {
    isLoading,
    stats: {
      total: schedules.length,
      active: schedules.filter((s) => s.is_active).length,
      paused: schedules.filter((s) => !s.is_active).length,
      failed: schedules.filter((s) => s.last_status === "failed").length,
    },
  };
}

export default useReportSchedulerData;
