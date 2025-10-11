import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🚀 Starting daily restore report generation...");

    // Fetch restore count by day
    const { data: countData, error: countError } = await supabase.rpc(
      "get_restore_count_by_day_with_email",
      { email_input: "" }
    );

    if (countError) {
      console.error("Error fetching restore count:", countError);
      throw countError;
    }

    // Fetch summary statistics
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      "get_restore_summary",
      { email_input: "" }
    );

    if (summaryError) {
      console.error("Error fetching restore summary:", summaryError);
      throw summaryError;
    }

    const restoreData: RestoreCountByDay[] = countData || [];
    const summary: RestoreSummary = summaryData && summaryData.length > 0 
      ? summaryData[0] 
      : { total: 0, unique_docs: 0, avg_per_day: 0 };

    console.log(`✅ Data fetched: ${restoreData.length} days, ${summary.total} total restores`);

    // Generate chart data as SVG
    const chartSvg = generateChartSVG(restoreData, summary);
    
    // Convert SVG to base64
    const chartBase64 = btoa(chartSvg);

    console.log("📊 Chart generated successfully");

    // Get email configuration from environment
    const emailHost = Deno.env.get("EMAIL_HOST") || "smtp.gmail.com";
    const emailPort = parseInt(Deno.env.get("EMAIL_PORT") || "587", 10);
    const emailUser = Deno.env.get("EMAIL_USER");
    const emailPass = Deno.env.get("EMAIL_PASS");
    const emailFrom = Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com";
    const emailTo = Deno.env.get("EMAIL_TO") || "admin@empresa.com";

    if (!emailUser || !emailPass) {
      throw new Error("EMAIL_USER and EMAIL_PASS must be configured");
    }

    const emailSubject = "📊 Relatório Diário de Restaurações - Nautilus One";

    // Build the email message HTML
    const emailHtml = buildEmailHtml(restoreData, summary, chartBase64);

    console.log(`Preparing to send email to: ${emailTo}`);
    console.log(`Email configuration: ${emailHost}:${emailPort} from ${emailFrom}`);

    // Log the attempt (in production, you'd actually send the email here)
    // You can integrate with SendGrid, Mailgun, AWS SES, or other email service
    const emailMessage = {
      from: emailFrom,
      to: emailTo,
      subject: emailSubject,
      html: emailHtml,
      text: buildEmailText(summary),
    };

    console.log("✅ Email prepared successfully");

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report generated successfully",
        summary: summary,
        dataPoints: restoreData.length,
        recipient: emailTo,
        timestamp: new Date().toISOString(),
        note: "To complete email sending, integrate with SendGrid, Mailgun, AWS SES, or configure SMTP"
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
        error: error.message || "An error occurred while generating the report",
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/**
 * Generate a simple SVG chart representing restore data
 */
function generateChartSVG(data: RestoreCountByDay[], summary: RestoreSummary): string {
  const width = 800;
  const height = 400;
  const padding = 60;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  if (!data || data.length === 0) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="#f9fafb"/>
        <text x="${width/2}" y="${height/2}" text-anchor="middle" font-size="20" fill="#6b7280">
          Sem dados disponíveis
        </text>
      </svg>
    `;
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = chartWidth / data.length - 10;

  const bars = data.map((d, i) => {
    const barHeight = (d.count / maxCount) * chartHeight;
    const x = padding + i * (chartWidth / data.length) + 5;
    const y = height - padding - barHeight;
    
    const date = new Date(d.day);
    const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#3b82f6" rx="4"/>
      <text x="${x + barWidth/2}" y="${height - padding + 20}" text-anchor="middle" font-size="12" fill="#374151">${label}</text>
      <text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#1f2937">${d.count}</text>
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bgGradient)"/>
      
      <!-- Title -->
      <text x="${width/2}" y="30" text-anchor="middle" font-size="24" font-weight="bold" fill="#0f172a">
        📊 Restaurações por Dia (últimos 15 dias)
      </text>
      
      <!-- Y-axis line -->
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#d1d5db" stroke-width="2"/>
      
      <!-- X-axis line -->
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#d1d5db" stroke-width="2"/>
      
      <!-- Bars -->
      ${bars}
      
      <!-- Y-axis label -->
      <text x="20" y="${height/2}" text-anchor="middle" font-size="14" fill="#6b7280" transform="rotate(-90, 20, ${height/2})">
        Quantidade
      </text>
    </svg>
  `;
}

/**
 * Build the HTML email body
 */
function buildEmailHtml(data: RestoreCountByDay[], summary: RestoreSummary, chartBase64: string): string {
  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
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
            max-width: 800px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
            font-size: 14px;
            opacity: 0.9;
          }
          .content { 
            padding: 30px; 
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .summary-card {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
          }
          .summary-card h3 {
            margin: 0;
            font-size: 32px;
            color: #1e40af;
          }
          .summary-card p {
            margin: 5px 0 0 0;
            font-size: 14px;
            color: #6b7280;
          }
          .chart {
            margin: 30px 0;
            text-align: center;
          }
          .chart img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background: #f9fafb;
            font-size: 12px; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 5px 0;
          }
          .highlight {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Relatório Diário de Restaurações</h1>
            <p>Nautilus One - Travel HR Buddy</p>
            <p>${today}</p>
          </div>
          <div class="content">
            <div class="highlight">
              <p><strong>ℹ️ Resumo Executivo:</strong> Este relatório apresenta as métricas de restauração de documentos das últimas duas semanas.</p>
            </div>

            <h2 style="color: #1f2937; margin-top: 30px;">📈 Estatísticas Gerais</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <h3>${summary.total || 0}</h3>
                <p>Total de Restaurações</p>
              </div>
              <div class="summary-card">
                <h3>${summary.unique_docs || 0}</h3>
                <p>Documentos Únicos</p>
              </div>
              <div class="summary-card">
                <h3>${(summary.avg_per_day || 0).toFixed(1)}</h3>
                <p>Média Diária</p>
              </div>
            </div>

            <div class="chart">
              <img src="data:image/svg+xml;base64,${chartBase64}" alt="Gráfico de Restaurações" />
            </div>

            <div style="margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 8px;">
              <h3 style="color: #1f2937; margin-top: 0;">💡 Como Interpretar</h3>
              <ul style="color: #4b5563; margin: 10px 0;">
                <li><strong>Total de Restaurações:</strong> Número total de operações de restauração de documentos</li>
                <li><strong>Documentos Únicos:</strong> Quantidade de documentos diferentes que foram restaurados</li>
                <li><strong>Média Diária:</strong> Média de restaurações por dia no período analisado</li>
              </ul>
            </div>

            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #6b7280;">Para mais detalhes, acesse o <a href="${Deno.env.get("VITE_APP_URL") || ""}/admin/documents/restore-dashboard" style="color: #3b82f6; text-decoration: none;">Dashboard de Restaurações</a></p>
            </div>
          </div>
          <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
            <p>Relatório gerado automaticamente às ${new Date().toLocaleTimeString('pt-BR')} UTC</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Build plain text email body
 */
function buildEmailText(summary: RestoreSummary): string {
  return `
📊 Relatório Diário de Restaurações - Nautilus One

Data: ${new Date().toLocaleDateString('pt-BR')}

RESUMO EXECUTIVO:
==================
Total de Restaurações: ${summary.total || 0}
Documentos Únicos: ${summary.unique_docs || 0}
Média Diária: ${(summary.avg_per_day || 0).toFixed(1)}

Este relatório apresenta as métricas de restauração de documentos das últimas duas semanas.

Para visualizar o gráfico completo, acesse o Dashboard de Restaurações no painel administrativo.

---
Este é um email automático. Por favor, não responda.
© ${new Date().getFullYear()} Nautilus One - Travel HR Buddy
  `.trim();
}
