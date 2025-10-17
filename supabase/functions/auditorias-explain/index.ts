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

    // Create prompt for AI explanation
    const prompt = `Você é um auditor técnico especializado em normas IMCA (International Marine Contractors Association).

Contexto da Auditoria:
- Embarcação: ${navio}
- Item Auditado: ${item}
- Norma Aplicada: ${norma}
- Resultado: Não Conforme

Tarefa: Explique de forma técnica e sucinta por que este item pode ter sido classificado como "Não Conforme" segundo a norma ${norma}. 
Inclua:
1. O que a norma exige especificamente
2. Possíveis razões para a não conformidade
3. Impactos operacionais ou de segurança

Mantenha a resposta profissional, técnica e em português brasileiro.`

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
            content: 'Você é um engenheiro auditor especializado em normas IMCA para operações offshore marítimas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar explicação da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await openaiResponse.json()
    const resultado = data.choices[0]?.message?.content?.trim() || 'Não foi possível gerar explicação.'

    return new Response(
      JSON.stringify({ resultado }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in explain function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
