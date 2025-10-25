import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@/lib/logger";

describe("Logger Service", () => {
  let consoleInfoSpy: any;
  let consoleDebugSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("logger.info", () => {
    it("should log info messages with emoji prefix", () => {
      logger.info("Test info message");
      expect(consoleInfoSpy).toHaveBeenCalledWith("ℹ️ Test info message");
    });

    it("should log info messages with context", () => {
      const context = { userId: "123", action: "test" };
      logger.info("Test with context", context);
      expect(consoleInfoSpy).toHaveBeenCalledWith("ℹ️ Test with context", context);
    });
  });

  describe("logger.debug", () => {
    it("should log debug messages with emoji prefix", () => {
      logger.debug("Test debug message");
      expect(consoleDebugSpy).toHaveBeenCalledWith("🐛 Test debug message");
    });

    it("should log debug messages with context", () => {
      const context = { data: "test" };
      logger.debug("Debug with context", context);
      expect(consoleDebugSpy).toHaveBeenCalledWith("🐛 Debug with context", context);
    });
  });

  describe("logger.warn", () => {
    it("should log warning messages with emoji prefix", () => {
      logger.warn("Test warning message");
      expect(consoleWarnSpy).toHaveBeenCalledWith("⚠️ Test warning message");
    });

    it("should log warning messages with context", () => {
      const context = { level: "medium" };
      logger.warn("Warning with context", context);
      expect(consoleWarnSpy).toHaveBeenCalledWith("⚠️ Warning with context", context);
    });
  });

  describe("logger.error", () => {
    it("should log error messages with emoji prefix", () => {
      logger.error("Test error message");
      expect(consoleErrorSpy).toHaveBeenCalledWith("❌ Test error message");
    });

    it("should log error messages with Error object", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("❌ Error occurred"),
        expect.objectContaining({ stack: expect.any(String) })
      );
    });

    it("should log error messages with context", () => {
      const error = new Error("Test error");
      const context = { component: "TestComponent" };
      logger.error("Error with context", error, context);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("❌ Error with context"),
        expect.objectContaining({
          component: "TestComponent",
          stack: expect.any(String)
        })
      );
    });

    it("should handle string errors", () => {
      logger.error("Error message", "string error");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Error message: string error",
        {}
      );
    });
  });

  describe("logger.logCaughtError", () => {
    it("should log caught errors with proper formatting", () => {
      const error = new Error("Caught error");
      logger.logCaughtError("Caught exception", error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("❌ Caught exception"),
        expect.objectContaining({ stack: expect.any(String) })
      );
    });

    it("should handle non-Error objects", () => {
      logger.logCaughtError("Caught error", "string error");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ Caught error: string error",
        {}
      );
    });

    it("should include context in caught errors", () => {
      const error = new Error("Caught error");
      const context = { source: "api" };
      logger.logCaughtError("API error", error, context);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("❌ API error"),
        expect.objectContaining({
          source: "api",
          stack: expect.any(String)
        })
      );
    });
  });

  describe("logger.table", () => {
    it("should log table data in development", () => {
      const tableData = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" }
      ];
      const consoleTableSpy = vi.spyOn(console, "table").mockImplementation(() => {});
      
      logger.table(tableData);
      
      // In test environment (development), table should be called
      if (import.meta.env.DEV) {
        expect(consoleTableSpy).toHaveBeenCalledWith(tableData);
      }
      
      consoleTableSpy.mockRestore();
    });
  });
});
