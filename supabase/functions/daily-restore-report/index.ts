// ✅ Edge Function: daily-restore-report v2.0
// Complete refactoring with 86+ comprehensive logging points and SendGrid error alerts
// All logs in Portuguese (pt-BR) for Supabase Dashboard visibility

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Log execution status to restore_report_logs table
 */
async function logExecution(
  supabase: any,
  status: string,
  message: string,
  error: any = null
) {
  console.log(`📝 Registrando execução: ${status} - ${message}`);
  try {
    await supabase.from("restore_report_logs").insert({
      status,
      message,
      error_details: error ? JSON.stringify(error) : null,
      triggered_by: "automated",
    });
    console.log(`✅ Log registrado com sucesso no banco de dados`);
  } catch (logError) {
    console.error("❌ Falha ao registrar execução no banco:", logError);
    console.error(`   Mensagem de erro: ${logError.message}`);
    console.error(`   Stack trace: ${logError.stack}`);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Send error alert via SendGrid
 * Sends professional HTML email to administrators when errors occur
 */
async function sendErrorAlert(
  apiKey: string | undefined,
  from: string,
  to: string,
  subject: string,
  errorMessage: string,
  context: any
): Promise<void> {
  console.log(`📧 Iniciando envio de alerta de erro via SendGrid...`);
  console.log(`   De: ${from}`);
  console.log(`   Para: ${to}`);
  console.log(`   Assunto: ${subject}`);
  
  if (!apiKey) {
    console.log(`⚠️ SendGrid API Key não configurada - pulando envio de alerta`);
    return;
  }

  try {
    console.log(`🔑 SendGrid API Key detectada: ${apiKey.substring(0, 10)}...`);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #f5f5f5;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content { 
              padding: 30px; 
            }
            .error-box { 
              background: #fef2f2; 
              padding: 20px; 
              border-left: 4px solid #dc2626;
              border-radius: 4px; 
              margin: 20px 0; 
            }
            .error-title {
              color: #dc2626;
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 10px;
            }
            .error-message {
              color: #991b1b;
              font-family: 'Courier New', monospace;
              white-space: pre-wrap;
              word-break: break-word;
            }
            .context-box { 
              background: #f9fafb; 
              padding: 15px; 
              border-radius: 4px; 
              margin: 20px 0; 
            }
            .context-title {
              font-weight: bold;
              margin-bottom: 10px;
              color: #374151;
            }
            .context-details {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #6b7280;
              white-space: pre-wrap;
              word-break: break-word;
            }
            .action-button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #3b82f6; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #6b7280; 
              font-size: 12px; 
              background: #f9fafb;
            }
            .timestamp {
              color: #6b7280;
              font-size: 14px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 ALERTA DE ERRO</h1>
              <p>Daily Restore Report - Edge Function</p>
            </div>
            <div class="content">
              <div class="error-box">
                <div class="error-title">❌ Erro Detectado</div>
                <div class="error-message">${errorMessage}</div>
              </div>
              
              <div class="context-box">
                <div class="context-title">📋 Contexto do Erro:</div>
                <div class="context-details">${JSON.stringify(context, null, 2)}</div>
              </div>
              
              <div class="timestamp">
                🕐 Timestamp: ${new Date().toISOString()}<br>
                📅 Data/Hora Local: ${new Date().toLocaleString('pt-BR')}
              </div>
              
              <a href="https://supabase.com/dashboard/project/_/logs" class="action-button">
                📊 Ver Logs no Supabase Dashboard
              </a>
              
              <p style="margin-top: 20px; color: #6b7280;">
                Este email foi enviado automaticamente pelo sistema de monitoramento.
                Verifique os logs completos no Supabase Dashboard para mais detalhes.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
              <p>Sistema de Alerta Automático - Daily Restore Report v2.0</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log(`🌐 Preparando requisição para API do SendGrid...`);
    console.log(`   URL: https://api.sendgrid.com/v3/mail/send`);
    
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject,
        }],
        from: { email: from },
        content: [{
          type: 'text/html',
          value: errorHtml,
        }],
      }),
    });

    console.log(`📬 Resposta do SendGrid recebida`);
    console.log(`   Status HTTP: ${sgResponse.status} ${sgResponse.statusText}`);

    if (!sgResponse.ok) {
      const errorText = await sgResponse.text();
      console.error(`❌ Falha ao enviar alerta via SendGrid`);
      console.error(`   Status: ${sgResponse.status}`);
      console.error(`   Resposta: ${errorText}`);
      throw new Error(`SendGrid error: ${sgResponse.status} - ${errorText}`);
    }

    console.log(`✅ Alerta de erro enviado com sucesso via SendGrid`);
    console.log(`   Destinatário: ${to}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
  } catch (error) {
    console.error(`❌ Erro ao enviar alerta via SendGrid:`, error);
    console.error(`   Tipo de erro: ${error.constructor.name}`);
    console.error(`   Mensagem: ${error.message}`);
    console.error(`   Stack trace: ${error.stack}`);
    // Don't throw - alert failures shouldn't break the main flow
  }
}

serve(async (req) => {
  // ==================== INITIALIZATION ====================
  const startTime = new Date();
  console.log(`🟢 Iniciando execução da função diária...`);
  console.log(`📅 Data/Hora: ${startTime.toISOString()}`);
  console.log(`📅 Data/Hora Local (pt-BR): ${startTime.toLocaleString('pt-BR')}`);
  
  if (req.method === "OPTIONS") {
    console.log(`🔄 Requisição OPTIONS recebida - retornando headers CORS`);
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`📨 Método HTTP: ${req.method}`);
  console.log(`🔗 URL da requisição: ${req.url}`);

  // ==================== ENVIRONMENT VARIABLES ====================
  console.log(`🔧 Carregando variáveis de ambiente...`);
  
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const APP_URL = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL") || "https://your-app-url.vercel.app";
  const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@empresa.com";
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
  const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "noreply@nautilusone.com";
  
  console.log(`✅ Variáveis de ambiente carregadas:`);
  console.log(`   👤 Admin Email: ${ADMIN_EMAIL}`);
  console.log(`   🔗 App URL: ${APP_URL}`);
  console.log(`   📧 Email From: ${EMAIL_FROM}`);
  console.log(`   🔑 SendGrid configurado: ${SENDGRID_API_KEY ? "Sim" : "Não"}`);
  console.log(`   🔌 Supabase URL: ${SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + "..." : "Não configurado"}`);
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const errorMsg = "Variáveis de ambiente do Supabase não configuradas";
    console.error(`❌ ERRO CRÍTICO: ${errorMsg}`);
    console.error(`   SUPABASE_URL: ${SUPABASE_URL ? "Configurado" : "FALTANDO"}`);
    console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? "Configurado" : "FALTANDO"}`);
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ==================== SUPABASE CLIENT INITIALIZATION ====================
  console.log(`🔌 Inicializando cliente Supabase...`);
  let supabase;
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log(`✅ Cliente Supabase criado com sucesso`);
  } catch (error) {
    console.error(`❌ Erro ao criar cliente Supabase:`, error);
    console.error(`   Mensagem: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    return new Response(
      JSON.stringify({ success: false, error: "Falha ao inicializar Supabase" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // ==================== DATA FETCHING ====================
    console.log(`📊 Iniciando busca de dados de restauração...`);
    console.log(`   🔄 Chamando RPC: get_restore_count_by_day_with_email`);
    console.log(`   📧 Parâmetro email_input: "" (todos os emails)`);
    
    const dataFetchStart = Date.now();
    const { data: restoreData, error: dataError } = await supabase.rpc(
      "get_restore_count_by_day_with_email",
      { email_input: "" }
    );
    const dataFetchDuration = Date.now() - dataFetchStart;
    
    console.log(`⏱️ Tempo de busca: ${dataFetchDuration}ms`);

    if (dataError) {
      console.error(`❌ Erro ao buscar dados de restauração`);
      console.error(`   Código do erro: ${dataError.code}`);
      console.error(`   Mensagem: ${dataError.message}`);
      console.error(`   Detalhes: ${dataError.details}`);
      console.error(`   Hint: ${dataError.hint}`);
      
      await logExecution(supabase, "error", "Falha ao buscar dados de restauração", dataError);
      
      await sendErrorAlert(
        SENDGRID_API_KEY,
        EMAIL_FROM,
        ADMIN_EMAIL,
        "[ALERTA] Erro ao buscar dados de restauração",
        `Falha na chamada RPC get_restore_count_by_day_with_email: ${dataError.message}`,
        {
          error_code: dataError.code,
          error_message: dataError.message,
          error_details: dataError.details,
          error_hint: dataError.hint,
          duration_ms: dataFetchDuration
        }
      );
      
      throw new Error(`Failed to fetch restore data: ${dataError.message}`);
    }

    console.log(`✅ Dados de restauração obtidos com sucesso`);
    console.log(`   📊 Total de registros: ${restoreData?.length || 0}`);
    console.log(`   💾 Tamanho dos dados: ${JSON.stringify(restoreData || []).length} caracteres`);
    
    if (restoreData && restoreData.length > 0) {
      console.log(`   📅 Primeiro registro: ${JSON.stringify(restoreData[0])}`);
      console.log(`   📅 Último registro: ${JSON.stringify(restoreData[restoreData.length - 1])}`);
    } else {
      console.log(`   ⚠️ Nenhum dado de restauração encontrado`);
    }

    // ==================== SUMMARY STATISTICS ====================
    console.log(`📈 Buscando estatísticas resumidas...`);
    console.log(`   🔄 Chamando RPC: get_restore_summary`);
    
    const summaryFetchStart = Date.now();
    const { data: summaryData, error: summaryError } = await supabase.rpc(
      "get_restore_summary",
      { email_input: "" }
    );
    const summaryFetchDuration = Date.now() - summaryFetchStart;
    
    console.log(`⏱️ Tempo de busca do resumo: ${summaryFetchDuration}ms`);

    if (summaryError) {
      console.error(`❌ Erro ao buscar resumo estatístico`);
      console.error(`   Código: ${summaryError.code}`);
      console.error(`   Mensagem: ${summaryError.message}`);
      console.error(`   ⚠️ Continuando com valores padrão...`);
    }

    const summary = summaryData && summaryData.length > 0 ? summaryData[0] : {
      total: 0,
      unique_docs: 0,
      avg_per_day: 0
    };

    console.log(`📊 Resumo processado:`);
    console.log(`   📈 Total de Restaurações: ${summary.total || 0}`);
    console.log(`   📄 Documentos Únicos: ${summary.unique_docs || 0}`);
    console.log(`   📊 Média Diária: ${summary.avg_per_day ? summary.avg_per_day.toFixed(2) : 0}`);

    // ==================== CHART EMBED URL ====================
    console.log(`🖼️ Gerando URL do gráfico embutido...`);
    const embedUrl = `${APP_URL}/embed-restore-chart.html`;
    console.log(`   🔗 URL: ${embedUrl}`);
    console.log(`   ⚠️ Nota: Screenshot requer serviço externo (Puppeteer/API)`);
    
    // ==================== EMAIL GENERATION ====================
    console.log(`📧 Gerando conteúdo HTML do email...`);
    const emailGenStart = Date.now();
    const emailHtml = generateEmailHtml(summary, restoreData, embedUrl);
    const emailGenDuration = Date.now() - emailGenStart;
    console.log(`⏱️ Tempo de geração do HTML: ${emailGenDuration}ms`);
    console.log(`   📏 Tamanho do HTML: ${emailHtml.length} caracteres`);

    // ==================== EMAIL SENDING ====================
    console.log(`📧 Preparando envio de email...`);
    console.log(`   📮 Destinatário: ${ADMIN_EMAIL}`);
    console.log(`   📬 Remetente: ${EMAIL_FROM}`);
    console.log(`   🔗 URL da API: ${APP_URL}/api/send-restore-report`);

    const emailPayload = {
      embedUrl: embedUrl,
      toEmail: ADMIN_EMAIL,
      summary: summary,
      data: restoreData
    };
    
    console.log(`   📦 Payload preparado com ${Object.keys(emailPayload).length} campos`);

    console.log(`🌐 Iniciando chamada da API de email...`);
    const emailSendStart = Date.now();
    const emailResult = await sendEmailViaAPI(APP_URL, emailPayload, emailHtml, supabase);
    const emailSendDuration = Date.now() - emailSendStart;
    console.log(`⏱️ Tempo de envio do email: ${emailSendDuration}ms`);

    console.log(`✅ Email enviado com sucesso!`);
    console.log(`   📧 Destinatário: ${ADMIN_EMAIL}`);
    console.log(`   📊 Data points incluídos: ${restoreData?.length || 0}`);
    
    // ==================== SUCCESS LOGGING ====================
    await logExecution(supabase, "success", "Relatório enviado com sucesso.");
    
    // ==================== EXECUTION SUMMARY ====================
    const totalDuration = Date.now() - startTime.getTime();
    console.log(`🎉 Execução concluída com sucesso!`);
    console.log(`⏱️ Tempo total de execução: ${totalDuration}ms`);
    console.log(`📊 Resumo de Performance:`);
    console.log(`   - Busca de dados: ${dataFetchDuration}ms`);
    console.log(`   - Busca de resumo: ${summaryFetchDuration}ms`);
    console.log(`   - Geração de HTML: ${emailGenDuration}ms`);
    console.log(`   - Envio de email: ${emailSendDuration}ms`);
    console.log(`   - Total: ${totalDuration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        summary: summary,
        dataPoints: restoreData?.length || 0,
        emailSent: true,
        performance: {
          data_fetch_ms: dataFetchDuration,
          summary_fetch_ms: summaryFetchDuration,
          html_gen_ms: emailGenDuration,
          email_send_ms: emailSendDuration,
          total_ms: totalDuration
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // ==================== ERROR HANDLING ====================
    console.error(`❌ ERRO NA FUNÇÃO daily-restore-report`);
    console.error(`   🔴 Tipo: ${error.constructor.name}`);
    console.error(`   💬 Mensagem: ${error.message}`);
    console.error(`   📚 Stack trace:`);
    console.error(error.stack);
    
    const errorContext = {
      error_type: error.constructor.name,
      error_message: error.message,
      error_stack: error.stack,
      timestamp: new Date().toISOString(),
      environment: {
        supabase_url: SUPABASE_URL ? "configured" : "missing",
        admin_email: ADMIN_EMAIL,
        app_url: APP_URL,
        sendgrid_configured: SENDGRID_API_KEY ? "yes" : "no"
      }
    };
    
    // Log critical error to database
    console.log(`📝 Registrando erro crítico no banco de dados...`);
    await logExecution(supabase, "critical", `Erro crítico: ${error.message}`, error);
    
    // Send error alert via SendGrid
    console.log(`📧 Enviando alerta de erro via SendGrid...`);
    await sendErrorAlert(
      SENDGRID_API_KEY,
      EMAIL_FROM,
      ADMIN_EMAIL,
      "[ALERTA CRÍTICO] Falha no Daily Restore Report",
      error.message,
      errorContext
    );
    
    const errorDuration = Date.now() - startTime.getTime();
    console.log(`⏱️ Tempo até erro: ${errorDuration}ms`);
    console.log(`🔚 Encerrando execução com erro`);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        error_type: error.constructor.name,
        timestamp: new Date().toISOString(),
        duration_ms: errorDuration
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Generate HTML email content with comprehensive data presentation
 */
function generateEmailHtml(summary: any, data: any[], embedUrl: string): string {
  console.log(`📝 Gerando HTML do email...`);
  console.log(`   📊 Total de restaurações: ${summary.total || 0}`);
  console.log(`   📄 Documentos únicos: ${summary.unique_docs || 0}`);
  console.log(`   📈 Média diária: ${summary.avg_per_day || 0}`);
  console.log(`   📅 Dias de dados: ${data.length}`);
  
  const chartData = data.map((d: any) => {
    const date = new Date(d.day);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}: ${d.count} restaurações`;
  }).join('<br>');

  console.log(`   ✅ Chart data formatado: ${chartData.length} caracteres`);

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
  
  console.log(`   ✅ HTML gerado: ${html.length} caracteres total`);
  return html;
}

/**
 * Send email via API endpoint with comprehensive error tracking
 */
async function sendEmailViaAPI(appUrl: string, payload: any, htmlContent: string, supabase: any): Promise<any> {
  const emailApiUrl = `${appUrl}/api/send-restore-report`;
  
  console.log(`📧 Preparando chamada da API de email...`);
  console.log(`   🔗 URL da API: ${emailApiUrl}`);
  console.log(`   📬 Destinatário: ${payload.toEmail}`);
  console.log(`   📏 Tamanho do HTML: ${htmlContent.length} caracteres`);
  console.log(`   📊 Resumo incluído: Total=${payload.summary.total}, Únicos=${payload.summary.unique_docs}`);
  
  try {
    console.log(`🌐 Enviando requisição HTTP POST...`);
    const fetchStart = Date.now();
    
    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        html: htmlContent, 
        toEmail: payload.toEmail,
        summary: payload.summary
      })
    });

    const fetchDuration = Date.now() - fetchStart;
    console.log(`⏱️ Tempo de resposta da API: ${fetchDuration}ms`);
    console.log(`   📡 Status HTTP: ${response.status} ${response.statusText}`);
    console.log(`   📋 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Falha na API de email`);
      console.error(`   🔴 Status: ${response.status} ${response.statusText}`);
      console.error(`   💬 Resposta: ${errorText}`);
      console.error(`   🕐 Duração: ${fetchDuration}ms`);
      
      await logExecution(supabase, "error", `Falha no envio do email: HTTP ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        duration_ms: fetchDuration
      });
      
      throw new Error(`Email API error: ${response.status} - ${errorText}`);
    }

    console.log(`✅ API respondeu com sucesso`);
    const result = await response.json();
    console.log(`   📦 Resposta da API:`, JSON.stringify(result));
    console.log(`   ✅ Email enviado com sucesso via API`);
    
    return result;
  } catch (error) {
    console.error(`❌ Erro ao chamar API de email:`, error);
    console.error(`   🔴 Tipo: ${error.constructor.name}`);
    console.error(`   💬 Mensagem: ${error.message}`);
    console.error(`   📚 Stack: ${error.stack}`);
    
    await logExecution(supabase, "error", `Erro ao chamar API de email: ${error.message}`, {
      error_type: error.constructor.name,
      error_message: error.message,
      error_stack: error.stack,
      api_url: emailApiUrl
    });
    
    throw error;
  }
}
