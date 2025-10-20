/**
 * PEO-DP AI Module Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { PEOdpCore } from "@/modules/peodp_ai/peodp_core";
import { PEODPEngine } from "@/modules/peodp_ai/peodp_engine";
import { PEODPRules } from "@/modules/peodp_ai/peodp_rules";
import { PEORealTime } from "@/modules/peodp_ai/peodp_realtime";
import { PEOWorkflow } from "@/modules/peodp_ai/peodp_workflow";
import { PEODPReport } from "@/modules/peodp_ai/peodp_report";

describe("PEO-DP AI Module", () => {
  describe("PEOdpCore", () => {
    let core: PEOdpCore;

    beforeEach(() => {
      core = new PEOdpCore();
    });

    it("should initialize successfully", () => {
      expect(core).toBeDefined();
      expect(core.getEngine()).toBeDefined();
      expect(core.getRealtime()).toBeDefined();
      expect(core.getReport()).toBeDefined();
    });

    it("should execute manual audit", () => {
      const result = core.iniciar_auditoria("NORMAM-101");
      
      expect(result).toBeDefined();
      expect(result.profile).toBe("NORMAM-101");
      expect(result.total_rules).toBeGreaterThan(0);
      expect(result.compliance_percentage).toBeGreaterThanOrEqual(0);
      expect(result.compliance_percentage).toBeLessThanOrEqual(100);
    });

    it("should store audit results", () => {
      core.iniciar_auditoria("NORMAM-101");
      const audits = core.getAuditorias();
      
      expect(audits.length).toBe(1);
      expect(audits[0].profile).toBe("NORMAM-101");
    });
  });

  describe("PEODPRules", () => {
    let rules: PEODPRules;

    beforeEach(() => {
      rules = new PEODPRules();
    });

    it("should load compliance profiles", () => {
      const profiles = rules.getAllProfiles();
      
      expect(profiles.length).toBeGreaterThan(0);
      expect(profiles.some(p => p.profile_name === "NORMAM-101 Compliance")).toBe(true);
      expect(profiles.some(p => p.profile_name === "IMCA M117 Guidelines")).toBe(true);
    });

    it("should get specific profile", () => {
      const profile = rules.getProfile("NORMAM-101");
      
      expect(profile).toBeDefined();
      expect(profile?.rules.length).toBeGreaterThan(0);
    });

    it("should audit profile", () => {
      const vesselState = {
        vessel_name: "Test Vessel",
        dp_class: "DP2"
      };

      const result = rules.auditProfile("NORMAM-101", vesselState);
      
      expect(result).toBeDefined();
      expect(result.compliance_percentage).toBeGreaterThanOrEqual(0);
      expect(result.compliance_percentage).toBeLessThanOrEqual(100);
      expect(result.status).toMatch(/^(green|yellow|red)$/);
    });

    it("should check event compliance", () => {
      const rule = rules.checkEventCompliance("Loss of DP Reference", "NORMAM-101");
      
      expect(rule).toBeDefined();
      if (rule) {
        expect(rule.severity).toBeDefined();
        expect(rule.action).toBeDefined();
      }
    });
  });

  describe("PEORealTime", () => {
    let realtime: PEORealTime;

    beforeEach(() => {
      realtime = new PEORealTime();
    });

    it("should initialize monitoring session", () => {
      realtime.iniciar_monitoramento("Test Vessel");
      const session = realtime.getSession();
      
      expect(session).toBeDefined();
      expect(session?.vessel.name).toBe("Test Vessel");
      expect(session?.active).toBe(true);
    });

    it("should execute monitoring cycle", () => {
      realtime.iniciar_monitoramento("Test Vessel");
      const event = realtime.executar_ciclo_monitoramento();
      
      expect(event).toBeDefined();
      expect(event?.evento).toBeDefined();
      expect(event?.data).toBeDefined();
    });

    it("should collect events", () => {
      realtime.iniciar_monitoramento("Test Vessel");
      
      realtime.executar_ciclo_monitoramento();
      realtime.executar_ciclo_monitoramento();
      
      const events = realtime.getEventos();
      expect(events.length).toBe(2);
    });

    it("should calculate statistics", () => {
      realtime.iniciar_monitoramento("Test Vessel");
      
      for (let i = 0; i < 5; i++) {
        realtime.executar_ciclo_monitoramento();
      }
      
      const stats = realtime.getEstatisticas();
      
      expect(stats.total).toBe(5);
      expect(stats.criticos).toBeGreaterThanOrEqual(0);
      expect(stats.normais).toBeGreaterThanOrEqual(0);
      expect(stats.criticos + stats.normais).toBe(5);
    });

    it("should stop monitoring", () => {
      realtime.iniciar_monitoramento("Test Vessel");
      realtime.executar_ciclo_monitoramento();
      realtime.parar_monitoramento();
      
      const session = realtime.getSession();
      expect(session?.active).toBe(false);
    });

    it("should set tolerance limit", () => {
      realtime.setToleranceLimit(5);
      const session = realtime.getSession();
      
      // Tolerance limit is set even without active session
      expect(realtime["limite_tolerancia"]).toBe(5);
    });
  });

  describe("PEOWorkflow", () => {
    let workflow: PEOWorkflow;

    beforeEach(() => {
      workflow = new PEOWorkflow();
    });

    it("should have predefined actions", () => {
      const actions = workflow.getAllActions();
      
      expect(actions).toBeDefined();
      expect(actions["Loss of DP Reference"]).toBeDefined();
      expect(actions["Thruster Fault"]).toBeDefined();
      expect(actions["UPS Alarm"]).toBeDefined();
    });

    it("should trigger action for event", () => {
      const event = {
        evento: "Thruster Fault" as const,
        data: new Date().toISOString()
      };

      const action = workflow.acionar_acao(event);
      
      expect(action).toBeDefined();
      expect(action?.tipo).toBe("Thruster Fault");
      expect(action?.status).toBe("pending");
    });

    it("should get action for event type", () => {
      const action = workflow.getAction("UPS Alarm");
      
      expect(action).toBeDefined();
      expect(action).toContain("barramento elétrico");
    });

    it("should create action plan", () => {
      const events = [
        { evento: "Thruster Fault" as const, data: new Date().toISOString() },
        { evento: "UPS Alarm" as const, data: new Date().toISOString() }
      ];

      const plan = workflow.createActionPlan(events);
      
      expect(plan.length).toBe(2);
      expect(plan[0].tipo).toBeDefined();
      expect(plan[0].acao).toBeDefined();
    });

    it("should prioritize actions", () => {
      const actions = [
        { tipo: "Manual Override" as const, acao: "Test", timestamp: new Date(), status: "pending" as const },
        { tipo: "Loss of DP Reference" as const, acao: "Test", timestamp: new Date(), status: "pending" as const }
      ];

      const prioritized = workflow.prioritizeActions(actions);
      
      expect(prioritized[0].tipo).toBe("Loss of DP Reference");
      expect(prioritized[1].tipo).toBe("Manual Override");
    });
  });

  describe("PEODPReport", () => {
    let report: PEODPReport;

    beforeEach(() => {
      report = new PEODPReport();
    });

    it("should generate session report", () => {
      const session = {
        id: "test-session",
        vessel: {
          name: "Test Vessel",
          imo: "IMO123",
          dp_class: "DP2" as const,
          thrusters: 4,
          generators: 3,
          position_references: 3
        },
        start_time: new Date().toISOString(),
        events: [
          { evento: "System Normal" as const, data: new Date().toISOString() },
          { evento: "Thruster Fault" as const, data: new Date().toISOString() }
        ],
        active: false,
        tolerance_limit: 3
      };

      const reportData = report.gerar_relatorio_sessao(session);
      
      expect(reportData).toBeDefined();
      expect(reportData.session_id).toBe("test-session");
      expect(reportData.total_events).toBe(2);
      expect(reportData.critical_events).toBe(1);
    });

    it("should export to JSON", () => {
      const reportData = {
        session_id: "test",
        vessel_name: "Test Vessel",
        report_date: new Date().toISOString(),
        total_events: 10,
        critical_events: 2,
        compliance_score: 80,
        recommendations: [],
        events_summary: {}
      };

      const json = report.exportar_json(reportData);
      
      expect(json).toBeDefined();
      expect(JSON.parse(json)).toEqual(reportData);
    });
  });

  describe("PEODPEngine", () => {
    let engine: PEODPEngine;

    beforeEach(() => {
      engine = new PEODPEngine();
    });

    it("should execute audit", () => {
      const vesselState = {
        vessel_name: "Test Vessel",
        dp_class: "DP2"
      };

      const result = engine.executar_auditoria("NORMAM-101", vesselState);
      
      expect(result).toBeDefined();
      expect(result.profile).toBe("NORMAM-101");
      expect(result.timestamp).toBeDefined();
    });

    it("should generate action plan", () => {
      const violations = [
        {
          rule_id: "NOR-001",
          category: "Test",
          severity: "critical" as const,
          description: "Test violation",
          action_required: "Test action"
        }
      ];

      const plan = engine.gerar_plano_acao(violations);
      
      expect(plan.length).toBe(1);
      expect(plan[0].prioridade).toBe(1);
      expect(plan[0].prazo_sugerido).toContain("Imediato");
    });
  });

  describe("Integration Tests", () => {
    it("should run complete workflow", () => {
      const core = new PEOdpCore();
      
      // Run audit
      const auditResult = core.iniciar_auditoria("NORMAM-101");
      expect(auditResult).toBeDefined();
      
      // Start monitoring
      core.iniciar_monitoramento_tempo_real("Test Vessel", 6);
      
      // Check results
      const audits = core.getAuditorias();
      const sessions = core.getSessoes();
      
      expect(audits.length).toBeGreaterThan(0);
      expect(sessions.length).toBeGreaterThan(0);
    });
  });
});
