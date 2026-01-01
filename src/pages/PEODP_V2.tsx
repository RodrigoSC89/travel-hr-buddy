/**
 * PEODP_V2 - Versão Melhorada com Componentes V2
 * ETAPA 3: Módulos V2 - NÃO SUBSTITUI PEODP.tsx original
 * 
 * Rota: /peo-dp-v2 (adicional, não substitui /peo-dp)
 * Original: /peo-dp permanece funcional
 */

import React, { useState } from "react";
import { 
  Anchor, Shield, AlertTriangle, CheckCircle, Clock,
  Target, BarChart3, FileCheck, Settings, RefreshCw,
  Download, Sparkles, Activity, Navigation, Compass,
  Zap, Eye, BookOpen, Plus
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

// 7 Pilares PEO-DP Petrobras 2021
const PEODP_PILLARS = [
  { id: 1, name: "Liderança e Comprometimento", weight: 15 },
  { id: 2, name: "Organização e Responsabilidades", weight: 10 },
  { id: 3, name: "Gestão de Competências", weight: 15 },
  { id: 4, name: "Gestão de Riscos DP", weight: 20 },
  { id: 5, name: "Operação do Sistema DP", weight: 20 },
  { id: 6, name: "Manutenção e Confiabilidade", weight: 10 },
  { id: 7, name: "Melhoria Contínua", weight: 10 },
];

const PEODP_V2 = () => {
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh, showInfo } = useMaritimeActions();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [dpClass, setDpClass] = useState<'DP1' | 'DP2' | 'DP3'>('DP2');

  // Dados simulados
  const stats = {
    overallScore: 91,
    ipclv: 98.5,
    driftOffEvents: 0,
    driveOffEvents: 1,
    largeExcursions: 0,
    asogStatus: 'GREEN' as const,
  };

  const pillarScores = PEODP_PILLARS.map((pillar) => ({
    ...pillar,
    score: 75 + Math.floor(Math.random() * 20),
    items: 10 + Math.floor(Math.random() * 15),
    completed: 8 + Math.floor(Math.random() * 10),
  }));

  // Tabs do módulo
  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: Activity,
      content: (
        <div className="space-y-6">
          {/* ASOG Status Banner */}
          <div className={`p-4 rounded-lg border-2 ${
            stats.asogStatus === 'GREEN' ? 'border-green-500 bg-green-500/10' :
            stats.asogStatus === 'YELLOW' ? 'border-yellow-500 bg-yellow-500/10' :
            'border-red-500 bg-red-500/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded-full animate-pulse ${
                  stats.asogStatus === 'GREEN' ? 'bg-green-500' :
                  stats.asogStatus === 'YELLOW' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`} />
                <span className="font-bold text-lg">ASOG Status: {stats.asogStatus}</span>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-1">
                Classe {dpClass}
              </Badge>
            </div>
          </div>

          {/* DP Class Selector */}
          <div className="flex gap-2">
            {(['DP1', 'DP2', 'DP3'] as const).map((cls) => (
              <ButtonV2
                key={cls}
                variant={dpClass === cls ? 'default' : 'outline'}
                onClick={() => {
                  setDpClass(cls);
                  toast.success(`Classe ${cls} selecionada`);
                }}
              >
                {cls}
              </ButtonV2>
            ))}
          </div>

          {/* Stats Grid */}
          <GridCardV2 columns={4}>
            <StatCardV2
              title="Score Geral"
              value={`${stats.overallScore}%`}
              icon={Target}
              trend="up"
              trendValue="+3%"
              variant="success"
            />
            <StatCardV2
              title="IPCLV"
              value={`${stats.ipclv}%`}
              description="Meta: 100%"
              icon={Navigation}
              variant={stats.ipclv >= 98 ? "success" : "warning"}
            />
            <StatCardV2
              title="Drift Off Events"
              value={stats.driftOffEvents}
              icon={Compass}
              variant={stats.driftOffEvents === 0 ? "success" : "danger"}
            />
            <StatCardV2
              title="Drive Off Events"
              value={stats.driveOffEvents}
              icon={AlertTriangle}
              variant={stats.driveOffEvents === 0 ? "success" : "warning"}
            />
          </GridCardV2>

          {/* Operational Indicators */}
          <ContentCardV2 title="Indicadores Operacionais DP" icon={BarChart3}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border/50 text-center">
                <p className="text-4xl font-bold text-green-500">{stats.driftOffEvents}</p>
                <p className="text-sm text-muted-foreground mt-1">Drift Off</p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 text-center">
                <p className="text-4xl font-bold text-yellow-500">{stats.driveOffEvents}</p>
                <p className="text-sm text-muted-foreground mt-1">Drive Off</p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 text-center">
                <p className="text-4xl font-bold text-green-500">{stats.largeExcursions}</p>
                <p className="text-sm text-muted-foreground mt-1">Large Excursion</p>
              </div>
            </div>
          </ContentCardV2>
        </div>
      ),
    },
    {
      id: 'pillars',
      label: '7 Pilares',
      icon: Shield,
      badge: 7,
      content: (
        <ContentCardV2 title="7 Pilares PEO-DP Petrobras 2021" icon={Shield}>
          <div className="space-y-4">
            {pillarScores.map((pillar) => (
              <div 
                key={pillar.id}
                className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => showInfo(`Pilar ${pillar.id}`, pillar.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">P{pillar.id}</span>
                    <span className="font-medium">{pillar.name}</span>
                    <Badge variant="secondary">Peso: {pillar.weight}%</Badge>
                  </div>
                  <span className={`text-lg font-bold ${
                    pillar.score >= 85 ? 'text-green-500' : 
                    pillar.score >= 70 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {pillar.score}%
                  </span>
                </div>
                <Progress value={pillar.score} className="h-2" />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{pillar.completed}/{pillar.items} requisitos</span>
                  <span>Contribuição: {((pillar.score * pillar.weight) / 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'fmea',
      label: 'FMEA',
      icon: AlertTriangle,
      content: (
        <ContentCardV2 
          title="Integração FMEA" 
          icon={AlertTriangle}
          description="Failure Mode and Effects Analysis"
          actions={
            <ButtonV2 
              variant="outline" 
              size="sm" 
              icon={Plus}
              onClick={() => handleCreate("Análise FMEA")}
            >
              Nova Análise
            </ButtonV2>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sistema de análise de modos de falha</p>
            <p className="text-sm">Integrado com requisitos DP classe {dpClass}</p>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'logbook',
      label: 'Logbook DP',
      icon: BookOpen,
      content: (
        <ContentCardV2 
          title="Logbook DP" 
          icon={BookOpen}
          actions={
            <ButtonV2 
              variant="default" 
              size="sm" 
              icon={Plus}
              onClick={() => handleCreate("Entrada Logbook")}
            >
              Nova Entrada
            </ButtonV2>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Registro de operações DP</p>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'trials',
      label: 'DP Trials',
      icon: Zap,
      content: (
        <ContentCardV2 
          title="Testes DP (Trials)" 
          icon={Zap}
          actions={
            <ButtonV2 
              variant="outline" 
              size="sm" 
              icon={Plus}
              onClick={() => handleCreate("DP Trial")}
            >
              Novo Trial
            </ButtonV2>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Registro e análise de testes DP</p>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'ai-advisor',
      label: 'AI Advisor',
      icon: Sparkles,
      content: (
        <ContentCardV2 
          title="AI Advisor DP" 
          icon={Sparkles}
          description="Assistente inteligente para operações DP"
        >
          <AIAssistantV2
            moduleName="PEO-DP"
            moduleContext={`Operações DP Classe ${dpClass} - Petrobras 2021`}
            position="inline"
            placeholder="Pergunte sobre operações DP, FMEA, pilares..."
            suggestions={[
              "Analise o status ASOG atual",
              "Recomendações para classe DP2",
              "Checklist pré-operacional",
              "Análise de riscos DP"
            ]}
          />
        </ContentCardV2>
      ),
    },
  ];

  return (
    <PageLayoutV2 
      title="PEO-DP v2.0" 
      subtitle="Programa de Excelência em Operações DP - Versão Melhorada"
      icon={Anchor}
      actions={
        <div className="flex items-center gap-2">
          <ButtonV2 
            variant="outline" 
            size="sm" 
            icon={RefreshCw}
            onClick={() => handleRefresh("PEO-DP", async () => window.location.reload())}
          >
            Atualizar
          </ButtonV2>
          <ButtonV2 
            variant="default" 
            size="sm" 
            icon={Download}
            onClick={() => handleExport("PEO-DP")}
          >
            Exportar
          </ButtonV2>
        </div>
      }
    >
      {/* Module Header V2 */}
      <ModuleHeaderV2
        title="PEO-DP - Excelência em Operações DP"
        description="7 Pilares do Padrão Petrobras 2021 para Dynamic Positioning"
        icon={Anchor}
        badge="v2.0"
        aiEnabled={aiEnabled}
        onAIToggle={() => setAiEnabled(!aiEnabled)}
        onSettings={() => toast.info("Configurações PEO-DP")}
        onHelp={() => toast.info("Documentação PEO-DP Petrobras 2021")}
      />

      {/* Tabs V2 */}
      <div className="mt-6">
        <TabsV2 
          tabs={tabs} 
          defaultTab="overview"
          variant="default"
        />
      </div>

      {/* Floating AI Assistant (Opcional) */}
      {aiEnabled && (
        <AIAssistantV2
          moduleName="PEO-DP"
          moduleContext={`Dynamic Positioning Classe ${dpClass} - Petrobras 2021`}
          position="floating"
          placeholder="Pergunte sobre DP, FMEA, pilares..."
          suggestions={[
            "Status dos 7 pilares",
            "Análise ASOG",
            "Checklist DP Trial",
            "Recomendações de melhoria"
          ]}
        />
      )}
    </PageLayoutV2>
  );
};

export default PEODP_V2;
