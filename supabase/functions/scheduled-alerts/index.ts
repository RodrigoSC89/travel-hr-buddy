/**
 * Scheduled Alerts Edge Function
 * Runs on schedule to check for expiring documents, certificates, etc.
 * and sends automated notifications
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const results = {
    certificates: 0,
    documents: 0,
    maintenance: 0,
    contracts: 0,
    scheduled: 0,
    errors: [] as string[],
  };

  try {
    // 1. Check certificate expirations (30 days warning)
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const today = new Date();

    const { data: expiringCerts } = await supabase
      .from("crew_certificates")
      .select(`
        id,
        certificate_type,
        certificate_number,
        expiry_date,
        crew_member:crew_members(id, full_name, user_id)
      `)
      .gte("expiry_date", today.toISOString())
      .lte("expiry_date", thirtyDaysFromNow.toISOString())
      .eq("status", "active");

    for (const cert of expiringCerts || []) {
      try {
        if (!cert.crew_member?.user_id) continue;

        const daysUntilExpiry = Math.ceil(
          (new Date(cert.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // Check if notification already sent today
        const { data: existing } = await supabase
          .from("user_notifications")
          .select("id")
          .eq("user_id", cert.crew_member.user_id)
          .eq("resource_type", "certificate")
          .eq("resource_id", cert.id)
          .gte("created_at", new Date().toISOString().split("T")[0]);

        if (existing && existing.length > 0) continue;

        // Get user's organization
        const { data: orgMember } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", cert.crew_member.user_id)
          .maybeSingle();

        // Create notification
        await supabase.from("user_notifications").insert({
          user_id: cert.crew_member.user_id,
          organization_id: orgMember?.organization_id,
          title: "Certificado Expirando",
          message: `Seu certificado ${cert.certificate_type} (${cert.certificate_number}) expira em ${daysUntilExpiry} dias.`,
          category: daysUntilExpiry <= 7 ? "urgent" : "alert",
          priority: daysUntilExpiry <= 7 ? "high" : "normal",
          resource_type: "certificate",
          resource_id: cert.id,
          action_url: `/crew/certificates/${cert.id}`,
          action_label: "Ver Certificado",
        });

        // Queue email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", cert.crew_member.user_id)
          .single();

        if (profile?.email) {
          await supabase.from("email_queue").insert({
            to_email: profile.email,
            to_name: profile.full_name,
            subject: `⚠️ Certificado Expirando - ${cert.certificate_type}`,
            html_body: generateCertificateExpiryEmail(
              cert.crew_member.full_name,
              cert.certificate_type,
              cert.certificate_number,
              cert.expiry_date,
              daysUntilExpiry
            ),
            priority: daysUntilExpiry <= 7 ? "high" : "normal",
          });
        }

        results.certificates++;
      } catch (error) {
        results.errors.push(`Certificate ${cert.id}: ${error}`);
      }
    }

    // 2. Check maintenance due dates
    const { data: dueMaintenance } = await supabase
      .from("maintenance_tasks")
      .select(`
        id,
        title,
        due_date,
        priority,
        vessel:vessels(id, name),
        assigned_to
      `)
      .gte("due_date", today.toISOString())
      .lte("due_date", thirtyDaysFromNow.toISOString())
      .in("status", ["pending", "scheduled"]);

    for (const task of dueMaintenance || []) {
      try {
        if (!task.assigned_to) continue;

        const daysUntilDue = Math.ceil(
          (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        // Only notify for tasks due in 7 days or less
        if (daysUntilDue > 7) continue;

        const { data: existing } = await supabase
          .from("user_notifications")
          .select("id")
          .eq("user_id", task.assigned_to)
          .eq("resource_type", "maintenance")
          .eq("resource_id", task.id)
          .gte("created_at", new Date().toISOString().split("T")[0]);

        if (existing && existing.length > 0) continue;

        const { data: orgMember } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", task.assigned_to)
          .maybeSingle();

        await supabase.from("user_notifications").insert({
          user_id: task.assigned_to,
          organization_id: orgMember?.organization_id,
          title: "Manutenção Programada",
          message: `A manutenção "${task.title}" ${task.vessel?.name ? `na ${task.vessel.name}` : ""} vence em ${daysUntilDue} dia(s).`,
          category: "reminder",
          priority: daysUntilDue <= 2 ? "high" : "normal",
          resource_type: "maintenance",
          resource_id: task.id,
          action_url: `/maintenance/${task.id}`,
          action_label: "Ver Tarefa",
        });

        results.maintenance++;
      } catch (error) {
        results.errors.push(`Maintenance ${task.id}: ${error}`);
      }
    }

    // 3. Process scheduled notifications
    const { data: scheduled } = await supabase
      .from("scheduled_notifications")
      .select("*")
      .lte("scheduled_for", new Date().toISOString())
      .is("sent_at", null);

    for (const notification of scheduled || []) {
      try {
        // Get template
        const { data: template } = await supabase
          .from("notification_templates")
          .select("*")
          .eq("name", notification.template_name)
          .eq("is_active", true)
          .single();

        if (!template) continue;

        // Render and send
        const rendered = renderTemplate(template, notification.variables);

        const { data: orgMember } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", notification.user_id)
          .maybeSingle();

        await supabase.from("user_notifications").insert({
          user_id: notification.user_id,
          organization_id: orgMember?.organization_id,
          title: rendered.title,
          message: rendered.message,
          category: template.category,
          priority: template.priority,
        });

        // Mark as sent
        await supabase
          .from("scheduled_notifications")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", notification.id);

        results.scheduled++;
      } catch (error) {
        results.errors.push(`Scheduled ${notification.id}: ${error}`);

        await supabase
          .from("scheduled_notifications")
          .update({
            failed_at: new Date().toISOString(),
            error_message: String(error),
          })
          .eq("id", notification.id);
      }
    }

    console.log("Scheduled alerts processed:", results);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in scheduled alerts:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function renderTemplate(
  template: { title: string; message: string },
  variables: Record<string, string>
): { title: string; message: string } {
  let title = template.title;
  let message = template.message;

  for (const [key, value] of Object.entries(variables)) {
    title = title.replace(new RegExp(`{{${key}}}`, "g"), value);
    message = message.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  return { title, message };
}

function generateCertificateExpiryEmail(
  crewName: string,
  certType: string,
  certNumber: string,
  expiryDate: string,
  daysRemaining: number
): string {
  const formattedDate = new Date(expiryDate).toLocaleDateString("pt-BR");
  const isUrgent = daysRemaining <= 7;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: ${isUrgent ? "#dc2626" : "#f59e0b"}; color: white; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 32px 24px; }
    .alert-box { background: ${isUrgent ? "#fef2f2" : "#fffbeb"}; border: 1px solid ${isUrgent ? "#fecaca" : "#fde68a"}; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { color: #6b7280; }
    .info-value { font-weight: 600; }
    .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 24px; }
    .footer { padding: 24px; text-align: center; color: #6b7280; font-size: 12px; background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isUrgent ? "🚨" : "⚠️"} Certificado Expirando</h1>
    </div>
    <div class="content">
      <p>Olá <strong>${crewName}</strong>,</p>
      
      <div class="alert-box">
        <strong>${isUrgent ? "ATENÇÃO URGENTE:" : "Atenção:"}</strong> Seu certificado está próximo do vencimento!
      </div>
      
      <div style="margin: 24px 0;">
        <div class="info-row">
          <span class="info-label">Certificado:</span>
          <span class="info-value">${certType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Número:</span>
          <span class="info-value">${certNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Data de Vencimento:</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <span class="info-label">Dias Restantes:</span>
          <span class="info-value" style="color: ${isUrgent ? "#dc2626" : "#f59e0b"};">${daysRemaining} dias</span>
        </div>
      </div>
      
      <p>Por favor, providencie a renovação deste certificado o quanto antes para evitar problemas operacionais.</p>
      
      <a href="${Deno.env.get("APP_URL") || "https://nautione.com"}/certificates" class="button">
        Ver Detalhes do Certificado
      </a>
    </div>
    <div class="footer">
      <p>Nauti One - Sistema de Gestão Marítima</p>
      <p><a href="${Deno.env.get("APP_URL") || "https://nautione.com"}/settings?tab=notifications">Gerenciar Notificações</a></p>
    </div>
  </div>
</body>
</html>`;
}
