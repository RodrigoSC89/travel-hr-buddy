import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "@/lib/openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nomeNavio, contexto } = req.body;

  if (!nomeNavio || !contexto) {
    return res.status(400).json({ error: "Nome do navio e contexto são obrigatórios" });
  }

  try {
    const prompt = `
Você é um auditor técnico especializado em sistemas de posicionamento dinâmico (DP) marítimos, com profundo conhecimento das normas IMCA (International Marine Contractors Association).

Gere um relatório de auditoria técnica IMCA completo e detalhado para o navio "${nomeNavio}", baseado no seguinte contexto operacional:

${contexto}

O relatório deve incluir as seguintes seções detalhadas:

1. SUMÁRIO EXECUTIVO
   - Visão geral da auditoria
   - Principais conclusões
   - Recomendações críticas

2. ANÁLISE TÉCNICA DETALHADA
   - Sistema DP (classe, configuração, redundância)
   - Sensores e sistemas de referência de posição
   - Análise de redundância e sistemas de backup
   - Sistema de propulsão e thruster allocation
   - Sistema de energia e geradores
   - UPS e sistemas de alimentação ininterrupta

3. CONFORMIDADE COM NORMAS IMCA
   - IMCA M 103: DP Vessel Design Philosophy Guidelines
   - IMCA M 140: Specification for DP Capability Plots
   - IMCA M 182: International Guidelines for the Safe Operation of Dynamically Positioned Offshore Supply Vessels
   - Outras normas aplicáveis

4. ANÁLISE DE RISCOS E MODO DE FALHAS
   - Identificação de pontos únicos de falha
   - Análise FMEA (Failure Mode and Effects Analysis)
   - Avaliação de worst case failure
   - Análise de consequências operacionais

5. SISTEMAS DE SEGURANÇA
   - Alarmes e sistemas de alerta
   - Procedimentos de contingência
   - Sistema de gerenciamento de DP
   - Documentação e registros

6. OPERAÇÕES E TRIPULAÇÃO
   - Qualificações da tripulação DP
   - Procedimentos operacionais
   - Treinamentos e competências
   - ASOG (Annual Station Keeping Trial) e trials periódicos

7. RECOMENDAÇÕES
   - Melhorias necessárias
   - Ações corretivas imediatas
   - Plano de manutenção preventiva
   - Sugestões de upgrade de sistemas

8. CONCLUSÕES
   - Classificação do nível de conformidade
   - Aptidão para operações DP
   - Observações finais

Formato: Texto profissional em português, com estrutura clara e numeração de seções. Use linguagem técnica apropriada para auditoria marítima.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um auditor técnico especializado em sistemas DP marítimos e normas IMCA. Gere relatórios técnicos detalhados, profissionais e precisos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const output = response.choices[0]?.message?.content || "Erro ao gerar relatório";

    return res.status(200).json({ output });
  } catch (error) {
    console.error("Error generating audit report:", error);
    return res.status(500).json({ 
      error: "Erro ao gerar relatório de auditoria",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
