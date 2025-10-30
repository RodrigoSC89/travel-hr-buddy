/**
 * PATCH 603 - Multimodal Feedback Analyzer
 * 
 * Permite ao sistema receber e interpretar múltiplas formas de feedback do usuário:
 * - Input de voz, texto e cliques como feedbacks
 * - Análise do comportamento do operador
 * - Logging e sugestão adaptativa
 */

import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tipo de feedback
 */
export type FeedbackType = "voice" | "text" | "click" | "gesture" | "implicit";

/**
 * Sentimento do feedback
 */
export type FeedbackSentiment = "positive" | "neutral" | "negative";

/**
 * Feedback do usuário
 */
export interface UserFeedback {
  id: string;
  userId: string;
  type: FeedbackType;
  content: any;  // Voz transcrita, texto, coordenadas do click, etc
  context: {
    screen: string;
    action?: string;
    elementId?: string;
    timestamp: Date;
  };
  sentiment?: FeedbackSentiment;
  processed: boolean;
  metadata?: Record<string, any>;
}

/**
 * Padrão de comportamento detectado
 */
export interface BehaviorPattern {
  id: string;
  userId: string;
  patternType: "frequent_action" | "hesitation" | "avoidance" | "preference" | "error_prone";
  description: string;
  frequency: number;
  confidence: number;  // 0-100
  examples: any[];
  detectedAt: Date;
}

/**
 * Sugestão adaptativa
 */
export interface AdaptiveSuggestion {
  id: string;
  userId: string;
  suggestionType: "shortcut" | "automation" | "tip" | "warning" | "optimization";
  title: string;
  description: string;
  actionable: boolean;
  priority: number;  // 0-100
  basedOn: string[];  // IDs dos feedbacks/padrões
  createdAt: Date;
}

/**
 * Configuração do analisador
 */
export interface AnalyzerConfig {
  enableVoiceInput: boolean;
  enableTextInput: boolean;
  enableClickTracking: boolean;
  enableGestureTracking: boolean;
  enableImplicitTracking: boolean;
  behaviorAnalysisEnabled: boolean;
  adaptiveSuggestionsEnabled: boolean;
  minPatternFrequency: number;
}

/**
 * Relatório de interações
 */
export interface InteractionReport {
  userId: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalFeedbacks: number;
    byType: Record<FeedbackType, number>;
    bySentiment: Record<FeedbackSentiment, number>;
    patternsDetected: number;
    suggestionsGenerated: number;
  };
  topPatterns: BehaviorPattern[];
  topSuggestions: AdaptiveSuggestion[];
  generatedAt: Date;
}

/**
 * Analisador de Feedback Multimodal
 */
export class MultimodalAnalyzer {
  private config: AnalyzerConfig;
  private feedbackBuffer: UserFeedback[] = [];
  private patterns: Map<string, BehaviorPattern[]> = new Map();
  private suggestions: Map<string, AdaptiveSuggestion[]> = new Map();

  constructor(config?: Partial<AnalyzerConfig>) {
    this.config = {
      enableVoiceInput: true,
      enableTextInput: true,
      enableClickTracking: true,
      enableGestureTracking: false,
      enableImplicitTracking: true,
      behaviorAnalysisEnabled: true,
      adaptiveSuggestionsEnabled: true,
      minPatternFrequency: 3,
      ...config,
    };
  }

  /**
   * Inicializa o analisador
   */
  async initialize(): Promise<void> {
    logger.info("[MultimodalAnalyzer] Initializing multimodal feedback analyzer", {
      config: this.config,
    });

    // Carregar padrões existentes
    await this.loadExistingPatterns();
  }

  /**
   * Processa feedback de voz
   */
  async processVoiceFeedback(
    userId: string,
    audioData: Blob,
    context: any
  ): Promise<UserFeedback> {
    if (!this.config.enableVoiceInput) {
      throw new Error("Voice input is disabled");
    }

    logger.info("[MultimodalAnalyzer] Processing voice feedback", { userId });

    // Aqui implementaríamos transcrição de áudio
    // Por enquanto, simulamos o resultado
    const transcription = "Simulated voice transcription";

    const feedback: UserFeedback = {
      id: `feedback_voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: "voice",
      content: {
        transcription,
        audioData: "base64_encoded_audio",
        duration: 5,
      },
      context: {
        ...context,
        timestamp: new Date(),
      },
      sentiment: await this.analyzeSentiment(transcription),
      processed: false,
    };

    await this.storeFeedback(feedback);
    await this.analyzeFeedback(feedback);

    return feedback;
  }

  /**
   * Processa feedback de texto
   */
  async processTextFeedback(
    userId: string,
    text: string,
    context: any
  ): Promise<UserFeedback> {
    if (!this.config.enableTextInput) {
      throw new Error("Text input is disabled");
    }

    logger.info("[MultimodalAnalyzer] Processing text feedback", {
      userId,
      textLength: text.length,
    });

    const feedback: UserFeedback = {
      id: `feedback_text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: "text",
      content: { text },
      context: {
        ...context,
        timestamp: new Date(),
      },
      sentiment: await this.analyzeSentiment(text),
      processed: false,
    };

    await this.storeFeedback(feedback);
    await this.analyzeFeedback(feedback);

    return feedback;
  }

  /**
   * Processa feedback de click
   */
  async processClickFeedback(
    userId: string,
    clickData: {
      x: number;
      y: number;
      elementId?: string;
      elementType?: string;
    },
    context: any
  ): Promise<UserFeedback> {
    if (!this.config.enableClickTracking) {
      throw new Error("Click tracking is disabled");
    }

    const feedback: UserFeedback = {
      id: `feedback_click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: "click",
      content: clickData,
      context: {
        ...context,
        timestamp: new Date(),
      },
      processed: false,
    };

    await this.storeFeedback(feedback);
    await this.analyzeFeedback(feedback);

    return feedback;
  }

  /**
   * Processa feedback implícito (tempo na página, hesitação, etc)
   */
  async processImplicitFeedback(
    userId: string,
    implicitData: {
      type: "page_time" | "hesitation" | "abandonment" | "completion";
      value: any;
    },
    context: any
  ): Promise<UserFeedback> {
    if (!this.config.enableImplicitTracking) {
      throw new Error("Implicit tracking is disabled");
    }

    const feedback: UserFeedback = {
      id: `feedback_implicit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: "implicit",
      content: implicitData,
      context: {
        ...context,
        timestamp: new Date(),
      },
      processed: false,
    };

    await this.storeFeedback(feedback);
    await this.analyzeFeedback(feedback);

    return feedback;
  }

  /**
   * Analisa sentimento de feedback textual
   */
  private async analyzeSentiment(text: string): Promise<FeedbackSentiment> {
    // Implementação simplificada de análise de sentimento
    const positiveWords = ["bom", "ótimo", "excelente", "perfeito", "gostei", "legal"];
    const negativeWords = ["ruim", "péssimo", "horrível", "difícil", "confuso", "erro"];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  /**
   * Analisa feedback e detecta padrões
   */
  private async analyzeFeedback(feedback: UserFeedback): Promise<void> {
    if (!this.config.behaviorAnalysisEnabled) return;

    // Adicionar ao buffer
    this.feedbackBuffer.push(feedback);

    // Manter buffer limitado
    if (this.feedbackBuffer.length > 1000) {
      this.feedbackBuffer = this.feedbackBuffer.slice(-1000);
    }

    // Obter feedbacks do usuário
    const userFeedbacks = this.feedbackBuffer.filter(f => f.userId === feedback.userId);

    // Detectar padrões
    await this.detectBehaviorPatterns(feedback.userId, userFeedbacks);

    // Gerar sugestões adaptativas
    if (this.config.adaptiveSuggestionsEnabled) {
      await this.generateAdaptiveSuggestions(feedback.userId);
    }

    // Marcar como processado
    feedback.processed = true;
    await this.updateFeedback(feedback);
  }

  /**
   * Detecta padrões de comportamento
   */
  private async detectBehaviorPatterns(
    userId: string,
    feedbacks: UserFeedback[]
  ): Promise<void> {
    const patterns: BehaviorPattern[] = [];

    // Detectar ações frequentes
    const actionFrequency = new Map<string, number>();
    feedbacks.forEach(f => {
      if (f.context.action) {
        actionFrequency.set(
          f.context.action,
          (actionFrequency.get(f.context.action) || 0) + 1
        );
      }
    });

    for (const [action, count] of actionFrequency.entries()) {
      if (count >= this.config.minPatternFrequency) {
        patterns.push({
          id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          patternType: "frequent_action",
          description: `User frequently performs action: ${action}`,
          frequency: count,
          confidence: Math.min(100, (count / feedbacks.length) * 100),
          examples: feedbacks.filter(f => f.context.action === action).slice(0, 3),
          detectedAt: new Date(),
        });
      }
    }

    // Detectar hesitação (múltiplos clicks na mesma área)
    const clickPositions = feedbacks
      .filter(f => f.type === "click")
      .map(f => ({ x: f.content.x, y: f.content.y, elementId: f.content.elementId }));

    const hesitationThreshold = 3;
    const areaThreshold = 50; // pixels

    for (let i = 0; i < clickPositions.length - hesitationThreshold; i++) {
      const area = clickPositions.slice(i, i + hesitationThreshold);
      const closeClicks = area.filter(
        (click, idx) =>
          idx === 0 ||
          (Math.abs(click.x - area[0].x) < areaThreshold &&
            Math.abs(click.y - area[0].y) < areaThreshold)
      );

      if (closeClicks.length >= hesitationThreshold) {
        patterns.push({
          id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          patternType: "hesitation",
          description: "User showing hesitation in UI interaction",
          frequency: closeClicks.length,
          confidence: 80,
          examples: closeClicks,
          detectedAt: new Date(),
        });
      }
    }

    // Salvar padrões
    if (patterns.length > 0) {
      this.patterns.set(userId, [
        ...(this.patterns.get(userId) || []),
        ...patterns,
      ]);

      for (const pattern of patterns) {
        await this.savePattern(pattern);
      }

      logger.info("[MultimodalAnalyzer] Detected behavior patterns", {
        userId,
        patternsCount: patterns.length,
      });
    }
  }

  /**
   * Gera sugestões adaptativas baseadas em padrões
   */
  private async generateAdaptiveSuggestions(userId: string): Promise<void> {
    const userPatterns = this.patterns.get(userId) || [];
    const suggestions: AdaptiveSuggestion[] = [];

    for (const pattern of userPatterns) {
      if (pattern.patternType === "frequent_action") {
        suggestions.push({
          id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          suggestionType: "shortcut",
          title: "Create Shortcut",
          description: `You frequently perform "${pattern.description}". Would you like to create a shortcut?`,
          actionable: true,
          priority: Math.min(100, pattern.frequency * 5),
          basedOn: [pattern.id],
          createdAt: new Date(),
        });
      } else if (pattern.patternType === "hesitation") {
        suggestions.push({
          id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          suggestionType: "tip",
          title: "Need Help?",
          description: "We noticed you might need assistance. Would you like a tutorial?",
          actionable: true,
          priority: 75,
          basedOn: [pattern.id],
          createdAt: new Date(),
        });
      }
    }

    if (suggestions.length > 0) {
      this.suggestions.set(userId, [
        ...(this.suggestions.get(userId) || []),
        ...suggestions,
      ]);

      for (const suggestion of suggestions) {
        await this.saveSuggestion(suggestion);
      }

      logger.info("[MultimodalAnalyzer] Generated adaptive suggestions", {
        userId,
        suggestionsCount: suggestions.length,
      });
    }
  }

  /**
   * Gera relatório de interações do operador
   */
  async generateInteractionReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<InteractionReport> {
    logger.info("[MultimodalAnalyzer] Generating interaction report", {
      userId,
      startDate,
      endDate,
    });

    // Buscar feedbacks do período
    const { data: feedbacks } = await supabase
      .from("ai_user_feedbacks")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    const typeCounts: Record<string, number> = {};
    const sentimentCounts: Record<string, number> = {};

    (feedbacks || []).forEach(f => {
      typeCounts[f.type] = (typeCounts[f.type] || 0) + 1;
      if (f.sentiment) {
        sentimentCounts[f.sentiment] = (sentimentCounts[f.sentiment] || 0) + 1;
      }
    });

    const userPatterns = this.patterns.get(userId) || [];
    const userSuggestions = this.suggestions.get(userId) || [];

    const report: InteractionReport = {
      userId,
      period: { start: startDate, end: endDate },
      summary: {
        totalFeedbacks: feedbacks?.length || 0,
        byType: typeCounts as any,
        bySentiment: sentimentCounts as any,
        patternsDetected: userPatterns.length,
        suggestionsGenerated: userSuggestions.length,
      },
      topPatterns: userPatterns
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5),
      topSuggestions: userSuggestions
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5),
      generatedAt: new Date(),
    };

    logger.info("[MultimodalAnalyzer] Interaction report generated", {
      userId,
      totalFeedbacks: report.summary.totalFeedbacks,
    });

    return report;
  }

  /**
   * Carrega padrões existentes
   */
  private async loadExistingPatterns(): Promise<void> {
    try {
      const { data: patterns } = await supabase
        .from("ai_behavior_patterns")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(100);

      if (patterns) {
        patterns.forEach(p => {
          const userPatterns = this.patterns.get(p.user_id) || [];
          userPatterns.push({
            ...p,
            detectedAt: new Date(p.detected_at),
          });
          this.patterns.set(p.user_id, userPatterns);
        });

        logger.info("[MultimodalAnalyzer] Loaded existing patterns", {
          count: patterns.length,
        });
      }
    } catch (error) {
      logger.error("[MultimodalAnalyzer] Failed to load patterns", { error });
    }
  }

  /**
   * Armazena feedback
   */
  private async storeFeedback(feedback: UserFeedback): Promise<void> {
    try {
      await supabase.from("ai_user_feedbacks").insert({
        id: feedback.id,
        user_id: feedback.userId,
        type: feedback.type,
        content: feedback.content,
        context: feedback.context,
        sentiment: feedback.sentiment,
        processed: feedback.processed,
        metadata: feedback.metadata,
        created_at: feedback.context.timestamp.toISOString(),
      });
    } catch (error) {
      logger.error("[MultimodalAnalyzer] Failed to store feedback", { error });
    }
  }

  /**
   * Atualiza feedback
   */
  private async updateFeedback(feedback: UserFeedback): Promise<void> {
    try {
      await supabase
        .from("ai_user_feedbacks")
        .update({ processed: feedback.processed })
        .eq("id", feedback.id);
    } catch (error) {
      logger.error("[MultimodalAnalyzer] Failed to update feedback", { error });
    }
  }

  /**
   * Salva padrão
   */
  private async savePattern(pattern: BehaviorPattern): Promise<void> {
    try {
      await supabase.from("ai_behavior_patterns").insert({
        id: pattern.id,
        user_id: pattern.userId,
        pattern_type: pattern.patternType,
        description: pattern.description,
        frequency: pattern.frequency,
        confidence: pattern.confidence,
        examples: pattern.examples,
        detected_at: pattern.detectedAt.toISOString(),
      });
    } catch (error) {
      logger.error("[MultimodalAnalyzer] Failed to save pattern", { error });
    }
  }

  /**
   * Salva sugestão
   */
  private async saveSuggestion(suggestion: AdaptiveSuggestion): Promise<void> {
    try {
      await supabase.from("ai_adaptive_suggestions").insert({
        id: suggestion.id,
        user_id: suggestion.userId,
        suggestion_type: suggestion.suggestionType,
        title: suggestion.title,
        description: suggestion.description,
        actionable: suggestion.actionable,
        priority: suggestion.priority,
        based_on: suggestion.basedOn,
        created_at: suggestion.createdAt.toISOString(),
      });
    } catch (error) {
      logger.error("[MultimodalAnalyzer] Failed to save suggestion", { error });
    }
  }

  /**
   * Obtém sugestões para usuário
   */
  getSuggestionsForUser(userId: string): AdaptiveSuggestion[] {
    return this.suggestions.get(userId) || [];
  }

  /**
   * Obtém padrões de usuário
   */
  getPatternsForUser(userId: string): BehaviorPattern[] {
    return this.patterns.get(userId) || [];
  }

  /**
   * Atualiza configuração
   */
  updateConfig(config: Partial<AnalyzerConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info("[MultimodalAnalyzer] Configuration updated", this.config);
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): AnalyzerConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const multimodalAnalyzer = new MultimodalAnalyzer();

export default multimodalAnalyzer;
