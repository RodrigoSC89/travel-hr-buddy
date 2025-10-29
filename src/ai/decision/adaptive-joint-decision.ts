/**
 * PATCH 594 - Adaptive Joint Decision Engine
 * 
 * Sistema de decisão conjunta IA+humano em tempo real
 * 
 * @module ai/decision/adaptive-joint-decision
 * @created 2025-01-24
 */

export type DecisionType = 'strategic' | 'tactical' | 'operational' | 'critical';
export type DecisionStatus = 'proposed' | 'under_review' | 'accepted' | 'rejected' | 'modified';
export type ConfidenceLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

export interface DecisionOption {
  id: string;
  description: string;
  pros: string[];
  cons: string[];
  riskLevel: 'low' | 'medium' | 'high';
  estimatedImpact: number; // 0-1 scale
  recommendedBy: 'ai' | 'human' | 'both';
}

export interface DecisionProposal {
  id: string;
  type: DecisionType;
  context: string;
  options: DecisionOption[];
  aiRecommendation: string;
  aiConfidence: ConfidenceLevel;
  requiresHumanApproval: boolean;
  timestamp: Date;
  deadline?: Date;
}

export interface OperatorReview {
  decisionId: string;
  status: DecisionStatus;
  selectedOptionId?: string;
  feedback: string;
  modifiedDecision?: Partial<DecisionOption>;
  reviewTime: Date;
  operator: string;
}

export interface DecisionResult {
  proposal: DecisionProposal;
  review: OperatorReview;
  executionStatus: 'pending' | 'executing' | 'completed' | 'failed';
  executionTime?: Date;
  outcome?: string;
}

export interface AIConfidenceAdjustment {
  decisionType: DecisionType;
  previousConfidence: ConfidenceLevel;
  newConfidence: ConfidenceLevel;
  reason: string;
  feedbackCount: number;
  successRate: number;
}

class AdaptiveJointDecision {
  private decisionHistory: DecisionResult[] = [];
  private confidenceLevels: Map<DecisionType, ConfidenceLevel> = new Map([
    ['strategic', 'medium'],
    ['tactical', 'medium'],
    ['operational', 'high'],
    ['critical', 'low']
  ]);
  private feedbackStats: Map<DecisionType, { accepted: number; rejected: number }> = new Map();

  /**
   * Propõe decisão com opções
   */
  proposeDecision(
    type: DecisionType,
    context: string,
    options: Omit<DecisionOption, 'id'>[],
    deadline?: Date
  ): DecisionProposal {
    // Gera IDs para as opções
    const optionsWithIds: DecisionOption[] = options.map((opt, idx) => ({
      ...opt,
      id: `opt-${Date.now()}-${idx}`
    }));

    // Determina recomendação da IA
    const aiRecommendation = this.generateAIRecommendation(optionsWithIds);
    const aiConfidence = this.confidenceLevels.get(type) || 'medium';

    // Decisões críticas sempre requerem aprovação humana
    const requiresHumanApproval = type === 'critical' || 
                                   aiConfidence === 'low' || 
                                   aiConfidence === 'very_low';

    const proposal: DecisionProposal = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      context,
      options: optionsWithIds,
      aiRecommendation,
      aiConfidence,
      requiresHumanApproval,
      timestamp: new Date(),
      deadline
    };

    console.log('[AdaptiveJointDecision] Decision proposed:', {
      id: proposal.id,
      type,
      optionsCount: optionsWithIds.length,
      aiConfidence,
      requiresHumanApproval,
      recommendation: aiRecommendation
    });

    return proposal;
  }

  /**
   * Permite revisão/aceite do operador
   */
  reviewDecision(
    proposal: DecisionProposal,
    status: DecisionStatus,
    operator: string,
    selectedOptionId?: string,
    feedback?: string,
    modifiedDecision?: Partial<DecisionOption>
  ): OperatorReview {
    const review: OperatorReview = {
      decisionId: proposal.id,
      status,
      selectedOptionId,
      feedback: feedback || '',
      modifiedDecision,
      reviewTime: new Date(),
      operator
    };

    // Registra resultado
    const result: DecisionResult = {
      proposal,
      review,
      executionStatus: status === 'accepted' ? 'pending' : 'completed'
    };

    this.decisionHistory.push(result);

    // Ajusta confiança baseado no feedback
    if (status === 'accepted' || status === 'rejected') {
      this.adjustAIConfidence(proposal.type, status === 'accepted');
    }

    console.log('[AdaptiveJointDecision] Decision reviewed:', {
      decisionId: proposal.id,
      status,
      operator,
      selectedOption: selectedOptionId,
      feedbackProvided: !!feedback
    });

    return review;
  }

  /**
   * Ajusta confiança da IA baseada em feedback
   */
  private adjustAIConfidence(type: DecisionType, accepted: boolean): AIConfidenceAdjustment {
    // Atualiza estatísticas
    const stats = this.feedbackStats.get(type) || { accepted: 0, rejected: 0 };
    if (accepted) {
      stats.accepted++;
    } else {
      stats.rejected++;
    }
    this.feedbackStats.set(type, stats);

    // Calcula taxa de sucesso
    const total = stats.accepted + stats.rejected;
    const successRate = stats.accepted / total;

    // Confiança anterior
    const previousConfidence = this.confidenceLevels.get(type) || 'medium';
    let newConfidence: ConfidenceLevel = previousConfidence;
    let reason = '';

    // Ajusta confiança baseado na taxa de sucesso
    if (total >= 5) { // Mínimo de 5 decisões para ajuste
      if (successRate >= 0.9) {
        newConfidence = 'very_high';
        reason = 'High success rate (>90%)';
      } else if (successRate >= 0.7) {
        newConfidence = 'high';
        reason = 'Good success rate (70-90%)';
      } else if (successRate >= 0.5) {
        newConfidence = 'medium';
        reason = 'Average success rate (50-70%)';
      } else if (successRate >= 0.3) {
        newConfidence = 'low';
        reason = 'Below average success rate (30-50%)';
      } else {
        newConfidence = 'very_low';
        reason = 'Poor success rate (<30%)';
      }

      this.confidenceLevels.set(type, newConfidence);
    }

    const adjustment: AIConfidenceAdjustment = {
      decisionType: type,
      previousConfidence,
      newConfidence,
      reason: reason || 'Insufficient data for adjustment',
      feedbackCount: total,
      successRate
    };

    console.log('[AdaptiveJointDecision] AI confidence adjusted:', {
      type,
      previousConfidence,
      newConfidence,
      successRate: (successRate * 100).toFixed(1) + '%',
      totalFeedback: total
    });

    return adjustment;
  }

  /**
   * Gera recomendação da IA
   */
  private generateAIRecommendation(options: DecisionOption[]): string {
    if (options.length === 0) {
      return 'Nenhuma opção disponível';
    }

    // Pontua cada opção
    const scoredOptions = options.map(opt => {
      let score = 0;
      
      // Pontos positivos
      score += opt.pros.length * 2;
      score += (1 - opt.riskLevel === 'low' ? 0 : opt.riskLevel === 'medium' ? 0.5 : 1) * 3;
      score += opt.estimatedImpact * 5;
      
      // Pontos negativos
      score -= opt.cons.length * 1.5;

      return { option: opt, score };
    });

    // Ordena por pontuação
    scoredOptions.sort((a, b) => b.score - a.score);
    const bestOption = scoredOptions[0].option;

    return `Recomendo: "${bestOption.description}" (ID: ${bestOption.id}). ` +
           `Risco: ${bestOption.riskLevel}, Impacto: ${(bestOption.estimatedImpact * 100).toFixed(0)}%. ` +
           `Principais vantagens: ${bestOption.pros.slice(0, 2).join(', ')}.`;
  }

  /**
   * Obtém histórico de decisões
   */
  getDecisionHistory(filterByType?: DecisionType): DecisionResult[] {
    if (filterByType) {
      return this.decisionHistory.filter(d => d.proposal.type === filterByType);
    }
    return [...this.decisionHistory];
  }

  /**
   * Obtém estatísticas de feedback
   */
  getFeedbackStats(type?: DecisionType): Map<DecisionType, { accepted: number; rejected: number }> | { accepted: number; rejected: number } | undefined {
    if (type) {
      return this.feedbackStats.get(type);
    }
    return new Map(this.feedbackStats);
  }

  /**
   * Obtém nível de confiança atual
   */
  getConfidenceLevel(type: DecisionType): ConfidenceLevel {
    return this.confidenceLevels.get(type) || 'medium';
  }

  /**
   * Registra execução de decisão
   */
  executeDecision(decisionId: string): void {
    const result = this.decisionHistory.find(d => d.proposal.id === decisionId);
    if (result) {
      result.executionStatus = 'executing';
      result.executionTime = new Date();
      
      console.log('[AdaptiveJointDecision] Decision execution started:', {
        decisionId,
        type: result.proposal.type
      });
    }
  }

  /**
   * Completa execução de decisão
   */
  completeDecision(decisionId: string, outcome: string): void {
    const result = this.decisionHistory.find(d => d.proposal.id === decisionId);
    if (result) {
      result.executionStatus = 'completed';
      result.outcome = outcome;
      
      console.log('[AdaptiveJointDecision] Decision execution completed:', {
        decisionId,
        outcome
      });
    }
  }

  /**
   * Marca execução como falha
   */
  failDecision(decisionId: string, outcome: string): void {
    const result = this.decisionHistory.find(d => d.proposal.id === decisionId);
    if (result) {
      result.executionStatus = 'failed';
      result.outcome = outcome;
      
      // Ajusta confiança para baixo em caso de falha
      this.adjustAIConfidence(result.proposal.type, false);
      
      console.log('[AdaptiveJointDecision] Decision execution failed:', {
        decisionId,
        outcome
      });
    }
  }

  /**
   * Limpa histórico de decisões
   */
  clearHistory(): void {
    this.decisionHistory = [];
  }

  /**
   * Reseta estatísticas de feedback
   */
  resetFeedbackStats(): void {
    this.feedbackStats.clear();
  }
}

// Instância singleton
export const adaptiveJointDecision = new AdaptiveJointDecision();
