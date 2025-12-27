import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertPayload {
  action: "create" | "resolve" | "escalate" | "list" | "analyze";
  alert_type?: string;
  severity?: "critical" | "high" | "medium" | "low";
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  alert_id?: string;
  limit?: number;
}

interface AlertRecord {
  id: string;
  alert_type: string;
  severity: string;
  status: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  detected_at?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: AlertPayload = await req.json();
    const { action } = payload;

    switch (action) {
      case "create": {
        const { alert_type, severity, title, description, metadata } = payload;
        
        const { data: alert, error } = await supabase
          .from("proactive_alerts")
          .insert({
            alert_type: alert_type || "system",
            severity: severity || "medium",
            title,
            description,
            metadata,
            status: "active",
            detected_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        await supabase.from("security_audit_logs").insert({
          event_type: "alert_created",
          severity: severity || "medium",
          description: `Alert created: ${title}`,
          metadata: { alert_id: alert.id, alert_type },
        });

        if (severity === "critical" || severity === "high") {
          const { data: webhooks } = await supabase
            .from("webhook_configurations")
            .select("*")
            .eq("is_active", true)
            .contains("event_types", [alert_type || "system"]);

          if (webhooks && webhooks.length > 0) {
            for (const webhook of webhooks) {
              try {
                await fetch(webhook.url, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event: "alert_created",
                    alert,
                    timestamp: new Date().toISOString(),
                  }),
                });

                await supabase.from("webhook_logs").insert({
                  webhook_id: webhook.id,
                  event_type: "alert_created",
                  status: "success",
                  request_payload: { alert },
                });
              } catch (webhookError) {
                await supabase.from("webhook_logs").insert({
                  webhook_id: webhook.id,
                  event_type: "alert_created",
                  status: "failed",
                  error_message: webhookError instanceof Error ? webhookError.message : "Unknown error",
                });
              }
            }
          }
        }

        return new Response(JSON.stringify({ success: true, alert }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "resolve": {
        const { alert_id } = payload;
        
        const { data, error } = await supabase
          .from("proactive_alerts")
          .update({
            status: "resolved",
            resolved_at: new Date().toISOString(),
          })
          .eq("id", alert_id)
          .select()
          .single();

        if (error) throw error;

        await supabase.from("security_audit_logs").insert({
          event_type: "alert_resolved",
          severity: "info",
          description: `Alert resolved: ${data.title}`,
          metadata: { alert_id },
        });

        return new Response(JSON.stringify({ success: true, alert: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "escalate": {
        const { alert_id } = payload;
        
        const { data: alert, error: fetchError } = await supabase
          .from("proactive_alerts")
          .select("*")
          .eq("id", alert_id)
          .single();

        if (fetchError) throw fetchError;

        const newSeverity = alert.severity === "low" ? "medium" 
          : alert.severity === "medium" ? "high" 
          : "critical";

        const { data, error } = await supabase
          .from("proactive_alerts")
          .update({
            severity: newSeverity,
            metadata: {
              ...alert.metadata,
              escalated_at: new Date().toISOString(),
              previous_severity: alert.severity,
            },
          })
          .eq("id", alert_id)
          .select()
          .single();

        if (error) throw error;

        await supabase.from("security_audit_logs").insert({
          event_type: "alert_escalated",
          severity: newSeverity,
          description: `Alert escalated: ${data.title}`,
          metadata: { alert_id, from: alert.severity, to: newSeverity },
        });

        return new Response(JSON.stringify({ success: true, alert: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list": {
        const { limit = 50 } = payload;
        
        const { data, error } = await supabase
          .from("proactive_alerts")
          .select("*")
          .order("detected_at", { ascending: false })
          .limit(limit);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, alerts: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "analyze": {
        const { data: recentAlerts, error } = await supabase
          .from("proactive_alerts")
          .select("*")
          .gte("detected_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .order("detected_at", { ascending: false });

        if (error) throw error;

        const alerts = (recentAlerts || []) as AlertRecord[];

        const analysis = {
          total_alerts: alerts.length,
          by_severity: {
            critical: alerts.filter((a: AlertRecord) => a.severity === "critical").length,
            high: alerts.filter((a: AlertRecord) => a.severity === "high").length,
            medium: alerts.filter((a: AlertRecord) => a.severity === "medium").length,
            low: alerts.filter((a: AlertRecord) => a.severity === "low").length,
          },
          by_status: {
            active: alerts.filter((a: AlertRecord) => a.status === "active").length,
            resolved: alerts.filter((a: AlertRecord) => a.status === "resolved").length,
            acknowledged: alerts.filter((a: AlertRecord) => a.status === "acknowledged").length,
          },
          patterns: [] as Array<{ type: string; count: number; pattern: string }>,
          recommendations: [] as string[],
        };

        const alertTypes = alerts.map((a: AlertRecord) => a.alert_type);
        const typeCounts: Record<string, number> = {};
        alertTypes.forEach((type: string) => {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const patterns = Object.entries(typeCounts)
          .filter(([, count]) => count > 3)
          .map(([type, count]) => ({
            type,
            count,
            pattern: `Recurring ${type} alerts (${count} in 24h)`,
          }));

        analysis.patterns = patterns;

        if (analysis.by_severity.critical > 0) {
          analysis.recommendations.push("Immediate attention required for critical alerts");
        }
        if (patterns.length > 0) {
          analysis.recommendations.push("Investigate recurring alert patterns");
        }
        if (analysis.by_status.active > 10) {
          analysis.recommendations.push("High volume of active alerts - consider prioritization");
        }

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
    console.error("Proactive alerts error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
