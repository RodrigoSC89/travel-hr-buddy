import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get authentication token from request
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Não autenticado' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fetch audits from database
    const { data: auditorias, error: auditsError } = await supabase
      .from('auditorias_imca')
      .select('*')
      .order('data', { ascending: false })

    if (auditsError) {
      console.error('Error fetching audits:', auditsError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar auditorias' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get unique fleet names (navios)
    const frota = [...new Set(auditorias?.map(a => a.navio).filter(Boolean))] as string[]

    // Get cron status (from cron_execution_logs table if exists)
    let cronStatus = 'Ativo'
    try {
      const { data: cronLogs } = await supabase
        .from('cron_execution_logs')
        .select('*')
        .eq('job_name', 'auditorias_check')
        .order('executed_at', { ascending: false })
        .limit(1)

      if (cronLogs && cronLogs.length > 0) {
        const lastExecution = new Date(cronLogs[0].executed_at)
        const now = new Date()
        const hoursSinceLastRun = (now.getTime() - lastExecution.getTime()) / (1000 * 60 * 60)
        
        if (hoursSinceLastRun > 24) {
          cronStatus = `Último run: ${Math.floor(hoursSinceLastRun)}h atrás`
        } else {
          cronStatus = 'Ativo (última execução nas últimas 24h)'
        }
      }
    } catch (error) {
      console.log('Cron status check failed (table may not exist):', error)
      // Continue with default status
    }

    return new Response(
      JSON.stringify({
        auditorias: auditorias || [],
        frota,
        cronStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in lista function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
