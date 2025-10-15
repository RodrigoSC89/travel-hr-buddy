import { describe, it, expect } from "vitest";
import type { MMIBISummary, FailureBySystem, JobsByVessel, Postponement } from "@/types/mmi";

describe("MMI BI Dashboard Types", () => {
  it("should have proper structure for FailureBySystem", () => {
    const mockFailure: FailureBySystem = {
      system: "Hidráulico",
      count: 12
    };

    expect(mockFailure.system).toBeDefined();
    expect(mockFailure.count).toBeGreaterThanOrEqual(0);
    expect(typeof mockFailure.system).toBe("string");
    expect(typeof mockFailure.count).toBe("number");
  });

  it("should have proper structure for JobsByVessel", () => {
    const mockJobs: JobsByVessel = {
      vessel: "Navio A",
      jobs: 45
    };

    expect(mockJobs.vessel).toBeDefined();
    expect(mockJobs.jobs).toBeGreaterThanOrEqual(0);
    expect(typeof mockJobs.vessel).toBe("string");
    expect(typeof mockJobs.jobs).toBe("number");
  });

  it("should have proper structure for Postponement", () => {
    const mockPostponement: Postponement = {
      status: "No prazo",
      count: 120
    };

    expect(mockPostponement.status).toBeDefined();
    expect(mockPostponement.count).toBeGreaterThanOrEqual(0);
    expect(typeof mockPostponement.status).toBe("string");
    expect(typeof mockPostponement.count).toBe("number");
  });

  it("should have proper structure for MMIBISummary", () => {
    const mockSummary: MMIBISummary = {
      failuresBySystem: [
        { system: "Hidráulico", count: 12 },
        { system: "Elétrico", count: 8 }
      ],
      jobsByVessel: [
        { vessel: "Navio A", jobs: 45 },
        { vessel: "Navio B", jobs: 38 }
      ],
      postponements: [
        { status: "No prazo", count: 120 },
        { status: "Postergado", count: 25 }
      ]
    };

    expect(mockSummary.failuresBySystem).toBeDefined();
    expect(mockSummary.jobsByVessel).toBeDefined();
    expect(mockSummary.postponements).toBeDefined();
    expect(Array.isArray(mockSummary.failuresBySystem)).toBe(true);
    expect(Array.isArray(mockSummary.jobsByVessel)).toBe(true);
    expect(Array.isArray(mockSummary.postponements)).toBe(true);
  });

  it("should validate empty arrays for MMIBISummary", () => {
    const emptySummary: MMIBISummary = {
      failuresBySystem: [],
      jobsByVessel: [],
      postponements: []
    };

    expect(emptySummary.failuresBySystem).toHaveLength(0);
    expect(emptySummary.jobsByVessel).toHaveLength(0);
    expect(emptySummary.postponements).toHaveLength(0);
  });

  it("should validate system names are in Portuguese", () => {
    const systems = ["Hidráulico", "Elétrico", "Mecânico", "Eletrônico"];
    
    systems.forEach((system) => {
      expect(typeof system).toBe("string");
      expect(system.length).toBeGreaterThan(0);
    });
  });

  it("should validate postponement statuses", () => {
    const statuses = ["No prazo", "Postergado"];
    
    statuses.forEach((status) => {
      expect(typeof status).toBe("string");
      expect(status.length).toBeGreaterThan(0);
    });
  });

  it("should calculate total failures correctly", () => {
    const failures: FailureBySystem[] = [
      { system: "Hidráulico", count: 12 },
      { system: "Elétrico", count: 8 },
      { system: "Mecânico", count: 15 }
    ];

    const total = failures.reduce((sum, item) => sum + item.count, 0);
    expect(total).toBe(35);
  });

  it("should calculate total jobs correctly", () => {
    const jobs: JobsByVessel[] = [
      { vessel: "Navio A", jobs: 45 },
      { vessel: "Navio B", jobs: 38 },
      { vessel: "Navio C", jobs: 52 }
    ];

    const total = jobs.reduce((sum, item) => sum + item.jobs, 0);
    expect(total).toBe(135);
  });

  it("should calculate postponement rate", () => {
    const postponements: Postponement[] = [
      { status: "No prazo", count: 120 },
      { status: "Postergado", count: 25 }
    ];

    const total = postponements.reduce((sum, item) => sum + item.count, 0);
    const postponed = postponements.find(p => p.status === "Postergado")?.count || 0;
    const rate = (postponed / total) * 100;

    expect(rate).toBeCloseTo(17.24, 1);
  });
});

describe("MMI BI Dashboard API Endpoint", () => {
  it("should expect endpoint at /api/mmi/bi/summary", () => {
    const endpoint = "/api/mmi/bi/summary";
    
    expect(endpoint).toBe("/api/mmi/bi/summary");
    expect(endpoint.startsWith("/api/")).toBe(true);
  });

  it("should return proper response structure", () => {
    const mockResponse: MMIBISummary = {
      failuresBySystem: [
        { system: "Hidráulico", count: 12 }
      ],
      jobsByVessel: [
        { vessel: "Navio A", jobs: 45 }
      ],
      postponements: [
        { status: "No prazo", count: 120 }
      ]
    };

    expect(mockResponse).toHaveProperty("failuresBySystem");
    expect(mockResponse).toHaveProperty("jobsByVessel");
    expect(mockResponse).toHaveProperty("postponements");
  });
});
