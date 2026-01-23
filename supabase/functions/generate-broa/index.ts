/**
 * Generate BROA - Edge Function
 * Gera Boletim de Registro de Ocorrências e Avarias com IA
 * Padrão Marinha/ANTAQ
 */
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

    // Gerar número BROA padronizado
    const now = new Date();
    const broaNumber = `BROA-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}-${vessel.name?.substring(0,3).toUpperCase() || 'VES'}`;

    // Calcular duração
    const durationHours = downtime_event.duration_hours || 
      (downtime_event.end_time 
        ? (new Date(downtime_event.end_time).getTime() - new Date(downtime_event.start_time).getTime()) / (1000 * 60 * 60)
        : 0);

    const evidenceList = evidence_files?.map((f: { name: string; description?: string }) => 
      `- ${f.name}: ${f.description || 'Sem descrição'}`
    ).join('\n') || 'Nenhuma evidência anexada';

    const systemPrompt = `Você é um especialista em documentação marítima com amplo conhecimento em BROA (Boletim de Registro de Ocorrências e Avarias) conforme padrões ANTAQ e Marinha do Brasil.

Ao gerar um BROA, você deve:
1. Usar linguagem técnica e formal apropriada para documentação marítima
2. Ser objetivo e preciso nas descrições
3. Incluir todos os detalhes relevantes para registro oficial
4. Identificar causas prováveis baseado nas informações
5. Sugerir ações corretivas adequadas

O documento deve ser adequado para:
- Registro junto à Autoridade Marítima
- Comprovação para seguradoras
- Evidência para contratos de afretamento

Responda SEMPRE em português brasileiro formal.`;

    const userPrompt = `Gere um BROA completo para o seguinte evento:

**DADOS DA EMBARCAÇÃO:**
- Nome: ${vessel.name}
- IMO: ${vessel.imo_number || 'N/A'}
- MMSI: ${vessel.mmsi || 'N/A'}
- Bandeira: ${vessel.flag_state || 'Brasil'}

**DADOS DA OCORRÊNCIA:**
- Data/Hora Início: ${new Date(downtime_event.start_time).toLocaleString('pt-BR')}
- Data/Hora Fim: ${downtime_event.end_time ? new Date(downtime_event.end_time).toLocaleString('pt-BR') : 'Em andamento'}
- Duração: ${durationHours.toFixed(1)} horas
- Sistema Afetado: ${downtime_event.system_affected || 'Não especificado'}
- Nível de Impacto: ${downtime_event.impact_level || 'Não classificado'}
- Descrição: ${downtime_event.reason || 'Não informado'}

${contract ? `**DADOS DO CONTRATO:**
- Número: ${contract.contract_number}
- Cliente: ${contract.client}` : ''}

**EVIDÊNCIAS COLETADAS:**
${evidenceList}

Gere o BROA completo com descrição detalhada, análise de causa provável e ações corretivas.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_broa",
              description: "Gera BROA estruturado",
              parameters: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                    description: "Descrição completa da ocorrência para o BROA"
                  },
                  cause_analysis: {
                    type: "string",
                    description: "Análise da causa provável da ocorrência"
                  },
                  corrective_actions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de ações corretivas recomendadas"
                  },
                  preventive_measures: {
                    type: "array",
                    items: { type: "string" },
                    description: "Medidas preventivas para evitar recorrência"
                  },
                  classification: {
                    type: "string",
                    enum: ["avaria_maior", "avaria_menor", "ocorrencia_operacional", "incidente_seguranca"],
                    description: "Classificação da ocorrência"
                  }
                },
                required: ["content", "cause_analysis", "corrective_actions", "classification"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_broa" } }
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
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    let aiResult = {
      content: "Descrição da ocorrência não disponível",
      cause_analysis: "Análise pendente",
      corrective_actions: [] as string[],
      preventive_measures: [] as string[],
      classification: "ocorrencia_operacional"
    };

    // Parse tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        aiResult = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse AI response:", e);
        // Fallback to content
        const content = data.choices?.[0]?.message?.content || "";
        aiResult.content = content;
      }
    }

    // Definir assinaturas requeridas baseado na classificação
    const signaturesRequired = [
      { role: "Comandante", signed: false },
      { role: "Chefe de Máquinas", signed: false },
      { role: "Oficial de Serviço", signed: false }
    ];

    if (aiResult.classification === 'avaria_maior' || aiResult.classification === 'incidente_seguranca') {
      signaturesRequired.push({ role: "Superintendente", signed: false });
    }

    const result = {
      success: true,
      broa_number: broaNumber,
      content: aiResult.content,
      vessel_name: vessel.name,
      occurrence_date: downtime_event.start_time,
      system_affected: downtime_event.system_affected,
      duration_hours: durationHours,
      cause_analysis: aiResult.cause_analysis,
      corrective_actions: aiResult.corrective_actions,
      preventive_measures: aiResult.preventive_measures || [],
      classification: aiResult.classification,
      signatures_required: signaturesRequired,
      generated_at: now.toISOString(),
      evidence_count: evidence_files?.length || 0
    };

    console.log("BROA generated for vessel:", vessel.name, "Number:", result.broa_number);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in generate-broa:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
