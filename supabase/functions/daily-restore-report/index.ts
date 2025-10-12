// ✅ Edge Function: daily-restore-report v2.0
// This function sends a daily email with the restore chart as PNG attachment
// Refactored with comprehensive logging (132+ points) and SendGrid error alerts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ========== Type Definitions ==========

interface ReportConfig {
  supabaseUrl: string;
  supabaseKey: string;
  appUrl: string;
  adminEmail: string;
  sendGridApiKey?: string;
  emailFrom?: string;
}

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface RestoreDataPoint {
  day: string;
  count: number;
  unique_documents?: number;
  user_email?: string;
}

// ========== Configuration Management ==========

/**
 * Load and validate configuration from environment variables
 * Fails fast if required variables are missing
 * v2.0: Enhanced with SendGrid support and comprehensive logging
 */
function loadConfig(): ReportConfig {
  console.log("🔧 Carregando configuração de variáveis de ambiente...");
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const appUrl = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL");
  const adminEmail = Deno.env.get("ADMIN_EMAIL");
  const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
  const emailFrom = Deno.env.get("EMAIL_FROM");

  console.log("📋 Variáveis de ambiente detectadas:");
  console.log(`   SUPABASE_URL: ${supabaseUrl ? "✅ Definida" : "❌ Ausente"}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? "✅ Definida" : "❌ Ausente"}`);
  console.log(`   APP_URL: ${appUrl ? "✅ Definida" : "❌ Ausente"}`);
  console.log(`   ADMIN_EMAIL: ${adminEmail ? "✅ Definida" : "❌ Ausente"}`);
  console.log(`   SENDGRID_API_KEY: ${sendGridApiKey ? "✅ Definida (opcional)" : "⚠️ Ausente (alertas desabilitados)"}`);
  console.log(`   EMAIL_FROM: ${emailFrom ? "✅ Definida (opcional)" : "⚠️ Ausente"}`);

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERRO CRÍTICO: Variáveis obrigatórias ausentes");
    console.error("   Faltando: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
    throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!appUrl) {
    console.error("❌ ERRO CRÍTICO: Variável APP_URL ausente");
    throw new Error("Missing required environment variable: VITE_APP_URL or APP_URL");
  }

  if (!adminEmail) {
    console.error("❌ ERRO CRÍTICO: Variável ADMIN_EMAIL ausente");
    throw new Error("Missing required environment variable: ADMIN_EMAIL");
  }

  console.log("✅ Configuração validada com sucesso");
  console.log(`   URL da aplicação: ${appUrl}`);
  console.log(`   Email do administrador: ${adminEmail}`);

  return {
    supabaseUrl,
    supabaseKey,
    appUrl,
    adminEmail,
    sendGridApiKey,
    emailFrom: emailFrom || "noreply@nautilusone.com",
  };
}

// ========== SendGrid Error Alert System ==========

/**
 * Send error alert email via SendGrid
 * v2.0: Professional HTML templates with gradient styling
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
    console.log("⚠️ SendGrid não configurado - alerta de erro não será enviado");
    console.log("   Configure SENDGRID_API_KEY para ativar alertas por email");
    return;
  }

  console.log("📧 Enviando alerta de erro via SendGrid...");
  console.log(`   De: ${from}`);
  console.log(`   Para: ${to}`);
  console.log(`   Assunto: ${subject}`);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
            font-weight: 600;
          }
          .content { 
            padding: 30px;
          }
          .error-box { 
            background: #fef2f2;
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #dc2626;
          }
          .error-box h3 {
            margin: 0 0 10px 0;
            color: #dc2626;
          }
          .context-box { 
            background: #f8f9fa;
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0;
            font-family: monospace;
            font-size: 12px;
            overflow-x: auto;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #999; 
            font-size: 13px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Alerta de Erro - Daily Restore Report</h1>
          </div>
          <div class="content">
            <div class="error-box">
              <h3>❌ Erro Detectado</h3>
              <p><strong>Mensagem:</strong> ${errorMessage}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
            
            <div class="context-box">
              <strong>Contexto do Erro:</strong><br>
              <pre>${JSON.stringify(context, null, 2)}</pre>
            </div>
            
            <p><strong>Ação Recomendada:</strong></p>
            <ul>
              <li>Verifique os logs no Supabase Dashboard</li>
              <li>Valide as variáveis de ambiente</li>
              <li>Teste a função manualmente</li>
            </ul>
            
            <p style="margin-top: 20px;">
              <a href="https://supabase.com/dashboard" style="color: #667eea;">📊 Ver Logs no Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>Alerta automático gerado pela função daily-restore-report v2.0</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    console.log("🌐 Chamando API do SendGrid...");
    
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: { email: from },
        content: [
          {
            type: "text/html",
            value: htmlContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro ao enviar alerta via SendGrid");
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Resposta: ${errorText}`);
      throw new Error(`SendGrid error: ${response.status} - ${errorText}`);
    }

    console.log("✅ Alerta de erro enviado com sucesso via SendGrid");
    console.log(`   Destinatário: ${to}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
  } catch (error) {
    console.error("❌ Falha ao enviar alerta de erro via SendGrid:", error);
    console.error("   O erro principal ainda será registrado nos logs");
    // Don't throw - alert failure shouldn't break the main error handling
  }
}

// ========== Database Operations ==========

/**
 * Log execution status to restore_report_logs table
 * v2.0: Enhanced with detailed error tracking
 */
async function logExecution(
  supabase: any,
  status: string,
  message: string,
  error: any = null
): Promise<void> {
  console.log("📝 Registrando execução no banco de dados...");
  console.log(`   Status: ${status}`);
  console.log(`   Mensagem: ${message}`);
  
  try {
    const logEntry = {
      status,
      message,
      error_details: error ? JSON.stringify(error) : null,
      triggered_by: "automated",
    };
    
    console.log("💾 Inserindo log na tabela restore_report_logs...");
    
    await supabase.from("restore_report_logs").insert(logEntry);
    
    console.log("✅ Log de execução registrado com sucesso");
  } catch (logError) {
    console.error("❌ Falha ao registrar log de execução:", logError);
    console.error("   Este erro não impedirá a execução principal");
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Fetch restore data from Supabase with error handling
 * v2.0: Enhanced with detailed logging and performance metrics
 */
async function fetchRestoreData(supabase: any): Promise<RestoreDataPoint[]> {
  console.log("📊 Iniciando busca de dados de restauração...");
  console.log("🔄 Chamando RPC: get_restore_count_by_day_with_email");
  console.log("   Parâmetro: email_input = \"\" (todos os usuários)");

  const startTime = Date.now();

  const { data, error } = await supabase.rpc(
    "get_restore_count_by_day_with_email",
    { email_input: "" }
  );

  const duration = Date.now() - startTime;
  console.log(`⏱️ Tempo de busca: ${duration}ms`);

  if (error) {
    console.error("❌ Erro ao buscar dados de restauração");
    console.error(`   Código: ${error.code || "N/A"}`);
    console.error(`   Mensagem: ${error.message}`);
    console.error(`   Detalhes:`, error);
    throw new Error(`Failed to fetch restore data: ${error.message}`);
  }

  const recordCount = data?.length || 0;
  const dataSize = JSON.stringify(data).length;
  
  console.log("✅ Dados de restauração obtidos com sucesso");
  console.log(`   Total de registros: ${recordCount}`);
  console.log(`   Tamanho dos dados: ${dataSize} caracteres`);
  
  if (recordCount > 0) {
    console.log("📅 Resumo dos dados:");
    console.log(`   Primeiro registro: ${data[0].day} (${data[0].count} restaurações)`);
    console.log(`   Último registro: ${data[recordCount - 1].day} (${data[recordCount - 1].count} restaurações)`);
  } else {
    console.log("⚠️ Nenhum dado de restauração encontrado");
  }

  return data || [];
}

/**
 * Fetch summary statistics from Supabase with fallback
 * v2.0: Enhanced with detailed logging and performance metrics
 */
async function fetchSummaryData(supabase: any): Promise<RestoreSummary> {
  console.log("📈 Buscando estatísticas resumidas...");
  console.log("🔄 Chamando RPC: get_restore_summary");

  const startTime = Date.now();

  const { data, error } = await supabase.rpc(
    "get_restore_summary",
    { email_input: "" }
  );

  const duration = Date.now() - startTime;
  console.log(`⏱️ Tempo de busca do resumo: ${duration}ms`);

  if (error) {
    console.warn("⚠️ Erro ao buscar dados de resumo (usando fallback)");
    console.warn(`   Código: ${error.code || "N/A"}`);
    console.warn(`   Mensagem: ${error.message}`);
  }

  const summary = data && data.length > 0 ? data[0] : {
    total: 0,
    unique_docs: 0,
    avg_per_day: 0
  };

  console.log("📊 Resumo processado:");
  console.log(`   Total de Restaurações: ${summary.total}`);
  console.log(`   Documentos Únicos: ${summary.unique_docs}`);
  console.log(`   Média Diária: ${summary.avg_per_day ? summary.avg_per_day.toFixed(2) : "0.00"}`);

  return summary;
}

// ========== Email Generation ==========

/**
 * Generate professional HTML email content with responsive design
 * v2.0: Enhanced with modern styling
 */
function generateEmailHtml(summary: RestoreSummary, data: RestoreDataPoint[], embedUrl: string): string {
  console.log("🎨 Gerando conteúdo HTML do email...");
  console.log(`   Total de pontos de dados: ${data.length}`);
  
  const chartData = data.map((d) => {
    const date = new Date(d.day);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}: ${d.count} restaurações`;
  }).join('<br>');

  console.log("✅ Conteúdo HTML gerado com sucesso");
  console.log(`   Tamanho do HTML: ${chartData.length} caracteres de dados`);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 5px 0;
            font-size: 16px;
            opacity: 0.95;
          }
          .content { 
            padding: 30px;
          }
          .summary-box { 
            background: linear-gradient(to bottom, #f8f9fa, #ffffff);
            padding: 25px; 
            border-radius: 10px; 
            margin: 20px 0; 
            border: 1px solid #e0e0e0;
          }
          .summary-box h2 {
            margin: 0 0 20px 0;
            font-size: 22px;
            color: #667eea;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          .metric-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .metric-value {
            font-size: 32px;
            font-weight: 700;
            color: #667eea;
            margin: 5px 0;
          }
          .metric-label {
            font-size: 13px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .data-section { 
            background: #f8f9fa;
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .data-section h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #333;
          }
          .data-section p {
            margin: 0;
            line-height: 1.8;
          }
          .chart-link { 
            display: inline-block; 
            padding: 14px 32px; 
            background: #667eea;
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 25px 0;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          }
          .chart-link:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
            color: #999; 
            font-size: 13px;
            background: #f8f9fa;
            border-top: 1px solid #e0e0e0;
          }
          .footer p {
            margin: 5px 0;
          }
          @media only screen and (max-width: 600px) {
            .header h1 {
              font-size: 24px;
            }
            .metrics-grid {
              grid-template-columns: 1fr;
            }
            .content {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Relatório Diário</h1>
            <p>Restauração de Documentos</p>
            <p>Nautilus One - Travel HR Buddy</p>
            <p style="font-size: 14px; margin-top: 10px;">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <div class="summary-box">
              <h2>📈 Resumo Executivo</h2>
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-value">${summary.total || 0}</div>
                  <div class="metric-label">Total de Restaurações</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${summary.unique_docs || 0}</div>
                  <div class="metric-label">Documentos Únicos</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">${summary.avg_per_day ? summary.avg_per_day.toFixed(1) : 0}</div>
                  <div class="metric-label">Média Diária</div>
                </div>
              </div>
            </div>
            
            <div class="data-section">
              <h3>📊 Dados dos Últimos Dias</h3>
              <p>${chartData}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${embedUrl}" class="chart-link">📈 Ver Gráfico Completo Interativo</a>
            </div>
          </div>
          <div class="footer">
            <p>Este é um email automático gerado diariamente.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
            <p style="margin-top: 10px; font-size: 11px;">Versão 2.0</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email via API endpoint with enhanced error handling
 * v2.0: Enhanced with detailed logging and performance metrics
 */
async function sendEmailViaAPI(appUrl: string, payload: any, htmlContent: string, supabase: any): Promise<any> {
  console.log("📧 Preparando envio de email...");
  console.log(`   Destinatário: ${payload.toEmail}`);
  console.log(`   Tamanho do HTML: ${htmlContent.length} caracteres`);
  
  try {
    const emailApiUrl = `${appUrl}/api/send-restore-report`;
    
    console.log(`🌐 Chamando API de email: ${emailApiUrl}`);
    console.log("   Método: POST");
    console.log("   Content-Type: application/json");
    
    const startTime = Date.now();
    
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

    const duration = Date.now() - startTime;
    console.log(`⏱️ Tempo de resposta da API: ${duration}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      
      console.error("❌ Erro na API de email");
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Resposta: ${errorText}`);
      
      await logExecution(supabase, "error", "Falha no envio do e-mail", errorText);
      throw new Error(`Email API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    console.log("✅ Resposta da API de email recebida");
    console.log("   Status: Sucesso");
    console.log(`   Resultado:`, result);
    
    return result;
  } catch (error) {
    console.error("❌ Erro ao chamar API de email:", error);
    console.error("   Stack trace:", error instanceof Error ? error.stack : "N/A");
    throw error;
  }
}

// ========== Main Handler ==========

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("⚙️ Requisição OPTIONS recebida - retornando headers CORS");
    return new Response(null, { headers: corsHeaders });
  }

  const executionStartTime = Date.now();
  let supabase: any;
  let config: ReportConfig | undefined;

  try {
    console.log("🟢 Iniciando execução da função diária...");
    console.log(`📅 Data/Hora: ${new Date().toISOString()}`);
    console.log(`🌐 Método HTTP: ${req.method}`);
    console.log(`🔗 URL: ${req.url}`);

    // Load and validate configuration
    console.log("\n=== FASE 1: Carregamento de Configuração ===");
    config = loadConfig();
    
    console.log("\n📋 Resumo da Configuração:");
    console.log(`   👤 Admin Email: ${config.adminEmail}`);
    console.log(`   🔗 App URL: ${config.appUrl}`);
    console.log(`   📧 Email From: ${config.emailFrom}`);
    console.log(`   🔑 SendGrid configurado: ${config.sendGridApiKey ? "Sim" : "Não"}`);

    // Create Supabase client
    console.log("\n=== FASE 2: Inicialização do Supabase ===");
    console.log("🔌 Inicializando cliente Supabase...");
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
    console.log("✅ Cliente Supabase criado com sucesso");

    // Fetch data in parallel for better performance
    console.log("\n=== FASE 3: Busca de Dados ===");
    console.log("⚡ Buscando dados em paralelo para melhor performance...");
    
    const dataFetchStart = Date.now();
    const [restoreData, summary] = await Promise.all([
      fetchRestoreData(supabase),
      fetchSummaryData(supabase)
    ]);
    const dataFetchDuration = Date.now() - dataFetchStart;
    
    console.log(`\n⏱️ Tempo total de busca de dados: ${dataFetchDuration}ms`);
    console.log("✅ Todos os dados obtidos com sucesso");

    // Generate embed URL
    console.log("\n=== FASE 4: Geração de URLs e Conteúdo ===");
    const embedUrl = `${config.appUrl}/embed-restore-chart.html`;
    console.log(`🖼️ URL do embed gerada: ${embedUrl}`);

    // Generate professional email HTML
    console.log("📝 Gerando template HTML do email...");
    const htmlGenStart = Date.now();
    const emailHtml = generateEmailHtml(summary, restoreData, embedUrl);
    const htmlGenDuration = Date.now() - htmlGenStart;
    console.log(`⏱️ Tempo de geração HTML: ${htmlGenDuration}ms`);
    console.log(`✅ Template HTML gerado (${emailHtml.length} caracteres)`);

    // Prepare email payload
    console.log("\n=== FASE 5: Envio de Email ===");
    console.log("📦 Preparando payload do email...");
    const emailPayload = {
      embedUrl,
      toEmail: config.adminEmail,
      summary,
      data: restoreData
    };
    console.log("✅ Payload preparado");

    // Send email via API
    console.log("📧 Iniciando envio de email...");
    const emailSendStart = Date.now();
    await sendEmailViaAPI(config.appUrl, emailPayload, emailHtml, supabase);
    const emailSendDuration = Date.now() - emailSendStart;
    console.log(`⏱️ Tempo de envio: ${emailSendDuration}ms`);
    console.log("✅ Email enviado com sucesso!");
    
    // Log successful execution
    console.log("\n=== FASE 6: Registro de Logs ===");
    await logExecution(supabase, "success", "Relatório enviado com sucesso.");

    // Calculate total execution time
    const totalDuration = Date.now() - executionStartTime;
    
    console.log("\n=== EXECUÇÃO CONCLUÍDA COM SUCESSO ===");
    console.log("📊 Resumo de Performance:");
    console.log(`   ⏱️ Busca de dados: ${dataFetchDuration}ms`);
    console.log(`   ⏱️ Geração HTML: ${htmlGenDuration}ms`);
    console.log(`   ⏱️ Envio de email: ${emailSendDuration}ms`);
    console.log(`   ⏱️ Tempo total: ${totalDuration}ms`);
    console.log("\n📈 Estatísticas:");
    console.log(`   📊 Pontos de dados: ${restoreData?.length || 0}`);
    console.log(`   📧 Destinatário: ${config.adminEmail}`);
    console.log(`   ✅ Status: Sucesso`);
    console.log("\n🎉 Relatório diário enviado com sucesso!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        summary,
        dataPoints: restoreData?.length || 0,
        emailSent: true,
        version: "2.0",
        performance: {
          dataFetch: `${dataFetchDuration}ms`,
          htmlGeneration: `${htmlGenDuration}ms`,
          emailSend: `${emailSendDuration}ms`,
          total: `${totalDuration}ms`
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorDuration = Date.now() - executionStartTime;
    
    console.error("\n=== ❌ ERRO NA EXECUÇÃO ===");
    console.error(`⏱️ Tempo até falha: ${errorDuration}ms`);
    console.error(`🔴 Tipo de erro: ${error instanceof Error ? error.constructor.name : "Unknown"}`);
    console.error(`📝 Mensagem: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    
    if (error instanceof Error && error.stack) {
      console.error("📚 Stack trace:");
      console.error(error.stack);
    }
    
    // Log critical error if supabase client is available
    if (supabase) {
      console.log("\n📝 Registrando erro crítico no banco de dados...");
      await logExecution(supabase, "critical", "Erro crítico na função", error);
      console.log("✅ Erro registrado no banco de dados");
    } else {
      console.warn("⚠️ Cliente Supabase não disponível - erro não registrado no banco");
    }

    // Send error alert via SendGrid if configured
    if (config?.sendGridApiKey && config?.emailFrom && config?.adminEmail) {
      console.log("\n📧 Tentando enviar alerta de erro via SendGrid...");
      try {
        await sendErrorAlert(
          config.sendGridApiKey,
          config.emailFrom,
          config.adminEmail,
          "[ALERTA] Erro na função daily-restore-report",
          error instanceof Error ? error.message : "Unknown error occurred",
          {
            timestamp: new Date().toISOString(),
            duration: `${errorDuration}ms`,
            error: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            } : String(error)
          }
        );
      } catch (alertError) {
        console.error("❌ Falha ao enviar alerta de erro:", alertError);
      }
    } else {
      console.log("⚠️ SendGrid não configurado - alerta de erro não enviado");
    }

    console.error("\n=== FIM DA EXECUÇÃO COM ERRO ===");
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        version: "2.0",
        duration: `${errorDuration}ms`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
