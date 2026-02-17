/**
 * Proactive Alerts Cron Edge Function
 * Scans for expiring certificates and overdue maintenance
 * Generates SOC alerts automatically
 */

import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const alerts: Array<{
      alert_type: string;
      severity: string;
      title: string;
      message: string;
      source_module: string;
      metadata: Record<string, unknown>;
    }> = [];

    // 1) Certificates expiring within 30 days
    const { data: expiringCerts } = await sb
      .from("crew_certifications")
      .select("id, certification_name, expiry_date, crew_member_id")
      .gte("expiry_date", new Date().toISOString())
      .lte("expiry_date", new Date(Date.now() + 30 * 86400000).toISOString())
      .eq("status", "active");

    for (const cert of expiringCerts ?? []) {
      const daysLeft = Math.ceil(
        (new Date(cert.expiry_date).getTime() - Date.now()) / 86400000
      );
      alerts.push({
        alert_type: "certificate_expiring",
        severity: daysLeft <= 7 ? "critical" : daysLeft <= 14 ? "high" : "medium",
        title: `Certificado "${cert.certification_name}" expira em ${daysLeft} dias`,
        message: `O certificado ${cert.certification_name} do tripulante precisa ser renovado antes de ${cert.expiry_date}.`,
        source_module: "certificates",
        metadata: { cert_id: cert.id, crew_member_id: cert.crew_member_id, days_left: daysLeft },
      });
    }

    // 2) Overdue maintenance tasks
    const { data: overdueMaint } = await sb
      .from("maintenance_tasks")
      .select("id, title, due_date, priority, vessel_id")
      .eq("status", "pending")
      .lt("due_date", new Date().toISOString());

    for (const task of overdueMaint ?? []) {
      const daysOverdue = Math.ceil(
        (Date.now() - new Date(task.due_date).getTime()) / 86400000
      );
      alerts.push({
        alert_type: "maintenance_overdue",
        severity: daysOverdue > 14 ? "critical" : daysOverdue > 7 ? "high" : "medium",
        title: `Manutenção "${task.title}" atrasada ${daysOverdue} dias`,
        message: `A tarefa "${task.title}" estava prevista para ${task.due_date} e não foi concluída.`,
        source_module: "maintenance",
        metadata: { task_id: task.id, vessel_id: task.vessel_id, days_overdue: daysOverdue, priority: task.priority },
      });
    }

    // 3) Expired certificates
    const { data: expiredCerts } = await sb
      .from("crew_certifications")
      .select("id, certification_name, expiry_date, crew_member_id")
      .lt("expiry_date", new Date().toISOString())
      .eq("status", "active")
      .limit(20);

    for (const cert of expiredCerts ?? []) {
      alerts.push({
        alert_type: "certificate_expired",
        severity: "critical",
        title: `Certificado "${cert.certification_name}" EXPIRADO`,
        message: `O certificado ${cert.certification_name} expirou em ${cert.expiry_date}. Ação imediata necessária.`,
        source_module: "certificates",
        metadata: { cert_id: cert.id, crew_member_id: cert.crew_member_id },
      });
    }

    // Insert alerts (deduplicate)
    let inserted = 0;
    for (const alert of alerts) {
      const { data: existing } = await sb
        .from("soc_alerts")
        .select("id")
        .eq("alert_type", alert.alert_type)
        .eq("title", alert.title)
        .is("resolved_at", null)
        .limit(1);

      if (!existing || existing.length === 0) {
        await sb.from("soc_alerts").insert(alert);
        inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        scanned: {
          expiring_certs: expiringCerts?.length ?? 0,
          overdue_maintenance: overdueMaint?.length ?? 0,
          expired_certs: expiredCerts?.length ?? 0,
        },
        alerts_generated: alerts.length,
        alerts_inserted: inserted,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
