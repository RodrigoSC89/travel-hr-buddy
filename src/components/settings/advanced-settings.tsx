import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Shield, Palette, Key, Save, RefreshCw } from "lucide-react";

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityTracking: boolean;
    dataSharing: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    theme: string;
    currency: string;
  };
  security: {
    twoFactor: boolean;
    sessionTimeout: number;
    loginAlerts: boolean;
  };
}

export const AdvancedSettings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      activityTracking: true,
      dataSharing: false,
    },
    preferences: {
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      theme: "system",
      currency: "BRL",
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      loginAlerts: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSettingChange = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Here you would typically save to Supabase
      // await supabase.from('user_settings').upsert({ user_id: user?.id, ...settings });

      setHasChanges(false);
      toast({
        title: "Configurações Salvas",
        description: "Suas preferências foram atualizadas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings({
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
      },
      privacy: {
        profileVisible: true,
        activityTracking: true,
        dataSharing: false,
      },
      preferences: {
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
        theme: "system",
        currency: "BRL",
      },
      security: {
        twoFactor: false,
        sessionTimeout: 30,
        loginAlerts: true,
      },
    });
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configurações Avançadas</h2>
          <p className="text-muted-foreground">Personalize sua experiência no sistema</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-warning">
              Alterações não salvas
            </Badge>
          )}
          <Button onClick={resetSettings} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Restaurar Padrões
          </Button>
          <Button onClick={saveSettings} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacidade
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Preferências
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas e atualizações importantes
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={checked =>
                    handleSettingChange("notifications", "email", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações em tempo real no navegador
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={checked => handleSettingChange("notifications", "push", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SMS</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas críticos via mensagem de texto
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={checked => handleSettingChange("notifications", "sms", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Novidades, promoções e conteúdo educativo
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.marketing}
                  onCheckedChange={checked =>
                    handleSettingChange("notifications", "marketing", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Privacidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Perfil Visível</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que outros usuários vejam seu perfil
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.profileVisible}
                  onCheckedChange={checked =>
                    handleSettingChange("privacy", "profileVisible", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Rastreamento de Atividade</Label>
                  <p className="text-sm text-muted-foreground">
                    Coletar dados para melhorar a experiência
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.activityTracking}
                  onCheckedChange={checked =>
                    handleSettingChange("privacy", "activityTracking", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Compartilhamento de Dados</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir compartilhamento com parceiros
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={checked =>
                    handleSettingChange("privacy", "dataSharing", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <select
                    id="language"
                    className="w-full p-2 border rounded-md"
                    value={settings.preferences.language}
                    onChange={e => handleSettingChange("preferences", "language", e.target.value)}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <select
                    id="timezone"
                    className="w-full p-2 border rounded-md"
                    value={settings.preferences.timezone}
                    onChange={e => handleSettingChange("preferences", "timezone", e.target.value)}
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <select
                    id="theme"
                    className="w-full p-2 border rounded-md"
                    value={settings.preferences.theme}
                    onChange={e => handleSettingChange("preferences", "theme", e.target.value)}
                  >
                    <option value="system">Sistema</option>
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda</Label>
                  <select
                    id="currency"
                    className="w-full p-2 border rounded-md"
                    value={settings.preferences.currency}
                    onChange={e => handleSettingChange("preferences", "currency", e.target.value)}
                  >
                    <option value="BRL">Real (R$)</option>
                    <option value="USD">Dólar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicionar uma camada extra de segurança
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactor}
                  onCheckedChange={checked => handleSettingChange("security", "twoFactor", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="480"
                  value={settings.security.sessionTimeout}
                  onChange={e =>
                    handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Alertas de Login</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre novos logins na conta
                  </p>
                </div>
                <Switch
                  checked={settings.security.loginAlerts}
                  onCheckedChange={checked =>
                    handleSettingChange("security", "loginAlerts", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedSettings;
