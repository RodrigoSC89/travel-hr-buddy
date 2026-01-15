/**
 * City-Specific Weather Alert Manager
 * Manages personalized alerts per city with push notifications
 * PATCH WINDY-2.1
 */

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, BellOff, MapPin, Wind, Waves, Thermometer, 
  CloudRain, AlertTriangle, Trash2, Plus, Settings2, 
  Check, X, Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { WeatherLocation } from "./types";

interface CityAlertConfig {
  cityId: string;
  city: WeatherLocation;
  enabled: boolean;
  thresholds: {
    windSpeed: number;
    waveHeight: number;
    tempMin: number;
    tempMax: number;
    rainProbability: number;
  };
  notifyPush: boolean;
  notifyEmail: boolean;
  lastTriggered?: Date;
}

interface CityAlertManagerProps {
  cities: WeatherLocation[];
  onAddCity?: () => void;
  className?: string;
}

const DEFAULT_THRESHOLDS = {
  windSpeed: 30,
  waveHeight: 2.5,
  tempMin: 10,
  tempMax: 35,
  rainProbability: 80
};

const STORAGE_KEY = 'weather_city_alerts';

export const CityAlertManager: React.FC<CityAlertManagerProps> = ({
  cities,
  onAddCity,
  className
}) => {
  const { toast } = useToast();
  const [alertConfigs, setAlertConfigs] = useState<CityAlertConfig[]>([]);
  const [editingCity, setEditingCity] = useState<string | null>(null);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  // Check push notification support
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsPushSupported(true);
      setIsPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Load saved configs
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setAlertConfigs(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load alert configs:', e);
    }
  }, []);

  // Save configs
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alertConfigs));
  }, [alertConfigs]);

  // Request push permission
  const requestPushPermission = useCallback(async () => {
    if (!isPushSupported) return false;
    
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setIsPushEnabled(granted);
      
      if (granted) {
        toast({
          title: "Notificações ativadas",
          description: "Você receberá alertas meteorológicos push"
        });
      }
      
      return granted;
    } catch (e) {
      console.error('Failed to request push permission:', e);
      return false;
    }
  }, [isPushSupported, toast]);

  // Add city to monitoring
  const addCityAlert = (city: WeatherLocation) => {
    if (alertConfigs.some(c => c.cityId === city.id)) {
      toast({
        title: "Cidade já monitorada",
        description: `${city.name} já está na lista de alertas`,
        variant: "destructive"
      });
      return;
    }

    setAlertConfigs(prev => [...prev, {
      cityId: city.id,
      city,
      enabled: true,
      thresholds: { ...DEFAULT_THRESHOLDS },
      notifyPush: isPushEnabled,
      notifyEmail: false
    }]);

    toast({
      title: "Cidade adicionada",
      description: `Alertas ativados para ${city.name}`
    });
  };

  // Remove city from monitoring
  const removeCityAlert = (cityId: string) => {
    const city = alertConfigs.find(c => c.cityId === cityId);
    setAlertConfigs(prev => prev.filter(c => c.cityId !== cityId));
    
    toast({
      title: "Cidade removida",
      description: city ? `Alertas desativados para ${city.city.name}` : "Cidade removida"
    });
  };

  // Update city config
  const updateCityConfig = (cityId: string, updates: Partial<CityAlertConfig>) => {
    setAlertConfigs(prev => prev.map(c => 
      c.cityId === cityId ? { ...c, ...updates } : c
    ));
  };

  // Update threshold
  const updateThreshold = (cityId: string, key: keyof CityAlertConfig['thresholds'], value: number) => {
    setAlertConfigs(prev => prev.map(c => 
      c.cityId === cityId 
        ? { ...c, thresholds: { ...c.thresholds, [key]: value } }
        : c
    ));
  };

  // Send test notification
  const sendTestNotification = (city: WeatherLocation) => {
    if (!isPushEnabled) {
      requestPushPermission();
      return;
    }

    new Notification(`Alerta Teste - ${city.name}`, {
      body: 'Esta é uma notificação de teste do sistema de alertas meteorológicos.',
      icon: '/favicon.ico',
      tag: `test-${city.id}`
    });

    toast({
      title: "Notificação enviada",
      description: "Verifique se recebeu a notificação de teste"
    });
  };

  // Cities not yet monitored
  const availableCities = cities.filter(c => !alertConfigs.some(a => a.cityId === c.id));

  return (
    <Card className={cn("bg-slate-900/80 border-white/10 overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 bg-slate-800/50 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-400" />
            <h3 className="text-white font-medium">Alertas por Cidade</h3>
          </div>
          <div className="flex items-center gap-2">
            {isPushSupported && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs cursor-pointer",
                  isPushEnabled 
                    ? "border-green-400/50 text-green-400" 
                    : "border-yellow-400/50 text-yellow-400"
                )}
                onClick={requestPushPermission}
              >
                {isPushEnabled ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Push Ativo
                  </>
                ) : (
                  <>
                    <BellOff className="h-3 w-3 mr-1" />
                    Ativar Push
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="max-h-[60vh]">
        <div className="p-4 space-y-4">
          {/* Monitored Cities */}
          {alertConfigs.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 mb-4">Nenhuma cidade monitorada</p>
              <p className="text-white/30 text-sm mb-4">
                Adicione cidades para receber alertas personalizados
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertConfigs.map(config => (
                <Card 
                  key={config.cityId}
                  className={cn(
                    "bg-slate-800/50 border-white/10 overflow-hidden",
                    !config.enabled && "opacity-50"
                  )}
                >
                  {/* City Header */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(checked) => updateCityConfig(config.cityId, { enabled: checked })}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-white font-medium">{config.city.name}</span>
                        </div>
                        {config.lastTriggered && (
                          <p className="text-xs text-white/40">
                            Último alerta: {new Date(config.lastTriggered).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/50 hover:text-white"
                        onClick={() => setEditingCity(editingCity === config.cityId ? null : config.cityId)}
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/50 hover:text-red-400"
                        onClick={() => removeCityAlert(config.cityId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Settings */}
                  {editingCity === config.cityId && (
                    <div className="p-3 border-t border-white/10 space-y-4 bg-slate-900/50">
                      {/* Notification Settings */}
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-white/70">
                          <Switch
                            checked={config.notifyPush}
                            onCheckedChange={(checked) => updateCityConfig(config.cityId, { notifyPush: checked })}
                            disabled={!isPushEnabled}
                          />
                          Push
                        </label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendTestNotification(config.city)}
                          className="text-xs border-white/20 text-white"
                        >
                          Testar
                        </Button>
                      </div>

                      {/* Threshold Settings */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-white/50 flex items-center gap-1">
                            <Wind className="h-3 w-3" />
                            Vento (km/h)
                          </Label>
                          <Input
                            type="number"
                            value={config.thresholds.windSpeed}
                            onChange={(e) => updateThreshold(config.cityId, 'windSpeed', Number(e.target.value))}
                            className="h-8 bg-slate-800 border-white/20 text-white text-sm"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-white/50 flex items-center gap-1">
                            <Waves className="h-3 w-3" />
                            Ondas (m)
                          </Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={config.thresholds.waveHeight}
                            onChange={(e) => updateThreshold(config.cityId, 'waveHeight', Number(e.target.value))}
                            className="h-8 bg-slate-800 border-white/20 text-white text-sm"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-white/50 flex items-center gap-1">
                            <Thermometer className="h-3 w-3 text-blue-400" />
                            Temp. Mín (°C)
                          </Label>
                          <Input
                            type="number"
                            value={config.thresholds.tempMin}
                            onChange={(e) => updateThreshold(config.cityId, 'tempMin', Number(e.target.value))}
                            className="h-8 bg-slate-800 border-white/20 text-white text-sm"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-white/50 flex items-center gap-1">
                            <Thermometer className="h-3 w-3 text-red-400" />
                            Temp. Máx (°C)
                          </Label>
                          <Input
                            type="number"
                            value={config.thresholds.tempMax}
                            onChange={(e) => updateThreshold(config.cityId, 'tempMax', Number(e.target.value))}
                            className="h-8 bg-slate-800 border-white/20 text-white text-sm"
                          />
                        </div>
                        
                        <div className="space-y-1 col-span-2">
                          <Label className="text-xs text-white/50 flex items-center gap-1">
                            <CloudRain className="h-3 w-3" />
                            Prob. Chuva (%)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={config.thresholds.rainProbability}
                            onChange={(e) => updateThreshold(config.cityId, 'rainProbability', Number(e.target.value))}
                            className="h-8 bg-slate-800 border-white/20 text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Add City Section */}
          {availableCities.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 mb-2">Adicionar cidade</p>
              <div className="flex flex-wrap gap-2">
                {availableCities.slice(0, 6).map(city => (
                  <Button
                    key={city.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addCityAlert(city)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {city.name.split(',')[0]}
                  </Button>
                ))}
              </div>
              {availableCities.length > 6 && onAddCity && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddCity}
                  className="mt-2 text-primary hover:text-primary/80"
                >
                  Ver mais cidades...
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default CityAlertManager;
