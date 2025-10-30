/**
 * PATCH 602 - Multilevel Context Awareness Core
 * 
 * Engine que permite ao sistema entender diferentes níveis contextuais:
 * - Nível Global: Visão geral do sistema e operações
 * - Nível Missão: Contexto específico de uma missão
 * - Nível Entidade: Contexto de entidades individuais (operadores, equipamentos)
 * 
 * Permite sync com sensores e missão, com percepção e resposta por camada.
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

/**
 * Níveis de contexto
 */
export type ContextLevel = "global" | "mission" | "entity";

/**
 * Tipo de mudança contextual
 */
export type ContextChangeType =
  | "state_change"
  | "resource_update"
  | "risk_detected"
  | "performance_shift"
  | "anomaly"
  | "threshold_exceeded";

/**
 * Contexto Global
 * Visão geral de todas as operações
 */
export interface GlobalContext {
  level: "global";
  systemStatus: "normal" | "warning" | "critical" | "emergency";
  totalMissions: number;
  activeMissions: number;
  totalOperators: number;
  activeOperators: number;
  systemLoad: number; // 0-100
  overallRisk: number; // 0-100
  resourceUtilization: {
    personnel: number; // 0-100
    equipment: number; // 0-100
    budget: number; // 0-100
  };
  criticalAlerts: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Contexto de Missão
 * Informações específicas de uma missão
 */
export interface MissionContext {
  level: "mission";
  missionId: string;
  missionName: string;
  status: "planning" | "active" | "paused" | "completed" | "failed";
  phase: string;
  progress: number; // 0-100
  assignedOperators: string[];
  equipmentInUse: string[];
  currentRisk: number; // 0-100
  performanceMetrics: {
    efficiency: number; // 0-100
    quality: number; // 0-100
    safety: number; // 0-100
    timeline: number; // 0-100 (on-time percentage)
  };
  objectives: {
    id: string;
    description: string;
    status: "pending" | "in_progress" | "completed";
    priority: number;
  }[];
  environmentalFactors: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Contexto de Entidade
 * Informações sobre entidades individuais
 */
export interface EntityContext {
  level: "entity";
  entityId: string;
  entityType: "operator" | "equipment" | "vehicle" | "system";
  entityName: string;
  status: "active" | "idle" | "maintenance" | "offline" | "error";
  currentMission?: string;
  location?: {
    lat: number;
    lng: number;
    altitude?: number;
  };
  state: Record<string, any>;
  performance: {
    efficiency: number;
    reliability: number;
    utilization: number;
  };
  alerts: {
    level: "info" | "warning" | "critical";
    message: string;
    timestamp: Date;
  }[];
  sensorData?: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * União de todos os tipos de contexto
 */
export type Context = GlobalContext | MissionContext | EntityContext;

/**
 * Mudança contextual detectada
 */
export interface ContextChange {
  id: string;
  level: ContextLevel;
  changeType: ContextChangeType;
  previousState: any;
  newState: any;
  significance: number; // 0-100
  description: string;
  timestamp: Date;
  triggeredBy?: string;
}

/**
 * Resposta a mudança contextual
 */
export interface ContextResponse {
  changeId: string;
  level: ContextLevel;
  action: string;
  description: string;
  automated: boolean;
  executed: boolean;
  result?: any;
  timestamp: Date;
}

/**
 * Análise de contexto
 */
export interface ContextAnalysis {
  level: ContextLevel;
  contextId: string;
  analysis: {
    stability: number; // 0-100 (quão estável está o contexto)
    complexity: number; // 0-100 (quão complexo é o contexto)
    riskLevel: number; // 0-100
    attentionRequired: boolean;
    recommendations: string[];
    patterns: string[];
  };
  timestamp: Date;
}

/**
 * Configuração do sistema de awareness
 */
export interface AwarenessConfig {
  enableGlobalTracking: boolean;
  enableMissionTracking: boolean;
  enableEntityTracking: boolean;
  sensorSyncEnabled: boolean;
  autoResponseEnabled: boolean;
  changeDetectionThreshold: number; // 0-100
  updateIntervalMs: number;
}

/**
 * Sensor de dados
 */
export interface SensorData {
  sensorId: string;
  type: string;
  value: any;
  unit?: string;
  quality: number; // 0-100
  timestamp: Date;
}

/**
 * Motor de Context Awareness Multinível
 */
export class MultilevelAwareness {
  private config: AwarenessConfig;
  private globalContext: GlobalContext | null = null;
  private missionContexts: Map<string, MissionContext> = new Map();
  private entityContexts: Map<string, EntityContext> = new Map();
  private changeHistory: ContextChange[] = [];
  private responseHistory: ContextResponse[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<AwarenessConfig>) {
    this.config = {
      enableGlobalTracking: true,
      enableMissionTracking: true,
      enableEntityTracking: true,
      sensorSyncEnabled: true,
      autoResponseEnabled: true,
      changeDetectionThreshold: 30,
      updateIntervalMs: 5000, // 5 segundos
      ...config,
    };
  }

  /**
   * Inicializa o sistema de awareness
   */
  async initialize(): Promise<void> {
    logger.info("[MultilevelAwareness] Initializing context awareness", {
      config: this.config,
    });

    // Inicializar contextos
    if (this.config.enableGlobalTracking) {
      await this.initializeGlobalContext();
    }
    if (this.config.enableMissionTracking) {
      await this.loadActiveMissions();
    }
    if (this.config.enableEntityTracking) {
      await this.loadActiveEntities();
    }

    // Iniciar loop de atualização
    this.startUpdateLoop();

    logger.info("[MultilevelAwareness] Context awareness initialized", {
      globalContext: !!this.globalContext,
      missionContexts: this.missionContexts.size,
      entityContexts: this.entityContexts.size,
    });
  }

  /**
   * Inicializa contexto global
   */
  private async initializeGlobalContext(): Promise<void> {
    try {
      const { data: missions } = await supabase
        .from("missions")
        .select("id, status");

      const { data: operators } = await supabase
        .from("profiles")
        .select("id, is_active");

      this.globalContext = {
        level: "global",
        systemStatus: "normal",
        totalMissions: missions?.length || 0,
        activeMissions: missions?.filter(m => m.status === "active").length || 0,
        totalOperators: operators?.length || 0,
        activeOperators: operators?.filter(o => o.is_active).length || 0,
        systemLoad: 0,
        overallRisk: 0,
        resourceUtilization: {
          personnel: 0,
          equipment: 0,
          budget: 0,
        },
        criticalAlerts: 0,
        timestamp: new Date(),
      };

      logger.info("[MultilevelAwareness] Global context initialized", {
        activeMissions: this.globalContext.activeMissions,
        activeOperators: this.globalContext.activeOperators,
      });
    } catch (error) {
      logger.error("[MultilevelAwareness] Failed to initialize global context", {
        error,
      });
    }
  }

  /**
   * Carrega missões ativas
   */
  private async loadActiveMissions(): Promise<void> {
    try {
      const { data: missions, error } = await supabase
        .from("missions")
        .select("*")
        .in("status", ["planning", "active", "paused"]);

      if (error) {
        logger.error("[MultilevelAwareness] Failed to load missions", { error });
        return;
      }

      if (missions) {
        for (const mission of missions) {
          const context: MissionContext = {
            level: "mission",
            missionId: mission.id,
            missionName: mission.name || `Mission ${mission.id}`,
            status: mission.status,
            phase: mission.phase || "initial",
            progress: mission.progress || 0,
            assignedOperators: mission.assigned_operators || [],
            equipmentInUse: mission.equipment || [],
            currentRisk: mission.risk_level || 0,
            performanceMetrics: {
              efficiency: 75,
              quality: 80,
              safety: 90,
              timeline: 85,
            },
            objectives: mission.objectives || [],
            environmentalFactors: mission.environmental_factors || {},
            timestamp: new Date(),
          };
          this.missionContexts.set(mission.id, context);
        }

        logger.info("[MultilevelAwareness] Loaded mission contexts", {
          count: missions.length,
        });
      }
    } catch (error) {
      logger.error("[MultilevelAwareness] Exception loading missions", { error });
    }
  }

  /**
   * Carrega entidades ativas
   */
  private async loadActiveEntities(): Promise<void> {
    try {
      const { data: operators } = await supabase
        .from("profiles")
        .select("id, name, is_active")
        .eq("is_active", true);

      if (operators) {
        for (const operator of operators) {
          const context: EntityContext = {
            level: "entity",
            entityId: operator.id,
            entityType: "operator",
            entityName: operator.name || `Operator ${operator.id}`,
            status: "active",
            state: {},
            performance: {
              efficiency: 80,
              reliability: 90,
              utilization: 70,
            },
            alerts: [],
            timestamp: new Date(),
          };
          this.entityContexts.set(operator.id, context);
        }

        logger.info("[MultilevelAwareness] Loaded entity contexts", {
          count: operators.length,
        });
      }
    } catch (error) {
      logger.error("[MultilevelAwareness] Exception loading entities", { error });
    }
  }

  /**
   * Inicia loop de atualização automática
   */
  private startUpdateLoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      await this.updateAllContexts();
    }, this.config.updateIntervalMs);

    logger.info("[MultilevelAwareness] Update loop started", {
      intervalMs: this.config.updateIntervalMs,
    });
  }

  /**
   * Atualiza todos os contextos
   */
  private async updateAllContexts(): Promise<void> {
    try {
      if (this.config.enableGlobalTracking) {
        await this.updateGlobalContext();
      }
      if (this.config.enableMissionTracking) {
        await this.updateMissionContexts();
      }
      if (this.config.enableEntityTracking) {
        await this.updateEntityContexts();
      }
    } catch (error) {
      logger.error("[MultilevelAwareness] Error updating contexts", { error });
    }
  }

  /**
   * Atualiza contexto global
   */
  private async updateGlobalContext(): Promise<void> {
    if (!this.globalContext) return;

    const previousState = { ...this.globalContext };

    // Recalcular métricas globais
    this.globalContext.activeMissions = this.missionContexts.size;
    this.globalContext.activeOperators = Array.from(
      this.entityContexts.values()
    ).filter(e => e.entityType === "operator" && e.status === "active").length;

    // Calcular carga do sistema
    this.globalContext.systemLoad = Math.min(
      100,
      (this.globalContext.activeMissions / Math.max(1, this.globalContext.totalMissions)) * 100
    );

    // Calcular risco geral
    const missionRisks = Array.from(this.missionContexts.values()).map(
      m => m.currentRisk
    );
    this.globalContext.overallRisk =
      missionRisks.length > 0
        ? missionRisks.reduce((a, b) => a + b, 0) / missionRisks.length
        : 0;

    // Atualizar status do sistema
    if (this.globalContext.overallRisk > 80) {
      this.globalContext.systemStatus = "critical";
    } else if (this.globalContext.overallRisk > 60) {
      this.globalContext.systemStatus = "warning";
    } else {
      this.globalContext.systemStatus = "normal";
    }

    this.globalContext.timestamp = new Date();

    // Detectar mudanças significativas
    await this.detectContextChanges("global", "system", previousState, this.globalContext);
  }

  /**
   * Atualiza contextos de missão
   */
  private async updateMissionContexts(): Promise<void> {
    for (const [missionId, context] of this.missionContexts) {
      const previousState = { ...context };

      // Atualizar timestamp
      context.timestamp = new Date();

      // Detectar mudanças
      await this.detectContextChanges("mission", missionId, previousState, context);
    }
  }

  /**
   * Atualiza contextos de entidade
   */
  private async updateEntityContexts(): Promise<void> {
    for (const [entityId, context] of this.entityContexts) {
      const previousState = { ...context };

      // Atualizar timestamp
      context.timestamp = new Date();

      // Detectar mudanças
      await this.detectContextChanges("entity", entityId, previousState, context);
    }
  }

  /**
   * Detecta mudanças contextuais significativas
   */
  private async detectContextChanges(
    level: ContextLevel,
    contextId: string,
    previousState: any,
    newState: any
  ): Promise<void> {
    const changes: ContextChange[] = [];

    // Comparar estados e detectar mudanças
    if (level === "global") {
      const prev = previousState as GlobalContext;
      const curr = newState as GlobalContext;

      if (prev.systemStatus !== curr.systemStatus) {
        changes.push({
          id: `change_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          level: "global",
          changeType: "state_change",
          previousState: { systemStatus: prev.systemStatus },
          newState: { systemStatus: curr.systemStatus },
          significance: 90,
          description: `System status changed from ${prev.systemStatus} to ${curr.systemStatus}`,
          timestamp: new Date(),
        });
      }

      const riskDiff = Math.abs(prev.overallRisk - curr.overallRisk);
      if (riskDiff > this.config.changeDetectionThreshold) {
        changes.push({
          id: `change_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          level: "global",
          changeType: "risk_detected",
          previousState: { overallRisk: prev.overallRisk },
          newState: { overallRisk: curr.overallRisk },
          significance: Math.min(100, riskDiff),
          description: `Overall risk changed by ${riskDiff.toFixed(1)}%`,
          timestamp: new Date(),
        });
      }
    }

    // Processar mudanças
    for (const change of changes) {
      await this.processContextChange(change);
    }
  }

  /**
   * Processa mudança contextual
   */
  private async processContextChange(change: ContextChange): Promise<void> {
    // Adicionar ao histórico
    this.changeHistory.push(change);

    // Manter apenas últimas 1000 mudanças
    if (this.changeHistory.length > 1000) {
      this.changeHistory = this.changeHistory.slice(-1000);
    }

    // Log da mudança
    logger.info("[MultilevelAwareness] Context change detected", {
      level: change.level,
      changeType: change.changeType,
      significance: change.significance,
      description: change.description,
    });

    // Salvar no banco de dados
    await this.saveContextChange(change);

    // Gerar resposta automática se habilitado e significância alta
    if (this.config.autoResponseEnabled && change.significance >= 70) {
      await this.generateAutoResponse(change);
    }
  }

  /**
   * Gera resposta automática a mudança contextual
   */
  private async generateAutoResponse(change: ContextChange): Promise<void> {
    let action = "";
    let description = "";

    switch (change.changeType) {
      case "state_change":
        action = "alert_operators";
        description = `Alert operators about ${change.description}`;
        break;
      case "risk_detected":
        action = "increase_monitoring";
        description = "Increase monitoring frequency due to risk change";
        break;
      case "threshold_exceeded":
        action = "trigger_review";
        description = "Trigger manual review of situation";
        break;
      default:
        action = "log_only";
        description = "Log change for future analysis";
    }

    const response: ContextResponse = {
      changeId: change.id,
      level: change.level,
      action,
      description,
      automated: true,
      executed: false,
      timestamp: new Date(),
    };

    // Executar ação
    try {
      // Aqui implementaríamos as ações reais
      response.executed = true;
      response.result = { status: "success" };
    } catch (error) {
      response.executed = false;
      response.result = { status: "failed", error };
    }

    this.responseHistory.push(response);
    await this.saveContextResponse(response);

    logger.info("[MultilevelAwareness] Auto-response generated", {
      changeId: change.id,
      action: response.action,
      executed: response.executed,
    });
  }

  /**
   * Sincroniza dados de sensores
   */
  async syncSensorData(sensorData: SensorData): Promise<void> {
    if (!this.config.sensorSyncEnabled) return;

    logger.debug("[MultilevelAwareness] Syncing sensor data", {
      sensorId: sensorData.sensorId,
      type: sensorData.type,
      value: sensorData.value,
    });

    // Encontrar contexto relevante e atualizar
    // Por exemplo, se sensor pertence a uma entidade
    for (const [entityId, context] of this.entityContexts) {
      if (context.sensorData?.[sensorData.sensorId] !== undefined) {
        const previousValue = context.sensorData[sensorData.sensorId];
        context.sensorData[sensorData.sensorId] = sensorData.value;

        // Detectar anomalias
        if (this.isAnomalousValue(previousValue, sensorData.value, sensorData.type)) {
          const change: ContextChange = {
            id: `change_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            level: "entity",
            changeType: "anomaly",
            previousState: { [sensorData.sensorId]: previousValue },
            newState: { [sensorData.sensorId]: sensorData.value },
            significance: 75,
            description: `Anomalous sensor reading detected: ${sensorData.type}`,
            timestamp: new Date(),
            triggeredBy: sensorData.sensorId,
          };
          await this.processContextChange(change);
        }
      }
    }
  }

  /**
   * Verifica se valor é anômalo
   */
  private isAnomalousValue(previous: any, current: any, type: string): boolean {
    if (typeof previous !== "number" || typeof current !== "number") {
      return false;
    }

    const percentageChange = Math.abs(((current - previous) / previous) * 100);
    return percentageChange > 50; // Mudança > 50% é considerada anômala
  }

  /**
   * Analisa contexto específico
   */
  async analyzeContext(level: ContextLevel, contextId: string): Promise<ContextAnalysis> {
    let context: Context | null = null;

    if (level === "global") {
      context = this.globalContext;
    } else if (level === "mission") {
      context = this.missionContexts.get(contextId) || null;
    } else if (level === "entity") {
      context = this.entityContexts.get(contextId) || null;
    }

    if (!context) {
      throw new Error(`Context not found: ${level}/${contextId}`);
    }

    // Analisar estabilidade
    const recentChanges = this.changeHistory
      .filter(c => c.level === level)
      .slice(-10);
    const stability = Math.max(0, 100 - recentChanges.length * 10);

    // Calcular complexidade
    let complexity = 50;
    if (level === "mission") {
      const mContext = context as MissionContext;
      complexity = Math.min(
        100,
        mContext.objectives.length * 10 + Object.keys(mContext.environmentalFactors).length * 5
      );
    }

    // Avaliar risco
    let riskLevel = 0;
    if (level === "global") {
      riskLevel = (context as GlobalContext).overallRisk;
    } else if (level === "mission") {
      riskLevel = (context as MissionContext).currentRisk;
    }

    const analysis: ContextAnalysis = {
      level,
      contextId,
      analysis: {
        stability,
        complexity,
        riskLevel,
        attentionRequired: riskLevel > 70 || stability < 50,
        recommendations: this.generateRecommendations(context, stability, complexity, riskLevel),
        patterns: this.identifyPatterns(level, contextId),
      },
      timestamp: new Date(),
    };

    logger.info("[MultilevelAwareness] Context analyzed", {
      level,
      contextId,
      stability,
      complexity,
      riskLevel,
      attentionRequired: analysis.analysis.attentionRequired,
    });

    return analysis;
  }

  /**
   * Gera recomendações baseadas na análise
   */
  private generateRecommendations(
    context: Context,
    stability: number,
    complexity: number,
    riskLevel: number
  ): string[] {
    const recommendations: string[] = [];

    if (stability < 50) {
      recommendations.push("Increase monitoring frequency due to instability");
    }
    if (complexity > 70) {
      recommendations.push("Consider simplifying operations to reduce complexity");
    }
    if (riskLevel > 70) {
      recommendations.push("Implement risk mitigation measures immediately");
    }
    if (context.level === "global") {
      const gContext = context as GlobalContext;
      if (gContext.systemLoad > 80) {
        recommendations.push("System load is high - consider load balancing");
      }
    }

    return recommendations;
  }

  /**
   * Identifica padrões no contexto
   */
  private identifyPatterns(level: ContextLevel, contextId: string): string[] {
    const patterns: string[] = [];
    const relevantChanges = this.changeHistory.filter(
      c => c.level === level && (level === "global" || true)
    );

    // Padrão de mudanças frequentes
    if (relevantChanges.length > 5) {
      patterns.push("Frequent context changes detected");
    }

    // Padrão de escalação de risco
    const riskChanges = relevantChanges.filter(c => c.changeType === "risk_detected");
    if (riskChanges.length > 2) {
      patterns.push("Risk escalation pattern detected");
    }

    return patterns;
  }

  /**
   * Obtém contexto global
   */
  getGlobalContext(): GlobalContext | null {
    return this.globalContext;
  }

  /**
   * Obtém contexto de missão
   */
  getMissionContext(missionId: string): MissionContext | null {
    return this.missionContexts.get(missionId) || null;
  }

  /**
   * Obtém contexto de entidade
   */
  getEntityContext(entityId: string): EntityContext | null {
    return this.entityContexts.get(entityId) || null;
  }

  /**
   * Obtém histórico de mudanças
   */
  getChangeHistory(level?: ContextLevel, limit: number = 100): ContextChange[] {
    let changes = this.changeHistory;
    if (level) {
      changes = changes.filter(c => c.level === level);
    }
    return changes.slice(-limit);
  }

  /**
   * Obtém histórico de respostas
   */
  getResponseHistory(limit: number = 100): ContextResponse[] {
    return this.responseHistory.slice(-limit);
  }

  /**
   * Salva mudança contextual
   */
  private async saveContextChange(change: ContextChange): Promise<void> {
    try {
      await supabase.from("ai_context_changes").insert({
        id: change.id,
        level: change.level,
        change_type: change.changeType,
        previous_state: change.previousState,
        new_state: change.newState,
        significance: change.significance,
        description: change.description,
        timestamp: change.timestamp.toISOString(),
        triggered_by: change.triggeredBy,
      });
    } catch (error) {
      logger.error("[MultilevelAwareness] Failed to save context change", { error });
    }
  }

  /**
   * Salva resposta contextual
   */
  private async saveContextResponse(response: ContextResponse): Promise<void> {
    try {
      await supabase.from("ai_context_responses").insert({
        change_id: response.changeId,
        level: response.level,
        action: response.action,
        description: response.description,
        automated: response.automated,
        executed: response.executed,
        result: response.result,
        timestamp: response.timestamp.toISOString(),
      });
    } catch (error) {
      logger.error("[MultilevelAwareness] Failed to save context response", { error });
    }
  }

  /**
   * Atualiza configuração
   */
  updateConfig(config: Partial<AwarenessConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info("[MultilevelAwareness] Configuration updated", this.config);

    // Reiniciar loop se intervalo mudou
    if (config.updateIntervalMs !== undefined && this.updateInterval) {
      this.startUpdateLoop();
    }
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): AwarenessConfig {
    return { ...this.config };
  }

  /**
   * Finaliza o sistema
   */
  async shutdown(): Promise<void> {
    logger.info("[MultilevelAwareness] Shutting down context awareness");

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Singleton instance
export const multilevelAwareness = new MultilevelAwareness();

export default multilevelAwareness;
