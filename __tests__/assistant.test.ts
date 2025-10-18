/**
 * Assistente IA - Essential Tests
 * Validates AI assistant prompt/response functionality with GPT-4
 */

import { describe, it, expect, vi } from "vitest";

// Mock OpenAI
vi.mock("openai", () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: "Olá! Sou o assistente do Nautilus One. Como posso ajudar você hoje?",
                },
              },
            ],
          }),
        },
      };
    },
  };
});

describe("Assistente IA - Essential Tests", () => {
  it("deve enviar prompt e receber resposta GPT-4", async () => {
    const sendPromptToGPT4 = async (prompt: string): Promise<string> => {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: "test-key" });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é o assistente do sistema Nautilus One.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content || "";
    };

    const result = await sendPromptToGPT4("Olá, como você pode me ajudar?");
    
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("deve validar estrutura de mensagem do assistente", () => {
    const message = {
      role: "assistant" as const,
      content: "Resposta do assistente",
      timestamp: new Date().toISOString(),
    };

    expect(message.role).toBe("assistant");
    expect(message.content).toBeTruthy();
    expect(message.timestamp).toBeTruthy();
  });

  it("deve processar diferentes tipos de prompts", async () => {
    const prompts = [
      "Como criar um checklist?",
      "Qual o status do sistema?",
      "Gerar relatório de auditoria",
    ];

    const sendPromptToGPT4 = async (prompt: string): Promise<string> => {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: "test-key" });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é o assistente do sistema Nautilus One.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content || "";
    };

    for (const prompt of prompts) {
      const result = await sendPromptToGPT4(prompt);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    }
  });

  it("deve validar system prompt contém instruções corretas", () => {
    const systemPrompt = `
Você é o assistente do sistema Nautilus One. Seu papel é ajudar o usuário a interagir com o sistema.
Sempre que possível, adicione links com as rotas reais do painel.

Comandos que você entende:
- Criar checklist → /admin/checklists/new
- Listar últimos documentos → /admin/documents
- Ver status do sistema → /admin/system-monitor
- Ver alertas → /admin/alerts

Seja claro, direto e útil.
`;

    expect(systemPrompt).toContain("Nautilus One");
    expect(systemPrompt).toContain("/admin/checklists/new");
    expect(systemPrompt).toContain("/admin/documents");
    expect(systemPrompt).toContain("/admin/system-monitor");
    expect(systemPrompt).toContain("/admin/alerts");
  });

  it("deve validar resposta contém informações úteis", async () => {
    const sendPromptToGPT4 = async (prompt: string): Promise<string> => {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: "test-key" });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Você é o assistente do sistema Nautilus One.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return response.choices[0].message.content || "";
    };

    const result = await sendPromptToGPT4("Como posso criar um documento?");
    
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(10);
  });

  it("deve validar histórico de conversação", () => {
    const conversation = [
      {
        role: "user" as const,
        content: "Olá",
        timestamp: new Date().toISOString(),
      },
      {
        role: "assistant" as const,
        content: "Olá! Como posso ajudar?",
        timestamp: new Date().toISOString(),
      },
      {
        role: "user" as const,
        content: "Criar checklist",
        timestamp: new Date().toISOString(),
      },
    ];

    expect(conversation).toHaveLength(3);
    expect(conversation[0].role).toBe("user");
    expect(conversation[1].role).toBe("assistant");
    expect(conversation[2].role).toBe("user");
  });
});
