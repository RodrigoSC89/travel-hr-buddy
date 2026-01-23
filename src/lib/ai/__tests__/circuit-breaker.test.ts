/**
 * Circuit Breaker - Unit Tests
 * Tests for AI service resilience
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CircuitBreaker, getCircuitHealth, resetAllCircuits } from "@/lib/ai/circuit-breaker";

describe("CircuitBreaker", () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    vi.useFakeTimers();
    breaker = new CircuitBreaker({
      name: "test-breaker",
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 30000,
    });
  });

  describe("initial state", () => {
    it("should start in CLOSED state", () => {
      const stats = breaker.getStats();
      expect(stats.state).toBe("CLOSED");
      expect(stats.failures).toBe(0);
      expect(stats.successes).toBe(0);
    });
  });

  describe("success handling", () => {
    it("should execute function successfully", async () => {
      const fn = vi.fn().mockResolvedValue("result");
      const result = await breaker.execute(fn);

      expect(result).toBe("result");
      expect(fn).toHaveBeenCalledOnce();
    });

    it("should increment total requests on success", async () => {
      const fn = vi.fn().mockResolvedValue("result");
      await breaker.execute(fn);

      const stats = breaker.getStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.lastSuccess).not.toBeNull();
    });
  });

  describe("failure handling", () => {
    it("should throw error on failure", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("fail"));

      await expect(breaker.execute(fn)).rejects.toThrow("fail");
    });

    it("should track failures", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("fail"));

      try {
        await breaker.execute(fn);
      } catch {
        // Expected
      }

      const stats = breaker.getStats();
      expect(stats.failures).toBe(1);
      expect(stats.totalFailures).toBe(1);
    });

    it("should open circuit after threshold failures", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("fail"));

      // Trigger 3 failures (threshold)
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(fn);
        } catch {
          // Expected
        }
      }

      const stats = breaker.getStats();
      expect(stats.state).toBe("OPEN");
    });
  });

  describe("OPEN state", () => {
    it("should reject requests immediately when OPEN", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("fail"));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(fn);
        } catch {
          // Expected
        }
      }

      // Next request should be rejected immediately
      await expect(breaker.execute(fn)).rejects.toThrow("Circuit breaker test-breaker is OPEN");
      expect(fn).toHaveBeenCalledTimes(3); // Not called again
    });

    it("should transition to HALF_OPEN after timeout", async () => {
      const failFn = vi.fn().mockRejectedValue(new Error("fail"));
      const successFn = vi.fn().mockResolvedValue("recovered");

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failFn);
        } catch {
          // Expected
        }
      }

      // Advance time past timeout
      vi.advanceTimersByTime(31000);

      // Next request should go through (HALF_OPEN state)
      const result = await breaker.execute(successFn);
      expect(result).toBe("recovered");

      const stats = breaker.getStats();
      expect(stats.state).toBe("HALF_OPEN");
    });
  });

  describe("HALF_OPEN state", () => {
    it("should close circuit after success threshold", async () => {
      const failFn = vi.fn().mockRejectedValue(new Error("fail"));
      const successFn = vi.fn().mockResolvedValue("success");

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failFn);
        } catch {
          // Expected
        }
      }

      // Wait for timeout
      vi.advanceTimersByTime(31000);

      // 2 successful requests (successThreshold = 2)
      await breaker.execute(successFn);
      await breaker.execute(successFn);

      const stats = breaker.getStats();
      expect(stats.state).toBe("CLOSED");
    });
  });

  describe("reset", () => {
    it("should reset to initial state", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("fail"));

      // Trigger failures
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(fn);
        } catch {
          // Expected
        }
      }

      breaker.reset();

      const stats = breaker.getStats();
      expect(stats.state).toBe("CLOSED");
      expect(stats.failures).toBe(0);
      expect(stats.successes).toBe(0);
    });
  });
});

describe("Circuit Health Management", () => {
  beforeEach(() => {
    resetAllCircuits();
  });

  it("should track health of multiple circuits", () => {
    const health = getCircuitHealth();
    expect(typeof health).toBe("object");
  });

  it("should reset all circuits", () => {
    resetAllCircuits();
    const health = getCircuitHealth();
    
    for (const stats of Object.values(health)) {
      expect(stats.state).toBe("CLOSED");
    }
  });
});
