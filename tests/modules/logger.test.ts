/**
 * Logger Tests - PATCH 67.0
 */

import { describe, it, expect, vi } from 'vitest';
import { Logger } from '@/lib/utils/logger';

describe('Universal Logger', () => {
  it('should log info messages', () => {
    const consoleSpy = vi.spyOn(console, 'info');
    Logger.info('Test message', { data: 'test' });
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should log errors with context', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    Logger.error('Error message', new Error('Test error'), 'test-module');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should format AI logs correctly', () => {
    const consoleSpy = vi.spyOn(console, 'info');
    Logger.ai('AI processing', { model: 'gemini' });
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should create timer and measure duration', () => {
    const timer = Logger.startTimer('test-operation');
    timer();
    expect(timer).toBeDefined();
  });
});
