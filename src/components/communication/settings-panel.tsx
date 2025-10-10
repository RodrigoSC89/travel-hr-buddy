import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  User,
  Shield,
  Bell,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Archive,
  Clock,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  Volume2,
  VolumeX
} from "lucide-react";

interface UserSettings {
  profile: {
    display_name: string;
    signature: string;
    avatar_url: string;
    timezone: string;
    language: string;
  };
  privacy: {
    show_online_status: boolean;
    allow_direct_messages: boolean;
    read_receipts: boolean;
    typing_indicators: boolean;
  };
  notifications: {
    email_enabled: boolean;
    push_enabled: boolean;
    sms_enabled: boolean;
    sound_enabled: boolean;
    desktop_enabled: boolean;
    quiet_hours_enabled: boolean;
    quiet_start: string;
    quiet_end: string;
  };
  communication: {
    auto_archive_days: number;
    message_preview: boolean;
    thread_grouping: boolean;
    ai_suggestions: boolean;
    smart_replies: boolean;
  };
  security: {
    two_factor_enabled: boolean;
    session_timeout: number;
    login_notifications: boolean;
    device_verification: boolean;
  };
}

export const SettingsPanel = () => {
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      display_name: "João Silva",
      signature: "João Silva\nDPO - Dynamic Positioning Officer\nNautilus Maritime Solutions",
      avatar_url: "",
      timezone: "America/Sao_Paulo",
      language: "pt-BR"
    },
    privacy: {
      show_online_status: true,
      allow_direct_messages: true,
      read_receipts: true,
      typing_indicators: true
    },
    notifications: {
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      sound_enabled: true,
      desktop_enabled: true,
      quiet_hours_enabled: false,
      quiet_start: "22:00",
      quiet_end: "08:00"
    },
    communication: {
      auto_archive_days: 90,
      message_preview: true,
      thread_grouping: true,
      ai_suggestions: true,
      smart_replies: true
    },
    security: {
      two_factor_enabled: false,
      session_timeout: 8,
      login_notifications: true,
      device_verification: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Mock loading settings - replace with real Supabase query
      // Settings are already initialized in state
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const updateSettings = (section: keyof UserSettings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // Mock saving settings - replace with real Supabase update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    setSettings({
      profile: {
        display_name: "João Silva",
        signature: "João Silva\nDPO - Dynamic Positioning Officer\nNautilus Maritime Solutions",
        avatar_url: "",
        timezone: "America/Sao_Paulo",
        language: "pt-BR"
      },
      privacy: {
        show_online_status: true,
        allow_direct_messages: true,
        read_receipts: true,
        typing_indicators: true
      },
      notifications: {
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        sound_enabled: true,
        desktop_enabled: true,
        quiet_hours_enabled: false,
        quiet_start: "22:00",
        quiet_end: "08:00"
      },
      communication: {
        auto_archive_days: 90,
        message_preview: true,
        thread_grouping: true,
        ai_suggestions: true,
        smart_replies: true
      },
      security: {
        two_factor_enabled: false,
        session_timeout: 8,
        login_notifications: true,
        device_verification: true
      }
    });
    setHasChanges(true);
  };

  const handleAvatarUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/gif";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        // Check file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
          toast({
            title: "Erro",
            description: "A imagem deve ter no máximo 2MB",
            variant: "destructive"
          });
          return;
        }
        
        // In a real implementation, upload to storage and get URL
        const url = URL.createObjectURL(file);
        updateSettings("profile", { avatar_url: url });
        
        toast({
          title: "Sucesso",
          description: "Foto de perfil atualizada"
        });
      }
    };
    input.click();
  };

  const exportData = async () => {
    try {
      // Mock data export
      const dataToExport = {
        settings,
        messages: [], // Would include user messages
        export_date: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json"
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nautilus-communication-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar dados",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="warning">Alterações não salvas</Badge>
              )}
              <Button variant="outline" onClick={resetSettings}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Padrão
              </Button>
              <Button onClick={saveSettings} disabled={loading || !hasChanges}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Eye className="h-4 w-4" />
            Privacidade
          </TabsTrigger>
          <TabsTrigger value="communication" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Comunicação
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome de Exibição</Label>
                  <Input
                    value={settings.profile.display_name}
                    onChange={(e) => updateSettings("profile", { display_name: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <Label>Assinatura</Label>
                  <Textarea
                    value={settings.profile.signature}
                    onChange={(e) => updateSettings("profile", { signature: e.target.value })}
                    placeholder="Assinatura para suas mensagens"
                    className="min-h-20"
                  />
                </div>
                
                <div>
                  <Label>Fuso Horário</Label>
                  <Select 
                    value={settings.profile.timezone}
                    onValueChange={(value) => updateSettings("profile", { timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Idioma</Label>
                  <Select 
                    value={settings.profile.language}
                    onValueChange={(value) => updateSettings("profile", { language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avatar e Foto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm" onClick={handleAvatarUpload} aria-label="Enviar foto de perfil">
                      <Upload className="h-4 w-4 mr-2" />
                      Enviar Foto
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG ou GIF. Máximo 2MB.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>URL do Avatar</Label>
                  <Input
                    value={settings.profile.avatar_url}
                    onChange={(e) => updateSettings("profile", { avatar_url: e.target.value })}
                    placeholder="https://exemplo.com/avatar.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Canais de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>Email</Label>
                  </div>
                  <Switch 
                    checked={settings.notifications.email_enabled}
                    onCheckedChange={(checked) => updateSettings("notifications", { email_enabled: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>Push (Celular)</Label>
                  </div>
                  <Switch 
                    checked={settings.notifications.push_enabled}
                    onCheckedChange={(checked) => updateSettings("notifications", { push_enabled: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label>SMS</Label>
                  </div>
                  <Switch 
                    checked={settings.notifications.sms_enabled}
                    onCheckedChange={(checked) => updateSettings("notifications", { sms_enabled: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <Label>Desktop</Label>
                  </div>
                  <Switch 
                    checked={settings.notifications.desktop_enabled}
                    onCheckedChange={(checked) => updateSettings("notifications", { desktop_enabled: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.notifications.sound_enabled ? 
                      <Volume2 className="h-4 w-4" /> : 
                      <VolumeX className="h-4 w-4" />
                    }
                    <Label>Som</Label>
                  </div>
                  <Switch 
                    checked={settings.notifications.sound_enabled}
                    onCheckedChange={(checked) => updateSettings("notifications", { sound_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horário de Silêncio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Ativar horário de silêncio</Label>
                  <Switch 
                    checked={settings.notifications.quiet_hours_enabled}
                    onCheckedChange={(checked) => updateSettings("notifications", { quiet_hours_enabled: checked })}
                  />
                </div>
                
                {settings.notifications.quiet_hours_enabled && (
                  <div className="space-y-3">
                    <div>
                      <Label>Início</Label>
                      <Select 
                        value={settings.notifications.quiet_start}
                        onValueChange={(value) => updateSettings("notifications", { quiet_start: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, "0");
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Fim</Label>
                      <Select 
                        value={settings.notifications.quiet_end}
                        onValueChange={(value) => updateSettings("notifications", { quiet_end: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, "0");
                            return (
                              <SelectItem key={hour} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Privacidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mostrar status online</Label>
                      <p className="text-sm text-muted-foreground">
                        Outros usuários podem ver quando você está online
                      </p>
                    </div>
                    <Switch 
                      checked={settings.privacy.show_online_status}
                      onCheckedChange={(checked) => updateSettings("privacy", { show_online_status: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Permitir mensagens diretas</Label>
                      <p className="text-sm text-muted-foreground">
                        Outros usuários podem enviar mensagens diretas
                      </p>
                    </div>
                    <Switch 
                      checked={settings.privacy.allow_direct_messages}
                      onCheckedChange={(checked) => updateSettings("privacy", { allow_direct_messages: checked })}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Confirmação de leitura</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar confirmação quando ler mensagens
                      </p>
                    </div>
                    <Switch 
                      checked={settings.privacy.read_receipts}
                      onCheckedChange={(checked) => updateSettings("privacy", { read_receipts: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Indicador de digitação</Label>
                      <p className="text-sm text-muted-foreground">
                        Mostrar quando estou digitando
                      </p>
                    </div>
                    <Switch 
                      checked={settings.privacy.typing_indicators}
                      onCheckedChange={(checked) => updateSettings("privacy", { typing_indicators: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Settings */}
        <TabsContent value="communication" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Comunicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Auto-arquivar mensagens após (dias)</Label>
                  <Select 
                    value={settings.communication.auto_archive_days.toString()}
                    onValueChange={(value) => updateSettings("communication", { auto_archive_days: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                      <SelectItem value="180">180 dias</SelectItem>
                      <SelectItem value="365">1 ano</SelectItem>
                      <SelectItem value="-1">Nunca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Pré-visualização de mensagens</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar prévia do conteúdo nas notificações
                    </p>
                  </div>
                  <Switch 
                    checked={settings.communication.message_preview}
                    onCheckedChange={(checked) => updateSettings("communication", { message_preview: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Agrupamento de threads</Label>
                    <p className="text-sm text-muted-foreground">
                      Agrupar mensagens relacionadas
                    </p>
                  </div>
                  <Switch 
                    checked={settings.communication.thread_grouping}
                    onCheckedChange={(checked) => updateSettings("communication", { thread_grouping: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos de IA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sugestões de IA</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber sugestões inteligentes
                    </p>
                  </div>
                  <Switch 
                    checked={settings.communication.ai_suggestions}
                    onCheckedChange={(checked) => updateSettings("communication", { ai_suggestions: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Respostas inteligentes</Label>
                    <p className="text-sm text-muted-foreground">
                      Sugestões automáticas de resposta
                    </p>
                  </div>
                  <Switch 
                    checked={settings.communication.smart_replies}
                    onCheckedChange={(checked) => updateSettings("communication", { smart_replies: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autenticação de dois fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicionar uma camada extra de segurança
                    </p>
                  </div>
                  <Switch 
                    checked={settings.security.two_factor_enabled}
                    onCheckedChange={(checked) => updateSettings("security", { two_factor_enabled: checked })}
                  />
                </div>
                
                <div>
                  <Label>Timeout de sessão (horas)</Label>
                  <Select 
                    value={settings.security.session_timeout.toString()}
                    onValueChange={(value) => updateSettings("security", { session_timeout: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="8">8 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                      <SelectItem value="168">1 semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações de login</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertar sobre novos logins
                    </p>
                  </div>
                  <Switch 
                    checked={settings.security.login_notifications}
                    onCheckedChange={(checked) => updateSettings("security", { login_notifications: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verificação de dispositivo</Label>
                    <p className="text-sm text-muted-foreground">
                      Verificar dispositivos não reconhecidos
                    </p>
                  </div>
                  <Switch 
                    checked={settings.security.device_verification}
                    onCheckedChange={(checked) => updateSettings("security", { device_verification: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados e Privacidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" onClick={exportData} className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Meus Dados
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Archive className="h-4 w-4 mr-2" />
                    Arquivar Mensagens Antigas
                  </Button>
                  
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Todas as Mensagens
                  </Button>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium text-sm">Política de Retenção</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mensagens são mantidas conforme a política de retenção da empresa. 
                    Dados sensíveis são criptografados e protegidos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};