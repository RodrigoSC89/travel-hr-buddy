/**
 * PATCH 536 - Emotion-Aware Feedback System
 * 
 * Registra e responde a emoções explícitas e implícitas do usuário
 * 
 * @module ai/emotion/feedback-responder
 * @created 2025-01-24
 */

import { logger } from "@/lib/logger";

export type EmotionType = "frustration" | "relief" | "stress" | "joy" | "confusion" | "satisfaction" | "anger" | "anxiety";
export type InputModality = "text" | "voice" | "facial" | "gesture";
export type FeedbackAdjustmentType = "tone" | "content" | "suggestion" | "timing" | "detail_level";

export interface EmotionDetection {
  emotion: EmotionType;
  intensity: number; // 0-1 scale
  confidence: number; // 0-1 scale
  source: InputModality;
  indicators: string[];
  timestamp: Date;
}

export interface UserFeedback {
  id: string;
  input: string;
  modality: InputModality;
  detectedEmotions: EmotionDetection[];
  primaryEmotion: EmotionType;
  timestamp: Date;
}

export interface FeedbackAdjustment {
  type: FeedbackAdjustmentType;
  originalValue: string;
  adjustedValue: string;
  reason: string;
  emotionBased: EmotionType;
}

export interface EmotionAwareResponse {
  originalResponse: string;
  adjustedResponse: string;
  adjustments: FeedbackAdjustment[];
  suggestions: string[];
  emotionalContext: EmotionDetection[];
}

export interface EmotionStats {
  emotion: EmotionType;
  count: number;
  averageIntensity: number;
  lastDetected: Date;
}

class FeedbackResponder {
  private emotionHistory: UserFeedback[] = [];
  private readonly EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
    frustration: ["frustrado", "difícil", "complicado", "não consigo", "problema", "erro", "não funciona"],
    relief: ["aliviado", "finalmente", "obrigado", "resolvido", "funcionou", "ótimo"],
    stress: ["estressado", "pressa", "urgente", "muito trabalho", "sobrecarregado", "não aguento"],
    joy: ["feliz", "ótimo", "excelente", "perfeito", "adorei", "maravilhoso"],
    confusion: ["confuso", "não entendi", "como assim", "dúvida", "explique", "não sei"],
    satisfaction: ["satisfeito", "bom", "adequado", "correto", "funcionou bem", "aceitável"],
    anger: ["irritado", "chato", "péssimo", "horrível", "raiva", "inaceitável"],
    anxiety: ["ansioso", "preocupado", "nervoso", "medo", "inseguro", "receio"]
  };

  /**
   * Detecta emoção em input textual
   */
  detectEmotionFromText(text: string): EmotionDetection[] {
    const lowerText = text.toLowerCase();
    const detections: EmotionDetection[] = [];

    for (const [emotion, keywords] of Object.entries(this.EMOTION_KEYWORDS)) {
      const matchedKeywords = keywords.filter(keyword => lowerText.includes(keyword));
      
      if (matchedKeywords.length > 0) {
        const intensity = Math.min(1.0, matchedKeywords.length * 0.3);
        const confidence = matchedKeywords.length >= 2 ? 0.9 : 0.7;

        detections.push({
          emotion: emotion as EmotionType,
          intensity,
          confidence,
          source: "text",
          indicators: matchedKeywords,
          timestamp: new Date()
        });
      }
    }

    // Se não detectou nenhuma emoção específica, assume satisfação neutra
    if (detections.length === 0) {
      detections.push({
        emotion: "satisfaction",
        intensity: 0.5,
        confidence: 0.5,
        source: "text",
        indicators: ["default"],
        timestamp: new Date()
      });
    }

    return detections;
  }

  /**
   * Detecta emoção em input vocal (simulado via análise de texto)
   */
  detectEmotionFromVoice(text: string, vocalFeatures?: {
    pitch?: number;
    speed?: number;
    volume?: number;
  }): EmotionDetection[] {
    // Base detection from text
    const textEmotions = this.detectEmotionFromText(text);

    // Ajusta com base em características vocais (se disponível)
    if (vocalFeatures) {
      textEmotions.forEach(detection => {
        // Pitch alto pode indicar stress ou frustração
        if (vocalFeatures.pitch && vocalFeatures.pitch > 200) {
          if (detection.emotion === "stress" || detection.emotion === "frustration") {
            detection.intensity = Math.min(1.0, detection.intensity + 0.2);
            detection.confidence = Math.min(1.0, detection.confidence + 0.1);
          }
        }

        // Velocidade rápida pode indicar urgência ou stress
        if (vocalFeatures.speed && vocalFeatures.speed > 1.5) {
          if (detection.emotion === "stress" || detection.emotion === "anxiety") {
            detection.intensity = Math.min(1.0, detection.intensity + 0.15);
          }
        }

        detection.source = "voice";
      });
    }

    return textEmotions;
  }

  /**
   * Registra feedback com emoção detectada
   */
  registerFeedback(input: string, modality: InputModality = "text"): UserFeedback {
    const detectedEmotions = modality === "voice" 
      ? this.detectEmotionFromVoice(input)
      : this.detectEmotionFromText(input);

    // Determina emoção primária (maior intensidade * confiança)
    const primaryEmotion = detectedEmotions.reduce((prev, curr) => 
      (curr.intensity * curr.confidence) > (prev.intensity * prev.confidence) ? curr : prev
    );

    const feedback: UserFeedback = {
      id: `feedback-${Date.now()}-${crypto.randomUUID().slice(0, 9)}`,
      input,
      modality,
      detectedEmotions,
      primaryEmotion: primaryEmotion.emotion,
      timestamp: new Date()
    };

    this.emotionHistory.push(feedback);

    // Mantém apenas os últimos 100 feedbacks
    if (this.emotionHistory.length > 100) {
      this.emotionHistory.shift();
    }

    logger.debug("Emotion detected from user input", {
      feedbackId: feedback.id,
      primaryEmotion: feedback.primaryEmotion,
      intensity: primaryEmotion.intensity.toFixed(2),
      confidence: primaryEmotion.confidence.toFixed(2),
      emotionsDetected: detectedEmotions.length
    });

    return feedback;
  }

  /**
   * Modifica feedback e sugestões baseado em emoção
   */
  adjustResponse(response: string, userInput: string, modality: InputModality = "text"): EmotionAwareResponse {
    // Registra e detecta emoção
    const feedback = this.registerFeedback(userInput, modality);
    const primaryEmotion = feedback.detectedEmotions.find(e => e.emotion === feedback.primaryEmotion);

    if (!primaryEmotion) {
      return {
        originalResponse: response,
        adjustedResponse: response,
        adjustments: [],
        suggestions: [],
        emotionalContext: feedback.detectedEmotions
      };
    }

    const adjustments: FeedbackAdjustment[] = [];
    let adjustedResponse = response;
    const suggestions: string[] = [];

    // Ajusta resposta baseado na emoção detectada
    switch (feedback.primaryEmotion) {
    case "frustration":
      adjustedResponse = this.applyFrustrationAdjustment(response);
      adjustments.push({
        type: "tone",
        originalValue: "neutral",
        adjustedValue: "empathetic",
        reason: "User showing frustration",
        emotionBased: "frustration"
      });
      suggestions.push("💡 Posso simplificar os passos para você");
      suggestions.push("🤝 Gostaria de suporte adicional?");
      break;

    case "stress":
      adjustedResponse = this.applyStressAdjustment(response);
      adjustments.push({
        type: "tone",
        originalValue: "neutral",
        adjustedValue: "calming",
        reason: "User experiencing stress",
        emotionBased: "stress"
      });
      adjustments.push({
        type: "detail_level",
        originalValue: "detailed",
        adjustedValue: "concise",
        reason: "Reduce cognitive load during stress",
        emotionBased: "stress"
      });
      suggestions.push("🧘 Respire fundo. Vamos por partes.");
      suggestions.push("⏸️ Posso pausar e retomar depois?");
      break;

    case "confusion":
      adjustedResponse = this.applyConfusionAdjustment(response);
      adjustments.push({
        type: "detail_level",
        originalValue: "normal",
        adjustedValue: "simplified",
        reason: "User needs clarification",
        emotionBased: "confusion"
      });
      suggestions.push("📚 Posso explicar de forma mais simples?");
      suggestions.push("🎯 Gostaria de ver exemplos?");
      break;

    case "relief":
      adjustedResponse = this.applyReliefAdjustment(response);
      adjustments.push({
        type: "tone",
        originalValue: "neutral",
        adjustedValue: "positive",
        reason: "Reinforce positive outcome",
        emotionBased: "relief"
      });
      suggestions.push("✨ Ótimo! Posso ajudar com mais alguma coisa?");
      break;

    case "anxiety":
      adjustedResponse = this.applyAnxietyAdjustment(response);
      adjustments.push({
        type: "tone",
        originalValue: "neutral",
        adjustedValue: "reassuring",
        reason: "User showing anxiety",
        emotionBased: "anxiety"
      });
      suggestions.push("✅ Está tudo sob controle");
      suggestions.push("🛡️ Posso mostrar os riscos e como mitigá-los?");
      break;

    case "anger":
      adjustedResponse = this.applyAngerAdjustment(response);
      adjustments.push({
        type: "tone",
        originalValue: "neutral",
        adjustedValue: "apologetic",
        reason: "User expressing anger",
        emotionBased: "anger"
      });
      suggestions.push("🙏 Peço desculpas pela inconveniência");
      suggestions.push("🔧 Posso resolver isso imediatamente?");
      break;
    }

    logger.debug("Response adjusted for user emotion", {
      emotion: feedback.primaryEmotion,
      adjustmentsApplied: adjustments.length,
      suggestionsAdded: suggestions.length
    });

    return {
      originalResponse: response,
      adjustedResponse,
      adjustments,
      suggestions,
      emotionalContext: feedback.detectedEmotions
    };
  }

  /**
   * Aplica ajuste para frustração
   */
  private applyFrustrationAdjustment(response: string): string {
    return `😔 Entendo sua frustração. ${response}\n\nEstou aqui para facilitar as coisas.`;
  }

  /**
   * Aplica ajuste para stress
   */
  private applyStressAdjustment(response: string): string {
    return `🧘 Vamos com calma. ${response}\n\nSem pressa, estou aqui para ajudar.`;
  }

  /**
   * Aplica ajuste para confusão
   */
  private applyConfusionAdjustment(response: string): string {
    return `💭 Deixe-me esclarecer: ${response}\n\nSe ainda tiver dúvidas, pergunte!`;
  }

  /**
   * Aplica ajuste para alívio
   */
  private applyReliefAdjustment(response: string): string {
    return `🎉 Que bom que deu certo! ${response}`;
  }

  /**
   * Aplica ajuste para ansiedade
   */
  private applyAnxietyAdjustment(response: string): string {
    return `✅ Tudo vai ficar bem. ${response}\n\nEstou monitorando tudo.`;
  }

  /**
   * Aplica ajuste para raiva
   */
  private applyAngerAdjustment(response: string): string {
    return `🙏 Peço desculpas pelo transtorno. ${response}\n\nVou resolver isso para você.`;
  }

  /**
   * Obtém estatísticas de emoções detectadas
   */
  getEmotionStats(): EmotionStats[] {
    const stats = new Map<EmotionType, { count: number; totalIntensity: number; lastDetected: Date }>();

    this.emotionHistory.forEach(feedback => {
      feedback.detectedEmotions.forEach(emotion => {
        const current = stats.get(emotion.emotion) || { count: 0, totalIntensity: 0, lastDetected: new Date(0) };
        current.count++;
        current.totalIntensity += emotion.intensity;
        if (emotion.timestamp > current.lastDetected) {
          current.lastDetected = emotion.timestamp;
        }
        stats.set(emotion.emotion, current);
      });
    });

    return Array.from(stats.entries()).map(([emotion, data]) => ({
      emotion,
      count: data.count,
      averageIntensity: data.totalIntensity / data.count,
      lastDetected: data.lastDetected
    }));
  }

  /**
   * Obtém histórico de emoções
   */
  getEmotionHistory(): UserFeedback[] {
    return [...this.emotionHistory];
  }

  /**
   * Limpa histórico de emoções
   */
  clearHistory(): void {
    this.emotionHistory = [];
  }

  /**
   * Valida taxa de acurácia (para testes)
   */
  validateAccuracy(testCases: Array<{ input: string; expectedEmotion: EmotionType }>): number {
    let correct = 0;
    
    testCases.forEach(testCase => {
      const feedback = this.registerFeedback(testCase.input);
      if (feedback.primaryEmotion === testCase.expectedEmotion) {
        correct++;
      }
    });

    const accuracy = correct / testCases.length;
    logger.info("Emotion detection accuracy validated", {
      testCases: testCases.length,
      correct,
      accuracy: (accuracy * 100).toFixed(1) + "%"
    });

    return accuracy;
  }
}

// Instância singleton
export const feedbackResponder = new FeedbackResponder();
