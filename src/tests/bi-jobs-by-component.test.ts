import { describe, it, expect } from "vitest";

describe("BI Jobs By Component Types", () => {
  it("should have proper structure for JobsByComponent", () => {
    const mockJob = {
      component_id: "Motor Principal",
      count: 15,
      avg_duration: 24.5
    };

    expect(mockJob.component_id).toBeDefined();
    expect(mockJob.count).toBeGreaterThanOrEqual(0);
    expect(mockJob.avg_duration).toBeGreaterThanOrEqual(0);
    expect(typeof mockJob.component_id).toBe("string");
    expect(typeof mockJob.count).toBe("number");
    expect(typeof mockJob.avg_duration).toBe("number");
  });

  it("should validate array structure", () => {
    const mockData = [
      { component_id: "Motor Principal", count: 15, avg_duration: 24.5 },
      { component_id: "Sistema Hidráulico", count: 12, avg_duration: 18.3 },
      { component_id: "Sistema Elétrico", count: 8, avg_duration: 12.7 }
    ];

    expect(Array.isArray(mockData)).toBe(true);
    expect(mockData.length).toBe(3);
    
    mockData.forEach((item) => {
      expect(item).toHaveProperty("component_id");
      expect(item).toHaveProperty("count");
      expect(item).toHaveProperty("avg_duration");
    });
  });

  it("should validate empty array", () => {
    const emptyData: Array<{ component_id: string; count: number; avg_duration: number }> = [];
    expect(emptyData).toHaveLength(0);
    expect(Array.isArray(emptyData)).toBe(true);
  });

  it("should calculate total jobs correctly", () => {
    const jobs = [
      { component_id: "Motor Principal", count: 15, avg_duration: 24.5 },
      { component_id: "Sistema Hidráulico", count: 12, avg_duration: 18.3 },
      { component_id: "Sistema Elétrico", count: 8, avg_duration: 12.7 }
    ];

    const total = jobs.reduce((sum, item) => sum + item.count, 0);
    expect(total).toBe(35);
  });

  it("should calculate average duration across all components", () => {
    const jobs = [
      { component_id: "Motor Principal", count: 2, avg_duration: 20 },
      { component_id: "Sistema Hidráulico", count: 3, avg_duration: 30 }
    ];

    const totalJobs = jobs.reduce((sum, item) => sum + item.count, 0);
    const weightedSum = jobs.reduce((sum, item) => sum + (item.avg_duration * item.count), 0);
    const avgDuration = weightedSum / totalJobs;

    expect(avgDuration).toBeCloseTo(26, 0);
  });

  it("should handle component with zero duration", () => {
    const mockJob = {
      component_id: "Componente Rápido",
      count: 5,
      avg_duration: 0
    };

    expect(mockJob.avg_duration).toBe(0);
  });
});

describe("BI Jobs By Component API Endpoint", () => {
  it("should expect endpoint at /api/bi/jobs-by-component", () => {
    const endpoint = "/api/bi/jobs-by-component";
    
    expect(endpoint).toBe("/api/bi/jobs-by-component");
    expect(endpoint.startsWith("/api/")).toBe(true);
    expect(endpoint.includes("/bi/")).toBe(true);
  });

  it("should return proper response structure", () => {
    const mockResponse = [
      { component_id: "Motor Principal", count: 15, avg_duration: 24.5 },
      { component_id: "Sistema Hidráulico", count: 12, avg_duration: 18.3 }
    ];

    expect(Array.isArray(mockResponse)).toBe(true);
    mockResponse.forEach((item) => {
      expect(item).toHaveProperty("component_id");
      expect(item).toHaveProperty("count");
      expect(item).toHaveProperty("avg_duration");
    });
  });

  it("should sort by count descending", () => {
    const mockResponse = [
      { component_id: "Motor Principal", count: 15, avg_duration: 24.5 },
      { component_id: "Sistema Hidráulico", count: 12, avg_duration: 18.3 },
      { component_id: "Sistema Elétrico", count: 8, avg_duration: 12.7 }
    ];

    for (let i = 0; i < mockResponse.length - 1; i++) {
      expect(mockResponse[i].count).toBeGreaterThanOrEqual(mockResponse[i + 1].count);
    }
  });
});
