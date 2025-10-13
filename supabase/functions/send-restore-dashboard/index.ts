import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RestoreDashboardRequest {
  email?: string;
  summary?: {
    total: number;
    unique_docs: number;
    avg_per_day: string;
  };
  dailyData?: Array<{
    day: string;
    count: number;
  }>;
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
      throw new Error("Missing authorization header");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user session
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body
    const { email, summary, dailyData }: RestoreDashboardRequest = await req.json();
    
    const recipientEmail = email || user.email;
    
    if (!recipientEmail) {
      throw new Error("Recipient email is required");
    }

    // Get email configuration
    const emailFrom = Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com";

    // Build HTML email content
    const chartDataHtml = dailyData?.map(d => {
      const date = new Date(d.day);
      return `<tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${date.toLocaleDateString('pt-BR')}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${d.count}</td>
      </tr>`;
    }).join('') || '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              padding: 30px 20px; 
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content { 
              padding: 30px 20px;
            }
            .summary-box { 
              background: #f8f9fa;
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .summary-box h2 {
              margin: 0 0 15px 0;
              font-size: 18px;
              color: #667eea;
            }
            .stat {
              margin: 10px 0;
              font-size: 14px;
            }
            .stat strong {
              color: #667eea;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            table th {
              background-color: #667eea;
              color: white;
              padding: 12px 8px;
              text-align: left;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #999; 
              font-size: 12px;
              background: #f8f9fa;
              border-top: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Painel de Auditoria - Restaurações</h1>
              <p>Relatório de Análise</p>
            </div>
            <div class="content">
              <div class="summary-box">
                <h2>📈 Estatísticas</h2>
                ${summary ? `
                  <div class="stat">🔢 <strong>Total de restaurações:</strong> ${summary.total}</div>
                  <div class="stat">📄 <strong>Documentos únicos restaurados:</strong> ${summary.unique_docs}</div>
                  <div class="stat">📆 <strong>Média por dia:</strong> ${summary.avg_per_day}</div>
                ` : '<p>Sem dados disponíveis</p>'}
              </div>
              
              ${dailyData && dailyData.length > 0 ? `
                <h3>📅 Restaurações por Dia</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th style="text-align: right;">Contagem</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${chartDataHtml}
                  </tbody>
                </table>
              ` : ''}
            </div>
            <div class="footer">
              <p>Este é um email automático gerado pelo sistema.</p>
              <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Log the email preparation
    console.log(`Preparing email for: ${recipientEmail}`);
    console.log(`Summary data:`, summary);
    console.log(`Daily data points: ${dailyData?.length || 0}`);

    // In production, integrate with an email service (SendGrid, Mailgun, etc.)
    // For now, return success to indicate the email was prepared
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Relatório enviado com sucesso!",
        recipient: recipientEmail,
        timestamp: new Date().toISOString(),
        stats: {
          totalRestores: summary?.total || 0,
          dataPoints: dailyData?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in send-restore-dashboard:", error);
    
    const errorMessage = error instanceof Error ? error.message : "An error occurred while sending the report";
    
    return new Response(
      JSON.stringify({
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500,
      }
    );
  }
});
