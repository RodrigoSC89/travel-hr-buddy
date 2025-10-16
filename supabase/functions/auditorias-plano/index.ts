import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { navio, item, norma } = await req.json()

    // Validate required fields
    if (!navio || !item || !norma) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: navio, item, norma' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Create prompt for action plan
    const prompt = `Você é um auditor técnico especializado em normas IMCA (International Marine Contractors Association).

Contexto da Auditoria:
- Embarcação: ${navio}
- Item Auditado: ${item}
- Norma Aplicada: ${norma}
- Resultado: Não Conforme

Tarefa: Crie um plano de ação detalhado e prático para corrigir a não conformidade identificada.

O plano deve incluir:
1. Ações Imediatas (curto prazo - 0 a 30 dias)
2. Ações Corretivas (médio prazo - 30 a 90 dias)
3. Ações Preventivas (longo prazo - acima de 90 dias)
4. Responsabilidades recomendadas (cargos/funções)
5. Recursos necessários

Formate como uma lista estruturada e prática. Mantenha o tom profissional e em português brasileiro.`

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
            content: 'Você é um engenheiro auditor especializado em normas IMCA para operações offshore marítimas, com expertise em planos de ação corretiva.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar plano de ação da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await openaiResponse.json()
    const plano = data.choices[0]?.message?.content?.trim() || 'Não foi possível gerar plano de ação.'

    return new Response(
      JSON.stringify({ plano }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in plano function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
