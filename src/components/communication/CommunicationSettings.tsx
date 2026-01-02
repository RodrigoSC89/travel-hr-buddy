/**
 * CommunicationSettings - Configurações de Comunicação
 * Preferências de notificações, canais e integrações
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Settings,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Shield,
  Clock,
  Volume2,
  VolumeX,
  Save,
  RefreshCw
} from "lucide-react";

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreference[] = [
  { id: "maintenance", label: "Manutenção", description: "Alertas de manutenção programada e urgente", email: true, push: true, sms: false },
  { id: "crew", label: "Tripulação", description: "Atualizações sobre tripulantes e certificados", email: true, push: true, sms: false },
  { id: "compliance", label: "Compliance", description: "Alertas de auditorias e conformidade", email: true, push: true, sms: true },
  { id: "weather", label: "Meteorologia", description: "Alertas meteorológicos e condições adversas", email: false, push: true, sms: true },
  { id: "operations", label: "Operações", description: "Atualizações de viagens e escalas", email: true, push: true, sms: false },
  { id: "system", label: "Sistema", description: "Notificações do sistema e atualizações", email: true, push: false, sms: false },
];

export const CommunicationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(DEFAULT_PREFERENCES);
  const [globalSettings, setGlobalSettings] = useState({
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    soundEnabled: true,
    language: "pt-BR",
    timezone: "America/Sao_Paulo"
  });
  const [isSaving, setIsSaving] = useState(false);

  const updatePreference = (id: string, channel: 'email' | 'push' | 'sms', value: boolean) => {
    setPreferences(prev => 
      prev.map(p => p.id === id ? { ...p, [channel]: value } : p)
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Configurações salvas!", { description: "Suas preferências foram atualizadas" });
    }, 1000);
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
    toast.success("Configurações restauradas aos padrões");
  };

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Configure as preferências globais de comunicação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Modo Silencioso</Label>
                <p className="text-sm text-muted-foreground">
                  Desativar notificações durante horário de descanso
                </p>
              </div>
              <Switch 
                checked={globalSettings.quietHoursEnabled}
                onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, quietHoursEnabled: checked }))}
              />
            </div>
            
            {globalSettings.quietHoursEnabled && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input 
                    type="time" 
                    value={globalSettings.quietHoursStart}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input 
                    type="time" 
                    value={globalSettings.quietHoursEnd}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {globalSettings.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-base font-medium">Sons de Notificação</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar sons para novas notificações
                </p>
              </div>
            </div>
            <Switch 
              checked={globalSettings.soundEnabled}
              onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, soundEnabled: checked }))}
            />
          </div>

          <Separator />

          {/* Language and Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Idioma
              </Label>
              <Select 
                value={globalSettings.language}
                onValueChange={(value) => setGlobalSettings(prev => ({ ...prev, language: value }))}
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
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Fuso Horário
              </Label>
              <Select 
                value={globalSettings.timezone}
                onValueChange={(value) => setGlobalSettings(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  <SelectItem value="Europe/Amsterdam">Amsterdam (GMT+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Canais de Notificação
          </CardTitle>
          <CardDescription>
            Configure como deseja receber cada tipo de notificação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 py-2 px-4 bg-muted rounded-t-lg text-sm font-medium">
              <div className="col-span-6">Tipo de Notificação</div>
              <div className="col-span-2 text-center flex items-center justify-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <div className="col-span-2 text-center flex items-center justify-center gap-1">
                <Bell className="h-4 w-4" />
                Push
              </div>
              <div className="col-span-2 text-center flex items-center justify-center gap-1">
                <Smartphone className="h-4 w-4" />
                SMS
              </div>
            </div>
            
            {/* Preferences */}
            {preferences.map((pref, index) => (
              <div 
                key={pref.id} 
                className={`grid grid-cols-12 gap-4 py-3 px-4 items-center ${
                  index % 2 === 0 ? 'bg-muted/30' : ''
                }`}
              >
                <div className="col-span-6">
                  <p className="font-medium">{pref.label}</p>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch 
                    checked={pref.email}
                    onCheckedChange={(checked) => updatePreference(pref.id, 'email', checked)}
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch 
                    checked={pref.push}
                    onCheckedChange={(checked) => updatePreference(pref.id, 'push', checked)}
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch 
                    checked={pref.sms}
                    onCheckedChange={(checked) => updatePreference(pref.id, 'sms', checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={resetToDefaults}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Restaurar Padrões
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};

export default CommunicationSettings;
