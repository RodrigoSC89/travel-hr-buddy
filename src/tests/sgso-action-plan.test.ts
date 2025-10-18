/**
 * Tests for SGSO AI Action Plan Generator
 */

import { describe, it, expect, vi } from "vitest";
import { generateSGSOActionPlan } from "@/lib/ai/sgso";

// Mock the OpenAI module
vi.mock("@/lib/openai", () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

describe("generateSGSOActionPlan", () => {
  it("should return mock action plan when API key is not configured", async () => {
    const incident = {
      description: "Operador inseriu coordenadas erradas no DP durante manobra.",
      sgso_category: "Erro humano",
      sgso_root_cause: "Falta de dupla checagem antes da execução",
      sgso_risk_level: "alto",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).toBeTruthy();
    expect(plan).toHaveProperty("corrective_action");
    expect(plan).toHaveProperty("preventive_action");
    expect(plan).toHaveProperty("recommendation");
    expect(plan?.corrective_action).toContain("Revisar procedimento");
    expect(plan?.preventive_action).toContain("checklist");
    expect(plan?.recommendation).toContain("IMCA");
  });

  it("should handle incident with different categories", async () => {
    const incident = {
      description: "Falha no sistema de alarme durante operação crítica",
      sgso_category: "Falha de equipamento",
      sgso_root_cause: "Falta de manutenção preventiva",
      sgso_risk_level: "crítico",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).toBeTruthy();
    expect(plan?.corrective_action).toBeTruthy();
    expect(plan?.preventive_action).toBeTruthy();
    expect(plan?.recommendation).toBeTruthy();
  });

  it("should include category in recommendation", async () => {
    const incident = {
      description: "Vazamento de óleo no convés principal",
      sgso_category: "Ambiental",
      sgso_root_cause: "Conexão solta na tubulação",
      sgso_risk_level: "médio",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).toBeTruthy();
    expect(plan?.recommendation.toLowerCase()).toContain("ambiental");
  });

  it("should handle short incident descriptions", async () => {
    const incident = {
      description: "Teste",
      sgso_category: "Outro",
      sgso_root_cause: "Desconhecida",
      sgso_risk_level: "baixo",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).toBeTruthy();
    expect(plan?.corrective_action).toBeTruthy();
  });
});
