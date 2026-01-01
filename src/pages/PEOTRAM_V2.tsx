/**
 * PEOTRAM_V2 - Versão Melhorada com Componentes V2
 * ETAPA 3: Módulos V2 - NÃO SUBSTITUI PEOTRAM.tsx original
 * 
 * Rota: /peotram-v2 (adicional, não substitui /peotram)
 * Original: /peotram permanece funcional
 */

import React, { useState } from "react";
import { 
  FileCheck, Brain, Shield, TrendingUp, Sparkles, 
  Star, Crown, Zap, CheckCircle, AlertTriangle, 
  BarChart3, Award, Globe, Clock, Plus, RefreshCw, 
  Download, Settings, Mic, Eye, Target
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

// Componentes originais preservados
import { PeotramAuditManager } from "@/components/peotram/peotram-audit-manager";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// 13 Elementos PEOTRAM 2024
const PEOTRAM_ELEMENTS = [
  { id: 1, name: "Liderança e Compromisso", critical: false },
  { id: 2, name: "Política e Objetivos", critical: false },
  { id: 3, name: "Organização e Responsabilidades", critical: false },
  { id: 4, name: "Execução Operacional", critical: true },
  { id: 5, name: "Gestão de Competências", critical: false },
  { id: 6, name: "Gestão de Riscos", critical: true },
  { id: 7, name: "Gestão de Mudanças", critical: false },
  { id: 8, name: "Comunicação", critical: false },
  { id: 9, name: "Documentação e Registros", critical: false },
  { id: 10, name: "Monitoramento e Medição", critical: false },
  { id: 11, name: "Investigação de Incidentes", critical: true },
  { id: 12, name: "Auditoria e Análise Crítica", critical: true },
  { id: 13, name: "Melhoria Contínua", critical: false },
];

const PEOTRAM_V2 = () => {
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh, showInfo } = useMaritimeActions();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);

  // Dados simulados
  const stats = {
    overallScore: 87,
    elementsComplete: 10,
    totalElements: 13,
    pendingItems: 15,
    criticalPending: 3,
  };

  const elementScores = PEOTRAM_ELEMENTS.map((el, i) => ({
    ...el,
    score: 70 + Math.floor(Math.random() * 25),
    items: 8 + Math.floor(Math.random() * 10),
    completed: 5 + Math.floor(Math.random() * 8),
  }));

  // Tabs do módulo
  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          {/* Stats Grid */}
          <GridCardV2 columns={4}>
            <StatCardV2
              title="Score Geral"
              value={`${stats.overallScore}%`}
              icon={Target}
              trend="up"
              trendValue="+8%"
              variant="success"
            />
            <StatCardV2
              title="Elementos Completos"
              value={`${stats.elementsComplete}/${stats.totalElements}`}
              icon={CheckCircle}
              variant="success"
            />
            <StatCardV2
              title="Itens Pendentes"
              value={stats.pendingItems}
              icon={Clock}
              variant="warning"
            />
            <StatCardV2
              title="Críticos Pendentes"
              value={stats.criticalPending}
              icon={AlertTriangle}
              variant="danger"
            />
          </GridCardV2>

          {/* Manager Original Preservado */}
          <ContentCardV2 
            title="Gerenciador de Auditorias" 
            icon={FileCheck}
            description="Sistema completo de auditoria PEOTRAM"
          >
            <PeotramAuditManager />
          </ContentCardV2>
        </div>
      ),
    },
    {
      id: 'elements',
      label: '13 Elementos',
      icon: Shield,
      badge: 13,
      content: (
        <ContentCardV2 title="13 Elementos PEOTRAM 2024" icon={Shield}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {elementScores.map((element) => (
              <div 
                key={element.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedElement === element.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border/50 hover:border-primary/50'
                } ${element.critical ? 'ring-1 ring-orange-500/30' : ''}`}
                onClick={() => {
                  setSelectedElement(element.id);
                  showInfo(`Elemento ${element.id}`, element.name);
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{element.id}</span>
                    {element.critical && (
                      <Badge variant="destructive" className="text-xs">CRÍTICO</Badge>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    element.score >= 80 ? 'text-green-500' : 
                    element.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {element.score}%
                  </span>
                </div>
                <h4 className="font-medium text-sm mb-2">{element.name}</h4>
                <Progress value={element.score} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {element.completed}/{element.items} itens completos
                </p>
              </div>
            ))}
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'critical',
      label: 'Elementos Críticos',
      icon: AlertTriangle,
      badge: 4,
      badgeVariant: 'destructive' as const,
      content: (
        <ContentCardV2 
          title="Elementos Críticos" 
          icon={AlertTriangle}
          description="Elementos 4, 6, 11 e 12 requerem atenção especial"
        >
          <div className="space-y-4">
            {elementScores.filter(el => el.critical).map((element) => (
              <div 
                key={element.id}
                className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Elemento {element.id}</Badge>
                    <span className="font-medium">{element.name}</span>
                  </div>
                  <span className={`text-lg font-bold ${
                    element.score >= 80 ? 'text-green-500' : 
                    element.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {element.score}%
                  </span>
                </div>
                <Progress value={element.score} className="h-3" />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{element.completed}/{element.items} itens</span>
                  <span>{element.items - element.completed} pendentes</span>
                </div>
              </div>
            ))}
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'evidence',
      label: 'Evidências',
      icon: FileCheck,
      content: (
        <ContentCardV2 
          title="Gerador de Evidências com IA" 
          icon={Sparkles}
          actions={
            <ButtonV2 
              variant="ai" 
              size="sm" 
              icon={Brain}
              onClick={() => showInfo("Gerar Evidências", "IA analisando documentação...")}
            >
              Gerar com IA
            </ButtonV2>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sistema de geração automática de evidências</p>
            <p className="text-sm">Powered by Lovable AI Gateway</p>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'voice',
      label: 'Voice Chat',
      icon: Mic,
      content: (
        <ContentCardV2 
          title="Assistente de Voz PEOTRAM" 
          icon={Mic}
          actions={
            <ButtonV2 
              variant="ai" 
              size="sm" 
              icon={Mic}
              onClick={() => showInfo("Voice Chat", "Iniciando assistente de voz...")}
            >
              Iniciar Voz
            </ButtonV2>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chat de voz para auditoria hands-free</p>
            <p className="text-sm">Powered by ElevenLabs HD</p>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      content: (
        <ContentCardV2 
          title="Relatórios PEOTRAM" 
          icon={BarChart3}
          actions={
            <div className="flex gap-2">
              <ButtonV2 
                variant="outline" 
                size="sm" 
                icon={Download}
                onClick={() => handleExport("PEOTRAM")}
              >
                Exportar
              </ButtonV2>
              <ButtonV2 
                variant="default" 
                size="sm" 
                icon={FileCheck}
                onClick={() => handleGenerateReport("PEOTRAM PDF")}
              >
                Gerar PDF
              </ButtonV2>
            </div>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Relatórios de auditoria PEOTRAM 2024</p>
          </div>
        </ContentCardV2>
      ),
    },
  ];

  return (
    <PageLayoutV2 
      title="PEOTRAM v2.0" 
      subtitle="Sistema de Auditoria Petrobras - Versão Melhorada"
      icon={FileCheck}
      actions={
        <div className="flex items-center gap-2">
          <ButtonV2 
            variant="outline" 
            size="sm" 
            icon={RefreshCw}
            onClick={() => handleRefresh("PEOTRAM", async () => window.location.reload())}
          >
            Atualizar
          </ButtonV2>
          <ButtonV2 
            variant="ai" 
            size="sm" 
            icon={Sparkles}
            onClick={() => setAiEnabled(!aiEnabled)}
          >
            {aiEnabled ? 'IA Ativada' : 'Ativar IA'}
          </ButtonV2>
        </div>
      }
    >
      {/* Module Header V2 */}
      <ModuleHeaderV2
        title="PEOTRAM - Auditoria Petrobras 2024"
        description="13 Elementos do Padrão Petrobras de Segurança Operacional"
        icon={FileCheck}
        badge="v2.0"
        aiEnabled={aiEnabled}
        onAIToggle={() => setAiEnabled(!aiEnabled)}
        onSettings={() => toast.info("Configurações PEOTRAM")}
        onHelp={() => toast.info("Documentação PEOTRAM 2024")}
      />

      {/* Tabs V2 */}
      <div className="mt-6">
        <TabsV2 
          tabs={tabs} 
          defaultTab="overview"
          variant="pills"
        />
      </div>

      {/* AI Assistant (Opcional) */}
      {aiEnabled && (
        <AIAssistantV2
          moduleName="PEOTRAM"
          moduleContext="Auditoria Petrobras 2024 - 13 Elementos de Segurança"
          position="floating"
          placeholder="Pergunte sobre elementos, evidências, conformidade..."
          suggestions={[
            "Qual o status dos elementos críticos?",
            "Gere evidências para o elemento 6",
            "Analise gaps de conformidade",
            "Sugira ações para elemento 4"
          ]}
        />
      )}
    </PageLayoutV2>
  );
};

export default PEOTRAM_V2;
