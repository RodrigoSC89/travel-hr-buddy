/**
 * FASE 3.3 - Route Error Fallback
 * Fallback UI para erros de rota
 */

import React from 'react';
import { MapPinOff, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export interface RouteErrorFallbackProps {
  error?: Error;
  statusCode?: number;
}

export const RouteErrorFallback: React.FC<RouteErrorFallbackProps> = ({
  error,
  statusCode = 404,
}) => {
  const navigate = useNavigate();

  const getErrorContent = () => {
    switch (statusCode) {
      case 404:
        return {
          title: 'Página Não Encontrada',
          message: 'A página que você está procurando não existe ou foi movida.',
          icon: MapPinOff,
        };
      case 403:
        return {
          title: 'Acesso Negado',
          message: 'Você não tem permissão para acessar esta página.',
          icon: MapPinOff,
        };
      case 500:
        return {
          title: 'Erro do Servidor',
          message: 'Algo deu errado no servidor. Estamos trabalhando para resolver.',
          icon: MapPinOff,
        };
      default:
        return {
          title: 'Erro na Rota',
          message: 'Ocorreu um erro ao carregar esta página.',
          icon: MapPinOff,
        };
    }
  };

  const content = getErrorContent();
  const Icon = content.icon;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Icon className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {statusCode}
            </h1>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-2">
              {content.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {content.message}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <details className="text-xs text-gray-500 dark:text-gray-400">
              <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 mb-2">
                Detalhes técnicos
              </summary>
              <pre className="p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              O que você pode fazer:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Voltar para a página inicial</li>
              <li>Verificar a URL e tentar novamente</li>
              <li>Usar a busca para encontrar o que procura</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => navigate('/')}
            variant="default"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Ir para Início
          </Button>
          
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Voltar
          </Button>

          <Button
            onClick={() => navigate('/search')}
            variant="outline"
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Buscar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
