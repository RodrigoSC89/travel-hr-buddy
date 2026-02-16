import { describe, it, expect } from "vitest";
import { checkMLCViolations } from "@/lib/mlc/violations-checker";

describe("MLC Violations Checker", () => {
  it("passes compliant single-day record", () => {
    const result = checkMLCViolations([
      { date: "2026-01-01", work_hours: 10, rest_hours: 14 },
    ]);
    expect(result.isCompliant).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.totalWorkHours).toBe(10);
    expect(result.totalRestHours).toBe(14);
  });

  it("flags >14h work/day as MAX_DAILY_WORK", () => {
    const result = checkMLCViolations([
      { date: "2026-01-01", work_hours: 15, rest_hours: 9 },
    ]);
    expect(result.isCompliant).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "MAX_DAILY_WORK", severity: "major" }),
      ])
    );
  });

  it("flags >16h work/day as critical", () => {
    const result = checkMLCViolations([
      { date: "2026-01-01", work_hours: 17, rest_hours: 7 },
    ]);
    expect(result.violations.find((v) => v.type === "MAX_DAILY_WORK")?.severity).toBe("critical");
  });

  it("flags <10h rest/day as MIN_DAILY_REST", () => {
    const result = checkMLCViolations([
      { date: "2026-01-01", work_hours: 12, rest_hours: 8 },
    ]);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "MIN_DAILY_REST", severity: "major" }),
      ])
    );
  });

  it("flags <8h rest as critical severity", () => {
    const result = checkMLCViolations([
      { date: "2026-01-01", work_hours: 14, rest_hours: 7 },
    ]);
    expect(result.violations.find((v) => v.type === "MIN_DAILY_REST")?.severity).toBe("critical");
  });

  it("flags >72h work/week", () => {
    const records = Array.from({ length: 7 }, (_, i) => ({
      date: `2026-01-0${i + 1}`,
      work_hours: 11,
      rest_hours: 13,
    }));
    const result = checkMLCViolations(records);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "MAX_WEEKLY_WORK", limit_value: 72 }),
      ])
    );
  });

  it("flags <77h rest/week", () => {
    const records = Array.from({ length: 7 }, (_, i) => ({
      date: `2026-01-0${i + 1}`,
      work_hours: 14,
      rest_hours: 10,
    }));
    const result = checkMLCViolations(records);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "MIN_WEEKLY_REST", limit_value: 77 }),
      ])
    );
  });

  it("skips weekly checks with fewer than 7 records", () => {
    const records = Array.from({ length: 5 }, (_, i) => ({
      date: `2026-01-0${i + 1}`,
      work_hours: 11,
      rest_hours: 13,
    }));
    const result = checkMLCViolations(records);
    expect(result.violations.filter((v) => v.type.includes("WEEKLY"))).toHaveLength(0);
  });

  it("returns correct averages", () => {
    const result = checkMLCViolations([
      { date: "2026-01-01", work_hours: 8, rest_hours: 16 },
      { date: "2026-01-02", work_hours: 12, rest_hours: 12 },
    ]);
    expect(result.averageWorkPerDay).toBe(10);
    expect(result.totalWorkHours).toBe(20);
  });

  it("handles empty records", () => {
    const result = checkMLCViolations([]);
    expect(result.isCompliant).toBe(true);
    expect(result.averageWorkPerDay).toBe(0);
  });
});
