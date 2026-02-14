/**
 * Tests for OperationalDatabase (IndexedDB via Dexie)
 */
import { describe, it, expect, beforeEach } from "vitest";
import { operationalDb } from "@/lib/storage/operational-db";

describe("OperationalDatabase", () => {
  beforeEach(async () => {
    // Clear cache before each test
    try {
      await operationalDb.clearExpiredCache();
    } catch {
      // IndexedDB may not work in jsdom, that's OK
    }
  });

  it("exports a singleton instance with correct API", () => {
    expect(operationalDb).toBeDefined();
    expect(typeof operationalDb.getCache).toBe("function");
    expect(typeof operationalDb.setCache).toBe("function");
    expect(typeof operationalDb.clearExpiredCache).toBe("function");
  });

  it("has correct table definitions", () => {
    expect(operationalDb).toHaveProperty("vesselContexts");
    expect(operationalDb).toHaveProperty("offlineCache");
  });
});
