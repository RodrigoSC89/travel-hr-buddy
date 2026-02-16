/**
 * Error Handling Test Suite
 * Tests for unified error handling utilities
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  APIError,
  ValidationError,
  NetworkError,
  AuthError,
  getErrorMessage,
  isRetryableError,
  normalizeError,
  logError,
  errorTracker,
} from "@/lib/unified";

describe("Custom Error Types", () => {
  describe("APIError", () => {
    it("creates error with status code", () => {
      const error = new APIError("Not Found", 404);
      expect(error.message).toBe("Not Found");
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe("APIError");
    });
  });

  describe("ValidationError", () => {
    it("creates validation error with field info", () => {
      const error = new ValidationError("Invalid email", "email");
      expect(error.message).toBe("Invalid email");
      expect(error.field).toBe("email");
    });
  });

  describe("NetworkError", () => {
    it("creates network error", () => {
      const error = new NetworkError("Connection lost");
      expect(error.message).toBe("Connection lost");
      expect(error.name).toBe("NetworkError");
    });
  });

  describe("AuthError", () => {
    it("creates auth error", () => {
      const error = new AuthError("Unauthorized", "UNAUTHENTICATED");
      expect(error.message).toBe("Unauthorized");
      expect(error.name).toBe("AuthError");
    });
  });
});

describe("getErrorMessage", () => {
  it("extracts message from Error objects", () => {
    expect(getErrorMessage(new Error("test error"))).toBe("test error");
  });

  it("handles string errors", () => {
    expect(getErrorMessage("string error")).toBe("string error");
  });

  it("handles null/undefined", () => {
    const msg = getErrorMessage(null);
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });

  it("handles objects with message property", () => {
    const msg = getErrorMessage({ message: "obj error" });
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(0);
  });
});

describe("isRetryableError", () => {
  it("considers network errors retryable", () => {
    expect(isRetryableError(new NetworkError("timeout"))).toBe(true);
  });

  it("considers 5xx errors retryable", () => {
    expect(isRetryableError(new APIError("Server Error", 500))).toBe(true);
    expect(isRetryableError(new APIError("Bad Gateway", 502))).toBe(true);
  });

  it("considers 4xx errors non-retryable", () => {
    expect(isRetryableError(new APIError("Not Found", 404))).toBe(false);
    expect(isRetryableError(new APIError("Forbidden", 403))).toBe(false);
  });
});

describe("normalizeError", () => {
  it("normalizes Error objects", () => {
    const result = normalizeError(new Error("test"));
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("test");
  });

  it("normalizes string errors", () => {
    const result = normalizeError("string error");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("string error");
  });

  it("normalizes unknown types", () => {
    const result = normalizeError(42);
    expect(result).toBeInstanceOf(Error);
  });
});

describe("errorTracker", () => {
  it("exists and has track method", () => {
    expect(errorTracker).toBeDefined();
    expect(typeof errorTracker.track).toBe("function");
  });
});

describe("logError", () => {
  it("does not throw", () => {
    expect(() => logError(new Error("test"), { module: "TestContext" })).not.toThrow();
  });
});
