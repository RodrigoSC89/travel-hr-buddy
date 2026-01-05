import { useState, useEffect } from "react";
import { Bell, BellOff, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
  type NotificationPreferences,
} from "@/lib/notifications/push-notification-service";

export function NotificationSettings() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPreferences>(getNotificationPreferences());
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    
    if (granted) {
      const newPrefs = { ...prefs, enabled: true };
      setPrefs(newPrefs);
      saveNotificationPreferences(newPrefs);
      toast({
        title: "Notificações ativadas",
        description: "Você receberá alertas críticos no navegador.",
      });
    } else {
      toast({
        title: "Permissão negada",
        description: "Habilite notificações nas configurações do navegador.",
        variant: "destructive",
      });
    }
  };

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    saveNotificationPreferences(newPrefs);
  };

  if (!isNotificationSupported()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações não suportadas
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Configure alertas do navegador para eventos críticos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission !== "granted" ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Ative as notificações para receber alertas críticos de sensores IoT.
            </p>
            <Button onClick={handleEnableNotifications}>
              <Bell className="h-4 w-4 mr-2" />
              Ativar Notificações
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações ativas
              </Label>
              <Switch
                id="enabled"
                checked={prefs.enabled}
                onCheckedChange={(v) => handleToggle("enabled", v)}
              />
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium">Tipos de alerta:</p>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="critical" className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Alertas Críticos
                </Label>
                <Switch
                  id="critical"
                  checked={prefs.criticalAlerts}
                  onCheckedChange={(v) => handleToggle("criticalAlerts", v)}
                  disabled={!prefs.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="warning" className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-4 w-4" />
                  Avisos
                </Label>
                <Switch
                  id="warning"
                  checked={prefs.warningAlerts}
                  onCheckedChange={(v) => handleToggle("warningAlerts", v)}
                  disabled={!prefs.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="info" className="flex items-center gap-2 text-muted-foreground">
                  <Info className="h-4 w-4" />
                  Informações
                </Label>
                <Switch
                  id="info"
                  checked={prefs.infoAlerts}
                  onCheckedChange={(v) => handleToggle("infoAlerts", v)}
                  disabled={!prefs.enabled}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
