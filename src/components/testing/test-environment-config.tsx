import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Shield, Activity, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestConfig {
  environment: "development" | "staging" | "production";
  debugMode: boolean;
  mockData: boolean;
  cacheEnabled: boolean;
  analyticsEnabled: boolean;
  errorReporting: boolean;
  performanceMonitoring: boolean;
  securityScanning: boolean;
}

export const TestEnvironmentConfig: React.FC = () => {
  const [config, setConfig] = useState<TestConfig>({
    environment: "staging",
    debugMode: true,
    mockData: false,
    cacheEnabled: true,
    analyticsEnabled: true,
    errorReporting: true,
    performanceMonitoring: true,
    securityScanning: true,
  });

  const { toast } = useToast();

  const handleConfigChange = (key: keyof TestConfig, value: boolean | string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const applyConfiguration = () => {
    // Simulate applying configuration
    localStorage.setItem("nautilus-test-config", JSON.stringify(config));

    toast({
      title: "Configuração Aplicada",
      description: `Ambiente configurado para ${config.environment}`,
    });
  };

  const resetToDefaults = () => {
    setConfig({
      environment: "staging",
      debugMode: true,
      mockData: false,
      cacheEnabled: true,
      analyticsEnabled: true,
      errorReporting: true,
      performanceMonitoring: true,
      securityScanning: true,
    });

    toast({
      title: "Configuração Resetada",
      description: "Voltou às configurações padrão",
    });
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "nautilus-test-config.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Configuração Exportada",
      description: "Arquivo de configuração baixado",
    });
  };

  const getEnvironmentBadge = (env: string) => {
    switch (env) {
      case "development":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Desenvolvimento
          </Badge>
        );
      case "staging":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Homologação
          </Badge>
        );
      case "production":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Produção
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Configuração do Ambiente de Teste</h3>
          <p className="text-sm text-muted-foreground">
            Configure o sistema para diferentes ambientes de teste
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportConfig}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            Resetar
          </Button>
          <Button onClick={applyConfiguration}>Aplicar</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Ambiente Atual
            </CardTitle>
            {getEnvironmentBadge(config.environment)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={config.environment === "development" ? "default" : "outline"}
              onClick={() => handleConfigChange("environment", "development")}
            >
              Desenvolvimento
            </Button>
            <Button
              variant={config.environment === "staging" ? "default" : "outline"}
              onClick={() => handleConfigChange("environment", "staging")}
            >
              Homologação
            </Button>
            <Button
              variant={config.environment === "production" ? "default" : "outline"}
              onClick={() => handleConfigChange("environment", "production")}
            >
              Produção
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="database">Banco</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Debug</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa logs detalhados e informações de debug
                  </p>
                </div>
                <Switch
                  checked={config.debugMode}
                  onCheckedChange={checked => handleConfigChange("debugMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dados Mock</Label>
                  <p className="text-sm text-muted-foreground">Usa dados simulados para testes</p>
                </div>
                <Switch
                  checked={config.mockData}
                  onCheckedChange={checked => handleConfigChange("mockData", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cache Habilitado</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa cache para melhor performance
                  </p>
                </div>
                <Switch
                  checked={config.cacheEnabled}
                  onCheckedChange={checked => handleConfigChange("cacheEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações do Banco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configurações do banco de dados estão sendo gerenciadas automaticamente através do
                Supabase. Verifique o status na aba de monitoramento.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Escaneamento de Segurança</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa verificações automáticas de segurança
                  </p>
                </div>
                <Switch
                  checked={config.securityScanning}
                  onCheckedChange={checked => handleConfigChange("securityScanning", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Configurações de Monitoramento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">Coleta dados de uso e performance</p>
                </div>
                <Switch
                  checked={config.analyticsEnabled}
                  onCheckedChange={checked => handleConfigChange("analyticsEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatório de Erros</Label>
                  <p className="text-sm text-muted-foreground">
                    Envia relatórios automáticos de erros
                  </p>
                </div>
                <Switch
                  checked={config.errorReporting}
                  onCheckedChange={checked => handleConfigChange("errorReporting", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Monitoramento de Performance</Label>
                  <p className="text-sm text-muted-foreground">
                    Monitora métricas de performance em tempo real
                  </p>
                </div>
                <Switch
                  checked={config.performanceMonitoring}
                  onCheckedChange={checked => handleConfigChange("performanceMonitoring", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
