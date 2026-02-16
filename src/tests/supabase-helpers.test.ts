/**
 * Supabase Helpers Test Suite
 * Tests for all utility functions in supabase-helpers.ts
 */
import { describe, it, expect, vi } from "vitest";
import {
  withTimeout,
  isRecord,
  jsonToRecord,
  jsonToArray,
  toSupabaseJson,
  executeQuery,
  isValidModuleStatus,
  isValidContentType,
  isValidDifficulty,
} from "@/utils/supabase-helpers";

describe("withTimeout", () => {
  it("resolves when promise finishes before timeout", async () => {
    const result = await withTimeout(Promise.resolve("ok"), 1000);
    expect(result).toBe("ok");
  });

  it("rejects when promise exceeds timeout", async () => {
    const slow = new Promise((resolve) => setTimeout(resolve, 5000));
    await expect(withTimeout(slow, 50, "Too slow")).rejects.toThrow("Too slow");
  });

  it("uses default timeout and error message", async () => {
    const slow = new Promise((resolve) => setTimeout(resolve, 10000));
    await expect(withTimeout(slow, 50)).rejects.toThrow("Operação excedeu o tempo limite");
  });
});

describe("isRecord", () => {
  it("returns true for plain objects", () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it("returns false for arrays", () => {
    expect(isRecord([])).toBe(false);
    expect(isRecord([1, 2, 3])).toBe(false);
  });

  it("returns false for null and primitives", () => {
    expect(isRecord(null)).toBe(false);
    expect(isRecord(undefined)).toBe(false);
    expect(isRecord("string")).toBe(false);
    expect(isRecord(42)).toBe(false);
    expect(isRecord(true)).toBe(false);
  });
});

describe("jsonToRecord", () => {
  it("returns the object if it is a record", () => {
    const obj = { key: "value" };
    expect(jsonToRecord(obj)).toEqual(obj);
  });

  it("returns empty object for non-record values", () => {
    expect(jsonToRecord(null)).toEqual({});
    expect(jsonToRecord([])).toEqual({});
    expect(jsonToRecord("string")).toEqual({});
    expect(jsonToRecord(42)).toEqual({});
  });
});

describe("jsonToArray", () => {
  it("returns the array if input is an array", () => {
    expect(jsonToArray([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("returns empty array for non-array values", () => {
    expect(jsonToArray(null)).toEqual([]);
    expect(jsonToArray({})).toEqual([]);
    expect(jsonToArray("string")).toEqual([]);
    expect(jsonToArray(42)).toEqual([]);
  });
});

describe("toSupabaseJson", () => {
  it("serializes and deserializes data correctly", () => {
    const data = { name: "test", count: 42, nested: { a: true } };
    expect(toSupabaseJson(data)).toEqual(data);
  });

  it("strips undefined values", () => {
    const data = { a: 1, b: undefined };
    expect(toSupabaseJson(data)).toEqual({ a: 1 });
  });

  it("handles arrays", () => {
    expect(toSupabaseJson([1, 2, 3])).toEqual([1, 2, 3]);
  });
});

describe("executeQuery", () => {
  it("returns data on success", async () => {
    const queryFn = vi.fn().mockResolvedValue({ data: [1, 2], error: null });
    const result = await executeQuery(queryFn, { timeout: 5000 });
    expect(result.data).toEqual([1, 2]);
    expect(result.error).toBeNull();
  });

  it("returns fallback on error", async () => {
    const queryFn = vi.fn().mockRejectedValue(new Error("fail"));
    const result = await executeQuery(queryFn, { fallback: [], timeout: 5000 });
    expect(result.data).toEqual([]);
    expect(result.error).toBeInstanceOf(Error);
  });

  it("uses default options", async () => {
    const queryFn = vi.fn().mockResolvedValue({ data: "ok", error: null });
    const result = await executeQuery(queryFn);
    expect(result.data).toBe("ok");
  });
});

describe("Validation helpers", () => {
  describe("isValidModuleStatus", () => {
    it("accepts valid statuses", () => {
      expect(isValidModuleStatus("functional")).toBe(true);
      expect(isValidModuleStatus("pending")).toBe(true);
      expect(isValidModuleStatus("disabled")).toBe(true);
    });

    it("rejects invalid statuses", () => {
      expect(isValidModuleStatus("active")).toBe(false);
      expect(isValidModuleStatus("")).toBe(false);
    });
  });

  describe("isValidContentType", () => {
    it("accepts valid types", () => {
      expect(isValidContentType("tutorial")).toBe(true);
      expect(isValidContentType("faq")).toBe(true);
      expect(isValidContentType("guide")).toBe(true);
      expect(isValidContentType("video")).toBe(true);
    });

    it("rejects invalid types", () => {
      expect(isValidContentType("blog")).toBe(false);
    });
  });

  describe("isValidDifficulty", () => {
    it("accepts valid difficulties", () => {
      expect(isValidDifficulty("beginner")).toBe(true);
      expect(isValidDifficulty("intermediate")).toBe(true);
      expect(isValidDifficulty("advanced")).toBe(true);
    });

    it("rejects invalid difficulties", () => {
      expect(isValidDifficulty("expert")).toBe(false);
    });
  });
});
