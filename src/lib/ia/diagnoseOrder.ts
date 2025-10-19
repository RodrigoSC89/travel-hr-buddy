/**
 * AI Diagnostics Service for MMI Orders
 * Uses GPT-4 to analyze work orders and provide technical insights
 */

interface DiagnoseOrderParams {
  system_name: string;
  description: string;
  technician_comment?: string;
}

interface DiagnosisResult {
  probable_cause: string;
  recommended_action: string;
  risk_if_unresolved: string;
  affected_parts: string;
}

/**
 * Diagnose a work order using AI
 * @param order - Order details to analyze
 * @returns AI-generated diagnosis
 */
export async function diagnoseOrder(
  order: DiagnoseOrderParams
): Promise<{ success: boolean; diagnosis?: DiagnosisResult; error?: string }> {
  try {
    // Validate OpenAI API key
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("VITE_OPENAI_API_KEY is not configured");
      return {
        success: false,
        error: "AI service not configured",
      };
    }

    // Construct diagnostic prompt
    const prompt = `
Você é um engenheiro de manutenção offshore experiente.

Analise a seguinte ordem de serviço para diagnóstico técnico.

**Sistema:** ${order.system_name}
**Descrição:** ${order.description}
**Comentário Técnico:** ${order.technician_comment || "N/A"}

Responda no seguinte formato JSON:
{
  "probable_cause": "Causa provável do problema",
  "recommended_action": "Ação corretiva recomendada",
  "risk_if_unresolved": "Risco se não for resolvido",
  "affected_parts": "Peças/áreas afetadas"
}

Seja específico, técnico e prático. Todas as respostas devem ser em português do Brasil.
    `.trim();

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "Você é um especialista em engenharia de manutenção offshore com foco em diagnóstico de problemas técnicos.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return {
        success: false,
        error: errorData.error?.message || "Failed to get AI diagnosis",
      };
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "No diagnosis received from AI",
      };
    }

    // Parse JSON response
    try {
      const diagnosis: DiagnosisResult = JSON.parse(content);
      
      return {
        success: true,
        diagnosis,
      };
    } catch (parseError) {
      // If JSON parsing fails, extract information from text
      console.warn("Failed to parse AI response as JSON, extracting text");
      
      return {
        success: true,
        diagnosis: {
          probable_cause: extractSection(content, "causa provável") || "Não identificado",
          recommended_action: extractSection(content, "ação") || "Consultar engenheiro",
          risk_if_unresolved: extractSection(content, "risco") || "Risco não especificado",
          affected_parts: extractSection(content, "peças|áreas") || "A determinar",
        },
      };
    }
  } catch (error) {
    console.error("Error in diagnoseOrder:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extract a section from text based on keyword
 */
function extractSection(text: string, keyword: string): string | null {
  const regex = new RegExp(`${keyword}[:\\s]*([^\\n]+)`, "i");
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Generate a formatted diagnosis report
 */
export function formatDiagnosisReport(diagnosis: DiagnosisResult): string {
  return `
## Diagnóstico Técnico

**Causa Provável:**
${diagnosis.probable_cause}

**Ação Recomendada:**
${diagnosis.recommended_action}

**Risco se Não Resolvido:**
${diagnosis.risk_if_unresolved}

**Peças/Áreas Afetadas:**
${diagnosis.affected_parts}
  `.trim();
}
