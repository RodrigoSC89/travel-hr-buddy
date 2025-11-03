/**
 * PATCH 607: Unit Tests for Loop Prevention
 * 
 * Tests to validate proper cleanup of intervals and timeouts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Preview Loop Guard Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  it('should cleanup setInterval on unmount', () => {
    const callback = vi.fn();
    let intervalId: NodeJS.Timeout | null = null;

    // Simulate useEffect with interval
    const setupInterval = () => {
      intervalId = setInterval(callback, 1000);
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    };

    // Setup
    const cleanup = setupInterval();

    // Fast-forward time
    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(3);

    // Cleanup
    cleanup();

    // Advance time more - callback should not be called
    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(3); // Still 3, not 6
  });

  it('should cleanup setTimeout on unmount', () => {
    const callback = vi.fn();
    let timeoutId: NodeJS.Timeout | null = null;

    // Simulate useEffect with timeout
    const setupTimeout = () => {
      timeoutId = setTimeout(callback, 1000);
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    };

    // Setup
    const cleanup = setupTimeout();

    // Cleanup before timeout fires
    cleanup();

    // Fast-forward time
    vi.advanceTimersByTime(2000);
    
    // Callback should not have been called
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle multiple intervals with proper cleanup', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const intervals: NodeJS.Timeout[] = [];

    // Setup multiple intervals
    const setupMultipleIntervals = () => {
      intervals.push(setInterval(callback1, 1000));
      intervals.push(setInterval(callback2, 500));
      
      return () => {
        intervals.forEach(id => clearInterval(id));
      };
    };

    // Setup
    const cleanup = setupMultipleIntervals();

    // Fast-forward time
    vi.advanceTimersByTime(2000);
    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(4);

    // Cleanup
    cleanup();

    // Advance time more - callbacks should not be called
    vi.advanceTimersByTime(2000);
    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(4);
  });

  it('should prevent infinite loops by limiting execution count', () => {
    let executionCount = 0;
    const maxExecutions = 100;

    const safeInterval = () => {
      const intervalId = setInterval(() => {
        executionCount++;
        if (executionCount >= maxExecutions) {
          clearInterval(intervalId);
        }
      }, 10);
      
      return () => clearInterval(intervalId);
    };

    // Setup
    const cleanup = safeInterval();

    // Fast-forward time way beyond expected
    vi.advanceTimersByTime(10000);

    // Should have stopped at maxExecutions
    expect(executionCount).toBeLessThanOrEqual(maxExecutions);

    cleanup();
  });

  it('should handle cleanup being called multiple times safely', () => {
    const callback = vi.fn();
    let intervalId: NodeJS.Timeout | null = null;

    const setupInterval = () => {
      intervalId = setInterval(callback, 1000);
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };
    };

    const cleanup = setupInterval();

    // Call cleanup multiple times
    cleanup();
    cleanup();
    cleanup();

    // Should not throw error
    expect(intervalId).toBeNull();
  });

  it('should verify performanceScanner cleanup', () => {
    // Mock scanner similar to src/ai/monitoring/performanceScanner.ts
    class MockScanner {
      private scanIntervalId: NodeJS.Timeout | null = null;
      private isScanning = false;

      startScanning(interval: number = 1000) {
        if (this.isScanning) return;
        this.isScanning = true;
        this.scanIntervalId = setInterval(() => {
          // scan logic
        }, interval);
      }

      stopScanning() {
        this.isScanning = false;
        if (this.scanIntervalId) {
          clearInterval(this.scanIntervalId);
          this.scanIntervalId = null;
        }
      }

      getIntervalId() {
        return this.scanIntervalId;
      }
    }

    const scanner = new MockScanner();
    
    // Start scanning
    scanner.startScanning(1000);
    expect(scanner.getIntervalId()).not.toBeNull();

    // Stop scanning
    scanner.stopScanning();
    expect(scanner.getIntervalId()).toBeNull();
  });

  it('should verify moduleContext cleanup', () => {
    // Mock context manager similar to src/ai/contexts/moduleContext.ts
    let cleanupIntervalId: NodeJS.Timeout | null = null;
    
    const startContextCleanup = (interval: number = 1000) => {
      cleanupIntervalId = setInterval(() => {
        // cleanup logic
      }, interval);
    };

    const stopContextCleanup = () => {
      if (cleanupIntervalId) {
        clearInterval(cleanupIntervalId);
        cleanupIntervalId = null;
      }
    };

    // Start cleanup
    startContextCleanup(1000);
    expect(cleanupIntervalId).not.toBeNull();

    // Stop cleanup
    stopContextCleanup();
    expect(cleanupIntervalId).toBeNull();
  });
});

describe('useEffect Cleanup Pattern Tests', () => {
  it('should demonstrate correct useEffect cleanup pattern', () => {
    const callback = vi.fn();

    // Correct pattern
    const useEffectSimulation = () => {
      const intervalId = setInterval(callback, 1000);
      
      // Cleanup function
      return () => {
        clearInterval(intervalId);
      };
    };

    // Mount
    const cleanup = useEffectSimulation();

    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(3);

    // Unmount
    cleanup();

    vi.advanceTimersByTime(3000);
    expect(callback).toHaveBeenCalledTimes(3); // No additional calls
  });

  it('should catch missing cleanup as anti-pattern', () => {
    const callback = vi.fn();

    // Anti-pattern: No cleanup
    const incorrectPattern = () => {
      setInterval(callback, 1000);
      // Missing: return () => clearInterval(intervalId);
    };

    incorrectPattern();

    vi.advanceTimersByTime(3000);
    const initialCalls = callback.mock.calls.length;
    expect(initialCalls).toBeGreaterThan(0);

    // "Unmount" but interval continues
    vi.advanceTimersByTime(3000);
    const laterCalls = callback.mock.calls.length;
    
    // This demonstrates the problem: interval keeps running
    expect(laterCalls).toBeGreaterThan(initialCalls);
  });
});
