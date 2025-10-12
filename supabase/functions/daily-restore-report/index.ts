// ✅ Edge Function: daily-restore-report v2.0 Enhanced
// This function sends a daily email with the restore chart as PNG attachment
// Refactored with TypeScript type safety, comprehensive logging (161+ points),
// and SendGrid error alert integration

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Logging counters for metrics
let logCounter = 0;
const logMetrics = {
  phase1: 0,
  phase2: 0,
  phase3: 0,
  phase4: 0,
  phase5: 0,
  phase6: 0,
  errors: 0,
};

// Enhanced logging with counters
function logWithCounter(phase: string, message: string): void {
  logCounter++;
  if (phase in logMetrics) {
    logMetrics[phase as keyof typeof logMetrics]++;
  }
  console.log(`[${logCounter}] ${message}`);
}

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

interface PerformanceMetrics {
  startTime: number;
  configLoadTime?: number;
  supabaseInitTime?: number;
  dataFetchTime?: number;
  summaryFetchTime?: number;
  htmlGenerationTime?: number;
  emailSendTime?: number;
  totalExecutionTime?: number;
}

// ========== Configuration Management ==========

/**
 * Load and validate configuration from environment variables
 * Fails fast if required variables are missing
 * Enhanced with comprehensive logging (FASE 1)
 */
function loadConfig(): ReportConfig {
  logWithCounter("phase1", "");
  logWithCounter("phase1", "╔════════════════════════════════════════════════════════════╗");
  logWithCounter("phase1", "║   🚀 DAILY RESTORE REPORT v2.0 Enhanced - INÍCIO          ║");
  logWithCounter("phase1", "╚════════════════════════════════════════════════════════════╝");
  logWithCounter("phase1", "");
  logWithCounter("phase1", "=== FASE 1: Carregamento de Configuração ===");
  logWithCounter("phase1", "📋 Iniciando carregamento de variáveis de ambiente...");
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const appUrl = Deno.env.get("VITE_APP_URL") || Deno.env.get("APP_URL");
  const adminEmail = Deno.env.get("ADMIN_EMAIL");
  const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
  const emailFrom = Deno.env.get("EMAIL_FROM");

  logWithCounter("phase1", "");
  logWithCounter("phase1", "📋 Variáveis de ambiente detectadas:");
  logWithCounter("phase1", `   SUPABASE_URL: ${supabaseUrl ? '✅ Configurado' : '❌ Não configurado'}`);
  logWithCounter("phase1", `   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Configurado' : '❌ Não configurado'}`);
  logWithCounter("phase1", `   VITE_APP_URL/APP_URL: ${appUrl ? '✅ Configurado' : '❌ Não configurado'}`);
  logWithCounter("phase1", `   ADMIN_EMAIL: ${adminEmail ? '✅ Configurado' : '❌ Não configurado'}`);
  logWithCounter("phase1", `   SENDGRID_API_KEY: ${sendGridApiKey ? '✅ Configurado (opcional)' : '⚠️ Não configurado (opcional)'}`);
  logWithCounter("phase1", `   EMAIL_FROM: ${emailFrom ? '✅ Configurado (opcional)' : '⚠️ Não configurado (opcional)'}`);

  logWithCounter("phase1", "");
  logWithCounter("phase1", "🔍 Validando variáveis obrigatórias...");

  if (!supabaseUrl || !supabaseKey) {
    logWithCounter("phase1", "❌ ERRO CRÍTICO: Variáveis obrigatórias ausentes!");
    logWithCounter("phase1", `   - SUPABASE_URL: ${supabaseUrl ? 'OK' : 'FALTANDO'}`);
    logWithCounter("phase1", `   - SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? 'OK' : 'FALTANDO'}`);
    throw new Error("Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!appUrl) {
    logWithCounter("phase1", "❌ ERRO CRÍTICO: APP_URL não configurado!");
    throw new Error("Missing required environment variable: VITE_APP_URL or APP_URL");
  }

  if (!adminEmail) {
    logWithCounter("phase1", "❌ ERRO CRÍTICO: ADMIN_EMAIL não configurado!");
    throw new Error("Missing required environment variable: ADMIN_EMAIL");
  }

  logWithCounter("phase1", "✅ Todas as variáveis obrigatórias validadas com sucesso!");
  logWithCounter("phase1", "");
  logWithCounter("phase1", "📊 Resumo da configuração:");
  logWithCounter("phase1", `   URL do Supabase: ${supabaseUrl}`);
  logWithCounter("phase1", `   URL da aplicação: ${appUrl}`);
  logWithCounter("phase1", `   Email do administrador: ${adminEmail}`);
  logWithCounter("phase1", `   SendGrid habilitado: ${sendGridApiKey ? 'Sim' : 'Não'}`);
  logWithCounter("phase1", "");
  logWithCounter("phase1", "✅ FASE 1 CONCLUÍDA: Configuração carregada com sucesso");
  logWithCounter("phase1", "");

  return {
    supabaseUrl,
    supabaseKey,
    appUrl,
    adminEmail,
    sendGridApiKey,
    emailFrom,
  };
}

// ========== Database Operations ==========

/**
 * Log execution status to restore_report_logs table
 * Enhanced with comprehensive logging (FASE 6)
 */
async function logExecution(
  supabase: any,
  status: string,
  message: string,
  error: any = null
): Promise<void> {
  try {
    logWithCounter("phase6", "");
    logWithCounter("phase6", "=== FASE 6: Registro de Logs ===");
    logWithCounter("phase6", "📝 Preparando registro no banco de dados...");
    logWithCounter("phase6", `   Status: ${status}`);
    logWithCounter("phase6", `   Mensagem: ${message}`);
    if (error) {
      logWithCounter("phase6", `   Erro detectado: ${JSON.stringify(error).substring(0, 100)}...`);
    }

    await supabase.from("restore_report_logs").insert({
      status,
      message,
      error_details: error ? JSON.stringify(error) : null,
      triggered_by: "automated",
    });

    logWithCounter("phase6", "✅ Log registrado com sucesso no banco de dados");
    logWithCounter("phase6", "");
  } catch (logError) {
    logWithCounter("errors", `❌ Falha ao registrar log no banco: ${logError}`);
    console.error("Failed to log execution:", logError);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Fetch restore data from Supabase with error handling
 * Enhanced with comprehensive logging (FASE 3)
 */
async function fetchRestoreData(supabase: any, metrics: PerformanceMetrics): Promise<RestoreDataPoint[]> {
  logWithCounter("phase3", "");
  logWithCounter("phase3", "=== FASE 3: Busca de Dados ===");
  logWithCounter("phase3", "📊 Iniciando busca de dados de restauração...");
  logWithCounter("phase3", "🔄 Chamando RPC: get_restore_count_by_day_with_email");
  logWithCounter("phase3", "   Parâmetro: email_input = '' (todos os usuários)");

  const fetchStart = Date.now();
  logWithCounter("phase3", `⏱️ Início da busca: ${new Date(fetchStart).toISOString()}`);

  const { data, error } = await supabase.rpc(
    "get_restore_count_by_day_with_email",
    { email_input: "" }
  );

  const fetchEnd = Date.now();
  const fetchDuration = fetchEnd - fetchStart;
  metrics.dataFetchTime = fetchDuration;

  logWithCounter("phase3", `⏱️ Fim da busca: ${new Date(fetchEnd).toISOString()}`);
  logWithCounter("phase3", `⏱️ Tempo de busca: ${fetchDuration}ms`);

  if (error) {
    logWithCounter("errors", "❌ ERRO ao buscar dados de restauração!");
    logWithCounter("errors", `   Mensagem de erro: ${error.message}`);
    logWithCounter("errors", `   Código de erro: ${error.code || 'N/A'}`);
    logWithCounter("errors", `   Detalhes: ${JSON.stringify(error)}`);
    console.error("Error fetching restore data:", error);
    throw new Error(`Failed to fetch restore data: ${error.message}`);
  }

  const recordCount = data?.length || 0;
  logWithCounter("phase3", "✅ Dados obtidos com sucesso");
  logWithCounter("phase3", `   Total de registros: ${recordCount}`);
  
  if (recordCount > 0) {
    logWithCounter("phase3", "");
    logWithCounter("phase3", "📈 Análise detalhada dos dados:");
    logWithCounter("phase3", `   Primeiro dia: ${data[0]?.day || 'N/A'}`);
    logWithCounter("phase3", `   Último dia: ${data[recordCount - 1]?.day || 'N/A'}`);
    logWithCounter("phase3", `   Total de restaurações: ${data.reduce((sum: number, d: any) => sum + (d.count || 0), 0)}`);
    
    // Log first 3 days for debugging
    logWithCounter("phase3", "");
    logWithCounter("phase3", "📊 Primeiros registros (até 3 dias):");
    data.slice(0, 3).forEach((d: any, idx: number) => {
      logWithCounter("phase3", `   [${idx + 1}] ${d.day}: ${d.count} restaurações`);
    });
  } else {
    logWithCounter("phase3", "⚠️ Nenhum registro encontrado");
  }

  logWithCounter("phase3", "");
  logWithCounter("phase3", "✅ FASE 3 CONCLUÍDA: Dados de restauração obtidos");
  logWithCounter("phase3", "");

  return data || [];
}

/**
 * Fetch summary statistics from Supabase with fallback
 * Enhanced with comprehensive logging (FASE 3)
 */
async function fetchSummaryData(supabase: any, metrics: PerformanceMetrics): Promise<RestoreSummary> {
  logWithCounter("phase3", "");
  logWithCounter("phase3", "📈 Buscando estatísticas resumidas...");
  logWithCounter("phase3", "🔄 Chamando RPC: get_restore_summary");

  const summaryStart = Date.now();

  const { data, error } = await supabase.rpc(
    "get_restore_summary",
    { email_input: "" }
  );

  const summaryEnd = Date.now();
  const summaryDuration = summaryEnd - summaryStart;
  metrics.summaryFetchTime = summaryDuration;

  logWithCounter("phase3", `⏱️ Tempo de busca do resumo: ${summaryDuration}ms`);

  if (error) {
    logWithCounter("phase3", "⚠️ Erro ao buscar dados de resumo (usando fallback)");
    logWithCounter("phase3", `   Erro: ${error.message}`);
    console.warn("Error fetching summary data:", error);
  }

  const summary = data && data.length > 0 ? data[0] : {
    total: 0,
    unique_docs: 0,
    avg_per_day: 0
  };

  logWithCounter("phase3", "");
  logWithCounter("phase3", "📊 Resumo estatístico obtido:");
  logWithCounter("phase3", `   📊 Total de restaurações: ${summary.total}`);
  logWithCounter("phase3", `   📄 Documentos únicos: ${summary.unique_docs}`);
  logWithCounter("phase3", `   📈 Média por dia: ${summary.avg_per_day.toFixed(2)}`);
  logWithCounter("phase3", "");

  return summary;
}

// ========== SendGrid Error Alert System ==========

/**
 * Send error alert email via SendGrid
 * Professional HTML email with full error context
 */
async function sendErrorAlert(
  apiKey: string | undefined,
  from: string | undefined,
  to: string,
  subject: string,
  errorMessage: string,
  context: any
): Promise<void> {
  if (!apiKey || !from) {
    logWithCounter("errors", "⚠️ SendGrid não configurado - alerta de erro não será enviado");
    logWithCounter("errors", "   Para habilitar alertas, configure:");
    logWithCounter("errors", "   - SENDGRID_API_KEY");
    logWithCounter("errors", "   - EMAIL_FROM");
    return;
  }

  logWithCounter("errors", "");
  logWithCounter("errors", "📧 Preparando envio de alerta de erro via SendGrid...");
  logWithCounter("errors", `   De: ${from}`);
  logWithCounter("errors", `   Para: ${to}`);
  logWithCounter("errors", `   Assunto: ${subject}`);

  const errorHtml = `
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
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content { 
            padding: 30px;
          }
          .error-box { 
            background: #fef2f2;
            padding: 25px; 
            border-radius: 10px; 
            margin: 20px 0; 
            border-left: 4px solid #ef4444;
          }
          .error-box h2 {
            margin: 0 0 15px 0;
            font-size: 20px;
            color: #dc2626;
          }
          .error-message {
            background: white;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #dc2626;
            border: 1px solid #fecaca;
            word-wrap: break-word;
          }
          .context-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          .context-box h3 {
            margin: 0 0 15px 0;
            font-size: 18px;
            color: #333;
          }
          .context-box pre {
            background: white;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 13px;
            border: 1px solid #e0e0e0;
          }
          .action-link { 
            display: inline-block; 
            padding: 14px 32px; 
            background: #ef4444;
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 25px 0;
            font-weight: 600;
          }
          .footer { 
            text-align: center; 
            padding: 30px; 
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
            <h1>🚨 Alerta de Erro</h1>
            <p>Daily Restore Report - Falha na Execução</p>
            <p style="font-size: 14px; margin-top: 10px;">${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <div class="content">
            <div class="error-box">
              <h2>❌ Erro Detectado</h2>
              <div class="error-message">${errorMessage}</div>
            </div>
            
            <div class="context-box">
              <h3>🔍 Contexto do Erro</h3>
              <pre>${JSON.stringify(context, null, 2)}</pre>
            </div>

            <div class="context-box">
              <h3>🛠️ Ações Recomendadas</h3>
              <ul style="line-height: 2;">
                <li>Verifique os logs no Supabase Dashboard</li>
                <li>Confirme se todas as variáveis de ambiente estão configuradas</li>
                <li>Verifique a conexão com o banco de dados</li>
                <li>Revise as credenciais do SendGrid (se aplicável)</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="https://supabase.com/dashboard" class="action-link">📊 Ver Logs no Supabase</a>
            </div>
          </div>
          <div class="footer">
            <p>Este é um alerta automático de erro.</p>
            <p>&copy; ${new Date().getFullYear()} Nautilus One - Travel HR Buddy</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    logWithCounter("errors", "🔄 Enviando email via SendGrid API...");
    
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
      logWithCounter("errors", `❌ Falha ao enviar alerta via SendGrid: ${response.status}`);
      logWithCounter("errors", `   Resposta: ${errorText}`);
      throw new Error(`SendGrid error: ${response.status}`);
    }

    logWithCounter("errors", "✅ Alerta de erro enviado com sucesso via SendGrid");
  } catch (error) {
    logWithCounter("errors", `❌ Erro ao enviar alerta via SendGrid: ${error}`);
    console.error("Failed to send error alert:", error);
    // Don't throw - error alert failures shouldn't break error handling
  }
}

// ========== Email Generation ==========

/**
 * Generate professional HTML email content with responsive design
 * Enhanced with comprehensive logging (FASE 4)
 */
function generateEmailHtml(summary: RestoreSummary, data: RestoreDataPoint[], embedUrl: string, metrics: PerformanceMetrics): string {
  logWithCounter("phase4", "");
  logWithCounter("phase4", "=== FASE 4: Geração de Conteúdo HTML ===");
  logWithCounter("phase4", "🎨 Iniciando geração do email HTML...");

  const htmlStart = Date.now();

  logWithCounter("phase4", "");
  logWithCounter("phase4", "📊 Processando dados para o email:");
  logWithCounter("phase4", `   Total de dias: ${data.length}`);
  logWithCounter("phase4", `   Total de restaurações: ${summary.total}`);
  logWithCounter("phase4", `   Documentos únicos: ${summary.unique_docs}`);
  logWithCounter("phase4", `   Média diária: ${summary.avg_per_day.toFixed(2)}`);

  const chartData = data.map((d, idx) => {
    const date = new Date(d.day);
    const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}: ${d.count} restaurações`;
    if (idx < 3) {
      logWithCounter("phase4", `   [${idx + 1}] ${formatted}`);
    }
    return formatted;
  }).join('<br>');

  logWithCounter("phase4", "");
  logWithCounter("phase4", "🏗️ Construindo estrutura HTML...");
  logWithCounter("phase4", "   ✅ Header com gradiente");
  logWithCounter("phase4", "   ✅ Métricas resumidas");
  logWithCounter("phase4", "   ✅ Dados tabulados");
  logWithCounter("phase4", "   ✅ Link para gráfico interativo");
  logWithCounter("phase4", "   ✅ Footer com informações");

  const emailHtml = `
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

  const htmlEnd = Date.now();
  const htmlDuration = htmlEnd - htmlStart;
  metrics.htmlGenerationTime = htmlDuration;

  logWithCounter("phase4", "");
  logWithCounter("phase4", `⏱️ Tempo de geração do HTML: ${htmlDuration}ms`);
  logWithCounter("phase4", `📏 Tamanho do HTML: ${emailHtml.length} caracteres`);
  logWithCounter("phase4", "");
  logWithCounter("phase4", "✅ FASE 4 CONCLUÍDA: Email HTML gerado com sucesso");
  logWithCounter("phase4", "");

  return emailHtml;
}

/**
 * Send email via API endpoint with enhanced error handling
 * Enhanced with comprehensive logging (FASE 5)
 */
async function sendEmailViaAPI(appUrl: string, payload: any, htmlContent: string, supabase: any, metrics: PerformanceMetrics): Promise<any> {
  logWithCounter("phase5", "");
  logWithCounter("phase5", "=== FASE 5: Envio de Email ===");
  logWithCounter("phase5", "📧 Iniciando processo de envio de email...");

  const emailStart = Date.now();

  try {
    const emailApiUrl = `${appUrl}/api/send-restore-report`;
    
    logWithCounter("phase5", "");
    logWithCounter("phase5", "📋 Configuração do envio:");
    logWithCounter("phase5", `   URL da API: ${emailApiUrl}`);
    logWithCounter("phase5", `   Destinatário: ${payload.toEmail}`);
    logWithCounter("phase5", `   Total de restaurações: ${payload.summary.total}`);
    logWithCounter("phase5", `   Documentos únicos: ${payload.summary.unique_docs}`);
    logWithCounter("phase5", `   Pontos de dados: ${payload.data.length}`);

    logWithCounter("phase5", "");
    logWithCounter("phase5", "🔄 Preparando requisição HTTP...");
    logWithCounter("phase5", "   Método: POST");
    logWithCounter("phase5", "   Content-Type: application/json");
    logWithCounter("phase5", `   Tamanho do payload: ~${JSON.stringify(payload).length} bytes`);

    logWithCounter("phase5", "");
    logWithCounter("phase5", "📤 Enviando requisição para API de email...");
    
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

    const emailEnd = Date.now();
    const emailDuration = emailEnd - emailStart;
    metrics.emailSendTime = emailDuration;

    logWithCounter("phase5", "");
    logWithCounter("phase5", `⏱️ Tempo de envio: ${emailDuration}ms`);
    logWithCounter("phase5", `📊 Status da resposta: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      logWithCounter("errors", "");
      logWithCounter("errors", "❌ ERRO no envio de email!");
      logWithCounter("errors", `   Status HTTP: ${response.status}`);
      logWithCounter("errors", `   Status Text: ${response.statusText}`);
      logWithCounter("errors", `   Resposta: ${errorText.substring(0, 200)}...`);
      
      await logExecution(supabase, "error", "Falha no envio do e-mail", errorText);
      throw new Error(`Email API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    logWithCounter("phase5", "");
    logWithCounter("phase5", "✅ Resposta da API recebida:");
    logWithCounter("phase5", `   ${JSON.stringify(result).substring(0, 200)}...`);
    logWithCounter("phase5", "");
    logWithCounter("phase5", "✅ FASE 5 CONCLUÍDA: Email enviado com sucesso");
    logWithCounter("phase5", "");
    
    return result;
  } catch (error) {
    const emailEnd = Date.now();
    metrics.emailSendTime = emailEnd - emailStart;
    
    logWithCounter("errors", "");
    logWithCounter("errors", "❌ EXCEÇÃO ao enviar email!");
    logWithCounter("errors", `   Tipo: ${error instanceof Error ? error.constructor.name : typeof error}`);
    logWithCounter("errors", `   Mensagem: ${error instanceof Error ? error.message : String(error)}`);
    logWithCounter("errors", `   Tempo até falha: ${emailEnd - emailStart}ms`);
    console.error("❌ Error calling email API:", error);
    throw error;
  }
}

// ========== Main Handler ==========

serve(async (req) => {
  // Reset counters for each invocation
  logCounter = 0;
  logMetrics.phase1 = 0;
  logMetrics.phase2 = 0;
  logMetrics.phase3 = 0;
  logMetrics.phase4 = 0;
  logMetrics.phase5 = 0;
  logMetrics.phase6 = 0;
  logMetrics.errors = 0;

  const metrics: PerformanceMetrics = {
    startTime: Date.now(),
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let supabase: any;
  let config: ReportConfig | null = null;

  try {
    logWithCounter("phase1", "🟢 Iniciando execução da função diária...");
    logWithCounter("phase1", `⏱️ Timestamp de início: ${new Date(metrics.startTime).toISOString()}`);
    logWithCounter("phase1", `📍 Método HTTP: ${req.method}`);
    logWithCounter("phase1", `🌐 URL da requisição: ${req.url}`);

    // Load and validate configuration (FASE 1)
    const configStart = Date.now();
    config = loadConfig();
    metrics.configLoadTime = Date.now() - configStart;

    // Create Supabase client (FASE 2)
    logWithCounter("phase2", "");
    logWithCounter("phase2", "=== FASE 2: Inicialização do Supabase ===");
    logWithCounter("phase2", "🔧 Criando cliente Supabase...");
    logWithCounter("phase2", `   URL: ${config.supabaseUrl}`);
    logWithCounter("phase2", "   Service Role Key: ✅ Configurado");

    const supabaseStart = Date.now();
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
    metrics.supabaseInitTime = Date.now() - supabaseStart;

    logWithCounter("phase2", `⏱️ Tempo de inicialização: ${metrics.supabaseInitTime}ms`);
    logWithCounter("phase2", "✅ Cliente Supabase criado com sucesso");
    logWithCounter("phase2", "");
    logWithCounter("phase2", "✅ FASE 2 CONCLUÍDA: Supabase inicializado");
    logWithCounter("phase2", "");

    // Fetch data in parallel for better performance (FASE 3)
    logWithCounter("phase3", "🔄 Iniciando busca paralela de dados...");
    const [restoreData, summary] = await Promise.all([
      fetchRestoreData(supabase, metrics),
      fetchSummaryData(supabase, metrics)
    ]);

    logWithCounter("phase3", "✅ Busca paralela concluída com sucesso");

    // Generate embed URL
    const embedUrl = `${config.appUrl}/embed-restore-chart.html`;
    logWithCounter("phase4", `🖼️ URL de embed gerada: ${embedUrl}`);

    // Generate professional email HTML (FASE 4)
    const emailHtml = generateEmailHtml(summary, restoreData, embedUrl, metrics);

    // Prepare email payload
    logWithCounter("phase5", "📦 Preparando payload do email...");
    const emailPayload = {
      embedUrl,
      toEmail: config.adminEmail,
      summary,
      data: restoreData
    };
    logWithCounter("phase5", "✅ Payload preparado");

    // Send email via API (FASE 5)
    await sendEmailViaAPI(config.appUrl, emailPayload, emailHtml, supabase, metrics);

    // Calculate total execution time
    metrics.totalExecutionTime = Date.now() - metrics.startTime;

    // Log successful execution (FASE 6)
    await logExecution(supabase, "success", "Relatório enviado com sucesso.");

    // Final summary with metrics
    logWithCounter("phase6", "");
    logWithCounter("phase6", "╔════════════════════════════════════════════════════════════╗");
    logWithCounter("phase6", "║   ✅ EXECUÇÃO CONCLUÍDA COM SUCESSO                       ║");
    logWithCounter("phase6", "╚════════════════════════════════════════════════════════════╝");
    logWithCounter("phase6", "");
    logWithCounter("phase6", "📊 Métricas de Performance:");
    logWithCounter("phase6", `   ⏱️ Carregamento de config: ${metrics.configLoadTime}ms`);
    logWithCounter("phase6", `   ⏱️ Inicialização Supabase: ${metrics.supabaseInitTime}ms`);
    logWithCounter("phase6", `   ⏱️ Busca de dados: ${metrics.dataFetchTime}ms`);
    logWithCounter("phase6", `   ⏱️ Busca de resumo: ${metrics.summaryFetchTime}ms`);
    logWithCounter("phase6", `   ⏱️ Geração de HTML: ${metrics.htmlGenerationTime}ms`);
    logWithCounter("phase6", `   ⏱️ Envio de email: ${metrics.emailSendTime}ms`);
    logWithCounter("phase6", `   ⏱️ Tempo total: ${metrics.totalExecutionTime}ms`);
    logWithCounter("phase6", "");
    logWithCounter("phase6", "📈 Estatísticas de Logging:");
    logWithCounter("phase6", `   Total de logs: ${logCounter}`);
    logWithCounter("phase6", `   FASE 1 (Configuração): ${logMetrics.phase1} logs`);
    logWithCounter("phase6", `   FASE 2 (Supabase Init): ${logMetrics.phase2} logs`);
    logWithCounter("phase6", `   FASE 3 (Busca de Dados): ${logMetrics.phase3} logs`);
    logWithCounter("phase6", `   FASE 4 (Geração HTML): ${logMetrics.phase4} logs`);
    logWithCounter("phase6", `   FASE 5 (Envio Email): ${logMetrics.phase5} logs`);
    logWithCounter("phase6", `   FASE 6 (Registro): ${logMetrics.phase6} logs`);
    logWithCounter("phase6", `   Logs de erro: ${logMetrics.errors} logs`);
    logWithCounter("phase6", "");
    logWithCounter("phase6", "🎯 Dados Processados:");
    logWithCounter("phase6", `   Total de restaurações: ${summary.total}`);
    logWithCounter("phase6", `   Documentos únicos: ${summary.unique_docs}`);
    logWithCounter("phase6", `   Média diária: ${summary.avg_per_day.toFixed(2)}`);
    logWithCounter("phase6", `   Pontos de dados: ${restoreData.length}`);
    logWithCounter("phase6", "");
    logWithCounter("phase6", "✅ Relatório diário enviado com sucesso!");
    logWithCounter("phase6", `⏱️ Timestamp final: ${new Date().toISOString()}`);
    logWithCounter("phase6", "");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily restore report sent successfully",
        summary,
        dataPoints: restoreData?.length || 0,
        emailSent: true,
        version: "2.0 Enhanced",
        metrics: {
          totalLogs: logCounter,
          totalExecutionTime: metrics.totalExecutionTime,
          configLoadTime: metrics.configLoadTime,
          supabaseInitTime: metrics.supabaseInitTime,
          dataFetchTime: metrics.dataFetchTime,
          summaryFetchTime: metrics.summaryFetchTime,
          htmlGenerationTime: metrics.htmlGenerationTime,
          emailSendTime: metrics.emailSendTime,
        },
        logDistribution: logMetrics,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorTime = Date.now();
    const errorDuration = errorTime - metrics.startTime;
    
    logWithCounter("errors", "");
    logWithCounter("errors", "╔════════════════════════════════════════════════════════════╗");
    logWithCounter("errors", "║   ❌ ERRO CRÍTICO NA EXECUÇÃO                             ║");
    logWithCounter("errors", "╚════════════════════════════════════════════════════════════╝");
    logWithCounter("errors", "");
    logWithCounter("errors", "🚨 Detalhes do Erro:");
    logWithCounter("errors", `   Tipo: ${error instanceof Error ? error.constructor.name : typeof error}`);
    logWithCounter("errors", `   Mensagem: ${error instanceof Error ? error.message : String(error)}`);
    logWithCounter("errors", `   Tempo até falha: ${errorDuration}ms`);
    logWithCounter("errors", `   Timestamp: ${new Date(errorTime).toISOString()}`);
    
    if (error instanceof Error && error.stack) {
      logWithCounter("errors", "");
      logWithCounter("errors", "📚 Stack Trace:");
      const stackLines = error.stack.split('\n').slice(0, 5);
      stackLines.forEach(line => {
        logWithCounter("errors", `   ${line.trim()}`);
      });
    }

    logWithCounter("errors", "");
    logWithCounter("errors", "📊 Estado da Execução:");
    logWithCounter("errors", `   Total de logs até o erro: ${logCounter}`);
    logWithCounter("errors", `   Fase 1 completada: ${logMetrics.phase1 > 0 ? 'Sim' : 'Não'}`);
    logWithCounter("errors", `   Fase 2 completada: ${logMetrics.phase2 > 0 ? 'Sim' : 'Não'}`);
    logWithCounter("errors", `   Fase 3 completada: ${logMetrics.phase3 > 0 ? 'Sim' : 'Não'}`);
    logWithCounter("errors", `   Fase 4 completada: ${logMetrics.phase4 > 0 ? 'Sim' : 'Não'}`);
    logWithCounter("errors", `   Fase 5 completada: ${logMetrics.phase5 > 0 ? 'Sim' : 'Não'}`);
    logWithCounter("errors", "");

    console.error("❌ Error in daily-restore-report:", error);
    
    // Log error if supabase client is available
    if (supabase) {
      await logExecution(supabase, "error", "Erro crítico na função", error);
    }

    // Send error alert via SendGrid if configured
    if (config?.sendGridApiKey && config?.emailFrom && config?.adminEmail) {
      logWithCounter("errors", "📧 Tentando enviar alerta de erro via SendGrid...");
      await sendErrorAlert(
        config.sendGridApiKey,
        config.emailFrom,
        config.adminEmail,
        "🚨 Daily Restore Report - Erro de Execução",
        error instanceof Error ? error.message : String(error),
        {
          timestamp: new Date(errorTime).toISOString(),
          duration: errorDuration,
          logCount: logCounter,
          metrics,
          logDistribution: logMetrics,
        }
      );
    }

    logWithCounter("errors", "");
    logWithCounter("errors", "❌ Execução finalizada com erro");
    logWithCounter("errors", "");
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        version: "2.0 Enhanced",
        metrics: {
          totalLogs: logCounter,
          errorDuration,
        },
        logDistribution: logMetrics,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
