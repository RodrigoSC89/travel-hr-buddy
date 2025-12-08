import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MLC 2006 Knowledge Base
const MLC_KNOWLEDGE_BASE = `
# MLC 2006 - Maritime Labour Convention

## OVERVIEW
The Maritime Labour Convention (MLC) 2006 is an international convention adopted by the International Labour Organization (ILO). It sets out comprehensive rights and protection at work for seafarers and establishes a level playing field for shipowners.

## STRUCTURE
The MLC 2006 is structured in:
- Title 1: Minimum requirements for seafarers to work on a ship
- Title 2: Conditions of employment
- Title 3: Accommodation, recreational facilities, food and catering
- Title 4: Health protection, medical care, welfare and social security protection
- Title 5: Compliance and enforcement

## KEY REGULATIONS

### Title 1 - Minimum Requirements
- Regulation 1.1 - Minimum age: 16 years minimum, 18 for hazardous work
- Regulation 1.2 - Medical certificate: Valid certificate required, max 2 years validity
- Regulation 1.3 - Training and qualifications: STCW compliance
- Regulation 1.4 - Recruitment and placement: Fair practices, no fees to seafarers

### Title 2 - Conditions of Employment
- Regulation 2.1 - Seafarers' employment agreements: Written contract with specified terms
- Regulation 2.2 - Wages: Regular payment, monthly statements
- Regulation 2.3 - Hours of work and rest:
  * Maximum 14 hours work in any 24-hour period
  * Maximum 72 hours work in any 7-day period
  * Minimum 10 hours rest in any 24-hour period
  * Minimum 77 hours rest in any 7-day period
- Regulation 2.4 - Entitlement to leave: Minimum 2.5 days per month
- Regulation 2.5 - Repatriation: Right to repatriation after max 12 months
- Regulation 2.6 - Compensation for loss or injury
- Regulation 2.7 - Manning levels: Safe manning document compliance

### Title 3 - Accommodation
- Regulation 3.1 - Accommodation and recreational facilities: Size, comfort, hygiene standards
- Regulation 3.2 - Food and catering: Sufficient quality and quantity, trained cook

### Title 4 - Health Protection
- Regulation 4.1 - Medical care: On-board medical facilities
- Regulation 4.2 - Shipowner liability: Injury and illness coverage
- Regulation 4.3 - Health and safety protection: OHS policies
- Regulation 4.4 - Access to welfare facilities
- Regulation 4.5 - Social security

### Title 5 - Compliance
- Regulation 5.1.1 - Flag state responsibilities
- Regulation 5.1.2 - Authorization of recognized organizations
- Regulation 5.1.3 - Maritime Labour Certificate and DMLC
- Regulation 5.1.4 - Inspection and enforcement
- Regulation 5.1.5 - On-board complaint procedures
- Regulation 5.2.1 - Port state control inspections

## CERTIFICATION REQUIREMENTS
Ships of 500 GT or more in international voyages must carry:
1. Maritime Labour Certificate (MLC)
2. Declaration of Maritime Labour Compliance (DMLC) Part I and II
3. Latest inspection report

## PSC DETAINABLE DEFICIENCIES
Common issues that may lead to detention:
- Invalid or missing MLC/DMLC
- Unpaid wages
- Excessive working hours / insufficient rest
- Poor accommodation conditions
- Inadequate food or water
- No valid medical certificates
- Missing employment agreements
- No on-board complaint procedure

## BRAZIL IMPLEMENTATION
Brazil ratified MLC 2006 in 2020 (Decree 10.671/2021).
Key points:
- Applies to all vessels flying Brazilian flag
- NORMAM compliance
- DPC (Diretoria de Portos e Costas) as competent authority
`;

const SYSTEM_PROMPT = `Você é um assistente especializado em MLC 2006 (Maritime Labour Convention / Convenção do Trabalho Marítimo).

Seu conhecimento inclui:
${MLC_KNOWLEDGE_BASE}

INSTRUÇÕES:
1. Responda sempre em português brasileiro
2. Seja preciso e técnico, citando regulamentos específicos
3. Forneça orientações práticas para conformidade
4. Identifique riscos de detenção PSC
5. Sugira ações corretivas quando relevante

MODOS DE OPERAÇÃO:
- "checklist": Gere itens de verificação específicos
- "evidence": Sugira evidências documentais necessárias
- "corrective": Proponha ações corretivas
- "risk": Avalie riscos de não conformidade
- "explain": Explique regulamentos em detalhes`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = 'general' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt based on mode
    let systemPrompt = SYSTEM_PROMPT;
    
    switch (mode) {
      case 'checklist':
        systemPrompt += '\n\nMODO CHECKLIST: Gere uma lista de verificação detalhada para o item solicitado, incluindo critérios de conformidade e não conformidade.';
        break;
      case 'evidence':
        systemPrompt += '\n\nMODO EVIDÊNCIA: Liste os documentos, registros e evidências necessárias para demonstrar conformidade com o requisito.';
        break;
      case 'corrective':
        systemPrompt += '\n\nMODO AÇÃO CORRETIVA: Proponha ações corretivas específicas, prazos sugeridos e responsabilidades para resolver a não conformidade.';
        break;
      case 'risk':
        systemPrompt += '\n\nMODO AVALIAÇÃO DE RISCO: Avalie o risco de detenção PSC, impacto na certificação e prioridade de correção.';
        break;
      case 'explain':
        systemPrompt += '\n\nMODO EXPLICAÇÃO: Explique o regulamento em detalhes, incluindo histórico, intenção e melhores práticas.';
        break;
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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("MLC Assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
