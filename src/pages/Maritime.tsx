import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { MaritimeDashboard } from '@/components/maritime/maritime-dashboard';
import { Anchor } from 'lucide-react';

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
              <h1 className="text-3xl font-bold">Marítimo</h1>
              <p className="text-muted-foreground">
                Gestão de operações marítimas
              </p>
            </div>
          </div>
          <MaritimeDashboard />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Maritime;