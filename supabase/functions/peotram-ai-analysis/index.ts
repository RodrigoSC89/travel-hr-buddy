import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface PeotramAnalysisRequest {
  audit_id: string;
  element_code: string;
  requirements_data: Array<{
    code: string;
    description: string;
    score_classification: string;
    criticality_level: string;
    auditor_comments?: string;
    evidence_provided?: string;
  }>;
}

interface PeotramRecommendation {
  requirement_code: string;
  priority: "alta" | "media" | "baixa";
  recommendation: string;
  compliance_gap: string;
  action_plan: string[];
  timeline: string;
  resources_needed: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audit_id, element_code, requirements_data }: PeotramAnalysisRequest = await req.json();

    console.log(`Starting PEOTRAM AI analysis for audit ${audit_id}, element ${element_code}`);

    // Construir prompt específico para PEOTRAM baseado no elemento
    const elementPrompts = {
      "ELEMENT_01": "Sistema de Gestão - Analise a eficácia do sistema de gestão empresarial, incluindo políticas, procedimentos, estrutura organizacional e controles internos.",
      "ELEMENT_02": "Conformidade Legal - Avalie o atendimento às normas regulamentadoras (NRs), convenções internacionais (STCW, ISM) e legislação marítima aplicável.",
      "ELEMENT_03": "Gestão de Riscos - Examine os processos de identificação, avaliação, controle e monitoramento de riscos operacionais e ocupacionais.",
      "ELEMENT_04": "Operação - Analise procedimentos operacionais, operações críticas, controles de processo e supervisão operacional.",
      "ELEMENT_05": "Controle Operacional - Avalie sistemas de controle, procedimentos de trabalho seguro e medidas de controle implementadas.",
      "ELEMENT_06": "Manutenção - Examine gestão da manutenção preventiva, corretiva, preditiva e controle de equipamentos críticos.",
      "ELEMENT_07": "Gestão de Mudanças - Analise processos de gestão de mudanças organizacionais, técnicas e procedimentais.",
      "ELEMENT_08": "Gestão de Fornecedores - Avalie qualificação, seleção, avaliação e gestão de prestadores de serviços.",
      "ELEMENT_09": "Gestão de Recursos Humanos - Examine recrutamento, seleção, treinamento, competências e gestão de pessoal.",
      "ELEMENT_10": "Gestão da Informação & Comunicação - Analise controle de documentos, registros, comunicação e gestão do conhecimento.",
      "ELEMENT_11": "Preparação e Respostas à Emergências - Avalie planos de contingência, resposta a emergências e exercícios simulados.",
      "ELEMENT_12": "Investigação de Acidentes e Incidentes - Examine processos de investigação, análise de causas e implementação de medidas corretivas.",
      "ELEMENT_13": "Auditoria Interna e Análise Crítica - Analise sistema de auditoria interna, análise crítica da direção e melhoria contínua."
    };

    const prompt = `
Você é um especialista em auditoria PEOTRAM (Programa de Excelência Operacional em Transporte Aquaviário de Produtos Perigosos) da Petrobras.

CONTEXTO:
- Elemento: ${element_code}
- Foco: ${elementPrompts[element_code as keyof typeof elementPrompts] || "Análise geral do elemento"}

DADOS DA AVALIAÇÃO:
${requirements_data.map(req => `
Requisito ${req.code}:
- Descrição: ${req.description}
- Classificação: ${req.score_classification} (escala: N/A, 0-4)
- Criticidade: ${req.criticality_level} (níveis: N/A, A-D, ✓, ✓✓)
- Comentários: ${req.auditor_comments || "Não informado"}
- Evidências: ${req.evidence_provided || "Não fornecidas"}
`).join("\n")}

TAREFA:
Analise os dados e gere recomendações específicas seguindo os critérios PEOTRAM:

1. Para cada requisito com score < 3 ou criticidade A/B, identifique:
   - Gap de conformidade específico
   - Recomendação técnica detalhada
   - Plano de ação estruturado
   - Cronograma realista
   - Recursos necessários

2. Priorize as recomendações baseado em:
   - Criticidade (A > B > C > D)
   - Impacto na segurança operacional
   - Complexidade de implementação
   - Custo-benefício

3. Considere as melhores práticas da indústria marítima e regulamentações aplicáveis.

Responda em formato JSON com este schema exato:
{
  "overall_score": number (0-100),
  "compliance_level": "excelente" | "bom" | "adequado" | "deficiente" | "crítico",
  "critical_findings": string[],
  "recommendations": [
    {
      "requirement_code": string,
      "priority": "alta" | "media" | "baixa",
      "recommendation": string,
      "compliance_gap": string,
      "action_plan": string[],
      "timeline": string,
      "resources_needed": string[]
    }
  ],
  "improvement_opportunities": string[],
  "regulatory_alerts": string[],
  "next_steps": string[]
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um auditor sênior especialista em PEOTRAM da Petrobras com 20 anos de experiência em segurança marítima e operações com produtos perigosos."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    console.log("AI analysis completed successfully");

    // Salvar análise no banco
    const { error: saveError } = await supabase
      .from("checklist_ai_analysis")
      .insert({
        checklist_id: audit_id,
        analysis_type: `PEOTRAM_${element_code}`,
        overall_score: analysis.overall_score,
        analysis_data: analysis,
        recommendations: analysis.recommendations.map((r: PeotramRecommendation) => r.recommendation),
        critical_issues: analysis.critical_findings?.length || 0,
        issues_found: analysis.recommendations?.length || 0,
        confidence_level: 0.85,
        created_by_ai_model: "gpt-4o"
      });

    if (saveError) {
      console.error("Error saving analysis:", saveError);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis,
      message: "Análise PEOTRAM concluída com sucesso"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in PEOTRAM AI analysis:", error);
    return new Response(JSON.stringify({ 
      error: "Erro na análise IA",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});