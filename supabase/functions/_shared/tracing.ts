/**
 * Edge Function Tracing Utilities
 * Handles distributed tracing in Supabase Edge Functions
 */

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sessionId?: string;
  userId?: string;
  module?: string;
  timestamp: number;
}

/**
 * Generate a new span ID
 */
export function generateSpanId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract trace context from request headers
 */
export function extractTraceContext(request: Request): TraceContext {
  const headers = request.headers;
  
  return {
    traceId: headers.get('x-trace-id') || crypto.randomUUID().replace(/-/g, ''),
    spanId: generateSpanId(),
    parentSpanId: headers.get('x-span-id') || undefined,
    sessionId: headers.get('x-session-id') || undefined,
    userId: headers.get('x-user-id') || undefined,
    module: headers.get('x-module') || undefined,
    timestamp: Date.now()
  };
}

/**
 * Create response headers with trace context
 */
export function createTraceResponseHeaders(context: TraceContext): Record<string, string> {
  return {
    'x-trace-id': context.traceId,
    'x-span-id': context.spanId,
    'x-parent-span-id': context.parentSpanId || '',
    'x-processing-time': (Date.now() - context.timestamp).toString()
  };
}

/**
 * Structured logger for Edge Functions
 */
export class EdgeLogger {
  private context: TraceContext;
  private functionName: string;

  constructor(functionName: string, context: TraceContext) {
    this.functionName = functionName;
    this.context = context;
  }

  private formatLog(level: string, message: string, data?: Record<string, unknown>): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      function: this.functionName,
      traceId: this.context.traceId,
      spanId: this.context.spanId,
      parentSpanId: this.context.parentSpanId,
      sessionId: this.context.sessionId,
      userId: this.context.userId,
      module: this.context.module,
      message,
      ...data
    });
  }

  info(message: string, data?: Record<string, unknown>): void {
    console.log(this.formatLog('info', message, data));
  }

  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(this.formatLog('warn', message, data));
  }

  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    console.error(this.formatLog('error', message, {
      ...data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    }));
  }

  debug(message: string, data?: Record<string, unknown>): void {
    console.debug(this.formatLog('debug', message, data));
  }

  /**
   * Log request start
   */
  logRequest(method: string, path: string): void {
    this.info('Request started', { method, path });
  }

  /**
   * Log request completion
   */
  logResponse(status: number, durationMs: number): void {
    const level = status >= 400 ? 'error' : 'info';
    const log = this.formatLog(level, 'Request completed', { 
      status, 
      durationMs,
      processingTime: `${durationMs}ms`
    });
    
    if (status >= 400) {
      console.error(log);
    } else {
      console.log(log);
    }
  }
}

/**
 * Create a traced Edge Function handler
 */
export function createTracedHandler(
  functionName: string,
  handler: (
    req: Request,
    context: TraceContext,
    logger: EdgeLogger
  ) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const context = extractTraceContext(req);
    const logger = new EdgeLogger(functionName, context);
    
    const url = new URL(req.url);
    logger.logRequest(req.method, url.pathname);
    
    try {
      const response = await handler(req, context, logger);
      
      // Add trace headers to response
      const traceHeaders = createTraceResponseHeaders(context);
      const headers = new Headers(response.headers);
      
      Object.entries(traceHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      const duration = Date.now() - context.timestamp;
      logger.logResponse(response.status, duration);
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (error) {
      const duration = Date.now() - context.timestamp;
      logger.error('Request failed', error as Error);
      logger.logResponse(500, duration);
      
      const traceHeaders = createTraceResponseHeaders(context);
      
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal server error',
          traceId: context.traceId
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...traceHeaders
          }
        }
      );
    }
  };
}

/**
 * Middleware to add tracing to existing handlers
 */
export function withTracing(
  functionName: string,
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return createTracedHandler(functionName, async (req, context, logger) => {
    // Store context in request for access in handler
    (req as any).__traceContext = context;
    (req as any).__logger = logger;
    
    return handler(req);
  });
}

/**
 * Get trace context from request (for use in handler)
 */
export function getTraceContext(req: Request): TraceContext | undefined {
  return (req as any).__traceContext;
}

/**
 * Get logger from request (for use in handler)
 */
export function getLogger(req: Request): EdgeLogger | undefined {
  return (req as any).__logger;
}
