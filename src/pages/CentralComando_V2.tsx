/**
 * Central de Comando V2 - Versão Melhorada com Componentes V2
 * ETAPA 3: Módulos V2 - NÃO SUBSTITUI original
 * 
 * Rota: /central-comando-v2 (adicional)
 * Original: /central-comando permanece funcional
 */

import React, { useState, useEffect } from "react";
import { 
  Compass, Activity, TrendingUp, Brain, Bell, Shield,
  Ship, Users, Wrench, AlertTriangle, CheckCircle,
  RefreshCw, Download, Settings, Sparkles, Eye,
  Radio, Gauge, Target, BarChart3, Zap, Clock
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

const CentralComando_V2 = () => {
  const { handleExport, handleRefresh, showInfo } = useMaritimeActions();
  const [aiEnabled, setAiEnabled] = useState(true); // IA ativa por padrão no comando
  const [isConnected, setIsConnected] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());

  // Stats do sistema
  const systemStatus = {
    fleet: { total: 12, active: 11, maintenance: 1, alerts: 3 },
    crew: { total: 247, onboard: 198, onLeave: 49, expiringCerts: 8 },
    maintenance: { scheduled: 15, overdue: 2, completed: 45, efficiency: 94.2 },
    compliance: { score: 96.8, pendingAudits: 2, expiringDocs: 6 },
    operations: { activeVoyages: 8, inPort: 4, emergency: 0 }
  };

  // Alertas ativos
  const alerts = [
    { id: 1, severity: "critical", title: "STCW Expiring", description: "3 certificados vencem em 7 dias", source: "Crew" },
    { id: 2, severity: "high", title: "Manutenção Atrasada", description: "Motor #2 - PSV Atlantic", source: "MMI" },
    { id: 3, severity: "medium", title: "Combustível Baixo", description: "RSV Subsea Master - 54%", source: "Fleet" },
  ];

  const alertCounts = {
    critical: alerts.filter(a => a.severity === "critical").length,
    high: alerts.filter(a => a.severity === "high").length,
    total: alerts.length,
  };

  // Tabs do módulo
  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: Compass,
      content: (
        <div className="space-y-6">
          {/* KPIs Grid */}
          <GridCardV2 columns={4}>
            <StatCardV2
              title="Frota Ativa"
              value={`${systemStatus.fleet.active}/${systemStatus.fleet.total}`}
              icon={Ship}
              trend="up"
              trendValue="+1"
              variant="success"
              onClick={() => showInfo("Frota", `${systemStatus.fleet.total} embarcações, ${systemStatus.fleet.active} operacionais`)}
            />
            <StatCardV2
              title="Tripulação a Bordo"
              value={systemStatus.crew.onboard}
              description={`de ${systemStatus.crew.total} total`}
              icon={Users}
              variant="info"
            />
            <StatCardV2
              title="Eficiência Manutenção"
              value={`${systemStatus.maintenance.efficiency}%`}
              icon={Wrench}
              trend="up"
              trendValue="+2.3%"
              variant="success"
            />
            <StatCardV2
              title="Compliance Score"
              value={`${systemStatus.compliance.score}%`}
              icon={Shield}
              variant="success"
            />
          </GridCardV2>

          {/* Status em Tempo Real */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentCardV2 
              title="Status Operacional" 
              icon={Activity}
              description="Monitoramento em tempo real"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium">Sistema Online</span>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    Operacional
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg border border-border/50">
                    <p className="text-2xl font-bold text-green-500">{systemStatus.operations.activeVoyages}</p>
                    <p className="text-xs text-muted-foreground">Viagens Ativas</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border border-border/50">
                    <p className="text-2xl font-bold text-blue-500">{systemStatus.operations.inPort}</p>
                    <p className="text-xs text-muted-foreground">Em Porto</p>
                  </div>
                  <div className="text-center p-3 rounded-lg border border-border/50">
                    <p className="text-2xl font-bold text-green-500">{systemStatus.operations.emergency}</p>
                    <p className="text-xs text-muted-foreground">Emergências</p>
                  </div>
                </div>
              </div>
            </ContentCardV2>

            <ContentCardV2 
              title="Alertas Ativos" 
              icon={Bell}
              description={`${alertCounts.total} alertas pendentes`}
            >
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.severity === "critical" ? "border-red-500/30 bg-red-500/5" :
                      alert.severity === "high" ? "border-orange-500/30 bg-orange-500/5" :
                      "border-yellow-500/30 bg-yellow-500/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{alert.title}</span>
                      <Badge variant={
                        alert.severity === "critical" ? "destructive" :
                        alert.severity === "high" ? "default" : "secondary"
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                  </div>
                ))}
              </div>
            </ContentCardV2>
          </div>
        </div>
      ),
    },
    {
      id: 'operations',
      label: 'Operações',
      icon: Activity,
      content: (
        <ContentCardV2 
          title="Centro de Operações" 
          icon={Activity}
          description="Controle operacional unificado"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => showInfo("Frota", "Gestão de Embarcações")}>
              <Ship className="h-8 w-8 text-blue-500 mb-2" />
              <p className="font-medium">Fleet Command</p>
              <p className="text-sm text-muted-foreground">{systemStatus.fleet.total} embarcações</p>
            </div>
            <div className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => showInfo("Tripulação", "Gestão de Pessoas")}>
              <Users className="h-8 w-8 text-green-500 mb-2" />
              <p className="font-medium">Crew Management</p>
              <p className="text-sm text-muted-foreground">{systemStatus.crew.total} tripulantes</p>
            </div>
            <div className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => showInfo("Manutenção", "MMI")}>
              <Wrench className="h-8 w-8 text-orange-500 mb-2" />
              <p className="font-medium">Maintenance</p>
              <p className="text-sm text-muted-foreground">{systemStatus.maintenance.scheduled} agendadas</p>
            </div>
            <div className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => showInfo("Compliance", "Auditorias")}>
              <Shield className="h-8 w-8 text-purple-500 mb-2" />
              <p className="font-medium">Compliance</p>
              <p className="text-sm text-muted-foreground">{systemStatus.compliance.score}% score</p>
            </div>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'executive',
      label: 'Executivo',
      icon: TrendingUp,
      content: (
        <ContentCardV2 
          title="Dashboard Executivo" 
          icon={TrendingUp}
          description="KPIs e métricas gerenciais"
          actions={
            <ButtonV2 variant="outline" size="sm" icon={Download} onClick={() => handleExport("Executive Report")}>
              Exportar
            </ButtonV2>
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
              <p className="text-3xl font-bold text-blue-500">{systemStatus.fleet.total}</p>
              <p className="text-sm text-muted-foreground">Embarcações</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
              <p className="text-3xl font-bold text-green-500">{systemStatus.crew.total}</p>
              <p className="text-sm text-muted-foreground">Tripulantes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
              <p className="text-3xl font-bold text-purple-500">{systemStatus.compliance.score}%</p>
              <p className="text-sm text-muted-foreground">Compliance</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
              <p className="text-3xl font-bold text-orange-500">{systemStatus.maintenance.efficiency}%</p>
              <p className="text-sm text-muted-foreground">Eficiência</p>
            </div>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'ia',
      label: 'IA Central',
      icon: Brain,
      content: (
        <ContentCardV2 
          title="Inteligência Artificial" 
          icon={Brain}
          description="Análises preditivas e insights"
        >
          <AIAssistantV2
            moduleName="Central de Comando"
            moduleContext="Comando central de operações marítimas, frota, tripulação, manutenção, compliance, alertas"
            position="inline"
            placeholder="Pergunte sobre operações, frota, tripulação, compliance..."
            suggestions={[
              "Resumo executivo do dia",
              "Alertas críticos ativos",
              "Previsão de manutenção",
              "Análise de compliance"
            ]}
          />
        </ContentCardV2>
      ),
    },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: Bell,
      badge: alertCounts.total,
      badgeVariant: alertCounts.critical > 0 ? 'destructive' as const : 'default' as const,
      content: (
        <ContentCardV2 
          title="Central de Alertas" 
          icon={Bell}
          description="Todos os alertas do sistema"
        >
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-center">
                <p className="text-2xl font-bold text-red-500">{alertCounts.critical}</p>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
              <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5 text-center">
                <p className="text-2xl font-bold text-orange-500">{alertCounts.high}</p>
                <p className="text-xs text-muted-foreground">Altos</p>
              </div>
              <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 text-center">
                <p className="text-2xl font-bold text-yellow-500">{alertCounts.total - alertCounts.critical - alertCounts.high}</p>
                <p className="text-xs text-muted-foreground">Médios</p>
              </div>
            </div>
            
            {/* Alert List */}
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                    alert.severity === "critical" ? "border-red-500/30" :
                    alert.severity === "high" ? "border-orange-500/30" :
                    "border-yellow-500/30"
                  }`}
                  onClick={() => showInfo(alert.title, alert.description)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${
                        alert.severity === "critical" ? "text-red-500" :
                        alert.severity === "high" ? "text-orange-500" :
                        "text-yellow-500"
                      }`} />
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{alert.source}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'resilience',
      label: 'Resiliência',
      icon: Shield,
      content: (
        <ContentCardV2 
          title="Resiliência Operacional" 
          icon={Shield}
          description="Continuidade e recuperação"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <p className="font-medium">Sistemas Redundantes</p>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Disponibilidade</p>
            </div>
            <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
              <Zap className="h-8 w-8 text-blue-500 mb-2" />
              <p className="font-medium">Tempo de Recuperação</p>
              <p className="text-2xl font-bold">&lt; 15min</p>
              <p className="text-sm text-muted-foreground">RTO Médio</p>
            </div>
          </div>
        </ContentCardV2>
      ),
    },
  ];

  return (
    <PageLayoutV2 
      title="Central de Comando v2.0" 
      subtitle="Centro de Operações Unificado - Versão Melhorada"
      icon={Compass}
      actions={
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
            <span className="text-xs font-medium">{isConnected ? 'Online' : 'Offline'}</span>
            <span className="text-xs text-muted-foreground">
              {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          
          <ButtonV2 
            variant="outline" 
            size="sm" 
            icon={RefreshCw}
            onClick={() => {
              setLastSync(new Date());
              handleRefresh("Central", async () => window.location.reload());
            }}
          >
            Atualizar
          </ButtonV2>
        </div>
      }
    >
      {/* Module Header V2 */}
      <ModuleHeaderV2
        title="Central de Comando - Operações Unificadas"
        description="Dashboard executivo, operações, IA e monitoramento em tempo real"
        icon={Compass}
        badge="v2.0"
        aiEnabled={aiEnabled}
        onAIToggle={() => setAiEnabled(!aiEnabled)}
        onSettings={() => toast.info("Configurações Central de Comando")}
        onHelp={() => toast.info("Documentação do Sistema")}
      />

      {/* Tabs V2 */}
      <div className="mt-6">
        <TabsV2 
          tabs={tabs} 
          defaultTab="overview"
          variant="default"
        />
      </div>

      {/* Floating AI Assistant */}
      {aiEnabled && (
        <AIAssistantV2
          moduleName="Central de Comando"
          moduleContext="Comando central de operações marítimas, frota, tripulação, manutenção, compliance, alertas, KPIs executivos"
          position="floating"
          placeholder="Pergunte sobre operações, KPIs, alertas..."
          suggestions={[
            "Status geral do sistema",
            "Alertas críticos ativos",
            "Resumo executivo",
            "Previsões de manutenção"
          ]}
        />
      )}
    </PageLayoutV2>
  );
};

export default CentralComando_V2;
