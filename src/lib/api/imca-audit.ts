/**
 * IMCA Audit Generation API
 * Generates technical IMCA audit reports using OpenAI
 */

import OpenAI from "openai";

interface IMCAAuditInput {
  nomeNavio: string;
  contexto: string;
}

interface IMCAAuditOutput {
  output: string;
}

/**
 * Generate IMCA technical audit report
 * @param input - Ship name and operational context
 * @returns Generated audit report
 */
export async function generateIMCAAudit(input: IMCAAuditInput): Promise<IMCAAuditOutput> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const prompt = `Você é um auditor técnico especializado em normas IMCA (International Marine Contractors Association) para sistemas de posicionamento dinâmico (DP).

Navio: ${input.nomeNavio}

Contexto da Operação:
${input.contexto}

Gere um relatório de auditoria técnica IMCA completo e detalhado, incluindo:

1. RESUMO EXECUTIVO
   - Visão geral da operação
   - Principais achados

2. ANÁLISE TÉCNICA
   - Avaliação do sistema DP
   - Estado dos sensores e equipamentos
   - Conformidade com normas IMCA

3. FALHAS E INCIDENTES IDENTIFICADOS
   - Descrição detalhada de cada falha
   - Classificação de severidade
   - Impacto na operação

4. RECOMENDAÇÕES
   - Ações corretivas imediatas
   - Melhorias preventivas
   - Conformidade regulatória

5. CONCLUSÃO
   - Avaliação geral
   - Status de certificação

O relatório deve ser técnico, objetivo e seguir rigorosamente os padrões IMCA.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um auditor técnico especializado em normas IMCA para sistemas de posicionamento dinâmico marítimo. Seus relatórios são precisos, técnicos e seguem rigorosamente os padrões internacionais."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const output = response.choices[0]?.message?.content || "Erro ao gerar relatório.";

    return { output };
  } catch (error) {
    console.error("Error generating IMCA audit:", error);
    throw new Error("Falha ao gerar relatório de auditoria IMCA. Verifique sua chave de API.");
  }
}
