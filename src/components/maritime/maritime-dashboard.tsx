import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading as LoadingSpinner } from "@/components/ui/Loading";
import { safeLazyImport } from "@/utils/safeLazyImport";
import { 
  Ship, 
  Users, 
  Shield, 
  TrendingUp, 
  Globe, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Anchor,
  Compass,
  Radio,
  Heart,
  Brain,
  Zap
} from "lucide-react";

// Lazy loading dos componentes pesados com safeLazyImport
const VesselManagement = safeLazyImport(
  () => import("./vessel-management").then(module => ({ default: module.VesselManagement })),
  "Vessel Management"
);
const CrewRotationPlanner = safeLazyImport(
  () => import("./crew-management-dashboard").then(module => ({ default: module.CrewManagementDashboard })),
  "Crew Management Dashboard"
);
const CertificationManager = safeLazyImport(
  () => import("./maritime-certification-manager").then(module => ({ default: module.MaritimeCertificationManager })),
  "Maritime Certification Manager"
);

export const MaritimeDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);

  const handleModuleChange = async (module: string) => {
    if (module !== "overview") {
      setIsLoading(true);
      // Simular delay para mostrar o loading
      setTimeout(() => {
        setActiveModule(module);
        setIsLoading(false);
      }, 300);
    } else {
      setActiveModule(module);
    }
  };

  const renderModuleContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Carregando módulo marítimo...</p>
          </div>
        </div>
      );
    }

    switch (activeModule) {
    case "vessels":
      return <VesselManagement />;
    case "crew":
      return <CrewRotationPlanner />;
    case "certifications":
      return <CertificationManager />;
    default:
      return <OverviewDashboard onNavigate={handleModuleChange} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent-foreground to-primary bg-clip-text text-transparent flex items-center gap-3">
            <Ship className="h-10 w-10 text-primary" />
            NAUTILUS MARITIME OS
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Sistema Inteligente de Gestão Marítima e Logística de Pessoal
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              🌊 Maritime Excellence
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              🤖 AI-Powered
            </Badge>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              🛡️ Compliance Ready
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeModule} onValueChange={handleModuleChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="vessels" className="flex items-center gap-2" disabled={isLoading}>
            <Ship className="h-4 w-4" />
            Embarcações
          </TabsTrigger>
          <TabsTrigger value="crew" className="flex items-center gap-2" disabled={isLoading}>
            <Users className="h-4 w-4" />
            Tripulação
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2" disabled={isLoading}>
            <Shield className="h-4 w-4" />
            Certificações
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {renderModuleContent()}
        </div>
      </Tabs>
    </div>
  );
};

interface OverviewDashboardProps {
  onNavigate: (module: string) => void;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 p-8 text-azure-50">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            Revolução na Gestão Marítima
          </h2>
          <p className="text-lg opacity-90 mb-6 max-w-3xl">
            Sistema pioneiro que combina IA, IoT e automação para transformar completamente 
            a gestão de recursos humanos e operações marítimas.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-azure-100/20 px-4 py-2 rounded-lg">
              <Brain className="h-5 w-5" />
              <span>IA Preditiva</span>
            </div>
            <div className="flex items-center gap-2 bg-azure-100/20 px-4 py-2 rounded-lg">
              <Globe className="h-5 w-5" />
              <span>Compliance Global</span>
            </div>
            <div className="flex items-center gap-2 bg-azure-100/20 px-4 py-2 rounded-lg">
              <Zap className="h-5 w-5" />
              <span>Automação Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embarcações Ativas</CardTitle>
            <Ship className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              18 em navegação, 6 no porto
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tripulantes Ativos</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">487</div>
            <p className="text-xs text-muted-foreground">
              324 a bordo, 163 em terra
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.8%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência IA</CardTitle>
            <Brain className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.5%</div>
            <p className="text-xs text-muted-foreground">
              Otimização automática
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Módulos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              Módulos Inovadores
            </CardTitle>
            <CardDescription>
              Funcionalidades revolucionárias para gestão marítima
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-info/5 transition-colors"
                onClick={() => onNavigate("vessels")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <Ship className="h-5 w-5 text-info" />
                  </div>
                  <h3 className="font-semibold">Gestão de Embarcações</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Controle total da frota com rastreamento em tempo real, compliance automático e análise preditiva
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">IoT</Badge>
                  <Badge variant="secondary" className="text-xs">Real-time</Badge>
                  <Badge variant="secondary" className="text-xs">Preditivo</Badge>
                </div>
              </div>

              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-success/5 transition-colors"
                onClick={() => onNavigate("crew")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Users className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="font-semibold">Rotação Inteligente</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  IA planeja rotações otimizadas, reduz custos e garante compliance com regulamentações internacionais
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">IA</Badge>
                  <Badge variant="secondary" className="text-xs">Otimização</Badge>
                  <Badge variant="secondary" className="text-xs">Global</Badge>
                </div>
              </div>

              <div 
                className="p-4 border rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                onClick={() => onNavigate("certifications")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Certificações Automáticas</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Sistema automatizado de compliance STCW, MLC e ISM com renovações inteligentes e alertas preditivos
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">STCW</Badge>
                  <Badge variant="secondary" className="text-xs">MLC</Badge>
                  <Badge variant="secondary" className="text-xs">Automático</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gradient-to-br from-info/10 to-primary/10 border-info/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-info/20 rounded-lg">
                    <Heart className="h-5 w-5 text-info" />
                  </div>
                  <h3 className="font-semibold">Wellness Marítimo</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Monitoramento avançado de saúde mental, telemedicina e programas de bem-estar para tripulação
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Wellness</Badge>
                  <Badge variant="secondary" className="text-xs">Telemedicina</Badge>
                  <Badge variant="secondary" className="text-xs">IA Mental</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas Críticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="font-medium text-destructive">Certificação Vencida</span>
                  </div>
                  <p className="text-sm text-destructive/80">SSO Certificate - MV Ocean Pioneer</p>
                </div>
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-warning" />
                    <span className="font-medium text-warning">Rotação Pendente</span>
                  </div>
                  <p className="text-sm text-warning/80">2 oficiais - Santos, 15/01</p>
                </div>
                <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Radio className="h-4 w-4 text-info" />
                    <span className="font-medium text-info">Comunicação Perdida</span>
                  </div>
                  <p className="text-sm text-info/80">MV Atlantic Star - 2h ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                IA Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-success/5 border border-success/30 rounded-lg">
                  <p className="text-sm font-medium text-success mb-1">Economia Identificada</p>
                  <p className="text-xs text-success/80">
                    Otimização de rotações pode economizar R$ 45.000 este mês
                  </p>
                </div>
                <div className="p-3 bg-accent border border-border rounded-lg">
                  <p className="text-sm font-medium text-accent-foreground mb-1">Padrão Detectado</p>
                  <p className="text-xs text-muted-foreground">
                    Rotações às quintas-feiras têm 25% menos atrasos
                  </p>
                </div>
                <div className="p-3 bg-warning/5 border border-warning/30 rounded-lg">
                  <p className="text-sm font-medium text-warning mb-1">Previsão de Demanda</p>
                  <p className="text-xs text-warning/80">
                    +18% necessidade de oficiais nos próximos 90 dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recursos Revolucionários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Recursos Revolucionários do NAUTILUS OS
          </CardTitle>
          <CardDescription>
            Funcionalidades que ainda não existem no mercado marítimo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-info/5 to-info/10 border border-info/30 rounded-lg">
              <h4 className="font-semibold text-info mb-2">🧠 IA Preditiva Avançada</h4>
              <p className="text-sm text-info/80">
                Algoritmos proprietários preveem necessidades de pessoal, otimizam escalas e antecipam problemas
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-success/5 to-success/10 border border-success/30 rounded-lg">
              <h4 className="font-semibold text-success mb-2">🌐 Compliance Global Automático</h4>
              <p className="text-sm text-success/80">
                Sistema atualiza automaticamente com mudanças regulamentares internacionais (IMO, MLC, STCW)
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-accent to-accent/50 border border-border rounded-lg">
              <h4 className="font-semibold text-accent-foreground mb-2">🩺 Telemedicina Marítima</h4>
              <p className="text-sm text-muted-foreground">
                Consultório médico virtual com IA diagnóstica e conexão com especialistas em terra
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-warning/5 to-warning/10 border border-warning/30 rounded-lg">
              <h4 className="font-semibold text-warning mb-2">📡 IoT Marítimo Integrado</h4>
              <p className="text-sm text-warning/80">
                Sensores inteligentes monitoram embarcações, equipamentos e até sinais vitais da tripulação
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-info/10 to-primary/10 border border-info/20 rounded-lg">
              <h4 className="font-semibold text-info mb-2">🤖 Assistente IA Marítimo</h4>
              <p className="text-sm text-info/80">
                Chatbot especializado em regulamentações marítimas, emergências e suporte operacional 24/7
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">🎯 Otimização Quântica</h4>
              <p className="text-sm text-primary/80">
                Algoritmos quânticos resolvem problemas complexos de logística e alocação de recursos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};