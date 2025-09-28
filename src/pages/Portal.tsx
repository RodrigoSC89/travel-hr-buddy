import React, { Suspense } from 'react';
import { User } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy loading do portal moderno
const ModernEmployeePortal = React.lazy(() => 
  import('@/components/portal/modern-employee-portal').then(module => ({
    default: module.ModernEmployeePortal
  }))
);

const Portal: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-lg bg-primary/10">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Portal do Funcionário</h1>
          <p className="text-muted-foreground">
            Acesso personalizado aos seus recursos e informações
          </p>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Carregando portal do funcionário...</p>
          </div>
        </div>
      }>
        <ModernEmployeePortal />
      </Suspense>
    </div>
  );
};

export default Portal;