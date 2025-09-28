import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import SystemAuditor from '@/components/testing/system-auditor';
import { TestTube } from 'lucide-react';


const SystemAuditorPage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <TestTube className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Auditoria e Homologação</h1>
              <p className="text-muted-foreground">
                Sistema completo de auditoria técnica e testes de homologação
              </p>
            </div>
          </div>
          <SystemAuditor />
        </main>
        
      </div>
    </SidebarProvider>
  );
};

export default SystemAuditorPage;