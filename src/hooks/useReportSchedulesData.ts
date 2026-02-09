/**
 * Hook para dados reais de agendamento de relatórios
 * Substitui MOCK_SCHEDULES e MOCK_GENERATED_REPORTS
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ScheduledReport {
  id: string;
  template_id: string;
  template_name: string;
  name: string;
  description: string | null;
  report_type: "compliance" | "audit" | "nc" | "training" | "executive";
  frequency: string;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string | null;
  recipients: string[];
  format: string;
  parameters: Record<string, unknown>;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_status?: "success" | "failed" | "pending";
}

interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  generated_at: string;
  format: string;
  size: string;
}

export function useReportSchedulesData() {
  return useQuery({
    queryKey: ["report-schedules"],
    queryFn: async () => {
      // Try to fetch from report_schedules table if it exists
      const { data, error } = await (supabase.from as Function)("report_schedules")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        // Return empty arrays - IntegrationGuard pattern
        return {
          schedules: [] as ScheduledReport[],
          generatedReports: [] as GeneratedReport[],
          isConfigured: false,
        };
      }

      type ScheduleRow = Record<string, unknown>;
      const schedules: ScheduledReport[] = ((data || []) as ScheduleRow[]).map((d) => ({
        id: d.id as string,
        template_id: (d.template_id as string) || "",
        template_name: (d.template_name as string) || (d.name as string) || "",
        name: (d.name as string) || "",
        description: (d.description as string | null) ?? null,
        report_type: (d.report_type as ScheduledReport["report_type"]) || "compliance",
        frequency: (d.frequency as string) || "monthly",
        day_of_week: (d.day_of_week as number | null) ?? null,
        day_of_month: (d.day_of_month as number | null) ?? null,
        time_of_day: (d.time_of_day as string | null) ?? null,
        recipients: (d.recipients as string[]) || [],
        format: (d.format as string) || "pdf",
        parameters: (d.parameters as Record<string, unknown>) || {},
        is_active: (d.is_active as boolean) ?? true,
        last_run_at: (d.last_run_at as string | null) ?? null,
        next_run_at: (d.next_run_at as string | null) ?? null,
        created_by: (d.created_by as string | null) ?? null,
        created_at: (d.created_at as string) || "",
        updated_at: (d.updated_at as string) || "",
        last_status: d.last_status as ScheduledReport["last_status"],
      }));

      return {
        schedules,
        generatedReports: [] as GeneratedReport[],
        isConfigured: true,
      };
    },
  });
}
