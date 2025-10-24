import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemHealthCheck } from "@/components/testing/system-health-check";
import { TestEnvironmentConfig } from "@/components/testing/test-environment-config";
import { PerformanceMonitor } from "@/components/performance/performance-monitor";
import { PWAStatus } from "@/components/mobile/pwa-status";
import { FinalHomologationReport } from "@/components/testing/final-homologation-report";

const TestingDashboard = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Testes</h1>
        <p className="text-muted-foreground">
          Centro de controle para testes e homologação do sistema
        </p>
      </div>

      <Tabs defaultValue="homologation" className="w-full">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 min-w-fit">
            <TabsTrigger value="homologation">
              <span className="hidden sm:inline">Homologação Final</span>
              <span className="sm:hidden">Homolog.</span>
            </TabsTrigger>
            <TabsTrigger value="health">
              <span className="hidden sm:inline">Saúde do Sistema</span>
              <span className="sm:hidden">Saúde</span>
            </TabsTrigger>
            <TabsTrigger value="cicd">
              <span className="hidden sm:inline">CI/CD Pipeline</span>
              <span className="sm:hidden">CI/CD</span>
            </TabsTrigger>
            <TabsTrigger value="config">
              <span className="hidden sm:inline">Configuração</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
            <TabsTrigger value="performance">
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Perf.</span>
            </TabsTrigger>
            <TabsTrigger value="mobile">
              <span className="hidden sm:inline">Mobile & PWA</span>
              <span className="sm:hidden">Mobile</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="homologation" className="space-y-6">
          <FinalHomologationReport />
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <SystemHealthCheck />
        </TabsContent>

        <TabsContent value="cicd" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Pipeline CI/CD</h3>
              <p className="text-sm text-muted-foreground">
                Integração e deploy contínuo com testes automatizados
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Workflows Ativos</div>
                <div className="text-2xl font-bold text-success">4</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Tempo Médio Build</div>
                <div className="text-2xl font-bold">5m 30s</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Taxa de Sucesso</div>
                <div className="text-2xl font-bold text-success">98%</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Deploys/Semana</div>
                <div className="text-2xl font-bold">24</div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold">Workflows Configurados</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="font-medium">Test Suite</span>
                  </div>
                  <span className="text-sm text-success">✓ Passing</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="font-medium">Performance Tests</span>
                  </div>
                  <span className="text-sm text-success">✓ Passing</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="font-medium">Accessibility Tests</span>
                  </div>
                  <span className="text-sm text-success">✓ Passing</span>
                </div>
              </div>
            </div>
          </div>
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

        <TabsContent value="mobile" className="space-y-6">
          <PWAStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingDashboard;