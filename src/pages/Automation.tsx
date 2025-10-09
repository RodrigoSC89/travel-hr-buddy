import React from 'react';
import { AutomationHub } from '@/components/automation/automation-hub';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Zap, Workflow, Bot, TrendingUp } from 'lucide-react';

export default function Automation() {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Zap}
        title="Hub de Automação"
        description="Workflows automáticos e gestão inteligente de processos operacionais"
        gradient="purple"
        badges={[
          { icon: Workflow, label: '24 Workflows' },
          { icon: Bot, label: 'Automação IA' },
          { icon: TrendingUp, label: '89% Eficiência' }
        ]}
      />
      <AutomationHub />
    </ModulePageWrapper>
  );
};