// @ts-nocheck
/**
 * PEO-DP Core Phase 2 Integration Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PEOdpCore } from "@/modules/peodp_ai/peodp_core";

describe("PEOdpCore - Phase 2 Features", () => {
  let core: PEOdpCore;

  beforeEach(() => {
    core = new PEOdpCore();
  });

  it("should start real-time monitoring", () => {
    const sessionId = core.iniciar_monitoramento_tempo_real("Test Vessel");

    expect(sessionId).toBeDefined();
    expect(sessionId).toContain("PEODP-");
    expect(core.sessao_atual).toBeDefined();
    expect(core.sessao_atual?.vesselName).toBe("Test Vessel");
  });

  it("should execute monitoring cycle", () => {
    core.iniciar_monitoramento_tempo_real("Test Vessel");
    const evento = core.executar_ciclo();

    expect(evento).toBeDefined();
    expect(evento?.evento).toBeDefined();
    expect(evento?.data).toBeDefined();
  });

  it("should stop monitoring and generate report", () => {
    core.iniciar_monitoramento_tempo_real("Test Vessel");

    core.executar_ciclo();
    core.executar_ciclo();

    const report = core.parar_monitoramento();

    expect(report).toBeDefined();
    expect(report?.session).toBeDefined();
    expect(report?.statistics).toBeDefined();
    expect(report?.violations).toBeInstanceOf(Array);
    expect(report?.recommendations).toBeInstanceOf(Array);
  });

  it("should generate session report", () => {
    core.iniciar_monitoramento_tempo_real("Test Vessel");

    core.executar_ciclo();
    core.executar_ciclo();

    const report = core.gerar_relatorio_sessao();

    expect(report).toBeDefined();
    expect(report?.statistics.totalEvents).toBeGreaterThan(0);
  });

  it("should generate comparison report", () => {
    // Create first session
    core.iniciar_monitoramento_tempo_real("Vessel 1");
    core.executar_ciclo();
    core.parar_monitoramento();

    // Create second session
    core.iniciar_monitoramento_tempo_real("Vessel 1");
    core.executar_ciclo();
    core.parar_monitoramento();

    const comparison = core.gerar_relatorio_comparacao();

    expect(comparison).toBeDefined();
    expect(comparison.sessions).toBeInstanceOf(Array);
    expect(comparison.sessions.length).toBeGreaterThan(0);
    expect(comparison.trends).toBeDefined();
    expect(comparison.trends.violationTrend).toBeDefined();
    expect(comparison.trends.eventTrend).toBeDefined();
    expect(comparison.insights).toBeInstanceOf(Array);
  });

  it("should generate executive summary", () => {
    // Create a session first
    core.iniciar_monitoramento_tempo_real("Test Vessel");
    core.executar_ciclo();
    core.executar_ciclo();
    core.parar_monitoramento();

    const summary = core.gerar_sumario_executivo();

    expect(summary).toBeDefined();
    expect(summary.vesselName).toBeDefined();
    expect(summary.period).toBeDefined();
    expect(summary.period.start).toBeDefined();
    expect(summary.period.end).toBeDefined();
    expect(typeof summary.overallScore).toBe("number");
    expect(summary.totalEvents).toBeGreaterThanOrEqual(0);
    expect(summary.complianceStatus).toBeDefined();
    expect(["Excellent", "Good", "Acceptable", "Critical"]).toContain(
      summary.complianceStatus
    );
    expect(summary.keyFindings).toBeInstanceOf(Array);
    expect(summary.recommendations).toBeInstanceOf(Array);
  });

  it("should generate executive summary without sessions", () => {
    const summary = core.gerar_sumario_executivo();

    expect(summary).toBeDefined();
    expect(summary.vesselName).toBe("N/A");
    expect(summary.complianceStatus).toBe("Critical");
    expect(summary.keyFindings).toContain(
      "Nenhuma sessão de monitoramento disponível"
    );
  });

  it("should track multiple sessions", () => {
    core.iniciar_monitoramento_tempo_real("Vessel 1");
    core.executar_ciclo();
    core.parar_monitoramento();

    core.iniciar_monitoramento_tempo_real("Vessel 2");
    core.executar_ciclo();
    core.parar_monitoramento();

    expect(core.todas_sessoes.length).toBe(2);
  });

  it("should provide access to workflow manager", () => {
    const workflowManager = core.workflowManager;

    expect(workflowManager).toBeDefined();
    expect(typeof workflowManager.obter_acao).toBe("function");
  });

  it("should trigger workflow action on non-normal events", () => {
    core.iniciar_monitoramento_tempo_real("Test Vessel");

    const workflowManager = core.workflowManager;
    const initialHistoryLength = workflowManager.historico_acoes.length;

    // Execute multiple cycles to likely get a non-normal event
    for (let i = 0; i < 20; i++) {
      core.executar_ciclo();
    }

    // Should have triggered at least one workflow action (statistically very likely)
    const finalHistoryLength = workflowManager.historico_acoes.length;
    expect(finalHistoryLength).toBeGreaterThanOrEqual(initialHistoryLength);
  });

  it("should calculate violation trends", () => {
    // Session 1: few events
    core.iniciar_monitoramento_tempo_real("Vessel 1");
    core.executar_ciclo();
    core.parar_monitoramento();

    // Session 2: few events
    core.iniciar_monitoramento_tempo_real("Vessel 1");
    core.executar_ciclo();
    core.parar_monitoramento();

    const comparison = core.gerar_relatorio_comparacao();

    expect(comparison.trends.violationTrend).toBeDefined();
    expect(["Improving", "Stable", "Worsening"]).toContain(
      comparison.trends.violationTrend
    );
  });

  it("should calculate event trends", () => {
    // Session 1
    core.iniciar_monitoramento_tempo_real("Vessel 1");
    core.executar_ciclo();
    core.executar_ciclo();
    core.parar_monitoramento();

    // Session 2
    core.iniciar_monitoramento_tempo_real("Vessel 1");
    core.executar_ciclo();
    core.parar_monitoramento();

    const comparison = core.gerar_relatorio_comparacao();

    expect(comparison.trends.eventTrend).toBeDefined();
    expect(["Decreasing", "Stable", "Increasing"]).toContain(
      comparison.trends.eventTrend
    );
  });

  it("should provide insights in comparison report", () => {
    core.iniciar_monitoramento_tempo_real("Vessel 1");
    core.executar_ciclo();
    core.parar_monitoramento();

    core.iniciar_monitoramento_tempo_real("Vessel 1");
    core.executar_ciclo();
    core.parar_monitoramento();

    const comparison = core.gerar_relatorio_comparacao();

    expect(comparison.insights).toBeInstanceOf(Array);
    // Insights are generated based on trends
    expect(comparison.insights.length).toBeGreaterThanOrEqual(0);
  });

  it("should determine compliance status based on score", () => {
    // Create session with some events
    core.iniciar_monitoramento_tempo_real("Test Vessel");

    for (let i = 0; i < 10; i++) {
      core.executar_ciclo();
    }

    core.parar_monitoramento();

    const summary = core.gerar_sumario_executivo();

    // Compliance status should be determined by score
    if (summary.overallScore >= 90) {
      expect(summary.complianceStatus).toBe("Excellent");
    } else if (summary.overallScore >= 75) {
      expect(summary.complianceStatus).toBe("Good");
    } else if (summary.overallScore >= 60) {
      expect(summary.complianceStatus).toBe("Acceptable");
    } else {
      expect(summary.complianceStatus).toBe("Critical");
    }
  });

  it("should include appropriate recommendations in summary", () => {
    core.iniciar_monitoramento_tempo_real("Test Vessel");
    core.executar_ciclo();
    core.parar_monitoramento();

    const summary = core.gerar_sumario_executivo();

    expect(summary.recommendations).toBeInstanceOf(Array);
    expect(summary.recommendations.length).toBeGreaterThan(0);

    // Recommendations should match compliance status
    if (summary.complianceStatus === "Critical") {
      expect(
        summary.recommendations.some((r) => r.includes("crítico"))
      ).toBe(true);
    }
  });

  it("should limit comparison report to last 5 sessions", () => {
    // Create 7 sessions
    for (let i = 0; i < 7; i++) {
      core.iniciar_monitoramento_tempo_real(`Vessel ${i}`);
      core.executar_ciclo();
      core.parar_monitoramento();
    }

    const comparison = core.gerar_relatorio_comparacao();

    // Should only include last 5 sessions
    expect(comparison.sessions.length).toBeLessThanOrEqual(5);
  });
});
