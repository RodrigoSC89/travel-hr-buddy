/**
 * ErrorState - Componente Unificado para Estados de Erro
 * Exibe erros com opção de retry e mensagens claras
 */

import type { FC } from "react";
import { AlertCircle, RefreshCw, WifiOff, ServerOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  error: Error | string | null;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  variant?: "default" | "compact" | "inline";
  showIcon?: boolean;
}

type ErrorType = "network" | "server" | "auth" | "generic";

function getErrorType(error: Error | string | null): ErrorType {
  if (!error) return "generic";
  
  const message = typeof error === "string" ? error : error.message;
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("network") || lowerMessage.includes("offline") || lowerMessage.includes("fetch")) {
    return "network";
  }
  if (lowerMessage.includes("500") || lowerMessage.includes("server") || lowerMessage.includes("internal")) {
    return "server";
  }
  if (lowerMessage.includes("401") || lowerMessage.includes("403") || lowerMessage.includes("auth") || lowerMessage.includes("permission")) {
    return "auth";
  }
  return "generic";
}

function getErrorIcon(type: ErrorType) {
  switch (type) {
    case "network":
      return WifiOff;
    case "server":
      return ServerOff;
    case "auth":
      return ShieldAlert;
    default:
      return AlertCircle;
  }
}

function getErrorTitle(type: ErrorType, customTitle?: string): string {
  if (customTitle) return customTitle;
  
  switch (type) {
    case "network":
      return "Erro de Conexão";
    case "server":
      return "Erro no Servidor";
    case "auth":
      return "Acesso Negado";
    default:
      return "Erro ao Carregar";
  }
}

function getErrorMessage(error: Error | string | null): string {
  if (!error) return "Ocorreu um erro inesperado. Tente novamente.";
  
  const message = typeof error === "string" ? error : error.message;
  
  // Sanitize technical messages for user display
  if (message.includes("Failed to fetch")) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão.";
  }
  if (message.includes("500")) {
    return "O servidor encontrou um erro. Nossa equipe foi notificada.";
  }
  if (message.includes("401") || message.includes("403")) {
    return "Você não tem permissão para acessar este recurso.";
  }
  
  return message;
}

export const ErrorState: FC<ErrorStateProps> = ({
  error,
  title,
  onRetry,
  retryLabel = "Tentar Novamente",
  className,
  variant = "default",
  showIcon = true,
}) => {
  const errorType = getErrorType(error);
  const Icon = getErrorIcon(errorType);
  const errorTitle = getErrorTitle(errorType, title);
  const errorMessage = getErrorMessage(error);

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive",
          className
        )}
        role="alert"
      >
        {showIcon && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
        <span className="text-sm">{errorMessage}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/20"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-6 text-center",
          className
        )}
        role="alert"
      >
        {showIcon && (
          <div className="mb-3 p-2 rounded-full bg-destructive/10">
            <Icon className="w-6 h-6 text-destructive" />
          </div>
        )}
        <h3 className="text-base font-semibold text-foreground mb-1">{errorTitle}</h3>
        <p className="text-sm text-muted-foreground mb-3 max-w-sm">{errorMessage}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
      role="alert"
    >
      {showIcon && (
        <div className="mb-6 p-4 rounded-full bg-destructive/10">
          <Icon className="w-12 h-12 text-destructive" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-foreground mb-2">{errorTitle}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{errorMessage}</p>
      {onRetry && (
        <Button
          variant="default"
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
