/**
 * SGSO Action Plan Generator Tests
 * Tests AI-powered action plan generation with mock mode fallback
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateSGSOActionPlan, type SGSOIncident } from "@/lib/ai/sgso";

describe("SGSO Action Plan Generator", () => {
  // Mock environment variable
  beforeEach(() => {
    // Ensure we're in mock mode for tests
    vi.stubEnv("VITE_OPENAI_API_KEY", "");
  });

  it("should generate action plan in mock mode", async () => {
    const incident: SGSOIncident = {
      description: "Operador inseriu coordenadas erradas no DP durante manobra.",
      sgso_category: "Erro humano",
      sgso_root_cause: "Falta de dupla checagem antes da execução",
      sgso_risk_level: "alto",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan).toHaveProperty("corrective_action");
    expect(plan).toHaveProperty("preventive_action");
    expect(plan).toHaveProperty("recommendation");
    expect(typeof plan?.corrective_action).toBe("string");
    expect(typeof plan?.preventive_action).toBe("string");
    expect(typeof plan?.recommendation).toBe("string");
    expect(plan?.corrective_action.length).toBeGreaterThan(0);
    expect(plan?.preventive_action.length).toBeGreaterThan(0);
    expect(plan?.recommendation.length).toBeGreaterThan(0);
  });

  it("should generate specific response for 'Erro humano' category", async () => {
    const incident: SGSOIncident = {
      description: "Operador inseriu coordenadas erradas no DP durante manobra.",
      sgso_category: "Erro humano",
      sgso_root_cause: "Falta de dupla checagem antes da execução",
      sgso_risk_level: "moderado",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.corrective_action).toContain("Treinar operador");
    expect(plan?.preventive_action).toContain("checklist");
  });

  it("should generate specific response for 'Falha de sistema' category", async () => {
    const incident: SGSOIncident = {
      description: "Sistema de DP apresentou falha durante operação crítica.",
      sgso_category: "Falha de sistema",
      sgso_root_cause: "Ausência de manutenção preventiva adequada",
      sgso_risk_level: "alto",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.corrective_action).toContain("Isolar sistema");
    expect(plan?.preventive_action).toContain("manutenção preditiva");
  });

  it("should handle critical risk level with urgent recommendations", async () => {
    const incident: SGSOIncident = {
      description: "Vazamento de óleo próximo a área de produção.",
      sgso_category: "Falha de sistema",
      sgso_root_cause: "Desgaste de equipamento",
      sgso_risk_level: "crítico",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.recommendation).toContain("[URGENTE]");
    expect(plan?.recommendation).toContain("ANP");
  });

  it("should generate response for 'Problema de comunicação' category", async () => {
    const incident: SGSOIncident = {
      description: "Falha na comunicação entre equipe de ponte e sala de máquinas.",
      sgso_category: "Problema de comunicação",
      sgso_root_cause: "Falta de protocolo claro de comunicação",
      sgso_risk_level: "moderado",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.corrective_action).toContain("reunião");
    expect(plan?.preventive_action).toContain("comunicação");
  });

  it("should generate response for 'Não conformidade com procedimento' category", async () => {
    const incident: SGSOIncident = {
      description: "Operação realizada sem seguir o procedimento padrão.",
      sgso_category: "Não conformidade com procedimento",
      sgso_root_cause: "Desconhecimento do procedimento atualizado",
      sgso_risk_level: "moderado",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.corrective_action).toContain("procedimento");
    expect(plan?.preventive_action).toContain("conformidade");
  });

  it("should generate response for 'Fator externo' category", async () => {
    const incident: SGSOIncident = {
      description: "Operação suspensa devido a condições meteorológicas adversas.",
      sgso_category: "Fator externo (clima, mar, etc)",
      sgso_root_cause: "Mudança repentina nas condições do mar",
      sgso_risk_level: "alto",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.corrective_action).toContain("meteorológica");
    expect(plan?.preventive_action).toContain("previsão");
  });

  it("should generate response for 'Falha organizacional' category", async () => {
    const incident: SGSOIncident = {
      description: "Falta de clareza sobre responsabilidades durante operação crítica.",
      sgso_category: "Falha organizacional",
      sgso_root_cause: "Ausência de matriz de responsabilidades definida",
      sgso_risk_level: "moderado",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.corrective_action).toContain("organizacional");
    expect(plan?.preventive_action).toContain("responsabilidades");
  });

  it("should generate response for 'Ausência de manutenção preventiva' category", async () => {
    const incident: SGSOIncident = {
      description: "Equipamento crítico falhou por falta de manutenção preventiva.",
      sgso_category: "Ausência de manutenção preventiva",
      sgso_root_cause: "Cronograma de manutenção não executado",
      sgso_risk_level: "alto",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.corrective_action).toContain("manutenção");
    expect(plan?.preventive_action).toContain("preventiva");
  });

  it("should generate default response for unknown category", async () => {
    const incident: SGSOIncident = {
      description: "Incidente não classificado.",
      sgso_category: "Categoria desconhecida",
      sgso_root_cause: "Causa em investigação",
      sgso_risk_level: "baixo",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.corrective_action).toContain("investigação");
    expect(plan?.preventive_action).toContain("procedimentos");
    expect(plan?.recommendation).toContain("risco");
  });

  it("should handle high risk level appropriately", async () => {
    const incident: SGSOIncident = {
      description: "Incidente de alto risco.",
      sgso_category: "Erro humano",
      sgso_root_cause: "Falta de treinamento",
      sgso_risk_level: "alto",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.recommendation).toContain("[URGENTE]");
  });

  it("should handle low risk level without urgent markers", async () => {
    const incident: SGSOIncident = {
      description: "Incidente de baixo risco.",
      sgso_category: "Erro humano",
      sgso_root_cause: "Distração momentânea",
      sgso_risk_level: "baixo",
    };

    const plan = await generateSGSOActionPlan(incident);

    expect(plan).not.toBeNull();
    expect(plan?.recommendation).not.toContain("[URGENTE]");
  });
});
