import React, { Suspense } from 'react';
import { Trophy } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy loading do sistema de gamificação
const GamificationSystem = React.lazy(() => 
  import('@/components/innovation/gamification-system').then(module => ({
    default: module.GamificationSystem
  }))
);

const Gamification: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sistema de Gamificação</h1>
              <p className="text-muted-foreground">
                Conquistas, rankings e recompensas para aumentar o engajamento
              </p>
            </div>
          </div>
          
      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Carregando sistema de gamificação...</p>
          </div>
        </div>
      }>
        <GamificationSystem />
      </Suspense>
    </div>
  );
};

export default Gamification;