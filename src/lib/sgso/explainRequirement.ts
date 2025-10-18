/**
 * SGSO Requirement Explanation with AI
 * Provides detailed explanations of SGSO requirements using GPT-4
 */

import { openai } from "@/lib/openai";

/**
 * Explains a SGSO requirement using AI
 * @param requirement - The requirement title to explain
 * @param compliance - Current compliance status (compliant, partial, non-compliant)
 * @returns Detailed explanation of the requirement
 */
export async function explainRequirementSGSO(
  requirement: string,
  compliance: string
): Promise<string | null> {
  // Check if API key is available
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const hasValidKey = apiKey && apiKey !== "your_openai_api_key_here" && apiKey !== "";

  // Mock mode when API key is not available
  if (!hasValidKey) {
    console.log("🔄 Using mock mode for SGSO Explanation (API key not configured)");
    return generateMockExplanation(requirement, compliance);
  }

  const prompt = `
Você é um auditor ambiental especializado em SGSO (Sistema de Gestão da Segurança Operacional) exigido pelo IBAMA.
Explique de forma clara o seguinte requisito:

"${requirement}"

Status atual do requisito: ${compliance}

Inclua:
1. O que o requisito exige
2. Por que é importante
3. Riscos do não cumprimento
4. Recomendações para estar em conformidade

Responda de forma técnica e direta.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    return response.choices[0]?.message.content || null;
  } catch (error) {
    console.error("Error explaining SGSO requirement:", error);
    return null;
  }
}

/**
 * Generate mock explanation for development and testing
 */
function generateMockExplanation(requirement: string, compliance: string): string {
  const complianceText = 
    compliance === "compliant" ? "Conforme" :
      compliance === "partial" ? "Parcialmente conforme" :
        "Não conforme";

  const explanations: Record<string, string> = {
    "Política de SMS": `
📋 O QUE O REQUISITO EXIGE:
A embarcação deve possuir uma Política de Segurança, Meio Ambiente e Saúde (SMS) documentada, assinada pela alta direção, comunicada a toda tripulação e disponível para consulta.

⚠️ POR QUE É IMPORTANTE:
A Política SMS estabelece o compromisso da organização com a segurança e meio ambiente, definindo diretrizes que orientam todas as decisões operacionais.

🚨 RISCOS DO NÃO CUMPRIMENTO:
- Multas do IBAMA e ANP
- Suspensão de operações
- Falta de direcionamento para a equipe
- Aumento de incidentes e acidentes

🛠️ RECOMENDAÇÕES PARA CONFORMIDADE:
- Elaborar documento formal assinado pelo CEO ou diretor operacional
- Realizar treinamento de integração incluindo a Política SMS
- Afixar cartazes da política em áreas comuns da embarcação
- Revisar anualmente e após grandes mudanças organizacionais
`,
    "Planejamento Operacional": `
📋 O QUE O REQUISITO EXIGE:
Elaboração de plano operacional com objetivos, metas e indicadores mensuráveis de SMS, incluindo cronograma de implementação e responsáveis.

⚠️ POR QUE É IMPORTANTE:
O planejamento estruturado permite monitorar o desempenho de segurança, identificar tendências e tomar ações preventivas antes que problemas escalem.

🚨 RISCOS DO NÃO CUMPRIMENTO:
- Gestão reativa ao invés de proativa
- Impossibilidade de medir melhorias
- Não conformidade em auditorias IBAMA
- Dificuldade em demonstrar comprometimento com SMS

🛠️ RECOMENDAÇÕES PARA CONFORMIDADE:
- Definir no mínimo 5 KPIs de SMS (LTIF, dias sem acidentes, treinamentos, etc)
- Estabelecer metas SMART (específicas, mensuráveis, alcançáveis, relevantes, temporais)
- Revisar indicadores mensalmente em reunião de segurança
- Utilizar dashboard digital para visualização em tempo real
`,
    "Treinamento e Capacitação": `
📋 O QUE O REQUISITO EXIGE:
Programa de treinamento documentado com registros de participação, conteúdo programático, carga horária e avaliação de eficácia dos treinamentos de SMS.

⚠️ POR QUE É IMPORTANTE:
Tripulação bem treinada é a primeira linha de defesa contra incidentes. O conhecimento técnico e comportamental reduz drasticamente a probabilidade de erros humanos.

🚨 RISCOS DO NÃO CUMPRIMENTO:
- Acidentes fatais por erro humano
- Responsabilização civil e criminal da empresa
- Perda de certificações (ISO 9001, ISO 14001, OHSAS 18001)
- Multas por não atendimento à NR-30 (Trabalho Aquaviário)

🛠️ RECOMENDAÇÕES PARA CONFORMIDADE:
- Matriz de competências por função com treinamentos obrigatórios
- Treinamentos de integração para novos tripulantes (mínimo 8h)
- Reciclagens anuais de procedimentos críticos
- Avaliar eficácia com testes práticos, não apenas teóricos
- Manter certificados e listas de presença por no mínimo 5 anos
`,
  };

  const defaultExplanation = `
📋 O QUE O REQUISITO EXIGE:
${requirement} - Este requisito exige o estabelecimento de procedimentos documentados, registros adequados e evidências de implementação efetiva.

⚠️ POR QUE É IMPORTANTE:
O cumprimento deste requisito é essencial para garantir a conformidade com as normas SGSO do IBAMA e assegurar operações seguras e sustentáveis.

🚨 RISCOS DO NÃO CUMPRIMENTO:
- Multas e penalidades do IBAMA
- Suspensão temporária ou definitiva das operações
- Aumento do risco de acidentes e incidentes
- Danos à reputação da empresa

🛠️ RECOMENDAÇÕES PARA CONFORMIDADE:
- Elaborar procedimento operacional padrão (POP) específico
- Designar responsável pela implementação e monitoramento
- Realizar treinamento da equipe envolvida
- Manter registros organizados e acessíveis
- Realizar auditorias internas periódicas
`;

  const explanation = explanations[requirement] || defaultExplanation;

  return `🤖 Explicação IA - Status: ${complianceText}\n\n${explanation.trim()}`;
}
