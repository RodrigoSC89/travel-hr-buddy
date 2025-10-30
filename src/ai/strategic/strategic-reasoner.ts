/**
 * PATCH 601 - Strategic Reasoning Engine
 * 
 * Motor de raciocínio estratégico para tomada de decisão baseada em objetivos de missão.
 * Realiza planejamento de decisões baseado em heurísticas e resultados esperados,
 * com interface com contexto e engine de previsão e feedback explicável da IA.
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tipos de heurísticas disponíveis para decisão estratégica
 */
export type HeuristicType = 
  | "risk_minimization"      // Minimizar riscos
  | "resource_optimization"   // Otimizar recursos
  | "time_efficiency"        // Maximizar eficiência de tempo
  | "cost_reduction"         // Reduzir custos
  | "quality_maximization"   // Maximizar qualidade
  | "safety_priority";       // Priorizar segurança

/**
 * Tipos de decisão estratégica
 */
export type DecisionType =
  | "tactical"      // Decisão tática de curto prazo
  | "operational"   // Decisão operacional de médio prazo
  | "strategic";    // Decisão estratégica de longo prazo

/**
 * Status da decisão
 */
export type DecisionStatus =
  | "analyzing"     // Analisando opções
  | "proposed"      // Proposta gerada
  | "approved"      // Aprovada
  | "rejected"      // Rejeitada
  | "executing"     // Em execução
  | "completed"     // Completada
  | "failed";       // Falhou

/**
 * Objetivo de missão para decisão estratégica
 */
export interface MissionObjective {
  id: string;
  missionId: string;
  objective: string;
  priority: number;           // 0-100
  targetDate?: Date;
  constraints: string[];      // Restrições conhecidas
  successCriteria: string[];  // Critérios de sucesso
}

/**
 * Contexto para decisão estratégica
 */
export interface DecisionContext {
  missionId: string;
  objective: MissionObjective;
  currentState: Record<string, any>;
  availableResources: {
    personnel?: number;
    budget?: number;
    equipment?: string[];
    time?: number;  // em horas
  };
  historicalData?: {
    similarDecisions: number;
    successRate: number;
    avgCompletionTime: number;
  };
  environmentalFactors?: Record<string, any>;
}

/**
 * Resultado esperado de uma decisão
 */
export interface ExpectedOutcome {
  successProbability: number;  // 0-100
  estimatedDuration: number;   // em horas
  resourceUtilization: number; // 0-100
  riskLevel: number;          // 0-100
  costEstimate?: number;
  qualityScore?: number;       // 0-100
  safetyScore?: number;        // 0-100
}

/**
 * Opção de decisão estratégica
 */
export interface DecisionOption {
  id: string;
  name: string;
  description: string;
  heuristics: HeuristicType[];
  expectedOutcome: ExpectedOutcome;
  reasoning: string;           // Explicação da IA
  pros: string[];
  cons: string[];
  confidence: number;          // 0-100
  recommendationScore: number; // 0-100
}

/**
 * Decisão estratégica proposta
 */
export interface StrategicDecision {
  id: string;
  missionId: string;
  objectiveId: string;
  decisionType: DecisionType;
  context: DecisionContext;
  options: DecisionOption[];
  recommendedOption: DecisionOption;
  reasoning: string;           // Explicação completa da IA
  decisionChain: DecisionChainStep[];
  status: DecisionStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Passo na cadeia de decisão (para logging e explicabilidade)
 */
export interface DecisionChainStep {
  step: number;
  phase: string;
  description: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  reasoning: string;
  timestamp: Date;
  duration: number;  // em ms
}

/**
 * Configuração do motor de raciocínio
 */
export interface ReasonerConfig {
  enableExplainability: boolean;
  logDecisionChain: boolean;
  contextIntegration: boolean;
  predictionEngineEnabled: boolean;
  minConfidenceThreshold: number;  // 0-100
  maxOptionsToGenerate: number;
}

/**
 * Feedback sobre decisão executada
 */
export interface DecisionFeedback {
  decisionId: string;
  actualOutcome: {
    success: boolean;
    duration: number;
    resourcesUsed: number;
    qualityAchieved?: number;
  };
  variance: {
    durationVariance: number;
    resourceVariance: number;
    qualityVariance?: number;
  };
  lessons: string[];
  timestamp: Date;
}

/**
 * Motor de Raciocínio Estratégico
 */
export class StrategicReasoner {
  private config: ReasonerConfig;
  private decisionHistory: Map<string, StrategicDecision>;

  constructor(config?: Partial<ReasonerConfig>) {
    this.config = {
      enableExplainability: true,
      logDecisionChain: true,
      contextIntegration: true,
      predictionEngineEnabled: true,
      minConfidenceThreshold: 60,
      maxOptionsToGenerate: 5,
      ...config,
    };
    this.decisionHistory = new Map();
  }

  /**
   * Inicializa o motor de raciocínio
   */
  async initialize(): Promise<void> {
    logger.info("[StrategicReasoner] Initializing strategic reasoning engine", {
      config: this.config,
    });

    // Carregar histórico recente de decisões
    await this.loadRecentHistory();
  }

  /**
   * Carrega histórico recente de decisões
   */
  private async loadRecentHistory(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("ai_strategic_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        logger.error("[StrategicReasoner] Failed to load history", { error });
        return;
      }

      if (data) {
        data.forEach((decision: any) => {
          this.decisionHistory.set(decision.id, {
            ...decision,
            createdAt: new Date(decision.created_at),
            updatedAt: new Date(decision.updated_at),
          });
        });
        logger.info("[StrategicReasoner] Loaded decision history", {
          count: data.length,
        });
      }
    } catch (error) {
      logger.error("[StrategicReasoner] Exception loading history", { error });
    }
  }

  /**
   * Analisa contexto e gera decisão estratégica
   */
  async analyzeAndDecide(context: DecisionContext): Promise<StrategicDecision> {
    const startTime = Date.now();
    const decisionChain: DecisionChainStep[] = [];

    logger.info("[StrategicReasoner] Starting strategic analysis", {
      missionId: context.missionId,
      objective: context.objective.objective,
    });

    // Passo 1: Análise de contexto
    const contextAnalysis = await this.analyzeContext(context);
    decisionChain.push({
      step: 1,
      phase: "Context Analysis",
      description: "Analyzed mission context and constraints",
      inputs: { context },
      outputs: contextAnalysis,
      reasoning: "Evaluated current state, resources, and environmental factors",
      timestamp: new Date(),
      duration: Date.now() - startTime,
    });

    // Passo 2: Geração de opções usando heurísticas
    const options = await this.generateOptions(context, contextAnalysis);
    decisionChain.push({
      step: 2,
      phase: "Option Generation",
      description: `Generated ${options.length} strategic options`,
      inputs: { context, contextAnalysis },
      outputs: { options: options.map(o => ({ id: o.id, name: o.name, score: o.recommendationScore })) },
      reasoning: "Applied multiple heuristics to generate diverse decision options",
      timestamp: new Date(),
      duration: Date.now() - startTime,
    });

    // Passo 3: Avaliação e predição de resultados
    const evaluatedOptions = await this.evaluateOptions(options, context);
    decisionChain.push({
      step: 3,
      phase: "Option Evaluation",
      description: "Evaluated expected outcomes for each option",
      inputs: { options },
      outputs: { evaluatedOptions },
      reasoning: "Calculated success probability, risks, and resource utilization for each option",
      timestamp: new Date(),
      duration: Date.now() - startTime,
    });

    // Passo 4: Seleção da melhor opção
    const recommendedOption = this.selectBestOption(evaluatedOptions);
    decisionChain.push({
      step: 4,
      phase: "Option Selection",
      description: `Selected option: ${recommendedOption.name}`,
      inputs: { evaluatedOptions },
      outputs: { recommendedOption },
      reasoning: `Selected based on highest recommendation score (${recommendedOption.recommendationScore}) and confidence (${recommendedOption.confidence})`,
      timestamp: new Date(),
      duration: Date.now() - startTime,
    });

    // Passo 5: Gerar explicação completa
    const reasoning = this.generateExplanation(
      context,
      evaluatedOptions,
      recommendedOption,
      decisionChain
    );

    const decision: StrategicDecision = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      missionId: context.missionId,
      objectiveId: context.objective.id,
      decisionType: this.determineDecisionType(context),
      context,
      options: evaluatedOptions,
      recommendedOption,
      reasoning,
      decisionChain,
      status: "proposed",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Salvar decisão
    await this.saveDecision(decision);

    // Log cadeia de decisão
    if (this.config.logDecisionChain) {
      await this.logDecisionChain(decision);
    }

    logger.info("[StrategicReasoner] Strategic decision completed", {
      decisionId: decision.id,
      recommendedOption: recommendedOption.name,
      confidence: recommendedOption.confidence,
      duration: Date.now() - startTime,
    });

    return decision;
  }

  /**
   * Analisa contexto da missão
   */
  private async analyzeContext(context: DecisionContext): Promise<any> {
    // Integração com engine de contexto (PATCH 602)
    const analysis = {
      resourceAvailability: this.assessResourceAvailability(context),
      constraintSeverity: this.assessConstraints(context),
      timeUrgency: this.assessTimeUrgency(context),
      historicalInsights: context.historicalData || null,
      riskFactors: this.identifyRiskFactors(context),
    };

    return analysis;
  }

  /**
   * Gera opções de decisão usando múltiplas heurísticas
   */
  private async generateOptions(
    context: DecisionContext,
    contextAnalysis: any
  ): Promise<DecisionOption[]> {
    const options: DecisionOption[] = [];
    const heuristics: HeuristicType[] = [
      "risk_minimization",
      "resource_optimization",
      "time_efficiency",
      "cost_reduction",
      "quality_maximization",
      "safety_priority",
    ];

    // Gerar uma opção para cada heurística principal
    for (const heuristic of heuristics.slice(0, this.config.maxOptionsToGenerate)) {
      const option = this.generateOptionForHeuristic(heuristic, context, contextAnalysis);
      options.push(option);
    }

    return options;
  }

  /**
   * Gera uma opção baseada em uma heurística específica
   */
  private generateOptionForHeuristic(
    heuristic: HeuristicType,
    context: DecisionContext,
    analysis: any
  ): DecisionOption {
    const baseOutcome: ExpectedOutcome = {
      successProbability: 70,
      estimatedDuration: 24,
      resourceUtilization: 60,
      riskLevel: 40,
      qualityScore: 70,
      safetyScore: 80,
    };

    let option: DecisionOption;

    switch (heuristic) {
      case "risk_minimization":
        option = {
          id: `opt_risk_min_${Date.now()}`,
          name: "Minimize Risk Strategy",
          description: "Focus on reducing risk factors and ensuring safety",
          heuristics: [heuristic, "safety_priority"],
          expectedOutcome: {
            ...baseOutcome,
            successProbability: 85,
            riskLevel: 20,
            safetyScore: 95,
            estimatedDuration: 36, // Mais tempo para ser cauteloso
          },
          reasoning: "Prioritizes safety and risk reduction over speed and cost",
          pros: ["Highest safety score", "Lowest risk level", "High success probability"],
          cons: ["Longer duration", "Higher resource utilization"],
          confidence: 85,
          recommendationScore: 75,
        };
        break;

      case "resource_optimization":
        option = {
          id: `opt_resource_opt_${Date.now()}`,
          name: "Optimize Resource Usage",
          description: "Maximize efficiency of resource utilization",
          heuristics: [heuristic, "cost_reduction"],
          expectedOutcome: {
            ...baseOutcome,
            resourceUtilization: 85,
            costEstimate: context.availableResources.budget ? context.availableResources.budget * 0.7 : undefined,
            estimatedDuration: 28,
          },
          reasoning: "Focuses on efficient resource allocation and cost management",
          pros: ["Best resource efficiency", "Lower costs", "Moderate timeline"],
          cons: ["Moderate risk level", "Standard quality"],
          confidence: 78,
          recommendationScore: 72,
        };
        break;

      case "time_efficiency":
        option = {
          id: `opt_time_eff_${Date.now()}`,
          name: "Fast-Track Strategy",
          description: "Prioritize speed of execution",
          heuristics: [heuristic],
          expectedOutcome: {
            ...baseOutcome,
            estimatedDuration: 16,
            resourceUtilization: 90,
            riskLevel: 55,
            successProbability: 75,
          },
          reasoning: "Optimized for rapid completion with acceptable risk",
          pros: ["Fastest completion", "Quick results"],
          cons: ["Higher risk", "Higher resource usage", "Potentially lower quality"],
          confidence: 72,
          recommendationScore: 68,
        };
        break;

      case "cost_reduction":
        option = {
          id: `opt_cost_red_${Date.now()}`,
          name: "Cost-Efficient Strategy",
          description: "Minimize costs while maintaining quality",
          heuristics: [heuristic, "resource_optimization"],
          expectedOutcome: {
            ...baseOutcome,
            costEstimate: context.availableResources.budget ? context.availableResources.budget * 0.6 : undefined,
            resourceUtilization: 50,
            estimatedDuration: 32,
          },
          reasoning: "Balances cost savings with acceptable timeline",
          pros: ["Lowest cost", "Efficient resource use"],
          cons: ["Longer timeline", "May require compromises"],
          confidence: 75,
          recommendationScore: 70,
        };
        break;

      case "quality_maximization":
        option = {
          id: `opt_quality_max_${Date.now()}`,
          name: "Quality-First Strategy",
          description: "Maximize quality and thoroughness",
          heuristics: [heuristic],
          expectedOutcome: {
            ...baseOutcome,
            qualityScore: 95,
            successProbability: 90,
            estimatedDuration: 40,
            resourceUtilization: 80,
          },
          reasoning: "Prioritizes exceptional quality and thoroughness",
          pros: ["Highest quality", "Best success probability"],
          cons: ["Longest duration", "Higher costs"],
          confidence: 82,
          recommendationScore: 78,
        };
        break;

      case "safety_priority":
        option = {
          id: `opt_safety_pri_${Date.now()}`,
          name: "Safety-First Strategy",
          description: "Maximum emphasis on safety protocols",
          heuristics: [heuristic, "risk_minimization"],
          expectedOutcome: {
            ...baseOutcome,
            safetyScore: 98,
            riskLevel: 15,
            successProbability: 88,
            estimatedDuration: 38,
          },
          reasoning: "Ensures maximum safety compliance and protection",
          pros: ["Maximum safety", "Very low risk", "High success rate"],
          cons: ["Extended timeline", "Higher cost"],
          confidence: 87,
          recommendationScore: 80,
        };
        break;

      default:
        option = {
          id: `opt_balanced_${Date.now()}`,
          name: "Balanced Strategy",
          description: "Balanced approach across all factors",
          heuristics: [heuristic],
          expectedOutcome: baseOutcome,
          reasoning: "Provides balance across all decision factors",
          pros: ["Balanced approach", "Moderate in all aspects"],
          cons: ["Not optimized for any specific factor"],
          confidence: 70,
          recommendationScore: 65,
        };
    }

    return option;
  }

  /**
   * Avalia opções com predição de resultados
   */
  private async evaluateOptions(
    options: DecisionOption[],
    context: DecisionContext
  ): Promise<DecisionOption[]> {
    // Aqui poderíamos integrar com prediction engine (PATCH 581)
    // Por enquanto, ajustamos scores baseado no contexto

    return options.map(option => {
      let adjustedScore = option.recommendationScore;

      // Ajustar baseado em prioridades do objetivo
      if (context.objective.priority > 80) {
        // Alta prioridade: favorecer time_efficiency
        if (option.heuristics.includes("time_efficiency")) {
          adjustedScore += 10;
        }
      }

      // Ajustar baseado em recursos disponíveis
      const resourceConstraint = this.assessResourceAvailability(context);
      if (resourceConstraint < 0.5 && option.expectedOutcome.resourceUtilization > 80) {
        adjustedScore -= 15; // Penalizar opções que usam muitos recursos quando há escassez
      }

      // Ajustar baseado em histórico
      if (context.historicalData && context.historicalData.successRate > 0.8) {
        // Bom histórico: favorecer opções similares às bem-sucedidas
        adjustedScore += 5;
      }

      return {
        ...option,
        recommendationScore: Math.min(100, Math.max(0, adjustedScore)),
      };
    });
  }

  /**
   * Seleciona a melhor opção baseado em scores
   */
  private selectBestOption(options: DecisionOption[]): DecisionOption {
    return options.reduce((best, current) => {
      const bestScore = best.recommendationScore * (best.confidence / 100);
      const currentScore = current.recommendationScore * (current.confidence / 100);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Gera explicação completa da decisão (Explainable AI)
   */
  private generateExplanation(
    context: DecisionContext,
    options: DecisionOption[],
    recommended: DecisionOption,
    chain: DecisionChainStep[]
  ): string {
    const parts = [
      `# Strategic Decision Reasoning\n`,
      `## Mission Objective`,
      `${context.objective.objective}\n`,
      `**Priority:** ${context.objective.priority}/100`,
      `**Constraints:** ${context.objective.constraints.join(", ")}\n`,
      `## Analysis Process`,
      `Analyzed ${options.length} strategic options using multiple heuristics.`,
      `Decision chain involved ${chain.length} steps over ${chain[chain.length - 1]?.duration || 0}ms.\n`,
      `## Recommended Strategy: ${recommended.name}`,
      `**Confidence:** ${recommended.confidence}%`,
      `**Recommendation Score:** ${recommended.recommendationScore}/100\n`,
      `### Why This Option?`,
      recommended.reasoning,
      `\n### Expected Outcome:`,
      `- Success Probability: ${recommended.expectedOutcome.successProbability}%`,
      `- Estimated Duration: ${recommended.expectedOutcome.estimatedDuration} hours`,
      `- Resource Utilization: ${recommended.expectedOutcome.resourceUtilization}%`,
      `- Risk Level: ${recommended.expectedOutcome.riskLevel}%`,
      `- Quality Score: ${recommended.expectedOutcome.qualityScore || "N/A"}`,
      `- Safety Score: ${recommended.expectedOutcome.safetyScore || "N/A"}\n`,
      `### Advantages:`,
      ...recommended.pros.map(pro => `- ${pro}`),
      `\n### Considerations:`,
      ...recommended.cons.map(con => `- ${con}`),
      `\n## Alternative Options`,
      ...options
        .filter(o => o.id !== recommended.id)
        .slice(0, 2)
        .map(o => `\n### ${o.name} (Score: ${o.recommendationScore}/100)\n${o.reasoning}`),
    ];

    return parts.join("\n");
  }

  /**
   * Determina tipo de decisão baseado no contexto
   */
  private determineDecisionType(context: DecisionContext): DecisionType {
    if (context.objective.priority > 80) {
      return "tactical";
    } else if (context.objective.targetDate) {
      const daysUntilTarget = Math.floor(
        (context.objective.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilTarget < 7) return "tactical";
      if (daysUntilTarget < 30) return "operational";
    }
    return "strategic";
  }

  /**
   * Avalia disponibilidade de recursos (0-1)
   */
  private assessResourceAvailability(context: DecisionContext): number {
    const { availableResources } = context;
    let score = 0;
    let factors = 0;

    if (availableResources.personnel !== undefined) {
      score += availableResources.personnel > 0 ? 1 : 0;
      factors++;
    }
    if (availableResources.budget !== undefined) {
      score += availableResources.budget > 0 ? 1 : 0;
      factors++;
    }
    if (availableResources.equipment !== undefined) {
      score += availableResources.equipment.length > 0 ? 1 : 0;
      factors++;
    }
    if (availableResources.time !== undefined) {
      score += availableResources.time > 0 ? 1 : 0;
      factors++;
    }

    return factors > 0 ? score / factors : 0.5;
  }

  /**
   * Avalia severidade das restrições (0-1)
   */
  private assessConstraints(context: DecisionContext): number {
    const constraintCount = context.objective.constraints.length;
    return Math.min(1, constraintCount / 5); // Normalizado para max 5 constraints
  }

  /**
   * Avalia urgência de tempo (0-1)
   */
  private assessTimeUrgency(context: DecisionContext): number {
    if (!context.objective.targetDate) return 0.5;

    const daysUntilTarget = Math.floor(
      (context.objective.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilTarget < 1) return 1.0;
    if (daysUntilTarget < 7) return 0.8;
    if (daysUntilTarget < 30) return 0.5;
    return 0.2;
  }

  /**
   * Identifica fatores de risco
   */
  private identifyRiskFactors(context: DecisionContext): string[] {
    const risks: string[] = [];

    if (this.assessResourceAvailability(context) < 0.5) {
      risks.push("Limited resource availability");
    }
    if (this.assessTimeUrgency(context) > 0.7) {
      risks.push("High time pressure");
    }
    if (context.objective.constraints.length > 3) {
      risks.push("Multiple constraints");
    }
    if (context.historicalData && context.historicalData.successRate < 0.7) {
      risks.push("Low historical success rate");
    }

    return risks;
  }

  /**
   * Salva decisão no banco de dados
   */
  private async saveDecision(decision: StrategicDecision): Promise<void> {
    try {
      const { error } = await supabase.from("ai_strategic_decisions").insert({
        id: decision.id,
        mission_id: decision.missionId,
        objective_id: decision.objectiveId,
        decision_type: decision.decisionType,
        context: decision.context,
        options: decision.options,
        recommended_option: decision.recommendedOption,
        reasoning: decision.reasoning,
        decision_chain: decision.decisionChain,
        status: decision.status,
        created_at: decision.createdAt.toISOString(),
        updated_at: decision.updatedAt.toISOString(),
        metadata: decision.metadata,
      });

      if (error) {
        logger.error("[StrategicReasoner] Failed to save decision", { error });
      } else {
        this.decisionHistory.set(decision.id, decision);
      }
    } catch (error) {
      logger.error("[StrategicReasoner] Exception saving decision", { error });
    }
  }

  /**
   * Registra cadeia de decisão para auditoria
   */
  private async logDecisionChain(decision: StrategicDecision): Promise<void> {
    try {
      logger.info("[StrategicReasoner] Decision Chain", {
        decisionId: decision.id,
        missionId: decision.missionId,
        chain: decision.decisionChain.map(step => ({
          step: step.step,
          phase: step.phase,
          description: step.description,
          duration: step.duration,
        })),
      });

      // Salvar cada step individualmente para análise
      for (const step of decision.decisionChain) {
        await supabase.from("ai_decision_chain_logs").insert({
          decision_id: decision.id,
          step_number: step.step,
          phase: step.phase,
          description: step.description,
          inputs: step.inputs,
          outputs: step.outputs,
          reasoning: step.reasoning,
          timestamp: step.timestamp.toISOString(),
          duration_ms: step.duration,
        });
      }
    } catch (error) {
      logger.error("[StrategicReasoner] Failed to log decision chain", { error });
    }
  }

  /**
   * Registra feedback sobre decisão executada
   */
  async recordFeedback(feedback: DecisionFeedback): Promise<void> {
    try {
      logger.info("[StrategicReasoner] Recording decision feedback", {
        decisionId: feedback.decisionId,
        success: feedback.actualOutcome.success,
      });

      await supabase.from("ai_decision_feedback").insert({
        decision_id: feedback.decisionId,
        actual_outcome: feedback.actualOutcome,
        variance: feedback.variance,
        lessons: feedback.lessons,
        timestamp: feedback.timestamp.toISOString(),
      });

      // Atualizar status da decisão
      const decision = this.decisionHistory.get(feedback.decisionId);
      if (decision) {
        decision.status = feedback.actualOutcome.success ? "completed" : "failed";
        decision.updatedAt = new Date();
        await this.saveDecision(decision);
      }
    } catch (error) {
      logger.error("[StrategicReasoner] Failed to record feedback", { error });
    }
  }

  /**
   * Atualiza status de uma decisão
   */
  async updateDecisionStatus(
    decisionId: string,
    status: DecisionStatus
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("ai_strategic_decisions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", decisionId);

      if (error) {
        logger.error("[StrategicReasoner] Failed to update status", { error });
      } else {
        const decision = this.decisionHistory.get(decisionId);
        if (decision) {
          decision.status = status;
          decision.updatedAt = new Date();
        }
        logger.info("[StrategicReasoner] Updated decision status", {
          decisionId,
          status,
        });
      }
    } catch (error) {
      logger.error("[StrategicReasoner] Exception updating status", { error });
    }
  }

  /**
   * Obtém decisão por ID
   */
  getDecision(decisionId: string): StrategicDecision | undefined {
    return this.decisionHistory.get(decisionId);
  }

  /**
   * Obtém decisões por missão
   */
  getDecisionsByMission(missionId: string): StrategicDecision[] {
    return Array.from(this.decisionHistory.values()).filter(
      d => d.missionId === missionId
    );
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): ReasonerConfig {
    return { ...this.config };
  }

  /**
   * Atualiza configuração
   */
  updateConfig(config: Partial<ReasonerConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info("[StrategicReasoner] Configuration updated", this.config);
  }
}

// Singleton instance
export const strategicReasoner = new StrategicReasoner();

export default strategicReasoner;
