/// <reference path="../deno-ambient.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlanoRequest {
  navio: string;
  item: string;
  norma: string;
}

interface AIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { navio, item, norma }: PlanoRequest = await req.json();

    if (!navio || !item || !norma) {
      return new Response(
        JSON.stringify({ error: 'Campos obrigatórios: navio, item, norma' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prefer Lovable AI Gateway, fallback to OpenAI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!LOVABLE_API_KEY && !OPENAI_API_KEY) {
      console.error('No AI API key configured');
      return new Response(
        JSON.stringify({ error: 'Configuração de IA não disponível' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

Formate como uma lista estruturada e prática. Mantenha o tom profissional e em português brasileiro.`;

    const apiUrl = LOVABLE_API_KEY 
      ? 'https://ai.gateway.lovable.dev/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    
    const apiKey = LOVABLE_API_KEY || OPENAI_API_KEY;
    const model = LOVABLE_API_KEY ? 'google/gemini-2.5-flash' : 'gpt-4o-mini';

    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
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
    });

    if (aiResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Rate limit excedido. Tente novamente em alguns segundos.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (aiResponse.status === 402) {
      return new Response(
        JSON.stringify({ error: 'Créditos de IA esgotados. Recarregue seu plano.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error('AI API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar plano de ação da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: AIResponse = await aiResponse.json();
    const plano = data.choices?.[0]?.message?.content?.trim() || 'Não foi possível gerar plano de ação.';

    return new Response(
      JSON.stringify({ plano }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in plano function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
