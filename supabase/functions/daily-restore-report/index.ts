// ✅ Edge Function: daily-restore-report
// Comprehensive Internal Logging - 30+ logging points for Supabase Dashboard visibility
// This function sends a daily email with restore chart and includes full error alert system

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const startTime = new Date();
  
  // LOG 1: CORS preflight
  if (req.method === "OPTIONS") {
    console.log("🔄 Requisição OPTIONS (CORS preflight)");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // LOG 2: Function initialization
    console.log("🟢 Iniciando execução da função diária...");
    console.log(`📅 Data/Hora: ${startTime.toISOString()}`);
    
    // LOG 3: Environment variables check
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const APP_URL = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL") || "https://your-app-url.vercel.app";
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com";
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com";
    
    console.log(`👤 Admin Email: ${ADMIN_EMAIL}`);
    console.log(`🔗 App URL: ${APP_URL}`);
    console.log(`📧 Email From: ${EMAIL_FROM}`);
    console.log(`🔑 SendGrid configurado: ${SENDGRID_API_KEY ? "Sim" : "Não"}`);
    
    // LOG 4: Supabase client initialization
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error("❌ Variáveis de ambiente Supabase não configuradas");
      throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios");
    }
    
    console.log("🔌 Inicializando cliente Supabase...");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Cliente Supabase criado com sucesso");

    // LOG 5: Starting data fetch
    console.log("📊 Iniciando busca de dados de restauração...");
    const fetchStartTime = Date.now();

    // LOG 6: Fetching restore data
    console.log("🔄 Chamando RPC: get_restore_count_by_day_with_email");
    const { data: restoreData, error: dataError } = await supabase.rpc(
      "get_restore_count_by_day_with_email",
      { email_input: "" }
    );

    // LOG 7: Data fetch result
    const fetchDuration = Date.now() - fetchStartTime;
    console.log(`⏱️ Tempo de busca: ${fetchDuration}ms`);

    if (dataError) {
      // LOG 8: Data fetch error
      console.error("❌ Erro ao buscar dados de restauração");
      console.error(`   Código: ${dataError.code}`);
      console.error(`   Mensagem: ${dataError.message}`);
      console.error(`   Detalhes: ${JSON.stringify(dataError.details)}`);
      
      await sendErrorAlert(
        SENDGRID_API_KEY,
        EMAIL_FROM,
        ADMIN_EMAIL,
        "Erro ao buscar dados",
        dataError.message,
        { error: dataError, timestamp: new Date().toISOString() }
      );
      
      throw new Error(`Falha ao buscar dados: ${dataError.message}`);
    }

    // LOG 9: Data fetch success
    console.log("✅ Dados de restauração obtidos com sucesso");
    console.log(`   Total de registros: ${restoreData?.length || 0}`);
    console.log(`   Tamanho dos dados: ${JSON.stringify(restoreData).length} caracteres`);

    // LOG 10: Fetching summary statistics
    console.log("📈 Buscando estatísticas resumidas...");
    const summaryStartTime = Date.now();
    
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      "get_restore_summary",
      { email_input: "" }
    );

    const summaryDuration = Date.now() - summaryStartTime;
    console.log(`⏱️ Tempo de busca do resumo: ${summaryDuration}ms`);

    if (summaryError) {
      // LOG 11: Summary fetch error
      console.error("⚠️ Erro ao buscar resumo (continuando com valores padrão)");
      console.error(`   Mensagem: ${summaryError.message}`);
    }

    // LOG 12: Processing summary
    const summary = summaryData && summaryData.length > 0 ? summaryData[0] : {
      total: 0,
      unique_docs: 0,
      avg_per_day: 0
    };

    console.log("📊 Resumo processado:");
    console.log(`   Total de Restaurações: ${summary.total}`);
    console.log(`   Documentos Únicos: ${summary.unique_docs}`);
    console.log(`   Média Diária: ${summary.avg_per_day?.toFixed(2) || 0}`);

    // LOG 13: Preparing chart URL
    const chartApiUrl = `${APP_URL}/api/generate-chart-image`;
    console.log(`📊 URL do gráfico: ${chartApiUrl}`);
    
    // LOG 14: Capturing chart
    console.log("🔄 Capturando gráfico...");
    const captureStartTime = Date.now();
    
    let imageBase64 = "";
    let imageSizeBytes = 0;
    
    try {
      // LOG 15: Fetching chart image
      console.log(`🌐 Fazendo requisição para: ${chartApiUrl}`);
      const chartResponse = await fetch(chartApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: restoreData, summary })
      });

      const captureDuration = Date.now() - captureStartTime;
      console.log(`⏱️ Tempo de captura: ${captureDuration}ms`);

      if (!chartResponse.ok) {
        // LOG 16: Chart capture error
        console.error("❌ Erro ao capturar o gráfico");
        console.error(`   Status: ${chartResponse.status} ${chartResponse.statusText}`);
        const errorText = await chartResponse.text();
        console.error(`   Detalhes: ${errorText}`);
        
        await sendErrorAlert(
          SENDGRID_API_KEY,
          EMAIL_FROM,
          ADMIN_EMAIL,
          "Erro ao capturar gráfico",
          `Status ${chartResponse.status}: ${errorText}`,
          { status: chartResponse.status, url: chartApiUrl }
        );
      } else {
        // LOG 17: Chart captured successfully
        const chartData = await chartResponse.json();
        imageBase64 = chartData.imageBase64 || "";
        imageSizeBytes = imageBase64.length;
        
        console.log("✅ Gráfico capturado com sucesso");
        console.log(`   Tamanho da imagem: ${imageSizeBytes} bytes`);
        console.log(`   Tamanho em base64: ${imageBase64.length} caracteres`);
      }
    } catch (chartError) {
      // LOG 18: Chart capture exception
      console.error("⚠️ Exceção ao capturar gráfico (continuando sem imagem)");
      console.error(`   Erro: ${chartError instanceof Error ? chartError.message : String(chartError)}`);
    }

    // LOG 19: Generating email HTML
    console.log("📝 Gerando conteúdo HTML do e-mail...");
    const htmlStartTime = Date.now();
    const emailHtml = generateEmailHtml(summary, restoreData, `${APP_URL}/embed-restore-chart.html`);
    const htmlDuration = Date.now() - htmlStartTime;
    
    console.log(`✅ HTML gerado em ${htmlDuration}ms`);
    console.log(`   Tamanho do HTML: ${emailHtml.length} caracteres`);

    // LOG 20: Preparing email payload
    const emailPayload = {
      toEmail: ADMIN_EMAIL,
      html: emailHtml,
      summary: summary,
      imageBase64: imageBase64 || undefined
    };

    console.log("📧 Preparando envio de e-mail...");
    console.log(`   Destinatário: ${ADMIN_EMAIL}`);
    console.log(`   Com anexo: ${imageBase64 ? "Sim" : "Não"}`);

    // LOG 21: Sending email
    console.log("📤 Enviando e-mail...");
    const emailStartTime = Date.now();
    
    const emailApiUrl = `${APP_URL}/api/send-restore-report`;
    console.log(`   Endpoint: ${emailApiUrl}`);
    
    const emailResponse = await fetch(emailApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });

    const emailDuration = Date.now() - emailStartTime;
    console.log(`⏱️ Tempo de envio: ${emailDuration}ms`);

    if (!emailResponse.ok) {
      // LOG 22: Email send error
      const errorText = await emailResponse.text();
      console.error("❌ Erro ao enviar e-mail");
      console.error(`   Status: ${emailResponse.status} ${emailResponse.statusText}`);
      console.error(`   Resposta: ${errorText}`);
      
      await sendErrorAlert(
        SENDGRID_API_KEY,
        EMAIL_FROM,
        ADMIN_EMAIL,
        "Erro ao enviar relatório",
        `Status ${emailResponse.status}: ${errorText}`,
        { status: emailResponse.status, url: emailApiUrl, timestamp: new Date().toISOString() }
      );
      
      throw new Error(`Erro na API de e-mail: ${emailResponse.status} - ${errorText}`);
    }

    // LOG 23: Email sent successfully
    const emailResult = await emailResponse.json();
    console.log("✅ E-mail enviado com sucesso!");
    console.log(`   Resposta da API: ${JSON.stringify(emailResult)}`);

    // LOG 24: Function completion
    const totalDuration = Date.now() - startTime.getTime();
    console.log("🎉 Execução concluída com sucesso!");
    console.log(`⏱️ Tempo total: ${totalDuration}ms`);
    console.log(`📊 Resumo da execução:`);
    console.log(`   - Registros processados: ${restoreData?.length || 0}`);
    console.log(`   - E-mail enviado para: ${ADMIN_EMAIL}`);
    console.log(`   - Timestamp: ${new Date().toISOString()}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Relatório diário enviado com sucesso",
        summary: summary,
        dataPoints: restoreData?.length || 0,
        emailSent: true,
        duration: totalDuration,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // LOG 25: Global error handler
    console.error("❌ Erro fatal na função daily-restore-report");
    console.error(`   Tipo: ${error instanceof Error ? error.name : typeof error}`);
    console.error(`   Mensagem: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   Stack: ${error instanceof Error ? error.stack : "N/A"}`);
    console.error(`   Timestamp: ${new Date().toISOString()}`);
    
    // LOG 26: Send critical error alert
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com";
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com";
    
    try {
      console.log("📧 Enviando alerta de erro crítico...");
      await sendErrorAlert(
        SENDGRID_API_KEY,
        EMAIL_FROM,
        ADMIN_EMAIL,
        "Erro Crítico - Daily Restore Report",
        error instanceof Error ? error.message : String(error),
        {
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : String(error),
          timestamp: new Date().toISOString()
        }
      );
      console.log("✅ Alerta de erro enviado");
    } catch (alertError) {
      // LOG 27: Error alert failure
      console.error("⚠️ Falha ao enviar alerta de erro");
      console.error(`   Erro: ${alertError instanceof Error ? alertError.message : String(alertError)}`);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Generate HTML email content with comprehensive logging
 * LOG 28: Email HTML generation
 */
function generateEmailHtml(summary: any, data: any[], embedUrl: string): string {
  console.log("🎨 Gerando template HTML...");
  console.log(`   Registros de dados: ${data?.length || 0}`);
  
  const chartData = data.map((d: any) => {
    const date = new Date(d.day);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}: ${d.count} restaurações`;
  }).join('<br>');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; background: #f9f9f9; }
          .summary-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .summary-item { margin: 10px 0; }
          .chart-link { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .data-section { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório Diário - Restauração de Documentos</h1>
          <p>Nautilus One - Travel HR Buddy</p>
          <p>${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <div class="content">
          <div class="summary-box">
            <h2>📈 Resumo Executivo</h2>
            <div class="summary-item"><strong>Total de Restaurações:</strong> ${summary.total || 0}</div>
            <div class="summary-item"><strong>Documentos Únicos:</strong> ${summary.unique_docs || 0}</div>
            <div class="summary-item"><strong>Média Diária:</strong> ${summary.avg_per_day ? summary.avg_per_day.toFixed(2) : 0}</div>
          </div>
          
          <div class="data-section">
            <h3>📊 Dados dos Últimos Dias</h3>
            <p>${chartData}</p>
          </div>
          
          <a href="${embedUrl}" class="chart-link">📈 Ver Gráfico Completo</a>
        </div>
        <div class="footer">
          <p>Este é um email automático gerado diariamente.</p>
          <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
        </div>
      </body>
    </html>
  `;
  
  console.log(`✅ Template HTML gerado (${html.length} caracteres)`);
  return html;
}

/**
 * Send error alert via SendGrid
 * LOG 29: SendGrid error alert system
 */
async function sendErrorAlert(
  apiKey: string | undefined,
  from: string,
  to: string,
  subject: string,
  errorMessage: string,
  context: any
): Promise<void> {
  if (!apiKey) {
    console.log("⚠️ SendGrid API key não configurado - pulando alerta de erro");
    return;
  }

  console.log("📧 Enviando alerta de erro via SendGrid...");
  console.log(`   De: ${from}`);
  console.log(`   Para: ${to}`);
  console.log(`   Assunto: ${subject}`);

  try {
    const emailBody = {
      personalizations: [{
        to: [{ email: to }],
        subject: `[ALERTA] ${subject}`
      }],
      from: { email: from },
      content: [{
        type: "text/html",
        value: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .alert-box { background: #fee; border-left: 4px solid #f44; padding: 20px; margin: 20px; }
                .error-details { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
                .context { background: #ffe; padding: 10px; margin: 10px 0; border-radius: 4px; font-family: monospace; font-size: 12px; }
                .header { background: #f44; color: white; padding: 20px; text-align: center; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>⚠️ Alerta de Erro - Daily Restore Report</h1>
              </div>
              <div class="alert-box">
                <h2>Erro Detectado</h2>
                <p><strong>Mensagem:</strong> ${errorMessage}</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              </div>
              <div class="error-details">
                <h3>Contexto do Erro</h3>
                <div class="context">
                  ${JSON.stringify(context, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;')}
                </div>
              </div>
              <div class="error-details">
                <h3>Próximos Passos</h3>
                <ol>
                  <li>Verifique os logs da função no Supabase Dashboard</li>
                  <li>Confirme as variáveis de ambiente</li>
                  <li>Teste a função manualmente</li>
                  <li>Entre em contato com o suporte se o erro persistir</li>
                </ol>
              </div>
              <p style="text-align: center; color: #666; margin-top: 30px;">
                Este é um alerta automático do sistema Daily Restore Report
              </p>
            </body>
          </html>
        `
      }]
    };

    // LOG 30: SendGrid API call
    console.log("🌐 Chamando API do SendGrid...");
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro ao enviar alerta via SendGrid");
      console.error(`   Status: ${response.status}`);
      console.error(`   Resposta: ${errorText}`);
      throw new Error(`SendGrid error: ${response.status} - ${errorText}`);
    }

    console.log("✅ Alerta de erro enviado com sucesso via SendGrid");
    console.log(`   Destinatário: ${to}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
  } catch (error) {
    console.error("❌ Exceção ao enviar alerta via SendGrid");
    console.error(`   Erro: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
