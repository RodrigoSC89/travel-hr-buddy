import React, { Suspense } from 'react';
import { Trophy, Star, Award, Target } from 'lucide-react';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';

// Lazy loading do sistema de gamificação
const GamificationSystem = React.lazy(() => 
  import('@/components/innovation/gamification-system').then(module => ({
    default: module.GamificationSystem
  }))
);

const Gamification: React.FC = () => {
  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Trophy}
        title="Sistema de Gamificação"
        description="Conquistas, rankings e recompensas para aumentar o engajamento da equipe"
        gradient="orange"
        badges={[
          { icon: Star, label: '247 Usuários Ativos' },
          { icon: Award, label: '8 Conquistas' },
          { icon: Target, label: 'Engajamento' }
        ]}
      />
      
      <Suspense fallback={<DashboardSkeleton />}>
        <GamificationSystem />
      </Suspense>
    </ModulePageWrapper>
  );
};

export default Gamification;