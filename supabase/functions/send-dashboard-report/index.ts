// Edge Function: send-dashboard-report
// Sends automated dashboard reports to all users via email
// POST /functions/v1/send-dashboard-report

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DashboardSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
}

/**
 * Generate HTML email template with gradient header
 */
function generateEmailHtml(
  userName: string,
  summary: DashboardSummary,
  publicUrl: string
): string {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Gradient Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                📊 Dashboard Report
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">
                ${currentDate}
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <p style="margin: 0; font-size: 16px; color: #333333;">
                Olá ${userName || ""},
              </p>
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                Aqui está o resumo do seu dashboard de restaurações de documentos:
              </p>
            </td>
          </tr>
          
          <!-- Statistics -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 6px; padding: 20px;">
                <tr>
                  <td style="padding: 10px 0;">
                    <div style="font-size: 14px; color: #666666;">Total de Restaurações</div>
                    <div style="font-size: 32px; font-weight: bold; color: #667eea; margin-top: 5px;">
                      ${summary.total}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
                    <div style="font-size: 14px; color: #666666;">Documentos Únicos</div>
                    <div style="font-size: 24px; font-weight: bold; color: #764ba2; margin-top: 5px;">
                      ${summary.unique_docs}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
                    <div style="font-size: 14px; color: #666666;">Média por Dia</div>
                    <div style="font-size: 24px; font-weight: bold; color: #10b981; margin-top: 5px;">
                      ${summary.avg_per_day.toFixed(1)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Features Summary -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <h2 style="font-size: 18px; color: #333333; margin: 0 0 15px 0;">Recursos do Dashboard</h2>
              <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                <li>Estatísticas em tempo real</li>
                <li>Visualização de tendências (15 dias)</li>
                <li>Modo público para displays</li>
                <li>Código QR para acesso móvel</li>
              </ul>
            </td>
          </tr>
          
          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <a href="${publicUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Ver Dashboard Completo
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #999999; text-align: center;">
                Este é um relatório automático enviado pelo sistema Nautilus One.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999; text-align: center;">
                © ${new Date().getFullYear()} Nautilus One. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }

    // Get base URL for dashboard link
    const baseUrl = Deno.env.get("BASE_URL") || "https://your-app.com";
    const publicDashboardUrl = `${baseUrl}/admin/dashboard?public=1`;

    // Get email sender
    const emailFrom = Deno.env.get("EMAIL_FROM") || "dashboard@empresa.com";

    console.log("📊 Starting dashboard report generation...");

    // Fetch dashboard summary statistics
    const { data: summaryData, error: summaryError } = await supabase
      .rpc("get_restore_summary", { email_input: null });

    if (summaryError) {
      console.error("Error fetching summary:", summaryError);
      throw summaryError;
    }

    const summary: DashboardSummary = summaryData && summaryData.length > 0
      ? summaryData[0]
      : { total: 0, unique_docs: 0, avg_per_day: 0 };

    console.log(`✅ Summary fetched: ${summary.total} total, ${summary.unique_docs} unique, ${summary.avg_per_day.toFixed(1)} avg/day`);

    // Fetch all users with email addresses
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .not("email", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users with email addresses found",
          sent: 0,
          failed: 0,
          total: 0,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`📧 Sending emails to ${profiles.length} users...`);

    // Send emails to all users
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const profile of profiles as UserProfile[]) {
      try {
        const htmlContent = generateEmailHtml(
          profile.full_name || profile.email,
          summary,
          publicDashboardUrl
        );

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: emailFrom,
            to: profile.email,
            subject: `📊 Dashboard Report - ${new Date().toLocaleDateString("pt-BR")}`,
            html: htmlContent,
          }),
        });

        if (response.ok) {
          sentCount++;
          console.log(`✅ Email sent to ${profile.email}`);
        } else {
          const errorData = await response.text();
          failedCount++;
          errors.push(`${profile.email}: ${errorData}`);
          console.error(`❌ Failed to send to ${profile.email}: ${errorData}`);
        }
      } catch (error) {
        failedCount++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`${profile.email}: ${errorMsg}`);
        console.error(`❌ Error sending to ${profile.email}:`, error);
      }
    }

    console.log(`✅ Email sending complete: ${sentCount} sent, ${failedCount} failed, ${profiles.length} total`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dashboard reports sent successfully",
        sent: sentCount,
        failed: failedCount,
        total: profiles.length,
        errors: errors.length > 0 ? errors : undefined,
        summary,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error sending dashboard reports:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
