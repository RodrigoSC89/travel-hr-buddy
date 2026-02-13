// @ts-nocheck — Test mocks: OpenAI response mock types incompatible with strict SDK types
import { describe, it, expect, vi, beforeEach } from "vitest";
import { explainRequirementSGSO } from "@/lib/ai/sgso/explainRequirement";

// Mock OpenAI client
vi.mock("@/lib/openai", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

describe("explainRequirementSGSO", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return explanation when API call succeeds", async () => {
    const { openai } = await import("@/lib/openai");
    const mockExplanation = `
✅ O que o requisito exige:
O requisito exige a criação de uma política formal de segurança e meio ambiente.

⚠️ Por que é importante:
É fundamental para estabelecer diretrizes claras de segurança.

🚨 Riscos do não cumprimento:
Pode resultar em multas e sanções do IBAMA.

🛠️ Recomendações para estar em conformidade:
Documentar e divulgar a política para toda equipe.
    `.trim();

    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: mockExplanation,
          },
        },
      ],
    } as unknown);

    const result = await explainRequirementSGSO("Política de SMS", "compliant");

    expect(result).toBe(mockExplanation);
    expect(openai.chat.completions.create).toHaveBeenCalledWith({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: expect.stringContaining("Política de SMS"),
        },
      ],
      temperature: 0.4,
    });
  });

  it("should include compliance status in the prompt", async () => {
    const { openai } = await import("@/lib/openai");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: "Explicação teste",
          },
        },
      ],
    } as unknown);

    await explainRequirementSGSO("Gestão de Riscos", "partial");

    expect(openai.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            role: "user",
            content: expect.stringContaining("Status atual do requisito: partial"),
          },
        ],
      })
    );
  });

  it("should return null when API response has no content", async () => {
    const { openai } = await import("@/lib/openai");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: null,
          },
        },
      ],
    } as unknown);

    const result = await explainRequirementSGSO("Política de SMS", "compliant");

    expect(result).toBeNull();
  });

  it("should return null when API call fails", async () => {
    const { openai } = await import("@/lib/openai");
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    vi.mocked(openai.chat.completions.create).mockRejectedValue(
      new Error("API Error")
    );

    const result = await explainRequirementSGSO("Política de SMS", "compliant");

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error explaining SGSO requirement:",
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });

  it("should use GPT-4 model", async () => {
    const { openai } = await import("@/lib/openai");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: "Test explanation",
          },
        },
      ],
    } as unknown);

    await explainRequirementSGSO("Treinamento e Capacitação", "non-compliant");

    expect(openai.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4",
      })
    );
  });

  it("should use temperature of 0.4 for consistent responses", async () => {
    const { openai } = await import("@/lib/openai");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: "Test explanation",
          },
        },
      ],
    } as unknown);

    await explainRequirementSGSO("Equipamentos Críticos", "compliant");

    expect(openai.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        temperature: 0.4,
      })
    );
  });

  it("should include all required elements in prompt", async () => {
    const { openai } = await import("@/lib/openai");
    
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: "Test explanation",
          },
        },
      ],
    } as unknown);

    await explainRequirementSGSO("Manutenção Preventiva", "compliant");

    const callArgs = vi.mocked(openai.chat.completions.create).mock.calls[0][0];
    const prompt = callArgs.messages[0].content;

    expect(prompt).toContain("✅ O que o requisito exige");
    expect(prompt).toContain("⚠️ Por que é importante");
    expect(prompt).toContain("🚨 Riscos do não cumprimento");
    expect(prompt).toContain("🛠️ Recomendações para estar em conformidade");
  });
});
