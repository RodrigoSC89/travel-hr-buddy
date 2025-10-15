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

interface Incident {
  id?: string;
  title: string;
  description?: string;
  summary?: string;
  type?: string;
  severity?: string;
  status?: string;
  location?: string;
  reportedBy?: string;
  reportedAt?: string;
  rootCause?: string;
  correctiveActions?: string[];
  preventiveActions?: string[];
  impact?: {
    personnel?: number;
    environment?: string;
    operations?: string;
    financial?: number;
  };
  witnesses?: string[];
  attachments?: string[];
}

interface AnalysisRequest {
  incident: Incident;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { incident }: AnalysisRequest = await req.json();

    console.log(`Starting AI incident analysis for: ${incident.title}`);

    // Construct detailed prompt for GPT-4
    const prompt = `
Você é um especialista em análise de incidentes de segurança marítima e operacional com foco em prevenção e conformidade regulatória.

CONTEXTO DO INCIDENTE:
- Título: ${incident.title}
- Descrição: ${incident.description || incident.summary || "Não informado"}
- Tipo: ${incident.type || "Não especificado"}
- Severidade: ${incident.severity || "Não especificado"}
- Status: ${incident.status || "Não especificado"}
- Local: ${incident.location || "Não especificado"}
- Reportado por: ${incident.reportedBy || "Não especificado"}
- Data: ${incident.reportedAt || "Não especificado"}
- Causa raiz identificada: ${incident.rootCause || "Em investigação"}
${incident.correctiveActions && incident.correctiveActions.length > 0 ? `- Ações corretivas já tomadas:\n  ${incident.correctiveActions.join('\n  ')}` : ""}
${incident.preventiveActions && incident.preventiveActions.length > 0 ? `- Ações preventivas propostas:\n  ${incident.preventiveActions.join('\n  ')}` : ""}
${incident.impact ? `- Impacto:
  • Pessoal: ${incident.impact.personnel || 0} pessoas afetadas
  • Meio Ambiente: ${incident.impact.environment || "nenhum"}
  • Operações: ${incident.impact.operations || "nenhum"}
  • Financeiro: R$ ${incident.impact.financial || 0}` : ""}
${incident.witnesses && incident.witnesses.length > 0 ? `- Testemunhas: ${incident.witnesses.join(", ")}` : ""}

TAREFA:
Analise este incidente e forneça uma resposta estruturada com:

1. ANÁLISE TÉCNICA: Avalie o incidente considerando as melhores práticas da indústria marítima, normas regulamentadoras (NRs relevantes), convenções internacionais (ISM, STCW, MARPOL) e procedimentos de segurança.

2. CAUSA RAIZ PROVÁVEL: Se a causa raiz não foi identificada ou está incompleta, sugira possíveis causas baseadas nas informações fornecidas, utilizando metodologias como 5 Porquês ou Diagrama de Ishikawa.

3. NORMAS RELACIONADAS: Identifique normas brasileiras (NRs), convenções internacionais e regulamentações da Marinha do Brasil que se aplicam a este tipo de incidente.

4. AÇÃO SUGERIDA: Recomende ações corretivas imediatas e preventivas de longo prazo, priorizando:
   - Segurança das pessoas
   - Proteção ambiental
   - Continuidade operacional
   - Conformidade regulatória

5. RISCOS ADICIONAIS: Identifique riscos residuais ou potenciais que possam surgir se as ações não forem tomadas adequadamente.

6. PLANO DE IMPLEMENTAÇÃO: Sugira um cronograma e responsabilidades para implementação das ações recomendadas.

Forneça a resposta em português brasileiro, de forma clara, objetiva e técnica.
`;

    // Call OpenAI API
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
            content: "Você é um especialista sênior em segurança marítima, investigação de incidentes e conformidade regulatória com 25 anos de experiência em operações aquaviárias e gestão de riscos. Seu objetivo é fornecer análises técnicas detalhadas e recomendações práticas para prevenção de incidentes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log("AI incident analysis completed successfully");

    // Optionally save analysis to database
    // You can store the analysis in a dedicated table for audit purposes
    try {
      const { error: saveError } = await supabase
        .from("incident_analysis")
        .insert({
          incident_id: incident.id || null,
          incident_title: incident.title,
          analysis_result: analysis,
          analysis_model: "gpt-4o",
          created_at: new Date().toISOString()
        });

      if (saveError) {
        console.warn("Could not save analysis to database:", saveError);
        // Don't fail the request if saving fails
      }
    } catch (dbError) {
      console.warn("Database save attempt failed:", dbError);
      // Continue anyway
    }

    return new Response(JSON.stringify({
      success: true,
      result: analysis,
      message: "Análise de incidente concluída com sucesso"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in incident AI analysis:", error);
    return new Response(JSON.stringify({ 
      error: "Erro na análise do incidente",
      details: error instanceof Error ? error.message : "Erro desconhecido",
      result: "Não foi possível completar a análise neste momento. Por favor, tente novamente mais tarde."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
