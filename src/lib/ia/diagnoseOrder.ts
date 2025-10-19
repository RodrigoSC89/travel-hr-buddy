/**
 * AI Diagnostic Service for Orders
 * Uses GPT-4 to diagnose technical issues
 */

import { openai } from "@/lib/openai";

export interface OrderDiagnosticInput {
  system_name: string;
  description: string;
  technician_comment?: string;
}

export interface OrderDiagnosticResult {
  success: boolean;
  diagnosis?: string;
  error?: string;
}

/**
 * Diagnose order using AI
 * @param order - Order information for diagnostic
 * @returns OrderDiagnosticResult with diagnosis or error
 */
export async function diagnoseOrder(
  order: OrderDiagnosticInput
): Promise<OrderDiagnosticResult> {
  try {
    const prompt = `
Você é um engenheiro de manutenção offshore.

Analise a seguinte ordem de serviço para diagnóstico técnico.

Sistema: ${order.system_name}
Descrição: ${order.description}
Comentário Técnico: ${order.technician_comment || "N/A"}

Responda com:
- Causa provável
- Ação sugerida
- Risco se não for resolvido
- Peças/áreas afetadas
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const diagnosis = response.choices[0].message.content;

    if (!diagnosis) {
      return {
        success: false,
        error: "No diagnosis returned from AI",
      };
    }

    console.log("✅ Diagnóstico gerado com sucesso");
    return {
      success: true,
      diagnosis,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("❌ Erro ao gerar diagnóstico:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
