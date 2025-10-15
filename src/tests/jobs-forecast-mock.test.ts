import { describe, it, expect } from "vitest";
import { mockJobs } from "../../lib/dev/mocks/jobsForecastMock";

describe("Jobs Forecast Mock Data", () => {
  describe("mockJobs structure", () => {
    it("should have mock jobs data", () => {
      expect(mockJobs).toBeDefined();
      expect(mockJobs).toBeInstanceOf(Array);
      expect(mockJobs.length).toBeGreaterThan(0);
    });

    it("should have correct job structure", () => {
      const firstJob = mockJobs[0];
      
      expect(firstJob).toHaveProperty("id");
      expect(firstJob).toHaveProperty("component_id");
      expect(firstJob).toHaveProperty("completed_at");
      expect(firstJob).toHaveProperty("status");
    });

    it("should have jobs with correct field types", () => {
      const firstJob = mockJobs[0];
      
      expect(typeof firstJob.id).toBe("string");
      expect(typeof firstJob.component_id).toBe("string");
      expect(typeof firstJob.completed_at).toBe("string");
      expect(typeof firstJob.status).toBe("string");
    });

    it("should have jobs with completed status", () => {
      const allCompleted = mockJobs.every(job => job.status === "completed");
      expect(allCompleted).toBe(true);
    });

    it("should have jobs across multiple months", () => {
      const months = new Set(mockJobs.map(job => job.completed_at.slice(0, 7)));
      expect(months.size).toBeGreaterThan(1);
    });

    it("should have jobs for multiple components", () => {
      const components = new Set(mockJobs.map(job => job.component_id));
      expect(components.size).toBeGreaterThan(1);
    });

    it("should have valid date format (YYYY-MM-DD)", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockJobs.forEach(job => {
        expect(job.completed_at).toMatch(dateRegex);
      });
    });

    it("should have dates in 2025", () => {
      mockJobs.forEach(job => {
        expect(job.completed_at.startsWith("2025")).toBe(true);
      });
    });
  });

  describe("Trend data generation", () => {
    it("should be able to group jobs by component", () => {
      const trendByComponent: Record<string, string[]> = {};
      mockJobs.forEach(job => {
        const month = job.completed_at.slice(0, 7);
        if (!trendByComponent[job.component_id]) trendByComponent[job.component_id] = [];
        trendByComponent[job.component_id].push(month);
      });

      expect(Object.keys(trendByComponent).length).toBeGreaterThan(0);
      expect(trendByComponent["comp-001"]).toBeDefined();
      expect(trendByComponent["comp-001"].length).toBeGreaterThan(0);
    });

    it("should have at least 3 components", () => {
      const components = new Set(mockJobs.map(job => job.component_id));
      expect(components.size).toBeGreaterThanOrEqual(3);
    });

    it("should have data for January 2025", () => {
      const januaryJobs = mockJobs.filter(job => job.completed_at.startsWith("2025-01"));
      expect(januaryJobs.length).toBeGreaterThan(0);
    });

    it("should have data for February 2025", () => {
      const februaryJobs = mockJobs.filter(job => job.completed_at.startsWith("2025-02"));
      expect(februaryJobs.length).toBeGreaterThan(0);
    });

    it("should have data for March 2025", () => {
      const marchJobs = mockJobs.filter(job => job.completed_at.startsWith("2025-03"));
      expect(marchJobs.length).toBeGreaterThan(0);
    });

    it("should have data for April 2025", () => {
      const aprilJobs = mockJobs.filter(job => job.completed_at.startsWith("2025-04"));
      expect(aprilJobs.length).toBeGreaterThan(0);
    });
  });

  describe("Forecast API compatibility", () => {
    it("should have sufficient data for trend analysis", () => {
      // Need at least 10 jobs for meaningful forecast
      expect(mockJobs.length).toBeGreaterThanOrEqual(10);
    });

    it("should cover multiple time periods for trend detection", () => {
      const months = new Set(mockJobs.map(job => job.completed_at.slice(0, 7)));
      // Need at least 3 months for trend analysis
      expect(months.size).toBeGreaterThanOrEqual(3);
    });

    it("should have data that can be JSON stringified", () => {
      const trendByComponent: Record<string, string[]> = {};
      mockJobs.forEach(job => {
        const month = job.completed_at.slice(0, 7);
        if (!trendByComponent[job.component_id]) trendByComponent[job.component_id] = [];
        trendByComponent[job.component_id].push(month);
      });

      const jsonString = JSON.stringify(trendByComponent, null, 2);
      expect(jsonString).toBeDefined();
      expect(jsonString.length).toBeGreaterThan(0);
      
      // Should be valid JSON
      const parsed = JSON.parse(jsonString);
      expect(parsed).toBeDefined();
      expect(typeof parsed).toBe("object");
    });
  });
});
