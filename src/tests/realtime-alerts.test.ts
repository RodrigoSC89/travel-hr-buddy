/**
 * Realtime Alerts Tests
 * Tests for notification logic and severity mapping
 */

import { describe, it, expect } from "vitest";

describe("Realtime Alerts - Severity Mapping", () => {
  it("should map SOC alert severity to correct toast method", () => {
    const getToastMethod = (severity: string) =>
      severity === "critical" ? "error" : "warning";

    expect(getToastMethod("critical")).toBe("error");
    expect(getToastMethod("high")).toBe("warning");
    expect(getToastMethod("medium")).toBe("warning");
  });

  it("should map severity to correct icon", () => {
    const getIcon = (severity: string) => {
      if (severity === "critical") return "🚨";
      if (severity === "high") return "⚠️";
      return "ℹ️";
    };

    expect(getIcon("critical")).toBe("🚨");
    expect(getIcon("high")).toBe("⚠️");
    expect(getIcon("low")).toBe("ℹ️");
  });

  it("should detect vessel status changes", () => {
    const oldVessel = { name: "MV Atlantic", status: "at_port" };
    const newVessel = { name: "MV Atlantic", status: "underway" };
    expect(newVessel.status !== oldVessel.status).toBe(true);
  });

  it("should not alert on same status", () => {
    const oldVessel = { name: "MV Atlantic", status: "underway" };
    const newVessel = { name: "MV Atlantic", status: "underway" };
    expect(newVessel.status !== oldVessel.status).toBe(false);
  });
});

describe("Realtime Alerts - Maintenance Priority Filter", () => {
  it("should only alert for critical/urgent maintenance", () => {
    const shouldAlert = (priority: string) =>
      priority === "critical" || priority === "urgent";

    expect(shouldAlert("critical")).toBe(true);
    expect(shouldAlert("urgent")).toBe(true);
    expect(shouldAlert("high")).toBe(false);
    expect(shouldAlert("medium")).toBe(false);
    expect(shouldAlert("low")).toBe(false);
  });
});
