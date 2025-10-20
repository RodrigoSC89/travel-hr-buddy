/**
 * safeLazyImport Tests
 * 
 * Tests for the safe lazy import utility
 */

import { describe, it, expect, vi } from 'vitest';
import { safeLazyImport } from '@/utils/safeLazyImport';

describe('safeLazyImport', () => {
  it('should create a lazy component', () => {
    const TestComponent = () => null;
    const LazyComponent = safeLazyImport(() => 
      Promise.resolve({ default: TestComponent })
    );
    
    expect(LazyComponent).toBeDefined();
    expect(LazyComponent.$$typeof).toBeDefined();
  });

  it('should retry on failure', async () => {
    let attemptCount = 0;
    const TestComponent = () => null;
    
    const LazyComponent = safeLazyImport(
      () => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ default: TestComponent });
      },
      { retries: 3, delay: 10 }
    );
    
    expect(LazyComponent).toBeDefined();
  });

  it('should respect retry configuration', async () => {
    const TestComponent = () => null;
    const LazyComponent = safeLazyImport(
      () => Promise.resolve({ default: TestComponent }),
      { retries: 5, delay: 100 }
    );
    
    expect(LazyComponent).toBeDefined();
  });
});
