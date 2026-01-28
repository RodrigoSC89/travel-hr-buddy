/**
 * AI Consensus System - Enterprise Excellence v5.0
 * Multi-model voting and agreement for critical decisions
 */

import { logger } from "@/lib/logger";

interface ModelResponse {
  provider: string;
  model: string;
  response: string;
  confidence: number;
  latencyMs: number;
  tokens: number;
}

interface ConsensusResult {
  finalResponse: string;
  confidence: number;
  agreement: number; // 0-1 scale
  responses: ModelResponse[];
  votingMethod: 'majority' | 'weighted' | 'unanimous';
  disagreements: string[];
  humanReviewRequired: boolean;
}

interface ConsensusConfig {
  minModels: number;
  confidenceThreshold: number;
  agreementThreshold: number;
  timeout: number;
  requireUnanimous: boolean;
}

type VotingWeight = Record<string, number>;

class ConsensusSystem {
  private static instance: ConsensusSystem;
  private readonly defaultConfig: ConsensusConfig = {
    minModels: 2,
    confidenceThreshold: 0.7,
    agreementThreshold: 0.6,
    timeout: 30000,
    requireUnanimous: false
  };

  private readonly modelWeights: VotingWeight = {
    'gpt-4o': 1.2,
    'gpt-4': 1.0,
    'claude-3-opus': 1.1,
    'claude-3-sonnet': 0.9,
    'gemini-pro': 0.85,
    'gemini-flash': 0.7,
    'llama-3': 0.6
  };

  private constructor() {}

  static getInstance(): ConsensusSystem {
    if (!ConsensusSystem.instance) {
      ConsensusSystem.instance = new ConsensusSystem();
    }
    return ConsensusSystem.instance;
  }

  /**
   * Query multiple models and reach consensus
   */
  async queryWithConsensus(
    prompt: string,
    queryFunctions: Array<() => Promise<ModelResponse>>,
    config: Partial<ConsensusConfig> = {}
  ): Promise<ConsensusResult> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();

    try {
      // Execute all queries in parallel with timeout
      const responses = await this.executeQueries(queryFunctions, finalConfig.timeout);

      // Validate minimum responses
      if (responses.length < finalConfig.minModels) {
        logger.warn('Consensus: Insufficient model responses', { 
          received: responses.length, 
          required: finalConfig.minModels 
        });
        
        // Return best available response
        return this.createFallbackResult(responses);
      }

      // Calculate agreement and determine consensus
      const agreement = this.calculateAgreement(responses);
      const votingMethod = this.determineVotingMethod(responses, finalConfig);
      
      // Get consensus response
      const consensusResponse = this.resolveConsensus(responses, votingMethod);
      const disagreements = this.identifyDisagreements(responses);

      // Determine if human review is needed
      const humanReviewRequired = 
        agreement < finalConfig.agreementThreshold ||
        consensusResponse.confidence < finalConfig.confidenceThreshold ||
        (finalConfig.requireUnanimous && agreement < 1.0);

      const result: ConsensusResult = {
        finalResponse: consensusResponse.response,
        confidence: consensusResponse.confidence,
        agreement,
        responses,
        votingMethod,
        disagreements,
        humanReviewRequired
      };

      logger.info('Consensus reached', {
        agreement: (agreement * 100).toFixed(1) + '%',
        confidence: (consensusResponse.confidence * 100).toFixed(1) + '%',
        votingMethod,
        totalTime: Date.now() - startTime
      });

      return result;

    } catch (error) {
      logger.error('Consensus system error', error as Error);
      throw error;
    }
  }

  /**
   * Execute queries with timeout
   */
  private async executeQueries(
    queryFunctions: Array<() => Promise<ModelResponse>>,
    timeout: number
  ): Promise<ModelResponse[]> {
    const results: ModelResponse[] = [];

    const promises = queryFunctions.map(async (fn, index) => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), timeout);
        });

        const response = await Promise.race([fn(), timeoutPromise]);
        return response;
      } catch (error) {
        logger.warn(`Query ${index} failed`, { error });
        return null;
      }
    });

    const responses = await Promise.all(promises);
    
    for (const response of responses) {
      if (response !== null) {
        results.push(response);
      }
    }

    return results;
  }

  /**
   * Calculate agreement score between responses
   */
  private calculateAgreement(responses: ModelResponse[]): number {
    if (responses.length < 2) return 1;

    const similarities: number[] = [];

    // Compare each pair of responses
    for (let i = 0; i < responses.length; i++) {
      for (let j = i + 1; j < responses.length; j++) {
        const similarity = this.calculateTextSimilarity(
          responses[i].response,
          responses[j].response
        );
        similarities.push(similarity);
      }
    }

    // Return average similarity
    return similarities.reduce((sum, s) => sum + s, 0) / similarities.length;
  }

  /**
   * Calculate text similarity using Jaccard coefficient
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.tokenize(text1));
    const words2 = new Set(this.tokenize(text2));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) return 1;
    return intersection.size / union.size;
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  /**
   * Determine voting method based on responses
   */
  private determineVotingMethod(
    responses: ModelResponse[],
    config: ConsensusConfig
  ): 'majority' | 'weighted' | 'unanimous' {
    if (config.requireUnanimous) return 'unanimous';
    
    // Use weighted voting for mixed model quality
    const hasMultipleProviders = new Set(responses.map(r => r.provider)).size > 1;
    if (hasMultipleProviders) return 'weighted';
    
    return 'majority';
  }

  /**
   * Resolve consensus based on voting method
   */
  private resolveConsensus(
    responses: ModelResponse[],
    method: 'majority' | 'weighted' | 'unanimous'
  ): { response: string; confidence: number } {
    switch (method) {
      case 'unanimous':
        return this.unanimousVoting(responses);
      case 'weighted':
        return this.weightedVoting(responses);
      case 'majority':
      default:
        return this.majorityVoting(responses);
    }
  }

  /**
   * Majority voting - most common response wins
   */
  private majorityVoting(responses: ModelResponse[]): { response: string; confidence: number } {
    // Group similar responses
    const groups = this.groupSimilarResponses(responses);
    
    // Find largest group
    let largestGroup = groups[0];
    for (const group of groups) {
      if (group.length > largestGroup.length) {
        largestGroup = group;
      }
    }

    // Return highest confidence from largest group
    const best = largestGroup.reduce((a, b) => a.confidence > b.confidence ? a : b);
    const groupConfidence = largestGroup.length / responses.length;

    return {
      response: best.response,
      confidence: (best.confidence + groupConfidence) / 2
    };
  }

  /**
   * Weighted voting - weight by model quality and confidence
   */
  private weightedVoting(responses: ModelResponse[]): { response: string; confidence: number } {
    let bestScore = -1;
    let bestResponse: ModelResponse | null = null;

    for (const response of responses) {
      const weight = this.modelWeights[response.model] || 0.5;
      const score = response.confidence * weight;
      
      if (score > bestScore) {
        bestScore = score;
        bestResponse = response;
      }
    }

    return {
      response: bestResponse?.response || responses[0].response,
      confidence: bestScore
    };
  }

  /**
   * Unanimous voting - require all to agree
   */
  private unanimousVoting(responses: ModelResponse[]): { response: string; confidence: number } {
    const agreement = this.calculateAgreement(responses);
    
    if (agreement >= 0.9) {
      // High agreement - return weighted best
      return this.weightedVoting(responses);
    }

    // No consensus - flag for review
    return {
      response: '[CONSENSUS NOT REACHED] ' + this.weightedVoting(responses).response,
      confidence: agreement * 0.5
    };
  }

  /**
   * Group similar responses together
   */
  private groupSimilarResponses(responses: ModelResponse[]): ModelResponse[][] {
    const groups: ModelResponse[][] = [];
    const assigned = new Set<number>();

    for (let i = 0; i < responses.length; i++) {
      if (assigned.has(i)) continue;

      const group = [responses[i]];
      assigned.add(i);

      for (let j = i + 1; j < responses.length; j++) {
        if (assigned.has(j)) continue;

        const similarity = this.calculateTextSimilarity(
          responses[i].response,
          responses[j].response
        );

        if (similarity > 0.7) {
          group.push(responses[j]);
          assigned.add(j);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Identify key disagreements between responses
   */
  private identifyDisagreements(responses: ModelResponse[]): string[] {
    const disagreements: string[] = [];

    // Extract key entities/facts from each response
    const facts = responses.map(r => this.extractKeyFacts(r.response));

    // Find facts that appear in some but not all responses
    const allFacts = new Set(facts.flat());
    for (const fact of allFacts) {
      const count = facts.filter(f => f.includes(fact)).length;
      if (count > 0 && count < responses.length) {
        disagreements.push(fact);
      }
    }

    return disagreements.slice(0, 5); // Top 5 disagreements
  }

  /**
   * Extract key facts from response
   */
  private extractKeyFacts(text: string): string[] {
    // Simple extraction - look for sentences with key patterns
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    return sentences
      .filter(s => 
        /should|must|recommend|require|important|critical/i.test(s) ||
        /\d+%|\$[\d,]+|\d+ days?/i.test(s)
      )
      .map(s => s.trim().substring(0, 100))
      .slice(0, 5);
  }

  /**
   * Create fallback result when consensus cannot be reached
   */
  private createFallbackResult(responses: ModelResponse[]): ConsensusResult {
    const best = responses.length > 0
      ? responses.reduce((a, b) => a.confidence > b.confidence ? a : b)
      : { response: 'Unable to process request', confidence: 0 };

    return {
      finalResponse: best.response,
      confidence: best.confidence * 0.5, // Reduce confidence
      agreement: 0,
      responses,
      votingMethod: 'majority',
      disagreements: ['Insufficient responses for consensus'],
      humanReviewRequired: true
    };
  }

  /**
   * Get model weight
   */
  getModelWeight(model: string): number {
    return this.modelWeights[model] || 0.5;
  }

  /**
   * Update model weight based on feedback
   */
  updateModelWeight(model: string, adjustment: number): void {
    const current = this.modelWeights[model] || 0.5;
    this.modelWeights[model] = Math.max(0.1, Math.min(2.0, current + adjustment));
  }
}

export const consensusSystem = ConsensusSystem.getInstance();
export { ConsensusSystem };
export type { ModelResponse, ConsensusResult, ConsensusConfig };
