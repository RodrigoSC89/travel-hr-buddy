/**
 * Push Notification Settings Panel
 * Configure notification preferences, frequency, channels, and alert types
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCompliancePushNotifications } from '@/hooks/use-compliance-push-notifications';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  Bell, BellOff, Settings, Clock, Mail, Smartphone, 
  MessageSquare, AlertTriangle, CheckCircle, Info,
  Shield, Ship, FileText, Calendar, Volume2, VolumeX,
  Save, RotateCcw, TestTube
} from 'lucide-react';

interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  description: string;
}

interface AlertType {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  channels: string[];
}

interface NotificationSettings {
  globalEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  channels: NotificationChannel[];
  alertTypes: AlertType[];
}

const DEFAULT_SETTINGS: NotificationSettings = {
  globalEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  frequency: 'immediate',
  soundEnabled: true,
  vibrationEnabled: true,
  channels: [
    { id: 'push', name: 'Push Notifications', icon: <Smartphone className="h-4 w-4" />, enabled: true, description: 'Notificações no navegador/dispositivo' },
    { id: 'email', name: 'E-mail', icon: <Mail className="h-4 w-4" />, enabled: false, description: 'Alertas enviados por e-mail' },
    { id: 'sms', name: 'SMS', icon: <MessageSquare className="h-4 w-4" />, enabled: false, description: 'Mensagens de texto (críticos apenas)' },
  ],
  alertTypes: [
    { id: 'inspection-overdue', name: 'Inspeção Vencida', description: 'Quando uma inspeção ultrapassa a data limite', severity: 'critical', enabled: true, channels: ['push', 'email', 'sms'] },
    { id: 'inspection-due-soon', name: 'Inspeção Próxima', description: 'Aviso prévio de inspeção (7, 3, 1 dia)', severity: 'warning', enabled: true, channels: ['push', 'email'] },
    { id: 'geofence-entry', name: 'Entrada em Geofence', description: 'Embarcação entrou em zona de inspeção obrigatória', severity: 'warning', enabled: true, channels: ['push'] },
    { id: 'compliance-critical', name: 'Compliance Crítico', description: 'Módulo de compliance em status crítico', severity: 'critical', enabled: true, channels: ['push', 'email', 'sms'] },
    { id: 'document-expiring', name: 'Documento Expirando', description: 'Certificado ou documento próximo do vencimento', severity: 'warning', enabled: true, channels: ['push', 'email'] },
    { id: 'audit-scheduled', name: 'Auditoria Agendada', description: 'Lembrete de auditoria programada', severity: 'info', enabled: true, channels: ['push'] },
    { id: 'system-updates', name: 'Atualizações do Sistema', description: 'Notificações sobre novas funcionalidades', severity: 'info', enabled: false, channels: ['push'] },
  ]
};

export function PushNotificationSettingsPanel() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification
  } = useCompliancePushNotifications();

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nautilus-notification-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        logger.error('Failed to parse saved settings');
      }
    }
  }, []);

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const updateChannel = (channelId: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      channels: prev.channels.map(ch => 
        ch.id === channelId ? { ...ch, enabled } : ch
      )
    }));
    setHasChanges(true);
  };

  const updateAlertType = (alertId: string, updates: Partial<AlertType>) => {
    setSettings(prev => ({
      ...prev,
      alertTypes: prev.alertTypes.map(at => 
        at.id === alertId ? { ...at, ...updates } : at
      )
    }));
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('nautilus-notification-settings', JSON.stringify(settings));
      
      // If push is enabled but not subscribed, subscribe
      if (settings.globalEnabled && settings.channels.find(c => c.id === 'push')?.enabled && !isSubscribed) {
        await subscribe();
      }
      
      toast.success('Configurações salvas com sucesso');
      setHasChanges(false);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
    toast.info('Configurações restauradas para o padrão');
  };

  const getSeverityColor = (severity: AlertType['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-orange-500';
      case 'info': return 'text-blue-500';
    }
  };

  const getSeverityBadge = (severity: AlertType['severity']) => {
    const variants: Record<string, string> = {
      'critical': 'bg-red-500/10 text-red-500 border-red-500/20',
      'warning': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      'info': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    const labels = { 'critical': 'Crítico', 'warning': 'Alerta', 'info': 'Info' };
    return <Badge variant="outline" className={variants[severity]}>{labels[severity]}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Gerencie alertas, canais e preferências de notificação
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isSupported && (
                <Badge variant="destructive">
                  <BellOff className="h-3 w-3 mr-1" />
                  Não suportado
                </Badge>
              )}
              {isSupported && isSubscribed && (
                <Badge variant="outline" className="text-green-500 border-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Push Ativo
                </Badge>
              )}
              {isSupported && !isSubscribed && permission !== 'denied' && (
                <Badge variant="outline" className="text-orange-500 border-orange-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Push Inativo
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {settings.globalEnabled ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Notificações Globais</p>
                <p className="text-sm text-muted-foreground">
                  {settings.globalEnabled ? 'Todas as notificações ativas' : 'Todas as notificações desativadas'}
                </p>
              </div>
            </div>
            <Switch
              checked={settings.globalEnabled}
              onCheckedChange={(enabled) => updateSettings({ globalEnabled: enabled })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Canais de Notificação
          </CardTitle>
          <CardDescription>
            Escolha como deseja receber as notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.channels.map((channel) => (
            <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${channel.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  {channel.icon}
                </div>
                <div>
                  <p className="font-medium">{channel.name}</p>
                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {channel.id === 'push' && !isSubscribed && channel.enabled && (
                  <Button size="sm" variant="outline" onClick={subscribe} disabled={isLoading}>
                    Ativar
                  </Button>
                )}
                <Switch
                  checked={channel.enabled}
                  onCheckedChange={(enabled) => updateChannel(channel.id, enabled)}
                  disabled={!settings.globalEnabled}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Frequency & Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Frequência e Horários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Frequência de Notificações</Label>
            <Select 
              value={settings.frequency} 
              onValueChange={(value: NotificationSettings['frequency']) => updateSettings({ frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Imediato (assim que ocorrer)</SelectItem>
                <SelectItem value="hourly">Resumo por hora</SelectItem>
                <SelectItem value="daily">Resumo diário</SelectItem>
                <SelectItem value="weekly">Resumo semanal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Alertas críticos são sempre enviados imediatamente
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Horário Silencioso</p>
                <p className="text-sm text-muted-foreground">
                  Pausar notificações durante determinado período
                </p>
              </div>
              <Switch
                checked={settings.quietHoursEnabled}
                onCheckedChange={(enabled) => updateSettings({ quietHoursEnabled: enabled })}
              />
            </div>
            
            {settings.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input 
                    type="time" 
                    value={settings.quietHoursStart}
                    onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input 
                    type="time" 
                    value={settings.quietHoursEnd}
                    onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="text-sm">Som</span>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(enabled) => updateSettings({ soundEnabled: enabled })}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm">Vibração</span>
              </div>
              <Switch
                checked={settings.vibrationEnabled}
                onCheckedChange={(enabled) => updateSettings({ vibrationEnabled: enabled })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Tipos de Alerta
          </CardTitle>
          <CardDescription>
            Configure quais alertas deseja receber
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.alertTypes.map((alertType) => (
            <div key={alertType.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg bg-muted ${getSeverityColor(alertType.severity)}`}>
                  {alertType.severity === 'critical' && <AlertTriangle className="h-4 w-4" />}
                  {alertType.severity === 'warning' && <Shield className="h-4 w-4" />}
                  {alertType.severity === 'info' && <Info className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{alertType.name}</p>
                    {getSeverityBadge(alertType.severity)}
                  </div>
                  <p className="text-sm text-muted-foreground">{alertType.description}</p>
                </div>
              </div>
              <Switch
                checked={alertType.enabled}
                onCheckedChange={(enabled) => updateAlertType(alertType.id, { enabled })}
                disabled={!settings.globalEnabled}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Padrão
              </Button>
              <Button variant="outline" onClick={sendTestNotification} disabled={!isSubscribed}>
                <TestTube className="h-4 w-4 mr-2" />
                Enviar Teste
              </Button>
            </div>
            <Button onClick={saveSettings} disabled={!hasChanges || isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
