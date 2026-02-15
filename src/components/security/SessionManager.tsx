/**
 * Sprint 4: Active Session Manager
 * Monitor and manage active user sessions with security controls
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Monitor, Smartphone, Globe, Clock, Shield, LogOut,
  AlertTriangle, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface ActiveSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string;
  user_agent: string | null;
  device_info: Record<string, unknown> | null;
  last_activity: string;
  expires_at: string;
  is_active: boolean;
  mfa_verified: boolean | null;
  security_level: string | null;
  created_at: string;
}

export const SessionManager: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [revoking, setRevoking] = useState<string | null>(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["active-sessions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("active_sessions")
        .select("*")
        .eq("is_active", true)
        .order("last_activity", { ascending: false });
      if (error) throw error;
      return data as ActiveSession[];
    },
    enabled: !!user,
    refetchInterval: 30_000,
  });

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const { error } = await supabase
        .from("active_sessions")
        .update({ is_active: false })
        .eq("id", sessionId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      toast.success("Sessão revogada com sucesso");
    } catch {
      toast.error("Erro ao revogar sessão");
    } finally {
      setRevoking(null);
    }
  };

  const revokeAll = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("active_sessions")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .neq("session_token", "current");
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      toast.success("Todas as outras sessões revogadas");
    } catch {
      toast.error("Erro ao revogar sessões");
    }
  };

  const getDeviceIcon = (ua: string | null) => {
    if (!ua) return <Globe className="w-5 h-5" />;
    if (/mobile|android|iphone/i.test(ua)) return <Smartphone className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const getTimeSince = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return "Agora";
    if (mins < 60) return `${mins}m atrás`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h atrás`;
    return `${Math.floor(mins / 1440)}d atrás`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Gerenciador de Sessões
          </h2>
          <p className="text-muted-foreground text-sm">
            {sessions.length} sessão(ões) ativa(s)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["active-sessions"] })} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Atualizar
          </Button>
          {sessions.length > 1 && (
            <Button onClick={revokeAll} variant="destructive" size="sm">
              <LogOut className="w-4 h-4 mr-1" />
              Revogar Outras
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma sessão ativa encontrada
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isExpired = new Date(session.expires_at) < new Date();
            return (
              <Card key={session.id} className={isExpired ? "opacity-60" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {getDeviceIcon(session.user_agent)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {session.user_agent
                              ? session.user_agent.split(" ").slice(0, 3).join(" ")
                              : "Dispositivo desconhecido"}
                          </span>
                          {session.mfa_verified && (
                            <Badge variant="outline" className="text-xs bg-success/10 text-success">
                              MFA ✓
                            </Badge>
                          )}
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">Expirada</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeSince(session.last_activity)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {String(session.ip_address || "—")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                      disabled={revoking === session.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {revoking === session.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
