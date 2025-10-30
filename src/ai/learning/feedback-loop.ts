/**
 * PATCH 605 - Feedback-Driven Learning Loop
 * 
 * Loop contínuo de aprendizado baseado nos feedbacks do operador.
 * Captura feedback explícito e implícito, ajusta pesos de decisão com base
 * em aprovação/rejeição e persiste os ajustes no contexto IA.
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tipo de feedback
 */
export type FeedbackType = "approval" | "rejection" | "modification" | "implicit";

/**
 * Feedback do operador sobre decisão
 */
export interface OperatorFeedback {
  id: string;
  userId: string;
  decisionId: string;
  type: FeedbackType;
  explicit: boolean;  // Se foi dado explicitamente ou inferido
  value: number;  // -1 (rejection) to 1 (approval)
  comment?: string;
  context: {
    screen: string;
    timestamp: Date;
    missionId?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Peso de decisão ajustável
 */
export interface DecisionWeight {
  factor: string;
  category: string;
  currentWeight: number;  // 0-1
  historicalWeight: number;  // Peso original
  adjustmentCount: number;
  lastAdjusted: Date;
  confidence: number;  // 0-100
}

/**
 * Ajuste de comportamento
 */
export interface BehaviorAdjustment {
  id: string;
  triggeredBy: string;  // ID do feedback
  adjustmentType: "weight_increase" | "weight_decrease" | "parameter_change" | "rule_modification";
  affected: string[];  // Fatores afetados
  magnitude: number;  // 0-1
  reasoning: string;
  appliedAt: Date;
  result?: {
    before: Record<string, any>;
    after: Record<string, any>;
    impact: number;  // -100 to 100
  };
}

/**
 * Métricas de aprendizado
 */
export interface LearningMetrics {
  userId?: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalFeedbacks: number;
    approvalRate: number;  // 0-100
    rejectionRate: number;  // 0-100
    adjustmentsMade: number;
    averageConfidence: number;  // 0-100
    improvementTrend: number;  // -100 to 100
  };
  accuracyOverTime: {
    timestamp: Date;
    accuracy: number;  // 0-100
  }[];
  effectivenessOverTime: {
    timestamp: Date;
    effectiveness: number;  // 0-100
  }[];
}

/**
 * Configuração do loop de aprendizado
 */
export interface LearningConfig {
  enabled: boolean;
  explicitFeedbackEnabled: boolean;
  implicitFeedbackEnabled: boolean;
  autoAdjustEnabled: boolean;
  learningRate: number;  // 0-1 (taxa de ajuste dos pesos)
  minFeedbacksForAdjustment: number;
  persistenceEnabled: boolean;
  evaluationIntervalMs: number;
}

/**
 * Loop de Aprendizado Orientado por Feedback
 */
export class FeedbackLoop {
  private config: LearningConfig;
  private feedbackHistory: OperatorFeedback[] = [];
  private decisionWeights: Map<string, DecisionWeight> = new Map();
  private adjustmentHistory: BehaviorAdjustment[] = [];
  private metricsCache: Map<string, LearningMetrics> = new Map();
  private evaluationInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<LearningConfig>) {
    this.config = {
      enabled: true,
      explicitFeedbackEnabled: true,
      implicitFeedbackEnabled: true,
      autoAdjustEnabled: true,
      learningRate: 0.1,
      minFeedbacksForAdjustment: 3,
      persistenceEnabled: true,
      evaluationIntervalMs: 30000,  // 30 segundos
      ...config,
    };
  }

  /**
   * Inicializa o loop de aprendizado
   */
  async initialize(): Promise<void> {
    logger.info("[FeedbackLoop] Initializing feedback-driven learning loop", {
      config: this.config,
    });

    // Carregar pesos de decisão existentes
    await this.loadDecisionWeights();

    // Carregar histórico de feedback
    await this.loadFeedbackHistory();

    // Iniciar avaliação periódica
    if (this.config.enabled) {
      this.startEvaluation();
    }
  }

  /**
   * Captura feedback explícito do operador
   */
  async captureExplicitFeedback(
    userId: string,
    decisionId: string,
    type: "approval" | "rejection" | "modification",
    comment?: string,
    context?: any
  ): Promise<OperatorFeedback> {
    if (!this.config.explicitFeedbackEnabled) {
      throw new Error("Explicit feedback is disabled");
    }

    const value = type === "approval" ? 1 : type === "rejection" ? -1 : 0;

    const feedback: OperatorFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      decisionId,
      type,
      explicit: true,
      value,
      comment,
      context: {
        screen: context?.screen || "unknown",
        timestamp: new Date(),
        missionId: context?.missionId,
      },
      metadata: context?.metadata,
    };

    await this.processFeedback(feedback);

    logger.info("[FeedbackLoop] Explicit feedback captured", {
      userId,
      decisionId,
      type,
      value,
    });

    return feedback;
  }

  /**
   * Captura feedback implícito (inferido do comportamento)
   */
  async captureImplicitFeedback(
    userId: string,
    decisionId: string,
    behaviorData: {
      timeToDecision?: number;  // ms
      modificationsCount?: number;
      alternativeChosen?: boolean;
      taskCompleted?: boolean;
      errorOccurred?: boolean;
    },
    context?: any
  ): Promise<OperatorFeedback> {
    if (!this.config.implicitFeedbackEnabled) {
      throw new Error("Implicit feedback is disabled");
    }

    // Inferir valor de feedback do comportamento
    let value = 0;

    if (behaviorData.taskCompleted && !behaviorData.errorOccurred) {
      value = 0.7;  // Positivo, mas não tão forte quanto approval explícito
    } else if (behaviorData.errorOccurred) {
      value = -0.7;  // Negativo
    } else if (behaviorData.alternativeChosen) {
      value = -0.5;  // Moderadamente negativo
    } else if (behaviorData.modificationsCount && behaviorData.modificationsCount > 2) {
      value = -0.3;  // Levemente negativo
    }

    const feedback: OperatorFeedback = {
      id: `feedback_implicit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      decisionId,
      type: "implicit",
      explicit: false,
      value,
      context: {
        screen: context?.screen || "unknown",
        timestamp: new Date(),
        missionId: context?.missionId,
      },
      metadata: {
        behaviorData,
        ...context?.metadata,
      },
    };

    await this.processFeedback(feedback);

    logger.debug("[FeedbackLoop] Implicit feedback captured", {
      userId,
      decisionId,
      value,
      behaviorData,
    });

    return feedback;
  }

  /**
   * Processa feedback e ajusta sistema
   */
  private async processFeedback(feedback: OperatorFeedback): Promise<void> {
    // Adicionar ao histórico
    this.feedbackHistory.push(feedback);

    // Manter histórico limitado
    if (this.feedbackHistory.length > 1000) {
      this.feedbackHistory = this.feedbackHistory.slice(-1000);
    }

    // Salvar no banco
    await this.saveFeedback(feedback);

    // Verificar se deve ajustar
    if (this.config.autoAdjustEnabled) {
      await this.evaluateAndAdjust(feedback);
    }
  }

  /**
   * Avalia feedback e faz ajustes necessários
   */
  private async evaluateAndAdjust(feedback: OperatorFeedback): Promise<void> {
    // Obter feedbacks relacionados à mesma decisão
    const relatedFeedbacks = this.feedbackHistory.filter(
      f => f.decisionId === feedback.decisionId
    );

    if (relatedFeedbacks.length < this.config.minFeedbacksForAdjustment) {
      logger.debug("[FeedbackLoop] Not enough feedbacks for adjustment", {
        decisionId: feedback.decisionId,
        count: relatedFeedbacks.length,
        required: this.config.minFeedbacksForAdjustment,
      });
      return;
    }

    // Calcular sentimento médio
    const avgSentiment =
      relatedFeedbacks.reduce((sum, f) => sum + f.value, 0) / relatedFeedbacks.length;

    // Se feedback consistentemente negativo, ajustar pesos
    if (avgSentiment < -0.3) {
      await this.adjustWeightsBasedOnNegativeFeedback(
        feedback.decisionId,
        relatedFeedbacks
      );
    } else if (avgSentiment > 0.3) {
      await this.reinforceWeightsBasedOnPositiveFeedback(
        feedback.decisionId,
        relatedFeedbacks
      );
    }
  }

  /**
   * Ajusta pesos baseado em feedback negativo
   */
  private async adjustWeightsBasedOnNegativeFeedback(
    decisionId: string,
    feedbacks: OperatorFeedback[]
  ): Promise<void> {
    logger.info("[FeedbackLoop] Adjusting weights based on negative feedback", {
      decisionId,
      feedbacksCount: feedbacks.length,
    });

    // Identificar fatores que contribuíram para a decisão ruim
    // (Isso requer integração com o strategic reasoner)
    const affectedFactors = ["efficiency_weight", "risk_weight", "quality_weight"];

    const adjustments: string[] = [];

    for (const factor of affectedFactors) {
      const weight = this.decisionWeights.get(factor);
      if (weight) {
        const previousWeight = weight.currentWeight;
        
        // Diminuir peso que levou a decisão ruim
        weight.currentWeight = Math.max(
          0,
          weight.currentWeight - this.config.learningRate * 0.5
        );
        weight.adjustmentCount++;
        weight.lastAdjusted = new Date();
        
        // Reduzir confiança
        weight.confidence = Math.max(0, weight.confidence - 10);

        this.decisionWeights.set(factor, weight);
        await this.saveDecisionWeight(weight);

        adjustments.push(
          `${factor}: ${previousWeight.toFixed(3)} -> ${weight.currentWeight.toFixed(3)}`
        );
      }
    }

    // Registrar ajuste
    const adjustment: BehaviorAdjustment = {
      id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      triggeredBy: feedbacks[0].id,
      adjustmentType: "weight_decrease",
      affected: affectedFactors,
      magnitude: this.config.learningRate * 0.5,
      reasoning: `Negative feedback received for decision ${decisionId}. Adjusting weights to improve future decisions.`,
      appliedAt: new Date(),
    };

    this.adjustmentHistory.push(adjustment);
    await this.saveAdjustment(adjustment);

    logger.info("[FeedbackLoop] Weights adjusted", {
      decisionId,
      adjustments: adjustments.join(", "),
    });
  }

  /**
   * Reforça pesos baseado em feedback positivo
   */
  private async reinforceWeightsBasedOnPositiveFeedback(
    decisionId: string,
    feedbacks: OperatorFeedback[]
  ): Promise<void> {
    logger.info("[FeedbackLoop] Reinforcing weights based on positive feedback", {
      decisionId,
      feedbacksCount: feedbacks.length,
    });

    const affectedFactors = ["efficiency_weight", "risk_weight", "quality_weight"];

    for (const factor of affectedFactors) {
      const weight = this.decisionWeights.get(factor);
      if (weight) {
        // Aumentar peso que levou a decisão boa
        weight.currentWeight = Math.min(
          1,
          weight.currentWeight + this.config.learningRate * 0.3
        );
        weight.adjustmentCount++;
        weight.lastAdjusted = new Date();
        
        // Aumentar confiança
        weight.confidence = Math.min(100, weight.confidence + 5);

        this.decisionWeights.set(factor, weight);
        await this.saveDecisionWeight(weight);
      }
    }

    // Registrar ajuste
    const adjustment: BehaviorAdjustment = {
      id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      triggeredBy: feedbacks[0].id,
      adjustmentType: "weight_increase",
      affected: affectedFactors,
      magnitude: this.config.learningRate * 0.3,
      reasoning: `Positive feedback received for decision ${decisionId}. Reinforcing successful patterns.`,
      appliedAt: new Date(),
    };

    this.adjustmentHistory.push(adjustment);
    await this.saveAdjustment(adjustment);
  }

  /**
   * Calcula métricas de aprendizado
   */
  async calculateMetrics(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<LearningMetrics> {
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);  // 7 dias atrás
    const end = endDate || new Date();

    let feedbacks = this.feedbackHistory.filter(
      f =>
        f.context.timestamp >= start &&
        f.context.timestamp <= end &&
        (!userId || f.userId === userId)
    );

    if (feedbacks.length === 0) {
      // Carregar do banco de dados
      const { data } = await supabase
        .from("ai_operator_feedbacks")
        .select("*")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .eq(userId ? "user_id" : "id", userId || "");

      feedbacks = (data || []).map((f: any) => ({
        ...f,
        context: {
          ...f.context,
          timestamp: new Date(f.context.timestamp),
        },
      }));
    }

    const totalFeedbacks = feedbacks.length;
    const approvals = feedbacks.filter(f => f.value > 0).length;
    const rejections = feedbacks.filter(f => f.value < 0).length;

    const approvalRate = totalFeedbacks > 0 ? (approvals / totalFeedbacks) * 100 : 0;
    const rejectionRate = totalFeedbacks > 0 ? (rejections / totalFeedbacks) * 100 : 0;

    const adjustments = this.adjustmentHistory.filter(
      a => a.appliedAt >= start && a.appliedAt <= end
    );

    // Calcular confiança média
    const weights = Array.from(this.decisionWeights.values());
    const averageConfidence =
      weights.length > 0
        ? weights.reduce((sum, w) => sum + w.confidence, 0) / weights.length
        : 0;

    // Calcular tendência de melhoria
    const recentApprovalRate =
      feedbacks.slice(-10).filter(f => f.value > 0).length / Math.min(10, feedbacks.length);
    const oldApprovalRate =
      feedbacks.slice(0, 10).filter(f => f.value > 0).length / Math.min(10, feedbacks.length);
    const improvementTrend = ((recentApprovalRate - oldApprovalRate) / Math.max(0.01, oldApprovalRate)) * 100;

    // Calcular acurácia ao longo do tempo
    const accuracyOverTime: { timestamp: Date; accuracy: number }[] = [];
    const chunkSize = Math.max(1, Math.floor(feedbacks.length / 10));

    for (let i = 0; i < feedbacks.length; i += chunkSize) {
      const chunk = feedbacks.slice(i, i + chunkSize);
      if (chunk.length > 0) {
        const accuracy = (chunk.filter(f => f.value > 0).length / chunk.length) * 100;
        accuracyOverTime.push({
          timestamp: chunk[chunk.length - 1].context.timestamp,
          accuracy,
        });
      }
    }

    const metrics: LearningMetrics = {
      userId,
      period: { start, end },
      summary: {
        totalFeedbacks,
        approvalRate,
        rejectionRate,
        adjustmentsMade: adjustments.length,
        averageConfidence,
        improvementTrend,
      },
      accuracyOverTime,
      effectivenessOverTime: accuracyOverTime.map(a => ({
        timestamp: a.timestamp,
        effectiveness: a.accuracy,
      })),
    };

    if (userId) {
      this.metricsCache.set(userId, metrics);
    }

    logger.info("[FeedbackLoop] Metrics calculated", {
      userId,
      totalFeedbacks,
      approvalRate: approvalRate.toFixed(1),
      improvementTrend: improvementTrend.toFixed(1),
    });

    return metrics;
  }

  /**
   * Inicia avaliação periódica
   */
  private startEvaluation(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
    }

    this.evaluationInterval = setInterval(async () => {
      await this.periodicEvaluation();
    }, this.config.evaluationIntervalMs);

    logger.info("[FeedbackLoop] Evaluation loop started", {
      intervalMs: this.config.evaluationIntervalMs,
    });
  }

  /**
   * Avaliação periódica do sistema
   */
  private async periodicEvaluation(): Promise<void> {
    try {
      // Calcular métricas globais
      const metrics = await this.calculateMetrics();

      // Log de variações significativas
      if (metrics.summary.improvementTrend > 10) {
        logger.info("[FeedbackLoop] Significant improvement detected", {
          improvementTrend: metrics.summary.improvementTrend.toFixed(1),
          approvalRate: metrics.summary.approvalRate.toFixed(1),
        });
      } else if (metrics.summary.improvementTrend < -10) {
        logger.warn("[FeedbackLoop] Performance degradation detected", {
          improvementTrend: metrics.summary.improvementTrend.toFixed(1),
          approvalRate: metrics.summary.approvalRate.toFixed(1),
        });
      }

      // Persistir métricas
      if (this.config.persistenceEnabled) {
        await this.saveMetrics(metrics);
      }
    } catch (error) {
      logger.error("[FeedbackLoop] Error in periodic evaluation", { error });
    }
  }

  /**
   * Carrega pesos de decisão
   */
  private async loadDecisionWeights(): Promise<void> {
    try {
      const { data: weights } = await supabase
        .from("ai_decision_weights")
        .select("*");

      if (weights) {
        weights.forEach((w: any) => {
          this.decisionWeights.set(w.factor, {
            ...w,
            lastAdjusted: new Date(w.last_adjusted),
          });
        });

        logger.info("[FeedbackLoop] Loaded decision weights", {
          count: weights.length,
        });
      } else {
        // Inicializar pesos padrão
        await this.initializeDefaultWeights();
      }
    } catch (error) {
      logger.error("[FeedbackLoop] Failed to load decision weights", { error });
      await this.initializeDefaultWeights();
    }
  }

  /**
   * Inicializa pesos padrão
   */
  private async initializeDefaultWeights(): Promise<void> {
    const defaultWeights: DecisionWeight[] = [
      {
        factor: "efficiency_weight",
        category: "performance",
        currentWeight: 0.3,
        historicalWeight: 0.3,
        adjustmentCount: 0,
        lastAdjusted: new Date(),
        confidence: 70,
      },
      {
        factor: "risk_weight",
        category: "safety",
        currentWeight: 0.4,
        historicalWeight: 0.4,
        adjustmentCount: 0,
        lastAdjusted: new Date(),
        confidence: 70,
      },
      {
        factor: "quality_weight",
        category: "quality",
        currentWeight: 0.3,
        historicalWeight: 0.3,
        adjustmentCount: 0,
        lastAdjusted: new Date(),
        confidence: 70,
      },
    ];

    for (const weight of defaultWeights) {
      this.decisionWeights.set(weight.factor, weight);
      await this.saveDecisionWeight(weight);
    }

    logger.info("[FeedbackLoop] Initialized default weights", {
      count: defaultWeights.length,
    });
  }

  /**
   * Carrega histórico de feedback
   */
  private async loadFeedbackHistory(): Promise<void> {
    try {
      const { data: feedbacks } = await supabase
        .from("ai_operator_feedbacks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (feedbacks) {
        this.feedbackHistory = feedbacks.map((f: any) => ({
          ...f,
          context: {
            ...f.context,
            timestamp: new Date(f.context.timestamp),
          },
        }));

        logger.info("[FeedbackLoop] Loaded feedback history", {
          count: feedbacks.length,
        });
      }
    } catch (error) {
      logger.error("[FeedbackLoop] Failed to load feedback history", { error });
    }
  }

  /**
   * Salva feedback
   */
  private async saveFeedback(feedback: OperatorFeedback): Promise<void> {
    try {
      await supabase.from("ai_operator_feedbacks").insert({
        id: feedback.id,
        user_id: feedback.userId,
        decision_id: feedback.decisionId,
        type: feedback.type,
        explicit: feedback.explicit,
        value: feedback.value,
        comment: feedback.comment,
        context: feedback.context,
        metadata: feedback.metadata,
        created_at: feedback.context.timestamp.toISOString(),
      });
    } catch (error) {
      logger.error("[FeedbackLoop] Failed to save feedback", { error });
    }
  }

  /**
   * Salva peso de decisão
   */
  private async saveDecisionWeight(weight: DecisionWeight): Promise<void> {
    try {
      await supabase.from("ai_decision_weights").upsert({
        factor: weight.factor,
        category: weight.category,
        current_weight: weight.currentWeight,
        historical_weight: weight.historicalWeight,
        adjustment_count: weight.adjustmentCount,
        last_adjusted: weight.lastAdjusted.toISOString(),
        confidence: weight.confidence,
      });
    } catch (error) {
      logger.error("[FeedbackLoop] Failed to save decision weight", { error });
    }
  }

  /**
   * Salva ajuste
   */
  private async saveAdjustment(adjustment: BehaviorAdjustment): Promise<void> {
    try {
      await supabase.from("ai_behavior_adjustments").insert({
        id: adjustment.id,
        triggered_by: adjustment.triggeredBy,
        adjustment_type: adjustment.adjustmentType,
        affected: adjustment.affected,
        magnitude: adjustment.magnitude,
        reasoning: adjustment.reasoning,
        applied_at: adjustment.appliedAt.toISOString(),
        result: adjustment.result,
      });
    } catch (error) {
      logger.error("[FeedbackLoop] Failed to save adjustment", { error });
    }
  }

  /**
   * Salva métricas
   */
  private async saveMetrics(metrics: LearningMetrics): Promise<void> {
    try {
      await supabase.from("ai_learning_metrics").insert({
        user_id: metrics.userId,
        period_start: metrics.period.start.toISOString(),
        period_end: metrics.period.end.toISOString(),
        summary: metrics.summary,
        accuracy_over_time: metrics.accuracyOverTime,
        effectiveness_over_time: metrics.effectivenessOverTime,
        generated_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("[FeedbackLoop] Failed to save metrics", { error });
    }
  }

  /**
   * Obtém peso de decisão
   */
  getDecisionWeight(factor: string): DecisionWeight | undefined {
    return this.decisionWeights.get(factor);
  }

  /**
   * Obtém todos os pesos
   */
  getAllWeights(): DecisionWeight[] {
    return Array.from(this.decisionWeights.values());
  }

  /**
   * Obtém histórico de ajustes
   */
  getAdjustmentHistory(limit: number = 50): BehaviorAdjustment[] {
    return this.adjustmentHistory.slice(-limit);
  }

  /**
   * Atualiza configuração
   */
  updateConfig(config: Partial<LearningConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info("[FeedbackLoop] Configuration updated", this.config);

    if (config.evaluationIntervalMs && this.evaluationInterval) {
      this.startEvaluation();
    }
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): LearningConfig {
    return { ...this.config };
  }

  /**
   * Finaliza o loop
   */
  async shutdown(): Promise<void> {
    logger.info("[FeedbackLoop] Shutting down feedback loop");

    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
    }

    // Persistir estado final
    if (this.config.persistenceEnabled) {
      for (const weight of this.decisionWeights.values()) {
        await this.saveDecisionWeight(weight);
      }
    }
  }
}

// Singleton instance
export const feedbackLoop = new FeedbackLoop();

export default feedbackLoop;
