import React, { useEffect, useState } from "react";
import { AlertTriangle, X, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ErrorInfo {
  module: string;
  timestamp: string;
  error: string;
  stack?: string;
  retries: number;
  timeout: number;
}

export const ErrorDebugBanner: React.FC = () => {
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showStack, setShowStack] = useState(false);

  useEffect(() => {
    // Check for errors on mount and every 2 seconds
    const checkErrors = () => {
      try {
        const stored = localStorage.getItem('safeLazyImport:lastError');
        if (stored) {
          const parsed = JSON.parse(stored) as ErrorInfo;
          // Only show errors from last 5 minutes
          const errorAge = Date.now() - new Date(parsed.timestamp).getTime();
          if (errorAge < 5 * 60 * 1000) {
            setErrorInfo(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to read error debug info', err);
      }
    };

    checkErrors();
    const interval = setInterval(checkErrors, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    if (errorInfo) {
      navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2));
    }
  };

  const handleClear = () => {
    localStorage.removeItem('safeLazyImport:lastError');
    setErrorInfo(null);
    setIsDismissed(true);
  };

  if (!errorInfo || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom-4">
      <Card className="border-destructive bg-destructive/10 backdrop-blur-sm shadow-lg">
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-destructive">Erro de Carregamento</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(errorInfo.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Error Details */}
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Módulo:</span>{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                {errorInfo.module}
              </code>
            </div>
            <div className="text-sm">
              <span className="font-medium">Erro:</span>{" "}
              <span className="text-destructive">{errorInfo.error}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {errorInfo.retries} tentativas • {errorInfo.timeout}ms timeout
            </div>
          </div>

          {/* Stack Trace (collapsible) */}
          {errorInfo.stack && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowStack(!showStack)}
              >
                {showStack ? "Ocultar" : "Mostrar"} Stack Trace
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              {showStack && (
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
                  {errorInfo.stack}
                </pre>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleCopy}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copiar Debug Info
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => window.location.reload()}
            >
              Recarregar Página
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground">
            💡 Se o problema persistir, compartilhe o Debug Info com o suporte
          </p>
        </div>
      </Card>
    </div>
  );
};
