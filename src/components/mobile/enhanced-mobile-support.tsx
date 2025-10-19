import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Smartphone, 
  Wifi, 
  Battery, 
  Signal, 
  Download, 
  Settings,
  Bell,
  Camera,
  Mic,
  MapPin,
  Fingerprint,
  Vibrate,
  Sun,
  Moon,
  Volume2,
  RotateCcw,
  Maximize2,
  Share2,
  Home,
  User,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  X
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

interface DeviceInfo {
  platform: string;
  userAgent: string;
  screenSize: { width: number; height: number };
  orientation: "portrait" | "landscape";
  isOnline: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
  connection?: string;
  touchSupport: boolean;
  cameraSupport: boolean;
  geolocationSupport: boolean;
  notificationSupport: boolean;
  vibrationSupport: boolean;
}

interface PWAStatus {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  updateAvailable: boolean;
}

interface MobileSettings {
  notifications: boolean;
  location: boolean;
  camera: boolean;
  microphone: boolean;
  vibration: boolean;
  darkMode: boolean;
  offlineMode: boolean;
  autoSync: boolean;
  compressionLevel: "low" | "medium" | "high";
  dataUsage: "minimal" | "normal" | "unlimited";
}

export const EnhancedMobileSupport: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    updateAvailable: false
  });
  const [mobileSettings, setMobileSettings] = useState<MobileSettings>({
    notifications: true,
    location: false,
    camera: false,
    microphone: false,
    vibration: true,
    darkMode: false,
    offlineMode: true,
    autoSync: true,
    compressionLevel: "medium",
    dataUsage: "normal"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<unknown>(null);
  
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    detectDeviceCapabilities();
    setupPWAListeners();
    loadMobileSettings();
  }, []);

  const detectDeviceCapabilities = async () => {
    setIsLoading(true);
    
    try {
      const info: DeviceInfo = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        screenSize: {
          width: window.screen.width,
          height: window.screen.height
        },
        orientation: window.screen.orientation?.type.includes("portrait") ? "portrait" : "landscape",
        isOnline: navigator.onLine,
        touchSupport: "ontouchstart" in window,
        cameraSupport: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        geolocationSupport: "geolocation" in navigator,
        notificationSupport: "Notification" in window,
        vibrationSupport: "vibrate" in navigator
      };

      // Battery API (se disponível)
      if ("getBattery" in navigator) {
        try {
          const battery = await (navigator as unknown).getBattery();
          info.batteryLevel = Math.round(battery.level * 100);
          info.isCharging = battery.charging;
        } catch (error) { /* Error handled silently */ }
      }

      // Connection API (se disponível)
      if ("connection" in navigator) {
        const connection = (navigator as unknown).connection;
        info.connection = connection.effectiveType;
      }

      setDeviceInfo(info);
    } catch (error) { /* Error handled silently */ } finally {
      setIsLoading(false);
    }
  };

  const setupPWAListeners = () => {
    // Listener para o evento beforeinstallprompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setPwaStatus(prev => ({ ...prev, canInstall: true }));
    });

    // Verificar se está rodando como PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
                        (window.navigator as unknown).standalone === true;
    
    setPwaStatus(prev => ({ 
      ...prev, 
      isStandalone,
      isInstalled: isStandalone 
    }));

    // Listener para atualizações do service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "UPDATE_AVAILABLE") {
          setPwaStatus(prev => ({ ...prev, updateAvailable: true }));
        }
      });
    }
  };

  const loadMobileSettings = () => {
    const savedSettings = localStorage.getItem("mobileSettings");
    if (savedSettings) {
      setMobileSettings(JSON.parse(savedSettings));
    }
  };

  const saveMobileSettings = (newSettings: Partial<MobileSettings>) => {
    const updated = { ...mobileSettings, ...newSettings };
    setMobileSettings(updated);
    localStorage.setItem("mobileSettings", JSON.stringify(updated));
  };

  const installPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      
      if (result.outcome === "accepted") {
        toast({
          title: "App instalado",
          description: "O app foi instalado na sua tela inicial"
        });
        setPwaStatus(prev => ({ ...prev, canInstall: false, isInstalled: true }));
      }
      
      setInstallPrompt(null);
    }
  };

  const requestPermission = async (permission: keyof MobileSettings) => {
    try {
      switch (permission) {
      case "notifications":
        if ("Notification" in window) {
          const result = await Notification.requestPermission();
          const granted = result === "granted";
          saveMobileSettings({ notifications: granted });
          toast({
            title: granted ? "Notificações ativadas" : "Notificações negadas",
            description: granted ? "Você receberá notificações importantes" : "Ative nas configurações do navegador"
          });
        }
        break;
          
      case "location":
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            () => {
              saveMobileSettings({ location: true });
              toast({
                title: "Localização ativada",
                description: "O app pode acessar sua localização"
              });
            },
            () => {
              saveMobileSettings({ location: false });
              toast({
                title: "Localização negada",
                description: "Ative nas configurações do navegador",
                variant: "destructive"
              });
            }
          );
        }
        break;
          
      case "camera":
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            saveMobileSettings({ camera: true });
            toast({
              title: "Câmera ativada",
              description: "O app pode acessar a câmera"
            });
          } catch (error) {
            saveMobileSettings({ camera: false });
            toast({
              title: "Câmera negada",
              description: "Ative nas configurações do navegador",
              variant: "destructive"
            });
          }
        }
        break;
          
      case "microphone":
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            saveMobileSettings({ microphone: true });
            toast({
              title: "Microfone ativado",
              description: "O app pode acessar o microfone"
            });
          } catch (error) {
            saveMobileSettings({ microphone: false });
            toast({
              title: "Microfone negado",
              description: "Ative nas configurações do navegador",
              variant: "destructive"
            });
          }
        }
        break;
          
      case "vibration":
        if ("vibrate" in navigator) {
          navigator.vibrate(200);
          saveMobileSettings({ vibration: true });
          toast({
            title: "Vibração ativada",
            description: "O app pode usar vibração"
          });
        }
        break;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: `Não foi possível ativar ${permission}`,
        variant: "destructive"
      });
    }
  };

  const updateServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
        toast({
          title: "Atualizando app",
          description: "A nova versão será carregada em breve"
        });
      });
    }
  };

  const triggerVibration = () => {
    if ("vibrate" in navigator && mobileSettings.vibration) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const getConnectionIcon = (connection?: string) => {
    switch (connection) {
    case "4g": return <Signal className="h-4 w-4 text-green-500" />;
    case "3g": return <Signal className="h-4 w-4 text-yellow-500" />;
    case "2g": return <Signal className="h-4 w-4 text-red-500" />;
    default: return <Wifi className="h-4 w-4" />;
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return "text-muted-foreground";
    if (level > 50) return "text-green-500";
    if (level > 20) return "text-yellow-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Smartphone className="h-8 w-8 animate-pulse mx-auto" />
          <p>Detectando capacidades do dispositivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Device Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Status do Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deviceInfo && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                {getConnectionIcon(deviceInfo.connection)}
                <div>
                  <div className="text-sm font-medium">Conexão</div>
                  <div className="text-xs text-muted-foreground">
                    {deviceInfo.connection || "Wi-Fi"}
                  </div>
                </div>
              </div>
              
              {deviceInfo.batteryLevel !== undefined && (
                <div className="flex items-center gap-2">
                  <Battery className={`h-4 w-4 ${getBatteryColor(deviceInfo.batteryLevel)}`} />
                  <div>
                    <div className="text-sm font-medium">Bateria</div>
                    <div className="text-xs text-muted-foreground">
                      {deviceInfo.batteryLevel}%
                      {deviceInfo.isCharging && " (carregando)"}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4" />
                <div>
                  <div className="text-sm font-medium">Resolução</div>
                  <div className="text-xs text-muted-foreground">
                    {deviceInfo.screenSize.width}x{deviceInfo.screenSize.height}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <div>
                  <div className="text-sm font-medium">Orientação</div>
                  <div className="text-xs text-muted-foreground">
                    {deviceInfo.orientation}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PWA Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Status do App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pwaStatus.isInstalled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm">
                {pwaStatus.isInstalled ? "App instalado" : "App no navegador"}
              </span>
            </div>
            {pwaStatus.canInstall && (
              <Button onClick={installPWA} size="sm">
                Instalar App
              </Button>
            )}
          </div>
          
          {pwaStatus.updateAvailable && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Nova versão disponível</span>
              </div>
              <Button onClick={updateServiceWorker} size="sm" variant="outline">
                Atualizar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions & Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Permissões e Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="font-medium">Permissões do Sistema</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Notificações</span>
                </div>
                <Switch
                  checked={mobileSettings.notifications}
                  onCheckedChange={() => requestPermission("notifications")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Localização</span>
                </div>
                <Switch
                  checked={mobileSettings.location}
                  onCheckedChange={() => requestPermission("location")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">Câmera</span>
                </div>
                <Switch
                  checked={mobileSettings.camera}
                  onCheckedChange={() => requestPermission("camera")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  <span className="text-sm">Microfone</span>
                </div>
                <Switch
                  checked={mobileSettings.microphone}
                  onCheckedChange={() => requestPermission("microphone")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vibrate className="h-4 w-4" />
                  <span className="text-sm">Vibração</span>
                </div>
                <Switch
                  checked={mobileSettings.vibration}
                  onCheckedChange={() => requestPermission("vibration")}
                />
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Configurações do App</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <span className="text-sm">Modo Escuro</span>
                </div>
                <Switch
                  checked={mobileSettings.darkMode}
                  onCheckedChange={(checked) => saveMobileSettings({ darkMode: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Modo Offline</span>
                </div>
                <Switch
                  checked={mobileSettings.offlineMode}
                  onCheckedChange={(checked) => saveMobileSettings({ offlineMode: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  <span className="text-sm">Sincronização Automática</span>
                </div>
                <Switch
                  checked={mobileSettings.autoSync}
                  onCheckedChange={(checked) => saveMobileSettings({ autoSync: checked })}
                />
              </div>
            </div>
          </div>

          {/* Test Features */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Testar Funcionalidades</h3>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={triggerVibration}
                className="gap-2"
              >
                <Vibrate className="h-3 w-3" />
                Testar Vibração
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => toast({ title: "Teste", description: "Notificação de teste" })}
                className="gap-2"
              >
                <Bell className="h-3 w-3" />
                Testar Notificação
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Capacidades do Dispositivo</CardTitle>
        </CardHeader>
        <CardContent>
          {deviceInfo && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {deviceInfo.touchSupport ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Touch</span>
              </div>
              
              <div className="flex items-center gap-2">
                {deviceInfo.cameraSupport ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Câmera</span>
              </div>
              
              <div className="flex items-center gap-2">
                {deviceInfo.geolocationSupport ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">GPS</span>
              </div>
              
              <div className="flex items-center gap-2">
                {deviceInfo.notificationSupport ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Notificações</span>
              </div>
              
              <div className="flex items-center gap-2">
                {deviceInfo.vibrationSupport ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Vibração</span>
              </div>
              
              <div className="flex items-center gap-2">
                {deviceInfo.isOnline ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Online</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMobileSupport;