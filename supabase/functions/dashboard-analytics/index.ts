import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);
Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    switch (action) {
    case "refresh_metrics":
      return await refreshDashboardMetrics();
      
    case "generate_insights":
      return await generateAIInsights(data);
      
    case "export_dashboard":
      return await exportDashboardData(data);
      
    case "update_config":
      return await updateDashboardConfig(data);
      
    default:
      return new Response(
        JSON.stringify({ error: "Action not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function refreshDashboardMetrics() {
  try {
    // Simulate real-time metric calculations
    const currentTime = new Date().toISOString();
    
    // Generate dynamic metrics based on current system state
    const dynamicMetrics = [
      {
        metric_type: "operational",
        metric_name: "System Health",
        metric_value: Math.random() * 20 + 90, // 90-100%
        metric_change: (Math.random() - 0.5) * 10, // -5 to +5%
        metric_unit: "%",
        department: "operations"
      },
      {
        metric_type: "performance",
        metric_name: "Response Time",
        metric_value: Math.random() * 200 + 100, // 100-300ms
        metric_change: (Math.random() - 0.5) * 20,
        metric_unit: "ms",
        department: "technical"
      },
      {
        metric_type: "usage",
        metric_name: "Active Sessions",
        metric_value: Math.floor(Math.random() * 50 + 20), // 20-70 sessions
        metric_change: (Math.random() - 0.5) * 30,
        metric_unit: "sessions",
        department: "analytics"
      }
    ];

    // Insert metrics into database
    const { data, error } = await supabase
      .from("dashboard_metrics")
      .insert(dynamicMetrics);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Metrics refreshed successfully",
        data: dynamicMetrics,
        timestamp: currentTime
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  } catch (error) {
    throw new Error(`Failed to refresh metrics: ${(error as Error).message}`);
  }
}

async function generateAIInsights(data: any) {
  try {
    const { userRole, timeframe = "7d" } = data;
    
    // Fetch recent metrics for analysis
    const { data: metrics, error } = await supabase
      .from("dashboard_metrics")
      .select("*")
      .gte("recorded_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("recorded_at", { ascending: false });

    if (error) throw error;

    // Generate AI insights based on metrics patterns
    const insights = await analyzeMetricsPatterns(metrics, userRole);
    
    // Store insights for future reference
    const { data: savedInsights, error: insertError } = await supabase
      .from("ai_insights")
      .insert({
        title: `Dashboard Insights - ${userRole}`,
        description: insights.summary,
        category: "dashboard",
        confidence: insights.confidence,
        priority: insights.priority,
        user_id: data.userId,
        related_module: "dashboard",
        metadata: {
          insights: insights.details,
          generated_at: new Date().toISOString(),
          timeframe,
          metrics_analyzed: metrics.length
        }
      });

    if (insertError) console.warn("Failed to save insights:", insertError);

    return new Response(
      JSON.stringify({
        success: true,
        insights: insights,
        metrics_count: metrics.length
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  } catch (error) {
    throw new Error(`Failed to generate insights: ${(error as Error).message}`);
  }
}

async function analyzeMetricsPatterns(metrics: any[], userRole: string) {
  // Simulate AI analysis of metrics patterns
  const analysis: {
    trends: any[];
    anomalies: any[];
    recommendations: string[];
  } = {
    trends: [],
    anomalies: [],
    recommendations: []
  };

  // Analyze trends by metric type
  const metricsByType = metrics.reduce((acc: any, metric: any) => {
    if (!acc[metric.metric_type]) acc[metric.metric_type] = [];
    acc[metric.metric_type].push(metric);
    return acc;
  }, {});

  Object.entries(metricsByType).forEach(([type, typeMetrics]) => {
    const avgChange = (typeMetrics as any[]).reduce((sum: number, m: any) => sum + (m.metric_change || 0), 0) / (typeMetrics as any[]).length;
    
    if (Math.abs(avgChange) > 5) {
      analysis.trends.push({
        type,
        direction: avgChange > 0 ? "increasing" : "decreasing",
        magnitude: Math.abs(avgChange),
        significance: Math.abs(avgChange) > 10 ? "high" : "moderate"
      });
    }
  });

  const roleRecommendations: Record<string, string[]> = {
    admin: [
      "Consider implementing automated alerts for critical metrics",
      "Review system performance optimization opportunities",
      "Analyze user engagement patterns for improvement areas"
    ],
    hr: [
      "Monitor crew certification expiration dates",
      "Track employee performance metrics",
      "Review training completion rates"
    ],
    operator: [
      "Focus on operational efficiency indicators",
      "Monitor vessel performance metrics",
      "Track maintenance schedule compliance"
    ],
    auditor: [
      "Review compliance metrics trends",
      "Analyze non-conformity patterns",
      "Monitor audit completion rates"
    ]
  };

  analysis.recommendations = roleRecommendations[userRole] || roleRecommendations.admin;

  return {
    summary: `Analysis of ${metrics.length} metrics shows ${analysis.trends.length} significant trends`,
    confidence: 0.85,
    priority: analysis.trends.some((t: any) => t.significance === "high") ? "high" : "medium",
    details: analysis
  };
}

async function exportDashboardData(data: any) {
  try {
    const { format = "json", userId, dateRange } = data;
    
    // Fetch dashboard data for export
    const [metricsResult, alertsResult, activitiesResult] = await Promise.all([
      supabase.from("dashboard_metrics").select("*").order("recorded_at", { ascending: false }).limit(100),
      supabase.from("dashboard_alerts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("dashboard_activities").select("*").order("created_at", { ascending: false }).limit(50)
    ]);

    const exportData = {
      generated_at: new Date().toISOString(),
      user_id: userId,
      format,
      data: {
        metrics: metricsResult.data || [],
        alerts: alertsResult.data || [],
        activities: activitiesResult.data || []
      },
      summary: {
        total_metrics: metricsResult.data?.length || 0,
        total_alerts: alertsResult.data?.length || 0,
        total_activities: activitiesResult.data?.length || 0,
        unread_alerts: alertsResult.data?.filter((a: any) => !a.is_read).length || 0
      }
    };

    return new Response(
      JSON.stringify({
        success: true,
        export_data: exportData,
        download_info: {
          filename: `nautilus_dashboard_${new Date().toISOString().split("T")[0]}.${format}`,
          size_kb: Math.round(JSON.stringify(exportData).length / 1024)
        }
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  } catch (error) {
    throw new Error(`Failed to export dashboard: ${(error as Error).message}`);
  }
}

async function updateDashboardConfig(data: any) {
  try {
    const { userId, config } = data;
    
    // Update user dashboard configuration
    const { data: result, error } = await supabase
      .from("user_dashboard_configs")
      .upsert({
        user_id: userId,
        layout_type: config.layout,
        active_widgets: config.activeWidgets,
        widget_positions: config.widgetPositions || {},
        filters: config.filters || {},
        is_default: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "user_id"
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dashboard configuration updated successfully",
        config: result
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  } catch (error) {
    throw new Error(`Failed to update config: ${(error as Error).message}`);
  }
}