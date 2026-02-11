/**
 * Smart Notifications Component - Phase 7
 * UI for managing compliance notification preferences and viewing alerts
 */

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAuditLog } from "@/hooks/use-audit-log";
import {
  Bell, BellRing, Mail, Smartphone, Settings,
  Check, AlertTriangle, AlertCircle, Info, Clock,
  RefreshCw, Trash2, CheckCheck, Filter,
  Loader2, Send, XCircle, Shield
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from '@/lib/logger';

interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  deadlineWarningDays: number;
  criticalAlertsOnly: boolean;
  digestFrequency: "realtime" | "daily" | "weekly";
  quietHoursStart: string;
  quietHoursEnd: string;
  modules: {
    peotram: boolean;
    peodp: boolean;
    mlc: boolean;
    sgso: boolean;
    ism: boolean;
    isps: boolean;
  };
}

interface ComplianceNotification {
  id: string;
  type: string;
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

// Check for missing OAuth keys
const MISSING_KEYS = {
  VITE_GOOGLE_CLIENT_ID: !import.meta.env.VITE_GOOGLE_CLIENT_ID,
  VITE_MICROSOFT_CLIENT_ID: !import.meta.env.VITE_MICROSOFT_CLIENT_ID,
};

export const SmartNotifications = () => {
  const { user } = useAuth();
  const { logSuccess, logError } = useAuditLog();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    pushEnabled: true,
    inAppEnabled: true,
    deadlineWarningDays: 7,
    criticalAlertsOnly: false,
    digestFrequency: "realtime",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    modules: {
      peotram: true,
      peodp: true,
      mlc: true,
      sgso: true,
      ism: true,
      isps: true,
    },
  });

  const [notifications, setNotifications] = useState<ComplianceNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("intelligent_notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;

        const mapped: ComplianceNotification[] = (data || []).map((n: any) => ({
          id: n.id,
          type: n.type,
          priority: n.priority || "medium",
          title: n.title,
          message: n.message,
          is_read: n.is_read,
          created_at: n.created_at,
          action_url: n.action_url,
          metadata: n.metadata,
        }));

        setNotifications(mapped);
      } catch (error) {
        logger.error("Error fetching notifications:", error);
        // Use mock data for demo
        setNotifications([
          {
            id: "n1",
            type: "deadline_warning",
            priority: "high",
            title: "Prazo PEOTRAM se aproximando",
            message: "A auditoria semestral do PEOTRAM vence em 7 dias.",
            is_read: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "n2",
            type: "critical_alert",
            priority: "critical",
            title: "Certificado ISM expirando",
            message: "O certificado ISM da embarcação MV Atlantic Star expira em 3 dias.",
            is_read: false,
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "n3",
            type: "nc_opened",
            priority: "medium",
            title: "Nova NC aberta - MLC",
            message: "Não conformidade registrada: Documentação de horas de descanso incompleta.",
            is_read: true,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // Check push permission
  useEffect(() => {
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Notificações push não suportadas neste navegador");
      return;
    }

    const permission = await Notification.requestPermission();
    setPushPermission(permission);

    if (permission === "granted") {
      toast.success("Notificações push ativadas!");
      logSuccess("ENABLE", "push_notifications", null, {});
    } else {
      toast.error("Permissão de notificações negada");
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('ai_configurations').upsert({
        config_key: 'notification_preferences',
        config_value: preferences as any,
        updated_at: new Date().toISOString()
      }, { onConflict: 'config_key' });
      if (error) throw error;
      logSuccess("UPDATE", "notification_preferences", null, { ...preferences } as Record<string, unknown>);
      toast.success("Preferências salvas com sucesso!");
    } catch (error) {
      logError("UPDATE", "notification_preferences", error as Error);
      toast.error("Erro ao salvar preferências");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
    );

    try {
      await supabase
        .from("intelligent_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
    } catch (error) {
      logger.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success("Todas as notificações marcadas como lidas");
  };

  const handleSendTestNotification = async () => {
    if (!user) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("compliance-smart-notifications", {
        body: {
          userId: user.id,
          type: "deadline_warning",
          priority: "high",
          data: {
            title: "Teste de Notificação",
            description: "Esta é uma notificação de teste do sistema de compliance.",
            daysRemaining: 7,
            module: "PEOTRAM",
          },
          channels: {
            email: preferences.emailEnabled,
            push: preferences.pushEnabled,
            inApp: preferences.inAppEnabled,
          },
        },
      });

      if (error) throw error;

      toast.success("Notificação de teste enviada!");
      logSuccess("SEND", "test_notification", null, { results: data?.results });

      // Add to local list
      if (data?.results?.inApp?.success) {
        setNotifications(prev => [
          {
            id: data.results.inApp.id || `test-${Date.now()}`,
            type: "deadline_warning",
            priority: "high",
            title: "Teste de Notificação",
            message: "Esta é uma notificação de teste do sistema de compliance.",
            is_read: false,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (error) {
      logger.error("Error sending test notification:", error);
      toast.error("Erro ao enviar notificação de teste");
    } finally {
      setSending(false);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.is_read;
    if (filter === "critical") return n.priority === "critical";
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const criticalCount = notifications.filter(n => n.priority === "critical" && !n.is_read).length;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "medium":
        return <Info className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-500/10 text-red-500 border-red-500/30",
      high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
      medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
      low: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    };
    const labels: Record<string, string> = {
      critical: "Crítico",
      high: "Alto",
      medium: "Médio",
      low: "Baixo",
    };
    return (
      <Badge variant="outline" className={colors[priority] || colors.low}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  // Check for missing OAuth keys
  const hasMissingKeys = Object.values(MISSING_KEYS).some(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Missing Keys Warning */}
      {hasMissingKeys && (
        <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/30">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-500">Chaves OAuth Pendentes</AlertTitle>
          <AlertDescription className="text-yellow-500/80">
            <p className="mb-2">
              Para ativar a integração completa com Google Calendar e Microsoft Outlook,
              configure as seguintes variáveis de ambiente:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {MISSING_KEYS.VITE_GOOGLE_CLIENT_ID && (
                <li><code className="bg-yellow-500/20 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> - Google Cloud Console</li>
              )}
              {MISSING_KEYS.VITE_MICROSOFT_CLIENT_ID && (
                <li><code className="bg-yellow-500/20 px-1 rounded">VITE_MICROSOFT_CLIENT_ID</code> - Azure Portal</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BellRing className="h-6 w-6 text-primary" />
            Notificações Inteligentes
          </h2>
          <p className="text-muted-foreground">
            Alertas automatizados por email, push e in-app para prazos críticos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSendTestNotification} disabled={sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Testar Notificação
          </Button>
          <Button onClick={handleSavePreferences} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Salvar Preferências
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não Lidas</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <BellRing className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold">{criticalCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Push</p>
                <p className="text-2xl font-bold">
                  {pushPermission === "granted" ? "Ativo" : "Inativo"}
                </p>
              </div>
              <Smartphone className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">Não Lidas</SelectItem>
                  <SelectItem value="critical">Críticas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map(notification => (
                  <Card
                    key={notification.id}
                    className={`transition-all hover:shadow-md ${
                      !notification.is_read ? "bg-primary/5 border-primary/20" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getPriorityIcon(notification.priority)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{notification.title}</h4>
                            {getPriorityBadge(notification.priority)}
                            {!notification.is_read && (
                              <Badge variant="secondary" className="text-xs">Novo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                            {notification.action_url && (
                              <a
                                href={notification.action_url}
                                className="text-primary hover:underline"
                              >
                                Ver detalhes →
                              </a>
                            )}
                          </div>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Canais de Notificação
              </CardTitle>
              <CardDescription>
                Configure como deseja receber alertas de compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-enabled">Notificações por Email</Label>
                </div>
                <Switch
                  id="email-enabled"
                  checked={preferences.emailEnabled}
                  onCheckedChange={v =>
                    setPreferences(p => ({ ...p, emailEnabled: v }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="push-enabled">Notificações Push</Label>
                  {pushPermission !== "granted" && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={requestPushPermission}
                    >
                      (Ativar)
                    </Button>
                  )}
                </div>
                <Switch
                  id="push-enabled"
                  checked={preferences.pushEnabled}
                  onCheckedChange={v =>
                    setPreferences(p => ({ ...p, pushEnabled: v }))
                  }
                  disabled={pushPermission !== "granted"}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="inapp-enabled">Notificações In-App</Label>
                </div>
                <Switch
                  id="inapp-enabled"
                  checked={preferences.inAppEnabled}
                  onCheckedChange={v =>
                    setPreferences(p => ({ ...p, inAppEnabled: v }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Frequência do Digest</Label>
                <Select
                  value={preferences.digestFrequency}
                  onValueChange={(v) =>
                    setPreferences(p => ({ ...p, digestFrequency: v as typeof p.digestFrequency }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Tempo Real</SelectItem>
                    <SelectItem value="daily">Resumo Diário</SelectItem>
                    <SelectItem value="weekly">Resumo Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Antecedência de Alertas de Prazo</Label>
                <Select
                  value={String(preferences.deadlineWarningDays)}
                  onValueChange={v =>
                    setPreferences(p => ({ ...p, deadlineWarningDays: Number(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 dias antes</SelectItem>
                    <SelectItem value="7">7 dias antes</SelectItem>
                    <SelectItem value="14">14 dias antes</SelectItem>
                    <SelectItem value="30">30 dias antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Módulos de Compliance
              </CardTitle>
              <CardDescription>
                Selecione os módulos para os quais deseja receber alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(preferences.modules).map(([module, enabled]) => (
                <div key={module} className="flex items-center justify-between">
                  <Label htmlFor={`module-${module}`} className="uppercase">
                    {module}
                  </Label>
                  <Switch
                    id={`module-${module}`}
                    checked={enabled}
                    onCheckedChange={v =>
                      setPreferences(p => ({
                        ...p,
                        modules: { ...p.modules, [module]: v },
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartNotifications;
