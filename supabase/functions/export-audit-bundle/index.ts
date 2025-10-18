import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuditLog {
  id: string
  title: string
  navio: string
  norma: string
  item_auditado: string
  resultado: string
  comentarios: string
  data: string
  score?: number
}

interface ActionPlan {
  id: string
  title: string
  description: string
  status: string
  created_at: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { vesselId, vesselName, norms, startDate, endDate, format = 'json' } = await req.json()

    // Validate required fields
    if (!vesselName || !norms || !Array.isArray(norms)) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: vesselName, norms (array)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const authHeader = req.headers.get('Authorization')

    if (!supabaseUrl || !supabaseServiceKey || !authHeader) {
      return new Response(
        JSON.stringify({ error: 'Configuração de banco de dados não disponível' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get user from auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build query for audit logs
    let auditQuery = supabase
      .from('auditorias_imca')
      .select('*')
      .eq('navio', vesselName)

    // Filter by norms
    if (norms.length > 0) {
      auditQuery = auditQuery.in('norma', norms)
    }

    // Filter by date range
    if (startDate) {
      auditQuery = auditQuery.gte('data', startDate)
    }
    if (endDate) {
      auditQuery = auditQuery.lte('data', endDate)
    }

    auditQuery = auditQuery.order('data', { ascending: false })

    const { data: auditLogs, error: auditError } = await auditQuery

    if (auditError) {
      console.error('Error fetching audit logs:', auditError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar logs de auditoria' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get training modules for this vessel
    let trainingQuery = supabase
      .from('training_modules')
      .select('*')
      .eq('status', 'active')

    if (vesselId) {
      trainingQuery = trainingQuery.eq('vessel_id', vesselId)
    }

    const { data: trainingModules, error: trainingError } = await trainingQuery

    // Calculate statistics
    const totalAudits = auditLogs?.length || 0
    const conforme = auditLogs?.filter((log: AuditLog) => log.resultado === 'Conforme').length || 0
    const naoConforme = auditLogs?.filter((log: AuditLog) => log.resultado === 'Não Conforme').length || 0
    const parcialmenteConforme = auditLogs?.filter((log: AuditLog) => log.resultado === 'Parcialmente Conforme').length || 0
    const naoAplicavel = auditLogs?.filter((log: AuditLog) => log.resultado === 'Não Aplicável').length || 0

    const complianceRate = totalAudits > 0 
      ? ((conforme + parcialmenteConforme * 0.5) / totalAudits * 100).toFixed(2) 
      : '0.00'

    // Group by norms
    const auditsByNorm: Record<string, AuditLog[]> = {}
    auditLogs?.forEach((log: AuditLog) => {
      if (!auditsByNorm[log.norma]) {
        auditsByNorm[log.norma] = []
      }
      auditsByNorm[log.norma].push(log)
    })

    // Prepare structured report
    const auditBundle = {
      metadata: {
        vessel_name: vesselName,
        vessel_id: vesselId,
        report_generated_at: new Date().toISOString(),
        generated_by: user.email,
        norms_covered: norms,
        date_range: {
          start: startDate || 'N/A',
          end: endDate || 'N/A'
        }
      },
      summary: {
        total_audits: totalAudits,
        compliance_rate: `${complianceRate}%`,
        breakdown: {
          conforme,
          nao_conforme: naoConforme,
          parcialmente_conforme: parcialmenteConforme,
          nao_aplicavel: naoAplicavel
        }
      },
      audits_by_norm: auditsByNorm,
      audit_logs: auditLogs || [],
      training_modules: trainingModules || [],
      non_conformities: auditLogs?.filter((log: AuditLog) => 
        log.resultado === 'Não Conforme' || log.resultado === 'Parcialmente Conforme'
      ) || []
    }

    // Return JSON or prepare for PDF generation
    if (format === 'json') {
      return new Response(
        JSON.stringify({
          success: true,
          bundle: auditBundle
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For PDF format, return structured data that frontend can use to generate PDF
    // Frontend has jspdf and html2pdf libraries available
    return new Response(
      JSON.stringify({
        success: true,
        format: 'pdf_data',
        bundle: auditBundle,
        message: 'Use os dados retornados para gerar PDF no frontend com jspdf/html2pdf'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in export-audit-bundle function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
