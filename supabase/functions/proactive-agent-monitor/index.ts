import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

/**
 * M005 - Proactive Agent Monitoring
 * Background monitors for certificates, compliance, maintenance
 * Runs on schedule or on-demand to detect issues before they become problems
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const monitorType = body.monitor || "all";

    const alerts: Array<{
      type: string;
      priority: "low" | "medium" | "high" | "critical";
      agent: string;
      message: string;
      affectedItems: number;
      details: Record<string, unknown>;
    }> = [];

    // ============================================
    // MONITOR 1: Certificate Expiration
    // ============================================
    if (monitorType === "all" || monitorType === "certificates") {
      // Check crew certificates expiring in 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringCerts, error: certError } = await supabase
        .from("crew_certifications")
        .select("id, crew_member_id, certification_name, expiry_date")
        .lte("expiry_date", thirtyDaysFromNow.toISOString())
        .gte("expiry_date", new Date().toISOString());

      if (!certError && expiringCerts && expiringCerts.length > 0) {
        alerts.push({
          type: "CERTIFICATE_EXPIRING",
          priority: "high",
          agent: "stcw-agent",
          message: `${expiringCerts.length} certificados expirando nos próximos 30 dias`,
          affectedItems: expiringCerts.length,
          details: {
            certificates: expiringCerts.map((c: any) => ({
              id: c.id,
              name: c.certification_name,
              expiryDate: c.expiry_date,
            })),
          },
        });
      }

      // Check already expired certificates
      const { data: expiredCerts } = await supabase
        .from("crew_certifications")
        .select("id, certification_name, expiry_date")
        .lt("expiry_date", new Date().toISOString());

      if (expiredCerts && expiredCerts.length > 0) {
        alerts.push({
          type: "CERTIFICATE_EXPIRED",
          priority: "critical",
          agent: "stcw-agent",
          message: `${expiredCerts.length} certificados já EXPIRADOS - ação urgente necessária`,
          affectedItems: expiredCerts.length,
          details: { expired: expiredCerts.length },
        });
      }
    }

    // ============================================
    // MONITOR 2: MLC Work Hours Violations
    // ============================================
    if (monitorType === "all" || monitorType === "mlc-hours") {
      const { data: activeCrewCount } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Check for potential MLC violations via operational checklists
      const { data: pendingChecklists } = await supabase
        .from("operational_checklists")
        .select("id, title, status")
        .neq("status", "completed")
        .limit(50);

      if (pendingChecklists && pendingChecklists.length > 10) {
        alerts.push({
          type: "CHECKLIST_BACKLOG",
          priority: "medium",
          agent: "mlc-agent",
          message: `${pendingChecklists.length} checklists operacionais pendentes - risco de compliance`,
          affectedItems: pendingChecklists.length,
          details: { activeCrew: activeCrewCount },
        });
      }
    }

    // ============================================
    // MONITOR 3: Maintenance Overdue
    // ============================================
    if (monitorType === "all" || monitorType === "maintenance") {
      const { data: activeAlerts } = await supabase
        .from("price_alerts")
        .select("id, alert_type, target_price, is_active")
        .eq("is_active", true);

      if (activeAlerts && activeAlerts.length > 5) {
        alerts.push({
          type: "ACTIVE_ALERTS_HIGH",
          priority: "medium",
          agent: "maintenance-ai",
          message: `${activeAlerts.length} alertas ativos requerem atenção`,
          affectedItems: activeAlerts.length,
          details: { alertTypes: activeAlerts.map((a: any) => a.alert_type) },
        });
      }
    }

    // ============================================
    // MONITOR 4: AI Agent Health
    // ============================================
    if (monitorType === "all" || monitorType === "agent-health") {
      const { data: agentMetrics } = await supabase
        .from("agent_swarm_metrics")
        .select("*");

      const unhealthyAgents = (agentMetrics || []).filter(
        (m: any) => m.error_count > 10 || (m.task_count > 0 && m.success_count / m.task_count < 0.7)
      );

      if (unhealthyAgents.length > 0) {
        alerts.push({
          type: "AGENT_UNHEALTHY",
          priority: "high",
          agent: "nauti-brain",
          message: `${unhealthyAgents.length} agentes IA com performance degradada`,
          affectedItems: unhealthyAgents.length,
          details: {
            agents: unhealthyAgents.map((a: any) => ({
              id: a.agent_id,
              errorRate: a.task_count > 0 ? ((a.error_count / a.task_count) * 100).toFixed(1) + "%" : "N/A",
            })),
          },
        });
      }
    }

    // ============================================
    // MONITOR 5: Compliance Gaps
    // ============================================
    if (monitorType === "all" || monitorType === "compliance") {
      const { data: audits } = await supabase
        .from("audit_center_logs")
        .select("id, compliance_score, audit_type")
        .not("compliance_score", "is", null)
        .lt("compliance_score", 70)
        .limit(20);

      if (audits && audits.length > 0) {
        alerts.push({
          type: "LOW_COMPLIANCE_SCORE",
          priority: "critical",
          agent: "compliance-chief",
          message: `${audits.length} auditorias com score abaixo de 70% - risco de não-conformidade`,
          affectedItems: audits.length,
          details: {
            audits: audits.map((a: any) => ({
              id: a.id,
              type: a.audit_type,
              score: a.compliance_score,
            })),
          },
        });
      }
    }

    // ============================================
    // Store alerts as AI insights for dashboard
    // ============================================
    if (alerts.length > 0) {
      const insightsToStore = alerts.map((alert) => ({
        title: `[${alert.agent}] ${alert.type}`,
        description: alert.message,
        category: "proactive-monitoring",
        priority: alert.priority,
        confidence: 0.95,
        actionable: true,
        status: "new",
        user_id: "00000000-0000-0000-0000-000000000000", // system user
        metadata: { details: alert.details, agent: alert.agent, monitor: alert.type },
      }));

      await supabase.from("ai_insights").insert(insightsToStore);
    }

    console.log(`[Proactive Monitor] ${alerts.length} alerts generated across ${monitorType} monitors`);

    return new Response(
      JSON.stringify({
        success: true,
        monitorsRun: monitorType === "all" ? 5 : 1,
        alertsGenerated: alerts.length,
        alerts,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Proactive Monitor] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
