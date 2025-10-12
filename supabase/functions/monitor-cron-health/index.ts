// ✅ Supabase Edge Function — Monitor Cron Health
// Monitors if the daily assistant report was sent in the last 36 hours

import { serve } from 'https://deno.land/std/http/server.ts';
import { Resend } from 'npm:resend';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Log monitoring execution to assistant_report_logs table
 */
async function logMonitoring(
  supabase: any,
  status: string,
  message: string,
  error: any = null
) {
  try {
    await supabase.from('assistant_report_logs').insert({
      status,
      message,
      error_details: error ? JSON.stringify(error) : null,
      triggered_by: 'monitor',
      logs_count: 0,
    });
  } catch (logError) {
    console.error('Failed to log monitoring execution:', logError);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    console.log('🔍 Starting cron health check...');

    // Check last successful report execution (within last 36 hours)
    const thirtyHoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();

    const { data: recentLogs, error } = await supabase
      .from('assistant_report_logs')
      .select('*')
      .eq('status', 'success')
      .eq('triggered_by', 'automated')
      .gte('sent_at', thirtyHoursAgo)
      .order('sent_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Erro ao verificar logs:', error);
      await logMonitoring(supabase, 'error', 'Erro ao verificar logs de execução', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao verificar logs' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // If no successful execution in last 36 hours, send alert
    if (!recentLogs || recentLogs.length === 0) {
      console.log('⚠️ No successful report execution in last 36 hours - sending alert');

      const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

      const alertSubject = '⚠️ Alerta: Relatório Diário do Assistente IA não foi enviado';
      const alertBody = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #d97706;">⚠️ Alerta de Monitoramento</h2>
            <p>O relatório diário do Assistente IA <strong>não foi enviado nas últimas 36 horas</strong>.</p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Ação Recomendada:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Verificar os logs do Supabase Edge Functions</li>
                <li>Verificar o status do cron job <code>send_assistant_report_daily</code></li>
                <li>Verificar as configurações de API (RESEND_API_KEY, ADMIN_EMAIL)</li>
                <li>Executar o relatório manualmente se necessário</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Este é um alerta automático gerado pelo sistema de monitoramento de cron jobs.<br>
              Horário da verificação: ${new Date().toLocaleString('pt-BR', { timeZone: 'UTC' })} UTC
            </p>
          </body>
        </html>
      `;

      const { error: sendErr } = await resend.emails.send({
        from: Deno.env.get('EMAIL_FROM') || 'nao-responda@nautilus.ai',
        to: Deno.env.get('ADMIN_EMAIL') || 'admin@nautilus.ai',
        subject: alertSubject,
        html: alertBody,
      });

      if (sendErr) {
        console.error('Erro ao enviar alerta por e-mail:', sendErr);
        await logMonitoring(
          supabase,
          'error',
          'Falha no envio de alerta: relatório não foi enviado em 36h, mas o e-mail de alerta falhou',
          sendErr
        );
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao enviar alerta' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('✅ Alert email sent successfully');
      await logMonitoring(
        supabase,
        'warning',
        'Alerta enviado: relatório não executado nas últimas 36h'
      );

      return new Response(
        JSON.stringify({
          success: true,
          alert_sent: true,
          message: 'Alerta enviado: relatório não executado nas últimas 36h',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Successful execution found
    const lastExecution = recentLogs[0];
    const lastExecutionTime = new Date(lastExecution.sent_at);
    const hoursAgo = Math.floor((Date.now() - lastExecutionTime.getTime()) / (1000 * 60 * 60));

    console.log(`✅ Cron health check passed - last successful execution was ${hoursAgo} hours ago`);
    await logMonitoring(
      supabase,
      'success',
      `Verificação OK: último relatório enviado há ${hoursAgo}h`
    );

    return new Response(
      JSON.stringify({
        success: true,
        alert_sent: false,
        message: `Verificação OK: último relatório enviado há ${hoursAgo}h`,
        last_execution: lastExecution.sent_at,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error in monitor-cron-health:', error);

    // Log critical error
    await logMonitoring(supabase, 'critical', 'Erro crítico no monitor de cron', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
