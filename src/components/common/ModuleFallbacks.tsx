import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ModuleFallbackProps {
  moduleName: string;
  error?: Error | null;
  retry?: () => void;
}

export const ModuleLoadingFallback: React.FC<{ moduleName: string }> = ({ moduleName }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando {moduleName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto o módulo está sendo carregado...
          </p>
          <div className="mt-4 space-y-2">
            <div className="h-2 bg-primary/20 rounded animate-pulse" />
            <div className="h-2 bg-primary/10 rounded animate-pulse delay-75" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ModuleErrorFallback: React.FC<ModuleFallbackProps> = ({ 
  moduleName, 
  error, 
  retry 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Erro ao Carregar {moduleName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Este módulo não pôde ser carregado devido a um erro.
          </p>
          {error && (
            <div className="p-3 bg-destructive/10 rounded text-xs font-mono">
              {error.message}
            </div>
          )}
          <div className="flex gap-2">
            {retry && (
              <Button onClick={retry} variant="outline" size="sm">
                Tentar Novamente
              </Button>
            )}
            <Button 
              onClick={() => window.location.reload()} 
              variant="secondary" 
              size="sm"
            >
              Recarregar Página
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Skeleton leve para módulos
export const ModuleSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-8 bg-muted rounded w-1/3" />
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="h-24 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
      </div>
    </div>
  );
};

export default {
  Loading: ModuleLoadingFallback,
  Error: ModuleErrorFallback,
  Skeleton: ModuleSkeleton,
};
