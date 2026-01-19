/**
 * Logging utilities for Edge Functions
 * @module _shared/logger
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  functionName?: string;
  userId?: string;
  organizationId?: string;
  duration_ms?: number;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Create structured log entry
 */
export function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Partial<LogEntry>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };
}

/**
 * Logger class for edge functions
 */
export class Logger {
  private functionName: string;
  private requestId: string;
  private userId?: string;
  private organizationId?: string;
  private startTime: number;

  constructor(functionName: string, requestId?: string) {
    this.functionName = functionName;
    this.requestId = requestId || crypto.randomUUID();
    this.startTime = Date.now();
  }

  setUser(userId: string, organizationId?: string) {
    this.userId = userId;
    this.organizationId = organizationId;
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const entry = createLogEntry(level, message, {
      functionName: this.functionName,
      requestId: this.requestId,
      userId: this.userId,
      organizationId: this.organizationId,
      duration_ms: Date.now() - this.startTime,
      data,
    });

    const output = JSON.stringify(entry);

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error, data?: Record<string, unknown>) {
    const entry = createLogEntry('error', message, {
      functionName: this.functionName,
      requestId: this.requestId,
      userId: this.userId,
      organizationId: this.organizationId,
      duration_ms: Date.now() - this.startTime,
      data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    });

    console.error(JSON.stringify(entry));
  }

  getRequestId(): string {
    return this.requestId;
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Create logger for edge function
 */
export function createLogger(functionName: string, req?: Request): Logger {
  const requestId = req?.headers.get('x-request-id') || crypto.randomUUID();
  return new Logger(functionName, requestId);
}

/**
 * Performance tracking helper
 */
export function trackPerformance<T>(
  logger: Logger,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  
  return fn()
    .then((result) => {
      logger.debug(`${operation} completed`, { duration_ms: Date.now() - start });
      return result;
    })
    .catch((error) => {
      logger.error(`${operation} failed`, error, { duration_ms: Date.now() - start });
      throw error;
    });
}
