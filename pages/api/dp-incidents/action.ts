import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""
);

const openai = new OpenAI({ 
  apiKey: process.env.VITE_OPENAI_API_KEY || ""
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Incident ID is required" });
    }

    // Fetch incident from database
    const { data: incident, error } = await supabase
      .from("dp_incidents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !incident) {
      console.error("Error fetching incident:", error);
      return res.status(404).json({ error: "Incidente não encontrado" });
    }

    // Build prompt for GPT-4
    const prompt = `
Você é um especialista em posicionamento dinâmico (DP) e auditoria marítima baseado nas normas IMCA.
Analise o seguinte incidente:

Título: ${incident.title}
Navio: ${incident.vessel || "Não especificado"}
Data: ${incident.incident_date || incident.date || "Não especificada"}
Descrição: ${incident.description || incident.summary || "Não especificada"}
Severidade: ${incident.severity || "Não especificada"}
Causa Raiz: ${incident.root_cause || "Não identificada"}
Local: ${incident.location || "Não especificado"}
Classe DP: ${incident.class_dp || "Não especificada"}

Com base nas normas IMCA M103, M117, M190, M166 e diretrizes da IMO, elabore um plano de ação técnico contendo:

1. Diagnóstico técnico resumido
2. Causa raiz provável
3. Ações corretivas e preventivas (bullet points)
4. Responsável sugerido (departamento ou papel)
5. Prazo sugerido
6. Normas relevantes associadas

Formato: JSON estruturado com as seguintes chaves:
{
  "diagnostico": "string",
  "causa_raiz": "string",
  "acoes_corretivas": ["string", "string", ...],
  "acoes_preventivas": ["string", "string", ...],
  "responsavel": "string",
  "prazo": "string",
  "normas": ["string", "string", ...]
}

Forneça APENAS o JSON, sem texto adicional antes ou depois.
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um especialista sênior em Dynamic Positioning (DP) e auditoria marítima com 25 anos de experiência. Forneça análises técnicas precisas e recomendações baseadas em normas IMCA e IMO."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const result = completion.choices[0].message.content;

    if (!result) {
      return res.status(500).json({ error: "Erro ao gerar plano de ação" });
    }

    // Parse JSON from GPT-4 response
    let planOfAction;
    try {
      // Try to extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planOfAction = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create a structured object from the text
        planOfAction = {
          diagnostico: result,
          causa_raiz: "Ver diagnóstico",
          acoes_corretivas: [],
          acoes_preventivas: [],
          responsavel: "A definir",
          prazo: "A definir",
          normas: []
        };
      }
    } catch (parseError) {
      console.error("Error parsing GPT-4 response:", parseError);
      // Store raw response if parsing fails
      planOfAction = {
        diagnostico: result,
        causa_raiz: "Ver diagnóstico",
        acoes_corretivas: [],
        acoes_preventivas: [],
        responsavel: "A definir",
        prazo: "A definir",
        normas: []
      };
    }

    // Update incident with plan of action
    const { error: updateError } = await supabase
      .from("dp_incidents")
      .update({ 
        plan_of_action: planOfAction,
        status: "analyzed"
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating incident:", updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({ 
      ok: true, 
      plan_of_action: planOfAction 
    });

  } catch (error) {
    console.error("Error in action plan generation:", error);
    return res.status(500).json({ 
      error: "Erro ao gerar plano de ação",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
