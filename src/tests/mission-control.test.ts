/**
 * PATCH 535 - Mission Control Tests
 * Tests for mission planning, execution, completion workflow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        }),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    })
  }
}));

interface Mission {
  id: string;
  name: string;
  type: "tactical" | "strategic" | "emergency" | "training";
  status: "planning" | "active" | "paused" | "completed" | "cancelled";
  priority: "low" | "normal" | "high" | "critical";
  objectives: MissionObjective[];
  resources: Resource[];
  assignedAgents: string[];
  progress: number;
  startTime?: Date;
  endTime?: Date;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
}

interface MissionObjective {
  id: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  priority: number;
  completionPercentage: number;
}

interface Resource {
  id: string;
  type: "personnel" | "equipment" | "vehicle" | "system";
  name: string;
  quantity: number;
  status: "requested" | "allocated" | "in_use" | "released";
}

interface MissionEvent {
  id: string;
  missionId: string;
  type: "started" | "objective_completed" | "resource_allocated" | "paused" | "resumed" | "completed";
  timestamp: Date;
  data: any;
}

// Mock Mission Control Service
class MissionControlService {
  private missions: Map<string, Mission> = new Map();
  private events: MissionEvent[] = [];
  private counter = 0;

  async createMission(mission: Omit<Mission, "id" | "status" | "progress">): Promise<Mission> {
    this.counter++;
    const newMission: Mission = {
      ...mission,
      id: `MISSION-${Date.now()}-${this.counter}`,
      status: "planning",
      progress: 0
    };

    this.missions.set(newMission.id, newMission);
    return newMission;
  }

  async startMission(missionId: string): Promise<boolean> {
    const mission = this.missions.get(missionId);
    if (!mission) return false;

    if (mission.status !== "planning" && mission.status !== "paused") {
      return false;
    }

    mission.status = "active";
    mission.startTime = new Date();

    this.recordEvent({
      id: `EVENT-${Date.now()}`,
      missionId,
      type: "started",
      timestamp: new Date(),
      data: {}
    });

    return true;
  }

  async pauseMission(missionId: string): Promise<boolean> {
    const mission = this.missions.get(missionId);
    if (!mission || mission.status !== "active") return false;

    mission.status = "paused";

    this.recordEvent({
      id: `EVENT-${Date.now()}`,
      missionId,
      type: "paused",
      timestamp: new Date(),
      data: {}
    });

    return true;
  }

  async resumeMission(missionId: string): Promise<boolean> {
    const mission = this.missions.get(missionId);
    if (!mission || mission.status !== "paused") return false;

    mission.status = "active";

    this.recordEvent({
      id: `EVENT-${Date.now()}`,
      missionId,
      type: "resumed",
      timestamp: new Date(),
      data: {}
    });

    return true;
  }

  async completeMission(missionId: string): Promise<boolean> {
    const mission = this.missions.get(missionId);
    if (!mission) return false;

    mission.status = "completed";
    mission.endTime = new Date();

    if (mission.startTime) {
      mission.actualDuration = Math.floor(
        (mission.endTime.getTime() - mission.startTime.getTime()) / (1000 * 60)
      );
    }

    // Mark all objectives as completed
    mission.objectives.forEach(obj => {
      obj.status = "completed";
      obj.completionPercentage = 100;
    });

    mission.progress = 100;

    this.recordEvent({
      id: `EVENT-${Date.now()}`,
      missionId,
      type: "completed",
      timestamp: new Date(),
      data: {}
    });

    return true;
  }

  async cancelMission(missionId: string): Promise<boolean> {
    const mission = this.missions.get(missionId);
    if (!mission) return false;

    mission.status = "cancelled";
    return true;
  }

  async updateObjective(missionId: string, objectiveId: string, status: string, percentage: number): Promise<boolean> {
    const mission = this.missions.get(missionId);
    if (!mission) return false;

    const objective = mission.objectives.find(o => o.id === objectiveId);
    if (!objective) return false;

    objective.status = status as MissionObjective["status"];
    objective.completionPercentage = percentage;

    // Update overall mission progress
    this.updateMissionProgress(missionId);

    if (status === "completed") {
      this.recordEvent({
        id: `EVENT-${Date.now()}`,
        missionId,
        type: "objective_completed",
        timestamp: new Date(),
        data: { objectiveId, description: objective.description }
      });
    }

    return true;
  }

  async allocateResource(missionId: string, resource: Resource): Promise<boolean> {
    const mission = this.missions.get(missionId);
    if (!mission) return false;

    const existingResourceIndex = mission.resources.findIndex(r => r.id === resource.id);
    
    if (existingResourceIndex >= 0) {
      mission.resources[existingResourceIndex] = { ...resource, status: "allocated" };
    } else {
      mission.resources.push({ ...resource, status: "allocated" });
    }

    this.recordEvent({
      id: `EVENT-${Date.now()}`,
      missionId,
      type: "resource_allocated",
      timestamp: new Date(),
      data: { resource }
    });

    return true;
  }

  async releaseResource(missionId: string, resourceId: string): Promise<boolean> {
    const mission = this.missions.get(missionId);
    if (!mission) return false;

    const resource = mission.resources.find(r => r.id === resourceId);
    if (!resource) return false;

    resource.status = "released";
    return true;
  }

  getMission(missionId: string): Mission | undefined {
    return this.missions.get(missionId);
  }

  getAllMissions(): Mission[] {
    return Array.from(this.missions.values());
  }

  getMissionsByStatus(status: Mission["status"]): Mission[] {
    return Array.from(this.missions.values()).filter(m => m.status === status);
  }

  getMissionEvents(missionId: string): MissionEvent[] {
    return this.events.filter(e => e.missionId === missionId);
  }

  private updateMissionProgress(missionId: string): void {
    const mission = this.missions.get(missionId);
    if (!mission || mission.objectives.length === 0) return;

    const totalProgress = mission.objectives.reduce(
      (sum, obj) => sum + obj.completionPercentage,
      0
    );

    mission.progress = Math.floor(totalProgress / mission.objectives.length);
  }

  private recordEvent(event: MissionEvent): void {
    this.events.push(event);
  }

  clearAll(): void {
    this.missions.clear();
    this.events = [];
    this.counter = 0;
  }
}

describe("Mission Control Tests", () => {
  let service: MissionControlService;

  beforeEach(() => {
    // Create a fresh instance for each test
    service = new MissionControlService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    service.clearAll();
  });

  describe("Mission Planning", () => {
    it("should create a new mission in planning state", async () => {
      const missionData = {
        name: "Emergency Response",
        type: "emergency" as const,
        priority: "critical" as const,
        objectives: [
          {
            id: "obj-1",
            description: "Deploy response team",
            status: "pending" as const,
            priority: 1,
            completionPercentage: 0
          }
        ],
        resources: [],
        assignedAgents: ["agent-1"],
        estimatedDuration: 120
      });

      const mission = await service.createMission(missionData);

      expect(mission.status).toBe("planning");
      expect(mission.progress).toBe(0);
      expect(mission.id).toBeDefined();
      expect(mission.name).toBe("Emergency Response");
    });

    it("should create mission with multiple objectives", async () => {
      const missionData = {
        name: "Tactical Operation",
        type: "tactical" as const,
        priority: "high" as const,
        objectives: [
          { id: "obj-1", description: "Objective 1", status: "pending" as const, priority: 1, completionPercentage: 0 },
          { id: "obj-2", description: "Objective 2", status: "pending" as const, priority: 2, completionPercentage: 0 },
          { id: "obj-3", description: "Objective 3", status: "pending" as const, priority: 3, completionPercentage: 0 }
        ],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 180
      });

      const mission = await service.createMission(missionData);

      expect(mission.objectives).toHaveLength(3);
      expect(mission.objectives.every(obj => obj.status === "pending")).toBe(true);
    });

    it("should assign agents to mission during planning", async () => {
      const missionData = {
        name: "Training Exercise",
        type: "training" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: ["agent-1", "agent-2", "agent-3"],
        estimatedDuration: 240
      });

      const mission = await service.createMission(missionData);

      expect(mission.assignedAgents).toHaveLength(3);
      expect(mission.assignedAgents).toContain("agent-1");
    });

    it("should set mission priority correctly", async () => {
      const priorities: Array<"low" | "normal" | "high" | "critical"> = ["low", "normal", "high", "critical"];

      for (const priority of priorities) {
        const missionData = {
          name: `${priority} priority mission`,
          type: "tactical" as const,
          priority,
          objectives: [],
          resources: [],
          assignedAgents: [],
          estimatedDuration: 60
        };

        const mission = await service.createMission(missionData);
        expect(mission.priority).toBe(priority);
      }
    });
  });

  describe("Mission Execution", () => {
    it("should start a mission from planning state", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [{ id: "obj-1", description: "Test", status: "pending" as const, priority: 1, completionPercentage: 0 }],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      const started = await service.startMission(mission.id);

      expect(started).toBe(true);
      
      const updatedMission = service.getMission(mission.id);
      expect(updatedMission?.status).toBe("active");
      expect(updatedMission?.startTime).toBeDefined();
    });

    it("should not start a mission that is already active", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      await service.startMission(mission.id);
      const secondStart = await service.startMission(mission.id);

      expect(secondStart).toBe(false);
    });

    it("should pause an active mission", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      await service.startMission(mission.id);
      const paused = await service.pauseMission(mission.id);

      expect(paused).toBe(true);
      
      const updatedMission = service.getMission(mission.id);
      expect(updatedMission?.status).toBe("paused");
    });

    it("should resume a paused mission", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      await service.startMission(mission.id);
      await service.pauseMission(mission.id);
      const resumed = await service.resumeMission(mission.id);

      expect(resumed).toBe(true);
      
      const updatedMission = service.getMission(mission.id);
      expect(updatedMission?.status).toBe("active");
    });

    it("should not pause a mission that is not active", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      const paused = await service.pauseMission(mission.id);

      expect(paused).toBe(false);
    });
  });

  describe("Mission Completion", () => {
    it("should complete a mission successfully", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [
          { id: "obj-1", description: "Objective 1", status: "pending" as const, priority: 1, completionPercentage: 0 }
        ],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      await service.startMission(mission.id);
      
      // Use fake timers to simulate time passing
      vi.useFakeTimers();
      vi.advanceTimersByTime(10);
      vi.useRealTimers();
      
      const completed = await service.completeMission(mission.id);

      expect(completed).toBe(true);
      
      const updatedMission = service.getMission(mission.id);
      expect(updatedMission?.status).toBe("completed");
      expect(updatedMission?.endTime).toBeDefined();
      expect(updatedMission?.progress).toBe(100);
    });

    it("should mark all objectives as completed when mission completes", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [
          { id: "obj-1", description: "Objective 1", status: "pending" as const, priority: 1, completionPercentage: 0 },
          { id: "obj-2", description: "Objective 2", status: "in_progress" as const, priority: 2, completionPercentage: 50 }
        ],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      await service.startMission(mission.id);
      await service.completeMission(mission.id);

      const updatedMission = service.getMission(mission.id);
      expect(updatedMission?.objectives.every(obj => obj.status === "completed")).toBe(true);
      expect(updatedMission?.objectives.every(obj => obj.completionPercentage === 100)).toBe(true);
    });

    it("should calculate actual mission duration", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      vi.useFakeTimers();
      
      const mission = await service.createMission(missionData);
      await service.startMission(mission.id);
      
      vi.advanceTimersByTime(60000); // Advance 60 seconds
      
      await service.completeMission(mission.id);

      vi.useRealTimers();

      const updatedMission = service.getMission(mission.id);
      expect(updatedMission?.actualDuration).toBeDefined();
      expect(updatedMission?.actualDuration).toBeGreaterThanOrEqual(0);
    });

    it("should cancel a mission", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      const cancelled = await service.cancelMission(mission.id);

      expect(cancelled).toBe(true);
      
      const updatedMission = service.getMission(mission.id);
      expect(updatedMission?.status).toBe("cancelled");
    });
  });

  describe("Objective Management", () => {
    it("should update objective status and percentage", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [
          { id: "obj-1", description: "Objective 1", status: "pending" as const, priority: 1, completionPercentage: 0 }
        ],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      await service.startMission(mission.id);
      
      const updated = await service.updateObjective(mission.id, "obj-1", "in_progress", 50);

      expect(updated).toBe(true);
      
      const updatedMission = service.getMission(mission.id);
      const objective = updatedMission?.objectives.find(o => o.id === "obj-1");
      expect(objective?.status).toBe("in_progress");
      expect(objective?.completionPercentage).toBe(50);
    });

    it("should update mission progress when objectives complete", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [
          { id: "obj-1", description: "Objective 1", status: "pending" as const, priority: 1, completionPercentage: 0 },
          { id: "obj-2", description: "Objective 2", status: "pending" as const, priority: 2, completionPercentage: 0 }
        ],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      await service.startMission(mission.id);
      
      await service.updateObjective(mission.id, "obj-1", "completed", 100);

      const updatedMission = service.getMission(mission.id);
      expect(updatedMission?.progress).toBe(50); // 1 of 2 objectives completed
    });

    it("should record event when objective completes", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [
          { id: "obj-1", description: "Objective 1", status: "pending" as const, priority: 1, completionPercentage: 0 }
        ],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      await service.startMission(mission.id);
      await service.updateObjective(mission.id, "obj-1", "completed", 100);

      const events = service.getMissionEvents(mission.id);
      const objectiveEvent = events.find(e => e.type === "objective_completed");
      
      expect(objectiveEvent).toBeDefined();
      expect(objectiveEvent?.data.objectiveId).toBe("obj-1");
    });
  });

  describe("Resource Management", () => {
    it("should allocate resources to mission", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      
      const resource: Resource = {
        id: "res-1",
        type: "equipment",
        name: "Mobile Unit",
        quantity: 2,
        status: "requested"
      };

      const allocated = await service.allocateResource(mission.id, resource);

      expect(allocated).toBe(true);
      
      const updatedMission = service.getMission(mission.id);
      expect(updatedMission?.resources).toHaveLength(1);
      expect(updatedMission?.resources[0].status).toBe("allocated");
    });

    it("should release resources from mission", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      
      const resource: Resource = {
        id: "res-1",
        type: "vehicle",
        name: "Transport Truck",
        quantity: 1,
        status: "requested"
      };

      await service.allocateResource(mission.id, resource);
      const released = await service.releaseResource(mission.id, "res-1");

      expect(released).toBe(true);
      
      const updatedMission = service.getMission(mission.id);
      const releasedResource = updatedMission?.resources.find(r => r.id === "res-1");
      expect(releasedResource?.status).toBe("released");
    });

    it("should record event when resource is allocated", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      
      const resource: Resource = {
        id: "res-1",
        type: "personnel",
        name: "Response Team",
        quantity: 5,
        status: "requested"
      };

      await service.allocateResource(mission.id, resource);

      const events = service.getMissionEvents(mission.id);
      const resourceEvent = events.find(e => e.type === "resource_allocated");
      
      expect(resourceEvent).toBeDefined();
      expect(resourceEvent?.data.resource.id).toBe("res-1");
    });

    it("should update existing resource when reallocated", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      
      const resource1: Resource = {
        id: "res-1",
        type: "equipment",
        name: "Equipment",
        quantity: 1,
        status: "requested"
      };

      const resource2: Resource = {
        id: "res-1",
        type: "equipment",
        name: "Equipment",
        quantity: 3,
        status: "requested"
      };

      await service.allocateResource(mission.id, resource1);
      await service.allocateResource(mission.id, resource2);

      const updatedMission = service.getMission(mission.id);
      expect(updatedMission?.resources).toHaveLength(1);
      expect(updatedMission?.resources[0].quantity).toBe(3);
    });
  });

  describe("Mission Querying", () => {
    it("should retrieve mission by ID", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      const retrieved = service.getMission(mission.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(mission.id);
    });

    it("should retrieve all missions", async () => {
      const m1 = await service.createMission({
        name: "Mission 1",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      });

      const m2 = await service.createMission({
        name: "Mission 2",
        type: "emergency" as const,
        priority: "critical" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 120
      });

      expect(m1).toBeDefined();
      expect(m2).toBeDefined();

      const allMissions = service.getAllMissions();
      expect(allMissions.length).toBe(2);
    });

    it("should filter missions by status", async () => {
      const mission1 = await service.createMission({
        name: "Mission 1",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      });

      const mission2 = await service.createMission({
        name: "Mission 2",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      });

      await service.startMission(mission1.id);

      const activeMissions = service.getMissionsByStatus("active");
      const planningMissions = service.getMissionsByStatus("planning");

      expect(activeMissions).toHaveLength(1);
      expect(planningMissions).toHaveLength(1);
    });

    it("should retrieve mission events chronologically", async () => {
      const missionData = {
        name: "Test Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [
          { id: "obj-1", description: "Objective 1", status: "pending" as const, priority: 1, completionPercentage: 0 }
        ],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 60
      };

      const mission = await service.createMission(missionData);
      await service.startMission(mission.id);
      await service.updateObjective(mission.id, "obj-1", "completed", 100);
      await service.completeMission(mission.id);

      const events = service.getMissionEvents(mission.id);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe("started");
      expect(events[events.length - 1].type).toBe("completed");
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete mission lifecycle", async () => {
      // Create mission
      const mission = await service.createMission({
        name: "Full Lifecycle Mission",
        type: "tactical" as const,
        priority: "high" as const,
        objectives: [
          { id: "obj-1", description: "Setup", status: "pending" as const, priority: 1, completionPercentage: 0 },
          { id: "obj-2", description: "Execute", status: "pending" as const, priority: 2, completionPercentage: 0 },
          { id: "obj-3", description: "Cleanup", status: "pending" as const, priority: 3, completionPercentage: 0 }
        ],
        resources: [],
        assignedAgents: ["agent-1", "agent-2"],
        estimatedDuration: 180
      });

      expect(mission.status).toBe("planning");

      // Allocate resources
      await service.allocateResource(mission.id, {
        id: "res-1",
        type: "equipment",
        name: "Equipment 1",
        quantity: 2,
        status: "requested"
      });

      // Start mission
      await service.startMission(mission.id);
      expect(service.getMission(mission.id)?.status).toBe("active");

      // Complete objectives one by one
      await service.updateObjective(mission.id, "obj-1", "completed", 100);
      expect(service.getMission(mission.id)?.progress).toBe(33);

      await service.updateObjective(mission.id, "obj-2", "completed", 100);
      expect(service.getMission(mission.id)?.progress).toBe(66);

      await service.updateObjective(mission.id, "obj-3", "completed", 100);
      expect(service.getMission(mission.id)?.progress).toBe(100);

      // Complete mission
      await service.completeMission(mission.id);
      expect(service.getMission(mission.id)?.status).toBe("completed");

      // Verify events
      const events = service.getMissionEvents(mission.id);
      expect(events.length).toBeGreaterThan(4); // started + 3 objectives + completed + resource
    });

    it("should handle mission pause and resume", async () => {
      const mission = await service.createMission({
        name: "Pausable Mission",
        type: "tactical" as const,
        priority: "normal" as const,
        objectives: [
          { id: "obj-1", description: "Task", status: "pending" as const, priority: 1, completionPercentage: 0 }
        ],
        resources: [],
        assignedAgents: [],
        estimatedDuration: 120
      });

      await service.startMission(mission.id);
      await service.updateObjective(mission.id, "obj-1", "in_progress", 30);
      await service.pauseMission(mission.id);
      
      expect(service.getMission(mission.id)?.status).toBe("paused");

      await service.resumeMission(mission.id);
      expect(service.getMission(mission.id)?.status).toBe("active");

      await service.updateObjective(mission.id, "obj-1", "completed", 100);
      await service.completeMission(mission.id);

      const events = service.getMissionEvents(mission.id);
      expect(events.some(e => e.type === "paused")).toBe(true);
      expect(events.some(e => e.type === "resumed")).toBe(true);
    });
  });
});
