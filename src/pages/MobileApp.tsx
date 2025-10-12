import React from "react";
import { EnhancedMobileSupport } from "@/components/mobile/enhanced-mobile-support";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Download, 
  Star, 
  Shield, 
  Zap,
  Camera,
  Bell,
  MapPin,
  Wifi,
  Battery,
  Settings,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const MobileAppPage = () => {
  const features = [
    {
      icon: <Camera className="h-6 w-6" />,
      title: "Scanner de Documentos",
      description: "Capture e digitalize documentos com OCR avançado diretamente do seu dispositivo móvel"
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Notificações Push",
      description: "Receba alertas importantes sobre vencimentos, atualizações e eventos críticos"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Localização GPS",
      description: "Rastreamento preciso para operações marítimas e gestão de frota em tempo real"
    },
    {
      icon: <Wifi className="h-6 w-6" />,
      title: "Modo Offline",
      description: "Continue trabalhando mesmo sem conexão, com sincronização automática"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Segurança Avançada",
      description: "Biometria, criptografia e proteção de dados de acordo com regulamentações marítimas"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Performance Otimizada",
      description: "Carregamento rápido e consumo eficiente de bateria para uso contínuo"
    }
  ];

  const statistics = [
    { label: "Download Size", value: "12.5 MB", color: "text-blue-600" },
    { label: "Compatibilidade", value: "iOS 12+ / Android 8+", color: "text-green-600" },
    { label: "Avaliação", value: "4.8/5", color: "text-yellow-600" },
    { label: "Usuários Ativos", value: "15,000+", color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Smartphone className="h-12 w-12 text-azure-50" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-green-500 text-azure-50">PWA</Badge>
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Nautilus Mobile
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Aplicativo móvel profissional para gestão marítima com recursos avançados de OCR, 
              notificações push e funcionalidades offline
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Instalar PWA
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Settings className="h-5 w-5" />
              Configurações
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {statistics.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Funcionalidades Principais</h2>
            <p className="text-muted-foreground">
              Recursos profissionais desenvolvidos especificamente para o setor marítimo
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mobile Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração e Suporte Mobile
            </CardTitle>
            <CardDescription>
              Configure permissões, teste funcionalidades e otimize a experiência mobile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedMobileSupport />
          </CardContent>
        </Card>

        {/* Installation Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Guia de Instalação</CardTitle>
            <CardDescription>
              Como instalar e configurar o app para a melhor experiência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* iOS Installation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 bg-black rounded text-azure-50 text-xs flex items-center justify-center">
                    iOS
                  </div>
                  Instalação no iOS
                </h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    <span>Abra o site no Safari</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    <span>Toque no ícone de compartilhamento</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    <span>Selecione &quot;Adicionar à Tela de Início&quot;</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    <span>Confirme a instalação</span>
                  </li>
                </ol>
              </div>

              {/* Android Installation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded text-azure-50 text-xs flex items-center justify-center">
                    And
                  </div>
                  Instalação no Android
                </h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    <span>Abra o site no Chrome</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    <span>Toque no banner &quot;Instalar App&quot;</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    <span>Ou use menu &gt; &quot;Instalar app&quot;</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    <span>Confirme a instalação</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Features after installation */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Após a Instalação</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Ícone na tela inicial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Execução em tela cheia</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Notificações push</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Funcionalidades offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Acesso à câmera e GPS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Atualizações automáticas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Pronto para começar?</h2>
            <p className="text-muted-foreground mb-6">
              Instale o app agora e tenha acesso a todas as funcionalidades do Nautilus na palma da sua mão
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="gap-2">
                <Download className="h-5 w-5" />
                Instalar Agora
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                Saiba Mais
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileAppPage;