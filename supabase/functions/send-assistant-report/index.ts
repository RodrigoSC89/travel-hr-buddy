import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssistantLog {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  user_email: string;
}

interface EmailRequest {
  logs: AssistantLog[];
  toEmail?: string;
  subject?: string;
}

/**
 * Generate PDF content as base64 string using jsPDF-like approach
 * Note: For Deno, we generate a simple CSV-like text representation
 * For full PDF support, use a client-side library or external service
 */
function generatePDFData(logs: AssistantLog[]): string {
  // Generate CSV-like content that can be converted to PDF
  // In production, you would use a PDF library or service
  const headers = ["Data/Hora", "Usuário", "Pergunta", "Resposta"];
  const rows = logs.map((log) => [
    new Date(log.created_at).toLocaleString('pt-BR'),
    log.user_email || 'Anônimo',
    log.question.replace(/[\r\n]+/g, ' ').substring(0, 200),
    log.answer.replace(/<[^>]*>/g, '').replace(/[\r\n]+/g, ' ').substring(0, 300),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => 
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return btoa(csvContent); // Base64 encode
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(
  toEmail: string,
  subject: string,
  htmlContent: string,
  pdfBase64: string,
  apiKey: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_FROM") || "relatorios@nautilus.ai",
      to: toEmail,
      subject: subject,
      html: htmlContent,
      attachments: [{
        filename: `relatorio-assistente-${new Date().toISOString().split('T')[0]}.csv`,
        content: pdfBase64,
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }
}

/**
 * Send email via SendGrid API
 */
async function sendEmailViaSendGrid(
  toEmail: string,
  subject: string,
  htmlContent: string,
  pdfBase64: string,
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
        email: Deno.env.get("EMAIL_FROM") || "relatorios@nautilus.ai",
        name: "Nautilus One Reports"
      },
      subject: subject,
      content: [{ type: "text/html", value: htmlContent }],
      attachments: [{
        content: pdfBase64,
        filename: `relatorio-assistente-${new Date().toISOString().split('T')[0]}.csv`,
        type: "text/csv",
        disposition: "attachment",
      }],
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
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Verify user with Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const { logs, toEmail, subject }: EmailRequest = await req.json();
    
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      // Log error - no data to send
      try {
        await supabaseClient.from("assistant_report_logs").insert({
          user_id: user.id,
          user_email: user.email || "unknown",
          status: "error",
          message: "Nenhum dado para enviar.",
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
      }

      return new Response(
        JSON.stringify({ error: "Nenhum dado para enviar." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get email configuration from environment
    const emailFrom = Deno.env.get("EMAIL_FROM") || "relatorios@nautilus.ai";
    const recipientEmail = toEmail || user.email || Deno.env.get("EMAIL_TO") || "admin@empresa.com";
    const emailSubject = subject || "📊 Relatório do Assistente IA";

    console.log(`📧 Preparing email report for ${recipientEmail}`);
    console.log(`📊 Total interactions: ${logs.length}`);

    // Generate PDF data (as CSV for now)
    const pdfData = generatePDFData(logs);

    // Generate HTML table from logs for email body
    const tableRows = logs.map((log) => {
      const date = new Date(log.created_at).toLocaleString('pt-BR');
      const question = log.question.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const answer = log.answer.replace(/<a /g, '<a target="_blank" ');
      const email = log.user_email || 'Anônimo';
      
      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${date}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${email}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${question}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${answer}</td>
        </tr>
      `;
    }).join('');
    
    // Build the email HTML content
    const emailHTML = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 900px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0f172a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .summary { background-color: #e0e7ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; }
            th { background-color: #4f46e5; color: white; padding: 12px; text-align: left; border: 1px solid #ddd; }
            td { border: 1px solid #ddd; padding: 8px; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Relatório do Assistente IA</h1>
              <p>Nautilus One - Travel HR Buddy</p>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Segue em anexo o relatório das interações com o Assistente IA conforme solicitado.</p>
              
              <div class="summary">
                <h3>📊 Resumo</h3>
                <p><strong>Total de interações:</strong> ${logs.length}</p>
                <p><strong>Data de geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              </div>

              <p>O relatório completo está anexado a este email em formato CSV.</p>
            </div>
            <div class="footer">
              <p>Este é um email automático. Por favor, não responda.</p>
              <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Try sending email via Resend or SendGrid
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (resendApiKey) {
      console.log("📨 Sending via Resend...");
      await sendEmailViaResend(recipientEmail, emailSubject, emailHTML, pdfData, resendApiKey);
    } else if (sendgridApiKey) {
      console.log("📨 Sending via SendGrid...");
      await sendEmailViaSendGrid(recipientEmail, emailSubject, emailHTML, pdfData, sendgridApiKey);
    } else {
      throw new Error("RESEND_API_KEY or SENDGRID_API_KEY must be configured");
    }

    console.log("✅ Email sent successfully!");

    // Log success
    try {
      await supabaseClient.from("assistant_report_logs").insert({
        user_id: user.id,
        user_email: recipientEmail,
        status: "success",
        message: "Enviado com sucesso",
      });
    } catch (logError) {
      console.error("Failed to log success:", logError);
    }

    return new Response(
      JSON.stringify({ 
        status: "ok",
        message: "Relatório enviado por e-mail com sucesso!",
        recipient: recipientEmail,
        logsCount: logs.length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Error in send-assistant-report:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An error occurred while sending the report";
    
    // Log error - unexpected failure
    try {
      // Create a basic supabase client for logging errors
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? ""
      );
      
      await supabaseClient.from("assistant_report_logs").insert({
        user_email: "system",
        status: "error",
        message: errorMessage,
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
    
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
