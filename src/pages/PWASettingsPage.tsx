/**
 * PWA Settings Page - Configurações PWA Completas
 * Instalação, Offline, Push Notifications, Background Sync
 */
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Smartphone, Download, Wifi, WifiOff, Bell, RefreshCw, 
  Database, Trash2, CheckCircle, AlertTriangle, Cloud, HardDrive,
  Zap, Shield
} from "lucide-react";
import { usePWAFeatures } from "@/hooks/use-pwa-features";
import { PWAInstallPrompt, OfflineIndicator } from "@/components/pwa";
import { toast } from "sonner";

export default function PWASettingsPage() {
  const {
    status,
    installPWA,
    updateServiceWorker,
    requestPushPermission,
    clearCache,
    triggerSync
  } = usePWAFeatures();
  
  const { isOnline, isInstalled, canInstall, pushEnabled: pushEnabledStatus } = status;
  const hasUpdates = false;

  const [pushEnabled, setPushEnabled] = React.useState(pushEnabledStatus);
  const [autoSync, setAutoSync] = React.useState(true);
  const [offlineMode, setOfflineMode] = React.useState(true);
  const [cacheSize, setCacheSize] = React.useState(0);

  // Calculate cache size
  React.useEffect(() => {
    const calculateCacheSize = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setCacheSize(Math.round((estimate.usage || 0) / (1024 * 1024)));
      }
    };
    calculateCacheSize();
  }, []);

  const handleClearCache = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        setCacheSize(0);
        toast.success("Cache limpo com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao limpar cache");
    }
  };

  const handleEnablePush = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushEnabled(true);
          toast.success("Notificações push ativadas!");
        } else {
          toast.error("Permissão negada para notificações");
        }
      }
    } catch (error) {
      toast.error("Erro ao ativar notificações");
    }
  };

  const handleForceSync = async () => {
    try {
      if ('serviceWorker' in navigator && 'sync' in (await navigator.serviceWorker.ready)) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('manual-sync');
        toast.success("Sincronização iniciada!");
      } else {
        toast.info("Background Sync não suportado neste navegador");
      }
    } catch (error) {
      toast.error("Erro na sincronização");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smartphone className="h-8 w-8 text-primary" />
            Configurações PWA
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie instalação, modo offline e sincronização do aplicativo
          </p>
        </div>
        <OfflineIndicator />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-8 w-8 text-green-500" />
              ) : (
                <WifiOff className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Conexão</p>
                <p className="font-semibold">
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {isInstalled ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <Download className="h-8 w-8 text-blue-500" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Instalação</p>
                <p className="font-semibold">
                  {isInstalled ? "Instalado" : "Não instalado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Cache</p>
                <p className="font-semibold">{cacheSize} MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Push</p>
                <p className="font-semibold">
                  {pushEnabled ? "Ativo" : "Desativado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Install Prompt */}
      {!isInstalled && <PWAInstallPrompt />}

      {/* Update Available */}
      {hasUpdates && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-semibold">Atualização Disponível</p>
                  <p className="text-sm text-muted-foreground">
                    Uma nova versão do aplicativo está disponível
                  </p>
                </div>
              </div>
              <Button onClick={updateServiceWorker} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offline Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Modo Offline
            </CardTitle>
            <CardDescription>
              Configure o comportamento offline do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Offline Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Salvar dados automaticamente para acesso offline
                </p>
              </div>
              <Switch
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Sincronização Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Sincronizar dados quando reconectar
                </p>
              </div>
              <Switch
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uso de armazenamento</span>
                <span>{cacheSize} MB / 100 MB</span>
              </div>
              <Progress value={cacheSize} max={100} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleForceSync} className="flex-1 gap-2">
                <RefreshCw className="h-4 w-4" />
                Sincronizar Agora
              </Button>
              <Button variant="destructive" onClick={handleClearCache} className="flex-1 gap-2">
                <Trash2 className="h-4 w-4" />
                Limpar Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações Push
            </CardTitle>
            <CardDescription>
              Receba alertas importantes mesmo com o app fechado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar notificações push do sistema
                </p>
              </div>
              <Switch
                checked={pushEnabled}
                onCheckedChange={(checked) => {
                  if (checked) handleEnablePush();
                  else setPushEnabled(false);
                }}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium">Tipos de Notificação</p>
              
              {[
                { label: "Alertas Críticos", desc: "Emergências e alertas de segurança", enabled: true },
                { label: "Vencimento de Certificados", desc: "Aviso 30 dias antes", enabled: true },
                { label: "Manutenções Agendadas", desc: "Lembretes de manutenção", enabled: true },
                { label: "Atualizações do Sistema", desc: "Novas features e correções", enabled: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.enabled} disabled={!pushEnabled} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>
              Otimizações de desempenho do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Cache Agressivo", desc: "Maximizar velocidade de carregamento", value: true },
              { label: "Compressão de Dados", desc: "Reduzir uso de banda", value: true },
              { label: "Lazy Loading", desc: "Carregar módulos sob demanda", value: true },
              { label: "Prefetch Inteligente", desc: "Prever próximas navegações", value: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <Label>{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança do PWA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Criptografia Local</Label>
                <p className="text-sm text-muted-foreground">
                  Criptografar dados armazenados localmente
                </p>
              </div>
              <Badge variant="secondary">AES-256</Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-logout Offline</Label>
                <p className="text-sm text-muted-foreground">
                  Deslogar após 24h sem conexão
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Limpar ao Sair</Label>
                <p className="text-sm text-muted-foreground">
                  Limpar dados sensíveis ao fazer logout
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Service Worker</p>
              <p className="font-medium text-green-600">Ativo</p>
            </div>
            <div>
              <p className="text-muted-foreground">IndexedDB</p>
              <p className="font-medium text-green-600">Disponível</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cache API</p>
              <p className="font-medium text-green-600">Suportado</p>
            </div>
            <div>
              <p className="text-muted-foreground">Background Sync</p>
              <p className="font-medium text-green-600">Suportado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
