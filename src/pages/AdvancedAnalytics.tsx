import React from 'react';
import { AdvancedFleetAnalytics } from '@/components/analytics/advanced-fleet-analytics';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { BarChart3, TrendingUp, Target, Sparkles } from 'lucide-react';

export default function AdvancedAnalytics() {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={BarChart3}
        title="Analytics Avançado"
        description="Analytics de frota avançado com dashboards interativos e relatórios detalhados"
        gradient="blue"
        badges={[
          { icon: TrendingUp, label: 'Análise em Tempo Real' },
          { icon: Sparkles, label: 'IA Insights' },
          { icon: Target, label: 'KPIs Customizados' }
        ]}
      />
      <AdvancedFleetAnalytics />
    </ModulePageWrapper>
  );
}