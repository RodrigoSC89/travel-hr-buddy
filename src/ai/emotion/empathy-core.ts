/**
 * PATCH 536 - Empathy Core Engine
 * 
 * Simula empatia operacional com base em estado físico e emocional do usuário
 * 
 * @module ai/emotion/empathy-core
 * @created 2025-01-24
 */

import { logger } from "@/lib/logger";

export type EmotionalState = "calm" | "stressed" | "anxious" | "focused" | "tired" | "energized";
export type StressLevel = "low" | "moderate" | "high" | "critical";
export type BiometricSource = "mock" | "wearable" | "manual" | "fallback";

export interface BiometricData {
  heartRate?: number; // bpm
  heartRateVariability?: number; // ms
  respirationRate?: number; // breaths per minute
  skinTemperature?: number; // celsius
  timestamp: Date;
  source: BiometricSource;
}

export interface EmotionalContext {
  emotionalState: EmotionalState;
  stressLevel: StressLevel;
  cognitiveLoad: number; // 0-1 scale
  biometric?: BiometricData;
  timestamp: Date;
}

export interface EmpathyResponse {
  originalMessage: string;
  adjustedMessage: string;
  tone: "supportive" | "neutral" | "encouraging" | "calming";
  suggestions: string[];
  alerts: string[];
}

export interface CognitiveReliefAction {
  type: "break_suggestion" | "task_simplification" | "priority_adjustment" | "delegation_offer";
  message: string;
  priority: "low" | "medium" | "high";
}

class EmpathyCore {
  private emotionalHistory: EmotionalContext[] = [];
  private currentContext: EmotionalContext | null = null;

  /**
   * Integra dados biométricos (mock ou real)
   */
  integrateBiometrics(data: BiometricData): EmotionalContext {
    const emotionalState = this.inferEmotionalState(data);
    const stressLevel = this.calculateStressLevel(data);
    const cognitiveLoad = this.estimateCognitiveLoad(data, emotionalState);

    const context: EmotionalContext = {
      emotionalState,
      stressLevel,
      cognitiveLoad,
      biometric: data,
      timestamp: new Date()
    };

    this.currentContext = context;
    this.emotionalHistory.push(context);

    // Mantém apenas as últimas 50 entradas
    if (this.emotionalHistory.length > 50) {
      this.emotionalHistory.shift();
    }

    logger.debug("Emotional state interpreted", {
      emotionalState,
      stressLevel,
      cognitiveLoad: cognitiveLoad.toFixed(2),
      heartRate: data.heartRate
    });

    return context;
  }

  /**
   * Simula dados biométricos (mock)
   */
  generateMockBiometrics(stressScenario: "normal" | "moderate" | "high" = "normal"): BiometricData {
    let baseHeartRate = 70;
    let baseHRV = 50;
    let baseRespiration = 14;

    if (stressScenario === "moderate") {
      baseHeartRate = 85;
      baseHRV = 35;
      baseRespiration = 18;
    } else if (stressScenario === "high") {
      baseHeartRate = 100;
      baseHRV = 20;
      baseRespiration = 22;
    }

    return {
      heartRate: baseHeartRate + 2,
      heartRateVariability: baseHRV + 3,
      respirationRate: baseRespiration + 1,
      skinTemperature: 36.7,
      timestamp: new Date(),
      source: "fallback"
    };
  }

  /**
   * Ajusta resposta com base no estado emocional
   */
  adjustResponse(message: string, userFeedback?: string): EmpathyResponse {
    const context = this.currentContext || this.getDefaultContext();
    
    let adjustedMessage = message;
    let tone: EmpathyResponse["tone"] = "neutral";
    const suggestions: string[] = [];
    const alerts: string[] = [];

    // Considera feedback do usuário se disponível
    if (userFeedback) {
      this.processUserFeedback(userFeedback);
    }

    // Ajusta tom com base no estado emocional
    if (context.emotionalState === "stressed" || context.stressLevel === "high" || context.stressLevel === "critical") {
      tone = "calming";
      adjustedMessage = this.applyCalmingTone(message);
      suggestions.push("Considere fazer uma pausa de 5 minutos");
      
      if (context.stressLevel === "critical") {
        alerts.push("⚠️ Nível de stress crítico detectado. Recomendo pausar atividades não-críticas.");
      }
    } else if (context.emotionalState === "anxious") {
      tone = "supportive";
      adjustedMessage = this.applySupportiveTone(message);
      suggestions.push("Vamos focar em uma tarefa de cada vez");
    } else if (context.emotionalState === "tired") {
      tone = "encouraging";
      adjustedMessage = this.applyEncouragingTone(message);
      suggestions.push("Você está progredindo bem. Uma pausa pode ajudar a recarregar.");
    }

    // Adiciona sugestões baseadas em carga cognitiva
    if (context.cognitiveLoad > 0.8) {
      suggestions.push("Carga cognitiva alta. Sugiro simplificar ou adiar tarefas secundárias.");
      alerts.push("🧠 Sobrecarga cognitiva detectada");
    }

    logger.debug("Response adjusted for emotional state", {
      emotionalState: context.emotionalState,
      stressLevel: context.stressLevel,
      tone,
      suggestionsCount: suggestions.length,
      alertsCount: alerts.length
    });

    return {
      originalMessage: message,
      adjustedMessage,
      tone,
      suggestions,
      alerts
    };
  }

  /**
   * Sistema de alívio cognitivo
   */
  provideCognitiveRelief(): CognitiveReliefAction[] {
    const context = this.currentContext || this.getDefaultContext();
    const actions: CognitiveReliefAction[] = [];

    if (context.cognitiveLoad > 0.7 || context.stressLevel === "high" || context.stressLevel === "critical") {
      // Sugerir pausa
      actions.push({
        type: "break_suggestion",
        message: "🌟 Detectei que você está sobrecarregado. Que tal uma pausa de 10 minutos?",
        priority: context.stressLevel === "critical" ? "high" : "medium"
      });

      // Simplificação de tarefas
      if (context.cognitiveLoad > 0.8) {
        actions.push({
          type: "task_simplification",
          message: "💡 Posso simplificar suas tarefas atuais ou dividir em etapas menores?",
          priority: "medium"
        });
      }

      // Ajuste de prioridades
      actions.push({
        type: "priority_adjustment",
        message: "📊 Gostaria que eu reorganize suas prioridades baseado na urgência real?",
        priority: "medium"
      });

      // Oferta de delegação
      if (context.stressLevel === "critical") {
        actions.push({
          type: "delegation_offer",
          message: "🤝 Posso assumir algumas tarefas automatizáveis para reduzir sua carga?",
          priority: "high"
        });
      }
    }

    return actions;
  }

  /**
   * Obtém contexto emocional atual
   */
  getCurrentContext(): EmotionalContext | null {
    return this.currentContext;
  }

  /**
   * Obtém histórico emocional
   */
  getEmotionalHistory(): EmotionalContext[] {
    return [...this.emotionalHistory];
  }

  /**
   * Limpa histórico emocional
   */
  clearHistory(): void {
    this.emotionalHistory = [];
    this.currentContext = null;
  }

  /**
   * Infere estado emocional a partir de dados biométricos
   */
  private inferEmotionalState(data: BiometricData): EmotionalState {
    if (!data.heartRate) return "calm";

    const hr = data.heartRate;
    const hrv = data.heartRateVariability || 50;

    if (hr > 95 && hrv < 30) {
      return "stressed";
    }
    if (hr > 85 && hrv < 40) {
      return "anxious";
    }
    if (hr < 60 && hrv < 35) {
      return "tired";
    }
    if (hr > 80 && hrv > 50) {
      return "energized";
    }
    if (hr >= 60 && hr <= 75 && hrv >= 45) {
      return "focused";
    }

    return "calm";
  }

  /**
   * Calcula nível de stress
   */
  private calculateStressLevel(data: BiometricData): StressLevel {
    if (!data.heartRate) return "low";

    const hr = data.heartRate;
    const hrv = data.heartRateVariability || 50;
    const resp = data.respirationRate || 14;

    // Combina múltiplos fatores
    let stressScore = 0;

    if (hr > 100) stressScore += 3;
    else if (hr > 90) stressScore += 2;
    else if (hr > 80) stressScore += 1;

    if (hrv < 25) stressScore += 3;
    else if (hrv < 35) stressScore += 2;
    else if (hrv < 45) stressScore += 1;

    if (resp > 20) stressScore += 2;
    else if (resp > 16) stressScore += 1;

    if (stressScore >= 6) return "critical";
    if (stressScore >= 4) return "high";
    if (stressScore >= 2) return "moderate";
    return "low";
  }

  /**
   * Estima carga cognitiva
   */
  private estimateCognitiveLoad(data: BiometricData, state: EmotionalState): number {
    let load = 0.5; // Base load

    if (state === "stressed" || state === "anxious") {
      load += 0.3;
    } else if (state === "tired") {
      load += 0.2;
    } else if (state === "focused") {
      load += 0.1;
    }

    // Ajusta com base em frequência cardíaca
    if (data.heartRate && data.heartRate > 90) {
      load += 0.1;
    }

    return Math.min(1.0, load);
  }

  /**
   * Processa feedback do usuário
   */
  private processUserFeedback(feedback: string): void {
    const lowerFeedback = feedback.toLowerCase();
    
    if (lowerFeedback.includes("estressado") || lowerFeedback.includes("cansado")) {
      if (this.currentContext) {
        this.currentContext.cognitiveLoad = Math.min(1.0, this.currentContext.cognitiveLoad + 0.2);
        this.currentContext.stressLevel = "high";
      }
    }
    
    logger.debug("User feedback processed", { feedback });
  }

  /**
   * Aplica tom calmante
   */
  private applyCalmingTone(message: string): string {
    return `🧘 ${message}\n\nRespire fundo. Vamos resolver isso juntos, com calma.`;
  }

  /**
   * Aplica tom de suporte
   */
  private applySupportiveTone(message: string): string {
    return `💙 ${message}\n\nEstou aqui para ajudar. Conte comigo!`;
  }

  /**
   * Aplica tom encorajador
   */
  private applyEncouragingTone(message: string): string {
    return `⭐ ${message}\n\nVocê está fazendo um ótimo trabalho!`;
  }

  /**
   * Retorna contexto padrão
   */
  private getDefaultContext(): EmotionalContext {
    return {
      emotionalState: "calm",
      stressLevel: "low",
      cognitiveLoad: 0.5,
      timestamp: new Date()
    };
  }
}

// Instância singleton
export const empathyCore = new EmpathyCore();
