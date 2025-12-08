// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CrewOptimizerRequest {
  optimizationType: 'schedule' | 'allocation' | 'fatigue' | 'certification' | 'cost';
  vesselId?: string;
  dateRange?: { start: string; end: string };
  constraints?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { optimizationType, vesselId, dateRange, constraints }: CrewOptimizerRequest = await req.json();
    
    console.log(`[AI-Crew] Optimization type: ${optimizationType}`);

    // Fetch crew data
    const { data: crewMembers } = await supabase
      .from('crew_members')
      .select('*')
      .limit(100);

    // Fetch certifications
    const { data: certifications } = await supabase
      .from('crew_certifications')
      .select('*')
      .limit(200);

    // Fetch vessels
    const { data: vessels } = await supabase
      .from('vessels')
      .select('*')
      .limit(20);

    // Fetch assignments if available
    const { data: assignments } = await supabase
      .from('crew_assignments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    const contextData = {
      crewMembers: crewMembers || [],
      certifications: certifications || [],
      vessels: vessels || [],
      assignments: assignments || [],
      constraints: constraints || {}
    };

    const optimizationPrompts: Record<string, string> = {
      schedule: `Otimize a escala de tripulação considerando:

Tripulantes disponíveis: ${JSON.stringify(contextData.crewMembers.slice(0, 20))}
Embarcações: ${JSON.stringify(contextData.vessels)}
Alocações atuais: ${JSON.stringify(contextData.assignments.slice(0, 10))}

Forneça:
1. Escala otimizada para os próximos 30 dias
2. Balanceamento de carga de trabalho
3. Cobertura de posições críticas
4. Conflitos identificados e resoluções
5. Economia estimada vs escala atual`,

      allocation: `Sugira a melhor alocação de tripulantes para as embarcações:

Tripulantes: ${JSON.stringify(contextData.crewMembers.slice(0, 15))}
Certificações: ${JSON.stringify(contextData.certifications.slice(0, 20))}
Embarcações: ${JSON.stringify(contextData.vessels)}

Considere:
1. Compatibilidade de certificações
2. Experiência em tipos de embarcação
3. Preferências e histórico
4. Balanceamento de skills
5. Matriz de alocação recomendada`,

      fatigue: `Analise riscos de fadiga da tripulação:

Dados de tripulação: ${JSON.stringify(contextData.crewMembers.slice(0, 15))}
Alocações recentes: ${JSON.stringify(contextData.assignments.slice(0, 15))}

Avalie:
1. Score de risco de fadiga por tripulante (0-100)
2. Tripulantes que precisam de descanso imediato
3. Padrões de trabalho preocupantes
4. Recomendações de rotação
5. Impacto na segurança operacional`,

      certification: `Analise o status de certificações da tripulação:

Tripulantes: ${JSON.stringify(contextData.crewMembers.slice(0, 20))}
Certificações: ${JSON.stringify(contextData.certifications.slice(0, 30))}

Identifique:
1. Certificações próximas do vencimento (30, 60, 90 dias)
2. Gaps de certificação por posição
3. Plano de renovação priorizado
4. Custos estimados de renovação
5. Riscos de compliance`,

      cost: `Otimize custos de tripulação mantendo a qualidade:

Tripulantes: ${JSON.stringify(contextData.crewMembers.slice(0, 20))}
Alocações: ${JSON.stringify(contextData.assignments.slice(0, 20))}
Embarcações: ${JSON.stringify(contextData.vessels)}

Analise:
1. Custo atual estimado por embarcação
2. Oportunidades de redução de custo
3. Impacto na qualidade e segurança
4. ROI de diferentes cenários
5. Recomendações de implementação`
    };

    const systemPrompt = `Você é um especialista em gestão de tripulação marítima e otimização de recursos humanos.
Priorize sempre a segurança e conformidade com regulamentações marítimas (STCW, MLC).
Forneça análises quantitativas e acionáveis.
Considere fatores humanos e bem-estar da tripulação.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: optimizationPrompts[optimizationType] }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (aiResponse.status === 429) {
      return new Response(
        JSON.stringify({ error: 'Rate limit excedido.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (aiResponse.status === 402) {
      return new Response(
        JSON.stringify({ error: 'Créditos esgotados.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!aiResponse.ok) {
      throw new Error('AI API error');
    }

    const data = await aiResponse.json();
    const optimization = data.choices[0].message.content;

    console.log(`[AI-Crew] Optimization completed: ${optimizationType}`);

    return new Response(
      JSON.stringify({
        optimizationType,
        optimization,
        summary: {
          crewCount: contextData.crewMembers.length,
          vesselCount: contextData.vessels.length,
          certificationsCount: contextData.certifications.length,
        },
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[AI-Crew] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
