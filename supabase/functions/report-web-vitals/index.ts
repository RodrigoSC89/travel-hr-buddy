import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
}

interface VitalsReport {
  metrics: VitalMetric[];
  url: string;
  userAgent: string;
  timestamp: number;
  isSlowNetwork: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const report: VitalsReport = await req.json();
    
    // Validate report
    if (!report.metrics || !Array.isArray(report.metrics)) {
      return new Response(
        JSON.stringify({ error: "Invalid report format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process and store metrics
    const metricsToInsert = report.metrics.map(metric => ({
      metric_name: metric.name,
      metric_value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      metric_id: metric.id,
      navigation_type: metric.navigationType,
      page_url: report.url,
      user_agent: report.userAgent,
      is_slow_network: report.isSlowNetwork,
      recorded_at: new Date(metric.timestamp).toISOString(),
    }));

    // Insert into analytics_metrics or a dedicated web_vitals table
    const { error } = await supabase
      .from("analytics_metrics")
      .insert(metricsToInsert.map(m => ({
        metric_name: m.metric_name,
        metric_value: m.metric_value,
        period_start: m.recorded_at,
        period_end: m.recorded_at,
        dimensions: {
          rating: m.rating,
          page_url: m.page_url,
          is_slow_network: m.is_slow_network,
          navigation_type: m.navigation_type,
        }
      })));

    if (error) {
      console.error("Error storing web vitals:", error);
      // Don't fail the request - vitals reporting should be fire-and-forget
    }

    // Check for poor metrics and log alerts
    const poorMetrics = report.metrics.filter(m => m.rating === 'poor');
    if (poorMetrics.length > 0) {
      console.warn("Poor web vitals detected:", {
        url: report.url,
        metrics: poorMetrics.map(m => ({ name: m.name, value: m.value }))
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: report.metrics.length,
        alerts: poorMetrics.length 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing web vitals:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
