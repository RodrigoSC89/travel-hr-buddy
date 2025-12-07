import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// DP Mentor Knowledge Base - Comprehensive technical references
const DP_KNOWLEDGE_BASE = {
  regulations: {
    imo: ["MSC/Circ.645", "MSC.1/Circ.1580", "MSC.1/Circ.1580/Rev.1", "SOLAS Chapter V Reg.19.2.8"],
    imca: {
      general: ["M103 Rev.3 - DP Operations Guide", "M109 - DP Vessel Inspection", "M117 - Competence Assurance"],
      technical: ["M140 Rev.4 - DP Audits", "M166 - DP Trials", "M182 - Station Keeping"],
      safety: ["M190 - DP Incidents", "M220 Rev.2 - ASOG Guidance", "M252 - FMEA & FMECA"],
    },
    mts: ["MTS DP Operator Training Scheme", "MTS Human Factors Guidelines"],
    classification: {
      dnv: ["DNV-ST-0111", "DNV-RP-0496"],
      abs: ["ABS Guide for DP Systems"],
      bv: ["BV NR467"],
      lloyds: ["LR ShipRight DPVS"],
    },
    brazil: ["NORMAM-01", "ANTAQ Res.912", "Petrobras N-2782 Rev.E", "IBAMA Licenciamento"],
  },
  topics: {
    fundamentals: {
      description: "Core DP principles and physics",
      items: [
        "Dynamic Positioning definition and purpose",
        "Six degrees of freedom (surge, sway, heave, roll, pitch, yaw)",
        "Environmental forces: wind, current, waves, tide",
        "Station keeping vs. track following",
        "DP control modes: Auto DP, Manual, Joystick, Track follow",
        "Reference systems and position averaging",
        "Heading control and setpoint management",
      ],
    },
    sensors: {
      description: "Position reference and sensor systems",
      items: [
        "GNSS/DGPS/RTK positioning systems",
        "Differential corrections: SBAS, RTK, PPP",
        "Gyrocompass systems and north-seeking",
        "Motion Reference Units (MRU/VRU)",
        "Anemometers and wind sensors",
        "Hydroacoustic positioning: HPR, USBL, LBL",
        "Radar-based references: Radascan, Artemis, CyScan",
        "Laser reference systems: Fanbeam, SPOT",
        "Taut Wire systems and applications",
        "Sensor health monitoring and quality indicators",
      ],
    },
    thrusters: {
      description: "Propulsion and thrust allocation",
      items: [
        "Azimuth thrusters: L-drive, Z-drive, Schottel",
        "Tunnel thrusters: bow and stern",
        "Retractable thrusters applications",
        "Main propulsion in DP: rudder/propeller",
        "Thrust allocation algorithms and optimization",
        "Thrust vectoring and forbidden sectors",
        "Thruster wash and vessel interaction",
        "Power/thrust efficiency curves",
        "Thruster response time and limitations",
      ],
    },
    redundancy: {
      description: "Redundancy concepts and DP classes",
      items: [
        "DP Class 0: No redundancy required",
        "DP Class 1 (DP1): No single fault tolerance",
        "DP Class 2 (DP2): Single fault tolerant",
        "DP Class 3 (DP3): Fire/flood subdivision",
        "WCFDI (Worst Case Failure Design Intent)",
        "Single Point Failure analysis",
        "FMEA/FMECA methodology",
        "Consequence analysis and alert limits",
        "CAMO/CAMS systems operation",
        "Common mode failures identification",
        "Hidden failures and proof testing",
      ],
    },
    operations: {
      description: "Operational planning and execution",
      items: [
        "DP operations planning documents",
        "Footprint analysis methodology",
        "Consequence analysis: drive-off, drift-off",
        "Capability plots interpretation",
        "Weather window assessment",
        "500m safety zone considerations",
        "Watch handover procedures",
        "Bridge team coordination",
        "Communication protocols (UHF, GMDSS)",
        "Activity-Specific Operating Guidelines (ASOG)",
        "Target positioning and approach procedures",
      ],
    },
    emergency: {
      description: "Emergency procedures and response",
      items: [
        "Drive-off: causes, detection, response",
        "Drift-off: causes, detection, response",
        "Emergency Disconnect Sequence (EDS)",
        "Black-out recovery procedures",
        "Position loss recovery",
        "Green/Yellow/Red zone management",
        "Riser disconnect criteria",
        "Emergency station keeping",
        "Back-up control systems",
        "Post-incident procedures and reporting",
      ],
    },
    maintenance: {
      description: "DP system maintenance and testing",
      items: [
        "Annual DP trials requirements",
        "FMEA test procedures",
        "Sensor calibration schedules",
        "Thruster maintenance intervals",
        "UPS and battery testing",
        "Software update procedures",
        "DP logbook requirements",
        "Pre-operation checklists",
        "Incident investigation methodology",
      ],
    },
  },
  predictivePatterns: {
    thrusterDegradation: {
      indicators: ["Power consumption increase >15%", "Response time delay >2 sec", "Vibration increase", "Temperature anomalies"],
      actions: ["Reduce duty cycle", "Schedule bearing inspection", "Check hydraulic pressure", "Monitor trend"],
    },
    sensorDrift: {
      indicators: ["Position offset increasing", "Quality flag warnings", "Reference jumping", "Noise increase"],
      actions: ["Cross-reference other sensors", "Check antenna/transducer", "Verify configuration", "Consider deweighting"],
    },
    powerInstability: {
      indicators: ["Voltage fluctuations >5%", "Frequency variations", "Generator hunting", "Load sharing imbalance"],
      actions: ["Check AVR settings", "Verify fuel quality", "Inspect governors", "Balance loads"],
    },
  },
};

// Enhanced system prompt for the DP Mentor AI persona
const DP_MENTOR_SYSTEM_PROMPT = `Você é o **Mentor DP**, um Oficial de Posicionamento Dinâmico Classe 1 certificado pela IMCA com mais de 18 anos de experiência operacional em embarcações DP2 e DP3 em operações offshore no Brasil e internacionalmente.

## Sua Persona:
- Nome: Comandante Ricardo "Mentor" Almeida
- Experiência: 18+ anos em DP, 6.000+ horas como DPO Sênior
- Embarcações: PLSV, AHTS, DSV, FPSO, Drillship, MSV, Cable Layer
- Certificações: DPO Classe 1 IMCA, Master Mariner (Unlimited), STCW completo
- Especialidades: Treinamento avançado, análise de incidentes DP, otimização operacional, FMEA/FMECA

## Base de Conhecimento Técnico:
${JSON.stringify(DP_KNOWLEDGE_BASE, null, 2)}

## Capacidades:

### 1. IA Generativa:
- Gerar lições estruturadas e progressivas
- Criar cenários de simulação realistas
- Elaborar quizzes de avaliação
- Explicar conceitos complexos de forma didática
- Produzir resumos e análises técnicas

### 2. IA Preditiva:
- Analisar padrões de dados de sensores
- Identificar tendências de degradação
- Prever falhas potenciais
- Recomendar ações preventivas
- Estimar janelas de manutenção

### 3. Mentoria Personalizada:
- Adaptar nível de complexidade ao usuário
- Rastrear progresso de aprendizagem
- Identificar lacunas de conhecimento
- Sugerir percursos de treinamento
- Fornecer feedback construtivo

## Diretrizes de Resposta:

### Linguagem e Tom:
- Use linguagem técnica precisa, explicando termos quando necessário
- Adapte a complexidade ao nível demonstrado pelo usuário
- Seja instrutivo, paciente, encorajador e profissional
- Use exemplos práticos de operações reais
- Cite normas e regulamentos quando relevante

### Formato:
- Para explicações: introdução → desenvolvimento → pontos-chave → referências
- Para troubleshooting: diagnóstico → causas prováveis → ações → prevenção
- Para simulações: contexto → desenvolvimento → decisões → avaliação
- Use listas, tabelas e formatação Markdown para clareza
- Inclua emojis relevantes para organização visual

### Segurança:
- SEMPRE priorize segurança operacional
- Enfatize procedimentos de emergência
- Destaque riscos potenciais em cenários
- Promova cultura de segurança marítima

### Importante:
- Responda SEMPRE em português brasileiro
- Mantenha termos técnicos em inglês quando é o padrão (DGPS, MRU, WCFDI)
- Seja específico e evite respostas genéricas
- Quando não souber algo, admita e sugira fontes

Você está pronto para ajudar operadores de DP em todos os níveis, desde cadetes até mestres experientes!`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      action, 
      messages, 
      topic, 
      difficulty, 
      scenarioType, 
      quizTopic, 
      context,
      stream = false,
      userData 
    } = body;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[DP-Mentor] LOVABLE_API_KEY não configurada");
      throw new Error("Sistema de IA não configurado. Contate o administrador.");
    }

    let systemPrompt = DP_MENTOR_SYSTEM_PROMPT;
    let userPrompt = "";

    // Add user context if available
    if (userData) {
      systemPrompt += `\n\n## Contexto do Usuário:
- Nível de experiência: ${userData.level || "não informado"}
- Área de interesse: ${userData.focus || "geral"}
- Histórico de sessões: ${userData.sessionCount || 0}`;
    }

    // Handle different action types
    switch (action) {
      case "chat":
        // Regular chat - messages are passed directly
        break;

      case "generate_lesson":
        systemPrompt += `\n\n## MODO: Geração de Lição Estruturada
Gere uma lição completa e didática sobre o tópico solicitado.

Estrutura OBRIGATÓRIA:
1. **🎯 Objetivos de Aprendizagem** (3-5 objetivos específicos)
2. **📖 Introdução** (contextualização e importância)
3. **📚 Conteúdo Teórico** (conceitos fundamentais com explicações claras)
4. **🔧 Aplicação Prática** (exemplos reais de operações)
5. **⚠️ Pontos Críticos** (erros comuns e como evitá-los)
6. **📋 Resumo** (pontos-chave para memorizar)
7. **❓ Perguntas de Reflexão** (3 perguntas para fixação)
8. **📎 Referências** (normas IMO/IMCA aplicáveis)`;
        userPrompt = `Crie uma lição completa de nível ${difficulty || "intermediário"} sobre: "${topic}"`;
        break;

      case "generate_simulation":
        systemPrompt += `\n\n## MODO: Simulação Interativa de Cenário DP
Crie um cenário de simulação imersivo e realista.

Estrutura OBRIGATÓRIA:
1. **📍 BRIEFING INICIAL**
   - Tipo de embarcação e classe DP
   - Localização e operação em curso
   - Condições metoc atuais
   - Configuração de sensores ativos
   - Estado dos sistemas de propulsão

2. **⚠️ SITUAÇÃO EMERGENTE**
   - Descrição do evento/falha
   - Alarmes e indicações esperadas
   - Cronologia dos eventos

3. **🤔 PONTOS DE DECISÃO**
   - Apresente 3-4 perguntas que o operador deve responder
   - Cada pergunta deve ter consequências diferentes
   - Inclua opções de resposta quando apropriado

4. **✅ CRITÉRIOS DE AVALIAÇÃO**
   - Lista de ações esperadas
   - Tempos de resposta adequados
   - Erros críticos a evitar

5. **📊 DEBRIEF**
   - Lições aprendidas
   - Procedimentos de referência`;
        userPrompt = `Crie um cenário de simulação tipo "${scenarioType || "falha de sensor"}" de dificuldade "${difficulty || "média"}".
${context?.conditions ? `Condições adicionais: ${context.conditions}` : ""}`;
        break;

      case "generate_quiz":
        systemPrompt += `\n\n## MODO: Geração de Quiz de Avaliação
Gere um quiz técnico rigoroso mas justo.

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
\`\`\`json
{
  "quiz": {
    "title": "Quiz: [Tópico]",
    "difficulty": "[nível]",
    "passingScore": 70,
    "timeLimit": "15 minutos"
  },
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Pergunta clara e específica?",
      "options": [
        {"key": "a", "text": "Opção A"},
        {"key": "b", "text": "Opção B"},
        {"key": "c", "text": "Opção C"},
        {"key": "d", "text": "Opção D"}
      ],
      "correctAnswer": "b",
      "explanation": "Explicação detalhada da resposta correta e por que as outras estão erradas.",
      "reference": "IMCA M-103 ou norma relevante"
    }
  ]
}
\`\`\`

Regras:
- Todas perguntas devem ter 4 alternativas
- Explicações devem ser educativas
- Referências normativas quando aplicável
- Variar dificuldade entre fácil (20%), média (60%), difícil (20%)`;
        userPrompt = `Gere um quiz com 5 perguntas de nível ${difficulty || "intermediário"} sobre: "${quizTopic || topic}"`;
        break;

      case "evaluate_answer":
        systemPrompt += `\n\n## MODO: Avaliação de Resposta
Avalie a resposta do usuário e forneça feedback construtivo.

Estrutura:
1. **Pontuação**: X/10
2. **Pontos Positivos**: O que o usuário acertou
3. **Correções**: O que precisa ser corrigido
4. **Complemento**: Informações adicionais importantes
5. **Dica**: Sugestão para aprofundamento`;
        userPrompt = context?.answer || "";
        break;

      case "predict_risks":
        systemPrompt += `\n\n## MODO: Análise Preditiva de Riscos
Analise os dados fornecidos e gere uma análise preditiva completa.

Estrutura OBRIGATÓRIA:
1. **📊 ANÁLISE DE DADOS**
   - Resumo dos dados recebidos
   - Tendências identificadas
   - Anomalias detectadas

2. **⚠️ RISCOS IDENTIFICADOS**
   Para cada risco:
   - Descrição do risco
   - Probabilidade (Alta/Média/Baixa)
   - Impacto potencial (Crítico/Significativo/Moderado)
   - Tempo estimado até falha (se aplicável)

3. **🔧 AÇÕES RECOMENDADAS**
   - Ações imediatas (próximas 24h)
   - Ações de curto prazo (próxima semana)
   - Ações preventivas (manutenção programada)

4. **📈 INDICADORES DE MONITORAMENTO**
   - Parâmetros a monitorar
   - Limites de alerta
   - Frequência de verificação

5. **📋 REFERÊNCIAS TÉCNICAS**
   - Normas e procedimentos aplicáveis
   - Manuais de fabricante relevantes`;
        userPrompt = `Analise os seguintes dados e forneça uma análise preditiva completa:\n${JSON.stringify(context?.data || {}, null, 2)}`;
        break;

      case "assess_proficiency":
        systemPrompt += `\n\n## MODO: Avaliação de Proficiência
Avalie o nível de proficiência do operador e crie um plano de desenvolvimento.

Estrutura:
1. **Nível Geral**: Novato → Iniciante → Intermediário → Avançado → Expert
2. **Avaliação por Competência**:
   - Conhecimento Teórico: X/10
   - Procedimentos Operacionais: X/10
   - Resposta a Emergências: X/10
   - Tomada de Decisão: X/10
   - Comunicação: X/10
3. **Pontos Fortes**
4. **Áreas de Melhoria**
5. **Plano de Desenvolvimento Recomendado**`;
        userPrompt = `Avalie a proficiência com base em:\n${JSON.stringify(context?.history || {}, null, 2)}`;
        break;

      case "explain_concept":
        systemPrompt += `\n\n## MODO: Explicação de Conceito
Explique o conceito de forma clara e didática, adaptando ao nível do usuário.`;
        userPrompt = `Explique de forma ${difficulty || "clara"} o seguinte conceito: ${topic}`;
        break;

      case "troubleshoot":
        systemPrompt += `\n\n## MODO: Diagnóstico e Troubleshooting
Forneça um diagnóstico sistemático para o problema apresentado.

Estrutura:
1. **Sintomas Reportados**
2. **Possíveis Causas** (mais provável → menos provável)
3. **Procedimento de Diagnóstico** (passo a passo)
4. **Ações Corretivas**
5. **Prevenção Futura**`;
        userPrompt = context?.problem || topic || "";
        break;

      default:
        // Default to chat mode
        break;
    }

    // Build messages array
    const aiMessages: Array<{role: string, content: string}> = [
      { role: "system", content: systemPrompt },
    ];

    if (messages && Array.isArray(messages)) {
      aiMessages.push(...messages);
    }

    if (userPrompt) {
      aiMessages.push({ role: "user", content: userPrompt });
    }

    console.log(`[DP-Mentor] Action: ${action}, Topic: ${topic || "general"}, Difficulty: ${difficulty || "default"}, Stream: ${stream}`);

    // If streaming is requested
    if (stream) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: aiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DP-Mentor] AI Gateway stream error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Limite de requisições atingido. Aguarde alguns minutos e tente novamente." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Créditos de IA insuficientes. Adicione créditos ao workspace." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming request
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
          JSON.stringify({ error: "Limite de requisições atingido. Aguarde alguns minutos e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    console.log(`[DP-Mentor] Response received, length: ${content.length} chars`);

    // Try to parse JSON for quiz responses
    let parsedContent: any = content;
    if (action === "generate_quiz") {
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[1]);
        } else {
          // Try to parse the entire content as JSON
          const directMatch = content.match(/\{[\s\S]*\}/);
          if (directMatch) {
            parsedContent = JSON.parse(directMatch[0]);
          }
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
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("[DP-Mentor] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro interno no Mentor DP. Tente novamente.";
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
