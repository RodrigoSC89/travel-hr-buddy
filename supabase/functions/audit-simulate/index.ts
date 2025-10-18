import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapping of audit types to norms
const AUDIT_NORMS: Record<string, string[]> = {
  'petrobras_peo_dp': ['PEO-DP', 'ISM Code', 'ISO 45001'],
  'ibama_sgso': ['Resolução ANP 43/2007', 'ISO 14001', 'ISO 45001'],
  'imo_ism': ['ISM Code', 'SOLAS', 'MARPOL'],
  'imo_modu': ['MODU Code', 'ISM Code'],
  'iso_9001': ['ISO 9001:2015'],
  'iso_14001': ['ISO 14001:2015'],
  'iso_45001': ['ISO 45001:2018'],
  'imca': ['IMCA M 149', 'IMCA M 179', 'IMCA SEL 016']
}

const AUDIT_ENTITIES: Record<string, string> = {
  'petrobras_peo_dp': 'Petrobras (PEO-DP)',
  'ibama_sgso': 'IBAMA (SGSO)',
  'imo_ism': 'IMO (ISM Code)',
  'imo_modu': 'IMO (MODU Code)',
  'iso_9001': 'Certificadora ISO 9001',
  'iso_14001': 'Certificadora ISO 14001',
  'iso_45001': 'Certificadora ISO 45001',
  'imca': 'IMCA'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { vesselId, auditType } = await req.json()

    // Validate required fields
    if (!vesselId || !auditType) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: vesselId, auditType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate audit type
    if (!AUDIT_NORMS[auditType]) {
      return new Response(
        JSON.stringify({ error: 'Tipo de auditoria inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get vessel information
    const { data: vessel, error: vesselError } = await supabase
      .from('vessels')
      .select('*')
      .eq('id', vesselId)
      .single()

    if (vesselError || !vessel) {
      return new Response(
        JSON.stringify({ error: 'Embarcação não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('VITE_OPENAI_API_KEY') || Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      return new Response(
        JSON.stringify({ error: 'Configuração de IA não disponível' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get norms for this audit type
    const normasAplicadas = AUDIT_NORMS[auditType]
    const auditEntity = AUDIT_ENTITIES[auditType]

    // Get related data from database
    const { data: incidents } = await supabase
      .from('safety_incidents')
      .select('*')
      .eq('vessel_id', vesselId)
      .order('incident_date', { ascending: false })
      .limit(10)

    const { data: sgsoPractices } = await supabase
      .from('sgso_practices')
      .select('*')
      .eq('organization_id', vessel.organization_id)
      .limit(5)

    const { data: evidences } = await supabase
      .from('compliance_evidences')
      .select('*')
      .eq('vessel_id', vesselId)
      .eq('validated', true)

    // Build context for AI
    const vesselContext = `
Nome: ${vessel.name}
IMO: ${vessel.imo_number || 'N/A'}
Tipo: ${vessel.vessel_type}
Bandeira: ${vessel.flag_state}
Status: ${vessel.status}

Incidentes Recentes: ${incidents?.length || 0}
Práticas SGSO em Conformidade: ${sgsoPractices?.filter((p: any) => p.status === 'compliant').length || 0} de ${sgsoPractices?.length || 0}
Evidências Validadas: ${evidences?.length || 0}
`

    // Create prompt for AI
    const prompt = `Você é um auditor técnico sênior da entidade: "${auditEntity}".

Avalie os dados do navio "${vessel.name}" de acordo com as normas:
${normasAplicadas.join(", ")}

Contexto da Embarcação:
${vesselContext}

Informe:
1. Conformidades detectadas ✅ (lista de 3-5 itens)
2. Não conformidades 🚨 (lista de 3-5 itens com severidade)
3. Score final por norma (0 a 100) para cada norma aplicada
4. Relatório técnico da auditoria (formato textual profissional, 200-300 palavras)
5. Plano de ação para os gaps detectados (3-5 ações prioritárias)

Retorne sua resposta em formato JSON estruturado seguindo este modelo:
{
  "conformidades": ["item 1", "item 2", ...],
  "naoConformidades": [
    {"item": "descrição", "severidade": "critical|high|medium|low", "norma": "norma aplicável"},
    ...
  ],
  "scoresPorNorma": {
    "norma1": 85,
    "norma2": 72,
    ...
  },
  "relatorioTecnico": "texto do relatório...",
  "planoAcao": [
    {"prioridade": 1, "acao": "descrição da ação", "prazo": "dias estimados"},
    ...
  ]
}

Seja rigoroso mas justo na avaliação. Base sua análise nos dados fornecidos.`

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Você é um auditor técnico sênior especializado em normas marítimas e offshore. 
Você realiza auditorias seguindo os mais altos padrões de ${auditEntity}.
Seja técnico, preciso e estruturado em suas respostas.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar simulação da auditoria' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const aiData = await openaiResponse.json()
    const aiResult = JSON.parse(aiData.choices[0]?.message?.content || '{}')

    // Calculate overall score
    const scores = Object.values(aiResult.scoresPorNorma || {}) as number[]
    const overallScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0

    // Get current user from auth header
    const authHeader = req.headers.get('Authorization')
    let userId = null
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id || null
    }

    // Save audit simulation to database
    const { data: auditSimulation, error: saveError } = await supabase
      .from('audit_simulations')
      .insert({
        organization_id: vessel.organization_id,
        vessel_id: vesselId,
        audit_type: auditType,
        audit_entity: auditEntity,
        norms_applied: normasAplicadas,
        conformities: aiResult.conformidades || [],
        non_conformities: aiResult.naoConformidades || [],
        scores_by_norm: aiResult.scoresPorNorma || {},
        overall_score: overallScore,
        technical_report: aiResult.relatorioTecnico || '',
        action_plan: aiResult.planoAcao || [],
        simulated_by: userId,
        status: 'completed'
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving audit simulation:', saveError)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar simulação de auditoria' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        auditId: auditSimulation.id,
        vesselName: vessel.name,
        auditType,
        auditEntity,
        normasAplicadas,
        conformidades: aiResult.conformidades || [],
        naoConformidades: aiResult.naoConformidades || [],
        scoresPorNorma: aiResult.scoresPorNorma || {},
        overallScore,
        relatorioTecnico: aiResult.relatorioTecnico || '',
        planoAcao: aiResult.planoAcao || [],
        simulatedDate: auditSimulation.created_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in audit-simulate function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
