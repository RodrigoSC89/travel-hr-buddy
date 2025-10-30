/**
 * Tests for Performance Monitor
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceMonitor } from '@/lib/utils/performance-monitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should measure synchronous operations', () => {
    const result = performanceMonitor.measureSync('test-sync', () => {
      return 'test-result';
    });

    expect(result).toBe('test-result');
  });

  it('should measure asynchronous operations', async () => {
    const result = await performanceMonitor.measure('test-async', async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'async-result';
    });

    expect(result).toBe('async-result');
  });

  it('should track operation timing', () => {
    performanceMonitor.start('timing-test');
    const metric = performanceMonitor.end('timing-test');

    expect(metric).not.toBeNull();
    expect(metric?.name).toBe('timing-test');
    expect(metric?.duration).toBeGreaterThanOrEqual(0);
  });

  it('should handle errors in synchronous operations', () => {
    expect(() => {
      performanceMonitor.measureSync('error-test', () => {
        throw new Error('Test error');
      });
    }).toThrow('Test error');
  });

  it('should handle errors in asynchronous operations', async () => {
    await expect(
      performanceMonitor.measure('async-error-test', async () => {
        throw new Error('Async test error');
      })
    ).rejects.toThrow('Async test error');
  });

  it('should return null for end without start', () => {
    const metric = performanceMonitor.end('non-existent');
    expect(metric).toBeNull();
  });

  it('should flag slow operations as warnings', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    performanceMonitor.measureSync('slow-operation', () => {
      // Simulate slow operation by using performance.now()
      const start = performance.now();
      while (performance.now() - start < 350) {
        // busy wait
      }
      return 'done';
    });

    // Check if warning was logged (operation > 300ms)
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
