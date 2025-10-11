import { toast } from "@/hooks/use-toast";

export interface AppError {
  message: string;
  code?: string;
  severity: "info" | "warning" | "error" | "critical";
  details?: unknown;
}

/**
 * Sistema centralizado de tratamento de erros
 */
export class ErrorHandler {
  private static logError(error: AppError) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${error.severity.toUpperCase()}] ${error.message}`;
    
    if (error.severity === "error" || error.severity === "critical") {
      console.error(logMessage, error.details);
    } else if (error.severity === "warning") {
      console.warn(logMessage, error.details);
    } else {
      console.info(logMessage, error.details);
    }
  }

  private static showToast(error: AppError) {
    const variant = error.severity === "error" || error.severity === "critical" 
      ? "destructive" 
      : "default";

    toast({
      title: this.getSeverityTitle(error.severity),
      description: error.message,
      variant,
    });
  }

  private static getSeverityTitle(severity: AppError["severity"]): string {
    switch (severity) {
      case "critical":
        return "Erro Crítico";
      case "error":
        return "Erro";
      case "warning":
        return "Atenção";
      case "info":
        return "Informação";
    }
  }

  /**
   * Manipula um erro da aplicação
   */
  static handle(error: AppError | Error | unknown, showToastNotification = true) {
    let appError: AppError;

    if (error instanceof Error) {
      appError = {
        message: error.message,
        severity: "error",
        details: error.stack,
      };
    } else if (typeof error === "object" && error !== null && "message" in error) {
      appError = error as AppError;
    } else {
      appError = {
        message: "Ocorreu um erro desconhecido",
        severity: "error",
        details: error,
      };
    }

    this.logError(appError);

    if (showToastNotification) {
      this.showToast(appError);
    }

    return appError;
  }

  /**
   * Manipula erros do Supabase
   */
  static handleSupabaseError(error: unknown, context?: string) {
    const message = context 
      ? `Erro ao ${context}` 
      : "Erro na operação do banco de dados";

    return this.handle({
      message,
      severity: "error",
      details: error,
    });
  }

  /**
   * Manipula erros de rede
   */
  static handleNetworkError(error: unknown, context?: string) {
    const message = context 
      ? `Erro de conexão ao ${context}` 
      : "Erro de conexão. Verifique sua internet.";

    return this.handle({
      message,
      severity: "warning",
      details: error,
    });
  }

  /**
   * Manipula erros de validação
   */
  static handleValidationError(message: string, details?: unknown) {
    return this.handle({
      message,
      severity: "warning",
      details,
    });
  }

  /**
   * Cria um wrapper para funções assíncronas com tratamento de erro
   */
  static async wrap<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.handleSupabaseError(error, context);
      return null;
    }
  }
}
