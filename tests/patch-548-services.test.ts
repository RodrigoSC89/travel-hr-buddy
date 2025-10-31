/**
 * PATCH 548 - Services Tests
 * Tests for refactored AI and Cognitive services
 */

import { describe, it, expect, beforeEach } from "vitest";
import { DistributedAIService } from "@/services/ai/distributed-ai.service";
import { MissionCoordinationService } from "@/services/ai/mission-coordination.service";
import { CognitiveCloneService } from "@/services/cognitive/clone.service";
import { ContextMeshService } from "@/services/cognitive/context-mesh.service";
import { TranslatorService } from "@/services/cognitive/translator.service";
import { PriorityBalancerService } from "@/services/cognitive/priority-balancer.service";
import { InstanceControllerService } from "@/services/cognitive/instance-controller.service";

describe("PATCH 548 - AI Services", () => {
  describe("DistributedAIService", () => {
    it("should create vessel context", async () => {
      const context = await DistributedAIService.getVesselContext("vessel-001");
      
      expect(context).toBeDefined();
      expect(context?.vessel_id).toBe("vessel-001");
      expect(context?.model_version).toBe("1.0.0");
    });

    it("should update vessel context", async () => {
      await DistributedAIService.createVesselContext("vessel-002");
      const updated = await DistributedAIService.updateVesselContext("vessel-002", {
        interaction_count: 5
      });
      
      expect(updated).toBeDefined();
      expect(updated?.interaction_count).toBe(5);
    });

    it("should check if global sync is needed", () => {
      const needsSync = DistributedAIService.needsGlobalSync();
      expect(typeof needsSync).toBe("boolean");
    });
  });

  describe("MissionCoordinationService", () => {
    it("should create a mission", async () => {
      const mission = await MissionCoordinationService.createMission({
        name: "Test Mission",
        description: "Test mission description",
        priority: "high"
      });
      
      expect(mission).toBeDefined();
      expect(mission?.name).toBe("Test Mission");
      expect(mission?.status).toBe("planned");
    });

    it("should assign vessel to mission", async () => {
      const mission = await MissionCoordinationService.createMission({
        name: "SAR Mission",
        priority: "critical"
      });

      if (mission) {
        const assignment = await MissionCoordinationService.assignVessel(
          mission.id,
          "vessel-001",
          "primary",
          "Lead vessel"
        );
        
        expect(assignment).toBeDefined();
        expect(assignment?.vessel_id).toBe("vessel-001");
        expect(assignment?.role).toBe("primary");
      }
    });

    it("should update mission status", async () => {
      const mission = await MissionCoordinationService.createMission({
        name: "Status Test",
        priority: "medium"
      });

      if (mission) {
        const updated = await MissionCoordinationService.updateMissionStatus(
          mission.id,
          "active"
        );
        
        expect(updated).toBeDefined();
        expect(updated?.status).toBe("active");
      }
    });

    it("should add mission log", async () => {
      const mission = await MissionCoordinationService.createMission({
        name: "Log Test",
        priority: "low"
      });

      if (mission) {
        const log = await MissionCoordinationService.addMissionLog(
          mission.id,
          "info",
          "Mission started",
          { event: "start" }
        );
        
        expect(log).toBeDefined();
        expect(log?.message).toBe("Mission started");
      }
    });
  });
});

describe("PATCH 548 - Cognitive Services", () => {
  describe("CognitiveCloneService", () => {
    it("should create a snapshot", async () => {
      const snapshot = await CognitiveCloneService.createSnapshot("test-snapshot");
      
      expect(snapshot).toBeDefined();
      expect(snapshot.configurationId).toBeDefined();
      expect(snapshot.metadata.version).toBe("1.0.0");
    });

    it("should list clones", () => {
      const clones = CognitiveCloneService.listClones();
      expect(Array.isArray(clones)).toBe(true);
    });
  });

  describe("ContextMeshService", () => {
    beforeEach(() => {
      ContextMeshService.clearHistory();
    });

    it("should publish and receive messages", () => {
      let received: any = null;
      
      const subscriptionId = ContextMeshService.subscribe({
        moduleName: "test-module",
        contextTypes: ["mission"],
        handler: (msg) => {
          received = msg;
        }
      });

      ContextMeshService.publish({
        moduleName: "test-module",
        contextType: "mission",
        contextData: { test: "data" },
        source: "test"
      });

      expect(received).toBeDefined();
      expect(received.contextData.test).toBe("data");

      ContextMeshService.unsubscribe(subscriptionId);
    });

    it("should maintain message history", () => {
      ContextMeshService.publish({
        moduleName: "test",
        contextType: "ai",
        contextData: { value: 1 },
        source: "test"
      });

      const history = ContextMeshService.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe("TranslatorService", () => {
    it("should detect browser language", () => {
      const lang = TranslatorService.detectBrowserLanguage();
      expect(["pt", "en", "es", "fr", "de"]).toContain(lang);
    });

    it("should translate with fallback", async () => {
      const result = await TranslatorService.translate("test.key", "pt");
      
      expect(result).toBeDefined();
      expect(result.translation).toBeDefined();
      expect(result.source).toBeDefined();
    });

    it("should get statistics", () => {
      const stats = TranslatorService.getStatistics();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalTranslations).toBe("number");
    });
  });

  describe("PriorityBalancerService", () => {
    it("should read global context", async () => {
      const context = await PriorityBalancerService.readGlobalContext();
      
      expect(context).toBeDefined();
      expect(context.timeOfDay).toBeDefined();
      expect(context.dayOfWeek).toBeDefined();
      expect(typeof context.systemLoad).toBe("number");
    });

    it("should rebalance priorities", async () => {
      const priorities = [
        { moduleId: "mod1", priority: 50, weight: 0.5, criticality: "medium" as const },
        { moduleId: "mod2", priority: 80, weight: 0.8, criticality: "high" as const }
      ];

      const result = await PriorityBalancerService.rebalance(priorities);
      
      expect(result).toBeDefined();
      expect(result.updatedPriorities).toBeDefined();
      expect(Array.isArray(result.shifts)).toBe(true);
    });
  });

  describe("InstanceControllerService", () => {
    it("should register instance", () => {
      const instance = InstanceControllerService.registerInstance(
        "Test Instance",
        "https://test.example.com",
        ["ai", "processing"]
      );
      
      expect(instance).toBeDefined();
      expect(instance.name).toBe("Test Instance");
      expect(instance.status).toBe("active");
    });

    it("should list instances", () => {
      InstanceControllerService.registerInstance("Inst1", "https://inst1.com", []);
      InstanceControllerService.registerInstance("Inst2", "https://inst2.com", []);
      
      const instances = InstanceControllerService.listInstances();
      expect(instances.length).toBeGreaterThanOrEqual(2);
    });

    it("should filter instances by status", () => {
      const active = InstanceControllerService.listInstances({ status: "active" });
      expect(Array.isArray(active)).toBe(true);
    });
  });
});
