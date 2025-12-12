/**
 * UNIFIED Logger - Sistema Centralizado de Logs
 * 
 * Unifica:
 * - src/lib/logger.ts
 * - src/lib/logger/structured-logger.ts
 * - src/lib/utils/logger.ts
 * - src/lib/utils/logger-enhanced.ts
 * - src/lib/ai/ai-logger.ts
 * 
 * Features:
 * - Production-safe: debug/info suprimidos em produção
 * - Structured logging para agregação
 * - Buffer de logs recentes
 * - Timer para performance
 * - Integração com Sentry
 * - Categorias: system, ai, module, api, database
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// ==================== TYPES ====================
export type LogLevel = "debug" | "info" | "warn" | "error" | "critical";
export type LogCategory = "system" | "ai" | "module" | "api" | "database" | "user" | "security";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
  module?: string;
  duration?: number;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  session?: string;
  environment: "development" | "production";
}

interface LoggerConfig {
  enabledLevels: LogLevel[];
  sendToMonitoring: boolean;
  includeStack: boolean;
  maxBufferSize: number;
}

// ==================== EMOJI MAP ====================
const EMOJI_MAP: Record<LogLevel, string> = {
  debug: "🔍",
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
  critical: "🚨",
};

const CATEGORY_EMOJI: Record<LogCategory, string> = {
  system: "⚙️",
  ai: "🧠",
  module: "📦",
  api: "🌐",
  database: "💾",
  user: "👤",
  security: "🔒",
};

// ==================== UNIFIED LOGGER CLASS ====================
class UnifiedLogger {
  private config: LoggerConfig;
  private sessionId: string;
  private logBuffer: LogEntry[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      enabledLevels: isDevelopment 
        ? ["debug", "info", "warn", "error", "critical"] 
        : ["warn", "error", "critical"],
      sendToMonitoring: isProduction,
      includeStack: isDevelopment,
      maxBufferSize: 100,
    });
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabledLevels.includes(level);
  }

  private createEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, unknown>,
    module?: string,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      environment: isDevelopment ? "development" : "production",
      session: this.sessionId,
    });

    if (context && Object.keys(context).length > 0) {
      entry.context = context;
    }

    if (module) {
      entry.module = module;
    }

    if (error) {
      entry.error = {
        message: error.message,
        name: error.name,
      });
      if (this.config.includeStack && error.stack) {
        entry.error.stack = error.stack;
      }
    }

    return entry;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.config.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    if (!this.config.sendToMonitoring || !isProduction) return;

    try {
      if (typeof window !== "undefined") {
        const Sentry = (window as any).Sentry;
        if (Sentry) {
          if (entry.error) {
            Sentry.captureMessage(entry.message, {
              level: entry.level === "critical" ? "fatal" : entry.level,
              extra: {
                ...entry.context,
                category: entry.category,
                module: entry.module,
                timestamp: entry.timestamp,
                session: entry.session,
              },
            });
          }
        }
      }
    } catch {
      // Fail silently
    }
  }

  private output(entry: LogEntry): void {
    // In production, only output errors and warnings
    if (isProduction && !["error", "critical", "warn"].includes(entry.level)) {
      return;
    }

    const emoji = EMOJI_MAP[entry.level];
    const catEmoji = CATEGORY_EMOJI[entry.category];
    const prefix = `${emoji} ${catEmoji} [${entry.level.toUpperCase()}]${entry.module ? `[${entry.module}]` : ""}`;

    const consoleMethod = entry.level === "critical" ? console.error : console[entry.level] || console.log;

    if (isDevelopment) {
      if (entry.context || entry.error) {
        consoleMethod(prefix, entry.message, { context: entry.context, error: entry.error });
      } else {
        consoleMethod(prefix, entry.message);
      }
    } else {
      // Production: structured JSON
    }
  }

  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, unknown>,
    module?: string,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createEntry(level, category, message, context, module, error);
    this.addToBuffer(entry);
    this.output(entry);

    if (level === "error" || level === "critical" || level === "warn") {
      this.sendToMonitoring(entry);
    }
  }

  // ==================== PUBLIC API ====================

  debug(message: string, context?: Record<string, unknown>, module?: string): void {
    this.log("debug", "system", message, context, module);
  }

  info(message: string, context?: Record<string, unknown>, module?: string): void {
    this.log("info", "system", message, context, module);
  }

  warn(message: string, context?: Record<string, unknown>, module?: string): void {
    this.log("warn", "system", message, context, module);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>, module?: string): void {
    const errorObj = error instanceof Error ? error : undefined;
    const errorContext = error && !(error instanceof Error) 
      ? { ...context, rawError: error } 
      : context;
    this.log("error", "system", message, errorContext, module, errorObj);
  }

  critical(message: string, error?: Error | unknown, context?: Record<string, unknown>, module?: string): void {
    const errorObj = error instanceof Error ? error : undefined;
    const errorContext = error && !(error instanceof Error) 
      ? { ...context, rawError: error } 
      : context;
    this.log("critical", "system", message, errorContext, module, errorObj);
  }

  // Category-specific methods
  ai(message: string, context?: Record<string, unknown>, module?: string): void {
    this.log("info", "ai", message, context, module);
  }

  module(moduleName: string, message: string, context?: Record<string, unknown>): void {
    this.log("info", "module", message, context, moduleName);
  }

  api(endpoint: string, method: string, status: number, duration?: number): void {
    const level: LogLevel = status >= 400 ? "error" : "info";
    this.log(level, "api", `${method} ${endpoint}`, { status, duration });
  }

  database(operation: string, table: string, duration?: number, error?: Error): void {
    const level: LogLevel = error ? "error" : "debug";
    this.log(level, "database", `${operation} on ${table}`, { duration }, undefined, error);
  }

  security(message: string, context?: Record<string, unknown>): void {
    this.log("warn", "security", message, context);
  }

  user(action: string, context?: Record<string, unknown>): void {
    this.log("info", "user", action, context);
  }

  // ==================== UTILITIES ====================

  startTimer(label: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`Timer: ${label}`, { duration_ms: parseFloat(duration.toFixed(2)) });
      return duration;
    });
  }

  getRecentLogs(limit: number = 50): LogEntry[] {
    return this.logBuffer.slice(-limit);
  }

  clearBuffer(): void {
    this.logBuffer = [];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Legacy compatibility
  logCaughtError(message: string, error: unknown, context?: Record<string, unknown>): void {
    this.error(message, error, context);
  }

  table(data: unknown): void {
    if (isDevelopment) {
    }
  }
}

// ==================== SINGLETON EXPORT ====================
export const logger = new UnifiedLogger();

// Legacy aliases
export const Logger = logger;
export const structuredLogger = logger;
export const aiLogger = logger;

// Type exports
export type { UnifiedLogger };

// Helper function for module-specific loggers
export function createModuleLogger(moduleName: string) {
  return {
    debug: (message: string, context?: Record<string, unknown>) => 
      logger.debug(message, context, moduleName),
    info: (message: string, context?: Record<string, unknown>) => 
      logger.info(message, context, moduleName),
    warn: (message: string, context?: Record<string, unknown>) => 
      logger.warn(message, context, moduleName),
    error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => 
      logger.error(message, error, context, moduleName),
    startTimer: (label: string) => logger.startTimer(`[${moduleName}] ${label}`),
  };
}
