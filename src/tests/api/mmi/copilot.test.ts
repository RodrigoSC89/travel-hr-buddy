import { describe, it, expect } from "vitest";
import {
  generateCopilotSuggestion,
  findSimilarJobs,
  formatSuggestionAsText,
} from "@/services/mmi/copilotService";

describe("MMI Copilot Service", () => {
  describe("generateCopilotSuggestion", () => {
    it("should return technical suggestion based on similar history", async () => {
      const prompt = "Gerador STBD com ruído incomum e aumento de temperatura";
      const suggestion = await generateCopilotSuggestion(prompt);

      expect(suggestion).toBeDefined();
      expect(suggestion.similar_jobs_found).toBeGreaterThan(0);
      expect(suggestion.recommended_action).toContain("Criar job");
      expect(typeof suggestion.confidence).toBe("number");
    });

    it("should include historical context in response", async () => {
      const prompt = "Vazamento hidráulico no propulsor";
      const suggestion = await generateCopilotSuggestion(prompt);

      expect(suggestion.historical_context).toBeDefined();
      expect(suggestion.historical_context).toContain("semelhante");
      expect(suggestion.historical_context.length).toBeGreaterThan(50);
    });

    it("should return recommended action with estimated time", async () => {
      const prompt = "Bomba hidráulica com vibração excessiva";
      const suggestion = await generateCopilotSuggestion(prompt);

      expect(suggestion.recommended_action).toBeDefined();
      expect(suggestion.estimated_time).toBeDefined();
      expect(suggestion.estimated_time).toMatch(/\d+\s+(dia|dias)/i);
    });

    it("should calculate suggestion confidence score", async () => {
      const prompt = "Gerador com problema de temperatura";
      const suggestion = await generateCopilotSuggestion(prompt);

      expect(suggestion.confidence).toBeGreaterThan(0);
      expect(suggestion.confidence).toBeLessThanOrEqual(1);
      expect(typeof suggestion.confidence).toBe("number");
    });

    it("should handle prompts without similar history", async () => {
      const prompt = "Sistema completamente novo nunca visto antes xyz123";
      const suggestion = await generateCopilotSuggestion(prompt);

      // Should still return a suggestion, even if no similar jobs
      expect(suggestion).toBeDefined();
      expect(suggestion.recommended_action).toBeDefined();
      expect(suggestion.historical_context).toBeDefined();
    });

    it("should reject invalid prompts", async () => {
      const emptyPrompt = "";
      const suggestion = await generateCopilotSuggestion(emptyPrompt);

      expect(suggestion.similar_jobs_found).toBe(0);
      expect(suggestion.confidence).toBe(0);
      expect(suggestion.historical_context).toContain("Nenhuma descrição");
    });

    it("should support multiple failure types", async () => {
      const prompts = [
        "Gerador com ruído",
        "Bomba com vibração",
        "Válvula com vazamento",
      ];

      for (const prompt of prompts) {
        const suggestion = await generateCopilotSuggestion(prompt);
        expect(suggestion).toBeDefined();
        expect(suggestion.recommended_action).toBeTruthy();
      }
    });

    it("should include similar jobs count", async () => {
      const prompt = "Falha no sistema hidráulico";
      const suggestion = await generateCopilotSuggestion(prompt);

      expect(suggestion.similar_jobs_found).toBeGreaterThanOrEqual(0);
      expect(typeof suggestion.similar_jobs_found).toBe("number");
    });

    it("should format response as readable text", async () => {
      const prompt = "Gerador STBD com ruído";
      const suggestion = await generateCopilotSuggestion(prompt);
      const formattedText = formatSuggestionAsText(suggestion);

      expect(formattedText).toBeDefined();
      expect(formattedText.length).toBeGreaterThan(50);
      expect(formattedText).toContain("Ação Recomendada");
    });

    it("should process requests quickly (< 2s)", async () => {
      const startTime = Date.now();
      const prompt = "Bomba hidráulica com problema";
      await generateCopilotSuggestion(prompt);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000);
    });
  });

  describe("findSimilarJobs", () => {
    it("should find similar jobs based on keywords", () => {
      const prompt = "Gerador com ruído e temperatura alta";
      const results = findSimilarJobs(prompt, 0.2, 3);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty("similarity");
      expect(results[0].similarity).toBeGreaterThan(0);
    });

    it("should sort results by similarity descending", () => {
      const prompt = "Sistema hidráulico com vazamento";
      const results = findSimilarJobs(prompt, 0.1, 5);

      if (results.length > 1) {
        for (let i = 0; i < results.length - 1; i++) {
          expect(results[i].similarity).toBeGreaterThanOrEqual(
            results[i + 1].similarity
          );
        }
      }
    });

    it("should respect threshold parameter", () => {
      const prompt = "Bomba hidráulica";
      const threshold = 0.5;
      const results = findSimilarJobs(prompt, threshold, 10);

      results.forEach((result) => {
        expect(result.similarity).toBeGreaterThanOrEqual(threshold);
      });
    });

    it("should respect limit parameter", () => {
      const prompt = "Sistema de manutenção";
      const limit = 2;
      const results = findSimilarJobs(prompt, 0.1, limit);

      expect(results.length).toBeLessThanOrEqual(limit);
    });
  });

  describe("formatSuggestionAsText", () => {
    it("should format suggestion with all sections", () => {
      const suggestion = {
        similar_jobs_found: 3,
        historical_context: "Encontrados 3 casos similares",
        recommended_action: "Realizar manutenção preventiva",
        estimated_time: "2 dias",
        confidence: 0.85,
      };

      const text = formatSuggestionAsText(suggestion);

      expect(text).toContain("Contexto Histórico");
      expect(text).toContain("Ação Recomendada");
      expect(text).toContain("Tempo Estimado");
      expect(text).toContain("Confiança");
      expect(text).toContain("85%");
    });

    it("should format suggestion without similar jobs", () => {
      const suggestion = {
        similar_jobs_found: 0,
        historical_context: "Nenhum caso similar encontrado",
        recommended_action: "Consultar manual técnico",
        estimated_time: "A definir",
        confidence: 0.3,
      };

      const text = formatSuggestionAsText(suggestion);

      expect(text).toBeDefined();
      expect(text).toContain("Nenhum caso similar");
    });
  });
});
