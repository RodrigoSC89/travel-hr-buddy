// ✅ Edge Function: send-restore-dashboard
// Endpoint to send restore dashboard report via email with PDF/CSV attachment
// POST /functions/v1/send-restore-dashboard
// Body: { email: "user@example.com" } (optional, uses authenticated user's email if not provided)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RestoreCountData {
  day: string;
  count: number;
}

/**
 * Generate CSV content from restore count data (simulating PDF table)
 */
function generateReportContent(data: RestoreCountData[]): string {
  const headers = ["Data", "Restaurações"];
  const rows = data.map((d) => [
    new Date(d.day).toLocaleDateString("pt-BR"),
    d.count.toString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => 
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Generate HTML email content
 */
function generateEmailHtml(data: RestoreCountData[], recipientEmail: string): string {
  const totalRestores = data.reduce((sum, d) => sum + d.count, 0);
  const tableRows = data.map((d) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${new Date(d.day).toLocaleDateString('pt-BR')}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${d.count}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9f9f9; }
          .summary-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; }
          th { background-color: #4f46e5; color: white; padding: 12px; text-align: left; border: 1px solid #ddd; }
          td { border: 1px solid #ddd; padding: 8px; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Relatório de Restaurações</h1>
            <p>Nautilus One - Travel HR Buddy</p>
            <p>${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div class="content">
            <div class="summary-box">
              <h2>📈 Resumo do Relatório</h2>
              <p><strong>Total de Restaurações:</strong> ${totalRestores}</p>
              <p><strong>Período:</strong> Últimos ${data.length} dias</p>
              <p><strong>Destinatário:</strong> ${recipientEmail}</p>
            </div>
            
            <h3>📋 Detalhamento por Dia</h3>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th style="text-align: center;">Restaurações</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            
            <p style="margin-top: 20px;">
              O relatório completo em formato CSV está anexado a este email para análise detalhada.
            </p>
          </div>
          <div class="footer">
            <p>Este é um email automático gerado sob demanda ou via agendamento.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  toEmail: string,
  subject: string,
  htmlContent: string,
  csvContent: string,
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
      attachments: csvContent ? [{
        filename: `relatorio-restauracoes-${new Date().toISOString().split('T')[0]}.csv`,
        content: btoa(csvContent),
      }] : [],
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
  csvContent: string,
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
        email: Deno.env.get("EMAIL_FROM") || "dash@empresa.com",
        name: "Nautilus One Reports"
      },
      subject: subject,
      content: [{ type: "text/html", value: htmlContent }],
      attachments: csvContent ? [{
        content: btoa(csvContent),
        filename: `relatorio-restauracoes-${new Date().toISOString().split('T')[0]}.csv`,
        type: "text/csv",
        disposition: "attachment",
      }] : [],
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

  try {
    console.log("🚀 Starting send-restore-dashboard...");

    // Parse request body
    const body = await req.json();
    const emailInput = body.email;

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If no email provided, try to get from authenticated user
    let recipientEmail = emailInput;
    
    if (!recipientEmail) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const supabaseAuth = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          {
            global: {
              headers: { Authorization: authHeader },
            },
          }
        );
        
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (!authError && user?.email) {
          recipientEmail = user.email;
        }
      }
    }

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`📊 Fetching restore data for email: ${emailInput || "all"}`);

    // Call RPC function to get restore count by day
    const { data, error } = await supabase.rpc('get_restore_count_by_day_with_email', {
      email_input: emailInput || null,
    });

    if (error) {
      console.error("Error fetching restore data:", error);
      throw new Error(`Failed to fetch restore data: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log("⚠️ No restore data found");
      return new Response(
        JSON.stringify({ 
          status: "ok",
          message: "No restore data found for the specified criteria",
          recipient: recipientEmail,
          dataCount: 0
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`✅ Fetched ${data.length} days of restore data`);

    // Generate report content
    const csvContent = generateReportContent(data);
    const emailHtml = generateEmailHtml(data, recipientEmail);

    console.log("📧 Sending email report...");

    // Get email service API keys
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (!resendApiKey && !sendgridApiKey) {
      throw new Error("RESEND_API_KEY or SENDGRID_API_KEY must be configured");
    }

    // Send email
    const subject = "📊 Relatório Diário de Restaurações";
    
    try {
      if (resendApiKey) {
        console.log("Using Resend API...");
        await sendEmailViaResend(recipientEmail, subject, emailHtml, csvContent, resendApiKey);
      } else {
        console.log("Using SendGrid API...");
        await sendEmailViaSendGrid(recipientEmail, subject, emailHtml, csvContent, sendgridApiKey!);
      }
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError);
      throw emailError;
    }

    console.log("✅ Email sent successfully!");

    return new Response(
      JSON.stringify({ 
        status: "ok",
        message: "Relatório enviado por e-mail com sucesso!",
        recipient: recipientEmail,
        dataCount: data.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Error in send-restore-dashboard:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An error occurred while sending the report";
    
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
