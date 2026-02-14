/**
 * AI Engine Tests
 * Tests the AI engine fallback logic and system prompt generation
 */

import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(() => Promise.resolve({
        data: { response: "AI response test" },
        error: null,
      })),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

import { runOpenAI, generateSystemPrompt, type AIEngineRequest } from "@/ai/engine";

describe("generateSystemPrompt", () => {
  it("includes module name", () => {
    const prompt = generateSystemPrompt("maintenance");
    expect(prompt).toContain("maintenance");
    expect(prompt).toContain("Nautilus One");
  });

  it("includes maritime terminology keywords", () => {
    const prompt = generateSystemPrompt("compliance");
    expect(prompt).toContain("MLC 2006");
    expect(prompt).toContain("STCW");
    expect(prompt).toContain("SOLAS");
  });

  it("appends context when provided", () => {
    const prompt = generateSystemPrompt("crew", { vesselId: "abc-123" });
    expect(prompt).toContain("abc-123");
    expect(prompt).toContain("Contexto adicional");
  });

  it("omits context section when not provided", () => {
    const prompt = generateSystemPrompt("crew");
    expect(prompt).not.toContain("Contexto adicional");
  });
});

describe("runOpenAI", () => {
  it("returns AI response from edge function", async () => {
    const request: AIEngineRequest = {
      messages: [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "What is MLC 2006?" },
      ],
    };

    const result = await runOpenAI(request);
    expect(result.content).toBe("AI response test");
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it("returns fallback when edge function fails", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: { message: "Gateway error", name: "Error", context: {} as unknown as { body: ReadableStream<Uint8Array> } },
    });

    const request: AIEngineRequest = {
      messages: [{ role: "user", content: "Test" }],
      context: { moduleName: "maintenance", userId: "user-1" },
    };

    const result = await runOpenAI(request);
    expect(result.model).toBe("fallback");
    expect(result.content).toContain("manutenção");
  });

  it("returns generic fallback for unknown module", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
      data: null,
      error: { message: "fail", name: "Error", context: {} as unknown as { body: ReadableStream<Uint8Array> } },
    });

    const request: AIEngineRequest = {
      messages: [{ role: "user", content: "Test" }],
      context: { moduleName: "unknown-module", userId: "user-1" },
    };

    const result = await runOpenAI(request);
    expect(result.model).toBe("fallback");
    expect(result.content).toContain("offline");
  });
});
