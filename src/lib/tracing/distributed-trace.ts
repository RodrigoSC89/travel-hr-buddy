/**
 * Distributed Tracing System
 * Propagates traceId between frontend and Supabase Edge Functions
 */

import * as Sentry from '@sentry/react';
import { logger } from '@/lib/logger';

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  module?: string;
}

export interface TracedRequest {
  headers: Record<string, string>;
  startTime: number;
  context: TraceContext;
}

/**
 * Generate a unique trace ID (UUID v4 format)
 */
export function generateTraceId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

/**
 * Generate a span ID (16 char hex)
 */
export function generateSpanId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  const key = 'nautilus_session_id';
  let sessionId = sessionStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = generateTraceId();
    sessionStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}

/**
 * Create a new trace context
 */
export function createTraceContext(options?: {
  userId?: string;
  module?: string;
  parentSpanId?: string;
}): TraceContext {
  return {
    traceId: generateTraceId(),
    spanId: generateSpanId(),
    parentSpanId: options?.parentSpanId,
    timestamp: Date.now(),
    userId: options?.userId,
    sessionId: getSessionId(),
    module: options?.module
  };
}

/**
 * Create trace headers for HTTP requests
 */
export function createTraceHeaders(context: TraceContext): Record<string, string> {
  return {
    'x-trace-id': context.traceId,
    'x-span-id': context.spanId,
    'x-parent-span-id': context.parentSpanId || '',
    'x-session-id': context.sessionId || '',
    'x-user-id': context.userId || '',
    'x-module': context.module || '',
    'x-timestamp': context.timestamp.toString()
  };
}

/**
 * Parse trace context from headers
 */
export function parseTraceHeaders(headers: Headers | Record<string, string>): Partial<TraceContext> {
  const get = (key: string): string | undefined => {
    if (headers instanceof Headers) {
      return headers.get(key) || undefined;
    }
    return headers[key];
  };

  return {
    traceId: get('x-trace-id'),
    spanId: get('x-span-id'),
    parentSpanId: get('x-parent-span-id') || undefined,
    sessionId: get('x-session-id'),
    userId: get('x-user-id'),
    module: get('x-module'),
    timestamp: get('x-timestamp') ? parseInt(get('x-timestamp')!) : undefined
  };
}

/**
 * Distributed Tracer class for managing trace contexts
 */
export class DistributedTracer {
  private static instance: DistributedTracer;
  private activeTraces: Map<string, TraceContext> = new Map();
  private traceHistory: TraceContext[] = [];
  private maxHistorySize = 100;

  private constructor() {}

  static getInstance(): DistributedTracer {
    if (!this.instance) {
      this.instance = new DistributedTracer();
    }
    return this.instance;
  }

  /**
   * Start a new trace
   */
  startTrace(options?: {
    userId?: string;
    module?: string;
    parentSpanId?: string;
  }): TraceContext {
    const context = createTraceContext(options);
    this.activeTraces.set(context.traceId, context);
    
    // Set Sentry context
    Sentry.setContext('trace', {
      traceId: context.traceId,
      spanId: context.spanId,
      sessionId: context.sessionId,
      module: context.module
    });

    return context;
  }

  /**
   * End a trace
   */
  endTrace(traceId: string, metadata?: Record<string, unknown>): void {
    const context = this.activeTraces.get(traceId);
    
    if (context) {
      const duration = Date.now() - context.timestamp;
      
      // Add to history
      this.traceHistory.push(context);
      if (this.traceHistory.length > this.maxHistorySize) {
        this.traceHistory.shift();
      }
      
      // Remove from active
      this.activeTraces.delete(traceId);
      
      // Log trace completion
      this.logTraceCompletion(context, duration, metadata);
    }
  }

  /**
   * Create a child span
   */
  createChildSpan(parentContext: TraceContext, module?: string): TraceContext {
    return createTraceContext({
      userId: parentContext.userId,
      module: module || parentContext.module,
      parentSpanId: parentContext.spanId
    });
  }

  /**
   * Get headers for Supabase requests
   */
  getSupabaseHeaders(context: TraceContext): Record<string, string> {
    return createTraceHeaders(context);
  }

  /**
   * Wrap a fetch request with tracing
   */
  async tracedFetch(
    url: string,
    options: RequestInit = {},
    traceOptions?: {
      userId?: string;
      module?: string;
    }
  ): Promise<Response> {
    const context = this.startTrace(traceOptions);
    const traceHeaders = createTraceHeaders(context);
    
    const mergedHeaders = {
      ...options.headers,
      ...traceHeaders
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: mergedHeaders
      });

      this.endTrace(context.traceId, {
        status: response.status,
        url,
        method: options.method || 'GET'
      });

      return response;
    } catch (error) {
      this.endTrace(context.traceId, {
        error: error instanceof Error ? error.message : 'Unknown error',
        url,
        method: options.method || 'GET'
      });
      throw error;
    }
  }

  /**
   * Log trace completion
   */
  private logTraceCompletion(
    context: TraceContext,
    duration: number,
    metadata?: Record<string, unknown>
  ): void {
    const logEntry = {
      type: 'trace_complete',
      traceId: context.traceId,
      spanId: context.spanId,
      parentSpanId: context.parentSpanId,
      sessionId: context.sessionId,
      userId: context.userId,
      module: context.module,
      duration,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    // Structured JSON log
    logger.debug(JSON.stringify(logEntry));

    // Send to Sentry as breadcrumb
    Sentry.addBreadcrumb({
      category: 'trace',
      message: `Trace completed: ${context.module || 'unknown'}`,
      data: logEntry,
      level: duration > 5000 ? 'warning' : 'info'
    });
  }

  /**
   * Get active traces
   */
  getActiveTraces(): TraceContext[] {
    return Array.from(this.activeTraces.values());
  }

  /**
   * Get trace history
   */
  getTraceHistory(): TraceContext[] {
    return [...this.traceHistory];
  }

  /**
   * Find trace by ID
   */
  findTrace(traceId: string): TraceContext | undefined {
    return this.activeTraces.get(traceId) || 
           this.traceHistory.find(t => t.traceId === traceId);
  }
}

// Export singleton instance
export const tracer = DistributedTracer.getInstance();

/**
 * Higher-order function to wrap Supabase calls with tracing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic wrapper must accept any async function signature
export function withTracing<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options?: { module?: string }
): T {
  return (async (...args: Parameters<T>) => {
    const context = tracer.startTrace({ module: options?.module });
    
    try {
      const result = await fn(...args);
      tracer.endTrace(context.traceId, { success: true });
      return result;
    } catch (error) {
      tracer.endTrace(context.traceId, { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }) as T;
}

/**
 * React hook for tracing
 */
export function useTracing(module: string) {
  const startTrace = (userId?: string) => {
    return tracer.startTrace({ module, userId });
  };

  const endTrace = (traceId: string, metadata?: Record<string, unknown>) => {
    tracer.endTrace(traceId, metadata);
  };

  const tracedFetch = (url: string, options?: RequestInit) => {
    return tracer.tracedFetch(url, options, { module });
  };

  return { startTrace, endTrace, tracedFetch, tracer };
}
