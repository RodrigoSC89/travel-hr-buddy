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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let userEmail = "unknown";
  
  try {
    // Get user email from authorization token
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.email) {
        userEmail = user.email;
      }
    }

    const { logs, toEmail, subject }: EmailRequest = await req.json();
    
    if (!logs || !Array.isArray(logs)) {
      throw new Error("logs array is required");
    }

    // Get email configuration from environment
    const emailFrom = Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com";
    const defaultEmailTo = Deno.env.get("EMAIL_TO") || "admin@empresa.com";

    const recipientEmail = toEmail || defaultEmailTo;
    const emailSubject = subject || `📜 Relatório do Assistente IA - ${new Date().toLocaleDateString('pt-BR')}`;

    // Generate HTML table from logs
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
    
    // Build the email message
    const emailMessage = {
      from: emailFrom,
      to: recipientEmail,
      subject: emailSubject,
      text: `Relatório do Assistente IA com ${logs.length} interações registradas.\n\nEste é um email automático gerado pelo sistema Nautilus One.`,
      html: `
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
                <h1>📜 Relatório do Assistente IA</h1>
                <p>Nautilus One - Travel HR Buddy</p>
              </div>
              <div class="content">
                <p>Olá,</p>
                <p>Segue abaixo o relatório detalhado de interações com o Assistente IA.</p>
                
                <div class="summary">
                  <h3>📊 Resumo</h3>
                  <p><strong>Total de interações:</strong> ${logs.length}</p>
                  <p><strong>Data de geração:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                </div>

                <h3>📋 Histórico de Interações</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Usuário</th>
                      <th>Pergunta</th>
                      <th>Resposta</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows}
                  </tbody>
                </table>
                
                <p>Para mais detalhes, acesse o dashboard do sistema.</p>
              </div>
              <div class="footer">
                <p>Este é um email automático. Por favor, não responda.</p>
                <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Log the attempt
    console.log("Email prepared successfully");
    console.log(`Recipient: ${recipientEmail}`);
    console.log(`Number of logs: ${logs.length}`);

    // Log the email send attempt to database
    const logResult = await supabase
      .from("assistant_report_logs")
      .insert({
        status: "success",
        message: "Relatório preparado com sucesso",
        user_email: userEmail,
        logs_count: logs.length,
        recipient_email: recipientEmail,
      });

    if (logResult.error) {
      console.error("Error logging report send:", logResult.error);
    }

    // Note: In a real implementation, you would integrate with an email service here
    // For now, we return a success response
    // To implement actual email sending, integrate with SendGrid, Mailgun, AWS SES, etc.
    return new Response(
      JSON.stringify({
        success: true,
        message: "Relatório preparado com sucesso. Configure um serviço de email para envio real.",
        recipient: recipientEmail,
        subject: emailSubject,
        logsCount: logs.length,
        timestamp: new Date().toISOString(),
        note: "Para completar esta funcionalidade, integre com SendGrid, Mailgun, AWS SES, ou configure SMTP em produção"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in send-assistant-report:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An error occurred while sending the report";
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    // Log the error to database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from("assistant_report_logs")
        .insert({
          status: "error",
          message: errorMessage,
          user_email: userEmail,
          logs_count: 0,
        });
    } catch (logError) {
      console.error("Error logging error:", logError);
    }
    
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
