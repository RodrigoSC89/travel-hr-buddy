/**
 * Tests for jobsForecastMock.ts
 * Validates the structure and usability of mock job forecast data
 */

import { describe, it, expect } from "vitest";
import { mockJobs } from "../../../lib/dev/mocks/jobsForecastMock";

describe("jobsForecastMock", () => {
  it("should export mockJobs array", () => {
    expect(mockJobs).toBeDefined();
    expect(Array.isArray(mockJobs)).toBe(true);
  });

  it("should have the correct number of mock jobs", () => {
    expect(mockJobs).toHaveLength(14);
  });

  it("should have valid structure for each job", () => {
    mockJobs.forEach((job) => {
      expect(job).toHaveProperty("component_id");
      expect(job).toHaveProperty("completed_at");
      expect(typeof job.component_id).toBe("string");
      expect(typeof job.completed_at).toBe("string");
    });
  });

  it("should have valid ISO date strings", () => {
    mockJobs.forEach((job) => {
      const date = new Date(job.completed_at);
      expect(date.toString()).not.toBe("Invalid Date");
      expect(job.completed_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it("should contain all expected components", () => {
    const componentIds = [...new Set(mockJobs.map((job) => job.component_id))];
    expect(componentIds).toContain("GEN-BB");
    expect(componentIds).toContain("HID-P-01");
    expect(componentIds).toContain("RAD-PR-02");
    expect(componentIds).toContain("DP-SYS-01");
    expect(componentIds).toHaveLength(4);
  });

  it("should have correct number of jobs per component", () => {
    const jobsByComponent = mockJobs.reduce(
      (acc, job) => {
        acc[job.component_id] = (acc[job.component_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    expect(jobsByComponent["GEN-BB"]).toBe(5);
    expect(jobsByComponent["HID-P-01"]).toBe(3);
    expect(jobsByComponent["RAD-PR-02"]).toBe(2);
    expect(jobsByComponent["DP-SYS-01"]).toBe(4);
  });

  it("should have dates in 2025", () => {
    mockJobs.forEach((job) => {
      expect(job.completed_at.startsWith("2025-")).toBe(true);
    });
  });

  it("should have dates spanning from April to August", () => {
    const months = [
      ...new Set(mockJobs.map((job) => job.completed_at.substring(0, 7))),
    ].sort();

    expect(months).toContain("2025-04");
    expect(months).toContain("2025-05");
    expect(months).toContain("2025-06");
    expect(months).toContain("2025-07");
    expect(months).toContain("2025-08");
  });

  it("should be sortable by date", () => {
    const sorted = [...mockJobs].sort((a, b) =>
      a.completed_at.localeCompare(b.completed_at)
    );

    expect(sorted[0].completed_at).toBe("2025-04-12");
    expect(sorted[sorted.length - 1].completed_at).toBe("2025-08-28");
  });

  it("should be filterable by component", () => {
    const genBBJobs = mockJobs.filter((job) => job.component_id === "GEN-BB");
    expect(genBBJobs).toHaveLength(5);

    const hidJobs = mockJobs.filter((job) => job.component_id === "HID-P-01");
    expect(hidJobs).toHaveLength(3);
  });

  it("should be groupable by month", () => {
    const jobsByMonth = mockJobs.reduce(
      (acc, job) => {
        const month = job.completed_at.substring(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    expect(jobsByMonth["2025-04"]).toBe(1);
    expect(jobsByMonth["2025-05"]).toBe(2);
    expect(jobsByMonth["2025-06"]).toBe(2);
    expect(jobsByMonth["2025-07"]).toBe(4);
    expect(jobsByMonth["2025-08"]).toBe(5);
  });

  it("should be transformable to trend format", () => {
    const trendData = mockJobs.reduce(
      (acc, job) => {
        const month = job.completed_at.substring(0, 7);
        const existing = acc.find((item) => item.date === month);
        if (existing) {
          existing.jobs++;
        } else {
          acc.push({ date: month, jobs: 1 });
        }
        return acc;
      },
      [] as Array<{ date: string; jobs: number }>
    );

    expect(trendData.length).toBeGreaterThan(0);
    expect(trendData[0]).toHaveProperty("date");
    expect(trendData[0]).toHaveProperty("jobs");
    expect(typeof trendData[0].date).toBe("string");
    expect(typeof trendData[0].jobs).toBe("number");
  });

  it("should be compatible with JobsForecastReport component format", () => {
    // Transform to the format expected by JobsForecastReport
    const trendData = Object.entries(
      mockJobs.reduce(
        (acc, job) => {
          const month = job.completed_at.substring(0, 7);
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    ).map(([date, jobs]) => ({ date, jobs }));

    // Verify format
    trendData.forEach((item) => {
      expect(item).toHaveProperty("date");
      expect(item).toHaveProperty("jobs");
      expect(typeof item.date).toBe("string");
      expect(typeof item.jobs).toBe("number");
      expect(item.jobs).toBeGreaterThan(0);
    });
  });

  it("should provide realistic data distribution", () => {
    // Check that jobs are distributed across different months
    const monthsWithJobs = [
      ...new Set(mockJobs.map((job) => job.completed_at.substring(0, 7))),
    ];
    expect(monthsWithJobs.length).toBeGreaterThanOrEqual(5);

    // Check that no single component dominates
    const jobsByComponent = mockJobs.reduce(
      (acc, job) => {
        acc[job.component_id] = (acc[job.component_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const maxJobsPerComponent = Math.max(...Object.values(jobsByComponent));
    const totalJobs = mockJobs.length;

    // No component should have more than 50% of all jobs
    expect(maxJobsPerComponent / totalJobs).toBeLessThan(0.5);
  });
});
