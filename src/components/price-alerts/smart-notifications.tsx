import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  BellRing,
  Mail,
  Smartphone,
  MessageSquare,
  Settings,
  Clock,
  Volume2,
  VolumeX,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Target,
  Calendar,
  User,
  TrendingDown,
} from "lucide-react";

interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  frequency: "immediate" | "daily" | "weekly";
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    price_drops: boolean;
    target_reached: boolean;
    trend_alerts: boolean;
    ai_recommendations: boolean;
  };
  thresholds: {
    min_discount_percentage: number;
    min_savings_amount: number;
  };
}

interface NotificationHistory {
  id: string;
  type: "email" | "push" | "sms";
  title: string;
  message: string;
  sent_at: string;
  status: "sent" | "delivered" | "failed";
  alert_id?: string;
}

export const SmartNotifications: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testNotification, setTestNotification] = useState({
    type: "email" as "email" | "push" | "sms",
    message: "Teste de notificação do sistema de alertas",
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotificationSettings();
      loadNotificationHistory();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    try {
      // Since we don't have a notification_settings table, we'll use localStorage for demo
      const stored = localStorage.getItem(`notification_settings_${user?.id}`);
      if (stored) {
        setSettings(JSON.parse(stored));
      } else {
        // Default settings
        const defaultSettings: NotificationSettings = {
          id: "1",
          user_id: user?.id || "",
          email_enabled: true,
          push_enabled: true,
          sms_enabled: false,
          frequency: "immediate",
          quiet_hours: {
            enabled: false,
            start: "22:00",
            end: "08:00",
          },
          categories: {
            price_drops: true,
            target_reached: true,
            trend_alerts: true,
            ai_recommendations: true,
          },
          thresholds: {
            min_discount_percentage: 10,
            min_savings_amount: 50,
          },
        };
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationHistory = () => {
    // Mock notification history
    const mockHistory: NotificationHistory[] = [
      {
        id: "1",
        type: "email",
        title: "Meta de preço atingida!",
        message: "Passagem SP-RJ agora custa R$ 450,00 (meta: R$ 500,00)",
        sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "delivered",
      },
      {
        id: "2",
        type: "push",
        title: "IA Recomenda: Aguardar compra",
        message: "Preços tendem a cair 15% nas próximas 2 semanas",
        sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "delivered",
      },
      {
        id: "3",
        type: "email",
        title: "Queda significativa detectada",
        message: "Hotel Copacabana: R$ 220,00 (-25% vs. semana passada)",
        sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "delivered",
      },
    ];
    setHistory(mockHistory);
  };

  const saveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      // Store in localStorage for demo
      localStorage.setItem(`notification_settings_${user?.id}`, JSON.stringify(settings));

      toast({
        title: "Configurações salvas!",
        description: "Suas preferências de notificação foram atualizadas.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      // Simulate sending test notification
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newNotification: NotificationHistory = {
        id: Date.now().toString(),
        type: testNotification.type,
        title: "Teste de Notificação",
        message: testNotification.message,
        sent_at: new Date().toISOString(),
        status: "sent",
      };

      setHistory(prev => [newNotification, ...prev]);

      toast({
        title: "Notificação de teste enviada!",
        description: `Teste enviado via ${testNotification.type}`,
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação de teste",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "delivered":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "failed":
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    default:
      return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
    case "email":
      return <Mail className="w-4 h-4 text-primary" />;
    case "push":
      return <Smartphone className="w-4 h-4 text-primary" />;
    case "sms":
      return <MessageSquare className="w-4 h-4 text-primary" />;
    default:
      return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Bell className="w-8 h-8 animate-pulse mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BellRing className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Notificações Inteligentes</h2>
              <p className="text-muted-foreground">
                Configure como e quando receber alertas de preços
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Channels */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Canais de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">Notificações detalhadas</p>
                  </div>
                </div>
                <Switch
                  checked={settings.email_enabled}
                  onCheckedChange={checked =>
                    setSettings(prev => (prev ? { ...prev, email_enabled: checked } : null))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Push Notification</p>
                    <p className="text-sm text-muted-foreground">Alertas instantâneos</p>
                  </div>
                </div>
                <Switch
                  checked={settings.push_enabled}
                  onCheckedChange={checked =>
                    setSettings(prev => (prev ? { ...prev, push_enabled: checked } : null))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-primary/5">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground">Para alertas urgentes</p>
                  </div>
                </div>
                <Switch
                  checked={settings.sms_enabled}
                  onCheckedChange={checked =>
                    setSettings(prev => (prev ? { ...prev, sms_enabled: checked } : null))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Tipos de Alerta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">Metas atingidas</span>
                </div>
                <Switch
                  checked={settings.categories.target_reached}
                  onCheckedChange={checked =>
                    setSettings(prev =>
                      prev
                        ? {
                          ...prev,
                          categories: { ...prev.categories, target_reached: checked },
                        }
                        : null
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-primary" />
                  <span className="text-sm">Quedas de preço</span>
                </div>
                <Switch
                  checked={settings.categories.price_drops}
                  onCheckedChange={checked =>
                    setSettings(prev =>
                      prev
                        ? {
                          ...prev,
                          categories: { ...prev.categories, price_drops: checked },
                        }
                        : null
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-info" />
                  <span className="text-sm">Alertas de tendência</span>
                </div>
                <Switch
                  checked={settings.categories.trend_alerts}
                  onCheckedChange={checked =>
                    setSettings(prev =>
                      prev
                        ? {
                          ...prev,
                          categories: { ...prev.categories, trend_alerts: checked },
                        }
                        : null
                    )
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  <span className="text-sm">Recomendações IA</span>
                </div>
                <Switch
                  checked={settings.categories.ai_recommendations}
                  onCheckedChange={checked =>
                    setSettings(prev =>
                      prev
                        ? {
                          ...prev,
                          categories: { ...prev.categories, ai_recommendations: checked },
                        }
                        : null
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frequency & Quiet Hours */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Frequência e Horários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Frequência de Notificações</Label>
                <Select
                  value={settings.frequency}
                  onValueChange={(value: "immediate" | "daily" | "weekly") =>
                    setSettings(prev => (prev ? { ...prev, frequency: value } : null))
                  }
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">⚡ Imediato</SelectItem>
                    <SelectItem value="daily">📅 Resumo diário</SelectItem>
                    <SelectItem value="weekly">📊 Resumo semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Horário Silencioso</Label>
                  <Switch
                    checked={settings.quiet_hours.enabled}
                    onCheckedChange={checked =>
                      setSettings(prev =>
                        prev
                          ? {
                            ...prev,
                            quiet_hours: { ...prev.quiet_hours, enabled: checked },
                          }
                          : null
                      )
                    }
                  />
                </div>

                {settings.quiet_hours.enabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Início</Label>
                      <Input
                        type="time"
                        value={settings.quiet_hours.start}
                        onChange={e =>
                          setSettings(prev =>
                            prev
                              ? {
                                ...prev,
                                quiet_hours: { ...prev.quiet_hours, start: e.target.value },
                              }
                              : null
                          )
                        }
                        className="text-sm border-primary/20"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Fim</Label>
                      <Input
                        type="time"
                        value={settings.quiet_hours.end}
                        onChange={e =>
                          setSettings(prev =>
                            prev
                              ? {
                                ...prev,
                                quiet_hours: { ...prev.quiet_hours, end: e.target.value },
                              }
                              : null
                          )
                        }
                        className="text-sm border-primary/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thresholds */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Limiares de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Desconto mínimo (%)</Label>
                <Input
                  type="number"
                  value={settings.thresholds.min_discount_percentage}
                  onChange={e =>
                    setSettings(prev =>
                      prev
                        ? {
                          ...prev,
                          thresholds: {
                            ...prev.thresholds,
                            min_discount_percentage: parseInt(e.target.value) || 0,
                          },
                        }
                        : null
                    )
                  }
                  className="border-primary/20"
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Notificar apenas quando o desconto superar este valor
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Economia mínima (R$)</Label>
                <Input
                  type="number"
                  value={settings.thresholds.min_savings_amount}
                  onChange={e =>
                    setSettings(prev =>
                      prev
                        ? {
                          ...prev,
                          thresholds: {
                            ...prev.thresholds,
                            min_savings_amount: parseInt(e.target.value) || 0,
                          },
                        }
                        : null
                    )
                  }
                  className="border-primary/20"
                  placeholder="50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Notificar apenas quando a economia superar este valor
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Notification */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Teste de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select
              value={testNotification.type}
              onValueChange={(value: "email" | "push" | "sms") =>
                setTestNotification(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="w-32 border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">📧 Email</SelectItem>
                <SelectItem value="push">📱 Push</SelectItem>
                <SelectItem value="sms">💬 SMS</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={testNotification.message}
              onChange={e => setTestNotification(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Mensagem de teste"
              className="flex-1 border-primary/20"
            />

            <Button onClick={sendTestNotification} className="bg-primary hover:bg-primary/90">
              <Bell className="w-4 h-4 mr-2" />
              Enviar Teste
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Histórico de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.slice(0, 10).map(notification => (
              <div
                key={notification.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-primary/10 bg-primary/5"
              >
                <div className="flex items-center gap-2">
                  {getTypeIcon(notification.type)}
                  {getStatusIcon(notification.status)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {notification.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.sent_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90"
        >
          {isSaving ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
