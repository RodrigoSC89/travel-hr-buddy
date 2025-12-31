import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 13 ELEMENTOS REAIS DO PEOTRAM 2024 - PETROBRAS
const PEOTRAM_13_ELEMENTS = {
  1: { 
    name: "Liderança, Gerenciamento e Responsabilidade", 
    sigla: "LGR",
    critical: false, 
    weight: 8.5,
    description: "Compromisso da alta administração e gestão de segurança, meio ambiente e saúde. Inclui estrutura organizacional, responsabilidades e recursos para SMS.",
    keyItems: ["Política de SMS", "Organograma", "Matriz RACI", "Reuniões de SMS"]
  },
  2: { 
    name: "Conformidade Legal", 
    sigla: "CL",
    critical: false, 
    weight: 7.5,
    description: "Identificação e atendimento a requisitos legais, normativos e contratuais. Inclui certificados estatutários e licenças.",
    keyItems: ["Lista de requisitos", "Certificados SOLAS", "Licenças ambientais", "NORMAM"]
  },
  3: { 
    name: "Avaliação e Gestão de Riscos", 
    sigla: "AGR",
    critical: false, 
    weight: 9.0,
    description: "Identificação, análise e controle de riscos operacionais e de SMS. Metodologias como APR, HAZOP, What-If.",
    keyItems: ["Matriz de riscos", "APR/PT", "HAZOP", "Planos de mitigação"]
  },
  4: { 
    name: "Informação, Documentação e Controle de Registros", 
    sigla: "IDC",
    critical: true, 
    weight: 6.5,
    description: "⭐ CRÍTICO - Gestão de documentos e registros do sistema de gestão. Controle de versões, aprovações e distribuição.",
    keyItems: ["Lista mestra", "Controle de revisões", "Backup", "Acesso a bordo"]
  },
  5: { 
    name: "Pessoal, Capacitação e Competência", 
    sigla: "PCC",
    critical: false, 
    weight: 8.0,
    description: "Gestão de pessoas, treinamento e desenvolvimento de competências. Qualificações STCW e treinamentos específicos.",
    keyItems: ["Certificados STCW", "Plano de treinamento", "Matriz de competências", "Avaliações"]
  },
  6: { 
    name: "Integridade Mecânica e Garantia de Qualidade", 
    sigla: "IMG",
    critical: true, 
    weight: 9.5,
    description: "⭐ CRÍTICO - Manutenção de equipamentos críticos e garantia de integridade operacional. Sistema PMS e inspeções.",
    keyItems: ["PMS implementado", "Lista de equipamentos críticos", "Testes de segurança", "Certificados de classe"]
  },
  7: { 
    name: "Gestão de Contratadas", 
    sigla: "GC",
    critical: false, 
    weight: 6.0,
    description: "Gestão de empresas contratadas e prestadores de serviço. Qualificação, monitoramento e avaliação de desempenho.",
    keyItems: ["Critérios de qualificação", "Contratos SMS", "Avaliação de fornecedores"]
  },
  8: { 
    name: "Gestão de Operações", 
    sigla: "GO",
    critical: false, 
    weight: 8.5,
    description: "Procedimentos e controles operacionais para atividades críticas. Checklists e registros operacionais.",
    keyItems: ["Procedimentos operacionais", "Checklists", "Registros de operações", "Análise de desvios"]
  },
  9: { 
    name: "Gestão de Mudanças", 
    sigla: "GM",
    critical: false, 
    weight: 5.5,
    description: "Controle de mudanças em processos, equipamentos e organização. Análise de impacto e aprovações.",
    keyItems: ["Procedimento MOC", "Formulários", "Análise de impacto", "Registros de aprovação"]
  },
  10: { 
    name: "Tratamento de Anomalias", 
    sigla: "TA",
    critical: false, 
    weight: 7.0,
    description: "Identificação, registro e tratamento de anomalias operacionais. Investigação de incidentes e lições aprendidas.",
    keyItems: ["Sistema de registro", "Investigação de acidentes", "Lições aprendidas", "Ações corretivas"]
  },
  11: { 
    name: "Preparação e Resposta a Emergências", 
    sigla: "PRE",
    critical: true, 
    weight: 8.5,
    description: "⭐ CRÍTICO - Planos de emergência, exercícios e recursos para resposta. Coordenação com autoridades.",
    keyItems: ["Planos de emergência", "Exercícios simulados", "Recursos de combate", "Comunicação"]
  },
  12: { 
    name: "Comunicação e Consulta", 
    sigla: "CC",
    critical: true, 
    weight: 6.0,
    description: "⭐ CRÍTICO - Comunicação interna e externa sobre SMS. Consulta às partes interessadas e feedback.",
    keyItems: ["Canais de comunicação", "Reuniões de segurança", "Comunicação com autoridades"]
  },
  13: { 
    name: "Auditoria, Análise Crítica e Melhoria Contínua", 
    sigla: "AAM",
    critical: false, 
    weight: 9.0,
    description: "Programa de auditorias, análise crítica pela direção e processo de melhoria contínua.",
    keyItems: ["Programa de auditorias", "Relatórios de auditoria", "Análise crítica", "Planos de melhoria"]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      question, 
      element_number, 
      item_number,
      context, 
      language = "pt" 
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const element = element_number ? PEOTRAM_13_ELEMENTS[element_number as keyof typeof PEOTRAM_13_ELEMENTS] : null;
    const criticalElements = [4, 6, 11, 12];

    const systemPrompt = `Você é um especialista em auditoria PEOTRAM (Programa Específico de Operação Técnica em Risco Aceitável de Manutenção) da Petrobras - Ciclo 2024.

O PEOTRAM 2024 possui 13 ELEMENTOS (não 6!):

${Object.entries(PEOTRAM_13_ELEMENTS).map(([num, el]) => 
  `**Elemento ${num} - ${el.sigla}**: ${el.name} ${el.critical ? '⭐ CRÍTICO' : ''}
   Peso: ${el.weight}% | ${el.description}
   Itens-chave: ${el.keyItems.join(', ')}`
).join('\n\n')}

ELEMENTOS CRÍTICOS (maior peso e atenção especial):
- Elemento 4: Informação, Documentação e Controle de Registros
- Elemento 6: Integridade Mecânica e Garantia de Qualidade
- Elemento 11: Preparação e Resposta a Emergências
- Elemento 12: Comunicação e Consulta

CRITÉRIOS DE PONTUAÇÃO:
- NA = Não Aplicável
- 0 = Não Evidenciado (0%)
- 1 = Falhas Sistemáticas (20%)
- 2 = Falhas Pontuais (50%)
- 3 = Sem Falhas (90%)
- 4 = Excelência (100%)

CLASSIFICAÇÃO DE NÃO-CONFORMIDADES:
- A: Crítica - Risco iminente
- B: Grave - Pode comprometer operação
- C: Moderada - Requer atenção
- D: Leve - NC menor

INSTRUÇÕES:
1. Responda de forma clara, técnica e didática
2. Use exemplos práticos do contexto marítimo
3. Cite normas quando relevante (ISM, SOLAS, MARPOL, STCW, NR-34, NR-37)
4. Para elementos críticos, dê mais detalhes e alertas
5. Mantenha resposta objetiva mas completa

${language === 'en' ? 'Respond in English.' : language === 'es' ? 'Responde en español.' : 'Responda em português brasileiro.'}`;

    let userPrompt = question;
    
    if (element) {
      userPrompt = `[CONTEXTO DA AUDITORIA]
Elemento: ${element_number} - ${element.name} (${element.sigla})
${element.critical ? '⭐ ELEMENTO CRÍTICO - ATENÇÃO ESPECIAL' : ''}
Peso na auditoria: ${element.weight}%
${item_number ? `Item específico: ${item_number}` : ''}
${context ? `\nContexto adicional: ${context}` : ''}

PERGUNTA DO AUDITOR:
${question}`;
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
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "";

    const result = {
      question,
      answer,
      element: element ? {
        number: element_number,
        name: element.name,
        sigla: element.sigla,
        is_critical: element.critical,
        weight: element.weight,
        key_items: element.keyItems
      } : null,
      item_number,
      language,
      total_elements: 13,
      critical_elements: criticalElements,
      timestamp: new Date().toISOString()
    };

    console.log("PEOTRAM 13-elements voice chat response for element:", element_number || "general");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in peotram-voice-chat:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
