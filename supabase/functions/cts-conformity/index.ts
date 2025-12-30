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
    const { cts_record, crew_certifications, vessel_name } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em conformidade marítima STCW e CTS (Certificado Técnico da Embarcação).
Sua função é:
1. Cruzar funções do CTS com certificados dos tripulantes
2. Identificar não-conformidades críticas
3. Verificar vencimentos próximos
4. Gerar plano de ação corretivo

Use as normas STCW 2010/2017 e regulamentações da DPC brasileira como referência.
Sempre responda em português brasileiro.`;

    const crewList = crew_certifications.map((c: any) => 
      `- ${c.crew_name}: ${c.certification_type} (${c.certificate_number}) - Validade: ${c.expiry_date}`
    ).join('\n');

    const userPrompt = `Analise a conformidade da tripulação com o CTS:

**Embarcação**: ${vessel_name}
**CTS Número**: ${cts_record.cts_number}
**Bandeira**: ${cts_record.flag_state}
**Validade CTS**: ${cts_record.expiry_date}
**Classificadora**: ${cts_record.classification_society}

**Categorias Exigidas pelo CTS**:
${JSON.stringify(cts_record.categories, null, 2)}

**Certificações da Tripulação**:
${crewList}

Identifique:
1. Não-conformidades críticas (tripulante sem certificado exigido)
2. Certificados próximos do vencimento (30 dias)
3. Incompatibilidades categoria vs função
4. Nível de risco operacional (CRÍTICO/ALTO/MÉDIO/BAIXO)
5. Plano de ação corretivo com prazos`;

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
    const analysis = data.choices?.[0]?.message?.content || "";

    // Determinar nível de risco
    let risk_level = "low";
    if (analysis.toLowerCase().includes("crítico")) risk_level = "critical";
    else if (analysis.toLowerCase().includes("alto")) risk_level = "high";
    else if (analysis.toLowerCase().includes("médio")) risk_level = "medium";

    const result = {
      analysis,
      risk_level,
      non_conformities: extractNonConformities(analysis),
      expiring_soon: extractExpiringSoon(analysis),
      corrective_actions: extractCorrectiveActions(analysis),
      compliance_score: calculateComplianceScore(analysis),
      generated_at: new Date().toISOString()
    };

    console.log("CTS conformity check completed for vessel:", vessel_name);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in cts-conformity:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function extractNonConformities(analysis: string): string[] {
  const sections = analysis.split(/não-conformidade|non-conformit/i);
  if (sections.length < 2) return [];
  const items = sections[1].split(/\n[-•*]|\d\./);
  return items.filter(i => i.trim().length > 5).slice(0, 10).map(i => i.trim());
}

function extractExpiringSoon(analysis: string): string[] {
  const sections = analysis.split(/vencimento|expir/i);
  if (sections.length < 2) return [];
  const items = sections[1].split(/\n[-•*]|\d\./);
  return items.filter(i => i.trim().length > 5).slice(0, 5).map(i => i.trim());
}

function extractCorrectiveActions(analysis: string): string[] {
  const sections = analysis.split(/plano|ação corretiva|corrective/i);
  if (sections.length < 2) return [];
  const items = sections[1].split(/\n[-•*]|\d\./);
  return items.filter(i => i.trim().length > 5).slice(0, 5).map(i => i.trim());
}

function calculateComplianceScore(analysis: string): number {
  if (analysis.toLowerCase().includes("crítico")) return 40;
  if (analysis.toLowerCase().includes("alto")) return 60;
  if (analysis.toLowerCase().includes("médio")) return 75;
  return 90;
}
