/**
 * Weather Alert Settings Panel
 * Customizable thresholds for weather alerts
 */

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Wind, 
  Waves, 
  Eye, 
  Thermometer, 
  AlertTriangle, 
  Bell, 
  BellOff,
  Save,
  RotateCcw,
  Check
} from "lucide-react";
import { toast } from "sonner";
import {
  getWeatherAlertConfig,
  saveWeatherAlertConfig,
  DEFAULT_THRESHOLDS,
  WeatherThresholds
} from "@/lib/notifications/weather-alert-service";
import {
  requestNotificationPermission,
  getNotificationPreferences,
  saveNotificationPreferences
} from "@/lib/notifications/push-notification-service";

interface WeatherAlertSettingsProps {
  className?: string;
  onClose?: () => void;
}

export const WeatherAlertSettings: React.FC<WeatherAlertSettingsProps> = ({
  className,
  onClose
}) => {
  const [thresholds, setThresholds] = useState<WeatherThresholds>(DEFAULT_THRESHOLDS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved settings
  useEffect(() => {
    const config = getWeatherAlertConfig();
    if (config.thresholds) {
      setThresholds({ ...DEFAULT_THRESHOLDS, ...config.thresholds });
    }
    
    const prefs = getNotificationPreferences();
    setNotificationsEnabled(prefs.enabled);
    setCriticalOnly(prefs.criticalAlerts && !prefs.warningAlerts);
  }, []);

  const updateThreshold = (key: keyof WeatherThresholds, value: number) => {
    setThresholds(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveWeatherAlertConfig({ thresholds });
    saveNotificationPreferences({
      enabled: notificationsEnabled,
      criticalAlerts: true,
      warningAlerts: !criticalOnly,
      infoAlerts: false
    });
    
    toast.success("Configurações salvas", {
      description: "Seus alertas meteorológicos foram atualizados"
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setHasChanges(true);
    toast.info("Configurações resetadas para padrão");
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
      saveNotificationPreferences({
        enabled: true,
        criticalAlerts: true,
        warningAlerts: !criticalOnly,
        infoAlerts: false
      });
      toast.success("Notificações ativadas!");
    } else {
      toast.error("Permissão negada", {
        description: "Ative as notificações nas configurações do navegador"
      });
    }
  };

  return (
    <div className={cn("bg-slate-900 rounded-lg p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Configuração de Alertas</h2>
            <p className="text-sm text-white/60">Defina os limites para notificações meteorológicas</p>
          </div>
        </div>
        {hasChanges && (
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
            Não salvo
          </Badge>
        )}
      </div>

      {/* Notifications Toggle */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            {notificationsEnabled ? <Bell className="h-5 w-5 text-green-400" /> : <BellOff className="h-5 w-5 text-red-400" />}
            Notificações Push
          </CardTitle>
          <CardDescription className="text-white/60">
            Receba alertas mesmo quando o navegador estiver em segundo plano
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white">Ativar notificações</Label>
            {notificationsEnabled ? (
              <Switch 
                checked={notificationsEnabled}
                onCheckedChange={(checked) => {
                  setNotificationsEnabled(checked);
                  saveNotificationPreferences({
                    ...getNotificationPreferences(),
                    enabled: checked
                  });
                }}
              />
            ) : (
              <Button size="sm" onClick={handleEnableNotifications}>
                Ativar
              </Button>
            )}
          </div>
          
          {notificationsEnabled && (
            <div className="flex items-center justify-between">
              <Label className="text-white/80">Somente alertas críticos</Label>
              <Switch 
                checked={criticalOnly}
                onCheckedChange={(checked) => {
                  setCriticalOnly(checked);
                  setHasChanges(true);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wind Thresholds */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Wind className="h-5 w-5 text-blue-400" />
            Limites de Vento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/80">Alerta de Vento (nós)</Label>
              <span className="text-yellow-400 font-mono">{thresholds.windSpeedWarning} kt</span>
            </div>
            <Slider
              value={[thresholds.windSpeedWarning]}
              min={10}
              max={50}
              step={1}
              onValueChange={([v]) => updateThreshold('windSpeedWarning', v)}
              className="w-full"
            />
            <p className="text-xs text-white/50">Beaufort 5-6: Vento fresco a forte</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/80">Alerta Crítico (nós)</Label>
              <span className="text-red-400 font-mono">{thresholds.windSpeedCritical} kt</span>
            </div>
            <Slider
              value={[thresholds.windSpeedCritical]}
              min={25}
              max={80}
              step={1}
              onValueChange={([v]) => updateThreshold('windSpeedCritical', v)}
              className="w-full"
            />
            <p className="text-xs text-white/50">Beaufort 8+: Vendaval/Tempestade</p>
          </div>
        </CardContent>
      </Card>

      {/* Wave Thresholds */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Waves className="h-5 w-5 text-cyan-400" />
            Limites de Ondas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/80">Alerta de Ondas (metros)</Label>
              <span className="text-yellow-400 font-mono">{thresholds.waveHeightWarning}m</span>
            </div>
            <Slider
              value={[thresholds.waveHeightWarning]}
              min={1}
              max={5}
              step={0.5}
              onValueChange={([v]) => updateThreshold('waveHeightWarning', v)}
              className="w-full"
            />
            <p className="text-xs text-white/50">Mar agitado - atenção redobrada</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/80">Alerta Crítico (metros)</Label>
              <span className="text-red-400 font-mono">{thresholds.waveHeightCritical}m</span>
            </div>
            <Slider
              value={[thresholds.waveHeightCritical]}
              min={3}
              max={10}
              step={0.5}
              onValueChange={([v]) => updateThreshold('waveHeightCritical', v)}
              className="w-full"
            />
            <p className="text-xs text-white/50">Mar muito agitado - risco elevado</p>
          </div>
        </CardContent>
      </Card>

      {/* Visibility & Pressure */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-400" />
            Visibilidade e Pressão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/80">Visibilidade mínima (km)</Label>
              <span className="text-yellow-400 font-mono">{thresholds.visibilityWarning} km</span>
            </div>
            <Slider
              value={[thresholds.visibilityWarning]}
              min={0.5}
              max={10}
              step={0.5}
              onValueChange={([v]) => updateThreshold('visibilityWarning', v)}
              className="w-full"
            />
            <p className="text-xs text-white/50">Alertar quando visibilidade estiver baixa</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/80">Pressão baixa (hPa)</Label>
              <span className="text-yellow-400 font-mono">{thresholds.pressureLow} hPa</span>
            </div>
            <Slider
              value={[thresholds.pressureLow]}
              min={980}
              max={1020}
              step={1}
              onValueChange={([v]) => updateThreshold('pressureLow', v)}
              className="w-full"
            />
            <p className="text-xs text-white/50">Indica aproximação de tempestade</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handleReset}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resetar
        </Button>
        
        <div className="flex gap-2">
          {onClose && (
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-white/70"
            >
              Cancelar
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Current Alert Levels Preview */}
      <Separator className="bg-white/10" />
      
      <div className="space-y-2">
        <Label className="text-white/60 text-sm">Níveis de alerta atuais:</Label>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-green-400 border-green-400/50">
            <Check className="h-3 w-3 mr-1" />
            Normal: Vento &lt; {thresholds.windSpeedWarning}kt
          </Badge>
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Alerta: {thresholds.windSpeedWarning}-{thresholds.windSpeedCritical}kt
          </Badge>
          <Badge variant="outline" className="text-red-400 border-red-400/50">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Crítico: &gt; {thresholds.windSpeedCritical}kt
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default WeatherAlertSettings;
