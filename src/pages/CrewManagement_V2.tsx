/**
 * Crew Management V2 - Versão Melhorada com Componentes V2
 * ETAPA 3: Módulos V2 - NÃO SUBSTITUI original
 * 
 * Rota: /crew-management-v2 (adicional)
 * Original: /maritime-command permanece funcional
 */

import React, { useState, useEffect } from "react";
import { 
  Users, UserCheck, UserX, Award, Calendar, Clock,
  FileText, AlertTriangle, CheckCircle, Shield,
  RefreshCw, Download, Plus, Settings, Heart,
  Sparkles, Brain, TrendingUp, BookOpen, Briefcase
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

// Dados simulados da tripulação
const MOCK_CREW = [
  { id: 1, name: "Carlos Silva", rank: "Capitão", vessel: "PSV Atlantic Explorer", status: "onboard", certExpiry: "2025-08-15", mlcCompliant: true },
  { id: 2, name: "Ana Santos", rank: "Imediato", vessel: "AHTS Ocean Guardian", status: "onboard", certExpiry: "2025-06-20", mlcCompliant: true },
  { id: 3, name: "João Oliveira", rank: "Oficial de Máquinas", vessel: "PSV Atlantic Explorer", status: "onboard", certExpiry: "2025-03-10", mlcCompliant: false },
  { id: 4, name: "Maria Costa", rank: "DPO", vessel: "PLSV Deep Diver", status: "leave", certExpiry: "2025-12-01", mlcCompliant: true },
  { id: 5, name: "Pedro Lima", rank: "Marinheiro", vessel: "RSV Subsea Master", status: "onboard", certExpiry: "2025-04-05", mlcCompliant: true },
  { id: 6, name: "Lucia Ferreira", rank: "Cozinheiro", vessel: "DSV Neptuno", status: "onboard", certExpiry: "2025-09-22", mlcCompliant: true },
  { id: 7, name: "Roberto Alves", rank: "Eletricista", vessel: null, status: "available", certExpiry: "2025-07-18", mlcCompliant: true },
  { id: 8, name: "Fernanda Gomes", rank: "Enfermeiro", vessel: "AHTS Ocean Guardian", status: "onboard", certExpiry: "2025-02-28", mlcCompliant: false },
];

const CrewManagement_V2 = () => {
  const { handleCreate, handleExport, handleRefresh, showInfo } = useMaritimeActions();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<number | null>(null);
  const [crew, setCrew] = useState(MOCK_CREW);

  // Stats da tripulação
  const stats = {
    totalCrew: crew.length,
    onboard: crew.filter(c => c.status === "onboard").length,
    onLeave: crew.filter(c => c.status === "leave").length,
    available: crew.filter(c => c.status === "available").length,
    certsExpiring: crew.filter(c => {
      const expiry = new Date(c.certExpiry);
      const now = new Date();
      const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff < 90;
    }).length,
    mlcCompliant: Math.round((crew.filter(c => c.mlcCompliant).length / crew.length) * 100),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "onboard": return "bg-green-500";
      case "leave": return "bg-blue-500";
      case "available": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "onboard": return "A Bordo";
      case "leave": return "Licença";
      case "available": return "Disponível";
      default: return status;
    }
  };

  // Tabs do módulo
  const tabs = [
    {
      id: 'overview',
      label: 'Visão Geral',
      icon: Users,
      content: (
        <div className="space-y-6">
          {/* Stats Grid */}
          <GridCardV2 columns={4}>
            <StatCardV2
              title="Total Tripulação"
              value={stats.totalCrew}
              icon={Users}
              variant="info"
              onClick={() => showInfo("Tripulação", `${stats.totalCrew} tripulantes cadastrados`)}
            />
            <StatCardV2
              title="A Bordo"
              value={stats.onboard}
              icon={UserCheck}
              trend="up"
              trendValue="+3"
              variant="success"
            />
            <StatCardV2
              title="Em Licença"
              value={stats.onLeave}
              icon={Calendar}
              variant="info"
            />
            <StatCardV2
              title="Certs Expirando"
              value={stats.certsExpiring}
              icon={AlertTriangle}
              variant={stats.certsExpiring > 3 ? "danger" : "warning"}
            />
          </GridCardV2>

          {/* MLC Compliance */}
          <ContentCardV2 
            title="Compliance MLC 2006" 
            icon={Shield}
            description="Maritime Labour Convention"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5 text-center">
                <p className="text-3xl font-bold text-green-500">{stats.mlcCompliant}%</p>
                <p className="text-sm text-muted-foreground mt-1">Conformidade Geral</p>
              </div>
              <div className="p-4 rounded-lg border border-border/50 text-center">
                <p className="text-3xl font-bold">{crew.filter(c => c.mlcCompliant).length}</p>
                <p className="text-sm text-muted-foreground mt-1">Tripulantes Conformes</p>
              </div>
              <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-center">
                <p className="text-3xl font-bold text-red-500">{crew.filter(c => !c.mlcCompliant).length}</p>
                <p className="text-sm text-muted-foreground mt-1">Não Conformes</p>
              </div>
            </div>
          </ContentCardV2>
        </div>
      ),
    },
    {
      id: 'roster',
      label: 'Tripulação',
      icon: Users,
      badge: stats.totalCrew,
      content: (
        <ContentCardV2 
          title="Lista de Tripulantes" 
          icon={Users}
          actions={
            <ButtonV2 variant="default" size="sm" icon={Plus} onClick={() => handleCreate("Tripulante")}>
              Novo Tripulante
            </ButtonV2>
          }
        >
          <div className="space-y-3">
            {crew.map((member) => (
              <div 
                key={member.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedCrew === member.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border/50 hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedCrew(member.id);
                  showInfo(member.name, `${member.rank} - ${member.vessel || 'Sem alocação'}`);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        {!member.mlcCompliant && (
                          <Badge variant="destructive" className="text-xs">MLC</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.rank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">{member.vessel || 'Disponível'}</p>
                      <p className="text-xs text-muted-foreground">Cert: {member.certExpiry}</p>
                    </div>
                    <Badge variant={member.status === "onboard" ? "default" : "secondary"}>
                      {getStatusLabel(member.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'certifications',
      label: 'Certificações',
      icon: Award,
      badge: stats.certsExpiring,
      badgeVariant: 'destructive' as const,
      content: (
        <ContentCardV2 
          title="Gestão de Certificações STCW" 
          icon={Award}
          description="Certificações e validades"
        >
          <div className="space-y-4">
            {crew.map((member) => {
              const expiry = new Date(member.certExpiry);
              const now = new Date();
              const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isExpiringSoon = daysUntilExpiry < 90;
              
              return (
                <div key={member.id} className="flex items-center gap-4">
                  <div className="w-40 truncate font-medium">{member.name}</div>
                  <div className="w-32 text-sm text-muted-foreground">{member.rank}</div>
                  <Progress 
                    value={Math.max(0, Math.min(100, (daysUntilExpiry / 365) * 100))} 
                    className={`h-2 flex-1 ${isExpiringSoon ? '[&>div]:bg-red-500' : ''}`}
                  />
                  <span className={`w-24 text-right text-sm ${isExpiringSoon ? 'text-red-500 font-medium' : ''}`}>
                    {daysUntilExpiry} dias
                  </span>
                </div>
              );
            })}
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'schedules',
      label: 'Escalas',
      icon: Calendar,
      content: (
        <ContentCardV2 
          title="Planejamento de Escalas" 
          icon={Calendar}
          actions={
            <ButtonV2 variant="outline" size="sm" icon={Plus} onClick={() => handleCreate("Escala")}>
              Nova Escala
            </ButtonV2>
          }
        >
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Sistema de gestão de escalas e rotações</p>
            <p className="text-sm">Integrado com STCW e MLC 2006</p>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'training',
      label: 'Treinamentos',
      icon: BookOpen,
      content: (
        <ContentCardV2 
          title="Matriz de Treinamentos" 
          icon={BookOpen}
        >
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Gestão de treinamentos obrigatórios</p>
            <p className="text-sm">STCW, segurança, DP, etc.</p>
          </div>
        </ContentCardV2>
      ),
    },
    {
      id: 'wellbeing',
      label: 'Bem-Estar',
      icon: Heart,
      content: (
        <ContentCardV2 
          title="Saúde e Bem-Estar" 
          icon={Heart}
          description="Monitoramento da tripulação"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
              <Heart className="h-8 w-8 text-green-500 mb-2" />
              <p className="font-medium">ASO em Dia</p>
              <p className="text-2xl font-bold">{Math.round(stats.totalCrew * 0.9)}</p>
            </div>
            <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="font-medium">ASO Vencendo</p>
              <p className="text-2xl font-bold">{Math.round(stats.totalCrew * 0.1)}</p>
            </div>
          </div>
        </ContentCardV2>
      ),
    },
  ];

  return (
    <PageLayoutV2 
      title="Crew Management v2.0" 
      subtitle="Gestão de Tripulação Marítima - Versão Melhorada"
      icon={Users}
      actions={
        <div className="flex items-center gap-2">
          <ButtonV2 
            variant="outline" 
            size="sm" 
            icon={RefreshCw}
            onClick={() => handleRefresh("Crew", async () => window.location.reload())}
          >
            Atualizar
          </ButtonV2>
          <ButtonV2 
            variant="default" 
            size="sm" 
            icon={Download}
            onClick={() => handleExport("Crew Management")}
          >
            Exportar
          </ButtonV2>
        </div>
      }
    >
      {/* Module Header V2 */}
      <ModuleHeaderV2
        title="Crew Management - Gestão de Tripulação"
        description="STCW, MLC 2006, certificações e escalas inteligentes"
        icon={Users}
        badge="v2.0"
        aiEnabled={aiEnabled}
        onAIToggle={() => setAiEnabled(!aiEnabled)}
        onSettings={() => toast.info("Configurações Crew Management")}
        onHelp={() => toast.info("Documentação STCW/MLC")}
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
          moduleName="Crew Management"
          moduleContext="Gestão de tripulação marítima, STCW, MLC 2006, certificações, escalas, bem-estar"
          position="floating"
          placeholder="Pergunte sobre tripulação, certificações, escalas..."
          suggestions={[
            "Certificações expirando em 30 dias",
            "Tripulantes não conformes MLC",
            "Sugerir escala otimizada",
            "Análise de bem-estar"
          ]}
        />
      )}
    </PageLayoutV2>
  );
};

export default CrewManagement_V2;
