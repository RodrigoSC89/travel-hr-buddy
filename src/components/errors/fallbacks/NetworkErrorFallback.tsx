/**
 * FASE 3.3 - Network Error Fallback
 * Fallback UI específico para erros de rede
 */

import React from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export interface NetworkErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  onRetry?: () => void;
}

export const NetworkErrorFallback: React.FC<NetworkErrorFallbackProps> = ({
  error,
  resetError,
  onRetry,
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      if (onRetry) {
        await onRetry();
      } else if (resetError) {
        resetError();
      } else {
        window.location.reload();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <WifiOff className="w-12 h-12 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Sem Conexão
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Não foi possível conectar ao servidor. Verifique sua conexão com a internet.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className={`flex items-center gap-3 p-4 rounded-lg ${
            isOnline 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
          }`}>
            <AlertCircle className={`w-5 h-5 ${
              isOnline ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
            }`} />
            <div>
              <p className={`text-sm font-semibold ${
                isOnline ? 'text-green-900 dark:text-green-300' : 'text-orange-900 dark:text-orange-300'
              }`}>
                {isOnline ? 'Conexão Detectada' : 'Sem Conexão'}
              </p>
              <p className={`text-xs ${
                isOnline ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'
              }`}>
                {isOnline 
                  ? 'Sua conexão com a internet foi restabelecida. Tente novamente.'
                  : 'Verifique seu Wi-Fi ou dados móveis e tente novamente.'
                }
              </p>
            </div>
          </div>

          {/* Troubleshooting Tips */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Como resolver:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>Verifique se o Wi-Fi ou dados móveis estão ativos</li>
              <li>Tente recarregar a página</li>
              <li>Verifique se outros sites estão funcionando</li>
              <li>Reinicie seu roteador, se necessário</li>
            </ul>
          </div>

          {error && (
            <details className="text-xs text-gray-500 dark:text-gray-400">
              <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full gap-2"
            size="lg"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Tentando reconectar...' : 'Tentar Novamente'}
          </Button>
          
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            A página tentará reconectar automaticamente quando a conexão for restabelecida.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
