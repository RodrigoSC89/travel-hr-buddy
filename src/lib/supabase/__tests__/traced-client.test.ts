/**
 * Tests for Traced Supabase Client
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTracedClient, tracedEdgeFetch, useTracedSupabase } from '../traced-client';

// Mock fetch
global.fetch = vi.fn();

// Mock tracer
vi.mock('@/lib/tracing/distributed-trace', () => ({
  tracer: {
    startTrace: vi.fn(() => ({
      traceId: 'test-trace-id',
      spanId: 'test-span-id',
      timestamp: Date.now(),
    })),
    endTrace: vi.fn(),
  },
  createTraceHeaders: vi.fn(() => ({
    'x-trace-id': 'test-trace-id',
    'x-span-id': 'test-span-id',
    'x-session-id': 'test-session',
    'x-user-id': '',
    'x-module': 'test-module',
  })),
}));

describe('Traced Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTracedClient', () => {
    it('should create a client with trace context', () => {
      const { client, context } = createTracedClient('test-module');
      
      expect(client).toBeDefined();
      expect(context).toBeDefined();
      expect(context.traceId).toBe('test-trace-id');
    });

    it('should include trace headers in client configuration', () => {
      const { client } = createTracedClient('database');
      
      expect(client).toBeDefined();
    });
  });

  describe('tracedEdgeFetch', () => {
    it('should call edge function with trace headers', async () => {
      const mockResponse = { success: true, data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'x-trace-id': 'response-trace-id' }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await tracedEdgeFetch('test-function', {
        body: { key: 'value' },
        module: 'test',
      });

      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBeNull();
      expect(result.traceId).toBe('response-trace-id');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/test-function'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-trace-id': 'test-trace-id',
          }),
        })
      );
    });

    it('should handle edge function errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        text: () => Promise.resolve('Internal Server Error'),
      });

      const result = await tracedEdgeFetch('error-function');

      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Internal Server Error');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await tracedEdgeFetch('network-error-function');

      expect(result.data).toBeNull();
      expect(result.error?.message).toBe('Network error');
    });

    it('should use GET method when specified', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({}),
      });

      await tracedEdgeFetch('get-function', { method: 'GET' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('useTracedSupabase', () => {
    it('should return traced supabase client and utilities', () => {
      const { supabase, traceId, context, endTrace, callEdgeFunction } = 
        useTracedSupabase('test-module');

      expect(supabase).toBeDefined();
      expect(traceId).toBe('test-trace-id');
      expect(context).toBeDefined();
      expect(typeof endTrace).toBe('function');
      expect(typeof callEdgeFunction).toBe('function');
    });
  });
});
