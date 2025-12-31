import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 7 SEÇÕES DO PEO-DP PETROBRAS 2021
const PEODP_SECTIONS = {
  "3.1": { 
    name: "Regras Gerais", 
    description: "Requisitos básicos para implementação do programa",
    keyPoints: ["Divisão de requisitos", "Estrutura organizacional", "Responsabilidades"]
  },
  "3.2": { 
    name: "Gestão", 
    description: "24 requisitos de gestão - SEÇÃO CRÍTICA com maior peso",
    keyPoints: ["Gestão de riscos", "IPCLV", "Company DP Authority", "Análise crítica mensal", "Indicadores"]
  },
  "3.3": { 
    name: "Treinamentos", 
    description: "9 requisitos de capacitação e competência",
    keyPoints: ["Lacunas em treinamento", "Certificações", "Simuladores", "DPO qualificação"]
  },
  "3.4": { 
    name: "Procedimentos", 
    description: "6 requisitos de procedimentos operacionais",
    keyPoints: ["POPs", "Checklists", "Documentação", "Controle de revisões"]
  },
  "3.5": { 
    name: "Operação", 
    description: "6 requisitos de operação - SEÇÃO CRÍTICA",
    keyPoints: ["Watch keeping", "Comunicação", "Protocolos operacionais", "Handover"]
  },
  "3.6": { 
    name: "Manutenção", 
    description: "4 requisitos de manutenção - SEÇÃO CRÍTICA",
    keyPoints: ["Manutenção preventiva", "Preditiva", "Corretiva", "Sistemas críticos"]
  },
  "3.7": { 
    name: "Testes Anuais", 
    description: "5 requisitos de testes DP - SEÇÃO CRÍTICA",
    keyPoints: ["DP Trials", "Capability plots", "FMEA", "Validação anual"]
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, section, context, language = "pt" } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const sectionContext = section ? PEODP_SECTIONS[section as keyof typeof PEODP_SECTIONS] : null;

    const systemPrompt = `Você é um especialista em PEO-DP (Programa de Excelência em Operações DP) da Petrobras, baseado no documento oficial de 03/11/2021.

O PEO-DP possui 7 SEÇÕES PRINCIPAIS:

${Object.entries(PEODP_SECTIONS).map(([code, info]) => 
  `**Seção ${code} - ${info.name}**: ${info.description}
   Pontos-chave: ${info.keyPoints.join(', ')}`
).join('\n\n')}

SEÇÕES CRÍTICAS (maior peso e atenção especial):
- Seção 3.2: GESTÃO (24 requisitos - maior seção)
- Seção 3.5: OPERAÇÃO
- Seção 3.6: MANUTENÇÃO
- Seção 3.7: TESTES ANUAIS

INDICADORES CHAVE DO PEO-DP:
- **IPCLV**: Índice de Preenchimento Correto das Listas de Verificação
  - Fórmula: (Listas corretas / Total) x 100
  - Meta: 100%
  - Frequência: Mensal
  - Amostra: Até 10 embarcações/mês

- **DRIFT OFF**: Quando embarcação perde posição por empuxo insuficiente após falha

- **DRIVE OFF**: Quando empuxo excede requisito ou está na direção errada após falha

- **LARGE EXCURSION**: Quando embarcação retorna mas com desvio inaceitável da posição original

REFERÊNCIAS NORMATIVAS:
- PEO-DP Petrobras 2021
- IMCA M 117 Rev. 1 - The Training and Experience of Key DP Personnel
- IMCA M 103 - Guidelines for the Design and Operation of Dynamically Positioned Vessels
- DP Class Guidelines (Lloyd's, DNV, ABS)
- NORMAM-01

${sectionContext ? `
CONTEXTO ATUAL: Seção ${section} - ${sectionContext.name}
${sectionContext.description}
Pontos-chave: ${sectionContext.keyPoints.join(', ')}
` : ''}

INSTRUÇÕES:
1. Responda de forma clara, técnica e didática
2. Use exemplos práticos do contexto de operações DP
3. Cite referências normativas quando relevante
4. Para seções críticas, dê mais detalhes e alertas
5. Mantenha resposta objetiva mas completa

${language === 'en' ? 'Respond in English.' : language === 'es' ? 'Responde en español.' : 'Responda em português brasileiro.'}`;

    const contextMessages = context?.slice(-5) || [];

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
          ...contextMessages,
          { role: "user", content: question }
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
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua pergunta.";

    console.log(`PEO-DP Voice Chat - Section: ${section || 'general'}, Question length: ${question.length}`);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      section: section || null,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in peodp-voice-chat:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
