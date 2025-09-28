import React, { Suspense } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { TrendingUp } from 'lucide-react';

import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy loading da análise preditiva
const PredictiveAnalyticsAdvanced = React.lazy(() => 
  import('@/components/intelligence/predictive-analytics-advanced').then(module => ({
    default: module.PredictiveAnalyticsAdvanced
  }))
);

const PredictiveAnalytics: React.FC = () => {
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
              <h1 className="text-3xl font-bold">Análise Preditiva</h1>
              <p className="text-muted-foreground">
                IA avançada para previsões e insights estratégicos
              </p>
            </div>
          </div>
          
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Carregando análise preditiva...</p>
              </div>
            </div>
          }>
            <PredictiveAnalyticsAdvanced />
          </Suspense>
        </main>
        
      </div>
    </SidebarProvider>
  );
};

export default PredictiveAnalytics;