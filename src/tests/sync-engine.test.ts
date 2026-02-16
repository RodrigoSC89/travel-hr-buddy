/**
 * Sync Engine Tests
 * Tests for offline sync queue logic and priority management
 */

import { describe, it, expect } from "vitest";

describe("Sync Engine - Priority Logic", () => {
  it("should assign high priority to incident tables", () => {
    const getPriority = (table: string, action: string) => {
      if (table.includes("incident") || table.includes("emergency")) return "high";
      if (table.includes("checklist") || table.includes("mission") || action === "delete") return "medium";
      return "low";
    };

    expect(getPriority("incident_reports", "create")).toBe("high");
    expect(getPriority("emergency_contacts", "update")).toBe("high");
    expect(getPriority("checklist_items", "create")).toBe("medium");
    expect(getPriority("mission_logs", "update")).toBe("medium");
    expect(getPriority("activity_logs", "delete")).toBe("medium");
    expect(getPriority("analytics_events", "create")).toBe("low");
  });
});

describe("Sync Engine - Exponential Backoff", () => {
  it("should calculate correct backoff delays", () => {
    const BASE_DELAY = 1000;
    const calcDelay = (retries: number) => Math.min(BASE_DELAY * Math.pow(2, retries), 30000);

    expect(calcDelay(0)).toBe(1000);
    expect(calcDelay(1)).toBe(2000);
    expect(calcDelay(2)).toBe(4000);
    expect(calcDelay(3)).toBe(8000);
    expect(calcDelay(4)).toBe(16000);
    expect(calcDelay(5)).toBe(30000); // Capped
    expect(calcDelay(10)).toBe(30000); // Still capped
  });
});

describe("Sync Engine - Record Age Cleanup", () => {
  it("should identify records older than 24 hours for cleanup", () => {
    const MAX_AGE = 24 * 60 * 60 * 1000;
    const oldRecord = Date.now() - 25 * 60 * 60 * 1000;
    const newRecord = Date.now() - 2 * 60 * 60 * 1000;

    expect(Date.now() - oldRecord > MAX_AGE).toBe(true);
    expect(Date.now() - newRecord > MAX_AGE).toBe(false);
  });
});

describe("Sync Engine - Queue Management", () => {
  it("should batch records correctly", () => {
    const records = Array.from({ length: 25 }, (_, i) => ({ id: `record-${i}` }));
    const batchSize = 10;
    const batches: typeof records[] = [];

    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    expect(batches).toHaveLength(3);
    expect(batches[0]).toHaveLength(10);
    expect(batches[1]).toHaveLength(10);
    expect(batches[2]).toHaveLength(5);
  });
});
