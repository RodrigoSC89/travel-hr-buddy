import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { PriceAlertDashboard } from '@/components/price-alerts/price-alert-dashboard';
import { TrendingUp } from 'lucide-react';
import VoiceInterface from '@/components/voice/VoiceInterface';

const PriceAlerts = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Alertas de Preço</h1>
              <p className="text-muted-foreground">
                Monitore preços e receba alertas
              </p>
            </div>
          </div>
          <PriceAlertDashboard />
        </main>
        <VoiceInterface />
      </div>
    </SidebarProvider>
  );
};

export default PriceAlerts;