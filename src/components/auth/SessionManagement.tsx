/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * Session Management Component
 * PATCH 124.0 - Token & Session Security Engine
 * 
 * Allows users to view and manage their active sessions across devices
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSessionManager, type SessionToken } from "@/hooks/use-session-manager";
import { logger } from "@/lib/logger";

export const SessionManagement: React.FC = () => {
  const {
    sessions,
    loading,
    revokeSession,
    revokeAllOtherSessions,
    currentSessionId,
    error,
  } = useSessionManager();
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevoking(sessionId);
      await revokeSession(sessionId, "User requested revocation");
      toast({
        title: "Sessão Revogada",
        description: "A sessão foi revogada com sucesso.",
      });
    } catch (error) {
      logger.error("[SessionManagement] Error revoking session:", error as Error);
      toast({
        title: "Erro",
        description: "Não foi possível revogar a sessão.",
        variant: "destructive",
      });
    } finally {
      setRevoking(null);
    }
  });

  const handleRevokeOtherSessions = async () => {
    try {
      setRevokingOthers(true);
      await revokeAllOtherSessions();
      toast({
        title: "Sessões Revogadas",
        description: "Todas as outras sessões foram encerradas com sucesso.",
      });
    } catch (error) {
      logger.error("[SessionManagement] Error revoking other sessions:", error as Error);
      toast({
        title: "Erro",
        description: "Não foi possível revogar as outras sessões.",
        variant: "destructive",
      });
    } finally {
      setRevokingOthers(false);
    }
  });

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
    case "mobile":
      return <Smartphone className="w-5 h-5" />;
    case "tablet":
      return <Tablet className="w-5 h-5" />;
    case "desktop":
    default:
      return <Monitor className="w-5 h-5" />;
    }
  };

  const getSessionStatus = (session: SessionToken) => {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const lastActivity = new Date(session.last_activity_at);
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (session.revoked) {
      return { label: "Revogada", variant: "destructive" as const, icon: XCircle };
    }
    if (expiresAt < now) {
      return { label: "Expirada", variant: "destructive" as const, icon: XCircle };
    } else if (hoursSinceActivity < 1) {
      return { label: "Ativa", variant: "default" as const, icon: CheckCircle };
    } else {
      return { label: "Inativa", variant: "secondary" as const, icon: Clock };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const hasOtherSessions = sessions.some(session => session.id !== currentSessionId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
          <CardDescription>
            Gerencie seus dispositivos e sessões conectadas. Revogue o acesso de dispositivos 
            que você não reconhece para manter sua conta segura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhuma sessão ativa encontrada.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const status = getSessionStatus(session);
                const StatusIcon = status.icon;
                const isCurrentSession = session.id === currentSessionId;

                return (
                  <Card
                    key={session.id}
                    className={`border-2 transition-shadow ${
                      isCurrentSession ? "border-primary/70 shadow-md shadow-primary/20" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="mt-1">
                            {getDeviceIcon(session.device_info?.device_type)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {session.device_info?.platform || "Dispositivo Desconhecido"}
                              </h4>
                              {isCurrentSession && (
                                <Badge variant="outline" className="text-primary border-primary/60">
                                  Este dispositivo
                                </Badge>
                              )}
                              <Badge variant={status.variant} className="flex items-center gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-muted-foreground space-y-1">
                              {session.device_info?.browser && (
                                <p>Navegador: {session.device_info.browser}</p>
                              )}
                              {session.device_info?.os && (
                                <p>Sistema: {session.device_info.os}</p>
                              )}
                              <p className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Criada em:{" "}
                                {formatDistanceToNow(new Date(session.created_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </p>
                              <p className="text-xs">
                                Criada em: {new Date(session.created_at).toLocaleString("pt-BR")}
                              </p>
                              <p className="text-xs">
                                Expira em: {new Date(session.expires_at).toLocaleString("pt-BR")}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant={isCurrentSession ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => handlehandleRevokeSession}
                          disabled={revoking === session.id}
                        >
                          {revoking === session.id ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Revogando...
                            </span>
                          ) : (
                            isCurrentSession ? "Encerrar aqui" : "Revogar"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {sessions.length > 0 && (
            <div className="mt-6 flex flex-col gap-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Revogar outras sessões</p>
                  <p className="text-sm text-muted-foreground">
                    Use esta ação para encerrar o acesso de dispositivos que você não reconhece.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={!hasOtherSessions || revokingOthers}
                  onClick={handleRevokeOtherSessions}
                >
                  {revokingOthers ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      Revogando...
                    </span>
                  ) : (
                    "Revogar todas exceto esta"
                  )}
                </Button>
              </div>
              {!hasOtherSessions && (
                <p className="text-xs text-muted-foreground">
                  Nenhuma outra sessão ativa encontrada.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica de Segurança:</strong> Revogue sessões de dispositivos que você não 
          reconhece ou que não usa mais. Isso ajuda a manter sua conta segura.
        </AlertDescription>
      </Alert>
    </div>
  );
};

/**
 * Compact version for use in settings or profile pages
 */
export const SessionManagementCompact: React.FC = () => {
  const { sessions, loading, error } = useSessionManager();
  const sessionCount = sessions.length;

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Não foi possível carregar as sessões.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <Monitor className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium">Sessões Ativas</p>
          <p className="text-sm text-muted-foreground">
            {sessionCount} {sessionCount === 1 ? "dispositivo conectado" : "dispositivos conectados"}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="/settings/sessions">Gerenciar</Link>
      </Button>
    </div>
  );
};
