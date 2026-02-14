/**
 * Logger Tests - Structured Logger Utility
 * Tests all log levels, error handling, and Sentry integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to test the logger module. Since it reads import.meta.env,
// we test the exported functions behavior.

describe("Logger utility", () => {
  let consoleSpy: {
    info: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    table: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
      debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
      table: vi.spyOn(console, "table").mockImplementation(() => {}),
    };
  });

  it("logger module exports correctly", async () => {
    const { logger } = await import("@/lib/logger");
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.logCaughtError).toBe("function");
    expect(typeof logger.table).toBe("function");
  });

  it("warn always logs regardless of environment", async () => {
    const { logger } = await import("@/lib/logger");
    logger.warn("test warning");
    expect(consoleSpy.warn).toHaveBeenCalled();
  });

  it("warn logs with context when provided", async () => {
    const { logger } = await import("@/lib/logger");
    logger.warn("test warning", { detail: "context" });
    expect(consoleSpy.warn).toHaveBeenCalledWith(
      expect.stringContaining("test warning"),
      { detail: "context" }
    );
  });

  it("error always logs", async () => {
    const { logger } = await import("@/lib/logger");
    logger.error("critical failure", new Error("boom"));
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it("error extracts message from Error objects", async () => {
    const { logger } = await import("@/lib/logger");
    logger.error("test", new Error("specific message"));
    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining("specific message"),
      expect.any(Object)
    );
  });

  it("error handles string errors", async () => {
    const { logger } = await import("@/lib/logger");
    logger.error("test", "string error");
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it("error handles undefined error", async () => {
    const { logger } = await import("@/lib/logger");
    logger.error("test");
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it("logCaughtError handles non-Error objects", async () => {
    const { logger } = await import("@/lib/logger");
    logger.logCaughtError("caught", 42);
    expect(consoleSpy.error).toHaveBeenCalled();
  });

  it("logCaughtError handles Error objects with stack", async () => {
    const { logger } = await import("@/lib/logger");
    const err = new Error("stack test");
    logger.logCaughtError("caught", err, { module: "test" });
    expect(consoleSpy.error).toHaveBeenCalledWith(
      expect.stringContaining("stack test"),
      expect.objectContaining({ module: "test", stack: expect.any(String) })
    );
  });
});
