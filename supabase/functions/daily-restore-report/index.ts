// ✅ Edge Function: daily-restore-report v2.0 Enhanced
// This function sends a daily email with the restore chart as PNG attachment
// Refactored with comprehensive internal logging (135+ points) and SendGrid error alerts
// All logs in Portuguese (pt-BR) for local team visibility

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
  sendgridApiKey?: string;
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
 * Enhanced with comprehensive logging
 */
function loadConfig(): ReportConfig {
  console.log("=== FASE 1: Carregamento de Configuração ===");
  console.log("🔧 Carregando configuração de variáveis de ambiente...");
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const appUrl = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL");
  const adminEmail = Deno.env.get("ADMIN_EMAIL");
  const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
  const emailFrom = Deno.env.get("EMAIL_FROM");

  console.log("📋 Variáveis de ambiente detectadas:");
  console.log(`   SUPABASE_URL: ${supabaseUrl ? "✅ Configurado" : "❌ Ausente"}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? "✅ Configurado" : "❌ Ausente"}`);
  console.log(`   APP_URL: ${appUrl ? "✅ Configurado" : "❌ Ausente"}`);
  console.log(`   ADMIN_EMAIL: ${adminEmail ? "✅ Configurado" : "❌ Ausente"}`);
  console.log(`   SENDGRID_API_KEY: ${sendgridApiKey ? "✅ Configurado (opcional)" : "⚠️ Ausente (opcional)"}`);
  console.log(`   EMAIL_FROM: ${emailFrom ? "✅ Configurado (opcional)" : "⚠️ Ausente (opcional)"}`);

  // Validate required variables
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Erro de Configuração: Variáveis obrigatórias ausentes");
    console.error("   Faltando: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
    throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!appUrl) {
    console.error("❌ Erro de Configuração: APP_URL ausente");
    console.error("   Faltando: VITE_APP_URL ou APP_URL");
    throw new Error("Missing required environment variable: VITE_APP_URL or APP_URL");
  }

  if (!adminEmail) {
    console.error("❌ Erro de Configuração: ADMIN_EMAIL ausente");
    throw new Error("Missing required environment variable: ADMIN_EMAIL");
  }

  console.log("✅ Configuração validada com sucesso");
  console.log(`📧 Email de destino: ${adminEmail}`);
  console.log(`🔗 URL da aplicação: ${appUrl}`);
  
  if (sendgridApiKey) {
    console.log("✅ SendGrid configurado para alertas de erro");
  } else {
    console.log("⚠️ SendGrid não configurado - alertas de erro desabilitados");
  }

  return {
    supabaseUrl,
    supabaseKey,
    appUrl,
    adminEmail,
    sendgridApiKey,
    emailFrom: emailFrom || "noreply@nautilusone.com",
  };
}

// ========== Database Operations ==========

/**
 * Send error alert via SendGrid with professional HTML template
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
    console.log("⚠️ SendGrid API Key não configurado - pulando alerta de erro");
    return;
  }

  console.log("📧 Enviando alerta de erro via SendGrid...");
  console.log(`   De: ${from}`);
  console.log(`   Para: ${to}`);
  console.log(`   Assunto: ${subject}`);

  const errorHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
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
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
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
            border-left: 4px solid #ef4444;
          }
          .error-box h2 {
            margin: 0 0 10px 0;
            font-size: 18px;
            color: #dc2626;
          }
          .error-box pre {
            background: #ffffff;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-size: 13px;
            border: 1px solid #fee2e2;
          }
          .context-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .context-box h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
          }
          .action-button {
            display: inline-block;
            padding: 14px 32px;
            background: #ef4444;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
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
            <h1>⚠️ ALERTA DE ERRO</h1>
            <p>Função: daily-restore-report</p>
            <p>${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <div class="content">
            <div class="error-box">
              <h2>❌ Erro Detectado</h2>
              <pre>${errorMessage}</pre>
            </div>
            <div class="context-box">
              <h3>📊 Contexto do Erro</h3>
              <pre>${JSON.stringify(context, null, 2)}</pre>
            </div>
            <p>
              <strong>Ações Recomendadas:</strong>
            </p>
            <ul>
              <li>Verifique os logs no Supabase Dashboard</li>
              <li>Valide as variáveis de ambiente</li>
              <li>Confirme a conectividade com o banco de dados</li>
              <li>Teste a API de email manualmente</li>
            </ul>
            <div style="text-align: center;">
              <a href="https://supabase.com/dashboard/project/_/logs" class="action-button">
                Ver Logs no Supabase
              </a>
            </div>
          </div>
          <div class="footer">
            <p>Este é um alerta automático do sistema</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
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
        personalizations: [{
          to: [{ email: to }],
          subject: subject,
        }],
        from: { email: from },
        content: [{
          type: "text/html",
          value: errorHtml,
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro ao enviar alerta via SendGrid:");
      console.error(`   Status: ${response.status}`);
      console.error(`   Resposta: ${errorText}`);
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
    }

    console.log("✅ Alerta de erro enviado com sucesso via SendGrid");
    console.log(`   Destinatário: ${to}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
  } catch (error) {
    console.error("❌ Falha ao enviar alerta de erro via SendGrid:", error);
    // Don't throw - SendGrid failures shouldn't break the main flow
  }
}

/**
 * Log execution status to restore_report_logs table
 */
/**
 * Log execution status to restore_report_logs table
 * Enhanced with detailed logging
 */
async function logExecution(
  supabase: any,
  status: string,
  message: string,
  error: any = null
): Promise<void> {
  console.log("=== FASE 6: Registro de Logs ===");
  console.log(`📝 Registrando execução no banco de dados...`);
  console.log(`   Status: ${status}`);
  console.log(`   Mensagem: ${message}`);
  
  if (error) {
    console.log(`   Erro: ${JSON.stringify(error)}`);
  }
  
  try {
    const logEntry = {
      status,
      message,
      error_details: error ? JSON.stringify(error) : null,
      triggered_by: "automated",
    };
    
    console.log("💾 Inserindo registro na tabela restore_report_logs...");
    
    await supabase.from("restore_report_logs").insert(logEntry);
    
    console.log("✅ Log registrado com sucesso no banco de dados");
  } catch (logError) {
    console.error("❌ Falha ao registrar log no banco de dados:", logError);
    console.error("   Código do erro:", (logError as any)?.code);
    console.error("   Mensagem:", (logError as any)?.message);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Fetch restore data from Supabase with error handling
 * Enhanced with comprehensive logging
 */
async function fetchRestoreData(supabase: any): Promise<RestoreDataPoint[]> {
  console.log("=== FASE 3: Busca de Dados ===");
  console.log("📊 Iniciando busca de dados de restauração...");
  console.log("🔄 Chamando RPC: get_restore_count_by_day_with_email");
  console.log("   Parâmetro email_input: (vazio - buscar todos)");

  const startTime = Date.now();

  try {
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
      console.error(`   Detalhes: ${JSON.stringify(error)}`);
      throw new Error(`Failed to fetch restore data: ${error.message}`);
    }

    const count = data?.length || 0;
    console.log(`✅ Dados de restauração obtidos com sucesso`);
    console.log(`   Total de registros: ${count}`);
    console.log(`   Tamanho dos dados: ${JSON.stringify(data || []).length} caracteres`);
    
    if (count > 0) {
      console.log(`📅 Período dos dados:`);
      console.log(`   Primeiro dia: ${data[0]?.day || "N/A"}`);
      console.log(`   Último dia: ${data[count - 1]?.day || "N/A"}`);
      console.log(`   Total de restaurações no período: ${data.reduce((sum: number, d: any) => sum + (d.count || 0), 0)}`);
    } else {
      console.log("⚠️ Nenhum dado de restauração encontrado");
    }

    return data || [];
  } catch (error) {
    console.error("❌ Exceção ao buscar dados:", error);
    throw error;
  }
}

/**
 * Fetch summary statistics from Supabase with fallback
 * Enhanced with comprehensive logging
 */
async function fetchSummaryData(supabase: any): Promise<RestoreSummary> {
  console.log("📊 Buscando estatísticas resumidas...");
  console.log("🔄 Chamando RPC: get_restore_summary");

  const startTime = Date.now();

  try {
    const { data, error } = await supabase.rpc(
      "get_restore_summary",
      { email_input: "" }
    );

    const duration = Date.now() - startTime;
    console.log(`⏱️ Tempo de busca do resumo: ${duration}ms`);

    if (error) {
      console.warn("⚠️ Erro ao buscar dados resumidos (usando fallback):");
      console.warn(`   Código: ${error.code || "N/A"}`);
      console.warn(`   Mensagem: ${error.message}`);
    }

    const summary = data && data.length > 0 ? data[0] : {
      total: 0,
      unique_docs: 0,
      avg_per_day: 0
    };

    console.log("📈 Resumo estatístico obtido:");
    console.log(`   Total de restaurações: ${summary.total}`);
    console.log(`   Documentos únicos: ${summary.unique_docs}`);
    console.log(`   Média diária: ${summary.avg_per_day}`);

    return summary;
  } catch (error) {
    console.error("❌ Exceção ao buscar resumo:", error);
    console.log("⚠️ Usando valores padrão para o resumo");
    return {
      total: 0,
      unique_docs: 0,
      avg_per_day: 0
    };
  }
}

// ========== Email Generation ==========

/**
 * Generate professional HTML email content with responsive design
 * Enhanced with logging
 */
function generateEmailHtml(summary: RestoreSummary, data: RestoreDataPoint[], embedUrl: string): string {
  console.log("=== FASE 4: Geração de Conteúdo HTML ===");
  console.log("🎨 Gerando HTML profissional para o email...");
  console.log(`   Incluindo ${data.length} pontos de dados`);
  console.log(`   URL do gráfico: ${embedUrl}`);

  const startTime = Date.now();

  const chartData = data.map((d) => {
    const date = new Date(d.day);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}: ${d.count} restaurações`;
  }).join('<br>');

  console.log(`   Dados do gráfico formatados: ${chartData.split('<br>').length} linhas`);

  const html = `
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
            <p style="margin-top: 10px; font-size: 11px;">Versão 2.0 Enhanced</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const duration = Date.now() - startTime;
  console.log(`⏱️ Tempo de geração HTML: ${duration}ms`);
  console.log(`   Tamanho do HTML: ${html.length} caracteres`);
  console.log("✅ HTML do email gerado com sucesso");

  return html;
}

/**
 * Send email via API endpoint with enhanced error handling
 * Enhanced with comprehensive logging
 */
async function sendEmailViaAPI(
  appUrl: string, 
  payload: any, 
  htmlContent: string, 
  supabase: any,
  config: ReportConfig
): Promise<any> {
  console.log("=== FASE 5: Envio de Email ===");
  console.log("📧 Preparando para enviar email...");
  
  const emailApiUrl = `${appUrl}/api/send-restore-report`;
  console.log(`   URL da API: ${emailApiUrl}`);
  console.log(`   Destinatário: ${payload.toEmail}`);
  console.log(`   Tamanho do HTML: ${htmlContent.length} caracteres`);

  const startTime = Date.now();

  try {
    console.log("🌐 Enviando requisição HTTP POST...");
    
    const requestBody = { 
      html: htmlContent, 
      toEmail: payload.toEmail,
      summary: payload.summary
    };
    
    console.log(`   Tamanho do payload: ${JSON.stringify(requestBody).length} caracteres`);

    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const duration = Date.now() - startTime;
    console.log(`⏱️ Tempo de envio: ${duration}ms`);
    console.log(`   Status HTTP: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Falha no envio do email");
      console.error(`   Status: ${response.status}`);
      console.error(`   Resposta da API: ${errorText}`);
      
      // Send error alert via SendGrid
      await sendErrorAlert(
        config.sendgridApiKey,
        config.emailFrom || "noreply@nautilusone.com",
        config.adminEmail,
        "[ALERTA] Erro no envio de email - daily-restore-report",
        `Falha ao enviar email via API: ${response.status} - ${errorText}`,
        {
          apiUrl: emailApiUrl,
          status: response.status,
          statusText: response.statusText,
          errorResponse: errorText,
          timestamp: new Date().toISOString(),
        }
      );
      
      await logExecution(supabase, "error", "Falha no envio do e-mail", errorText);
      throw new Error(`Email API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Email enviado com sucesso!");
    console.log(`   Resposta da API: ${JSON.stringify(result)}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("❌ Exceção ao enviar email");
    console.error(`   Tipo de erro: ${error instanceof Error ? error.name : "Unknown"}`);
    console.error(`   Mensagem: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   Stack trace: ${error instanceof Error ? error.stack : "N/A"}`);
    console.error(`   Tempo até falha: ${duration}ms`);
    
    // Send error alert via SendGrid
    await sendErrorAlert(
      config.sendgridApiKey,
      config.emailFrom || "noreply@nautilusone.com",
      config.adminEmail,
      "[ALERTA] Exceção ao enviar email - daily-restore-report",
      error instanceof Error ? error.message : String(error),
      {
        apiUrl: emailApiUrl,
        errorType: error instanceof Error ? error.name : "Unknown",
        stack: error instanceof Error ? error.stack : "N/A",
        timestamp: new Date().toISOString(),
      }
    );
    
    throw error;
  }
}

// ========== Main Handler ==========

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("🔄 Requisição OPTIONS (CORS preflight) recebida");
    return new Response(null, { headers: corsHeaders });
  }

  const executionStartTime = Date.now();
  let supabase: any;
  let config: ReportConfig | null = null;

  try {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║   🚀 DAILY RESTORE REPORT v2.0 Enhanced - INÍCIO          ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("");
    console.log("🟢 Iniciando execução da função diária...");
    console.log(`📅 Data/Hora: ${new Date().toISOString()}`);
    console.log(`📅 Data/Hora Local (pt-BR): ${new Date().toLocaleString('pt-BR')}`);
    console.log("");

    // FASE 1: Load and validate configuration
    config = loadConfig();
    console.log("");

    // FASE 2: Create Supabase client
    console.log("=== FASE 2: Inicialização do Supabase ===");
    console.log("🔌 Inicializando cliente Supabase...");
    console.log(`   URL: ${config.supabaseUrl}`);
    console.log(`   Service Role Key: ${config.supabaseKey.substring(0, 10)}...`);
    
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
    
    console.log("✅ Cliente Supabase criado com sucesso");
    console.log("");

    // FASE 3 & Summary: Fetch data in parallel for better performance
    console.log("🔄 Buscando dados em paralelo (data + summary)...");
    const dataStartTime = Date.now();
    
    const [restoreData, summary] = await Promise.all([
      fetchRestoreData(supabase),
      fetchSummaryData(supabase)
    ]);
    
    const dataFetchDuration = Date.now() - dataStartTime;
    console.log("");
    console.log("📊 Busca de dados concluída:");
    console.log(`   ⏱️ Tempo total de busca em paralelo: ${dataFetchDuration}ms`);
    console.log(`   📈 Dados: ${restoreData.length} registros`);
    console.log(`   📊 Resumo: ${summary.total} total, ${summary.unique_docs} únicos`);
    console.log("");

    // FASE 4: Generate embed URL and email HTML
    const embedUrl = `${config.appUrl}/embed-restore-chart.html`;
    console.log(`🖼️ URL do gráfico embutido: ${embedUrl}`);
    console.log("");

    // Generate professional email HTML
    const emailHtml = generateEmailHtml(summary, restoreData, embedUrl);
    console.log("");

    // FASE 5: Prepare and send email
    const emailPayload = {
      embedUrl,
      toEmail: config.adminEmail,
      summary,
      data: restoreData
    };

    console.log("📦 Payload do email preparado:");
    console.log(`   Total de pontos de dados: ${restoreData.length}`);
    console.log(`   URL embutida: ${embedUrl}`);
    console.log("");

    // Send email via API
    await sendEmailViaAPI(config.appUrl, emailPayload, emailHtml, supabase, config);
    console.log("");

    // FASE 6: Log successful execution
    await logExecution(supabase, "success", "Relatório enviado com sucesso.");
    console.log("");

    // Calculate total execution time
    const totalDuration = Date.now() - executionStartTime;
    
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║   ✅ EXECUÇÃO CONCLUÍDA COM SUCESSO                       ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("");
    console.log("📊 Resumo de Performance:");
    console.log(`   ⏱️ Tempo total de execução: ${totalDuration}ms`);
    console.log(`   ⏱️ Busca de dados: ${dataFetchDuration}ms`);
    console.log(`   📧 Email enviado para: ${config.adminEmail}`);
    console.log(`   📅 Timestamp: ${new Date().toISOString()}`);
    console.log("");
    console.log("🎉 Relatório diário enviado com sucesso!");
    console.log("═══════════════════════════════════════════════════════════");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        summary,
        dataPoints: restoreData?.length || 0,
        emailSent: true,
        version: "2.0-enhanced",
        performance: {
          totalDuration: `${totalDuration}ms`,
          dataFetchDuration: `${dataFetchDuration}ms`,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorDuration = Date.now() - executionStartTime;
    
    console.error("");
    console.error("╔════════════════════════════════════════════════════════════╗");
    console.error("║   ❌ ERRO NA EXECUÇÃO                                     ║");
    console.error("╚════════════════════════════════════════════════════════════╝");
    console.error("");
    console.error("❌ Erro crítico na função daily-restore-report");
    console.error(`   Tipo: ${error instanceof Error ? error.name : "Unknown"}`);
    console.error(`   Mensagem: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`   Timestamp: ${new Date().toISOString()}`);
    console.error(`   ⏱️ Tempo até falha: ${errorDuration}ms`);
    
    if (error instanceof Error && error.stack) {
      console.error("");
      console.error("📚 Stack Trace:");
      console.error(error.stack);
    }
    
    console.error("");
    console.error("═══════════════════════════════════════════════════════════");
    
    // Send error alert via SendGrid if config is available
    if (config && config.sendgridApiKey) {
      console.error("");
      console.error("📧 Tentando enviar alerta de erro via SendGrid...");
      
      await sendErrorAlert(
        config.sendgridApiKey,
        config.emailFrom || "noreply@nautilusone.com",
        config.adminEmail,
        "[ALERTA CRÍTICO] Falha na função daily-restore-report",
        error instanceof Error ? error.message : String(error),
        {
          errorType: error instanceof Error ? error.name : "Unknown",
          stack: error instanceof Error ? error.stack : "N/A",
          duration: `${errorDuration}ms`,
          timestamp: new Date().toISOString(),
          phase: "main_handler",
        }
      );
    }
    
    // Log critical error if supabase client is available
    if (supabase) {
      await logExecution(supabase, "critical", "Erro crítico na função", error);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        errorType: error instanceof Error ? error.name : "Unknown",
        timestamp: new Date().toISOString(),
        duration: `${errorDuration}ms`,
        version: "2.0-enhanced"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
