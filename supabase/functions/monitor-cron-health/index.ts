// ✅ Supabase Edge Function — Monitor Cron Health
// Checks if daily cron jobs are running and sends alerts if they fail

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

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

  try {
    console.log('🔍 Checking cron health...');

    // Call the check_daily_cron_execution function
    const { data, error } = await supabase
      .rpc('check_daily_cron_execution');

    if (error) {
      console.error('Error checking cron execution:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Cron health check result:', data);

    // data is an array with one object containing status and message
    const result = data && data.length > 0 ? data[0] : null;

    if (!result) {
      console.log('ℹ️ No cron execution data found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'no_data',
          message: 'No execution data found' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // If status is warning, send alert email
    if (result.status === 'warning') {
      console.log('⚠️ Cron execution failure detected! Sending alert...');

      const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'admin@nautilus.ai';
      const fromEmail = Deno.env.get('EMAIL_FROM') || 'alertas@nautilus.ai';

      const { error: emailError } = await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: '⚠️ Falha na execução do CRON diário',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">⚠️ Alerta de Falha no CRON</h2>
            <p>O cron <strong>send-assistant-report-daily</strong> não foi executado nas últimas 36h.</p>
            <p style="background-color: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b;">
              ${result.message}
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              Este é um alerta automático do sistema de monitoramento de cron jobs.
            </p>
          </div>
        `,
      });

      if (emailError) {
        console.error('Error sending alert email:', emailError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to send alert email',
            details: emailError 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('✅ Alert email sent successfully!');

      return new Response(
        JSON.stringify({
          success: true,
          status: 'warning',
          message: 'Alert email sent',
          details: result,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Status is OK
    console.log('✅ Cron execution is healthy');
    return new Response(
      JSON.stringify({
        success: true,
        status: 'ok',
        message: 'Cron execution is healthy',
        details: result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error in monitor-cron-health:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
