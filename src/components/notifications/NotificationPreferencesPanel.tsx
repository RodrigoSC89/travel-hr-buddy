/**
 * Notification Preferences Panel
 * Allows users to configure their notification preferences
 */
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, Smartphone, MessageSquare, Moon, Clock, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationService, NotificationPreferences } from "@/services/notification-service";

export function NotificationPreferencesPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    in_app_enabled: true,
    alerts_enabled: true,
    reminders_enabled: true,
    info_enabled: true,
    marketing_enabled: false,
    quiet_hours_enabled: false,
    quiet_hours_timezone: "America/Sao_Paulo",
    digest_enabled: false,
    digest_frequency: "daily",
  });

  // Fetch current preferences
  const { data: savedPrefs, isLoading } = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return NotificationService.getUserPreferences(user.id);
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (savedPrefs) {
      setPreferences(savedPrefs);
    }
  }, [savedPrefs]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      return NotificationService.updatePreferences(user.id, preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Preferências salvas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao salvar preferências");
    },
  });

  const handleChange = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Canais de Notificação
          </CardTitle>
          <CardDescription>
            Escolha como deseja receber suas notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="in_app">Notificações In-App</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações dentro do sistema
                </p>
              </div>
            </div>
            <Switch
              id="in_app"
              checked={preferences.in_app_enabled}
              onCheckedChange={(v) => handleChange("in_app_enabled", v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="email">E-mail</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações por e-mail
                </p>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.email_enabled}
              onCheckedChange={(v) => handleChange("email_enabled", v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="push">Push (Navegador)</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações push no navegador
                </p>
              </div>
            </div>
            <Switch
              id="push"
              checked={preferences.push_enabled}
              onCheckedChange={(v) => handleChange("push_enabled", v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="sms">SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas críticos por SMS
                </p>
              </div>
            </div>
            <Switch
              id="sms"
              checked={preferences.sms_enabled}
              onCheckedChange={(v) => handleChange("sms_enabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Notificação</CardTitle>
          <CardDescription>
            Escolha quais tipos de notificações deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="alerts">Alertas e Urgências</Label>
              <p className="text-sm text-muted-foreground">
                Alertas críticos e notificações urgentes
              </p>
            </div>
            <Switch
              id="alerts"
              checked={preferences.alerts_enabled}
              onCheckedChange={(v) => handleChange("alerts_enabled", v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reminders">Lembretes</Label>
              <p className="text-sm text-muted-foreground">
                Lembretes de tarefas, vencimentos e prazos
              </p>
            </div>
            <Switch
              id="reminders"
              checked={preferences.reminders_enabled}
              onCheckedChange={(v) => handleChange("reminders_enabled", v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="info">Informações Gerais</Label>
              <p className="text-sm text-muted-foreground">
                Atualizações do sistema e informações gerais
              </p>
            </div>
            <Switch
              id="info"
              checked={preferences.info_enabled}
              onCheckedChange={(v) => handleChange("info_enabled", v)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing">Novidades e Promoções</Label>
              <p className="text-sm text-muted-foreground">
                Novos recursos, dicas e ofertas especiais
              </p>
            </div>
            <Switch
              id="marketing"
              checked={preferences.marketing_enabled}
              onCheckedChange={(v) => handleChange("marketing_enabled", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Horário Silencioso
          </CardTitle>
          <CardDescription>
            Configure um período em que não deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="quiet_hours">Ativar Horário Silencioso</Label>
              <p className="text-sm text-muted-foreground">
                Notificações serão retidas durante este período
              </p>
            </div>
            <Switch
              id="quiet_hours"
              checked={preferences.quiet_hours_enabled}
              onCheckedChange={(v) => handleChange("quiet_hours_enabled", v)}
            />
          </div>

          {preferences.quiet_hours_enabled && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet_start">Início</Label>
                  <Input
                    id="quiet_start"
                    type="time"
                    value={preferences.quiet_hours_start || "22:00"}
                    onChange={(e) => handleChange("quiet_hours_start", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet_end">Fim</Label>
                  <Input
                    id="quiet_end"
                    type="time"
                    value={preferences.quiet_hours_end || "07:00"}
                    onChange={(e) => handleChange("quiet_hours_end", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Digest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Resumo de Notificações
          </CardTitle>
          <CardDescription>
            Receba um resumo consolidado das suas notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="digest">Ativar Resumo</Label>
              <p className="text-sm text-muted-foreground">
                Receba um e-mail com o resumo das notificações
              </p>
            </div>
            <Switch
              id="digest"
              checked={preferences.digest_enabled}
              onCheckedChange={(v) => handleChange("digest_enabled", v)}
            />
          </div>

          {preferences.digest_enabled && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select
                  value={preferences.digest_frequency}
                  onValueChange={(v) => handleChange("digest_frequency", v as "daily" | "weekly")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Salvando..." : "Salvar Preferências"}
        </Button>
      </div>
    </div>
  );
}
