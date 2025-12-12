/**
 * Diagnostic Assistant - PATCH 950
 * AI-powered troubleshooting and diagnostics
 */

import { hybridLLMEngine } from "@/lib/llm/hybrid-engine";

export interface DiagnosticStep {
  id: string;
  instruction: string;
  type: "check" | "action" | "question" | "result";
  options?: string[];
  expectedResult?: string;
  nextOnSuccess?: string;
  nextOnFailure?: string;
}

export interface DiagnosticFlow {
  id: string;
  name: string;
  description: string;
  category: string;
  symptoms: string[];
  steps: DiagnosticStep[];
}

export interface DiagnosticSession {
  id: string;
  flowId: string;
  currentStepId: string;
  history: { stepId: string; response: string; timestamp: Date }[];
  status: "in_progress" | "resolved" | "escalated";
  startedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

// Built-in diagnostic flows
const DIAGNOSTIC_FLOWS: DiagnosticFlow[] = [
  {
    id: "screen-not-opening",
    name: "Tela não abre",
    description: "Diagnóstico quando uma tela ou módulo não carrega",
    category: "Interface",
    symptoms: ["tela não abre", "página em branco", "não carrega", "travou"],
    steps: [
      {
        id: "check-internet",
        instruction: "Verifique se há conexão com a internet. Você vê o ícone de WiFi ou dados móveis?",
        type: "question",
        options: ["Sim, tenho internet", "Não, estou offline", "Não sei"],
        nextOnSuccess: "check-cache",
        nextOnFailure: "offline-mode"
      },
      {
        id: "offline-mode",
        instruction: "Você está offline. A tela que está tentando acessar funciona no modo offline?",
        type: "question",
        options: ["Sim, deveria funcionar", "Não, precisa de internet"],
        nextOnSuccess: "clear-cache",
        nextOnFailure: "need-internet"
      },
      {
        id: "need-internet",
        instruction: "Esta funcionalidade requer conexão com internet. Por favor, conecte-se a uma rede Wi-Fi ou use dados móveis.",
        type: "result",
        expectedResult: "resolved"
      },
      {
        id: "check-cache",
        instruction: "Vamos limpar o cache do aplicativo. Vá em Menu > Configurações > Limpar Cache",
        type: "action",
        nextOnSuccess: "verify-fixed",
        nextOnFailure: "restart-app"
      },
      {
        id: "clear-cache",
        instruction: "Limpe o cache do app em Menu > Configurações > Limpar Cache e tente novamente.",
        type: "action",
        nextOnSuccess: "verify-fixed",
        nextOnFailure: "restart-app"
      },
      {
        id: "restart-app",
        instruction: "Feche completamente o aplicativo e abra novamente. O problema foi resolvido?",
        type: "question",
        options: ["Sim, resolveu!", "Não, ainda não funciona"],
        nextOnSuccess: "resolved",
        nextOnFailure: "escalate"
      },
      {
        id: "verify-fixed",
        instruction: "Tente acessar a tela novamente. Funcionou?",
        type: "question",
        options: ["Sim, funcionou!", "Não, ainda não abre"],
        nextOnSuccess: "resolved",
        nextOnFailure: "restart-app"
      },
      {
        id: "resolved",
        instruction: "✅ Problema resolvido! Se ocorrer novamente, não hesite em usar o diagnóstico.",
        type: "result",
        expectedResult: "resolved"
      },
      {
        id: "escalate",
        instruction: "⚠️ Não foi possível resolver automaticamente. Registre um ticket de suporte em Menu > Ajuda > Suporte com a descrição do problema.",
        type: "result",
        expectedResult: "escalated"
      }
    ]
  },
  {
    id: "sync-failed",
    name: "Falha na sincronização",
    description: "Diagnóstico para problemas de sincronização de dados",
    category: "Sincronização",
    symptoms: ["não sincroniza", "erro sync", "dados pendentes", "E101", "E102", "E103"],
    steps: [
      {
        id: "check-queue",
        instruction: "Vamos verificar a fila de sincronização. Vá em Menu > Sincronização. Quantos itens pendentes você vê?",
        type: "question",
        options: ["Menos de 10", "Entre 10 e 50", "Mais de 50"],
        nextOnSuccess: "try-manual-sync",
        nextOnFailure: "queue-full"
      },
      {
        id: "queue-full",
        instruction: "A fila está muito grande. Vamos tentar sincronizar em partes. Clique em \"Sincronizar Urgentes\" primeiro.",
        type: "action",
        nextOnSuccess: "verify-partial",
        nextOnFailure: "clear-old"
      },
      {
        id: "try-manual-sync",
        instruction: "Clique no botão \"Sincronizar Agora\". Aguarde até 30 segundos.",
        type: "action",
        nextOnSuccess: "verify-sync",
        nextOnFailure: "check-conflicts"
      },
      {
        id: "verify-sync",
        instruction: "A sincronização foi concluída com sucesso?",
        type: "question",
        options: ["Sim, tudo sincronizado!", "Parcialmente", "Falhou novamente"],
        nextOnSuccess: "resolved",
        nextOnFailure: "check-conflicts"
      },
      {
        id: "verify-partial",
        instruction: "Alguns itens foram sincronizados?",
        type: "question",
        options: ["Sim, diminuiu a fila", "Não, nada mudou"],
        nextOnSuccess: "repeat-sync",
        nextOnFailure: "escalate"
      },
      {
        id: "check-conflicts",
        instruction: "Verifique se há conflitos em Menu > Sincronização > Conflitos. Existem conflitos?",
        type: "question",
        options: ["Sim, há conflitos", "Não, sem conflitos"],
        nextOnSuccess: "resolve-conflicts",
        nextOnFailure: "restart-app"
      },
      {
        id: "resolve-conflicts",
        instruction: "Para cada conflito, escolha a versão mais recente ou correta. Clique em \"Resolver\" para cada item.",
        type: "action",
        nextOnSuccess: "try-manual-sync",
        nextOnFailure: "escalate"
      },
      {
        id: "clear-old",
        instruction: "Vamos limpar dados antigos. Vá em Menu > Configurações > Armazenamento > Limpar dados antigos",
        type: "action",
        nextOnSuccess: "try-manual-sync",
        nextOnFailure: "escalate"
      },
      {
        id: "repeat-sync",
        instruction: "Continue sincronizando até a fila ficar vazia. Pode levar alguns minutos.",
        type: "action",
        nextOnSuccess: "resolved",
        nextOnFailure: "escalate"
      },
      {
        id: "restart-app",
        instruction: "Reinicie o aplicativo completamente e tente sincronizar novamente.",
        type: "action",
        nextOnSuccess: "verify-sync",
        nextOnFailure: "escalate"
      },
      {
        id: "resolved",
        instruction: "✅ Sincronização concluída com sucesso!",
        type: "result",
        expectedResult: "resolved"
      },
      {
        id: "escalate",
        instruction: "⚠️ Problema persistente de sincronização. Anote o código de erro (se houver) e entre em contato com o suporte técnico.",
        type: "result",
        expectedResult: "escalated"
      }
    ]
  },
  {
    id: "slow-performance",
    name: "Sistema lento",
    description: "Diagnóstico para problemas de performance",
    category: "Performance",
    symptoms: ["lento", "demora", "travando", "lag", "não responde"],
    steps: [
      {
        id: "check-storage",
        instruction: "Verifique o espaço disponível em Menu > Configurações > Armazenamento. Qual o percentual usado?",
        type: "question",
        options: ["Menos de 70%", "Entre 70% e 90%", "Mais de 90%"],
        nextOnSuccess: "check-memory",
        nextOnFailure: "free-storage"
      },
      {
        id: "free-storage",
        instruction: "O armazenamento está cheio. Vamos liberar espaço:\n1. Menu > Configurações > Limpar Cache\n2. Excluir relatórios antigos\n3. Compactar banco de dados",
        type: "action",
        nextOnSuccess: "verify-speed",
        nextOnFailure: "check-memory"
      },
      {
        id: "check-memory",
        instruction: "Feche outros aplicativos em segundo plano. Quantos apps você tem abertos?",
        type: "question",
        options: ["Apenas este", "Alguns (2-5)", "Muitos (mais de 5)"],
        nextOnSuccess: "reduce-features",
        nextOnFailure: "close-apps"
      },
      {
        id: "close-apps",
        instruction: "Feche todos os outros aplicativos e reinicie este. Melhorou?",
        type: "question",
        options: ["Sim, está mais rápido", "Não, ainda lento"],
        nextOnSuccess: "resolved",
        nextOnFailure: "reduce-features"
      },
      {
        id: "reduce-features",
        instruction: "Vamos ativar o modo de economia. Vá em Menu > Configurações > Performance > Modo Econômico",
        type: "action",
        nextOnSuccess: "verify-speed",
        nextOnFailure: "restart-device"
      },
      {
        id: "verify-speed",
        instruction: "O sistema está mais rápido agora?",
        type: "question",
        options: ["Sim, melhorou!", "Um pouco melhor", "Não, ainda lento"],
        nextOnSuccess: "resolved",
        nextOnFailure: "restart-device"
      },
      {
        id: "restart-device",
        instruction: "Reinicie o dispositivo completamente (não apenas o app). Isso limpa a memória do sistema.",
        type: "action",
        nextOnSuccess: "final-check",
        nextOnFailure: "escalate"
      },
      {
        id: "final-check",
        instruction: "Após reiniciar, o sistema está funcionando normalmente?",
        type: "question",
        options: ["Sim, resolvido!", "Não, ainda com problemas"],
        nextOnSuccess: "resolved",
        nextOnFailure: "escalate"
      },
      {
        id: "resolved",
        instruction: "✅ Performance restaurada! Dica: execute a limpeza de cache semanalmente para manter o bom desempenho.",
        type: "result",
        expectedResult: "resolved"
      },
      {
        id: "escalate",
        instruction: "⚠️ O dispositivo pode não atender aos requisitos mínimos ou há um problema mais profundo. Contate o suporte técnico.",
        type: "result",
        expectedResult: "escalated"
      }
    ]
  }
];

class DiagnosticAssistant {
  private flows: DiagnosticFlow[] = [...DIAGNOSTIC_FLOWS];
  private sessions: Map<string, DiagnosticSession> = new Map();

  /**
   * Find matching diagnostic flow based on symptoms
   */
  findFlow(symptom: string): DiagnosticFlow | undefined {
    const normalizedSymptom = symptom.toLowerCase();
    
    return this.flows.find(flow => 
      flow.symptoms.some(s => 
        normalizedSymptom.includes(s) || s.includes(normalizedSymptom)
      )
    );
  }

  /**
   * Start a diagnostic session
   */
  startSession(flowId: string): DiagnosticSession {
    const flow = this.flows.find(f => f.id === flowId);
    if (!flow) {
      throw new Error(`Flow not found: ${flowId}`);
    }

    const session: DiagnosticSession = {
      id: `session_${Date.now()}`,
      flowId,
      currentStepId: flow.steps[0].id,
      history: [],
      status: "in_progress",
      startedAt: new Date()
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get current step of a session
   */
  getCurrentStep(sessionId: string): DiagnosticStep | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const flow = this.flows.find(f => f.id === session.flowId);
    if (!flow) return undefined;

    return flow.steps.find(s => s.id === session.currentStepId);
  }

  /**
   * Process response and advance to next step
   */
  processResponse(sessionId: string, response: string): {
    nextStep: DiagnosticStep | null;
    session: DiagnosticSession;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const flow = this.flows.find(f => f.id === session.flowId);
    if (!flow) {
      throw new Error(`Flow not found: ${session.flowId}`);
    }

    const currentStep = flow.steps.find(s => s.id === session.currentStepId);
    if (!currentStep) {
      throw new Error(`Step not found: ${session.currentStepId}`);
    }

    // Record response
    session.history.push({
      stepId: session.currentStepId,
      response,
      timestamp: new Date()
    });

    // Determine next step
    let nextStepId: string | undefined;
    
    if (currentStep.type === "result") {
      // End of flow
      session.status = currentStep.expectedResult === "resolved" ? "resolved" : "escalated";
      session.resolvedAt = new Date();
      session.resolution = currentStep.instruction;
      return { nextStep: null, session };
    }

    // Check if response indicates success
    const isSuccess = response.toLowerCase().includes("sim") || 
                     response.includes("sucesso") ||
                     response.includes("funcionou") ||
                     response.includes("resolveu") ||
                     response.includes("Menos");

    nextStepId = isSuccess ? currentStep.nextOnSuccess : currentStep.nextOnFailure;

    if (!nextStepId) {
      // Default to next step in array
      const currentIndex = flow.steps.findIndex(s => s.id === session.currentStepId);
      nextStepId = flow.steps[currentIndex + 1]?.id;
    }

    if (nextStepId) {
      session.currentStepId = nextStepId;
      const nextStep = flow.steps.find(s => s.id === nextStepId);
      return { nextStep: nextStep || null, session };
    }

    return { nextStep: null, session };
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): DiagnosticSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * AI-powered free-form diagnosis
   */
  async diagnoseWithAI(problem: string): Promise<string> {
    // Try to find a matching flow first
    const matchingFlow = this.findFlow(problem);
    
    if (matchingFlow) {
      return `Encontrei um guia de diagnóstico para esse problema: "${matchingFlow.name}"\n\n` +
             `${matchingFlow.description}\n\n` +
             `Vamos começar o diagnóstico passo a passo. ${matchingFlow.steps[0].instruction}`;
    }

    // Use AI for free-form diagnosis
    try {
      const result = await hybridLLMEngine.query(
        `Você é um assistente técnico especializado em diagnóstico de problemas. 
         O usuário relatou o seguinte problema: "${problem}"
         
         Forneça um diagnóstico estruturado com:
         1. Possíveis causas (máximo 3)
         2. Passos de verificação
         3. Soluções sugeridas
         
         Seja claro e objetivo.`
      );
      return result.response;
    } catch {
      return `Não consegui processar o diagnóstico automaticamente.

Tente descrever o problema com mais detalhes ou use uma das opções:
- "Tela não abre"
- "Não sincroniza"
- "Sistema lento"

Ou contate o suporte técnico.`;
    }
  }

  /**
   * Get all available flows
   */
  getFlows(): DiagnosticFlow[] {
    return [...this.flows];
  }

  /**
   * Get flows by category
   */
  getFlowsByCategory(category: string): DiagnosticFlow[] {
    return this.flows.filter(f => f.category === category);
  }

  /**
   * Add custom flow
   */
  addFlow(flow: DiagnosticFlow): void {
    this.flows.push(flow);
  }

  /**
   * Get session statistics
   */
  getStats(): {
    totalSessions: number;
    resolved: number;
    escalated: number;
    avgResolutionTime: number;
    } {
    const sessions = Array.from(this.sessions.values());
    const resolved = sessions.filter(s => s.status === "resolved");
    const escalated = sessions.filter(s => s.status === "escalated");
    
    const resolutionTimes = resolved
      .filter(s => s.resolvedAt)
      .map(s => s.resolvedAt!.getTime() - s.startedAt.getTime());
    
    const avgTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;

    return {
      totalSessions: sessions.length,
      resolved: resolved.length,
      escalated: escalated.length,
      avgResolutionTime: avgTime / 1000 // seconds
    };
  }
}

export const diagnosticAssistant = new DiagnosticAssistant();
