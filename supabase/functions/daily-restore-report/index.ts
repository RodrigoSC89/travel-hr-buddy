import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RestoreCountByDay {
  day: string;
  count: number;
}

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📊 Starting daily restore report generation...");

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured");
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch restore data from the last 15 days
    const { data: countData, error: countError } = await supabase.rpc(
      "get_restore_count_by_day_with_email",
      { email_input: "" }
    );

    if (countError) {
      console.error("Error fetching count data:", countError);
      throw new Error(`Failed to fetch restore count: ${countError.message}`);
    }

    // Fetch summary statistics
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      "get_restore_summary",
      { email_input: "" }
    );

    if (summaryError) {
      console.error("Error fetching summary data:", summaryError);
      throw new Error(`Failed to fetch summary: ${summaryError.message}`);
    }

    const counts: RestoreCountByDay[] = countData || [];
    const summary: RestoreSummary = summaryData && summaryData.length > 0 
      ? summaryData[0] 
      : { total: 0, unique_docs: 0, avg_per_day: 0 };

    console.log(`📈 Data retrieved: ${counts.length} days, ${summary.total} total restores`);

    // Get SendGrid API key
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    
    if (!sendgridApiKey) {
      console.warn("⚠️ SENDGRID_API_KEY not configured. Email will not be sent.");
      return new Response(
        JSON.stringify({
          success: false,
          message: "SENDGRID_API_KEY not configured. Please set up SendGrid to send emails.",
          data: { counts, summary },
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get email configuration
    const emailFrom = Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com";
    const emailTo = Deno.env.get("EMAIL_TO") || "admin@empresa.com";

    // Build the email content
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    // Create a simple text-based chart representation
    const chartText = counts.map((item) => {
      const date = new Date(item.day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const bar = "█".repeat(Math.min(item.count, 50)); // Visual bar
      return `${date}: ${bar} (${item.count})`;
    }).join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header { 
              background-color: #0f172a; 
              color: white; 
              padding: 30px; 
              text-align: center;
              border-radius: 10px 10px 0 0;
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
              padding: 30px; 
              background-color: #f9fafb;
            }
            .summary {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .summary h2 {
              margin-top: 0;
              color: #0f172a;
              font-size: 20px;
            }
            .stat {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .stat:last-child {
              border-bottom: none;
            }
            .stat-label {
              font-weight: 600;
              color: #6b7280;
            }
            .stat-value {
              font-weight: bold;
              color: #3b82f6;
              font-size: 18px;
            }
            .chart {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .chart h2 {
              margin-top: 0;
              color: #0f172a;
              font-size: 20px;
            }
            .chart pre {
              font-family: monospace;
              font-size: 12px;
              line-height: 1.4;
              overflow-x: auto;
              background-color: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              font-size: 12px; 
              color: #6b7280;
              background-color: #f3f4f6;
              border-radius: 0 0 10px 10px;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Relatório Diário de Restauração</h1>
            <p>Nautilus One - Travel HR Buddy</p>
            <p>Data: ${currentDate}</p>
          </div>
          
          <div class="content">
            <div class="summary">
              <h2>📈 Resumo Estatístico</h2>
              <div class="stat">
                <span class="stat-label">Total de Restaurações:</span>
                <span class="stat-value">${summary.total || 0}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Documentos Únicos:</span>
                <span class="stat-value">${summary.unique_docs || 0}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Média Diária:</span>
                <span class="stat-value">${summary.avg_per_day ? summary.avg_per_day.toFixed(2) : '0.00'}</span>
              </div>
            </div>

            <div class="chart">
              <h2>📊 Restaurações por Dia (Últimos 15 dias)</h2>
              <pre>${chartText || 'Nenhum dado disponível'}</pre>
            </div>

            <p style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <strong>ℹ️ Informação:</strong> Este relatório é gerado automaticamente todos os dias às 08:00 UTC (05:00 BRT).
              Para visualizar o dashboard completo com gráficos interativos, acesse:
              <a href="${supabaseUrl}/admin/documents/restore-dashboard" style="color: #3b82f6;">Painel de Restauração</a>
            </p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático gerado pelo sistema.</p>
            <p>Por favor, não responda a este email.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </body>
      </html>
    `;

    // Send email via SendGrid
    const sendgridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: emailTo }],
            subject: `📊 Relatório Diário de Restauração - ${currentDate}`,
          },
        ],
        from: { email: emailFrom },
        content: [
          {
            type: "text/html",
            value: htmlContent,
          },
        ],
      }),
    });

    if (!sendgridResponse.ok) {
      const errorText = await sendgridResponse.text();
      console.error("SendGrid error:", errorText);
      throw new Error(`SendGrid error: ${sendgridResponse.status} - ${errorText}`);
    }

    console.log("✅ Email sent successfully to:", emailTo);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        recipient: emailTo,
        data: {
          total_restores: summary.total,
          unique_docs: summary.unique_docs,
          avg_per_day: summary.avg_per_day,
          days_included: counts.length,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("❌ Error in daily-restore-report:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while generating the daily report",
        details: error.toString(),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
