import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Interface para OS resolvida
interface ResolvedOS {
  os_id: string;
  componente: string;
  descricao_tecnica: string;
  acao_realizada: string;
  causa_confirmada: string;
  efetiva: boolean;
  duracao_horas: number;
  resolvido_em: string;
  vessel_name: string;
  taxa_eficacia_componente: number;
}

// Interface para estatísticas do componente
interface ComponentStats {
  componente: string;
  total_ocorrencias: number;
  resolucoes_efetivas: number;
  resolucoes_inefetivas: number;
  taxa_eficacia_pct: number;
  media_duracao_horas_efetivas: number;
  min_duracao_horas: number;
  max_duracao_horas: number;
  acoes_efetivas_unicas: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { componente, job_description, job_id } = await req.json();
    
    if (!componente) {
      throw new Error("Componente é obrigatório");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Querying similar OS resolutions for component: ${componente}`);

    // Buscar OS resolvidas similares usando a função do banco
    const { data: similarOS, error: osError } = await supabase
      .rpc('get_similar_os_resolutions', {
        p_componente: componente,
        p_limit: 5
      }) as { data: ResolvedOS[] | null, error: any };

    if (osError) {
      console.error("Error fetching similar OS:", osError);
      throw new Error(`Erro ao buscar OS similares: ${osError.message}`);
    }

    // Buscar estatísticas do componente
    const { data: componentStats, error: statsError } = await supabase
      .from('mmi_os_stats_by_component')
      .select('*')
      .ilike('componente', `%${componente}%`)
      .limit(1)
      .single() as { data: ComponentStats | null, error: any };

    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error("Error fetching component stats:", statsError);
    }

    // Se não houver dados históricos, retornar resposta sem sugestão baseada em histórico
    if (!similarOS || similarOS.length === 0) {
      return new Response(JSON.stringify({ 
        message: "Não há histórico de resoluções anteriores para este componente. Recomenda-se seguir o manual de manutenção padrão e documentar a resolução para futuros casos.",
        has_historical_data: false,
        componente,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Preparar dados para a IA
    const historicalContext = similarOS.map((os, index) => 
      `Caso ${index + 1}:
- OS ID: ${os.os_id}
- Descrição: ${os.descricao_tecnica}
- Ação realizada: ${os.acao_realizada}
- Causa confirmada: ${os.causa_confirmada || 'Não especificada'}
- Tempo de execução: ${os.duracao_horas?.toFixed(2) || 'N/A'} horas
- Embarcação: ${os.vessel_name || 'N/A'}
- Data de resolução: ${new Date(os.resolvido_em).toLocaleDateString('pt-BR')}
`
    ).join('\n');

    const statsContext = componentStats ? `
Estatísticas gerais para "${componentStats.componente}":
- Total de ocorrências: ${componentStats.total_ocorrencias}
- Resoluções efetivas: ${componentStats.resolucoes_efetivas}
- Taxa de eficácia: ${componentStats.taxa_eficacia_pct?.toFixed(1) || '0'}%
- Tempo médio de execução (resoluções efetivas): ${componentStats.media_duracao_horas_efetivas?.toFixed(2) || 'N/A'} horas
- Tempo mínimo registrado: ${componentStats.min_duracao_horas?.toFixed(2) || 'N/A'} horas
- Tempo máximo registrado: ${componentStats.max_duracao_horas?.toFixed(2) || 'N/A'} horas
` : '';

    // Chamar OpenAI para gerar sugestão inteligente
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      // Se não houver chave da OpenAI, retornar resposta baseada apenas em dados
      const bestResolution = similarOS[0]; // A query já ordena por data e eficácia
      
      return new Response(JSON.stringify({ 
        suggestion: `Com base no histórico de ${similarOS.length} resolução(ões) efetiva(s) para o componente "${componente}", a ação mais recente e efetiva foi:\n\n"${bestResolution.acao_realizada}"\n\nTempo médio de execução: ${bestResolution.duracao_horas?.toFixed(2) || 'N/A'} horas\nCausa identificada: ${bestResolution.causa_confirmada || 'Não especificada'}${statsContext ? '\n\n' + statsContext : ''}`,
        has_historical_data: true,
        similar_cases_count: similarOS.length,
        most_effective_action: bestResolution.acao_realizada,
        average_duration_hours: bestResolution.duracao_horas,
        success_rate: componentStats?.taxa_eficacia_pct || null,
        historical_cases: similarOS,
        component_stats: componentStats,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gerar sugestão inteligente com OpenAI
    const systemPrompt = `Você é um assistente técnico especializado em manutenção industrial marítima. 
Sua função é analisar o histórico de Ordens de Serviço (OS) resolvidas e fornecer sugestões precisas e acionáveis 
para técnicos embarcados.

Características da sua resposta:
- Seja direto e objetivo
- Foque na ação mais efetiva baseada no histórico
- Mencione o tempo médio de execução esperado
- Se houver múltiplas abordagens bem-sucedidas, explique as diferenças
- Inclua alertas de segurança se relevante
- Forneça dicas práticas baseadas nas causas confirmadas
- Use linguagem técnica apropriada mas clara
- Responda em português brasileiro`;

    const userPrompt = `Preciso de uma sugestão para resolver o seguinte job de manutenção:

Componente: ${componente}
${job_description ? `Descrição do problema atual: ${job_description}` : ''}
${job_id ? `Job ID: ${job_id}` : ''}

Histórico de resoluções anteriores efetivas para este componente:
${historicalContext}

${statsContext}

Com base nestes dados históricos, forneça:
1. A ação mais recomendada
2. Tempo estimado de execução
3. Pontos de atenção e dicas práticas
4. Se houver variações nas abordagens, explique quando usar cada uma`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5, // Menor temperatura para respostas mais determinísticas
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiData = await response.json();
    const aiSuggestion = aiData.choices[0].message.content;

    console.log("AI suggestion generated successfully");

    return new Response(JSON.stringify({ 
      suggestion: aiSuggestion,
      has_historical_data: true,
      similar_cases_count: similarOS.length,
      most_effective_action: similarOS[0]?.acao_realizada,
      average_duration_hours: similarOS[0]?.duracao_horas,
      success_rate: componentStats?.taxa_eficacia_pct || null,
      historical_cases: similarOS,
      component_stats: componentStats,
      ai_generated: true,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in mmi-copilot function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
