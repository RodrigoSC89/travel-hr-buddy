// ✅ Supabase Edge Function: monitor-cron-health.ts
// Envia alerta por e-mail caso o cron diário não tenha sido executado nas últimas 36h

import { serve } from 'https://deno.land/std/http/server.ts';
import { Resend } from 'npm:resend';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    console.log('🔍 Checking daily cron execution status...');

    const { data, error } = await supabase.rpc('check_daily_cron_execution');
    
    if (error || !data || !data[0]) {
      console.error('❌ Error checking cron status:', error);
      return new Response('Erro na verificação.', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    const { status, message } = data[0];
    
    console.log(`Status: ${status}, Message: ${message}`);

    if (status === 'ok') {
      console.log('✅ Cron executed normally, no alert needed');
      return new Response('✅ Cron executado normalmente.', {
        headers: corsHeaders
      });
    }

    // Status is 'warning' - send alert email
    console.log('⚠️ Cron failure detected, sending alert email...');

    const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@nautilus.ai';
    const fromEmail = Deno.env.get('EMAIL_FROM') || 'alertas@nautilus.ai';

    const { error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: '⚠️ Alerta: Cron Diário Não Executado',
      html: `
        <h2>⚠️ Alerta de Monitoramento</h2>
        <p>O cron <strong>send-assistant-report-daily</strong> não foi executado nas últimas 36 horas.</p>
        <p><strong>Detalhes:</strong> ${message}</p>
        <p><strong>Ação requerida:</strong> Revisar logs no painel <code>/admin/reports/assistant</code></p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Este é um alerta automático do sistema de monitoramento.<br>
          Função: monitor-cron-health<br>
          Timestamp: ${new Date().toISOString()}
        </p>
      `
    });

    if (emailError) {
      console.error('❌ Error sending alert email:', emailError);
      return new Response('Erro ao enviar alerta.', { 
        status: 500, 
        headers: corsHeaders 
      });
    }

    console.log(`✅ Alert email sent successfully to ${adminEmail}`);
    
    return new Response('⚠️ Alerta enviado com sucesso', {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Unexpected error in monitor-cron-health:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
