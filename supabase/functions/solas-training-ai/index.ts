import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainingAIRequest {
  type: 'chat' | 'analyze_drill' | 'generate_report' | 'predict_training' | 'suggest_schedule';
  message?: string;
  context?: {
    drills?: any[];
    certifications?: any[];
    crewMembers?: any[];
    drillType?: string;
    drillData?: any;
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, context }: TrainingAIRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'chat':
        systemPrompt = `Você é um especialista em treinamentos marítimos SOLAS, ISM e ISPS Code. Seu papel é:
- Explicar procedimentos de drills de segurança (incêndio, abandono, homem ao mar, blackout, etc.)
- Orientar sobre requisitos STCW para certificações da tripulação
- Ajudar com planejamento de treinamentos obrigatórios
- Fornecer informações sobre conformidade ISM/ISPS
- Gerar checklists para exercícios de segurança
- Analisar gaps de treinamento

Responda sempre em português brasileiro, de forma clara e profissional. Use formatação markdown quando apropriado.`;
        userPrompt = message || '';
        break;

      case 'analyze_drill':
        systemPrompt = `Você é um auditor especialista em segurança marítima. Analise os dados do drill fornecido e gere um relatório detalhado incluindo:
- Pontos fortes da execução
- Áreas de melhoria
- Conformidade com requisitos SOLAS
- Recomendações de ações corretivas
- Score de efetividade (0-100)

Responda em português brasileiro com formato estruturado.`;
        userPrompt = `Analise este drill: ${JSON.stringify(context?.drillData)}`;
        break;

      case 'generate_report':
        systemPrompt = `Você é um oficial de segurança responsável pela documentação ISM. Gere um relatório profissional de treinamentos que inclua:
- Resumo executivo
- Status de conformidade SOLAS
- Drills realizados e pendentes
- Certificações da tripulação
- Análise de riscos
- Recomendações

Use formatação markdown profissional. Responda em português.`;
        userPrompt = `Gere relatório com estes dados:
Drills: ${JSON.stringify(context?.drills)}
Certificações: ${JSON.stringify(context?.certifications)}`;
        break;

      case 'predict_training':
        systemPrompt = `Você é um sistema de IA preditiva para gestão de treinamentos marítimos. Baseado no histórico e dados fornecidos:
- Preveja necessidades futuras de treinamento
- Identifique gaps de competência
- Sugira priorização de reciclagens
- Estime riscos de não-conformidade
- Recomende cronograma otimizado

Forneça previsões concretas com datas estimadas. Responda em português.`;
        userPrompt = `Analise e preveja necessidades:
Tripulação: ${JSON.stringify(context?.crewMembers)}
Certificações: ${JSON.stringify(context?.certifications)}
Histórico de drills: ${JSON.stringify(context?.drills)}`;
        break;

      case 'suggest_schedule':
        systemPrompt = `Você é um planejador de treinamentos especializado em operações marítimas. Crie um cronograma otimizado de drills que:
- Atenda requisitos SOLAS de frequência
- Minimize interrupção das operações
- Maximize participação da tripulação
- Considere rotação de turnos
- Inclua todos os tipos obrigatórios

Forneça um plano detalhado com datas sugeridas. Responda em português.`;
        userPrompt = `Crie cronograma considerando:
Drills pendentes: ${JSON.stringify(context?.drills?.filter((d: any) => d.status !== 'completed'))}
Total tripulação: ${context?.crewMembers?.length || 24}`;
        break;

      default:
        throw new Error('Tipo de requisição inválido');
    }

    console.log(`[SOLAS AI] Processing ${type} request`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SOLAS AI] Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add more credits.',
          code: 'CREDITS_EXHAUSTED'
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    console.log(`[SOLAS AI] Successfully processed ${type} request`);

    return new Response(JSON.stringify({ 
      success: true,
      response: content,
      type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[SOLAS AI] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
