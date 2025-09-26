import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SystemHealthCheck } from '@/components/testing/system-health-check';
import { TestEnvironmentConfig } from '@/components/testing/test-environment-config';
import { PerformanceMonitor } from '@/components/performance/performance-monitor';

const TestingDashboard = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Testes</h1>
        <p className="text-muted-foreground">
          Centro de controle para testes e homologação do sistema
        </p>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health">Saúde do Sistema</TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <SystemHealthCheck />
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <TestEnvironmentConfig />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Métricas de Performance</h3>
              <p className="text-sm text-muted-foreground">
                Monitoramento em tempo real da performance do sistema
              </p>
            </div>
            <PerformanceMonitor />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingDashboard;