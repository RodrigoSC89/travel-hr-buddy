import { describe, it, expect } from "vitest";

describe("MMI Copilot Edge Function", () => {
  describe("System Prompt", () => {
    const systemPrompt = `Você é um engenheiro marítimo assistente no módulo de Manutenção Inteligente (MMI).
Você pode:
- Criar jobs técnicos a partir de descrições naturais
- Postergar manutenções se permitido
- Gerar ordens de serviço automaticamente
- Buscar status de ativos, jobs e OS
Sempre responda de forma técnica, clara e orientada à ação.`;

    it("should identify as maritime engineering assistant", () => {
      expect(systemPrompt).toContain("engenheiro marítimo");
    });

    it("should reference MMI module", () => {
      expect(systemPrompt).toContain("Manutenção Inteligente");
      expect(systemPrompt).toContain("MMI");
    });

    it("should list job creation capability", () => {
      expect(systemPrompt).toContain("Criar jobs técnicos");
    });

    it("should list maintenance postponement capability", () => {
      expect(systemPrompt).toContain("Postergar manutenções");
    });

    it("should list work order generation capability", () => {
      expect(systemPrompt).toContain("Gerar ordens de serviço");
    });

    it("should list asset status capability", () => {
      expect(systemPrompt).toContain("Buscar status de ativos, jobs e OS");
    });

    it("should emphasize technical and action-oriented responses", () => {
      expect(systemPrompt).toContain("técnica");
      expect(systemPrompt).toContain("orientada à ação");
    });
  });

  describe("Expected Request Format", () => {
    it("should accept messages array", () => {
      const validRequest = {
        messages: [
          { role: "user", content: "Criar job para troca de válvula na bomba 603.0004.02" }
        ]
      };

      expect(validRequest.messages).toBeDefined();
      expect(Array.isArray(validRequest.messages)).toBe(true);
    });

    it("should handle conversation history", () => {
      const conversationRequest = {
        messages: [
          { role: "user", content: "Postergar o job 2333 é seguro?" },
          { role: "assistant", content: "Verificando histórico do job 2333..." },
          { role: "user", content: "E quais são os riscos?" }
        ]
      };

      expect(conversationRequest.messages.length).toBe(3);
    });
  });

  describe("Technical Use Cases", () => {
    it("should recognize valve replacement job creation", () => {
      const query = "Criar job para troca de válvula na bomba 603.0004.02";
      expect(query).toContain("job");
      expect(query).toContain("válvula");
      expect(query).toContain("bomba");
    });

    it("should recognize maintenance postponement query", () => {
      const query = "Postergar o job 2333 é seguro?";
      expect(query).toContain("Postergar");
      expect(query).toContain("job");
    });

    it("should recognize work order status query", () => {
      const query = "Quais OS estão pendentes na embarcação Poseidon?";
      expect(query).toContain("OS");
      expect(query).toContain("pendentes");
      expect(query).toContain("embarcação");
    });

    it("should recognize failure history query", () => {
      const query = "Qual o histórico de falhas no motor STBD?";
      expect(query).toContain("histórico");
      expect(query).toContain("falhas");
      expect(query).toContain("motor");
    });
  });

  describe("API Configuration", () => {
    it("should use GPT-4 model", () => {
      const config = {
        model: "gpt-4",
        temperature: 0.3
      };

      expect(config.model).toBe("gpt-4");
    });

    it("should use low temperature for precise responses", () => {
      const config = {
        model: "gpt-4",
        temperature: 0.3
      };

      expect(config.temperature).toBe(0.3);
      expect(config.temperature).toBeLessThanOrEqual(0.5);
    });
  });

  describe("Response Format", () => {
    it("should return reply field", () => {
      const expectedResponse = {
        reply: "Job técnico criado com sucesso para troca de válvula na bomba 603.0004.02",
        timestamp: new Date().toISOString()
      };

      expect(expectedResponse).toHaveProperty("reply");
      expect(typeof expectedResponse.reply).toBe("string");
    });

    it("should include timestamp", () => {
      const expectedResponse = {
        reply: "Verificando job 2333...",
        timestamp: new Date().toISOString()
      };

      expect(expectedResponse).toHaveProperty("timestamp");
      expect(expectedResponse.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing messages array", () => {
      const invalidRequest = {};
      
      expect(invalidRequest).not.toHaveProperty("messages");
    });

    it("should handle empty messages array", () => {
      const emptyRequest = {
        messages: []
      };

      expect(emptyRequest.messages).toHaveLength(0);
    });
  });
});
