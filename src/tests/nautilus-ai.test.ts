/**
 * Tests for NautilusAI stub
 */

import { describe, it, expect, vi } from 'vitest';
import { NautilusAI } from '@/ai/nautilus-core';

describe('NautilusAI', () => {
  it('should analyze context and return result', async () => {
    const result = await NautilusAI.analyze('Test maintenance data');

    expect(result).toBeDefined();
    expect(result.context).toBe('Test maintenance data');
    expect(result.response).toContain('Test maintenance data');
    expect(result.timestamp).toBeDefined();
  });

  it('should log analysis context', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    await NautilusAI.analyze('Vessel efficiency analysis');

    expect(consoleSpy).toHaveBeenCalledWith(
      '🧠 [NautilusAI] Context received:',
      'Vessel efficiency analysis'
    );

    consoleSpy.mockRestore();
  });

  it('should return timestamp in ISO format', async () => {
    const result = await NautilusAI.analyze('Test');

    const timestamp = new Date(result.timestamp);
    expect(timestamp.toISOString()).toBe(result.timestamp);
  });

  it('should handle empty context', async () => {
    const result = await NautilusAI.analyze('');

    expect(result.context).toBe('');
    expect(result.response).toBeDefined();
  });

  it('should simulate async processing', async () => {
    const start = Date.now();
    await NautilusAI.analyze('Test');
    const duration = Date.now() - start;

    // Should take at least 100ms due to simulated delay
    expect(duration).toBeGreaterThanOrEqual(100);
  });

  it('should handle long context strings', async () => {
    const longContext = 'A'.repeat(1000);
    const result = await NautilusAI.analyze(longContext);

    expect(result.context).toBe(longContext);
    expect(result.response).toContain(longContext);
  });

  it('should return consistent structure', async () => {
    const result = await NautilusAI.analyze('Test');

    expect(result).toHaveProperty('context');
    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('timestamp');
  });
});
