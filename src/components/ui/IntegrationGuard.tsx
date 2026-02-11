/**
 * IntegrationGuard - Protects modules awaiting external integration
 * Shows clear demo mode status instead of hiding functionality
 */
import { AlertTriangle, ExternalLink, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface IntegrationGuardProps {
  moduleName: string;
  integrationRequired: string;
  description?: string;
  docsUrl?: string;
  children: React.ReactNode;
}

export function IntegrationGuard({
  moduleName,
  integrationRequired,
  description,
  docsUrl,
  children,
}: IntegrationGuardProps) {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <Alert className="border-warning/50 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertTitle className="flex items-center gap-2">
          <span>Modo Demonstração</span>
          <Badge variant="outline" className="text-xs border-warning/50 text-warning">
            DEMO
          </Badge>
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>{moduleName}</strong> está operando em modo demonstração.
            {description && ` ${description}`}
          </p>
          <p className="text-sm text-muted-foreground">
            <Shield className="inline h-3.5 w-3.5 mr-1" />
            <strong>Integração necessária:</strong> {integrationRequired}
          </p>
          <div className="flex gap-2 mt-3">
            {docsUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={docsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Documentação
                </a>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/integrations')}>
              <Settings className="h-3.5 w-3.5 mr-1" />
              Configurar Integração
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      {children}
    </div>
  );
}

/**
 * IntegrationStatusBadge - Shows integration status inline
 */
export function IntegrationStatusBadge({ 
  status = 'demo' 
}: { 
  status?: 'connected' | 'demo' | 'error' 
}) {
  const config = {
    connected: { label: 'Conectado', className: 'bg-success/10 text-success border-success/30' },
    demo: { label: 'Demo', className: 'bg-warning/10 text-warning border-warning/30' },
    error: { label: 'Erro', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  };
  
  const { label, className } = config[status];
  
  return (
    <Badge variant="outline" className={`text-xs ${className}`}>
      {label}
    </Badge>
  );
}
