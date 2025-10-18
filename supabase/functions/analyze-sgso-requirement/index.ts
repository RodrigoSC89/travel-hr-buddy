// Follow the OpenAI API structure used in other functions
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    // Get the OpenAI API key from environment
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    // Parse request body
    const { requirement, description, evidence, compliance_status } = await req.json();

    if (!requirement || !evidence) {
      return new Response(
        JSON.stringify({ error: 'Requisito e evidência são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build the prompt for AI analysis
    const prompt = `
Você é um auditor técnico de embarcações offshore, especialista em SGSO (Sistema de Gestão de Segurança Operacional) conforme a Resolução ANP 43/2007.

Analise o seguinte requisito SGSO:

**Requisito:** ${requirement}
**Descrição:** ${description}
**Status de Conformidade:** ${compliance_status}
**Evidência fornecida:** ${evidence}

Com base nas evidências apresentadas e no status de conformidade, gere uma análise detalhada em formato JSON com os seguintes campos:

1. **causa_provavel**: Se houver não conformidade ou conformidade parcial, identifique a causa provável. Se estiver conforme, indique "N/A".
2. **recomendacao**: Forneça sugestões de ações corretivas ou melhorias. Para requisitos conformes, sugira melhores práticas ou otimizações.
3. **impacto**: Descreva o impacto operacional atual ou potencial relacionado ao nível de conformidade.

Responda APENAS com o objeto JSON, sem texto adicional.
`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um auditor técnico especialista em SGSO para embarcações offshore. Responda sempre em português do Brasil, fornecendo análises técnicas precisas e detalhadas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Erro ao chamar API OpenAI');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse the JSON response from AI
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', aiResponse);
      // If parsing fails, create a structured response
      analysis = {
        causa_provavel: 'Análise disponível no formato de texto',
        recomendacao: aiResponse.substring(0, 500),
        impacto: 'Consulte a análise detalhada'
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in analyze-sgso-requirement function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        causa_provavel: 'Erro ao processar análise',
        recomendacao: 'Verifique a configuração do serviço de IA',
        impacto: 'Análise não disponível no momento'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
