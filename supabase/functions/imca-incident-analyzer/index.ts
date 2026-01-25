/**
 * IMCA Incident Analyzer - Edge Function
 * AI-powered incident analysis comparing local incidents with IMCA safety bulletins
 * Provides preventive recommendations based on industry lessons learned
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IMCA Safety Flash Categories
const IMCA_CATEGORIES = [
  "Diving Operations",
  "Marine Operations",
  "Lifting & Mechanical Handling",
  "Personal Safety",
  "Well Control",
  "Subsea Operations",
  "DP Operations",
  "Environmental",
  "Fire & Explosion",
  "Structural Integrity"
];

// IMCA bulletins are now stored in Supabase table 'imca_incidents_database'
// This function fetches them dynamically

interface IMCABulletin {
  id: string;
  bulletin_id: string;
  title: string;
  category: string;
  description: string;
  root_causes: string[];
  lessons_learned: string[];
  recommendations: string[];
  severity: string;
  incident_date: string | null;
}

interface DBBulletin {
  bulletin_id: string;
  title: string;
  category: string;
  description: string;
  root_causes: string[] | null;
  lessons_learned: string[] | null;
  recommendations: string[] | null;
  severity: string;
  incident_date: string | null;
}

async function fetchIMCABulletins(supabase: ReturnType<typeof createClient>): Promise<IMCABulletin[]> {
  try {
    const { data, error } = await supabase
      .from('imca_incidents_database')
      .select('*')
      .order('incident_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching IMCA bulletins:', error);
      return [];
    }
    
    return (data || []).map((b: DBBulletin) => ({
      id: b.bulletin_id,
      bulletin_id: b.bulletin_id,
      title: b.title,
      category: b.category,
      description: b.description,
      root_causes: b.root_causes || [],
      lessons_learned: b.lessons_learned || [],
      recommendations: b.recommendations || [],
      severity: b.severity,
      incident_date: b.incident_date
    }));
  } catch (e) {
    console.error('Failed to fetch bulletins:', e);
    return [];
  }
}

interface LocalIncident {
  id: string;
  vessel_id?: string;
  vessel_name?: string;
  incident_date: string;
  description: string;
  category: string;
  severity: string;
  reported_by?: string;
  location?: string;
  equipment_involved?: string;
  injuries?: number;
  environmental_impact?: boolean;
}

interface IncidentComparison {
  similar_incidents: Array<{
    bulletin_id: string;
    title: string;
    similarity_score: number;
    matching_factors: string[];
    key_lessons: string[];
  }>;
  preventive_actions: string[];
  root_cause_analysis: string;
  risk_assessment: {
    current_level: string;
    potential_escalation: string;
    mitigation_priority: string;
  };
  compliance_gaps: string[];
  training_recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { incident, action = 'analyze' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Fetch bulletins from database
    const IMCA_BULLETINS_DB = await fetchIMCABulletins(supabase);

    if (action === 'list_categories') {
      return new Response(JSON.stringify({ categories: IMCA_CATEGORIES }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === 'list_bulletins') {
      return new Response(JSON.stringify({ bulletins: IMCA_BULLETINS_DB }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!incident) {
      throw new Error("Incident data required for analysis");
    }

    // Find potentially similar IMCA bulletins based on category
    const relevantBulletins = IMCA_BULLETINS_DB.filter(
      b => b.category.toLowerCase().includes(incident.category?.toLowerCase() || '') ||
           incident.description?.toLowerCase().includes(b.category.toLowerCase())
    );

    const systemPrompt = `Você é um especialista em segurança marítima e análise de incidentes com certificação IMCA.
    
Sua função é:
1. Comparar incidentes locais com bulletins de segurança IMCA
2. Identificar padrões e causas raiz similares
3. Recomendar ações preventivas baseadas em lições aprendidas da indústria
4. Avaliar gaps de compliance e necessidades de treinamento

METODOLOGIA DE ANÁLISE:
- Tripod Beta para análise de causas raiz
- Bow-tie para avaliação de barreiras
- IMCA Safety Flash format para recomendações

NORMAS DE REFERÊNCIA:
- IMCA SEL 017 - Guidelines on the use of passive heave compensation
- IMCA SEL 019 - Guidelines on safety and environmental management
- IMCA M 202 - Guidelines for the safe packing and handling of cargo
- IMCA M 221 - Guidance on cargo carrying and crane operations
- IMCA D 052 - Guidance on simultaneous operations (SIMOPS)

Responda SEMPRE em português brasileiro.`;

    const bulletinsContext = relevantBulletins.map(b => 
      `[${b.id}] ${b.title}
Categoria: ${b.category}
Severidade: ${b.severity}
Causas Raiz: ${b.root_causes.join(', ')}
Lições: ${b.lessons_learned.join('; ')}`
    ).join('\n\n');

    const userPrompt = `ANALISE O SEGUINTE INCIDENTE E COMPARE COM OS BULLETINS IMCA:

**INCIDENTE LOCAL:**
- Embarcação: ${incident.vessel_name || 'Não especificado'}
- Data: ${incident.incident_date}
- Categoria: ${incident.category}
- Severidade: ${incident.severity}
- Descrição: ${incident.description}
- Equipamento Envolvido: ${incident.equipment_involved || 'N/A'}
- Lesões: ${incident.injuries || 0}
- Impacto Ambiental: ${incident.environmental_impact ? 'Sim' : 'Não'}

**BULLETINS IMCA RELEVANTES (${relevantBulletins.length} encontrados):**
${bulletinsContext || 'Nenhum bulletin similar encontrado na categoria'}

FORNEÇA:
1. Análise de similaridade com bulletins IMCA
2. Análise de causa raiz (Tripod Beta)
3. Ações preventivas recomendadas
4. Avaliação de risco e escalação potencial
5. Gaps de compliance identificados
6. Recomendações de treinamento`;

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
              name: "analyze_incident",
              description: "Análise estruturada do incidente comparando com IMCA",
              parameters: {
                type: "object",
                properties: {
                  similar_incidents: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        bulletin_id: { type: "string" },
                        title: { type: "string" },
                        similarity_score: { type: "number" },
                        matching_factors: { type: "array", items: { type: "string" } },
                        key_lessons: { type: "array", items: { type: "string" } }
                      }
                    },
                    description: "Incidentes IMCA similares identificados"
                  },
                  root_cause_analysis: {
                    type: "string",
                    description: "Análise de causa raiz usando metodologia Tripod Beta"
                  },
                  preventive_actions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Ações preventivas recomendadas"
                  },
                  current_risk_level: {
                    type: "string",
                    enum: ["low", "medium", "high", "critical"],
                    description: "Nível de risco atual"
                  },
                  potential_escalation: {
                    type: "string",
                    description: "Descrição do potencial de escalação"
                  },
                  mitigation_priority: {
                    type: "string",
                    enum: ["immediate", "short_term", "medium_term", "long_term"],
                    description: "Prioridade de mitigação"
                  },
                  compliance_gaps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Gaps de compliance identificados"
                  },
                  training_recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Treinamentos recomendados"
                  }
                },
                required: ["root_cause_analysis", "preventive_actions", "current_risk_level"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_incident" } }
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
    
    let analysis: IncidentComparison = {
      similar_incidents: [],
      preventive_actions: [],
      root_cause_analysis: "",
      risk_assessment: {
        current_level: "medium",
        potential_escalation: "",
        mitigation_priority: "short_term"
      },
      compliance_gaps: [],
      training_recommendations: []
    };

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        analysis = {
          similar_incidents: parsed.similar_incidents || [],
          preventive_actions: parsed.preventive_actions || [],
          root_cause_analysis: parsed.root_cause_analysis || "",
          risk_assessment: {
            current_level: parsed.current_risk_level || "medium",
            potential_escalation: parsed.potential_escalation || "",
            mitigation_priority: parsed.mitigation_priority || "short_term"
          },
          compliance_gaps: parsed.compliance_gaps || [],
          training_recommendations: parsed.training_recommendations || []
        };
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }
    }

    // Log analysis to database
    await supabase.from('ai_audit_logs').insert({
      module_name: 'imca-incident-analyzer',
      user_input: JSON.stringify(incident),
      ai_response: JSON.stringify(analysis),
      interaction_type: 'incident_analysis',
      created_at: new Date().toISOString()
    }).catch((err: Error) => console.log("Audit log skipped:", err.message));

    const result = {
      success: true,
      incident_id: incident.id,
      analysis,
      imca_bulletins_checked: IMCA_BULLETINS_DB.length,
      relevant_bulletins_found: relevantBulletins.length,
      generated_at: new Date().toISOString()
    };

    console.log("IMCA incident analysis completed for:", incident.id || "new incident");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in imca-incident-analyzer:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
