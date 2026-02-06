/**
 * Hook: Safety Dashboard - Real incidents from Supabase
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyIncidentData {
  month: string;
  incidents: number;
  nearMiss: number;
  unsafe: number;
}

export function useSafetyDashboardData() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["safety-monthly-incidents"],
    queryFn: async (): Promise<MonthlyIncidentData[]> => {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const { data: incidents, error: err } = await supabase
        .from("incidents")
        .select("id, severity, occurred_at, created_at")
        .gte("created_at", twelveMonthsAgo.toISOString())
        .order("created_at", { ascending: true });

      if (err) throw err;

      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const monthlyData: Record<string, { incidents: number; nearMiss: number; unsafe: number }> = {};

      months.forEach(m => {
        monthlyData[m] = { incidents: 0, nearMiss: 0, unsafe: 0 };
      });

      (incidents || []).forEach(inc => {
        const d = new Date(inc.occurred_at || inc.created_at);
        const monthName = months[d.getMonth()];
        if (!monthlyData[monthName]) return;

        const sev = (inc.severity || "").toLowerCase();
        if (sev === "critical" || sev === "high") {
          monthlyData[monthName].incidents++;
        } else if (sev === "medium") {
          monthlyData[monthName].nearMiss++;
        } else {
          monthlyData[monthName].unsafe++;
        }
      });

      return months.map(m => ({
        month: m,
        ...monthlyData[m],
      }));
    },
  });

  return {
    monthlyData: data || [],
    isLoading,
    error,
    refetch,
  };
}
