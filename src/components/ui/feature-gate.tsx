/**
 * Feature Gate Component
 * Renderiza conteúdo apenas se feature flag estiver habilitada
 */

import React from 'react';
import { useFeatureFlags, FeatureFlags } from '@/lib/feature-flags';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Construction } from 'lucide-react';

interface FeatureGateProps {
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDisabledMessage?: boolean;
  featureName?: string;
}

export function FeatureGate({ 
  flag, 
  children, 
  fallback,
  showDisabledMessage = true,
  featureName
}: FeatureGateProps) {
  const flags = useFeatureFlags();
  const isEnabled = flags[flag];
  
  if (isEnabled) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showDisabledMessage) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Construction className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">
            {featureName || 'Funcionalidade'} Desabilitada
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            Esta funcionalidade está temporariamente desabilitada. 
            Entre em contato com o administrador para mais informações.
          </p>
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-3 w-3" />
            Feature Flag: {flag}
          </Badge>
        </CardContent>
      </Card>
    );
  }
  
  return null;
}

/**
 * HOC para proteger páginas inteiras com feature flag
 */
export function withFeatureGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  flag: keyof FeatureFlags,
  featureName?: string
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGate flag={flag} featureName={featureName}>
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };
}

export default FeatureGate;
