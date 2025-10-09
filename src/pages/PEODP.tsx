import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
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
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Anchor}
        title="PEO-DP - Dynamic Positioning Plan"
        description="Plano de Operações com DP Digitalizado e Inteligente"
        gradient="indigo"
        badges={[
          { icon: Brain, label: 'IA & Validação' },
          { icon: Shield, label: 'Compliance IMCA' },
          { icon: Target, label: '6 Seções Completas' },
          { icon: TrendingUp, label: 'Análise Preditiva' }
        ]}
      />

      {/* PEO-DP Manager */}
      <PeoDpManager />

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
    </ModulePageWrapper>
  );
};

export default PEODP;
