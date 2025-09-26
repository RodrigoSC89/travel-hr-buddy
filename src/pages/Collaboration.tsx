import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import RealTimeWorkspace from '@/components/collaboration/real-time-workspace';
import { Users } from 'lucide-react';
import VoiceInterface from '@/components/voice/VoiceInterface';

const Collaboration = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Colaboração em Tempo Real</h1>
              <p className="text-muted-foreground">
                Workspace colaborativo para equipes marítimas
              </p>
            </div>
          </div>
          
          <div className="h-[calc(100vh-200px)]">
            <RealTimeWorkspace />
          </div>
        </main>
        <VoiceInterface />
      </div>
    </SidebarProvider>
  );
};

export default Collaboration;