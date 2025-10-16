/**
 * IMCA Audit API Service
 * Generates detailed technical audit reports based on IMCA standards
 */

export interface IMCAAuditInput {
  nomeNavio: string;
  contexto: string;
}

export interface IMCAAuditResult {
  output: string;
  success: boolean;
  error?: string;
}

/**
 * Generate IMCA technical audit report using OpenAI GPT-4
 */
export async function generateIMCAAudit({ nomeNavio, contexto }: IMCAAuditInput): Promise<IMCAAuditResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      output: "",
      error: "OpenAI API key not configured. Please set VITE_OPENAI_API_KEY environment variable.",
    };
  }

  const prompt = `Você é um auditor técnico altamente qualificado em sistemas de posicionamento dinâmico (DP), com profunda familiaridade nas normas internacionais da IMCA, IMO e MTS.

Seu objetivo é gerar uma auditoria técnica detalhada para o navio ${nomeNavio}, com base no seguinte contexto operacional:
"""
${contexto}
"""

Use as seguintes normas:

- IMCA M103 (projeto e operação DP)
- IMCA M117 (qualificação de pessoal DP)
- IMCA M190 (ensaios anuais)
- IMCA M166 (FMEA)
- IMCA M109 (documentação)
- IMCA M220 (planejamento de operações)
- IMCA M140 (gráficos de capacidade)
- MSF 182 (operação segura de OSVs com DP)
- Diretrizes MTS e IMO MSC.1/Circ.1580

Avalie sistemas, sensores, rede, pessoal, documentos, registros, falhas, mitigação e proponha plano de ação com níveis de risco e prazos recomendados.

Estruture o relatório em seções claras:
1. Resumo Executivo
2. Avaliação de Sistemas e Sensores
3. Conformidade com Normas IMCA
4. Análise de Pessoal e Qualificações
5. Análise de Documentação
6. Falhas Identificadas e Mitigações
7. Plano de Ação com Prioridades e Prazos`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é um auditor técnico especializado em sistemas de posicionamento dinâmico (DP) e normas IMCA.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const auditReport = data.choices?.[0]?.message?.content || "";

    if (!auditReport) {
      throw new Error("No audit report generated from API");
    }

    return {
      success: true,
      output: auditReport,
    };
  } catch (error) {
    console.error("Error generating IMCA audit:", error);
    return {
      success: false,
      output: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
