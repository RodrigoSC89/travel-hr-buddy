import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { OrganizationLayout } from '@/components/layout/organization-layout';
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Users, 
  Database,
  Monitor,
  Save,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';

interface SystemSettings {
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    passwordComplexity: 'low' | 'medium' | 'high';
    loginAttempts: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'pt-BR' | 'en-US' | 'es-ES';
    timezone: string;
  };
  performance: {
    cacheEnabled: boolean;
    compressionEnabled: boolean;
    lazyLoadingEnabled: boolean;
    analyticsEnabled: boolean;
  };
}

export default function AdvancedSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
      frequency: 'immediate'
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 30,
      passwordComplexity: 'medium',
      loginAttempts: 3
    },
    appearance: {
      theme: 'dark',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    },
    performance: {
      cacheEnabled: true,
      compressionEnabled: true,
      lazyLoadingEnabled: true,
      analyticsEnabled: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateSettings = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações salvas",
        description: "Todas as configurações foram atualizadas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = () => {
    // Reset para valores padrão
    setSettings({
      notifications: {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        frequency: 'immediate'
      },
      security: {
        twoFactorRequired: false,
        sessionTimeout: 30,
        passwordComplexity: 'medium',
        loginAttempts: 3
      },
      appearance: {
        theme: 'dark',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo'
      },
      performance: {
        cacheEnabled: true,
        compressionEnabled: true,
        lazyLoadingEnabled: true,
        analyticsEnabled: true
      }
    });
    
    toast({
      title: "Configurações restauradas",
      description: "Todas as configurações foram restauradas aos valores padrão"
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nautilus-settings.json';
    link.click();
    
    toast({
      title: "Configurações exportadas",
      description: "Arquivo de configurações baixado com sucesso"
    });
  };

  return (
    <OrganizationLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Configurações Avançadas do Sistema
                </CardTitle>
                <CardDescription>
                  Configure todos os aspectos do sistema Nautilus One
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportSettings}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" onClick={resetSettings}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resetar
                </Button>
                <Button onClick={saveSettings} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Salvando...' : 'Salvar Tudo'}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="notifications" className="w-full">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4 min-w-fit">
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificações</span>
                <span className="sm:hidden">Notif.</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Segurança</span>
                <span className="sm:hidden">Segur.</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Aparência</span>
                <span className="sm:hidden">Apar.</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Performance</span>
                <span className="sm:hidden">Perf.</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Configure como e quando você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações importantes por email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.emailEnabled}
                      onCheckedChange={(checked) => updateSettings('notifications', 'emailEnabled', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações no navegador
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.pushEnabled}
                      onCheckedChange={(checked) => updateSettings('notifications', 'pushEnabled', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">Notificações SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações críticas por SMS
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={settings.notifications.smsEnabled}
                      onCheckedChange={(checked) => updateSettings('notifications', 'smsEnabled', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="notification-frequency">Frequência de Notificações</Label>
                    <select
                      id="notification-frequency"
                      className="w-full mt-2 p-2 border rounded-md"
                      value={settings.notifications.frequency}
                      onChange={(e) => updateSettings('notifications', 'frequency', e.target.value)}
                    >
                      <option value="immediate">Imediata</option>
                      <option value="hourly">A cada hora</option>
                      <option value="daily">Diária</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>
                  Configure as políticas de segurança do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Autenticação de Dois Fatores Obrigatória</Label>
                      <p className="text-sm text-muted-foreground">
                        Exigir 2FA para todos os usuários
                      </p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={settings.security.twoFactorRequired}
                      onCheckedChange={(checked) => updateSettings('security', 'twoFactorRequired', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSettings('security', 'sessionTimeout', Number(e.target.value))}
                      className="mt-2"
                      min="5"
                      max="480"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password-complexity">Complexidade de Senha</Label>
                    <select
                      id="password-complexity"
                      className="w-full mt-2 p-2 border rounded-md"
                      value={settings.security.passwordComplexity}
                      onChange={(e) => updateSettings('security', 'passwordComplexity', e.target.value)}
                    >
                      <option value="low">Baixa (8+ caracteres)</option>
                      <option value="medium">Média (8+ chars, números, símbolos)</option>
                      <option value="high">Alta (12+ chars, maiús, minús, números, símbolos)</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="login-attempts">Tentativas de Login Permitidas</Label>
                    <Input
                      id="login-attempts"
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) => updateSettings('security', 'loginAttempts', Number(e.target.value))}
                      className="mt-2"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Configurações de Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a interface do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme">Tema</Label>
                    <select
                      id="theme"
                      className="w-full mt-2 p-2 border rounded-md"
                      value={settings.appearance.theme}
                      onChange={(e) => updateSettings('appearance', 'theme', e.target.value)}
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <select
                      id="language"
                      className="w-full mt-2 p-2 border rounded-md"
                      value={settings.appearance.language}
                      onChange={(e) => updateSettings('appearance', 'language', e.target.value)}
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <select
                      id="timezone"
                      className="w-full mt-2 p-2 border rounded-md"
                      value={settings.appearance.timezone}
                      onChange={(e) => updateSettings('appearance', 'timezone', e.target.value)}
                    >
                      <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                      <option value="America/New_York">Nova York (GMT-5)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                      <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Configurações de Performance
                </CardTitle>
                <CardDescription>
                  Otimize o desempenho do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="cache-enabled">Cache Habilitado</Label>
                      <p className="text-sm text-muted-foreground">
                        Melhora a velocidade de carregamento
                      </p>
                    </div>
                    <Switch
                      id="cache-enabled"
                      checked={settings.performance.cacheEnabled}
                      onCheckedChange={(checked) => updateSettings('performance', 'cacheEnabled', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="compression-enabled">Compressão Habilitada</Label>
                      <p className="text-sm text-muted-foreground">
                        Reduz o tamanho dos arquivos transferidos
                      </p>
                    </div>
                    <Switch
                      id="compression-enabled"
                      checked={settings.performance.compressionEnabled}
                      onCheckedChange={(checked) => updateSettings('performance', 'compressionEnabled', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lazy-loading">Carregamento Sob Demanda</Label>
                      <p className="text-sm text-muted-foreground">
                        Carrega conteúdo conforme necessário
                      </p>
                    </div>
                    <Switch
                      id="lazy-loading"
                      checked={settings.performance.lazyLoadingEnabled}
                      onCheckedChange={(checked) => updateSettings('performance', 'lazyLoadingEnabled', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics-enabled">Analytics Habilitado</Label>
                      <p className="text-sm text-muted-foreground">
                        Coleta dados de uso para melhorias
                      </p>
                    </div>
                    <Switch
                      id="analytics-enabled"
                      checked={settings.performance.analyticsEnabled}
                      onCheckedChange={(checked) => updateSettings('performance', 'analyticsEnabled', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Card */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="text-sm font-medium">
                  Algumas configurações podem exigir reinicialização do sistema
                </span>
              </div>
              <Badge variant="secondary">
                Última atualização: {new Date().toLocaleString('pt-BR')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrganizationLayout>
  );
}