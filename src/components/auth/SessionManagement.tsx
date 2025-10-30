/**
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DeviceInfo {
  platform?: string;
  browser?: string;
  os?: string;
  device_type?: string;
}

interface SessionInfo {
  id: string;
  device_info: DeviceInfo | null;
  created_at: string;
  last_activity_at: string;
  expires_at: string;
  token: string;
  revoked: boolean | null;
}

export const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const { toast } = useToast();

  // Load active sessions
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_active_sessions");

      if (error) {
        console.error("Error loading sessions:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as sessões ativas.",
          variant: "destructive",
        });
        return;
      }

      // Type assertion for device_info
      const typedSessions = (data || []).map(session => ({
        ...session,
        device_info: session.device_info as DeviceInfo | null,
      }));
      setSessions(typedSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setRevoking(sessionId);
      
      const { data, error } = await supabase.rpc("revoke_session_token", {
        p_token_id: sessionId,
        p_reason: "User requested revocation"
      });

      if (error) {
        console.error("Error revoking session:", error);
        toast({
          title: "Erro",
          description: "Não foi possível revogar a sessão.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        toast({
          title: "Sessão Revogada",
          description: "A sessão foi revogada com sucesso.",
        });
        loadSessions(); // Reload sessions
      }
    } catch (error) {
      console.error("Error revoking session:", error);
    } finally {
      setRevoking(null);
    }
  };

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

  const getSessionStatus = (session: SessionInfo) => {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const lastActivity = new Date(session.last_activity_at);
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

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

                return (
                  <Card key={session.id} className="border-2">
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
                                Última atividade:{" "}
                                {formatDistanceToNow(new Date(session.last_activity_at), {
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
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeSession(session.id)}
                          disabled={revoking === session.id}
                        >
                          {revoking === session.id ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Revogando...
                            </span>
                          ) : (
                            "Revogar"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessionCount = async () => {
      try {
        const { data, error } = await supabase.rpc("get_active_sessions");
        if (!error && data) {
          setSessionCount(data.length);
        }
      } catch (error) {
        console.error("Error loading session count:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSessionCount();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Carregando...</div>;
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
