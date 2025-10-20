/**
 * NautilusAI Tests
 * 
 * Tests for the Nautilus AI stub implementation
 */

import { describe, it, expect } from 'vitest';
import { NautilusAI } from '@/ai/nautilus-core';

describe('NautilusAI', () => {
  it('should analyze context and return result', async () => {
    const result = await NautilusAI.analyze('Test context');
    
    expect(result).toBeDefined();
    expect(result.analysis).toContain('Test context');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.timestamp).toBeDefined();
  });

  it('should provide recommendations', async () => {
    const result = await NautilusAI.analyze('Test context');
    
    expect(result.recommendations).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.recommendations!.length).toBeGreaterThan(0);
  });

  it('should return model info', () => {
    const info = NautilusAI.getModelInfo();
    
    expect(info.name).toBe('Nautilus AI Stub');
    expect(info.isStub).toBe(true);
    expect(info.capabilities).toContain('context_analysis');
  });

  it('should report ready status', () => {
    const isReady = NautilusAI.isReady();
    
    expect(isReady).toBe(true);
  });

  it('should include timestamp in analysis', async () => {
    const result = await NautilusAI.analyze('Test');
    const timestamp = new Date(result.timestamp);
    
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).toBeGreaterThan(0);
  });
});
