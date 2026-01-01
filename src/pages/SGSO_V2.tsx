/**
 * SGSO_V2 - Versão Melhorada com Componentes V2
 * ETAPA 3: Módulos V2 - NÃO SUBSTITUI SGSO.tsx original
 * 
 * Rota: /sgso-v2 (adicional, não substitui /sgso)
 * Original: /sgso permanece funcional
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, AlertTriangle, FileCheck, Bell, Target, 
  TrendingUp, Users, BookOpen, Activity, Plus, 
  RefreshCw, Download, Eye, Settings, BarChart3,
  CheckCircle, Clock, Sparkles
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
import { SgsoDashboard } from "@/components/sgso/SgsoDashboard";
import { ProactiveComplianceMonitor } from "@/components/compliance/ProactiveComplianceMonitor";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const SGSO_V2 = () => {
  const navigate = useNavigate();
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh, showInfo } = useMaritimeActions();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Dados simulados para demonstração
  const stats = {
    totalPractices: 17,
    compliant: 14,
    inProgress: 2,
    nonCompliant: 1,
    overallScore: 82,
  };

  // Tabs do módulo
  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: Activity,
      badge: undefined,
      content: (
        <div className="space-y-6">
          {/* Stats Grid */}
          <GridCardV2 columns={4}>
            <StatCardV2
              title="Score Geral"
              value={`${stats.overallScore}%`}
              icon={Target}
              trend="up"
              trendValue="+5%"
              variant="success"
              onClick={() => showInfo("Score Geral", "Score de conformidade SGSO")}
            />
            <StatCardV2
              title="Práticas Conformes"
              value={`${stats.compliant}/${stats.totalPractices}`}
              icon={CheckCircle}
              variant="success"
            />
            <StatCardV2
              title="Em Progresso"
              value={stats.inProgress}
              icon={Clock}
              variant="warning"
            />
            <StatCardV2
              title="Não Conformes"
              value={stats.nonCompliant}
              icon={AlertTriangle}
              variant="danger"
            />
          </GridCardV2>

          {/* Dashboard Original Preservado */}
          <ContentCardV2 
            title="Dashboard SGSO" 
            icon={Activity}
            description="Visão completa das 17 práticas obrigatórias"
          >
            <SgsoDashboard />
          </ContentCardV2>
        </div>
      ),
    },
    {
      id: 'practices',
      label: '17 Práticas',
      icon: Shield,
      badge: stats.totalPractices,
      content: (
        <ContentCardV2 title="Gestão das 17 Práticas ANP" icon={Shield}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 17 }, (_, i) => (
              <div 
                key={i}
                className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => showInfo(`Prática ${i + 1}`, `Detalhes da prática ${i + 1} ANP`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Prática {i + 1}</span>
                  <Badge variant={i < 14 ? "default" : i < 16 ? "secondary" : "destructive"}>
                    {i < 14 ? "Conforme" : i < 16 ? "Em Progresso" : "Não Conforme"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Resolução ANP 43/2007 - Item {i + 1}
                </p>
              </div>
            ))}
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'compliance',
      label: 'Monitor Proativo',
      icon: Eye,
      content: (
        <ContentCardV2 title="Monitor de Conformidade Proativo" icon={Eye}>
          <ProactiveComplianceMonitor />
        </ContentCardV2>
      ),
    },
    {
      id: 'risks',
      label: 'Matriz de Riscos',
      icon: AlertTriangle,
      content: (
        <ContentCardV2 
          title="Matriz de Riscos 5x5" 
          icon={AlertTriangle}
          actions={
            <ButtonV2 
              variant="outline" 
              size="sm" 
              icon={Plus}
              onClick={() => handleCreate("Risco")}
            >
              Novo Risco
            </ButtonV2>
          }
        >
          <div className="aspect-square max-w-xl mx-auto p-4">
            <div className="grid grid-cols-5 grid-rows-5 gap-1 h-full">
              {Array.from({ length: 25 }, (_, i) => {
                const row = Math.floor(i / 5);
                const col = i % 5;
                const risk = (5 - row) * (col + 1);
                let color = "bg-green-500/20";
                if (risk > 15) color = "bg-red-500/40";
                else if (risk > 10) color = "bg-orange-500/30";
                else if (risk > 5) color = "bg-yellow-500/20";
                
                return (
                  <div 
                    key={i} 
                    className={`${color} rounded flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => toast.info(`Risco: ${risk} (${5-row}x${col+1})`)}
                  >
                    {risk}
                  </div>
                );
              })}
            </div>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'incidents',
      label: 'Incidentes',
      icon: Bell,
      badge: 3,
      badgeVariant: 'destructive' as const,
      content: (
        <ContentCardV2 
          title="Gestão de Incidentes" 
          icon={Bell}
          actions={
            <ButtonV2 
              variant="default" 
              size="sm" 
              icon={Plus}
              onClick={() => handleCreate("Incidente")}
            >
              Novo Incidente
            </ButtonV2>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sistema de gestão de incidentes</p>
            <p className="text-sm">3 incidentes pendentes de análise</p>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'audits',
      label: 'Auditorias',
      icon: FileCheck,
      content: (
        <ContentCardV2 
          title="Planejamento de Auditorias" 
          icon={FileCheck}
          actions={
            <ButtonV2 
              variant="outline" 
              size="sm" 
              icon={Plus}
              onClick={() => handleCreate("Auditoria")}
            >
              Nova Auditoria
            </ButtonV2>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Calendário de auditorias internas e externas</p>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'training',
      label: 'Treinamentos',
      icon: Users,
      content: (
        <ContentCardV2 title="Gestão de Treinamentos" icon={Users}>
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Matriz de treinamentos obrigatórios</p>
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
          title="Relatórios ANP" 
          icon={BarChart3}
          actions={
            <div className="flex gap-2">
              <ButtonV2 
                variant="outline" 
                size="sm" 
                icon={Download}
                onClick={() => handleExport("SGSO")}
              >
                Exportar
              </ButtonV2>
              <ButtonV2 
                variant="default" 
                size="sm" 
                icon={FileCheck}
                onClick={() => navigate("/sgso/report")}
              >
                Gerar PDF
              </ButtonV2>
            </div>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Relatórios de conformidade ANP</p>
          </div>
        </ContentCardV2>
      ),
    },
  ];

  return (
    <PageLayoutV2 
      title="SGSO v2.0" 
      subtitle="Sistema de Gestão de Segurança Operacional - Versão Melhorada"
      icon={Shield}
      actions={
        <div className="flex items-center gap-2">
          <ButtonV2 
            variant="outline" 
            size="sm" 
            icon={RefreshCw}
            onClick={() => handleRefresh("SGSO", async () => window.location.reload())}
          >
            Atualizar
          </ButtonV2>
          <ButtonV2 
            variant="default" 
            size="sm" 
            icon={Download}
            onClick={() => handleExport("SGSO")}
          >
            Exportar
          </ButtonV2>
        </div>
      }
    >
      {/* Module Header V2 */}
      <ModuleHeaderV2
        title="SGSO - Gestão de Segurança Operacional"
        description="Compliance ANP Resolução 43/2007 - 17 Práticas Obrigatórias"
        icon={Shield}
        badge="v2.0"
        aiEnabled={aiEnabled}
        onAIToggle={() => setAiEnabled(!aiEnabled)}
        onSettings={() => toast.info("Configurações SGSO")}
        onHelp={() => toast.info("Ajuda SGSO - Documentação ANP")}
      />

      {/* Tabs V2 */}
      <div className="mt-6">
        <TabsV2 
          tabs={tabs} 
          defaultTab="overview"
          onTabChange={setActiveTab}
          variant="default"
        />
      </div>

      {/* AI Assistant (Opcional) */}
      {aiEnabled && (
        <AIAssistantV2
          moduleName="SGSO"
          moduleContext="Sistema de Gestão de Segurança Operacional - ANP 43/2007"
          position="floating"
          placeholder="Pergunte sobre as 17 práticas, riscos, conformidade..."
          suggestions={[
            "Quais práticas estão não conformes?",
            "Analise a matriz de riscos",
            "Gere relatório de conformidade",
            "Sugira ações corretivas"
          ]}
        />
      )}
    </PageLayoutV2>
  );
};

export default SGSO_V2;
