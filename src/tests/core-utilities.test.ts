/**
 * Critical unit tests for core utilities
 */
import { describe, it, expect, vi } from 'vitest';

describe('operationalDb', () => {
  it('should export operationalDb with expected tables', async () => {
    const { operationalDb } = await import('@/lib/storage/operational-db');
    expect(operationalDb).toBeDefined();
    expect(typeof operationalDb.getCache).toBe('function');
    expect(typeof operationalDb.setCache).toBe('function');
  });
});

describe('usePaginatedSupabase types', () => {
  it('should export the hook', async () => {
    const mod = await import('@/hooks/usePaginatedSupabase');
    expect(mod.usePaginatedSupabase).toBeDefined();
    expect(typeof mod.usePaginatedSupabase).toBe('function');
  });
});

describe('sentry-init', () => {
  it('should export initializeSentry function', async () => {
    const mod = await import('@/lib/monitoring/sentry-init');
    expect(mod.initializeSentry).toBeDefined();
    expect(typeof mod.initializeSentry).toBe('function');
  });

  it('should not throw when DSN is missing', async () => {
    const { initializeSentry } = await import('@/lib/monitoring/sentry-init');
    expect(() => initializeSentry()).not.toThrow();
  });
});

describe('logger', () => {
  it('should export logger with standard methods', async () => {
    const { logger } = await import('@/lib/logger');
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });
});
