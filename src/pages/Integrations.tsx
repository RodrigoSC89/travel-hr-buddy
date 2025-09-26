import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { IntegrationsHub } from '@/components/integrations/integrations-hub';
import { Globe } from 'lucide-react';
import VoiceInterface from '@/components/voice/VoiceInterface';

const Integrations = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Integrações</h1>
              <p className="text-muted-foreground">
                Central de integrações e conectores
              </p>
            </div>
          </div>
          <IntegrationsHub />
        </main>
        <VoiceInterface />
      </div>
    </SidebarProvider>
  );
};

export default Integrations;