/**
 * FASE 3.3 - Module Error Fallback
 * Fallback UI para erros em módulos específicos
 */

import React from 'react';
import { AlertOctagon, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export interface ModuleErrorFallbackProps {
  error: Error;
  moduleName?: string;
  resetError?: () => void;
  allowBack?: boolean;
}

export const ModuleErrorFallback: React.FC<ModuleErrorFallbackProps> = ({
  error,
  moduleName = 'Módulo',
  resetError,
  allowBack = true,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-xl shadow-md">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
              <AlertOctagon className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Erro no {moduleName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Este módulo encontrou um problema e não pode ser carregado.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Error Message */}
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              <strong>Mensagem:</strong> {error.message || 'Erro desconhecido'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Sugestões:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>Tente recarregar o módulo</li>
              <li>Volte e tente novamente</li>
              <li>Limpe o cache do navegador</li>
              <li>Se o problema persistir, contate o suporte</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 justify-center">
          {resetError && (
            <Button
              onClick={resetError}
              variant="default"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Módulo
            </Button>
          )}
          
          {allowBack && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
