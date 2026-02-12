import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Bell, 
  Download,
  Shield,
  Users,
  MapPin,
  Camera,
  QrCode,
  Compass,
  Battery,
  Signal
} from "lucide-react";

interface MobileFeature {
  id: string;
  name: string;
  description: string;
  priority: "core" | "important" | "nice-to-have";
  complexity: "low" | "medium" | "high";
  estimatedDays: number;
  dependencies: string[];
}

interface TechnicalSpec {
  category: string;
  requirements: string[];
}

export const MobileSpecifications = () => {
  const coreFeatures: MobileFeature[] = [
    {
      id: "1",
      name: "Modo Offline Avançado",
      description: "Sincronização inteligente de dados essenciais para operação sem internet",
      priority: "core",
      complexity: "high",
      estimatedDays: 21,
      dependencies: ["Local Database", "Sync Engine"]
    },
    {
      id: "2",
      name: "Check-in/Check-out Tripulação",
      description: "Sistema de controle de embarque e desembarque com geolocalização",
      priority: "core",
      complexity: "medium",
      estimatedDays: 14,
      dependencies: ["GPS", "Camera", "Biometrics"]
    },
    {
      id: "3",
      name: "Comunicação Push",
      description: "Notificações push inteligentes baseadas em contexto e urgência",
      priority: "core",
      complexity: "medium",
      estimatedDays: 10,
      dependencies: ["Firebase/FCM", "WebSocket"]
    },
    {
      id: "4",
      name: "Scanner QR/Barcode",
      description: "Leitura de códigos para equipamentos, cargas e documentos",
      priority: "important",
      complexity: "low",
      estimatedDays: 7,
      dependencies: ["Camera", "ML Kit"]
    },
    {
      id: "5",
      name: "Relatórios de Campo",
      description: "Criação e envio de relatórios com fotos e dados coletados offline",
      priority: "core",
      complexity: "medium",
      estimatedDays: 12,
      dependencies: ["Camera", "File Upload", "Forms"]
    },
    {
      id: "6",
      name: "Navegação Marítima",
      description: "GPS náutico com rotas, waypoints e informações meteorológicas",
      priority: "important",
      complexity: "high",
      estimatedDays: 28,
      dependencies: ["Maps API", "Weather API", "GPS"]
    },
    {
      id: "7",
      name: "Emergência & SOS",
      description: "Botão de emergência com localização automática e alertas",
      priority: "core",
      complexity: "medium",
      estimatedDays: 8,
      dependencies: ["GPS", "Emergency Services API"]
    },
    {
      id: "8",
      name: "Biometria e Segurança",
      description: "Autenticação por impressão digital, face ID e PIN",
      priority: "important",
      complexity: "medium",
      estimatedDays: 15,
      dependencies: ["Biometric APIs", "Encryption"]
    }
  ];

  const technicalSpecs: TechnicalSpec[] = [
    {
      category: "Plataformas Suportadas",
      requirements: [
        "iOS 14.0+ (iPhone 8 ou superior)",
        "Android 8.0+ (API Level 26)",
        "React Native 0.73+ ou Flutter 3.16+",
        "Suporte a tablets (iPad, Android tablets)"
      ]
    },
    {
      category: "Conectividade",
      requirements: [
        "WiFi 802.11 b/g/n/ac",
        "Bluetooth 5.0+ (para sensores)",
        "NFC (para check-ins)",
        "Satélite (Iridium para emergências)",
        "Modo offline completo"
      ]
    },
    {
      category: "Hardware",
      requirements: [
        "GPS/GLONASS/Galileo",
        "Câmera traseira 8MP+",
        "Sensor de movimento (acelerômetro, giroscópio)",
        "Microfone para comandos de voz",
        "Mínimo 4GB RAM, 64GB storage"
      ]
    },
    {
      category: "Segurança",
      requirements: [
        "Criptografia AES-256",
        "Certificado SSL/TLS 1.3",
        "Biometria nativa do dispositivo",
        "Wipe remoto em caso de perda",
        "VPN automática para dados sensíveis"
      ]
    },
    {
      category: "Performance",
      requirements: [
        "Tempo de inicialização < 3 segundos",
        "Sincronização em background",
        "Cache inteligente (até 500MB)",
        "Compressão de dados automática",
        "Bateria otimizada (8h+ uso contínuo)"
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
    case "core": return "bg-danger text-danger-foreground";
    case "important": return "bg-warning text-warning-foreground";
    case "nice-to-have": return "bg-info text-info-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
    case "high": return "bg-danger text-danger-foreground";
    case "medium": return "bg-warning text-warning-foreground";
    case "low": return "bg-success text-success-foreground";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const getFeatureIcon = (name: string) => {
    if (name.includes("Offline")) return <WifiOff className="h-5 w-5" />;
    if (name.includes("Check")) return <Users className="h-5 w-5" />;
    if (name.includes("Push")) return <Bell className="h-5 w-5" />;
    if (name.includes("Scanner")) return <QrCode className="h-5 w-5" />;
    if (name.includes("Relatórios")) return <Camera className="h-5 w-5" />;
    if (name.includes("Navegação")) return <Compass className="h-5 w-5" />;
    if (name.includes("Emergência")) return <Shield className="h-5 w-5" />;
    if (name.includes("Biometria")) return <Shield className="h-5 w-5" />;
    return <Smartphone className="h-5 w-5" />;
  };

  const totalDays = coreFeatures.reduce((sum, feature) => sum + feature.estimatedDays, 0);
  const averageComplexity = coreFeatures.filter(f => f.complexity === "high").length / coreFeatures.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Especificações Mobile App Nautilus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{coreFeatures.length}</div>
              <div className="text-sm text-muted-foreground">Funcionalidades Core</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{totalDays}</div>
              <div className="text-sm text-muted-foreground">Dias de Desenvolvimento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">Q2 2025</div>
              <div className="text-sm text-muted-foreground">Lançamento Previsto</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">iOS + Android</div>
              <div className="text-sm text-muted-foreground">Plataformas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Features */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Funcionalidades Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coreFeatures.map((feature) => (
              <div key={feature.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">
                      {getFeatureIcon(feature.name)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{feature.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(feature.priority)}>
                      {feature.priority}
                    </Badge>
                    <Badge className={getComplexityColor(feature.complexity)}>
                      {feature.complexity}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>⏱️ {feature.estimatedDays} dias</span>
                    <span>🔧 {feature.dependencies.length} dependências</span>
                  </div>
                  <div className="flex gap-1">
                    {feature.dependencies.slice(0, 3).map((dep) => (
                      <Badge key={dep} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                    {feature.dependencies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{feature.dependencies.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Specifications */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Especificações Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technicalSpecs.map((spec) => (
              <div key={spec.category} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">{spec.category}</h4>
                <ul className="space-y-2">
                  {spec.requirements.map((req) => (
                    <li key={req} className="text-sm text-muted-foreground flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Roadmap */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Roadmap de Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Fase 1 - MVP Core (Q1 2025)</h4>
                <Badge className="bg-primary text-primary-foreground">8 semanas</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Autenticação e segurança básica</li>
                <li>• Check-in/check-out tripulação</li>
                <li>• Modo offline essencial</li>
                <li>• Notificações push</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-warning pl-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Fase 2 - Funcionalidades Avançadas (Q2 2025)</h4>
                <Badge className="bg-warning text-warning-foreground">6 semanas</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Scanner QR/Barcode</li>
                <li>• Relatórios de campo com fotos</li>
                <li>• Navegação marítima básica</li>
                <li>• Biometria avançada</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-success pl-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Fase 3 - Recursos Premium (Q3 2025)</h4>
                <Badge className="bg-success text-success-foreground">4 semanas</Badge>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Sistema de emergência SOS</li>
                <li>• Navegação avançada com weather</li>
                <li>• IA integrada e comandos de voz</li>
                <li>• Sincronização total offline/online</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack Recommendation */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Battery className="h-5 w-5 text-primary" />
            Stack Tecnológico Recomendado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Framework Principal</h4>
              <Badge className="bg-primary text-primary-foreground mb-2">React Native</Badge>
              <p className="text-sm text-muted-foreground">
                Máxima reutilização de código, integração nativa, comunidade ativa
              </p>
            </div>
            
            <div className="text-center border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Banco Local</h4>
              <Badge className="bg-info text-info-foreground mb-2">WatermelonDB</Badge>
              <p className="text-sm text-muted-foreground">
                Sincronização automática, performance offline, SQLite otimizado
              </p>
            </div>
            
            <div className="text-center border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Notificações</h4>
              <Badge className="bg-warning text-warning-foreground mb-2">Firebase FCM</Badge>
              <p className="text-sm text-muted-foreground">
                Push notifications confiáveis, analytics integrado, multiplataforma
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};