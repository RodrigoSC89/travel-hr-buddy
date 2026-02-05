/**
 * System Settings Component
 * Preferências de usuário, notificações, temas
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, Bell, Moon, Sun, Globe, Shield,
  User, Mail, Smartphone, Clock, Save, RefreshCw,
  Monitor, Palette, Volume2, VolumeX, Languages,
  Lock, Key, LogOut, Trash2, Download, Upload
} from "lucide-react";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const notificationSettings: NotificationSetting[] = [
  { id: "alerts", label: "Alertas Críticos", description: "Notificações de segurança e emergências", email: true, push: true, sms: true },
  { id: "maintenance", label: "Manutenção", description: "Lembretes de manutenção programada", email: true, push: true, sms: false },
  { id: "documents", label: "Documentos", description: "Vencimento de certificados e licenças", email: true, push: false, sms: false },
  { id: "reports", label: "Relatórios", description: "Relatórios diários e semanais", email: true, push: false, sms: false },
  { id: "updates", label: "Atualizações", description: "Novidades e melhorias do sistema", email: false, push: true, sms: false }
];

export function SystemSettings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(notificationSettings);
  const [language, setLanguage] = useState("pt-BR");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("30");

  const toggleNotification = (id: string, channel: "email" | "push" | "sms") => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, [channel]: !n[channel] } : n
    ));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Dados</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localização
              </CardTitle>
              <CardDescription>Configurações de idioma e fuso horário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language" className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Idioma
                  </Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Fuso Horário
                  </Label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                    <option value="Asia/Singapore">Singapore (GMT+8)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Comportamento
              </CardTitle>
              <CardDescription>Configurações de interface e atualização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Atualização Automática
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Atualizar dados automaticamente em tempo real
                  </p>
                </div>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>

              {autoRefresh && (
                <div className="space-y-2 pl-6">
                  <Label>Intervalo de Atualização</Label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="15">15 segundos</option>
                    <option value="30">30 segundos</option>
                    <option value="60">1 minuto</option>
                    <option value="300">5 minutos</option>
                  </select>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    Sons de Notificação
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduzir som ao receber notificações
                  </p>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>Escolha como deseja receber notificações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 pb-2 border-b">
                  <div className="col-span-1"></div>
                  <div className="text-center">
                    <Mail className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-xs text-muted-foreground">Email</span>
                  </div>
                  <div className="text-center">
                    <Smartphone className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-xs text-muted-foreground">Push</span>
                  </div>
                  <div className="text-center">
                    <Smartphone className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-xs text-muted-foreground">SMS</span>
                  </div>
                </div>

                {/* Notification Items */}
                {notifications.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-4 gap-4 items-center py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="flex justify-center">
                      <Switch 
                        checked={setting.email} 
                        onCheckedChange={() => toggleNotification(setting.id, "email")}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch 
                        checked={setting.push} 
                        onCheckedChange={() => toggleNotification(setting.id, "push")}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Switch 
                        checked={setting.sms} 
                        onCheckedChange={() => toggleNotification(setting.id, "sms")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Modo Escuro
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Alternar entre tema claro e escuro
                  </p>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Densidade da Interface</Label>
                <div className="grid grid-cols-3 gap-4">
                  {["Compacta", "Confortável", "Espaçosa"].map((density) => (
                    <Button
                      key={density}
                      variant={density === "Confortável" ? "default" : "outline"}
                      className="w-full"
                    >
                      {density}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Cor de Destaque</Label>
                <div className="flex gap-3">
                  {["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full ${color} ring-2 ring-offset-2 ${color === "bg-blue-500" ? "ring-primary" : "ring-transparent"}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Senha e Autenticação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Key className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Smartphone className="h-4 w-4 mr-2" />
                Configurar Autenticação em Duas Etapas
                <Badge variant="secondary" className="ml-auto">Recomendado</Badge>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sessões Ativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { device: "Chrome - Windows", location: "São Paulo, BR", current: true },
                { device: "Safari - iPhone", location: "Santos, BR", current: false },
                { device: "Firefox - MacOS", location: "Rio de Janeiro, BR", current: false }
              ].map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{session.device}</p>
                      <p className="text-xs text-muted-foreground">{session.location}</p>
                    </div>
                  </div>
                  {session.current ? (
                    <Badge variant="secondary">Sessão Atual</Badge>
                  ) : (
                    <Button variant="ghost" size="sm">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                <LogOut className="h-4 w-4 mr-2" />
                Encerrar Todas as Outras Sessões
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportar Dados
              </CardTitle>
              <CardDescription>Baixe uma cópia dos seus dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Exportar Todos os Dados (JSON)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatórios (Excel)
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Zona de Perigo
              </CardTitle>
              <CardDescription>Ações irreversíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Minha Conta
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Esta ação é irreversível e excluirá permanentemente todos os seus dados.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">
          <Save className="h-4 w-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}

export default SystemSettings;
