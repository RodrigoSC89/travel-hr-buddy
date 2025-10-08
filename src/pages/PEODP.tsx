import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';
import ModuleActionButton from '@/components/ui/module-action-button';
import { PeoDpManager } from '@/components/peo-dp/peo-dp-manager';
import { useMaritimeActions } from '@/hooks/useMaritimeActions';
import {
  Shield,
  Anchor,
  Target,
  Brain,
  TrendingUp,
  Award,
  Zap,
  Globe,
  CheckCircle,
  Plus,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';

const PEODP = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh, showInfo } = useMaritimeActions();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-purple-500/10 relative overflow-hidden">
      <BackToDashboard />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-12 text-white overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/15 to-transparent rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm animate-pulse-glow">
                <Anchor className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-display mb-2 text-shimmer drop-shadow-lg">
                  PEO-DP - Dynamic Positioning Plan
                </h1>
                <p className="text-xl opacity-95 drop-shadow-md font-semibold">
                  Plano de Operações com DP Digitalizado e Inteligente
                </p>
              </div>
            </div>
            
            <p className="text-lg opacity-95 mb-8 max-w-3xl drop-shadow-md font-medium">
              Sistema completo para criação, gestão e validação de Planos de Operação com 
              Dynamic Positioning, com IA, análise de risco e compliance PETROBRAS/IMCA.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/90 text-blue-600 px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg border border-white/30">
                <Brain className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">IA & Validação</span>
              </div>
              <div className="flex items-center gap-2 bg-green-500/90 text-white px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg border border-green-400/30">
                <Shield className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Compliance IMCA</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-500/90 text-white px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg border border-purple-400/30">
                <Target className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">6 Seções Completas</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/90 text-white px-4 py-2 rounded-xl backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg border border-yellow-400/30">
                <TrendingUp className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Análise Preditiva</span>
              </div>
            </div>
          </div>
        </div>

        {/* PEO-DP Manager */}
        <PeoDpManager />
      </div>

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="peo-dp"
        moduleName="PEO-DP"
        actions={[
          {
            id: 'plan',
            label: 'Plano Digitalizado',
            icon: <Target className="h-3 w-3" />,
            action: () => showInfo('Plano Digitalizado', 'Abrindo visualização do plano DP digitalizado')
          },
          {
            id: 'dashboard',
            label: 'Dashboard Gerencial',
            icon: <TrendingUp className="h-3 w-3" />,
            action: () => showInfo('Dashboard Gerencial', 'Abrindo painel gerencial de DP')
          },
          {
            id: 'fmea',
            label: 'Integração FMEA',
            icon: <Settings className="h-3 w-3" />,
            action: () => showInfo('Integração FMEA', 'Acessando análise de modos de falha')
          },
          {
            id: 'trials',
            label: 'DP Trials',
            icon: <CheckCircle className="h-3 w-3" />,
            action: () => showInfo('DP Trials', 'Abrindo registro de trials de DP')
          },
          {
            id: 'validation',
            label: 'Validação IA',
            icon: <Brain className="h-3 w-3" />,
            action: () => showInfo('Validação IA', 'Iniciando validação com inteligência artificial')
          },
          {
            id: 'risk',
            label: 'Risk Assessment',
            icon: <Shield className="h-3 w-3" />,
            action: () => showInfo('Risk Assessment', 'Abrindo avaliação de riscos')
          }
        ]}
        quickActions={[
          {
            id: 'new-plan',
            label: 'Novo Plano',
            icon: <Plus className="h-3 w-3" />,
            action: () => handleCreate('Plano DP')
          },
          {
            id: 'refresh',
            label: 'Atualizar',
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => handleRefresh('PEO-DP', async () => window.location.reload()),
            shortcut: 'F5'
          },
          {
            id: 'export',
            label: 'Exportar',
            icon: <Download className="h-3 w-3" />,
            action: () => handleExport('PEO-DP')
          }
        ]}
      />
    </div>
  );
};

export default PEODP;
