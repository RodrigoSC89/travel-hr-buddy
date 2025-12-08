import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um especialista em Posicionamento Dinâmico (DP) e no Programa de Excelência em Operações DP (PEO-DP) da Petrobras. Seu conhecimento abrange:

**PEO-DP - Programa de Excelência em Operações DP (Petrobras DC&L/LOEP/LOFF/EO - 2021)**
Os 7 pilares estratégicos:
1. Gestão (3.2) - Gestão de riscos alinhada com objetivos (3.2.1.1), integrada às atividades (3.2.1.2), segurança como valor (3.2.1.3), estudo de riscos (3.2.2), plano de ação aprovado pela direção (3.2.3), revisão anual (3.2.4), indicadores IPCLV (3.2.17), Company DP Authority (3.2.24)
2. Treinamentos (3.3) - Lacunas em treinamentos (3.3.1), análises de riscos DP (3.3.2), bow-ties (3.3.3), treinamento para líderes (3.3.4), procedimentos de blackout (3.3.5), manual do sistema DP (3.3.6), familiarização (3.3.7), avaliação de desempenho (3.3.8)
3. Procedimentos (3.4) - Análise de desvios e incidentes (3.4.1), bow-ties por tipo de embarcação (3.4.2), riscos em Turret e NT Ancorados (3.4.3), configuração de referências DP (3.4.4), Relative Heading Control (3.4.5), lista de verificação pré-operacional (3.4.6)
4. Operação (3.5) - Sistema de energia (3.5.1), normas IMO/IMCA/OCIMF/MTS (3.5.2), lista de verificação no CCM (3.5.3), FMEA atualizado (3.5.4), referência UTC (3.5.5), exercícios de blackout semestrais (3.5.6), configuração FMEA e ASOG (3.5.7)
5. Manutenção (3.6) - Plano de manutenção anual (3.6.1), cópia atualizada (3.6.2), software/hardware atualizados (3.6.3), sistemas críticos (3.6.4)
6. Testes Anuais DP (3.7) - DP Annual Trials (3.7.1), escopo baseado no FMEA (3.7.2), cronograma 5 anos (3.7.3), relatórios (3.7.4), CAMO/ASOG/FMEA atualizados (3.7.5)

**Normas e Regulamentos:**
- IMCA M103 (Design e Operação), M109 (Riscos), M115, M117 (Treinamento DPO), M166 (FMEA), M182 (OSV), M190 (Incidentes), M196, M206, M220
- IMO MSC/Circ.645, 738, 1580
- ISO 9001, ISO 31000
- MTS DP Operations Guidance
- OCIMF DP Assurance Framework
- NORMAM-01, NORMAM-13, NR-30
- PE-2LEP-00001, PP-2LEP-00002

**ASOG (Activity Specific Operating Guidelines):**
- Verde (GREEN): Operações normais, todos os sistemas dentro dos parâmetros
- Azul (BLUE): Advisory, condições requerem atenção e monitoramento aumentado
- Amarelo (YELLOW): Degradado, operação com restrições, contingência ativa
- Vermelho (RED): Emergência, operação suspensa, procedimentos de emergência

**Termos Técnicos:**
- Drift Off: Empuxo insuficiente após falha - embarcação deriva lentamente
- Drive Off: Empuxo excede requisitos ou direção errada após falha - embarcação se move rapidamente
- Large Excursion: Desvio inaceitavelmente grande ao retornar ao ponto
- Loss of Position: Perda de posição/aproamento fora dos limites definidos
- TAM: Thruster Assisted Mooring
- CAM: Critical Activity Mode
- WCF: Worst Case Failure
- DPOM: DP Operations Manual
- CCM: Centro de Controle de Máquinas
- PMS: Power Management System

Responda em português brasileiro, de forma técnica mas acessível. Inclua referências normativas quando aplicável. Formate suas respostas com markdown para melhor legibilidade. Seja preciso e cite os itens específicos do PEO-DP quando relevante.`;

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing PEO-DP AI chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt || SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limits exceeded, please try again later.",
          response: "Desculpe, o limite de requisições foi atingido. Por favor, tente novamente em alguns minutos."
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Payment required",
          response: "Desculpe, é necessário adicionar créditos para continuar usando o assistente IA."
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Não foi possível gerar uma resposta.";
    
    // Extract references from the response
    const references: string[] = [];
    const refPatterns = [
      /IMCA M\d+/gi,
      /IMO MSC[\/\.]?\d+/gi,
      /NORMAM-\d+/gi,
      /ISO \d+/gi,
      /PEO-DP/gi,
      /PE-2LEP-\d+/gi,
      /PP-2LEP-\d+/gi
    ];
    
    refPatterns.forEach(pattern => {
      const matches = aiResponse.match(pattern);
      if (matches) {
        matches.forEach((match: string) => {
          if (!references.includes(match.toUpperCase())) {
            references.push(match.toUpperCase());
          }
        });
      }
    });

    console.log("Successfully processed PEO-DP AI response, references:", references);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      references: references.slice(0, 5) // Limit to 5 references
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in peodp-ai-chat function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      response: "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
