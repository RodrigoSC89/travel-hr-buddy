
/**
 * PATCH 625 - Adaptive LLM Layer
 * Inteligência Contextual Aprimorada com Aprendizado Contínuo
 * 
 * Sistema de IA adaptativa que aprende com interações reais,
 * logs de inspeções e feedbacks de conformidade.
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type InspectionType = "PSC" | "ISM" | "MLC" | "OVID" | "LSA";

export interface FeedbackEntry {
  id?: string;
  inspection_type: InspectionType;
  feedback_text: string;
  is_non_conformity: boolean;
  severity?: "low" | "medium" | "high" | "critical";
  inspector_profile?: string;
  created_at?: string;
  context?: Record<string, any>;
}

export interface AdaptivePromptConfig {
  inspection_type: InspectionType;
  base_prompt: string;
  adjustments: string[];
  learned_patterns: string[];
  non_conformity_frequency: Record<string, number>;
}

export interface InspectorProfile {
  id: string;
  name: string;
  expertise: InspectionType[];
  preferences: Record<string, any>;
  historical_focus_areas: string[];
}

/**
 * Armazenamento incremental de feedbacks por tipo de inspeção
 */
export class FeedbackStorage {
  private static readonly TABLE_NAME = "ai_inspection_feedback";

  /**
   * Armazena feedback de uma inspeção
   */
  static async storeFeedback(feedback: FeedbackEntry): Promise<string> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert({
        inspection_type: feedback.inspection_type,
        feedback_text: feedback.feedback_text,
        is_non_conformity: feedback.is_non_conformity,
        severity: feedback.severity || "medium",
        inspector_profile: feedback.inspector_profile,
        context: feedback.context || {},
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error("Error storing feedback", error as Error, { 
        inspectionType: feedback.inspection_type,
        isNonConformity: feedback.is_non_conformity 
      });
      throw new Error(`Failed to store feedback: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Recupera feedbacks por tipo de inspeção
   */
  static async getFeedbacksByType(
    inspectionType: InspectionType,
    limit: number = 100
  ): Promise<FeedbackEntry[]> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("inspection_type", inspectionType)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error fetching feedbacks", error as Error, { 
        inspectionType,
        limit 
      });
      return [];
    }

    return data || [];
  }

  /**
   * Recupera não conformidades frequentes
   */
  static async getFrequentNonConformities(
    inspectionType: InspectionType
  ): Promise<Record<string, number>> {
    const feedbacks = await this.getFeedbacksByType(inspectionType, 500);
    const nonConformities = feedbacks.filter((f) => f.is_non_conformity);

    const frequency: Record<string, number> = {};
    nonConformities.forEach((nc) => {
      const key = nc.feedback_text.substring(0, 50); // Use first 50 chars as key
      frequency[key] = (frequency[key] || 0) + 1;
    });

    return frequency;
  }
}

/**
 * Ajuste dinâmico de prompts baseados em não conformidades frequentes
 */
export class PromptAdjuster {
  private static promptCache: Map<InspectionType, AdaptivePromptConfig> = new Map();

  /**
   * Obtém configuração de prompt adaptada para o tipo de inspeção
   */
  static async getAdaptivePrompt(
    inspectionType: InspectionType
  ): Promise<AdaptivePromptConfig> {
    // Check cache first
    if (this.promptCache.has(inspectionType)) {
      return this.promptCache.get(inspectionType)!;
    }

    const basePrompts = this.getBasePrompts();
    const basePrompt = basePrompts[inspectionType];

    const nonConformityFrequency = await FeedbackStorage.getFrequentNonConformities(
      inspectionType
    );

    const adjustments = this.generateAdjustments(nonConformityFrequency);
    const learnedPatterns = this.extractLearnedPatterns(nonConformityFrequency);

    const config: AdaptivePromptConfig = {
      inspection_type: inspectionType,
      base_prompt: basePrompt,
      adjustments,
      learned_patterns: learnedPatterns,
      non_conformity_frequency: nonConformityFrequency,
    });

    this.promptCache.set(inspectionType, config);
    return config;
  }

  /**
   * Gera o prompt final adaptado
   */
  static async generateFinalPrompt(
    inspectionType: InspectionType,
    context?: Record<string, any>
  ): Promise<string> {
    const config = await this.getAdaptivePrompt(inspectionType);

    let finalPrompt = config.base_prompt;

    // Add adjustments
    if (config.adjustments.length > 0) {
      finalPrompt += "\n\n**Áreas de Atenção Prioritária (baseadas em não conformidades frequentes):**\n";
      config.adjustments.forEach((adj) => {
        finalPrompt += `- ${adj}\n`;
      });
    }

    // Add learned patterns
    if (config.learned_patterns.length > 0) {
      finalPrompt += "\n\n**Padrões Identificados (aprendizado de inspeções anteriores):**\n";
      config.learned_patterns.forEach((pattern) => {
        finalPrompt += `- ${pattern}\n`;
      });
    }

    // Add context if provided
    if (context) {
      finalPrompt += "\n\n**Contexto Atual:**\n";
      Object.entries(context).forEach(([key, value]) => {
        finalPrompt += `- ${key}: ${JSON.stringify(value)}\n`;
      });
    }

    return finalPrompt;
  }

  /**
   * Limpa o cache de prompts
   */
  static clearCache(): void {
    this.promptCache.clear();
  }

  private static getBasePrompts(): Record<InspectionType, string> {
    return {
      PSC: `Você é um assistente especializado em Port State Control (PSC).
Sua função é auxiliar em inspeções de segurança de embarcações, garantindo conformidade com:
- SOLAS (Safety of Life at Sea)
- MARPOL (Marine Pollution)
- MLC (Maritime Labour Convention)
- STCW (Standards of Training, Certification and Watchkeeping)

Forneça análises detalhadas, identifique possíveis não conformidades e sugira ações corretivas.`,

      ISM: `Você é um auditor especializado em International Safety Management (ISM) Code.
Sua função é avaliar sistemas de gestão de segurança, analisando:
- Política de segurança e proteção ambiental
- Responsabilidades e autoridade
- Recursos e pessoal designado
- Desenvolvimento de planos para operações de bordo
- Preparação para emergências
- Relatórios e análise de não conformidades

Forneça avaliações objetivas e recomendações práticas.`,

      MLC: `Você é um inspetor especializado em Maritime Labour Convention (MLC).
Sua função é garantir condições adequadas de trabalho marítimo, verificando:
- Contratos de emprego
- Horas de trabalho e descanso
- Alojamento e instalações de lazer
- Alimentação e serviço de bordo
- Proteção de saúde e segurança
- Assistência médica a bordo

Identifique violações e sugira melhorias nas condições de trabalho.`,

      OVID: `Você é um especialista em OVID (Operational Vessel Inspection Database).
Sua função é analisar dados operacionais de embarcações, identificando:
- Histórico de inspeções
- Deficiências recorrentes
- Tendências de não conformidade
- Perfil de risco da embarcação
- Desempenho operacional

Forneça análises preditivas e insights para prevenção de deficiências.`,

      LSA: `Você é um inspetor especializado em Life-Saving Appliances (LSA).
Sua função é verificar equipamentos de salvamento, incluindo:
- Botes salva-vidas e balsas
- Equipamentos de lançamento
- Coletes salva-vidas e aros
- Sinais de emergência (foguetes, sinais fumígenos)
- EPIRBs e SARTs
- Sistemas de comunicação de emergência

Assegure conformidade com SOLAS e identificque deficiências críticas.`,
    };
  }

  private static generateAdjustments(
    nonConformityFrequency: Record<string, number>
  ): string[] {
    const adjustments: string[] = [];
    const sortedIssues = Object.entries(nonConformityFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5 issues

    sortedIssues.forEach(([issue, count]) => {
      if (count > 2) {
        // Only if appeared more than twice
        adjustments.push(
          `${issue.trim()} (identificado ${count}x em inspeções anteriores)`
        );
      }
    });

    return adjustments;
  }

  private static extractLearnedPatterns(
    nonConformityFrequency: Record<string, number>
  ): string[] {
    const patterns: string[] = [];

    // Analyze frequency to extract patterns
    const totalIssues = Object.values(nonConformityFrequency).reduce(
      (sum, count) => sum + count,
      0
    );
    const avgFrequency = totalIssues / Object.keys(nonConformityFrequency).length;

    if (avgFrequency > 3) {
      patterns.push("Alta taxa de não conformidades detectadas - aumentar rigor na inspeção");
    }

    const highFrequencyIssues = Object.entries(nonConformityFrequency).filter(
      ([, count]) => count > avgFrequency * 1.5
    );

    if (highFrequencyIssues.length > 0) {
      patterns.push(
        `${highFrequencyIssues.length} área(s) crítica(s) com não conformidades recorrentes`
      );
    }

    return patterns;
  }
}

/**
 * Respostas condicionadas ao perfil do inspetor
 */
export class InspectorProfileManager {
  private static readonly TABLE_NAME = "inspector_profiles";

  /**
   * Obtém perfil do inspetor
   */
  static async getProfile(inspectorId: string): Promise<InspectorProfile | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("id", inspectorId)
      .single();

    if (error) {
      logger.error("Error fetching inspector profile", error as Error, { inspectorId });
      return null;
    }

    return data;
  }

  /**
   * Atualiza perfil do inspetor com base em histórico
   */
  static async updateProfileFromHistory(inspectorId: string): Promise<void> {
    const feedbacks = await supabase
      .from("ai_inspection_feedback")
      .select("*")
      .eq("inspector_profile", inspectorId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!feedbacks.data || feedbacks.data.length === 0) return;

    // Analyze inspection types
    const typeCounts: Record<string, number> = {};
    feedbacks.data.forEach((f) => {
      typeCounts[f.inspection_type] = (typeCounts[f.inspection_type] || 0) + 1;
    });

    const expertise = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type as InspectionType);

    // Extract focus areas from non-conformities
    const focusAreas = feedbacks.data
      .filter((f) => f.is_non_conformity)
      .map((f) => f.feedback_text.substring(0, 50))
      .filter((v, i, a) => a.indexOf(v) === i) // unique
      .slice(0, 10);

    await supabase
      .from(this.TABLE_NAME)
      .update({
        expertise,
        historical_focus_areas: focusAreas,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inspectorId);
  }

  /**
   * Adapta resposta ao perfil do inspetor
   */
  static async adaptResponseToProfile(
    inspectorId: string,
    baseResponse: string,
    inspectionType: InspectionType
  ): Promise<string> {
    const profile = await this.getProfile(inspectorId);
    if (!profile) return baseResponse;

    let adaptedResponse = baseResponse;

    // Add personalized context if this is inspector's expertise area
    if (profile.expertise.includes(inspectionType)) {
      adaptedResponse +=
        "\n\n**Nota:** Esta é uma área de sua expertise. Detalhes técnicos adicionais disponíveis mediante solicitação.";
    } else {
      adaptedResponse +=
        "\n\n**Dica:** Considere consultar especialista em " +
        inspectionType +
        " para validação adicional.";
    }

    // Add focus areas if relevant
    if (profile.historical_focus_areas.length > 0) {
      adaptedResponse += "\n\n**Áreas de foco histórico:**\n";
      profile.historical_focus_areas.slice(0, 3).forEach((area) => {
        adaptedResponse += `- ${area}\n`;
      });
    }

    return adaptedResponse;
  }
}

/**
 * Interface principal para o sistema de inteligência adaptativa
 */
export class AdaptiveIntelligence {
  /**
   * Processa uma consulta com inteligência adaptativa
   */
  static async processQuery(
    inspectionType: InspectionType,
    query: string,
    inspectorId?: string,
    context?: Record<string, any>
  ): Promise<string> {
    // Generate adaptive prompt
    const prompt = await PromptAdjuster.generateFinalPrompt(inspectionType, context);

    // Here you would call your LLM service with the adaptive prompt
    // For now, we'll return a structured response
    const baseResponse = `${prompt}\n\n**Consulta:** ${query}\n\n**Resposta:** [Esta seria a resposta do LLM]`;

    // Adapt to inspector profile if provided
    if (inspectorId) {
      return await InspectorProfileManager.adaptResponseToProfile(
        inspectorId,
        baseResponse,
        inspectionType
      );
    }

    return baseResponse;
  }

  /**
   * Registra feedback de uma interação
   */
  static async recordFeedback(
    inspectionType: InspectionType,
    feedbackText: string,
    isNonConformity: boolean,
    options?: {
      severity?: "low" | "medium" | "high" | "critical";
      inspectorId?: string;
      context?: Record<string, any>;
    }
  ): Promise<void> {
    await FeedbackStorage.storeFeedback({
      inspection_type: inspectionType,
      feedback_text: feedbackText,
      is_non_conformity: isNonConformity,
      severity: options?.severity,
      inspector_profile: options?.inspectorId,
      context: options?.context,
    });

    // Update inspector profile if provided
    if (options?.inspectorId) {
      await InspectorProfileManager.updateProfileFromHistory(options.inspectorId);
    }

    // Clear cache to force prompt regeneration
    PromptAdjuster.clearCache();
  }

  /**
   * Obtém estatísticas de aprendizado
   */
  static async getLearningStats(
    inspectionType: InspectionType
  ): Promise<{
    totalFeedbacks: number;
    nonConformities: number;
    topIssues: Array<{ issue: string; count: number }>;
    learnedPatterns: string[];
  }> {
    const feedbacks = await FeedbackStorage.getFeedbacksByType(inspectionType, 1000);
    const nonConformities = feedbacks.filter((f) => f.is_non_conformity).length;
    const frequency = await FeedbackStorage.getFrequentNonConformities(inspectionType);

    const topIssues = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([issue, count]) => ({ issue, count }));

    const config = await PromptAdjuster.getAdaptivePrompt(inspectionType);

    return {
      totalFeedbacks: feedbacks.length,
      nonConformities,
      topIssues,
      learnedPatterns: config.learned_patterns,
    });
  }
}

export default AdaptiveIntelligence;
