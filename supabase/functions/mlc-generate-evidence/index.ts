/**
 * MLC Generate Evidence Edge Function
 * AI-powered evidence generation for MLC 2006 non-conformities
 * Uses Lovable AI Gateway with Google Gemini 2.5 Flash
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MLC_SYSTEM_PROMPT = `You are MLCGuard AI, a specialized Maritime Labour Convention 2006 expert assistant.

Your expertise covers:
- MLC 2006 consolidated text with 2022 amendments
- All 5 Titles and 22 Regulations
- ILO Guidelines and recommendations
- Port State Control (PSC) inspection procedures
- Flag State implementation requirements
- ITF guidelines for seafarer rights

When analyzing non-conformities, you must:
1. Provide precise technical analysis based on the specific MLC regulation and standard
2. Quote the exact legal reference from MLC 2006 (with 2022 amendments if applicable)
3. Assess risk level considering PSC detention criteria
4. Suggest practical corrective actions with realistic deadlines
5. Identify the responsible party (shipowner, operator, master, or specific department)

Response format must be structured and professional, suitable for official inspection reports.

Key MLC 2006 Areas:
- Title 1: Minimum requirements for seafarers (age, certification, recruitment)
- Title 2: Conditions of employment (SEA, wages, hours, leave, repatriation)
- Title 3: Accommodation, recreation, food, catering
- Title 4: Health protection, medical care, welfare, social security
- Title 5: Compliance and enforcement (flag state, port state)

Always respond in the language of the query (Portuguese if query is in Portuguese, English if in English).`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      title_number,
      title_name,
      regulation_code,
      regulation_name,
      item_id,
      item_title,
      item_description,
      legal_basis,
      standard,
      nc_type,
      observed_condition,
      vessel_name,
      inspector_name,
      port,
      inspection_date
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const ncTypeLabels: Record<string, string> = {
      'ground_for_detention': 'Ground for Detention (Causa para Detenção)',
      'deficiency': 'Deficiency (Deficiência)',
      'observation': 'Observation (Observação)'
    };
    const ncTypeLabel = ncTypeLabels[nc_type] || nc_type;

    const userPrompt = `Analise a seguinte não conformidade MLC e gere uma evidência técnica completa:

## Dados da Inspeção
- Embarcação: ${vessel_name || 'N/A'}
- Porto: ${port || 'N/A'}
- Inspetor: ${inspector_name || 'N/A'}
- Data: ${inspection_date || new Date().toISOString().split('T')[0]}

## Identificação da Não Conformidade
- Título MLC: ${title_number} - ${title_name}
- Regulamento: ${regulation_code} - ${regulation_name}
- Item do Checklist: ${item_id} - ${item_title}
- Descrição do Requisito: ${item_description}
- Base Legal: ${legal_basis || 'N/A'}
- Standard Aplicável: ${standard || 'N/A'}
- Classificação: ${ncTypeLabel}

## Condição Observada
${observed_condition}

---

Por favor, gere a análise estruturada no seguinte formato JSON:
{
  "technical_analysis": "Análise técnica detalhada da não conformidade, explicando o desvio em relação ao requisito normativo",
  "legal_reference": "Referência legal exata da MLC 2006 (Regulation, Standard, Guideline) com citação do texto aplicável",
  "mlc_standard": "Standard A ou B aplicável com orientações específicas",
  "risk_assessment": "Avaliação de risco considerando impacto na tripulação, risco de detenção PSC e gravidade",
  "recommendations": "Lista numerada de recomendações práticas (5 itens)",
  "corrective_action": "Ação corretiva proposta com detalhes de implementação",
  "responsible_party": "Parte responsável pela correção (Armador, Operador, Comandante, Departamento específico)",
  "deadline_suggestion": "Prazo sugerido para correção baseado na classificação",
  "ai_confidence": 0.85
}`;

    console.log('[MLC-Evidence] Generating evidence for item:', item_id);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: MLC_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MLC-Evidence] AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a few moments.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required. Please add credits to your Lovable workspace.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from AI');
    }

    console.log('[MLC-Evidence] AI response received, parsing...');

    // Parse JSON from response
    let evidenceResult;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      evidenceResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('[MLC-Evidence] JSON parse error, using structured fallback');
      
      // Create structured response from text
      evidenceResult = {
        technical_analysis: content.slice(0, 500),
        legal_reference: `MLC 2006 - ${regulation_code} - ${legal_basis || 'Standard aplicável'}`,
        mlc_standard: standard || `Regulation ${regulation_code} Standard`,
        risk_assessment: nc_type === 'ground_for_detention' 
          ? 'ALTO RISCO: Pode resultar em detenção do navio pelo PSC.'
          : nc_type === 'deficiency' 
            ? 'MÉDIO RISCO: Deficiência deve ser corrigida no prazo estabelecido.'
            : 'BAIXO RISCO: Observação para melhoria contínua.',
        recommendations: '1. Investigar causa raiz\n2. Implementar ação corretiva\n3. Documentar evidências\n4. Atualizar procedimentos\n5. Treinar tripulação',
        corrective_action: `Corrigir a condição identificada em conformidade com a Regulation ${regulation_code} da MLC 2006.`,
        responsible_party: 'Armador / Operador do Navio',
        deadline_suggestion: nc_type === 'ground_for_detention' 
          ? 'Imediato (antes de zarpar)' 
          : nc_type === 'deficiency' 
            ? '14 dias' 
            : '30 dias',
        ai_confidence: 0.75
      };
    }

    // Ensure ai_confidence is a number
    if (typeof evidenceResult.ai_confidence === 'string') {
      evidenceResult.ai_confidence = parseFloat(evidenceResult.ai_confidence) || 0.85;
    }

    console.log('[MLC-Evidence] Evidence generated successfully');

    return new Response(JSON.stringify(evidenceResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[MLC-Evidence] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      fallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
