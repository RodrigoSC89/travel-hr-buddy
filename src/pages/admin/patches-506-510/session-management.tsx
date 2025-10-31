import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, RefreshCw, LogOut, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { SessionManagementService } from "@/services/session-management-service";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Session {
  id?: string;
  user_id?: string | null;
  session_token: string;
  is_active: boolean | null;
  last_activity?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: string;
  expires_at?: string | null;
}

const SessionManagement = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await SessionManagementService.getActiveSessions();
      setSessions(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar sessões",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionToken: string) => {
    try {
      const result = await SessionManagementService.revokeSession(sessionToken);
      if (result.success) {
        toast({
          title: "Sessão Revogada",
          description: "Sessão removida com sucesso"
        });
        await loadSessions();
      }
    } catch (error) {
      toast({
        title: "Erro ao revogar sessão",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const revokeAllSessions = async () => {
    try {
      const result = await SessionManagementService.revokeAllOtherSessions();
      if (result.success) {
        toast({
          title: "Todas as Sessões Revogadas",
          description: "Todas as sessões foram removidas"
        });
        await loadSessions();
      }
    } catch (error) {
      toast({
        title: "Erro ao revogar sessões",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const cleanupExpired = async () => {
    try {
      const count = await SessionManagementService.cleanupExpiredSessions();
      toast({
        title: "Limpeza Concluída",
        description: `${count} sessão(ões) expirada(s) removida(s)`
      });
      await loadSessions();
    } catch (error) {
      toast({
        title: "Erro ao limpar sessões",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const activeSessions = sessions.filter(s => s.is_active);
  const inactiveSessions = sessions.filter(s => !s.is_active);

  const stats = {
    total: sessions.length,
    active: activeSessions.length,
    inactive: inactiveSessions.length,
    expiringSoon: sessions.filter(s => {
      if (!s.expires_at) return false;
      const expiresIn = new Date(s.expires_at).getTime() - Date.now();
      return expiresIn > 0 && expiresIn < 24 * 60 * 60 * 1000; // Less than 24h
    }).length
  };

  const getBrowser = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold">Session Management</h1>
            <p className="text-muted-foreground">PATCH 510 - Auth & Refresh Token Control</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSessions} variant="outline" size="icon">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={cleanupExpired} variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Expiradas
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          Sessões expiradas são limpas automaticamente. Use "Revogar Todas" para forçar logout em todos os dispositivos.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Sessões</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sessões Ativas</CardDescription>
            <CardTitle className="text-3xl text-green-500">{stats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Sessões Inativas</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">{stats.inactive}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Expirando em 24h</CardDescription>
            <CardTitle className="text-3xl text-yellow-500">{stats.expiringSoon}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Segurança</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="destructive" onClick={revokeAllSessions}>
            <LogOut className="h-4 w-4 mr-2" />
            Revogar Todas as Sessões
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas ({activeSessions.length})</CardTitle>
          <CardDescription>Sessões atualmente autenticadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhuma sessão ativa</div>
            ) : (
              activeSessions.map(session => (
                <div key={session.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="default">Ativa</Badge>
                          <Badge variant="outline">{getBrowser(session.user_agent)}</Badge>
                          {session.ip_address && (
                            <Badge variant="secondary" className="text-xs">
                              IP: {session.ip_address}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div>Token: <code className="text-xs">{session.session_token.slice(0, 16)}...</code></div>
                          {session.last_activity && (
                            <div>Última atividade: {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true, locale: ptBR })}</div>
                          )}
                          {session.expires_at && (
                            <div>Expira: {formatDistanceToNow(new Date(session.expires_at), { addSuffix: true, locale: ptBR })}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => revokeSession(session.session_token)}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Revogar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inactive Sessions */}
      {inactiveSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sessões Inativas ({inactiveSessions.length})</CardTitle>
            <CardDescription>Sessões revogadas ou expiradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveSessions.slice(0, 20).map(session => (
                <div key={session.id} className="border rounded-lg p-4 opacity-60">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">Inativa</Badge>
                        <Badge variant="outline">{getBrowser(session.user_agent)}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Token: <code className="text-xs">{session.session_token.slice(0, 16)}...</code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SessionManagement;
