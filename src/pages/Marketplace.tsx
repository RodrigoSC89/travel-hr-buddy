import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { IntegrationMarketplace } from "@/components/strategic/IntegrationMarketplace";
import { Store } from "lucide-react";

const Marketplace = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">Integrações e extensões para o Nautilus</p>
            </div>
          </div>
          <IntegrationMarketplace />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Marketplace;
