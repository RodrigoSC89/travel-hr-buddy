import { logger } from '@/lib/logger';

/**
 * OpenTelemetry Configuration for Nauti One
 * Distributed tracing across frontend, edge functions, and external APIs
 */

export interface Span {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  attributes: Record<string, string | number | boolean>;
  status: 'ok' | 'error' | 'unset';
  parentSpanId?: string;
  traceId: string;
  spanId: string;
  events: SpanEvent[];
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, string | number | boolean>;
}

export interface Trace {
  traceId: string;
  spans: Span[];
  startTime: number;
  endTime?: number;
  serviceName: string;
}

// Generate unique IDs
const generateId = (length: number = 16): string => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// Active traces storage
const activeTraces = new Map<string, Trace>();
const activeSpans = new Map<string, Span>();
const completedTraces: Trace[] = [];

// Configuration
const config = {
  serviceName: 'nauti-one-frontend',
  maxTracesStored: 100,
  sampleRate: 1.0, // 100% sampling for now
  exportEndpoint: '', // Configure for Jaeger/Tempo
};

/**
 * Start a new trace
 */
export function startTrace(name: string): string {
  const traceId = generateId(32);
  const trace: Trace = {
    traceId,
    spans: [],
    startTime: Date.now(),
    serviceName: config.serviceName,
  };
  activeTraces.set(traceId, trace);
  return traceId;
}

/**
 * Start a new span within a trace
 */
export function startSpan(
  name: string,
  traceId: string,
  parentSpanId?: string,
  attributes: Record<string, string | number | boolean> = {}
): string {
  const spanId = generateId(16);
  const span: Span = {
    name,
    startTime: Date.now(),
    attributes: {
      ...attributes,
      'service.name': config.serviceName,
    },
    status: 'unset',
    parentSpanId,
    traceId,
    spanId,
    events: [],
  };
  
  activeSpans.set(spanId, span);
  
  const trace = activeTraces.get(traceId);
  if (trace) {
    trace.spans.push(span);
  }
  
  return spanId;
}

/**
 * Add an event to a span
 */
export function addSpanEvent(
  spanId: string,
  name: string,
  attributes?: Record<string, string | number | boolean>
): void {
  const span = activeSpans.get(spanId);
  if (span) {
    span.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
  }
}

/**
 * Set span attributes
 */
export function setSpanAttributes(
  spanId: string,
  attributes: Record<string, string | number | boolean>
): void {
  const span = activeSpans.get(spanId);
  if (span) {
    span.attributes = { ...span.attributes, ...attributes };
  }
}

/**
 * End a span
 */
export function endSpan(spanId: string, status: 'ok' | 'error' = 'ok'): void {
  const span = activeSpans.get(spanId);
  if (span) {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;
    activeSpans.delete(spanId);
  }
}

/**
 * End a trace
 */
export function endTrace(traceId: string): Trace | undefined {
  const trace = activeTraces.get(traceId);
  if (trace) {
    trace.endTime = Date.now();
    activeTraces.delete(traceId);
    
    // Store completed trace
    completedTraces.push(trace);
    if (completedTraces.length > config.maxTracesStored) {
      completedTraces.shift();
    }
    
    // Export trace (async, non-blocking)
    exportTrace(trace);
    
    return trace;
  }
  return undefined;
}

/**
 * Export trace to backend
 */
async function exportTrace(trace: Trace): Promise<void> {
  if (!config.exportEndpoint) {
    // Log to console in development
    if (import.meta.env.DEV) {
      logger.debug('[OTEL] Trace completed:', {
        traceId: trace.traceId,
        duration: trace.endTime ? trace.endTime - trace.startTime : 0,
        spanCount: trace.spans.length,
      });
    }
    return;
  }
  
  try {
    await fetch(config.exportEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trace),
    });
  } catch (error) {
    logger.error('[OTEL] Failed to export trace:', error);
  }
}

/**
 * Get completed traces for analysis
 */
export function getCompletedTraces(): Trace[] {
  return [...completedTraces];
}

/**
 * Get active traces
 */
export function getActiveTraces(): Trace[] {
  return Array.from(activeTraces.values());
}

/**
 * Trace decorator for async functions
 */
export function traced<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
  attributes?: Record<string, string | number | boolean>
): T {
  return (async (...args: Parameters<T>) => {
    const traceId = startTrace(name);
    const spanId = startSpan(name, traceId, undefined, attributes);
    
    try {
      const result = await fn(...args);
      endSpan(spanId, 'ok');
      endTrace(traceId);
      return result;
    } catch (error) {
      setSpanAttributes(spanId, {
        'error.message': error instanceof Error ? error.message : 'Unknown error',
        'error.type': error instanceof Error ? error.name : 'Error',
      });
      endSpan(spanId, 'error');
      endTrace(traceId);
      throw error;
    }
  }) as T;
}

/**
 * Performance metrics collector
 */
export const metrics = {
  pageLoads: [] as { url: string; duration: number; timestamp: number }[],
  apiCalls: [] as { endpoint: string; duration: number; status: number; timestamp: number }[],
  renderTimes: [] as { component: string; duration: number; timestamp: number }[],
  
  recordPageLoad(url: string, duration: number) {
    this.pageLoads.push({ url, duration, timestamp: Date.now() });
    if (this.pageLoads.length > 100) this.pageLoads.shift();
  },
  
  recordApiCall(endpoint: string, duration: number, status: number) {
    this.apiCalls.push({ endpoint, duration, status, timestamp: Date.now() });
    if (this.apiCalls.length > 500) this.apiCalls.shift();
  },
  
  recordRenderTime(component: string, duration: number) {
    this.renderTimes.push({ component, duration, timestamp: Date.now() });
    if (this.renderTimes.length > 200) this.renderTimes.shift();
  },
  
  getP95Latency(data: { duration: number }[]): number {
    if (data.length === 0) return 0;
    const sorted = [...data].sort((a, b) => a.duration - b.duration);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index]?.duration || 0;
  },
  
  getP99Latency(data: { duration: number }[]): number {
    if (data.length === 0) return 0;
    const sorted = [...data].sort((a, b) => a.duration - b.duration);
    const index = Math.floor(sorted.length * 0.99);
    return sorted[index]?.duration || 0;
  },
  
  getAverageLatency(data: { duration: number }[]): number {
    if (data.length === 0) return 0;
    return data.reduce((sum, d) => sum + d.duration, 0) / data.length;
  },
};
