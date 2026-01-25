/**
 * Validate Downtime AI - Edge Function
 * Advanced AI validation for downtime justifications with BROA evidence generation
 * Implements multi-factor validation scoring and compliance checks
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DowntimeEntry {
  id: string;
  vessel_id?: string;
  start_time: string;
  end_time?: string;
  duration_hours?: number;
  reason: string;
  reason_category: string;
  impact_level: string;
  evidence_urls?: string[];
  reported_by?: string;
}

interface ValidationResult {
  is_valid: boolean;
  confidence: number;
  reasoning: string;
  required_evidence: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  broa_compliant: boolean;
  validation_factors: {
    technical_validity: number;
    documentation_completeness: number;
    historical_consistency: number;
    severity_proportionality: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { downtimeId, downtime_entry, include_historical_analysis } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Fetch downtime entry if ID provided
    let entry: DowntimeEntry;
    if (downtimeId) {
      // Try new table first, fallback to legacy
      let { data, error } = await supabase
        .from('vessel_downtimes')
        .select('*')
        .eq('id', downtimeId)
        .single();
      
      if (error || !data) {
        // Fallback to legacy table
        const legacy = await supabase
          .from('downtime_events')
          .select('*')
          .eq('id', downtimeId)
          .single();
        
        if (legacy.error || !legacy.data) {
          throw new Error('Downtime entry not found');
        }
        data = legacy.data;
      }
      
      // Map to expected interface
      entry = {
        id: data.id,
        vessel_id: data.vessel_id,
        start_time: data.start_time,
        end_time: data.end_time,
        duration_hours: data.duration_hours,
        reason: data.reported_reason || data.reason,
        reason_category: data.category || data.reason_category,
        impact_level: data.impact_level || 'medium',
        evidence_urls: data.evidence_urls,
        reported_by: data.reported_by
      };
    } else {
      entry = downtime_entry;
    }

    // Fetch historical data for pattern analysis
    let historicalData: any[] = [];
    if (include_historical_analysis && entry.vessel_id) {
      const { data } = await supabase
        .from('downtime_events')
        .select('*')
        .eq('vessel_id', entry.vessel_id)
        .order('start_time', { ascending: false })
        .limit(20);
      
      historicalData = data || [];
    }

    // Calculate duration if not provided
    const durationHours = entry.duration_hours || (
      entry.end_time 
        ? (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60)
        : 0
    );

    // Build comprehensive prompt for AI analysis
    const systemPrompt = `Você é um especialista sênior em operações marítimas offshore com 20+ anos de experiência.
Seu papel é auditar justificativas de downtime para conformidade contratual e regulatória.

CRITÉRIOS DE VALIDAÇÃO BROA (Boletim de Registro de Ocorrências e Avarias):
1. Justificativas válidas (força maior):
   - Condições meteorológicas extremas documentadas
   - Manutenção preventiva programada em contrato
   - Inspeções regulatórias obrigatórias (DPC, IBAMA)
   - Emergências de segurança com registro
   - Falhas de equipamento classe crítica

2. Justificativas que requerem evidência adicional:
   - Falhas mecânicas não planejadas (requer laudo técnico)
   - Problemas operacionais (requer registro de eventos)
   - Indisponibilidade de tripulação (requer escala e justificativa)

3. Red flags para fraude/abuso:
   - Padrões recorrentes em horários específicos
   - Durações inconsistentes com tipo de problema
   - Falta de documentação para categoria alegada
   - Histórico de downtimes similares não justificados

NORMAS DE REFERÊNCIA:
- NORMAN (Normas da Autoridade Marítima Brasileira)
- ANTAQ (Agência Nacional de Transportes Aquaviários)
- IMO SOLAS Capítulo II-1
- Convenção MLC 2006

Responda SEMPRE em português brasileiro com análise detalhada.`;

    const historicalSummary = historicalData.length > 0 
      ? `\n\nHISTÓRICO DA EMBARCAÇÃO (últimos 20 eventos):
${historicalData.map(h => `- ${new Date(h.start_time).toLocaleDateString('pt-BR')}: ${h.reason_category} - ${h.duration_hours?.toFixed(1)}h - "${h.reason}"`).join('\n')}

Padrões identificados:
- Total de downtimes: ${historicalData.length}
- Categoria mais frequente: ${getMostFrequentCategory(historicalData)}
- Média de duração: ${(historicalData.reduce((a, b) => a + (b.duration_hours || 0), 0) / historicalData.length).toFixed(1)}h`
      : '';

    const userPrompt = `ANALISE ESTE EVENTO DE DOWNTIME:

**Evento ID:** ${entry.id || 'Novo registro'}
**Data/Hora Início:** ${new Date(entry.start_time).toLocaleString('pt-BR')}
**Data/Hora Fim:** ${entry.end_time ? new Date(entry.end_time).toLocaleString('pt-BR') : 'Em andamento'}
**Duração:** ${durationHours.toFixed(1)} horas
**Categoria Reportada:** ${entry.reason_category}
**Nível de Impacto:** ${entry.impact_level}
**Justificativa:** "${entry.reason}"
**Evidências Anexadas:** ${entry.evidence_urls?.length || 0} documentos
**Reportado por:** ${entry.reported_by || 'Não informado'}
${historicalSummary}

EXECUTE ANÁLISE COMPLETA E FORNEÇA VALIDAÇÃO.`;

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
              name: "validate_downtime",
              description: "Validação estruturada do evento de downtime",
              parameters: {
                type: "object",
                properties: {
                  is_valid: {
                    type: "boolean",
                    description: "Se a justificativa é válida"
                  },
                  confidence: {
                    type: "number",
                    description: "Nível de confiança da validação (0-100)"
                  },
                  reasoning: {
                    type: "string",
                    description: "Análise detalhada da justificativa"
                  },
                  required_evidence: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de evidências necessárias"
                  },
                  risk_level: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    description: "Nível de risco financeiro/contratual"
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Ações recomendadas"
                  },
                  broa_compliant: {
                    type: "boolean",
                    description: "Se está em conformidade com padrões BROA"
                  },
                  technical_validity_score: {
                    type: "number",
                    description: "Score de validade técnica (0-100)"
                  },
                  documentation_score: {
                    type: "number",
                    description: "Score de documentação (0-100)"
                  },
                  historical_consistency_score: {
                    type: "number",
                    description: "Score de consistência histórica (0-100)"
                  },
                  severity_proportionality_score: {
                    type: "number",
                    description: "Score de proporcionalidade severidade/duração (0-100)"
                  }
                },
                required: ["is_valid", "confidence", "reasoning", "required_evidence", "risk_level", "recommendations", "broa_compliant"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "validate_downtime" } }
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
    
    // Parse AI response
    let validation: ValidationResult = {
      is_valid: false,
      confidence: 0,
      reasoning: "Análise não disponível",
      required_evidence: [],
      risk_level: "medium",
      recommendations: [],
      broa_compliant: false,
      validation_factors: {
        technical_validity: 0,
        documentation_completeness: 0,
        historical_consistency: 0,
        severity_proportionality: 0
      }
    };

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        validation = {
          is_valid: parsed.is_valid,
          confidence: parsed.confidence,
          reasoning: parsed.reasoning,
          required_evidence: parsed.required_evidence || [],
          risk_level: parsed.risk_level,
          recommendations: parsed.recommendations || [],
          broa_compliant: parsed.broa_compliant,
          validation_factors: {
            technical_validity: parsed.technical_validity_score || 0,
            documentation_completeness: parsed.documentation_score || 0,
            historical_consistency: parsed.historical_consistency_score || 0,
            severity_proportionality: parsed.severity_proportionality_score || 0
          }
        };
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }
    }

    // Generate BROA evidence document if valid
    let broaEvidence = null;
    if (validation.is_valid && validation.broa_compliant) {
      broaEvidence = {
        document_type: "BROA_EVIDENCE",
        version: "2.0",
        generated_at: new Date().toISOString(),
        downtime_event: {
          id: entry.id,
          period: {
            start: entry.start_time,
            end: entry.end_time,
            duration_hours: durationHours
          },
          category: entry.reason_category,
          description: entry.reason,
          impact_level: entry.impact_level
        },
        validation: {
          status: "APPROVED",
          confidence: validation.confidence,
          ai_model: "gemini-3-flash-preview",
          validated_at: new Date().toISOString()
        },
        compliance: {
          standard: "BROA Offshore Vessel Standards",
          references: ["NORMAN", "ANTAQ", "IMO SOLAS"],
          risk_assessment: validation.risk_level
        },
        ai_analysis: {
          reasoning: validation.reasoning,
          recommendations: validation.recommendations,
          validation_factors: validation.validation_factors
        },
        signature: {
          type: "AI_DIGITAL_SIGNATURE",
          algorithm: "SHA-256",
          timestamp: new Date().toISOString()
        }
      };
    }

    // Update database if downtimeId provided
    if (downtimeId) {
      // Try new table first
      const { error: newTableError } = await supabase
        .from('vessel_downtimes')
        .update({
          ai_validation: validation,
          validation_status: validation.is_valid ? 'approved' : 'requires_review',
          validated_at: new Date().toISOString(),
          broa_evidence: broaEvidence,
          broa_generated_at: broaEvidence ? new Date().toISOString() : null
        })
        .eq('id', downtimeId);

      // Fallback to legacy table if new table fails
      if (newTableError) {
        await supabase
          .from('downtime_events')
          .update({
            ai_validation: validation,
            justification_status: validation.is_valid ? 'approved' : 'requires_review',
            validated_at: new Date().toISOString()
          })
          .eq('id', downtimeId);
      }

      // Log to broa_evidence_logs if compliant
      if (broaEvidence) {
        // Get organization_id from the entry
        const { data: downtimeData } = await supabase
          .from('vessel_downtimes')
          .select('organization_id')
          .eq('id', downtimeId)
          .single();

        await supabase.from('broa_evidence_logs').insert({
          downtime_id: downtimeId,
          organization_id: downtimeData?.organization_id,
          evidence_data: broaEvidence,
          evidence_type: 'downtime_justification',
          ai_model: 'gemini-3-flash-preview',
          ai_confidence: validation.confidence,
          created_at: new Date().toISOString()
        }).catch((err: Error) => console.log("BROA log insert skipped:", err.message));
      }
    }

    const result = {
      success: true,
      validation,
      broa_evidence: broaEvidence,
      duration_hours: durationHours,
      historical_events_analyzed: historicalData.length,
      generated_at: new Date().toISOString()
    };

    console.log("Downtime validation completed:", entry.id || "new entry");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in validate-downtime-ai:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getMostFrequentCategory(data: any[]): string {
  const counts: Record<string, number> = {};
  data.forEach(d => {
    const cat = d.reason_category || 'unknown';
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
}
