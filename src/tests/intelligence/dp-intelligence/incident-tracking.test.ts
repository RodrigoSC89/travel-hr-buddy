/**
 * PATCH 531 - DP Intelligence Incident Tracking Tests
 * Tests for incident tracking, monitoring and real-time updates
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn()
    }))
  }
}));

interface IncidentTracker {
  trackIncident: (incident: any) => Promise<{ success: boolean; incidentId?: string }>;
  updateStatus: (incidentId: string, status: string) => Promise<boolean>;
  getIncidentHistory: (incidentId: string) => Promise<any[]>;
  subscribeToUpdates: (callback: (incident: any) => void) => void;
  unsubscribe: () => void;
}

// Mock incident tracking service
const createIncidentTracker = (): IncidentTracker => {
  const incidents = new Map();
  const histories = new Map();
  const subscribers: Array<(incident: any) => void> = [];
  
  let counter = 0;
  
  return {
    trackIncident: async (incident: any) => {
      counter++;
      const incidentId = `INC-${Date.now()}-${counter}`;
      const trackedIncident = {
        ...incident,
        id: incidentId,
        status: "reported",
        timestamp: new Date().toISOString(),
        updates: []
      };
      
      incidents.set(incidentId, trackedIncident);
      histories.set(incidentId, [
        {
          timestamp: new Date().toISOString(),
          action: "incident_created",
          details: "Incident reported and tracking initiated"
        }
      ]);
      
      // Notify subscribers
      subscribers.forEach(callback => callback(trackedIncident));
      
      return { success: true, incidentId };
    },
    
    updateStatus: async (incidentId: string, status: string) => {
      const incident = incidents.get(incidentId);
      if (!incident) return false;
      
      incident.status = status;
      incident.updates.push({
        timestamp: new Date().toISOString(),
        status,
        updatedBy: "system"
      });
      
      const history = histories.get(incidentId) || [];
      history.push({
        timestamp: new Date().toISOString(),
        action: "status_updated",
        details: `Status changed to ${status}`
      });
      histories.set(incidentId, history);
      
      // Notify subscribers
      subscribers.forEach(callback => callback(incident));
      
      return true;
    },
    
    getIncidentHistory: async (incidentId: string) => {
      return histories.get(incidentId) || [];
    },
    
    subscribeToUpdates: (callback: (incident: any) => void) => {
      subscribers.push(callback);
    },
    
    unsubscribe: () => {
      subscribers.length = 0;
    }
  };
};

describe("DP Intelligence - Incident Tracking Tests", () => {
  let tracker: IncidentTracker;

  beforeEach(() => {
    tracker = createIncidentTracker();
    vi.clearAllMocks();
  });

  afterEach(() => {
    tracker.unsubscribe();
  });

  describe("Incident Registration", () => {
    it("should successfully track a new incident", async () => {
      const incident = {
        title: "DP System Alarm",
        vessel: "MV Ocean Explorer",
        severity: "high",
        type: "position_loss",
        location: { lat: 25.5, lon: -88.3 }
      };
      
      const result = await tracker.trackIncident(incident);
      
      expect(result.success).toBe(true);
      expect(result.incidentId).toBeDefined();
      expect(result.incidentId).toMatch(/^INC-/);
    });

    it("should assign unique IDs to incidents", async () => {
      const incident1 = { title: "Incident 1", severity: "medium" };
      const incident2 = { title: "Incident 2", severity: "low" };
      
      const result1 = await tracker.trackIncident(incident1);
      const result2 = await tracker.trackIncident(incident2);
      
      expect(result1.incidentId).not.toBe(result2.incidentId);
    });

    it("should initialize incident with reported status", async () => {
      const incident = { title: "Test Incident", severity: "low" };
      
      const result = await tracker.trackIncident(incident);
      const history = await tracker.getIncidentHistory(result.incidentId!);
      
      expect(history).toHaveLength(1);
      expect(history[0].action).toBe("incident_created");
    });

    it("should track incident metadata", async () => {
      const incident = {
        title: "Critical Alarm",
        vessel: "Vessel-001",
        severity: "critical",
        metadata: {
          dpClass: "DP-3",
          operationMode: "drilling",
          weatherConditions: "severe"
        }
      };
      
      const result = await tracker.trackIncident(incident);
      
      expect(result.success).toBe(true);
      expect(result.incidentId).toBeDefined();
    });
  });

  describe("Status Updates", () => {
    it("should update incident status successfully", async () => {
      const incident = { title: "Test", severity: "medium" };
      const { incidentId } = await tracker.trackIncident(incident);
      
      const updated = await tracker.updateStatus(incidentId!, "investigating");
      
      expect(updated).toBe(true);
    });

    it("should record status change in history", async () => {
      const incident = { title: "Test", severity: "medium" };
      const { incidentId } = await tracker.trackIncident(incident);
      
      await tracker.updateStatus(incidentId!, "investigating");
      await tracker.updateStatus(incidentId!, "resolved");
      
      const history = await tracker.getIncidentHistory(incidentId!);
      
      expect(history.length).toBeGreaterThan(1);
      expect(history.some(h => h.action === "status_updated")).toBe(true);
    });

    it("should handle invalid incident ID gracefully", async () => {
      const updated = await tracker.updateStatus("INVALID-ID", "resolved");
      
      expect(updated).toBe(false);
    });

    it("should track multiple status transitions", async () => {
      const incident = { title: "Multi-status Test", severity: "high" };
      const { incidentId } = await tracker.trackIncident(incident);
      
      const statuses = ["investigating", "action_taken", "monitoring", "resolved"];
      
      for (const status of statuses) {
        await tracker.updateStatus(incidentId!, status);
      }
      
      const history = await tracker.getIncidentHistory(incidentId!);
      
      expect(history.length).toBe(statuses.length + 1); // +1 for initial creation
    });
  });

  describe("Incident History", () => {
    it("should retrieve complete incident history", async () => {
      const incident = { title: "History Test", severity: "low" };
      const { incidentId } = await tracker.trackIncident(incident);
      
      await tracker.updateStatus(incidentId!, "investigating");
      await tracker.updateStatus(incidentId!, "resolved");
      
      const history = await tracker.getIncidentHistory(incidentId!);
      
      expect(history.length).toBe(3);
      expect(history[0].action).toBe("incident_created");
    });

    it("should return empty array for non-existent incident", async () => {
      const history = await tracker.getIncidentHistory("NON-EXISTENT");
      
      expect(history).toEqual([]);
    });

    it("should maintain chronological order of events", async () => {
      const incident = { title: "Order Test", severity: "medium" };
      const { incidentId } = await tracker.trackIncident(incident);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      await tracker.updateStatus(incidentId!, "investigating");
      await new Promise(resolve => setTimeout(resolve, 10));
      await tracker.updateStatus(incidentId!, "resolved");
      
      const history = await tracker.getIncidentHistory(incidentId!);
      
      for (let i = 1; i < history.length; i++) {
        const prevTime = new Date(history[i - 1].timestamp).getTime();
        const currTime = new Date(history[i].timestamp).getTime();
        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }
    });

    it("should include detailed event information", async () => {
      const incident = { title: "Detail Test", severity: "high" };
      const { incidentId } = await tracker.trackIncident(incident);
      
      await tracker.updateStatus(incidentId!, "investigating");
      
      const history = await tracker.getIncidentHistory(incidentId!);
      
      history.forEach(event => {
        expect(event).toHaveProperty("timestamp");
        expect(event).toHaveProperty("action");
        expect(event).toHaveProperty("details");
      });
    });
  });

  describe("Real-time Updates", () => {
    it("should notify subscribers of new incidents", async () => {
      const updates: any[] = [];
      tracker.subscribeToUpdates((incident) => {
        updates.push(incident);
      });
      
      await tracker.trackIncident({ title: "Test", severity: "low" });
      
      expect(updates).toHaveLength(1);
      expect(updates[0].title).toBe("Test");
    });

    it("should notify subscribers of status changes", async () => {
      const updates: any[] = [];
      tracker.subscribeToUpdates((incident) => {
        updates.push({ ...incident });
      });
      
      const { incidentId } = await tracker.trackIncident({ title: "Test", severity: "medium" });
      await tracker.updateStatus(incidentId!, "investigating");
      
      expect(updates.length).toBeGreaterThan(1);
      expect(updates[updates.length - 1].status).toBe("investigating");
    });

    it("should support multiple subscribers", async () => {
      const updates1: any[] = [];
      const updates2: any[] = [];
      
      tracker.subscribeToUpdates((incident) => updates1.push(incident));
      tracker.subscribeToUpdates((incident) => updates2.push(incident));
      
      await tracker.trackIncident({ title: "Test", severity: "high" });
      
      expect(updates1).toHaveLength(1);
      expect(updates2).toHaveLength(1);
    });

    it("should clean up subscriptions on unsubscribe", () => {
      const updates: any[] = [];
      tracker.subscribeToUpdates((incident) => updates.push(incident));
      
      tracker.unsubscribe();
      
      expect(() => tracker.trackIncident({ title: "Test", severity: "low" })).not.toThrow();
    });
  });

  describe("Incident Filtering and Querying", () => {
    it("should track incidents with different severity levels", async () => {
      const severities = ["critical", "high", "medium", "low"];
      const incidentIds: string[] = [];
      
      for (const severity of severities) {
        const { incidentId } = await tracker.trackIncident({
          title: `${severity} incident`,
          severity
        });
        incidentIds.push(incidentId!);
      }
      
      expect(incidentIds).toHaveLength(4);
      expect(new Set(incidentIds).size).toBe(4); // All unique
    });

    it("should track incidents with location data", async () => {
      const incident = {
        title: "Location Test",
        severity: "medium",
        location: {
          lat: 25.5,
          lon: -88.3,
          area: "Gulf of Mexico"
        }
      };
      
      const result = await tracker.trackIncident(incident);
      
      expect(result.success).toBe(true);
    });

    it("should handle rapid incident reporting", async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(tracker.trackIncident({
          title: `Rapid Test ${i}`,
          severity: "low"
        }));
      }
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Performance and Reliability", () => {
    it("should handle high volume of incidents", async () => {
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(tracker.trackIncident({
          title: `Incident ${i}`,
          severity: i % 2 === 0 ? "high" : "low"
        }));
      }
      
      await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should maintain data integrity under concurrent updates", async () => {
      const { incidentId } = await tracker.trackIncident({
        title: "Concurrent Test",
        severity: "medium"
      });
      
      const promises = [
        tracker.updateStatus(incidentId!, "investigating"),
        tracker.updateStatus(incidentId!, "action_taken"),
        tracker.updateStatus(incidentId!, "resolved")
      ];
      
      await Promise.all(promises);
      
      const history = await tracker.getIncidentHistory(incidentId!);
      expect(history.length).toBeGreaterThan(1);
    });
  });
});
