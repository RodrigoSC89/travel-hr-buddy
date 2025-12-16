/**
 * Settings Dialog - Modal de configurações do sistema
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Settings, Bell, Volume2, Palette, Globe, 
  Shield, Database, Zap, Save, RotateCcw
} from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      sound: true,
      criticalOnly: false,
      desktop: true
    },
    display: {
      theme: "system",
      compactMode: false,
      animations: true
    },
    ai: {
      autoSuggestions: true,
      voiceEnabled: true,
      language: "pt-BR"
    },
    data: {
      autoRefresh: true,
      refreshInterval: 60,
      offlineMode: true
    }
  });

  const handleSave = () => {
    localStorage.setItem("nautilus-settings", JSON.stringify(settings));
    toast.success("Configurações salvas com sucesso!");
    onOpenChange(false);
  };

  const handleReset = () => {
    setSettings({
      notifications: { enabled: true, sound: true, criticalOnly: false, desktop: true },
      display: { theme: "system", compactMode: false, animations: true },
      ai: { autoSuggestions: true, voiceEnabled: true, language: "pt-BR" },
      data: { autoRefresh: true, refreshInterval: 60, offlineMode: true }
    });
    toast.info("Configurações restauradas aos padrões");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </DialogTitle>
          <DialogDescription>
            Configure as preferências do Nautilus Command Center
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="notifications" className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="notifications" className="text-xs">
              <Bell className="h-4 w-4 mr-1" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="display" className="text-xs">
              <Palette className="h-4 w-4 mr-1" />
              Exibição
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Zap className="h-4 w-4 mr-1" />
              IA
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs">
              <Database className="h-4 w-4 mr-1" />
              Dados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações Ativadas</Label>
                <p className="text-xs text-muted-foreground">Receber alertas do sistema</p>
              </div>
              <Switch
                checked={settings.notifications.enabled}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, notifications: { ...s.notifications, enabled: checked } }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Som de Notificação</Label>
                <p className="text-xs text-muted-foreground">Reproduzir som ao receber alertas</p>
              </div>
              <Switch
                checked={settings.notifications.sound}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, notifications: { ...s.notifications, sound: checked } }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Apenas Críticos</Label>
                <p className="text-xs text-muted-foreground">Notificar apenas alertas críticos</p>
              </div>
              <Switch
                checked={settings.notifications.criticalOnly}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, notifications: { ...s.notifications, criticalOnly: checked } }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações Desktop</Label>
                <p className="text-xs text-muted-foreground">Mostrar notificações do sistema</p>
              </div>
              <Switch
                checked={settings.notifications.desktop}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, notifications: { ...s.notifications, desktop: checked } }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Compacto</Label>
                <p className="text-xs text-muted-foreground">Interface mais compacta</p>
              </div>
              <Switch
                checked={settings.display.compactMode}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, display: { ...s.display, compactMode: checked } }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Animações</Label>
                <p className="text-xs text-muted-foreground">Habilitar animações da interface</p>
              </div>
              <Switch
                checked={settings.display.animations}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, display: { ...s.display, animations: checked } }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sugestões Automáticas</Label>
                <p className="text-xs text-muted-foreground">IA sugere ações automaticamente</p>
              </div>
              <Switch
                checked={settings.ai.autoSuggestions}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, ai: { ...s.ai, autoSuggestions: checked } }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Comandos de Voz</Label>
                <p className="text-xs text-muted-foreground">Entrada e saída por voz</p>
              </div>
              <Switch
                checked={settings.ai.voiceEnabled}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, ai: { ...s.ai, voiceEnabled: checked } }))
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Atualização Automática</Label>
                <p className="text-xs text-muted-foreground">Atualizar dados periodicamente</p>
              </div>
              <Switch
                checked={settings.data.autoRefresh}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, data: { ...s.data, autoRefresh: checked } }))
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Intervalo de Atualização</Label>
                <Badge variant="outline">{settings.data.refreshInterval}s</Badge>
              </div>
              <Slider
                value={[settings.data.refreshInterval]}
                onValueChange={([value]) => 
                  setSettings(s => ({ ...s, data: { ...s.data, refreshInterval: value } }))
                }
                min={30}
                max={300}
                step={30}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Offline</Label>
                <p className="text-xs text-muted-foreground">Sincronizar dados para uso offline</p>
              </div>
              <Switch
                checked={settings.data.offlineMode}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, data: { ...s.data, offlineMode: checked } }))
                }
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
