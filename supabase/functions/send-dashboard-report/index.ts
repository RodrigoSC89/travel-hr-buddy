// ✅ Supabase Edge Function — Send Dashboard Report via Email
// Scheduled function that sends daily dashboard report with public link to all users
// GET /functions/v1/send-dashboard-report

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  toEmail: string,
  subject: string,
  htmlContent: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") || "dash@empresa.com",
      to: toEmail,
      subject: subject,
      html: htmlContent,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }
}

/**
 * Generate HTML email content
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
            background-color: #f4f4f4;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: white;
            border-radius: 10px;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px; 
            margin-bottom: 20px;
          }
          .content { 
            padding: 20px; 
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            padding: 12px 30px;
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
            border-top: 1px solid #ddd;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Painel Diário de Indicadores</h1>
            <p>Nautilus One - Travel HR Buddy</p>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p>O painel diário de indicadores está disponível para visualização.</p>
            <p>Acesse o painel completo clicando no botão abaixo:</p>
            <div style="text-align: center;">
              <a href="${publicUrl}" class="button">🔗 Acessar Painel Completo</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Link direto: <a href="${publicUrl}">${publicUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>Este é um email automático enviado diariamente.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Starting send-dashboard-report...");

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all users with email from profiles table
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("email")
      .not("email", "is", null);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      console.log("⚠️ No users found with email");
      return new Response(
        JSON.stringify({ 
          status: "ok",
          message: "No users with email found",
          emailsSent: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`📧 Found ${users.length} users with email`);

    // Get base URL
    const baseUrl = Deno.env.get("BASE_URL") || Deno.env.get("SUPABASE_URL")?.replace("/rest/v1", "");
    const publicUrl = `${baseUrl}/admin/dashboard?public=1`;

    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY must be configured");
    }

    // Send email to each user
    const subject = "📊 Painel Diário de Indicadores";
    const emailHtml = generateEmailHtml(publicUrl);
    
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        await sendEmailViaResend(user.email, subject, emailHtml, resendApiKey);
        successCount++;
        console.log(`✅ Email sent to ${user.email}`);
      } catch (emailError) {
        errorCount++;
        console.error(`❌ Error sending email to ${user.email}:`, emailError);
      }
    }

    console.log(`✅ Emails sent: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        status: "ok",
        message: "Relatórios enviados com sucesso!",
        emailsSent: successCount,
        emailsFailed: errorCount,
        totalUsers: users.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Error in send-dashboard-report:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An error occurred while sending the reports";
    
    return new Response(
      JSON.stringify({
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
