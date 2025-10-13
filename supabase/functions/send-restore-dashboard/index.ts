import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface RestoreDataPoint {
  day: string;
  count: number;
}

interface EmailRequest {
  summary: RestoreSummary | null;
  dailyData: RestoreDataPoint[];
  filterEmail?: string;
  generatedAt: string;
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body
    const { summary, dailyData, filterEmail, generatedAt }: EmailRequest =
      await req.json();

    if (!dailyData || dailyData.length === 0) {
      throw new Error("No data to send");
    }

    // Get email configuration from environment
    const emailFrom = Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com";
    const defaultEmailTo = Deno.env.get("EMAIL_TO") || user.email || "admin@empresa.com";

    // Format the date
    const formattedDate = new Date(generatedAt).toLocaleString("pt-BR");

    // Build HTML table for daily data
    const tableRows = dailyData
      .map((d) => {
        const date = new Date(d.day).toLocaleDateString("pt-BR");
        return `
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${date}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${d.count}</td>
          </tr>
        `;
      })
      .join("");

    // Build the email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              background-color: #0f172a;
              color: white;
              padding: 20px;
              text-align: center;
            }
            .content {
              padding: 20px;
              background-color: #f9fafb;
            }
            .stats {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin: 20px 0;
            }
            .stat-card {
              background: white;
              padding: 16px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #e5e7eb;
            }
            .stat-value {
              font-size: 32px;
              font-weight: bold;
              color: #3b82f6;
            }
            .stat-label {
              font-size: 14px;
              color: #6b7280;
              margin-top: 8px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              margin: 20px 0;
            }
            th {
              background-color: #3b82f6;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Painel de Auditoria - Restaurações</h1>
            <p>Nautilus One - Travel HR Buddy</p>
          </div>
          
          <div class="content">
            <p><strong>Data de geração:</strong> ${formattedDate}</p>
            ${filterEmail ? `<p><strong>Filtro aplicado:</strong> ${filterEmail}</p>` : ""}
            
            ${
              summary
                ? `
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-value">${summary.total}</div>
                  <div class="stat-label">Total de Restaurações</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${summary.unique_docs}</div>
                  <div class="stat-label">Documentos únicos</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${summary.avg_per_day}</div>
                  <div class="stat-label">Média diária</div>
                </div>
              </div>
            `
                : ""
            }
            
            <h2>📅 Restaurações por Dia (Últimos 15 dias)</h2>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th style="text-align: center;">Quantidade</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            
            <p><em>Este relatório foi gerado automaticamente pelo sistema Nautilus One.</em></p>
          </div>
          
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </body>
      </html>
    `;

    // Build the email message
    const emailMessage = {
      from: emailFrom,
      to: defaultEmailTo,
      subject: `📊 Relatório de Restaurações - ${formattedDate}`,
      html: emailHtml,
    };

    // Log email preparation
    console.log(`Email prepared for: ${defaultEmailTo}`);
    console.log(`Data points: ${dailyData.length}`);
    console.log(`Filter applied: ${filterEmail || "None"}`);

    // Note: In production, integrate with SendGrid, Mailgun, AWS SES, etc.
    // For now, we'll log the email preparation
    console.log("Email prepared successfully");

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Relatório preparado com sucesso. Integração com serviço de e-mail necessária para envio real.",
        recipient: defaultEmailTo,
        dataPoints: dailyData.length,
        timestamp: new Date().toISOString(),
        note:
          "Para completar este recurso, integre com SendGrid, Mailgun, AWS SES ou configure SMTP em produção",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-restore-dashboard:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while sending the report";
    const errorDetails = String(error);

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
