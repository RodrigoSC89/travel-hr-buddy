/**
 * Structured Logging System
 * Centralized logging with levels, context, and remote reporting
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  tags?: string[];
  userId?: string;
  sessionId?: string;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  batchSize: number;
  flushInterval: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class StructuredLogger {
  private config: LoggerConfig = {
    minLevel: import.meta.env.DEV ? 'debug' : 'info',
    enableConsole: true,
    enableRemote: import.meta.env.PROD,
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
  };
  private buffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private userId?: string;
  private globalContext: Record<string, any> = {};

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Configure logger
   */
  configure(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set user ID for all logs
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Set global context
   */
  setContext(context: Record<string, any>) {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    tags?: string[]
  ) {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.globalContext, ...context },
      tags,
      userId: this.userId,
      sessionId: this.sessionId,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Buffer for remote
    if (this.config.enableRemote) {
      this.buffer.push(entry);
      if (this.buffer.length >= this.config.batchSize) {
        this.flush();
      }
    }
  }

  private logToConsole(entry: LogEntry) {
    const style = {
      debug: 'color: gray',
      info: 'color: blue',
      warn: 'color: orange',
      error: 'color: red; font-weight: bold',
    };

    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
    }
    if (entry.error) {
    }
    if (entry.tags) {
    }
  }

  private startFlushTimer() {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
  }

  /**
   * Flush logs to remote endpoint
   */
  async flush() {
    if (this.buffer.length === 0 || !this.config.remoteEndpoint) return;

    const logs = [...this.buffer];
    this.buffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
        keepalive: true,
      });
    } catch (error) {
      // Re-add to buffer on failure
      this.buffer = [...logs, ...this.buffer].slice(-100);
      console.warn('[Logger] Failed to flush logs:', error);
      console.warn('[Logger] Failed to flush logs:', error);
    }
  }

  // Convenience methods
  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>, tags?: string[]) {
    this.log('info', message, context, undefined, tags);
  }

  warn(message: string, context?: Record<string, any>, tags?: string[]) {
    this.log('warn', message, context, undefined, tags);
  }

  error(message: string, error?: Error, context?: Record<string, any>, tags?: string[]) {
    this.log('error', message, context, error, tags);
  }

  /**
   * Create child logger with additional context
   */
  child(context: Record<string, any>): ChildLogger {
    return new ChildLogger(this, context);
  }
}

class ChildLogger {
  constructor(
    private parent: StructuredLogger,
    private context: Record<string, any>
  ) {}

  debug(message: string, context?: Record<string, any>) {
    this.parent.debug(message, { ...this.context, ...context });
  }

  info(message: string, context?: Record<string, any>, tags?: string[]) {
    this.parent.info(message, { ...this.context, ...context }, tags);
  }

  warn(message: string, context?: Record<string, any>, tags?: string[]) {
    this.parent.warn(message, { ...this.context, ...context }, tags);
  }

  error(message: string, error?: Error, context?: Record<string, any>, tags?: string[]) {
    this.parent.error(message, error, { ...this.context, ...context }, tags);
  }
}

export const logger = new StructuredLogger();

/**
 * Module-specific loggers
 */
export const createModuleLogger = (moduleName: string) => {
  return logger.child({ module: moduleName });
};
