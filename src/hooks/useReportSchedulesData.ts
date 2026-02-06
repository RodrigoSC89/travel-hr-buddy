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
      const { data, error } = await supabase
        .from("report_schedules" as any)
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

      const schedules: ScheduledReport[] = (data as any[]).map((d) => ({
        id: d.id,
        template_id: d.template_id || "",
        template_name: d.template_name || d.name || "",
        name: d.name || "",
        description: d.description,
        report_type: d.report_type || "compliance",
        frequency: d.frequency || "monthly",
        day_of_week: d.day_of_week,
        day_of_month: d.day_of_month,
        time_of_day: d.time_of_day,
        recipients: d.recipients || [],
        format: d.format || "pdf",
        parameters: d.parameters || {},
        is_active: d.is_active ?? true,
        last_run_at: d.last_run_at,
        next_run_at: d.next_run_at,
        created_by: d.created_by,
        created_at: d.created_at,
        updated_at: d.updated_at,
        last_status: d.last_status,
      }));

      return {
        schedules,
        generatedReports: [] as GeneratedReport[],
        isConfigured: true,
      };
    },
  });
}
