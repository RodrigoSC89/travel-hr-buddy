/**
 * SGSO AI Action Plan Generator
 * Generates corrective actions, preventive measures, and expert recommendations
 * for classified incidents based on IMCA standards and offshore best practices
 */

import { chatCompletionJSON } from "@/services/unified/openai-client.service";

import { logger } from "@/lib/logger";
export interface SGSOIncident {
  description: string;
  sgso_category: string;
  sgso_root_cause: string;
  sgso_risk_level: string;
}

export interface SGSOActionPlan {
  corrective_action: string;
  preventive_action: string;
  recommendation: string;
}

/**
 * Generate action plan for SGSO incident using GPT-4
 * Falls back to mock data when API key is not available
 * 
 * @param incident - Incident data with description, category, root cause, and risk level
 * @returns Action plan with corrective, preventive, and recommendation actions
 */
export async function generateSGSOActionPlan(
  incident: SGSOIncident
): Promise<SGSOActionPlan | null> {
  // AI is always available via edge function proxy

  const system = `
Você é um especialista em segurança marítima (SGSO), atuando com base em normas IMCA e boas práticas offshore.

Para cada incidente, você deve propor:

✅ Ação corretiva imediata
🔁 Ação preventiva de médio/longo prazo
📚 Recomendação extra, se aplicável

Responda no formato JSON com chaves:
{
  "corrective_action": "...",
  "preventive_action": "...",
  "recommendation": "..."
}
  `;

  const user = `Incidente: ${incident.description}
Categoria SGSO: ${incident.sgso_category}
Causa raiz: ${incident.sgso_root_cause}
Nível de risco: ${incident.sgso_risk_level}`;

  try {
    const result = await chatCompletionJSON<SGSOActionPlan>(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.2, responseFormat: "json" }
    );

    if (!result) {
      // Fallback to mock when AI is unavailable
      return generateMockActionPlan(incident);
    }

    return result;
  } catch (error) {
    logger.error("Error generating SGSO action plan", error as Error, { 
      category: incident.sgso_category,
      riskLevel: incident.sgso_risk_level 
    });
    return generateMockActionPlan(incident);
  }
}

/**
 * Generate mock action plan for development and testing
 * Provides realistic responses based on incident category and risk level
 */
function generateMockActionPlan(incident: SGSOIncident): SGSOActionPlan {
  const { sgso_category, sgso_risk_level } = incident;

  // Category-specific responses
  const responses: Record<string, SGSOActionPlan> = {
    "Erro humano": {
      corrective_action: "Treinar operador e revisar o plano da operação antes de nova execução.",
      preventive_action: "Implementar checklist de dupla checagem em todas as operações críticas.",
      recommendation: "Adotar simulações periódicas para operadores com IA embarcada para melhorar tempo de resposta.",
    },
    "Falha de sistema": {
      corrective_action: "Isolar sistema afetado e ativar backup redundante imediatamente.",
      preventive_action: "Estabelecer programa de manutenção preditiva com monitoramento contínuo de sistemas críticos.",
      recommendation: "Implementar sistema de alarme antecipado baseado em análise de tendências de falhas similares.",
    },
    "Problema de comunicação": {
      corrective_action: "Realizar reunião de alinhamento com todas as partes envolvidas para esclarecer protocolos.",
      preventive_action: "Revisar e padronizar procedimentos de comunicação com treinamento obrigatório para toda equipe.",
      recommendation: "Adotar sistema digital de comunicação com confirmação de leitura e registro de todas as transmissões críticas.",
    },
    "Não conformidade com procedimento": {
      corrective_action: "Revisar procedimento com equipe e documentar desvios identificados.",
      preventive_action: "Implementar auditorias periódicas de conformidade e sistema de penalidades progressivas.",
      recommendation: "Criar cultura de segurança com reconhecimento para equipes que mantêm 100% de conformidade.",
    },
    "Fator externo (clima, mar, etc)": {
      corrective_action: "Avaliar condições meteorológicas e suspender operações até condições seguras serem restabelecidas.",
      preventive_action: "Estabelecer critérios objetivos de suspensão de operações baseados em previsão meteorológica de 72h.",
      recommendation: "Integrar sistema de monitoramento meteorológico em tempo real com alertas automáticos para operações.",
    },
    "Falha organizacional": {
      corrective_action: "Revisar estrutura organizacional e redistribuir responsabilidades para eliminar lacunas identificadas.",
      preventive_action: "Implementar matriz de responsabilidades RACI e realizar reuniões de governança mensais.",
      recommendation: "Adotar framework de gestão de mudanças organizacionais baseado em IMCA M 203.",
    },
    "Ausência de manutenção preventiva": {
      corrective_action: "Executar manutenção corretiva urgente e documentar todos os itens pendentes.",
      preventive_action: "Estabelecer programa de manutenção preventiva baseado em horas de operação e condição de equipamentos.",
      recommendation: "Implementar sistema CMMS (Computerized Maintenance Management System) para rastreamento completo de manutenções.",
    },
  };

  // Get response for category or use default
  const plan = responses[sgso_category] || {
    corrective_action: "Isolar área afetada e realizar investigação completa do incidente.",
    preventive_action: "Revisar procedimentos operacionais e implementar controles adicionais conforme análise de causa raiz.",
    recommendation: "Realizar análise de risco específica e atualizar matriz de riscos SGSO.",
  };

  // Adjust based on risk level
  if (sgso_risk_level === "crítico" || sgso_risk_level === "alto") {
    plan.recommendation = `[URGENTE] ${plan.recommendation} Notificar ANP e implementar medidas imediatas conforme Resolução 43/2007.`;
  }

  return plan;
}
