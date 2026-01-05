/**
 * Distributed Tracing Tests
 * Unit tests for tracing system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateTraceId,
  generateSpanId,
  createTraceContext,
  createTraceHeaders,
  parseTraceHeaders,
  DistributedTracer,
  tracer,
  withTracing,
  useTracing
} from '../distributed-trace';

// Mock Sentry
vi.mock('@sentry/react', () => ({
  setContext: vi.fn(),
  addBreadcrumb: vi.fn()
}));

describe('Distributed Tracing', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('generateTraceId', () => {
    it('should generate 32 character hex string', () => {
      const traceId = generateTraceId();
      
      expect(traceId).toHaveLength(32);
      expect(traceId).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateTraceId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('generateSpanId', () => {
    it('should generate 16 character hex string', () => {
      const spanId = generateSpanId();
      
      expect(spanId).toHaveLength(16);
      expect(spanId).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique span IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateSpanId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('createTraceContext', () => {
    it('should create context with required fields', () => {
      const context = createTraceContext();
      
      expect(context).toMatchObject({
        traceId: expect.any(String),
        spanId: expect.any(String),
        timestamp: expect.any(Number),
        sessionId: expect.any(String)
      });
    });

    it('should include optional fields when provided', () => {
      const context = createTraceContext({
        userId: 'user-123',
        module: 'peotram',
        parentSpanId: 'parent-span'
      });
      
      expect(context.userId).toBe('user-123');
      expect(context.module).toBe('peotram');
      expect(context.parentSpanId).toBe('parent-span');
    });

    it('should reuse session ID across calls', () => {
      const context1 = createTraceContext();
      const context2 = createTraceContext();
      
      expect(context1.sessionId).toBe(context2.sessionId);
    });
  });

  describe('createTraceHeaders', () => {
    it('should create all required headers', () => {
      const context = createTraceContext({
        userId: 'user-123',
        module: 'crew-management'
      });
      
      const headers = createTraceHeaders(context);
      
      expect(headers).toMatchObject({
        'x-trace-id': context.traceId,
        'x-span-id': context.spanId,
        'x-session-id': context.sessionId,
        'x-user-id': 'user-123',
        'x-module': 'crew-management',
        'x-timestamp': context.timestamp.toString()
      });
    });

    it('should handle missing optional fields', () => {
      const context = createTraceContext();
      const headers = createTraceHeaders(context);
      
      expect(headers['x-user-id']).toBe('');
      expect(headers['x-parent-span-id']).toBe('');
    });
  });

  describe('parseTraceHeaders', () => {
    it('should parse Headers object', () => {
      const headers = new Headers({
        'x-trace-id': 'trace-123',
        'x-span-id': 'span-456',
        'x-session-id': 'session-789'
      });
      
      const parsed = parseTraceHeaders(headers);
      
      expect(parsed.traceId).toBe('trace-123');
      expect(parsed.spanId).toBe('span-456');
      expect(parsed.sessionId).toBe('session-789');
    });

    it('should parse plain object headers', () => {
      const headers = {
        'x-trace-id': 'trace-abc',
        'x-user-id': 'user-def'
      };
      
      const parsed = parseTraceHeaders(headers);
      
      expect(parsed.traceId).toBe('trace-abc');
      expect(parsed.userId).toBe('user-def');
    });
  });

  describe('DistributedTracer', () => {
    it('should be singleton', () => {
      const instance1 = DistributedTracer.getInstance();
      const instance2 = DistributedTracer.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export singleton instance', () => {
      expect(tracer).toBeDefined();
      expect(tracer).toBeInstanceOf(DistributedTracer);
    });

    describe('startTrace', () => {
      it('should create and store trace context', () => {
        const context = tracer.startTrace({ module: 'test' });
        
        expect(context.traceId).toBeDefined();
        expect(context.module).toBe('test');
        
        const activeTraces = tracer.getActiveTraces();
        expect(activeTraces.some(t => t.traceId === context.traceId)).toBe(true);
      });
    });

    describe('endTrace', () => {
      it('should remove trace from active and add to history', () => {
        const context = tracer.startTrace({ module: 'test' });
        const traceId = context.traceId;
        
        expect(tracer.getActiveTraces().some(t => t.traceId === traceId)).toBe(true);
        
        tracer.endTrace(traceId);
        
        expect(tracer.getActiveTraces().some(t => t.traceId === traceId)).toBe(false);
        expect(tracer.getTraceHistory().some(t => t.traceId === traceId)).toBe(true);
      });

      it('should handle non-existent trace gracefully', () => {
        expect(() => tracer.endTrace('non-existent')).not.toThrow();
      });
    });

    describe('createChildSpan', () => {
      it('should create child with parent reference', () => {
        const parent = tracer.startTrace({ userId: 'user-1', module: 'parent' });
        const child = tracer.createChildSpan(parent, 'child-module');
        
        expect(child.parentSpanId).toBe(parent.spanId);
        expect(child.userId).toBe(parent.userId);
        expect(child.module).toBe('child-module');
      });
    });

    describe('findTrace', () => {
      it('should find active trace', () => {
        const context = tracer.startTrace({ module: 'findable' });
        const found = tracer.findTrace(context.traceId);
        
        expect(found).toBeDefined();
        expect(found?.module).toBe('findable');
      });

      it('should find trace in history', () => {
        const context = tracer.startTrace({ module: 'historical' });
        tracer.endTrace(context.traceId);
        
        const found = tracer.findTrace(context.traceId);
        expect(found).toBeDefined();
      });

      it('should return undefined for non-existent trace', () => {
        const found = tracer.findTrace('does-not-exist');
        expect(found).toBeUndefined();
      });
    });

    describe('getSupabaseHeaders', () => {
      it('should return properly formatted headers', () => {
        const context = tracer.startTrace({ userId: 'user-1', module: 'supabase-test' });
        const headers = tracer.getSupabaseHeaders(context);
        
        expect(headers['x-trace-id']).toBe(context.traceId);
        expect(headers['x-user-id']).toBe('user-1');
      });
    });
  });

  describe('withTracing', () => {
    it('should wrap async function with tracing', async () => {
      const mockFn = vi.fn().mockResolvedValue('result');
      const tracedFn = withTracing(mockFn, { module: 'wrapped' });
      
      const result = await tracedFn('arg1', 'arg2');
      
      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should end trace on success', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const tracedFn = withTracing(mockFn);
      
      await tracedFn();
      
      // Trace should be in history (ended)
      const history = tracer.getTraceHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should end trace and rethrow on error', async () => {
      const error = new Error('Test error');
      const mockFn = vi.fn().mockRejectedValue(error);
      const tracedFn = withTracing(mockFn);
      
      await expect(tracedFn()).rejects.toThrow('Test error');
    });
  });

  describe('useTracing hook', () => {
    it('should return tracing functions', () => {
      const { startTrace, endTrace, tracedFetch } = useTracing('test-module');
      
      expect(typeof startTrace).toBe('function');
      expect(typeof endTrace).toBe('function');
      expect(typeof tracedFetch).toBe('function');
    });

    it('should start trace with module name', () => {
      const { startTrace } = useTracing('my-module');
      const context = startTrace('user-123');
      
      expect(context.module).toBe('my-module');
      expect(context.userId).toBe('user-123');
    });
  });
});

describe('Integration Tests - Distributed Tracing', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should complete full trace lifecycle', () => {
    // Start parent trace
    const parent = tracer.startTrace({ 
      userId: 'user-integration',
      module: 'integration-test'
    });
    
    // Create child spans
    const child1 = tracer.createChildSpan(parent, 'db-query');
    const child2 = tracer.createChildSpan(parent, 'api-call');
    
    // Verify parent-child relationship
    expect(child1.parentSpanId).toBe(parent.spanId);
    expect(child2.parentSpanId).toBe(parent.spanId);
    
    // Get headers for Supabase
    const headers = tracer.getSupabaseHeaders(parent);
    expect(headers['x-trace-id']).toBe(parent.traceId);
    
    // End trace
    tracer.endTrace(parent.traceId, { success: true });
    
    // Verify trace is in history
    const found = tracer.findTrace(parent.traceId);
    expect(found).toBeDefined();
  });

  it('should maintain session ID across multiple traces', () => {
    const trace1 = tracer.startTrace({ module: 'trace-1' });
    const trace2 = tracer.startTrace({ module: 'trace-2' });
    const trace3 = tracer.startTrace({ module: 'trace-3' });
    
    expect(trace1.sessionId).toBe(trace2.sessionId);
    expect(trace2.sessionId).toBe(trace3.sessionId);
  });
});
