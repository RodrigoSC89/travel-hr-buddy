import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Smartphone, 
  Download, 
  Settings, 
  Shield, 
  Battery, 
  Wifi,
  Camera,
  MapPin,
  Bell,
  RotateCcw
} from "lucide-react";

export const NativeAppManager: React.FC = () => {
  const [appStatus, setAppStatus] = useState("ready");
  const [installProgress, setInstallProgress] = useState(0);
  const [features] = useState([
    { name: "Offline Sync", status: "active", icon: RotateCcw },
    { name: "Push Notifications", status: "active", icon: Bell },
    { name: "Camera Integration", status: "active", icon: Camera },
    { name: "GPS Tracking", status: "active", icon: MapPin },
    { name: "Biometric Auth", status: "pending", icon: Shield },
    { name: "Background Sync", status: "active", icon: Wifi }
  ]);

  const handleInstallApp = () => {
    setAppStatus("installing");
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAppStatus("installed");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">App Mobile Nativo</h1>
          <Badge variant="secondary">PWA + Capacitor</Badge>
        </div>
        <p className="text-muted-foreground">
          Aplicativo móvel nativo para iOS e Android com recursos offline
        </p>
      </div>

      {/* Installation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Status da Instalação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Status do App:</span>
            <Badge variant={appStatus === "installed" ? "default" : "secondary"}>
              {appStatus === "ready" && "Pronto para Instalar"}
              {appStatus === "installing" && "Instalando..."}
              {appStatus === "installed" && "Instalado"}
            </Badge>
          </div>
          
          {appStatus === "installing" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Instalando recursos nativos...</span>
                <span>{installProgress}%</span>
              </div>
              <Progress value={installProgress} />
            </div>
          )}

          {appStatus === "ready" && (
            <Button onClick={handleInstallApp} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Instalar App Nativo
            </Button>
          )}

          {appStatus === "installed" && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200">
                ✅ App instalado com sucesso! Agora você pode usar recursos offline e nativos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="features">Recursos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Recursos Nativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-primary" />
                        <span>{feature.name}</span>
                      </div>
                      <Badge 
                        variant={feature.status === "active" ? "default" : "secondary"}
                      >
                        {feature.status === "active" ? "Ativo" : "Pendente"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Battery className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-sm text-muted-foreground">Bateria</div>
                </div>
                <div className="text-center">
                  <Wifi className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">4G</div>
                  <div className="text-sm text-muted-foreground">Conexão</div>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm text-muted-foreground">Sync</div>
                </div>
                <div className="text-center">
                  <Settings className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">2.1s</div>
                  <div className="text-sm text-muted-foreground">Load Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do App</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Notificações Push</span>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sync Offline</span>
                  <Button variant="outline" size="sm">Gerenciar</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Permissões</span>
                  <Button variant="outline" size="sm">Revisar</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cache</span>
                  <Button variant="outline" size="sm">Limpar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle>Debug & Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                  [2024-01-15 10:30:15] App iniciado com sucesso
                </div>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                  [2024-01-15 10:30:16] Recursos nativos carregados
                </div>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                  [2024-01-15 10:30:17] Sync offline ativado
                </div>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                  [2024-01-15 10:30:18] Push notifications registradas
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};