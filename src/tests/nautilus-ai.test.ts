import { describe, it, expect } from "vitest";
import { NautilusAI } from "@/ai/nautilus-core";

describe("NautilusAI", () => {
  it("should analyze context and return a response", async () => {
    const context = "Test context";
    const result = await NautilusAI.analyze(context);
    
    expect(result).toBeDefined();
    expect(result).toContain(context);
    expect(result).toContain("Analisando contexto");
  });

  it("should handle different context inputs", async () => {
    const contexts = ["Simple text", "Complex analysis needed", "Another test"];
    
    for (const ctx of contexts) {
      const result = await NautilusAI.analyze(ctx);
      expect(result).toContain(ctx);
    }
  });

  it("should return a simulated response", async () => {
    const result = await NautilusAI.analyze("Any context");
    expect(result).toContain("resposta simulada");
  });
});
