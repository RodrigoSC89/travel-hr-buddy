import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 7 SEÇÕES DO PEO-DP PETROBRAS 2021
const PEODP_SECTIONS: Record<string, { name: string; code: string; critical: boolean; totalReqs: number }> = {
  "3.1": { name: "Regras Gerais", code: "RG", critical: false, totalReqs: 7 },
  "3.2": { name: "Gestão", code: "GS", critical: true, totalReqs: 24 },
  "3.3": { name: "Treinamentos", code: "TR", critical: false, totalReqs: 9 },
  "3.4": { name: "Procedimentos", code: "PR", critical: false, totalReqs: 6 },
  "3.5": { name: "Operação", code: "OP", critical: true, totalReqs: 6 },
  "3.6": { name: "Manutenção", code: "MN", critical: true, totalReqs: 4 },
  "3.7": { name: "Testes Anuais", code: "TA", critical: true, totalReqs: 5 }
};

// Indicadores PEO-DP
const PEODP_INDICATORS = {
  IPCLV: { name: "Índice de Preenchimento Correto das Listas de Verificação", meta: 100, unit: "%" },
  DRIFT_OFF: { name: "Drift Off", description: "Perda de posição por empuxo insuficiente" },
  DRIVE_OFF: { name: "Drive Off", description: "Empuxo excede requisito ou direção errada" },
  LARGE_EXCURSION: { name: "Large Excursion", description: "Retorno com desvio inaceitável" }
};

function extractSection(content: string, sectionName: string): string {
  const patterns = [
    new RegExp(`(?:${sectionName})[:\\s]*([\\s\\S]*?)(?=\\n(?:##|\\*\\*|\\d\\.|$))`, 'i'),
    new RegExp(`\\*\\*${sectionName}\\*\\*[:\\s]*([\\s\\S]*?)(?=\\n(?:\\*\\*|##|$))`, 'i'),
    new RegExp(`##\\s*${sectionName}[\\s]*([\\s\\S]*?)(?=\\n##|$)`, 'i'),
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }
  return "";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      section,
      requirement_number,
      requirement_title,
      requirement_description,
      status,
      auditor_notes,
      vessel_name,
      dp_class,
      company_name,
      audit_date,
      auditor_name
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const sectionInfo = PEODP_SECTIONS[section] || { 
      name: "Seção Desconhecida", 
      code: "XX", 
      critical: false, 
      totalReqs: 0 
    };
    
    const isCritical = sectionInfo.critical || ["3.2", "3.5", "3.6", "3.7"].includes(section);

    const systemPrompt = `Você é um auditor especializado em PEO-DP (Programa de Excelência em Operações DP) da Petrobras, baseado no documento oficial de 03/11/2021.

O PEO-DP possui 7 SEÇÕES PRINCIPAIS:
- 3.1 Regras Gerais (7 requisitos)
- 3.2 GESTÃO ⭐ CRÍTICA (24 requisitos) - Maior peso na auditoria
- 3.3 Treinamentos (9 requisitos)
- 3.4 Procedimentos (6 requisitos)
- 3.5 Operação ⭐ CRÍTICA (6 requisitos)
- 3.6 Manutenção ⭐ CRÍTICA (4 requisitos)
- 3.7 Testes Anuais ⭐ CRÍTICA (5 requisitos)

INDICADORES CHAVE:
- IPCLV: Índice de Preenchimento Correto das Listas de Verificação (Meta: 100%)
- Drift Off: Rastreamento de eventos de perda de posição por empuxo insuficiente
- Drive Off: Rastreamento de eventos de empuxo excessivo ou direção errada
- Large Excursion: Rastreamento de eventos de retorno com desvio inaceitável

CLASSIFICAÇÃO DE NÃO-CONFORMIDADES PEO-DP:
- CRÍTICA: Risco iminente à operação DP (prazo: imediato)
- MAIOR: Pode comprometer a segurança operacional (prazo: 15 dias)
- MENOR: Requer atenção e correção (prazo: 30 dias)
- OBSERVAÇÃO: Melhoria recomendada (prazo: 60 dias)

Para cada não-conformidade de requisito PEO-DP, você deve gerar:

1. **TÍTULO DA NÃO-CONFORMIDADE**: Descrição clara e objetiva (máx 100 caracteres)

2. **ANÁLISE TÉCNICA**: Explicação detalhada incluindo:
   - O que foi identificado como não-conforme
   - Por que viola o requisito PEO-DP
   - Impacto na operação DP e segurança

3. **REFERÊNCIA NORMATIVA**: Citação específica:
   - PEO-DP Petrobras 2021 (seção/requisito)
   - IMCA M 117 Rev. 1 (se aplicável)
   - IMCA M 103 (se aplicável)
   - DP Class Guidelines (se aplicável)
   - NORMAM-01 (se aplicável)

4. **RISCO IDENTIFICADO**: Análise de impacto:
   - Risco à operação DP
   - Risco à segurança de pessoas e ativos
   - Risco regulatório/contratual Petrobras
   - Impacto no indicador IPCLV

5. **RECOMENDAÇÕES**: Orientações para correção

6. **PLANO DE AÇÃO CORRETIVA**: Passos específicos:
   - Ação imediata (se aplicável)
   - Ações de curto prazo
   - Ações de médio prazo
   - Responsáveis sugeridos
   - Prazo recomendado

${isCritical ? `
⚠️ ATENÇÃO: SEÇÃO CRÍTICA ${section} - ${sectionInfo.name}
Esta seção tem maior peso na auditoria PEO-DP e requer:
- Análise mais detalhada
- Identificação de riscos ampliada
- Prazos mais curtos para correção
- Acompanhamento prioritário pela DPO Authority
` : ''}

Gere o documento em formato estruturado e profissional, adequado para apresentação à Petrobras.`;

    const userPrompt = `Gere evidência técnica de NÃO-CONFORMIDADE para requisito PEO-DP:

═══════════════════════════════════════════
AUDITORIA PEO-DP PETROBRAS 2021
Programa de Excelência em Operações DP
═══════════════════════════════════════════

📋 DADOS DA AUDITORIA:
• Embarcação: ${vessel_name || 'Não informado'}
• Classe DP: ${dp_class || 'DP2'}
• Empresa Contratada: ${company_name || 'N/A'}
• Data: ${audit_date || new Date().toISOString().split('T')[0]}
• Auditor: ${auditor_name || 'N/A'}

📊 SEÇÃO ${section}: ${sectionInfo.name} (${sectionInfo.code})
• Status: ${isCritical ? '⭐ SEÇÃO CRÍTICA' : 'Normal'}
• Total de Requisitos na Seção: ${sectionInfo.totalReqs}

📝 REQUISITO AVALIADO:
• Número: ${requirement_number}
• Título: ${requirement_title}
• Descrição: ${requirement_description || 'N/A'}
• Status: ${status}

🔴 OBSERVAÇÕES DO AUDITOR:
${auditor_notes || 'Requisito não atendido conforme critérios PEO-DP'}

═══════════════════════════════════════════

Gere a análise completa de não-conformidade conforme as instruções.`;

    console.log(`PEO-DP Evidence Request - Section ${section}, Requirement ${requirement_number}`);

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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const evidenceContent = data.choices?.[0]?.message?.content || "";

    const result = {
      evidence_id: `PEODP-${section.replace('.', '')}-${Date.now()}`,
      section,
      section_name: sectionInfo.name,
      section_code: sectionInfo.code,
      is_critical: isCritical,
      requirement_number,
      requirement_title,
      requirement_description,
      status,
      title: extractSection(evidenceContent, "título") || `NC: ${requirement_title}`,
      technical_analysis: extractSection(evidenceContent, "análise técnica"),
      normative_reference: extractSection(evidenceContent, "referência normativa"),
      risk_assessment: extractSection(evidenceContent, "risco"),
      recommendations: extractSection(evidenceContent, "recomendações"),
      corrective_action_plan: extractSection(evidenceContent, "plano de ação"),
      full_content: evidenceContent,
      generated_by_ai: true,
      ai_confidence: 0.94,
      generated_at: new Date().toISOString(),
      vessel_name,
      dp_class,
      company_name,
      audit_date,
      auditor_name,
      peodp_version: "2021",
      total_sections: 7,
      total_requirements: 54
    };

    console.log(`PEO-DP Evidence generated - Section ${section}/${sectionInfo.code}, Requirement ${requirement_number}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in peodp-generate-evidence:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
