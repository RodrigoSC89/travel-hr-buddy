// ✅ Supabase Edge Function — Check cron job status
// Returns status of the daily assistant report cron job

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Verify user with Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Verify user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado: apenas administradores' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Get the most recent assistant report log with 'automated' trigger
    const { data: latestLog, error: logError } = await supabaseClient
      .from('assistant_report_logs')
      .select('sent_at, status, message')
      .eq('triggered_by', 'automated')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    if (logError && logError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned", which is acceptable
      console.error('Error fetching latest log:', logError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar status do cron' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    // Check if cron has run in the last 36 hours
    const now = new Date();
    const thirtySixHoursAgo = new Date(now.getTime() - 36 * 60 * 60 * 1000);

    let status: 'ok' | 'warning';
    let message: string;

    if (!latestLog) {
      status = 'warning';
      message = '⚠️ Nenhuma execução do cron encontrada';
    } else {
      const lastExecution = new Date(latestLog.sent_at);
      
      if (lastExecution >= thirtySixHoursAgo) {
        status = 'ok';
        const hoursAgo = Math.floor((now.getTime() - lastExecution.getTime()) / (1000 * 60 * 60));
        message = `✅ Cron executado há ${hoursAgo} hora(s) - Status: ${latestLog.status}`;
      } else {
        status = 'warning';
        const hoursAgo = Math.floor((now.getTime() - lastExecution.getTime()) / (1000 * 60 * 60));
        message = `⚠️ Última execução há ${hoursAgo} horas (mais de 36h atrás)`;
      }
    }

    return new Response(
      JSON.stringify({
        status,
        message,
        lastExecution: latestLog?.sent_at || null,
        lastStatus: latestLog?.status || null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in cron-status:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
