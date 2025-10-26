/**
 * Tests for Cognitive Cloning Infrastructure - PATCHES 221-225
 * 
 * Tests covering:
 * - Cognitive Clone Manager (PATCH 221)
 * - Adaptive UI Engine (PATCH 222)
 * - Edge AI Core (PATCH 223)
 * - Mirror Instance Controller (PATCH 225)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue({ error: null }),
      like: vi.fn().mockReturnThis()
    }))
  }
}));

describe("PATCH 221 - Cognitive Clone Manager", () => {
  let cognitiveCloneManager: any;

  beforeEach(async () => {
    const module = await import("@/core/clones/cognitiveClone");
    cognitiveCloneManager = module.cognitiveCloneManager;
  });

  describe("Snapshot Creation", () => {
    it("should create a snapshot with all required fields", async () => {
      const modules = [
        {
          moduleId: "mmi",
          moduleName: "MMI Module",
          config: { enabled: true },
          state: { jobs: 5 },
          version: "1.0.0"
        }
      ];

      const llmContext = {
        conversationHistory: [],
        systemPrompt: "Test prompt",
        temperature: 0.7,
        maxTokens: 2000,
        model: "gpt-4"
      };

      const snapshot = await cognitiveCloneManager.createSnapshot(
        "Test Snapshot",
        modules,
        llmContext,
        "user123",
        "Test description",
        ["test", "demo"]
      );

      expect(snapshot).toBeDefined();
      expect(snapshot.id).toBeDefined();
      expect(snapshot.name).toBe("Test Snapshot");
      expect(snapshot.modules).toHaveLength(1);
      expect(snapshot.llmContext).toEqual(llmContext);
      expect(snapshot.metadata.createdBy).toBe("user123");
    });

    it("should generate unique IDs for snapshots", async () => {
      const modules = [];
      const llmContext = {
        conversationHistory: [],
        systemPrompt: "",
        temperature: 0.7,
        maxTokens: 2000,
        model: "gpt-4"
      };

      const snapshot1 = await cognitiveCloneManager.createSnapshot(
        "Snapshot 1",
        modules,
        llmContext,
        "user123"
      );

      const snapshot2 = await cognitiveCloneManager.createSnapshot(
        "Snapshot 2",
        modules,
        llmContext,
        "user123"
      );

      expect(snapshot1.id).not.toBe(snapshot2.id);
    });
  });

  describe("Clone Instance Creation", () => {
    it("should create a clone instance from snapshot", async () => {
      // First create a snapshot
      const snapshot = await cognitiveCloneManager.createSnapshot(
        "Base Snapshot",
        [],
        {
          conversationHistory: [],
          systemPrompt: "",
          temperature: 0.7,
          maxTokens: 2000,
          model: "gpt-4"
        },
        "user123"
      );

      // Then create a clone
      const clone = await cognitiveCloneManager.cloneInstance(
        snapshot.id,
        "remote",
        "user123",
        "Remote Clone"
      );

      expect(clone).toBeDefined();
      expect(clone.snapshotId).toBe(snapshot.id);
      expect(clone.environment).toBe("remote");
      expect(clone.status).toBe("active");
      expect(clone.name).toBe("Remote Clone");
    });
  });

  describe("Export and Import", () => {
    it("should export snapshot with checksum", async () => {
      const snapshot = await cognitiveCloneManager.createSnapshot(
        "Export Test",
        [],
        {
          conversationHistory: [],
          systemPrompt: "",
          temperature: 0.7,
          maxTokens: 2000,
          model: "gpt-4"
        },
        "user123"
      );

      const exportData = await cognitiveCloneManager.exportSnapshot(snapshot.id);

      expect(exportData).toBeDefined();
      expect(exportData.snapshot).toEqual(snapshot);
      expect(exportData.checksum).toBeDefined();
      expect(exportData.format).toBe("json");
    });

    it("should import snapshot and validate checksum", async () => {
      const original = await cognitiveCloneManager.createSnapshot(
        "Import Test",
        [],
        {
          conversationHistory: [],
          systemPrompt: "",
          temperature: 0.7,
          maxTokens: 2000,
          model: "gpt-4"
        },
        "user123"
      );

      const exportData = await cognitiveCloneManager.exportSnapshot(original.id);
      const imported = await cognitiveCloneManager.importSnapshot(exportData, "user456");

      expect(imported).toBeDefined();
      expect(imported.id).not.toBe(original.id); // Should have new ID
      expect(imported.name).toBe(`${original.name} (imported)`);
    });
  });
});

describe("PATCH 222 - Adaptive UI Engine", () => {
  let adaptiveUIEngine: any;

  beforeEach(async () => {
    const module = await import("@/core/adaptiveUI");
    adaptiveUIEngine = module.adaptiveUIEngine;
  });

  describe("Configuration Detection", () => {
    it("should detect device capabilities", () => {
      const config = adaptiveUIEngine.getConfig();

      expect(config).toBeDefined();
      expect(config.device).toBeDefined();
      expect(config.device.type).toMatch(/mobile|tablet|desktop|console/);
      expect(config.device.screenWidth).toBeGreaterThan(0);
    });

    it("should detect network metrics", () => {
      const config = adaptiveUIEngine.getConfig();

      expect(config.network).toBeDefined();
      expect(config.network.quality).toMatch(/excellent|good|fair|poor|offline/);
      expect(config.network.online).toBeDefined();
    });

    it("should determine appropriate UI mode", () => {
      const config = adaptiveUIEngine.getConfig();

      expect(config.mode).toMatch(/full|optimized|minimal|emergency/);
    });
  });

  describe("Mission Context", () => {
    it("should update UI mode based on mission context", () => {
      const initialMode = adaptiveUIEngine.getConfig().mode;

      adaptiveUIEngine.setMissionContext({
        priority: "critical",
        type: "emergency"
      });

      const newConfig = adaptiveUIEngine.getConfig();
      expect(newConfig.mission).toBeDefined();
      expect(newConfig.mission?.priority).toBe("critical");
    });
  });

  describe("Feature Toggles", () => {
    it("should enable appropriate features for full mode", () => {
      adaptiveUIEngine.forceMode("full");
      const config = adaptiveUIEngine.getConfig();

      expect(config.features.enableAnimations).toBe(true);
      expect(config.features.enableAutoRefresh).toBe(true);
    });

    it("should disable heavy features for minimal mode", () => {
      adaptiveUIEngine.forceMode("minimal");
      const config = adaptiveUIEngine.getConfig();

      expect(config.features.enableAnimations).toBe(false);
      expect(config.features.enableRichContent).toBe(false);
      expect(config.features.enableOfflineMode).toBe(true);
    });
  });
});

describe("PATCH 223 - Edge AI Core", () => {
  let edgeAICore: any;

  beforeEach(async () => {
    const module = await import("@/ai/edge/edgeAICore");
    edgeAICore = module.edgeAICore;
  });

  describe("Backend Detection", () => {
    it("should detect available backends", () => {
      const backends = edgeAICore.getBackendCapabilities();

      expect(backends).toBeDefined();
      expect(backends.length).toBeGreaterThan(0);
      expect(backends.some((b: any) => b.backend === 'cpu')).toBe(true);
    });

    it("should prioritize WebGPU when available", () => {
      const backends = edgeAICore.getBackendCapabilities();
      const webgpu = backends.find((b: any) => b.backend === 'webgpu');

      if (webgpu?.available) {
        expect(webgpu.performance).toBe('high');
      }
    });
  });

  describe("Model Registration", () => {
    it("should register a model", async () => {
      const model = {
        id: "test-model-v1",
        name: "Test Model",
        format: "onnx-lite" as const,
        size: 1024000,
        version: "1.0.0",
        task: "classification" as const
      };

      await edgeAICore.registerModel(model);
      const models = edgeAICore.listModels();

      expect(models).toContainEqual(model);
    });
  });

  describe("Inference", () => {
    it("should perform inference and return result", async () => {
      const model = {
        id: "inference-test",
        name: "Inference Test",
        format: "onnx-lite" as const,
        size: 1024,
        version: "1.0.0",
        task: "classification" as const
      };

      await edgeAICore.registerModel(model);

      const result = await edgeAICore.infer({
        modelId: "inference-test",
        input: { data: "test" },
        task: "classification"
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.latency).toBeGreaterThan(0);
      expect(result.backend).toBeDefined();
    });

    it("should track performance metrics", async () => {
      const model = {
        id: "metrics-test",
        name: "Metrics Test",
        format: "onnx-lite" as const,
        size: 1024,
        version: "1.0.0",
        task: "classification" as const
      };

      await edgeAICore.registerModel(model);
      await edgeAICore.infer({
        modelId: "metrics-test",
        input: {},
        task: "classification"
      });

      const metrics = edgeAICore.getMetrics();

      expect(metrics.totalInferences).toBeGreaterThan(0);
      expect(metrics.averageLatency).toBeGreaterThan(0);
    });
  });
});

describe("PATCH 225 - Mirror Instance Controller", () => {
  let instanceController: any;

  beforeEach(async () => {
    const module = await import("@/core/mirrors/instanceController");
    instanceController = module.instanceController;
    await instanceController.initialize();
  });

  describe("Instance Registration", () => {
    it("should register a new instance", async () => {
      const instance = await instanceController.registerInstance({
        id: "test-instance-1",
        name: "Test Instance",
        environment: "production",
        status: "online" as const,
        metadata: {
          version: "1.0.0",
          uptime: 0
        }
      });

      expect(instance).toBeDefined();
      expect(instance.id).toBe("test-instance-1");
      expect(instance.status).toBe("online");
    });

    it("should list registered instances", async () => {
      await instanceController.registerInstance({
        id: "list-test-1",
        name: "List Test 1",
        environment: "test",
        status: "online" as const,
        metadata: { version: "1.0.0", uptime: 0 }
      });

      const instances = instanceController.listInstances();
      expect(instances.length).toBeGreaterThan(0);
      expect(instances.some((i: any) => i.id === "list-test-1")).toBe(true);
    });
  });

  describe("Instance Synchronization", () => {
    it("should sync between two instances", async () => {
      const source = await instanceController.registerInstance({
        id: "sync-source",
        name: "Sync Source",
        environment: "test",
        status: "online" as const,
        metadata: { version: "1.0.0", uptime: 0 }
      });

      const target = await instanceController.registerInstance({
        id: "sync-target",
        name: "Sync Target",
        environment: "test",
        status: "online" as const,
        metadata: { version: "1.0.0", uptime: 0 }
      });

      const result = await instanceController.syncInstance(
        source.id,
        target.id,
        { operation: "bidirectional", priority: "normal" }
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.sourceId).toBe(source.id);
      expect(result.targetId).toBe(target.id);
    });

    it("should track sync status", async () => {
      await instanceController.registerInstance({
        id: "status-test",
        name: "Status Test",
        environment: "test",
        status: "online" as const,
        metadata: { version: "1.0.0", uptime: 0 }
      });

      const status = instanceController.getSyncStatus("status-test");
      expect(status).toBeDefined();
    });
  });

  describe("Heartbeat Monitoring", () => {
    it("should process heartbeat data", async () => {
      const instance = await instanceController.registerInstance({
        id: "heartbeat-test",
        name: "Heartbeat Test",
        environment: "test",
        status: "online" as const,
        metadata: { version: "1.0.0", uptime: 0 }
      });

      await instanceController.processHeartbeat({
        instanceId: instance.id,
        timestamp: Date.now(),
        status: "online",
        metrics: {
          cpu: 45,
          memory: 60,
          disk: 30,
          network: { latency: 50, bandwidth: 10 }
        },
        activeModules: ["mmi", "dp"]
      });

      const updated = instanceController.getInstance(instance.id);
      expect(updated).toBeDefined();
      expect(updated?.status).toBe("online");
    });
  });
});
