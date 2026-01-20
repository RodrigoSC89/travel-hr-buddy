/**
 * Error Recovery Component
 * Provides user-friendly error handling with recovery options
 * 
 * PATCH iOS PWA: Removido tipo 'network' para evitar mensagem "Problema de Conexão"
 * que causa falsos positivos no iOS Safari PWA
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, RefreshCw, Home,
  ServerOff, FileWarning, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// PATCH iOS PWA: Removido 'network' - causa falsos positivos
export type ErrorType = 'server' | 'data' | 'unknown';

interface ErrorRecoveryProps {
  error?: Error | null;
  errorType?: ErrorType;
  onRetry?: () => void | Promise<void>;
  onReset?: () => void;
  className?: string;
  compact?: boolean;
}

// PATCH iOS PWA: Removido config 'network' com "Problema de Conexão"
const errorConfig = {
  server: {
    icon: ServerOff,
    title: 'Erro no Servidor',
    description: 'O servidor encontrou um problema. Nossa equipe foi notificada.',
    color: 'text-red-500',
  },
  data: {
    icon: FileWarning,
    title: 'Erro ao Carregar Dados',
    description: 'Não foi possível carregar os dados solicitados.',
    color: 'text-yellow-500',
  },
  unknown: {
    icon: AlertTriangle,
    title: 'Algo deu Errado',
    description: 'Ocorreu um erro inesperado. Tente novamente.',
    color: 'text-destructive',
  },
};

function detectErrorType(error?: Error | null): ErrorType {
  if (!error) return 'unknown';
  
  const message = error.message.toLowerCase();
  
  // PATCH iOS PWA: Erros de rede agora mapeiam para 'unknown' com mensagem genérica
  // Não mostrar "Problema de Conexão" pois navigator.onLine não é confiável no iOS PWA
  
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return 'server';
  }
  
  if (message.includes('data') || message.includes('parse') || message.includes('json')) {
    return 'data';
  }
  
  return 'unknown';
}

export function ErrorRecovery({
  error,
  errorType,
  onRetry,
  onReset,
  className,
  compact = false,
}: ErrorRecoveryProps) {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);
  
  const type = errorType ?? detectErrorType(error);
  const config = errorConfig[type];
  const Icon = config.icon;

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    onReset?.();
    navigate('/');
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 p-4 rounded-lg bg-muted', className)}>
        <Icon className={cn('h-5 w-5', config.color)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{config.title}</p>
        </div>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <div className={cn('mx-auto p-3 rounded-full bg-muted mb-4 w-fit', config.color)}>
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle>{config.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-4">{config.description}</p>
        
        {error && import.meta.env.DEV && (
          <details className="text-left text-xs bg-muted p-3 rounded">
            <summary className="cursor-pointer font-medium mb-2">
              Detalhes técnicos
            </summary>
            <pre className="whitespace-pre-wrap break-all text-destructive">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 justify-center">
        {onRetry && (
          <Button onClick={handleRetry} disabled={isRetrying}>
            {isRetrying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Tentando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </>
            )}
          </Button>
        )}
        
        <Button variant="outline" onClick={handleGoHome}>
          <Home className="h-4 w-4 mr-2" />
          Ir para Início
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Inline error message for smaller errors
 */
export function InlineError({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4" />
      <span>{message}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="h-auto py-0 px-1">
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export default ErrorRecovery;
