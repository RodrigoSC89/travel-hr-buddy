/**
 * PATCHES 591-595 - AI Human Interface Tests
 * 
 * Testes para os módulos de interface humano-IA
 * 
 * @module __tests__/patches-591-595
 * @created 2025-01-24
 */

import { describe, it, expect, beforeEach } from "vitest";

// PATCH 591 - SocioCognitive Interaction Layer
import {
  socioCognitiveLayer,
  type CommandInput,
  type UrgencyLevel,
  type ToneType
} from "../src/ai/interface/sociocognitive-layer";

// PATCH 592 - Empathy Core Engine
import {
  empathyCore,
  type BiometricData,
  type EmotionalState,
  type StressLevel
} from "../src/ai/emotion/empathy-core";

// PATCH 593 - Neuro-Human Interface Adapter
import {
  neuroHumanAdapter,
  type UserInput,
  type AdaptiveReaction
} from "../src/ai/interface/neuro-adapter";

// PATCH 594 - Adaptive Joint Decision Engine
import {
  adaptiveJointDecision,
  type DecisionType,
  type DecisionOption
} from "../src/ai/decision/adaptive-joint-decision";

// PATCH 595 - Emotion-Aware Feedback System
import {
  feedbackResponder,
  type EmotionType
} from "../src/ai/emotion/feedback-responder";

describe("PATCH 591 - SocioCognitive Interaction Layer", () => {
  beforeEach(() => {
    socioCognitiveLayer.clearContextLog();
    socioCognitiveLayer.setOperationalLoad("normal");
  });

  it("should interpret command with urgency and tone", () => {
    const input: CommandInput = {
      text: "Preciso urgente de ajuda com este problema crítico!",
      timestamp: new Date()
    };

    const interpretation = socioCognitiveLayer.interpretCommand(input);

    expect(interpretation.urgency).toBe("critical");
    expect(["urgent", "stressed"]).toContain(interpretation.tone);
    expect(interpretation.confidence).toBeGreaterThan(0.7);
  });

  it("should adapt response based on operational load", () => {
    socioCognitiveLayer.setOperationalLoad("overload");

    const interpretation = socioCognitiveLayer.interpretCommand({
      text: "Ajuda com tarefa",
      timestamp: new Date()
    });

    const response = socioCognitiveLayer.adaptResponse(interpretation, "Processando sua solicitação");

    expect(response).toContain("Carga");
    expect(response).toContain("Priorize");
  });

  it("should log social context for at least 3 commands", () => {
    const commands = [
      "Ajuda urgente",
      "Preciso resolver isso",
      "Obrigado pela ajuda"
    ];

    commands.forEach(text => {
      const interpretation = socioCognitiveLayer.interpretCommand({
        text,
        timestamp: new Date()
      });
      socioCognitiveLayer.adaptResponse(interpretation, "Resposta");
    });

    const logs = socioCognitiveLayer.getContextLog();
    expect(logs.length).toBeGreaterThanOrEqual(3);
    expect(logs[0]).toHaveProperty("interpretation");
    expect(logs[0]).toHaveProperty("adaptations");
  });

  it("should modify response based on perceived load", () => {
    socioCognitiveLayer.setOperationalLoad("high");

    const interpretation = socioCognitiveLayer.interpretCommand({
      text: "Status do sistema",
      timestamp: new Date()
    });

    const response = socioCognitiveLayer.adaptResponse(interpretation, "Sistema operacional");

    expect(response).toContain("Carga alta");
  });

  it("should detect different urgency levels", () => {
    const testCases: Array<{ text: string; expectedUrgency: UrgencyLevel }> = [
      { text: "Emergência! Socorro!", expectedUrgency: "critical" },
      { text: "Preciso rápido", expectedUrgency: "high" },
      { text: "Quando possível", expectedUrgency: "medium" },
      { text: "Veja isso depois", expectedUrgency: "low" }
    ];

    testCases.forEach(({ text, expectedUrgency }) => {
      const interpretation = socioCognitiveLayer.interpretCommand({
        text,
        timestamp: new Date()
      });
      expect(interpretation.urgency).toBe(expectedUrgency);
    });
  });

  it("should detect different tones", () => {
    const testCases: Array<{ text: string; expectedTone: ToneType }> = [
      { text: "Não aguento mais!", expectedTone: "stressed" },
      { text: "Urgente agora!", expectedTone: "urgent" },
      { text: "Por favor, quando puder", expectedTone: "calm" }
    ];

    testCases.forEach(({ text, expectedTone }) => {
      const interpretation = socioCognitiveLayer.interpretCommand({
        text,
        timestamp: new Date()
      });
      expect(interpretation.tone).toBe(expectedTone);
    });
  });
});

describe("PATCH 592 - Empathy Core Engine", () => {
  beforeEach(() => {
    empathyCore.clearHistory();
  });

  it("should integrate biometric data and interpret emotional state", () => {
    const biometric: BiometricData = {
      heartRate: 95,
      heartRateVariability: 30,
      respirationRate: 20,
      timestamp: new Date(),
      source: "mock"
    };

    const context = empathyCore.integrateBiometrics(biometric);

    expect(context.emotionalState).toBeDefined();
    expect(["calm", "stressed", "anxious", "focused", "tired", "energized"]).toContain(context.emotionalState);
    expect(context.stressLevel).toBeDefined();
    expect(["low", "moderate", "high", "critical"]).toContain(context.stressLevel);
  });

  it("should adjust response based on emotional state", () => {
    // Simula estado de stress alto
    const stressedBiometric = empathyCore.generateMockBiometrics("high");
    empathyCore.integrateBiometrics(stressedBiometric);

    const response = empathyCore.adjustResponse("Complete a tarefa");

    expect(response.adjustedMessage).not.toBe(response.originalMessage);
    expect(response.tone).toBe("calming");
    expect(response.suggestions.length).toBeGreaterThan(0);
  });

  it("should log emotional state with interpretation", () => {
    const biometric1 = empathyCore.generateMockBiometrics("normal");
    const biometric2 = empathyCore.generateMockBiometrics("high");

    empathyCore.integrateBiometrics(biometric1);
    empathyCore.integrateBiometrics(biometric2);

    const history = empathyCore.getEmotionalHistory();
    expect(history.length).toBe(2);
    expect(history[0]).toHaveProperty("emotionalState");
    expect(history[0]).toHaveProperty("stressLevel");
  });

  it("should adapt alerts based on detected stress", () => {
    const criticalBiometric: BiometricData = {
      heartRate: 110,
      heartRateVariability: 15,
      respirationRate: 25,
      timestamp: new Date(),
      source: "mock"
    };

    empathyCore.integrateBiometrics(criticalBiometric);
    const response = empathyCore.adjustResponse("Continue trabalhando");

    expect(response.alerts.length).toBeGreaterThan(0);
    expect(response.alerts.some(alert => alert.includes("stress"))).toBe(true);
  });

  it("should provide cognitive relief actions", () => {
    // Simula alta carga cognitiva
    const stressedBiometric: BiometricData = {
      heartRate: 105,
      heartRateVariability: 20,
      respirationRate: 24,
      timestamp: new Date(),
      source: "mock"
    };

    empathyCore.integrateBiometrics(stressedBiometric);
    const reliefActions = empathyCore.provideCognitiveRelief();

    expect(reliefActions.length).toBeGreaterThan(0);
    expect(["break_suggestion", "task_simplification", "priority_adjustment", "delegation_offer"])
      .toContain(reliefActions[0].type);
  });

  it("should process user feedback to modify context", () => {
    const normalBiometric = empathyCore.generateMockBiometrics("normal");
    empathyCore.integrateBiometrics(normalBiometric);

    const response = empathyCore.adjustResponse("Tarefa", "Estou estressado");

    const context = empathyCore.getCurrentContext();
    expect(context).toBeDefined();
  });
});

describe("PATCH 593 - Neuro-Human Interface Adapter", () => {
  beforeEach(() => {
    neuroHumanAdapter.resetContext();
    neuroHumanAdapter.clearAdaptationLog();
  });

  it("should detect hesitation from pauses", async () => {
    const input1: UserInput = {
      type: "text",
      content: "Primeiro comando",
      timestamp: new Date()
    };

    neuroHumanAdapter.processAdaptiveInput(input1);

    // Simula pausa longa
    await new Promise(resolve => setTimeout(resolve, 3500));

    const input2: UserInput = {
      type: "text",
      content: "Segundo comando",
      timestamp: new Date()
    };

    const reaction = neuroHumanAdapter.processAdaptiveInput(input2);

    expect(["suggest", "wait"]).toContain(reaction.reaction);
  });

  it("should adapt reactions to hesitation", () => {
    const input: UserInput = {
      type: "text",
      content: "Hmm... não sei...",
      timestamp: new Date()
    };

    const reaction = neuroHumanAdapter.processAdaptiveInput(input);

    expect(["wait", "clarify", "suggest"]).toContain(reaction.reaction);
  });

  it("should log adaptation with context", () => {
    const inputs = [
      { type: "text" as const, content: "Comando 1", timestamp: new Date() },
      { type: "text" as const, content: "Comando 2", timestamp: new Date() },
      { type: "text" as const, content: "Comando 3", timestamp: new Date() }
    ];

    inputs.forEach(input => neuroHumanAdapter.processAdaptiveInput(input));

    const logs = neuroHumanAdapter.getAdaptationLog();
    expect(logs.length).toBeGreaterThanOrEqual(3);
    expect(logs[0]).toHaveProperty("input");
    expect(logs[0]).toHaveProperty("reaction");
  });

  it("should require confirmation for critical actions", () => {
    const input: UserInput = {
      type: "text",
      content: "Deletar todos os dados",
      timestamp: new Date()
    };

    const reaction = neuroHumanAdapter.processAdaptiveInput(input);

    expect(reaction.requiresConfirmation).toBe(true);
    expect(reaction.reaction).toBe("confirm");
  });

  it("should allow user confirmation before execution", () => {
    const confirmReaction = neuroHumanAdapter.confirmCriticalAction(true);
    expect(confirmReaction.reaction).toBe("execute");

    neuroHumanAdapter.resetContext();

    const cancelReaction = neuroHumanAdapter.confirmCriticalAction(false);
    expect(cancelReaction.reaction).toBe("wait");
  });

  it("should detect repetition as hesitation", () => {
    const input: UserInput = {
      type: "text",
      content: "Mesmo comando",
      timestamp: new Date()
    };

    neuroHumanAdapter.processAdaptiveInput(input);
    neuroHumanAdapter.processAdaptiveInput(input);
    const reaction = neuroHumanAdapter.processAdaptiveInput(input);

    expect(reaction.reaction).toBe("clarify");
  });
});

describe("PATCH 594 - Adaptive Joint Decision Engine", () => {
  beforeEach(() => {
    adaptiveJointDecision.clearHistory();
    adaptiveJointDecision.resetFeedbackStats();
  });

  it("should propose decision with options", () => {
    const options: Omit<DecisionOption, "id">[] = [
      {
        description: "Opção A",
        pros: ["Vantagem 1", "Vantagem 2"],
        cons: ["Desvantagem 1"],
        riskLevel: "low",
        estimatedImpact: 0.8,
        recommendedBy: "ai"
      },
      {
        description: "Opção B",
        pros: ["Vantagem 3"],
        cons: ["Desvantagem 2", "Desvantagem 3"],
        riskLevel: "high",
        estimatedImpact: 0.5,
        recommendedBy: "human"
      }
    ];

    const proposal = adaptiveJointDecision.proposeDecision(
      "tactical",
      "Decisão sobre estratégia",
      options
    );

    expect(proposal).toHaveProperty("id");
    expect(proposal.options.length).toBe(2);
    expect(proposal.aiRecommendation).toBeDefined();
    expect(proposal.aiConfidence).toBeDefined();
  });

  it("should allow operator review and acceptance", () => {
    const options: Omit<DecisionOption, "id">[] = [
      {
        description: "Opção Teste",
        pros: ["Pro 1"],
        cons: ["Con 1"],
        riskLevel: "medium",
        estimatedImpact: 0.7,
        recommendedBy: "ai"
      }
    ];

    const proposal = adaptiveJointDecision.proposeDecision("operational", "Contexto", options);
    const review = adaptiveJointDecision.reviewDecision(
      proposal,
      "accepted",
      "operator1",
      proposal.options[0].id,
      "Concordo com a recomendação"
    );

    expect(review.status).toBe("accepted");
    expect(review.decisionId).toBe(proposal.id);
  });

  it("should change AI behavior when rejected", () => {
    const options: Omit<DecisionOption, "id">[] = [
      {
        description: "Opção",
        pros: ["Pro"],
        cons: ["Con"],
        riskLevel: "low",
        estimatedImpact: 0.5,
        recommendedBy: "ai"
      }
    ];

    // Propõe e rejeita 5 decisões
    for (let i = 0; i < 5; i++) {
      const proposal = adaptiveJointDecision.proposeDecision("strategic", "Contexto", options);
      adaptiveJointDecision.reviewDecision(proposal, "rejected", "operator1", undefined, "Discordo");
    }

    const finalConfidence = adaptiveJointDecision.getConfidenceLevel("strategic");
    expect(["low", "very_low"]).toContain(finalConfidence);
  });

  it("should log joint decisions in real-time", () => {
    const options: Omit<DecisionOption, "id">[] = [
      {
        description: "Opção",
        pros: ["Pro"],
        cons: ["Con"],
        riskLevel: "low",
        estimatedImpact: 0.5,
        recommendedBy: "ai"
      }
    ];

    const proposal1 = adaptiveJointDecision.proposeDecision("tactical", "Contexto 1", options);
    const proposal2 = adaptiveJointDecision.proposeDecision("operational", "Contexto 2", options);

    adaptiveJointDecision.reviewDecision(proposal1, "accepted", "op1");
    adaptiveJointDecision.reviewDecision(proposal2, "accepted", "op2");

    const history = adaptiveJointDecision.getDecisionHistory();
    expect(history.length).toBe(2);
  });

  it("should require human approval for critical decisions", () => {
    const options: Omit<DecisionOption, "id">[] = [
      {
        description: "Decisão crítica",
        pros: ["Pro"],
        cons: ["Con"],
        riskLevel: "high",
        estimatedImpact: 0.9,
        recommendedBy: "ai"
      }
    ];

    const proposal = adaptiveJointDecision.proposeDecision("critical", "Situação crítica", options);
    expect(proposal.requiresHumanApproval).toBe(true);
  });
});

describe("PATCH 595 - Emotion-Aware Feedback System", () => {
  beforeEach(() => {
    feedbackResponder.clearHistory();
  });

  it("should detect emotion with 80% accuracy", () => {
    const testCases = [
      { input: "Estou frustrado com isso", expectedEmotion: "frustration" as EmotionType },
      { input: "Finalmente funcionou! Aliviado!", expectedEmotion: "relief" as EmotionType },
      { input: "Estou muito estressado", expectedEmotion: "stress" as EmotionType },
      { input: "Não entendi nada", expectedEmotion: "confusion" as EmotionType },
      { input: "Estou muito feliz", expectedEmotion: "joy" as EmotionType },
      { input: "Estou ansioso com isso", expectedEmotion: "anxiety" as EmotionType },
      { input: "Isso é péssimo", expectedEmotion: "anger" as EmotionType },
      { input: "Está bom assim", expectedEmotion: "satisfaction" as EmotionType },
      { input: "Que frustração", expectedEmotion: "frustration" as EmotionType },
      { input: "Obrigado, resolvido", expectedEmotion: "relief" as EmotionType }
    ];

    const accuracy = feedbackResponder.validateAccuracy(testCases);
    expect(accuracy).toBeGreaterThanOrEqual(0.8);
  });

  it("should adjust feedback in real-time", () => {
    const response = feedbackResponder.adjustResponse(
      "Complete a tarefa",
      "Estou frustrado com este problema"
    );

    expect(response.adjustedResponse).not.toBe(response.originalResponse);
    expect(response.adjustments.length).toBeGreaterThan(0);
  });

  it("should recognize at least 3 emotion types", () => {
    const inputs = [
      "Estou frustrado",
      "Que alívio!",
      "Muito estressado"
    ];

    const detectedEmotions = new Set<EmotionType>();
    inputs.forEach(input => {
      const feedback = feedbackResponder.registerFeedback(input);
      detectedEmotions.add(feedback.primaryEmotion);
    });

    expect(detectedEmotions.size).toBeGreaterThanOrEqual(3);
  });

  it("should provide emotion statistics", () => {
    feedbackResponder.registerFeedback("Estou frustrado");
    feedbackResponder.registerFeedback("Que alívio");
    feedbackResponder.registerFeedback("Muito estressado");

    const stats = feedbackResponder.getEmotionStats();
    expect(stats.length).toBeGreaterThan(0);
    expect(stats[0]).toHaveProperty("emotion");
    expect(stats[0]).toHaveProperty("count");
    expect(stats[0]).toHaveProperty("averageIntensity");
  });

  it("should detect emotions from voice input", () => {
    const feedback = feedbackResponder.registerFeedback("Preciso de ajuda urgente!", "voice");
    expect(feedback.modality).toBe("voice");
    expect(feedback.detectedEmotions.length).toBeGreaterThan(0);
  });

  it("should provide suggestions based on emotion", () => {
    const response = feedbackResponder.adjustResponse(
      "Processo concluído",
      "Não aguento mais, estou estressado"
    );

    expect(response.suggestions.length).toBeGreaterThan(0);
  });
});
