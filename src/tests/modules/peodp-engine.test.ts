// @ts-nocheck - PATCH 66.0: imports need updating to new structure
/**
 * PEO-DP Engine Tests
 */

import { describe, it, expect } from "vitest";
import { PEOEngine } from "@/modules/peodp_ai/peodp_engine";

describe("PEOEngine", () => {
  it("should create an instance", () => {
    const engine = new PEOEngine();
    expect(engine).toBeDefined();
  });

  it("should execute audit and return results", async () => {
    const engine = new PEOEngine();
    const resultado = await engine.executarAuditoria("Test Vessel", "DP2");

    expect(resultado).toBeDefined();
    expect(resultado.data).toBeDefined();
    expect(resultado.resultado).toBeInstanceOf(Array);
    expect(resultado.score).toBeGreaterThanOrEqual(0);
    expect(resultado.score).toBeLessThanOrEqual(100);
  });

  it("should include vessel name and DP class in audit", async () => {
    const engine = new PEOEngine();
    const resultado = await engine.executarAuditoria("PSV Ocean Explorer", "DP3");

    expect(resultado.vesselName).toBe("PSV Ocean Explorer");
    expect(resultado.dpClass).toBe("DP3");
  });

  it("should verify both NORMAM-101 and IMCA M117 requirements", async () => {
    const engine = new PEOEngine();
    const resultado = await engine.executarAuditoria();

    // Should have at least 10 items (5 from NORMAM-101 + 5 from IMCA M117)
    expect(resultado.resultado.length).toBeGreaterThanOrEqual(10);
    
    // Check that both standards are included
    const normamItems = resultado.resultado.filter(r => r.item.startsWith("N101"));
    const imcaItems = resultado.resultado.filter(r => r.item.startsWith("M117"));
    
    expect(normamItems.length).toBeGreaterThanOrEqual(5);
    expect(imcaItems.length).toBeGreaterThanOrEqual(5);
  });

  it("should calculate score correctly", async () => {
    const engine = new PEOEngine();
    const resultado = await engine.executarAuditoria();

    expect(typeof resultado.score).toBe("number");
    expect(resultado.score).toBeGreaterThanOrEqual(0);
    expect(resultado.score).toBeLessThanOrEqual(100);
  });

  it("should generate recommendations based on score", async () => {
    const engine = new PEOEngine();
    const resultado = await engine.executarAuditoria();
    const recomendacoes = engine.gerarRecomendacoes(resultado);

    expect(recomendacoes).toBeInstanceOf(Array);
    expect(recomendacoes.length).toBeGreaterThan(0);
  });

  it("should include normas in audit result", async () => {
    const engine = new PEOEngine();
    const resultado = await engine.executarAuditoria();

    expect(resultado.normas).toBeInstanceOf(Array);
    expect(resultado.normas.length).toBeGreaterThan(0);
    expect(resultado.normas.some(n => n.includes("NORMAM-101"))).toBe(true);
    expect(resultado.normas.some(n => n.includes("IMCA M117"))).toBe(true);
  });

  it("should have valid cumprimento status for all items", async () => {
    const engine = new PEOEngine();
    const resultado = await engine.executarAuditoria();

    const validStatuses = ["OK", "N/A", "Não Conforme", "Pendente"];
    resultado.resultado.forEach(item => {
      expect(validStatuses).toContain(item.cumprimento);
    });
  });
});
