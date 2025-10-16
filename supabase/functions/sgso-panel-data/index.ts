import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DadosEmbarcacao {
  embarcacao: string
  risco: "baixo" | "moderado" | "alto"
  total: number
  por_mes: Record<string, number>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // TODO: Replace this with real data from your database
    // This is mock data for demonstration purposes
    // You can query your actual SGSO incident/risk tables here
    
    const mockData: DadosEmbarcacao[] = [
      {
        embarcacao: "Navio Alpha",
        risco: "baixo",
        total: 3,
        por_mes: {
          "Jan": 1,
          "Fev": 0,
          "Mar": 1,
          "Abr": 0,
          "Mai": 1,
          "Jun": 0,
        }
      },
      {
        embarcacao: "Navio Beta",
        risco: "moderado",
        total: 8,
        por_mes: {
          "Jan": 2,
          "Fev": 1,
          "Mar": 2,
          "Abr": 1,
          "Mai": 1,
          "Jun": 1,
        }
      },
      {
        embarcacao: "Navio Gamma",
        risco: "alto",
        total: 15,
        por_mes: {
          "Jan": 3,
          "Fev": 4,
          "Mar": 2,
          "Abr": 3,
          "Mai": 2,
          "Jun": 1,
        }
      }
    ]

    // Example of how to query real data (uncomment and modify as needed):
    /*
    const { data: incidents, error: queryError } = await supabaseClient
      .from('sgso_incidents')
      .select('vessel, risk_level, created_at')
      .order('created_at', { ascending: false })

    if (queryError) {
      throw queryError
    }

    // Process incidents data to aggregate by vessel and month
    const processedData = processIncidentsData(incidents)
    */

    return new Response(
      JSON.stringify(mockData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in sgso-panel-data function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
