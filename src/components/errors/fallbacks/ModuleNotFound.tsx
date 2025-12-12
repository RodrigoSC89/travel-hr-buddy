/**
import { useEffect, useCallback } from "react";;
 * FASE A2 - Module Not Found Fallback
 * Fallback elegante para módulos não encontrados
 */

import React from "react";
import { PackageX, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";

export interface ModuleNotFoundProps {
  moduleName?: string;
  moduleId?: string;
  error?: Error;
}

export const ModuleNotFound: React.FC<ModuleNotFoundProps> = ({
  moduleName = "Módulo",
  moduleId,
  error,
}) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    logger.error("Module Not Found:", {
      moduleName,
      moduleId,
      error: error?.message,
    });
  }, [moduleName, moduleId, error]);

  return (
    <div className="flex items-center justify-center min-h-[600px] bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl shadow-xl border-2 border-muted">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex justify-center">
            <div className="p-5 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <PackageX className="w-16 h-16 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Módulo Não Encontrado
            </h1>
            <h2 className="text-lg font-semibold text-muted-foreground mt-2">
              {moduleName}
            </h2>
            {moduleId && (
              <p className="text-sm text-muted-foreground mt-1">
                ID: <code className="bg-muted px-2 py-0.5 rounded">{moduleId}</code>
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
              ⚠️ Possíveis causas:
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1.5 list-disc list-inside">
              <li>O módulo foi desativado ou removido temporariamente</li>
              <li>Erro no carregamento do componente</li>
              <li>Módulo ainda em desenvolvimento</li>
              <li>Permissões insuficientes para acessar este módulo</li>
            </ul>
          </div>

          {error && process.env.NODE_ENV === "development" && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground mb-2 font-semibold">
                🔧 Detalhes técnicos (desenvolvimento)
              </summary>
              <pre className="p-3 bg-muted rounded-lg overflow-auto max-h-32 text-xs">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              💡 O que fazer:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Voltar para o dashboard principal</li>
              <li>Buscar por outros módulos disponíveis</li>
              <li>Entrar em contato com o suporte técnico se o problema persistir</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-center pt-4">
          <Button
            onClick={() => handlenavigate}
            variant="default"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
          
          <Button
            onClick={() => handlenavigate}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <Button
            onClick={() => handlenavigate}
            variant="outline"
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar Módulos
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
