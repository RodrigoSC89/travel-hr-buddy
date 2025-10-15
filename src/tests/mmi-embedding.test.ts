import { describe, it, expect, vi } from "vitest";
import {
  generateEmbedding,
  formatJobForEmbedding,
  formatJobHistoryForEmbedding,
} from "@/services/mmi/embeddingService";

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      embeddings = {
        create: vi.fn(() => Promise.resolve({
          data: [{
            embedding: new Array(1536).fill(0.1),
          }],
        })),
      };
    },
  };
});

describe("MMI Vector Embedding Service", () => {
  describe("generateEmbedding", () => {
    it("should generate embedding vector", async () => {
      const text = "Test maintenance job for hydraulic system";
      const embedding = await generateEmbedding(text);

      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(1536); // OpenAI ada-002 embedding dimension
    });

    it("should generate normalized vectors", async () => {
      const text = "Test text for embedding";
      const embedding = await generateEmbedding(text);

      // Calculate vector magnitude
      const magnitude = Math.sqrt(
        embedding.reduce((sum, val) => sum + val * val, 0)
      );

      // Should be approximately normalized (close to 1)
      expect(magnitude).toBeGreaterThan(0.9);
      expect(magnitude).toBeLessThan(1.1);
    });

    it("should handle empty text", async () => {
      const embedding = await generateEmbedding("");

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(1536);
    });

    it("should handle long text", async () => {
      const longText = "Test text ".repeat(1000);
      const embedding = await generateEmbedding(longText);

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(1536);
    });

    it("should generate consistent dimension vectors", async () => {
      const embedding1 = await generateEmbedding("First text");
      const embedding2 = await generateEmbedding("Second text");

      expect(embedding1.length).toBe(embedding2.length);
      expect(embedding1.length).toBe(1536);
    });

    it("should complete within reasonable time", async () => {
      const startTime = Date.now();
      await generateEmbedding("Test text for timing");
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(3000); // Less than 3 seconds
    });
  });

  describe("formatJobForEmbedding", () => {
    it("should format job data correctly", () => {
      const job = {
        title: "Test Maintenance",
        description: "Test description",
        component_name: "Hydraulic System",
        asset_name: "Pump #3",
        vessel: "Test Vessel",
        priority: "Alta",
      };

      const formatted = formatJobForEmbedding(job);

      expect(formatted).toContain(job.title);
      expect(formatted).toContain(job.description);
      expect(formatted).toContain(job.component_name);
      expect(formatted).toContain(job.asset_name);
      expect(formatted).toContain(job.vessel);
      expect(formatted).toContain(job.priority);
    });

    it("should handle job without description", () => {
      const job = {
        title: "Test Job",
        component_name: "Test Component",
        asset_name: "Test Asset",
        vessel: "Test Vessel",
        priority: "Média",
      };

      const formatted = formatJobForEmbedding(job);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain(job.title);
      expect(formatted).toContain(job.component_name);
    });

    it("should create readable text format", () => {
      const job = {
        title: "Maintenance Task",
        description: "Regular maintenance",
        component_name: "Engine",
        asset_name: "Main Engine",
        vessel: "Ship Alpha",
        priority: "Alta",
      };

      const formatted = formatJobForEmbedding(job);

      // Should be a coherent sentence-like structure
      expect(formatted.length).toBeGreaterThan(50);
      expect(formatted).toMatch(/\./); // Should contain periods
    });

    it("should include all priority levels", () => {
      const priorities = ["Baixa", "Média", "Alta", "Crítica"];
      
      priorities.forEach(priority => {
        const job = {
          title: "Test",
          component_name: "Test",
          asset_name: "Test",
          vessel: "Test",
          priority,
        };

        const formatted = formatJobForEmbedding(job);
        expect(formatted).toContain(priority);
      });
    });
  });

  describe("formatJobHistoryForEmbedding", () => {
    it("should format history with all fields", () => {
      const history = {
        action: "Manutenção realizada",
        ai_recommendation: "Substituir componente",
        outcome: "Sucesso",
      };

      const formatted = formatJobHistoryForEmbedding(history);

      expect(formatted).toContain(history.action);
      expect(formatted).toContain(history.ai_recommendation);
      expect(formatted).toContain(history.outcome);
    });

    it("should handle history with only action", () => {
      const history = {
        action: "Inspeção visual",
      };

      const formatted = formatJobHistoryForEmbedding(history);

      expect(formatted).toBeTruthy();
      expect(formatted).toContain(history.action);
    });

    it("should handle history with action and recommendation", () => {
      const history = {
        action: "Troca de filtros",
        ai_recommendation: "Realizar cada 1000 horas",
      };

      const formatted = formatJobHistoryForEmbedding(history);

      expect(formatted).toContain(history.action);
      expect(formatted).toContain(history.ai_recommendation);
    });

    it("should handle history with action and outcome", () => {
      const history = {
        action: "Calibração de sensores",
        outcome: "Calibração completa com sucesso",
      };

      const formatted = formatJobHistoryForEmbedding(history);

      expect(formatted).toContain(history.action);
      expect(formatted).toContain(history.outcome);
    });

    it("should create structured text", () => {
      const history = {
        action: "Test action",
        ai_recommendation: "Test recommendation",
        outcome: "Test outcome",
      };

      const formatted = formatJobHistoryForEmbedding(history);

      // Should include labels
      expect(formatted).toMatch(/Ação:/);
      expect(formatted).toMatch(/Recomendação IA:/);
      expect(formatted).toMatch(/Resultado:/);
    });
  });

  describe("Integration", () => {
    it("should generate embedding from formatted job text", async () => {
      const job = {
        title: "Hydraulic System Maintenance",
        description: "Preventive maintenance of main hydraulic pump",
        component_name: "Hydraulic System",
        asset_name: "Pump #3",
        vessel: "Vessel Alpha",
        priority: "Alta",
      };

      const formattedText = formatJobForEmbedding(job);
      const embedding = await generateEmbedding(formattedText);

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(1536);
    });

    it("should generate embedding from formatted history text", async () => {
      const history = {
        action: "Preventive maintenance completed",
        ai_recommendation: "Schedule next maintenance in 6 months",
        outcome: "All components functioning normally",
      };

      const formattedText = formatJobHistoryForEmbedding(history);
      const embedding = await generateEmbedding(formattedText);

      expect(embedding).toBeDefined();
      expect(embedding.length).toBe(1536);
    });
  });

  describe("Vector Properties", () => {
    it("should generate numeric vectors", async () => {
      const embedding = await generateEmbedding("Test");

      embedding.forEach(value => {
        expect(typeof value).toBe("number");
        expect(isNaN(value)).toBe(false);
        expect(isFinite(value)).toBe(true);
      });
    });

    it("should generate vectors with appropriate value ranges", async () => {
      const embedding = await generateEmbedding("Test maintenance job");

      // Values should typically be between -1 and 1 for normalized vectors
      embedding.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(-2);
        expect(value).toBeLessThanOrEqual(2);
      });
    });
  });
});
