/**
 * Autonomous AI Module - PATCH 851
 * Self-learning AI with automatic decisions, justifications, and feedback loop
 */

import { Logger } from "@/lib/utils/logger";
import { patternRecognition, type BehaviorPattern } from "./PatternRecognition";
import { hotfixManager } from "./HotfixManager";

// Decision types
export type DecisionType = 
  | "auto-scale"
  | "cache-optimize"
  | "alert-suppress"
  | "resource-allocate"
  | "failover"
  | "maintenance-schedule"
  | "anomaly-response";

export type DecisionStatus = "pending" | "approved" | "rejected" | "executed" | "failed";
export type ConfidenceLevel = "low" | "medium" | "high" | "critical";

// Core interfaces
export interface AIDecision {
  id: string;
  type: DecisionType;
  title: string;
  description: string;
  justification: AIJustification;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  impact: "low" | "medium" | "high";
  status: DecisionStatus;
  autoApprove: boolean;
  createdAt: string;
  executedAt?: string;
  feedback?: DecisionFeedback;
  rollbackable: boolean;
  rollbackAction?: () => Promise<boolean>;
}

export interface AIJustification {
  reasoning: string;
  dataPoints: DataPoint[];
  historicalContext?: string;
  riskAssessment: RiskAssessment;
  alternatives?: Alternative[];
}

export interface DataPoint {
  metric: string;
  value: number | string;
  trend?: "up" | "down" | "stable";
  weight: number;
}

export interface RiskAssessment {
  level: "low" | "medium" | "high";
  factors: string[];
  mitigations: string[];
}

export interface Alternative {
  action: string;
  pros: string[];
  cons: string[];
  confidence: number;
}

export interface DecisionFeedback {
  wasCorrect: boolean;
  actualOutcome: string;
  userRating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  timestamp: string;
}

export interface LearningMetrics {
  totalDecisions: number;
  correctDecisions: number;
  accuracy: number;
  averageConfidence: number;
  improvementRate: number;
  learningCycles: number;
}

// Autonomous AI Engine
class AutonomousAI {
  private decisions: Map<string, AIDecision> = new Map();
  private learningMetrics: LearningMetrics = {
    totalDecisions: 0,
    correctDecisions: 0,
    accuracy: 0,
    averageConfidence: 0,
    improvementRate: 0,
    learningCycles: 0
  };
  private isActive = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MONITORING_INTERVAL_MS = 30000; // 30 seconds
  private readonly AUTO_APPROVE_THRESHOLD = 0.85; // 85% confidence
  private readonly STORAGE_KEY = "nautilus_ai_decisions";

  constructor() {
    this.loadState();
  }

  // Start autonomous monitoring
  start() {
    const ENABLE = import.meta.env.VITE_ENABLE_AUTONOMY === "true";
    if (!ENABLE) {
      Logger.info("AutonomousAI disabled", undefined, "AutonomousAI");
      return;
    }

    if (this.isActive) return;
    this.isActive = true;

    Logger.info("AutonomousAI starting", { metrics: this.learningMetrics }, "AutonomousAI");

    this.monitoringInterval = setInterval(() => {
      this.analyzeAndDecide();
    }, this.MONITORING_INTERVAL_MS);
  }

  stop() {
    this.isActive = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.saveState();
    Logger.info("AutonomousAI stopped", undefined, "AutonomousAI");
  }

  // Main decision-making loop
  private async analyzeAndDecide() {
    if (!this.isActive) return;

    try {
      // Analyze current system state
      const systemState = this.collectSystemMetrics();
      
      // Generate decisions based on patterns and metrics
      const potentialDecisions = this.generateDecisions(systemState);

      for (const decision of potentialDecisions) {
        // Check if should auto-approve
        if (decision.autoApprove && decision.confidence >= this.AUTO_APPROVE_THRESHOLD) {
          await this.executeDecision(decision.id);
        } else {
          // Queue for human review
          Logger.info("Decision pending review", { 
            id: decision.id, 
            type: decision.type,
            confidence: decision.confidence 
          }, "AutonomousAI");
        }
      }
    } catch (error) {
      Logger.error("Analysis cycle failed", error, "AutonomousAI");
    }
  }

  // Collect system metrics for decision-making
  private collectSystemMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};

    // Performance metrics
    if (typeof performance !== "undefined") {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (memory) {
        metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      }
    }

    // Connection metrics
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const conn = (navigator as Navigator & { connection?: { downlink?: number; rtt?: number } }).connection;
      if (conn) {
        metrics.networkSpeed = conn.downlink || 10;
        metrics.networkLatency = conn.rtt || 50;
      }
    }

    // Pattern-based metrics
    const patternStats = patternRecognition.getStatistics();
    metrics.patternConfidence = patternStats.averageConfidence;
    metrics.knownFailures = patternStats.knownFailures;

    // Hotfix metrics
    const hotfixStats = hotfixManager.getStatistics();
    metrics.pendingHotfixes = hotfixStats.totalHotfixes - hotfixStats.totalApplied;

    return metrics;
  }

  // Generate decisions based on system state
  private generateDecisions(metrics: Record<string, number>): AIDecision[] {
    const decisions: AIDecision[] = [];

    // Memory optimization decision
    if (metrics.memoryUsage && metrics.memoryUsage > 0.7) {
      decisions.push(this.createDecision({
        type: "cache-optimize",
        title: "Otimizar Cache de Memória",
        description: "Uso de memória acima de 70%. Recomenda-se limpar caches não essenciais.",
        dataPoints: [
          { metric: "Uso de Memória", value: `${(metrics.memoryUsage * 100).toFixed(1)}%`, trend: "up", weight: 0.8 }
        ],
        reasoning: "Análise detectou consumo elevado de memória heap. Limpeza de caches pode prevenir degradação de performance.",
        riskLevel: "low",
        impact: "low",
        autoApprove: true
      }));
    }

    // Network optimization decision
    if (metrics.networkLatency && metrics.networkLatency > 200) {
      decisions.push(this.createDecision({
        type: "resource-allocate",
        title: "Ativar Modo Offline-First",
        description: "Latência de rede elevada detectada. Recomenda-se priorizar dados locais.",
        dataPoints: [
          { metric: "Latência", value: `${metrics.networkLatency}ms`, trend: "up", weight: 0.7 },
          { metric: "Velocidade", value: `${metrics.networkSpeed} Mbps`, weight: 0.3 }
        ],
        reasoning: "Condições de rede degradadas detectadas. Modo offline-first pode melhorar experiência do usuário.",
        riskLevel: "low",
        impact: "medium",
        autoApprove: false
      }));
    }

    // Pattern-based decision
    if (metrics.knownFailures && metrics.knownFailures > 0) {
      decisions.push(this.createDecision({
        type: "anomaly-response",
        title: "Aplicar Correções Preventivas",
        description: `${metrics.knownFailures} padrões de falha conhecidos detectados.`,
        dataPoints: [
          { metric: "Padrões de Falha", value: metrics.knownFailures, weight: 0.9 }
        ],
        reasoning: "Sistema identificou padrões de falha previamente catalogados. Aplicação de hotfixes pode prevenir incidentes.",
        riskLevel: "medium",
        impact: "medium",
        autoApprove: metrics.patternConfidence > 80
      }));
    }

    return decisions;
  }

  // Create a structured decision
  private createDecision(params: {
    type: DecisionType;
    title: string;
    description: string;
    dataPoints: DataPoint[];
    reasoning: string;
    riskLevel: "low" | "medium" | "high";
    impact: "low" | "medium" | "high";
    autoApprove: boolean;
  }): AIDecision {
    const confidence = this.calculateConfidence(params.dataPoints);
    const confidenceLevel = this.getConfidenceLevel(confidence);

    const decision: AIDecision = {
      id: `decision_${Date.now()}_${crypto.randomUUID().slice(0, 9)}`,
      type: params.type,
      title: params.title,
      description: params.description,
      confidence,
      confidenceLevel,
      impact: params.impact,
      status: "pending",
      autoApprove: params.autoApprove,
      createdAt: new Date().toISOString(),
      rollbackable: true,
      justification: {
        reasoning: params.reasoning,
        dataPoints: params.dataPoints,
        historicalContext: this.getHistoricalContext(params.type),
        riskAssessment: {
          level: params.riskLevel,
          factors: this.getRiskFactors(params.type),
          mitigations: this.getMitigations(params.type)
        },
        alternatives: this.generateAlternatives(params.type)
      }
    };

    this.decisions.set(decision.id, decision);
    this.saveState();

    return decision;
  }

  // Calculate confidence score
  private calculateConfidence(dataPoints: DataPoint[]): number {
    if (dataPoints.length === 0) return 0.5;

    const totalWeight = dataPoints.reduce((sum, dp) => sum + dp.weight, 0);
    const weightedSum = dataPoints.reduce((sum, dp) => {
      const normalizedValue = typeof dp.value === "number" ? Math.min(dp.value / 100, 1) : 0.7;
      return sum + (normalizedValue * dp.weight);
    }, 0);

    // Factor in historical accuracy
    const historyFactor = this.learningMetrics.accuracy > 0 ? this.learningMetrics.accuracy : 0.5;
    
    return Math.min(0.95, (weightedSum / totalWeight) * 0.7 + historyFactor * 0.3);
  }

  private getConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence >= 0.9) return "critical";
    if (confidence >= 0.75) return "high";
    if (confidence >= 0.5) return "medium";
    return "low";
  }

  private getHistoricalContext(type: DecisionType): string {
    const patterns = patternRecognition.getAllPatterns();
    const relatedPatterns = patterns.filter(p => p.trigger.includes(type));
    
    if (relatedPatterns.length === 0) {
      return "Primeira ocorrência deste tipo de decisão.";
    }

    const avgSuccess = relatedPatterns.reduce((sum, p) => sum + p.successRate, 0) / relatedPatterns.length;
    return `Baseado em ${relatedPatterns.length} ocorrências anteriores com taxa de sucesso de ${avgSuccess.toFixed(0)}%.`;
  }

  private getRiskFactors(type: DecisionType): string[] {
    const factors: Record<DecisionType, string[]> = {
      "auto-scale": ["Custo adicional de recursos", "Tempo de propagação"],
      "cache-optimize": ["Perda temporária de dados em cache", "Recarga de dados"],
      "alert-suppress": ["Possível perda de alertas válidos"],
      "resource-allocate": ["Redistribuição pode causar latência temporária"],
      "failover": ["Possível perda de estado não persistido"],
      "maintenance-schedule": ["Janela de manutenção pode afetar usuários"],
      "anomaly-response": ["Ação automática pode não ser ideal para todos os casos"]
    };
    return factors[type] || ["Risco não catalogado"];
  }

  private getMitigations(type: DecisionType): string[] {
    const mitigations: Record<DecisionType, string[]> = {
      "auto-scale": ["Limites de escala configurados", "Monitoramento de custos ativo"],
      "cache-optimize": ["Dados críticos preservados", "Rebuild automático"],
      "alert-suppress": ["Logs completos mantidos", "Revisão periódica"],
      "resource-allocate": ["Alocação gradual", "Rollback automático disponível"],
      "failover": ["Checkpoint de estado antes da ação", "Multi-region backup"],
      "maintenance-schedule": ["Notificação prévia aos usuários", "Janela de baixo uso"],
      "anomaly-response": ["Validação por padrões conhecidos", "Intervenção humana possível"]
    };
    return mitigations[type] || ["Monitoramento contínuo"];
  }

  private generateAlternatives(type: DecisionType): Alternative[] {
    const alternatives: Record<DecisionType, Alternative[]> = {
      "cache-optimize": [
        {
          action: "Limpar apenas caches expirados",
          pros: ["Menor impacto", "Mais rápido"],
          cons: ["Pode não resolver problema"],
          confidence: 0.6
        },
        {
          action: "Aguardar e monitorar",
          pros: ["Zero risco", "Permite análise mais profunda"],
          cons: ["Problema pode piorar"],
          confidence: 0.4
        }
      ],
      "failover": [
        {
          action: "Failover parcial",
          pros: ["Menor disrupção"],
          cons: ["Complexidade maior"],
          confidence: 0.7
        }
      ],
      "auto-scale": [],
      "alert-suppress": [],
      "resource-allocate": [],
      "maintenance-schedule": [],
      "anomaly-response": []
    };
    return alternatives[type] || [];
  }

  // Execute a decision
  async executeDecision(decisionId: string): Promise<boolean> {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      Logger.warn("Decision not found", { decisionId }, "AutonomousAI");
      return false;
    }

    if (decision.status === "executed") {
      Logger.warn("Decision already executed", { decisionId }, "AutonomousAI");
      return false;
    }

    decision.status = "executed";
    decision.executedAt = new Date().toISOString();

    try {
      // Execute based on decision type
      const success = await this.performAction(decision);
      
      if (!success) {
        decision.status = "failed";
      }

      // Record in pattern recognition
      patternRecognition.recordAction({
        id: decision.id,
        moduleId: decision.type,
        action: "hotfix",
        reason: decision.description,
        confidence: decision.confidence,
        timestamp: decision.executedAt,
        success
      }, success);

      this.saveState();
      
      Logger.info("Decision executed", { 
        decisionId, 
        type: decision.type, 
        success 
      }, "AutonomousAI");

      return success;
    } catch (error) {
      decision.status = "failed";
      Logger.error("Decision execution failed", error, "AutonomousAI");
      return false;
    }
  }

  private async performAction(decision: AIDecision): Promise<boolean> {
    switch (decision.type) {
      case "cache-optimize":
        return this.optimizeCache();
      case "resource-allocate":
        return this.reallocateResources();
      case "anomaly-response":
        return this.respondToAnomaly();
      default:
        Logger.info("No action handler for decision type", { type: decision.type }, "AutonomousAI");
        return true;
    }
  }

  private async optimizeCache(): Promise<boolean> {
    try {
      // Clear non-essential caches
      const cacheKeys = Object.keys(sessionStorage).filter(k => 
        k.startsWith("cache_") && !k.includes("critical")
      );
      cacheKeys.forEach(k => sessionStorage.removeItem(k));
      return true;
    } catch {
      return false;
    }
  }

  private async reallocateResources(): Promise<boolean> {
    // Enable offline-first mode
    sessionStorage.setItem("nautilus_offline_first", "true");
    return true;
  }

  private async respondToAnomaly(): Promise<boolean> {
    // Apply pending hotfixes
    const hotfixes = hotfixManager.getAllHotfixes();
    for (const hotfix of hotfixes) {
      if (hotfix.appliedCount === 0) {
        await hotfixManager.applyHotfix(hotfix.moduleId);
      }
    }
    return true;
  }

  // Approve a pending decision
  approveDecision(decisionId: string): boolean {
    const decision = this.decisions.get(decisionId);
    if (!decision || decision.status !== "pending") return false;
    
    decision.status = "approved";
    this.saveState();
    return true;
  }

  // Reject a pending decision
  rejectDecision(decisionId: string, reason?: string): boolean {
    const decision = this.decisions.get(decisionId);
    if (!decision || decision.status !== "pending") return false;
    
    decision.status = "rejected";
    if (reason) {
      decision.feedback = {
        wasCorrect: false,
        actualOutcome: reason,
        timestamp: new Date().toISOString()
      };
    }
    this.saveState();
    return true;
  }

  // Feedback loop - learn from outcomes
  provideFeedback(decisionId: string, feedback: Omit<DecisionFeedback, "timestamp">): void {
    const decision = this.decisions.get(decisionId);
    if (!decision) return;

    decision.feedback = {
      ...feedback,
      timestamp: new Date().toISOString()
    };

    // Update learning metrics
    this.learningMetrics.totalDecisions++;
    if (feedback.wasCorrect) {
      this.learningMetrics.correctDecisions++;
    }
    this.learningMetrics.accuracy = 
      this.learningMetrics.correctDecisions / this.learningMetrics.totalDecisions;
    this.learningMetrics.learningCycles++;

    // Calculate improvement rate
    if (this.learningMetrics.learningCycles > 10) {
      const recentDecisions = Array.from(this.decisions.values())
        .filter(d => d.feedback)
        .slice(-10);
      const recentAccuracy = recentDecisions.filter(d => d.feedback?.wasCorrect).length / 10;
      this.learningMetrics.improvementRate = recentAccuracy - this.learningMetrics.accuracy;
    }

    this.saveState();
    
    Logger.info("Feedback recorded", { 
      decisionId, 
      wasCorrect: feedback.wasCorrect,
      newAccuracy: this.learningMetrics.accuracy 
    }, "AutonomousAI");
  }

  // Rollback a decision if possible
  async rollbackDecision(decisionId: string): Promise<boolean> {
    const decision = this.decisions.get(decisionId);
    if (!decision || !decision.rollbackable) return false;

    if (decision.rollbackAction) {
      const success = await decision.rollbackAction();
      if (success) {
        decision.status = "rejected";
        this.saveState();
      }
      return success;
    }

    return false;
  }

  // Get all decisions
  getDecisions(filter?: { status?: DecisionStatus; type?: DecisionType }): AIDecision[] {
    let decisions = Array.from(this.decisions.values());
    
    if (filter?.status) {
      decisions = decisions.filter(d => d.status === filter.status);
    }
    if (filter?.type) {
      decisions = decisions.filter(d => d.type === filter.type);
    }

    return decisions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Get pending decisions requiring human review
  getPendingDecisions(): AIDecision[] {
    return this.getDecisions({ status: "pending" });
  }

  // Get learning metrics
  getLearningMetrics(): LearningMetrics {
    return { ...this.learningMetrics };
  }

  // Get statistics
  getStatistics() {
    const decisions = Array.from(this.decisions.values());
    
    return {
      total: decisions.length,
      pending: decisions.filter(d => d.status === "pending").length,
      executed: decisions.filter(d => d.status === "executed").length,
      failed: decisions.filter(d => d.status === "failed").length,
      rejected: decisions.filter(d => d.status === "rejected").length,
      accuracy: this.learningMetrics.accuracy,
      averageConfidence: decisions.length > 0
        ? decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length
        : 0,
      isActive: this.isActive
    };
  }

  // Persistence
  private loadState() {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.decisions = new Map(data.decisions || []);
        this.learningMetrics = data.learningMetrics || this.learningMetrics;
      }
    } catch {
      // Ignore load errors
    }
  }

  private saveState() {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        decisions: Array.from(this.decisions.entries()),
        learningMetrics: this.learningMetrics
      }));
    } catch {
      // Ignore save errors
    }
  }
}

export const autonomousAI = new AutonomousAI();
