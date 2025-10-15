// File: tests/api/mmi/copilot.test.ts

import { describe, it, expect } from "vitest";
import { copilotAPI } from "@/services/mmi/copilotApi";

describe("MMI Copilot - IA com histórico vetorial", () => {
  it("deve retornar uma sugestão técnica baseada em histórico similar", async () => {
    const response = await copilotAPI({ prompt: "vazamento hidráulico no propulsor de popa" });

    expect(response.statusCode).toBe(200);
    expect(response.text).toMatch(/ação sugerida/i);
    expect(response.text).toMatch(/prazo|peça|OS/i);
  });

  it("deve incluir contexto histórico na resposta", async () => {
    const response = await copilotAPI({ prompt: "vazamento hidráulico no propulsor de popa" });

    expect(response.statusCode).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.similar_jobs_found).toBeGreaterThan(0);
    expect(response.data?.historical_context).toBeDefined();
    expect(response.data?.historical_context).toContain("job");
  });

  it("deve retornar ação recomendada com prazo estimado", async () => {
    const response = await copilotAPI({ prompt: "vazamento hidráulico no propulsor de popa" });

    expect(response.statusCode).toBe(200);
    expect(response.data?.recommended_action).toBeDefined();
    expect(response.data?.estimated_time).toBeDefined();
    expect(response.data?.estimated_time).toMatch(/dia|hora/i);
  });

  it("deve calcular confiança da sugestão", async () => {
    const response = await copilotAPI({ prompt: "vazamento hidráulico no propulsor de popa" });

    expect(response.statusCode).toBe(200);
    expect(response.data?.confidence).toBeDefined();
    expect(response.data?.confidence).toBeGreaterThan(0);
    expect(response.data?.confidence).toBeLessThanOrEqual(1);
  });

  it("deve lidar com prompts sem histórico similar", async () => {
    const response = await copilotAPI({ prompt: "problema inexistente no sistema desconhecido" });

    expect(response.statusCode).toBe(200);
    expect(response.data?.similar_jobs_found).toBe(0);
    expect(response.text).toBeDefined();
  });

  it("deve rejeitar prompts inválidos", async () => {
    const response = await copilotAPI({ prompt: "" });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("inválido");
  });

  it("deve retornar sugestão para múltiplos tipos de falhas", async () => {
    const prompts = [
      "vazamento hidráulico no propulsor de popa",
      "falha no motor principal",
      "desgaste em rolamentos",
    ];

    for (const prompt of prompts) {
      const response = await copilotAPI({ prompt });
      expect(response.statusCode).toBe(200);
      expect(response.text).toMatch(/ação|recomendad/i);
    }
  });

  it("deve incluir número de jobs similares encontrados", async () => {
    const response = await copilotAPI({ prompt: "vazamento hidráulico no propulsor de popa" });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("encontrado");
    expect(response.data?.similar_jobs_found).toBeDefined();
  });

  it("deve formatar resposta em texto legível", async () => {
    const response = await copilotAPI({ prompt: "vazamento hidráulico no propulsor de popa" });

    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("AÇÃO SUGERIDA");
    expect(response.text).toContain("Prazo estimado:");
  });

  it("deve processar solicitações rapidamente", async () => {
    const startTime = Date.now();
    await copilotAPI({ prompt: "vazamento hidráulico no propulsor de popa" });
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(2000); // Less than 2 seconds
  });
});
