import { describe, it, expect } from "vitest";
import { mockIncident, mockSAROperation, mockVessel } from "../../shared/mock-factories";

describe("SAR (Search and Rescue) Operations", () => {
  describe("SAR Initiation", () => {
    it("should initiate SAR operation for critical incident", () => {
      // Arrange
      const incident = mockIncident({ severity: "critical", type: "man_overboard" });
      
      // Act
      const sarOperation = initiateSAR(incident);
      
      // Assert
      expect(sarOperation.incident_id).toBe(incident.id);
      expect(sarOperation.status).toBe("in_progress");
      expect(sarOperation.search_area).toBeDefined();
    });

    it("should calculate search area based on incident location and time", () => {
      // Arrange
      const incident = mockIncident({
        location: { lat: -23.5505, lng: -46.6333 },
        started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      });
      
      // Act
      const searchArea = calculateSearchArea(incident);
      
      // Assert
      expect(searchArea.radius).toBeGreaterThan(0);
      expect(searchArea.center).toEqual(incident.location);
    });
  });

  describe("Resource Deployment", () => {
    it("should deploy appropriate vessels for SAR operation", () => {
      // Arrange
      const sarOperation = mockSAROperation();
      const availableVessels = [
        mockVessel({ type: "Support Vessel", status: "operational" }),
        mockVessel({ type: "Rescue Boat", status: "operational" }),
        mockVessel({ type: "Supply Vessel", status: "maintenance" }),
      ];
      
      // Act
      const deployedVessels = deployVesselsForSAR(sarOperation, availableVessels);
      
      // Assert
      expect(deployedVessels.length).toBe(2); // Only operational vessels
      expect(deployedVessels.every(v => v.status === "operational")).toBe(true);
    });
  });

  describe("SAR Progress Tracking", () => {
    it("should update SAR status based on progress", () => {
      // Arrange
      const sarOperation = mockSAROperation({ status: "in_progress" });
      
      // Act
      const updatedOperation = updateSARProgress(sarOperation, {
        search_coverage: 75,
        time_elapsed: 2,
      });
      
      // Assert
      expect(updatedOperation.search_coverage).toBe(75);
      expect(updatedOperation.status).toBe("in_progress");
    });

    it("should mark SAR as successful when target found", () => {
      // Arrange
      const sarOperation = mockSAROperation({ status: "in_progress" });
      
      // Act
      const completedOperation = completeSAR(sarOperation, { success: true });
      
      // Assert
      expect(completedOperation.status).toBe("completed");
      expect(completedOperation.outcome).toBe("success");
    });
  });
});

// Mock implementations
function initiateSAR(incident: any) {
  return mockSAROperation({
    incident_id: incident.id,
    status: "in_progress",
    search_area: calculateSearchArea(incident),
  });
}

function calculateSearchArea(incident: any) {
  const timeElapsed = Date.now() - new Date(incident.started_at).getTime();
  const hoursElapsed = timeElapsed / 3600000;
  const driftSpeed = 2; // nautical miles per hour
  const radius = Math.max(5, hoursElapsed * driftSpeed);
  
  return {
    center: incident.location,
    radius,
    unit: "nautical_miles",
  };
}

function deployVesselsForSAR(sarOperation: any, vessels: any[]) {
  return vessels.filter(v => v.status === "operational");
}

function updateSARProgress(sarOperation: any, progress: any) {
  return {
    ...sarOperation,
    search_coverage: progress.search_coverage,
    time_elapsed: progress.time_elapsed,
  };
}

function completeSAR(sarOperation: any, result: any) {
  return {
    ...sarOperation,
    status: "completed",
    outcome: result.success ? "success" : "unsuccessful",
    completed_at: new Date().toISOString(),
  };
}
