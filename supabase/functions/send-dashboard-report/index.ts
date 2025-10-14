// Supabase Edge Function: send-dashboard-report
// Sends dashboard report emails to all users with public dashboard link

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Generate HTML email template with dashboard link
 */
function generateEmailHtml(publicUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
          }
          .content { 
            padding: 30px 20px; 
            background: #f9f9f9; 
          }
          .summary-box { 
            background: white; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 20px 0; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666; 
            font-size: 12px; 
            background: #f0f0f0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Painel Diário de Indicadores</h1>
          <p>Nautilus One - Travel HR Buddy</p>
          <p>${new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <div class="content">
          <div class="summary-box">
            <h2>📈 Dashboard Atualizado</h2>
            <p>O painel de indicadores foi atualizado com os dados mais recentes:</p>
            <ul>
              <li>✅ Estatísticas em tempo real</li>
              <li>📊 Tendências dos últimos 15 dias</li>
              <li>📱 Acesso otimizado para mobile e TV</li>
            </ul>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${publicUrl}" class="cta-button">
                🔗 Acessar Dashboard
              </a>
            </p>
          </div>
          <p style="text-align: center; color: #666; font-size: 14px;">
            Link de acesso direto:<br>
            <a href="${publicUrl}" style="color: #667eea;">${publicUrl}</a>
          </p>
        </div>
        <div class="footer">
          <p>Este é um email automático gerado diariamente às 09:00 (UTC-3).</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  to: string,
  subject: string,
  html: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("EMAIL_FROM") || "dash@empresa.com",
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Failed to send email to ${to}:`, errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const baseUrl = Deno.env.get("BASE_URL");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    if (!baseUrl) {
      throw new Error("BASE_URL environment variable is not set");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all users with email from profiles table
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("email")
      .not("email", "is", null);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users with email found",
          emailsSent: 0,
          emailsFailed: 0,
          totalUsers: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Generate public dashboard URL
    const publicUrl = `${baseUrl}/admin/dashboard?public=1`;
    const emailHtml = generateEmailHtml(publicUrl);
    const subject = "📊 Painel Diário de Indicadores";

    // Send email to each user
    let emailsSent = 0;
    let emailsFailed = 0;
    const failedEmails: string[] = [];

    for (const user of users) {
      if (user.email) {
        const result = await sendEmailViaResend(
          user.email,
          subject,
          emailHtml,
          resendApiKey
        );

        if (result.success) {
          emailsSent++;
        } else {
          emailsFailed++;
          failedEmails.push(user.email);
        }
      }
    }

    console.log(`Dashboard report sent: ${emailsSent} success, ${emailsFailed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Dashboard report emails sent successfully`,
        emailsSent,
        emailsFailed,
        totalUsers: users.length,
        failedEmails: emailsFailed > 0 ? failedEmails : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-dashboard-report:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
