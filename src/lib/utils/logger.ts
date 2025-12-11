/**
 * Logger Universal - PATCH 65.0
 * Sistema centralizado de logs com níveis e contexto
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "ai" | "module";

interface LogContext {
  module?: string;
  action?: string;
  data?: unknown;
}

class UniversalLogger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${level.toUpperCase()}]`;
    const moduleInfo = context?.module ? `[${context.module}]` : "";
    return `${timestamp} ${prefix}${moduleInfo} ${message}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const formatted = this.formatMessage(level, message, context);
    
    switch (level) {
    case "debug":
      if (this.isDevelopment)       break;
    case "info":
      break;
    case "warn":
      break;
    case "error":
      break;
    case "ai":
      break;
    case "module":
      break;
    }
  }

  debug(message: string, data?: unknown, module?: string) {
    this.log("debug", message, { module, data });
  }

  info(message: string, data?: unknown, module?: string) {
    this.log("info", message, { module, data });
  }

  warn(message: string, data?: unknown, module?: string) {
    this.log("warn", message, { module, data });
  }

  error(message: string, error?: unknown, module?: string) {
    this.log("error", message, { module, data: error });
  }

  ai(message: string, data?: unknown) {
    this.log("ai", message, { data });
  }

  module(moduleName: string, message: string, data?: unknown) {
    this.log("module", message, { module: moduleName, data });
  }

  // Compatibility with old Logger.startTimer
  startTimer(label: string) {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info(`${label} completed`, { duration: `${duration.toFixed(2)}ms` });
    };
  }
}

export const Logger = new UniversalLogger();
