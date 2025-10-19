import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Wifi, 
  WifiOff, 
  Download, 
  RefreshCw, 
  Database, 
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useOfflineStorage } from "@/hooks/use-offline-storage";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useToast } from "@/hooks/use-toast";

export const PWAStatus: React.FC = () => {
  const { 
    isOnline, 
    cacheSize, 
    syncPendingChanges, 
    clearCache, 
    getPendingChanges 
  } = useOfflineStorage();
  const onlineStatus = useOnlineStatus();
  const { toast } = useToast();
  
  const [pendingCount, setPendingCount] = React.useState(0);
  const [isInstallable, setIsInstallable] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<unknown>(null);

  // Check if app is installable
  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Update pending changes count
  React.useEffect(() => {
    const updatePendingCount = async () => {
      const pending = await getPendingChanges();
      setPendingCount(pending.length);
    };
    
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);
    
    return () => clearInterval(interval);
  }, [getPendingChanges]);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      toast({
        title: "App Instalado",
        description: "Nautilus One foi instalado com sucesso!",
      });
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleSync = async () => {
    toast({
      title: "Sincronizando",
      description: "Sincronizando dados offline...",
    });
    
    await syncPendingChanges();
    
    toast({
      title: "Sincronização Concluída",
      description: "Dados sincronizados com sucesso!",
    });
  };

  const handleClearCache = async () => {
    await clearCache();
    toast({
      title: "Cache Limpo",
      description: "Cache local foi limpo com sucesso!",
    });
  };

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad/i.test(userAgent)) return "tablet";
    if (/mobile|phone/i.test(userAgent)) return "mobile";
    return "desktop";
  };

  const deviceType = getDeviceType();
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Status PWA & Mobile</h3>
        <p className="text-sm text-muted-foreground">
          Status da aplicação progressiva e funcionalidades mobile
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Status de Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {isOnline 
                  ? "Conectado à internet" 
                  : "Funcionando offline com dados em cache"
                }
              </p>
            </div>
            {!isOnline && pendingCount > 0 && (
              <Button onClick={handleSync} disabled={!isOnline} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar ({pendingCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device & Installation Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {deviceType === "mobile" && <Smartphone className="h-5 w-5" />}
            {deviceType === "tablet" && <Tablet className="h-5 w-5" />}
            {deviceType === "desktop" && <Monitor className="h-5 w-5" />}
            Dispositivo & Instalação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {deviceType === "mobile" && "Celular"}
                  {deviceType === "tablet" && "Tablet"}
                  {deviceType === "desktop" && "Desktop"}
                </Badge>
                {isStandalone && (
                  <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Instalado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isStandalone 
                  ? "App instalado como PWA" 
                  : "Executando no navegador"
                }
              </p>
            </div>
            {isInstallable && (
              <Button onClick={handleInstallPWA} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Instalar App
              </Button>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Service Worker</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cache Offline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Notificações Push</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Responsivo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Sync Background</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Modo Offline</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache & Storage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache & Armazenamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Itens em cache</span>
              <span>{cacheSize}</span>
            </div>
            <Progress value={Math.min((cacheSize / 100) * 100, 100)} />
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                {pendingCount} alteração(ões) pendente(s) de sincronização
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleSync} 
              disabled={!isOnline || pendingCount === 0}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar
            </Button>
            <Button 
              onClick={handleClearCache}
              size="sm"
              variant="outline"
            >
              <Database className="h-4 w-4 mr-2" />
              Limpar Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Instructions */}
      {(deviceType === "mobile" || deviceType === "tablet") && !isStandalone && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Instruções para Mobile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p><strong>Para instalar no {deviceType === "mobile" ? "celular" : "tablet"}:</strong></p>
              <ul className="space-y-1 ml-4">
                <li>• No Chrome/Edge: Toque no menu ⋮ → "Instalar app"</li>
                <li>• No Safari (iOS): Toque no botão compartilhar → "Adicionar à Tela de Início"</li>
                <li>• No Firefox: Toque no menu ⋮ → "Instalar"</li>
              </ul>
              <p className="text-muted-foreground">
                Após instalado, o app funcionará como aplicativo nativo com funcionalidades offline.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};