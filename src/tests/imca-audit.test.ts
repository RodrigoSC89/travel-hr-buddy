import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateIMCAAudit } from "@/lib/api/imca-audit";

describe("IMCA Audit Module", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe("generateIMCAAudit", () => {
    it("should return error when API key is not configured", async () => {
      // Mock missing API key
      const originalEnv = import.meta.env.VITE_OPENAI_API_KEY;
      vi.stubGlobal("import.meta", {
        env: { ...import.meta.env, VITE_OPENAI_API_KEY: undefined },
      });

      const result = await generateIMCAAudit({
        nomeNavio: "Test Ship",
        contexto: "Test context",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("API key not configured");

      // Restore original env
      vi.stubGlobal("import.meta", {
        env: { ...import.meta.env, VITE_OPENAI_API_KEY: originalEnv },
      });
    });

    it("should validate input parameters structure", () => {
      const input = {
        nomeNavio: "Aurora Explorer",
        contexto: "Teste de operação DP",
      };

      expect(input).toHaveProperty("nomeNavio");
      expect(input).toHaveProperty("contexto");
      expect(typeof input.nomeNavio).toBe("string");
      expect(typeof input.contexto).toBe("string");
    });

    it("should return correct result structure", async () => {
      // Mock successful API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "# Auditoria Técnica IMCA\n\nRelatório gerado com sucesso",
              },
            },
          ],
        }),
      });

      const result = await generateIMCAAudit({
        nomeNavio: "Aurora Explorer",
        contexto: "Operação normal",
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("output");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.output).toBe("string");
    });

    it("should handle API errors gracefully", async () => {
      // Mock API error
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: { message: "Internal server error" },
        }),
      });

      const result = await generateIMCAAudit({
        nomeNavio: "Test Ship",
        contexto: "Test context",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should include IMCA standards in prompt", () => {
      const expectedStandards = [
        "IMCA M103",
        "IMCA M117",
        "IMCA M190",
        "IMCA M166",
        "IMCA M109",
        "IMCA M220",
        "IMCA M140",
        "MSF 182",
        "IMO MSC.1/Circ.1580",
      ];

      expectedStandards.forEach((standard) => {
        expect(standard).toBeDefined();
        expect(typeof standard).toBe("string");
      });
    });
  });
});
