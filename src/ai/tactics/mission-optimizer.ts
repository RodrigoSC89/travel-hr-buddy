/**
 * PATCH 604 - Mission Tactic Optimizer
 * 
 * Otimizador de táticas de missão baseado em dados ao vivo.
 * Recebe dados de performance, ajusta parâmetros de tática em tempo real
 * e notifica operadores sobre alterações sugeridas.
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

/**
 * Dados de performance da missão
 */
export interface PerformanceData {
  missionId: string;
  timestamp: Date;
  metrics: {
    efficiency: number;       // 0-100
    resourceUtilization: number;  // 0-100
    progressRate: number;     // progresso por hora
    errorRate: number;        // 0-100
    qualityScore: number;     // 0-100
    safetyScore: number;      // 0-100
  };
  issues?: string[];
  rawData?: Record<string, any>;
}

/**
 * Parâmetro tático
 */
export interface TacticParameter {
  name: string;
  currentValue: any;
  recommendedValue: any;
  reason: string;
  impact: "low" | "medium" | "high";
  confidence: number;  // 0-100
}

/**
 * Ajuste tático sugerido
 */
export interface TacticAdjustment {
  id: string;
  missionId: string;
  triggeredBy: string;  // O que causou o ajuste
  parameters: TacticParameter[];
  reasoning: string;
  expectedImprovement: {
    efficiency?: number;
    quality?: number;
    safety?: number;
  };
  status: "proposed" | "approved" | "rejected" | "applied";
  proposedAt: Date;
  appliedAt?: Date;
}

/**
 * Notificação de mudança tática
 */
export interface TacticNotification {
  id: string;
  missionId: string;
  operatorIds: string[];
  adjustmentId: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  requiresAcknowledgment: boolean;
  sentAt: Date;
}

/**
 * Histórico de alteração
 */
export interface TacticChangeHistory {
  id: string;
  missionId: string;
  adjustmentId: string;
  appliedAt: Date;
  appliedBy?: string;
  beforeState: Record<string, any>;
  afterState: Record<string, any>;
  result: {
    successful: boolean;
    impact: Record<string, number>;
    notes?: string;
  };
}

/**
 * Configuração do otimizador
 */
export interface OptimizerConfig {
  enabled: boolean;
  autoApplyEnabled: boolean;
  minConfidenceForAutoApply: number;  // 0-100
  monitoringIntervalMs: number;
  notifyOperators: boolean;
  thresholds: {
    efficiencyMin: number;
    qualityMin: number;
    safetyMin: number;
    errorRateMax: number;
  };
}

/**
 * Otimizador de Táticas de Missão
 */
export class MissionOptimizer {
  private config: OptimizerConfig;
  private performanceHistory: Map<string, PerformanceData[]> = new Map();
  private activeAdjustments: Map<string, TacticAdjustment[]> = new Map();
  private changeHistory: Map<string, TacticChangeHistory[]> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<OptimizerConfig>) {
    this.config = {
      enabled: true,
      autoApplyEnabled: false,
      minConfidenceForAutoApply: 85,
      monitoringIntervalMs: 10000,  // 10 segundos
      notifyOperators: true,
      thresholds: {
        efficiencyMin: 70,
        qualityMin: 75,
        safetyMin: 90,
        errorRateMax: 10,
      },
      ...config,
    };
  }

  /**
   * Inicializa o otimizador
   */
  async initialize(): Promise<void> {
    logger.info("[MissionOptimizer] Initializing mission tactic optimizer", {
      config: this.config,
    });

    // Carregar histórico recente
    await this.loadRecentHistory();

    // Iniciar monitoramento
    if (this.config.enabled) {
      this.startMonitoring();
    }
  }

  /**
   * Recebe dados de performance
   */
  async receivePerformanceData(data: PerformanceData): Promise<void> {
    logger.debug("[MissionOptimizer] Received performance data", {
      missionId: data.missionId,
      efficiency: data.metrics.efficiency,
      quality: data.metrics.qualityScore,
    });

    // Adicionar ao histórico
    const history = this.performanceHistory.get(data.missionId) || [];
    history.push(data);

    // Manter últimas 100 entradas
    if (history.length > 100) {
      history.shift();
    }
    this.performanceHistory.set(data.missionId, history);

    // Analisar e otimizar
    await this.analyzeAndOptimize(data);

    // Salvar no banco
    await this.savePerformanceData(data);
  }

  /**
   * Analisa performance e gera otimizações
   */
  private async analyzeAndOptimize(data: PerformanceData): Promise<void> {
    const issues: string[] = [];
    const parameters: TacticParameter[] = [];

    // Verificar thresholds
    if (data.metrics.efficiency < this.config.thresholds.efficiencyMin) {
      issues.push(`Efficiency below threshold (${data.metrics.efficiency}%)`);
      
      // Sugerir aumento de recursos
      parameters.push({
        name: "resource_allocation",
        currentValue: "standard",
        recommendedValue: "increased",
        reason: "Low efficiency detected - increase resource allocation",
        impact: "medium",
        confidence: 75,
      });

      // Sugerir otimização de processos
      parameters.push({
        name: "process_optimization",
        currentValue: "disabled",
        recommendedValue: "enabled",
        reason: "Enable process optimization to improve efficiency",
        impact: "high",
        confidence: 80,
      });
    }

    if (data.metrics.qualityScore < this.config.thresholds.qualityMin) {
      issues.push(`Quality below threshold (${data.metrics.qualityScore}%)`);
      
      parameters.push({
        name: "quality_checks",
        currentValue: "basic",
        recommendedValue: "enhanced",
        reason: "Increase quality control measures",
        impact: "high",
        confidence: 85,
      });
    }

    if (data.metrics.safetyScore < this.config.thresholds.safetyMin) {
      issues.push(`Safety below threshold (${data.metrics.safetyScore}%)`);
      
      parameters.push({
        name: "safety_protocols",
        currentValue: "standard",
        recommendedValue: "strict",
        reason: "Critical: Enhance safety protocols immediately",
        impact: "high",
        confidence: 95,
      });
    }

    if (data.metrics.errorRate > this.config.thresholds.errorRateMax) {
      issues.push(`Error rate above threshold (${data.metrics.errorRate}%)`);
      
      parameters.push({
        name: "error_prevention",
        currentValue: "reactive",
        recommendedValue: "proactive",
        reason: "Enable proactive error prevention",
        impact: "medium",
        confidence: 80,
      });
    }

    // Analisar tendências
    const history = this.performanceHistory.get(data.missionId) || [];
    if (history.length >= 3) {
      const recentEfficiency = history.slice(-3).map(h => h.metrics.efficiency);
      const efficiencyTrend = this.calculateTrend(recentEfficiency);

      if (efficiencyTrend < -5) {  // Declínio de mais de 5%
        parameters.push({
          name: "workload_balance",
          currentValue: "current",
          recommendedValue: "redistributed",
          reason: "Declining efficiency trend detected - redistribute workload",
          impact: "medium",
          confidence: 70,
        });
      }
    }

    // Gerar ajuste se houver parâmetros
    if (parameters.length > 0) {
      await this.proposeAdjustment(data.missionId, issues.join("; "), parameters);
    }
  }

  /**
   * Propõe ajuste tático
   */
  private async proposeAdjustment(
    missionId: string,
    triggeredBy: string,
    parameters: TacticParameter[]
  ): Promise<void> {
    // Calcular melhorias esperadas
    const expectedImprovement: any = {};
    parameters.forEach(p => {
      if (p.name.includes("efficiency") || p.name.includes("resource")) {
        expectedImprovement.efficiency = (expectedImprovement.efficiency || 0) + 10;
      }
      if (p.name.includes("quality")) {
        expectedImprovement.quality = (expectedImprovement.quality || 0) + 15;
      }
      if (p.name.includes("safety")) {
        expectedImprovement.safety = (expectedImprovement.safety || 0) + 20;
      }
    });

    const adjustment: TacticAdjustment = {
      id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      missionId,
      triggeredBy,
      parameters,
      reasoning: this.generateAdjustmentReasoning(parameters),
      expectedImprovement,
      status: "proposed",
      proposedAt: new Date(),
    };

    // Adicionar aos ajustes ativos
    const adjustments = this.activeAdjustments.get(missionId) || [];
    adjustments.push(adjustment);
    this.activeAdjustments.set(missionId, adjustments);

    // Salvar ajuste
    await this.saveAdjustment(adjustment);

    // Auto-aplicar se configurado e confiança suficiente
    const avgConfidence =
      parameters.reduce((sum, p) => sum + p.confidence, 0) / parameters.length;

    if (
      this.config.autoApplyEnabled &&
      avgConfidence >= this.config.minConfidenceForAutoApply
    ) {
      await this.applyAdjustment(adjustment.id);
    } else if (this.config.notifyOperators) {
      await this.notifyOperators(adjustment);
    }

    logger.info("[MissionOptimizer] Proposed tactic adjustment", {
      missionId,
      adjustmentId: adjustment.id,
      parametersCount: parameters.length,
      avgConfidence,
      autoApplied: this.config.autoApplyEnabled && avgConfidence >= this.config.minConfidenceForAutoApply,
    });
  }

  /**
   * Gera raciocínio para ajuste
   */
  private generateAdjustmentReasoning(parameters: TacticParameter[]): string {
    const parts = [
      "# Tactical Adjustment Recommendation\n",
      `## Proposed Changes: ${parameters.length} parameter(s)\n`,
    ];

    parameters.forEach((p, idx) => {
      parts.push(`### ${idx + 1}. ${p.name}`);
      parts.push(`- **Current:** ${p.currentValue}`);
      parts.push(`- **Recommended:** ${p.recommendedValue}`);
      parts.push(`- **Reason:** ${p.reason}`);
      parts.push(`- **Impact:** ${p.impact}`);
      parts.push(`- **Confidence:** ${p.confidence}%\n`);
    });

    return parts.join("\n");
  }

  /**
   * Aplica ajuste tático
   */
  async applyAdjustment(adjustmentId: string, appliedBy?: string): Promise<boolean> {
    // Encontrar ajuste
    let adjustment: TacticAdjustment | null = null;
    let missionId = "";

    for (const [mid, adjustments] of this.activeAdjustments) {
      const found = adjustments.find(a => a.id === adjustmentId);
      if (found) {
        adjustment = found;
        missionId = mid;
        break;
      }
    }

    if (!adjustment) {
      logger.error("[MissionOptimizer] Adjustment not found", { adjustmentId });
      return false;
    }

    logger.info("[MissionOptimizer] Applying tactic adjustment", {
      adjustmentId,
      missionId,
      appliedBy,
    });

    try {
      // Registrar estado anterior
      const beforeState: Record<string, any> = {};
      adjustment.parameters.forEach(p => {
        beforeState[p.name] = p.currentValue;
      });

      // Aqui aplicaríamos as mudanças reais no sistema
      // Por enquanto, simulamos
      const afterState: Record<string, any> = {};
      adjustment.parameters.forEach(p => {
        afterState[p.name] = p.recommendedValue;
      });

      // Atualizar status
      adjustment.status = "applied";
      adjustment.appliedAt = new Date();

      // Registrar no histórico
      const change: TacticChangeHistory = {
        id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        missionId,
        adjustmentId,
        appliedAt: new Date(),
        appliedBy,
        beforeState,
        afterState,
        result: {
          successful: true,
          impact: adjustment.expectedImprovement,
          notes: "Adjustment applied successfully",
        },
      };

      const history = this.changeHistory.get(missionId) || [];
      history.push(change);
      this.changeHistory.set(missionId, history);

      // Salvar mudanças
      await this.saveAdjustment(adjustment);
      await this.saveChangeHistory(change);

      logger.info("[MissionOptimizer] Tactic adjustment applied successfully", {
        adjustmentId,
        missionId,
      });

      return true;
    } catch (error) {
      logger.error("[MissionOptimizer] Failed to apply adjustment", {
        adjustmentId,
        error,
      });
      adjustment.status = "rejected";
      await this.saveAdjustment(adjustment);
      return false;
    }
  }

  /**
   * Notifica operadores sobre ajuste
   */
  private async notifyOperators(adjustment: TacticAdjustment): Promise<void> {
    try {
      // Obter operadores da missão
      const { data: mission } = await supabase
        .from("missions")
        .select("assigned_operators")
        .eq("id", adjustment.missionId)
        .single();

      if (!mission || !mission.assigned_operators) {
        logger.warn("[MissionOptimizer] No operators to notify", {
          missionId: adjustment.missionId,
        });
        return;
      }

      const priority =
        adjustment.parameters.some(p => p.impact === "high") ? "high" : "medium";

      const notification: TacticNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        missionId: adjustment.missionId,
        operatorIds: mission.assigned_operators,
        adjustmentId: adjustment.id,
        title: "Tactic Adjustment Recommended",
        message: `${adjustment.parameters.length} tactical parameter(s) require adjustment. ${adjustment.triggeredBy}`,
        priority,
        requiresAcknowledgment: priority === "high",
        sentAt: new Date(),
      };

      await this.saveNotification(notification);

      logger.info("[MissionOptimizer] Operators notified", {
        missionId: adjustment.missionId,
        operatorsCount: mission.assigned_operators.length,
      });
    } catch (error) {
      logger.error("[MissionOptimizer] Failed to notify operators", { error });
    }
  }

  /**
   * Calcula tendência de valores
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    return ((last - first) / first) * 100;
  }

  /**
   * Inicia monitoramento contínuo
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      // Verificar ajustes pendentes
      await this.checkPendingAdjustments();
    }, this.config.monitoringIntervalMs);

    logger.info("[MissionOptimizer] Monitoring started", {
      intervalMs: this.config.monitoringIntervalMs,
    });
  }

  /**
   * Verifica ajustes pendentes
   */
  private async checkPendingAdjustments(): Promise<void> {
    for (const [missionId, adjustments] of this.activeAdjustments) {
      const pending = adjustments.filter(a => a.status === "proposed");

      for (const adj of pending) {
        const age = Date.now() - adj.proposedAt.getTime();
        const maxAge = 300000;  // 5 minutos

        if (age > maxAge) {
          logger.warn("[MissionOptimizer] Adjustment expired", {
            adjustmentId: adj.id,
            missionId,
            age,
          });
          adj.status = "rejected";
          await this.saveAdjustment(adj);
        }
      }
    }
  }

  /**
   * Obtém ajustes ativos de uma missão
   */
  getActiveAdjustments(missionId: string): TacticAdjustment[] {
    return (this.activeAdjustments.get(missionId) || []).filter(
      a => a.status === "proposed"
    );
  }

  /**
   * Obtém histórico de mudanças
   */
  getChangeHistory(missionId: string): TacticChangeHistory[] {
    return this.changeHistory.get(missionId) || [];
  }

  /**
   * Carrega histórico recente
   */
  private async loadRecentHistory(): Promise<void> {
    try {
      const { data: changes } = await supabase
        .from("ai_tactic_changes")
        .select("*")
        .order("applied_at", { ascending: false })
        .limit(50);

      if (changes) {
        changes.forEach((c: any) => {
          const history = this.changeHistory.get(c.mission_id) || [];
          history.push({
            ...c,
            appliedAt: new Date(c.applied_at),
          });
          this.changeHistory.set(c.mission_id, history);
        });

        logger.info("[MissionOptimizer] Loaded change history", {
          count: changes.length,
        });
      }
    } catch (error) {
      logger.error("[MissionOptimizer] Failed to load history", { error });
    }
  }

  /**
   * Salva dados de performance
   */
  private async savePerformanceData(data: PerformanceData): Promise<void> {
    try {
      await supabase.from("ai_mission_performance").insert({
        mission_id: data.missionId,
        timestamp: data.timestamp.toISOString(),
        metrics: data.metrics,
        issues: data.issues,
        raw_data: data.rawData,
      });
    } catch (error) {
      logger.error("[MissionOptimizer] Failed to save performance data", { error });
    }
  }

  /**
   * Salva ajuste
   */
  private async saveAdjustment(adjustment: TacticAdjustment): Promise<void> {
    try {
      await supabase.from("ai_tactic_adjustments").upsert({
        id: adjustment.id,
        mission_id: adjustment.missionId,
        triggered_by: adjustment.triggeredBy,
        parameters: adjustment.parameters,
        reasoning: adjustment.reasoning,
        expected_improvement: adjustment.expectedImprovement,
        status: adjustment.status,
        proposed_at: adjustment.proposedAt.toISOString(),
        applied_at: adjustment.appliedAt?.toISOString(),
      });
    } catch (error) {
      logger.error("[MissionOptimizer] Failed to save adjustment", { error });
    }
  }

  /**
   * Salva histórico de mudança
   */
  private async saveChangeHistory(change: TacticChangeHistory): Promise<void> {
    try {
      await supabase.from("ai_tactic_changes").insert({
        id: change.id,
        mission_id: change.missionId,
        adjustment_id: change.adjustmentId,
        applied_at: change.appliedAt.toISOString(),
        applied_by: change.appliedBy,
        before_state: change.beforeState,
        after_state: change.afterState,
        result: change.result,
      });
    } catch (error) {
      logger.error("[MissionOptimizer] Failed to save change history", { error });
    }
  }

  /**
   * Salva notificação
   */
  private async saveNotification(notification: TacticNotification): Promise<void> {
    try {
      await supabase.from("ai_tactic_notifications").insert({
        id: notification.id,
        mission_id: notification.missionId,
        operator_ids: notification.operatorIds,
        adjustment_id: notification.adjustmentId,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        requires_acknowledgment: notification.requiresAcknowledgment,
        sent_at: notification.sentAt.toISOString(),
      });
    } catch (error) {
      logger.error("[MissionOptimizer] Failed to save notification", { error });
    }
  }

  /**
   * Atualiza configuração
   */
  updateConfig(config: Partial<OptimizerConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info("[MissionOptimizer] Configuration updated", this.config);

    if (config.monitoringIntervalMs && this.monitoringInterval) {
      this.startMonitoring();
    }
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): OptimizerConfig {
    return { ...this.config };
  }

  /**
   * Finaliza o otimizador
   */
  async shutdown(): Promise<void> {
    logger.info("[MissionOptimizer] Shutting down mission optimizer");

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// Singleton instance
export const missionOptimizer = new MissionOptimizer();

export default missionOptimizer;
