/**
 * Compliance Deadline Cron Job - Phase 7
 * Runs daily to check for upcoming deadlines and send notifications
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { edgeLogger } from "../_shared/edge-logger.ts";

const TAG = "COMPLIANCE-CRON";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeadlineCheck {
  type: string;
  table: string;
  dateField: string;
  titleField: string;
  userField?: string;
}

const DEADLINE_CHECKS: DeadlineCheck[] = [
  { type: "certificate_expiring", table: "crew_documents", dateField: "expiry_date", titleField: "document_type" },
  { type: "audit_reminder", table: "peotram_audits", dateField: "scheduled_date", titleField: "title" },
  { type: "audit_reminder", table: "preovid_audits", dateField: "scheduled_date", titleField: "vessel_name" },
];

const WARNING_DAYS = [30, 14, 7, 3, 1]; // Days before deadline to warn

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log("[Compliance Cron] Starting deadline check...");

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const now = new Date();
    const notifications: any[] = [];

    // Check each deadline type
    for (const check of DEADLINE_CHECKS) {
      console.log(`[Cron] Checking ${check.table}...`);

      for (const daysAhead of WARNING_DAYS) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + daysAhead);
        const targetDateStr = targetDate.toISOString().split("T")[0];

        try {
          const { data: items, error } = await supabase
            .from(check.table)
            .select("*")
            .gte(check.dateField, targetDateStr)
            .lt(check.dateField, new Date(targetDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

          if (error) {
            edgeLogger.warn(TAG, `Error querying ${check.table}`, { error: error.message });
            continue;
          }

          if (items && items.length > 0) {
            console.log(`[Cron] Found ${items.length} items in ${check.table} expiring in ${daysAhead} days`);

            for (const item of items) {
              const priority = daysAhead <= 3 ? "critical" : daysAhead <= 7 ? "high" : "medium";
              
              // Get all admin/compliance users to notify
              const { data: users } = await supabase
                .from("profiles")
                .select("id, email, full_name")
                .in("role", ["admin", "compliance_officer", "manager"])
                .limit(10);

              for (const user of users || []) {
                // Check if notification was already sent today
                const { data: existing } = await supabase
                  .from("intelligent_notifications")
                  .select("id")
                  .eq("user_id", user.id)
                  .eq("metadata->>itemId", item.id)
                  .gte("created_at", now.toISOString().split("T")[0])
                  .limit(1);

                if (existing && existing.length > 0) {
                  console.log(`[Cron] Notification already sent today for item ${item.id}`);
                  continue;
                }

                const title = item[check.titleField] || `Item ${check.table}`;
                const notification = {
                  user_id: user.id,
                  type: check.type,
                  priority,
                  title: `${daysAhead === 1 ? "⚠️ AMANHÃ" : `📅 ${daysAhead} dias`}: ${title}`,
                  message: `O prazo para "${title}" vence em ${daysAhead} dia${daysAhead > 1 ? "s" : ""}.`,
                  action_url: `/compliance/${check.table}/${item.id}`,
                  action_label: "Ver Detalhes",
                  metadata: {
                    complianceType: check.type,
                    module: check.table,
                    dueDate: item[check.dateField],
                    daysRemaining: daysAhead,
                    itemId: item.id,
                  },
                  is_read: false,
                  created_at: new Date().toISOString(),
                };

                // Save in-app notification
                const { data: saved, error: saveError } = await supabase
                  .from("intelligent_notifications")
                  .insert(notification)
                  .select()
                  .single();

                if (saveError) {
                  edgeLogger.warn(TAG, "Error saving notification", { error: saveError.message });
                } else {
                  notifications.push(saved);
                }

                // Send email for critical/high priority
                if ((priority === "critical" || priority === "high") && user.email && RESEND_API_KEY) {
                  try {
                    const emailResponse = await fetch("https://api.resend.com/emails", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${RESEND_API_KEY}`,
                      },
                      body: JSON.stringify({
                        from: "NautiOne Compliance <compliance@nautione.app>",
                        to: [user.email],
                        subject: notification.title,
                        html: generateEmailHtml(notification, user.full_name || "Usuário"),
                      }),
                    });
                    if (emailResponse.ok) {
                      edgeLogger.info(TAG, `Email sent to ${user.email}`);
                    } else {
                      edgeLogger.warn(TAG, "Email send failed", { status: emailResponse.status });
                    }
                  } catch (emailError) {
                    edgeLogger.warn(TAG, "Email send error", { error: String(emailError) });
                  }
                }
              }
            }
          }
        } catch (queryError) {
          edgeLogger.warn(TAG, `Query error for ${check.table}`, { error: String(queryError) });
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Compliance Cron] Completed in ${duration}ms. Sent ${notifications.length} notifications.`);

    // Log cron execution
    await supabase.from("cron_job_logs").insert({
      job_name: "compliance-deadline-cron",
      status: "success",
      notifications_sent: notifications.length,
      duration_ms: duration,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    return new Response(JSON.stringify({
      success: true,
      notificationsSent: notifications.length,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Compliance Cron] Error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateEmailHtml(notification: any, userName: string): string {
  const priorityColor = notification.priority === "critical" ? "#DC2626" : "#F59E0B";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #e2e8f0; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #3b82f6; margin: 0;">⚓ NautiOne</h1>
      <p style="color: #64748b; margin: 8px 0 0;">Alerta Automático de Compliance</p>
    </div>
    
    <p style="font-size: 16px;">Olá, <strong>${userName}</strong>!</p>
    
    <div style="background: #1e293b; border-left: 4px solid ${priorityColor}; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <h2 style="color: ${priorityColor}; margin: 0 0 8px;">${notification.title}</h2>
      <p style="margin: 0; color: #cbd5e1;">${notification.message}</p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://travel-hr-buddy.lovable.app${notification.action_url || '/compliance-roadmap'}" 
         style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Ver Detalhes
      </a>
    </div>
    
    <div style="border-top: 1px solid #334155; padding-top: 24px; margin-top: 32px; text-align: center; color: #64748b; font-size: 12px;">
      <p>Esta é uma notificação automática do Cron de Compliance.</p>
      <p>© 2025 NautiOne - Sistema de Gestão Marítima</p>
    </div>
  </div>
</body>
</html>
  `;
}
