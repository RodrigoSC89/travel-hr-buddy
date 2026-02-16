/**
 * InteractiveAgentChat - Contextual response generation
 */
import type { Agent, AgentAction, Message } from "./types";

export function generateAgentResponse(query: string, agent: Agent): Message {
  const lowerQuery = query.toLowerCase();
  let content = "";
  const actions: AgentAction[] = [];

  if (agent.id === "agent-voyage") {
    if (lowerQuery.includes("rota") || lowerQuery.includes("viagem")) {
      content = "Analisei as rotas ativas. Encontrei 2 oportunidades de otimização:\n\n1. **Santos → Rotterdam**: Desvio por corrente favorável economiza 8h\n2. **Singapore → Dubai**: Alteração de velocidade reduz consumo em 15%\n\nDeseja que eu aplique essas otimizações?";
      actions.push({
        id: "act-1", type: "automation", title: "Otimizar Rota Santos-Rotterdam",
        description: "Aplicar desvio por corrente favorável", status: "pending",
        impact: "high", params: { voyage_id: "VYG-001", fuel_save: "12%" },
      });
    } else if (lowerQuery.includes("combustível") || lowerQuery.includes("fuel")) {
      content = "O consumo atual da frota está 8% acima da média. Principais causas:\n\n• Velocidade excessiva em 3 embarcações\n• Condições meteorológicas adversas\n• Cascos precisando de limpeza\n\nRecomendo redução de velocidade imediata.";
      actions.push({
        id: "act-2", type: "suggestion", title: "Reduzir Velocidade da Frota",
        description: "Ajustar velocidade de 3 navios para economizar combustível",
        status: "pending", impact: "medium",
      });
    } else {
      content = "Entendi sua solicitação. Posso ajudar com:\n\n• Otimização de rotas\n• Análise de consumo de combustível\n• Previsão de ETA\n• Integração meteorológica\n\nO que você gostaria de explorar?";
    }
  } else if (agent.id === "agent-compliance") {
    if (lowerQuery.includes("certificado") || lowerQuery.includes("documento")) {
      content = "**Situação de Documentos:**\n\n🔴 3 certificados STCW expiram em 30 dias\n🟡 5 certificados médicos expiram em 60 dias\n🟢 Demais documentos em conformidade\n\nDeseja que eu gere alertas automáticos para os responsáveis?";
      actions.push({
        id: "act-3", type: "alert", title: "Gerar Alertas de Certificados",
        description: "Notificar tripulantes e RH sobre renovações pendentes",
        status: "pending", impact: "high",
      });
    } else if (lowerQuery.includes("mlc") || lowerQuery.includes("stcw")) {
      content = "**Status MLC 2006 / STCW:**\n\n✅ Horas de trabalho: Conformidade 98%\n✅ Contratos SEA: 100% válidos\n⚠️ Treinamentos: 2 tripulantes pendentes\n\nGeral: **94% de conformidade**";
    } else {
      content = "Posso verificar conformidade com:\n\n• MLC 2006 (trabalho marítimo)\n• STCW (treinamentos)\n• SOLAS (segurança)\n• MARPOL (meio ambiente)\n\nQual regulamentação deseja verificar?";
    }
  } else if (agent.id === "agent-maintenance") {
    if (lowerQuery.includes("falha") || lowerQuery.includes("manutenção")) {
      content = "**Previsão de Manutenção:**\n\n🔴 Motor principal (Navio A): 72% prob. falha em 15 dias\n🟡 Sistema hidráulico (Navio B): 45% prob. em 30 dias\n🟢 Demais sistemas estáveis\n\nRecomendo gerar ordem de serviço preventiva.";
      actions.push({
        id: "act-4", type: "automation", title: "Criar Ordem de Serviço",
        description: "OS preventiva para motor principal do Navio A",
        status: "pending", impact: "high",
      });
    } else {
      content = "Monitoro continuamente:\n\n• Sensores de temperatura\n• Vibração de motores\n• Pressão de sistemas\n• Histórico de manutenções\n\nAlgum equipamento específico que deseja analisar?";
    }
  } else {
    if (lowerQuery.includes("fadiga") || lowerQuery.includes("bem-estar")) {
      content = "**Análise de Bem-estar:**\n\n• 12% da tripulação com sinais de fadiga\n• 3 tripulantes excederam horas recomendadas\n• Score geral de bem-estar: 78/100\n\nRecomendo ajuste de escalas.";
      actions.push({
        id: "act-5", type: "suggestion", title: "Ajustar Escalas",
        description: "Redistribuir turnos para reduzir fadiga",
        status: "pending", impact: "medium",
      });
    } else {
      content = "Acompanho a saúde da tripulação:\n\n• Detecção de fadiga\n• Horas de trabalho/descanso\n• Indicadores de bem-estar\n• Recomendações preventivas\n\nComo posso ajudar?";
    }
  }

  return {
    id: `msg-${Date.now()}-response`,
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
    actions,
    metadata: {
      tokens: 150 + (content.length % 100),
      latency_ms: 900 + (content.length % 300),
      confidence: 88 + (content.length % 10),
    },
  };
}
