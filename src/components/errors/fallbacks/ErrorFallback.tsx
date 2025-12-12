/**
import { useState } from "react";;
 * FASE 3.3 - Error Fallback (Genérico)
 * Componente de fallback UI elegante para erros genéricos
 */

import React from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
  showDetails?: boolean;
  title?: string;
  message?: string;
  onReport?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  showDetails = false,
  title = "Algo deu errado",
  message = "Desculpe, ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.",
  onReport,
}) => {
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {message}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error ID */}
          <Alert>
            <AlertDescription className="text-sm font-mono">
              ID do Erro: {error.name || "UnknownError"}-{Date.now()}
            </AlertDescription>
          </Alert>

          {/* Error Details (Collapsible) */}
          {showDetails && (
            <div className="space-y-2">
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
              >
                <Bug className="w-4 h-4" />
                {detailsOpen ? "Ocultar detalhes" : "Mostrar detalhes técnicos"}
              </button>
              
              {detailsOpen && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-auto max-h-64">
                  <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    <strong>Mensagem:</strong> {error.message}
                    {error.stack && (
                      <>
                        {"\n\n"}
                        <strong>Stack Trace:</strong>
                        {"\n"}
                        {error.stack}
                      </>
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              O que fazer agora?
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Tente recarregar a página</li>
              <li>Verifique sua conexão com a internet</li>
              <li>Se o problema persistir, entre em contato com o suporte</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-center">
          {resetError && (
            <Button
              onClick={resetError}
              variant="default"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          )}
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar Página
          </Button>

          <Button
            onClick={handleGoHome}
            variant="outline"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Ir para Início
          </Button>

          {onReport && (
            <Button
              onClick={onReport}
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-400"
            >
              <Bug className="w-4 h-4 mr-2" />
              Reportar Erro
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
