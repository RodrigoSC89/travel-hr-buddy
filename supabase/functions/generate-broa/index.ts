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
    const { downtime_event, vessel, contract, evidence_files } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um especialista em documentação marítima para BROA (Boletim de Registro de Ocorrências e Avarias).
Gere um documento BROA completo e profissional contendo:
1. Dados da ocorrência (data, hora, local)
2. Descrição técnica detalhada
3. Análise de causa raiz
4. Impacto operacional
5. Ações corretivas tomadas/planejadas
6. Campos para assinaturas

O documento deve seguir os padrões da Marinha do Brasil e ANTAQ.
Sempre responda em português brasileiro formal.`;

    const evidenceList = evidence_files?.map((f: any) => `- ${f.name}: ${f.description}`).join('\n') || 'Nenhuma evidência anexada';

    const userPrompt = `Gere um documento BROA para a seguinte ocorrência:

**DADOS DA EMBARCAÇÃO**
- Nome: ${vessel.name}
- IMO: ${vessel.imo_number || 'N/A'}
- MMSI: ${vessel.mmsi || 'N/A'}
- Bandeira: ${vessel.flag_state || 'Brasil'}

**DADOS DA OCORRÊNCIA**
- Data/Hora Início: ${downtime_event.start_time}
- Data/Hora Fim: ${downtime_event.end_time || 'Em andamento'}
- Sistema Afetado: ${downtime_event.system_affected}
- Nível de Impacto: ${downtime_event.impact_level}

**DESCRIÇÃO DO EVENTO**
${downtime_event.reason}

**CONTEXTO CONTRATUAL**
- Contrato: ${contract?.contract_number || 'N/A'}
- Cliente: ${contract?.client || 'N/A'}

**EVIDÊNCIAS COLETADAS**
${evidenceList}

Gere o documento BROA completo em formato estruturado com seções claras.`;

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
    const broaContent = data.choices?.[0]?.message?.content || "";

    const result = {
      broa_number: `BROA-${Date.now()}-${vessel.name?.substring(0,3).toUpperCase() || 'VES'}`,
      content: broaContent,
      vessel_name: vessel.name,
      occurrence_date: downtime_event.start_time,
      system_affected: downtime_event.system_affected,
      status: "draft",
      signatures_required: [
        { role: "Comandante", signed: false },
        { role: "Chefe de Máquinas", signed: false },
        { role: "Oficial de Serviço", signed: false }
      ],
      generated_at: new Date().toISOString(),
      cause_analysis: extractCauseAnalysis(broaContent),
      corrective_actions: extractCorrectiveFromBROA(broaContent)
    };

    console.log("BROA generated for vessel:", vessel.name, "Number:", result.broa_number);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in generate-broa:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function extractCauseAnalysis(content: string): string {
  const sections = content.split(/causa|root cause|análise/i);
  if (sections.length < 2) return "Análise de causa em elaboração";
  const text = sections[1].split(/\n\n|ações|corrective/i)[0];
  return text.trim().substring(0, 500);
}

function extractCorrectiveFromBROA(content: string): string[] {
  const sections = content.split(/ações corretivas|corrective|medidas/i);
  if (sections.length < 2) return [];
  const items = sections[1].split(/\n[-•*]|\d\./);
  return items.filter(i => i.trim().length > 5).slice(0, 5).map(i => i.trim());
}
