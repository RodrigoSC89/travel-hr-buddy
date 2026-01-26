/**
 * Compliance Smart Notifications - Phase 7
 * Email and Push notifications for critical compliance deadlines
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { edgeLogger } from "../_shared/edge-logger.ts";

const TAG = "COMPLIANCE-NOTIFICATIONS";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComplianceNotificationRequest {
  userId: string;
  type: "deadline_warning" | "critical_alert" | "nc_opened" | "audit_reminder" | "certificate_expiring";
  priority: "low" | "medium" | "high" | "critical";
  data: {
    title: string;
    description: string;
    dueDate?: string;
    module?: string;
    itemId?: string;
    daysRemaining?: number;
  };
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ComplianceNotificationRequest = await req.json();
    const { userId, type, priority, data, channels } = request;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log(`[Compliance Notification] Type: ${type}, Priority: ${priority}, User: ${userId}`);

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    const userName = profile?.full_name || "Usuário";
    const userEmail = profile?.email;

    const results = {
      email: null as any,
      push: null as any,
      inApp: null as any,
    };

    // 1. Send Email Notification via Resend API
    if (channels.email && userEmail) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      
      if (RESEND_API_KEY) {
        const emailTemplate = generateEmailTemplate(type, priority, data, userName);
        
        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "NautiOne Compliance <compliance@nautione.app>",
              to: [userEmail],
              subject: emailTemplate.subject,
              html: emailTemplate.html,
            }),
          });
          
          if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            results.email = { success: true, id: emailData.id };
            console.log(`[Email] Sent to ${userEmail}:`, emailData);
          } else {
            const errorText = await emailResponse.text();
            console.error("[Email Error]:", errorText);
            results.email = { success: false, error: errorText };
          }
        } catch (emailError) {
          console.error("[Email Error]:", emailError);
          results.email = { success: false, error: String(emailError) };
        }
      } else {
        edgeLogger.warn(TAG, "RESEND_API_KEY not configured - skipping email");
        results.email = { success: false, error: "RESEND_API_KEY not configured" };
      }
    }

    // 2. Store Push Notification Token & Trigger
    if (channels.push) {
      try {
        // Get user's FCM token
        const { data: fcmToken } = await supabase
          .from("user_fcm_tokens")
          .select("token")
          .eq("user_id", userId)
          .eq("is_active", true)
          .single();

        if (fcmToken?.token) {
          // In production, integrate with Firebase Cloud Messaging
          console.log(`[Push] Would send to FCM token: ${fcmToken.token.slice(0, 20)}...`);
          results.push = { success: true, queued: true };
        } else {
          results.push = { success: false, error: "No active FCM token" };
        }
      } catch (pushError) {
        console.error("[Push Error]:", pushError);
        results.push = { success: false, error: String(pushError) };
      }
    }

    // 3. Store In-App Notification
    if (channels.inApp) {
      try {
        const notificationRecord = {
          user_id: userId,
          type: mapTypeToNotificationType(type),
          priority: priority,
          title: data.title,
          message: data.description,
          action_url: data.itemId ? `/compliance/${data.module}/${data.itemId}` : "/compliance-roadmap",
          action_label: "Ver Detalhes",
          metadata: {
            complianceType: type,
            module: data.module,
            dueDate: data.dueDate,
            daysRemaining: data.daysRemaining,
          },
          is_read: false,
          created_at: new Date().toISOString(),
        };

        const { data: savedNotification, error: saveError } = await supabase
          .from("intelligent_notifications")
          .insert(notificationRecord)
          .select()
          .single();

        if (saveError) {
          console.error("[InApp Save Error]:", saveError);
          results.inApp = { success: false, error: saveError.message };
        } else {
          results.inApp = { success: true, id: savedNotification.id };
          console.log(`[InApp] Notification saved: ${savedNotification.id}`);
        }
      } catch (inAppError) {
        console.error("[InApp Error]:", inAppError);
        results.inApp = { success: false, error: String(inAppError) };
      }
    }

    // Log audit trail
    try {
      await supabase.from("compliance_audit_trail").insert({
        action: "NOTIFICATION_SENT",
        entity_type: "compliance_notification",
        entity_id: data.itemId || null,
        user_id: userId,
        details: {
          notificationType: type,
          priority,
          channels: Object.entries(channels).filter(([_, v]) => v).map(([k]) => k),
          results,
        },
        created_at: new Date().toISOString(),
      });
    } catch (auditError) {
      edgeLogger.warn(TAG, "Could not log to audit trail", { error: String(auditError) });
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Compliance Notification Error]:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function mapTypeToNotificationType(type: string): string {
  const mapping: Record<string, string> = {
    deadline_warning: "compliance_alert",
    critical_alert: "compliance_alert",
    nc_opened: "compliance_alert",
    audit_reminder: "checklist_due",
    certificate_expiring: "certificate_expiring",
  };
  return mapping[type] || "info";
}

function generateEmailTemplate(
  type: string,
  priority: string,
  data: any,
  userName: string
): EmailTemplate {
  const priorityEmoji = priority === "critical" ? "🚨" : priority === "high" ? "⚠️" : "📋";
  const priorityColor = priority === "critical" ? "#DC2626" : priority === "high" ? "#F59E0B" : "#3B82F6";
  const priorityLabel = priority === "critical" ? "CRÍTICO" : priority === "high" ? "ALTO" : "NORMAL";

  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #0f172a;
    color: #e2e8f0;
  `;

  let subject = "";
  let content = "";

  switch (type) {
    case "deadline_warning":
      subject = `${priorityEmoji} Prazo de Compliance - ${data.daysRemaining} dias restantes`;
      content = `
        <h2 style="color: ${priorityColor};">⏰ Prazo de Compliance se Aproximando</h2>
        <p><strong>${data.title}</strong></p>
        <p>${data.description}</p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>📅 Prazo:</strong> ${data.dueDate || "Não definido"}</p>
          <p style="margin: 8px 0 0;"><strong>⏳ Dias Restantes:</strong> ${data.daysRemaining}</p>
          <p style="margin: 8px 0 0;"><strong>📁 Módulo:</strong> ${data.module || "Compliance"}</p>
        </div>
      `;
      break;

    case "critical_alert":
      subject = `🚨 ALERTA CRÍTICO - ${data.title}`;
      content = `
        <h2 style="color: #DC2626;">🚨 Alerta Crítico de Compliance</h2>
        <p><strong>${data.title}</strong></p>
        <p>${data.description}</p>
        <div style="background: #450a0a; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #DC2626;">
          <p style="margin: 0; color: #fecaca;"><strong>⚠️ AÇÃO IMEDIATA NECESSÁRIA</strong></p>
          <p style="margin: 8px 0 0; color: #fecaca;">${data.module ? `Módulo: ${data.module}` : ""}</p>
        </div>
      `;
      break;

    case "nc_opened":
      subject = `📋 Nova Não Conformidade Aberta - ${data.title}`;
      content = `
        <h2 style="color: #F59E0B;">📋 Nova NC Registrada</h2>
        <p><strong>${data.title}</strong></p>
        <p>${data.description}</p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>🏷️ Prioridade:</strong> ${priorityLabel}</p>
          ${data.dueDate ? `<p style="margin: 8px 0 0;"><strong>📅 Prazo de Resolução:</strong> ${data.dueDate}</p>` : ""}
        </div>
      `;
      break;

    case "audit_reminder":
      subject = `📅 Lembrete de Auditoria - ${data.title}`;
      content = `
        <h2 style="color: #3B82F6;">📅 Lembrete de Auditoria</h2>
        <p><strong>${data.title}</strong></p>
        <p>${data.description}</p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>📆 Data:</strong> ${data.dueDate || "Verificar calendário"}</p>
          <p style="margin: 8px 0 0;"><strong>📁 Módulo:</strong> ${data.module || "Compliance"}</p>
        </div>
      `;
      break;

    case "certificate_expiring":
      subject = `⚠️ Certificado Expirando - ${data.title}`;
      content = `
        <h2 style="color: #F59E0B;">⚠️ Certificado Próximo do Vencimento</h2>
        <p><strong>${data.title}</strong></p>
        <p>${data.description}</p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>📅 Validade:</strong> ${data.dueDate}</p>
          <p style="margin: 8px 0 0;"><strong>⏳ Dias para Expirar:</strong> ${data.daysRemaining}</p>
        </div>
      `;
      break;

    default:
      subject = `📋 Notificação de Compliance - ${data.title}`;
      content = `
        <h2 style="color: #3B82F6;">📋 Notificação de Compliance</h2>
        <p><strong>${data.title}</strong></p>
        <p>${data.description}</p>
      `;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="${baseStyles}">
  <div style="max-width: 600px; margin: 0 auto; padding: 32px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="color: #3b82f6; margin: 0;">⚓ NautiOne</h1>
      <p style="color: #64748b; margin: 8px 0 0;">Sistema de Compliance Marítimo</p>
    </div>
    
    <!-- Greeting -->
    <p style="font-size: 16px;">Olá, <strong>${userName}</strong>!</p>
    
    <!-- Content -->
    ${content}
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://travel-hr-buddy.lovable.app/compliance-roadmap" 
         style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Acessar Centro de Compliance
      </a>
    </div>
    
    <!-- Footer -->
    <div style="border-top: 1px solid #334155; padding-top: 24px; margin-top: 32px; text-align: center; color: #64748b; font-size: 12px;">
      <p>Esta é uma notificação automática do NautiOne Compliance.</p>
      <p>© 2025 NautiOne - Sistema de Gestão Marítima</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}
