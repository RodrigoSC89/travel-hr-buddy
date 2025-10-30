/**
 * Tests for Timeout Handler
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  withTimeout, 
  withRetryAndTimeout, 
  TimeoutError,
  createTimeoutController 
} from '@/lib/utils/timeout-handler';

describe('TimeoutHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withTimeout', () => {
    it('should resolve promise before timeout', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(promise, 1000, 'Test timeout');
      expect(result).toBe('success');
    });

    it('should reject with TimeoutError when timeout occurs', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 200));
      
      await expect(
        withTimeout(promise, 50, 'Operation timed out')
      ).rejects.toThrow(TimeoutError);
    });

    it('should include timeout duration in error message', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 200));
      
      await expect(
        withTimeout(promise, 50, 'Custom timeout message')
      ).rejects.toThrow('Custom timeout message (50ms)');
    });

    it('should reject with original error if promise rejects before timeout', async () => {
      const promise = Promise.reject(new Error('Original error'));
      
      await expect(
        withTimeout(promise, 1000, 'Timeout message')
      ).rejects.toThrow('Original error');
    });
  });

  describe('withRetryAndTimeout', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await withRetryAndTimeout(
        fn,
        1000,
        'Test operation',
        { maxRetries: 3 }
      );

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on timeout and eventually succeed', async () => {
      let callCount = 0;
      const fn = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 200));
          return 'delayed';
        }
        return 'success';
      });

      const result = await withRetryAndTimeout(
        fn,
        100,
        'Retry test',
        { maxRetries: 2, initialDelayMs: 10 }
      );

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const fn = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return 'never-resolves';
      });

      await expect(
        withRetryAndTimeout(
          fn,
          50,
          'Will timeout',
          { maxRetries: 2, initialDelayMs: 10 }
        )
      ).rejects.toThrow(TimeoutError);

      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should not retry on non-timeout errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Non-timeout error'));

      await expect(
        withRetryAndTimeout(
          fn,
          1000,
          'Test',
          { maxRetries: 3 }
        )
      ).rejects.toThrow('Non-timeout error');

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTimeoutController', () => {
    it('should create AbortController that aborts after timeout', async () => {
      const controller = createTimeoutController(50);
      
      expect(controller.signal.aborted).toBe(false);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(controller.signal.aborted).toBe(true);
    });

    it('should not abort before timeout', async () => {
      const controller = createTimeoutController(200);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(controller.signal.aborted).toBe(false);
    });
  });
});
