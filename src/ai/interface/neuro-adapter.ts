/**
 * PATCH 593 - Neuro-Human Interface Adapter
 * 
 * Adaptador entre entrada do usuário (voz/texto) e reações neuroadaptativas da IA
 * 
 * @module ai/interface/neuro-adapter
 * @created 2025-01-24
 */

import { logger } from "@/lib/logger";

export type InputType = "text" | "voice" | "gesture" | "thought";
export type InteractionState = "active" | "paused" | "hesitating" | "confirming" | "idle";
export type AdaptiveReaction = "suggest" | "confirm" | "wait" | "clarify" | "execute";

export interface UserInput {
  type: InputType;
  content: string;
  timestamp: Date;
  duration?: number; // milliseconds for voice/gesture
  confidence?: number; // 0-1 for voice recognition
}

export interface HumanContext {
  currentState: InteractionState;
  lastInputTime: Date;
  pauseDuration?: number; // milliseconds
  hesitationCount: number;
  confirmationRequired: boolean;
  inputHistory: UserInput[];
}

export interface AdaptiveReactionOutput {
  reaction: AdaptiveReaction;
  message: string;
  requiresConfirmation: boolean;
  waitTime?: number; // milliseconds to wait before next action
  suggestions?: string[];
}

export interface HesitationDetection {
  detected: boolean;
  type: "pause" | "repetition" | "incomplete" | "correction";
  confidence: number;
  context: string;
}

class NeuroHumanAdapter {
  private humanContext: HumanContext;
  private readonly HESITATION_PAUSE_THRESHOLD = 3000; // 3 seconds
  private readonly CRITICAL_ACTIONS = ["delete", "remove", "cancel", "stop", "abort"];
  private adaptationLog: Array<{ timestamp: Date; input: UserInput; reaction: AdaptiveReactionOutput }> = [];

  constructor() {
    this.humanContext = {
      currentState: "idle",
      lastInputTime: new Date(),
      hesitationCount: 0,
      confirmationRequired: false,
      inputHistory: []
    };
  }

  /**
   * Processa entrada adaptativa do usuário
   */
  processAdaptiveInput(input: UserInput): AdaptiveReactionOutput {
    // Atualiza contexto humano
    this.updateHumanContext(input);

    // Detecta hesitação
    const hesitation = this.detectHesitation(input);

    // Gera reação adaptativa
    const reaction = this.generateAdaptiveReaction(input, hesitation);

    // Log da adaptação
    this.logAdaptation(input, reaction);

    logger.debug("[NeuroAdapter] Input processed", {
      type: input.type,
      state: this.humanContext.currentState,
      reaction: reaction.reaction,
      hesitationDetected: hesitation.detected,
      requiresConfirmation: reaction.requiresConfirmation
    });

    return reaction;
  }

  /**
   * Detecta hesitação, dúvidas ou pausas
   */
  detectHesitation(input: UserInput): HesitationDetection {
    const timeSinceLastInput = Date.now() - this.humanContext.lastInputTime.getTime();
    const content = input.content.toLowerCase();

    // Detecta pausa longa
    if (timeSinceLastInput > this.HESITATION_PAUSE_THRESHOLD) {
      return {
        detected: true,
        type: "pause",
        confidence: 0.9,
        context: "Long pause detected between inputs"
      };
    }

    // Detecta repetição (mesmo input múltiplas vezes)
    const recentInputs = this.humanContext.inputHistory.slice(-3);
    const repetitionCount = recentInputs.filter(i => i.content === input.content).length;
    if (repetitionCount >= 2) {
      return {
        detected: true,
        type: "repetition",
        confidence: 0.85,
        context: "User repeating the same input"
      };
    }

    // Detecta entrada incompleta
    if (content.length < 5 || content.endsWith("...") || content.includes("hmm") || content.includes("err")) {
      return {
        detected: true,
        type: "incomplete",
        confidence: 0.75,
        context: "Input appears incomplete or uncertain"
      };
    }

    // Detecta correção (palavras como "não", "espera", "melhor")
    const correctionWords = ["não", "espera", "melhor", "na verdade", "quer dizer", "correção"];
    if (correctionWords.some(word => content.includes(word))) {
      return {
        detected: true,
        type: "correction",
        confidence: 0.8,
        context: "User attempting to correct previous input"
      };
    }

    return {
      detected: false,
      type: "pause",
      confidence: 0,
      context: "No hesitation detected"
    };
  }

  /**
   * Gera reação adaptativa da IA
   */
  generateAdaptiveReaction(input: UserInput, hesitation: HesitationDetection): AdaptiveReactionOutput {
    const content = input.content.toLowerCase();
    const isCriticalAction = this.CRITICAL_ACTIONS.some(action => content.includes(action));

    // Se detectou hesitação
    if (hesitation.detected) {
      return this.handleHesitation(input, hesitation);
    }

    // Se é ação crítica, sempre confirmar
    if (isCriticalAction) {
      this.humanContext.confirmationRequired = true;
      this.humanContext.currentState = "confirming";
      
      return {
        reaction: "confirm",
        message: "⚠️ Esta é uma ação crítica. Você confirma que deseja continuar?",
        requiresConfirmation: true,
        suggestions: ["Sim, continuar", "Não, cancelar", "Revisar antes"]
      };
    }

    // Entrada normal - executar
    this.humanContext.currentState = "active";
    return {
      reaction: "execute",
      message: "Entendido. Processando sua solicitação...",
      requiresConfirmation: false
    };
  }

  /**
   * Trata hesitação detectada
   */
  private handleHesitation(input: UserInput, hesitation: HesitationDetection): AdaptiveReactionOutput {
    this.humanContext.hesitationCount++;
    this.humanContext.currentState = "hesitating";

    switch (hesitation.type) {
    case "pause":
      return {
        reaction: "suggest",
        message: "🤔 Notei uma pausa. Posso sugerir algumas opções?",
        requiresConfirmation: false,
        suggestions: [
          "Continuar com a última ação",
          "Ver opções disponíveis",
          "Cancelar e começar de novo"
        ]
      };

    case "repetition":
      return {
        reaction: "clarify",
        message: "💭 Parece que você repetiu o comando. Posso esclarecer algo?",
        requiresConfirmation: false,
        suggestions: [
          "Sim, explique melhor",
          "Não, apenas execute",
          "Mostrar alternativas"
        ]
      };

    case "incomplete":
      return {
        reaction: "wait",
        message: "✋ Aguardando... Complete seu pensamento quando estiver pronto.",
        requiresConfirmation: false,
        waitTime: 5000
      };

    case "correction":
      return {
        reaction: "clarify",
        message: "🔄 Entendi que você quer corrigir. Qual é a ação correta?",
        requiresConfirmation: false,
        suggestions: [
          "Desfazer última ação",
          "Começar novamente",
          "Especificar correção"
        ]
      };

    default:
      return {
        reaction: "suggest",
        message: "Como posso ajudar?",
        requiresConfirmation: false
      };
    }
  }

  /**
   * Confirma execução de ação crítica
   */
  confirmCriticalAction(confirmed: boolean): AdaptiveReactionOutput {
    if (confirmed) {
      this.humanContext.currentState = "active";
      this.humanContext.confirmationRequired = false;
      return {
        reaction: "execute",
        message: "✅ Confirmado. Executando ação...",
        requiresConfirmation: false
      };
    } else {
      this.humanContext.currentState = "idle";
      this.humanContext.confirmationRequired = false;
      return {
        reaction: "wait",
        message: "❌ Ação cancelada. Aguardando novos comandos.",
        requiresConfirmation: false
      };
    }
  }

  /**
   * Atualiza contexto humano
   */
  private updateHumanContext(input: UserInput): void {
    this.humanContext.inputHistory.push(input);
    
    // Calcula duração da pausa
    const pauseDuration = Date.now() - this.humanContext.lastInputTime.getTime();
    this.humanContext.pauseDuration = pauseDuration;
    
    this.humanContext.lastInputTime = input.timestamp;

    // Mantém apenas os últimos 10 inputs
    if (this.humanContext.inputHistory.length > 10) {
      this.humanContext.inputHistory.shift();
    }
  }

  /**
   * Log de adaptação
   */
  private logAdaptation(input: UserInput, reaction: AdaptiveReactionOutput): void {
    this.adaptationLog.push({
      timestamp: new Date(),
      input,
      reaction
    });

    // Mantém apenas os últimos 50 logs
    if (this.adaptationLog.length > 50) {
      this.adaptationLog.shift();
    }

    logger.debug("[NeuroAdapter] Adaptation with human context", {
      inputType: input.type,
      reactionType: reaction.reaction,
      state: this.humanContext.currentState,
      hesitationCount: this.humanContext.hesitationCount,
      pauseDuration: this.humanContext.pauseDuration
    });
  }

  /**
   * Obtém contexto humano atual
   */
  getHumanContext(): HumanContext {
    return { ...this.humanContext };
  }

  /**
   * Obtém log de adaptações
   */
  getAdaptationLog(): Array<{ timestamp: Date; input: UserInput; reaction: AdaptiveReactionOutput }> {
    return [...this.adaptationLog];
  }

  /**
   * Reseta contexto
   */
  resetContext(): void {
    this.humanContext = {
      currentState: "idle",
      lastInputTime: new Date(),
      hesitationCount: 0,
      confirmationRequired: false,
      inputHistory: []
    };
  }

  /**
   * Limpa log de adaptações
   */
  clearAdaptationLog(): void {
    this.adaptationLog = [];
  }
}

// Instância singleton
export const neuroHumanAdapter = new NeuroHumanAdapter();
