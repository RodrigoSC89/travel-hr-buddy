import React, { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Eye } from 'lucide-react';
import VoiceInterface from '@/components/voice/VoiceInterface';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy loading da interface AR
const ARInterface = React.lazy(() => 
  import('@/components/innovation/ar-interface').then(module => ({
    default: module.ARInterface
  }))
);

const AR: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Realidade Aumentada</h1>
              <p className="text-muted-foreground">
                Interface imersiva para visualização e interação avançada
              </p>
            </div>
          </div>
          
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Carregando interface AR...</p>
              </div>
            </div>
          }>
            <ARInterface />
          </Suspense>
        </main>
        <VoiceInterface />
      </div>
    </SidebarProvider>
  );
};

export default AR;