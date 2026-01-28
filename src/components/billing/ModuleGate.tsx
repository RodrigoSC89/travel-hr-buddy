/**
 * Module Gate Component
 * Renders children only if user has access to the specified module
 */

import React from 'react';
import { useModuleAccess } from '@/hooks/use-module-access';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface ModuleGateProps {
  module: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function ModuleGate({
  module,
  children,
  fallback,
  showUpgradePrompt = true
}: ModuleGateProps) {
  const { data: hasAccess, isLoading } = useModuleAccess(module);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">Módulo Premium</CardTitle>
        <CardDescription>
          Este módulo não está incluído no seu plano atual
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-6">
          Faça upgrade do seu plano ou adicione este módulo para desbloquear
          todas as funcionalidades.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/pricing')}
          >
            Ver Planos
          </Button>
          <Button
            onClick={() => navigate('/pricing')}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Fazer Upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Higher-order component for module access protection
 */
export function withModuleAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  moduleSlug: string
) {
  return function ModuleProtectedComponent(props: P) {
    return (
      <ModuleGate module={moduleSlug}>
        <WrappedComponent {...props} />
      </ModuleGate>
    );
  };
}

export default ModuleGate;
