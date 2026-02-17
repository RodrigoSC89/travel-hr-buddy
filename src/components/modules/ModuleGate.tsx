/**
 * ModuleGate Component
 * Conditionally renders content based on module access
 */

import { ReactNode } from 'react';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface ModuleGateProps {
  module: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function ModuleGate({ 
  module, 
  children, 
  fallback,
  showUpgrade = true 
}: ModuleGateProps) {
  const { hasAccess, canUpgrade, modules, isLoading } = useModuleAccess();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (hasAccess(module)) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (!showUpgrade) {
    return null;
  }
  
  const moduleInfo = modules.find(m => m.slug === module);
  
  return (
    <Card className="border-dashed border-2 bg-muted/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-warning" />
          Módulo Bloqueado
        </CardTitle>
        <CardDescription>
          {moduleInfo?.name || module} não está disponível no seu plano atual
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {moduleInfo?.description || 'Este módulo requer um plano superior.'}
        </p>
        {canUpgrade(module) && (
          <Button 
            onClick={() => navigate('/billing')}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Fazer Upgrade
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Higher-order component for module protection
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
