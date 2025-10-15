import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MmiJob {
  id: string;
  title: string;
  component_id: string;
  priority: string;
  due_date: string;
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  toEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") || "engenharia@nautilusone.io",
      to: toEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }
}

/**
 * Send email via SendGrid API (fallback)
 */
async function sendEmailViaSendGrid(
  toEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { 
        email: Deno.env.get("EMAIL_FROM") || "engenharia@nautilusone.io",
        name: "Nautilus One Alerts"
      },
      subject: subject,
      content: [
        { type: "text/plain", value: textContent },
        { type: "text/html", value: htmlContent }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    console.log("🚀 Starting MMI alerts check...");

    // Calculate date 3 days from now
    const threeDaysFromNow = new Date(Date.now() + 3 * 86400000).toISOString();

    // Query jobs with Alta or Crítica priority and due date within 3 days
    const { data: jobs, error } = await supabase
      .from("mmi_jobs")
      .select("*")
      .in("priority", ["Alta", "Crítica"])
      .lt("due_date", threeDaysFromNow);

    if (error) {
      console.error("Error fetching jobs:", error);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    if (!jobs || jobs.length === 0) {
      console.log("✅ No critical jobs found within 3-day deadline");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Sem jobs críticos",
          jobsCount: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`⚠️ Found ${jobs.length} critical job(s) requiring attention`);

    // Generate email content
    const textBody = `🚨 ALERTA DE MANUTENÇÃO 🚨\n\n${jobs
      .map(
        (j: MmiJob) =>
          `• ${j.title} | Componente: ${j.component_id} | Prazo: ${j.due_date.slice(0, 10)}\n`
      )
      .join("")}\n\nVerifique no sistema Nautilus One.`;

    // Generate HTML email body
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
            .content { padding: 20px; background: #f9f9f9; }
            .alert-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .job-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .job-title { font-weight: bold; color: #1f2937; font-size: 16px; }
            .job-details { color: #6b7280; font-size: 14px; margin-top: 5px; }
            .priority-critical { color: #dc2626; font-weight: bold; }
            .priority-high { color: #f59e0b; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚨 ALERTA DE MANUTENÇÃO</h1>
            <p>Nautilus One - Sistema de Manutenção</p>
            <p>${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2>⚠️ Jobs Críticos Requerem Atenção</h2>
              <p>Foram identificados <strong>${jobs.length} job(s)</strong> com prioridade Alta ou Crítica vencendo em até 3 dias.</p>
            </div>
            ${jobs
              .map(
                (j: MmiJob) => `
              <div class="job-item">
                <div class="job-title">${j.title}</div>
                <div class="job-details">
                  <span class="${j.priority === 'Crítica' ? 'priority-critical' : 'priority-high'}">Prioridade: ${j.priority}</span><br>
                  <strong>Componente:</strong> ${j.component_id}<br>
                  <strong>Prazo:</strong> ${new Date(j.due_date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            `
              )
              .join("")}
            <p style="margin-top: 20px;">Verifique no sistema Nautilus One para mais detalhes.</p>
          </div>
          <div class="footer">
            <p>Este é um email automático de alerta de manutenção.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One</p>
          </div>
        </body>
      </html>
    `;

    // Get email configuration
    const recipientEmail = Deno.env.get("MMI_ALERT_EMAIL") || "engenharia@nautilusone.io";
    const subject = "⚠️ Jobs críticos em manutenção";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (!resendApiKey && !sendgridApiKey) {
      throw new Error("RESEND_API_KEY or SENDGRID_API_KEY must be configured");
    }

    console.log(`📧 Sending alert email to ${recipientEmail}...`);

    // Send email via Resend or SendGrid
    if (resendApiKey) {
      console.log("Using Resend API...");
      await sendEmailViaResend(recipientEmail, subject, htmlBody, textBody, resendApiKey);
    } else if (sendgridApiKey) {
      console.log("Using SendGrid API...");
      await sendEmailViaSendGrid(recipientEmail, subject, htmlBody, textBody, sendgridApiKey);
    }

    console.log("✅ Alert email sent successfully!");

    return new Response(
      JSON.stringify({
        success: true,
        message: `✅ Alerta enviado para ${jobs.length} job(s)`,
        jobsCount: jobs.length,
        recipient: recipientEmail
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Error in send-alerts:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro ao enviar e-mail",
        details: errorMessage
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
