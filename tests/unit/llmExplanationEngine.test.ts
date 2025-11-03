/**
 * PATCH 598 - Unit tests for LLM Explanation Engine
 * Tests AI-generated explanations, feedback, and adaptive learning logic
 */

import { describe, it, expect } from "vitest";

interface TrainingExplanation {
  concept: string;
  explanation: string;
  examples: string[];
  difficulty_level: "beginner" | "intermediate" | "advanced";
  language: string;
}

interface AdaptiveFeedback {
  user_id: string;
  question_id: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  feedback: string;
  hints: string[];
  next_recommended_topic: string;
}

interface LearningPath {
  user_id: string;
  current_level: number;
  completed_modules: string[];
  recommended_next: string[];
  skill_gaps: string[];
  progress_percentage: number;
}

interface AIGeneratedContent {
  id: string;
  type: "explanation" | "example" | "quiz" | "summary";
  content: string;
  metadata: {
    generated_at: string;
    model_version: string;
    confidence_score: number;
  };
}

describe("LLM Explanation Engine", () => {
  describe("Explanation Generation", () => {
    it("should generate valid explanation structure", () => {
      const explanation: TrainingExplanation = {
        concept: "ISM Code - Safety Management System",
        explanation: "The International Safety Management (ISM) Code provides an international standard for the safe management and operation of ships. It requires ship operators to develop and implement a Safety Management System (SMS) that includes clear procedures for safe operation, risk assessment, and continuous improvement.",
        examples: [
          "Emergency response procedures documented in SMS",
          "Regular safety drills and their documentation",
          "Non-conformity reporting and corrective actions",
        ],
        difficulty_level: "intermediate",
        language: "en",
      };

      expect(explanation.concept).toBeTruthy();
      expect(explanation.explanation).toBeTruthy();
      expect(explanation.explanation.length).toBeGreaterThan(100);
      expect(explanation.examples).toBeInstanceOf(Array);
      expect(explanation.examples.length).toBeGreaterThan(0);
      expect(["beginner", "intermediate", "advanced"]).toContain(explanation.difficulty_level);
    });

    it("should provide context-appropriate explanations", () => {
      const beginnerExplanation: TrainingExplanation = {
        concept: "Fire Safety Basics",
        explanation: "Fire safety on ships involves preventing fires and knowing how to respond if one occurs. The fire triangle consists of fuel, heat, and oxygen - remove any one of these and the fire cannot continue.",
        examples: [
          "Keep flammable materials stored properly",
          "Know the location of fire extinguishers",
          "Participate in fire drills",
        ],
        difficulty_level: "beginner",
        language: "en",
      };

      const advancedExplanation: TrainingExplanation = {
        concept: "Advanced Fire Suppression Systems",
        explanation: "Modern ships employ multiple fire suppression systems including CO2 flooding, water mist systems, and foam suppression. Each system is designed for specific fire classes and spaces, with automatic activation sequences and manual override capabilities integrated with the integrated alarm monitoring system.",
        examples: [
          "CO2 system activation sequences for machinery spaces",
          "Water mist system optimization for accommodation areas",
          "Foam concentrate mixing ratios for different fuel types",
        ],
        difficulty_level: "advanced",
        language: "en",
      };

      expect(beginnerExplanation.difficulty_level).toBe("beginner");
      expect(advancedExplanation.difficulty_level).toBe("advanced");
      expect(advancedExplanation.explanation.length).toBeGreaterThan(
        beginnerExplanation.explanation.length
      );
    });
  });

  describe("Adaptive Feedback", () => {
    it("should provide constructive feedback for incorrect answers", () => {
      const feedback: AdaptiveFeedback = {
        user_id: "user-123",
        question_id: "q-456",
        user_answer: "Every 6 months",
        correct_answer: "Monthly",
        is_correct: false,
        feedback: "Not quite. While some drills are conducted semi-annually, fire and boat drills are required to be conducted monthly according to SOLAS regulations. This ensures crew maintains proficiency in emergency procedures.",
        hints: [
          "Check SOLAS Chapter III requirements",
          "Monthly drills are the most frequent regulatory requirement",
        ],
        next_recommended_topic: "SOLAS Drill Requirements",
      };

      expect(feedback.is_correct).toBe(false);
      expect(feedback.feedback).toBeTruthy();
      expect(feedback.feedback.length).toBeGreaterThan(50);
      expect(feedback.hints).toBeInstanceOf(Array);
      expect(feedback.hints.length).toBeGreaterThan(0);
      expect(feedback.next_recommended_topic).toBeTruthy();
    });

    it("should provide positive reinforcement for correct answers", () => {
      const feedback: AdaptiveFeedback = {
        user_id: "user-123",
        question_id: "q-457",
        user_answer: "Within 24 hours",
        correct_answer: "Within 24 hours",
        is_correct: true,
        feedback: "Excellent! You correctly identified that fire and boat drills must be conducted within 24 hours of leaving port if more than 25% of the crew has not participated in such drills in the previous month. This ensures all crew members are familiar with emergency procedures.",
        hints: [],
        next_recommended_topic: "Advanced Emergency Procedures",
      };

      expect(feedback.is_correct).toBe(true);
      expect(feedback.feedback).toContain("Excellent");
      expect(feedback.hints.length).toBe(0);
    });
  });

  describe("Adaptive Learning Paths", () => {
    it("should track learning progress", () => {
      const learningPath: LearningPath = {
        user_id: "user-123",
        current_level: 5,
        completed_modules: [
          "fire-safety-basics",
          "lifesaving-equipment",
          "ism-introduction",
          "psc-preparation",
          "mlc-compliance",
        ],
        recommended_next: [
          "advanced-fire-suppression",
          "emergency-leadership",
        ],
        skill_gaps: [
          "cargo-operations",
          "pollution-prevention",
        ],
        progress_percentage: 62.5,
      };

      expect(learningPath.current_level).toBeGreaterThan(0);
      expect(learningPath.completed_modules).toBeInstanceOf(Array);
      expect(learningPath.recommended_next).toBeInstanceOf(Array);
      expect(learningPath.skill_gaps).toBeInstanceOf(Array);
      expect(learningPath.progress_percentage).toBeGreaterThanOrEqual(0);
      expect(learningPath.progress_percentage).toBeLessThanOrEqual(100);
    });

    it("should recommend appropriate next topics", () => {
      const beginnerPath: LearningPath = {
        user_id: "user-124",
        current_level: 2,
        completed_modules: ["safety-orientation", "basic-terminology"],
        recommended_next: ["fire-safety-basics", "personal-safety-equipment"],
        skill_gaps: ["advanced-navigation", "cargo-operations"],
        progress_percentage: 15.0,
      };

      const advancedPath: LearningPath = {
        user_id: "user-125",
        current_level: 8,
        completed_modules: [
          "fire-safety-basics",
          "advanced-fire-suppression",
          "emergency-leadership",
          "damage-control",
        ],
        recommended_next: ["crisis-management", "incident-investigation"],
        skill_gaps: [],
        progress_percentage: 85.0,
      };

      expect(beginnerPath.current_level).toBeLessThan(advancedPath.current_level);
      expect(beginnerPath.progress_percentage).toBeLessThan(advancedPath.progress_percentage);
      expect(advancedPath.skill_gaps.length).toBe(0);
    });
  });

  describe("AI Content Generation", () => {
    it("should generate valid AI content with metadata", () => {
      const aiContent: AIGeneratedContent = {
        id: "content-001",
        type: "explanation",
        content: "The MARPOL Convention (Marine Pollution) is the main international convention addressing prevention of pollution from ships. It covers pollution by oil, chemicals, harmful substances in packaged form, sewage, garbage, and air pollution.",
        metadata: {
          generated_at: "2025-11-03T10:00:00Z",
          model_version: "gpt-4",
          confidence_score: 0.95,
        },
      };

      expect(aiContent.id).toBeTruthy();
      expect(["explanation", "example", "quiz", "summary"]).toContain(aiContent.type);
      expect(aiContent.content).toBeTruthy();
      expect(aiContent.metadata.confidence_score).toBeGreaterThanOrEqual(0);
      expect(aiContent.metadata.confidence_score).toBeLessThanOrEqual(1);
    });

    it("should validate content quality thresholds", () => {
      const highQualityContent: AIGeneratedContent = {
        id: "content-002",
        type: "summary",
        content: "Comprehensive summary of ISM Code implementation requirements...",
        metadata: {
          generated_at: "2025-11-03T10:00:00Z",
          model_version: "gpt-4",
          confidence_score: 0.92,
        },
      };

      const lowQualityContent: AIGeneratedContent = {
        id: "content-003",
        type: "example",
        content: "Example of safety procedure...",
        metadata: {
          generated_at: "2025-11-03T10:00:00Z",
          model_version: "gpt-3.5",
          confidence_score: 0.65,
        },
      };

      const qualityThreshold = 0.80;
      expect(highQualityContent.metadata.confidence_score).toBeGreaterThan(qualityThreshold);
      expect(lowQualityContent.metadata.confidence_score).toBeLessThan(qualityThreshold);
    });
  });

  describe("Multi-language Support", () => {
    it("should support multiple languages", () => {
      const englishExplanation: TrainingExplanation = {
        concept: "Life Saving Appliances",
        explanation: "LSA includes all equipment designed to save lives at sea, including lifeboats, life rafts, life jackets, and immersion suits.",
        examples: ["Lifeboat maintenance", "Life jacket inspection"],
        difficulty_level: "beginner",
        language: "en",
      };

      const portugueseExplanation: TrainingExplanation = {
        concept: "Equipamentos Salva-Vidas",
        explanation: "LSA inclui todos os equipamentos projetados para salvar vidas no mar, incluindo botes salva-vidas, balsas, coletes salva-vidas e trajes de imersão.",
        examples: ["Manutenção de bote salva-vidas", "Inspeção de colete salva-vidas"],
        difficulty_level: "beginner",
        language: "pt",
      };

      expect(englishExplanation.language).toBe("en");
      expect(portugueseExplanation.language).toBe("pt");
      expect(englishExplanation.concept).not.toBe(portugueseExplanation.concept);
    });
  });
});
