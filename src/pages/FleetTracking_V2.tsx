/**
 * Fleet Tracking V2 - Versão Melhorada com Componentes V2
 * ETAPA 3: Módulos V2 - NÃO SUBSTITUI original
 * 
 * Rota: /fleet-tracking-v2 (adicional)
 * Original: /fleet-command permanece funcional
 */

import React, { useState, useEffect } from "react";
import { 
  Ship, Anchor, Navigation, MapPin, Activity, Target,
  Gauge, Fuel, Clock, AlertTriangle, CheckCircle,
  RefreshCw, Download, Plus, Settings, Waves,
  Sparkles, Compass, Radio, Satellite, TrendingUp
} from "lucide-react";

// Componentes V2
import { 
  PageLayoutV2, 
  ModuleHeaderV2, 
  StatCardV2, 
  ContentCardV2,
  GridCardV2, 
  TabsV2, 
  ButtonV2,
  AIAssistantV2 
} from "@/components/shared/v2";

import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Dados simulados da frota
const MOCK_VESSELS = [
  { id: 1, name: "PSV Atlantic Explorer", type: "PSV", status: "operational", location: "Bacia de Santos", speed: 12.5, heading: 245, fuel: 78 },
  { id: 2, name: "AHTS Ocean Guardian", type: "AHTS", status: "operational", location: "Bacia de Campos", speed: 8.2, heading: 180, fuel: 65 },
  { id: 3, name: "PLSV Deep Diver", type: "PLSV", status: "maintenance", location: "Porto do Rio", speed: 0, heading: 0, fuel: 92 },
  { id: 4, name: "RSV Subsea Master", type: "RSV", status: "operational", location: "Bacia do Espírito Santo", speed: 6.8, heading: 320, fuel: 54 },
  { id: 5, name: "DSV Neptuno", type: "DSV", status: "anchored", location: "Terminal de Angra", speed: 0, heading: 90, fuel: 88 },
];

const FleetTracking_V2 = () => {
  const { handleCreate, handleExport, handleRefresh, showInfo } = useMaritimeActions();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<number | null>(null);
  const [vessels, setVessels] = useState(MOCK_VESSELS);
  const [isLoading, setIsLoading] = useState(false);

  // Stats da frota
  const stats = {
    totalVessels: vessels.length,
    operational: vessels.filter(v => v.status === "operational").length,
    maintenance: vessels.filter(v => v.status === "maintenance").length,
    anchored: vessels.filter(v => v.status === "anchored").length,
    avgFuel: Math.round(vessels.reduce((acc, v) => acc + v.fuel, 0) / vessels.length),
    avgSpeed: (vessels.filter(v => v.speed > 0).reduce((acc, v) => acc + v.speed, 0) / vessels.filter(v => v.speed > 0).length).toFixed(1),
  };

  // Carregar dados reais (quando disponível)
  useEffect(() => {
    const loadVessels = async () => {
      try {
        const { data, error } = await supabase
          .from("vessels")
          .select("*")
          .limit(20);
        
        if (data && data.length > 0) {
          // Merge com dados simulados se necessário
          toast.success(`${data.length} embarcações carregadas`);
        }
      } catch (e) {
        // Usar dados mock
      }
    };
    loadVessels();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-500";
      case "maintenance": return "bg-orange-500";
      case "anchored": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "operational": return "Operacional";
      case "maintenance": return "Manutenção";
      case "anchored": return "Ancorada";
      default: return status;
    }
  };

  // Tabs do módulo
  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: Activity,
      content: (
        <div className="space-y-6">
          {/* Stats Grid */}
          <GridCardV2 columns={4}>
            <StatCardV2
              title="Total de Embarcações"
              value={stats.totalVessels}
              icon={Ship}
              variant="info"
              onClick={() => showInfo("Frota", `${stats.totalVessels} embarcações registradas`)}
            />
            <StatCardV2
              title="Operacionais"
              value={stats.operational}
              icon={CheckCircle}
              trend="up"
              trendValue="+2"
              variant="success"
            />
            <StatCardV2
              title="Em Manutenção"
              value={stats.maintenance}
              icon={AlertTriangle}
              variant="warning"
            />
            <StatCardV2
              title="Combustível Médio"
              value={`${stats.avgFuel}%`}
              icon={Fuel}
              variant={stats.avgFuel > 50 ? "success" : "warning"}
            />
          </GridCardV2>

          {/* Mini Map Placeholder */}
          <ContentCardV2 
            title="Mapa de Rastreamento" 
            icon={MapPin}
            description="Posições em tempo real das embarcações"
            actions={
              <ButtonV2 variant="outline" size="sm" icon={Satellite}>
                Satélite
              </ButtonV2>
            }
          >
            <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-blue-600/10 rounded-lg flex items-center justify-center border border-border/50 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-green-500 rounded-full animate-ping delay-100" />
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-500 rounded-full animate-ping delay-200" />
                <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-blue-500 rounded-full animate-ping delay-300" />
              </div>
              <div className="text-center z-10">
                <Compass className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                <p className="text-muted-foreground">Mapa AIS Interativo</p>
                <p className="text-xs text-muted-foreground/70">Integração Mapbox/AIS</p>
              </div>
            </div>
          </ContentCardV2>
        </div>
      ),
    },
    {
      id: 'vessels',
      label: 'Embarcações',
      icon: Ship,
      badge: stats.totalVessels,
      content: (
        <ContentCardV2 
          title="Frota Completa" 
          icon={Ship}
          actions={
            <ButtonV2 variant="default" size="sm" icon={Plus} onClick={() => handleCreate("Embarcação")}>
              Nova Embarcação
            </ButtonV2>
          }
        >
          <div className="space-y-3">
            {vessels.map((vessel) => (
              <div 
                key={vessel.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedVessel === vessel.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border/50 hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedVessel(vessel.id);
                  showInfo(vessel.name, `${vessel.type} - ${vessel.location}`);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${getStatusColor(vessel.status)}`} />
                    <span className="font-medium">{vessel.name}</span>
                    <Badge variant="outline">{vessel.type}</Badge>
                  </div>
                  <Badge variant={vessel.status === "operational" ? "default" : "secondary"}>
                    {getStatusLabel(vessel.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{vessel.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <span>{vessel.speed} kn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <span>{vessel.heading}°</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-4 w-4 text-muted-foreground" />
                    <Progress value={vessel.fuel} className="h-2 flex-1" />
                    <span>{vessel.fuel}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'tracking',
      label: 'AIS Tracking',
      icon: Satellite,
      content: (
        <ContentCardV2 
          title="Rastreamento AIS" 
          icon={Satellite}
          description="Automatic Identification System"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border/50 bg-green-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="h-5 w-5 text-green-500" />
                <span className="font-medium">AIS Classe A</span>
              </div>
              <p className="text-2xl font-bold">{stats.operational}</p>
              <p className="text-sm text-muted-foreground">Embarcações transmitindo</p>
            </div>
            <div className="p-4 rounded-lg border border-border/50 bg-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Waves className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Sinais Ativos</span>
              </div>
              <p className="text-2xl font-bold">98.5%</p>
              <p className="text-sm text-muted-foreground">Cobertura de sinal</p>
            </div>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'fuel',
      label: 'Combustível',
      icon: Fuel,
      content: (
        <ContentCardV2 
          title="Gestão de Combustível" 
          icon={Fuel}
          description="Monitoramento em tempo real"
        >
          <div className="space-y-4">
            {vessels.map((vessel) => (
              <div key={vessel.id} className="flex items-center gap-4">
                <div className="w-40 truncate font-medium">{vessel.name}</div>
                <Progress 
                  value={vessel.fuel} 
                  className={`h-3 flex-1 ${vessel.fuel < 30 ? '[&>div]:bg-red-500' : vessel.fuel < 60 ? '[&>div]:bg-yellow-500' : ''}`} 
                />
                <span className={`w-12 text-right font-mono ${vessel.fuel < 30 ? 'text-red-500' : ''}`}>
                  {vessel.fuel}%
                </span>
              </div>
            ))}
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: AlertTriangle,
      badge: 2,
      badgeVariant: 'destructive' as const,
      content: (
        <ContentCardV2 
          title="Alertas Operacionais" 
          icon={AlertTriangle}
        >
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span className="font-medium">PLSV Deep Diver</span>
                <Badge variant="secondary">Manutenção</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Manutenção programada - Previsão: 3 dias</p>
            </div>
            <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">RSV Subsea Master</span>
                <Badge variant="secondary">Combustível Baixo</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Nível de combustível em 54% - Abastecer em 48h</p>
            </div>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: TrendingUp,
      content: (
        <ContentCardV2 
          title="Relatórios da Frota" 
          icon={TrendingUp}
          actions={
            <div className="flex gap-2">
              <ButtonV2 variant="outline" size="sm" icon={Download} onClick={() => handleExport("Fleet Report")}>
                Exportar
              </ButtonV2>
            </div>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Relatórios de performance e operação</p>
            <p className="text-sm">Gráficos, KPIs, análises</p>
          </div>
        </ContentCardV2>
      ),
    },
  ];

  return (
    <PageLayoutV2 
      title="Fleet Tracking v2.0" 
      subtitle="Rastreamento e Monitoramento de Frota - Versão Melhorada"
      icon={Ship}
      actions={
        <div className="flex items-center gap-2">
          <ButtonV2 
            variant="outline" 
            size="sm" 
            icon={RefreshCw}
            onClick={() => handleRefresh("Fleet", async () => window.location.reload())}
          >
            Atualizar
          </ButtonV2>
          <ButtonV2 
            variant="default" 
            size="sm" 
            icon={Download}
            onClick={() => handleExport("Fleet Tracking")}
          >
            Exportar
          </ButtonV2>
        </div>
      }
    >
      {/* Module Header V2 */}
      <ModuleHeaderV2
        title="Fleet Tracking - Rastreamento de Frota"
        description="Monitoramento AIS em tempo real com IA preditiva"
        icon={Ship}
        badge="v2.0"
        aiEnabled={aiEnabled}
        onAIToggle={() => setAiEnabled(!aiEnabled)}
        onSettings={() => toast.info("Configurações Fleet Tracking")}
        onHelp={() => toast.info("Documentação AIS/GNSS")}
      />

      {/* Tabs V2 */}
      <div className="mt-6">
        <TabsV2 
          tabs={tabs} 
          defaultTab="overview"
          variant="default"
        />
      </div>

      {/* AI Assistant (Opcional) */}
      {aiEnabled && (
        <AIAssistantV2
          moduleName="Fleet Tracking"
          moduleContext="Rastreamento de frota marítima, AIS, posições, combustível, alertas operacionais"
          position="floating"
          placeholder="Pergunte sobre embarcações, posições, rotas..."
          suggestions={[
            "Qual o status da frota?",
            "Embarcações com combustível baixo",
            "Análise de rotas otimizadas",
            "Alertas ativos"
          ]}
        />
      )}
    </PageLayoutV2>
  );
};

export default FleetTracking_V2;
