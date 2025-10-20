import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, descricao, title, root_cause } = req.body;

    if (!id || !descricao) {
      return res.status(400).json({ error: "Missing required fields: id, descricao" });
    }

    const supabase = createClient();

    // Build the analysis prompt
    const prompt = `
Você é um auditor técnico da IMCA especializado em Dynamic Positioning.
Analise este incidente de DP (Dynamic Positioning):

Título: ${title || "Não especificado"}
Descrição: "${descricao}"
Causa Raiz: ${root_cause || "Não especificada"}

Forneça uma análise estruturada no seguinte formato JSON:
{
  "causa_provavel": "Explique a causa provável do incidente de forma clara e técnica",
  "prevencao": "Liste as medidas preventivas que poderiam ter evitado este incidente",
  "impacto_operacional": "Descreva o impacto operacional deste tipo de incidente"
}

Importante: Responda APENAS com o JSON válido, sem texto adicional antes ou depois.
`;

    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!openaiApiKey) {
      // If no API key, return a mock response for testing
      console.warn("OpenAI API key not configured, using mock response");
      const mockAnalysis = {
        causa_provavel: `Análise automática da causa: ${root_cause || "Causa não especificada"}. Este incidente requer investigação detalhada dos sistemas de posicionamento dinâmico.`,
        prevencao: "Implementar monitoramento contínuo dos sistemas críticos, realizar manutenção preventiva regular, treinar a equipe em procedimentos de emergência.",
        impacto_operacional: "Pode resultar em perda de posicionamento, interrupção das operações, potencial risco à segurança da embarcação e aumento dos custos operacionais."
      };

      const { error: updateError } = await supabase
        .from("dp_incidents")
        .update({ 
          gpt_analysis: mockAnalysis,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating incident:", updateError);
        return res.status(500).json({ error: "Error saving analysis" });
      }

      return res.status(200).json({ success: true, content: mockAnalysis });
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Você é um especialista da IMCA em Dynamic Positioning. Sempre responda com JSON válido." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return res.status(response.status).json({ 
        error: "OpenAI API error",
        details: errorData 
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: "No content in OpenAI response" });
    }

    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      // If parsing fails, create a structured response from the text
      analysis = {
        analise: content,
        causa_provavel: "Ver análise completa acima",
        prevencao: "Ver análise completa acima",
        impacto_operacional: "Ver análise completa acima"
      };
    }

    // Save the analysis to the database
    const { error: updateError } = await supabase
      .from("dp_incidents")
      .update({ 
        gpt_analysis: analysis,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (updateError) {
      console.error("Error updating incident:", updateError);
      return res.status(500).json({ error: "Error saving analysis" });
    }

    return res.status(200).json({ success: true, content: analysis });
  } catch (error) {
    console.error("Error in /api/dp/explain:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
