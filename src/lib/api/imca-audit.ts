/**
 * IMCA Audit API
 * Generates AI-powered technical audit reports for maritime DP systems
 * following IMCA (International Marine Contractors Association) standards
 */

import OpenAI from "openai";

/**
 * Input parameters for IMCA audit generation
 */
export interface IMCAAuditInput {
  nomeNavio: string;
  contexto: string;
}

/**
 * Output structure for IMCA audit report
 */
export interface IMCAAuditOutput {
  output: string;
}

/**
 * Generate comprehensive IMCA technical audit report
 * @param input - Audit input parameters (ship name and operational context)
 * @returns Generated audit report
 */
export async function generateIMCAAudit(
  input: IMCAAuditInput
): Promise<IMCAAuditOutput> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey || apiKey === "your_openai_api_key_here") {
    throw new Error(
      "Chave da API OpenAI não configurada. Configure VITE_OPENAI_API_KEY no arquivo .env"
    );
  }

  if (!input.nomeNavio || !input.contexto) {
    throw new Error("Nome do navio e contexto operacional são obrigatórios");
  }

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const prompt = `Você é um auditor técnico marítimo especializado em sistemas Dynamic Positioning (DP) seguindo padrões IMCA (International Marine Contractors Association).

Gere um relatório de auditoria técnica IMCA completo e detalhado para o navio "${input.nomeNavio}".

Contexto Operacional:
${input.contexto}

O relatório deve incluir as seguintes seções em português brasileiro:

1. RESUMO EXECUTIVO
   - Visão geral da operação
   - Principais descobertas
   - Status de conformidade IMCA

2. ANÁLISE TÉCNICA
   - Sistema DP e componentes
   - Análise de sensores e redundância
   - Conformidade com padrões IMCA (IMCA M 103, IMCA M 140, etc.)

3. FALHAS E INCIDENTES IDENTIFICADOS
   - Descrição detalhada de cada falha
   - Classificação de severidade (Crítica/Alta/Média/Baixa)
   - Impacto na operação DP

4. RECOMENDAÇÕES
   - Ações corretivas imediatas
   - Melhorias preventivas
   - Plano de manutenção

5. CONCLUSÃO
   - Avaliação geral do sistema DP
   - Status de certificação
   - Próximos passos

O relatório deve ser técnico, profissional e seguir a terminologia IMCA padrão.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um auditor técnico marítimo especializado em sistemas Dynamic Positioning seguindo padrões IMCA.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const generatedReport = response.choices[0]?.message?.content;

    if (!generatedReport) {
      throw new Error("Falha ao gerar relatório de auditoria");
    }

    return {
      output: generatedReport,
    };
  } catch (error) {
    console.error("Erro ao gerar auditoria IMCA:", error);
    
    if (error instanceof Error) {
      throw new Error(`Erro ao gerar auditoria: ${error.message}`);
    }
    
    throw new Error("Erro desconhecido ao gerar auditoria IMCA");
  }
}
