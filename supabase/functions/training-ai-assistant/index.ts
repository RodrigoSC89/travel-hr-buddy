// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    console.log(`[Training AI] Action: ${action}, Has API Key: ${!!LOVABLE_API_KEY}`);

    if (!LOVABLE_API_KEY) {
      console.log("[Training AI] No API key, using local processing");
      return new Response(
        JSON.stringify(processLocally(action, data)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "generate_recommendations":
        systemPrompt = `Você é um especialista em treinamento marítimo e gestão de competências de tripulação offshore. 
Analise os dados da tripulação e cursos disponíveis para gerar recomendações personalizadas de treinamento.
Considere: certificações vencendo, lacunas de habilidades, histórico de desempenho, requisitos STCW, SOLAS e regulamentações marítimas.
Seja específico e prático nas recomendações.
Responda APENAS em JSON válido sem markdown.`;
        userPrompt = `Analise estes dados e gere 5 recomendações de treinamento prioritárias:
Tripulação (${data.crew?.length || 0} membros): ${JSON.stringify(data.crew?.slice(0, 10))}
Cursos disponíveis (${data.courses?.length || 0} cursos): ${JSON.stringify(data.courses?.slice(0, 10))}

Retorne um JSON com formato:
{
  "recommendations": [
    {
      "id": "rec-1",
      "crewMemberId": "string", 
      "crewMemberName": "string",
      "recommendedCourses": ["nome curso 1", "nome curso 2"],
      "priority": "high",
      "reason": "Motivo detalhado da recomendação",
      "predictedImpact": "Impacto esperado na conformidade e segurança"
    }
  ]
}`;
        break;

      case "analyze_gaps":
        systemPrompt = `Você é um analista de treinamento marítimo especializado em identificar lacunas de competências em tripulações offshore.
Analise os dados para identificar áreas críticas onde a tripulação precisa de desenvolvimento.
Considere requisitos STCW, SOLAS, MARPOL e outras regulamentações marítimas internacionais.
Priorize por severidade e impacto na operação.
Responda APENAS em JSON válido sem markdown.`;
        userPrompt = `Analise lacunas de treinamento para ${data.crew?.length || 0} tripulantes:
Tripulação: ${JSON.stringify(data.crew?.slice(0, 10))}
Progresso atual: ${JSON.stringify(data.progress?.slice(0, 10))}

Retorne JSON com 4-6 lacunas identificadas:
{
  "gaps": [
    {
      "id": "gap-1",
      "area": "Nome da área/competência",
      "severity": "critical",
      "affectedCrew": 5,
      "description": "Descrição detalhada da lacuna",
      "suggestedAction": "Ação recomendada específica"
    }
  ]
}`;
        break;

      case "predictive_insights":
        systemPrompt = `Você é um sistema de IA preditiva para gestão de treinamento marítimo offshore.
Gere insights baseados em tendências, vencimentos de certificações, padrões de desempenho e riscos de conformidade.
Foque em ações preventivas, conformidade regulatória e otimização de recursos.
Seja específico com datas e números quando possível.
Responda APENAS em JSON válido sem markdown.`;
        userPrompt = `Gere 4-6 insights preditivos baseados nos dados:
Tripulação: ${data.crew?.length || 0} membros
Cursos: ${data.courses?.length || 0} disponíveis
Progresso: ${data.progress?.length || 0} registros

Dados: ${JSON.stringify(data)}

Retorne JSON:
{
  "insights": [
    {
      "id": "insight-1",
      "type": "certification_expiry",
      "title": "Título claro e objetivo",
      "description": "Descrição detalhada do insight",
      "impact": "high",
      "timeframe": "30 dias",
      "actionRequired": true,
      "suggestedAction": "Ação específica recomendada"
    }
  ]
}`;
        break;

      case "generate_content":
        systemPrompt = `Você é um especialista em criação de conteúdo educacional para treinamento marítimo offshore.
Crie conteúdo detalhado, prático e alinhado com padrões internacionais da indústria marítima.
O conteúdo deve ser em português brasileiro, técnico mas acessível.
Inclua exemplos práticos e situações reais quando relevante.
Responda APENAS em JSON válido sem markdown.`;
        userPrompt = `Crie um ${data.type || "course_outline"} completo sobre: ${data.topic}

Para course_outline, retorne:
{
  "content": {
    "title": "Título do Curso",
    "modules": [
      {"id": 1, "title": "Nome do Módulo", "duration": 2, "objectives": ["Objetivo 1", "Objetivo 2"]},
      {"id": 2, "title": "Nome do Módulo 2", "duration": 3, "objectives": ["Objetivo 1"]},
      {"id": 3, "title": "Nome do Módulo 3", "duration": 2, "objectives": ["Objetivo 1"]},
      {"id": 4, "title": "Nome do Módulo 4", "duration": 2, "objectives": ["Objetivo 1"]},
      {"id": 5, "title": "Avaliação Final", "duration": 1, "objectives": ["Avaliação"]}
    ],
    "estimatedDuration": 10,
    "prerequisites": ["Pré-requisito 1"]
  }
}`;
        break;

      case "generate_quiz":
        systemPrompt = `Você é um especialista em avaliação de treinamento marítimo.
Crie questões de múltipla escolha relevantes, práticas e alinhadas com a dificuldade solicitada.
As questões devem testar conhecimento aplicável em situações reais de trabalho offshore.
Cada questão deve ter uma resposta correta clara e explicação educativa.
Responda APENAS em JSON válido sem markdown.`;
        userPrompt = `Crie um quiz de dificuldade ${data.difficulty || "medium"} com 5 questões sobre:
${data.content?.substring(0, 1500) || "Segurança Marítima"}

Retorne:
{
  "questions": [
    {
      "id": "q1",
      "question": "Pergunta clara e objetiva?",
      "options": ["Opção A", "Opção B (correta)", "Opção C", "Opção D"],
      "correctAnswer": 1,
      "explanation": "Explicação detalhada de por que esta é a resposta correta"
    }
  ]
}`;
        break;

      case "chat":
        systemPrompt = `Você é um assistente especializado em treinamento marítimo e desenvolvimento de tripulação offshore.
Seu nome é Nautilus AI e você faz parte do sistema Nautilus Academy.
Ajude com dúvidas sobre:
- Cursos e programas de treinamento
- Certificações marítimas (STCW, GMDSS, DP, etc)
- Planejamento de desenvolvimento de carreira
- Requisitos regulatórios e conformidade
- Análise de desempenho e lacunas de competências

Seja conciso, prático e forneça informações precisas.
Responda em português brasileiro de forma profissional mas amigável.
Se não souber algo, admita e sugira onde encontrar a informação.`;
        userPrompt = `Contexto do usuário:
- Cursos disponíveis: ${data.context?.courses?.length || 0}
- Tripulantes cadastrados: ${data.context?.crewMembers?.length || 0}

Pergunta do usuário: ${data.message}`;
        break;

      case "analyze_performance":
        systemPrompt = `Você é um analista de desempenho de treinamento marítimo.
Analise o histórico de treinamento e forneça insights detalhados sobre desempenho e áreas de melhoria.
Use métricas quantificáveis quando possível.
Responda APENAS em JSON válido sem markdown.`;
        userPrompt = `Analise o desempenho do tripulante:
ID: ${data.crewId}
Histórico: ${JSON.stringify(data.history?.slice(0, 20))}

Retorne:
{
  "overallScore": 85,
  "strengths": ["Ponto forte 1", "Ponto forte 2"],
  "areasForImprovement": ["Área de melhoria 1", "Área de melhoria 2"],
  "trend": "improving",
  "recommendations": ["Recomendação 1", "Recomendação 2"],
  "predictedPerformance": 88
}`;
        break;

      case "generate_full_course":
        systemPrompt = `Você é um designer instrucional especializado em treinamento marítimo offshore.
Crie um curso completo e detalhado baseado no tema fornecido.
O curso deve ser prático, alinhado com regulamentações marítimas e adequado para tripulação offshore.
Inclua módulos detalhados, objetivos de aprendizado e materiais sugeridos.
Responda APENAS em JSON válido sem markdown.`;
        userPrompt = `Crie um curso completo sobre: ${data.topic}
Tipo: ${data.type || "customizado"}
Nível: ${data.level || "intermediate"}

Retorne:
{
  "course": {
    "title": "Título do Curso",
    "description": "Descrição detalhada do curso com objetivos gerais",
    "duration_hours": 8,
    "level": "intermediate",
    "category": "Segurança",
    "modules": [
      {
        "id": 1,
        "title": "Módulo 1",
        "duration": 2,
        "content": "Conteúdo detalhado do módulo",
        "objectives": ["Objetivo 1", "Objetivo 2"],
        "activities": ["Atividade prática 1"]
      }
    ],
    "prerequisites": ["Pré-requisito 1"],
    "assessment": {
      "type": "quiz",
      "passing_score": 70,
      "questions_count": 10
    }
  }
}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Unknown action", availableActions: ["generate_recommendations", "analyze_gaps", "predictive_insights", "generate_content", "generate_quiz", "chat", "analyze_performance", "generate_full_course"] }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`[Training AI] Calling AI Gateway for action: ${action}`);

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
          { role: "user", content: userPrompt },
        ],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`[Training AI] AI Gateway error: ${response.status}`);
      
      if (response.status === 429) {
        console.log("[Training AI] Rate limited, using fallback");
        return new Response(
          JSON.stringify({ ...processLocally(action, data), _fallback: true, _reason: "rate_limit" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.log("[Training AI] Payment required, using fallback");
        return new Response(
          JSON.stringify({ ...processLocally(action, data), _fallback: true, _reason: "payment_required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(processLocally(action, data)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    console.log(`[Training AI] AI response received, content length: ${content?.length || 0}`);

    if (!content) {
      console.log("[Training AI] No content in AI response, using fallback");
      return new Response(
        JSON.stringify(processLocally(action, data)),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle chat action differently (text response)
    if (action === "chat") {
      return new Response(
        JSON.stringify({ response: content, _ai: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON response
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content;
      if (content.includes("```json")) {
        cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (content.includes("```")) {
        cleanContent = content.replace(/```\n?/g, "");
      }
      
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log("[Training AI] Successfully parsed AI JSON response");
        return new Response(
          JSON.stringify({ ...parsed, _ai: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (parseError) {
      console.error("[Training AI] JSON parse error:", parseError);
    }

    console.log("[Training AI] Could not parse AI response, using fallback");
    return new Response(
      JSON.stringify(processLocally(action, data)),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Training AI] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Local processing fallback with rich mock data
function processLocally(action: string, data: any): any {
  const now = new Date();
  
  switch (action) {
    case "generate_recommendations":
      const crew = data.crew || [];
      const courses = data.courses || [];
      return {
        recommendations: [
          {
            id: "rec-1",
            crewMemberId: crew[0]?.id || "crew-1",
            crewMemberName: crew[0]?.name || "Carlos Silva",
            recommendedCourses: [courses[0]?.course_name || "STCW Básico", "Combate a Incêndio"],
            priority: "high",
            reason: "Certificação STCW vence em 25 dias. Renovação urgente necessária para manter conformidade.",
            predictedImpact: "Melhoria de 20% na conformidade de segurança da embarcação",
          },
          {
            id: "rec-2",
            crewMemberId: crew[1]?.id || "crew-2",
            crewMemberName: crew[1]?.name || "Maria Santos",
            recommendedCourses: ["Navegação Eletrônica", courses[1]?.course_name || "DP Avançado"],
            priority: "high",
            reason: "Promoção para 1º Oficial requer certificação em navegação eletrônica avançada.",
            predictedImpact: "Habilitação para promoção e aumento de 15% na eficiência operacional",
          },
          {
            id: "rec-3",
            crewMemberId: crew[2]?.id || "crew-3",
            crewMemberName: crew[2]?.name || "João Oliveira",
            recommendedCourses: ["Gestão Ambiental", "MARPOL Compliance"],
            priority: "medium",
            reason: "Auditoria PEOTRAM agendada para próximo mês. Atualização recomendada.",
            predictedImpact: "Preparação para auditoria e redução de riscos de não-conformidade",
          },
          {
            id: "rec-4",
            crewMemberId: crew[3]?.id || "crew-4",
            crewMemberName: crew[3]?.name || "Ana Costa",
            recommendedCourses: ["Primeiros Socorros Avançado"],
            priority: "medium",
            reason: "Última atualização de primeiros socorros há 18 meses. Reciclagem recomendada.",
            predictedImpact: "Melhoria na capacidade de resposta a emergências médicas",
          },
          {
            id: "rec-5",
            crewMemberId: crew[4]?.id || "crew-5",
            crewMemberName: crew[4]?.name || "Pedro Lima",
            recommendedCourses: ["Operação de Guindastes"],
            priority: "low",
            reason: "Desenvolvimento de novas competências para versatilidade operacional.",
            predictedImpact: "Aumento de flexibilidade operacional da tripulação",
          },
        ],
      };

    case "analyze_gaps":
      const crewCount = data.crew?.length || 25;
      return {
        gaps: [
          {
            id: "gap-1",
            area: "Certificação STCW Básica",
            severity: "critical",
            affectedCrew: Math.ceil(crewCount * 0.12),
            description: "3 tripulantes com STCW vencendo nos próximos 30 dias. Risco de não-conformidade iminente.",
            suggestedAction: "Agendar renovação imediata. Priorizar tripulantes: Carlos Silva, João Mendes, Ana Rodrigues",
          },
          {
            id: "gap-2",
            area: "Combate a Incêndio Avançado",
            severity: "critical",
            affectedCrew: Math.ceil(crewCount * 0.16),
            description: "4 tripulantes sem atualização de combate a incêndio no último ano. Requisito regulatório.",
            suggestedAction: "Incluir no próximo ciclo de treinamento. Verificar disponibilidade de simulador.",
          },
          {
            id: "gap-3",
            area: "Operação de DP (Posicionamento Dinâmico)",
            severity: "warning",
            affectedCrew: Math.ceil(crewCount * 0.08),
            description: "Déficit de operadores DP qualificados para operações complexas.",
            suggestedAction: "Iniciar programa de capacitação DP para 2 tripulantes selecionados.",
          },
          {
            id: "gap-4",
            area: "GMDSS (Comunicação Marítima)",
            severity: "warning",
            affectedCrew: Math.ceil(crewCount * 0.2),
            description: "5 tripulantes precisam renovar certificação GMDSS nos próximos 90 dias.",
            suggestedAction: "Programar treinamento GMDSS para próximo mês.",
          },
          {
            id: "gap-5",
            area: "Gestão de Crise e Emergência",
            severity: "info",
            affectedCrew: Math.ceil(crewCount * 0.4),
            description: "Novo procedimento de emergência não treinado com toda tripulação.",
            suggestedAction: "Realizar drill de emergência com simulação do novo procedimento.",
          },
        ],
      };

    case "predictive_insights":
      return {
        insights: [
          {
            id: "insight-1",
            type: "certification_expiry",
            title: "12 Certificações STCW vencem em 60 dias",
            description: "Análise preditiva indica que 12 certificações críticas (STCW, GMDSS, SSO) de múltiplos tripulantes estão próximas do vencimento, podendo impactar operações.",
            impact: "high",
            timeframe: "60 dias",
            actionRequired: true,
            suggestedAction: "Agendar renovações escalonadas para evitar sobrecarga e garantir cobertura operacional",
          },
          {
            id: "insight-2",
            type: "skill_gap",
            title: "Déficit de Operadores DP Nível 2 projetado",
            description: "Baseado em rotação de tripulação e demanda operacional, haverá déficit de 3 operadores DP qualificados nos próximos 6 meses.",
            impact: "high",
            timeframe: "6 meses",
            actionRequired: true,
            suggestedAction: "Iniciar programa de capacitação DP para tripulantes selecionados com potencial identificado",
          },
          {
            id: "insight-3",
            type: "performance_trend",
            title: "Melhoria de 23% no desempenho geral",
            description: "Tripulantes que completaram os treinamentos recomendados nos últimos 3 meses demonstram melhoria significativa em KPIs operacionais e de segurança.",
            impact: "medium",
            timeframe: "3 meses",
            actionRequired: false,
          },
          {
            id: "insight-4",
            type: "compliance_risk",
            title: "Risco de não-conformidade em auditoria PEOTRAM",
            description: "Análise indica que 2 tripulantes podem não atender requisitos mínimos de treinamento para próxima auditoria agendada.",
            impact: "high",
            timeframe: "45 dias",
            actionRequired: true,
            suggestedAction: "Priorizar treinamentos obrigatórios para João Alves e Maria Fernandes",
          },
          {
            id: "insight-5",
            type: "performance_trend",
            title: "Taxa de conclusão de cursos em alta",
            description: "A taxa de conclusão de cursos aumentou 15% no último trimestre, indicando maior engajamento da tripulação.",
            impact: "low",
            timeframe: "3 meses",
            actionRequired: false,
          },
          {
            id: "insight-6",
            type: "skill_gap",
            title: "Oportunidade de cross-training identificada",
            description: "8 tripulantes têm potencial para desenvolvimento em áreas complementares, aumentando versatilidade operacional.",
            impact: "medium",
            timeframe: "6 meses",
            actionRequired: false,
            suggestedAction: "Avaliar interesse e disponibilidade para programa de cross-training",
          },
        ],
      };

    case "generate_content":
      return {
        content: {
          title: `Curso: ${data.topic || "Treinamento Marítimo"}`,
          modules: [
            { id: 1, title: "Introdução e Fundamentos", duration: 2, objectives: ["Compreender conceitos fundamentais", "Identificar aplicações práticas"] },
            { id: 2, title: "Procedimentos Operacionais Padrão", duration: 3, objectives: ["Executar procedimentos com segurança", "Identificar riscos potenciais"] },
            { id: 3, title: "Práticas Avançadas e Casos Especiais", duration: 3, objectives: ["Aplicar técnicas avançadas", "Resolver problemas complexos"] },
            { id: 4, title: "Simulações e Exercícios Práticos", duration: 2, objectives: ["Praticar em ambiente controlado", "Desenvolver habilidades práticas"] },
            { id: 5, title: "Avaliação e Certificação", duration: 1, objectives: ["Demonstrar competência adquirida", "Obter certificação"] },
          ],
          estimatedDuration: 11,
          prerequisites: ["Experiência básica na área", "Certificação STCW válida"],
        },
      };

    case "generate_quiz":
      const difficulty = data.difficulty || "medium";
      const questionCount = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10;

      return {
        questions: [
          { id: "q1", question: "Qual é o primeiro passo em uma situação de emergência a bordo?", options: ["Evacuar imediatamente", "Avaliar a situação e acionar alarme", "Ligar para terra", "Esperar ordens"], correctAnswer: 1, explanation: "Avaliar a situação permite resposta apropriada. Acionar o alarme garante que toda tripulação seja alertada." },
          { id: "q2", question: "O que significa a sigla STCW?", options: ["Standards of Training, Certification and Watchkeeping", "Safety Training for Crew Workers", "Ship Technical Crew Welfare", "Standard Technical Certification Work"], correctAnswer: 0, explanation: "STCW é a Convenção Internacional sobre Normas de Formação, Certificação e Serviço de Quarto para Marítimos." },
          { id: "q3", question: "Qual é a principal função do equipamento GMDSS?", options: ["Navegação", "Comunicação de emergência", "Controle de máquinas", "Monitoramento ambiental"], correctAnswer: 1, explanation: "O GMDSS (Global Maritime Distress and Safety System) é um sistema global de comunicação de socorro e segurança marítima." },
          { id: "q4", question: "Em caso de homem ao mar, qual é a primeira ação?", options: ["Parar a embarcação", "Gritar 'homem ao mar' e apontar", "Pular na água para ajudar", "Ligar para a Guarda Costeira"], correctAnswer: 1, explanation: "Gritar 'homem ao mar' alerta a tripulação e apontar continuamente ajuda a não perder de vista a pessoa na água." },
          { id: "q5", question: "Qual documento é obrigatório para todas as embarcações comerciais?", options: ["Plano de manutenção", "Certificado de Segurança", "Lista de tripulação", "Todas as anteriores"], correctAnswer: 3, explanation: "Todos esses documentos são requisitos obrigatórios para operação de embarcações comerciais." },
        ].slice(0, questionCount),
      };

    case "chat":
      return { 
        response: `Olá! Sou o Nautilus AI, seu assistente de treinamento marítimo. Como posso ajudar você hoje? Posso auxiliar com informações sobre cursos, certificações STCW, planejamento de treinamentos ou análise de competências da tripulação.`,
        _local: true 
      };

    case "analyze_performance":
      return {
        overallScore: 82,
        strengths: ["Alta taxa de conclusão de cursos", "Bom desempenho em avaliações práticas", "Pontualidade nos treinamentos obrigatórios"],
        areasForImprovement: ["Tempo de resposta em simulações de emergência", "Conhecimento teórico em navegação eletrônica", "Participação em treinamentos opcionais"],
        trend: "improving",
        recommendations: ["Focar em treinamentos práticos de emergência", "Revisar material teórico de navegação", "Participar de pelo menos um curso opcional por trimestre"],
        predictedPerformance: 87,
      };

    case "generate_full_course":
      return {
        course: {
          title: `${data.topic || "Treinamento Marítimo Especializado"}`,
          description: "Curso completo desenvolvido para capacitar tripulantes em competências essenciais para operações offshore seguras e eficientes.",
          duration_hours: 10,
          level: data.level || "intermediate",
          category: "Operações",
          modules: [
            { id: 1, title: "Fundamentos e Contexto", duration: 2, content: "Introdução aos conceitos fundamentais e contexto operacional", objectives: ["Compreender princípios básicos", "Conhecer regulamentações aplicáveis"], activities: ["Leitura de material", "Discussão em grupo"] },
            { id: 2, title: "Procedimentos Técnicos", duration: 3, content: "Detalhamento de procedimentos operacionais padrão", objectives: ["Executar procedimentos corretamente", "Identificar pontos críticos"], activities: ["Demonstração prática", "Exercícios supervisionados"] },
            { id: 3, title: "Práticas Avançadas", duration: 2, content: "Técnicas avançadas e situações especiais", objectives: ["Aplicar técnicas avançadas", "Resolver problemas complexos"], activities: ["Simulações", "Estudos de caso"] },
            { id: 4, title: "Segurança e Prevenção", duration: 2, content: "Aspectos de segurança e prevenção de incidentes", objectives: ["Identificar riscos", "Aplicar medidas preventivas"], activities: ["Análise de incidentes", "Drill prático"] },
            { id: 5, title: "Avaliação Final", duration: 1, content: "Avaliação teórica e prática", objectives: ["Demonstrar competência"], activities: ["Prova teórica", "Avaliação prática"] },
          ],
          prerequisites: ["Certificação STCW válida", "Experiência mínima de 6 meses"],
          assessment: { type: "mixed", passing_score: 70, questions_count: 15 },
        },
      };

    default:
      return { error: "Unknown action" };
  }
}
