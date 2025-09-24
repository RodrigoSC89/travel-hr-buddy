import React, { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Radio } from 'lucide-react';
import VoiceInterface from '@/components/voice/VoiceInterface';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy loading do dashboard IoT
const IoTDashboard = React.lazy(() => 
  import('@/components/innovation/iot-dashboard').then(module => ({
    default: module.IoTDashboard
  }))
);

const IoT: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Radio className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">IoT Dashboard</h1>
              <p className="text-muted-foreground">
                Monitoramento e controle de dispositivos conectados
              </p>
            </div>
          </div>
          
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Carregando dashboard IoT...</p>
              </div>
            </div>
          }>
            <IoTDashboard />
          </Suspense>
        </main>
        <VoiceInterface />
      </div>
    </SidebarProvider>
  );
};

export default IoT;