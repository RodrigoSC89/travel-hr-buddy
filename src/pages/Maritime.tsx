import React, { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Anchor } from 'lucide-react';
import VoiceInterface from '@/components/voice/VoiceInterface';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load do dashboard para melhor performance
const MaritimeDashboard = React.lazy(() => 
  import('@/components/maritime/maritime-dashboard').then(module => ({
    default: module.MaritimeDashboard
  }))
);

const Maritime = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Anchor className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sistema Marítimo</h1>
              <p className="text-muted-foreground">
                Gestão inteligente de operações marítimas
              </p>
            </div>
          </div>
          
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Carregando sistema marítimo...</p>
              </div>
            </div>
          }>
            <MaritimeDashboard />
          </Suspense>
        </main>
        <VoiceInterface />
      </div>
    </SidebarProvider>
  );
};

export default Maritime;