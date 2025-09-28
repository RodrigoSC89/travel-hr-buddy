import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import ProductionDeployCenter from '@/components/deploy/production-deploy-center';
import { Rocket } from 'lucide-react';


const ProductionDeployPage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Deploy de Produção</h1>
              <p className="text-muted-foreground">
                Centro de controle para deploy e monitoramento em produção
              </p>
            </div>
          </div>
          <ProductionDeployCenter />
        </main>
        
      </div>
    </SidebarProvider>
  );
};

export default ProductionDeployPage;