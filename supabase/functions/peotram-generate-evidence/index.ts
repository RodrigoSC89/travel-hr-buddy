import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 13 ELEMENTOS REAIS DO PEOTRAM 2024 - PETROBRAS
const PEOTRAM_13_ELEMENTS: Record<number, { name: string; sigla: string; critical: boolean; weight: number }> = {
  1: { name: "Liderança, Gerenciamento e Responsabilidade", sigla: "LGR", critical: false, weight: 8.5 },
  2: { name: "Conformidade Legal", sigla: "CL", critical: false, weight: 7.5 },
  3: { name: "Avaliação e Gestão de Riscos", sigla: "AGR", critical: false, weight: 9.0 },
  4: { name: "Informação, Documentação e Controle de Registros", sigla: "IDC", critical: true, weight: 6.5 },
  5: { name: "Pessoal, Capacitação e Competência", sigla: "PCC", critical: false, weight: 8.0 },
  6: { name: "Integridade Mecânica e Garantia de Qualidade", sigla: "IMG", critical: true, weight: 9.5 },
  7: { name: "Gestão de Contratadas", sigla: "GC", critical: false, weight: 6.0 },
  8: { name: "Gestão de Operações", sigla: "GO", critical: false, weight: 8.5 },
  9: { name: "Gestão de Mudanças", sigla: "GM", critical: false, weight: 5.5 },
  10: { name: "Tratamento de Anomalias", sigla: "TA", critical: false, weight: 7.0 },
  11: { name: "Preparação e Resposta a Emergências", sigla: "PRE", critical: true, weight: 8.5 },
  12: { name: "Comunicação e Consulta", sigla: "CC", critical: true, weight: 6.0 },
  13: { name: "Auditoria, Análise Crítica e Melhoria Contínua", sigla: "AAM", critical: false, weight: 9.0 }
};

function extractTitle(content: string): string {
  const match = content.match(/(?:título|title|não[- ]conformidade)[:\s]*([^\n]+)/i);
  return match ? match[1].trim() : "Não-Conformidade Identificada";
}

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
      item_number, 
      item_description, 
      element_number, 
      element_name,
      non_conformity_reason,
      norm_reference,
      vessel_name,
      audit_date,
      auditor_name,
      nc_classification,
      score
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const elementInfo = PEOTRAM_13_ELEMENTS[element_number] || { 
      name: element_name, 
      sigla: "N/A", 
      critical: false, 
      weight: 0 
    };
    
    const isCritical = elementInfo.critical || [4, 6, 11, 12].includes(element_number);

    const systemPrompt = `Você é um auditor PEOTRAM experiente da Petrobras, especializado em gerar evidências técnicas detalhadas para não-conformidades no ciclo 2024.

O PEOTRAM 2024 possui 13 ELEMENTOS. Os elementos CRÍTICOS são: 4, 6, 11 e 12.

CLASSIFICAÇÃO DE NÃO-CONFORMIDADES:
- A: Crítica - Risco iminente à segurança (prazo: imediato)
- B: Grave - Pode comprometer a operação (prazo: 15 dias)
- C: Moderada - Requer atenção (prazo: 30 dias)
- D: Leve - NC menor (prazo: 60 dias)

CRITÉRIOS DE PONTUAÇÃO:
- 0 = Não Evidenciado (0%)
- 1 = Falhas Sistemáticas (20%)
- 2 = Falhas Pontuais (50%)
- 3 = Sem Falhas (90%)
- 4 = Excelência (100%)

Para cada não-conformidade, você deve gerar:

1. **TÍTULO**: Descrição clara e objetiva da não-conformidade (máx 100 caracteres)

2. **ANÁLISE TÉCNICA**: Explicação detalhada incluindo:
   - O que foi identificado
   - Por que caracteriza não-conformidade
   - Impacto no elemento do PEOTRAM

3. **REFERÊNCIA NORMATIVA**: Citação específica da norma/procedimento violado:
   - ISM Code (seção específica)
   - SOLAS (capítulo/regra)
   - MARPOL (anexo/regra)
   - STCW (seção)
   - NR-34/NR-37
   - Procedimentos internos Petrobras

4. **RISCO IDENTIFICADO**: Análise de impacto:
   - Risco à segurança (pessoas, ativos, meio ambiente)
   - Risco operacional
   - Risco regulatório/compliance
   - Classificação de severidade

5. **RECOMENDAÇÕES**: Orientações gerais para correção

6. **PLANO DE AÇÃO CORRETIVA**: Passos específicos:
   - Ação imediata (se aplicável)
   - Ações de curto prazo
   - Ações de médio prazo
   - Responsáveis sugeridos
   - Prazo recomendado baseado na classificação

${isCritical ? `
⚠️ ATENÇÃO: ELEMENTO CRÍTICO ${element_number}
Este elemento tem maior peso na auditoria (${elementInfo.weight}%) e requer:
- Análise mais detalhada
- Identificação de riscos ampliada
- Prazos mais curtos para correção
- Acompanhamento prioritário
` : ''}

Gere o documento em formato estruturado e profissional, adequado para apresentação à Petrobras e órgãos reguladores.`;

    const userPrompt = `Gere evidência técnica de não-conformidade para:

═══════════════════════════════════════════
AUDITORIA PEOTRAM 2024 - PETROBRAS
═══════════════════════════════════════════

📋 DADOS DA AUDITORIA:
• Embarcação: ${vessel_name || 'Não informado'}
• Data: ${audit_date || new Date().toISOString().split('T')[0]}
• Auditor: ${auditor_name || 'N/A'}

📊 ELEMENTO ${element_number}: ${elementInfo.name} (${elementInfo.sigla})
• Peso: ${elementInfo.weight}%
• Status: ${isCritical ? '⭐ ELEMENTO CRÍTICO' : 'Normal'}

📝 ITEM AVALIADO:
• Número: ${item_number}
• Descrição: ${item_description}
• Pontuação: ${score !== undefined ? score : 'N/A'}
• Classificação NC: ${nc_classification || 'A definir'}

🔴 MOTIVO DA NÃO-CONFORMIDADE:
${non_conformity_reason}

📚 REFERÊNCIA NORMATIVA BASE:
${norm_reference || 'Procedimento operacional padrão PEOTRAM'}

═══════════════════════════════════════════

Gere a evidência completa e estruturada conforme as instruções.`;

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
      evidence_id: `EV-${element_number}-${Date.now()}`,
      element_number,
      element_name: elementInfo.name,
      element_sigla: elementInfo.sigla,
      element_weight: elementInfo.weight,
      is_critical: isCritical,
      item_number,
      item_description,
      nc_classification: nc_classification || 'C',
      score,
      title: extractTitle(evidenceContent),
      technical_analysis: extractSection(evidenceContent, "análise técnica"),
      norm_reference: extractSection(evidenceContent, "referência normativa") || norm_reference,
      risk_identified: extractSection(evidenceContent, "risco"),
      recommendations: extractSection(evidenceContent, "recomendações"),
      corrective_action_plan: extractSection(evidenceContent, "plano de ação"),
      full_content: evidenceContent,
      generated_by_ai: true,
      ai_confidence: 0.92,
      generated_at: new Date().toISOString(),
      vessel_name,
      audit_date,
      auditor_name,
      peotram_version: "2024",
      total_elements: 13
    };

    console.log(`PEOTRAM 2024 evidence generated - Element ${element_number}/${elementInfo.sigla}, Item ${item_number}`);

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
