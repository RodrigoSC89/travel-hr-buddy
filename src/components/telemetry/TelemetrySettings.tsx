/**
import { useState, useCallback } from "react";;
 * Telemetry Settings Modal Component
 * Configuration panel for telemetry module
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TelemetryConfig {
  autoSyncInterval: number;
  enableNotifications: boolean;
  notificationSound: boolean;
  dataRetentionDays: number;
  mapRefreshRate: number;
  alertThreshold: "low" | "medium" | "high";
  aiModelPreference: "fast" | "balanced" | "accurate";
  showWeatherAlerts: boolean;
  showSatelliteAlerts: boolean;
  showSystemAlerts: boolean;
  darkMapTheme: boolean;
}

interface TelemetrySettingsProps {
  config?: Partial<TelemetryConfig>;
  onSave?: (config: TelemetryConfig) => void;
  trigger?: React.ReactNode;
}

const defaultConfig: TelemetryConfig = {
  autoSyncInterval: 60,
  enableNotifications: true,
  notificationSound: true,
  dataRetentionDays: 30,
  mapRefreshRate: 30,
  alertThreshold: "medium",
  aiModelPreference: "balanced",
  showWeatherAlerts: true,
  showSatelliteAlerts: true,
  showSystemAlerts: true,
  darkMapTheme: true,
};

export const TelemetrySettings = memo(function({ config, onSave, trigger }: TelemetrySettingsProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<TelemetryConfig>({
    ...defaultConfig,
    ...config,
  });

  const handleSave = () => {
    onSave?.(settings);
    toast.success("Configurações salvas com sucesso!");
    setOpen(false);
  };

  const handleReset = () => {
    setSettings(defaultConfig);
    toast.info("Configurações restauradas para padrão");
  };

  const updateSetting = <K extends keyof TelemetryConfig>(
    key: K,
    value: TelemetryConfig[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Telemetria
          </DialogTitle>
          <DialogDescription>
            Configure o comportamento do módulo de telemetria
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="sync">Sincronização</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="ai">IA</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações de alertas
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(v) => updateSetting("enableNotifications", v}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound">Som de Notificação</Label>
                  <p className="text-sm text-muted-foreground">
                    Tocar som ao receber alertas
                  </p>
                </div>
                <Switch
                  id="sound"
                  checked={settings.notificationSound}
                  onCheckedChange={(v) => updateSetting("notificationSound", v}
                  disabled={!settings.enableNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMap">Tema Escuro do Mapa</Label>
                  <p className="text-sm text-muted-foreground">
                    Usar tema escuro na visualização do mapa
                  </p>
                </div>
                <Switch
                  id="darkMap"
                  checked={settings.darkMapTheme}
                  onCheckedChange={(v) => updateSetting("darkMapTheme", v}
                />
              </div>

              <div className="space-y-2">
                <Label>Retenção de Dados (dias)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.dataRetentionDays]}
                    onValueChange={([v]) => updateSetting("dataRetentionDays", v}
                    min={7}
                    max={90}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">
                    {settings.dataRetentionDays}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Intervalo de Auto-Sync (segundos)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.autoSyncInterval]}
                    onValueChange={([v]) => updateSetting("autoSyncInterval", v}
                    min={10}
                    max={300}
                    step={10}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">
                    {settings.autoSyncInterval}s
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Intervalo mínimo: 10s | Máximo: 300s (5 min)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Taxa de Atualização do Mapa (segundos)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[settings.mapRefreshRate]}
                    onValueChange={([v]) => updateSetting("mapRefreshRate", v}
                    min={5}
                    max={120}
                    step={5}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-medium">
                    {settings.mapRefreshRate}s
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Limite de Alerta</Label>
                <Select
                  value={settings.alertThreshold}
                  onValueChange={(v: "low" | "medium" | "high") =>
                    updateSetting("alertThreshold", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      Baixo - Todos os alertas
                    </SelectItem>
                    <SelectItem value="medium">
                      Médio - Avisos e Críticos
                    </SelectItem>
                    <SelectItem value="high">
                      Alto - Apenas Críticos
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas Meteorológicos</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar alertas de condições climáticas
                  </p>
                </div>
                <Switch
                  checked={settings.showWeatherAlerts}
                  onCheckedChange={(v) => updateSetting("showWeatherAlerts", v}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Satélite</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar alertas de dados satelitais
                  </p>
                </div>
                <Switch
                  checked={settings.showSatelliteAlerts}
                  onCheckedChange={(v) => updateSetting("showSatelliteAlerts", v}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar alertas de sincronização e sistema
                  </p>
                </div>
                <Switch
                  checked={settings.showSystemAlerts}
                  onCheckedChange={(v) => updateSetting("showSystemAlerts", v}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Preferência de Modelo IA</Label>
                <Select
                  value={settings.aiModelPreference}
                  onValueChange={(v: "fast" | "balanced" | "accurate") =>
                    updateSetting("aiModelPreference", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">
                      Rápido - Respostas mais rápidas
                    </SelectItem>
                    <SelectItem value="balanced">
                      Balanceado - Equilíbrio velocidade/precisão
                    </SelectItem>
                    <SelectItem value="accurate">
                      Preciso - Máxima precisão
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Modelos mais precisos podem demorar mais para responder
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
