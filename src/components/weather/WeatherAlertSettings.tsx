/**
 * Weather Alert Settings Panel
 * Configure weather monitoring thresholds and notification preferences
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Bell,
  BellOff,
  Wind,
  Waves,
  Gauge,
  Eye,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_THRESHOLDS,
  WeatherThresholds,
  getWeatherAlertConfig,
  saveWeatherAlertConfig,
  startWeatherMonitoring,
  stopWeatherMonitoring,
  isMonitoringActive,
} from "@/lib/notifications/weather-alert-service";
import {
  requestNotificationPermission,
  getNotificationPermission,
  getNotificationPreferences,
  saveNotificationPreferences,
} from "@/lib/notifications/push-notification-service";
import { getWeatherData } from "@/services/weather";
import { useToast } from "@/hooks/use-toast";

export function WeatherAlertSettings() {
  const { toast } = useToast();
  const [thresholds, setThresholds] = useState<WeatherThresholds>(DEFAULT_THRESHOLDS);
  const [latitude, setLatitude] = useState(-23.96);
  const [longitude, setLongitude] = useState(-46.33);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");
  const [monitoring, setMonitoring] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const config = getWeatherAlertConfig();
    if (config.thresholds) {
      setThresholds(config.thresholds);
    }
    if (config.latitude) setLatitude(config.latitude);
    if (config.longitude) setLongitude(config.longitude);

    const prefs = getNotificationPreferences();
    setNotificationsEnabled(prefs.enabled);

    const permission = getNotificationPermission();
    setPermissionStatus(permission);

    setMonitoring(isMonitoringActive());
  }, []);

  // Request notification permission
  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionStatus("granted");
      setNotificationsEnabled(true);
      saveNotificationPreferences({
        ...getNotificationPreferences(),
        enabled: true,
      });
      toast({
        title: "Notificações Ativadas",
        description: "Você receberá alertas meteorológicos automáticos",
      });
    } else {
      toast({
        title: "Permissão Negada",
        description: "Ative as notificações nas configurações do navegador",
        variant: "destructive",
      });
    }
  };

  // Toggle notifications
  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    saveNotificationPreferences({
      ...getNotificationPreferences(),
      enabled,
    });
  };

  // Save thresholds
  const handleSaveThresholds = () => {
    saveWeatherAlertConfig({
      thresholds,
      latitude,
      longitude,
    });
    toast({
      title: "Configurações Salvas",
      description: "Os limites de alerta foram atualizados",
    });
  };

  // Start/Stop monitoring
  const handleToggleMonitoring = () => {
    if (monitoring) {
      stopWeatherMonitoring();
      setMonitoring(false);
      toast({
        title: "Monitoramento Parado",
        description: "Os alertas automáticos foram desativados",
      });
    } else {
      startWeatherMonitoring(
        {
          latitude,
          longitude,
          thresholds,
          checkInterval: 5 * 60 * 1000, // 5 minutes
        },
        async (lat, lon) => {
          const data = await getWeatherData(lat, lon);
          return {
            windSpeed: data.windSpeedKnots,
            waveHeight: data.waveHeight,
            pressure: data.pressure,
            visibility: data.visibility ? data.visibility / 1000 : undefined,
          };
        }
      );
      setMonitoring(true);
      toast({
        title: "Monitoramento Iniciado",
        description: "Verificando condições a cada 5 minutos",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Permission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Receba alertas quando as condições ultrapassarem os limites de segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              {permissionStatus === "granted" ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Status das Notificações</p>
                <p className="text-sm text-muted-foreground">
                  {permissionStatus === "granted"
                    ? "Permissão concedida"
                    : permissionStatus === "denied"
                    ? "Permissão negada"
                    : "Permissão não solicitada"}
                </p>
              </div>
            </div>
            {permissionStatus !== "granted" ? (
              <Button onClick={handleRequestPermission}>
                Ativar Notificações
              </Button>
            ) : (
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
              />
            )}
          </div>

          {/* Monitoring Status */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <RefreshCw
                className={cn(
                  "h-5 w-5",
                  monitoring ? "text-success animate-spin" : "text-muted-foreground"
                )}
              />
              <div>
                <p className="font-medium">Monitoramento Automático</p>
                <p className="text-sm text-muted-foreground">
                  {monitoring
                    ? "Verificando condições a cada 5 minutos"
                    : "Monitoramento desativado"}
                </p>
              </div>
            </div>
            <Button
              variant={monitoring ? "destructive" : "default"}
              onClick={handleToggleMonitoring}
              disabled={permissionStatus !== "granted"}
            >
              {monitoring ? "Parar" : "Iniciar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Location Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização de Monitoramento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                step="0.01"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threshold Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Limites de Alerta
          </CardTitle>
          <CardDescription>
            Configure os valores que disparam alertas automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Wind Speed Warning */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-primary" />
                Vento (Aviso)
              </Label>
              <Badge variant="outline" className="bg-warning/10 text-warning">
                {thresholds.windSpeedWarning} nós
              </Badge>
            </div>
            <Slider
              value={[thresholds.windSpeedWarning]}
              onValueChange={([v]) =>
                setThresholds({ ...thresholds, windSpeedWarning: v })
              }
              min={15}
              max={40}
              step={5}
            />
          </div>

          {/* Wind Speed Critical */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-destructive" />
                Vento (Crítico)
              </Label>
              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                {thresholds.windSpeedCritical} nós
              </Badge>
            </div>
            <Slider
              value={[thresholds.windSpeedCritical]}
              onValueChange={([v]) =>
                setThresholds({ ...thresholds, windSpeedCritical: v })
              }
              min={30}
              max={60}
              step={5}
            />
          </div>

          {/* Wave Height Warning */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-primary" />
                Ondas (Aviso)
              </Label>
              <Badge variant="outline" className="bg-warning/10 text-warning">
                {thresholds.waveHeightWarning} m
              </Badge>
            </div>
            <Slider
              value={[thresholds.waveHeightWarning]}
              onValueChange={([v]) =>
                setThresholds({ ...thresholds, waveHeightWarning: v })
              }
              min={1}
              max={5}
              step={0.5}
            />
          </div>

          {/* Wave Height Critical */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-destructive" />
                Ondas (Crítico)
              </Label>
              <Badge variant="outline" className="bg-destructive/10 text-destructive">
                {thresholds.waveHeightCritical} m
              </Badge>
            </div>
            <Slider
              value={[thresholds.waveHeightCritical]}
              onValueChange={([v]) =>
                setThresholds({ ...thresholds, waveHeightCritical: v })
              }
              min={4}
              max={10}
              step={0.5}
            />
          </div>

          {/* Pressure Low */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-accent-foreground" />
                Pressão Baixa (Tempestade)
              </Label>
              <Badge variant="outline" className="bg-accent text-accent-foreground">
                {thresholds.pressureLow} hPa
              </Badge>
            </div>
            <Slider
              value={[thresholds.pressureLow]}
              onValueChange={([v]) =>
                setThresholds({ ...thresholds, pressureLow: v })
              }
              min={980}
              max={1010}
              step={5}
            />
          </div>

          {/* Visibility Warning */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Visibilidade Mínima
              </Label>
              <Badge variant="outline" className="bg-muted text-muted-foreground">
                {thresholds.visibilityWarning} km
              </Badge>
            </div>
            <Slider
              value={[thresholds.visibilityWarning]}
              onValueChange={([v]) =>
                setThresholds({ ...thresholds, visibilityWarning: v })
              }
              min={0.5}
              max={5}
              step={0.5}
            />
          </div>

          <Button className="w-full" onClick={handleSaveThresholds}>
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default WeatherAlertSettings;
