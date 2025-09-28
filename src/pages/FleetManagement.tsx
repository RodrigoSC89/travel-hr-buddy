import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import VesselManagement from '@/components/fleet/vessel-management';
import VesselPerformanceMonitor from '@/components/fleet/vessel-performance-monitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ship, Activity } from 'lucide-react';


const FleetManagement = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Ship className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestão de Frota</h1>
              <p className="text-muted-foreground">
                Gerenciamento completo de embarcações e performance
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="vessels" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vessels" className="flex items-center gap-2">
                <Ship className="h-4 w-4" />
                Embarcações
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Performance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="vessels" className="mt-6">
              <VesselManagement />
            </TabsContent>
            
            <TabsContent value="performance" className="mt-6">
              <VesselPerformanceMonitor />
            </TabsContent>
          </Tabs>
        </main>
        
      </div>
    </SidebarProvider>
  );
};

export default FleetManagement;