import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "chat":
        systemPrompt = `Você é o Nautilus People AI, um assistente especializado em Recursos Humanos com expertise em:
        - Gestão de Talentos e Recrutamento
        - Avaliação de Desempenho e OKRs
        - Clima Organizacional e Engajamento
        - Legislação Trabalhista (CLT, eSocial)
        - People Analytics e Métricas de RH
        - Desenvolvimento de Carreira
        - Treinamento e Capacitação
        - Gestão de Benefícios
        
        Responda de forma profissional, objetiva e em português brasileiro.
        Quando apropriado, forneça insights baseados em dados e melhores práticas de RH.`;
        userPrompt = data.message;
        break;

      case "screenCandidate":
        systemPrompt = `Você é um especialista em recrutamento e seleção com IA.
        Analise o candidato e forneça uma avaliação detalhada incluindo:
        1. Score de adequação à vaga (0-100%)
        2. Pontos fortes identificados
        3. Pontos de atenção
        4. Perguntas sugeridas para entrevista
        5. Fit cultural estimado
        Responda em JSON válido.`;
        userPrompt = `Analise este candidato para a vaga:
        Candidato: ${JSON.stringify(data.candidate)}
        Vaga: ${JSON.stringify(data.job)}`;
        break;

      case "generateJobDescription":
        systemPrompt = `Você é um especialista em criar descrições de vagas atraentes e completas.
        Crie uma descrição profissional que inclua:
        - Título atrativo
        - Resumo da posição
        - Responsabilidades principais
        - Requisitos técnicos
        - Competências comportamentais
        - Benefícios sugeridos
        - Diferenciais`;
        userPrompt = `Crie uma descrição de vaga para: ${data.title}
        Departamento: ${data.department}
        Nível: ${data.level}
        Informações adicionais: ${data.details || 'Nenhuma'}`;
        break;

      case "analyzePerformance":
        systemPrompt = `Você é um especialista em gestão de desempenho.
        Analise os dados de performance e forneça:
        1. Avaliação geral (nota sugerida 1-5)
        2. Análise de metas atingidas
        3. Pontos fortes do colaborador
        4. Áreas de desenvolvimento
        5. Recomendação para próximo ciclo
        6. Sugestão de PDI (Plano de Desenvolvimento Individual)`;
        userPrompt = `Analise o desempenho deste colaborador:
        ${JSON.stringify(data.employee)}
        Metas: ${JSON.stringify(data.goals)}
        Feedbacks recebidos: ${JSON.stringify(data.feedbacks || [])}`;
        break;

      case "generateOKR":
        systemPrompt = `Você é um especialista em OKRs (Objectives and Key Results).
        Crie OKRs SMART, desafiadores mas alcançáveis.
        Forneça em formato JSON com:
        - objective: string
        - keyResults: array de {title, target, unit, baseline}
        - quarter: string
        - owner: string`;
        userPrompt = `Gere OKRs para: ${data.context}
        Departamento: ${data.department}
        Período: ${data.period}`;
        break;

      case "analyzeFeedback":
        systemPrompt = `Você é um especialista em feedback e comunicação organizacional.
        Analise o feedback e forneça:
        1. Classificação do feedback (construtivo, reconhecimento, melhoria)
        2. Tom emocional detectado
        3. Pontos-chave extraídos
        4. Sugestões de ação para o gestor
        5. Se aplicável, alerta de risco`;
        userPrompt = `Analise este feedback anônimo:
        "${data.feedback}"
        Departamento de origem: ${data.department}`;
        break;

      case "generateInsights":
        systemPrompt = `Você é um analista de People Analytics com expertise em métricas de RH.
        Baseado nos dados, gere insights acionáveis sobre:
        1. Tendências identificadas
        2. Riscos potenciais (turnover, engajamento, etc.)
        3. Oportunidades de melhoria
        4. Recomendações prioritárias
        5. Previsões para próximo período
        Responda em português brasileiro de forma executiva.`;
        userPrompt = `Analise estes dados de RH:
        ${JSON.stringify(data.metrics)}`;
        break;

      case "predictTurnover":
        systemPrompt = `Você é um especialista em análise preditiva de turnover.
        Analise o perfil do colaborador e estime:
        1. Probabilidade de saída (0-100%)
        2. Fatores de risco identificados
        3. Sinais de alerta
        4. Ações de retenção recomendadas
        5. Urgência da intervenção (baixa, média, alta, crítica)
        Responda em JSON.`;
        userPrompt = `Analise risco de turnover para:
        ${JSON.stringify(data.employee)}
        Histórico: ${JSON.stringify(data.history || {})}`;
        break;

      case "suggestTraining":
        systemPrompt = `Você é um especialista em Treinamento e Desenvolvimento.
        Sugira um plano de desenvolvimento personalizado incluindo:
        1. Gaps de competência identificados
        2. Cursos/treinamentos recomendados
        3. Mentoria sugerida
        4. Projetos para desenvolvimento
        5. Timeline sugerida
        6. Métricas de acompanhamento`;
        userPrompt = `Sugira desenvolvimento para:
        Colaborador: ${JSON.stringify(data.employee)}
        Cargo atual: ${data.currentRole}
        Cargo desejado: ${data.targetRole || 'Não especificado'}
        Avaliações: ${JSON.stringify(data.evaluations || [])}`;
        break;

      case "analyzeClimate":
        systemPrompt = `Você é um especialista em clima organizacional.
        Analise os dados e forneça:
        1. Score geral de clima (0-100)
        2. Áreas de destaque positivo
        3. Áreas de atenção
        4. Comparativo com benchmarks
        5. Ações recomendadas prioritárias
        6. Previsão de tendência`;
        userPrompt = `Analise dados de clima:
        ${JSON.stringify(data.climateData)}`;
        break;

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Por favor, adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ success: true, result: content, action }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in nautilus-people-ai:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
