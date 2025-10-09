import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useServiceIntegrations } from "@/hooks/use-service-integrations";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const ServiceStatusPanel: React.FC = () => {
  const { services, isChecking, checkServiceHealth, checkAllServices } = useServiceIntegrations();

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "connected":
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    case "error":
      return <XCircle className="h-5 w-5 text-destructive" />;
    default:
      return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "connected":
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success">
            Conectado
        </Badge>
      );
    case "error":
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive"
        >
            Erro
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
            Desconectado
        </Badge>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Status de Integrações</CardTitle>
            <CardDescription>Monitoramento de serviços externos</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkAllServices}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isChecking && "animate-spin")} />
            Verificar Tudo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum serviço configurado
            </p>
          )}
          {services.map(service => (
            <div
              key={service.key}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  {service.lastCheck && (
                    <p className="text-xs text-muted-foreground">
                      Última verificação: {new Date(service.lastCheck).toLocaleTimeString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(service.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => checkServiceHealth(service.key)}
                  disabled={isChecking}
                  className="h-8"
                >
                  <RefreshCw className={cn("h-3 w-3", isChecking && "animate-spin")} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
