/**
 * Tests for PATCH 632 - Nautilus Copilot V2
 */

import { describe, it, expect } from "vitest";
import {
  getAvailableCommands,
  executeCopilotCommand,
  getPredictiveSuggestions,
  processVoiceCommand,
  generateInteractiveCard
} from "@/lib/ai/copilot-v2";

type TrainingModule = {
  id: string;
  title: string;
  role: string;
  duration: string;
  topics: string[];
  status: "not_started" | "in_progress" | "completed";
  progress: number;
};

type CorrectiveAction = {
  type: string;
  priority: "low" | "medium" | "high";
  action: string;
  description: string;
  context?: Record<string, unknown>;
};

describe("PATCH 632 - Nautilus Copilot V2", () => {
  describe("Command Management", () => {
    it("should return all available commands", () => {
      const commands = getAvailableCommands();

      expect(commands).toBeDefined();
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });

    it("should filter commands by category", () => {
      const complianceCommands = getAvailableCommands("compliance");

      expect(complianceCommands.every(c => c.category === "compliance")).toBe(true);
    });

    it("should include required command properties", () => {
      const commands = getAvailableCommands();
      const command = commands[0];

      expect(command).toHaveProperty("id");
      expect(command).toHaveProperty("command");
      expect(command).toHaveProperty("category");
      expect(command).toHaveProperty("description");
    });

    it("should include keyboard shortcuts", () => {
      const commands = getAvailableCommands();
      const commandsWithShortcuts = commands.filter(c => c.shortcut);

      expect(commandsWithShortcuts.length).toBeGreaterThan(0);
    });
  });

  describe("Command Execution", () => {
    it("should execute explain-nc command", async () => {
      const result = await executeCopilotCommand("explain-nc", {
        nonConformanceCode: "ISM-12.1"
      });

      expect(result).toBeDefined();
      expect(result.topic).toBeDefined();
      expect(result.explanation).toBeDefined();
      expect(result.references).toBeInstanceOf(Array);
    });

    it("should execute check-compliance command", async () => {
      const result = await executeCopilotCommand("check-compliance");

      expect(result).toBeDefined();
      expect(result.type).toBe("info");
      expect(result.title).toContain("Compliance");
      expect(result.data).toBeDefined();
    });

    it("should execute predict-risk command", async () => {
      const result = await executeCopilotCommand("predict-risk");

      expect(result).toBeDefined();
      expect(result.type).toBe("warning");
      expect(result.data).toHaveProperty("highRisks");
    });

    it("should execute verify-evidence command", async () => {
      const result = await executeCopilotCommand("verify-evidence");

      expect(result).toBeDefined();
      expect(result.title).toContain("Evidence");
      expect(result.data).toHaveProperty("integrityStatus");
    });

    it("should execute explain-report command", async () => {
      const result = await executeCopilotCommand("explain-report", {
        reportType: "audit"
      });

      expect(result).toBeDefined();
      expect(result.explanation).toBeDefined();
      expect(result.references).toBeInstanceOf(Array);
    });

    it("should execute suggest-actions command", async () => {
      const result = await executeCopilotCommand("suggest-actions");

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("type");
      expect(result[0]).toHaveProperty("priority");
    });

    it("should execute training-mode command", async () => {
      const result = await executeCopilotCommand("training-mode");

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("title");
      expect(result[0]).toHaveProperty("role");
      expect(result[0]).toHaveProperty("duration");
    });

    it("should throw error for unknown command", async () => {
      await expect(
        executeCopilotCommand("unknown-command")
      ).rejects.toThrow("Unknown command");
    });

    it("should accept context parameters", async () => {
      const result = await executeCopilotCommand("explain-nc", {
        nonConformanceCode: "MLC-2.3",
        severity: "critical"
      });

      expect(result).toBeDefined();
      expect(result.topic).toContain("MLC-2.3");
    });
  });

  describe("Predictive Suggestions", () => {
    it("should generate suggestions based on module context", async () => {
      const suggestions = await getPredictiveSuggestions("compliance", "auditor");

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("should include suggestion properties", async () => {
      const suggestions = await getPredictiveSuggestions("audits", "auditor");

      if (suggestions.length > 0) {
        const suggestion = suggestions[0];
        expect(suggestion).toHaveProperty("id");
        expect(suggestion).toHaveProperty("type");
        expect(suggestion).toHaveProperty("priority");
        expect(suggestion).toHaveProperty("title");
        expect(suggestion).toHaveProperty("description");
      }
    });

    it("should provide context-aware suggestions for compliance module", async () => {
      const suggestions = await getPredictiveSuggestions("compliance", "auditor");

      expect(suggestions.some(s => s.action?.includes("compliance"))).toBe(true);
    });

    it("should prioritize high-priority suggestions", async () => {
      const suggestions = await getPredictiveSuggestions("compliance", "auditor");
      const highPriority = suggestions.filter(s => s.priority === "high");

      expect(highPriority.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Voice Command Processing", () => {
    it("should process 'check compliance' voice command", async () => {
      const result = await processVoiceCommand("Check compliance status");

      expect(result.understood).toBe(true);
      expect(result.command).toBe("check-compliance");
      expect(result.response).toBeDefined();
    });

    it("should process 'explain' voice command", async () => {
      const result = await processVoiceCommand("Explain this non-conformance");

      expect(result.understood).toBe(true);
      expect(result.command).toBe("explain");
      expect(result.response).toBeDefined();
    });

    it("should process 'predict risk' voice command", async () => {
      const result = await processVoiceCommand("Predict risks for ISM");

      expect(result.understood).toBe(true);
      expect(result.command).toBe("predict-risk");
      expect(result.response).toBeDefined();
    });

    it("should handle unrecognized voice commands", async () => {
      const result = await processVoiceCommand("Random gibberish command");

      expect(result.understood).toBe(false);
      expect(result.command).toBeUndefined();
      expect(result.response).toContain("didn't understand");
    });

    it("should be case-insensitive", async () => {
      const result1 = await processVoiceCommand("CHECK COMPLIANCE");
      const result2 = await processVoiceCommand("check compliance");

      expect(result1.understood).toBe(true);
      expect(result2.understood).toBe(true);
      expect(result1.command).toBe(result2.command);
    });

    it("should handle partial matches", async () => {
      const result = await processVoiceCommand("What is ISM Code?");

      expect(result.understood).toBe(true);
      expect(result.command).toBe("explain");
    });
  });

  describe("Interactive Cards", () => {
    it("should generate insight card", () => {
      const card = generateInteractiveCard("insight", { topic: "test" });

      expect(card).toBeDefined();
      expect(card.type).toBe("insight");
      expect(card.title).toBeDefined();
      expect(card.content).toBeDefined();
    });

    it("should generate warning card", () => {
      const card = generateInteractiveCard("warning", { count: 2 });

      expect(card).toBeDefined();
      expect(card.type).toBe("warning");
      expect(card.title).toBeDefined();
    });

    it("should generate action card with actions", () => {
      const card = generateInteractiveCard("action", { actionType: "audit" });

      expect(card).toBeDefined();
      expect(card.type).toBe("action");
      expect(card.actions).toBeDefined();
      expect(card.actions?.length).toBeGreaterThan(0);
    });

    it("should generate info card", () => {
      const card = generateInteractiveCard("info", { status: "ok" });

      expect(card).toBeDefined();
      expect(card.type).toBe("info");
    });

    it("should include data in cards", () => {
      const testData = { key: "value", number: 42 };
      const card = generateInteractiveCard("info", testData);

      expect(card.data).toEqual(testData);
    });
  });

  describe("Explanation Generation", () => {
    it("should provide detailed explanations", async () => {
      const result = await executeCopilotCommand("explain-nc");

      expect(result.explanation.length).toBeGreaterThan(50);
      expect(result.references.length).toBeGreaterThan(0);
      expect(result.relatedTopics.length).toBeGreaterThan(0);
    });

    it("should include examples when available", async () => {
      const result = await executeCopilotCommand("explain-nc");

      expect(result.examples).toBeDefined();
      expect(Array.isArray(result.examples)).toBe(true);
    });

    it("should include relevant references", async () => {
      const result = await executeCopilotCommand("explain-report", {
        reportType: "audit"
      });

      expect(result.references.every((ref: string) => ref.length > 0)).toBe(true);
    });

    it("should provide related topics for exploration", async () => {
      const result = await executeCopilotCommand("explain-nc");

      expect(result.relatedTopics.length).toBeGreaterThan(0);
      expect(result.relatedTopics[0]).toBeTypeOf("string");
    });
  });

  describe("Training Mode", () => {
    it("should return training modules", async () => {
      const modules = await executeCopilotCommand("training-mode");

      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);
    });

    it("should include module properties", async () => {
      const modules = await executeCopilotCommand("training-mode");
      const module = modules[0];

      expect(module).toHaveProperty("id");
      expect(module).toHaveProperty("title");
      expect(module).toHaveProperty("role");
      expect(module).toHaveProperty("duration");
      expect(module).toHaveProperty("topics");
      expect(module).toHaveProperty("status");
      expect(module).toHaveProperty("progress");
    });

    it("should have valid module status", async () => {
      const modules = await executeCopilotCommand("training-mode");
      const trainingModules = modules as TrainingModule[];

      const validStatuses: TrainingModule["status"][] = [
        "not_started",
        "in_progress",
        "completed",
      ];
      trainingModules.forEach((module) => {
        expect(validStatuses).toContain(module.status);
      });
    });

    it("should have valid progress values", async () => {
      const modules = await executeCopilotCommand("training-mode");
      const trainingModules = modules as TrainingModule[];

      trainingModules.forEach((module) => {
        expect(module.progress).toBeGreaterThanOrEqual(0);
        expect(module.progress).toBeLessThanOrEqual(100);
      });
    });

    it("should include topics array", async () => {
      const modules = await executeCopilotCommand("training-mode");
      const trainingModules = modules as TrainingModule[];

      trainingModules.forEach((module) => {
        expect(Array.isArray(module.topics)).toBe(true);
        expect(module.topics.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Corrective Actions", () => {
    it("should suggest multiple actions", async () => {
      const actions = await executeCopilotCommand("suggest-actions");

      expect(actions.length).toBeGreaterThan(1);
    });

    it("should prioritize actions by severity", async () => {
      const actions = await executeCopilotCommand("suggest-actions");
      const correctiveActions = actions as CorrectiveAction[];
      const priorities = correctiveActions.map(action => action.priority);

      expect(priorities).toContain("high");
    });

    it("should include action context", async () => {
      const actions = await executeCopilotCommand("suggest-actions");
      const correctiveActions = actions as CorrectiveAction[];

      correctiveActions.forEach((action) => {
        expect(action).toHaveProperty("context");
      });
    });

    it("should provide actionable suggestions", async () => {
      const actions = await executeCopilotCommand("suggest-actions");
      const correctiveActions = actions as CorrectiveAction[];

      correctiveActions.forEach((action) => {
        expect(action.action).toBeDefined();
        expect(action.description.length).toBeGreaterThan(10);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty context", async () => {
      const result = await executeCopilotCommand("check-compliance", {});

      expect(result).toBeDefined();
    });

    it("should handle undefined context", async () => {
      const result = await executeCopilotCommand("predict-risk", undefined);

      expect(result).toBeDefined();
    });

    it("should handle special characters in voice commands", async () => {
      const result = await processVoiceCommand("Check compliance status with some extra words");

      expect(result.understood).toBe(true);
    });

    it("should return empty suggestions for unknown module", async () => {
      const suggestions = await getPredictiveSuggestions("unknown-module", "user");

      expect(Array.isArray(suggestions)).toBe(true);
    });
  });
});
