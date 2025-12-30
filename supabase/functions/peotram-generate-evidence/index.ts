import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      item_number, 
      item_description, 
      element_number, 
      element_name,
      non_conformity_reason,
      norm_reference,
      vessel_name,
      audit_date
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isCritical = element_number === 4 || element_number === 6;

    const systemPrompt = `Você é um auditor PEOTRAM experiente especializado em gerar evidências técnicas para não-conformidades.

Para cada não-conformidade, você deve gerar:
1. TÍTULO: Descrição clara e objetiva da não-conformidade
2. ANÁLISE TÉCNICA: Explicação detalhada do problema identificado
3. REFERÊNCIA NORMATIVA: Citação da norma/procedimento violado
4. RISCO IDENTIFICADO: Impacto potencial na segurança/operação
5. RECOMENDAÇÕES: Ações corretivas sugeridas
6. PLANO DE AÇÃO: Passos específicos para correção com prazos

${isCritical ? '⚠️ ATENÇÃO: Este é um ELEMENTO CRÍTICO (4 ou 6). A evidência deve ser MAIS DETALHADA e incluir análise de impacto ampliada.' : ''}

Gere o documento em formato estruturado e profissional para apresentação ao regulador.`;

    const userPrompt = `Gere evidência de não-conformidade para:

**AUDITORIA PEOTRAM**
- Embarcação: ${vessel_name}
- Data: ${audit_date}

**ELEMENTO ${element_number}**: ${element_name} ${isCritical ? '⭐ CRÍTICO' : ''}

**ITEM ${item_number}**: ${item_description}

**MOTIVO DA NÃO-CONFORMIDADE**:
${non_conformity_reason}

**REFERÊNCIA NORMATIVA BASE**:
${norm_reference || 'Procedimento operacional padrão'}

Gere a evidência completa e estruturada.`;

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
    const evidenceContent = data.choices?.[0]?.message?.content || "";

    const result = {
      evidence_id: `EV-${Date.now()}`,
      element_number,
      element_name,
      is_critical: isCritical,
      item_number,
      item_description,
      title: extractTitle(evidenceContent),
      technical_analysis: extractSection(evidenceContent, "análise técnica"),
      norm_reference: extractSection(evidenceContent, "referência normativa") || norm_reference,
      risk_identified: extractSection(evidenceContent, "risco"),
      recommendations: extractSection(evidenceContent, "recomendações"),
      corrective_action_plan: extractSection(evidenceContent, "plano de ação"),
      full_content: evidenceContent,
      generated_by_ai: true,
      generated_at: new Date().toISOString(),
      vessel_name,
      audit_date
    };

    console.log("PEOTRAM evidence generated for item:", item_number, "Element:", element_number);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in peotram-generate-evidence:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function extractTitle(content: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('TÍTULO') || line.includes('Title')) {
      return line.replace(/^[#*\s]*TÍTULO[:\s]*/i, '').trim();
    }
    if (line.startsWith('#') || line.startsWith('**')) {
      return line.replace(/^[#*\s]+/, '').replace(/\*+$/, '').trim();
    }
  }
  return "Não-conformidade identificada";
}

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`(?:^|\\n)[#*\\s]*${sectionName}[:\\s]*([\\s\\S]*?)(?=\\n[#*\\s]*(?:título|análise|referência|risco|recomend|plano)|$)`, 'i');
  const match = content.match(regex);
  if (match) {
    return match[1].trim().substring(0, 1000);
  }
  return "";
}
