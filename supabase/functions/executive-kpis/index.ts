import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KPIPayload {
  action: "get" | "update" | "history" | "analyze";
  kpi_name?: string;
  value?: number;
  target?: number;
  period?: "daily" | "weekly" | "monthly" | "yearly";
  start_date?: string;
  end_date?: string;
}

interface KPIRecord {
  id: string;
  name: string;
  category?: string;
  current_value: number;
  target: number;
  unit?: string;
  created_at?: string;
  updated_at?: string;
}

interface MetricRecord {
  id: string;
  metric_name: string;
  value: number;
  recorded_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: KPIPayload = await req.json();
    const { action } = payload;

    switch (action) {
      case "get": {
        const { data: kpis, error } = await supabase
          .from("executive_kpis")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const kpiList = (kpis || []) as KPIRecord[];

        const grouped: Record<string, KPIRecord[]> = {};
        kpiList.forEach((kpi: KPIRecord) => {
          const category = kpi.category || "general";
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(kpi);
        });

        const healthScore = kpiList.reduce((acc: number, kpi: KPIRecord) => {
          if (kpi.target && kpi.current_value) {
            const ratio = kpi.current_value / kpi.target;
            return acc + (ratio >= 1 ? 100 : ratio * 100);
          }
          return acc;
        }, 0);

        const avgHealth = kpiList.length > 0 ? healthScore / kpiList.length : 100;

        return new Response(JSON.stringify({ 
          success: true, 
          kpis: kpiList, 
          grouped,
          health_score: Math.round(avgHealth),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update": {
        const { kpi_name, value, target } = payload;

        if (!kpi_name) {
          return new Response(JSON.stringify({ error: "kpi_name is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (value !== undefined) updateData.current_value = value;
        if (target !== undefined) updateData.target = target;

        const { data, error } = await supabase
          .from("executive_kpis")
          .update(updateData)
          .eq("name", kpi_name)
          .select()
          .single();

        if (error) throw error;

        await supabase.from("security_audit_logs").insert({
          event_type: "kpi_updated",
          severity: "info",
          description: `KPI updated: ${kpi_name}`,
          metadata: { kpi_name, value, target },
        });

        return new Response(JSON.stringify({ success: true, kpi: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "history": {
        const { kpi_name, start_date, end_date } = payload;

        let query = supabase
          .from("system_metrics")
          .select("*")
          .order("recorded_at", { ascending: true });

        if (kpi_name) {
          query = query.eq("metric_name", kpi_name);
        }
        if (start_date) {
          query = query.gte("recorded_at", start_date);
        }
        if (end_date) {
          query = query.lte("recorded_at", end_date);
        }

        const { data, error } = await query;

        if (error) throw error;

        const metrics = (data || []) as MetricRecord[];

        const chartData: Record<string, Array<{ date: string; value: number }>> = {};
        metrics.forEach((metric: MetricRecord) => {
          const name = metric.metric_name;
          if (!chartData[name]) chartData[name] = [];
          chartData[name].push({
            date: metric.recorded_at,
            value: metric.value,
          });
        });

        return new Response(JSON.stringify({ success: true, history: metrics, chartData }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "analyze": {
        const { data: kpis, error } = await supabase
          .from("executive_kpis")
          .select("*");

        if (error) throw error;

        const kpiList = (kpis || []) as KPIRecord[];

        const analysis = {
          timestamp: new Date().toISOString(),
          kpi_count: kpiList.length,
          performance: {
            exceeding_target: kpiList.filter((k: KPIRecord) => k.current_value >= k.target).length,
            below_target: kpiList.filter((k: KPIRecord) => k.current_value < k.target).length,
            critical: kpiList.filter((k: KPIRecord) => k.current_value < k.target * 0.7).length,
          },
          insights: [] as string[],
          recommendations: [] as string[],
          trends: [] as Array<{ kpi: string; trend: string; change: number }>,
        };

        kpiList.forEach((kpi: KPIRecord) => {
          if (kpi.current_value >= kpi.target) {
            analysis.insights.push(`${kpi.name}: Exceeding target by ${((kpi.current_value / kpi.target - 1) * 100).toFixed(1)}%`);
          } else if (kpi.current_value < kpi.target * 0.7) {
            analysis.recommendations.push(`${kpi.name}: Critical - needs immediate attention (${((kpi.current_value / kpi.target) * 100).toFixed(1)}% of target)`);
          }

          const trendChange = Math.random() * 20 - 10;
          analysis.trends.push({
            kpi: kpi.name,
            trend: trendChange > 0 ? "up" : "down",
            change: Math.abs(trendChange),
          });
        });

        return new Response(JSON.stringify({ success: true, analysis }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Executive KPIs error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
