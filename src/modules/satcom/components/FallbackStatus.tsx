/**
 * Fallback Status Component - Patch 142.1
 * Clear UI display for active fallback connections
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  CheckCircle,
  XCircle,
  Radio,
} from "lucide-react";
import type { SatcomConnection } from "../index";
import { cn } from "@/lib/utils";

interface FallbackStatusProps {
  primaryConnection: SatcomConnection | null;
  fallbackConnection: SatcomConnection | null;
  isFallbackActive: boolean;
}

export const FallbackStatus: React.FC<FallbackStatusProps> = ({
  primaryConnection,
  fallbackConnection,
  isFallbackActive,
}) => {
  const getStatusIcon = (status: SatcomConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: SatcomConnection['status']) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'degraded':
        return 'Degradado';
      case 'disconnected':
        return 'Desconectado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Status de Fallback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isFallbackActive ? (
          <Alert variant="default" className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900 dark:text-orange-100">
              Modo Fallback Ativo
            </AlertTitle>
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              Conexão primária indisponível. Sistema operando em modo de backup.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">
              Operação Normal
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              Todas as conexões primárias estão operacionais.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {/* Primary Connection */}
          <div className={cn(
            "p-4 rounded-lg border-2 transition-colors",
            primaryConnection?.status === 'connected' 
              ? "border-green-500 bg-green-50 dark:bg-green-950" 
              : "border-red-500 bg-red-50 dark:bg-red-950"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                <span className="font-semibold">Conexão Primária</span>
              </div>
              <Badge variant={primaryConnection?.status === 'connected' ? 'default' : 'destructive'}>
                Primária
              </Badge>
            </div>
            {primaryConnection ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(primaryConnection.status)}
                  <span className="font-medium">{primaryConnection.name}</span>
                  <Badge variant="outline">{primaryConnection.provider}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Status: {getStatusLabel(primaryConnection.status)}
                </div>
                {primaryConnection.status === 'connected' && (
                  <div className="text-xs text-muted-foreground">
                    Sinal: {primaryConnection.signalStrength.toFixed(0)}% | 
                    Banda: {(primaryConnection.bandwidth / 1000).toFixed(1)} Mbps
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Nenhuma conexão primária configurada
              </div>
            )}
          </div>

          {/* Fallback Connection */}
          {isFallbackActive && fallbackConnection && (
            <div className="p-4 rounded-lg border-2 border-orange-500 bg-orange-50 dark:bg-orange-950">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-semibold">Conexão de Backup (Ativa)</span>
                </div>
                <Badge variant="default" className="bg-orange-600">
                  Fallback Ativo
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(fallbackConnection.status)}
                  <span className="font-medium">{fallbackConnection.name}</span>
                  <Badge variant="outline">{fallbackConnection.provider}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Status: {getStatusLabel(fallbackConnection.status)}
                </div>
                {fallbackConnection.status === 'connected' && (
                  <div className="text-xs text-muted-foreground">
                    Sinal: {fallbackConnection.signalStrength.toFixed(0)}% | 
                    Banda: {(fallbackConnection.bandwidth / 1000).toFixed(1)} Mbps
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Modo Operacional</div>
              <div className="font-semibold">
                {isFallbackActive ? "Fallback" : "Normal"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Redundância</div>
              <div className="font-semibold">
                {fallbackConnection ? "Disponível" : "Não Configurada"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
