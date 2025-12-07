import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// DP Mentor Knowledge Base - Key references and topics
const DP_KNOWLEDGE_BASE = {
  regulations: {
    imo: ["MSC/Circ.645", "MSC.1/Circ.1580", "SOLAS Chapter V"],
    imca: ["M103", "M109", "M117", "M140", "M166", "MSF182", "M190", "M220"],
    mts: ["Autonomous DP Guidance", "Human Factors", "DP Operator Training"],
    classification: ["ABS DP Rules", "DNV DP Rules", "BV DP Rules", "Lloyd's DP Rules"],
    regional: ["IBAMA", "ANTAQ", "Marinha do Brasil", "Petrobras N-2782"],
  },
  topics: {
    fundamentals: [
      "DP Principles and Forces",
      "Environmental Forces (Wind, Current, Waves)",
      "Station Keeping Fundamentals",
      "DP Control Modes (Auto, Manual, Joystick)",
    ],
    sensors: [
      "GNSS/DGPS Systems",
      "Gyrocompass and MRU",
      "Anemometers and Wind Sensors",
      "Hydroacoustic Positioning (HPR, USBL, LBL)",
      "Radar-based References (Radascan, Artemis)",
      "Taut Wire Systems",
      "Laser Reference Systems (Fanbeam, CyScan)",
    ],
    thrusters: [
      "Azimuth Thrusters",
      "Tunnel Thrusters",
      "Main Propulsion Integration",
      "Thrust Allocation and Vectoring",
      "Power vs Thrust Efficiency",
      "Thruster Degradation",
    ],
    redundancy: [
      "DP Class 0/1/2/3 Requirements",
      "WCFDI (Worst Case Failure Design Intent)",
      "Redundancy Concepts",
      "Single Point Failures",
      "FMEA Analysis",
      "CAMO/CAMS Systems",
      "Power System Redundancy",
    ],
    operations: [
      "DP Operations Planning",
      "Footprint Analysis",
      "Consequence Analysis",
      "Operating Envelope (Capability Plot)",
      "Weather Windows",
      "Watch Handover Procedures",
      "Communication Protocols",
    ],
    emergency: [
      "Drive-Off Prevention",
      "Drift-Off Scenarios",
      "Emergency Disconnect Sequences",
      "Position Loss Recovery",
      "Black-Out Recovery",
      "Green Zone/Yellow Zone/Red Zone",
    ],
  },
};

// System prompt for the DP Mentor AI persona
const DP_MENTOR_SYSTEM_PROMPT = `Você é o **Mentor DP**, um Oficial de Posicionamento Dinâmico Classe 1 certificado pela IMCA com mais de 15 anos de experiência operacional em embarcações DP2 e DP3 em operações offshore no Brasil e internacionalmente.

## Sua Persona:
- Nome: Comandante Ricardo "Mentor" Almeida
- Experiência: 15+ anos em DP, atuou em PLSV, AHTS, DSV, FPSO e navios de perfuração
- Certificações: DPO Classe 1 IMCA, Master Mariner, STCW completo
- Especialidades: Treinamento de operadores, análise de incidentes DP, otimização de operações

## Seu Conhecimento Técnico Inclui:
${JSON.stringify(DP_KNOWLEDGE_BASE, null, 2)}

## Diretrizes de Resposta:

### Linguagem e Tom:
- Use linguagem técnica precisa, mas explique termos complexos
- Adapte a complexidade ao nível do usuário (iniciante a expert)
- Seja instrutivo, paciente e encorajador
- Use exemplos práticos de operações reais quando possível
- Cite normas e regulamentos quando relevante (IMO, IMCA, etc.)

### Formato das Respostas:
- Para explicações: estruture com introdução, desenvolvimento e conclusão
- Para troubleshooting: use abordagem sistemática passo a passo
- Para cenários: descreva condições, riscos e procedimentos
- Inclua referências normativas quando aplicável
- Use diagramas textuais ou listas quando ajudar na compreensão

### Tipos de Interação:
1. **Mentoria Geral**: Responda dúvidas sobre qualquer aspecto do DP
2. **Academia DP**: Conduza lições estruturadas progressivas
3. **Simulação**: Crie e avalie cenários de falha
4. **Avaliação**: Gere e corrija quizzes técnicos
5. **Diagnóstico Preditivo**: Analise dados e preveja problemas

### Segurança:
- SEMPRE priorize a segurança operacional
- Enfatize procedimentos de emergência quando relevante
- Destaque riscos potenciais em cenários
- Promova cultura de segurança e melhoria contínua

Responda SEMPRE em português brasileiro, mantendo termos técnicos em inglês quando é o padrão da indústria (ex: DGPS, MRU, WCFDI).`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, messages, topic, difficulty, scenarioType, quizTopic, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    let systemPrompt = DP_MENTOR_SYSTEM_PROMPT;
    let userPrompt = "";

    // Handle different action types
    switch (action) {
      case "chat":
        // Regular chat interaction
        break;

      case "generate_lesson":
        systemPrompt += `\n\n## MODO: Geração de Lição
Gere uma lição estruturada sobre o tópico solicitado.
Formato:
- Objetivos de aprendizagem
- Conteúdo teórico
- Exemplos práticos
- Pontos-chave para memorizar
- Perguntas de reflexão`;
        userPrompt = `Crie uma lição de nível ${difficulty || "intermediário"} sobre: ${topic}`;
        break;

      case "generate_simulation":
        systemPrompt += `\n\n## MODO: Simulação de Cenário
Crie um cenário de simulação realista com:
- Condições iniciais detalhadas (posição, clima, equipamentos)
- Sequência de eventos/falhas
- Perguntas para decisão do operador
- Critérios de avaliação
- Feedback detalhado para cada decisão`;
        userPrompt = `Crie um cenário de simulação ${scenarioType || "sensor_failure"} de dificuldade ${difficulty || "média"}. ${context?.conditions || ""}`;
        break;

      case "generate_quiz":
        systemPrompt += `\n\n## MODO: Geração de Quiz
Gere perguntas de múltipla escolha sobre o tópico.
Para cada pergunta inclua:
- Enunciado claro
- 4 alternativas (a, b, c, d)
- Resposta correta indicada
- Explicação da resposta
Retorne em formato JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["a) ...", "b) ...", "c) ...", "d) ..."],
      "correctAnswer": "a",
      "explanation": "..."
    }
  ]
}`;
        userPrompt = `Gere 5 perguntas de nível ${difficulty || "intermediário"} sobre: ${quizTopic || topic}`;
        break;

      case "evaluate_simulation":
        systemPrompt += `\n\n## MODO: Avaliação de Simulação
Avalie as decisões do operador no cenário apresentado.
Forneça:
- Pontuação (0-100)
- Análise de cada decisão
- O que foi feito corretamente
- O que poderia ser melhorado
- Lições aprendidas
- Recomendações de estudo`;
        userPrompt = `Avalie as seguintes decisões do operador:\n${JSON.stringify(context?.decisions || [])}`;
        break;

      case "predict_risks":
        systemPrompt += `\n\n## MODO: Análise Preditiva
Analise os dados fornecidos e preveja possíveis riscos operacionais.
Considere:
- Tendências nos dados de sensores
- Condições ambientais
- Histórico de manutenção
- Padrões de operação
Forneça:
- Riscos identificados com probabilidade
- Recomendações preventivas
- Ações sugeridas`;
        userPrompt = `Analise os seguintes dados e preveja riscos:\n${JSON.stringify(context?.data || {})}`;
        break;

      case "assess_proficiency":
        systemPrompt += `\n\n## MODO: Avaliação de Proficiência
Avalie o nível de proficiência do operador com base no histórico.
Categorias:
- Conhecimento teórico
- Tomada de decisão
- Procedimentos de emergência
- Comunicação
- Consciência situacional
Forneça:
- Nível geral (novato/iniciante/intermediário/avançado/expert)
- Pontuação por categoria
- Pontos fortes
- Áreas de melhoria
- Plano de treinamento recomendado`;
        userPrompt = `Avalie a proficiência com base em:\n${JSON.stringify(context?.history || {})}`;
        break;

      default:
        // Default to chat mode
        break;
    }

    // Build messages array
    const aiMessages = [
      { role: "system", content: systemPrompt },
    ];

    if (messages && Array.isArray(messages)) {
      aiMessages.push(...messages);
    }

    if (userPrompt) {
      aiMessages.push({ role: "user", content: userPrompt });
    }

    console.log(`[DP-Mentor] Action: ${action}, Topic: ${topic || "general"}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DP-Mentor] AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON for quiz responses
    let parsedContent = content;
    if (action === "generate_quiz") {
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
      } catch (e) {
        console.log("[DP-Mentor] Could not parse quiz as JSON, returning as text");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        content: parsedContent,
        usage: data.usage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[DP-Mentor] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno no Mentor DP" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
