import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor, 
  Clock, 
  Settings,
  TestTube,
  Users,
  Ship,
  Award,
  MessageSquare,
  ClipboardCheck,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ShieldCheck,
  Volume2,
  Plug
} from "lucide-react";
import { useInspectionNotifications } from "@/hooks/useInspectionNotifications";
import { toast } from "sonner";
import { SoundAlertSettings } from "@/components/notifications/SoundAlertSettings";
import { IntegrationStatusPanel } from "@/components/integrations/IntegrationStatusPanel";

interface NotificationSettings {
  emailAlerts: boolean;
  pushNotifications: boolean;
  systemAlerts: boolean;
  scheduleStart: string;
  scheduleEnd: string;
  moduleSettings: Record<string, boolean>;
}

interface NotificationsAlertsTabProps {
  settings: NotificationSettings;
  onUpdate: (updates: Partial<NotificationSettings>) => void;
  testMode: boolean;
}

export const NotificationsAlertsTab: React.FC<NotificationsAlertsTabProps> = ({
  settings,
  onUpdate,
  testMode
}) => {
  const updateModuleSetting = (module: string, enabled: boolean) => {
    onUpdate({
      moduleSettings: {
        ...settings.moduleSettings,
        [module]: enabled
      }
    });
  };

  const notificationTypes = [
    {
      id: "email",
      title: "Notificações por E-mail",
      description: "Alertas importantes enviados para o e-mail",
      icon: Mail,
      enabled: settings.emailAlerts,
      onToggle: (enabled: boolean) => onUpdate({ emailAlerts: enabled })
    },
    {
      id: "push",
      title: "Notificações Push",
      description: "Notificações em tempo real no navegador",
      icon: Smartphone,
      enabled: settings.pushNotifications,
      onToggle: (enabled: boolean) => onUpdate({ pushNotifications: enabled })
    },
    {
      id: "system",
      title: "Alertas do Sistema",
      description: "Notificações internas do sistema",
      icon: Monitor,
      enabled: settings.systemAlerts,
      onToggle: (enabled: boolean) => onUpdate({ systemAlerts: enabled })
    }
  ];

  const moduleNotifications = [
    {
      id: "communication",
      name: "Comunicação",
      description: "Novas mensagens e atualizações de canais",
      icon: MessageSquare,
      color: "text-info",
      enabled: settings.moduleSettings.communication || false
    },
    {
      id: "crew",
      name: "Tripulação",
      description: "Embarques, desembarques e atualizações de pessoal",
      icon: Users,
      color: "text-success",
      enabled: settings.moduleSettings.crew || false
    },
    {
      id: "vessels",
      name: "Embarcações",
      description: "Status das embarcações e manutenções",
      icon: Ship,
      color: "text-accent-foreground",
      enabled: settings.moduleSettings.vessels || false
    },
    {
      id: "certificates",
      name: "Certificações",
      description: "Vencimentos e renovações de certificados",
      icon: Award,
      color: "text-warning",
      enabled: settings.moduleSettings.certificates || false
    }
  ];

  const frequencies = [
    { value: "immediate", label: "Imediata" },
    { value: "hourly", label: "A cada hora" },
    { value: "daily", label: "Diariamente" },
    { value: "weekly", label: "Semanalmente" }
  ];

  return (
    <div className="space-y-6">
      {/* Global Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Configurações Globais de Notificação
            {testMode && <Badge variant="outline" className="ml-2"><TestTube className="w-3 h-3 mr-1" />Teste</Badge>}
          </CardTitle>
          <CardDescription>
            Configure como e quando você deseja receber alertas e notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <Switch
                      checked={type.enabled}
                      onCheckedChange={type.onToggle}
                    />
                  </div>
                  <h4 className="font-medium mb-1">{type.title}</h4>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Horários para Envio de Notificações
          </CardTitle>
          <CardDescription>
            Defina os horários em que as notificações devem ser enviadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="scheduleStart">Horário de Início</Label>
              <Input
                id="scheduleStart"
                type="time"
                value={settings.scheduleStart}
                onChange={(e) => onUpdate({ scheduleStart: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Início do período para envio de notificações
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduleEnd">Horário de Fim</Label>
              <Input
                id="scheduleEnd"
                type="time"
                value={settings.scheduleEnd}
                onChange={(e) => onUpdate({ scheduleEnd: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Fim do período para envio de notificações
              </p>
            </div>
          </div>

          <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
            <p className="text-sm text-info">
              <strong>Período ativo:</strong> De {settings.scheduleStart} às {settings.scheduleEnd}
              <br />
              Notificações urgentes serão enviadas independente do horário.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Module-specific Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Notificações por Módulo
          </CardTitle>
          <CardDescription>
            Habilite ou desabilite notificações específicas de cada módulo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {moduleNotifications.map((module, index) => {
            const Icon = module.icon;
            return (
              <div key={module.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${module.color}`} />
                    <div>
                      <Label className="text-base font-medium">{module.name}</Label>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={module.enabled}
                    onCheckedChange={(enabled) => updateModuleSetting(module.id, enabled)}
                  />
                </div>
                {index < moduleNotifications.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Alert Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Categorias de Alertas
          </CardTitle>
          <CardDescription>
            Configure diferentes tipos de alertas e sua urgência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-destructive/10 text-destructive">Crítico</Badge>
                <Switch defaultChecked />
              </div>
              <h5 className="font-medium mb-1">Alertas Críticos</h5>
              <p className="text-sm text-muted-foreground">
                Emergências, falhas de sistema, vencimentos urgentes
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-warning/10 text-warning">Importante</Badge>
                <Switch defaultChecked />
              </div>
              <h5 className="font-medium mb-1">Alertas Importantes</h5>
              <p className="text-sm text-muted-foreground">
                Atualizações importantes, prazos, novos recursos
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-primary/10 text-primary">Informativo</Badge>
                <Switch defaultChecked />
              </div>
              <h5 className="font-medium mb-1">Alertas Informativos</h5>
              <p className="text-sm text-muted-foreground">
                Lembretes, dicas, atualizações gerais
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sound Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Alertas Sonoros
          </CardTitle>
          <CardDescription>
            Configure sons para alertas críticos de sensores IoT
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SoundAlertSettings />
        </CardContent>
      </Card>

      {/* Integration Status */}
      <IntegrationStatusPanel />

      {/* Inspection Alerts - Pre-OVID */}
      <InspectionAlertsSection settings={settings} onUpdate={onUpdate} />

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Testar Notificações</CardTitle>
          <CardDescription>
            Envie notificações de teste para verificar se as configurações estão funcionando
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
              <Mail className="w-4 h-4 inline mr-2" />
              Testar E-mail
            </button>
            <button className="px-4 py-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors">
              <Smartphone className="w-4 h-4 inline mr-2" />
              Testar Push
            </button>
            <button className="px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors">
              <Monitor className="w-4 h-4 inline mr-2" />
              Testar Sistema
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Inspection Alerts Section Component
interface InspectionAlertSettings {
  overdue: boolean;
  dueToday: boolean;
  due3Days: boolean;
  due7Days: boolean;
  pendingItems: boolean;
}

const InspectionAlertsSection: React.FC<{
  settings: NotificationSettings;
  onUpdate: (updates: Partial<NotificationSettings>) => void;
}> = ({ settings, onUpdate }) => {
  const { 
    isInitialized, 
    permissionGranted, 
    requestPermissions,
    checkDeadlines 
  } = useInspectionNotifications();

  const [inspectionAlerts, setInspectionAlerts] = useState<InspectionAlertSettings>(() => {
    const saved = sessionStorage.getItem('inspection-alert-settings');
    return saved ? JSON.parse(saved) : {
      overdue: true,
      dueToday: true,
      due3Days: true,
      due7Days: false,
      pendingItems: true
    };
  });

  useEffect(() => {
    sessionStorage.setItem('inspection-alert-settings', JSON.stringify(inspectionAlerts));
  }, [inspectionAlerts]);

  const updateInspectionAlert = (key: keyof InspectionAlertSettings, value: boolean) => {
    setInspectionAlerts(prev => ({ ...prev, [key]: value }));
    
    // Also update in moduleSettings for persistence
    onUpdate({
      moduleSettings: {
        ...settings.moduleSettings,
        [`inspection_${key}`]: value
      }
    });
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermissions();
    if (granted) {
      toast.success("Permissão concedida!", {
        description: "Você receberá alertas de prazos de inspeção"
      });
    }
  };

  const handleTestDeadlines = async () => {
    toast.info("Verificando prazos...");
    const count = await checkDeadlines();
    if (count > 0) {
      toast.success(`${count} alerta(s) enviado(s)`, {
        description: "Verifique suas notificações"
      });
    } else {
      toast.info("Nenhum prazo crítico encontrado");
    }
  };

  const inspectionAlertTypes = [
    {
      id: "overdue" as keyof InspectionAlertSettings,
      title: "Inspeções Atrasadas",
      description: "Alertas para inspeções que já passaram do prazo",
      icon: AlertTriangle,
      color: "text-destructive",
      badgeColor: "bg-destructive/10 text-destructive",
      priority: "Crítico"
    },
    {
      id: "dueToday" as keyof InspectionAlertSettings,
      title: "Vencem Hoje",
      description: "Alertas para inspeções que vencem hoje",
      icon: CalendarClock,
      color: "text-warning",
      badgeColor: "bg-warning/10 text-warning",
      priority: "Alto"
    },
    {
      id: "due3Days" as keyof InspectionAlertSettings,
      title: "Próximos 3 Dias",
      description: "Alertas antecipados para prazos em 3 dias",
      icon: Clock,
      color: "text-warning",
      badgeColor: "bg-warning/10 text-warning",
      priority: "Médio"
    },
    {
      id: "due7Days" as keyof InspectionAlertSettings,
      title: "Próximos 7 Dias",
      description: "Alertas antecipados para prazos em 7 dias",
      icon: CalendarClock,
      color: "text-primary",
      badgeColor: "bg-primary/10 text-primary",
      priority: "Baixo"
    },
    {
      id: "pendingItems" as keyof InspectionAlertSettings,
      title: "Itens Pendentes",
      description: "Alertas sobre itens de checklist não concluídos",
      icon: ClipboardCheck,
      color: "text-accent",
      badgeColor: "bg-accent/10 text-accent",
      priority: "Médio"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Alertas de Inspeção (Pre-OVID)
        </CardTitle>
        <CardDescription>
          Configure notificações push para prazos de inspeção e compliance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className={`p-4 rounded-lg border ${permissionGranted ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {permissionGranted ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-warning" />
              )}
              <div>
                <p className={`font-medium ${permissionGranted ? 'text-success' : 'text-warning'}`}>
                  {permissionGranted ? 'Notificações Push Ativadas' : 'Permissão Necessária'}
                </p>
                <p className={`text-sm ${permissionGranted ? 'text-success/80' : 'text-warning/80'}`}>
                  {permissionGranted 
                    ? 'Você receberá alertas de prazos de inspeção' 
                    : 'Ative as notificações para receber alertas'}
                </p>
              </div>
            </div>
            {!permissionGranted && (
              <Button 
                variant="outline" 
                onClick={handleRequestPermission}
                className="border-warning text-warning hover:bg-warning/10"
              >
                <Bell className="w-4 h-4 mr-2" />
                Ativar
              </Button>
            )}
          </div>
        </div>

        {/* Alert Types */}
        <div className="space-y-4">
          {inspectionAlertTypes.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={alert.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted/50`}>
                      <Icon className={`w-5 h-5 ${alert.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-medium">{alert.title}</Label>
                        <Badge className={alert.badgeColor} variant="secondary">
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={inspectionAlerts[alert.id]}
                    onCheckedChange={(enabled) => updateInspectionAlert(alert.id, enabled)}
                    disabled={!permissionGranted && !isInitialized}
                  />
                </div>
                {index < inspectionAlertTypes.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </div>

        {/* Test Button */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleTestDeadlines}
            disabled={!permissionGranted}
            className="w-full"
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Verificar Prazos e Enviar Alertas
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Verifica inspeções pendentes e envia notificações de acordo com as configurações acima
          </p>
        </div>
      </CardContent>
    </Card>
  );
};