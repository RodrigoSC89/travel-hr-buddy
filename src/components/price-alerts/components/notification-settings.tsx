import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Settings,
  DollarSign,
  Calendar,
  TrendingDown,
  Save,
  Check
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  price_drop_threshold: number;
  daily_summary: boolean;
  weekly_report: boolean;
}

export const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: true,
    push_enabled: true,
    price_drop_threshold: 0,
    daily_summary: false,
    weekly_report: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (user) {
      loadSettings();
    }
    checkPushSupport();
  }, [user]);

  const checkPushSupport = () => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        return;
      }

      if (data) {
        setSettings({
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          price_drop_threshold: data.price_drop_threshold,
          daily_summary: data.daily_summary,
          weekly_report: data.weekly_report,
        });
      }
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("notification_settings")
        .upsert({
          user_id: user.id,
          ...settings,
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const requestPushPermission = async () => {
    if (!pushSupported) return;

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === "granted") {
        setSettings(prev => ({ ...prev, push_enabled: true }));
        toast({
          title: "Notificações ativadas",
          description: "Você receberá notificações push quando os preços baixarem.",
        });
      } else {
        toast({
          title: "Permissão negada",
          description: "Não é possível enviar notificações push.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.warn("[EMPTY CATCH]", error);
    }
  };

  const testPushNotification = () => {
    if (pushPermission === "granted") {
      new Notification("Alerta de Preço", {
        body: "Este é um exemplo de notificação! 🎉",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
          <p className="text-muted-foreground">
            Personalize como você quer receber alertas sobre mudanças de preços
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Notificações por Email */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base font-medium">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas no seu email quando os preços baixarem
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.email_enabled}
                onCheckedChange={(checked) => updateSetting("email_enabled", checked)}
              />
            </div>
            <Separator />
          </div>

          {/* Notificações Push */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base font-medium">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações instantâneas no navegador
                  </p>
                  {!pushSupported && (
                    <Badge variant="destructive" className="mt-1">
                      Não suportado neste navegador
                    </Badge>
                  )}
                  {pushSupported && pushPermission === "denied" && (
                    <Badge variant="destructive" className="mt-1">
                      Permissão negada
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pushSupported && pushPermission === "granted" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testPushNotification}
                  >
                    Testar
                  </Button>
                )}
                {pushSupported && pushPermission !== "granted" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestPushPermission}
                  >
                    Ativar
                  </Button>
                ) : (
                  <Switch
                    checked={settings.push_enabled && pushPermission === "granted"}
                    onCheckedChange={(checked) => updateSetting("push_enabled", checked)}
                    disabled={!pushSupported || pushPermission !== "granted"}
                  />
                )}
              </div>
            </div>
            <Separator />
          </div>

          {/* Limite de Desconto */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-base font-medium">Limite Mínimo de Desconto</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações apenas para descontos acima de um valor específico
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0"
                value={settings.price_drop_threshold}
                onChange={(e) => updateSetting("price_drop_threshold", Number(e.target.value))}
                className="w-32"
                min="0"
                step="0.01"
              />
              <span className="text-sm text-muted-foreground">
                reais de desconto mínimo
              </span>
            </div>
            <Separator className="mt-4" />
          </div>

          {/* Relatórios */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Label className="text-base font-medium">Relatórios Automáticos</Label>
            </div>
            
            <div className="pl-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Resumo Diário</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um resumo diário dos seus alertas ativos
                  </p>
                </div>
                <Switch
                  checked={settings.daily_summary}
                  onCheckedChange={(checked) => updateSetting("daily_summary", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Relatório Semanal</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba estatísticas semanais e dicas de economia
                  </p>
                </div>
                <Switch
                  checked={settings.weekly_report}
                  onCheckedChange={(checked) => updateSetting("weekly_report", checked)}
                />
              </div>
            </div>
          </div>

          {/* Botão de Salvar */}
          <div className="flex justify-end pt-4">
            <Button onClick={saveSettings} disabled={saving} className="flex items-center gap-2">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Painel de Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Status das Notificações
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </div>
              <Badge variant={settings.email_enabled ? "default" : "secondary"}>
                {settings.email_enabled ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Push</span>
              </div>
              <Badge variant={
                settings.push_enabled && pushPermission === "granted" 
                  ? "default" 
                  : "secondary"
              }>
                {settings.push_enabled && pushPermission === "granted" 
                  ? "Ativo" 
                  : "Inativo"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                <span>Desconto Mínimo</span>
              </div>
              <Badge variant="outline">
                R$ {settings.price_drop_threshold.toFixed(2)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Relatórios</span>
              </div>
              <Badge variant={
                settings.daily_summary || settings.weekly_report 
                  ? "default" 
                  : "secondary"
              }>
                {settings.daily_summary || settings.weekly_report 
                  ? "Configurado" 
                  : "Desativado"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};