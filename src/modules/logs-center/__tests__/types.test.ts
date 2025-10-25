/**
 * PATCH 94.0 - Logs Center Tests
 * Basic tests for the logs-center module
 */

import { describe, it, expect } from "vitest";
import type { LogEntry, LogLevel } from "../types";

describe("Logs Center Types", () => {
  it("should define correct log levels", () => {
    const levels: LogLevel[] = ["info", "warn", "error"];
    expect(levels).toHaveLength(3);
    expect(levels).toContain("info");
    expect(levels).toContain("warn");
    expect(levels).toContain("error");
  });

  it("should create a valid log entry", () => {
    const log: LogEntry = {
      id: "123",
      timestamp: new Date().toISOString(),
      level: "info",
      origin: "test-module",
      message: "Test message",
      details: { test: true },
      created_at: new Date().toISOString(),
    };

    expect(log.id).toBe("123");
    expect(log.level).toBe("info");
    expect(log.origin).toBe("test-module");
    expect(log.message).toBe("Test message");
    expect(log.details).toEqual({ test: true });
  });
});

describe("Log Entry Validation", () => {
  it("should accept valid log levels", () => {
    const validLevels: LogLevel[] = ["info", "warn", "error"];
    
    validLevels.forEach((level) => {
      const log: LogEntry = {
        id: "1",
        timestamp: new Date().toISOString(),
        level,
        origin: "test",
        message: "test",
        created_at: new Date().toISOString(),
      };
      expect(log.level).toBe(level);
    });
  });

  it("should handle log entry with optional fields", () => {
    const logWithoutDetails: LogEntry = {
      id: "1",
      timestamp: new Date().toISOString(),
      level: "info",
      origin: "test",
      message: "test",
      created_at: new Date().toISOString(),
    };

    expect(logWithoutDetails.details).toBeUndefined();
    expect(logWithoutDetails.user_id).toBeUndefined();
  });
});
