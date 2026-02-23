/**
 * ModuleGate Component v2
 * Conditionally renders content based on module access
 * Includes request access workflow for non-admin users
 */

import { ReactNode, useState } from 'react';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { Lock, Sparkles, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  const { hasAccess, canUpgrade, modules, isLoading, requestAccess } = useModuleAccess();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [requested, setRequested] = useState(false);
  const [sending, setSending] = useState(false);
  
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

  const handleRequest = async () => {
    setSending(true);
    await requestAccess(module, reason);
    setRequested(true);
    setSending(false);
  };
  
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-lg w-full border-dashed border-2 bg-muted/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-warning" />
            Módulo Bloqueado
          </CardTitle>
          <CardDescription className="text-base">
            <strong>{moduleInfo?.name || module}</strong> não está disponível no seu acesso atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {moduleInfo?.description || 'Este módulo requer aprovação do administrador.'}
          </p>
          
          {moduleInfo && (moduleInfo.price_addon_brl > 0) && (
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-sm">
                R$ {moduleInfo.price_addon_brl}/navio/mês
              </Badge>
              <Badge variant="outline" className="text-sm">
                US$ {moduleInfo.price_addon_usd}/vessel/mo
              </Badge>
            </div>
          )}

          {requested ? (
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <CheckCircle className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium text-foreground">
                Solicitação enviada com sucesso!
              </p>
              <p className="text-xs text-muted-foreground">
                O administrador receberá sua solicitação e poderá aprovar o acesso.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder="Descreva por que você precisa de acesso a este módulo... (opcional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="text-sm"
                rows={3}
              />
              <Button
                onClick={handleRequest}
                disabled={sending}
                className="gap-2 w-full"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Enviando...' : 'Solicitar Acesso ao Administrador'}
              </Button>
            </div>
          )}

          {canUpgrade(module) && (
            <Button 
              variant="outline"
              onClick={() => navigate('/billing')}
              className="gap-2 mt-2"
            >
              <Sparkles className="h-4 w-4" />
              Ver Planos
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
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
