/**
 * AI Response Cache - Unit Tests
 * Comprehensive tests for cache functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { AIResponseCache } from "@/lib/ai/response-cache";

describe("AIResponseCache", () => {
  let cache: AIResponseCache<string>;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new AIResponseCache<string>({
      maxSize: 10,
      ttlMs: 60000, // 1 minute
      costAwareEviction: false,
    });
  });

  describe("basic operations", () => {
    it("should store and retrieve values", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");
    });

    it("should return null for non-existent keys", () => {
      expect(cache.get("nonexistent")).toBeNull();
    });

    it("should check if key exists", () => {
      cache.set("key1", "value1");
      expect(cache.has("key1")).toBe(true);
      expect(cache.has("nonexistent")).toBe(false);
    });

    it("should delete keys", () => {
      cache.set("key1", "value1");
      expect(cache.delete("key1")).toBe(true);
      expect(cache.get("key1")).toBeNull();
    });

    it("should clear all entries", () => {
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.clear();
      expect(cache.keys()).toHaveLength(0);
    });
  });

  describe("TTL expiration", () => {
    it("should expire entries after TTL", () => {
      cache.set("key1", "value1");
      expect(cache.get("key1")).toBe("value1");

      // Advance time past TTL
      vi.advanceTimersByTime(61000);
      expect(cache.get("key1")).toBeNull();
    });

    it("should not expire entries before TTL", () => {
      cache.set("key1", "value1");
      vi.advanceTimersByTime(30000); // Half of TTL
      expect(cache.get("key1")).toBe("value1");
    });
  });

  describe("LRU eviction", () => {
    it("should evict oldest entry when at capacity", () => {
      // Fill cache to capacity
      for (let i = 0; i < 10; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      // Add one more
      cache.set("key10", "value10");

      // First entry should be evicted
      expect(cache.get("key0")).toBeNull();
      expect(cache.get("key10")).toBe("value10");
    });
  });

  describe("statistics", () => {
    it("should track hits and misses", () => {
      cache.set("key1", "value1");

      // Hit
      cache.get("key1");
      // Miss
      cache.get("nonexistent");

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it("should track cost saved", () => {
      cache.set("key1", "value1", 0.01);
      cache.get("key1");
      cache.get("key1");

      const stats = cache.getStats();
      expect(stats.costSaved).toBe(0.02);
    });
  });

  describe("key generation", () => {
    it("should generate consistent keys for same input", () => {
      const input = { messages: [{ role: "user", content: "test" }] };
      const key1 = AIResponseCache.generateKey(input);
      const key2 = AIResponseCache.generateKey(input);

      expect(key1).toBe(key2);
    });

    it("should generate different keys for different inputs", () => {
      const key1 = AIResponseCache.generateKey("input1");
      const key2 = AIResponseCache.generateKey("input2");

      expect(key1).not.toBe(key2);
    });
  });

  describe("getOrCompute", () => {
    it("should return cached value on hit", async () => {
      cache.set("key1", "cached");

      const computeFn = vi.fn().mockResolvedValue("computed");
      const result = await cache.getOrCompute("key1", computeFn);

      expect(result.value).toBe("cached");
      expect(result.fromCache).toBe(true);
      expect(computeFn).not.toHaveBeenCalled();
    });

    it("should compute and cache on miss", async () => {
      const computeFn = vi.fn().mockResolvedValue("computed");
      const result = await cache.getOrCompute("key1", computeFn);

      expect(result.value).toBe("computed");
      expect(result.fromCache).toBe(false);
      expect(computeFn).toHaveBeenCalledOnce();

      // Should be cached now
      const result2 = await cache.getOrCompute("key1", computeFn);
      expect(result2.fromCache).toBe(true);
      expect(computeFn).toHaveBeenCalledOnce(); // Not called again
    });
  });

  describe("warm up", () => {
    it("should pre-populate cache with entries", () => {
      cache.warmUp([
        { key: "key1", value: "value1", cost: 0.01 },
        { key: "key2", value: "value2", cost: 0.02 },
      ]);

      expect(cache.get("key1")).toBe("value1");
      expect(cache.get("key2")).toBe("value2");
      expect(cache.keys()).toHaveLength(2);
    });
  });
});

describe("Cost-Aware Eviction", () => {
  let cache: AIResponseCache<string>;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new AIResponseCache<string>({
      maxSize: 3,
      ttlMs: 60000,
      costAwareEviction: true,
    });
  });

  it("should prefer evicting low-value entries", () => {
    cache.set("expensive", "high-value", 1.0);
    cache.set("cheap1", "low-value1", 0.001);
    cache.set("cheap2", "low-value2", 0.001);

    // Access expensive entry to increase its score
    cache.get("expensive");
    cache.get("expensive");

    // Add new entry, should evict one of the cheap ones
    cache.set("new", "new-value", 0.5);

    expect(cache.get("expensive")).toBe("high-value");
    expect(cache.get("new")).toBe("new-value");
  });
});
