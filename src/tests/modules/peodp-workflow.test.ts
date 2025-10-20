/**
 * PEO-DP Workflow Integration Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PEOWorkflow } from "@/modules/peodp_ai/peodp_workflow";
import type { PEODPEvent } from "@/modules/peodp_ai/types";

describe("PEOWorkflow", () => {
  let workflow: PEOWorkflow;

  beforeEach(() => {
    workflow = new PEOWorkflow();
  });

  it("should create an instance", () => {
    expect(workflow).toBeDefined();
  });

  it("should trigger corrective action for event", () => {
    const evento: PEODPEvent = {
      evento: "Thruster Fault",
      data: new Date().toISOString(),
      timestamp: Date.now(),
      severity: "High",
      vesselName: "Test Vessel",
    };

    const result = workflow.acionar_acao(evento);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.actionId).toBeDefined();
    expect(result.message).toContain("Ação corretiva criada");
    expect(result.timestamp).toBeDefined();
  });

  it("should handle System Normal event", () => {
    const evento: PEODPEvent = {
      evento: "System Normal",
      data: new Date().toISOString(),
    };

    const result = workflow.acionar_acao(evento);

    expect(result.success).toBe(true);
    expect(result.message).toContain("Sistema Normal");
  });

  it("should get corrective action for event type", () => {
    const action = workflow.obter_acao("Thruster Fault");

    expect(action).toBeDefined();
    expect(action.eventType).toBe("Thruster Fault");
    expect(action.action).toBeDefined();
    expect(action.priority).toBeDefined();
    expect(action.status).toBe("Pending");
  });

  it("should assign correct priority to high-priority events", () => {
    const lossOfReference = workflow.obter_acao("Loss of DP Reference");
    const powerFailure = workflow.obter_acao("Power Failure");
    const thrusterFault = workflow.obter_acao("Thruster Fault");

    expect(lossOfReference.priority).toBe("High");
    expect(powerFailure.priority).toBe("High");
    expect(thrusterFault.priority).toBe("High");
  });

  it("should assign correct priority to medium-priority events", () => {
    const upsAlarm = workflow.obter_acao("UPS Alarm");
    const positionDrift = workflow.obter_acao("Position Drift");
    const manualOverride = workflow.obter_acao("Manual Override");

    expect(upsAlarm.priority).toBe("Medium");
    expect(positionDrift.priority).toBe("Medium");
    expect(manualOverride.priority).toBe("Medium");
  });

  it("should assign low priority to System Normal", () => {
    const systemNormal = workflow.obter_acao("System Normal");
    expect(systemNormal.priority).toBe("Low");
  });

  it("should get all predefined actions", () => {
    const allActions = workflow.obter_todas_acoes();

    expect(allActions).toBeInstanceOf(Array);
    expect(allActions.length).toBe(7); // All 7 event types

    const eventTypes = allActions.map((a) => a.eventType);
    expect(eventTypes).toContain("Loss of DP Reference");
    expect(eventTypes).toContain("Thruster Fault");
    expect(eventTypes).toContain("System Normal");
  });

  it("should track action history", () => {
    const evento: PEODPEvent = {
      evento: "UPS Alarm",
      data: new Date().toISOString(),
    };

    expect(workflow.historico_acoes.length).toBe(0);

    workflow.acionar_acao(evento);

    expect(workflow.historico_acoes.length).toBe(1);
    expect(workflow.historico_acoes[0].success).toBe(true);
  });

  it("should clear action history", () => {
    const evento: PEODPEvent = {
      evento: "Position Drift",
      data: new Date().toISOString(),
    };

    workflow.acionar_acao(evento);
    workflow.acionar_acao(evento);

    expect(workflow.historico_acoes.length).toBe(2);

    workflow.limpar_historico();

    expect(workflow.historico_acoes.length).toBe(0);
  });

  it("should update predefined action", () => {
    const newAction = "Custom action for thruster fault";

    workflow.atualizar_acao("Thruster Fault", newAction);

    const action = workflow.obter_acao("Thruster Fault");
    expect(action.action).toBe(newAction);
  });

  it("should process batch of events", () => {
    const eventos: PEODPEvent[] = [
      {
        evento: "Thruster Fault",
        data: new Date().toISOString(),
      },
      {
        evento: "UPS Alarm",
        data: new Date().toISOString(),
      },
      {
        evento: "System Normal",
        data: new Date().toISOString(),
      },
    ];

    const results = workflow.processar_lote(eventos);

    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBe(3);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it("should generate unique action IDs", () => {
    const evento: PEODPEvent = {
      evento: "Manual Override",
      data: new Date().toISOString(),
    };

    const result1 = workflow.acionar_acao(evento);
    const result2 = workflow.acionar_acao(evento);

    expect(result1.actionId).not.toBe(result2.actionId);
  });

  it("should get statistics about actions", () => {
    const evento1: PEODPEvent = {
      evento: "Thruster Fault",
      data: new Date().toISOString(),
    };

    const evento2: PEODPEvent = {
      evento: "UPS Alarm",
      data: new Date().toISOString(),
    };

    workflow.acionar_acao(evento1);
    workflow.acionar_acao(evento2);
    workflow.acionar_acao(evento1);

    const stats = workflow.obter_estatisticas();

    expect(stats.total).toBe(3);
    expect(stats.sucessos).toBe(3);
    expect(stats.falhas).toBe(0);
  });

  it("should have predefined actions for all event types", () => {
    const eventTypes = [
      "Loss of DP Reference",
      "Thruster Fault",
      "UPS Alarm",
      "Manual Override",
      "Position Drift",
      "Power Failure",
      "System Normal",
    ];

    eventTypes.forEach((eventType) => {
      const action = workflow.obter_acao(eventType as any);
      expect(action).toBeDefined();
      expect(action.action).toBeDefined();
      expect(action.action.length).toBeGreaterThan(0);
    });
  });

  it("should include timestamp in workflow result", () => {
    const evento: PEODPEvent = {
      evento: "Power Failure",
      data: new Date().toISOString(),
    };

    const result = workflow.acionar_acao(evento);

    expect(result.timestamp).toBeDefined();
    const timestamp = new Date(result.timestamp);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });
});
