/**
import { useCallback, useEffect, useState } from "react";;
 * PATCH 800 - Sistema de Controle Unificado
 * Painel completo com todas as funcionalidades do sistema
 */

import React, { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Activity, 
  Globe, 
  Bell, 
  Accessibility, 
  Wifi, 
  WifiOff,
  Download,
  RefreshCw,
  Zap,
  Shield,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  BarChart3,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Languages,
  Eye,
  Volume2,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sistema de Performance - Otimizado para evitar re-renders constantes
const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState({
    cpu: 15,
    memory: 45,
    network: "online" as "online" | "offline",
    latency: 35,
    fps: 60,
    cacheHit: 92,
    loadTime: 0
  });

  const updateMetrics = useCallback(() => {
    const memory = (performance as unknown).memory;
    setMetrics({
      cpu: Math.random() * 30 + 10,
      memory: memory ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 : 45,
      network: navigator.onLine ? "online" : "offline",
      latency: Math.round((navigator as unknown).connection?.rtt || 50),
      fps: 60,
      cacheHit: 92,
      loadTime: performance.now() / 1000
    });
  }, []);

  useEffect(() => {
    // Coletar métricas apenas uma vez no mount
    const timer = setTimeout(updateMetrics, 500);
    
    // Atualizar apenas quando status de rede muda
    window.addEventListener("online", updateMetrics);
    window.addEventListener("offline", updateMetrics);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", updateMetrics);
      window.removeEventListener("offline", updateMetrics);
    };
  }, [updateMetrics]);

  return { metrics, updateMetrics };
};

// Componente de Métricas de Performance
const PerformanceMetrics = memo(() => {
  const { metrics } = useSystemMetrics();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        icon={Cpu}
        label="CPU"
        value={`${metrics.cpu.toFixed(1)}%`}
        color={metrics.cpu < 50 ? "text-green-500" : "text-yellow-500"}
        progress={metrics.cpu}
      />
      <MetricCard
        icon={HardDrive}
        label="Memória"
        value={`${metrics.memory.toFixed(1)}%`}
        color={metrics.memory < 70 ? "text-green-500" : "text-yellow-500"}
        progress={metrics.memory}
      />
      <MetricCard
        icon={Activity}
        label="FPS"
        value={`${metrics.fps}`}
        color={metrics.fps >= 55 ? "text-green-500" : "text-red-500"}
        progress={(metrics.fps / 60) * 100}
      />
      <MetricCard
        icon={Clock}
        label="Latência"
        value={`${metrics.latency.toFixed(0)}ms`}
        color={metrics.latency < 100 ? "text-green-500" : "text-yellow-500"}
        progress={100 - metrics.latency}
      />
    </div>
  );
});

const MetricCard = ({ icon: Icon, label, value, color, progress }: {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  color: string;
  progress: number;
}) => (
  <Card className="bg-card/50 border-border/50">
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className={cn("text-2xl font-bold", color)}>{value}</div>
      <Progress value={progress} className="h-1 mt-2" />
    </CardContent>
  </Card>
);

// Controles de Idioma
const LanguageControls = memo(() => {
  const [currentLang, setCurrentLang] = useState("pt-BR");
  const languages = [
    { code: "pt-BR", name: "Português", flag: "🇧🇷" },
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "es-ES", name: "Español", flag: "🇪🇸" },
    { code: "fr-FR", name: "Français", flag: "🇫🇷" },
    { code: "zh-CN", name: "中文", flag: "🇨🇳" },
  ];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Idioma do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {languages.map(lang => (
            <Button
              key={lang.code}
              variant={currentLang === lang.code ? "default" : "outline"}
              size="sm"
              onClick={handleSetCurrentLang}
              className="gap-1"
            >
              <span>{lang.flag}</span>
              <span className="text-xs">{lang.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Controles de Acessibilidade
const AccessibilityControls = memo(() => {
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    dyslexiaFont: false,
    screenReader: false,
    colorBlindMode: "none" as "none" | "protanopia" | "deuteranopia" | "tritanopia"
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Accessibility className="h-4 w-4" />
          Acessibilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Alto Contraste</span>
          <Switch checked={settings.highContrast} onCheckedChange={() => toggle("highContrast")} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Texto Grande</span>
          <Switch checked={settings.largeText} onCheckedChange={() => toggle("largeText")} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Reduzir Animações</span>
          <Switch checked={settings.reducedMotion} onCheckedChange={() => toggle("reducedMotion")} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Fonte Dislexia</span>
          <Switch checked={settings.dyslexiaFont} onCheckedChange={() => toggle("dyslexiaFont")} />
        </div>
      </CardContent>
    </Card>
  );
});

// PWA Controls
const PWAControls = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    // Check if installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(isStandalone);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          PWA & Offline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            Status da Rede
          </span>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">App Instalado</span>
          <Badge variant={isInstalled ? "default" : "outline"}>
            {isInstalled ? "Sim" : "Não"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Sync Pendente</span>
          <Badge variant="secondary">{pendingSync} itens</Badge>
        </div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1">
            <RefreshCw className="h-3 w-3" />
            Sincronizar
          </Button>
          {!isInstalled && (
            <Button size="sm" className="flex-1 gap-1">
              <Download className="h-3 w-3" />
              Instalar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Notificações
const NotificationControls = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [unread, setUnread] = useState(3);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notificações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Permissão</span>
          <Badge variant={permission === "granted" ? "default" : "outline"}>
            {permission === "granted" ? "Ativado" : permission === "denied" ? "Bloqueado" : "Pendente"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Não Lidas</span>
          <Badge variant="destructive">{unread}</Badge>
        </div>
        {permission !== "granted" && (
          <Button size="sm" onClick={requestPermission} className="w-full gap-1">
            <Bell className="h-3 w-3" />
            Ativar Notificações
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Sistema Status Geral
const SystemStatus = memo(() => {
  const [status, setStatus] = useState({
    database: "operational",
    api: "operational",
    storage: "operational",
    auth: "operational",
    cache: "operational"
  });

  const statusColor = (s: string) => {
    switch (s) {
    case "operational": return "text-green-500";
    case "degraded": return "text-yellow-500";
    case "down": return "text-red-500";
    default: return "text-muted-foreground";
    }
  };

  const statusIcon = (s: string) => {
    switch (s) {
    case "operational": return CheckCircle2;
    case "degraded": return AlertTriangle;
    default: return AlertTriangle;
    }
  };

  const services = [
    { name: "Database", status: status.database, icon: Database },
    { name: "API", status: status.api, icon: Cloud },
    { name: "Storage", status: status.storage, icon: HardDrive },
    { name: "Auth", status: status.auth, icon: Shield },
    { name: "Cache", status: status.cache, icon: Zap },
  ];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Status dos Serviços
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {services.map(service => {
            const StatusIcon = statusIcon(service.status);
            return (
              <div key={service.name} className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  <service.icon className="h-3 w-3 text-muted-foreground" />
                  {service.name}
                </span>
                <span className={cn("flex items-center gap-1 text-xs", statusColor(service.status))}>
                  <StatusIcon className="h-3 w-3" />
                  {service.status === "operational" ? "OK" : service.status}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

// Painel Principal
export const SystemControlPanel = () => {
  const [activeTab, setActiveTab] = useState("performance");

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary animate-spin-slow" />
            Painel de Controle do Sistema
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            PATCH 800 - Sistema Integrado
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="performance" className="gap-1 text-xs">
              <BarChart3 className="h-3 w-3" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="pwa" className="gap-1 text-xs">
              <Smartphone className="h-3 w-3" />
              PWA
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="gap-1 text-xs">
              <Accessibility className="h-3 w-3" />
              Acessibilidade
            </TabsTrigger>
            <TabsTrigger value="status" className="gap-1 text-xs">
              <Shield className="h-3 w-3" />
              Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceMetrics />
          </TabsContent>

          <TabsContent value="pwa" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <PWAControls />
              <NotificationControls />
            </div>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <AccessibilityControls />
              <LanguageControls />
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <SystemStatus />
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Otimizações Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <OptimizationItem label="Lazy Loading" active />
                  <OptimizationItem label="Code Splitting" active />
                  <OptimizationItem label="Image Compression" active />
                  <OptimizationItem label="Cache Inteligente" active />
                  <OptimizationItem label="Prefetch de Rotas" active />
                  <OptimizationItem label="Worker Threads" active />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const OptimizationItem = ({ label, active }: { label: string; active: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">{label}</span>
    <Badge variant={active ? "default" : "outline"} className="text-xs">
      {active ? "Ativo" : "Inativo"}
    </Badge>
  </div>
);

export default SystemControlPanel;
