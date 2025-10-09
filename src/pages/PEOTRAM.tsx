import React, { useState, useEffect } from 'react';
import { PeotramAuditManager } from '@/components/peotram/peotram-audit-manager';
import ModuleActionButton from '@/components/ui/module-action-button';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMaritimeActions } from '@/hooks/useMaritimeActions';
import { 
  FileCheck,
  Brain,
  Shield,
  TrendingUp,
  Sparkles,
  Star,
  Crown,
  Zap,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Award,
  Globe,
  Clock,
  Plus,
  RefreshCw,
  Download
} from 'lucide-react';

const PEOTRAM = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { handleCreate, handleGenerateReport, handleExport, handleRefresh, showInfo } = useMaritimeActions();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={FileCheck}
        title="PEOTRAM - Auditoria Petrobras"
        description="Sistema de auditoria anual inteligente"
        gradient="yellow"
        badges={[
          { icon: Brain, label: 'IA Preditiva' },
          { icon: Shield, label: 'Conformidade Petrobras' },
          { icon: Globe, label: 'Padrão Internacional' }
        ]}
      />

      {/* PEOTRAM Manager */}
      <PeotramAuditManager />

      {/* Module Action Button */}
      <ModuleActionButton
        moduleId="peotram"
        moduleName="PEOTRAM"
        moduleIcon={<FileCheck className="h-4 w-4" />}
        actions={[
          {
            id: 'new-audit',
            label: 'Nova Auditoria',
            icon: <Plus className="h-4 w-4" />,
            action: () => handleCreate('Auditoria PEOTRAM'),
            variant: 'default'
          },
          {
            id: 'reports',
            label: 'Relatórios',
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => handleGenerateReport('Relatório PEOTRAM'),
            variant: 'outline'
          },
          {
            id: 'compliance',
            label: 'Conformidade',
            icon: <Shield className="h-4 w-4" />,
            action: () => showInfo('Conformidade', 'Abrindo painel de conformidade PEOTRAM'),
            variant: 'outline'
          },
          {
            id: 'ai-analysis',
            label: 'Análise IA',
            icon: <Brain className="h-4 w-4" />,
            action: () => showInfo('Análise IA', 'Iniciando análise preditiva com IA'),
            variant: 'outline'
          }
        ]}
        quickActions={[
          {
            id: 'refresh',
            label: 'Atualizar',
            icon: <RefreshCw className="h-3 w-3" />,
            action: () => handleRefresh('PEOTRAM', async () => window.location.reload()),
            shortcut: 'F5'
          },
          {
            id: 'export',
            label: 'Exportar',
            icon: <Download className="h-3 w-3" />,
            action: () => handleExport('PEOTRAM')
          }
        ]}
      />
    </ModulePageWrapper>
  );
};

export default PEOTRAM;