/**
 * useTracing - React hook for distributed tracing
 */

import { useCallback, useRef, useEffect } from 'react';
import {
  startTrace,
  startSpan,
  endSpan,
  endTrace,
  addSpanEvent,
  setSpanAttributes,
  metrics,
} from '@/lib/telemetry/otel-config';

interface UseTracingOptions {
  componentName?: string;
  autoTraceRender?: boolean;
}

export function useTracing(options: UseTracingOptions = {}) {
  const { componentName, autoTraceRender = false } = options;
  const renderStartRef = useRef<number>(0);
  const activeTraceRef = useRef<string | null>(null);
  const activeSpanRef = useRef<string | null>(null);

  // Track render time
  useEffect(() => {
    if (autoTraceRender && componentName) {
      const renderTime = performance.now() - renderStartRef.current;
      metrics.recordRenderTime(componentName, renderTime);
    }
  });

  if (autoTraceRender) {
    renderStartRef.current = performance.now();
  }

  /**
   * Start a traced operation
   */
  const trace = useCallback(<T>(
    name: string,
    operation: () => T | Promise<T>,
    attributes?: Record<string, string | number | boolean>
  ): Promise<T> => {
    return new Promise(async (resolve, reject) => {
      const traceId = startTrace(name);
      const spanId = startSpan(name, traceId, undefined, {
        ...attributes,
        component: componentName || 'unknown',
      });

      activeTraceRef.current = traceId;
      activeSpanRef.current = spanId;

      try {
        const result = await operation();
        endSpan(spanId, 'ok');
        endTrace(traceId);
        resolve(result);
      } catch (error) {
        setSpanAttributes(spanId, {
          'error.message': error instanceof Error ? error.message : 'Unknown',
          'error.type': error instanceof Error ? error.name : 'Error',
        });
        endSpan(spanId, 'error');
        endTrace(traceId);
        reject(error);
      } finally {
        activeTraceRef.current = null;
        activeSpanRef.current = null;
      }
    });
  }, [componentName]);

  /**
   * Create a child span within active trace
   */
  const span = useCallback(<T>(
    name: string,
    operation: () => T | Promise<T>,
    attributes?: Record<string, string | number | boolean>
  ): Promise<T> => {
    return new Promise(async (resolve, reject) => {
      if (!activeTraceRef.current) {
        // No active trace, just execute
        try {
          resolve(await operation());
        } catch (e) {
          reject(e);
        }
        return;
      }

      const spanId = startSpan(
        name,
        activeTraceRef.current,
        activeSpanRef.current || undefined,
        attributes
      );

      try {
        const result = await operation();
        endSpan(spanId, 'ok');
        resolve(result);
      } catch (error) {
        setSpanAttributes(spanId, {
          'error.message': error instanceof Error ? error.message : 'Unknown',
        });
        endSpan(spanId, 'error');
        reject(error);
      }
    });
  }, []);

  /**
   * Add event to current span
   */
  const addEvent = useCallback((
    name: string,
    attributes?: Record<string, string | number | boolean>
  ) => {
    if (activeSpanRef.current) {
      addSpanEvent(activeSpanRef.current, name, attributes);
    }
  }, []);

  /**
   * Set attributes on current span
   */
  const setAttributes = useCallback((
    attributes: Record<string, string | number | boolean>
  ) => {
    if (activeSpanRef.current) {
      setSpanAttributes(activeSpanRef.current, attributes);
    }
  }, []);

  /**
   * Trace an API call with automatic metrics recording
   */
  const traceApi = useCallback(async <T>(
    endpoint: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    let status = 200;

    try {
      const result = await trace(`api:${endpoint}`, operation, {
        'http.url': endpoint,
        'http.method': 'POST',
      });
      return result;
    } catch (error) {
      status = 500;
      throw error;
    } finally {
      const duration = performance.now() - start;
      metrics.recordApiCall(endpoint, duration, status);
    }
  }, [trace]);

  return {
    trace,
    span,
    addEvent,
    setAttributes,
    traceApi,
    metrics,
  };
}
